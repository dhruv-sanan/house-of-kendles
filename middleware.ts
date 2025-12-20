import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // --- START DEBUG LOGGING ---
  console.log(`\n[Middleware] Triggered for path: ${request.nextUrl.pathname}`);
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("[Middleware] FATAL: JWT_SECRET environment variable is NOT loaded.");
  } else {
    // Log only the first few characters for security
    console.log(`[Middleware] JWT_SECRET found. Starts with: ${jwtSecret.substring(0, 4)}...`);
  }
  // --- END DEBUG LOGGING ---

  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  if (!jwtSecret) {
    // If the secret is missing, the app is misconfigured. Don't proceed.
    return new Response("Internal Server Error: Application not configured.", {
      status: 500,
    });
  }

  // Allow the login page to be accessed without a token
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!token) {
    console.log("[Middleware] No token found. Redirecting to login.");
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    await jwtVerify(token, secret);
    console.log("[Middleware] Token verified successfully. Allowing access.");
    return NextResponse.next();
  } catch (error) {
    console.log("[Middleware] Token verification failed. Redirecting to login.");
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};