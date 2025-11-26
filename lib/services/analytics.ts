import { BaseHttpService } from "./base";

// Core Analytics Types
export interface AnalyticsData {
  query: {
    StartDate: string;
    EndDate: string;
    EventType: string;
    UserID: string;
    SessionID: string;
    Metrics: string[];
    GroupBy: string;
    Limit: number;
    Offset: number;
  };
  results: AnalyticsMetricResult[];
  meta: {
    total_events: number;
    processing_time: number;
    date_range: string;
  };
}

export interface AnalyticsMetricResult {
  metric: string;
  value: number | Record<string, any>;
  time_series?: Array<{
    date: string;
    value: number;
    unique_users?: number;
  }>;
}

export interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  revenueMetrics: RevenueMetrics;
  userHealthScore: number;
  churnRate: number;
  atRiskUsers: number;
  revenueLoss: number;
  chartData: ChartData[];
}

export interface RealtimeData {
  activeUsers: number;
  currentSessions: Session[];
  recentEvents: EventData[];
  topPages: PageData[];
  activeCountries: CountryData[];
}

export interface UserMetrics {
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  userRetention: RetentionData[];
  userSegments: SegmentData[];
  userJourney: JourneyData[];
}

export interface EventData {
  id: string;
  name: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  properties: Record<string, any>;
  url: string;
  userAgent: string;
  ipAddress?: string;
  country?: string;
  device?: string;
  browser?: string;
}

export interface EventSummary {
  totalEvents: number;
  uniqueEvents: number;
  topEvents: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  eventTrends: Array<{
    date: string;
    count: number;
  }>;
}

export interface Session {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  pageViews: number;
  events: number;
  eventsList?: any[]; // Full list of events for replay
  device: string;
  browser: string;
  location: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionsOverview {
  totalSessions: number;
  activeUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  sessionDurationTrend: { time: string; duration: number }[];
}

// DAU/WAU/MAU Types
export interface DAUMetrics {
  date: string;
  dailyActiveUsers: number;
  previousDayUsers: number;
  percentChange: number;
}

export interface WAUMetrics {
  week: string;
  weeklyActiveUsers: number;
  previousWeekUsers: number;
  percentChange: number;
}

export interface MAUMetrics {
  month: string;
  monthlyActiveUsers: number;
  previousMonthUsers: number;
  percentChange: number;
}

export interface PageViewsData {
  page: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  date: string;
}

export interface SessionAnalyticsData {
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime: string;
  duration: number;
  pageViews: number;
  events: Array<{
    type: string;
    timestamp: string;
    data: any;
  }>;
  deviceInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    ip?: string;
  };
}

export interface ErrorAnalyticsData {
  errorType: string;
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  affectedUsers: number;
}

// Supporting types
export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

export interface RetentionData {
  cohort: string;
  day0: number;
  day1: number;
  day7: number;
  day14: number;
  day30: number;
}

export interface SegmentData {
  name: string;
  count: number;
  percentage: number;
  avgValue: number;
}

export interface JourneyData {
  step: string;
  users: number;
  dropOff: number;
  conversionRate: number;
}

