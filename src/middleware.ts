import { withAuth } from "next-auth/middleware"

import { NextResponse } from "next/server"

// Protect these routes
export default withAuth(
  function middleware(req) {
    // If user is logged in and visits "/", redirect to "/dashboard"
    if (req.nextUrl.pathname === "/" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Anyone can access "/"
        if (req.nextUrl.pathname === "/") {
          return true
        }
        // Other routes require a token
        return !!token
      },
    },
    pages: {
      // signIn: "/",
    },
  }
)

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/projects/:path*",
    "/clips/:path*",
    "/submit/:path*",
    "/tasks/:path*",
    "/admin/:path*",
    "/users/:path*",
  ],
}
