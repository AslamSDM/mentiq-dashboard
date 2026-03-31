"use client";

import * as React from "react";
import { useState, Suspense, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserCountSlider } from "@/components/user-count-slider";
import { PRICING_TIERS, getTierByUserCount } from "@/lib/constants";
import { sanitizeText, sanitizeEmail, sanitizePassword } from "@/lib/sanitization";
import {
  ArrowRight,
  Loader2,
  MailOpen,
  Check,
  Zap,
  TrendingUp,
  Building2,
  Eye,
  EyeOff
} from "lucide-react";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[A-Z])/, "Password must contain at least one capital letter")
    .regex(/^(?=.*[0-9])/, "Password must contain at least one number")
    .regex(
      /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      "Password must contain at least one special character"
    ),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
}).refine((data) => data.password.toLowerCase() !== data.email.toLowerCase(), {
  message: "Password cannot be the same as your email address",
  path: ["password"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const TIER_ICONS: Record<string, React.ReactNode> = {
  starter: <Zap className="w-5 h-5" />,
  growth: <TrendingUp className="w-5 h-5" />,
  scale: <Building2 className="w-5 h-5" />,
};

function SignUpContent() {
  const searchParams = useSearchParams();
  const preselectedUsers = searchParams.get("users");
  
  const [step, setStep] = useState<"details" | "plan" | "verification">("details");
  const [userCount, setUserCount] = useState(preselectedUsers ? parseInt(preselectedUsers) : 250);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");

  const currentTier = getTierByUserCount(userCount);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: { fullName: "", companyName: "", email: "", password: "", acceptedTerms: false },
  });

  React.useEffect(() => {
    const canceled = searchParams.get("canceled");
    if (canceled === "true") {
      setError("Payment was canceled. Please try again.");
      setStep("plan");
    }
  }, [searchParams]);

  const handleRegisterUser = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError("");

    const sanitizedFullName = sanitizeText(data.fullName);
    const sanitizedCompanyName = sanitizeText(data.companyName);
    const sanitizedEmail = sanitizeEmail(data.email);
    const sanitizedPassword = sanitizePassword(data.password);

    if (!sanitizedFullName || !sanitizedCompanyName || !sanitizedEmail || !sanitizedPassword) {
      setError("Please fill in all fields correctly.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizedFullName,
          email: sanitizedEmail,
          password: sanitizedPassword,
          companyName: sanitizedCompanyName,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || "Something went wrong");
        return;
      }

      if (responseData.requiresVerification) {
        setUserId(sanitizeText(responseData.account?.id) || sanitizedEmail);
        setStep("verification");
        return;
      }

      const result = await signIn("credentials", {
        email: sanitizedEmail,
        password: sanitizedPassword,
        redirect: false,
      });

      if (result?.ok) {
        setUserId(responseData.id || data.email);
        setStep("plan");
      } else {
        setError("Account created but failed to sign in. Please try signing in manually.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!currentTier || userCount > 10000) {
      setError("Please select a valid plan");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/signup-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: currentTier.id, userCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create checkout session");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-slate-900 pt-16 pb-16" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className={`w-full ${step === 'plan' ? 'max-w-4xl' : 'max-w-md'}`}>
        
        <div className="flex justify-center mb-10">
          <Link href="/" className="group block transition-transform hover:scale-105">
            <div className="relative h-20 w-64">
              <Image src="/logo.png" alt="Mentiq Logo" fill className="object-contain" priority />
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle atmospheric gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EEF2FF] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F8F9FA] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>
          
          <div className="relative">

            {/* Step Indicators */}
            <div className={`flex items-center justify-center gap-3 md:gap-6 mb-10 text-xs font-medium tracking-wide ${step === 'plan' ? 'max-w-md mx-auto' : ''}`}>
              <div className={`flex items-center gap-2 ${step === 'details' ? 'text-[#3B5BDB]' : 'text-slate-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-[#EEF2FF]' : 'bg-slate-100'}`}>1</div>
                <span>Details</span>
              </div>
              <div className="w-8 h-px bg-slate-200"></div>
              <div className={`flex items-center gap-2 ${step === 'plan' ? 'text-[#3B5BDB]' : 'text-slate-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'plan' ? 'bg-[#EEF2FF]' : 'bg-slate-100'}`}>2</div>
                <span>Plan</span>
              </div>
            </div>

            {error && (
              <div className="text-[0.875rem] text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-6 flex items-start gap-2 max-w-lg mx-auto">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/><path d="M7 4h2v5H7V4zm1 8a1 1 0 110-2 1 1 0 010 2z"/></svg>
                {error}
              </div>
            )}

            {step === "details" && (
              <>
                <h1 className="text-[2rem] text-center tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Create an account
                </h1>
                <p className="text-center text-[0.9375rem] text-slate-500 mb-8">
                  Get started with Mentiq to stop churn.
                </p>

                <form onSubmit={handleSubmit(handleRegisterUser)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                      <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full name</label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="Alex Morgan"
                        {...register("fullName")}
                        className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all ${errors.fullName ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}`}
                      />
                      {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">Company name</label>
                      <input
                        id="companyName"
                        type="text"
                        placeholder="Acme Corp"
                        {...register("companyName")}
                        className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all ${errors.companyName ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}`}
                      />
                      {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Work email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="alex@company.com"
                      autoComplete="email"
                      {...register("email")}
                      className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...register("password")}
                        className={`w-full h-11 pl-4 pr-10 bg-slate-50 border rounded-xl text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                         {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password ? (
                      <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">
                        At least 8 chars, 1 uppercase, 1 number, 1 special char
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 mt-4">
                    <Controller
                      name="acceptedTerms"
                      control={control}
                      render={({ field }) => (
                         <input
                          id="terms"
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-[#3B5BDB] focus:ring-[#3B5BDB]"
                        />
                      )}
                    />
                    <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                      I agree to the <Link href="/#" className="text-[#3B5BDB] hover:underline">Terms of Service</Link>, <Link href="/#" className="text-[#3B5BDB] hover:underline">Privacy Policy</Link>, and <Link href="/#" className="text-[#3B5BDB] hover:underline">DPA</Link>.
                    </label>
                  </div>
                  {errors.acceptedTerms && <p className="text-xs text-red-500 -mt-2">{errors.acceptedTerms.message}</p>}

                  <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="w-full h-11 mt-4 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all disabled:opacity-70 flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isLoading ? "Creating account..." : "Continue to plan"}
                  </button>
                </form>
                <p className="mt-8 text-center text-[0.9375rem] text-slate-500 text-sm">
                  Already have an account? <Link href="/signin" className="font-medium text-[#3B5BDB] hover:text-[#3451C7] transition-colors">Sign in</Link>
                </p>
              </>
            )}

            {step === "verification" && (
              <div className="text-center py-6 px-4">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                    <MailOpen className="w-8 h-8 text-[#3B5BDB]" />
                  </div>
                </div>
                <h1 className="text-[2rem] tracking-tight mb-3 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Check your inbox
                </h1>
                <p className="text-[0.9375rem] text-slate-500 mb-8 max-w-sm mx-auto">
                  We sent a verification link to <strong className="font-medium text-slate-900">{watch("email")}</strong>. Please verify your email to continue.
                </p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                   <Link href="/signin" className="w-full h-11 bg-slate-900 text-white rounded-xl text-[0.9375rem] font-medium hover:bg-slate-800 transition-colors flex items-center justify-center">
                    Go to Sign In
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/resend-verification`, {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: watch("email") }),
                        });
                        if (res.ok) alert("Verification email resent!");
                      } catch (err) {}
                    }}
                    className="text-xs font-medium text-[#3B5BDB] hover:text-[#3451C7] py-2"
                  >
                    Resend email
                  </button>
                </div>
              </div>
            )}

            {step === "plan" && (
              <div className="max-w-3xl mx-auto">
                <h1 className="text-[2rem] text-center tracking-tight mb-2 text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Choose your plan
                </h1>
                <p className="text-center text-[0.9375rem] text-slate-500 mb-8">
                  Select your expected user volume to continue setup.
                </p>

                <div className="mb-10 bg-slate-50 rounded-xl border border-slate-100 p-6 md:p-8">
                  <h3 className="text-[1rem] font-medium text-slate-900 mb-2 text-center">How many paid users do you have?</h3>
                  <div className="mt-6"><UserCountSlider userCount={userCount} onUserCountChange={setUserCount} showPrice={true} /></div>
                </div>

                {currentTier && userCount <= 10000 ? (
                  <div className="rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center bg-white shadow-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#3B5BDB]">
                          {TIER_ICONS[currentTier.id]}
                        </div>
                        <div>
                          <h3 className="text-[1.25rem] font-semibold text-slate-900">{currentTier.name} Plan</h3>
                          <div className="text-sm text-slate-500">Up to {currentTier.included.paidUsers.toLocaleString()} paid users</div>
                        </div>
                      </div>
                      <div className="space-y-3 mt-6">
                        <div className="flex items-start gap-3 text-sm text-slate-600">
                           <Check className="w-4 h-4 mt-0.5 text-[#3B5BDB]" /> Includes {currentTier.included.sessionReplays.toLocaleString()} session replays
                        </div>
                        <div className="flex items-start gap-3 text-sm text-slate-600">
                           <Check className="w-4 h-4 mt-0.5 text-[#3B5BDB]" /> Includes {currentTier.included.automatedEmails.toLocaleString()} automated emails
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto min-w-[200px] flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-[2.5rem] font-semibold tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>${currentTier.basePrice}</span>
                        <span className="text-sm text-slate-500">/mo</span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full h-11 bg-[#3B5BDB] text-white rounded-xl text-[0.9375rem] font-medium hover:bg-[#3451C7] transition-all disabled:opacity-70 flex items-center justify-center px-6"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isLoading ? "Processing..." : "Complete Setup"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8 text-center text-amber-900">
                    <h3 className="text-lg font-semibold mb-2">Enterprise Plan Required</h3>
                    <p className="text-sm text-amber-800 mb-6 max-w-md mx-auto">For over 10,000 users, please contact our team to discuss custom pricing, SLA options, and dedicated infrastructure.</p>
                     <Link href="/pricing" className="inline-flex h-11 items-center justify-center px-6 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
                      View Enterprise Options
                    </Link>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-sm text-slate-500">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
