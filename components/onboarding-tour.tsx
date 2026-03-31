"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStep {
  title: string;
  description: string;
  sidebarItem: string; // name from navigation array to highlight
}

const tourSteps: TourStep[] = [
  {
    title: "Overview",
    sidebarItem: "Overview",
    description:
      "This is your overall view to get a quick snapshot of what's going on. We've compiled all your major data into one place, to make it simple.",
  },
  {
    title: "Revenue Analytics",
    sidebarItem: "Revenue Analytics",
    description:
      "By connecting your Stripe, you get a full breakdown of your revenue. See where things are trending, and what can be optimized.",
  },
  {
    title: "Retention Cohorts",
    sidebarItem: "Retention Cohorts",
    description:
      "Breakdown your churn analytics into time-based cohorts to analyze patterns throughout the months.",
  },
  {
    title: "Churn Awareness",
    sidebarItem: "Churn Awareness",
    description:
      "Your breakdown of at-risk users who are most likely to churn based on behavioural patterns.",
  },
  {
    title: "Email Automations",
    sidebarItem: "Email Automations",
    description:
      "Create automated campaigns that trigger when a defined risk threshold is met. Set discount values, cooldown periods, and engagement or feature adoption triggers with full control over thresholds.",
  },
  {
    title: "Churn by Channel",
    sidebarItem: "Churn by Channel",
    description:
      "View churn rates and LTV by acquisition channel, including direct traffic, paid search, and social. Mentiq consolidates your data to show which channels drive the highest value and which require optimization.",
  },
  {
    title: "Session Replay",
    sidebarItem: "Session Replay",
    description:
      "See how users interact with your website. Access total sessions, average duration, sessions with issues, and conversion rates. View total clicks, average scroll depth, pages tracked, and interactive visualizations including click, scroll, and mouse movement heatmaps.",
  },
  {
    title: "Feature Tracking",
    sidebarItem: "Feature Tracking",
    description:
      "Measure feature adoption across your user base to identify underused or high-impact features. Analyze user flow, drop-off points, and time spent at each step to identify friction in your onboarding process.",
  },
];

const STORAGE_KEY = "mentiq_onboarding_tour_completed";

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Check if tour should show on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay to let sidebar render
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Find and highlight the current sidebar item
  useEffect(() => {
    if (!isActive) return;

    const step = tourSteps[currentStep];
    const sidebarLinks = document.querySelectorAll<HTMLAnchorElement>(
      "[data-tour-id]"
    );

    let targetEl: HTMLElement | null = null;
    sidebarLinks.forEach((link) => {
      if (link.getAttribute("data-tour-id") === step.sidebarItem) {
        targetEl = link;
      }
    });

    if (targetEl) {
      const rect = (targetEl as HTMLElement).getBoundingClientRect();
      setHighlightRect(rect);
      // Scroll sidebar item into view if needed
      (targetEl as HTMLElement).scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      setHighlightRect(null);
    }
  }, [isActive, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const handleSkip = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  // Position the tooltip to the right of the highlighted sidebar item
  const tooltipTop = highlightRect
    ? Math.min(
        Math.max(highlightRect.top + highlightRect.height / 2 - 100, 20),
        window.innerHeight - 340
      )
    : 200;
  const tooltipLeft = highlightRect
    ? highlightRect.right + 20
    : 310;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-[#1C1917]/40 backdrop-blur-[2px]"
            onClick={handleSkip}
          />

          {/* Highlight cutout on the sidebar item */}
          {highlightRect && (
            <motion.div
              key={`highlight-${currentStep}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed z-[9999] rounded-xl border-2 border-[#2563EB] pointer-events-none"
              style={{
                top: highlightRect.top - 4,
                left: highlightRect.left - 4,
                width: highlightRect.width + 8,
                height: highlightRect.height + 8,
                boxShadow:
                  "0 0 0 9999px rgba(43, 54, 116, 0.40), 0 0 20px rgba(67, 24, 255, 0.3)",
              }}
            />
          )}

          {/* Connector line from highlight to tooltip */}
          {highlightRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[10000] pointer-events-none"
              style={{
                top: highlightRect.top + highlightRect.height / 2 - 1,
                left: highlightRect.right + 4,
                width: 12,
                height: 2,
                background: "linear-gradient(90deg, #2563EB, #60A5FA)",
              }}
            />
          )}

          {/* Tooltip card */}
          <motion.div
            key={`tooltip-${currentStep}`}
            initial={{ opacity: 0, x: -16, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed z-[10000] w-[380px] max-w-[calc(100vw-340px)]"
            style={{ top: tooltipTop, left: tooltipLeft }}
          >
            <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(67,24,255,0.15)] border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white/90" />
                  <span className="text-white/80 text-xs font-medium tracking-wide uppercase">
                    Quick Tour
                  </span>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <h3 className="text-[#1C1917] font-bold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-[#78716C] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-[#F8F7F4] flex items-center justify-between border-t border-gray-100">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  {tourSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep
                          ? "w-6 bg-[#2563EB]"
                          : idx < currentStep
                          ? "w-1.5 bg-[#2563EB]/40"
                          : "w-1.5 bg-[#78716C]/20"
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-[#78716C] hover:text-[#1C1917] text-xs h-8 px-3"
                  >
                    Skip
                  </Button>

                  {currentStep > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrev}
                      className="text-[#78716C] hover:text-[#1C1917] h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-[#2563EB] hover:bg-[#3614CC] text-white text-xs h-8 px-4 rounded-lg"
                  >
                    {isLastStep ? "Done" : "Next"}
                    {!isLastStep && <ChevronRight className="h-3.5 w-3.5 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
