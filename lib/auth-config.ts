import CredentialsProvider from 'next-auth/providers/credentials'
import { validateAdmin } from './auth'
import { checkRateLimit } from './rate-limiter'
import type { NextAuthOptions } from 'next-auth'

interface ExtendedUser {
  id: string
  name: string
  email: string
  role: string
  rememberMe: boolean
}

const EIGHT_HOURS_IN_SECONDS = 8 * 60 * 60
const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Basic rate limiting using username as key
        const rateLimitKey = `auth:${credentials.username}`
        const { allowed } = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)

        if (!allowed) {
          console.log(`Rate limit exceeded for username: ${credentials.username}`)
          return null
        }

        const isValid = await validateAdmin(credentials.username, credentials.password)

        if (isValid) {
          return {
            id: credentials.username,
            name: credentials.username,
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
    maxAge: TWO_WEEKS_IN_SECONDS, // Maximum possible duration (for remember me)
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      const nowInSeconds = Math.floor(Date.now() / 1000)

      if (user) {
        // Initial login - set expiration based on remember me preference
        const extendedUser = user as ExtendedUser
        token.role = extendedUser.role
        token.sub = user.id
        token.rememberMe = extendedUser.rememberMe
        token.sessionExpiresAt = nowInSeconds + (extendedUser.rememberMe ? TWO_WEEKS_IN_SECONDS : EIGHT_HOURS_IN_SECONDS)
      } else if (token.sessionExpiresAt && typeof token.sessionExpiresAt === 'number') {
        // Existing session - extend if user is active and within last hour of expiration
        const sessionExpiry = token.sessionExpiresAt
        const timeUntilExpiry = sessionExpiry - nowInSeconds
        const sessionDuration = token.rememberMe ? TWO_WEEKS_IN_SECONDS : EIGHT_HOURS_IN_SECONDS
        const EXTENSION_THRESHOLD = 3600 // Extend when within last hour (3600 seconds)

        // Extend session if:
        // 1. Session is still valid (not expired)
        // 2. User is within the last hour of their session
        // 3. Or if manually triggered by update() call
        if (timeUntilExpiry > 0 && (timeUntilExpiry < EXTENSION_THRESHOLD || trigger === 'update')) {
          token.sessionExpiresAt = nowInSeconds + sessionDuration
        }
      }

      // Fallback for tokens without expiration (shouldn't happen, but defensive)
      if (!token.sessionExpiresAt) {
        token.sessionExpiresAt = nowInSeconds + EIGHT_HOURS_IN_SECONDS
      }

      return token
    },
    async session({ session, token }) {
      const sessionExpiry = typeof token.sessionExpiresAt === 'number' ? token.sessionExpiresAt : null
      const nowInSeconds = Math.floor(Date.now() / 1000)

      // If session is expired, return a session with past expiration
      // NextAuth will handle this as an expired session
      if (!sessionExpiry || sessionExpiry <= nowInSeconds) {
        return {
          ...session,
          expires: new Date(nowInSeconds * 1000).toISOString()
        }
      }

      session.user.id = token.sub || ''
      session.user.role = token.role as string
      session.user.rememberMe = Boolean(token.rememberMe)
      session.expires = new Date(sessionExpiry * 1000).toISOString()

      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Temporary fallback for build process
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL })
}
