"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { WorldMap } from "@/components/world-map";
import {
  getMetricValue,
  getDAUValue,
  getWAUValue,
  getMAUValue,
  getPageViewsValue,
  getTotalSessionsValue,
  getTotalEventsValue,
  getUniqueUsersValue,
  getTopEventsValue,
} from "@/lib/api";
import { centralizedData } from "@/lib/services/centralized-data";
import { enhancedAnalyticsService } from "@/lib/services/enhanced-analytics";
import {
  Loader2,
  DollarSign,
  Users,
  TrendingDown,
  CreditCard,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const {
    analyticsData,
    loadingAnalytics,
    events,
    fetchAnalytics,
    fetchEvents,
  } = useStore();
  const effectiveProjectId = useEffectiveProjectId();
  const { toast } = useToast();

  // State for all analytics data
  const [revenueMetrics, setRevenueMetrics] = useState<any>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [retentionData, setRetentionData] = useState<any>(null);
  const [bounceRate, setBounceRate] = useState<number>(0);
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);
  const [engagementTab, setEngagementTab] = useState("dau");
  const [dateRange, setDateRange] = useState<string>("30d");

  // Fetch analytics data
  useEffect(() => {
    if (effectiveProjectId) {
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "1d":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      fetchAnalytics(
        {
          startDate: startDateStr,
          endDate: endDateStr,
          groupBy: "day",
        },
        true
      ); // Force refresh when project changes

      fetchEvents(true); // Force refresh when project changes

      // Fetch enhanced analytics
      fetchAllData(startDateStr, endDateStr);
    }
  }, [effectiveProjectId, fetchAnalytics, fetchEvents, dateRange]);

  // Update bounce rate when analytics data changes
  useEffect(() => {
    if (analyticsData?.results) {
      const bounceRateMetric = analyticsData.results.find(
        (r: any) => r.metric === "bounce_rate"
      );
      if (bounceRateMetric?.value) {
        const valueStr = String(bounceRateMetric.value);
        const rate = parseFloat(valueStr.replace("%", ""));
        if (!isNaN(rate)) setBounceRate(rate);
      }
    }
  }, [analyticsData]);

  const fetchAllData = async (startDate: string, endDate: string) => {
    if (!effectiveProjectId) return;

    setLoadingEnhanced(true);
    try {
      // Use centralized data service - it will use cache if available
      const [
        revenueMetricsRes,
        revenueAnalyticsRes,
        locationRes,
        deviceRes,
        retentionRes,
      ] = await Promise.all([
        centralizedData.getRevenueMetrics(effectiveProjectId).catch(() => null),
        centralizedData
          .getRevenueAnalytics(effectiveProjectId, startDate, endDate)
          .catch(() => null),
        centralizedData
          .getLocationData(effectiveProjectId, startDate, endDate)
          .catch(() => null),
        centralizedData
          .getDeviceData(effectiveProjectId, startDate, endDate)
          .catch(() => null),
        enhancedAnalyticsService
          .getRetentionCohorts(effectiveProjectId, startDate, endDate)
          .then((res: any) =>
            res?.data?.cohorts
              ? { cohorts: res.data.cohorts }
              : res?.cohorts
              ? { cohorts: res.cohorts }
              : res?.data || res
          )
          .catch(() => null),
      ]);

      if (revenueMetricsRes) setRevenueMetrics(revenueMetricsRes);
      if (revenueAnalyticsRes) setRevenueAnalytics(revenueAnalyticsRes);
      if (locationRes) setLocationData(locationRes);
      if (deviceRes) setDeviceData(deviceRes);
      if (retentionRes) {
        console.log("📦 Cached Retention Data:", retentionRes);
        setRetentionData(retentionRes);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load some dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingEnhanced(false);
    }
  };

  // Derived values from analytics
  const uniqueUsers = analyticsData ? getUniqueUsersValue(analyticsData) : 0;

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => `${value?.toFixed(1)}%`;

  // Process Device Data for Table
  const getDeviceTableData = () => {
    if (!deviceData?.by_device) return [];
    return deviceData.by_device.map((d: any) => ({
      device: d.device || "Unknown",
      sessions: d.sessions || 0,
      users: d.users || 0,
      bounce_rate:
        typeof d.bounce_rate === "string"
          ? parseFloat(d.bounce_rate.replace("%", ""))
          : 0,
      avg_session_time: d.avg_session_time || "0s",
    }));
  };

  // Process Location Data for Map
  const getGeoData = () => {
    if (!locationData?.locations) return [];
    return locationData.locations
      .map((location: any) => ({
        country: location.country,
        users: location.unique_users,
        sessions: location.event_count,
        code: getCountryCode(location.country),
      }))
      .sort((a: any, b: any) => b.users - a.users);
  };

  // Process Retention Data
  const getRetentionMetrics = () => {
    if (!retentionData?.cohorts || !Array.isArray(retentionData.cohorts)) {
      return [];
    }

    // Calculate average retention for Day 1, Day 3, Day 7
    const days = [1, 3, 7];
    const metrics = days.map((d) => {
      let totalRate = 0;
      let count = 0;

      retentionData.cohorts.forEach((c: any) => {
        // Check if retention exists and has the day key
        if (c.retention && typeof c.retention[`day_${d}`] === "number") {
          totalRate += c.retention[`day_${d}`];
          count++;
        }
      });

      return {
        period: `Day ${d}`,
        rate: count > 0 ? totalRate / count : 0,
      };
    });

    return metrics;
  };

  // Get overall retention rate (average day_1_retention from all cohorts)
  const getOverallRetentionRate = () => {
    if (!retentionData?.cohorts || !Array.isArray(retentionData.cohorts)) {
      return 0;
    }

    let totalRate = 0;
    let count = 0;

    retentionData.cohorts.forEach((c: any) => {
      if (typeof c.day_1_retention === "number") {
        totalRate += c.day_1_retention;
        count++;
      }
    });

    return count > 0 ? totalRate / count : 0;
  };

  function getCountryCode(country: string): string {
    const countryMap: Record<string, string> = {
      "United States": "US",
      USA: "US",
      US: "US",
      "United Kingdom": "GB",
      UK: "GB",
      GB: "GB",
      Germany: "DE",
      Canada: "CA",
      France: "FR",
      Australia: "AU",
      India: "IN",
      Japan: "JP",
      Brazil: "BR",
      Italy: "IT",
      Spain: "ES",
      Netherlands: "NL",
      Sweden: "SE",
      Norway: "NO",
      China: "CN",
      Russia: "RU",
      South_Korea: "KR",
    };
    return countryMap[country] || country.slice(0, 2).toUpperCase();
  }

  // Helper function to get country flag emoji
  const getCountryFlag = (countryName: string): string => {
    const countryFlags: { [key: string]: string } = {
      "United States": "🇺🇸",
      Canada: "🇨🇦",
      "United Kingdom": "🇬🇧",
      Germany: "🇩🇪",
      France: "🇫🇷",
      India: "🇮🇳",
      China: "🇨🇳",
      Japan: "🇯🇵",
      Brazil: "🇧🇷",
      Australia: "🇦🇺",
      Netherlands: "🇳🇱",
      Sweden: "🇸🇪",
      Norway: "🇳🇴",
      Denmark: "🇩🇰",
      Finland: "🇫🇮",
      Spain: "🇪🇸",
      Italy: "🇮🇹",
      Russia: "🇷🇺",
      Mexico: "🇲🇽",
      Argentina: "🇦🇷",
    };

    return countryFlags[countryName] || "🌍";
  };

  const getEngagementData = () => {
    if (!analyticsData?.results) {
      console.log("⚠️ No analytics results available");
      return [];
    }
    const result = analyticsData.results.find(
      (r) => r.metric === engagementTab
    );
    return result?.time_series || [];
  };

  const getEngagementValue = () => {
    if (!analyticsData) {
      console.log("⚠️ No analytics data available for engagement value");
      return 0;
    }
    switch (engagementTab) {
      case "dau":
        return getDAUValue(analyticsData);
      case "wau":
        return getWAUValue(analyticsData);
      case "mau":
        return getMAUValue(analyticsData);
      default:
        return 0;
    }
  };

  const pageViews = analyticsData ? getPageViewsValue(analyticsData) : 0;
  const totalEvents = analyticsData ? getTotalEventsValue(analyticsData) : 0;
  const topEvents = analyticsData ? getTopEventsValue(analyticsData) : [];
  const totalSessions = analyticsData
    ? getTotalSessionsValue(analyticsData)
    : 0;

  if (!effectiveProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Overview"
          description="Unified view of your project analytics"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Select a Project</h3>
              <p className="text-muted-foreground">
                Please select a project to view the dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Overview"
          description="Unified view of your project analytics"
        />
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[130px] m-1">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 1. Revenue Analytics (Top) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Revenue Analytics
          </h2>
          <Link href="/dashboard/revenue">
            <Button variant="ghost" size="sm">
              View Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loadingEnhanced ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : revenueMetrics ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(revenueMetrics.mrr)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {revenueMetrics.growth_rate > 0 ? "+" : ""}
                  {formatPercentage(revenueMetrics.growth_rate)} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Subscriptions
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueMetrics.active_subscriptions}
                </div>
                <p className="text-xs text-muted-foreground">
                  {revenueMetrics.new_subscriptions} new this month
                </p>
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
                  {formatPercentage(revenueMetrics.churn_rate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {revenueMetrics.churned_subscriptions} canceled this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(revenueMetrics.arpu)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average revenue per user
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">
                No revenue data available. Configure Stripe to see metrics.
              </p>
              <Link href="/dashboard/revenue">
                <Button variant="outline">Configure Stripe</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Revenue Chart */}
        {((revenueAnalytics?.time_series &&
          revenueAnalytics.time_series.length > 0) ||
          (revenueMetrics?.time_series &&
            revenueMetrics.time_series.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Daily revenue from Stripe charges over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      revenueAnalytics?.time_series ||
                      revenueMetrics?.time_series ||
                      []
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/20"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      className="text-xs text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      minTickGap={30}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis
                      className="text-xs text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `$${Number(value).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`,
                            "Revenue",
                          ]}
                          labelFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          }
                        />
                      }
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 2. General Analytics (DAU, MAU, WAU) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            User Engagement
          </h2>
          <Link href="/dashboard/analytics">
            <Button variant="ghost" size="sm">
              View Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalEvents.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                In selected period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pageViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                In selected period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {uniqueUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                In selected period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Retention & Bounce Rate Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Retention</CardTitle>
              <CardDescription>
                Percentage of users returning over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEnhanced ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : retentionData?.cohorts && retentionData.cohorts.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-3xl font-bold">
                    {getOverallRetentionRate().toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Day 1 Retention (Avg across {retentionData.cohorts.length}{" "}
                    cohorts)
                  </p>
                  <div className="space-y-2">
                    {getRetentionMetrics().map((metric, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {metric.period}
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress value={metric.rate} className="w-24 h-2" />
                          <span className="font-medium w-12 text-right">
                            {metric.rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No retention data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bounce Rate</CardTitle>
              <CardDescription>
                Single-page sessions (lower is better)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAnalytics ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">
                      {bounceRate.toFixed(1)}%
                    </div>
                    {bounceRate < 40 ? (
                      <Badge variant="default" className="bg-green-500">
                        Excellent
                      </Badge>
                    ) : bounceRate < 55 ? (
                      <Badge variant="secondary">Good</Badge>
                    ) : bounceRate < 70 ? (
                      <Badge variant="outline">Average</Badge>
                    ) : (
                      <Badge variant="destructive">Needs Attention</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {bounceRate < 40
                      ? "Users are highly engaged"
                      : bounceRate < 55
                      ? "Healthy engagement levels"
                      : bounceRate < 70
                      ? "Room for improvement"
                      : "Consider improving content"}
                  </p>
                  <div className="pt-2">
                    <Progress value={100 - bounceRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(100 - bounceRate).toFixed(1)}% engaged sessions
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>User engagement over time</CardDescription>
              </div>
              <Tabs
                value={engagementTab}
                onValueChange={setEngagementTab}
                className="w-[300px]"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dau">DAU</TabsTrigger>
                  <TabsTrigger value="wau">WAU</TabsTrigger>
                  <TabsTrigger value="mau">MAU</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="text-3xl font-bold">
                {getEngagementValue().toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {engagementTab === "dau"
                  ? "Daily Active Users"
                  : engagementTab === "wau"
                  ? "Weekly Active Users"
                  : "Monthly Active Users"}
              </p>
            </div>
            <div className="h-[350px] w-full px-2">
              {loadingAnalytics ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : getEngagementData().length > 0 ? (
                <ChartContainer
                  config={{
                    value: {
                      label: "Users",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getEngagementData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted/20"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        minTickGap={30}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis
                        className="text-xs text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) =>
                              new Date(value).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            }
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No data available for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events & Recent Events */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
            <CardDescription>
              Most frequently triggered events in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {topEvents.slice(0, 5)?.map((event: any, i: number) => (
                <div key={i} className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {event.name || `Event ${i + 1}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.count?.toLocaleString() || 0} events
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {totalEvents > 0
                        ? ((event.count / totalEvents) * 100)?.toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>
              ))}
              {topEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest events from your users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(events) &&
                events.slice(0, 10)?.map((event: any, index: number) => {
                  // Extract country from user_agent_details or use fallback
                  const country =
                    event.UserAgentDetails?.country ||
                    event.Country ||
                    "Unknown";
                  const city =
                    event.UserAgentDetails?.city || event.City || "Unknown";
                  const countryFlag =
                    country !== "Unknown" ? getCountryFlag(country) : "🌍";

                  return (
                    <div
                      key={event.ID || index}
                      className="flex items-center justify-between border-b pb-2 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{countryFlag}</span>
                          <p className="text-sm font-medium">
                            {event.Event || event.event || "Unknown Event"}
                          </p>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {event.UserId && (
                            <span>User: {event.UserId.substring(0, 8)}...</span>
                          )}
                          {event.SessionId && (
                            <span>
                              Session: {event.SessionId.substring(0, 8)}...
                            </span>
                          )}
                          {event.Url && <span>URL: {event.Url}</span>}
                          {city !== "Unknown" && country !== "Unknown" && (
                            <span>
                              {city}, {country}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            event.Timestamp || event.timestamp || Date.now()
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {events.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent events found. Start tracking events to see data
                  here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Location Analytics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Location Analytics
          </h2>
          <Link href="/dashboard/location">
            <Button variant="ghost" size="sm">
              View Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Global Distribution</CardTitle>
              <CardDescription>User activity by country</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative overflow-hidden">
              {loadingEnhanced ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : getGeoData().length > 0 ? (
                <WorldMap geoData={getGeoData()} svgUrl="/world.svg" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No location data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>By user count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getGeoData()
                  .slice(0, 6)
                  .map((geo: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium">
                          {geo.country}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {geo.users.toLocaleString()}
                      </span>
                    </div>
                  ))}
                {getGeoData().length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Device Analytics (Table) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Device Analytics
          </h2>
          <Link href="/dashboard/devices">
            <Button variant="ghost" size="sm">
              View Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Device Performance</CardTitle>
            <CardDescription>Breakdown by device type</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEnhanced ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Sessions</TableHead>
                    <TableHead className="text-right">Bounce Rate</TableHead>
                    <TableHead className="text-right">Avg. Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDeviceTableData().length > 0 ? (
                    getDeviceTableData().map((device: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {device.device === "Desktop" ? (
                            <Monitor className="h-4 w-4" />
                          ) : device.device === "Mobile" ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Tablet className="h-4 w-4" />
                          )}
                          {device.device}
                        </TableCell>
                        <TableCell className="text-right">
                          {device.users.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {device.sessions.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {device.bounce_rate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          {device.avg_session_time}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No device data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
