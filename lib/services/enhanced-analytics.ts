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
  category: string; // "Critical" | "High" | "Medium" | "Low"
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

export interface AtRiskUser {
  user_id: string;
  email?: string;
  last_activity: string;
  days_since: number;
  risk_score: number;
}

export interface ChannelChurnData {
  channel: string;
  total_users: number;
  active_users: number;
  churned_users: number;
  churn_rate: number;
  at_risk_users: AtRiskUser[];
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
    cohorts: CohortData[];
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
    status: string;
    data: {
      at_risk_users: ChurnData[];
      total_at_risk: number;
      churn_rate: string;
    };
  }> {
    const params = new URLSearchParams();
    if (threshold) params.append("risk_threshold", threshold.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/churn${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await this.request(endpoint, {
      method: "GET",
      projectId,
    });

    return response as any;
  }

  /**
   * Export at-risk users as CSV for email campaigns
   */
  async exportChurnRiskCSV(
    projectId: string,
    riskLevel: "all" | "high" | "medium" | "critical" = "all",
    threshold?: number
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append("risk_level", riskLevel);
    params.append("format", "csv");
    if (threshold) params.append("risk_threshold", threshold.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/churn/export?${queryString}`;

    // Use fetch directly for blob response
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${endpoint}`,
      {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Export at-risk users as JSON for programmatic use
   */
  async exportChurnRiskJSON(
    projectId: string,
    riskLevel: "all" | "high" | "medium" | "critical" = "all",
    threshold?: number
  ): Promise<{
    status: string;
    total_users: number;
    risk_level: string;
    users: Array<{
      user_id: string;
      email?: string;
      risk_score: string;
      risk_category: string;
      last_active: string;
      days_inactive: number;
    }>;
  }> {
    const params = new URLSearchParams();
    params.append("risk_level", riskLevel);
    params.append("format", "json");
    if (threshold) params.append("risk_threshold", threshold.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/analytics/churn/export?${queryString}`;

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
    session_data: {
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
      meta: {
        date_range: string;
        data_points: number;
        total_events: number;
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

  /**
   * Get churn analysis by channel
   */
  async getChurnByChannel(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: {
      channels: ChannelChurnData[];
      start_date: string;
      end_date: string;
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const endpoint = `/api/v1/analytics/churn-by-channel${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }
}

export const enhancedAnalyticsService = new EnhancedAnalyticsService();
