import { BaseHttpService } from "./base";

export interface AdminUser {
  id: string;
  email: string;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
}

export interface UserEventData {
  user_id: string;
  total_events: number;
  total_sessions: number;
  recent_events: Array<{
    id: number;
    event_id: string;
    event_type: string;
    timestamp: string;
    properties?: Record<string, any>;
    session_id?: string;
    user_id?: string;
  }>;
  sessions: Array<{
    session_id: string;
    count: number;
  }>;
  event_breakdown: Array<{
    event_type: string;
    count: number;
  }>;
}

class AdminService extends BaseHttpService {
  /**
   * Get all accounts (admin only)
   */
  async getAllAccounts(): Promise<AdminAccount[]> {
    return this.request<AdminAccount[]>("/api/v1/admin/accounts", {
      method: "GET",
    });
  }

  /**
   * Get all users for a specific account
   */
  async getAccountUsers(accountId: string): Promise<AdminUser[]> {
    return this.request<AdminUser[]>(
      `/api/v1/admin/accounts/${accountId}/users`,
      {
        method: "GET",
      }
    );
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

  /**
   * Get all projects for a specific user (admin only)
   */
  async getUserProjects(userId: string): Promise<any[]> {
    return this.request<any[]>(`/api/v1/admin/users/${userId}/projects`, {
      method: "GET",
    });
  }

  /**
   * Get detailed analytics data for a specific project (admin only)
   */
  async getProjectData(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<any>(
      `/api/v1/admin/projects/${projectId}/data${query}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Get all users with their projects efficiently in a single call (admin only)
   */
  async getAllUsersWithProjects(): Promise<any[]> {
    return this.request<any[]>("/api/v1/admin/users-with-projects", {
      method: "GET",
    });
  }

  /**
   * Create a test user that bypasses email verification and paywall (admin only)
   */
  async createTestUser(data: {
    name: string;
    email: string;
    password: string;
    skip_email_verification?: boolean;
    skip_paywall?: boolean;
    create_project?: boolean;
    project_name?: string;
  }): Promise<any> {
    return this.request<any>("/api/v1/admin/test-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
}

export const adminService = new AdminService();
