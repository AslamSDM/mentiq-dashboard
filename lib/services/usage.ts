import { BaseHttpService } from "./base";

export interface UsageStatus {
  resource: string;
  current_usage: number;
  limit: number;
  is_override: boolean;
  overage: number;
  overage_cost: number; // cents
  percentage: number;
}

export interface ThresholdAlert {
  resource: string;
  threshold: number; // 80 or 100
  current_usage: number;
  limit: number;
  percentage: number;
}

export interface UsageSummary {
  account_id: string;
  tier: string;
  tier_name: string;
  base_price: number; // cents
  billing_period_start: string;
  billing_period_end: string;
  resources: UsageStatus[];
  total_overage_cost: number; // cents
  projected_bill: number; // cents
  alerts?: ThresholdAlert[];
}

export interface UpgradeSuggestion {
  tier: string;
  name: string;
  base_price: number; // cents
  message: string;
}

export interface UsageResponse {
  summary: UsageSummary;
  upgrade_suggestion?: UpgradeSuggestion | null;
}

export interface UsageHistoryEntry {
  id: string;
  account_id: string;
  billing_period_start: string;
  billing_period_end: string;
  tier: string;
  paid_users_count: number;
  session_replays_count: number;
  automated_emails_count: number;
  ai_generations_count: number;
  team_members_count: number;
  total_overage_cost: number;
  projected_bill: number;
  created_at: string;
}

// Subscription types

export interface SubscriptionInfo {
  id: string;
  tier: string;
  tier_name: string;
  status: string;
  monthly_price: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  is_lifetime: boolean;
  usage_paused: boolean;
  usage_paused_reason?: string | null;
}

export interface SubscriptionResponse {
  subscription: SubscriptionInfo | null;
  has_payment_method: boolean;
}

export interface ProjectSettingsResponse {
  settings: {
    id: string;
    project_id: string;
    max_email_characters: number;
  };
}

class UsageService extends BaseHttpService {
  async getUsageSummary(): Promise<UsageResponse> {
    return this.request<UsageResponse>("/api/v1/usage", {
      method: "GET",
    });
  }

  async getUsageHistory(): Promise<{ history: UsageHistoryEntry[] }> {
    return this.request<{ history: UsageHistoryEntry[] }>(
      "/api/v1/usage/history",
      { method: "GET" }
    );
  }

  async getSubscription(): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>("/api/v1/subscription", {
      method: "GET",
    });
  }

  async redeemLifetimeKey(key: string): Promise<{ message: string; tier: string }> {
    return this.request("/api/v1/lifetime/redeem", {
      method: "POST",
      body: JSON.stringify({ key }),
    });
  }

  async requestCancel(reason: string): Promise<{ message: string }> {
    return this.request("/api/v1/subscription/cancel", {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async unpauseUsage(): Promise<{ message: string }> {
    return this.request("/api/v1/subscription/unpause", {
      method: "POST",
    });
  }

  async getProjectSettings(projectId: string): Promise<ProjectSettingsResponse> {
    return this.request<ProjectSettingsResponse>(
      `/api/v1/projects/${projectId}/settings`,
      { method: "GET" }
    );
  }

  async updateProjectSettings(
    projectId: string,
    settings: { max_email_characters?: number }
  ): Promise<ProjectSettingsResponse> {
    return this.request<ProjectSettingsResponse>(
      `/api/v1/projects/${projectId}/settings`,
      {
        method: "PUT",
        body: JSON.stringify(settings),
      }
    );
  }
}

export const usageService = new UsageService();
