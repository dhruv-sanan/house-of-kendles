import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { createClient } from '@/utils/supabase/middleware'

/**
 * Routes that require Supabase authentication
 */
const PROTECTED_ROUTES = ['/checkout', '/orders', '/profile']

/**
 * Check if a path starts with any of the given prefixes
 */
function pathStartsWith(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) =>
    path === prefix || path.startsWith(`${prefix}/`)
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- ADMIN ROUTES: Keep existing JWT-based auth ---
  if (pathname.startsWith('/admin')) {
    console.log(`\n[Middleware] Admin route triggered for path: ${pathname}`)

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('[Middleware] FATAL: JWT_SECRET environment variable is NOT loaded.')
      return new Response('Internal Server Error: Application not configured.', {
        status: 500,
      })
    }

    // Allow the admin login page to be accessed without a token
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      console.log('[Middleware] No admin token found. Redirecting to login.')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = new TextEncoder().encode(jwtSecret)
      await jwtVerify(token, secret)
      console.log('[Middleware] Admin token verified successfully.')
      return NextResponse.next()
    } catch {
      console.log('[Middleware] Admin token verification failed. Redirecting to login.')
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }
  }

  // --- PUBLIC ROUTES: Create Supabase client and refresh session ---
  const { supabase, response } = createClient(request)

  // Get current user (this also refreshes the session)
  const { data: { user }, error } = await supabase.auth.getUser()

  // --- PROTECTED ROUTES: Require Supabase auth ---
  if (pathStartsWith(pathname, PROTECTED_ROUTES)) {
    if (!user || error) {
      // Store the intended URL and redirect to sign-in
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect', pathname)
      console.log(`[Middleware] No user for protected route ${pathname}, redirecting to sign-in`)
      return NextResponse.redirect(signInUrl)
    }
  }

  // --- SIGN-IN PAGE: Only redirect if user is definitely authenticated ---
  // Don't redirect on error - let the page handle it
  if (pathname === '/sign-in' && user && !error) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/'
    console.log(`[Middleware] User already authenticated, redirecting from sign-in to ${redirectTo}`)
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}