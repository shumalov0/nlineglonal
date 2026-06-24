// Admin route-ları üçün server-side qoruma
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isAdminRoute && token?.role !== 'ADMIN' && token?.role !== 'MANAGER') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // /admin/* üçün token tələb olunur, qalanı sərbəst keçə bilər
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*'],
}
