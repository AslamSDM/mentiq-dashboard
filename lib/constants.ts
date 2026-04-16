// Pricing tiers configuration
export const PRICING_TIERS = [
  {
    id: "starter",
    name: "Starter",
    basePrice: 21,
    trialDays: 3,
    description: "Perfect for startups getting started",
    included: {
      paidUsers: 150,
      sessionReplays: 100,
      automatedEmails: 5_000,
      aiGenerations: 25,
      teamMembers: 1,
    },
    overages: {
      paidUsersPer100: 15_00, // $15 per 100 users
      replaysPer500: 10_00, // $10 per 500 replays
      emailsPer10k: 4_00, // $4 per 10k emails
      aiGenerationsPer100: 8_00, // $8 per 100 AI generations
      teamMembersPer1: 8_00, // $8 per extra team member
    },
    features: [
      "150 paid users",
      "100 session replays",
      "5,000 automated emails",
      "25 AI generations",
      "1 team member",
      "Core analytics dashboard",
      "Session replay",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    basePrice: 199,
    trialDays: 3,
    description: "For growing teams finding PMF",
    included: {
      paidUsers: 2_000,
      sessionReplays: 750,
      automatedEmails: 50_000,
      aiGenerations: 250,
      teamMembers: 5,
    },
    overages: {
      paidUsersPer100: 12_00, // $12 per 100 users
      replaysPer500: 8_00, // $8 per 500 replays
      emailsPer10k: 3_00, // $3 per 10k emails
      aiGenerationsPer100: 6_00, // $6 per 100 AI generations
      teamMembersPer1: 6_00, // $6 per extra team member
    },
    features: [
      "2,000 paid users",
      "750 session replays",
      "50,000 automated emails",
      "250 AI generations",
      "5 team members",
      "Advanced analytics",
      "Retention & churn analysis",
      "Feature adoption tracking",
      "Priority email support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    basePrice: 0, // custom — contact sales
    trialDays: 0,
    description: "Custom pricing for large teams",
    included: {
      paidUsers: 0, // unlimited — negotiated
      sessionReplays: 0,
      automatedEmails: 0,
      aiGenerations: 0,
      teamMembers: 0, // unlimited
    },
    overages: {
      paidUsersPer100: 0,
      replaysPer500: 0,
      emailsPer10k: 0,
      aiGenerationsPer100: 0,
      teamMembersPer1: 0,
    },
    features: [
      "Unlimited paid users",
      "Unlimited session replays",
      "Unlimited automated emails",
      "Unlimited AI generations",
      "Unlimited team members",
      "A/B testing & experiments",
      "Revenue analytics",
      "Advanced segmentation",
      "Predictive churn modeling",
      "Dedicated support (< 4hr response)",
      "SSO authentication",
      "Custom SLA & invoicing",
    ],
    custom: true,
  },
] as const;

// Lifetime tier — not shown on pricing page, activated via key redemption only
export const LIFETIME_TIER = {
  id: "lifetime",
  name: "Lifetime",
  basePrice: 0,
  trialDays: 0,
  description: "One-time purchase with included limits. Overages billed if card on file.",
  included: {
    paidUsers: 1_000,
    sessionReplays: 500,
    automatedEmails: 25_000,
    aiGenerations: 150,
    teamMembers: 5,
  },
  overages: {
    paidUsersPer100: 10_00,
    replaysPer500: 6_00,
    emailsPer10k: 2_50,
    aiGenerationsPer100: 5_00,
  },
  features: [
    "1,000 paid users",
    "500 session replays",
    "25,000 automated emails",
    "150 AI generations",
    "5 team members",
    "All analytics features",
    "Lifetime access — no monthly fee",
    "Overages billed only if card on file",
  ],
} as const;

export type PricingTier = (typeof PRICING_TIERS)[number];

export const getTierByUserCount = (userCount: number): PricingTier | null => {
  // Find the smallest billable tier that fits the user count (skip Enterprise)
  for (const tier of PRICING_TIERS) {
    if ((tier as any).custom) continue;
    if (userCount <= tier.included.paidUsers) {
      return tier;
    }
  }
  // Exceeds Growth — Enterprise is required (custom pricing)
  return PRICING_TIERS.find((t) => (t as any).custom) ?? null;
};

export const getTierById = (id: string): PricingTier | null => {
  return PRICING_TIERS.find((tier) => tier.id === id) || null;
};
