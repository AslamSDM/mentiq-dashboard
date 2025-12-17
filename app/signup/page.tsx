"use client";

import * as React from "react";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Loader2,
} from "lucide-react";
import {
  PRICING_TIERS,
  getTierById,
  getTierByUserCount,
} from "@/lib/constants";

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

  const [step, setStep] = useState<"details" | "plan">("details");
  const [userCount, setUserCount] = useState(
    preselectedUsers ? parseInt(preselectedUsers) : 250
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const currentTier = getTierByUserCount(userCount);

  // Check if user canceled payment
  React.useEffect(() => {
    const canceled = searchParams.get("canceled");
    if (canceled === "true") {
      setError("Payment was canceled. Please try again.");
      setStep("plan");
    }
  }, [searchParams]);

  const calculatePrice = (tier: (typeof PRICING_TIERS)[number]) => {
    return tier.basePrice;
  };

  const handleRegisterUser = async () => {
    if (
      !fullName ||
      !companyName ||
      !email ||
      !password ||
      password.length < 8
    ) {
      setError("Please fill in all fields correctly");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms and Conditions to continue");
      return;
    }

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Sign in the user after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        setIsRegistered(true);
        setUserId(data.id || email);
        setStep("plan");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tierId: currentTier.id,
          userCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create checkout session");
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link
              href="/docs/Privacy Policy MENTIQ.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/docs/Terms of Service MENTIQ.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
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
                1
              </div>
              <span className="font-medium">Account Details</span>
            </div>
            <div className="flex-1 h-px bg-white/10"></div>
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
                2
              </div>
              <span className="font-medium">Choose Plan</span>
            </div>
          </div>

          {/* Step 1: Account Details */}
          {step === "details" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Create your account</h2>
                <p className="text-gray-400">
                  Fill in your details to get started
                </p>
              </div>

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

              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms(checked as boolean)
                  }
                  className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-gray-300 leading-relaxed cursor-pointer"
                >
                  By creating an account, I agree to the{" "}
                  <Link
                    href="/docs/Terms of Service MENTIQ.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and acknowledge the{" "}
                  <Link
                    href="/docs/Privacy Policy MENTIQ.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  ,{" "}
                  <Link
                    href="/docs/COOKIES MENTIQ.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Cookie Policy
                  </Link>
                  , and{" "}
                  <Link
                    href="/docs/DPA MENTIQ.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Data Processing Addendum
                  </Link>
                  .
                </label>
              </div>

              <Button
                onClick={handleRegisterUser}
                className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-[0_0_30px_-5px_var(--primary)] transition-all duration-300"
                disabled={
                  !fullName ||
                  !companyName ||
                  !email ||
                  !password ||
                  password.length < 8 ||
                  !acceptedTerms ||
                  isLoading
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Continue to plan selection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

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

          {/* Step 2: Plan Selection */}
          {step === "plan" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Choose your plan</h2>
                <p className="text-gray-400">
                  Select the number of paid users you have
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    How many paid users do you have?
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Slide to select your current or expected user count
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-400">
                        1 user
                      </span>
                      <div className="text-center transition-all duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {userCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                          paid users
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-400">
                        10,000+ users
                      </span>
                    </div>
                    <div className="px-2">
                      <Slider
                        value={[userCount]}
                        onValueChange={(value: number[]) =>
                          setUserCount(value[0])
                        }
                        min={1}
                        max={11000}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {currentTier && userCount <= 10000 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3 text-sm animate-in fade-in-50 duration-500">
                        <Badge
                          variant="secondary"
                          className={`px-4 py-2 text-base font-semibold transition-all duration-300 bg-gradient-to-r ${
                            TIER_COLORS[currentTier.id]
                          } text-white border-0 shadow-lg`}
                        >
                          {currentTier.name} Tier
                        </Badge>
                        <span className="text-lg font-bold text-white">
                          ${calculatePrice(currentTier)}/month
                        </span>
                      </div>

                      {currentTier.trialDays && (
                        <div className="text-center">
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-400 border-green-500/20"
                          >
                            {currentTier.trialDays}-day free trial included
                          </Badge>
                        </div>
                      )}

                      <div className="bg-white/5 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-semibold text-white mb-3">
                          What's included:
                        </p>
                        {currentTier.features
                          .slice(0, 5)
                          .map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 text-sm"
                            >
                              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-gray-300">{feature}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {userCount > 10000 && (
                    <div className="text-center space-y-4">
                      <Badge
                        variant="secondary"
                        className="px-4 py-2 text-base font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg"
                      >
                        Enterprise
                      </Badge>
                      <p className="text-white">
                        For 10,000+ users, please contact our sales team for
                        custom pricing.
                      </p>
                      <Link href="/pricing">
                        <Button
                          variant="outline"
                          className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                          View Enterprise Options
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={handleCheckout}
                className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-[0_0_30px_-5px_var(--primary)] transition-all duration-300"
                disabled={!currentTier || userCount > 10000 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-400">
                You'll be redirected to Stripe for secure payment processing.
                After payment, you'll be able to create your first project.
              </p>
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
