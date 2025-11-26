import { BaseHttpService } from "./base";

export interface LocationData {
  country: string;
  city?: string;
  event_count: number;
  unique_users: number;
  percentage: number;
}

export interface EnhancedDeviceData {
  device: string;
  os?: string;
  browser?: string;
  count: number;
  percentage: number;
}

export interface CohortData {
  cohort: string;
  cohort_size: number;
  retention_data: Record<string, number>;
}

export interface FeatureData {
  feature_name: string;
  total_uses: number;
  unique_users: number;
  adoption_rate: number;
  first_seen: string;
  last_seen: string;
}

export interface ChurnData {
  user_id: string;
  email?: string;
  risk_score: string;
  health_score: string;
  category: string;
  last_active: string;
  days_inactive: number;
  sessions_total: number;
  avg_sessions_week: string;
  is_churned: boolean;
  trend: number;
}

export interface ChurnStats {
  total_users: number;
  at_risk_users: number;
  churned_users: number;
  churn_rate_30d: string;
  risk_breakdown: Record<string, number>;
}

export interface FunnelStep {
  step: number;
  event_type: string;
  users: number;
  conversion_rate: number;
  drop_off_rate: number;
}

export interface SessionData {
  date: string;
  total_sessions: number;
  unique_users: number;
  avg_session_duration: number;
  bounce_rate: number;
}

export interface DeviceMetric {
  device: string;
  sessions: number;
  users: number;
  page_views: number;
  bounce_rate: string;
  avg_session_time: string;
  conversion_rate: string;
}

export interface OSMetric {
  os: string;
  sessions: number;
  users: number;
  conversion_rate: string;
}

export interface BrowserMetric {
  browser: string;
  sessions: number;
  users: number;
}

class EnhancedAnalyticsService extends BaseHttpService {
  /**
   * Get location analytics
   */
  async getLocationAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: {
      locations: LocationData[];
      total_events: number;
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/location${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: {
      by_device: DeviceMetric[];
      by_os: OSMetric[];
      by_browser: BrowserMetric[];
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/devices${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Get retention cohorts
   */
  async getRetentionCohorts(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: {
      cohorts: CohortData[];
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/cohorts${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Get feature adoption analytics
   */
  async getFeatureAdoption(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: {
      features: FeatureData[];
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/features${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Get churn risk analytics
   */
  async getChurnRisk(
    projectId: string,
    threshold?: number
  ): Promise<{
    at_risk_users: ChurnData[];
    churn_stats: ChurnStats;
  }> {
    const params = new URLSearchParams();
    if (threshold) params.append("threshold", threshold.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/churn${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Get conversion funnel analytics
   */
  async getConversionFunnel(
    projectId: string,
    events?: string[]
  ): Promise<{
    data: {
      funnel: FunnelStep[];
      overall_conversion: number;
    };
  }> {
    const params = new URLSearchParams();
    if (events && events.length > 0) {
      events.forEach((event) => params.append("events", event));
    }

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/funnels${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: {
      sessions: SessionData[];
      summary: {
        total_sessions: number;
        avg_session_duration: number;
        avg_bounce_rate: number;
      };
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/sessions${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }
}

export const enhancedAnalyticsService = new EnhancedAnalyticsService();
