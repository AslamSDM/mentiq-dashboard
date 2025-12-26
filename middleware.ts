import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const emailVerified = token?.emailVerified !== false;
  const hasActiveSubscription = token?.hasActiveSubscription === true;
  const isAdmin = token?.isAdmin === true;
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/dashboard/admin");
  const isVerifyPendingPage = pathname.startsWith("/verify-pending");
  const isVerifyEmailPage = pathname.startsWith("/verify-email");
  const isOnboardingPage = pathname.startsWith("/dashboard/onboarding");
  const hasSuccessParam = req.nextUrl.searchParams.get("success") === "true";

  if (isVerifyEmailPage) {
    return null;
  }

  if (isAdminPage) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isVerifyPendingPage) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    if (emailVerified) {
      if (!hasActiveSubscription && !isAdmin) {
        return NextResponse.redirect(new URL("/pricing?required=true", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null;
  }

  if (isAuthPage) {
    if (isAuth) {
      if (!emailVerified) {
        return NextResponse.redirect(new URL("/verify-pending", req.url));
      }
      if (!hasActiveSubscription && !isAdmin) {
        return NextResponse.redirect(new URL("/pricing?required=true", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null;
  }

  if (!isAuth && isDashboardPage) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  if (isAuth && isDashboardPage && !emailVerified) {
    return NextResponse.redirect(new URL("/verify-pending", req.url));
  }

  if (isAuth && isDashboardPage && !hasActiveSubscription && !isAdmin && !isOnboardingPage) {
    return NextResponse.redirect(new URL("/pricing?required=true", req.url));
  }

  if (isOnboardingPage && hasSuccessParam) {
    return null;
  }

  return null;
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup", "/pricing", "/verify-pending", "/verify-email"],
};
