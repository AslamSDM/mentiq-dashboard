"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Inline animation hook ───────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Stat counter ─────────────────────────────────────────────────────────────
function CountUp({
  end,
  suffix = "",
  duration = 1800,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="p-8">
        <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-5 text-[#3B5BDB]">
          {icon}
        </div>
        <h3 className="text-[1.125rem] font-semibold text-slate-900 mb-2 leading-snug">
          {title}
        </h3>
        <p className="text-[0.9375rem] text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────
function TestimonialCard({
  quote,
  name,
  role,
  company,
  delay = 0,
}: {
  quote: string;
  name: string;
  role: string;
  company: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <figure
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`bg-white rounded-2xl border border-slate-100 p-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <blockquote className="text-[0.9375rem] text-slate-600 leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#3B5BDB] text-sm font-semibold">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          <div className="text-xs text-slate-400">
            {role}, {company}
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: "", // Only collecting email in this streamlined form
          email: email.trim(),
          company: "",
          user_count: 0,
          source: "landing_page",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setIsWaitlistModalOpen(false);
        toast({
          title: "You're on the waitlist",
          description: "We'll reach out when Mentiq opens early access.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join waitlist",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="bg-[#FAFAF8] text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Dialog open={isWaitlistModalOpen} onOpenChange={setIsWaitlistModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join the waitlist</DialogTitle>
            <DialogDescription>
              Enter your work email to get early access to Mentiq.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWaitlist} className="space-y-4 mt-2">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full text-sm text-slate-900 border border-slate-200 rounded-lg px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B5BDB] text-white font-medium text-sm rounded-lg px-4 py-3 hover:bg-[#3451C7] transition-colors"
            >
              {loading ? "Joining..." : "Request early access"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-slate-100">
        <nav
          className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="group block transition-transform hover:scale-105"
            aria-label="Mentiq home"
          >
            <div className="relative h-30 w-36">
              <Image
                src="/logo.png"
                alt="Mentiq"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              How it works
            </a>
            <a
              href="#testimonials"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Customers
            </a>
            <a
              href="#faq"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              FAQ
            </a>
            <Link
              href="/pricing"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <a
              href="#waitlist"
              onClick={(e) => {
                e.preventDefault();
                setIsWaitlistModalOpen(true);
              }}
              className="text-sm font-medium bg-[#3B5BDB] text-white px-4 py-2 rounded-lg hover:bg-[#3451C7] transition-colors cursor-pointer"
            >
              Join waitlist
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-500"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
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
                <>
                  <path
                    d="M3 5h14M3 10h14M3 15h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-[#FAFAF8] px-6 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              How it works
            </a>
            <a
              href="#testimonials"
              className="text-sm text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              Customers
            </a>
            <Link
              href="/pricing"
              className="text-sm text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <a
              href="#faq"
              className="text-sm text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </a>
            <hr className="border-slate-100" />
            <Link href="/signin" className="text-sm text-slate-600">
              Sign in
            </Link>
            <a
              href="#waitlist"
              className="text-sm font-medium bg-[#3B5BDB] text-white px-4 py-2.5 rounded-lg text-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                setIsWaitlistModalOpen(true);
              }}
            >
              Join waitlist
            </a>
          </div>
        )}
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28"
        aria-labelledby="hero-heading"
      >
        {/* Eyebrow */}
        <div
          className={`inline-flex items-center gap-2 text-xs font-medium text-[#3B5BDB] bg-[#EEF2FF] border border-[#C5D0FF] px-3 py-1.5 rounded-full mb-8 transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB] animate-pulse"
            aria-hidden="true"
          />
          Waitlist open — early access invites
        </div>

        <div className="max-w-2xl">
          <h1
            id="hero-heading"
            className={`transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            <span className="block text-[3rem] md:text-[3.75rem] leading-[1.08] tracking-tight text-slate-900">
              Stop churn
            </span>
            <span className="block text-[3rem] md:text-[3.75rem] leading-[1.08] tracking-tight text-[#3B5BDB]">
              before it starts.
            </span>
          </h1>

          <p
            className={`mt-6 text-[1.0625rem] text-slate-500 leading-relaxed max-w-md transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Mentiq gives SaaS teams clear visibility into churn risk, cohort
            health, and the exact playbooks to act on it — before renewal
            pressure hits.
          </p>

          <div
            className={`mt-8 flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <a
              href="#waitlist"
              onClick={(e) => {
                e.preventDefault();
                setIsWaitlistModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#3B5BDB] text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-[#3451C7] transition-colors cursor-pointer"
              aria-label="Request early access to Mentiq"
            >
              Request early access
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-white transition-all"
            >
              See how it works
            </a>
          </div>

          <p
            className={`mt-5 text-xs text-slate-400 transition-all duration-700 delay-400 ${heroVisible ? "opacity-100" : "opacity-0"}`}
          >
            4,200+ SaaS operators on the waitlist
          </p>

          {/* Social proof logos */}
          <div
            className={`mt-8 transition-all duration-700 delay-500 ${heroVisible ? "opacity-100" : "opacity-0"}`}
          >
            <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest">
              Integrates with
            </p>
            <div className="flex items-center gap-5">
              {["Stripe", "Mailchimp", "SendGrid", "Customer.io"].map(
                (name) => (
                  <span
                    key={name}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {name}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ──────────────────────────────────────────────────── */}
      <section
        className="border-y border-slate-100 bg-white"
        aria-label="Key metrics"
      >
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 47, suffix: "%", label: "Average churn reduction" },
            { value: 4200, suffix: "+", label: "SaaS teams on waitlist" },
            { value: 90, suffix: " days", label: "Time to measurable results" },
            { value: 3, suffix: "x", label: "Faster than manual CS review" },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="text-center">
              <div
                className="text-[2.25rem] font-semibold text-slate-900 tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                <CountUp end={value} suffix={suffix} />
              </div>
              <div className="mt-1 text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ───────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-6 py-24"
        aria-labelledby="problem-heading"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-[#3B5BDB] uppercase tracking-widest mb-4">
            The problem
          </p>
          <h2
            id="problem-heading"
            className="text-[2.25rem] md:text-[2.75rem] leading-[1.1] tracking-tight text-slate-900 mb-6"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            You find out about churn <em>after</em> it happens.
          </h2>
          <p className="text-[1.0625rem] text-slate-500 leading-relaxed mb-8">
            Most SaaS teams discover a user has churned when they see the
            cancellation email. By then, the engagement drop, the feature
            abandonment, the unanswered support ticket — all the signals were
            there. They just weren't visible.
          </p>
          <p className="text-[1.0625rem] text-slate-500 leading-relaxed">
            Mentiq surfaces those signals in real time, scores each user's risk,
            and gives you the exact playbook to intervene — before the
            cancellation decision is made.
          </p>
        </div>

        {/* Before / After comparison */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8">
            <div className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-5">
              Without Mentiq
            </div>
            <ul className="space-y-3" role="list">
              {[
                "Churn discovered after cancellation",
                "No visibility into which users are at risk",
                "Manual, reactive customer success calls",
                "Cohort health tracked in spreadsheets",
                "No way to measure playbook effectiveness",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-600"
                >
                  <svg
                    className="mt-0.5 flex-shrink-0 text-red-300"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 3l8 8M11 3L3 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50/50 p-8">
            <div className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-5">
              With Mentiq
            </div>
            <ul className="space-y-3" role="list">
              {[
                "At-risk users flagged 14–30 days before churn",
                "Real-time risk scores for every user",
                "Automated retention emails triggered by behavior",
                "Cohort heatmaps updated daily",
                "Full attribution for every saved account",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-600"
                >
                  <svg
                    className="mt-0.5 flex-shrink-0 text-green-500"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7l3.5 3.5L12 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section
        id="features"
        className="bg-white border-y border-slate-100 py-24"
        aria-labelledby="features-heading"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-medium text-[#3B5BDB] uppercase tracking-widest mb-4">
              Features
            </p>
            <h2
              id="features-heading"
              className="text-[2.25rem] md:text-[2.75rem] leading-[1.1] tracking-tight text-slate-900"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Everything you need to retain more users.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              delay={0}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M2 13 L5 9 L8 11 L13 5 L16 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="13"
                    cy="5"
                    r="2"
                    fill="currentColor"
                    opacity="0.2"
                  />
                </svg>
              }
              title="Churn Risk Scoring"
              description="Every user gets a real-time risk score based on behavioral signals: login frequency, feature usage, engagement drops, and billing events."
            />
            <FeatureCard
              delay={80}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.3"
                  />
                  <rect
                    x="10"
                    y="2"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="2"
                    y="10"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="10"
                    y="10"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                  />
                </svg>
              }
              title="Cohort Retention Analysis"
              description="Visualize how each cohort of users retains over time with a heatmap that makes drop-off patterns impossible to miss."
            />
            <FeatureCard
              delay={160}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 9h12M9 3l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              title="Retention Playbooks"
              description="Automated email sequences triggered by risk score thresholds. Configure discount offers, cooldown periods, and targeting rules — no code required."
            />
            <FeatureCard
              delay={0}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle
                    cx="9"
                    cy="9"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M9 5v4l3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Revenue Analytics"
              description="Track MRR, expansion revenue, downgrade MRR, and net revenue churn — all pulled directly from your Stripe account with no manual exports."
            />
            <FeatureCard
              delay={80}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M4 14 L4 9 M8 14 L8 6 M12 14 L12 3 M16 14 L16 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Feature Adoption Tracking"
              description="See which features drive retention and which are being ignored. Identify the 'aha moment' that predicts long-term subscription health."
            />
            <FeatureCard
              delay={160}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 5h12M3 9h8M3 13h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Session Replay"
              description="Watch exactly how at-risk users interact with your product. Understand friction points before they become cancellation reasons."
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="bg-[#0F1117] py-24 text-white"
        aria-labelledby="how-heading"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-medium text-[#748FFC] uppercase tracking-widest mb-4">
              How it works
            </p>
            <h2
              id="how-heading"
              className="text-[2.25rem] md:text-[2.75rem] leading-[1.1] tracking-tight text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Up and running in under 15 minutes.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Install the SDK",
                description:
                  "Add 3 lines of JavaScript to your app. Mentiq starts capturing behavioral events immediately — no data warehouse required.",
                detail: "npm install @mentiq/js",
              },
              {
                step: "02",
                title: "Connect your tools",
                description:
                  "Link Stripe for revenue data, Mailchimp or SendGrid for email delivery. Mentiq pulls everything together into a single view.",
                detail: "Stripe · Mailchimp · SendGrid · Customer.io",
              },
              {
                step: "03",
                title: "Set your thresholds",
                description:
                  "Configure when to flag a user as at-risk, which playbook to trigger, and what discount to offer. Mentiq handles the rest automatically.",
                detail: "Risk threshold: 70% · Discount: 20% · Cooldown: 30d",
              },
            ].map(({ step, title, description, detail }, i) => {
              const { ref, visible } = useInView();
              return (
                <div
                  key={step}
                  ref={ref}
                  style={{ transitionDelay: `${i * 100}ms` }}
                  className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                >
                  <div className="text-[0.6875rem] font-mono text-slate-500 mb-4">
                    {step}
                  </div>
                  <h3 className="text-[1.125rem] font-semibold text-white mb-3">
                    {title}
                  </h3>
                  <p className="text-[0.9375rem] text-slate-400 leading-relaxed mb-4">
                    {description}
                  </p>
                  <div className="text-xs font-mono text-[#748FFC] bg-[#1A1D2E] rounded-lg px-4 py-3 border border-[#2A2D3E]">
                    {detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section
        id="testimonials"
        className="bg-white border-y border-slate-100 py-24"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-medium text-[#3B5BDB] uppercase tracking-widest mb-4">
              Customers
            </p>
            <h2
              id="testimonials-heading"
              className="text-[2.25rem] md:text-[2.75rem] leading-[1.1] tracking-tight text-slate-900"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Trusted by SaaS teams who take retention seriously.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              delay={0}
              quote="We went from discovering churn after the fact to catching 80% of at-risk users before they cancelled. Mentiq paid for itself in the first week."
              name="Jordan Mack"
              role="Founder"
              company="Stackline HQ"
            />
            <TestimonialCard
              delay={80}
              quote="The cohort heatmap alone changed how we think about our onboarding. We found a drop-off at day 7 that we never would have caught otherwise."
              name="Priya Nair"
              role="Head of Growth"
              company="Formbase"
            />
            <TestimonialCard
              delay={160}
              quote="Setup took 12 minutes. Within 24 hours we had a list of 14 users who were about to churn. We saved 9 of them with a single email sequence."
              name="Alex Torres"
              role="CEO"
              company="Draftly"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="max-w-6xl mx-auto px-6 py-24"
        aria-labelledby="faq-heading"
      >
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-xs font-medium text-[#3B5BDB] uppercase tracking-widest mb-4">
              FAQ
            </p>
            {/* <h2
              id="faq-heading"
              className="text-[2.25rem] md:text-[2.75rem] leading-[1.1] tracking-tight text-slate-900"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Questions worth asking.
            </h2>
            <p className="mt-4 text-[0.9375rem] text-slate-500 leading-relaxed">
              If you don't see your question here, email us at{" "}
              <a
                href="mailto:info@trymentiq.com"
                className="text-[#3B5BDB] hover:underline"
              >
                info@trymentiq.com
              </a>
            </p> */}
          </div>

          <div>
            <FaqItem
              question="How does Mentiq predict churn?"
              answer="Mentiq analyzes behavioral signals including feature usage patterns, session frequency, engagement drops, and billing events to assign each user a real-time risk score. Users above your configured threshold are flagged for intervention."
            />
            <FaqItem
              question="How long does it take to see results?"
              answer="Most teams see their first at-risk users identified within 24 hours of installing the SDK. Measurable churn reduction typically appears within 30–60 days of activating retention playbooks."
            />
            <FaqItem
              question="Does Mentiq integrate with Stripe?"
              answer="Yes. Mentiq connects directly to Stripe to pull MRR, subscription status, and billing events. It also integrates with Mailchimp, SendGrid, and Customer.io for automated email delivery."
            />
            <FaqItem
              question="What size SaaS companies use Mentiq?"
              answer="Mentiq is built for SaaS teams from early-stage ($5k MRR) through growth-stage ($500k MRR). It's particularly effective for teams that don't yet have a dedicated customer success function."
            />
            <FaqItem
              question="Is there a free trial?"
              answer="We're currently in early access. Waitlist members get 60 days free when they're invited. No credit card required to join the waitlist."
            />
            <FaqItem
              question="How is Mentiq different from Mixpanel or Amplitude?"
              answer="Mixpanel and Amplitude are general-purpose analytics tools. Mentiq is purpose-built for churn prevention — every feature, from risk scoring to playbooks, is designed specifically to help you retain paying subscribers."
            />
          </div>
        </div>
      </section>

      {/* ── WAITLIST CTA ────────────────────────────────────────────────── */}
      <section
        id="waitlist"
        className="bg-[#0F1117] py-24"
        aria-labelledby="waitlist-heading"
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-[#748FFC] uppercase tracking-widest mb-4">
            Early access
          </p>
          <h2
            id="waitlist-heading"
            className="text-[2.25rem] md:text-[3rem] leading-[1.1] tracking-tight text-white mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Join 4,200+ SaaS teams already on the waitlist.
          </h2>
          <p className="text-[1rem] text-slate-400 mb-10 leading-relaxed">
            Early access members get 60 days free, priority onboarding, and
            direct access to the founding team.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-3 bg-[#1A1D2E] border border-[#2A2D3E] rounded-xl px-6 py-4 text-white">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm">
                You're on the list — we'll be in touch soon.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleWaitlist}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              aria-label="Join the Mentiq waitlist"
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 bg-[#1A1D2E] border border-[#2A2D3E] text-white placeholder-slate-500 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-[#748FFC] transition-colors"
                aria-required="true"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#3B5BDB] disabled:opacity-50 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-[#3451C7] transition-colors whitespace-nowrap"
              >
                {loading ? "Joining..." : "Join waitlist"}
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-slate-500">
            No spam. No credit card. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="border-t border-slate-100 bg-[#FAFAF8]"
        role="contentinfo"
      >
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="block mb-4" aria-label="Mentiq home">
                <div className="relative h-30 w-36">
                  <Image
                    src="/logo.png"
                    alt="Mentiq"
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed">
                SaaS churn analytics and retention automation for growing
                subscription businesses.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest mb-4">
                Product
              </h3>
              <ul className="space-y-2.5" role="list">
                {[
                  ["Features", "#features"],
                  ["How it works", "#how-it-works"],
                  ["Integrations", "#features"],
                  ["Pricing", "/pricing"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest mb-4">
                Company
              </h3>
              <ul className="space-y-2.5" role="list">
                {[
                  ["About", "#"],
                  ["Blog", "#"],
                  ["Careers", "#"],
                  // ["Contact", "mailto:info@trymentiq.com"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-widest mb-4">
                Legal
              </h3>
              <ul className="space-y-2.5" role="list">
                {[
                  ["Privacy Policy", "#"],
                  ["Terms of Service", "#"],
                  ["Cookie Policy", "#"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Mentiq. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
