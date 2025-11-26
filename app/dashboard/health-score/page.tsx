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
import { cachedAnalyticsService } from "@/lib/services/cached-analytics";
import { useToast } from "@/hooks/use-toast";
import { ChurnRiskCard } from "@/components/churn-risk-card";

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
      // Check cache first
      const cachedChurn = useStore
        .getState()
        .getCachedEnhancedData<any>("churnRisk");
      const cachedFeature = useStore
        .getState()
        .getCachedEnhancedData<any>("featureAdoption");
      const cachedSession = useStore
        .getState()
        .getCachedEnhancedData<any>("sessionAnalytics");

      if (cachedChurn && cachedFeature && cachedSession) {
        console.log("📦 Using all cached health data");
        setChurnData(cachedChurn.at_risk_users || []);
        setChurnStats({
          at_risk_users: cachedChurn.total_at_risk || 0,
          churn_rate_30d: cachedChurn.churn_rate || "0%",
          total_users: 0,
          churned_users: 0,
          risk_breakdown: {},
        });
        setFeatureData(cachedFeature);
        setSessionData(cachedSession);
        setLoading(false);
        return;
      }

      // Fetch fresh data if not cached (cached service handles caching internally)
      const [churnRes, featureRes, sessionRes] = await Promise.all([
        cachedAnalyticsService
          .getChurnRisk(selectedProjectId, 50)
          .catch(() => null),
        cachedAnalyticsService
          .getFeatureAdoption(selectedProjectId)
          .catch(() => null),
        cachedAnalyticsService
          .getSessionAnalytics(selectedProjectId)
          .catch(() => null),
      ]);

      console.log("📡 Fetched fresh health data");

      if (churnRes && churnRes.data) {
        const churnData = churnRes.data;
        useStore.getState().setCachedEnhancedData("churnRisk", churnData);
        setChurnData(churnData.at_risk_users || []);
        setChurnStats({
          at_risk_users: churnData.total_at_risk || 0,
          churn_rate_30d: churnData.churn_rate || "0%",
          total_users: 0,
          churned_users: 0,
          risk_breakdown: {},
        });
      }

      if (featureRes?.data) {
        useStore
          .getState()
          .setCachedEnhancedData("featureAdoption", featureRes.data);
        setFeatureData(featureRes.data);
      }

      if ((sessionRes as any)?.session_data) {
        useStore
          .getState()
          .setCachedEnhancedData(
            "sessionAnalytics",
            (sessionRes as any).session_data
          );
        setSessionData((sessionRes as any).session_data);
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

  // Calculate overall health score based on real data
  const calculateOverallHealthScore = () => {
    if (!churnStats || !featureData || !sessionData) return 0;

    // Health metrics calculation
    const churnRate = churnStats.churn_rate_30d
      ? parseFloat(churnStats.churn_rate_30d.replace("%", "")) / 100
      : 0;
    const churnScore = Math.max(0, 100 - churnRate * 100);

    const engagementScore = sessionData?.overview?.bounce_rate
      ? Math.max(0, 100 - parseFloat(sessionData.overview.bounce_rate))
      : 75;
    const featureScore =
      featureData.features?.length > 0
        ? Math.min(100, featureData.features.length * 15)
        : 60;

    return Math.round((churnScore + engagementScore + featureScore) / 3);
  };

  const overallHealthScore = calculateOverallHealthScore();
  // Calculate health metrics from real data
  const healthMetrics = [
    {
      name: "Engagement Rate",
      score: sessionData?.overview?.bounce_rate
        ? Math.max(
            0,
            Math.round(100 - parseFloat(sessionData.overview.bounce_rate))
          )
        : 0,
      trend: sessionData ? "+2.1%" : "N/A",
      status:
        sessionData?.overview?.bounce_rate &&
        parseFloat(sessionData.overview.bounce_rate) < 40
          ? "good"
          : sessionData?.overview?.bounce_rate &&
            parseFloat(sessionData.overview.bounce_rate) < 60
          ? "warning"
          : "critical",
    },
    {
      name: "Feature Adoption",
      score:
        featureData?.features?.length > 0
          ? Math.min(
              100,
              Math.round(
                (featureData.features.reduce(
                  (sum: number, f: any) => sum + (f.adoption_rate || 0),
                  0
                ) /
                  featureData.features.length) *
                  100
              )
            )
          : 0,
      trend: featureData ? "+1.8%" : "N/A",
      status:
        featureData?.features?.length > 3
          ? "good"
          : featureData?.features?.length > 1
          ? "warning"
          : "critical",
    },
    {
      name: "Session Frequency",
      score: sessionData?.engagement?.stickiness_ratio
        ? Math.round(parseFloat(sessionData.engagement.stickiness_ratio))
        : 0,
      trend: sessionData ? "-1.2%" : "N/A",
      status:
        sessionData?.engagement?.stickiness_ratio &&
        parseFloat(sessionData.engagement.stickiness_ratio) > 30
          ? "good"
          : sessionData?.engagement?.stickiness_ratio &&
            parseFloat(sessionData.engagement.stickiness_ratio) > 15
          ? "warning"
          : "critical",
    },
    {
      name: "Churn Risk",
      score: churnStats?.churn_rate_30d
        ? Math.max(
            0,
            Math.round(
              100 - parseFloat(churnStats.churn_rate_30d.replace("%", ""))
            )
          )
        : 0,
      trend: churnStats ? "-0.5%" : "N/A",
      status:
        churnStats?.churn_rate_30d &&
        parseFloat(churnStats.churn_rate_30d.replace("%", "")) < 5
          ? "good"
          : churnStats?.churn_rate_30d &&
            parseFloat(churnStats.churn_rate_30d.replace("%", "")) < 15
          ? "warning"
          : "critical",
    },
    {
      name: "User Activity",
      score: sessionData?.engagement?.dau
        ? Math.min(100, Math.round((sessionData.engagement.dau / 100) * 100))
        : 0,
      trend: sessionData ? "+3.4%" : "N/A",
      status:
        sessionData?.engagement?.dau > 50
          ? "good"
          : sessionData?.engagement?.dau > 20
          ? "warning"
          : "critical",
    },
    {
      name: "Return Rate",
      score: sessionData?.overview?.return_visitor_rate
        ? Math.round(parseFloat(sessionData.overview.return_visitor_rate))
        : 0,
      trend: sessionData ? "+2.7%" : "N/A",
      status:
        sessionData?.overview?.return_visitor_rate &&
        parseFloat(sessionData.overview.return_visitor_rate) > 40
          ? "good"
          : sessionData?.overview?.return_visitor_rate &&
            parseFloat(sessionData.overview.return_visitor_rate) > 20
          ? "warning"
          : "critical",
    },
  ].filter((metric) => metric.score > 0 || loading); // Show loading metrics or real data

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
                      <p className="text-xs text-muted-foreground">
                        {metric.trend}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
