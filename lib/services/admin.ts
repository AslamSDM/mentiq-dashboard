import { BaseHttpService } from "./base";

export interface AdminUser {
  id: string;
  email: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserEventData {
  userId: string;
  totalEvents: number;
  totalSessions: number;
  recentEvents: Array<{
    id: string;
    eventType: string;
    timestamp: string;
    properties?: Record<string, any>;
  }>;
  sessions: Array<{
    sessionId: string;
    count: number;
  }>;
  eventBreakdown: Array<{
    eventType: string;
    count: number;
  }>;
}

class AdminService extends BaseHttpService {
  /**
   * Get all users for a specific account
   */
  async getAccountUsers(accountId: string): Promise<AdminUser[]> {
    return this.request<AdminUser[]>(`/api/v1/admin/accounts/${accountId}/users`, {
      method: "GET",
    });
  }

  /**
   * Get detailed user data including events and sessions
   */
  async getUserData(userId: string): Promise<UserEventData> {
    return this.request<UserEventData>(`/api/v1/admin/users/${userId}/data`, {
      method: "GET",
    });
  }

  /**
   * Get all projects across all accounts (admin only)
   */
  async getAllProjects(): Promise<any[]> {
    return this.request<any[]>("/api/v1/admin/projects", {
      method: "GET",
    });
  }

  /**
   * Get all events across all projects (admin only)
   */
  async getAllEvents(limit?: number, offset?: number): Promise<any> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<any>(`/api/v1/admin/events${query}`, {
      method: "GET",
    });
  }

  /**
   * Toggle admin status for an account (admin only)
   */
  async toggleAdminStatus(accountId: string, isAdmin: boolean): Promise<any> {
    return this.request<any>(`/api/v1/admin/accounts/${accountId}/admin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_admin: isAdmin }),
    });
  }
}

export const adminService = new AdminService();
