import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // El middleware se ejecuta solo si el usuario está autenticado
    // Si no está autenticado, NextAuth redirige automáticamente a /login
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
} 