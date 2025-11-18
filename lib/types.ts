// Re-export all types from service modules for easy importing
export type { AuthUser, AuthResponse } from "./services/auth";
export type {
  Project,
  ApiKey,
  Webhook,
  WebhookTestResult,
  StorageMetrics,
} from "./services/project";
export type {
  StripeMetrics,
  StripeAnalytics,
  StripeCustomer,
  StripeCustomerAnalytics,
} from "./services/stripe";
export type {
  LocationData,
  EnhancedDeviceData,
  CohortData,
  FeatureData,
  ChurnData,
  FunnelStep,
  SessionData,
} from "./services/enhanced-analytics";
export type {
  AnalyticsData,
  AnalyticsMetricResult,
  DashboardData,
  RealtimeData,
  UserMetrics,
  EventData,
  EventSummary,
  Session,
  SessionsOverview,
  DAUMetrics,
  WAUMetrics,
  MAUMetrics,
  PageViewsData,
  SessionAnalyticsData,
  ErrorAnalyticsData,
  RevenueMetrics,
  ChartData,
  RetentionData,
  SegmentData,
  JourneyData,
  PageData,
  CountryData,
} from "./services/analytics";
export type {
  Experiment,
  CreateExperimentRequest,
  Variant,
  VariantChange,
  Goal,
  ExperimentResults,
  VariantResults,
  GoalResults,
  TimelineData,
  VariantAssignment,
  TrackingResponse,
  HeatmapData,
  HeatmapPage,
  ClickData,
  ScrollData,
  MouseMoveData,
  ViewportData,
} from "./services/experiment";
export type {
  User,
  UserProfile,
  UserListResponse,
  UserSegment,
  UserJourney,
} from "./services/user";

// Legacy types for backward compatibility
import type { EventData, PageData, CountryData } from "./services/analytics";

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

export interface UserFlowData {
  from: string;
  to: string;
  count: number;
  dropOffRate: number;
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
