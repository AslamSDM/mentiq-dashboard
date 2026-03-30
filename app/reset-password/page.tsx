"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

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
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-[2rem] tracking-tight mb-3 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Invalid link
        </h2>
        <p className="text-[0.9375rem] text-slate-500 mb-8 max-w-sm mx-auto">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="inline-flex items-center justify-center w-full h-11 bg-slate-900 text-white rounded-xl text-[0.9375rem] font-medium hover:bg-slate-800 transition-colors">
          Request new reset link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-[2rem] tracking-tight mb-3 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Password reset!
        </h2>
        <p className="text-[0.9375rem] text-slate-500 mb-8 max-w-sm mx-auto">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
        <Link href="/signin" className="inline-flex items-center justify-center w-full h-11 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[2rem] text-center tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
        New password
      </h1>
      <p className="text-center text-[0.9375rem] text-slate-500 mb-8">
        Create a new, secure password.
      </p>

      {error && (
        <div className="text-[0.875rem] text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-6 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/><path d="M7 4h2v5H7V4zm1 8a1 1 0 110-2 1 1 0 010 2z"/></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all border-slate-200"
          />
          <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters long</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all border-slate-200"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-2 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all disabled:opacity-70 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isLoading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-md">
        
        <div className="flex justify-center mb-10">
          <Link href="/" className="group block transition-transform hover:scale-105">
            <div className="relative h-20 w-64">
              <Image src="/logo.png" alt="Mentiq Logo" fill className="object-contain" priority />
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EEF2FF] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F8F9FA] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>
          
          <div className="relative">
             <Suspense fallback={<div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>

      </div>
    </div>
  );
}
