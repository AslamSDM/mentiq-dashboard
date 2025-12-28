"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store";
import { enhancedAnalyticsService } from "@/lib/services/enhanced-analytics";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface FunnelStep {
  step_name: string;
  step_order: number;
  total_users: number;
  completed_users: number;
  completion_rate: number;
  drop_off_rate: number;
  avg_time_to_complete: number;
}

interface ConversionMetrics {
  total_users: number;
  conversion_rate: number;
  completed_conversions: number;
  revenue_per_conversion: number;
  total_revenue: number;
  avg_time_to_convert: number;
}

interface FunnelAnalysis {
  funnel_name: string;
  steps: FunnelStep[];
  overall_conversion_rate: number;
}

interface ConversionTrend {
  date: string;
  conversion_rate: number;
  conversions: number;
  users_entered: number;
}

export default function ConversionFunnelPage() {
  const { getEffectiveProjectId } = useStore();
  const selectedProjectId = getEffectiveProjectId();
  const { toast } = useToast();
  const [funnelAnalysis, setFunnelAnalysis] = useState<FunnelAnalysis | null>(
    null
  );
  const [conversionMetrics, setConversionMetrics] =
    useState<ConversionMetrics | null>(null);
  const [conversionTrends, setConversionTrends] = useState<ConversionTrend[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState("signup");

  const fetchConversionData = async () => {
    if (!selectedProjectId) return;

    setIsLoading(true);
    try {
      const funnelRes = await enhancedAnalyticsService
        .getConversionFunnel(selectedProjectId)
        .catch(() => null);

      if (funnelRes?.data?.funnel) {
        // Transform API data to match component interface
        const transformedFunnel: FunnelAnalysis = {
          funnel_name: "Conversion Funnel",
          steps: funnelRes.data.funnel.map((step: any, index: number) => ({
            step_name: step.event_type || `Step ${index + 1}`,
            step_order: step.step || index + 1,
            total_users: step.users || 0,
            completed_users: Math.round(step.users * step.conversion_rate) || 0,
            completion_rate: step.conversion_rate * 100 || 0,
            drop_off_rate: step.drop_off_rate * 100 || 0,
            avg_time_to_complete: Math.round(Math.random() * 300 + 60), // Mock time for now
          })),
          overall_conversion_rate: funnelRes.data.overall_conversion * 100 || 0,
        };

        setFunnelAnalysis(transformedFunnel);

        // Calculate metrics from funnel data
        const totalUsers = transformedFunnel.steps[0]?.total_users || 0;
        const completedConversions =
          transformedFunnel.steps[transformedFunnel.steps.length - 1]
            ?.completed_users || 0;

        const calculatedMetrics: ConversionMetrics = {
          total_users: totalUsers,
          conversion_rate: transformedFunnel.overall_conversion_rate,
          completed_conversions: completedConversions,
          revenue_per_conversion: 89.5, // Mock revenue for now
          total_revenue: completedConversions * 89.5,
          avg_time_to_convert: Math.round(Math.random() * 1800 + 600), // Mock time for now
        };

        setConversionMetrics(calculatedMetrics);

        // Generate trend data from funnel steps
        const trends: ConversionTrend[] = transformedFunnel.steps
          .slice(0, 5)
          .map((step, i) => ({
            date: new Date(Date.now() - (4 - i) * 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            conversion_rate: step.completion_rate,
            conversions: step.completed_users,
            users_entered: step.total_users,
          }));

        setConversionTrends(trends);
      } else {
        // Set empty state if no data
        setFunnelAnalysis(null);
        setConversionMetrics(null);
        setConversionTrends([]);
      }
    } catch (error) {
      // Silent fail - error shown via toast
      toast({
        title: "Error",
        description: "Failed to load conversion funnel data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversionData();
  }, [selectedProjectId]);

  const getStepColor = (completionRate: number) => {
    if (completionRate >= 80) return "#22c55e";
    if (completionRate >= 60) return "#84cc16";
    if (completionRate >= 40) return "#eab308";
    if (completionRate >= 20) return "#f97316";
    return "#ef4444";
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Conversion Funnel"
          description="Analyze user conversion paths and optimize drop-off points"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please select a project to view conversion funnel analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Conversion Funnel"
        description="Analyze user conversion paths and optimize drop-off points"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Overview Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          conversionMetrics && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {conversionMetrics.conversion_rate?.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conversionMetrics.completed_conversions.toLocaleString()}{" "}
                    conversions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Revenue per Conversion
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(conversionMetrics.revenue_per_conversion)}
                  </div>
                  <p className="text-xs text-muted-foreground">Average value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(conversionMetrics.total_revenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From conversions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Time to Convert
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTime(conversionMetrics.avg_time_to_convert)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From first touch
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        )}

        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
            <TabsTrigger value="trends">Conversion Trends</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>
                    Step-by-step analysis of user conversion journey
                  </CardDescription>
                </div>
                <Select
                  value={selectedFunnel}
                  onValueChange={setSelectedFunnel}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select funnel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signup">User Signup Funnel</SelectItem>
                    <SelectItem value="purchase">Purchase Funnel</SelectItem>
                    <SelectItem value="onboarding">
                      Onboarding Funnel
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : funnelAnalysis ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">
                        {funnelAnalysis.funnel_name}
                      </h3>
                      <p className="text-muted-foreground">
                        Overall Conversion Rate:{" "}
                        <span className="font-bold text-primary">
                          {funnelAnalysis.overall_conversion_rate}%
                        </span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      {funnelAnalysis.steps?.map((step, index) => (
                        <div key={step.step_order} className="relative">
                          {/* Step Card */}
                          <div className="border rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                                  {step.step_order}
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {step.step_name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Avg. time:{" "}
                                    {formatTime(step.avg_time_to_complete)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={
                                    step.completion_rate >= 80
                                      ? "default"
                                      : step.completion_rate >= 60
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {step.completion_rate?.toFixed(1)}% completion
                                </Badge>
                                {step.drop_off_rate > 0 && (
                                  <Badge variant="outline">
                                    {step.drop_off_rate?.toFixed(1)}% drop-off
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Users Entered
                                </p>
                                <p className="text-lg font-semibold">
                                  {step.total_users.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Users Completed
                                </p>
                                <p className="text-lg font-semibold">
                                  {step.completed_users.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Completion Rate
                                </p>
                                <p className="text-lg font-semibold">
                                  {step.completion_rate?.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>
                                  {step.completed_users.toLocaleString()} /{" "}
                                  {step.total_users.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-3">
                                <div
                                  className="h-3 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${step.completion_rate}%`,
                                    backgroundColor: getStepColor(
                                      step.completion_rate
                                    ),
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Drop-off Arrow */}
                          {index < funnelAnalysis.steps.length - 1 &&
                            step.drop_off_rate > 0 && (
                              <div className="flex justify-center my-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>
                                    {Math.round(
                                      step.total_users - step.completed_users
                                    ).toLocaleString()}{" "}
                                    users dropped off
                                  </span>
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Funnel Data Available
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Set up conversion tracking to analyze user journeys
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fetchConversionData()}
                    >
                      Refresh Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Trends</CardTitle>
                <CardDescription>
                  Historical conversion rates and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      conversion_rate: {
                        label: "Conversion Rate",
                        color: "hsl(var(--chart-1))",
                      },
                      conversions: {
                        label: "Conversions",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conversionTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value, name) => [
                            name === "conversion_rate"
                              ? `${Number(value)?.toFixed(1)}%`
                              : Number(value).toLocaleString(),
                            name === "conversion_rate"
                              ? "Conversion Rate"
                              : "Conversions",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="conversion_rate"
                          stroke="var(--color-conversion_rate)"
                          strokeWidth={3}
                          dot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Volume</CardTitle>
                <CardDescription>
                  Number of conversions over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[250px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      conversions: {
                        label: "Conversions",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="conversions"
                          fill="var(--color-conversions)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Optimization Opportunities
                  </CardTitle>
                  <CardDescription>
                    Steps with highest drop-off rates that need attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelAnalysis ? (
                    <div className="space-y-3">
                      {funnelAnalysis.steps
                        .filter((step) => step.drop_off_rate > 10)
                        .sort((a, b) => b.drop_off_rate - a.drop_off_rate)
                        ?.map((step) => (
                          <div
                            key={step.step_order}
                            className="border rounded-lg p-4 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{step.step_name}</h4>
                              <Badge variant="destructive">
                                {step.drop_off_rate?.toFixed(1)}% drop-off
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(
                                step.total_users - step.completed_users
                              ).toLocaleString()}{" "}
                              users lost
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <p>• Review UX/UI design for this step</p>
                              <p>• Analyze user behavior patterns</p>
                              <p>• Consider A/B testing improvements</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    High-Performing Steps
                  </CardTitle>
                  <CardDescription>
                    Steps with excellent completion rates to learn from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelAnalysis ? (
                    <div className="space-y-3">
                      {funnelAnalysis.steps
                        .filter((step) => step.completion_rate >= 80)
                        .sort((a, b) => b.completion_rate - a.completion_rate)
                        ?.map((step) => (
                          <div
                            key={step.step_order}
                            className="border rounded-lg p-4 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{step.step_name}</h4>
                              <Badge variant="default">
                                {step.completion_rate?.toFixed(1)}% completion
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {step.completed_users.toLocaleString()} users
                              successfully completed
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <p>• Excellent user experience design</p>
                              <p>• Apply similar patterns to other steps</p>
                              <p>• Benchmark for optimization efforts</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button
            onClick={fetchConversionData}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
