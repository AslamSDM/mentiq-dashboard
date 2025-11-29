/**
 * Health Score Calculator
 * Implements the health score calculation as per the Mentiq specification document
 * 
 * The health score is a composite score (0-100) representing the overall likelihood
 * of a user or account to stay, expand, or churn.
 * 
 * Score Ranges:
 * - 80-100: Healthy (Retained & potential expansion)
 * - 60-79: At Risk (Requires monitoring)
 * - 40-59: Warning (Intervention needed)
 * - 0-39: Churn Imminent (Likely already disengaged)
 */

export interface HealthScoreInputs {
  // Engagement Signals (30% weight)
  engagement: {
    dau?: number;
    wau?: number;
    mau?: number;
    sessionFrequency?: number; // logins per week
    sessionLength?: number; // avg duration in seconds
    stickinessRatio?: number; // DAU/MAU ratio (0-1)
  };
  
  // Adoption Signals (25% weight)
  adoption: {
    coreFeatures?: {
      total: number;
      used: number;
    };
    timeToFirstKeyAction?: number; // days since signup
    featureDepth?: number; // avg uses per feature
    adoptionRate?: number; // 0-1
  };
  
  // Churn Risk Signals (30% weight)
  churnRisk: {
    daysSinceLastLogin?: number;
    rageClickCount?: number;
    dropOffCount?: number;
    supportTicketsLast30Days?: number;
    bounceRate?: number; // 0-1
    errorRate?: number; // 0-1
  };
  
  // Account Context (15% weight)
  accountContext: {
    planTier?: 'free' | 'trial' | 'basic' | 'pro' | 'enterprise';
    daysSinceSignup?: number;
    isPaid?: boolean;
    mrr?: number;
  };
}

export interface HealthScoreResult {
  overallScore: number;
  scoreRange: 'healthy' | 'at-risk' | 'warning' | 'critical';
  components: {
    engagement: { score: number; weight: number; weighted: number };
    adoption: { score: number; weight: number; weighted: number };
    churnRisk: { score: number; weight: number; weighted: number };
    accountContext: { score: number; weight: number; weighted: number };
  };
  recommendations: string[];
  signals: {
    positive: string[];
    negative: string[];
  };
  // LLM-ready structured data for churn reduction advice
  llmContext: {
    summary: string;
    metrics: Record<string, any>;
    riskFactors: string[];
    opportunities: string[];
  };
}

/**
 * Calculate Engagement Score (0-100)
 * Based on DAU/WAU/MAU ratios, session frequency, and session length
 * Weight: 30% of total health score
 */
export function calculateEngagementScore(engagement: HealthScoreInputs['engagement']): number {
  let score = 0;
  let factorCount = 0;

  // Stickiness ratio (DAU/MAU) - most important (40% of engagement)
  if (engagement.stickinessRatio !== undefined) {
    const stickinessScore = Math.min(100, engagement.stickinessRatio * 100 * 3.33); // 30% stickiness = 100 score
    score += stickinessScore * 0.4;
    factorCount++;
  }

  // Session frequency (30% of engagement)
  if (engagement.sessionFrequency !== undefined) {
    // 5+ sessions per week = excellent
    const frequencyScore = Math.min(100, (engagement.sessionFrequency / 5) * 100);
    score += frequencyScore * 0.3;
    factorCount++;
  }

  // Session length (20% of engagement)
  if (engagement.sessionLength !== undefined) {
    // 10+ minutes = excellent (600 seconds)
    const lengthScore = Math.min(100, (engagement.sessionLength / 600) * 100);
    score += lengthScore * 0.2;
    factorCount++;
  }

  // DAU/WAU/MAU presence (10% of engagement)
  if (engagement.dau !== undefined && engagement.mau !== undefined && engagement.mau > 0) {
    const dauMauRatio = engagement.dau / engagement.mau;
    const ratioScore = Math.min(100, dauMauRatio * 100 * 3.33);
    score += ratioScore * 0.1;
    factorCount++;
  }

  // If no factors available, return baseline
  if (factorCount === 0) return 50;

  return Math.round(score);
}

/**
 * Calculate Adoption Score (0-100)
 * Based on core feature usage, time to activation, and feature depth
 * Weight: 25% of total health score
 */
