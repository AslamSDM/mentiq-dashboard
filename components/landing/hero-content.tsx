"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedDashboardMockup } from "./animated-dashboard-mockup";

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#E0E5F2] bg-[#F4F7FE] px-3 py-1.5">
      <span className="text-xs text-[#4363C7]">{label}</span>
      <span className="text-sm font-semibold text-[#2B3674]">{value}</span>
    </div>
  );
}

interface HeroContentProps {
  children: React.ReactNode;
}

export function HeroContent({ children }: HeroContentProps) {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Left Column - Content */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7 }}
        >
          <Badge
            variant="secondary"
            className="rounded-full border-[#E0E5F2] bg-[#F4F7FE] px-3 py-1 text-[#4363C7]"
          >
            Waitlist is open — early access invites
          </Badge>

          <h1 className="mt-5 font-sans text-4xl leading-[1.06] tracking-tight text-[#2B3674] sm:text-5xl">
            SaaS Churn Murderer.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2B3674] via-[#4318FF] to-[#2B3674]">
              See churn clearly
            </span>{" "}
            in minutes.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4363C7]">
            Complete customer retention software for SaaS with customer health scores, product usage analytics, and user analytics to prevent churn before it happens.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <StatPill label="Built-in" value="Cohorts + Replay" />
            <StatPill label="See" value="Channel churn" />
            <StatPill label="Run" value="Playbooks" />
          </div>
        </motion.div>

        {/* Waitlist Form Card */}
        <div className="mt-8" id="waitlist">
          <Card className="relative overflow-hidden rounded-2xl border-[#E0E5F2] bg-white/80 p-5 shadow-lg">
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-primary/35 to-purple-500/25 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-200/20 to-amber-200/25 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#2B3674]">
                    <Sparkles className="h-4 w-4 text-[#4363C7]" strokeWidth={1.75} />
                    Join the Mentiq waitlist
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[#4363C7]">
                    Quick form. We use this to prioritize early access and tailor onboarding (especially for founders).
                  </p>
                </div>
                <div className="hidden gap-2 sm:flex">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E0E5F2] bg-[#F4F7FE] px-3 py-1 text-xs text-[#4363C7]">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                    Privacy-first
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E0E5F2] bg-[#F4F7FE] px-3 py-1 text-xs text-[#4363C7]">
                    <Zap className="h-4 w-4" strokeWidth={1.75} />
                    Fast onboarding
                  </div>
                </div>
              </div>

              <div className="mt-5">
                {children}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-[#4363C7]">We only use this to prioritize access — not for marketing.</div>
                <div className="inline-flex items-center gap-2 text-xs text-[#4363C7]">
                  <Check className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
                  <span>4,200+ SaaS operators on the list</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Right Column - Animated Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative hidden lg:block"
      >
        <AnimatedDashboardMockup />
        <div
          className="pointer-events-none absolute -z-10 -bottom-10 left-8 right-8 h-20 rounded-full bg-gradient-to-r from-primary/25 via-purple-500/20 to-amber-500/25 blur-2xl"
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}
