"use client";

import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  getMetricValue,
  getDAUValue,
  getWAUValue,
  getMAUValue,
  getPageViewsValue,
} from "@/lib/api";

const healthScoreData = [
  { range: "90-100", count: 245, color: "hsl(var(--chart-1))" },
  { range: "70-89", count: 412, color: "hsl(var(--chart-2))" },
  { range: "50-69", count: 189, color: "hsl(var(--chart-3))" },
  { range: "0-49", count: 67, color: "hsl(var(--chart-4))" },
];

const churnTrendData = [
  { month: "Jan", churnRate: 4.2, revenue: 45000 },
  { month: "Feb", churnRate: 3.8, revenue: 48000 },
  { month: "Mar", churnRate: 5.1, revenue: 43000 },
  { month: "Apr", churnRate: 4.5, revenue: 46000 },
  { month: "May", churnRate: 3.2, revenue: 52000 },
  { month: "Jun", churnRate: 2.8, revenue: 55000 },
];

const atRiskUsers = [
  {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    score: 32,
    lastSeen: "14 days ago",
    risk: "High",
  },
  {
    name: "Mike Chen",
    email: "mike@example.com",
    score: 45,
    lastSeen: "8 days ago",
    risk: "High",
  },
  {
    name: "Emma Davis",
    email: "emma@example.com",
    score: 58,
    lastSeen: "5 days ago",
    risk: "Medium",
  },
  {
    name: "James Wilson",
    email: "james@example.com",
    score: 61,
    lastSeen: "3 days ago",
    risk: "Medium",
  },
];

export default function DashboardPage() {
  const { selectedProjectId, analyticsData, loadingAnalytics, fetchAnalytics } =
    useStore();

  useEffect(() => {
    if (selectedProjectId) {
      fetchAnalytics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [selectedProjectId, fetchAnalytics]);

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Analytics Overview"
          description="Monitor user metrics and analytics"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Project Selected</h3>
              <p className="text-muted-foreground">
                Please select a project to view analytics data
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingAnalytics) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Analytics Overview"
          description="Monitor user metrics and analytics"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const dau = analyticsData ? getDAUValue(analyticsData) : 0;
  const wau = analyticsData ? getWAUValue(analyticsData) : 0;
  const mau = analyticsData ? getMAUValue(analyticsData) : 0;
  const pageViews = analyticsData ? getPageViewsValue(analyticsData) : 0;
  const topPages = analyticsData
    ? (getMetricValue(analyticsData, "page_views") as any[])
    : [];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Analytics Overview"
        description="Monitor user health, churn risk, and revenue metrics"
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Analytics Overview Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dau">Daily Active Users</TabsTrigger>
            <TabsTrigger value="wau">Weekly Active Users</TabsTrigger>
            <TabsTrigger value="mau">Monthly Active Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-chart-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Daily Active Users
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
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dau.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Weekly Active Users
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
                  <div className="text-2xl font-bold">
                    {wau.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    from last week
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Active Users
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
                  <div className="text-2xl font-bold">
                    {mau.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Page Views
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
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pageViews.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Page Views Overview */}
            {topPages && topPages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>
                    Most viewed pages in the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPages.slice(0, 5).map((page: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{page.page}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              Unique: {page.uniqueVisitors.toLocaleString()}
                            </span>
                            <span>
                              Avg Time: {Math.round(page.avgTimeOnPage)}s
                            </span>
                            <span>
                              Bounce Rate: {(page.bounceRate * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {page.views.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dau" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>
                  Current daily active users metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dau.toLocaleString()}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wau" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Active Users</CardTitle>
                <CardDescription>
                  Current weekly active users metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{wau.toLocaleString()}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mau" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Active Users</CardTitle>
                <CardDescription>
                  Current monthly active users metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mau.toLocaleString()}</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>User Health Score Distribution</CardTitle>
              <CardDescription>
                Breakdown of users by health score ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Users",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthScoreData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="range" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {healthScoreData.map((entry, index) => (
                        <Bar
                          key={`cell-${index}`}
                          dataKey="count"
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>At-Risk Users</CardTitle>
                  <CardDescription>
                    Users with low health scores
                  </CardDescription>
                </div>
                <Link href="/dashboard/churn-risk">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskUsers.map((user, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <Badge
                          variant={
                            user.risk === "High" ? "destructive" : "secondary"
                          }
                          className="text-xs"
                        >
                          {user.risk}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last seen: {user.lastSeen}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{user.score}</div>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Churn Rate Trend</CardTitle>
              <CardDescription>
                Monthly churn rate over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  churnRate: {
                    label: "Churn Rate (%)",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={churnTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="churnRate"
                      stroke="var(--color-churnRate)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-churnRate)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Monthly recurring revenue over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue ($)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={churnTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-revenue)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>
              AI-powered insights to reduce churn and improve retention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-chart-1/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-chart-1"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Reach out to 67 at-risk users
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Users with health score below 50
                  </p>
                  <Link href="/dashboard/churn-risk">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                    >
                      View users →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-chart-3/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-chart-3"
                  >
                    <line x1="12" x2="12" y1="2" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fix onboarding drop-off</p>
                  <p className="text-xs text-muted-foreground">
                    $5.2k MRR lost at signup step 3
                  </p>
                  <Link href="/dashboard/revenue-leakage">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                    >
                      View details →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-chart-2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Optimize Google Ads</p>
                  <p className="text-xs text-muted-foreground">
                    56% churn rate from this channel
                  </p>
                  <Link href="/dashboard/churn-by-channel">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                    >
                      View analysis →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
