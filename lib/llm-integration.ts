/**
 * LLM Integration Utilities
 * Helper functions to prepare and format health score data for AI/LLM consumption
 */

import { HealthScoreResult } from "./health-score-calculator";

/**
 * Generate a comprehensive prompt for an LLM to provide churn reduction advice
 */
export function generateChurnReductionPrompt(
  healthScore: HealthScoreResult
): string {
  const prompt = `
You are an expert SaaS retention strategist analyzing user health metrics to provide actionable churn reduction advice.

## User Health Score Analysis

**Overall Health Score:** ${
    healthScore.overallScore
  }/100 (${healthScore.scoreRange.toUpperCase()})

### Score Interpretation:
- 80-100: Healthy (Retained & potential expansion)
- 60-79: At Risk (Requires monitoring)
- 40-59: Warning (Intervention needed)
- 0-39: Churn Imminent (Likely already disengaged)

### Component Scores:

1. **Engagement Score:** ${
    healthScore.components.engagement.score
  }/100 (Weight: ${(healthScore.components.engagement.weight * 100).toFixed(
    0
  )}%)
   - Measures daily/weekly/monthly active users, session frequency, and stickiness ratio

2. **Adoption Score:** ${healthScore.components.adoption.score}/100 (Weight: ${(
    healthScore.components.adoption.weight * 100
  ).toFixed(0)}%)
   - Measures core feature usage, time to activation, and feature depth

3. **Churn Risk Score:** ${
    healthScore.components.churnRisk.score
  }/100 (Weight: ${(healthScore.components.churnRisk.weight * 100).toFixed(0)}%)
   - Measures inactivity, rage clicks, drop-offs, and frustration signals

4. **Account Context Score:** ${
    healthScore.components.accountContext.score
  }/100 (Weight: ${(healthScore.components.accountContext.weight * 100).toFixed(
    0
  )}%)
   - Measures plan tier, tenure, and payment status

### Current Situation Summary:
${healthScore.llmContext.summary}

### Key Metrics:
\`\`\`json
${JSON.stringify(healthScore.llmContext.metrics, null, 2)}
\`\`\`

### Positive Signals:
${
  healthScore.signals.positive.length > 0
    ? healthScore.signals.positive.map((s) => `✓ ${s}`).join("\n")
    : "None identified"
}

### Negative Signals (Risk Factors):
${
  healthScore.signals.negative.length > 0
    ? healthScore.signals.negative.map((s) => `⚠ ${s}`).join("\n")
    : "None identified"
}

### Current Risk Factors:
${
  healthScore.llmContext.riskFactors.length > 0
    ? healthScore.llmContext.riskFactors.map((r) => `• ${r}`).join("\n")
    : "No major risk factors identified"
}

### Identified Opportunities:
${
  healthScore.llmContext.opportunities.length > 0
    ? healthScore.llmContext.opportunities.map((o) => `• ${o}`).join("\n")
    : "Limited opportunities based on current data"
}

### Pre-Generated Recommendations:
${
  healthScore.recommendations.length > 0
    ? healthScore.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "No specific recommendations at this time"
}

---

## Your Task:

Based on this comprehensive health score analysis, provide:

1. **Immediate Actions** (0-7 days):
   - What should be done RIGHT NOW to reduce churn risk?
   - Prioritize by impact and urgency

2. **Short-term Strategy** (1-4 weeks):
   - What initiatives should be implemented to improve the health score?
   - Focus on engagement and adoption improvements

3. **Long-term Retention Plan** (1-3 months):
   - What sustainable changes will create lasting retention?
   - Consider product, support, and customer success strategies

4. **Revenue Optimization**:
   - If this is a high-value customer, what upsell/expansion opportunities exist?
   - If churn risk is high, what's the win-back strategy?

5. **Specific Product/Feature Recommendations**:
   - Which features need more promotion or onboarding focus?
   - What friction points should be removed?

Please provide your analysis in a clear, actionable format that a founder or customer success manager can immediately implement.
`;

  return prompt.trim();
}

/**
 * Generate a prompt for revenue optimization advice
 */
