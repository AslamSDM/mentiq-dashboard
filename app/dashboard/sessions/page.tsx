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
import { enhancedAnalyticsService } from "@/lib/services/enhanced-analytics";

interface SessionAnalyticsResponse {
  overview: {
    total_sessions: number;
    unique_users: number;
    avg_session_duration: string;
    bounce_rate: string;
    return_visitor_rate: string;
  };
  engagement: {
    dau: number;
    wau: number;
    mau: number;
    stickiness_ratio: string;
    session_frequency: string;
  };
  time_series: Array<{
    date: string;
    sessions: number;
    users: number;
  }>;
  meta?: {
    date_range: string;
    total_events: number;
    data_points: number;
  };
}

export default function SessionsPage() {
  const [sessionData, setSessionData] =
    useState<SessionAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const { selectedProject } = useStore();

  useEffect(() => {
    if (selectedProject?.id) {
      loadSessionData();
    }
  }, [selectedProject, dateRange]);

  const loadSessionData = async () => {
    if (!selectedProject?.id) return;

    try {
      setLoading(true);
      const response = await enhancedAnalyticsService.getSessionAnalytics(
        selectedProject.id,
        dateRange.start,
        dateRange.end
      );

      console.log("📊 Session Analytics Response:", response);

      // Handle both wrapped and unwrapped responses
      if (response.session_data) {
        setSessionData(response.session_data);
      } else if (response.data?.session_data) {
        setSessionData(response.data.session_data);
      } else if (response.overview) {
        setSessionData(response as SessionAnalyticsResponse);
      } else {
        console.warn("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Failed to load session analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Session Analytics"
          description="Comprehensive session and user engagement metrics"
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading session analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Session Analytics"
        description="Comprehensive session and user engagement metrics"
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Overview Cards */}
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
              <div className="text-2xl font-bold">
                {sessionData?.overview?.total_sessions?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total sessions</p>
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
              <div className="text-2xl font-bold">
                {sessionData?.overview?.unique_users?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">Unique users</p>
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
              <div className="text-2xl font-bold">
                {sessionData?.overview?.avg_session_duration || "0m"}
              </div>
              <p className="text-xs text-muted-foreground">Average time</p>
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
              <div className="text-2xl font-bold">
                {sessionData?.overview?.bounce_rate || "0%"}
              </div>
              <p className="text-xs text-muted-foreground">Bounce rate</p>
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
              <div className="text-2xl font-bold">
                {sessionData?.overview?.return_visitor_rate || "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                Returning visitors
              </p>
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
              <div className="text-2xl font-bold">
                {sessionData?.engagement?.dau?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Daily Active Users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WAU</CardTitle>
              <Badge variant="secondary">Weekly</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionData?.engagement?.wau?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Weekly Active Users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MAU</CardTitle>
              <Badge variant="secondary">Monthly</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionData?.engagement?.mau?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly Active Users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stickiness</CardTitle>
              <Badge variant="secondary">DAU/MAU</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionData?.engagement?.stickiness_ratio || "0%"}
              </div>
              <p className="text-xs text-muted-foreground">Engagement ratio</p>
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
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Quality Metrics</CardTitle>
              <CardDescription>
                Insights into user engagement and behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">Days analyzed</p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                Performance indicators and trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
