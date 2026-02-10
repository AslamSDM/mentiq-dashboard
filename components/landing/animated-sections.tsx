"use client";

import { motion } from "framer-motion";
import { TrendingUp, Stars } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  tag: string;
}

interface ResultMetric {
  label: string;
  value: string;
  detail: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, delay: 0.05 + i * 0.06 },
  }),
};

const testimonials: Testimonial[] = [
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
];

const results: ResultMetric[] = [
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
];

function ResultCard({ metric, index }: { metric: ResultMetric; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={index}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden rounded-2xl border-[#E0E5F2] bg-white/80 p-6 shadow-lg">
        <div className="absolute -top-12 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/25 to-purple-500/20 blur-2xl" />
        <div className="absolute -bottom-14 -left-12 h-36 w-36 rounded-full bg-gradient-to-br from-blue-200/18 to-amber-200/20 blur-2xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-[#4363C7]">{metric.label}</div>
            <div className="mt-2 font-sans text-2xl tracking-tight text-[#2B3674]">
              {metric.value}
            </div>
          </div>
          <div className="rounded-xl border border-[#E0E5F2] bg-[#F4F7FE] p-2">
            <TrendingUp className="h-5 w-5 text-[#4363C7]" strokeWidth={1.75} />
          </div>
        </div>

        <p className="relative mt-3 text-sm leading-relaxed text-[#4363C7]">
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
      <Card className="group relative h-full overflow-hidden rounded-2xl border-[#E0E5F2] bg-white/80 p-6 shadow-lg">
        <div className="absolute -top-16 right-6 h-44 w-44 rounded-full bg-gradient-to-br from-primary/16 to-purple-500/14 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-gradient-to-br from-blue-200/12 to-amber-200/14 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-[#2B3674]">{t.name}</div>
              <Badge
                variant="secondary"
                className="rounded-full border-[#E0E5F2] bg-[#F4F7FE] text-[#4363C7]"
              >
                {t.tag}
              </Badge>
            </div>
            <div className="mt-1 text-xs text-[#4363C7]">
              {t.role} · {t.company}
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E5F2] bg-[#F4F7FE] p-2">
            <Stars className="h-5 w-5 text-[#4363C7]" strokeWidth={1.75} />
          </div>
        </div>

        <p className="relative mt-5 text-sm leading-relaxed text-[#2B3674]">
          &ldquo;{t.quote}&rdquo;
        </p>

        <div className="relative mt-5 rounded-xl border border-[#E0E5F2] bg-[#F4F7FE] px-4 py-3">
          <div className="text-xs text-[#4363C7]">Reported result</div>
          <div className="mt-1 font-sans text-base tracking-tight text-[#2B3674]">
            {t.metric}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function ResultsSection() {
  return (
    <section id="results" className="container mx-auto max-w-6xl px-6 pt-16 md:pt-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        custom={0}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#4363C7]">
              Results
            </div>
            <h2 className="mt-3 font-sans text-3xl tracking-tight text-[#2B3674] md:text-4xl">
              Understand your churn at a glance.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4363C7]">
              Everything below maps directly to what&apos;s in the product today: cohorts, churn views, playbooks, and revenue context.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full border-[#E0E5F2] bg-[#F4F7FE] text-[#4363C7]">
              Plain-English insights
            </Badge>
            <Badge variant="secondary" className="rounded-full border-[#E0E5F2] bg-[#F4F7FE] text-[#4363C7]">
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
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="container mx-auto max-w-6xl px-6 pt-16 md:pt-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        custom={0}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#4363C7]">
              Testimonials
            </div>
            <h2 className="mt-3 font-sans text-3xl tracking-tight text-[#2B3674] md:text-4xl">
              Built for teams — and founders.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4363C7]">
              Less churn, faster saves, and a clearer story you can share with anyone.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full border-[#E0E5F2] bg-[#F4F7FE] text-[#4363C7]">
              Easy to adopt
            </Badge>
            <Badge variant="secondary" className="rounded-full border-[#E0E5F2] bg-[#F4F7FE] text-[#4363C7]">
              Clear outcomes
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} t={t} index={i} />
        ))}
      </div>
    </section>
  );
}

export function HowItWorksHeader() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={0}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#4363C7]">
            How it works
          </div>
          <h2 className="mt-3 font-sans text-3xl tracking-tight text-[#2B3674] md:text-4xl">
            Understand. Decide. Act.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4363C7]">
            A clean workflow that turns messy product + billing signals into clear next steps your whole team can execute.
          </p>
        </div>
        <a href="#waitlist" className="text-sm text-[#4363C7] hover:text-[#2B3674] inline-flex items-center gap-1">
          Join waitlist 
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