export function generateRevenueOptimizationPrompt(
  healthScore: HealthScoreResult
): string {
  const mrr = healthScore.llmContext.metrics.account_context?.mrr || 0;
  const planTier =
    healthScore.llmContext.metrics.account_context?.plan_tier || "unknown";

  const prompt = `
You are a SaaS revenue optimization expert analyzing customer health data to maximize revenue and minimize revenue leakage.

## Customer Profile

**Health Score:** ${
    healthScore.overallScore
  }/100 (${healthScore.scoreRange.toUpperCase()})
**Current MRR:** $${mrr}
**Plan Tier:** ${planTier}
**Revenue Risk Level:** ${
    healthScore.overallScore < 40
      ? "CRITICAL - Immediate churn risk"
      : healthScore.overallScore < 60
      ? "HIGH - At-risk revenue"
      : healthScore.overallScore < 80
      ? "MODERATE - Monitor closely"
      : "LOW - Stable revenue"
  }

## Key Revenue Metrics:
${JSON.stringify(healthScore.llmContext.metrics, null, 2)}

## Risk Factors Impacting Revenue:
${
  healthScore.llmContext.riskFactors.length > 0
    ? healthScore.llmContext.riskFactors.map((r) => `• ${r}`).join("\n")
    : "No major revenue risks identified"
}

## Expansion Opportunities:
${
  healthScore.llmContext.opportunities.length > 0
    ? healthScore.llmContext.opportunities.map((o) => `• ${o}`).join("\n")
    : "Limited expansion opportunities"
}

---

## Your Task:

Provide a comprehensive revenue optimization strategy including:

1. **Churn Prevention (Defensive Revenue)**:
   - If this customer is at risk, what's the projected MRR loss?
   - What interventions can prevent cancellation or downgrade?
   - What is the retention cost vs. customer lifetime value?

2. **Expansion Opportunities (Offensive Revenue)**:
   - Is this customer ready for an upsell? What signals indicate readiness?
   - Which higher-tier features would add value based on their usage?
   - What's the recommended upgrade path and timing?

3. **Pricing Strategy**:
   - Is the customer on the right plan tier for their usage?
   - Are they under/over-utilizing their current plan?
   - Should a custom pricing tier be offered?

4. **Customer Success Investment**:
   - Does this customer warrant high-touch CS support?
   - What's the ROI of additional customer success resources?
   - Should they be assigned a dedicated CSM?

5. **Revenue Projection**:
   - What's the 12-month revenue forecast for this customer?
   - What's the probability of renewal vs. churn?
   - What's the expected LTV based on current health metrics?

Provide specific dollar amounts, timelines, and success probabilities where possible.
`;

  return prompt.trim();
}

/**
 * Format health score data as a JSON payload for external AI/LLM APIs
 */
export function formatForExternalLLM(
  healthScore: HealthScoreResult,
  options?: {
    includeRecommendations?: boolean;
    includeSignals?: boolean;
    includeFullMetrics?: boolean;
  }
): Record<string, any> {
  const defaultOptions = {
    includeRecommendations: true,
    includeSignals: true,
    includeFullMetrics: true,
    ...options,
  };

  const payload: Record<string, any> = {
    health_score: {
      overall: healthScore.overallScore,
      range: healthScore.scoreRange,
      components: {
        engagement: {
          score: healthScore.components.engagement.score,
          weight_percent: healthScore.components.engagement.weight * 100,
          weighted_contribution: healthScore.components.engagement.weighted,
        },
        adoption: {
          score: healthScore.components.adoption.score,
          weight_percent: healthScore.components.adoption.weight * 100,
          weighted_contribution: healthScore.components.adoption.weighted,
        },
        churn_risk: {
          score: healthScore.components.churnRisk.score,
          weight_percent: healthScore.components.churnRisk.weight * 100,
          weighted_contribution: healthScore.components.churnRisk.weighted,
        },
        account_context: {
          score: healthScore.components.accountContext.score,
          weight_percent: healthScore.components.accountContext.weight * 100,
          weighted_contribution: healthScore.components.accountContext.weighted,
        },
      },
    },
    summary: healthScore.llmContext.summary,
    risk_factors: healthScore.llmContext.riskFactors,
    opportunities: healthScore.llmContext.opportunities,
    timestamp: new Date().toISOString(),
  };

  if (defaultOptions.includeRecommendations) {
    payload.recommendations = healthScore.recommendations;
  }

  if (defaultOptions.includeSignals) {
    payload.signals = {
      positive: healthScore.signals.positive,
      negative: healthScore.signals.negative,
    };
  }

  if (defaultOptions.includeFullMetrics) {
    payload.detailed_metrics = healthScore.llmContext.metrics;
  }

  return payload;
}

