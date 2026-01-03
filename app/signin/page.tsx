"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";

// Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShowVerificationMessage(false);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's a verification required error
        try {
          const errorObj = JSON.parse(result.error);
          if (errorObj.requiresVerification) {
            setShowVerificationMessage(true);
            setVerificationEmail(errorObj.email || email);
            setError("");
          } else {
            setError(
              errorObj.message || "Invalid credentials. Please try again."
            );
          }
        } catch {
          // Check for verification message in plain text
          if (result.error.includes("verify your email")) {
            setShowVerificationMessage(true);
            setVerificationEmail(email);
            setError("");
          } else {
            setError(result.error || "Invalid credentials. Please try again.");
          }
        }
      } else if (result?.ok) {
        const sessionResponse = await fetch("/api/auth/session");
        const sessionData = await sessionResponse.json();

        // Check email verification first
        if (sessionData?.emailVerified === false) {
          window.location.href = "/verify-pending";
          return;
        }

        // Redirect to pricing if no active subscription, otherwise to dashboard
        if (sessionData?.hasActiveSubscription) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/pricing?required=true";
        }
      } else {
        setError("Authentication failed. Please check your credentials.");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      // Use NextAuth's signIn with Google provider
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: verificationEmail }),
        }
      );
      if (response.ok) {
        setError("");
        alert("Verification email sent! Please check your inbox.");
      }
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-[#2B3674]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#2B3674]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-[#2B3674]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-30 w-30">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
          </Link>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome back to
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white">
                The Churn Murderer
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Continue analyzing, optimizing, and retaining your users with
              actionable insights.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm text-blue-200">
            <span>© 2025 Mentiq</span>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-8">
            <div className="relative h-30 w-30">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-[#2B3674]">Mentiq</span>
          </Link>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#2B3674]">Sign in</h2>
            <p className="text-[#A3AED0]">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Google Sign In Button */}
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-12 text-base border-[#E0E5F2] bg-white hover:bg-[#F4F7FE] text-[#2B3674]"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-5 w-5" />
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E0E5F2]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#A3AED0]">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 p-3 rounded-lg">
                {error}
              </div>
            )}

            {showVerificationMessage && (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-lg space-y-3">
                <p>
                  Please verify your email address before signing in. Check your
                  inbox for the verification link.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  className="border-amber-200 text-amber-700 hover:bg-amber-100"
                >
                  Resend verification email
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-[#2B3674]"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A3AED0]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-[#F4F7FE] border-transparent text-[#2B3674] placeholder:text-[#A3AED0] focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-[#2B3674]"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A3AED0]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 bg-[#F4F7FE] border-transparent text-[#2B3674] placeholder:text-[#A3AED0] focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E0E5F2]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#A3AED0]">
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          <Link href="/signup">
            <Button
              variant="outline"
              className="w-full h-12 text-base border-[#E0E5F2] bg-white hover:bg-[#F4F7FE] text-[#2B3674]"
            >
              Create an account
            </Button>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
