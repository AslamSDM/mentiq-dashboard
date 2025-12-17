import { BaseHttpService } from "./base";

export interface StripeMetrics {
  mrr: number;
  arr: number;
  active_subscriptions: number;
  new_subscriptions: number;
  canceled_subscriptions: number;
  churned_subscriptions: number;
  churn_rate: number;
  growth_rate: number;
  total_revenue: number;
  net_revenue: number;
  expansion_revenue: number;
  contraction_revenue: number;
  arpu: number;
  customer_lifetime_value: number;
  trial_to_pay_conversion_rate: number;
  date: string;
  last_updated: string;
  time_series?: Array<{
    date: string;
    revenue: number;
  }>;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface StripeAnalytics {
  date_range: {
    start: string;
    end: string;
  };
  summary: {
    current_mrr: number;
    current_arr: number;
    active_subscriptions: number;
    churn_rate: number;
    trial_conversion_rate: number;
    arpu: number;
  };
  time_series: Array<{
    date: string;
    mrr: number;
    arr: number;
    active_subscriptions: number;
    churn_rate: number;
    arpu: number;
  }>;
  subscription_plans: Array<{
    plan_name: string;
    count: number;
    mrr: number;
    percentage: number;
  }>;
}

export interface StripeCustomer {
  customer_id: string;
  email: string;
  name: string;
  mrr: number;
  status: string;
  created: string;
}

export interface StripeCustomerAnalytics {
  summary: {
    total_customers: number;
    paid_customers: number;
    free_customers: number;
    total_mrr: number;
    conversion_rate: number;
  };
  customer_segments: StripeCustomer[];
}

class StripeService extends BaseHttpService {
  /**
   * Sync Stripe data for a project
   */
  async syncStripeData(projectId: string): Promise<{
    message: string;
    results: Record<string, any>;
  }> {
    return this.request(`/api/v1/projects/${projectId}/stripe/sync`, {
      method: "POST",
      projectId,
    });
  }

  /**
   * Get revenue metrics for a project
   */
  async getRevenueMetrics(projectId: string): Promise<{
    data: StripeMetrics;
  }> {
    return this.request(`/api/v1/projects/${projectId}/stripe/metrics`, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Get revenue analytics for a project
   */
  async getRevenueAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: StripeAnalytics;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${projectId}/stripe/analytics${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Get customer analytics for a project
   */
  async getCustomerAnalytics(projectId: string): Promise<{
    data: StripeCustomerAnalytics;
  }> {
    return this.request(`/api/v1/projects/${projectId}/stripe/customers`, {
      method: "GET",
      projectId,
    });
  }

  /**
   * Update Stripe API key for a project
   */
  async updateStripeKey(
    projectId: string,
    apiKey: string
  ): Promise<{
    message: string;
  }> {
    return this.request(`/api/v1/projects/${projectId}/stripe-key`, {
      method: "PUT",
      body: JSON.stringify({ api_key: apiKey }),
      projectId,
    });
  }
}

export const stripeService = new StripeService();
