// Pricing tiers configuration
export const PRICING_TIERS = [
  {
    id: "starter",
    name: "Starter",
    basePrice: 59,
    trialDays: 3,
    description: "Perfect for startups getting started",
    included: {
      paidUsers: 500,
      sessionReplays: 250,
      automatedEmails: 10_000,
      aiGenerations: 50,
      teamMembers: 3,
    },
    overages: {
      paidUsersPer100: 12_00, // $12 in cents
      replaysPer500: 7_00,
      emailsPer10k: 3_00,
      aiGenerationsPer100: 5_00,
    },
    features: [
      "500 paid users",
      "250 session replays",
      "10,000 automated emails",
      "50 AI generations",
      "3 team members",
      "Core analytics dashboard",
      "Session replay",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    basePrice: 149,
    trialDays: 3,
    description: "For growing teams finding PMF",
    included: {
      paidUsers: 2_000,
      sessionReplays: 700,
      automatedEmails: 50_000,
      aiGenerations: 200,
      teamMembers: 10,
    },
    overages: {
      paidUsersPer100: 10_00,
      replaysPer500: 6_00,
      emailsPer10k: 3_00,
      aiGenerationsPer100: 4_00,
    },
    features: [
      "2,000 paid users",
      "700 session replays",
      "50,000 automated emails",
      "200 AI generations",
      "10 team members",
      "Advanced analytics",
      "Retention & churn analysis",
      "Feature adoption tracking",
      "Priority email support",
    ],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    basePrice: 399,
    trialDays: 14,
    description: "No ceiling. Built for rapid expansion",
    included: {
      paidUsers: 7_500,
      sessionReplays: 2_000,
      automatedEmails: 200_000,
      aiGenerations: 600,
      teamMembers: 0, // unlimited
    },
    overages: {
      paidUsersPer100: 8_00,
      replaysPer500: 5_00,
      emailsPer10k: 2_00,
      aiGenerationsPer100: 3_00,
    },
    features: [
      "7,500 paid users",
      "2,000 session replays",
      "200,000 automated emails",
      "600 AI generations",
      "Unlimited team members",
      "A/B testing & experiments",
      "Revenue analytics",
      "Advanced segmentation",
      "Predictive churn modeling",
      "Priority support (< 4hr response)",
      "SSO authentication",
    ],
  },
] as const;

export type PricingTier = (typeof PRICING_TIERS)[number];

export const getTierByUserCount = (userCount: number): PricingTier | null => {
  // Find the smallest tier that fits the user count
  for (const tier of PRICING_TIERS) {
    if (userCount <= tier.included.paidUsers) {
      return tier;
    }
  }
  // Over Scale tier — still use Scale (overages apply)
  return PRICING_TIERS[PRICING_TIERS.length - 1];
};

export const getTierById = (id: string): PricingTier | null => {
  return PRICING_TIERS.find((tier) => tier.id === id) || null;
};
