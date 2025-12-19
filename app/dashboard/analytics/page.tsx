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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import {
  getDAUValue,
  getWAUValue,
  getMAUValue,
  getPageViewsValue,
  getConversionRate,
  getTotalEventsValue,
  getUniqueUsersValue,
  getTopEventsValue,
  getTotalSessionsValue,
} from "@/lib/api";

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

export default function AnalyticsPage() {
  const {
    analyticsData,
    loadingAnalytics,
    events,
    fetchAnalytics,
    fetchEvents,
    isAuthenticated,
  } = useStore();
  const effectiveProjectId = useEffectiveProjectId();

  const [dateRange, setDateRange] = useState<string>("7d");

  useEffect(() => {
    if (!effectiveProjectId || !isAuthenticated) return;

    // Calculate date range
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

    fetchAnalytics({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }, true); // Force refresh when project changes
    fetchEvents(true); // Force refresh when project changes
  }, [
    effectiveProjectId,
    dateRange,
    fetchAnalytics,
    fetchEvents,
    isAuthenticated,
  ]);

  if (loadingAnalytics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">No analytics data available</h3>
          <p className="text-muted-foreground">
            Start tracking events to see analytics
          </p>
        </div>
      </div>
    );
  }

  // Extract metrics from the analytics data
  const dau = getDAUValue(analyticsData);
  const wau = getWAUValue(analyticsData);
  const mau = getMAUValue(analyticsData);
  const pageViews = getPageViewsValue(analyticsData);
  const conversionRate = getConversionRate(analyticsData);
  const totalEvents = getTotalEventsValue(analyticsData);
  const uniqueUsers = getUniqueUsersValue(analyticsData);
  const topEvents = getTopEventsValue(analyticsData);
  const totalSessions = getTotalSessionsValue(analyticsData);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="Analytics"
        description="View your application's analytics and insights"
      />

      <div className="flex items-center space-x-2">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">Export Data</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEvents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Active Users
            </CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dau.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pageViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.3%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(conversionRate * 100)?.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+4.1%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
            <CardDescription>
              Most frequently triggered events in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {topEvents.slice(0, 5)?.map((event, i) => (
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
              {events.slice(0, 10)?.map((event: any, index: number) => {
                // Extract country from user_agent_details or use fallback
                const country =
                  event.UserAgentDetails?.country || event.Country || "Unknown";
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

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{wau.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Users active in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mau.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Users active in the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Sessions in the selected period
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
