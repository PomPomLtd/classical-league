import CredentialsProvider from 'next-auth/providers/credentials'
import { validateAdmin } from './auth'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const isValid = await validateAdmin(credentials.username, credentials.password)
        
        if (isValid) {
          return {
            id: credentials.username,
            name: credentials.username,
            email: `${credentials.username}@admin.local`,
            role: 'admin'
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
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || ''
        session.user.role = token.role as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Temporary fallback for build process
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL })
}