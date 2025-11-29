import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { calculateHealthScore, type HealthScoreInputs } from '@/lib/health-score-calculator';

/**
 * API endpoint to get LLM-ready health score context
 * This provides structured data for AI-powered churn reduction and revenue optimization
 * 
 * Usage: POST /api/health-score/llm-context
 * Body: HealthScoreInputs (or raw analytics data)
 * 
 * Returns:
 * - Full health score calculation
 * - LLM-ready context with summary, metrics, risk factors, opportunities
 * - Recommendations and signals
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // If raw analytics data is provided, transform it to HealthScoreInputs
    let inputs: HealthScoreInputs;
    
    if (body.churnData || body.featureData || body.sessionData) {
      // Transform from raw analytics data
      inputs = {
        engagement: {
          dau: body.sessionData?.engagement?.dau,
          wau: body.sessionData?.engagement?.wau,
          mau: body.sessionData?.engagement?.mau,
          stickinessRatio: body.sessionData?.engagement?.stickiness_ratio 
            ? parseFloat(body.sessionData.engagement.stickiness_ratio) / 100 
            : undefined,
          sessionFrequency: body.sessionData?.engagement?.sessions_per_user,
          sessionLength: body.sessionData?.overview?.avg_duration,
        },
        adoption: {
          coreFeatures: body.featureData?.features ? {
            total: body.featureData.features.length,
            used: body.featureData.features.filter((f: any) => f.adoption_rate > 0).length,
          } : undefined,
          adoptionRate: body.featureData?.features?.length > 0 
            ? body.featureData.features.reduce((sum: number, f: any) => sum + (f.adoption_rate || 0), 0) / body.featureData.features.length
            : undefined,
          featureDepth: body.featureData?.features?.length > 0
            ? body.featureData.features.reduce((sum: number, f: any) => sum + (f.total_usage || 0), 0) / body.featureData.features.length
            : undefined,
        },
        churnRisk: {
          daysSinceLastLogin: body.churnData?.days_since_last_login,
          rageClickCount: body.churnData?.rage_clicks || 0,
          dropOffCount: body.churnData?.drop_offs || 0,
          supportTicketsLast30Days: body.churnData?.support_tickets || 0,
          bounceRate: body.sessionData?.overview?.bounce_rate 
            ? parseFloat(body.sessionData.overview.bounce_rate) / 100
            : undefined,
          errorRate: body.churnData?.error_rate || 0,
        },
        accountContext: {
          planTier: body.accountContext?.plan_tier || 'pro',
          daysSinceSignup: body.accountContext?.days_since_signup,
          isPaid: body.accountContext?.is_paid ?? true,
          mrr: body.accountContext?.mrr,
        },
      };
    } else if (body.engagement && body.adoption && body.churnRisk && body.accountContext) {
      // Already in HealthScoreInputs format
      inputs = body as HealthScoreInputs;
    } else {
      return NextResponse.json(
        { error: 'Invalid input format. Provide either raw analytics data or HealthScoreInputs.' },
        { status: 400 }
      );
    }

    // Calculate health score
    const result = calculateHealthScore(inputs);

    // Return full result with LLM context
    return NextResponse.json({
      success: true,
      data: {
        healthScore: result.overallScore,
        scoreRange: result.scoreRange,
        components: result.components,
        recommendations: result.recommendations,
        signals: result.signals,
        llmContext: result.llmContext,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error calculating health score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve example structure
 */
export async function GET(request: NextRequest) {
  const exampleInputs: HealthScoreInputs = {
    engagement: {
      dau: 50,
      wau: 120,
      mau: 300,
      stickinessRatio: 0.167, // 50/300
      sessionFrequency: 3.5,
      sessionLength: 420, // 7 minutes
    },
    adoption: {
      coreFeatures: {
        total: 5,
        used: 3,
      },
      adoptionRate: 0.6,
      timeToFirstKeyAction: 2,
      featureDepth: 8,
    },
    churnRisk: {
      daysSinceLastLogin: 3,
      rageClickCount: 0,
      dropOffCount: 1,
      supportTicketsLast30Days: 0,
      bounceRate: 0.35,
      errorRate: 0.02,
    },
    accountContext: {
      planTier: 'pro',
      daysSinceSignup: 45,
      isPaid: true,
      mrr: 99,
    },
  };

  const exampleResult = calculateHealthScore(exampleInputs);

  return NextResponse.json({
    message: 'Health Score LLM Context API',
    usage: {
      method: 'POST',
      endpoint: '/api/health-score/llm-context',
      description: 'Calculate health score and get LLM-ready context for AI-powered churn reduction',
    },
    exampleInput: exampleInputs,
    exampleOutput: exampleResult,
  });
}
