"use client";

import type React from "react";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { sanitizeEmail, sanitizePassword } from "@/lib/sanitization";

// Zod validation schema
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

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

// Generic error message to prevent user enumeration
const GENERIC_ERROR = "Invalid credentials. Please try again.";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
  });

  // Rate limiting: minimum 1 second between attempts
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastAttempt < 1000) {
      setError("Please wait a moment before trying again.");
      return false;
    }
    return true;
  }, [lastAttempt]);

  const handleSignIn = async (data: SignInFormData) => {
    if (!checkRateLimit()) {
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(data.email);
    const sanitizedPassword = sanitizePassword(data.password);

    if (!sanitizedEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!sanitizedPassword) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setError("");
    setShowVerificationMessage(false);
    setLastAttempt(Date.now());

    try {
      const result = await signIn("credentials", {
        email: sanitizedEmail,
        password: sanitizedPassword,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's a verification required error
        try {
          const errorObj = JSON.parse(result.error);
          if (errorObj.requiresVerification) {
            setShowVerificationMessage(true);
            setVerificationEmail(
              sanitizeEmail(errorObj.email) || sanitizedEmail,
            );
            setError("");
          } else {
            // Use generic error message to prevent user enumeration
            setError(GENERIC_ERROR);
          }
        } catch {
          // Check for verification message in plain text
          if (result.error.includes("verify your email")) {
            setShowVerificationMessage(true);
            setVerificationEmail(sanitizedEmail);
            setError("");
          } else {
            // Use generic error message to prevent user enumeration
            setError(GENERIC_ERROR);
          }
        }
      } else if (result?.ok) {
        // Redirect to dashboard — the middleware handles further routing
        router.push("/dashboard");
        return;
      } else {
        setError(GENERIC_ERROR);
      }
    } catch {
      // Generic error message - don't expose internal errors
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!checkRateLimit()) {
      return;
    }

    setIsGoogleLoading(true);
    setError("");
    setLastAttempt(Date.now());

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Failed to sign in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!checkRateLimit()) {
      return;
    }

    // Sanitize verification email
    const sanitizedVerificationEmail = sanitizeEmail(verificationEmail);
    if (!sanitizedVerificationEmail) {
      setError("Invalid email address.");
      return;
    }

    setLastAttempt(Date.now());

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        setError("Service temporarily unavailable. Please try again later.");
        return;
      }

      const response = await fetch(`${apiBaseUrl}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedVerificationEmail }),
      });

      if (response.ok) {
        setError("");
        // Use a more user-friendly notification instead of alert
        setShowVerificationMessage(true);
      } else {
        setError(
          "Failed to resend verification email. Please try again later.",
        );
      }
    } catch {
      setError("Failed to resend verification email. Please try again later.");
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

          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-blue-200">
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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Mobile Logo */}
          <Link
            href="/"
            className="lg:hidden flex items-center gap-3 mb-4 sm:mb-8"
          >
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
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2B3674]">
              Sign in
            </h2>
            <p className="text-sm sm:text-base text-[#4363C7]">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Google Sign In Button */}
          {/* <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-12 text-sm sm:text-base border-[#E0E5F2] bg-white hover:bg-[#F4F7FE] text-[#2B3674]"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-5 w-5" />
            )}
            Continue with Google
          </Button> */}

          {/* Divider */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E0E5F2]"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 sm:px-4 bg-white text-[#4363C7]">
                or continue with email
              </span>
            </div>
          </div> */}

          <form
            onSubmit={handleSubmit(handleSignIn)}
            className="space-y-4 sm:space-y-6"
          >
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4363C7]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  {...register("email")}
                  className={`pl-10 h-12 bg-[#F4F7FE] border-transparent text-[#2B3674] placeholder:text-[#4363C7] focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary ${
                    errors.email ? "border-red-500 ring-1 ring-red-500" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4363C7]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                  className={`pl-10 pr-10 h-12 bg-[#F4F7FE] border-transparent text-[#2B3674] placeholder:text-[#4363C7] focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary ${
                    errors.password ? "border-red-500 ring-1 ring-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4363C7] hover:text-[#2B3674] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm sm:text-base bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all duration-300"
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
        </div>
      </div>
    </div>
  );
}
