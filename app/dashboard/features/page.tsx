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
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Funnel</CardTitle>
                  <CardDescription>
                    Step-by-step breakdown of user progression
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {onboarding.steps.map((step, index) => (
                    <div key={step.step_name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{step.step_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {step.users_completed} / {step.users_reached}{" "}
                              users completed
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                step.completion_rate > 80
                                  ? "default"
                                  : step.completion_rate > 50
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {Math.round(step.completion_rate)}%
                            </Badge>
                            {step.dropoff_rate > 30 && (
                              <Badge variant="destructive">High Dropoff</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Avg: {formatDuration(step.avg_time_to_complete)}
                          </div>
                        </div>
                      </div>

                      <Progress value={step.completion_rate} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

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
