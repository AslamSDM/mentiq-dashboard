import { BaseHttpService } from "./base";

// A/B Testing Types
export interface Experiment {
  id: string;
  name: string;
  description?: string;
  key: string;
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  start_date?: string;
  end_date?: string;
  traffic_split: number;
  variants: Variant[];
  project_id: string;
  created_at: string;
  updated_at: string;

  // Frontend compatibility aliases
  trafficAllocation?: number;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
  goals?: Goal[];
}

export interface CreateExperimentRequest {
  name: string;
  description: string;
  trafficAllocation: number;
  variants: CreateVariantRequest[];
  goals: CreateGoalRequest[];
}

export interface CreateVariantRequest {
  name: string;
  description: string;
  trafficWeight: number;
  isControl: boolean;
  changes: VariantChange[];
}

export interface CreateGoalRequest {
  name: string;
  type: "pageview" | "click" | "custom_event";
  target: string;
  isPrimary: boolean;
}

export interface Variant {
  id: string;
  name: string;
  key: string;
  description?: string;
  is_control: boolean;
  traffic_split: number;
  created_at: string;
  updated_at: string;

  // Frontend compatibility aliases
  trafficWeight?: number;
  isControl?: boolean;
  changes?: VariantChange[];
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

export interface TimelineData {
  date: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
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

export class ExperimentService extends BaseHttpService {
  // A/B Testing experiment management
  async getExperiments(projectId: string): Promise<Experiment[]> {
    return this.request(`/api/v1/projects/${projectId}/experiments`);
  }

  async createExperiment(
    projectId: string,
    experiment: CreateExperimentRequest
  ): Promise<Experiment> {
    return this.request(`/api/v1/projects/${projectId}/experiments`, {
      method: "POST",
      body: JSON.stringify(experiment),
    });
  }

  async getExperiment(
    projectId: string,
    experimentId: string
  ): Promise<Experiment> {
    return this.request(
      `/api/v1/projects/${projectId}/experiments/${experimentId}`
    );
  }

  async updateExperiment(
    projectId: string,
    experimentId: string,
    updates: Partial<Experiment>
  ): Promise<Experiment> {
    return this.request(
      `/api/v1/projects/${projectId}/experiments/${experimentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    );
  }

  async deleteExperiment(
    projectId: string,
    experimentId: string
  ): Promise<void> {
    return this.request(
      `/api/v1/projects/${projectId}/experiments/${experimentId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getExperimentResults(
    projectId: string,
    experimentId: string
  ): Promise<ExperimentResults> {
    return this.request(
      `/api/v1/projects/${projectId}/experiments/${experimentId}/results`
    );
  }

  // A/B Testing Assignment & Tracking (Backend compatible endpoints)
  async getExperimentAssignment(
    experimentKey: string,
    userId: string,
    projectId?: string
  ): Promise<VariantAssignment> {
    const searchParams = new URLSearchParams();
    searchParams.set("experimentKey", experimentKey);
    searchParams.set("userId", userId);
    if (projectId) searchParams.set("projectId", projectId);

    return this.request(
      `/api/v1/experiments/${experimentKey}/assignment?${searchParams.toString()}`,
      {
        method: "POST",
      }
    );
  }

  async trackConversion(data: {
    experimentId: string;
    userId: string;
    eventName: string;
  }): Promise<TrackingResponse> {
    return this.request("/api/v1/experiments/track", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExperimentStatus(
    experimentId: string,
    status: string
  ): Promise<void> {
    return this.request(`/api/v1/experiments/${experimentId}/status`, {
      method: "PUT",
      body: `status=${status}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  async startExperiment(
    projectId: string,
    experimentId: string
  ): Promise<Experiment> {
    return this.updateExperiment(projectId, experimentId, {
      status: "RUNNING",
    });
  }

  async pauseExperiment(
    projectId: string,
    experimentId: string
  ): Promise<Experiment> {
    return this.updateExperiment(projectId, experimentId, { status: "PAUSED" });
  }

  async completeExperiment(
    projectId: string,
    experimentId: string
  ): Promise<Experiment> {
    return this.updateExperiment(projectId, experimentId, {
      status: "COMPLETED",
    });
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
  ): Promise<HeatmapData> {
    const searchParams = new URLSearchParams();
    if (params?.url) searchParams.set("url", params.url);
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.type) searchParams.set("type", params.type);

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/heatmaps${query ? `?${query}` : ""}`
    );
  }

  async getHeatmapPages(projectId: string): Promise<HeatmapPage[]> {
    return this.request(`/api/v1/projects/${projectId}/heatmaps/pages`);
  }

  async recordHeatmapData(
    projectId: string,
    data: {
      url: string;
      sessionId: string;
      events: Array<{
        type: "click" | "scroll" | "mousemove";
        x?: number;
        y?: number;
        scrollDepth?: number;
        timestamp: number;
        element?: string;
      }>;
    }
  ): Promise<void> {
    return this.request(`/api/v1/projects/${projectId}/heatmaps/record`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async generateHeatmapScreenshot(
    projectId: string,
    params: {
      url: string;
      type: "click" | "scroll" | "move";
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ screenshotUrl: string; reportUrl: string }> {
    return this.request(`/api/v1/projects/${projectId}/heatmaps/screenshot`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}

// Export a singleton instance
export const experimentService = new ExperimentService();
