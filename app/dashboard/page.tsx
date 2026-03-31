"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { WorldMap } from "@/components/world-map";
import {
  getDAUValue,
  getWAUValue,
  getMAUValue,
  getPageViewsValue,
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
  Monitor,
  ArrowUpRight,
  Calendar,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sanitizeText, sanitizeObject } from "@/lib/sanitization";

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg border px-3 py-2 text-[0.75rem]"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E7E5E4",
          color: "#1C1917",
          boxShadow: "0 4px 12px rgba(28,25,23,0.08)",
        }}
      >
        <p style={{ color: "#A8A29E" }}>{label}</p>
        <p className="font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
  iconColor = "#2563EB",
  iconBg = "rgba(37,99,235,0.07)",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  href?: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div
      className="rounded-xl border p-5 bg-white transition-shadow duration-150"
      style={{ borderColor: "#E7E5E4" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(28,25,23,0.06)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon
            className="w-4 h-4"
            strokeWidth={1.75}
            style={{ color: iconColor }}
          />
        </div>
        {href && (
          <Link href={href}>
            <ArrowUpRight
              className="w-3.5 h-3.5"
              style={{ color: "#A8A29E" }}
            />
          </Link>
        )}
      </div>
      <p
        className="text-[0.75rem] font-medium mb-1"
        style={{ color: "#78716C" }}
      >
        {label}
      </p>
      <p
        className="text-[1.6rem] font-semibold tabular-nums tracking-tight"
        style={{ color: "#1C1917", lineHeight: 1.1 }}
      >
        {value}
      </p>
      <p className="text-[0.75rem] mt-1" style={{ color: "#A8A29E" }}>
        {sub}
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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

  const [revenueMetrics, setRevenueMetrics] = useState<any>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [retentionData, setRetentionData] = useState<any>(null);
  const [bounceRate, setBounceRate] = useState<number>(0);
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);
  const [engagementTab, setEngagementTab] = useState<"dau" | "wau" | "mau">(
    "dau"
  );
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
      );

      fetchEvents(true);
      fetchAllData(startDateStr, endDateStr);
    }
  }, [effectiveProjectId, fetchAnalytics, fetchEvents, dateRange]);

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
      if (retentionRes) setRetentionData(retentionRes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load some dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingEnhanced(false);
    }
  };

  const uniqueUsers = analyticsData ? getUniqueUsersValue(analyticsData) : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatPercentage = (value: number) => `${value?.toFixed(1)}%`;

  // Process Device Data for Table
  const getDeviceTableData = () => {
    if (deviceData?.by_os && deviceData.by_os.length > 0) {
      return deviceData.by_os.map((d: any) => ({
        device: d.os || "Unknown",
        sessions: d.sessions || 0,
        users: d.users || 0,
      }));
    }
    if (deviceData?.by_device && deviceData.by_device.length > 0) {
      return deviceData.by_device.map((d: any) => ({
        device: d.device || d.os || "Unknown",
        sessions: d.sessions || 0,
        users: d.users || 0,
      }));
    }
    if (Array.isArray(events) && events.length > 0) {
      const osMap = new Map<
        string,
        { os: string; sessions: number; users: Set<string> }
      >();
      events.forEach((event: any) => {
        const os = event.Os || event.os || event.Properties?.os || "Unknown";
        if (!os || os === "Unknown") return;
        const existing = osMap.get(os) || {
          os,
          sessions: 0,
          users: new Set<string>(),
        };
        existing.sessions++;
        const userId =
          event.UserId || event.user_id || event.SessionId || event.session_id || "";
        if (userId) existing.users.add(userId);
        osMap.set(os, existing);
      });
      return Array.from(osMap.values())
        .map((item) => ({
          device: item.os,
          sessions: item.sessions,
          users: item.users.size || item.sessions,
        }))
        .sort((a, b) => b.sessions - a.sessions);
    }
    return [];
  };

  // Process Location Data
  const getGeoData = () => {
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
    if (Array.isArray(events) && events.length > 0) {
      const countryMap = new Map<
        string,
        { country: string; users: number; sessions: number }
      >();
      events.forEach((event: any) => {
        const country =
          event.Country || event.country || event.Properties?.country || null;
        if (!country || country === "Unknown" || country === "Local") return;
        const existing = countryMap.get(country) || {
          country,
          users: 0,
          sessions: 0,
        };
        existing.users++;
        existing.sessions++;
        countryMap.set(country, existing);
      });
      return Array.from(countryMap.values())
        .map((item) => ({
          country: item.country,
          users: item.users,
          sessions: item.sessions,
          code: getCountryCode(item.country),
        }))
        .sort((a, b) => b.users - a.users);
    }
    return [];
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
    if (!analyticsData?.results) return [];
    const result = analyticsData.results.find(
      (r: any) => r.metric === engagementTab
    );
    return result?.time_series || [];
  };

  const getEngagementValue = () => {
    if (!analyticsData) return 0;
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

  if (!effectiveProjectId) {
    return (
      <PageShell title="Dashboard" breadcrumb="Pages / Dashboard">
        <div className="flex flex-col h-full bg-transparent">
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="h-12 w-12 text-[#2563EB] animate-spin" />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "#1C1917" }}
                >
                  Select a Project
                </h3>
                <p style={{ color: "#78716C" }}>
                  Please select a project to view the dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Dashboard"
      breadcrumb="Pages / Dashboard"
      action={
        <div
          className="flex items-center space-x-2 bg-white py-1.5 px-3 rounded-lg border shadow-sm"
          style={{ borderColor: "#E7E5E4" }}
        >
          <Calendar className="h-4 w-4" style={{ color: "#78716C" }} />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px] text-xs border-none shadow-none focus:ring-0 font-medium h-6 pt-0 pb-0 px-1" style={{ color: "#1C1917" }}>
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
      }
    >
      {/* ── Revenue Analytics ────────────────────────────────────────────── */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-[0.9375rem] font-semibold"
            style={{ color: "#1C1917" }}
          >
            Revenue Analytics
          </h2>
          <Link href="/dashboard/revenue">
            <span
              className="text-[0.75rem] flex items-center gap-1"
              style={{ color: "#2563EB" }}
            >
              View Details <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {loadingEnhanced ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-white/50 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : revenueMetrics ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            <MetricCard
              icon={DollarSign}
              label="MRR"
              value={formatCurrency(revenueMetrics.mrr)}
              sub={`${revenueMetrics.growth_rate > 0 ? "+" : ""}${formatPercentage(revenueMetrics.growth_rate)} since last month`}
              href="/dashboard/revenue"
            />
            <MetricCard
              icon={Users}
              label="Active Subs"
              value={String(revenueMetrics.active_subscriptions)}
              sub={`${revenueMetrics.new_subscriptions} new this month`}
              href="/dashboard/revenue"
            />
            <MetricCard
              icon={TrendingDown}
              label="Churn Rate"
              value={formatPercentage(revenueMetrics.churn_rate)}
              sub={`${revenueMetrics.churned_subscriptions} churned`}
              href="/dashboard/churn-awareness"
            />
            <MetricCard
              icon={DollarSign}
              label="ARPU"
              value={formatCurrency(revenueMetrics.arpu)}
              sub="Avg. Revenue Per User"
              href="/dashboard/revenue"
            />
          </div>
        ) : (
          <div
            className="rounded-xl border-2 border-dashed p-8 text-center mb-5"
            style={{ borderColor: "#E7E5E4" }}
          >
            <p className="text-[0.875rem] mb-4" style={{ color: "#78716C" }}>
              No revenue data available. Configure Stripe to see metrics.
            </p>
            <Link href="/dashboard/revenue">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg text-white"
                style={{ backgroundColor: "#2563EB" }}
              >
                Configure Stripe
              </button>
            </Link>
          </div>
        )}

        {/* Revenue trend chart */}
        {((revenueAnalytics?.time_series &&
          revenueAnalytics.time_series.length > 0) ||
          (revenueMetrics?.time_series &&
            revenueMetrics.time_series.length > 0)) && (
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: "#E7E5E4" }}
          >
            <p
              className="text-[0.875rem] font-semibold mb-0.5"
              style={{ color: "#1C1917" }}
            >
              Revenue Trend
            </p>
            <p className="text-[0.75rem] mb-5" style={{ color: "#A8A29E" }}>
              Daily revenue from Stripe charges over the last 30 days
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart
                data={
                  revenueAnalytics?.time_series ||
                  revenueMetrics?.time_series ||
                  []
                }
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563EB"
                      stopOpacity={0.12}
                    />
                    <stop
                      offset="100%"
                      stopColor="#2563EB"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F3F2F1" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#A8A29E" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#A8A29E" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={1.5}
                  fill="url(#revGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── User Engagement ──────────────────────────────────────────────── */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-[0.9375rem] font-semibold"
            style={{ color: "#1C1917" }}
          >
            User Engagement
          </h2>
          <Link href="/dashboard/features">
            <span
              className="text-[0.75rem] flex items-center gap-1"
              style={{ color: "#2563EB" }}
            >
              View Details <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          {[
            { label: "Total Events", value: totalEvents.toLocaleString() },
            { label: "Page Views", value: pageViews.toLocaleString() },
            { label: "Unique Users", value: uniqueUsers.toLocaleString() },
            { label: "Bounce Rate", value: `${bounceRate.toFixed(1)}%` },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border bg-white p-5"
              style={{ borderColor: "#E7E5E4" }}
            >
              <p
                className="text-[0.75rem] font-medium mb-1"
                style={{ color: "#78716C" }}
              >
                {m.label}
              </p>
              <p
                className="text-[1.6rem] font-semibold tabular-nums tracking-tight"
                style={{ color: "#1C1917", lineHeight: 1.1 }}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Active Users with DAU/WAU/MAU tabs */}
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: "#E7E5E4" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p
                  className="text-[0.875rem] font-semibold"
                  style={{ color: "#1C1917" }}
                >
                  Active Users
                </p>
                <p className="text-[0.75rem]" style={{ color: "#A8A29E" }}>
                  User engagement over time
                </p>
              </div>
              <div
                className="flex items-center gap-1 rounded-lg p-0.5"
                style={{ backgroundColor: "#F3F2F1" }}
              >
                {(["dau", "wau", "mau"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setEngagementTab(t)}
                    className="px-3 py-1 text-[0.7rem] font-semibold rounded-md uppercase tracking-wide transition-colors"
                    style={
                      engagementTab === t
                        ? {
                            backgroundColor: "#FFFFFF",
                            color: "#1C1917",
                            boxShadow: "0 1px 3px rgba(28,25,23,0.08)",
                          }
                        : { color: "#A8A29E" }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[0.75rem] mb-2" style={{ color: "#A8A29E" }}>
              {getEngagementValue().toLocaleString()}{" "}
              {engagementTab === "dau"
                ? "Daily Active Users"
                : engagementTab === "wau"
                  ? "Weekly Active Users"
                  : "Monthly Active Users"}
            </div>
            {loadingAnalytics ? (
              <div className="h-[140px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#2563EB" }} />
              </div>
            ) : getEngagementData().length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart
                  data={getEngagementData()}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="dauGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#2563EB"
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="100%"
                        stopColor="#2563EB"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#F3F2F1" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#A8A29E" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#A8A29E" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={1.5}
                    fill="url(#dauGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-[140px] flex items-center justify-center text-[0.8125rem]"
                style={{ color: "#A8A29E" }}
              >
                No data available for this period
              </div>
            )}
          </div>

          {/* Bounce Rate */}
          <div
            className="rounded-xl border bg-white p-5 flex flex-col justify-between"
            style={{ borderColor: "#E7E5E4" }}
          >
            <div>
              <p
                className="text-[0.875rem] font-semibold mb-0.5"
                style={{ color: "#1C1917" }}
              >
                Bounce Rate
              </p>
              <p className="text-[0.75rem] mb-5" style={{ color: "#A8A29E" }}>
                Single-page sessions (lower is better)
              </p>
            </div>
            {loadingAnalytics ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#2563EB" }} />
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center flex-1 py-4">
                  <p
                    className="text-[2.5rem] font-semibold tabular-nums"
                    style={{ color: "#1C1917" }}
                  >
                    {bounceRate.toFixed(1)}%
                  </p>
                  <span
                    className="mt-2 px-3 py-1 rounded-full text-[0.75rem] font-semibold"
                    style={
                      bounceRate < 40
                        ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                        : bounceRate < 55
                          ? { backgroundColor: "#EFF6FF", color: "#1D4ED8" }
                          : bounceRate < 70
                            ? { backgroundColor: "#FEF9C3", color: "#854D0E" }
                            : { backgroundColor: "#FEE2E2", color: "#991B1B" }
                    }
                  >
                    {bounceRate < 40
                      ? "Excellent"
                      : bounceRate < 55
                        ? "Good"
                        : bounceRate < 70
                          ? "Average"
                          : "Needs Attention"}
                  </span>
                  <p
                    className="text-[0.8125rem] mt-2"
                    style={{ color: "#78716C" }}
                  >
                    {bounceRate < 40
                      ? "Users are highly engaged"
                      : bounceRate < 55
                        ? "Healthy engagement levels"
                        : bounceRate < 70
                          ? "Room for improvement"
                          : "Consider improving content"}
                  </p>
                </div>
                <div
                  className="pt-4 border-t"
                  style={{ borderColor: "#F3F2F1" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[0.75rem]"
                      style={{ color: "#A8A29E" }}
                    >
                      {(100 - bounceRate).toFixed(1)}% engaged sessions
                    </span>
                    <div
                      className="w-32 h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#F3F2F1" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${100 - bounceRate}%`,
                          backgroundColor: "#16A34A",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Events + Recent Events */}
        <div className="grid lg:grid-cols-2 gap-5 mt-5">
          {/* Top Events */}
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: "#E7E5E4" }}
          >
            <p
              className="text-[0.875rem] font-semibold mb-0.5"
              style={{ color: "#1C1917" }}
            >
              Top Events
            </p>
            <p className="text-[0.75rem] mb-5" style={{ color: "#A8A29E" }}>
              Most frequently triggered events in the selected period
            </p>
            <div className="space-y-3">
              {(topEvents || []).slice(0, 5)?.map((ev: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[0.8125rem] font-mono"
                      style={{ color: "#1C1917" }}
                    >
                      {sanitizeText(ev.name || `Event ${i + 1}`)}
                    </span>
                    <span
                      className="text-[0.75rem] tabular-nums"
                      style={{ color: "#78716C" }}
                    >
                      {ev.count?.toLocaleString() || 0} ·{" "}
                      {totalEvents > 0
                        ? ((ev.count / totalEvents) * 100).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: "#F3F2F1" }}
                  >
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${totalEvents > 0 ? (ev.count / totalEvents) * 100 : 0}%`,
                        backgroundColor: "#2563EB",
                        opacity: 0.75,
                      }}
                    />
                  </div>
                </div>
              ))}
              {(!topEvents || topEvents.length === 0) && (
                <p
                  className="text-[0.8125rem] text-center py-4"
                  style={{ color: "#A8A29E" }}
                >
                  No events data available
                </p>
              )}
            </div>
          </div>

          {/* Recent Events */}
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: "#E7E5E4" }}
          >
            <p
              className="text-[0.875rem] font-semibold mb-0.5"
              style={{ color: "#1C1917" }}
            >
              Recent Events
            </p>
            <p className="text-[0.75rem] mb-5" style={{ color: "#A8A29E" }}>
              Latest events from your users
            </p>
            <div className="space-y-2">
              {Array.isArray(events) &&
                events.slice(0, 8)?.map((event: any, index: number) => {
                  const sanitizedEvent = sanitizeObject(event);
                  const country =
                    sanitizedEvent.UserAgentDetails?.country ||
                    sanitizedEvent.Country ||
                    "Unknown";
                  const countryFlag =
                    country !== "Unknown" ? getCountryFlag(country) : "🌍";

                  return (
                    <div
                      key={sanitizedEvent.ID || index}
                      className="flex items-center gap-3 py-2 border-b last:border-0"
                      style={{ borderColor: "#F3F2F1" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[0.7rem]"
                        style={{ backgroundColor: "#F3F2F1" }}
                      >
                        {countryFlag}
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-[0.8125rem] font-medium"
                          style={{ color: "#1C1917" }}
                        >
                          {sanitizeText(
                            sanitizedEvent.Event ||
                              sanitizedEvent.event ||
                              "Unknown Event"
                          )}
                        </p>
                      </div>
                      <span
                        className="text-[0.75rem]"
                        style={{ color: "#A8A29E" }}
                      >
                        {new Date(
                          sanitizedEvent.Timestamp ||
                            sanitizedEvent.timestamp ||
                            Date.now()
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              {(!events || events.length === 0) && (
                <p
                  className="text-[0.8125rem] text-center py-4"
                  style={{ color: "#A8A29E" }}
                >
                  No recent events found. Start tracking events to see data
                  here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Location Analytics ───────────────────────────────────────────── */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-[0.9375rem] font-semibold"
            style={{ color: "#1C1917" }}
          >
            Location Analytics
          </h2>
          <span
            className="text-[0.75rem] flex items-center gap-1"
            style={{ color: "#A8A29E" }}
          >
            View Details <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: "#E7E5E4" }}
          >
            <p
              className="text-[0.875rem] font-semibold mb-0.5"
              style={{ color: "#1C1917" }}
            >
              Global Distribution
            </p>
            <p className="text-[0.75rem] mb-5" style={{ color: "#A8A29E" }}>
              User activity by country
            </p>
            {loadingEnhanced ? (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  className="h-8 w-8 animate-spin"
                  style={{ color: "#2563EB" }}
                />
              </div>
            ) : getGeoData().length > 0 ? (
              <div className="h-[300px] relative overflow-hidden">
                <WorldMap geoData={getGeoData()} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Globe
                  className="w-10 h-10"
                  style={{ color: "#D6D3D1" }}
                  strokeWidth={1}
                />
                <p
                  className="text-[0.8125rem]"
                  style={{ color: "#A8A29E" }}
                >
                  No location data available
                </p>
              </div>
            )}
          </div>
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: "#E7E5E4" }}
          >
            <p
              className="text-[0.875rem] font-semibold mb-0.5"
              style={{ color: "#1C1917" }}
            >
              Top Countries
            </p>
            <p className="text-[0.75rem] mb-5" style={{ color: "#A8A29E" }}>
              By user count
            </p>
            {getGeoData().length > 0 ? (
              <div className="space-y-3">
                {getGeoData()
                  .slice(0, 6)
                  .map((geo: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: "#F3F2F1",
                            color: "#1C1917",
                          }}
                        >
                          {i + 1}
                        </div>
                        <span
                          className="text-[0.8125rem] font-medium"
                          style={{ color: "#1C1917" }}
                        >
                          {geo.country}
                        </span>
                      </div>
                      <span
                        className="text-[0.8125rem] font-semibold tabular-nums"
                        style={{ color: "#1C1917" }}
                      >
                        {geo.users.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p
                  className="text-[0.8125rem]"
                  style={{ color: "#A8A29E" }}
                >
                  No data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Platform Analytics ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-[0.9375rem] font-semibold"
            style={{ color: "#1C1917" }}
          >
            Platform Analytics
          </h2>
          <span
            className="text-[0.75rem] flex items-center gap-1"
            style={{ color: "#A8A29E" }}
          >
            View Details <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
        <div
          className="rounded-xl border bg-white overflow-hidden"
          style={{ borderColor: "#E7E5E4" }}
        >
          <div
            className="p-5 border-b"
            style={{ borderColor: "#F3F2F1" }}
          >
            <p
              className="text-[0.875rem] font-semibold mb-0.5"
              style={{ color: "#1C1917" }}
            >
              Operating System Distribution
            </p>
            <p className="text-[0.75rem]" style={{ color: "#A8A29E" }}>
              Breakdown by operating system
            </p>
          </div>
          {loadingEnhanced ? (
            <div className="flex justify-center py-8">
              <Loader2
                className="animate-spin"
                style={{ color: "#2563EB" }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#FAFAF9" }}>
                    <th
                      className="text-left text-[0.75rem] font-medium px-5 py-3"
                      style={{ color: "#78716C" }}
                    >
                      Operating System
                    </th>
                    <th
                      className="text-right text-[0.75rem] font-medium px-5 py-3"
                      style={{ color: "#78716C" }}
                    >
                      Users
                    </th>
                    <th
                      className="text-right text-[0.75rem] font-medium px-5 py-3"
                      style={{ color: "#78716C" }}
                    >
                      Sessions
                    </th>
                    <th
                      className="text-right text-[0.75rem] font-medium px-5 py-3"
                      style={{ color: "#78716C" }}
                    >
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getDeviceTableData().length > 0 ? (
                    (() => {
                      const data = getDeviceTableData();
                      const totalSessionsCalc = data.reduce(
                        (sum: number, d: any) => sum + d.sessions,
                        0
                      );
                      return data.map((row: any, i: number) => {
                        const share =
                          totalSessionsCalc > 0
                            ? (row.sessions / totalSessionsCalc) * 100
                            : 0;
                        return (
                          <tr
                            key={i}
                            className="border-t"
                            style={{ borderColor: "#F3F2F1" }}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <Monitor
                                  className="w-3.5 h-3.5"
                                  style={{ color: "#A8A29E" }}
                                />
                                <span
                                  className="text-[0.8125rem] font-medium"
                                  style={{ color: "#1C1917" }}
                                >
                                  {row.device}
                                </span>
                              </div>
                            </td>
                            <td
                              className="px-5 py-3 text-right text-[0.8125rem] tabular-nums"
                              style={{ color: "#44403C" }}
                            >
                              {row.users}
                            </td>
                            <td
                              className="px-5 py-3 text-right text-[0.8125rem] tabular-nums"
                              style={{ color: "#44403C" }}
                            >
                              {row.sessions}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div
                                  className="w-20 h-1.5 rounded-full overflow-hidden"
                                  style={{ backgroundColor: "#F3F2F1" }}
                                >
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${share}%`,
                                      backgroundColor: "#2563EB",
                                      opacity: 0.75,
                                    }}
                                  />
                                </div>
                                <span
                                  className="text-[0.8125rem] tabular-nums font-medium w-10 text-right"
                                  style={{ color: "#44403C" }}
                                >
                                  {share.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-[0.8125rem]"
                        style={{ color: "#A8A29E" }}
                      >
                        No platform data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
