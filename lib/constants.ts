// Pricing tiers configuration
export const PRICING_TIERS = [
  {
    id: "launch",
    name: "Launch",
    range: [1, 100],
    basePrice: 49,
    trialDays: 3,
    description: "Perfect for startups getting started",
    features: [
      "Up to 100 paid users",
      "2 team members",
      "Core analytics dashboard",
      "Session replay",
      "Basic retention cohorts",
      "Email support",
      "7-day data retention",
    ],
  },
  {
    id: "traction",
    name: "Traction",
    range: [101, 500],
    basePrice: 149,
    trialDays: 3,
    description: "For growing teams finding PMF",
    features: [
      "Up to 500 paid users",
      "4 team members",
      "Advanced analytics",
      "Unlimited session replays",
      "Retention & churn analysis",
      "Feature adoption tracking",
      "Priority email support",
      "30-day data retention",
      "Custom events",
    ],
    popular: true,
  },
  {
    id: "momentum",
    name: "Momentum",
    range: [501, 1000],
    basePrice: 299,
    trialDays: 3,
    description: "Scaling fast with proven growth",
    features: [
      "Up to 1,000 paid users",
      "Unlimited team members",
      "Everything in Traction",
      "A/B testing & experiments",
      "Revenue analytics",
      "Health score tracking",
      "API access",
      "90-day data retention",
      "Slack integration",
      "Custom dashboards",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    range: [1001, 5000],
    basePrice: 699,
    trialDays: 14,
    description: "Enterprise-ready for rapid expansion",
    features: [
      "Up to 5,000 paid users",
      "Unlimited team members",
      "Everything in Momentum",
      "Advanced segmentation",
      "Predictive churn modeling",
      "Multi-project support",
      "Priority support (< 4hr response)",
      "1-year data retention",
      "SSO authentication",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
  {
    id: "expansion",
    name: "Expansion",
    range: [5001, 10000],
    basePrice: 1499,
    trialDays: 14,
    description: "Maximum scale with premium support",
    features: [
      "Up to 10,000 paid users",
      "Unlimited team members",
      "Everything in Scale",
      "White-label options",
      "Custom ML models",
      "Unlimited projects",
      "24/7 premium support",
      "Unlimited data retention",
      "On-premise deployment option",
      "Custom SLA",
      "Quarterly business reviews",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    range: [10001, Infinity],
    basePrice: null, // Custom pricing
    trialDays: 30,
    description: "Custom solutions for large-scale operations",
    features: [
      "Unlimited paid users",
      "Unlimited team members",
      "Custom deployment options",
      "Dedicated infrastructure",
      "24/7 premium support",
      "Custom SLA & guarantees",
      "Dedicated success team",
      "White-label solutions",
      "Custom feature development",
    ],
  },
] as const;

export type PricingTier = (typeof PRICING_TIERS)[number];

export const getTierByUserCount = (userCount: number): PricingTier | null => {
  return (
    PRICING_TIERS.find(
      (tier) => userCount >= tier.range[0] && userCount <= tier.range[1]
    ) || null
  );
};

export const getTierById = (id: string): PricingTier | null => {
  return PRICING_TIERS.find((tier) => tier.id === id) || null;
};
