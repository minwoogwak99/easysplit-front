import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login";

  // Get the token from the cookies
  const token = request.cookies.get("authToken")?.value || "";

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && token && path === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/bills/:path*",
    "/scan-bill/:path*",
    "/friends/:path*",
    "/history/:path*",
    "/login",
  ],
};
