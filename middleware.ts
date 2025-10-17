import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = request.nextUrl
  const sessionExpiresAt = typeof token?.sessionExpiresAt === 'number' ? token.sessionExpiresAt : undefined
  const tokenExpired = sessionExpiresAt ? sessionExpiresAt * 1000 <= Date.now() : false

  // Handle admin-auth page specifically
  if (pathname === '/admin-auth') {
    // If already authenticated, redirect to admin dashboard
    if (token && token.role === 'admin' && !tokenExpired) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Allow access to login page if not authenticated
    return NextResponse.next()
  }

  // Handle all /admin/* routes
  if (pathname.startsWith('/admin')) {
    // Require authentication for all admin routes
    if (!token || token.role !== 'admin' || tokenExpired) {
      // Store the originally requested page for redirect after login
      const redirectUrl = new URL('/admin-auth', request.url)
      if (tokenExpired) {
        redirectUrl.searchParams.set('reason', 'session-expired')
      }
      // Could add ?callbackUrl=${pathname} if we want to redirect to specific page after login
      return NextResponse.redirect(redirectUrl)
    }

    // Add security headers for authenticated admin routes
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-auth'
  ]
}