export interface PageData {
  url: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface CountryData {
  country: string;
  code: string;
  count: number;
  percentage: number;
}

export class AnalyticsService extends BaseHttpService {
  // Core analytics endpoints
  async getAnalytics(
    projectId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      event?: string;
    }
  ): Promise<AnalyticsData> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.event) searchParams.set("event", params.event);

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/analytics${query ? `?${query}` : ""}`
    );
  }

  async getDashboard(projectId: string): Promise<DashboardData> {
    return this.request(`/api/v1/dashboard`, { projectId });
  }

  async getRealtime(projectId: string): Promise<RealtimeData> {
    return this.request(`/api/v1/projects/${projectId}/realtime`);
  }

  async getUserMetrics(projectId: string): Promise<UserMetrics> {
    return this.request(`/api/v1/projects/${projectId}/user-metrics`);
  }

  // Global analytics endpoints (backend-compatible)
  async getAnalyticsGlobal(params?: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    userId?: string;
    sessionId?: string;
    metrics?: string[];
    groupBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<AnalyticsData> {
    const searchParams = new URLSearchParams();

    // Required date parameters with defaults
    const startDate = params?.startDate || "2025-01-01";
    const endDate = params?.endDate || "2025-12-31";

    searchParams.set("start_date", startDate);
    searchParams.set("end_date", endDate);

    // Default metrics if not provided
    const metrics = params?.metrics || [
      "total_events",
      "unique_users",
      "top_events",
      "dau",
      "wau",
      "mau",
      "page_views",
      "total_sessions",
      "conversion_rate",
      "bounce_rate",
    ];
    searchParams.set("metrics", metrics.join(","));

    // Optional filters
    if (params?.eventType) searchParams.set("event_type", params.eventType);
    if (params?.userId) searchParams.set("user_id", params.userId);
    if (params?.sessionId) searchParams.set("session_id", params.sessionId);
    if (params?.groupBy) searchParams.set("group_by", params.groupBy);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    console.log("🔍 Analytics API Request:", `/api/v1/analytics?${query}`);
    const response = await this.request(
      `/api/v1/analytics${query ? `?${query}` : ""}`
    );
    console.log(
      "📊 Analytics API Response:",
      JSON.stringify(response, null, 2)
    );
    return response as AnalyticsData;
  }

  async getDashboardGlobal(): Promise<DashboardData> {
    return this.request("/api/v1/dashboard");
  }

  async getUserMetricsGlobal(): Promise<UserMetrics> {
    return this.request("/api/v1/user-metrics");
  }

  // DAU/WAU/MAU endpoints
  async getDAU(projectId: string, date?: string): Promise<DAUMetrics> {
    const params = date ? `?date=${date}` : "";
    return this.request(`/api/v1/projects/${projectId}/analytics/dau${params}`);
  }

  async getWAU(projectId: string, week?: string): Promise<WAUMetrics> {
    const params = week ? `?week=${week}` : "";
    return this.request(`/api/v1/projects/${projectId}/analytics/wau${params}`);
  }

  async getMAU(projectId: string, month?: string): Promise<MAUMetrics> {
    const params = month ? `?month=${month}` : "";
    return this.request(`/api/v1/projects/${projectId}/analytics/mau${params}`);
  }

  async getPageViews(
    projectId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      page?: string;
    }
  ): Promise<PageViewsData> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.page) searchParams.set("page", params.page);

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/analytics/pageviews${
        query ? `?${query}` : ""
      }`
    );
  }

  async getSessionAnalytics(
    projectId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      sessionId?: string;
    }
  ): Promise<SessionAnalyticsData> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.sessionId) searchParams.set("sessionId", params.sessionId);

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/analytics/sessions${
        query ? `?${query}` : ""
      }`
    );
  }

  async getErrorAnalytics(
    projectId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      errorType?: string;
    }
  ): Promise<ErrorAnalyticsData> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.errorType) searchParams.set("errorType", params.errorType);

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/analytics/errors${
        query ? `?${query}` : ""
      }`
    );
  }

  // Events endpoints
  async getEvents(
    projectId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      eventName?: string;
      userId?: string;
    }
  ): Promise<EventData[]> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.eventName) searchParams.set("eventName", params.eventName);
    if (params?.userId) searchParams.set("userId", params.userId);

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/events${query ? `?${query}` : ""}`
    );
  }

  async getEventSummary(projectId: string): Promise<EventSummary> {
    return this.request(`/api/v1/projects/${projectId}/events/summary`);
  }

  // Sessions endpoints
  async getSessions(projectId: string): Promise<Session[]> {
    const response = (await this.request(
      `/api/v1/projects/${projectId}/recordings`
    )) as any;
    // Handle the response structure which contains { recordings: [], total: number, ... }
    const recordingsList = response.recordings || [];

    return recordingsList.map((recording: any) => ({
      id: recording.id,
      userId: recording.user_id,
      startTime: recording.created_at,
      duration: recording.duration,
      events: recording.event_count,
      pageViews: 0, // Not available in recording list
      device: "Unknown", // Not available in recording list
      browser: "Unknown", // Not available in recording list
      location: "Unknown", // Not available in recording list
      projectId: projectId,
      createdAt: recording.created_at,
      updatedAt: recording.updated_at,
    }));
  }

  async getSession(projectId: string, sessionId: string): Promise<Session> {
    const session = (await this.request(
      `/api/v1/projects/${projectId}/recordings/${sessionId}`
    )) as any;

    return {
      id: session.id,
      userId: session.user_id,
      startTime: session.start_time,
      endTime: session.end_time,
      duration: session.duration,
      pageViews: session.page_views,
      events: Array.isArray(session.events)
        ? session.events.length
        : session.events,
      eventsList: session.events || [],
      device: session.device,
      browser: session.browser,
      location: session.city || session.country || session.location,
      projectId: projectId,
      createdAt: session.start_time,
      updatedAt: session.end_time,
    };
  }

  async getSessionsOverview(projectId: string): Promise<SessionsOverview> {
    return this.request(`/api/v1/projects/${projectId}/sessions/overview`);
  }
}

// Helper functions to extract metrics from analytics response
export const getMetricValue = (
  data: AnalyticsData,
  metric: string
): number | any => {
  const result = data?.results?.find((r) => r.metric === metric);
  return result?.value ?? 0;
};

export const getDAUValue = (data: AnalyticsData) => {
  console.log("📈 getDAUValue - Full Analytics Data:", data);
  const result = data?.results?.find((r) => r.metric === "dau");
  console.log("📈 getDAUValue - DAU Result:", result);
  console.log("📈 getDAUValue - DAU Value:", result?.value);
  console.log("📈 getDAUValue - DAU Time Series:", result?.time_series);
  return typeof result?.value === "number" ? result.value : 0;
};

export const getWAUValue = (data: AnalyticsData) => {
  const result = data?.results?.find((r) => r.metric === "wau");
  console.log("📈 getWAUValue - WAU Result:", result);
  return typeof result?.value === "number" ? result.value : 0;
};

export const getMAUValue = (data: AnalyticsData) => {
  const result = data?.results?.find((r) => r.metric === "mau");
  console.log("📈 getMAUValue - MAU Result:", result);
  return typeof result?.value === "number" ? result.value : 0;
};

export const getPageViewsValue = (data: AnalyticsData) => {
  const result = data?.results?.find((r) => r.metric === "page_views");
  return typeof result?.value === "number" ? result.value : 0;
};

export const getTotalEventsValue = (data: AnalyticsData) => {
  const result = data?.results?.find((r) => r.metric === "total_events");
  return typeof result?.value === "number" ? result.value : 0;
};

export const getUniqueUsersValue = (data: AnalyticsData) => {
  const result = data?.results?.find((r) => r.metric === "unique_users");
  return typeof result?.value === "number" ? result.value : 0;
};

export const getTopEventsValue = (data: AnalyticsData) => {
  const result = data?.results?.find((r) => r.metric === "top_events");
  // Convert object to array format if needed
  if (
    result?.value &&
    typeof result.value === "object" &&
    !Array.isArray(result.value)
  ) {
    // If it's an empty object, return empty array
    if (Object.keys(result.value).length === 0) {
      return [];
    }
    // If it's an object with event data, convert to array
    return Object.entries(result.value)?.map(([name, count]) => ({
      name,
      count: typeof count === "number" ? count : 0,
    }));
  }
  return Array.isArray(result?.value) ? result.value : [];
};

export const getConversionRate = (data: AnalyticsData) => {
  const result = data?.results?.find((r) => r.metric === "conversion_rate");
  return typeof result?.value === "number" ? result.value : 0;
};

export const getTotalSessionsValue = (data: AnalyticsData) => {
  const result = data?.results?.find((r) => r.metric === "total_sessions");
  return typeof result?.value === "number" ? result.value : 0;
};

// Export a singleton instance
export const analyticsService = new AnalyticsService();
