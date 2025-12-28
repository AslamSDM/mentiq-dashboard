"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, RefreshCw, CheckCircle, ArrowRight, LogOut } from "lucide-react";

export default function VerifyPendingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const email = session?.user?.email || "";

  // Poll for verification status
  useEffect(() => {
    const checkVerification = async () => {
      if (!session?.accessToken) return;
      
      try {
        // Update the session to get fresh data
        await update();
        
        // Check if emailVerified is now true
        if (session?.emailVerified === true) {
          // Redirect to dashboard or pricing based on subscription
          if (session?.hasActiveSubscription) {
            router.push("/dashboard");
          } else {
            router.push("/pricing?required=true");
          }
        }
      } catch (error) {
        // Silent fail - will retry on next interval
      }
    };

    // Check every 5 seconds
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
      // The useEffect will handle the redirect if verified
    } catch (error) {
      // Silent fail - user can retry manually
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
              <Mail className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Verify Your Email
          </h1>
          <p className="text-slate-400 text-center mb-6">
            We've sent a verification link to
          </p>

          {/* Email Display */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700/50">
            <p className="text-blue-400 font-medium text-center break-all">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-slate-300 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">1</span>
              </div>
              <p>Check your inbox (and spam folder)</p>
            </div>
            <div className="flex items-start gap-3 text-slate-300 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">2</span>
              </div>
              <p>Click the verification link in the email</p>
            </div>
            <div className="flex items-start gap-3 text-slate-300 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">3</span>
              </div>
              <p>You'll be automatically redirected to your dashboard</p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {resendSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 text-sm">Verification email sent!</p>
            </div>
          )}
          {resendError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{resendError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckNow}
              disabled={isChecking}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  I've Verified My Email
                </>
              )}
            </button>

            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full py-3 px-4 rounded-xl bg-slate-700/50 text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-700/50" />

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full py-2 px-4 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out and use a different email
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
}
