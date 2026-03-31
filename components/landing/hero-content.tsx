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
    <div className="flex items-center gap-2 rounded-full border border-[#E7E5E4] bg-[#F8F7F4] px-3 py-1.5">
      <span className="text-xs text-[#78716C]">{label}</span>
      <span className="text-sm font-semibold text-[#1C1917]">{value}</span>
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
            className="rounded-full border-[#E7E5E4] bg-[#F8F7F4] px-3 py-1 text-[#78716C]"
          >
            Waitlist is open — early access invites
          </Badge>

          <h1 className="mt-5 font-sans text-4xl leading-[1.06] tracking-tight text-[#1C1917] sm:text-5xl">
            SaaS Churn Murderer.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1C1917] via-[#2563EB] to-[#1C1917]">
              See churn clearly
            </span>{" "}
            in minutes.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#78716C]">
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
          <Card className="relative overflow-hidden rounded-2xl border-[#E7E5E4] bg-white/80 p-5 shadow-lg">
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-primary/35 to-purple-500/25 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-200/20 to-amber-200/25 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1C1917]">
                    <Sparkles className="h-4 w-4 text-[#78716C]" strokeWidth={1.75} />
                    Join the Mentiq waitlist
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[#78716C]">
                    Quick form. We use this to prioritize early access and tailor onboarding (especially for founders).
                  </p>
                </div>
                <div className="hidden gap-2 sm:flex">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E5E4] bg-[#F8F7F4] px-3 py-1 text-xs text-[#78716C]">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                    Privacy-first
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E5E4] bg-[#F8F7F4] px-3 py-1 text-xs text-[#78716C]">
                    <Zap className="h-4 w-4" strokeWidth={1.75} />
                    Fast onboarding
                  </div>
                </div>
              </div>

              <div className="mt-5">
                {children}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-[#78716C]">We only use this to prioritize access — not for marketing.</div>
                <div className="inline-flex items-center gap-2 text-xs text-[#78716C]">
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
