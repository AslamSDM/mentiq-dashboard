import { useSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export class ApiClient {
  private token: string | null = null;
  private projectId: string | null = null;

  constructor(token?: string) {
    this.token = token || null;
  }

  setToken(token: string) {
    this.token = token;
    console.log(
      "API Client: Token set",
      token ? "✅" : "❌",
      token ? `(${token.substring(0, 20)}...)` : ""
    );
  }

  getToken(): string | null {
    return this.token;
  }

  setProjectId(projectId: string) {
    this.projectId = projectId;
    console.log("API Client: Project ID set", projectId);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const session = useSession();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    console.log("Session Data in API Request:", session);
    if (session.data?.accessToken) {
      (
        headers as Record<string, string>
      ).Authorization = `Bearer ${this.token}`;
      console.log(`API Request: ${endpoint} with auth token ✅`);
    } else {
      console.warn(`API Request: ${endpoint} without auth token ⚠️`);
    }

    if (this.projectId) {
      (headers as Record<string, string>)["X-Project-ID"] = this.projectId;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error: ${endpoint} - ${response.status}`, errorData);
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    return this.request("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Project endpoints
  async getProjects() {
    return this.request<Project[]>("/api/v1/projects");
  }

  async createProject(name: string) {
    return this.request<Project>("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getProject(projectId: string) {
    return this.request<Project>(`/api/v1/projects/${projectId}`);
  }

  async updateProject(
    projectId: string,
    data: { name?: string; domain?: string; settings?: any }
  ) {
    return this.request<Project>(`/api/v1/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: string) {
    return this.request(`/api/v1/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  // API Key endpoints
  async createApiKeys(
    projectId: string,
    name: string,
    permissions: string[] = []
  ) {
    return this.request<ApiKey>(`/api/v1/projects/${projectId}/apikeys`, {
      method: "POST",
      body: JSON.stringify({ name, permissions }),
    });
  }

  async getApiKeys(projectId: string) {
    return this.request<ApiKey[]>(`/api/v1/projects/${projectId}/apikeys`);
  }

  async deleteApiKey(projectId: string, keyId: string) {
    return this.request(`/api/v1/projects/${projectId}/apikeys/${keyId}`, {
      method: "DELETE",
    });
  }

  async updateApiKey(
    projectId: string,
    keyId: string,
    data: { name?: string; permissions?: string[] }
  ) {
    return this.request<ApiKey>(
      `/api/v1/projects/${projectId}/apikeys/${keyId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  // Health check endpoint
  async healthCheck() {
    return this.request(`/health`);
  }

  // Analytics endpoints
  async getAnalytics(
    projectId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      event?: string;
    }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.event) searchParams.set("event", params.event);

    const query = searchParams.toString();
    return this.request<AnalyticsData>(
      `/api/v1/projects/${projectId}/analytics${query ? `?${query}` : ""}`
    );
  }

  async getDashboard(projectId: string) {
    return this.request<DashboardData>(`/api/v1/dashboard`);
  }

  async getRealtime(projectId: string) {
    return this.request<RealtimeData>(`/api/v1/projects/${projectId}/realtime`);
  }

  async getUserMetrics(projectId: string) {
    return this.request<UserMetrics>(
      `/api/v1/projects/${projectId}/user-metrics`
    );
  }

  // Backend-compatible endpoints (without project ID in path - uses headers instead)
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
  }) {
    const searchParams = new URLSearchParams();

    // Required date parameters with defaults
    const startDate = params?.startDate || "2025-01-01";
    const endDate = params?.endDate || "2025-12-31";

    searchParams.set("start_date", startDate);
    searchParams.set("end_date", endDate);

    // Optional filters
    if (params?.eventType) searchParams.set("event_type", params.eventType);
    if (params?.userId) searchParams.set("user_id", params.userId);
    if (params?.sessionId) searchParams.set("session_id", params.sessionId);
    if (params?.groupBy) searchParams.set("group_by", params.groupBy);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return this.request<AnalyticsData>(
      `/api/v1/analytics${query ? `?${query}` : ""}`
    );
  }

  async getDashboardGlobal() {
    return this.request<DashboardData>("/api/v1/dashboard");
  }

  async getUserMetricsGlobal() {
    return this.request<UserMetrics>("/api/v1/user-metrics");
  }

  // Advanced Analytics endpoints (based on backend features)
  async getDAU(projectId: string, date?: string) {
    const params = date ? `?date=${date}` : "";
    return this.request<DAUMetrics>(
      `/api/v1/projects/${projectId}/analytics/dau${params}`
    );
  }

  async getWAU(projectId: string, week?: string) {
    const params = week ? `?week=${week}` : "";
    return this.request<WAUMetrics>(
      `/api/v1/projects/${projectId}/analytics/wau${params}`
    );
  }

  async getMAU(projectId: string, month?: string) {
    const params = month ? `?month=${month}` : "";
    return this.request<MAUMetrics>(
      `/api/v1/projects/${projectId}/analytics/mau${params}`
    );
  }

  async getPageViews(
    projectId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      page?: string;
    }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.page) searchParams.set("page", params.page);

    const query = searchParams.toString();
    return this.request<PageViewsData>(
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
  ) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.sessionId) searchParams.set("sessionId", params.sessionId);

    const query = searchParams.toString();
    return this.request<SessionAnalyticsData>(
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
  ) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.errorType) searchParams.set("errorType", params.errorType);

    const query = searchParams.toString();
    return this.request<ErrorAnalyticsData>(
      `/api/v1/projects/${projectId}/analytics/errors${
        query ? `?${query}` : ""
      }`
    );
  }

  // Data export endpoints
  async exportAnalyticsData(
    projectId: string,
    params: {
      startDate: string;
      endDate: string;
      format?: "json" | "csv";
      dataTypes?: string[];
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set("startDate", params.startDate);
    searchParams.set("endDate", params.endDate);
    if (params.format) searchParams.set("format", params.format);
    if (params.dataTypes)
      searchParams.set("dataTypes", params.dataTypes.join(","));

    return this.request<ExportData>(
      `/api/v1/projects/${projectId}/export?${searchParams.toString()}`
    );
  }

  async getSystemStatus() {
    return this.request<SystemStatus>("/api/v1/system/status");
  }

  async getStorageMetrics(projectId: string) {
    return this.request<StorageMetrics>(
      `/api/v1/projects/${projectId}/storage/metrics`
    );
  }

  // Heatmap endpoints
  async getHeatmaps(
    projectId: string,
    params?: {
      url?: string;
      startDate?: string;
      endDate?: string;
      type?: "click" | "scroll" | "move";
    }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.url) searchParams.set("url", params.url);
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.type) searchParams.set("type", params.type);

    const query = searchParams.toString();
    return this.request<HeatmapData>(
      `/api/v1/projects/${projectId}/heatmaps${query ? `?${query}` : ""}`
    );
  }

  async getHeatmapPages(projectId: string) {
    return this.request<HeatmapPage[]>(
      `/api/v1/projects/${projectId}/heatmaps/pages`
    );
  }

  // A/B Testing endpoints
  async getExperiments(projectId: string) {
    return this.request<Experiment[]>(
      `/api/v1/projects/${projectId}/experiments`
    );
  }

  async createExperiment(
    projectId: string,
    experiment: CreateExperimentRequest
  ) {
    return this.request<Experiment>(
      `/api/v1/projects/${projectId}/experiments`,
      {
        method: "POST",
        body: JSON.stringify(experiment),
      }
    );
  }

  async updateExperiment(
    projectId: string,
    experimentId: string,
    updates: Partial<Experiment>
  ) {
    return this.request<Experiment>(
      `/api/v1/projects/${projectId}/experiments/${experimentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    );
  }

  async getExperimentResults(projectId: string, experimentId: string) {
    return this.request<ExperimentResults>(
      `/api/v1/projects/${projectId}/experiments/${experimentId}/results`
    );
  }

  async deleteExperiment(projectId: string, experimentId: string) {
    return this.request(
      `/api/v1/projects/${projectId}/experiments/${experimentId}`,
      {
        method: "DELETE",
      }
    );
  }

  // A/B Testing Assignment & Tracking (Backend compatible endpoints)
  async getExperimentAssignment(
    experimentKey: string,
    userId: string,
    projectId?: string
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set("experimentKey", experimentKey);
    searchParams.set("userId", userId);
    if (projectId) searchParams.set("projectId", projectId);

    return this.request<VariantAssignment>(
      `/api/v1/experiments/${experimentKey}/assignment?${searchParams.toString()}`,
      { method: "POST" }
    );
  }

  async trackConversion(data: {
    experimentId: string;
    userId: string;
    eventName: string;
  }) {
    return this.request<TrackingResponse>("/api/v1/experiments/track", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExperimentStatus(experimentId: string, status: string) {
    return this.request(`/api/v1/experiments/${experimentId}/status`, {
      method: "PUT",
      body: `status=${status}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  // User management endpoints
  async getUsers(
    projectId: string,
    params?: { page?: number; limit?: number; search?: string }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return this.request<UserListResponse>(
      `/api/v1/projects/${projectId}/users${query ? `?${query}` : ""}`
    );
  }

  async getUser(projectId: string, userId: string) {
    return this.request<UserProfile>(
      `/api/v1/projects/${projectId}/users/${userId}`
    );
  }

  async getUserSessions(projectId: string, userId: string) {
    return this.request<SessionAnalyticsData[]>(
      `/api/v1/projects/${projectId}/users/${userId}/sessions`
    );
  }

  // Webhook endpoints
  async createWebhook(
    projectId: string,
    webhook: { url: string; events: string[]; secret?: string }
  ) {
    return this.request<Webhook>(`/api/v1/projects/${projectId}/webhooks`, {
      method: "POST",
      body: JSON.stringify(webhook),
    });
  }

  async getWebhooks(projectId: string) {
    return this.request<Webhook[]>(`/api/v1/projects/${projectId}/webhooks`);
  }

  async updateWebhook(
    projectId: string,
    webhookId: string,
    updates: Partial<Webhook>
  ) {
    return this.request<Webhook>(
      `/api/v1/projects/${projectId}/webhooks/${webhookId}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
  }

  async deleteWebhook(projectId: string, webhookId: string) {
    return this.request(`/api/v1/projects/${projectId}/webhooks/${webhookId}`, {
      method: "DELETE",
    });
  }

  async testWebhook(projectId: string, webhookId: string) {
    return this.request<WebhookTestResult>(
      `/api/v1/projects/${projectId}/webhooks/${webhookId}/test`,
      {
        method: "POST",
      }
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
  ) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.eventName) searchParams.set("eventName", params.eventName);
    if (params?.userId) searchParams.set("userId", params.userId);

    const query = searchParams.toString();
    return this.request<EventData[]>(
      `/api/v1/projects/${projectId}/events${query ? `?${query}` : ""}`
    );
  }

  async getEventSummary(projectId: string) {
    return this.request<EventSummary>(
      `/api/v1/projects/${projectId}/events/summary`
    );
  }

  async getSessions(projectId: string): Promise<Session[]> {
    return this.request(`/api/v1/projects/${projectId}/sessions`);
  }

  async getSession(projectId: string, sessionId: string): Promise<Session> {
    return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}`);
  }

  async getSessionsOverview(projectId: string): Promise<SessionsOverview> {
    return this.request(`/api/v1/projects/${projectId}/sessions/overview`);
  }
}

// Types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  apiKey?: string;
  stripeApiKey?: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  eventCount?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

// Analytics Types
export interface AnalyticsData {
  query: any;
  metrics: {
    dau?: { value: number };
    wau?: { value: number };
    mau?: { value: number };
    page_views?: {
      total: number;
      pages: any[];
    };
    top_events?: any[];
    [key: string]: any;
  };
  meta: any;
}

export interface AnalyticsMetricResult {
  metric: string;
  value: number | Record<string, any>;
}

// Legacy analytics format for backward compatibility
export interface LegacyAnalyticsData {
  totalEvents: number;
  uniqueUsers: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  events: EventData[];
  userFlow: UserFlowData[];
  topPages: PageData[];
  devices: DeviceData[];
  browsers: BrowserData[];
  countries: CountryData[];
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

// Heatmap Types
export interface HeatmapData {
  url: string;
  clicks: ClickData[];
  scrolls: ScrollData[];
  mouseMoves: MouseMoveData[];
  viewport: ViewportData;
  totalSessions: number;
}

export interface HeatmapPage {
  id: string;
  url: string;
  title: string;
  visits: number;
  lastUpdated: string;
}

export interface ClickData {
  x: number;
  y: number;
  count: number;
  element?: string;
}

export interface ScrollData {
  depth: number;
  count: number;
  percentage: number;
}

export interface MouseMoveData {
  path: Array<{ x: number; y: number; timestamp: number }>;
  density: Array<{ x: number; y: number; intensity: number }>;
}

export interface ViewportData {
  width: number;
  height: number;
  deviceType: "desktop" | "tablet" | "mobile";
}

// A/B Testing Types
export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: "draft" | "running" | "paused" | "completed";
  startDate: string;
  endDate?: string;
  trafficAllocation: number;
  variants: Variant[];
  goals: Goal[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperimentRequest {
  name: string;
  description: string;
  trafficAllocation: number;
  variants: Omit<Variant, "id">[];
  goals: Omit<Goal, "id">[];
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  trafficWeight: number;
  isControl: boolean;
  changes: VariantChange[];
}

export interface VariantChange {
  selector: string;
  property: string;
  value: string;
  type: "text" | "html" | "css" | "attribute";
}

export interface Goal {
  id: string;
  name: string;
  type: "pageview" | "click" | "custom_event";
  target: string;
  isPrimary: boolean;
}

export interface ExperimentResults {
  experimentId: string;
  summary: {
    totalVisitors: number;
    totalConversions: number;
    conversionRate: number;
    confidenceLevel: number;
    statisticalSignificance: boolean;
  };
  variants: VariantResults[];
  goals: GoalResults[];
  timeline: TimelineData[];
}

export interface VariantResults {
  variantId: string;
  name: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  improvement: number;
  confidenceInterval: [number, number];
}

export interface GoalResults {
  goalId: string;
  name: string;
  variants: Array<{
    variantId: string;
    conversions: number;
    conversionRate: number;
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
  device: string;
  browser: string;
  location: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email?: string;
  firstSeen: string;
  lastSeen: string;
  totalSessions: number;
  totalEvents: number;
  avgSessionDuration: number;
  properties?: Record<string, any>;
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

// Event Types
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

// Supporting Types
export interface UserFlowData {
  from: string;
  to: string;
  count: number;
  dropOffRate: number;
}

export interface PageData {
  url: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

export interface BrowserData {
  browser: string;
  version: string;
  count: number;
  percentage: number;
}

export interface CountryData {
  country: string;
  code: string;
  count: number;
  percentage: number;
}

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

export interface TimelineData {
  date: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

// Backend-specific analytics interfaces
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

export interface ExportData {
  exportId: string;
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  format: "json" | "csv";
  size?: number;
  createdAt: string;
  completedAt?: string;
}

export interface SystemStatus {
  status: "healthy" | "degraded" | "down";
  version: string;
  uptime: number;
  components: {
    database: "healthy" | "degraded" | "down";
    storage: "healthy" | "degraded" | "down";
    api: "healthy" | "degraded" | "down";
  };
  lastHealthCheck: string;
}

export interface StorageMetrics {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  eventCount: number;
  oldestEvent: string;
  newestEvent: string;
  compressionRatio: number;
  costEstimate: {
    monthly: number;
    currency: string;
  };
}

export interface UserListResponse {
  users: UserProfile[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface UserProfile {
  userId: string;
  firstSeen: string;
  lastSeen: string;
  sessionCount: number;
  totalPageViews: number;
  totalEvents: number;
  location?: {
    country: string;
    region?: string;
    city?: string;
  };
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  customProperties: Record<string, any>;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  failureCount: number;
}

export interface WebhookTestResult {
  success: boolean;
  responseCode?: number;
  responseTime: number;
  error?: string;
  timestamp: string;
}

export interface VariantAssignment {
  key: string;
  name: string;
  experimentId: string;
  userId: string;
}

export interface TrackingResponse {
  status: string;
  message?: string;
}

// Create a default instance
export const apiClient = new ApiClient();

// Helper to update the API client token
export function setApiToken(token: string) {
  apiClient.setToken(token);
}

// Helper to update the API client project ID
export function setApiProjectId(projectId: string) {
  apiClient.setProjectId(projectId);
}

// Helper functions to extract metrics from analytics response
export const getMetricValue = (
  data: AnalyticsData,
  metric: keyof AnalyticsData["metrics"]
) => {
  return data.metrics[metric];
};

export const getDAUValue = (data: AnalyticsData) => {
  console.log("Analytics Data:", data);
  const dauMetric = data.metrics.dau as { value: number } | undefined;
  return dauMetric?.value ?? 0;
};

export const getWAUValue = (data: AnalyticsData) => {
  const wauMetric = data.metrics.wau as { value: number } | undefined;
  return wauMetric?.value ?? 0;
};

export const getMAUValue = (data: AnalyticsData) => {
  const mauMetric = data.metrics.mau as { value: number } | undefined;
  return mauMetric?.value ?? 0;
};

export const getPageViewsValue = (data: AnalyticsData) => {
  const pageViewsMetric = data.metrics.page_views as
    | { total: number }
    | undefined;
  return pageViewsMetric?.total ?? 0;
};

export const getConversionRate = (data: AnalyticsData) => {
  const conversionMetric = data.metrics.conversion_rate as
    | { value: number }
    | undefined;
  return conversionMetric?.value ?? 0;
};
