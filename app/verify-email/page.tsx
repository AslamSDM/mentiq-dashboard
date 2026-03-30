"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Loader2, Mail, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">(
    token ? "loading" : "pending"
  );
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) return;
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/verify-email?token=${token}`
        );
        const data = await response.json();

        if (response.ok && data.verified) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
          if (session) {
            await updateSession();
            setTimeout(() => { router.push("/dashboard"); }, 2000);
          }
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email. The link may have expired.");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred while verifying your email. Please try again.");
      }
    };
    verifyEmail();
  }, [token, session, updateSession, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (status !== "pending" || !session?.user?.email) return;
    const checkVerification = async () => {
      try { await updateSession(); } catch {}
    };
    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, [status, session?.user?.email, updateSession]);

  useEffect(() => {
    if (session?.emailVerified === true) {
      router.push("/dashboard");
    }
  }, [session?.emailVerified, router]);

  const handleResendVerification = async () => {
    if (!session?.user?.email || isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.");
        setResendCooldown(60);
      } else {
        setMessage(data.error || "Failed to resend verification email.");
      }
    } catch {
       setMessage("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <>
      <div className="relative text-center">
        {status === "loading" && (
          <div className="py-8">
            <Loader2 className="w-10 h-10 text-[#3B5BDB] animate-spin mx-auto mb-6" />
            <h1 className="text-[2rem] tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Verifying...
            </h1>
            <p className="text-[0.9375rem] text-slate-500">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {status === "pending" && (
          <div className="py-4">
             <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center border border-yellow-100">
                  <Mail className="w-8 h-8 text-yellow-600" />
                </div>
            </div>
            <h1 className="text-[2rem] tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Verify your email
            </h1>
            <p className="text-[0.9375rem] text-slate-500 mb-6 px-4">
              We sent a verification email to <strong className="font-medium text-slate-900">{session?.user?.email || "your email"}</strong>
            </p>
            {message && (
              <p className="text-[0.875rem] text-green-600 mb-6">{message}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={isResending || resendCooldown > 0}
                className="w-full h-11 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                ) : resendCooldown > 0 ? (
                  <><RefreshCw className="mr-2 h-4 w-4" /> Resend in {resendCooldown}s</>
                ) : (
                  <><RefreshCw className="mr-2 h-4 w-4" /> Resend verification email</>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="w-full h-11 bg-white border border-slate-200 text-slate-700 rounded-xl text-[0.9375rem] font-medium hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="py-4">
             <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
            </div>
            <h1 className="text-[2rem] tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Email Verified!
            </h1>
            <p className="text-[0.9375rem] text-slate-500 mb-8">
              {message}
            </p>
            {session ? (
              <p className="text-[0.875rem] text-slate-400">
                Redirecting to dashboard...
              </p>
            ) : (
              <Link href="/signin" className="flex items-center justify-center w-full h-11 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all">
                Sign in to your account
              </Link>
            )}
          </div>
        )}

        {status === "error" && (
           <div className="py-4">
             <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
            </div>
            <h1 className="text-[2rem] tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Invalid link
            </h1>
            <p className="text-[0.9375rem] text-slate-500 mb-8 max-w-sm mx-auto">
              {message}
            </p>
            <Link href="/signin" className="flex items-center justify-center w-full h-11 bg-white border border-slate-200 text-slate-700 rounded-xl text-[0.9375rem] font-medium hover:bg-slate-50 transition-all">
              Go to sign in
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
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
          
          <div className="relative z-10 w-full">
            <Suspense fallback={
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
              </div>
            }>
              <VerifyEmailContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
