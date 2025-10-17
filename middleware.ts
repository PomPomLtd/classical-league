import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Check if session is expired
  const isExpired = session?.expires ? new Date(session.expires) <= new Date() : true

  // Handle admin-auth page specifically
  if (pathname === '/admin-auth') {
    // If already authenticated and not expired, redirect to admin dashboard
    if (session?.user && session.user.role === 'admin' && !isExpired) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Allow access to login page if not authenticated
    return NextResponse.next()
  }

  // Handle all /admin/* routes
  if (pathname.startsWith('/admin')) {
    // Require authentication for all admin routes
    if (!session?.user || session.user.role !== 'admin' || isExpired) {
      // Store the originally requested page for redirect after login
      const redirectUrl = new URL('/admin-auth', request.url)
      if (isExpired && session?.user) {
        redirectUrl.searchParams.set('reason', 'session-expired')
      }
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
