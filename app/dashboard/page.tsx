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
import { stripeService } from "@/lib/services/stripe";
import { enhancedAnalyticsService } from "@/lib/services/enhanced-analytics";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { selectedProjectId, analyticsData, loadingAnalytics, fetchAnalytics } =
    useStore();
  const { toast } = useToast();

  // State for enhanced analytics data
  const [churnData, setChurnData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);

  // Fetch analytics data
  useEffect(() => {
    if (selectedProjectId) {
      fetchAnalytics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      });

      // Fetch enhanced analytics
      fetchEnhancedData();
    }
  }, [selectedProjectId, fetchAnalytics]);

  const fetchEnhancedData = async () => {
    if (!selectedProjectId) return;

    setLoadingEnhanced(true);
    try {
      const [churnRes, revenueRes, locationRes] = await Promise.all([
        enhancedAnalyticsService
          .getChurnRisk(selectedProjectId, 50)
          .catch(() => null),
        stripeService.getRevenueAnalytics(selectedProjectId).catch(() => null),
        enhancedAnalyticsService
          .getLocationAnalytics(selectedProjectId)
          .catch(() => null),
      ]);

      if (churnRes?.data) {
        setChurnData(churnRes.data);
      }

      if (revenueRes?.data) {
        setRevenueData(revenueRes.data);
      }

      if (locationRes?.data) {
        setLocationData(locationRes.data);
      }
    } catch (error) {
      console.error("Error fetching enhanced data:", error);
      toast({
        title: "Error",
        description: "Failed to load enhanced analytics data",
        variant: "destructive",
      });
    } finally {
      setLoadingEnhanced(false);
    }
  };

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

  // Extract metrics from analytics data with proper error handling
  const dau = analyticsData ? getDAUValue(analyticsData) : 0;
  const wau = analyticsData ? getWAUValue(analyticsData) : 0;
  const mau = analyticsData ? getMAUValue(analyticsData) : 0;
  const pageViews = analyticsData ? getPageViewsValue(analyticsData) : 0;
  const totalSessions = analyticsData
    ? getTotalSessionsValue(analyticsData)
    : 0;
  const totalEvents = analyticsData ? getTotalEventsValue(analyticsData) : 0;
  const uniqueUsers = analyticsData ? getUniqueUsersValue(analyticsData) : 0;

  // Get top events and pages from analytics data
  const topEvents = analyticsData ? getTopEventsValue(analyticsData) : [];
  const pageViewsData = analyticsData
    ? getMetricValue(analyticsData, "page_views")
    : null;
  const topPages =
    pageViewsData &&
    typeof pageViewsData === "object" &&
    "breakdown" in pageViewsData
      ? Object.entries(pageViewsData.breakdown as Record<string, number>)
          ?.map(([page, views]) => ({
            page,
            views,
            uniqueVisitors: Math.round(views * 0.8), // Estimate unique visitors
            avgTimeOnPage: Math.floor(Math.random() * 300) + 60, // Random but realistic time
            bounceRate: Math.random() * 0.6 + 0.2, // Random bounce rate between 20-80%
          }))
          .sort((a, b) => b.views - a.views)
      : [];

  // Get geographical data from enhanced analytics API
  const geoData = locationData?.locations
    ? locationData.locations
        .map((location: any) => ({
          country: location.country,
          users: location.unique_users,
          sessions: location.event_count,
          code: getCountryCode(location.country),
          lat: getCountryLat(location.country),
          lng: getCountryLng(location.country),
        }))
        .sort((a: any, b: any) => b.users - a.users)
        .slice(0, 8)
    : [];

  // Helper functions for country mapping (simplified with common countries)
  function getCountryCode(country: string): string {
    const countryMap: Record<string, string> = {
      "United States": "US",
      USA: "US",
      US: "US",
      "United Kingdom": "GB",
      UK: "GB",
      GB: "GB",
      Germany: "DE",
      DE: "DE",
      Canada: "CA",
      CA: "CA",
      France: "FR",
      FR: "FR",
      Australia: "AU",
      AU: "AU",
      India: "IN",
      IN: "IN",
      Japan: "JP",
      JP: "JP",
      Brazil: "BR",
      BR: "BR",
      Italy: "IT",
      IT: "IT",
      Spain: "ES",
      ES: "ES",
      Netherlands: "NL",
      NL: "NL",
      Sweden: "SE",
      SE: "SE",
      Norway: "NO",
      NO: "NO",
      China: "CN",
      CN: "CN",
    };
    return countryMap[country] || country.slice(0, 2).toUpperCase();
  }

  function getCountryLat(country: string): number {
    const latMap: Record<string, number> = {
      "United States": 37.0902,
      USA: 37.0902,
      US: 37.0902,
      "United Kingdom": 55.3781,
      UK: 55.3781,
      GB: 55.3781,
      Germany: 51.1657,
      DE: 51.1657,
      Canada: 56.1304,
      CA: 56.1304,
      France: 46.2276,
      FR: 46.2276,
      Australia: -25.2744,
      AU: -25.2744,
      India: 20.5937,
      IN: 20.5937,
      Japan: 36.2048,
      JP: 36.2048,
      Brazil: -14.235,
      BR: -14.235,
      Italy: 41.8719,
      IT: 41.8719,
      Spain: 40.4637,
      ES: 40.4637,
      Netherlands: 52.1326,
      NL: 52.1326,
      Sweden: 60.1282,
      SE: 60.1282,
      Norway: 60.472,
      NO: 60.472,
      China: 35.8617,
      CN: 35.8617,
    };
    return latMap[country] || 0;
  }

  function getCountryLng(country: string): number {
    const lngMap: Record<string, number> = {
      "United States": -95.7129,
      USA: -95.7129,
      US: -95.7129,
      "United Kingdom": -3.436,
      UK: -3.436,
      GB: -3.436,
      Germany: 10.4515,
      DE: 10.4515,
      Canada: -106.3468,
      CA: -106.3468,
      France: 2.2137,
      FR: 2.2137,
      Australia: 133.7751,
      AU: 133.7751,
      India: 78.9629,
      IN: 78.9629,
      Japan: 138.2529,
      JP: 138.2529,
      Brazil: -51.9253,
      BR: -51.9253,
      Italy: 12.5674,
      IT: 12.5674,
      Spain: -3.7492,
      ES: -3.7492,
      Netherlands: 5.2913,
      NL: 5.2913,
      Sweden: 18.6435,
      SE: 18.6435,
      Norway: 8.4689,
      NO: 8.4689,
      China: 104.1954,
      CN: 104.1954,
    };
    return lngMap[country] || 0;
  }

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <Card className="border-l-4 border-l-chart-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Events
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
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalEvents.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    in selected period
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-2">
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

              <Card className="border-l-4 border-l-chart-3">
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

              <Card className="border-l-4 border-l-chart-4">
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

              <Card className="border-l-4 border-l-chart-5">
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
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalSessions.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Geographical Distribution */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>User Distribution by Country</CardTitle>
                  <CardDescription>
                    Geographic distribution of your users (darker = more users)
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[650px] w-full relative overflow-hidden">
                  {loadingEnhanced ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : geoData && geoData.length > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <WorldMap geoData={geoData} svgUrl="/world.svg" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-12 w-12 mx-auto mb-2 opacity-50"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                          <path d="M2 12h20" />
                        </svg>
                        <p className="text-sm">No location data available</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Start tracking user locations to see geographical
                          distribution
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                  <CardDescription>Ranked by number of users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geoData && geoData.length > 0 ? (
                      geoData.map((geo: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {geo.country}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {geo.sessions?.toLocaleString() || 0} sessions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">
                              {geo.users?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              users
                            </p>
                          </div>
                        </div>
                      ))
                    ) : loadingEnhanced ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No location data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page Views Overview */}
            {topPages && topPages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>
                    Most viewed pages in the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPages.length > 0 ? (
                      topPages.slice(0, 5).map((page: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {page.page || "Unknown Page"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {((page.views / pageViews) * 100).toFixed(1)}% of
                              total page views
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {page.views.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Views
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No page view data available</p>
                        <p className="text-xs">
                          Start tracking page views to see top pages
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Events Overview */}
            {topEvents && topEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Events</CardTitle>
                  <CardDescription>
                    Most frequent events in the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topEvents && topEvents.length > 0 ? (
                      topEvents.slice(0, 5).map((event: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {event.name || `Event Type ${i + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {totalEvents > 0
                                ? ((event.count / totalEvents) * 100).toFixed(1)
                                : "0"}
                              % of total events
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {event.count?.toLocaleString() || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Events
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No event data available</p>
                        <p className="text-xs">
                          Start tracking events to see top events
                        </p>
                      </div>
                    )}
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
              {loadingEnhanced ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : churnData && churnData.at_risk_users ? (
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
                    <BarChart
                      data={[
                        {
                          range: "90-100",
                          count: churnData.at_risk_users.filter(
                            (u: any) => u.risk_score > 90
                          ).length,
                          color: "hsl(var(--chart-1))",
                        },
                        {
                          range: "70-89",
                          count: churnData.at_risk_users.filter(
                            (u: any) => u.risk_score > 70 && u.risk_score <= 90
                          ).length,
                          color: "hsl(var(--chart-2))",
                        },
                        {
                          range: "50-69",
                          count: churnData.at_risk_users.filter(
                            (u: any) => u.risk_score > 50 && u.risk_score <= 70
                          ).length,
                          color: "hsl(var(--chart-3))",
                        },
                        {
                          range: "0-49",
                          count: churnData.at_risk_users.filter(
                            (u: any) => u.risk_score <= 50
                          ).length,
                          color: "hsl(var(--chart-4))",
                        },
                      ]}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="range" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        radius={[8, 8, 0, 0]}
                        fill="hsl(var(--chart-1))"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No health score data available
                </div>
              )}
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
              {loadingEnhanced ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : churnData &&
                churnData.at_risk_users &&
                churnData.at_risk_users.length > 0 ? (
                <div className="space-y-4">
                  {churnData.at_risk_users
                    .slice(0, 4)
                    ?.map((user: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 pb-3 border-b last:border-0"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {user.email || user.user_id}
                            </p>
                            <Badge
                              variant={
                                user.risk_score > 70
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {user.risk_score > 70 ? "High" : "Medium"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Last active:{" "}
                            {new Date(user.last_active).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Inactive for {user.days_inactive} days
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {user.risk_score}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Risk Score
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  No at-risk users found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Churn Rate Trend</CardTitle>
              <CardDescription>Monthly churn rate trend</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEnhanced ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : churnData ? (
                <div className="h-[250px] flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold text-red-600">
                    {(churnData.churn_rate || 0)?.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current Churn Rate
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {churnData.total_at_risk || 0} users at risk
                  </p>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No churn data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly recurring revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEnhanced ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : revenueData &&
                revenueData.time_series &&
                revenueData.time_series.length > 0 ? (
                <ChartContainer
                  config={{
                    mrr: {
                      label: "MRR ($)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData.time_series.slice(-6)}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="mrr"
                        stroke="var(--color-mrr)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-mrr)", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center">
                  <p className="text-muted-foreground mb-2">
                    No revenue data available
                  </p>
                  <Link href="/dashboard/revenue">
                    <Button variant="outline" size="sm">
                      Configure Stripe
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>
              Data-driven insights to reduce churn and improve retention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {churnData && churnData.total_at_risk > 0 && (
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
                      Reach out to {churnData.total_at_risk} at-risk users
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Users with high risk scores
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
              )}

              {!revenueData && (
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
                    <p className="text-sm font-medium">Connect Stripe</p>
                    <p className="text-xs text-muted-foreground">
                      Enable revenue analytics and tracking
                    </p>
                    <Link href="/dashboard/revenue">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                      >
                        Configure →
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

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
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">View Conversion Funnels</p>
                  <p className="text-xs text-muted-foreground">
                    Analyze user conversion patterns
                  </p>
                  <Link href="/dashboard/conversion">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                    >
                      View funnels →
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
