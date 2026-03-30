"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            {!isSubmitted ? (
              <>
                <h1 className="text-[2rem] text-center tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Reset password
                </h1>
                <p className="text-center text-[0.9375rem] text-slate-500 mb-8">
                  No worries. Enter your email and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="text-[0.875rem] text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-6 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/><path d="M7 4h2v5H7V4zm1 8a1 1 0 110-2 1 1 0 010 2z"/></svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                     {isLoading ? "Sending..." : "Send reset link"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#3B5BDB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-[2rem] tracking-tight mb-3 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Check your inbox
                </h1>
                <p className="text-[0.9375rem] text-slate-500 mb-8 max-w-sm mx-auto">
                   If an account exists for <strong className="font-medium text-slate-900">{email}</strong>, we've sent a password reset link. The link expires in 1 hour.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center">
          <Link href="/signin" className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-slate-500 hover:text-[#3B5BDB] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
