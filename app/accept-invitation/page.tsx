"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { teamService } from "@/lib/api";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No invitation token provided.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || password.length < 8 || password !== confirmPassword) {
      if (!fullName.trim()) setError("Please enter your full name.");
      else if (password.length < 8) setError("Password must be at least 8 characters.");
      else setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await teamService.acceptInvitation(token, fullName, password);
      setSuccess(true);
      setTimeout(async () => {
         await signIn("credentials", {
          email: response.user.email,
          password: password,
          redirect: false,
        });
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to accept invitation.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
       <div className="py-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
             <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h1 className="text-[2rem] tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Invalid invitation
        </h1>
        <p className="text-[0.9375rem] text-slate-500 mb-8">
          The link is missing a token or is expired.
        </p>
        <Link href="/signin" className="flex items-center justify-center w-full h-11 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all">
          Go to Sign In
        </Link>
      </div>
    );
  }

  if (success) {
    return (
       <div className="py-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100">
             <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-[2rem] tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Welcome aboard!
        </h1>
        <p className="text-[0.9375rem] text-slate-500 mb-8">
          Your account has been created.
        </p>
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Redirecting...
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[2rem] text-center tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
        Join the team
      </h1>
      <p className="text-center text-[0.9375rem] text-slate-500 mb-8">
        Set up your account to start collaborating.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-[0.875rem] text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-6 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/><path d="M7 4h2v5H7V4zm1 8a1 1 0 110-2 1 1 0 010 2z"/></svg>
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            required
            className="w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all border-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={8}
            className="w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all border-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            minLength={8}
            className="w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all border-slate-200"
          />
        </div>

        <button
          type="submit"
          className="w-full h-11 mt-2 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
             <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Accept invite
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <p className="text-xs text-center text-slate-400 mt-4 leading-relaxed px-4">
          By accepting, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </>
  );
}

export default function AcceptInvitationPage() {
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
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              </div>
            }>
              <AcceptInvitationContent />
            </Suspense>
          </div>
        </div>

      </div>
    </div>
  );
}
