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

export interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  user_count?: number;
  source?: string;
  email_sent: boolean;
  promo_emails_opt_in: boolean;
  access_granted: boolean;
  access_granted_at?: string;
  access_granted_by?: string;
  created_at: string;
  updated_at: string;
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
      },
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
    endDate?: string,
  ): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<any>(
      `/api/v1/admin/projects/${projectId}/data${query}`,
      {
        method: "GET",
      },
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

  /**
   * Get all waitlist entries (admin only)
   */
  async getWaitlist(): Promise<{ entries: WaitlistEntry[]; total: number }> {
    return this.request<{ entries: WaitlistEntry[]; total: number }>(
      "/api/v1/admin/waitlist",
      {
        method: "GET",
      },
    );
  }

  /**
   * Grant access to a waitlist user (admin only)
   */
  async grantWaitlistAccess(
    id: string,
  ): Promise<{ message: string; entry: WaitlistEntry }> {
    return this.request<{ message: string; entry: WaitlistEntry }>(
      `/api/v1/admin/waitlist/${id}/grant-access`,
      {
        method: "POST",
      },
    );
  }

  /**
   * Delete a waitlist entry (admin only)
   */
  async deleteWaitlistEntry(
    id: string,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/api/v1/admin/waitlist/${id}`,
      {
        method: "DELETE",
      },
    );
  }

  /**
   * Get limits and usage for an account (admin only)
   */
  async getAccountLimits(accountId: string): Promise<AccountLimitsResponse> {
    return this.request<AccountLimitsResponse>(
      `/api/v1/admin/accounts/${accountId}/limits`,
      { method: "GET" },
    );
  }

  /**
   * Update limit overrides for an account (admin only)
   */
  async updateAccountLimits(
    accountId: string,
    overrides: LimitOverrides,
  ): Promise<AccountLimitsResponse> {
    return this.request<AccountLimitsResponse>(
      `/api/v1/admin/accounts/${accountId}/limits`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrides),
      },
    );
  }

  /**
   * Reset a specific limit override back to plan default (admin only)
   */
  async resetAccountLimit(
    accountId: string,
    resource: string,
  ): Promise<{ message: string; summary: UsageSummary }> {
    return this.request<{ message: string; summary: UsageSummary }>(
      `/api/v1/admin/accounts/${accountId}/limits/${resource}`,
      { method: "DELETE" },
    );
  }

  /**
   * Get usage counters for an account (admin only)
   */
  async getAccountUsage(accountId: string): Promise<AccountUsage> {
    return this.request<AccountUsage>(
      `/api/v1/admin/accounts/${accountId}/usage`,
      { method: "GET" },
    );
  }

  /**
   * Get all available tiers with limits and overage rates (admin only)
   */
  async getAllTiers(): Promise<{ tiers: TierInfo[] }> {
    return this.request<{ tiers: TierInfo[] }>("/api/v1/admin/tiers", {
      method: "GET",
    });
  }
}

// --- Types ---

export interface UsageStatus {
  resource: string;
  current_usage: number;
  limit: number;
  is_override: boolean;
  overage: number;
  overage_cost: number; // cents
}

export interface UsageSummary {
  account_id: string;
  tier: string;
  tier_name: string;
  base_price: number; // cents
  resources: UsageStatus[];
  total_overage_cost: number; // cents
  projected_bill: number; // cents
}

export interface LimitOverrides {
  paid_users_override?: number | null;
  session_replays_override?: number | null;
  automated_emails_override?: number | null;
  ai_generations_override?: number | null;
}

export interface AccountLimitsResponse {
  summary: UsageSummary;
  overrides: {
    id: string;
    account_id: string;
    paid_users_override: number | null;
    session_replays_override: number | null;
    automated_emails_override: number | null;
    ai_generations_override: number | null;
  };
  message?: string;
}

export interface AccountUsage {
  id: string;
  account_id: string;
  billing_period_start: string;
  billing_period_end: string;
  paid_users_count: number;
  session_replays_count: number;
  automated_emails_count: number;
  ai_generations_count: number;
}

export interface TierInfo {
  id: string;
  name: string;
  base_price: number;
  included_paid_users: number;
  included_session_replays: number;
  included_automated_emails: number;
  included_ai_generations: number;
  included_team_members: number;
  overage_paid_users_per_100: number;
  overage_replays_per_500: number;
  overage_emails_per_10k: number;
  overage_ai_generations_per_100: number;
}

export const adminService = new AdminService();
