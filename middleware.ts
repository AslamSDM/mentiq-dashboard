import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Check if NEXTAUTH_SECRET is configured
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("❌ NEXTAUTH_SECRET is not configured!");
    console.error("Please set NEXTAUTH_SECRET in your environment variables");
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Enhanced logging for debugging
  console.log("🔐 Middleware Debug:", {
    path: req.nextUrl.pathname,
    hasToken: !!token,
    tokenEmail: token?.email || "N/A",
    hasSecret: !!process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/signin") ||
    req.nextUrl.pathname.startsWith("/signup");

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null;
  }

  if (!isAuth && req.nextUrl.pathname.startsWith("/dashboard")) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  return null;
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};
