"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/ui/animated-components";
import { motion, AnimatePresence } from "framer-motion";

// FAQ Data
const faqData = [
  {
    question: "What is SaaS churn?",
    answer: (
      <div className="space-y-4 text-[#4363C7] leading-relaxed">
        <p>
          SaaS churn refers to the percentage of customers who cancel or stop using a software-as-a-service product over a given period of time. It is one of the most important metrics for subscription-based businesses because even small increases in churn can significantly slow growth and reduce long-term revenue.
        </p>
        <p>There are two common types of SaaS churn:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong className="text-[#2B3674]">Customer churn</strong>, which measures how many customers leave</li>
          <li><strong className="text-[#2B3674]">Revenue churn</strong>, which measures how much recurring revenue is lost</li>
        </ul>
        <p>
          High SaaS churn often signals problems with product adoption, customer experience, onboarding, or perceived value. This is why modern SaaS companies rely on user behavior analytics and customer health scores to identify churn risk before customers cancel.
        </p>
      </div>
    ),
  },
  {
    question: "How do SaaS companies reduce churn?",
    answer: (
      <div className="space-y-4 text-[#4363C7] leading-relaxed">
        <p>
          SaaS companies reduce churn by proactively understanding how users interact with their product and intervening before disengagement turns into cancellation. The most effective churn reduction strategies include:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Tracking user behavior and feature adoption</li>
          <li>Identifying at-risk users using customer health scores</li>
          <li>Improving onboarding and time-to-value</li>
          <li>Triggering retention playbooks based on real usage data</li>
          <li>Continuously optimizing the product based on engagement patterns</li>
        </ul>
        <p>
          Instead of reacting after churn happens, high-performing SaaS companies use churn analytics software to predict churn early and take action while customers are still active. This shift from reactive to proactive retention is what separates high-retention SaaS businesses from stagnant ones.
        </p>
      </div>
    ),
  },
  {
    question: "What is a good churn rate for SaaS?",
    answer: (
      <div className="space-y-4 text-[#4363C7] leading-relaxed">
        <p>
          A good churn rate for SaaS depends on the business model, but benchmarks are well established.
        </p>
        <p>
          The average churn rate for SaaS is typically <strong className="text-[#2B3674]">10–14% annually</strong>. An annual churn rate of <strong className="text-primary">under 5%</strong> is widely considered the benchmark for a strong, healthy SaaS business. However, it&apos;s estimated that <strong className="text-[#2B3674]">60–70% of SaaS companies fail to hit this benchmark</strong>, meaning most subscription software businesses are losing customers faster than they should.
        </p>
        <p>
          This gap highlights why churn reduction is such a major growth lever. Even small improvements in churn can dramatically increase lifetime value, stabilize monthly recurring revenue, and compound growth over time.
        </p>
      </div>
    ),
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {faqData.map((faq, index) => (
        <FadeIn key={index} delay={0.1 * (index + 1)}>
          <div
            className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
              openIndex === index
                ? "border-primary/50 bg-white shadow-md"
                : "border-[#E0E5F2] bg-white hover:border-primary/30"
            }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-6 sm:p-8 flex items-center justify-between text-left"
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#2B3674] pr-4">
                {faq.question}
              </h3>
              <ChevronDown
                className={`h-5 w-5 sm:h-6 sm:w-6 text-primary transition-transform duration-300 shrink-0 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
