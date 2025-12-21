"use client";

import { useState, useEffect, Suspense } from "react";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Zap,
  TrendingUp,
  Rocket,
  Building2,
  Crown,
  ArrowRight,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PRICING_TIERS, getTierByUserCount } from "@/lib/constants";

// Icon mapping for tiers
const TIER_ICONS: Record<string, React.ReactNode> = {
  launch: <Zap className="h-6 w-6" />,
  traction: <TrendingUp className="h-6 w-6" />,
  momentum: <Rocket className="h-6 w-6" />,
  scale: <Building2 className="h-6 w-6" />,
  expansion: <Crown className="h-6 w-6" />,
  enterprise: <Crown className="h-6 w-6" />,
};

// Color mapping for tiers
const TIER_COLORS: Record<string, string> = {
  launch: "from-blue-500 to-cyan-500",
  traction: "from-purple-500 to-pink-500",
  momentum: "from-orange-500 to-red-500",
  scale: "from-green-500 to-emerald-500",
  expansion: "from-yellow-500 to-amber-500",
  enterprise: "from-yellow-500 to-amber-500",
};

function PricingContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [userCount, setUserCount] = useState(250);
  const [isRequired, setIsRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create checkpoints from tier ranges (midpoint of each range)
  const checkpoints = PRICING_TIERS.filter((t) => t.id !== "enterprise").map(
    (tier) => {
      const midpoint = Math.floor((tier.range[0] + tier.range[1]) / 2);
      return {
        value: midpoint,
        label: tier.range[1].toLocaleString(),
        tierName: tier.name,
        range: tier.range,
      };
    }
  );
  checkpoints.push({
    value: 11000,
    label: "10,000+",
    tierName: "Enterprise",
    range: [10001, Infinity],
  });

  useEffect(() => {
    // Check if subscription is required
    const required = searchParams.get("required");
    setIsRequired(required === "true");
  }, [searchParams]);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  const currentTier = getTierByUserCount(userCount);

  // Auto-scroll to selected tier card
  React.useEffect(() => {
    if (
      currentTier &&
      cardRefs.current[currentTier.id] &&
      carouselRef.current
    ) {
      const cardElement = cardRefs.current[currentTier.id];
      const carouselElement = carouselRef.current;

      if (!cardElement) return;

      const cardLeft = cardElement.offsetLeft;
      const cardWidth = cardElement.offsetWidth;
      const carouselWidth = carouselElement.offsetWidth;

      // Center the card in the viewport
      const scrollPosition = cardLeft - carouselWidth / 2 + cardWidth / 2;

      carouselElement.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentTier]);

  // Use fixed pricing for all tiers
  const calculatePrice = (tier: (typeof PRICING_TIERS)[number]) => {
    return tier.basePrice;
  };

  const handleGetStarted = async (tierId: string) => {
    // If user is authenticated, create checkout session
    if (session) {
      if (userCount > 10000) {
        toast({
          title: "Contact Sales",
          description: "Please contact our sales team for enterprise pricing.",
          variant: "default",
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/stripe/signup-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tierId,
            userCount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast({
            title: "Error",
            description: data.error || "Failed to create checkout session",
            variant: "destructive",
          });
          return;
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Redirect to signup/login with selected plan
      router.push(`/signup?plan=${tierId}&users=${userCount}`);
    }
  };

  const handleBookDemo = () => {
    toast({
      title: "Demo Requested",
      description: "Our team will contact you within 24 hours.",
    });
    // In production, this would send to your demo booking system
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Matching Landing Page */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-30 w-30">
              <img
                src="/logo.png"
                alt="Mentiq Logo"
                className="object-contain h-30 w-30"
              />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_var(--primary)]"
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Background Effects - Matching Landing Page */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>

        <div className="mx-auto max-w-7xl space-y-8 relative z-10">
          {/* Subscription Required Alert */}
          {isRequired && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-500">
                  Active Subscription Required
                </h3>
                <p className="text-sm text-yellow-500/80 mt-1">
                  To access the dashboard and create projects, you need an
                  active subscription. Choose a plan below to get started.
                </p>
              </div>
            </div>
          )}

          {/* Hero - Matching Landing Page Style */}
          <div className="text-center space-y-6 pt-8">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/90 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_10px_var(--primary)]"></span>
              Flexible Pricing for Every Stage
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
                Simple, transparent pricing
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Scale as you grow. Pay only for what you need.
            </p>
          </div>

          {/* User Count Selector */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl shadow-primary/10">
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
                <div className="text-center transition-all duration-300">
                  <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-400">
                    {userCount > 10000 ? "10,000+" : userCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    {currentTier && userCount <= 10000 && (
                      <span>
                        up to {currentTier.range[1].toLocaleString()} Paid Users
                      </span>
                    )}
                    {userCount > 10000 && <span>Unlimited Paid Users</span>}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="relative px-2">
                    <Slider
                      value={[
                        checkpoints.findIndex((cp) => cp.value === userCount) >=
                        0
                          ? checkpoints.findIndex(
                              (cp) => cp.value === userCount
                            )
                          : 0,
                      ]}
                      onValueChange={(value: number[]) =>
                        setUserCount(checkpoints[value[0]].value)
                      }
                      min={0}
                      max={checkpoints.length - 1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="relative px-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      {checkpoints.map((cp, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center"
                          style={{
                            position: "absolute",
                            left: `${(idx / (checkpoints.length - 1)) * 100}%`,
                            transform: "translateX(-50%)",
                          }}
                        >
                          <div className="h-2 w-0.5 bg-gray-600 mb-1"></div>
                          <span className="whitespace-nowrap">{cp.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {currentTier && (
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
              )}

              {userCount > 10000 && (
                <div className="flex items-center justify-center gap-3 text-sm animate-in fade-in-50 duration-500">
                  <Badge
                    variant="secondary"
                    className="px-4 py-2 text-base font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg"
                  >
                    Enterprise
                  </Badge>
                  <span className="text-lg font-bold text-white">
                    Custom pricing
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Cards Carousel */}
          {userCount <= 10000 ? (
            <div className="relative">
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto pb-8 pt-8 px-4 snap-x snap-mandatory scrollbar-hide min-h-[750px]"
              >
                {PRICING_TIERS.filter((tier) => tier.id !== "enterprise").map(
                  (tier) => {
                    const isCurrentTier = currentTier?.id === tier.id;
                    const price = calculatePrice(tier);
                    const isInRange =
                      userCount >= tier.range[0] && userCount <= tier.range[1];

                    return (
                      <Card
                        key={tier.id}
                        ref={(el) => {
                          cardRefs.current[tier.id] = el;
                        }}
                        className={`relative overflow-hidden transition-all duration-500 ease-out transform flex-shrink-0 w-[350px] snap-center bg-white/5 border-white/10 backdrop-blur-sm ${
                          isCurrentTier
                            ? "ring-4 ring-primary shadow-2xl shadow-primary/20 scale-105 border-primary"
                            : isInRange
                            ? "ring-2 ring-white/20 shadow-lg scale-100 opacity-90"
                            : "opacity-60 scale-95 hover:opacity-80"
                        } ${
                          (tier as any).popular ? "border-purple-500" : ""
                        } hover:shadow-xl`}
                      >
                        {(tier as any).popular && (
                          <div className="absolute top-0 right-0 z-10">
                            <Badge
                              className={`rounded-none rounded-bl-lg bg-purple-500 transition-all duration-300 ${
                                isCurrentTier ? "animate-pulse shadow-lg" : ""
                              }`}
                            >
                              Most Popular
                            </Badge>
                          </div>
                        )}

                        <CardHeader>
                          <div
                            className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${
                              TIER_COLORS[tier.id]
                            } mb-4 transition-all duration-500 ${
                              isCurrentTier
                                ? "scale-110 shadow-lg animate-bounce"
                                : ""
                            }`}
                          >
                            {TIER_ICONS[tier.id]}
                          </div>
                          <CardTitle
                            className={`text-2xl text-white transition-colors duration-300 ${
                              isCurrentTier ? "text-primary" : ""
                            }`}
                          >
                            {tier.name}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {tier.description}
                          </CardDescription>
                          <div className="mt-4">
                            <div className="flex items-baseline gap-2">
                              <span
                                className={`text-4xl font-bold text-white transition-all duration-300 ${
                                  isCurrentTier ? "text-primary scale-110" : ""
                                }`}
                              >
                                ${price}
                              </span>
                              <span className="text-gray-400">/month</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              {tier.range[0].toLocaleString()} -{" "}
                              {tier.range[1].toLocaleString()} users
                            </p>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <Button
                            className="w-full"
                            variant={isCurrentTier ? "default" : "outline"}
                            onClick={() => handleGetStarted(tier.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : isCurrentTier ? (
                              <>
                                Get Started{" "}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              "Select Plan"
                            )}
                          </Button>

                          <div className="space-y-3 pt-4">
                            <p className="text-sm font-semibold text-white">
                              What's included:
                            </p>
                            {tier.features.map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 text-sm"
                              >
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>

              {/* Carousel Hint */}
              <div className="text-center text-sm text-gray-400 mt-4">
                ← Scroll to see all plans →
              </div>
            </div>
          ) : (
            // Enterprise/Demo Card for 10,000+ users
            <Card className="mx-auto max-w-2xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-amber-900/20 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl text-white">
                  Enterprise
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Custom solutions for large-scale operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold mb-2 text-white">
                    Let's Talk
                  </p>
                  <p className="text-gray-400">
                    Custom pricing based on your needs
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">Unlimited Paid Users</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Custom deployment options
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Dedicated infrastructure
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">24/7 premium support</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Custom SLA & guarantees
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Dedicated success team
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">White-label solutions</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Custom feature development
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                  size="lg"
                  onClick={handleBookDemo}
                >
                  Book a Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* FAQ Section */}
          <div className="mt-12 text-center pb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4 md:grid-cols-2 text-left max-w-4xl mx-auto">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    What counts as a paid user?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">
                    A paid user is any user who has an active subscription or
                    has made a payment in your application. Free trial users are
                    not counted.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Can I change plans anytime?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">
                    Yes! Upgrade or downgrade at any time. Prorated charges
                    apply when upgrading, and credits are issued for downgrades.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    What payment methods do you accept?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">
                    We accept all major credit cards, debit cards, and ACH
                    transfers through Stripe. Enterprise plans can use invoice
                    billing.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Is there a free trial?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">
                    Yes! All plans include a 14-day free trial. No credit card
                    required to start. Cancel anytime during the trial period.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
