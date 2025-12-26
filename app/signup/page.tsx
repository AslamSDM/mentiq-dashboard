"use client";

import * as React from "react";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCountSlider, TIER_COLORS } from "@/components/user-count-slider";
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
  Zap,
  TrendingUp,
  Rocket,
  Building2,
  Crown,
  Loader2,
  MailOpen,
} from "lucide-react";
import { PRICING_TIERS, getTierByUserCount } from "@/lib/constants";

// Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const TIER_ICONS: Record<string, React.ReactNode> = {
  launch: <Zap className="h-5 w-5" />,
  traction: <TrendingUp className="h-5 w-5" />,
  momentum: <Rocket className="h-5 w-5" />,
  scale: <Building2 className="h-5 w-5" />,
  expansion: <Crown className="h-5 w-5" />,
  enterprise: <Crown className="h-5 w-5" />,
};


function SignUpForm() {
  const searchParams = useSearchParams();

  const preselectedPlanId = searchParams.get("plan");
  const preselectedUsers = searchParams.get("users");

  const [step, setStep] = useState<"details" | "plan" | "verification">("details");
  const [userCount, setUserCount] = useState(
    preselectedUsers ? parseInt(preselectedUsers) : 250
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

      // Check if email verification is required
      if (data.requiresVerification) {
        setIsRegistered(true);
        setUserId(data.account?.id || email);
        setStep("verification");
        return;
      }

      // If no verification required (e.g., Google OAuth users), sign in and go to plan
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

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/signup?step=plan" });
    } catch (error: any) {
      console.error("Google sign up error:", error);
      setError("Failed to sign up with Google. Please try again.");
      setIsGoogleLoading(false);
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
            <div className="relative h-30 w-30">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
              />
            </div>
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
            <div className="relative  h-30 w-30">
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

              {/* Google Sign Up Button */}
              <Button
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading}
                className="w-full h-12 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2 h-5 w-5" />
                )}
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black text-gray-400">
                    or create account with email
                  </span>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Email Verification Pending Step */}
          {step === "verification" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <MailOpen className="h-10 w-10 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Check your email</h2>
                <p className="text-gray-400">
                  We&apos;ve sent a verification link to <strong className="text-white">{email}</strong>
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-400">
                  Click the link in your email to verify your account. Once verified, you can sign in and complete your subscription setup.
                </p>
                <p className="text-xs text-gray-500">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/resend-verification`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email }),
                          }
                        );
                        if (response.ok) {
                          alert("Verification email resent!");
                        }
                      } catch (error) {
                        console.error("Failed to resend:", error);
                      }
                    }}
                    className="text-primary hover:underline"
                  >
                    resend verification email
                  </button>
                </p>
              </div>

              <Link href="/signin">
                <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90">
                  Go to Sign In
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
                  <UserCountSlider
                    userCount={userCount}
                    onUserCountChange={setUserCount}
                    showPrice={true}
                  />

                  {currentTier && userCount <= 10000 && (
                    <div className="space-y-4">
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
                          What&apos;s included:
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