/**
 * Generate a concise executive summary for leadership
 */
export function generateExecutiveSummary(
  healthScore: HealthScoreResult
): string {
  const status =
    healthScore.scoreRange === "healthy"
      ? "✅ HEALTHY"
      : healthScore.scoreRange === "at-risk"
      ? "⚠️ AT RISK"
      : healthScore.scoreRange === "warning"
      ? "🚨 WARNING"
      : "🔴 CRITICAL";

  const topIssues = healthScore.llmContext.riskFactors.slice(0, 3);
  const topOpportunities = healthScore.llmContext.opportunities.slice(0, 3);

  let summary = `
# User Health Executive Summary

**Status:** ${status}
**Health Score:** ${healthScore.overallScore}/100

## Quick Assessment:
${healthScore.llmContext.summary}

## Top Issues (${topIssues.length}):
${
  topIssues.length > 0
    ? topIssues.map((issue, i) => `${i + 1}. ${issue}`).join("\n")
    : "No critical issues identified"
}

## Key Opportunities (${topOpportunities.length}):
${
  topOpportunities.length > 0
    ? topOpportunities.map((opp, i) => `${i + 1}. ${opp}`).join("\n")
    : "Limited opportunities identified"
}

## Component Performance:
- **Engagement:** ${healthScore.components.engagement.score}/100 (${
    healthScore.components.engagement.score >= 80
      ? "Strong"
      : healthScore.components.engagement.score >= 60
      ? "Adequate"
      : "Weak"
  })
- **Adoption:** ${healthScore.components.adoption.score}/100 (${
    healthScore.components.adoption.score >= 80
      ? "Strong"
      : healthScore.components.adoption.score >= 60
      ? "Adequate"
      : "Weak"
  })
- **Churn Risk:** ${healthScore.components.churnRisk.score}/100 (${
    healthScore.components.churnRisk.score >= 80
      ? "Low Risk"
      : healthScore.components.churnRisk.score >= 60
      ? "Moderate Risk"
      : "High Risk"
  })
- **Account Context:** ${healthScore.components.accountContext.score}/100

## Recommended Next Steps:
${healthScore.recommendations
  .slice(0, 3)
  .map((rec, i) => `${i + 1}. ${rec}`)
  .join("\n")}

---
*Generated: ${new Date().toISOString()}*
`;

  return summary.trim();
}

/**
 * Export data structure for batch LLM processing (multiple users)
 */
export interface BatchHealthScoreExport {
  export_timestamp: string;
  total_users: number;
  health_distribution: {
    healthy: number;
    at_risk: number;
    warning: number;
    critical: number;
  };
  users: Array<{
    user_id?: string;
    health_score: number;
    score_range: string;
    llm_context: HealthScoreResult["llmContext"];
    top_recommendations: string[];
  }>;
}

/**
 * Prepare batch export for multiple users
 */
export function prepareBatchExport(
  userHealthScores: Array<{ userId?: string; healthScore: HealthScoreResult }>
): BatchHealthScoreExport {
  const distribution = {
    healthy: 0,
    "at-risk": 0,
    warning: 0,
    critical: 0,
  };

  userHealthScores.forEach(({ healthScore }) => {
    distribution[healthScore.scoreRange]++;
  });

  return {
    export_timestamp: new Date().toISOString(),
    total_users: userHealthScores.length,
    health_distribution: distribution,
    users: userHealthScores.map(({ userId, healthScore }) => ({
      user_id: userId,
      health_score: healthScore.overallScore,
      score_range: healthScore.scoreRange,
      llm_context: healthScore.llmContext,
      top_recommendations: healthScore.recommendations.slice(0, 5),
    })),
  };
}
