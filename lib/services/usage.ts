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
}

export const usageService = new UsageService();
