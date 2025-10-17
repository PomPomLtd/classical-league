import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { validateAdmin } from './lib/auth'
import { checkRateLimit } from './lib/rate-limiter'

const EIGHT_HOURS_IN_SECONDS = 8 * 60 * 60
const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Rate limiting using username as key
        const rateLimitKey = `auth:${credentials.username}`
        const { allowed } = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)

        if (!allowed) {
          console.log(`Rate limit exceeded for username: ${credentials.username}`)
          return null
        }

        const isValid = await validateAdmin(
          credentials.username as string,
          credentials.password as string
        )

        if (isValid) {
          return {
            id: credentials.username as string,
            name: credentials.username as string,
            email: `${credentials.username}@admin.local`,
            role: 'admin',
            rememberMe: credentials.rememberMe === 'true'
          }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/admin-auth'
  },
  session: {
    strategy: 'jwt',
    maxAge: TWO_WEEKS_IN_SECONDS // Maximum possible duration
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      const nowInSeconds = Math.floor(Date.now() / 1000)

      if (user) {
        // Initial login - set expiration based on remember me preference
        token.role = user.role
        token.sub = user.id
        token.rememberMe = user.rememberMe
        token.sessionExpiresAt = nowInSeconds + (user.rememberMe ? TWO_WEEKS_IN_SECONDS : EIGHT_HOURS_IN_SECONDS)
      } else if (token.sessionExpiresAt && typeof token.sessionExpiresAt === 'number') {
        // Existing session - extend if user is active and within last hour of expiration
        const sessionExpiry = token.sessionExpiresAt
        const timeUntilExpiry = sessionExpiry - nowInSeconds
        const sessionDuration = token.rememberMe ? TWO_WEEKS_IN_SECONDS : EIGHT_HOURS_IN_SECONDS
        const EXTENSION_THRESHOLD = 3600 // Extend when within last hour

        // Extend session if still valid and within extension threshold or manually triggered
        if (timeUntilExpiry > 0 && (timeUntilExpiry < EXTENSION_THRESHOLD || trigger === 'update')) {
          token.sessionExpiresAt = nowInSeconds + sessionDuration
        }
      }

      // Fallback for tokens without expiration
      if (!token.sessionExpiresAt) {
        token.sessionExpiresAt = nowInSeconds + EIGHT_HOURS_IN_SECONDS
      }

      return token
    },
    async session({ session, token }) {
      const sessionExpiry = typeof token.sessionExpiresAt === 'number' ? token.sessionExpiresAt : null
      const nowInSeconds = Math.floor(Date.now() / 1000)

      // If session is expired, return a session with past expiration
      if (!sessionExpiry || sessionExpiry <= nowInSeconds) {
        return {
          ...session,
          expires: new Date(nowInSeconds * 1000).toISOString() as any
        }
      }

      session.user.id = token.sub || ''
      session.user.role = token.role as string
      session.user.rememberMe = Boolean(token.rememberMe)
      session.expires = new Date(sessionExpiry * 1000).toISOString() as any

      return session
    }
  }
})
