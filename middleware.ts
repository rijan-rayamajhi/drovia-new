import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Skip middleware for admin login page
    if (pathname === '/admin/login' || pathname === '/login') {
      return NextResponse.next();
    }

    // Check for admin authentication cookie/token
    const adminToken = request.cookies.get('adminAuth');
    
    // In a real app, verify the token
    // For now, we'll let the client-side handle redirects
    // but set cache headers
    const response = NextResponse.next();
    
    // Set cache headers for admin pages
    response.headers.set('Cache-Control', 'no-store, private');
    response.headers.set('Vary', 'Cookie');
    
    return response;
  }

  // User account pages - set cache headers
  if (pathname.startsWith('/account') || pathname.startsWith('/cart') || pathname.startsWith('/wishlist')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, private');
    response.headers.set('Vary', 'Cookie');
    return response;
  }

  // Public pages can be cached
  const response = NextResponse.next();
  if (pathname === '/' || pathname.startsWith('/shop') || pathname.startsWith('/product')) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/cart/:path*',
    '/wishlist/:path*',
    '/shop/:path*',
    '/product/:path*',
    '/',
  ],
};

