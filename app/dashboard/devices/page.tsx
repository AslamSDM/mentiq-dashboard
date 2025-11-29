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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
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
import {
  Loader2,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { centralizedData } from "@/lib/services/centralized-data";
import { useToast } from "@/hooks/use-toast";

interface DeviceAnalytics {
  by_device: DeviceData[];
  by_os: OSData[];
  by_browser: BrowserData[];
  trends: {
    mobile_growth: number;
    desktop_decline: number;
    tablet_stable: number;
  };
}

interface DeviceData {
  device: string;
  sessions: number;
  users: number;
  bounce_rate: number;
  avg_session_time: number;
}

interface OSData {
  os: string;
  sessions: number;
  users: number;
  conversion_rate: number;
}

interface BrowserData {
  browser: string;
  sessions: number;
  users: number;
  performance_score: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DeviceAnalyticsPage() {
  const { selectedProjectId } = useStore();
  const [deviceData, setDeviceData] = useState<DeviceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDeviceAnalytics = async () => {
    if (!selectedProjectId) return;

    setIsLoading(true);
    try {
      // Get date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Fetch real data from API
      const response = await centralizedData.getDeviceData(
        selectedProjectId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      // Transform backend response to match component's expected structure
      if (response?.data) {
        // Helper to parse duration string "0s", "1m 30s" to seconds
        const parseDuration = (str: string) => {
          if (!str) return 0;
          // Simple parsing for "0s" or similar formats
          // If it's just a number string
          if (!isNaN(Number(str))) return Number(str);

          // Remove 's' and parse
          if (str.endsWith("s")) return parseFloat(str.replace("s", ""));

          return 0;
        };

        // Helper to parse percentage string "0.00%" to decimal 0.0
        const parsePercentage = (str: string) => {
          if (!str) return 0;
          return parseFloat(str.replace("%", "")) / 100;
        };

        // Transform from API format to component's expected format
        const by_device = (response.data.by_device || []).map((d) => ({
          device: d.device || "Unknown",
          sessions: d.sessions || 0,
          users: d.users || 0,
          bounce_rate:
            typeof d.bounce_rate === "string"
              ? parsePercentage(d.bounce_rate)
              : 0,
          avg_session_time:
            typeof d.avg_session_time === "string"
              ? parseDuration(d.avg_session_time)
              : 0,
        }));

        const by_os = (response.data.by_os || []).map((os) => ({
          os: os.os || "Unknown",
          sessions: os.sessions || 0,
          users: os.users || 0,
          conversion_rate:
            typeof os.conversion_rate === "string"
              ? parsePercentage(os.conversion_rate)
              : 0,
        }));

        const by_browser = (response.data.by_browser || []).map((b) => ({
          browser: b.browser || "Unknown",
          sessions: b.sessions || 0,
          users: b.users || 0,
          performance_score: 88, // Default performance score (backend doesn't provide this)
        }));

        const transformedData: DeviceAnalytics = {
          by_device,
          by_os,
          by_browser,
          trends: {
            mobile_growth: calculateGrowth(by_device, "Mobile"),
            desktop_decline: calculateGrowth(by_device, "Desktop"),
            tablet_stable: calculateGrowth(by_device, "Tablet"),
          },
        };

        setDeviceData(transformedData);
      } else {
        // No data available
        setDeviceData({
          by_device: [],
          by_os: [],
          by_browser: [],
          trends: { mobile_growth: 0, desktop_decline: 0, tablet_stable: 0 },
        });
      }
    } catch (error) {
      console.error("Error fetching device analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate growth trends (placeholder logic)
  const calculateGrowth = (
    devices: DeviceData[],
    deviceType: string
  ): number => {
    const device = devices.find((d) => d.device === deviceType);
    if (!device) return 0;
    // Simple heuristic: higher sessions = growth, lower = decline
    // In production, this would compare with previous period data
    return Math.random() * 0.2 - 0.1; // Mock trend for now
  };

  useEffect(() => {
    fetchDeviceAnalytics();
  }, [selectedProjectId]);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop":
        return <Monitor className="h-5 w-5" />;
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Device Analytics"
          description="Device, OS, and browser performance insights"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please select a project to view device analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Device Analytics"
        description="Device, OS, and browser performance insights"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Empty State */}
        {!isLoading && deviceData && deviceData.by_device.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground text-center">
                No device analytics data available yet.
                <br />
                Start tracking events to see device insights.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Usage Trends */}
        {deviceData && deviceData.by_device.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mobile Growth
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{(deviceData.trends.mobile_growth * 100)?.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Mobile usage increasing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Desktop Decline
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {(deviceData.trends.desktop_decline * 100)?.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Desktop usage declining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tablet Stable
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  +{(deviceData.trends.tablet_stable * 100)?.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Tablet usage stable
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {deviceData && deviceData.by_device.length > 0 && (
          <Tabs defaultValue="devices" className="space-y-4">
            <TabsList>
              <TabsTrigger value="devices">Device Types</TabsTrigger>
              <TabsTrigger value="os">Operating Systems</TabsTrigger>
              <TabsTrigger value="browsers">Browsers</TabsTrigger>
            </TabsList>

            <TabsContent value="devices" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Device Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                    <CardDescription>Sessions by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : deviceData ? (
                      <ChartContainer
                        config={{
                          sessions: {
                            label: "Sessions",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              dataKey="sessions"
                              data={deviceData.by_device}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ device, percent }) =>
                                `${device} ${(percent * 100)?.toFixed(0)}%`
                              }
                            >
                              {deviceData.by_device?.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Session Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Session Performance</CardTitle>
                    <CardDescription>
                      Average session duration by device
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : deviceData ? (
                      <ChartContainer
                        config={{
                          avg_session_time: {
                            label: "Avg Session Time",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={deviceData.by_device}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="device" />
                            <YAxis />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              formatter={(value) => [
                                formatTime(Number(value)),
                                "Duration",
                              ]}
                            />
                            <Bar
                              dataKey="avg_session_time"
                              fill="var(--color-avg_session_time)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              {/* Device Details Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Performance Details</CardTitle>
                  <CardDescription>
                    Detailed metrics by device type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : deviceData ? (
                    <div className="space-y-4">
                      {deviceData.by_device?.map((device) => (
                        <div
                          key={device.device}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(device.device)}
                            <div>
                              <p className="font-medium">{device.device}</p>
                              <p className="text-sm text-muted-foreground">
                                {device.users.toLocaleString()} users
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-8 text-right">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Sessions
                              </p>
                              <p className="font-medium">
                                {device.sessions.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Bounce Rate
                              </p>
                              <Badge
                                variant={
                                  device.bounce_rate < 0.4
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {(device.bounce_rate * 100)?.toFixed(1)}%
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Avg Session
                              </p>
                              <p className="font-medium">
                                {formatTime(device.avg_session_time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="os" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Operating Systems</CardTitle>
                  <CardDescription>
                    Performance metrics by operating system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : deviceData ? (
                    <div className="space-y-4">
                      {deviceData.by_os?.map((os) => {
                        const totalSessions = deviceData.by_os.reduce(
                          (sum, item) => sum + item.sessions,
                          0
                        );
                        const percentage = (os.sessions / totalSessions) * 100;

                        return (
                          <div key={os.os} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{os.os}</span>
                                <Badge variant="outline">
                                  {percentage?.toFixed(1)}%
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-6 text-right text-sm">
                                <span>
                                  {os.sessions.toLocaleString()} sessions
                                </span>
                                <span>{os.users.toLocaleString()} users</span>
                                <span className="font-medium">
                                  {os.conversion_rate?.toFixed(1)}% conversion
                                </span>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="browsers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Browser Performance</CardTitle>
                  <CardDescription>
                    Usage and performance scores by browser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : deviceData ? (
                    <div className="space-y-4">
                      {deviceData.by_browser?.map((browser) => {
                        const totalSessions = deviceData.by_browser.reduce(
                          (sum, item) => sum + item.sessions,
                          0
                        );
                        const percentage =
                          (browser.sessions / totalSessions) * 100;

                        return (
                          <div
                            key={browser.browser}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {browser.browser.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{browser.browser}</p>
                                <p className="text-sm text-muted-foreground">
                                  {percentage?.toFixed(1)}% market share
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-8 text-right">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Sessions
                                </p>
                                <p className="font-medium">
                                  {browser.sessions.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Users
                                </p>
                                <p className="font-medium">
                                  {browser.users.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Performance
                                </p>
                                <Badge
                                  variant={
                                    browser.performance_score > 90
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {browser.performance_score}/100
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-center">
          <Button
            onClick={fetchDeviceAnalytics}
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
