"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animated-components";

const comparisonData = [
  { other: "% of Active users", mentiq: "Real adoption depth" },
  {
    other: "Feature usage heatmap",
    mentiq: "Retention driven feature importance",
  },
  { other: "Churn %", mentiq: "Who will churn, when and why" },
  {
    other: "Cancellation surveys",
    mentiq: "Behaviour before cancellation",
  },
  {
    other: "Product analytics",
    mentiq: "Product + Behaviour + Churn insights",
  },
];

export function ComparisonTable() {
  return (
    <FadeIn
      delay={0.2}
      className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-[#E0E5F2] shadow-xl bg-white backdrop-blur-md"
    >
      <div className="grid grid-cols-2 bg-[#F4F7FE] p-4 sm:p-6 font-bold text-base sm:text-xl border-b border-[#E0E5F2]">
        <div className="text-[#4363C7] pl-4">Others show</div>
        <div className="text-primary pl-4">Mentiq Reveals</div>
      </div>

      {comparisonData.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className="grid grid-cols-2 p-4 sm:p-6 border-b border-[#E0E5F2] last:border-0 hover:bg-[#F4F7FE]/50 transition-colors group"
        >
          <div className="flex items-center gap-2 sm:gap-4 text-[#4363C7] group-hover:text-[#2B3674] transition-colors">
            <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-500/50 group-hover:text-red-500 transition-colors shrink-0" />
            <span className="text-sm sm:text-lg">{row.other}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 font-bold text-[#2B3674]">
            <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-primary group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(var(--primary),0.8)] shrink-0" />
            <span className="text-sm sm:text-lg">{row.mentiq}</span>
          </div>
        </motion.div>
      ))}
    </FadeIn>
  );
}
