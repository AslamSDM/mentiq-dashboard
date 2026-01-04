"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/ui/animated-components";

const revealItems = [
  "Real adoption depth per user",
  "Users who are slipping away",
  "Features that drive retention",
  "Actions that trigger upgrades",
];

export function HowItWorksSection() {
  return (
    <div className="space-y-10">
      <FadeIn delay={0.2} direction="right">
        <div className="flex gap-6 group">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] group-hover:scale-110 transition-transform duration-300">
            1
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 text-[#2B3674]">
              We map your product
            </h3>
            <p className="text-[#4363C7] text-lg">
              We automatically identify every feature, button, and page
              in your app.
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.4} direction="right">
        <div className="flex gap-6 group">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] group-hover:scale-110 transition-transform duration-300">
            2
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 text-[#2B3674]">
              We track user journeys
            </h3>
            <p className="text-[#4363C7] text-lg">
              We monitor how every single user interacts with your
              features in real-time.
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.6} direction="right">
        <div className="flex gap-6 group">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] group-hover:scale-110 transition-transform duration-300">
            3
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 text-[#2B3674]">
              Then we reveal:
            </h3>
            <ul className="space-y-4 text-[#4363C7]">
              {revealItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E0E5F2] hover:border-primary/30 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-medium text-[#2B3674]">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
