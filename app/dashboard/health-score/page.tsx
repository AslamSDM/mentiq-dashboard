"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store";
import { centralizedData } from "@/lib/services/centralized-data";
import { useToast } from "@/hooks/use-toast";
import { ChurnRiskCard } from "@/components/churn-risk-card";
import {
  calculateHealthScore,
  type HealthScoreInputs,
  type HealthScoreResult,
} from "@/lib/health-score-calculator";

export default function HealthScorePage() {
  const { selectedProjectId } = useStore();
  const { toast } = useToast();

  // State for health score data
  const [healthData, setHealthData] = useState<any>(null);
  const [churnData, setChurnData] = useState<any>(null);
  const [churnStats, setChurnStats] = useState<any>(null);
  const [featureData, setFeatureData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [healthScoreResult, setHealthScoreResult] =
    useState<HealthScoreResult | null>(null);

  // Fetch health score data
  useEffect(() => {
    if (selectedProjectId) {
      fetchHealthData();
    }
  }, [selectedProjectId]);

  const fetchHealthData = async () => {
    if (!selectedProjectId) return;

    setLoading(true);
    try {
      // Use centralized data service - it handles caching automatically
      const [churnRes, featureRes, sessionRes] = await Promise.all([
        centralizedData.getChurnRisk(selectedProjectId, 50).catch(() => null),
        centralizedData.getFeatureAdoption(selectedProjectId).catch(() => null),
        centralizedData
          .getSessionAnalytics(selectedProjectId)
          .catch(() => null),
      ]);

      console.log("📦 Using centralized cached data");

      if (churnRes) {
        setChurnData(churnRes.at_risk_users || []);
        setChurnStats({
          at_risk_users: churnRes.total_at_risk || 0,
          churn_rate_30d: churnRes.churn_rate || "0%",
          total_users: 0,
          churned_users: 0,
          risk_breakdown: {},
        });
      }

      if (featureRes) {
        setFeatureData(featureRes);
      }

      if (sessionRes) {
        setSessionData(sessionRes);
      }

      // Calculate health score using the new calculator after all data is loaded
      if (
        churnRes?.data ||
        featureRes?.data ||
        (sessionRes as any)?.session_data
      ) {
        const healthScoreInputs = prepareHealthScoreInputs(
          churnRes?.data,
          featureRes?.data,
          (sessionRes as any)?.session_data
        );
        const result = calculateHealthScore(healthScoreInputs);
        setHealthScoreResult(result);
        console.log("📊 Health Score Calculated:", result);
      }
    } catch (error) {
      console.error("Error fetching health data:", error);
      toast({
        title: "Error",
        description: "Failed to load health score data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare inputs for health score calculator from raw data
  const prepareHealthScoreInputs = (
    churnData: any,
    featureData: any,
    sessionData: any
  ): HealthScoreInputs => {
    const inputs: HealthScoreInputs = {
      engagement: {
        dau: sessionData?.engagement?.dau,
        wau: sessionData?.engagement?.wau,
        mau: sessionData?.engagement?.mau,
        stickinessRatio: sessionData?.engagement?.stickiness_ratio
          ? parseFloat(sessionData.engagement.stickiness_ratio) / 100
          : undefined,
        sessionFrequency: sessionData?.engagement?.sessions_per_user,
        sessionLength: sessionData?.overview?.avg_duration,
      },
      adoption: {
        coreFeatures: featureData?.features
          ? {
              total: featureData.features.length,
              used: featureData.features.filter((f: any) => f.adoption_rate > 0)
                .length,
            }
          : undefined,
        adoptionRate:
          featureData?.features?.length > 0
            ? featureData.features.reduce(
                (sum: number, f: any) => sum + (f.adoption_rate || 0),
                0
              ) / featureData.features.length
            : undefined,
        featureDepth:
          featureData?.features?.length > 0
            ? featureData.features.reduce(
                (sum: number, f: any) => sum + (f.total_usage || 0),
                0
              ) / featureData.features.length
            : undefined,
      },
      churnRisk: {
        daysSinceLastLogin: undefined, // Would need to track this per user
        rageClickCount: 0, // Would need session recording data
        dropOffCount: 0, // Would need funnel data
        supportTicketsLast30Days: 0, // Would need support integration
        bounceRate: sessionData?.overview?.bounce_rate
          ? parseFloat(sessionData.overview.bounce_rate) / 100
          : undefined,
        errorRate: 0, // Would need error tracking
      },
      accountContext: {
        planTier: "pro", // Would need to determine from user data
        daysSinceSignup: undefined, // Would need user creation date
        isPaid: true, // Would need billing data
        mrr: undefined, // Would need Stripe integration
      },
    };

    return inputs;
  };

  // Get overall health score from the calculated result
  const overallHealthScore = healthScoreResult?.overallScore || 0;
  // Calculate health metrics from real data using the health score components
  const healthMetrics = healthScoreResult
    ? [
        {
          name: "Engagement Score",
          score: Math.round(healthScoreResult.components.engagement.score),
          weight: `${(
            healthScoreResult.components.engagement.weight * 100
          ).toFixed(0)}%`,
          trend: "N/A",
          status:
            healthScoreResult.components.engagement.score >= 80
              ? "good"
              : healthScoreResult.components.engagement.score >= 60
              ? "warning"
              : "critical",
        },
        {
          name: "Adoption Score",
          score: Math.round(healthScoreResult.components.adoption.score),
          weight: `${(
            healthScoreResult.components.adoption.weight * 100
          ).toFixed(0)}%`,
          trend: "N/A",
          status:
            healthScoreResult.components.adoption.score >= 80
              ? "good"
              : healthScoreResult.components.adoption.score >= 60
              ? "warning"
              : "critical",
        },
        {
          name: "Churn Risk Score",
          score: Math.round(healthScoreResult.components.churnRisk.score),
          weight: `${(
            healthScoreResult.components.churnRisk.weight * 100
          ).toFixed(0)}%`,
          trend: "N/A",
          status:
            healthScoreResult.components.churnRisk.score >= 80
              ? "good"
              : healthScoreResult.components.churnRisk.score >= 60
              ? "warning"
              : "critical",
        },
        {
          name: "Account Context",
          score: Math.round(healthScoreResult.components.accountContext.score),
          weight: `${(
            healthScoreResult.components.accountContext.weight * 100
          ).toFixed(0)}%`,
          trend: "N/A",
          status:
            healthScoreResult.components.accountContext.score >= 80
              ? "good"
              : healthScoreResult.components.accountContext.score >= 60
              ? "warning"
              : "critical",
        },
      ]
    : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    if (status === "good")
      return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    if (status === "warning")
      return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="User Health Score"
        description="Monitor user engagement and satisfaction metrics"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Overall Health Score</CardTitle>
            <CardDescription>Average across all users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="relative h-40 w-40">
                  <svg className="h-40 w-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * overallHealthScore) / 100}
                      className={getScoreColor(overallHealthScore)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-4xl font-bold ${getScoreColor(
                        overallHealthScore
                      )}`}
                    >
                      {overallHealthScore}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground mt-4">
              {loading
                ? "Loading metrics..."
                : `Based on ${healthMetrics.length} key metrics`}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Health Metrics Breakdown</CardTitle>
            <CardDescription>
              Individual metric scores and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : healthMetrics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No health metrics data available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {healthMetrics?.map((metric, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{metric.name}</p>
                        {getStatusBadge(metric.status)}
                        {(metric as any).weight && (
                          <Badge variant="outline" className="text-xs">
                            Weight: {(metric as any).weight}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            metric.score >= 80
                              ? "bg-green-600"
                              : metric.score >= 60
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p
                        className={`text-lg font-bold ${getScoreColor(
                          metric.score
                        )}`}
                      >
                        {metric.score}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Insights Section */}
      {healthScoreResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              AI-Powered Insights & Recommendations
            </h2>
            <Badge
              variant={
                healthScoreResult.scoreRange === "healthy"
                  ? "default"
                  : healthScoreResult.scoreRange === "at-risk"
                  ? "secondary"
                  : healthScoreResult.scoreRange === "warning"
                  ? "outline"
                  : "destructive"
              }
            >
              {healthScoreResult.scoreRange.toUpperCase()}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Recommendations Card */}
            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
                <CardDescription>
                  Recommended actions to improve health score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthScoreResult.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {healthScoreResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              rec.includes("URGENT") || rec.includes("Critical")
                                ? "bg-red-600"
                                : rec.includes("High")
                                ? "bg-yellow-600"
                                : "bg-blue-600"
                            }`}
                          />
                        </div>
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No specific recommendations at this time. User is performing
                    well.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Signals Card */}
            <Card>
              <CardHeader>
                <CardTitle>Key Signals</CardTitle>
                <CardDescription>
                  Positive and negative indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthScoreResult.signals.positive.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">
                        ✓ Positive Signals
                      </p>
                      <div className="space-y-1">
                        {healthScoreResult.signals.positive.map((signal, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            • {signal}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {healthScoreResult.signals.negative.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-2">
                        ⚠ Negative Signals
                      </p>
                      <div className="space-y-1">
                        {healthScoreResult.signals.negative.map((signal, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            • {signal}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {healthScoreResult.signals.positive.length === 0 &&
                    healthScoreResult.signals.negative.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Insufficient data for signal analysis
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LLM Context for AI Integration */}
          <Card>
            <CardHeader>
              <CardTitle>LLM-Ready Context</CardTitle>
              <CardDescription>
                Structured data for AI-powered churn reduction and revenue
                optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Summary</p>
                  <p className="text-sm text-muted-foreground">
                    {healthScoreResult.llmContext.summary}
                  </p>
                </div>

                {healthScoreResult.llmContext.riskFactors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Risk Factors</p>
                    <div className="space-y-1">
                      {healthScoreResult.llmContext.riskFactors.map(
                        (risk, i) => (
                          <p key={i} className="text-sm text-red-600">
                            • {risk}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

                {healthScoreResult.llmContext.opportunities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Opportunities</p>
                    <div className="space-y-1">
                      {healthScoreResult.llmContext.opportunities.map(
                        (opp, i) => (
                          <p key={i} className="text-sm text-green-600">
                            • {opp}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="text-sm font-medium cursor-pointer">
                    View Full Metrics (JSON for LLM)
                  </summary>
                  <pre className="mt-2 text-xs bg-slate-900 text-slate-50 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(
                      healthScoreResult.llmContext.metrics,
                      null,
                      2
                    )}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Session Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Session Analytics
          </h2>
        </div>

        {/* Session Overview Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.overview?.total_sessions?.toLocaleString() ||
                      0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total sessions
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Users
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.overview?.unique_users?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Unique users</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Duration
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.overview?.avg_session_duration || "0m"}
                  </div>
                  <p className="text-xs text-muted-foreground">Average time</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.overview?.bounce_rate || "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">Bounce rate</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.overview?.return_visitor_rate || "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Returning visitors
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DAU</CardTitle>
              <Badge variant="secondary">Daily</Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.engagement?.dau?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Daily Active Users
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WAU</CardTitle>
              <Badge variant="secondary">Weekly</Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.engagement?.wau?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Weekly Active Users
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MAU</CardTitle>
              <Badge variant="secondary">Monthly</Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.engagement?.mau?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monthly Active Users
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stickiness</CardTitle>
              <Badge variant="secondary">DAU/MAU</Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {sessionData?.engagement?.stickiness_ratio || "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Engagement ratio
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Session & User Trends</CardTitle>
            <CardDescription>
              {sessionData?.meta?.date_range ||
                "Daily sessions and unique users over time"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartContainer
                config={{
                  sessions: {
                    label: "Sessions",
                    color: "hsl(var(--chart-1))",
                  },
                  users: {
                    label: "Unique Users",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionData?.time_series || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Date
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {payload[0].payload.date}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Sessions
                                  </span>
                                  <span className="font-bold">
                                    {payload[0].value}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Users
                                  </span>
                                  <span className="font-bold">
                                    {payload[1]?.value || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="var(--color-sessions)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-sessions)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="var(--color-users)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-users)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Additional Session Insights */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Quality Metrics</CardTitle>
              <CardDescription>
                Insights into user engagement and behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Session Frequency
                    </p>
                    <p className="text-2xl font-bold">
                      {sessionData?.engagement?.session_frequency || "0"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sessions per user
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Data Points
                    </p>
                    <p className="text-2xl font-bold">
                      {sessionData?.meta?.data_points || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Days analyzed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Events
                    </p>
                    <p className="text-2xl font-bold">
                      {sessionData?.meta?.total_events?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Events tracked
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Events per Session
                    </p>
                    <p className="text-2xl font-bold">
                      {sessionData?.overview?.total_sessions &&
                      sessionData?.meta?.total_events
                        ? Math.round(
                            sessionData.meta.total_events /
                              sessionData.overview.total_sessions
                          )
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Average activity
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Session Insights</CardTitle>
              <CardDescription>
                Performance indicators and trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5 text-green-600 dark:text-green-400"
                        >
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">High Engagement</p>
                        <p className="text-xs text-muted-foreground">
                          {sessionData?.overview?.return_visitor_rate || "0%"}{" "}
                          users return
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {sessionData?.overview?.return_visitor_rate || "0%"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5 text-blue-600 dark:text-blue-400"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Avg. Session Time</p>
                        <p className="text-xs text-muted-foreground">
                          Time spent per visit
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {sessionData?.overview?.avg_session_duration || "0m"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5 text-purple-600 dark:text-purple-400"
                        >
                          <path d="M3 3v18h18" />
                          <path d="M18 17V9" />
                          <path d="M13 17V5" />
                          <path d="M8 17v-3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">User Stickiness</p>
                        <p className="text-xs text-muted-foreground">
                          DAU/MAU ratio
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {sessionData?.engagement?.stickiness_ratio || "0%"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Churn Risk Analysis
          </h2>
        </div>
        <ChurnRiskCard
          stats={churnStats}
          users={churnData || []}
          loading={loading}
        />
      </div>
    </div>
  );
}
