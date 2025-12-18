"use client";

import { useState } from "react";
import * as React from "react";
import { DashboardHeader } from "@/components/dashboard-header";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";

// Pricing tiers configuration
const PRICING_TIERS = [
  {
    id: "launch",
    name: "Launch",
    range: [1, 100],
    icon: <Zap className="h-6 w-6" />,
    color: "from-blue-500 to-cyan-500",
    basePrice: 49,
    description: "Perfect for startups getting started",
    features: [
      "Up to 100 paid users",
      "Core analytics dashboard",
      "Session replay",
      "Basic retention cohorts",
      "Email support",
      "7-day data retention",
    ],
  },
  {
    id: "traction",
    name: "Traction",
    range: [101, 500],
    icon: <TrendingUp className="h-6 w-6" />,
    color: "from-purple-500 to-pink-500",
    basePrice: 149,
    description: "For growing teams finding PMF",
    features: [
      "Up to 500 paid users",
      "Advanced analytics",
      "Unlimited session replays",
      "Retention & churn analysis",
      "Feature adoption tracking",
      "Priority email support",
      "30-day data retention",
      "Custom events",
    ],
    popular: true,
  },
  {
    id: "momentum",
    name: "Momentum",
    range: [501, 1000],
    icon: <Rocket className="h-6 w-6" />,
    color: "from-orange-500 to-red-500",
    basePrice: 299,
    description: "Scaling fast with proven growth",
    features: [
      "Up to 1,000 paid users",
      "Everything in Traction",
      "A/B testing & experiments",
      "Revenue analytics",
      "Health score tracking",
      "API access",
      "90-day data retention",
      "Slack integration",
      "Custom dashboards",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    range: [1001, 5000],
    icon: <Building2 className="h-6 w-6" />,
    color: "from-green-500 to-emerald-500",
    basePrice: 699,
    description: "Enterprise-ready for rapid expansion",
    features: [
      "Up to 5,000 paid users",
      "Everything in Momentum",
      "Advanced segmentation",
      "Predictive churn modeling",
      "Multi-project support",
      "Priority support (< 4hr response)",
      "1-year data retention",
      "SSO authentication",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
  {
    id: "expansion",
    name: "Expansion",
    range: [5001, 10000],
    icon: <Crown className="h-6 w-6" />,
    color: "from-yellow-500 to-amber-500",
    basePrice: 1499,
    description: "Maximum scale with premium support",
    features: [
      "Up to 10,000 paid users",
      "Everything in Scale",
      "White-label options",
      "Custom ML models",
      "Unlimited projects",
      "24/7 premium support",
      "Unlimited data retention",
      "On-premise deployment option",
      "Custom SLA",
      "Quarterly business reviews",
    ],
  },
];

export default function HealthScorePage() {
  const { toast } = useToast();
  const { getEffectiveProjectId } = useStore();
  const selectedProjectId = getEffectiveProjectId();
  const [userCount, setUserCount] = useState(250);
  const [isProcessing, setIsProcessing] = useState(false);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Determine current tier based on user count
  const getCurrentTier = () => {
    if (userCount > 10000) return null; // Enterprise/Demo
    return PRICING_TIERS.find(
      (tier) => userCount >= tier.range[0] && userCount <= tier.range[1]
    );
  };

  const currentTier = getCurrentTier();

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
  const calculatePrice = (tier: (typeof PRICING_TIERS)[0]) => {
    return tier.basePrice;
  };

  const handleSubscribe = async (tierId: string) => {
    if (!selectedProjectId) {
      toast({
        title: "No Project Selected",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call Stripe checkout API
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          tierId,
          userCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
    <div className="flex h-screen flex-col">
      <DashboardHeader
        title="Pricing"
        description="Choose the perfect plan for your needs"
      />
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
            <p className="text-xl text-muted-foreground">
              Scale as you grow. Pay only for what you need.
            </p>
          </div>

          {/* User Count Selector */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white ">
            <CardHeader>
              <CardTitle>How many paid users do you have?</CardTitle>
              <CardDescription className="text-white">
                Slide to select your current or expected user count
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">
                    1 user
                  </span>
                  <div className="text-center transition-all duration-300">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                      {userCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      paid users
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    10,000+ users
                  </span>
                </div>
                <div className="px-2">
                  <Slider
                    value={[userCount]}
                    onValueChange={(value: number[]) => setUserCount(value[0])}
                    min={1}
                    max={11000}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {currentTier && (
                <div className="flex items-center justify-center gap-3 text-sm animate-in fade-in-50 duration-500">
                  <Badge
                    variant="secondary"
                    className={`px-4 py-2 text-base font-semibold transition-all duration-300 bg-gradient-to-r ${currentTier.color} text-white border-0 shadow-lg`}
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
            <div className="relative min-h-[1000px] h-full">
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto pb-8 px-4 snap-x snap-mandatory scrollbar-hide min-h-[750px] p-10"
              >
                {PRICING_TIERS.map((tier) => {
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
                      className={`relative overflow-hidden transition-all duration-500 ease-out transform flex-shrink-0 w-[350px] snap-center ${
                        isCurrentTier
                          ? "ring-4 ring-blue-500 shadow-2xl scale-105 border-blue-500"
                          : isInRange
                          ? "ring-2 ring-slate-600 shadow-lg scale-100 opacity-90"
                          : "opacity-60 scale-95 hover:opacity-80"
                      } ${
                        tier.popular ? "border-purple-500" : ""
                      } hover:shadow-xl`}
                    >
                      {tier.popular && (
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
                            tier.color
                          } mb-4 transition-all duration-500 ${
                            isCurrentTier
                              ? "scale-110 shadow-lg animate-bounce"
                              : ""
                          }`}
                        >
                          {tier.icon}
                        </div>
                        <CardTitle
                          className={`text-2xl transition-colors duration-300 ${
                            isCurrentTier ? "text-blue-400" : ""
                          }`}
                        >
                          {tier.name}
                        </CardTitle>
                        <CardDescription>{tier.description}</CardDescription>
                        <div className="mt-4">
                          <div className="flex items-baseline gap-2">
                            <span
                              className={`text-4xl font-bold transition-all duration-300 ${
                                isCurrentTier ? "text-blue-400 scale-110" : ""
                              }`}
                            >
                              ${price}
                            </span>
                            <span className="text-muted-foreground">
                              /month
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tier.range[0].toLocaleString()} -{" "}
                            {tier.range[1].toLocaleString()} users
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Button
                          className="w-full"
                          variant={isCurrentTier ? "default" : "outline"}
                          disabled={isProcessing}
                          onClick={() => handleSubscribe(tier.id)}
                        >
                          {isProcessing ? (
                            "Processing..."
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
                          <p className="text-sm font-semibold">
                            What's included:
                          </p>
                          {tier.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 text-sm"
                            >
                              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Carousel Hint */}
              <div className="text-center text-sm text-muted-foreground mt-4">
                ← Scroll to see all plans →
              </div>
            </div>
          ) : (
            // Enterprise/Demo Card for 10,000+ users
            <Card className="mx-auto max-w-2xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-amber-900/20">
              <CardHeader className="text-center">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 mb-4">
                  <Crown className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl">Enterprise</CardTitle>
                <CardDescription className="text-lg">
                  Custom solutions for large-scale operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold mb-2">Let's Talk</p>
                  <p className="text-muted-foreground">
                    Custom pricing based on your needs
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Unlimited paid users</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Custom deployment options</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Dedicated infrastructure</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>24/7 premium support</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Custom SLA & guarantees</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Dedicated success team</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>White-label solutions</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Custom feature development</span>
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
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4 md:grid-cols-2 text-left max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    What counts as a paid user?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A paid user is any user who has an active subscription or
                    has made a payment in your application. Free trial users are
                    not counted.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I change plans anytime?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Yes! Upgrade or downgrade at any time. Prorated charges
                    apply when upgrading, and credits are issued for downgrades.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    What payment methods do you accept?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards, debit cards, and ACH
                    transfers through Stripe. Enterprise plans can use invoice
                    billing.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Is there a free trial?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
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
