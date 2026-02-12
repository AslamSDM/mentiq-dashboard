"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Stars,
  Globe,
  Users,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  tag: string;
};

type ResultMetric = {
  label: string;
  value: string;
  detail: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, delay: 0.05 + i * 0.06 },
  }),
};

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5"
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <span
        className="text-xs text-black/55"
        data-testid={`text-stat-label-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {label}
      </span>
      <span
        className="text-sm font-semibold text-black"
        data-testid={`text-stat-value-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {value}
      </span>
    </div>
  );
}

function ResultCard({
  metric,
  index,
}: {
  metric: ResultMetric;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={index}
      className="h-full"
    >
      <Card
        className="relative h-full overflow-hidden rounded-2xl border-black/10 bg-white/70 p-6 shadow-soft"
        data-testid={`card-result-${index}`}
      >
        <div className="absolute -top-12 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-fuchsia-300/25 to-sky-300/20 blur-2xl" />
        <div className="absolute -bottom-14 -left-12 h-36 w-36 rounded-full bg-gradient-to-br from-sky-200/18 to-amber-200/20 blur-2xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div
              className="text-xs font-medium text-black/55"
              data-testid={`text-result-label-${index}`}
            >
              {metric.label}
            </div>
            <div
              className="mt-2 font-sans text-3xl tracking-tight text-black"
              data-testid={`text-result-value-${index}`}
            >
              {metric.value}
            </div>
          </div>
          <div
            className="rounded-xl border border-black/10 bg-black/[0.03] p-2"
            aria-hidden="true"
          >
            <TrendingUp className="h-5 w-5 text-black/70" strokeWidth={1.75} />
          </div>
        </div>

        <p
          className="relative mt-3 text-sm leading-relaxed text-black/65"
          data-testid={`text-result-detail-${index}`}
        >
          {metric.detail}
        </p>
      </Card>
    </motion.div>
  );
}

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={index}
      className="h-full"
    >
      <Card
        className="group relative h-full overflow-hidden rounded-2xl border-black/10 bg-white/70 p-6 shadow-soft"
        data-testid={`card-testimonial-${index}`}
      >
        <div className="absolute -top-16 right-6 h-44 w-44 rounded-full bg-gradient-to-br from-fuchsia-300/16 to-sky-300/14 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-gradient-to-br from-sky-200/12 to-amber-200/14 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div
              className="flex items-center gap-2"
              data-testid={`row-testimonial-meta-${index}`}
            >
              <div
                className="text-sm font-semibold text-black"
                data-testid={`text-testimonial-name-${index}`}
              >
                {t.name}
              </div>
              <Badge
                className="rounded-full border-black/10 bg-black/[0.03] text-black/70"
                data-testid={`badge-testimonial-tag-${index}`}
              >
                {t.tag}
              </Badge>
            </div>
            <div
              className="mt-1 text-xs text-black/55"
              data-testid={`text-testimonial-role-${index}`}
            >
              {t.role} · {t.company}
            </div>
          </div>

          <div
            className="rounded-xl border border-black/10 bg-black/[0.03] p-2"
            aria-hidden="true"
          >
            <Stars className="h-5 w-5 text-black/70" strokeWidth={1.75} />
          </div>
        </div>

        <p
          className="relative mt-5 text-sm leading-relaxed text-black/70"
          data-testid={`text-testimonial-quote-${index}`}
        >
          &ldquo;{t.quote}&rdquo;
        </p>

        <div
          className="relative mt-5 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3"
          data-testid={`box-testimonial-metric-${index}`}
        >
          <div
            className="text-xs text-black/55"
            data-testid={`text-testimonial-metric-label-${index}`}
          >
            Reported result
          </div>
          <div
            className="mt-1 font-sans text-lg tracking-tight text-black"
            data-testid={`text-testimonial-metric-${index}`}
          >
            {t.metric}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function FieldRow({
  icon,
  label,
  children,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <div className="grid gap-2" data-testid={testId}>
      <div className="flex items-center gap-2 text-xs font-medium text-black/60">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-black/10 bg-black/[0.03]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span data-testid={`${testId}-label`}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [paidUsers, setPaidUsers] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function normalizeUrl(raw: string) {
    const t = raw.trim();
    if (!t) return "";
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    return `https://${t}`;
  }

  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    const n = fullName.trim();
    const w = normalizeUrl(companyWebsite);
    const em = email.trim();
    const p = paidUsers.trim();

    if (!n) {
      toast({
        title: "Add your full name",
        description: "This helps us personalize your invite.",
      });
      return;
    }
    if (!em || !em.includes("@")) {
      toast({
        title: "Add a valid email",
        description: "We'll use it only to invite you.",
      });
      return;
    }
    const paid = Number(p.replace(/,/g, ""));
    if (!p || Number.isNaN(paid) || paid < 0) {
      toast({
        title: "Add paid users",
        description: "Enter a number (you can estimate).",
      });
      return;
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: n,
          email: em,
          company: w,
          user_count: paid,
          source: "landing_page",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast({
          title: "You're on the waitlist",
          description: "We'll reach out when Mentiq opens early access.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join waitlist",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  }

  const results: ResultMetric[] = useMemo(
    () => [
      {
        label: "Churn awareness",
        value: "Know what changed",
        detail:
          "See churn risk, the drivers behind it, and what shifted week-to-week in plain language.",
      },
      {
        label: "Retention cohorts",
        value: "Spot drops early",
        detail:
          "Cohorts make adoption changes obvious so you can intervene before renewal pressure hits.",
      },
      {
        label: "Churn by channel",
        value: "See where it leaks",
        detail:
          "Break churn down by acquisition channel to understand which sources retain (and which don't).",
      },
      {
        label: "Growth playbooks",
        value: "Repeatable actions",
        detail:
          "Turn insights into simple playbooks your team can run — no guesswork.",
      },
    ],
    [],
  );

  const testimonials: Testimonial[] = useMemo(
    () => [
      {
        name: "Ava R.",
        role: "Head of CS",
        company: "B2B SaaS",
        quote:
          "Retention Cohorts made it obvious where onboarding was breaking. We fixed the drop and the churn story finally made sense.",
        metric: "Cohort drop identified in 1 day",
        tag: "Cohorts",
      },
      {
        name: "Jordan K.",
        role: "Revenue Ops",
        company: "PLG SaaS",
        quote:
          "Churn by Channel helped us stop arguing about acquisition quality. The data made the decision for us.",
        metric: "Channel mix adjusted in 1 week",
        tag: "Channels",
      },
      {
        name: "Maya S.",
        role: "Customer Success Manager",
        company: "Startup",
        quote:
          "Growth Playbooks gave us a repeatable way to respond — we didn't need a custom dashboard or analyst time.",
        metric: "Playbook adopted by CS team",
        tag: "Playbooks",
      },
      {
        name: "Chris T.",
        role: "VP Growth",
        company: "Mid-market SaaS",
        quote:
          "We used Feature Tracking + Session Replay to connect 'what users did' with churn risk. That link was missing before.",
        metric: "Top friction path documented",
        tag: "Replay",
      },
      {
        name: "Noah L.",
        role: "Founder",
        company: "Subscription SaaS",
        quote:
          "Churn Awareness gave me a calm weekly view: what changed, who's at risk, and what to try next.",
        metric: "Weekly review in 10 minutes",
        tag: "Awareness",
      },
      {
        name: "Sofia P.",
        role: "CS Ops",
        company: "Enterprise SaaS",
        quote:
          "Revenue Analytics helped us separate churn impact from noise. Leadership finally aligned on the same numbers.",
        metric: "One source of truth",
        tag: "Revenue",
      },
    ],
    [],
  );

  const slogan = "SaaS Churn Murderer";

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white" />
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-32 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-300/30 via-sky-300/25 to-amber-200/30 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-black/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-32">
              <Image
                src="/logo.png"
                alt="Mentiq"
                fill
                className="object-cover h-30 w-40"
                priority
              />
            </div>
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex"
            data-testid="nav-top"
          >
            <a
              href="#results"
              className="text-sm text-black/60 transition-colors hover:text-black"
              data-testid="link-results"
            >
              Results
            </a>
            <a
              href="#testimonials"
              className="text-sm text-black/60 transition-colors hover:text-black"
              data-testid="link-testimonials"
            >
              Testimonials
            </a>
            <a
              href="#how"
              className="text-sm text-black/60 transition-colors hover:text-black"
              data-testid="link-how"
            >
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signin" className="hidden md:inline-flex">
              <Button
                variant="secondary"
                className="rounded-full border border-black/10 bg-black/[0.03] text-black/80 hover:bg-black/[0.06]"
                data-testid="button-sign-in"
              >
                Sign in
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a
              href="#waitlist"
              className="inline-flex"
              data-testid="link-join-waitlist"
            >
              <Button
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-join-waitlist"
              >
                Join waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-6 pt-10 md:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7 }}
              >
                <Badge
                  className="rounded-full border-black/10 bg-black/[0.03] px-3 py-1 text-black/70"
                  data-testid="badge-waitlist"
                >
                  Waitlist is open — early access invites
                </Badge>

                <h1
                  className="mt-5 font-sans text-4xl leading-[1.06] tracking-tight text-black sm:text-5xl"
                  data-testid="text-hero-title"
                >
                  <span className="text-gradient-animated">{slogan}</span>.
                  Clear Results in Minutes.
                </h1>

                <p
                  className="mt-5 max-w-xl text-base leading-relaxed text-black/70"
                  data-testid="text-hero-subtitle"
                >
                  Complete customer retention software for SaaS with customer
                  health scores, product usage analytics, and user analytics to
                  prevent churn before it happens.
                </p>

                <div
                  className="mt-7 flex flex-wrap gap-2"
                  data-testid="row-hero-stats"
                >
                  <StatPill label="Built-in" value="Cohorts + Replay" />
                  <StatPill label="See" value="Channel churn" />
                  <StatPill label="Run" value="Playbooks" />
                </div>
              </motion.div>

              <div className="mt-8" id="waitlist">
                <Card
                  className="relative overflow-hidden rounded-2xl border-black/10 bg-white/70 p-5 shadow-soft"
                  data-testid="card-waitlist"
                >
                  <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-fuchsia-300/35 to-sky-300/25 blur-3xl" />
                  <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-sky-200/20 to-amber-200/25 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div
                          className="flex items-center gap-2 text-sm font-medium text-black"
                          data-testid="text-waitlist-title"
                        >
                          <Sparkles
                            className="h-4 w-4 text-black/70"
                            strokeWidth={1.75}
                          />
                          Join the Mentiq waitlist
                        </div>
                        <p
                          className="mt-1 text-sm leading-relaxed text-black/65"
                          data-testid="text-waitlist-subtitle"
                        >
                          Quick form. We use this to prioritize early access and
                          tailor onboarding (especially for founders).
                        </p>
                      </div>
                      <div
                        className="hidden gap-2 sm:flex"
                        data-testid="row-waitlist-trust"
                      >
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-black/60">
                          <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                          Privacy-first
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-black/60">
                          <Zap className="h-4 w-4" strokeWidth={1.75} />
                          Fast onboarding
                        </div>
                      </div>
                    </div>

                    <form onSubmit={submitWaitlist} className="mt-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldRow
                          icon={
                            <User
                              className="h-4 w-4 text-black/70"
                              strokeWidth={1.75}
                            />
                          }
                          label="Full name"
                          testId="field-full-name"
                        >
                          <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Alex Morgan"
                            className="h-12 rounded-xl border-black/10 bg-white text-black placeholder:text-black/35"
                            data-testid="input-full-name"
                            autoComplete="name"
                          />
                        </FieldRow>

                        <FieldRow
                          icon={
                            <Mail
                              className="h-4 w-4 text-black/70"
                              strokeWidth={1.75}
                            />
                          }
                          label="Work email"
                          testId="field-email"
                        >
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@company.com"
                            className="h-12 rounded-xl border-black/10 bg-white text-black placeholder:text-black/35"
                            data-testid="input-waitlist-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                          />
                        </FieldRow>

                        <FieldRow
                          icon={
                            <Globe
                              className="h-4 w-4 text-black/70"
                              strokeWidth={1.75}
                            />
                          }
                          label="Company website"
                          testId="field-company-website"
                        >
                          <Input
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                            placeholder="yourcompany.com"
                            className="h-12 rounded-xl border-black/10 bg-white text-black placeholder:text-black/35"
                            data-testid="input-company-website"
                            autoComplete="url"
                          />
                        </FieldRow>

                        <FieldRow
                          icon={
                            <Users
                              className="h-4 w-4 text-black/70"
                              strokeWidth={1.75}
                            />
                          }
                          label="Paid users"
                          testId="field-paid-users"
                        >
                          <Input
                            value={paidUsers}
                            onChange={(e) => setPaidUsers(e.target.value)}
                            placeholder="e.g. 1200"
                            className="h-12 rounded-xl border-black/10 bg-white text-black placeholder:text-black/35"
                            data-testid="input-paid-users"
                            inputMode="numeric"
                          />
                        </FieldRow>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          type="submit"
                          className="h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                          data-testid="button-waitlist-submit"
                        >
                          {submitted ? "Added" : "Request invite"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <div className="flex flex-col gap-2 text-xs text-black/55 sm:items-end">
                          <div data-testid="text-waitlist-note">
                            We only use this to prioritize access — not for
                            marketing.
                          </div>
                          <div
                            className="inline-flex items-center gap-2"
                            data-testid="row-waitlist-proof"
                          >
                            <Check
                              className="h-4 w-4 text-black/60"
                              strokeWidth={1.75}
                            />
                            <span data-testid="text-waitlist-proof">
                              4,200+ SaaS operators on the list
                            </span>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative"
            >
              <Card
                className="relative overflow-hidden rounded-3xl border-black/10 bg-white/70 p-6 shadow-soft"
                data-testid="card-hero-panel"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] to-transparent" />
                <div className="relative">
                  <div
                    className="flex items-center justify-between"
                    data-testid="row-hero-panel-header"
                  >
                    <div>
                      <div
                        className="text-xs font-medium text-black/55"
                        data-testid="text-panel-kicker"
                      >
                        Your data, simplified
                      </div>
                      <div
                        className="mt-1 font-sans text-2xl tracking-tight text-black"
                        data-testid="text-panel-title"
                      >
                        What&apos;s happening — and what to do next
                      </div>
                    </div>
                    <div
                      className="rounded-xl border border-black/10 bg-black/[0.03] p-2"
                      aria-hidden="true"
                    >
                      <Zap
                        className="h-5 w-5 text-black/70"
                        strokeWidth={1.75}
                      />
                    </div>
                  </div>

                  <Separator className="my-5 bg-black/10" />

                  <div className="grid gap-3" data-testid="grid-panel-metrics">
                    <div
                      className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                      data-testid="card-panel-metric-0"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="text-xs text-black/55"
                          data-testid="text-panel-metric-label-0"
                        >
                          At-risk accounts
                        </div>
                        <div
                          className="text-xs text-emerald-700"
                          data-testid="text-panel-metric-delta-0"
                        >
                          42
                        </div>
                      </div>
                      <div
                        className="mt-2 text-sm text-black/70"
                        data-testid="text-panel-metric-desc-0"
                      >
                        Usage drop + billing friction pattern.
                      </div>
                    </div>

                    <div
                      className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                      data-testid="card-panel-metric-1"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="text-xs text-black/55"
                          data-testid="text-panel-metric-label-1"
                        >
                          Save priority
                        </div>
                        <div
                          className="text-xs text-emerald-700"
                          data-testid="text-panel-metric-delta-1"
                        >
                          High
                        </div>
                      </div>
                      <div
                        className="mt-2 text-sm text-black/70"
                        data-testid="text-panel-metric-desc-1"
                      >
                        Segment: 10–50 seats · expansion likely.
                      </div>
                    </div>

                    <div
                      className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                      data-testid="card-panel-metric-2"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="text-xs text-black/55"
                          data-testid="text-panel-metric-label-2"
                        >
                          Next best action
                        </div>
                        <div
                          className="text-xs text-emerald-700"
                          data-testid="text-panel-metric-delta-2"
                        >
                          Playbook
                        </div>
                      </div>
                      <div
                        className="mt-2 text-sm text-black/70"
                        data-testid="text-panel-metric-desc-2"
                      >
                        Trigger outreach before renewal window.
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-5 rounded-2xl border border-black/10 bg-gradient-to-r from-black/[0.03] to-black/[0.02] p-4"
                    data-testid="card-panel-insight"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 rounded-xl border border-black/10 bg-black/[0.03] p-2"
                        aria-hidden="true"
                      >
                        <Sparkles
                          className="h-5 w-5 text-black/70"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <div
                          className="text-xs font-medium text-black/60"
                          data-testid="text-panel-insight-title"
                        >
                          Plain-English takeaway
                        </div>
                        <div
                          className="mt-1 text-sm leading-relaxed text-black/70"
                          data-testid="text-panel-insight-body"
                        >
                          One page shows: who&apos;s slipping, what changed, and
                          the next best playbook.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-5 flex items-center justify-between"
                    data-testid="row-panel-footer"
                  >
                    <div
                      className="text-xs text-black/45"
                      data-testid="text-panel-footer-left"
                    >
                      Updated Sunday · 7-day snapshot
                    </div>
                    <div
                      className="inline-flex items-center gap-1 text-xs text-black/55"
                      data-testid="text-panel-footer-right"
                    >
                      View full report
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Card>

              <div
                className="pointer-events-none absolute -z-10 -bottom-10 left-8 right-8 h-20 rounded-full bg-gradient-to-r from-fuchsia-300/25 via-sky-300/20 to-amber-200/25 blur-2xl"
                aria-hidden="true"
              />
            </motion.div>
          </div>
        </section>

        <section id="results" className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div
                  className="text-xs font-medium uppercase tracking-[0.22em] text-black/45"
                  data-testid="text-results-kicker"
                >
                  Results
                </div>
                <h2
                  className="mt-3 font-sans text-3xl tracking-tight text-black md:text-4xl"
                  data-testid="text-results-title"
                >
                  Understand your churn at a glance.
                </h2>
                <p
                  className="mt-3 max-w-2xl text-sm leading-relaxed text-black/65"
                  data-testid="text-results-subtitle"
                >
                  Everything below maps directly to what&apos;s in the product
                  today: cohorts, churn views, playbooks, and revenue context.
                </p>
              </div>
              <div
                className="flex items-center gap-2"
                data-testid="row-results-badges"
              >
                <Badge
                  className="rounded-full border-black/10 bg-black/[0.03] text-black/70"
                  data-testid="badge-results-1"
                >
                  Plain-English insights
                </Badge>
                <Badge
                  className="rounded-full border-black/10 bg-black/[0.03] text-black/70"
                  data-testid="badge-results-2"
                >
                  Actionable playbooks
                </Badge>
              </div>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {results.map((m, i) => (
              <ResultCard key={i} metric={m} index={i} />
            ))}
          </div>
        </section>

        <section
          id="testimonials"
          className="mx-auto max-w-6xl px-6 pt-16 md:pt-24"
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div
                  className="text-xs font-medium uppercase tracking-[0.22em] text-black/45"
                  data-testid="text-testimonials-kicker"
                >
                  Testimonials
                </div>
                <h2
                  className="mt-3 font-sans text-3xl tracking-tight text-black md:text-4xl"
                  data-testid="text-testimonials-title"
                >
                  Built for teams — and founders.
                </h2>
                <p
                  className="mt-3 max-w-2xl text-sm leading-relaxed text-black/65"
                  data-testid="text-testimonials-subtitle"
                >
                  Less churn, faster saves, and a clearer story you can share
                  with anyone.
                </p>
              </div>
              <div
                className="flex items-center gap-2"
                data-testid="row-testimonials-badges"
              >
                <Badge
                  className="rounded-full border-black/10 bg-black/[0.03] text-black/70"
                  data-testid="badge-testimonials-1"
                >
                  Easy to adopt
                </Badge>
                <Badge
                  className="rounded-full border-black/10 bg-black/[0.03] text-black/70"
                  data-testid="badge-testimonials-2"
                >
                  Clear outcomes
                </Badge>
              </div>
            </div>
          </motion.div>

          <div
            className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            data-testid="grid-testimonials"
          >
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} index={i} />
            ))}
          </div>
        </section>

        <section
          id="how"
          className="mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-24 md:pb-24"
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div
                  className="text-xs font-medium uppercase tracking-[0.22em] text-black/45"
                  data-testid="text-how-kicker"
                >
                  How it works
                </div>
                <h2
                  className="mt-3 font-sans text-3xl tracking-tight text-black md:text-4xl"
                  data-testid="text-how-title"
                >
                  Understand. Decide. Act.
                </h2>
                <p
                  className="mt-3 max-w-2xl text-sm leading-relaxed text-black/65"
                  data-testid="text-how-subtitle"
                >
                  A clean workflow that turns messy product + billing signals
                  into clear next steps your whole team can execute.
                </p>
              </div>
              <a
                href="#waitlist"
                className="text-sm text-black/60 hover:text-black"
                data-testid="link-how-cta"
              >
                Join waitlist <ChevronRight className="inline h-4 w-4" />
              </a>
            </div>
          </motion.div>

          <div
            className="mt-8 grid gap-4 md:grid-cols-3"
            data-testid="grid-how"
          >
            <Card
              className="rounded-2xl border-black/10 bg-white/70 p-6 shadow-soft"
              data-testid="card-how-0"
            >
              <div
                className="flex items-start justify-between gap-3"
                data-testid="row-how-0"
              >
                <div>
                  <div
                    className="text-sm font-semibold text-black"
                    data-testid="text-how-title-0"
                  >
                    Detect churn signals
                  </div>
                  <p
                    className="mt-2 text-sm leading-relaxed text-black/65"
                    data-testid="text-how-body-0"
                  >
                    Behavior-based risk signals that your team can explain — not
                    a black box score.
                  </p>
                </div>
                <div
                  className="rounded-xl border border-black/10 bg-black/[0.03] p-2"
                  aria-hidden="true"
                >
                  <TrendingUp
                    className="h-5 w-5 text-black/70"
                    strokeWidth={1.75}
                  />
                </div>
              </div>
            </Card>

            <Card
              className="rounded-2xl border-black/10 bg-white/70 p-6 shadow-soft"
              data-testid="card-how-1"
            >
              <div
                className="flex items-start justify-between gap-3"
                data-testid="row-how-1"
              >
                <div>
                  <div
                    className="text-sm font-semibold text-black"
                    data-testid="text-how-title-1"
                  >
                    Prioritize the right accounts
                  </div>
                  <p
                    className="mt-2 text-sm leading-relaxed text-black/65"
                    data-testid="text-how-body-1"
                  >
                    Segment by renewal window, seats, expansion likelihood, and
                    change-of-behavior patterns.
                  </p>
                </div>
                <div
                  className="rounded-xl border border-black/10 bg-black/[0.03] p-2"
                  aria-hidden="true"
                >
                  <Users className="h-5 w-5 text-black/70" strokeWidth={1.75} />
                </div>
              </div>
            </Card>

            <Card
              className="rounded-2xl border-black/10 bg-white/70 p-6 shadow-soft"
              data-testid="card-how-2"
            >
              <div
                className="flex items-start justify-between gap-3"
                data-testid="row-how-2"
              >
                <div>
                  <div
                    className="text-sm font-semibold text-black"
                    data-testid="text-how-title-2"
                  >
                    Execute save playbooks
                  </div>
                  <p
                    className="mt-2 text-sm leading-relaxed text-black/65"
                    data-testid="text-how-body-2"
                  >
                    Triggered workflows: onboarding rescue, adoption nudges,
                    pricing friction, champion loss, and more.
                  </p>
                </div>
                <div
                  className="rounded-xl border border-black/10 bg-black/[0.03] p-2"
                  aria-hidden="true"
                >
                  <ShieldCheck
                    className="h-5 w-5 text-black/70"
                    strokeWidth={1.75}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div
            className="mt-10 rounded-3xl border border-black/10 bg-white/70 p-7 shadow-soft"
            data-testid="card-bottom-cta"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div
                  className="font-sans text-2xl tracking-tight text-black"
                  data-testid="text-bottom-cta-title"
                >
                  Get invited to Mentiq
                </div>
                <p
                  className="mt-2 max-w-xl text-sm leading-relaxed text-black/65"
                  data-testid="text-bottom-cta-subtitle"
                >
                  Join the waitlist and tell us your paid users count —
                  we&apos;ll prioritize teams with urgent retention needs.
                </p>
              </div>
              <a href="#waitlist" data-testid="link-bottom-cta">
                <Button
                  className="h-12 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                  data-testid="button-bottom-cta"
                >
                  Join waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          <footer
            className="mt-14 border-t border-black/10 pt-8"
            data-testid="footer"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div
                className="text-sm text-black/60"
                data-testid="text-footer-brand"
              >
                © {new Date().getFullYear()} Mentiq
              </div>
              <div
                className="flex items-center gap-4 text-sm"
                data-testid="row-footer-links"
              >
                <Link
                  href="/docs/Privacy Policy MENTIQ.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/60 hover:text-black"
                  data-testid="button-footer-privacy"
                >
                  Privacy
                </Link>
                <button
                  className="text-black/60 hover:text-black"
                  onClick={() =>
                    toast({
                      title: "Contact",
                      description:
                        "This is a mockup. Add your contact email when ready.",
                    })
                  }
                  data-testid="button-footer-contact"
                >
                  Contact
                </button>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
