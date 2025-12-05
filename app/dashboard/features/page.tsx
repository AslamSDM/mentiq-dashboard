"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store";
import { getAuthToken } from "@/lib/services/base";
import {
  TrendingUp,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  Target,
} from "lucide-react";

interface FeatureUsageStats {
  feature_name: string;
  total_users: number;
  unique_users: number;
  total_usages: number;
  first_used: string;
  last_used: string;
  avg_usage_per_user: number;
  adoption_rate: number;
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  retention_rate: number;
}

interface OnboardingStep {
  step_name: string;
  step_index: number;
  users_reached: number;
  users_completed: number;
  completion_rate: number;
  avg_time_to_complete: number;
  dropoff_rate: number;
  first_seen: string;
  last_seen: string;
}

interface OnboardingFunnelStats {
  funnel_name: string;
  total_started: number;
  total_completed: number;
  completion_rate: number;
  avg_completion_time: number;
  steps: OnboardingStep[];
  dropoff_points: string[];
}

export default function FeatureTrackingDashboard() {
  const { selectedProjectId } = useStore();
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureUsageStats[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingFunnelStats | null>(
    null
  );
  const [selectedStep, setSelectedStep] = useState<OnboardingStep | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dateRange, setDateRange] = useState("30"); // days

  useEffect(() => {
    if (selectedProjectId) {
      fetchData();
    }
  }, [selectedProjectId, dateRange]);

  const fetchData = async () => {
    if (!selectedProjectId) return;

    setLoading(true);
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(
        Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0];

      const token = getAuthToken();
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch feature usage
      const featureResponse = await fetch(
        `${API_BASE_URL}/api/v1/projects/${selectedProjectId}/features/usage?start_date=${startDate}&end_date=${endDate}`,
        { headers }
      );

      if (featureResponse.ok) {
        const featureData = await featureResponse.json();
        // Backend returns {features: [...], total_users: N, date_range: {...}}
        setFeatures(featureData.features || []);
        setTotalUsers(featureData.total_users || 0);
      } else {
        console.error("Feature usage request failed:", featureResponse.status);
      }

      // Fetch onboarding stats
      const onboardingResponse = await fetch(
        `${API_BASE_URL}/api/v1/projects/${selectedProjectId}/onboarding/stats?start_date=${startDate}&end_date=${endDate}`,
        { headers }
      );

      if (onboardingResponse.ok) {
        const onboardingData = await onboardingResponse.json();
        // Backend returns funnel stats directly
        setOnboarding(onboardingData);
        // Set first step as selected
        if (onboardingData?.steps && onboardingData.steps.length > 0) {
          setSelectedStep(onboardingData.steps[0]);
        }
      } else {
        console.error(
          "Onboarding stats request failed:",
          onboardingResponse.status
        );
      }
    } catch (error) {
      console.error("Error fetching feature tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!selectedProjectId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Please select a project to view feature tracking
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Tracking</h1>
          <p className="text-muted-foreground">
            Monitor feature adoption and onboarding progress
          </p>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-background border rounded-lg"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{features.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tracked in this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Using features
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Adoption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {features.length > 0
                    ? Math.round(
                        features.reduce((sum, f) => sum + f.adoption_rate, 0) /
                          features.length
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all features
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Retention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {features.length > 0
                    ? Math.round(
                        features.reduce((sum, f) => sum + f.retention_rate, 0) /
                          features.length
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Return to features
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading feature data...
                </CardContent>
              </Card>
            ) : features.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No feature usage data available for this period
                </CardContent>
              </Card>
            ) : (
              features
                .sort((a, b) => b.adoption_rate - a.adoption_rate)
                .map((feature) => (
                  <Card key={feature.feature_name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Zap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {feature.feature_name}
                            </CardTitle>
                            <CardDescription>
                              {feature.unique_users} users •{" "}
                              {feature.total_usages} total uses
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            feature.adoption_rate > 50 ? "default" : "secondary"
                          }
                        >
                          {Math.round(feature.adoption_rate)}% adoption
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Avg Usage
                          </div>
                          <div className="text-lg font-semibold">
                            {feature.avg_usage_per_user.toFixed(1)}x
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Retention
                          </div>
                          <div className="text-lg font-semibold">
                            {Math.round(feature.retention_rate)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Daily Active
                          </div>
                          <div className="text-lg font-semibold">
                            {feature.daily_active_users}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Weekly Active
                          </div>
                          <div className="text-lg font-semibold">
                            {feature.weekly_active_users}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Adoption Rate
                          </span>
                          <span className="font-medium">
                            {Math.round(feature.adoption_rate)}%
                          </span>
                        </div>
                        <Progress
                          value={feature.adoption_rate}
                          className="h-2"
                        />
                      </div>

                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                        First used: {formatDate(feature.first_used)} • Last
                        used: {formatDate(feature.last_used)}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading onboarding data...
              </CardContent>
            </Card>
          ) : !onboarding || onboarding.total_started === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No onboarding data available for this period
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Onboarding Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {onboarding.total_started}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Users began onboarding
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {onboarding.total_completed}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Finished onboarding
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(onboarding.completion_rate)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Success rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(onboarding.avg_completion_time)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      To complete
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Onboarding Funnel */}
              <div className="space-y-4">
                {/* Step Selector */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Funnel Step</CardTitle>
                    <CardDescription>
                      Choose a step to view detailed metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {onboarding.steps.map((step, index) => (
                        <button
                          key={step.step_name}
                          onClick={() => setSelectedStep(step)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedStep?.step_name === step.step_name
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                                selectedStep?.step_name === step.step_name
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </div>
                            {step.completion_rate >= 80 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : step.completion_rate < 50 ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : null}
                          </div>
                          <div className="text-sm font-medium line-clamp-2 mb-1">
                            {step.step_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(step.completion_rate)}% complete
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Horizontal Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Onboarding Funnel Overview</CardTitle>
                    <CardDescription>
                      Completion rates across all steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        completion_rate: {
                          label: "Completion Rate",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={onboarding.steps}
                          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="step_name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis domain={[0, 100]} />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                            formatter={(value) => [
                              `${Number(value)?.toFixed(1)}%`,
                              "Completion Rate",
                            ]}
                          />
                          <Bar
                            dataKey="completion_rate"
                            fill="var(--color-completion_rate)"
                            radius={[8, 8, 0, 0]}
                            animationDuration={1500}
                            animationBegin={0}
                            animationEasing="ease-out"
                            onClick={(data) => setSelectedStep(data)}
                            cursor="pointer"
                          >
                            {onboarding.steps.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.step_name === selectedStep?.step_name
                                    ? "hsl(var(--primary))"
                                    : entry.completion_rate >= 80
                                    ? "#22c55e"
                                    : entry.completion_rate >= 60
                                    ? "#84cc16"
                                    : entry.completion_rate >= 40
                                    ? "#eab308"
                                    : "#ef4444"
                                }
                                opacity={
                                  entry.step_name === selectedStep?.step_name
                                    ? 1
                                    : 0.8
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Step Details Section */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Step Details Card */}
                {selectedStep && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-medium">
                          {selectedStep.step_index + 1}
                        </div>
                        <div>
                          <CardTitle>{selectedStep.step_name}</CardTitle>
                          <CardDescription>
                            Step {selectedStep.step_index + 1} of{" "}
                            {onboarding.steps.length}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                              Completion Rate
                            </p>
                            <p className="text-3xl font-bold">
                              {Math.round(selectedStep.completion_rate)}%
                            </p>
                            <Badge
                              variant={
                                selectedStep.completion_rate > 80
                                  ? "default"
                                  : selectedStep.completion_rate > 50
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="mt-2"
                            >
                              {selectedStep.completion_rate > 80
                                ? "Excellent"
                                : selectedStep.completion_rate > 50
                                ? "Good"
                                : "Needs Attention"}
                            </Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                              Dropoff Rate
                            </p>
                            <p className="text-3xl font-bold">
                              {Math.round(selectedStep.dropoff_rate)}%
                            </p>
                            {selectedStep.dropoff_rate > 30 && (
                              <Badge variant="destructive" className="mt-2">
                                High Dropoff
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* User Metrics */}
                        <div className="space-y-3 border-t pt-4">
                          <h4 className="font-medium">User Progress</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Users Reached
                              </span>
                              <span className="text-sm font-bold">
                                {selectedStep.users_reached.toLocaleString()}
                              </span>
                            </div>
                            <Progress value={100} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Users Completed
                              </span>
                              <span className="text-sm font-bold">
                                {selectedStep.users_completed.toLocaleString()}
                              </span>
                            </div>
                            <Progress
                              value={selectedStep.completion_rate}
                              className="h-2"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Users Dropped Off
                              </span>
                              <span className="text-sm font-bold text-destructive">
                                {(
                                  selectedStep.users_reached -
                                  selectedStep.users_completed
                                ).toLocaleString()}
                              </span>
                            </div>
                            <Progress
                              value={selectedStep.dropoff_rate}
                              className="h-2 bg-destructive/20"
                            />
                          </div>
                        </div>

                        {/* Additional Metrics */}
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Avg time to complete
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatDuration(
                                selectedStep.avg_time_to_complete
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">First seen</span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatDate(selectedStep.first_seen)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Last seen</span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatDate(selectedStep.last_seen)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!selectedStep && onboarding.steps.length > 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-[400px]">
                      <Target className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Select a step above or click on the chart to see
                        detailed metrics
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Dropoff Points */}
              {onboarding.dropoff_points.length > 0 && (
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      High Dropoff Points
                    </CardTitle>
                    <CardDescription>
                      Steps where users are most likely to abandon onboarding
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {onboarding.dropoff_points.map((point) => (
                        <div
                          key={point}
                          className="flex items-center gap-2 p-2 rounded bg-destructive/10"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="font-medium">{point}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
