import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Check if user is accessing admin routes
  if (pathname.startsWith('/admin')) {
    // Special handling for admin-auth page to prevent redirect loops
    if (pathname === '/admin-auth') {
      // If already authenticated, redirect to admin dashboard
      if (token && token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      // Allow access to login page if not authenticated
    } else {
      // For all other admin routes, require authentication
      if (!token || token.role !== 'admin') {
        // Redirect to login
        return NextResponse.redirect(new URL('/admin-auth', request.url))
      }
    }

    // Add security headers for admin routes
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-auth'
  ]
}