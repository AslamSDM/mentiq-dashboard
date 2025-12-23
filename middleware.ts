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
    emailVerified: token?.emailVerified ?? true,
    hasActiveSubscription: token?.hasActiveSubscription || false,
    subscriptionStatus: token?.subscriptionStatus || "none",
    hasSecret: !!process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const emailVerified = token?.emailVerified !== false; // Default to true for backwards compatibility
  const hasActiveSubscription = token?.hasActiveSubscription === true;
  const isAdmin = token?.isAdmin === true;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/signin") ||
    req.nextUrl.pathname.startsWith("/signup");
  const isPricingPage = req.nextUrl.pathname.startsWith("/pricing");
  const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");
  const isAdminPage = req.nextUrl.pathname.startsWith("/dashboard/admin");
  const isVerifyPendingPage = req.nextUrl.pathname.startsWith("/verify-pending");
  const isVerifyEmailPage = req.nextUrl.pathname.startsWith("/verify-email");

  // Allow verify-email page for token verification
  if (isVerifyEmailPage) {
    return null;
  }

  // SECURITY: Protect admin routes at middleware level
  if (isAdminPage) {
    if (!isAuth) {
      console.warn("🚫 Unauthenticated user attempted to access admin page");
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    if (!isAdmin) {
      console.warn("🚫 Non-admin user attempted to access admin page:", token?.email);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Handle verify-pending page
  if (isVerifyPendingPage) {
    if (!isAuth) {
      // Need to be logged in to see verify-pending
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    if (emailVerified) {
      // Already verified, redirect to dashboard or pricing
      if (!hasActiveSubscription && !isAdmin) {
        return NextResponse.redirect(new URL("/pricing?required=true", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null; // Allow access to verify-pending
  }

  // Allow auth pages for non-authenticated users
  if (isAuthPage) {
    if (isAuth) {
      // If authenticated but email not verified, redirect to verify-pending
      if (!emailVerified) {
        return NextResponse.redirect(new URL("/verify-pending", req.url));
      }
      // If authenticated but no subscription, redirect to pricing
      if (!hasActiveSubscription && !isAdmin) {
        return NextResponse.redirect(
          new URL("/pricing?required=true", req.url)
        );
      }
      // If authenticated with subscription, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null;
  }

  // Redirect unauthenticated users trying to access dashboard
  if (!isAuth && isDashboardPage) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // Check email verification for authenticated users accessing dashboard
  if (isAuth && isDashboardPage && !emailVerified) {
    console.log("⚠️ User authenticated but email not verified, redirecting to verify-pending");
    return NextResponse.redirect(new URL("/verify-pending", req.url));
  }

  // Allow onboarding page to load even without subscription (needed for payment callback)
  const isOnboardingPage = req.nextUrl.pathname.startsWith("/dashboard/onboarding");
  const hasSuccessParam = req.nextUrl.searchParams.get("success") === "true";

  // Check subscription for authenticated users accessing dashboard (except admins and onboarding)
  if (isAuth && isDashboardPage && !hasActiveSubscription && !isAdmin && !isOnboardingPage) {
    console.log(
      "⚠️ User authenticated but no active subscription, redirecting to pricing"
    );
    return NextResponse.redirect(new URL("/pricing?required=true", req.url));
  }

  // Allow onboarding page with success parameter to refresh session
  if (isOnboardingPage && hasSuccessParam) {
    console.log("✅ Allowing onboarding page for payment callback");
    return null;
  }

  return null;
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup", "/pricing", "/verify-pending", "/verify-email"],
};

