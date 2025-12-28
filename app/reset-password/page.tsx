"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      // Silent fail - error handled via UI
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold">Invalid reset link</h2>
        <p className="text-gray-400">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
        <div className="pt-4">
          <Link href="/forgot-password">
            <Button className="bg-primary hover:bg-primary/90">
              Request new reset link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Password reset successful!</h2>
        <p className="text-gray-400">
          Your password has been reset. You can now sign in with your new
          password.
        </p>
        <div className="pt-4">
          <Link href="/signin">
            <Button className="bg-primary hover:bg-primary/90 shadow-[0_0_30px_-5px_var(--primary)]">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-2">Reset your password</h2>
      <p className="text-gray-400 mb-8">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-300"
          >
            New password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-gray-500">
            Must be at least 8 characters long
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-300"
          >
            Confirm new password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-[0_0_30px_-5px_var(--primary)] transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Resetting...
            </div>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-black"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold">Mentiq</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Create a new
              <br />
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                secure password
              </span>
            </h1>

            <p className="text-gray-400 text-lg max-w-md">
              Choose a strong password to keep your account safe and secure.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold">Mentiq</span>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