export function calculateAdoptionScore(adoption: HealthScoreInputs['adoption']): number {
  let score = 0;

  // Use adoptionRate if provided directly
  if (adoption.adoptionRate !== undefined) {
    const adoptionPercent = adoption.adoptionRate * 100;
    if (adoptionPercent >= 80) {
      score = 100;
    } else if (adoptionPercent >= 50) {
      score = 50 + ((adoptionPercent - 50) / 30) * 35; // 50-80% -> 50-85 score
    } else {
      score = (adoptionPercent / 50) * 50; // 0-50% -> 0-50 score
    }
  } 
  // Calculate from core features
  else if (adoption.coreFeatures && adoption.coreFeatures.total > 0) {
    const adoptionRate = adoption.coreFeatures.used / adoption.coreFeatures.total;
    const adoptionPercent = adoptionRate * 100;

    if (adoptionPercent >= 80) {
      score = 100;
    } else if (adoptionPercent >= 50) {
      score = 50 + ((adoptionPercent - 50) / 30) * 35;
    } else {
      score = (adoptionPercent / 50) * 50;
    }
  } else {
    score = 50; // baseline
  }

  // Adjust for time to first key action (faster = better)
  if (adoption.timeToFirstKeyAction !== undefined) {
    if (adoption.timeToFirstKeyAction <= 1) {
      score = Math.min(100, score + 10); // Bonus for quick activation
    } else if (adoption.timeToFirstKeyAction > 7) {
      score = Math.max(0, score - 15); // Penalty for slow activation
    }
  }

  // Adjust for feature depth (repeated use)
  if (adoption.featureDepth !== undefined) {
    if (adoption.featureDepth >= 10) {
      score = Math.min(100, score + 5); // Bonus for deep usage
    } else if (adoption.featureDepth < 3) {
      score = Math.max(0, score - 10); // Penalty for shallow usage
    }
  }

  return Math.round(score);
}

/**
 * Calculate Churn Risk Score (0-100)
 * Higher score = lower risk. Based on inactivity, frustration signals, and errors
 * Weight: 30% of total health score
 */
export function calculateChurnRiskScore(churnRisk: HealthScoreInputs['churnRisk']): number {
  let score = 100; // Start at perfect, subtract for risk signals

  // Inactivity penalty
  if (churnRisk.daysSinceLastLogin !== undefined) {
    if (churnRisk.daysSinceLastLogin >= 30) {
      score -= 40; // Critical inactivity
    } else if (churnRisk.daysSinceLastLogin >= 14) {
      score -= 25; // High risk inactivity
    } else if (churnRisk.daysSinceLastLogin >= 7) {
      score -= 10; // Moderate risk
    }
  }

  // Rage clicks penalty (frustration)
  if (churnRisk.rageClickCount !== undefined) {
    score -= Math.min(20, churnRisk.rageClickCount * 5); // -5 per rage click, max -20
  }

  // Drop-off penalty
  if (churnRisk.dropOffCount !== undefined) {
    score -= Math.min(15, churnRisk.dropOffCount * 3); // -3 per drop-off, max -15
  }

  // Support tickets penalty (high volume = frustrated)
  if (churnRisk.supportTicketsLast30Days !== undefined) {
    if (churnRisk.supportTicketsLast30Days >= 5) {
      score -= 15;
    } else if (churnRisk.supportTicketsLast30Days >= 3) {
      score -= 10;
    } else if (churnRisk.supportTicketsLast30Days >= 1) {
      score -= 5;
    }
  }

  // Bounce rate penalty
  if (churnRisk.bounceRate !== undefined) {
    score -= Math.round(churnRisk.bounceRate * 20); // High bounce = risk
  }

  // Error rate penalty
  if (churnRisk.errorRate !== undefined) {
    score -= Math.round(churnRisk.errorRate * 15);
  }

  return Math.max(0, Math.round(score));
}

/**
 * Calculate Account Context Score (0-100)
 * Based on plan tier, tenure, and payment status
 * Weight: 15% of total health score
 */
