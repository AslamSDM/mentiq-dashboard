import { BaseHttpService } from "./base";

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

export interface UserListResponse {
  users: UserProfile[];
  totalCount: number;
  page: number;
  limit: number;
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

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    events?: string[];
    properties?: Record<string, any>;
    timeframe?: string;
    behaviorPatterns?: string[];
  };
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserJourney {
  userId: string;
  steps: Array<{
    event: string;
    timestamp: string;
    properties: Record<string, any>;
    page?: string;
  }>;
  totalDuration: number;
  completionRate: number;
  dropOffPoints: Array<{
    step: number;
    dropOffRate: number;
  }>;
}

export class UserService extends BaseHttpService {
  // User management endpoints
  async getUsers(
    projectId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/users${query ? `?${query}` : ""}`
    );
  }

  async getUser(projectId: string, userId: string): Promise<UserProfile> {
    return this.request(`/api/v1/projects/${projectId}/users/${userId}`);
  }

  async getUserSessions(
    projectId: string,
    userId: string
  ): Promise<SessionAnalyticsData[]> {
    return this.request(
      `/api/v1/projects/${projectId}/users/${userId}/sessions`
    );
  }

  async updateUserProperties(
    projectId: string,
    userId: string,
    properties: Record<string, any>
  ): Promise<UserProfile> {
    return this.request(
      `/api/v1/projects/${projectId}/users/${userId}/properties`,
      {
        method: "PUT",
        body: JSON.stringify({ properties }),
      }
    );
  }

  async deleteUser(projectId: string, userId: string): Promise<void> {
    return this.request(`/api/v1/projects/${projectId}/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getUserEvents(
    projectId: string,
    userId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      eventType?: string;
      limit?: number;
    }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.eventType) searchParams.set("eventType", params.eventType);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/users/${userId}/events${
        query ? `?${query}` : ""
      }`
    );
  }

  async getUserJourney(
    projectId: string,
    userId: string
  ): Promise<UserJourney> {
    return this.request(
      `/api/v1/projects/${projectId}/users/${userId}/journey`
    );
  }

  // User segmentation
  async getUserSegments(projectId: string): Promise<UserSegment[]> {
    return this.request(`/api/v1/projects/${projectId}/segments`);
  }

  async createUserSegment(
    projectId: string,
    segment: Omit<UserSegment, "id" | "userCount" | "createdAt" | "updatedAt">
  ): Promise<UserSegment> {
    return this.request(`/api/v1/projects/${projectId}/segments`, {
      method: "POST",
      body: JSON.stringify(segment),
    });
  }

  async updateUserSegment(
    projectId: string,
    segmentId: string,
    updates: Partial<UserSegment>
  ): Promise<UserSegment> {
    return this.request(`/api/v1/projects/${projectId}/segments/${segmentId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteUserSegment(projectId: string, segmentId: string): Promise<void> {
    return this.request(`/api/v1/projects/${projectId}/segments/${segmentId}`, {
      method: "DELETE",
    });
  }

  async getUsersInSegment(
    projectId: string,
    segmentId: string,
    params?: { page?: number; limit?: number }
  ): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/segments/${segmentId}/users${
        query ? `?${query}` : ""
      }`
    );
  }

  // User activity and behavior
  async getUserActivitySummary(
    projectId: string,
    userId: string,
    timeframe?: string
  ) {
    const params = timeframe ? `?timeframe=${timeframe}` : "";
    return this.request(
      `/api/v1/projects/${projectId}/users/${userId}/activity${params}`
    );
  }

  async getUserRetentionData(projectId: string, userId: string) {
    return this.request(
      `/api/v1/projects/${projectId}/users/${userId}/retention`
    );
  }

  async getUserConversionHistory(projectId: string, userId: string) {
    return this.request(
      `/api/v1/projects/${projectId}/users/${userId}/conversions`
    );
  }

  // Bulk operations
  async bulkUpdateUsers(
    projectId: string,
    updates: Array<{
      userId: string;
      properties?: Record<string, any>;
      tags?: string[];
    }>
  ): Promise<{ success: number; failed: number; errors?: string[] }> {
    return this.request(`/api/v1/projects/${projectId}/users/bulk-update`, {
      method: "POST",
      body: JSON.stringify({ updates }),
    });
  }

  async exportUsers(
    projectId: string,
    params?: {
      segmentId?: string;
      format?: "json" | "csv";
      fields?: string[];
    }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.segmentId) searchParams.set("segmentId", params.segmentId);
    if (params?.format) searchParams.set("format", params.format);
    if (params?.fields) searchParams.set("fields", params.fields.join(","));

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/users/export${query ? `?${query}` : ""}`
    );
  }

  // User search and filtering
  async searchUsers(
    projectId: string,
    query: string,
    params?: {
      filters?: Record<string, any>;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      page?: number;
      limit?: number;
    }
  ): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("q", query);

    if (params?.filters) {
      searchParams.set("filters", JSON.stringify(params.filters));
    }
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return this.request(
      `/api/v1/projects/${projectId}/users/search?${searchParams.toString()}`
    );
  }
}

// Export a singleton instance
export const userService = new UserService();
