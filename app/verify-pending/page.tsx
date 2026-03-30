"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, RefreshCw, CheckCircle, ArrowRight, LogOut, Loader2 } from "lucide-react";

export default function VerifyPendingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const email = session?.user?.email || "";

  useEffect(() => {
    const checkVerification = async () => {
      if (!session?.accessToken) return;
      
      try {
        await update();
        if (session?.emailVerified === true) {
          if (session?.hasActiveSubscription) {
            router.push("/dashboard");
          } else {
            router.push("/pricing?required=true");
          }
        }
      } catch (error) {
      }
    };

    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, [session, update, router]);

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    setResendSuccess(false);
    setResendError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to resend verification email");
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      setResendError(error.message || "Failed to resend verification email");
      setTimeout(() => setResendError(""), 5000);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      await update();
    } catch (error) {
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
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
          
          <div className="relative z-10 text-center">
             <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center border border-slate-100">
                  <Mail className="w-8 h-8 text-[#3B5BDB]" />
                </div>
            </div>

            <h1 className="text-[2rem] tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Verify your email
            </h1>
            <p className="text-[0.9375rem] text-slate-500 mb-6">
              We've sent a verification link to <strong className="font-medium text-slate-900">{email}</strong>
            </p>

            <div className="text-left space-y-3 mb-8">
              <div className="flex items-start gap-3 text-slate-500 text-sm">
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 mt-0.5">
                  <span className="text-slate-700 text-xs font-medium">1</span>
                </div>
                <p className="mt-1">Check your inbox (and spam folder)</p>
              </div>
              <div className="flex items-start gap-3 text-slate-500 text-sm">
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 mt-0.5">
                  <span className="text-slate-700 text-xs font-medium">2</span>
                </div>
                <p className="mt-1">Click the verification link in the email</p>
              </div>
              <div className="flex items-start gap-3 text-slate-500 text-sm">
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 mt-0.5">
                  <span className="text-slate-700 text-xs font-medium">3</span>
                </div>
                <p className="mt-1">You'll be automatically redirected</p>
              </div>
            </div>

            {resendSuccess && (
              <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-100 flex items-start gap-2 text-left">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-[0.875rem]">Verification email sent!</p>
              </div>
            )}
            {resendError && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-left flex items-start gap-2">
                 <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/><path d="M7 4h2v5H7V4zm1 8a1 1 0 110-2 1 1 0 010 2z"/></svg>
                <p className="text-red-700 text-[0.875rem]">{resendError}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleCheckNow}
                disabled={isChecking}
                className="w-full h-11 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    I've verified my email
                  </>
                )}
              </button>

              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full h-11 bg-white border border-slate-200 text-slate-700 rounded-xl text-[0.9375rem] font-medium hover:bg-slate-50 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend verification email
                  </>
                )}
              </button>
            </div>

            <div className="my-6 border-t border-slate-100" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-[0.875rem] text-slate-500 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out and use a different email
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
