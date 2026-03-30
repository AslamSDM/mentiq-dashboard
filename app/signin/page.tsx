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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { sanitizeEmail, sanitizePassword } from "@/lib/sanitization";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;
const GENERIC_ERROR = "Invalid credentials. Please try again.";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastAttempt < 1000) {
      setError("Please wait a moment before trying again.");
      return false;
    }
    return true;
  }, [lastAttempt]);

  const handleSignIn = async (data: SignInFormData) => {
    if (!checkRateLimit()) return;
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
        try {
          const errorObj = JSON.parse(result.error);
          if (errorObj.requiresVerification) {
            setShowVerificationMessage(true);
            setVerificationEmail(
              sanitizeEmail(errorObj.email) || sanitizedEmail,
            );
            setError("");
          } else {
            setError(GENERIC_ERROR);
          }
        } catch {
          if (result.error.includes("verify your email")) {
            setShowVerificationMessage(true);
            setVerificationEmail(sanitizedEmail);
            setError("");
          } else {
            setError(GENERIC_ERROR);
          }
        }
      } else if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError(GENERIC_ERROR);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!checkRateLimit()) return;
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
    <div
      className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center -mb-6">
          <Link
            href="/"
            className="group block transition-transform hover:scale-105"
          >
            <div className="relative h-32 w-64 ">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle atmospheric gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EEF2FF] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F8F9FA] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>

          <div className="relative">
            <h1
              className="text-[2rem] text-center tracking-tight mb-2 text-slate-900"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Welcome back
            </h1>
            <p className="text-center text-[0.9375rem] text-slate-500 mb-8">
              Sign in to your Mentiq account
            </p>

            {error && (
              <div className="text-[0.875rem] text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-6 flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z" />
                  <path d="M7 4h2v5H7V4zm1 8a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                {error}
              </div>
            )}

            {showVerificationMessage && (
              <div className="text-[0.875rem] text-amber-700 bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6 space-y-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 118 0a8 8 0 010 16z" />
                    <path d="M7 4h2v5H7V4zm1 8a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  <p>
                    Please verify your email address before signing in. Check
                    your inbox for the verification link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  Resend verification email
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...register("email")}
                  className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#3B5BDB] hover:text-[#3451C7] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className={`w-full h-11 pl-4 pr-10 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-[0.9375rem] text-slate-500 text-sm">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#3B5BDB] hover:text-[#3451C7] transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