export function calculateAccountContextScore(context: HealthScoreInputs['accountContext']): number {
  let score = 50; // Baseline

  // Plan tier scoring
  if (context.planTier) {
    switch (context.planTier) {
      case 'enterprise':
        score += 30;
        break;
      case 'pro':
        score += 20;
        break;
      case 'basic':
        score += 10;
        break;
      case 'trial':
        score += 0; // Neutral
        break;
      case 'free':
        score -= 10;
        break;
    }
  }

  // Payment status bonus
  if (context.isPaid) {
    score += 15;
  }

  // Tenure adjustment (longer = more stable)
  if (context.daysSinceSignup !== undefined) {
    if (context.daysSinceSignup >= 365) {
      score += 20; // Long-term customer
    } else if (context.daysSinceSignup >= 90) {
      score += 10; // Established customer
    } else if (context.daysSinceSignup < 7) {
      score -= 10; // New, unstable
    }
  }

  // MRR bonus (higher value = lower churn typically)
  if (context.mrr !== undefined) {
    if (context.mrr >= 1000) {
      score += 10;
    } else if (context.mrr >= 100) {
      score += 5;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate overall health score with all components
 */
export function calculateHealthScore(inputs: HealthScoreInputs): HealthScoreResult {
  // Component scores
  const engagementScore = calculateEngagementScore(inputs.engagement);
  const adoptionScore = calculateAdoptionScore(inputs.adoption);
  const churnRiskScore = calculateChurnRiskScore(inputs.churnRisk);
  const accountContextScore = calculateAccountContextScore(inputs.accountContext);

  // Weights (as per specification)
  const weights = {
    engagement: 0.30,
    adoption: 0.25,
    churnRisk: 0.30,
    accountContext: 0.15,
  };

  // Calculate weighted overall score
  const overallScore = Math.round(
    engagementScore * weights.engagement +
    adoptionScore * weights.adoption +
    churnRiskScore * weights.churnRisk +
    accountContextScore * weights.accountContext
  );

  // Determine score range
  let scoreRange: 'healthy' | 'at-risk' | 'warning' | 'critical';
  if (overallScore >= 80) scoreRange = 'healthy';
  else if (overallScore >= 60) scoreRange = 'at-risk';
  else if (overallScore >= 40) scoreRange = 'warning';
  else scoreRange = 'critical';

  // Generate recommendations
  const recommendations = generateRecommendations(inputs, {
    engagement: engagementScore,
    adoption: adoptionScore,
    churnRisk: churnRiskScore,
    accountContext: accountContextScore,
  });

  // Identify positive and negative signals
  const signals = identifySignals(inputs, {
    engagement: engagementScore,
    adoption: adoptionScore,
    churnRisk: churnRiskScore,
    accountContext: accountContextScore,
  });

  // Create LLM context for AI-powered advice
  const llmContext = createLLMContext(inputs, overallScore, scoreRange, recommendations, signals);

  return {
    overallScore,
    scoreRange,
    components: {
      engagement: {
        score: engagementScore,
        weight: weights.engagement,
        weighted: engagementScore * weights.engagement,
      },
      adoption: {
        score: adoptionScore,
        weight: weights.adoption,
        weighted: adoptionScore * weights.adoption,
      },
      churnRisk: {
        score: churnRiskScore,
        weight: weights.churnRisk,
        weighted: churnRiskScore * weights.churnRisk,
      },
      accountContext: {
        score: accountContextScore,
        weight: weights.accountContext,
        weighted: accountContextScore * weights.accountContext,
      },
    },
    recommendations,
    signals,
    llmContext,
  };
}

/**
 * Generate actionable recommendations based on scores
 */
function generateRecommendations(
  inputs: HealthScoreInputs,
  scores: Record<string, number>
): string[] {
  const recommendations: string[] = [];

  // Engagement recommendations
  if (scores.engagement < 60) {
    if (inputs.engagement.stickinessRatio && inputs.engagement.stickinessRatio < 0.2) {
      recommendations.push("Critical: Stickiness ratio below 20%. Focus on daily habit formation features.");
    }
    if (inputs.engagement.sessionFrequency && inputs.engagement.sessionFrequency < 2) {
      recommendations.push("Users logging in less than 2x/week. Implement email nudges and push notifications.");
    }
    recommendations.push("Engagement is low. Consider in-app onboarding improvements and value delivery.");
  }

  // Adoption recommendations
  if (scores.adoption < 60) {
    if (inputs.adoption.coreFeatures && inputs.adoption.coreFeatures.used < inputs.adoption.coreFeatures.total * 0.5) {
      recommendations.push("Users adopting less than 50% of core features. Implement feature discovery tooltips.");
    }
    if (inputs.adoption.timeToFirstKeyAction && inputs.adoption.timeToFirstKeyAction > 7) {
      recommendations.push("Time to activation exceeds 7 days. Streamline onboarding and reduce friction.");
    }
    recommendations.push("Feature adoption needs improvement. Add guided product tours and use-case templates.");
  }

  // Churn risk recommendations
  if (scores.churnRisk < 60) {
    if (inputs.churnRisk.daysSinceLastLogin && inputs.churnRisk.daysSinceLastLogin >= 14) {
      recommendations.push("URGENT: User inactive for 14+ days. Initiate win-back campaign immediately.");
    }
    if (inputs.churnRisk.rageClickCount && inputs.churnRisk.rageClickCount > 0) {
      recommendations.push("Rage clicks detected. Review UX for points of frustration and fix immediately.");
    }
    if (inputs.churnRisk.supportTicketsLast30Days && inputs.churnRisk.supportTicketsLast30Days >= 3) {
      recommendations.push("High support ticket volume. Assign CSM for proactive outreach.");
    }
  }

  // Account context recommendations
  if (scores.accountContext < 60) {
    if (inputs.accountContext.planTier === 'trial') {
      recommendations.push("Trial user. Focus on demonstrating value and conversion before trial expires.");
    }
    if (inputs.accountContext.daysSinceSignup && inputs.accountContext.daysSinceSignup < 7) {
      recommendations.push("New user (< 7 days). Critical onboarding period - ensure quick wins.");
    }
  }

  return recommendations;
}

/**
 * Identify positive and negative signals
 */
function identifySignals(
  inputs: HealthScoreInputs,
  scores: Record<string, number>
): { positive: string[]; negative: string[] } {
  const positive: string[] = [];
  const negative: string[] = [];

  // Engagement signals
  if (inputs.engagement.stickinessRatio && inputs.engagement.stickinessRatio >= 0.3) {
    positive.push(`Strong stickiness ratio: ${(inputs.engagement.stickinessRatio * 100).toFixed(1)}%`);
  } else if (inputs.engagement.stickinessRatio && inputs.engagement.stickinessRatio < 0.15) {
    negative.push(`Low stickiness ratio: ${(inputs.engagement.stickinessRatio * 100).toFixed(1)}%`);
  }

  if (inputs.engagement.sessionFrequency && inputs.engagement.sessionFrequency >= 5) {
    positive.push(`High session frequency: ${inputs.engagement.sessionFrequency} logins/week`);
  } else if (inputs.engagement.sessionFrequency && inputs.engagement.sessionFrequency < 2) {
    negative.push(`Low session frequency: ${inputs.engagement.sessionFrequency} logins/week`);
  }

  // Adoption signals
  if (inputs.adoption.adoptionRate && inputs.adoption.adoptionRate >= 0.8) {
    positive.push(`Excellent adoption rate: ${(inputs.adoption.adoptionRate * 100).toFixed(0)}%`);
  } else if (inputs.adoption.adoptionRate && inputs.adoption.adoptionRate < 0.5) {
    negative.push(`Poor adoption rate: ${(inputs.adoption.adoptionRate * 100).toFixed(0)}%`);
  }

  // Churn risk signals
  if (inputs.churnRisk.daysSinceLastLogin !== undefined) {
    if (inputs.churnRisk.daysSinceLastLogin <= 1) {
      positive.push("Active user (logged in within 24h)");
    } else if (inputs.churnRisk.daysSinceLastLogin >= 14) {
      negative.push(`Inactive for ${inputs.churnRisk.daysSinceLastLogin} days`);
    }
  }

  if (inputs.churnRisk.rageClickCount && inputs.churnRisk.rageClickCount > 0) {
    negative.push(`${inputs.churnRisk.rageClickCount} rage click events detected`);
  }

  // Account context signals
  if (inputs.accountContext.isPaid && inputs.accountContext.planTier === 'enterprise') {
    positive.push("Enterprise paid customer");
  }

  if (inputs.accountContext.daysSinceSignup && inputs.accountContext.daysSinceSignup >= 365) {
    positive.push(`Loyal customer: ${Math.floor(inputs.accountContext.daysSinceSignup / 365)} year(s)`);
  }

  return { positive, negative };
}

/**
 * Create structured context for LLM-powered churn reduction advice
 */
function createLLMContext(
  inputs: HealthScoreInputs,
  overallScore: number,
  scoreRange: string,
  recommendations: string[],
  signals: { positive: string[]; negative: string[] }
): HealthScoreResult['llmContext'] {
  // Create summary
  const summary = `User Health Score: ${overallScore}/100 (${scoreRange}). ${
    scoreRange === 'critical' ? 'IMMEDIATE ACTION REQUIRED - High churn risk.' :
    scoreRange === 'warning' ? 'User needs intervention to prevent churn.' :
    scoreRange === 'at-risk' ? 'User requires monitoring and engagement.' :
    'User is healthy and engaged.'
  }`;

  // Gather all metrics for LLM
  const metrics = {
    overall_score: overallScore,
    score_range: scoreRange,
    engagement: {
      dau: inputs.engagement.dau,
      wau: inputs.engagement.wau,
      mau: inputs.engagement.mau,
      stickiness_ratio: inputs.engagement.stickinessRatio,
      session_frequency_per_week: inputs.engagement.sessionFrequency,
      avg_session_length_seconds: inputs.engagement.sessionLength,
    },
    adoption: {
      core_features_total: inputs.adoption.coreFeatures?.total,
      core_features_used: inputs.adoption.coreFeatures?.used,
      adoption_rate: inputs.adoption.adoptionRate,
      days_to_first_key_action: inputs.adoption.timeToFirstKeyAction,
      feature_depth_avg_uses: inputs.adoption.featureDepth,
    },
    churn_risk: {
      days_since_last_login: inputs.churnRisk.daysSinceLastLogin,
      rage_clicks: inputs.churnRisk.rageClickCount,
      drop_offs: inputs.churnRisk.dropOffCount,
      support_tickets_30d: inputs.churnRisk.supportTicketsLast30Days,
      bounce_rate: inputs.churnRisk.bounceRate,
      error_rate: inputs.churnRisk.errorRate,
    },
    account_context: {
      plan_tier: inputs.accountContext.planTier,
      days_since_signup: inputs.accountContext.daysSinceSignup,
      is_paid: inputs.accountContext.isPaid,
      mrr: inputs.accountContext.mrr,
    },
  };

  // Identify risk factors for LLM
  const riskFactors: string[] = [];
  if (inputs.churnRisk.daysSinceLastLogin && inputs.churnRisk.daysSinceLastLogin >= 14) {
    riskFactors.push(`Inactivity: ${inputs.churnRisk.daysSinceLastLogin} days since last login`);
  }
  if (inputs.churnRisk.rageClickCount && inputs.churnRisk.rageClickCount > 0) {
    riskFactors.push(`User frustration: ${inputs.churnRisk.rageClickCount} rage click events`);
  }
  if (inputs.adoption.adoptionRate && inputs.adoption.adoptionRate < 0.5) {
    riskFactors.push(`Low feature adoption: ${(inputs.adoption.adoptionRate * 100).toFixed(0)}%`);
  }
  if (inputs.engagement.stickinessRatio && inputs.engagement.stickinessRatio < 0.15) {
    riskFactors.push(`Poor engagement: ${(inputs.engagement.stickinessRatio * 100).toFixed(1)}% stickiness`);
  }

  // Identify opportunities for LLM
  const opportunities: string[] = [];
  if (inputs.accountContext.isPaid && inputs.accountContext.mrr && inputs.accountContext.mrr >= 100) {
    opportunities.push(`High-value customer (MRR: $${inputs.accountContext.mrr}) - prioritize retention`);
  }
  if (inputs.engagement.sessionFrequency && inputs.engagement.sessionFrequency >= 3) {
    opportunities.push("User shows engagement - good candidate for upsell");
  }
  if (inputs.adoption.coreFeatures && inputs.adoption.coreFeatures.used >= inputs.adoption.coreFeatures.total * 0.7) {
    opportunities.push("Strong feature adoption - can introduce advanced features");
  }
  if (inputs.accountContext.daysSinceSignup && inputs.accountContext.daysSinceSignup >= 90 && inputs.accountContext.planTier !== 'enterprise') {
    opportunities.push("Long-term user ready for upgrade pitch");
  }

  return {
    summary,
    metrics,
    riskFactors,
    opportunities,
  };
}
