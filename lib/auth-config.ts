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
    maxAge: 8 * 60 * 60, // 8 hours (overridden by JWT callback for remember me)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser
        token.role = extendedUser.role
        token.sub = user.id
        token.rememberMe = extendedUser.rememberMe

        // Set custom expiration based on remember me
        if (extendedUser.rememberMe) {
          // 2 weeks in seconds
          token.exp = Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60)
        } else {
          // 8 hours in seconds
          token.exp = Math.floor(Date.now() / 1000) + (8 * 60 * 60)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || ''
        session.user.role = token.role as string
        if (token.exp && typeof token.exp === 'number') {
          session.expires = new Date(token.exp * 1000).toISOString()
        }
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Temporary fallback for build process
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL })
}