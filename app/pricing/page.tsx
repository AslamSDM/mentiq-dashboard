"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Zap,
  TrendingUp,
  Building2,
  Crown,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PRICING_TIERS, getTierByUserCount } from "@/lib/constants";
import { UserCountSlider } from "@/components/user-count-slider";

// Icon mapping for tiers
const TIER_ICONS: Record<string, React.ReactNode> = {
  starter: <Zap className="h-5 w-5" />,
  growth: <TrendingUp className="h-5 w-5" />,
  scale: <Building2 className="h-5 w-5" />,
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
        <span className="text-[0.9375rem] font-medium text-slate-900 group-hover:text-[#3B5BDB] transition-colors">{question}</span>
        <span className={`flex-shrink-0 w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 transition-transform duration-200 ${open ? "rotate-45" : ""}`}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className="text-[0.9375rem] text-slate-500 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

function PricingContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [userCount, setUserCount] = useState(250);
  const [isRequired, setIsRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const required = searchParams.get("required");
    setIsRequired(required === "true");
  }, [searchParams]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const currentTier = getTierByUserCount(userCount);

  // Auto-scroll to selected tier card
  useEffect(() => {
    if (currentTier && cardRefs.current[currentTier.id] && carouselRef.current) {
      const cardElement = cardRefs.current[currentTier.id];
      const carouselElement = carouselRef.current;
      if (!cardElement) return;

      const cardLeft = cardElement.offsetLeft;
      const cardWidth = cardElement.offsetWidth;
      const carouselWidth = carouselElement.offsetWidth;

      const scrollPosition = cardLeft - carouselWidth / 2 + cardWidth / 2;

      carouselElement.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentTier]);

  const calculatePrice = (tier: (typeof PRICING_TIERS)[number]) => {
    return tier.basePrice;
  };

  const handleGetStarted = async (tierId: string) => {
    if (session) {
      if (userCount > 10000) {
        toast({
          title: "Contact Sales",
          description: "Please contact our sales team for enterprise pricing.",
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/stripe/signup-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tierId, userCount }),
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
      router.push(`/signup?plan=${tierId}&users=${userCount}`);
    }
  };

  const handleBookDemo = () => {
    toast({
      title: "Demo Requested",
      description: "Our team will contact you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-slate-100">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="group block transition-transform hover:scale-105" aria-label="Mentiq home">
            <div className="relative h-12 w-36">
              <Image src="/logo.png" alt="Mentiq" fill className="object-contain" priority />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
            <Link href="/#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">How it works</Link>
            <Link href="/#testimonials" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Customers</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-4 py-2">
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
                <Link href="/signin" className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-4 py-2">
                  Sign in
                </Link>
                <Link href="/signup" className="text-sm font-medium bg-[#3B5BDB] text-white px-4 py-2 rounded-lg hover:bg-[#3451C7] transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-slate-500" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {menuOpen ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/> : <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
            </svg>
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-[#FAFAF8] px-6 py-4 flex flex-col gap-4">
            <Link href="/#features" className="text-sm text-slate-600" onClick={() => setMenuOpen(false)}>Features</Link>
            <Link href="/#how-it-works" className="text-sm text-slate-600" onClick={() => setMenuOpen(false)}>How it works</Link>
            <Link href="/#testimonials" className="text-sm text-slate-600" onClick={() => setMenuOpen(false)}>Customers</Link>
            <hr className="border-slate-100" />
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm text-slate-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }} className="text-sm text-slate-600 text-left">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/signin" className="text-sm text-slate-600" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/signup" className="text-sm font-medium bg-[#3B5BDB] text-white px-4 py-2.5 rounded-lg text-center" onClick={() => setMenuOpen(false)}>
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
              <h3 className="text-sm font-semibold text-amber-900">Active Subscription Required</h3>
              <p className="text-sm text-amber-700 mt-1">To access the dashboard and create projects, you need an active subscription. Choose a plan below to get started.</p>
            </div>
          </div>
        )}

        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-medium text-[#3B5BDB] uppercase tracking-widest mb-4">Pricing</p>
          <h1 className="text-[2.75rem] md:text-[3.5rem] leading-[1.08] tracking-tight text-slate-900 mb-6 flex flex-col items-center justify-center" style={{ fontFamily: "'Instrument Serif', serif" }}>
            <span>Simple, transparent pricing.</span>
          </h1>
          <p className="text-[1.0625rem] text-slate-500 leading-relaxed">
            Scale as you grow. Pay only for what you need. Stop churn without breaking the bank.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h3 className="text-[1.125rem] font-semibold text-slate-900 mb-2">How many paid users do you have?</h3>
              <p className="text-sm text-slate-500">Slide to select your current or expected user count</p>
            </div>
            <UserCountSlider userCount={userCount} onUserCountChange={setUserCount} showPrice={true} />
          </div>
        </div>

        {userCount <= 10000 ? (
          <div className="relative">
            <div ref={carouselRef} className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {PRICING_TIERS.map((tier) => {
                const isCurrentTier = currentTier?.id === tier.id;
                const price = calculatePrice(tier);
                const prevTierLimit = PRICING_TIERS.indexOf(tier) === 0 ? 0 : PRICING_TIERS[PRICING_TIERS.indexOf(tier) - 1].included.paidUsers;
                const isInRange = userCount <= tier.included.paidUsers && userCount > prevTierLimit;

                return (
                  <div
                    key={tier.id}
                    ref={(el) => { cardRefs.current[tier.id] = el; }}
                    className={`relative flex flex-col flex-shrink-0 w-[340px] snap-center rounded-2xl border transition-all duration-300 ${isCurrentTier ? 'bg-white border-[#3B5BDB] shadow-md scale-[1.02]' : isInRange ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-80 hover:opacity-100'}`}
                  >
                    {(tier as any).popular && (
                      <div className="absolute top-0 right-6 -translate-y-1/2">
                        <span className="inline-block bg-[#3B5BDB] text-white text-[0.625rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-8 pb-6 border-b border-slate-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${isCurrentTier ? 'bg-[#EEF2FF] text-[#3B5BDB]' : 'bg-slate-100 text-slate-500'}`}>
                        {TIER_ICONS[tier.id]}
                      </div>
                      <h3 className="text-[1.25rem] font-semibold text-slate-900 mb-2">{tier.name}</h3>
                      <p className="text-[0.875rem] text-slate-500 min-h-[40px] leading-relaxed">{tier.description}</p>
                      
                      <div className="mt-6 flex items-baseline gap-1.5">
                        <span className="text-[2.5rem] font-semibold tracking-tight text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>${price}</span>
                        <span className="text-sm text-slate-500">/mo</span>
                      </div>
                      <p className="text-[0.8125rem] text-slate-400 mt-2">Up to {tier.included.paidUsers.toLocaleString()} paid users</p>
                    </div>

                    <div className="p-8 pt-6 flex-1 flex flex-col">
                      <ul className="space-y-4 mb-8 flex-1">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-[0.875rem] text-slate-600">
                            <svg className="mt-0.5 flex-shrink-0 text-[#3B5BDB]" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleGetStarted(tier.id)}
                        disabled={isLoading}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isCurrentTier ? 'bg-[#3B5BDB] hover:bg-[#3451C7] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {isCurrentTier ? "Get Started" : "Select Plan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-xs text-slate-400 mt-4 md:hidden">← Swipe to see plans →</div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto rounded-2xl bg-[#0F1117] text-white p-10 md:p-12 text-center shadow-xl">
             <div className="w-14 h-14 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-6 text-white border border-white/20">
              <Crown className="h-6 w-6" />
            </div>
            <h2 className="text-[2.25rem] md:text-[2.75rem] leading-[1.1] tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Enterprise
            </h2>
            <p className="text-[1.0625rem] text-slate-400 mb-10 max-w-md mx-auto">
              Custom solutions and dedicated infrastructure for large-scale SaaS operations.
            </p>

            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-left max-w-lg mx-auto mb-10">
              {[
                "Unlimited Paid Users", "Custom deployment options",
                "Dedicated infrastructure", "24/7 premium support",
                "Custom SLA & guarantees", "Dedicated success team",
                "White-label solutions", "Custom feature development"
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-[0.875rem] text-slate-300">
                  <svg className="mt-0.5 flex-shrink-0 text-[#748FFC]" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {feat}
                </div>
              ))}
            </div>

            <button
              onClick={handleBookDemo}
              className="bg-white text-slate-900 hover:bg-slate-100 py-3 px-8 rounded-xl text-sm font-medium transition-colors"
            >
              Book a Demo
            </button>
          </div>
        )}

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <div className="mt-32 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[2.25rem] text-slate-900 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Frequently Asked Questions</h2>
          </div>
          <div>
            <FaqItem question="What counts as a paid user?" answer="A paid user is any user who has an active subscription or has made a payment in your application. Free trial users are not counted." />
            <FaqItem question="Can I change plans anytime?" answer="Yes! Upgrade or downgrade at any time. Prorated charges apply when upgrading, and credits are issued for downgrades." />
            <FaqItem question="What payment methods do you accept?" answer="We accept all major credit cards, debit cards, and ACH transfers through Stripe. Enterprise plans can use invoice billing." />
            <FaqItem question="Is there a free trial?" answer="Yes! Starter and Growth plans include a 3-day free trial, and the Scale plan includes a 14-day free trial. Cancel anytime during the trial period." />
          </div>
        </div>

      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="block">
            <div className="relative h-10 w-32">
              <Image src="/logo.png" alt="Mentiq" fill className="object-contain" />
            </div>
          </Link>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Mentiq. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] text-slate-500 text-sm">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
