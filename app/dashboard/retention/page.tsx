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
  Cell,
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
  Users,
  TrendingDown,
  Calendar,
  Target,
  BarChart3,
} from "lucide-react";

interface CohortData {
  cohort_date: string;
  cohort_size: number;
  day_0: number;
  day_1: number;
  day_7: number;
  day_30: number;
  day_90: number;
  day_180: number;
  day_365: number;
}

interface RetentionMetrics {
  total_users: number;
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  rolling_retention: number;
  churn_rate: number;
}

interface CohortHeatmapData {
  cohort: string;
  period: number;
  retention_rate: number;
  users_count: number;
}

export default function RetentionPage() {
  const { selectedProjectId } = useStore();
  const { toast } = useToast();
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [retentionMetrics, setRetentionMetrics] =
    useState<RetentionMetrics | null>(null);
  const [heatmapData, setHeatmapData] = useState<CohortHeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);

  const fetchRetentionData = async () => {
    if (!selectedProjectId) return;

    setIsLoading(true);
    try {
      // Fetch real cohort data from API
      const response = await enhancedAnalyticsService.getRetentionCohorts(
        selectedProjectId
      );
      const apiCohorts = response?.cohorts || response?.data?.cohorts || [];

      // Transform API response to match our UI format
      const transformedCohorts: CohortData[] = apiCohorts.map((cohort: any) => {
        // Extract retention rates from retention object
        const retention = cohort.retention || {};

        return {
          cohort_date: cohort.cohort_date || cohort.cohort_month || cohort.cohort || "Unknown",
          cohort_size: cohort.users || cohort.cohort_size || 0,
          day_0: 100, // Always 100% on signup day
          day_1: retention["day_1"] || 0,
          day_7: retention["day_7"] || 0,
          day_30: retention["day_30"] || 0,
          day_90: retention["day_90"] || 0,
          day_180: retention["day_180"] || 0,
          day_365: retention["day_365"] || 0,
        };
      });

      // Calculate overall retention metrics
      let totalUsers = 0;
      let day1RetentionSum = 0;
      let day7RetentionSum = 0;
      let day30RetentionSum = 0;
      let validCohorts = 0;

      transformedCohorts.forEach((cohort) => {
        totalUsers += cohort.cohort_size;
        if (cohort.day_1 > 0) {
          day1RetentionSum += cohort.day_1;
          validCohorts++;
        }
        if (cohort.day_7 > 0) day7RetentionSum += cohort.day_7;
        if (cohort.day_30 > 0) day30RetentionSum += cohort.day_30;
      });

      const calculatedMetrics: RetentionMetrics = {
        total_users: totalUsers,
        day_1_retention: validCohorts > 0 ? day1RetentionSum / validCohorts : 0,
        day_7_retention: validCohorts > 0 ? day7RetentionSum / validCohorts : 0,
        day_30_retention:
          validCohorts > 0 ? day30RetentionSum / validCohorts : 0,
        rolling_retention:
          validCohorts > 0
            ? (day1RetentionSum + day7RetentionSum + day30RetentionSum) /
              (validCohorts * 3)
            : 0,
        churn_rate:
          validCohorts > 0 ? 100 - day30RetentionSum / validCohorts : 0,
      };

      // Generate heatmap data
      const heatmapData: CohortHeatmapData[] = [];
      transformedCohorts.forEach((cohort) => {
        const periods = [
          { period: 0, rate: cohort.day_0 },
          { period: 1, rate: cohort.day_1 },
          { period: 7, rate: cohort.day_7 },
          { period: 30, rate: cohort.day_30 },
          { period: 90, rate: cohort.day_90 },
          { period: 180, rate: cohort.day_180 },
        ];

        periods.forEach(({ period, rate }) => {
          if (rate > 0) {
            heatmapData.push({
              cohort: cohort.cohort_date,
              period,
              retention_rate: rate,
              users_count: Math.round((cohort.cohort_size * rate) / 100),
            });
          }
        });
      });

      setCohortData(transformedCohorts);
      setRetentionMetrics(calculatedMetrics);
      setHeatmapData(heatmapData);

      if (transformedCohorts.length > 0) {
        setSelectedCohort(transformedCohorts[0].cohort_date);
      }
    } catch (error) {
      console.error("Error fetching retention data:", error);
      toast({
        title: "Error",
        description: "Failed to load retention data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchRetentionData();
    }
  }, [selectedProjectId]);

  const getRetentionStatus = (rate: number) => {
    if (rate >= 40) return { status: "Excellent", color: "default" };
    if (rate >= 25) return { status: "Good", color: "secondary" };
    if (rate >= 15) return { status: "Fair", color: "outline" };
    return { status: "Poor", color: "destructive" };
  };

  const getRetentionColor = (rate: number) => {
    if (rate >= 60) return "#22c55e";
    if (rate >= 40) return "#84cc16";
    if (rate >= 25) return "#eab308";
    if (rate >= 15) return "#f97316";
    return "#ef4444";
  };

  const selectedCohortData = cohortData.find(
    (c) => c.cohort_date === selectedCohort
  );

  // Prepare trend data for selected period
  const trendData = cohortData
    ?.map((cohort) => ({
      date: cohort.cohort_date,
      retention:
        selectedPeriod === "1"
          ? cohort.day_1
          : selectedPeriod === "7"
          ? cohort.day_7
          : selectedPeriod === "30"
          ? cohort.day_30
          : selectedPeriod === "90"
          ? cohort.day_90
          : cohort.day_180,
      cohort_size: cohort.cohort_size,
    }))
    .filter((item) => item.retention > 0);

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Retention Analysis"
          description="Track user retention across cohorts and time periods"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please select a project to view retention analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Retention Analysis"
        description="Track user retention across cohorts and time periods"
      />

      <div className="flex-1 p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !cohortData || cohortData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <div className="text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">
                No Retention Data Available
              </h3>
              <p className="text-sm">
                Start tracking user events to see retention analysis
              </p>
            </div>
            <Button onClick={fetchRetentionData} variant="outline">
              Retry Loading
            </Button>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            {retentionMetrics && (
              <div className="grid gap-4 md:grid-cols-5">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {retentionMetrics.total_users.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all cohorts
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Day 1 Retention
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {retentionMetrics.day_1_retention?.toFixed(1)}%
                    </div>
                    <Badge
                      variant={
                        getRetentionStatus(retentionMetrics.day_1_retention)
                          .color as any
                      }
                      className="mt-1"
                    >
                      {
                        getRetentionStatus(retentionMetrics.day_1_retention)
                          .status
                      }
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Day 7 Retention
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {retentionMetrics.day_7_retention?.toFixed(1)}%
                    </div>
                    <Badge
                      variant={
                        getRetentionStatus(retentionMetrics.day_7_retention)
                          .color as any
                      }
                      className="mt-1"
                    >
                      {
                        getRetentionStatus(retentionMetrics.day_7_retention)
                          .status
                      }
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Day 30 Retention
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {retentionMetrics.day_30_retention?.toFixed(1)}%
                    </div>
                    <Badge
                      variant={
                        getRetentionStatus(retentionMetrics.day_30_retention)
                          .color as any
                      }
                      className="mt-1"
                    >
                      {
                        getRetentionStatus(retentionMetrics.day_30_retention)
                          .status
                      }
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Churn Rate
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {retentionMetrics.churn_rate?.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Monthly churn
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Tabs defaultValue="cohorts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
                <TabsTrigger value="trends">Retention Trends</TabsTrigger>
                <TabsTrigger value="heatmap">Retention Heatmap</TabsTrigger>
              </TabsList>

              <TabsContent value="cohorts" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Cohort Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Cohort</CardTitle>
                      <CardDescription>
                        Choose a cohort to analyze retention patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {cohortData?.map((cohort) => (
                          <Button
                            key={cohort.cohort_date}
                            variant={
                              selectedCohort === cohort.cohort_date
                                ? "default"
                                : "outline"
                            }
                            className="w-full justify-start"
                            onClick={() =>
                              setSelectedCohort(cohort.cohort_date)
                            }
                          >
                            {new Date(cohort.cohort_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                            <Badge variant="secondary" className="ml-auto">
                              {cohort.cohort_size.toLocaleString()}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cohort Details */}
                  {selectedCohortData && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Cohort Retention Curve</CardTitle>
                        <CardDescription>
                          Retention rates over time for{" "}
                          {new Date(
                            selectedCohortData.cohort_date
                          ).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center h-[200px]">
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Cohort Size
                                </p>
                                <p className="text-2xl font-bold">
                                  {selectedCohortData.cohort_size.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  30-Day Retention
                                </p>
                                <p className="text-2xl font-bold">
                                  {selectedCohortData.day_30?.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {[
                                {
                                  label: "Day 0 (Sign-up)",
                                  value: selectedCohortData.day_0,
                                  users: selectedCohortData.cohort_size,
                                },
                                {
                                  label: "Day 1",
                                  value: selectedCohortData.day_1,
                                  users: Math.round(
                                    (selectedCohortData.cohort_size *
                                      selectedCohortData.day_1) /
                                      100
                                  ),
                                },
                                {
                                  label: "Day 7",
                                  value: selectedCohortData.day_7,
                                  users: Math.round(
                                    (selectedCohortData.cohort_size *
                                      selectedCohortData.day_7) /
                                      100
                                  ),
                                },
                                {
                                  label: "Day 30",
                                  value: selectedCohortData.day_30,
                                  users: Math.round(
                                    (selectedCohortData.cohort_size *
                                      selectedCohortData.day_30) /
                                      100
                                  ),
                                },
                                {
                                  label: "Day 90",
                                  value: selectedCohortData.day_90,
                                  users: Math.round(
                                    (selectedCohortData.cohort_size *
                                      selectedCohortData.day_90) /
                                      100
                                  ),
                                },
                              ]
                                .filter((item) => item.value > 0)
                                ?.map((item, index) => (
                                  <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{item.label}</span>
                                      <span>
                                        {item.value?.toFixed(1)}% (
                                        {item.users.toLocaleString()} users)
                                      </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{
                                          width: `${item.value}%`,
                                          backgroundColor: getRetentionColor(
                                            item.value
                                          ),
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Retention Trends</CardTitle>
                      <CardDescription>
                        Retention rates across different cohorts
                      </CardDescription>
                    </div>
                    <Select
                      value={selectedPeriod}
                      onValueChange={setSelectedPeriod}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Day 1 Retention</SelectItem>
                        <SelectItem value="7">Day 7 Retention</SelectItem>
                        <SelectItem value="30">Day 30 Retention</SelectItem>
                        <SelectItem value="90">Day 90 Retention</SelectItem>
                        <SelectItem value="180">Day 180 Retention</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ChartContainer
                        config={{
                          retention: {
                            label: "Retention Rate",
                            color: "hsl(var(--chart-1))",
                          },
                          cohort_size: {
                            label: "Cohort Size",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "2-digit",
                                })
                              }
                            />
                            <YAxis />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              formatter={(value, name) => [
                                name === "retention"
                                  ? `${Number(value)?.toFixed(1)}%`
                                  : Number(value).toLocaleString(),
                                name === "retention"
                                  ? "Retention Rate"
                                  : "Cohort Size",
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="retention"
                              stroke="var(--color-retention)"
                              strokeWidth={3}
                              dot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="heatmap" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Retention Heatmap</CardTitle>
                    <CardDescription>
                      Visual representation of retention rates across cohorts
                      and time periods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {/* Header row */}
                          <div className="font-medium">Cohort</div>
                          <div className="text-center font-medium">Day 0</div>
                          <div className="text-center font-medium">Day 1</div>
                          <div className="text-center font-medium">Day 7</div>
                          <div className="text-center font-medium">Day 30</div>
                          <div className="text-center font-medium">Day 90</div>
                          <div className="text-center font-medium">Day 180</div>

                          {/* Data rows */}
                          {cohortData?.map((cohort) => (
                            <React.Fragment key={cohort.cohort_date}>
                              <div className="py-2 font-medium truncate">
                                {new Date(
                                  cohort.cohort_date
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "2-digit",
                                })}
                              </div>
                              {[
                                cohort.day_0,
                                cohort.day_1,
                                cohort.day_7,
                                cohort.day_30,
                                cohort.day_90,
                                cohort.day_180,
                              ]?.map((rate, index) => (
                                <div
                                  key={index}
                                  className="h-8 rounded flex items-center justify-center text-white text-xs font-medium"
                                  style={{
                                    backgroundColor:
                                      rate > 0
                                        ? getRetentionColor(rate)
                                        : "#f3f4f6",
                                    color: rate > 0 ? "white" : "#6b7280",
                                  }}
                                >
                                  {rate > 0 ? `${rate?.toFixed(0)}%` : "-"}
                                </div>
                              ))}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs">
                          <span>Retention Rate:</span>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: "#ef4444" }}
                            ></div>
                            <span>&lt;15%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: "#f97316" }}
                            ></div>
                            <span>15-25%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: "#eab308" }}
                            ></div>
                            <span>25-40%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: "#84cc16" }}
                            ></div>
                            <span>40-60%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: "#22c55e" }}
                            ></div>
                            <span>&gt;60%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center">
              <Button
                onClick={fetchRetentionData}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh Data
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
