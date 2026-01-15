"use client";

import { useEffect, useState } from "react";
// Removed DashboardHeader as it's now in the Navbar
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
  Tooltip,
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
  Calendar,
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
        setRetentionData(retentionRes);
      }
    } catch (error) {
      // Silent fail - error shown via toast
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

  // Process Device Data for Table - show OS classification, fallback to events
  const getDeviceTableData = () => {
    // First try the by_os data from API (preferred for OS classification)
    if (deviceData?.by_os && deviceData.by_os.length > 0) {
      return deviceData.by_os.map((d: any) => ({
        device: d.os || "Unknown",
        sessions: d.sessions || 0,
        users: d.users || 0,
        bounce_rate:
          typeof d.conversion_rate === "string"
            ? parseFloat(d.conversion_rate.replace("%", ""))
            : 0,
        avg_session_time: "N/A",
      }));
    }
    
    // Fallback to by_device if by_os not available
    if (deviceData?.by_device && deviceData.by_device.length > 0) {
      return deviceData.by_device.map((d: any) => ({
        device: d.device || d.os || "Unknown",
        sessions: d.sessions || 0,
        users: d.users || 0,
        bounce_rate:
          typeof d.bounce_rate === "string"
            ? parseFloat(d.bounce_rate.replace("%", ""))
            : 0,
        avg_session_time: d.avg_session_time || "0s",
      }));
    }
    
    // Fallback: aggregate OS data from events if available
    if (Array.isArray(events) && events.length > 0) {
      const osMap = new Map<string, { os: string; sessions: number; users: Set<string> }>();
      
      events.forEach((event: any) => {
        // Handle both camelCase and PascalCase field names from backend
        const os = event.Os || event.os || event.Properties?.os || "Unknown";
        if (!os || os === "Unknown") return;
        
        const existing = osMap.get(os) || { os, sessions: 0, users: new Set<string>() };
        existing.sessions++;
        const userId = event.UserId || event.user_id || event.SessionId || event.session_id || '';
        if (userId) existing.users.add(userId);
        osMap.set(os, existing);
      });
      
      return Array.from(osMap.values())
        .map(item => ({
          device: item.os,
          sessions: item.sessions,
          users: item.users.size || item.sessions,
          bounce_rate: 0,
          avg_session_time: "N/A",
        }))
        .sort((a, b) => b.sessions - a.sessions);
    }
    
    return [];
  };

  // Process Location Data for Map - fallback to events if API data unavailable
  const getGeoData = () => {
    // First try by_country from location API
    if (locationData?.by_country && locationData.by_country.length > 0) {
      return locationData.by_country
        .map((location: any) => ({
          country: location.country,
          users: location.users || location.unique_users || 0,
          sessions: location.sessions || location.event_count || 0,
          code: getCountryCode(location.country),
        }))
        .sort((a: any, b: any) => b.users - a.users);
    }
    
    // Fallback: try legacy locations field
    if (locationData?.locations && locationData.locations.length > 0) {
      return locationData.locations
        .map((location: any) => ({
          country: location.country,
          users: location.unique_users || location.users || 0,
          sessions: location.event_count || location.sessions || 0,
          code: getCountryCode(location.country),
        }))
        .sort((a: any, b: any) => b.users - a.users);
    }
    
    // Fallback: aggregate from events if available
    if (Array.isArray(events) && events.length > 0) {
      const countryMap = new Map<string, { country: string; users: number; sessions: number }>();
      
      events.forEach((event: any) => {
        // Handle both camelCase and snake_case field names from backend
        const country = event.Country || event.country || event.Properties?.country || null;
        if (!country || country === 'Unknown' || country === 'Local') return;
        
        const existing = countryMap.get(country) || { country, users: 0, sessions: 0 };
        existing.users++;
        existing.sessions++;
        countryMap.set(country, existing);
      });
      
      return Array.from(countryMap.values())
        .map(item => ({
          country: item.country,
          users: item.users,
          sessions: item.sessions,
          code: getCountryCode(item.country),
        }))
        .sort((a, b) => b.users - a.users);
    }
    
    return [];
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
      return [];
    }
    const result = analyticsData.results.find(
      (r) => r.metric === engagementTab
    );
    return result?.time_series || [];
  };

  const getEngagementValue = () => {
    if (!analyticsData) {
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
      <div className="flex flex-col h-full bg-[#F4F7FE]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="h-12 w-12 text-[#4318FF] animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2B3674]">Select a Project</h3>
              <p className="text-[#4363C7]">
                Please select a project to view the dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Date Range & Controls */}
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl shadow-sm">
          <Calendar className="h-4 w-4 text-[#4363C7] ml-2" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 text-[#2B3674] font-medium">
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
          <h2 className="text-xl font-bold tracking-tight text-[#2B3674]">
            Revenue Analytics
          </h2>
          <Link href="/dashboard/revenue">
            <Button variant="ghost" size="sm" className="text-[#4318FF] hover:bg-[#F4F7FE]">
              View Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loadingEnhanced ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : revenueMetrics ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[#F4F7FE] rounded-full">
                        <DollarSign className="h-6 w-6 text-[#4318FF]" />
                    </div>
                 </div>
                 <div>
                    <div className="text-sm font-medium text-[#4363C7] mb-1">MRR</div>
                    <div className="text-2xl font-bold text-[#2B3674]">
                      {formatCurrency(revenueMetrics.mrr)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                         <span className={revenueMetrics.growth_rate >= 0 ? "text-[#05CD99] font-bold text-xs" : "text-red-500 font-bold text-xs"}>
                             {revenueMetrics.growth_rate > 0 ? "+" : ""}
                             {formatPercentage(revenueMetrics.growth_rate)}
                         </span>
                         <span className="text-xs text-[#4363C7]">since last month</span>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[#F4F7FE] rounded-full">
                        <Users className="h-6 w-6 text-[#4318FF]" />
                    </div>
                 </div>
                 <div>
                    <div className="text-sm font-medium text-[#4363C7] mb-1">Active Subs</div>
                    <div className="text-2xl font-bold text-[#2B3674]">
                      {revenueMetrics.active_subscriptions}
                    </div>
                    <p className="text-xs text-[#4363C7] mt-1">
                      {revenueMetrics.new_subscriptions} new this month
                    </p>
                 </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[#FFF9E5] rounded-full">
                        <TrendingDown className="h-6 w-6 text-[#FFCE20]" />
                    </div>
                 </div>
                 <div>
                    <div className="text-sm font-medium text-[#4363C7] mb-1">Churn Rate</div>
                    <div className="text-2xl font-bold text-[#2B3674]">
                      {formatPercentage(revenueMetrics.churn_rate)}
                    </div>
                    <p className="text-xs text-[#4363C7] mt-1">
                      {revenueMetrics.churned_subscriptions} churned
                    </p>
                 </div>
              </CardContent>
            </Card>
            
             <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[#F4F7FE] rounded-full">
                        <CreditCard className="h-6 w-6 text-[#4318FF]" />
                    </div>
                 </div>
                 <div>
                    <div className="text-sm font-medium text-[#4363C7] mb-1">ARPU</div>
                    <div className="text-2xl font-bold text-[#2B3674]">
                      {formatCurrency(revenueMetrics.arpu)}
                    </div>
                    <p className="text-xs text-[#4363C7] mt-1">
                       Avg. Revenue Per User
                    </p>
                 </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-white border-dashed border-2 border-[#E0E5F2] shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-[#4363C7] mb-4">
                No revenue data available. Configure Stripe to see metrics.
              </p>
              <Link href="/dashboard/revenue">
                <Button className="bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl">Configure Stripe</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Revenue Chart */}
        {((revenueAnalytics?.time_series &&
          revenueAnalytics.time_series.length > 0) ||
          (revenueMetrics?.time_series &&
            revenueMetrics.time_series.length > 0)) && (
          <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-[#2B3674] font-bold">Revenue Trend</CardTitle>
              <CardDescription className="text-[#4363C7]">
                Daily revenue from Stripe charges over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#4318FF",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      revenueAnalytics?.time_series ||
                      revenueMetrics?.time_series ||
                      []
                    }
                  >
                     <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4318FF" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-[#E0E5F2]"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      className="text-xs text-[#4363C7]"
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
                      className="text-xs text-[#4363C7]"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                        cursor={{ stroke: '#E0E5F2', strokeWidth: 1 }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
                     />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4318FF"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 2. General Analytics (DAU, MAU, WAU) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[#2B3674]">
            User Engagement
          </h2>
          <Link href="/dashboard/analytics">
             <Button variant="ghost" size="sm" className="text-[#4318FF] hover:bg-[#F4F7FE]">
              View Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
             <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#4363C7]">Total Events</p>
                        <h3 className="text-2xl font-bold text-[#2B3674] mt-1">{totalEvents.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-[#E6F7FF]">
                        <ArrowUpRight className="h-6 w-6 text-[#00A3FF]" />
                    </div>
                </div>
             </CardContent>
          </Card>
          
          <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
             <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#4363C7]">Page Views</p>
                        <h3 className="text-2xl font-bold text-[#2B3674] mt-1">{pageViews.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-[#F4F7FE]">
                        <Monitor className="h-6 w-6 text-[#4318FF]" />
                    </div>
                </div>
             </CardContent>
          </Card>
          
           <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
             <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#4363C7]">Unique Users</p>
                        <h3 className="text-2xl font-bold text-[#2B3674] mt-1">{uniqueUsers.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-[#E9E3FF]">
                        <Users className="h-6 w-6 text-[#4363C7]" /> {/* Usually a distinct color if needed */}
                    </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Retention & Bounce Rate Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-[#2B3674] font-bold">User Retention</CardTitle>
              <CardDescription className="text-[#4363C7]">
                Percentage of users returning over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEnhanced ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#4318FF]" />
                </div>
              ) : retentionData?.cohorts && retentionData.cohorts.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-[#2B3674]">
                    {getOverallRetentionRate().toFixed(1)}%
                  </div>
                  <p className="text-sm text-[#4363C7]">
                    Day 1 Retention (Avg across {retentionData.cohorts.length}{" "}
                    cohorts)
                  </p>
                  <div className="space-y-4 mt-6">
                    {getRetentionMetrics().map((metric, idx) => (
                      <div
                        key={idx}
                        className="space-y-2"
                      >
                         <div className="flex justify-between text-sm">
                            <span className="text-[#4363C7]">{metric.period}</span>
                            <span className="font-bold text-[#2B3674]">{metric.rate.toFixed(1)}%</span>
                        </div>
                        <Progress value={metric.rate} className="h-2 bg-[#F4F7FE]" indicatorClassName="bg-[#4318FF]" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[#4363C7]">
                  No retention data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-[#2B3674] font-bold">Bounce Rate</CardTitle>
              <CardDescription className="text-[#4363C7]">
                Single-page sessions (lower is better)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAnalytics ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#4318FF]" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-[#2B3674]">
                      {bounceRate.toFixed(1)}%
                    </div>
                    {bounceRate < 40 ? (
                      <Badge className="bg-[#05CD99] text-white hover:bg-[#05CD99]/80 border-none">
                        Excellent
                      </Badge>
                    ) : bounceRate < 55 ? (
                      <Badge className="bg-[#4318FF] text-white hover:bg-[#4318FF]/80 border-none">Good</Badge>
                    ) : bounceRate < 70 ? (
                      <Badge variant="outline" className="text-[#2B3674] border-[#E0E5F2]">Average</Badge>
                    ) : (
                      <Badge variant="destructive">Needs Attention</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#4363C7]">
                    {bounceRate < 40
                      ? "Users are highly engaged"
                      : bounceRate < 55
                      ? "Healthy engagement levels"
                      : bounceRate < 70
                      ? "Room for improvement"
                      : "Consider improving content"}
                  </p>
                  <div className="pt-2">
                    <Progress value={100 - bounceRate} className="h-3 bg-[#F4F7FE]" indicatorClassName="bg-[#4318FF]" />
                    <p className="text-xs text-[#4363C7] mt-2">
                      {(100 - bounceRate).toFixed(1)}% engaged sessions
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#2B3674] font-bold">Active Users</CardTitle>
                <CardDescription className="text-[#4363C7]">User engagement over time</CardDescription>
              </div>
              <Tabs
                value={engagementTab}
                onValueChange={setEngagementTab}
                className="w-[300px]"
              >
                <TabsList className="grid w-full grid-cols-3 bg-[#F4F7FE] p-1 rounded-xl">
                  <TabsTrigger value="dau" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2B3674] data-[state=active]:shadow-sm text-[#4363C7]">DAU</TabsTrigger>
                  <TabsTrigger value="wau" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2B3674] data-[state=active]:shadow-sm text-[#4363C7]">WAU</TabsTrigger>
                  <TabsTrigger value="mau" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2B3674] data-[state=active]:shadow-sm text-[#4363C7]">MAU</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="text-3xl font-bold text-[#2B3674]">
                {getEngagementValue().toLocaleString()}
              </div>
              <p className="text-sm text-[#4363C7]">
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
                  <Loader2 className="h-8 w-8 animate-spin text-[#4318FF]" />
                </div>
              ) : getEngagementData().length > 0 ? (
                <ChartContainer
                  config={{
                    value: {
                      label: "Users",
                      color: "#4318FF",
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getEngagementData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-[#E0E5F2]"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs text-[#4363C7]"
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
                        className="text-xs text-[#4363C7]"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#4318FF"
                        strokeWidth={4}
                        dot={false}
                        activeDot={{ r: 6, fill: "#4318FF", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[#4363C7]">
                  No data available for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events & Recent Events */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-[#2B3674] font-bold">Top Events</CardTitle>
            <CardDescription className="text-[#4363C7]">
              Most frequently triggered events in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topEvents.slice(0, 5)?.map((event: any, i: number) => (
                <div key={i} className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-[#2B3674] leading-none">
                      {event.name || `Event ${i + 1}`}
                    </p>
                    <div className="w-full bg-[#F4F7FE] rounded-full h-2 mt-2">
                        <div 
                         className="bg-[#4318FF] h-2 rounded-full" 
                         style={{ width: `${totalEvents > 0 ? ((event.count / totalEvents) * 100) : 0}%` }}
                        />
                    </div>
                  </div>
                  <div className="text-right pl-4">
                     <div className="text-sm font-bold text-[#2B3674]">{event.count?.toLocaleString() || 0}</div>
                    <div className="text-xs font-medium text-[#4363C7]">
                      {totalEvents > 0
                        ? ((event.count / totalEvents) * 100)?.toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>
              ))}
              {topEvents.length === 0 && (
                <p className="text-sm text-[#4363C7] text-center py-4">
                  No events data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-[#2B3674] font-bold">Recent Events</CardTitle>
            <CardDescription className="text-[#4363C7]">Latest events from your users</CardDescription>
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
                      className="flex items-center justify-between border-b border-[#F4F7FE] pb-3 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{countryFlag}</span>
                          <p className="text-sm font-bold text-[#2B3674]">
                            {event.Event || event.event || "Unknown Event"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-[#4363C7]">
                          {event.UserId && (
                            <span className="bg-[#F4F7FE] px-2 py-0.5 rounded text-[#2B3674]">User: {event.UserId.substring(0, 8)}...</span>
                          )}
                          {city !== "Unknown" && country !== "Unknown" && (
                            <span>
                              {city}, {country}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#4363C7] whitespace-nowrap">
                          {new Date(
                            event.Timestamp || event.timestamp || Date.now()
                          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {events.length === 0 && (
                <p className="text-sm text-[#4363C7] text-center py-4">
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
          <h2 className="text-xl font-bold tracking-tight text-[#2B3674]">
            Location Analytics
          </h2>
          <Link href="/dashboard/location">
            <Button variant="ghost" size="sm" className="text-[#4318FF] hover:bg-[#F4F7FE]">
              View Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-[#2B3674] font-bold">Global Distribution</CardTitle>
              <CardDescription className="text-[#4363C7]">User activity by country</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative overflow-hidden">
              {loadingEnhanced ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#4318FF] h-8 w-8" />
                </div>
              ) : getGeoData().length > 0 ? (
                <WorldMap geoData={getGeoData()} svgUrl="/world.svg" />
              ) : (
                <div className="flex items-center justify-center h-full text-[#4363C7]">
                  No location data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-[#2B3674] font-bold">Top Countries</CardTitle>
              <CardDescription className="text-[#4363C7]">By user count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getGeoData()
                  .slice(0, 6)
                  .map((geo: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#F4F7FE] flex items-center justify-center text-xs font-bold text-[#2B3674]">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium text-[#2B3674]">
                          {geo.country}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#2B3674]">
                        {geo.users.toLocaleString()}
                      </span>
                    </div>
                  ))}
                {getGeoData().length === 0 && (
                  <div className="text-center text-[#4363C7] py-8">
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
          <h2 className="text-xl font-bold tracking-tight text-[#2B3674]">
            Platform Analytics
          </h2>
          <Link href="/dashboard/devices">
            <Button variant="ghost" size="sm" className="text-[#4318FF] hover:bg-[#F4F7FE]">
              View Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-[#2B3674] font-bold">Operating System Distribution</CardTitle>
            <CardDescription className="text-[#4363C7]">Breakdown by operating system</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingEnhanced ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-[#4318FF]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#F4F7FE] hover:bg-transparent">
                    <TableHead className="text-[#4363C7] pl-6">Operating System</TableHead>
                    <TableHead className="text-right text-[#4363C7]">Users</TableHead>
                    <TableHead className="text-right text-[#4363C7]">Sessions</TableHead>
                    <TableHead className="text-right text-[#4363C7] pr-6">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDeviceTableData().length > 0 ? (
                    (() => {
                      const data = getDeviceTableData();
                      const totalSessions = data.reduce((sum: number, d: any) => sum + d.sessions, 0);
                      return data.map((device: any, i: number) => (
                        <TableRow key={i} className="border-[#F4F7FE] hover:bg-[#F4F7FE]/50">
                          <TableCell className="font-bold text-[#2B3674] flex items-center gap-2 pl-6">
                            {device.device?.toLowerCase().includes("mac") || device.device?.toLowerCase().includes("ios") ? (
                              <Monitor className="h-4 w-4 text-[#4318FF]" />
                            ) : device.device?.toLowerCase().includes("windows") ? (
                              <Monitor className="h-4 w-4 text-[#00A3FF]" />
                            ) : device.device?.toLowerCase().includes("android") ? (
                              <Smartphone className="h-4 w-4 text-[#3DDC84]" />
                            ) : device.device?.toLowerCase().includes("linux") ? (
                              <Monitor className="h-4 w-4 text-[#FCC624]" />
                            ) : (
                              <Monitor className="h-4 w-4 text-[#4318FF]" />
                            )}
                            {device.device}
                          </TableCell>
                          <TableCell className="text-right font-medium text-[#2B3674]">
                            {device.users.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium text-[#2B3674]">
                            {device.sessions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium text-[#2B3674] pr-6">
                            {totalSessions > 0 ? ((device.sessions / totalSessions) * 100).toFixed(1) : 0}%
                          </TableCell>
                        </TableRow>
                      ));
                    })()
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-[#4363C7]"
                      >
                        No platform data available
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
