"use client";

import { useState, useEffect, Suspense } from "react";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Zap,
  TrendingUp,
  Building2,
  AlertCircle,
  Loader2,
  LogOut,
  Key,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PRICING_TIERS } from "@/lib/constants";
import { usageService } from "@/lib/services/usage";

// Icon mapping for tiers
const TIER_ICONS: Record<string, React.ReactNode> = {
  starter: <Zap className="h-5 w-5" />,
  growth: <TrendingUp className="h-5 w-5" />,
  enterprise: <Building2 className="h-5 w-5" />,
};

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-[0.9375rem] font-medium text-slate-900 group-hover:text-[#3B5BDB] transition-colors">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 1v8M1 5h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}
      >
        <p className="text-[0.9375rem] text-slate-500 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

function PricingContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const [isRequired, setIsRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lifetimeOpen, setLifetimeOpen] = useState(false);
  const [lifetimeKey, setLifetimeKey] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  useEffect(() => {
    const required = searchParams.get("required");
    setIsRequired(required === "true");
  }, [searchParams]);





  const handleGetStarted = async (tierId: string) => {
    if (tierId === "enterprise") {
      handleBookDemo();
      return;
    }
    if (session) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/stripe/signup-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tierId }),
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
      router.push(`/signup?plan=${tierId}`);
    }
  };

  const handleBookDemo = () => {
    toast({
      title: "Demo Requested",
      description: "Our team will contact you within 24 hours.",
    });
  };

  const handleRedeemKey = async () => {
    if (!lifetimeKey.trim()) return;
    setRedeemLoading(true);
    try {
      const result = await usageService.redeemLifetimeKey(lifetimeKey.trim());
      setRedeemSuccess(true);
      setLifetimeKey("");
      toast({
        title: "Lifetime Plan Activated",
        description: result.message || "Your lifetime plan is now active.",
      });
      // Refresh NextAuth JWT so middleware sees hasActiveSubscription=true
      // before we redirect. Without this, /dashboard bounces back to /pricing.
      await updateSession();
      // Full reload — ensures the fresh session cookie is read by the
      // server-side middleware on the next request.
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Invalid Key",
        description:
          error.message || "That key is invalid or has already been used.",
        variant: "destructive",
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FAFAF8] text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-slate-100">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="group block transition-transform hover:scale-105"
            aria-label="Mentiq home"
          >
            <div className="relative h-12 w-36">
              <Image
                src="/logo.png"
                alt="Mentiq"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Customers
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-4 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-4 py-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-[#3B5BDB] text-white px-4 py-2 rounded-lg hover:bg-[#3451C7] transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-slate-500"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {menuOpen ? (
                <path
                  d="M4 4l12 12M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-[#FAFAF8] px-6 py-4 flex flex-col gap-4">
            <Link
              href="/#features"
              className="text-sm text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              Customers
            </Link>
            <hr className="border-slate-100" />
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setMenuOpen(false);
                  }}
                  className="text-sm text-slate-600 text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm text-slate-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-[#3B5BDB] text-white px-4 py-2.5 rounded-lg text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {isRequired && (
          <div className="mb-12 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Active Subscription Required
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                To access the dashboard and create projects, you need an active
                subscription. Choose a plan below to get started.
              </p>
            </div>
          </div>
        )}

        {/* ── HEADING ───────────────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <h1
            className="text-[3rem] md:text-[3.5rem] tracking-tight text-slate-900"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Simple, transparent pricing
          </h1>
          <p className="text-slate-500 text-lg mt-3 max-w-xl mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        {/* ── PLAN CARDS ───────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16"
        >
          {PRICING_TIERS.map((tier) => {
            const isPopular = (tier as any).popular;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
                  isPopular
                    ? "border-[#3B5BDB] bg-white shadow-lg shadow-[#3B5BDB]/8 scale-[1.02]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6875rem] font-semibold uppercase tracking-wider bg-[#3B5BDB] text-white px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                {/* Tier icon + name */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isPopular
                        ? "bg-[#3B5BDB] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {TIER_ICONS[tier.id]}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-slate-500">{tier.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {(tier as any).custom ? (
                    <>
                      <span className="text-3xl font-bold text-slate-900">
                        Custom
                      </span>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Tailored to your team
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-slate-900">
                        ${tier.basePrice}
                      </span>
                      <span className="text-sm text-slate-500 ml-1">
                        /month
                      </span>
                      {tier.trialDays > 0 && (
                        <p className="text-xs text-[#3B5BDB] mt-1 font-medium">
                          {tier.trialDays}-day free trial
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[0.8125rem] text-slate-600"
                    >
                      <svg
                        className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#3B5BDB]"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M4 8.5l2.5 2.5L12 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleGetStarted(tier.id)}
                  disabled={isLoading}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isPopular
                      ? "bg-[#3B5BDB] text-white hover:bg-[#3451C7]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (tier as any).custom ? (
                    "Contact Sales"
                  ) : session ? (
                    "Subscribe"
                  ) : (
                    "Get Started"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── LIFETIME CODE ──────────────────────────────────────────────── */}
        {session && (
          <div className="mt-16 max-w-xl mx-auto">
            <button
              onClick={() => setLifetimeOpen(!lifetimeOpen)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  <Key className="h-4 w-4 text-[#3B5BDB]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Have a lifetime code?
                  </p>
                  <p className="text-xs text-slate-500">
                    Redeem your activation key here
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${lifetimeOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${lifetimeOpen ? "max-h-60 mt-3" : "max-h-0"}`}
            >
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                {redeemSuccess ? (
                  <div className="flex items-center gap-3 text-green-700">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Lifetime plan activated!
                      </p>
                      <p className="text-xs text-green-600">
                        Redirecting to dashboard...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mb-3">
                      Enter your lifetime activation key to unlock your plan.
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="MQ-XXXX-XXXX-XXXX-XXXX"
                          value={lifetimeKey}
                          onChange={(e) => setLifetimeKey(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/10 transition-all font-mono bg-slate-50"
                        />
                      </div>
                      <button
                        onClick={handleRedeemKey}
                        disabled={redeemLoading || !lifetimeKey.trim()}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        {redeemLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Redeem"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <div className="mt-32 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-[2.25rem] text-slate-900 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div>
            <FaqItem
              question="What counts as a paid user?"
              answer="A paid user is any user who has an active subscription or has made a payment in your application. Free trial users are not counted."
            />
            <FaqItem
              question="Can I change plans anytime?"
              answer="Yes! Upgrade or downgrade at any time. Prorated charges apply when upgrading, and credits are issued for downgrades."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, debit cards, and ACH transfers through Stripe. Enterprise plans can use invoice billing."
            />
            <FaqItem
              question="Is there a free trial?"
              answer="Yes! Starter and Growth plans include a 3-day free trial. Cancel anytime during the trial period. Enterprise plans are custom — contact sales for trial options."
            />
          </div>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="block">
            <div className="relative h-10 w-32">
              <Image
                src="/logo.png"
                alt="Mentiq"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Mentiq. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] text-slate-500 text-sm">
          Loading...
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
