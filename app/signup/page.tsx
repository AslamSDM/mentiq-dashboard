"use client";

import type React from "react";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Building,
  Check,
  ArrowLeft,
  Zap,
  TrendingUp,
  Rocket,
  Building2,
  Crown,
} from "lucide-react";
import { PRICING_TIERS, getTierById } from "@/lib/constants";

const TIER_ICONS: Record<string, React.ReactNode> = {
  launch: <Zap className="h-5 w-5" />,
  traction: <TrendingUp className="h-5 w-5" />,
  momentum: <Rocket className="h-5 w-5" />,
  scale: <Building2 className="h-5 w-5" />,
  expansion: <Crown className="h-5 w-5" />,
  enterprise: <Crown className="h-5 w-5" />,
};

const TIER_COLORS: Record<string, string> = {
  launch: "from-blue-500 to-cyan-500",
  traction: "from-purple-500 to-pink-500",
  momentum: "from-orange-500 to-red-500",
  scale: "from-green-500 to-emerald-500",
  expansion: "from-yellow-500 to-amber-500",
  enterprise: "from-yellow-500 to-amber-500",
};

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedPlanId = searchParams.get("plan");
  const preselectedUsers = searchParams.get("users");

  const [step, setStep] = useState<"plan" | "details">(
    preselectedPlanId ? "details" : "plan"
  );
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlanId || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep("details");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          companyName,
          planId: selectedPlan,
          expectedUsers: preselectedUsers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Automatically sign in after successful signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        window.location.href = "/dashboard";
      } else {
        setError(
          "Account created but failed to sign in. Please try signing in manually."
        );
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTier = getTierById(selectedPlan);

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-black"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold">Mentiq</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Start killing churn
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
                in minutes
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md">
              Join thousands of SaaS founders who've turned retention into their
              competitive advantage.
            </p>

            {/* Feature List */}
            <div className="space-y-4 pt-8">
              {[
                "3-day free trial on all 1-1000 user plans",
                "No credit card required to start",
                "Cancel anytime, no questions asked",
                "Full access to all plan features",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm text-gray-400">
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

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-8">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-8">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold">Mentiq</span>
          </Link>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-8">
            <div
              className={`flex items-center gap-2 ${
                step === "plan" ? "text-primary" : "text-gray-400"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                  step === "plan"
                    ? "border-primary bg-primary/10"
                    : "border-gray-600 bg-white/5"
                }`}
              >
                1
              </div>
              <span className="font-medium">Choose Plan</span>
            </div>
            <div className="flex-1 h-px bg-white/10"></div>
            <div
              className={`flex items-center gap-2 ${
                step === "details" ? "text-primary" : "text-gray-400"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                  step === "details"
                    ? "border-primary bg-primary/10"
                    : "border-gray-600 bg-white/5"
                }`}
              >
                2
              </div>
              <span className="font-medium">Account Details</span>
            </div>
          </div>

          {/* Step 1: Plan Selection */}
          {step === "plan" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Choose your plan</h2>
                <p className="text-gray-400">
                  Select the plan that fits your current needs. You can upgrade
                  anytime.
                </p>
              </div>

              <div className="grid gap-4">
                {PRICING_TIERS.filter((tier) => tier.id !== "enterprise").map(
                  (tier) => (
                    <button
                      key={tier.id}
                      onClick={() => handlePlanSelect(tier.id)}
                      className={`relative p-6 rounded-xl border-2 transition-all text-left hover:scale-[1.02] ${
                        selectedPlan === tier.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      {(tier as any)?.popular && (
                        <Badge className="absolute top-4 right-4 bg-purple-500">
                          Most Popular
                        </Badge>
                      )}
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-12 w-12 rounded-lg bg-gradient-to-r ${
                            TIER_COLORS[tier.id]
                          } flex items-center justify-center flex-shrink-0`}
                        >
                          {TIER_ICONS[tier.id]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-3 mb-2">
                            <h3 className="text-2xl font-bold">{tier.name}</h3>
                            <span className="text-3xl font-bold text-primary">
                              ${tier.basePrice}
                            </span>
                            <span className="text-gray-400">/month</span>
                          </div>
                          <p className="text-gray-400 mb-3">
                            {tier.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">
                              {tier.range[0]}-{tier.range[1]} users
                            </span>
                            {tier.trialDays === 3 && (
                              <Badge
                                variant="secondary"
                                className="bg-green-500/10 text-green-400 border-green-500/20"
                              >
                                {tier.trialDays}-day free trial
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-2" />
                      </div>
                    </button>
                  )
                )}

                {/* Enterprise Option */}
                <Link
                  href="/pricing"
                  className="relative p-6 rounded-xl border-2 border-white/10 bg-white/5 hover:border-white/20 transition-all text-left hover:scale-[1.02] block"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center flex-shrink-0`}
                    >
                      <Crown className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                      <p className="text-gray-400 mb-3">
                        Custom solutions for 10,000+ users
                      </p>
                      <span className="text-sm text-primary">
                        View pricing & book demo →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === "details" && (
            <div className="space-y-6">
              <button
                onClick={() => setStep("plan")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to plan selection
              </button>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Create your account</h2>
                <p className="text-gray-400">
                  Fill in your details to get started
                </p>
              </div>

              {/* Selected Plan Summary */}
              {selectedTier && (
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-r ${
                          TIER_COLORS[selectedTier.id]
                        } flex items-center justify-center`}
                      >
                        {TIER_ICONS[selectedTier.id]}
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {selectedTier.name} Plan
                        </div>
                        <div className="text-sm text-gray-400">
                          {selectedTier.basePrice &&
                            `$${selectedTier.basePrice}/month`}
                          {selectedTier.trialDays === 3 && (
                            <span className="ml-2 text-green-400">
                              • 3-day free trial
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep("plan")}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-6">
                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-sm font-medium text-gray-300"
                    >
                      Full name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="companyName"
                      className="text-sm font-medium text-gray-300"
                    >
                      Company name
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Acme Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-300"
                  >
                    Work email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-300"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Use 8 or more characters with a mix of letters, numbers &
                    symbols
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-[0_0_30px_-5px_var(--primary)] transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-400">
                  By creating an account, you agree to our{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Link href="/signin">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white"
                >
                  Sign in instead
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
