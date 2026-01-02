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
  // NOTE: Stripe endpoints return 400 when Stripe API key is not configured.
  // These methods gracefully return empty/default data to prevent dashboard errors.

  private getDefaultMetrics(): StripeMetrics {
    return {
      mrr: 0,
      arr: 0,
      active_subscriptions: 0,
      new_subscriptions: 0,
      canceled_subscriptions: 0,
      churned_subscriptions: 0,
      churn_rate: 0,
      growth_rate: 0,
      total_revenue: 0,
      net_revenue: 0,
      expansion_revenue: 0,
      contraction_revenue: 0,
      arpu: 0,
      customer_lifetime_value: 0,
      trial_to_pay_conversion_rate: 0,
      date: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      time_series: [],
    };
  }

  private getDefaultAnalytics(startDate?: string, endDate?: string): StripeAnalytics {
    return {
      date_range: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString(),
      },
      summary: {
        current_mrr: 0,
        current_arr: 0,
        active_subscriptions: 0,
        churn_rate: 0,
        trial_conversion_rate: 0,
        arpu: 0,
      },
      time_series: [],
      subscription_plans: [],
    };
  }

  private getDefaultCustomerAnalytics(): StripeCustomerAnalytics {
    return {
      summary: {
        total_customers: 0,
        paid_customers: 0,
        free_customers: 0,
        total_mrr: 0,
        conversion_rate: 0,
      },
      customer_segments: [],
    };
  }

  /**
   * Sync Stripe data for a project
   */
  async syncStripeData(projectId: string): Promise<{
    message: string;
    results: Record<string, any>;
  }> {
    try {
      return await this.request(`/api/v1/projects/${projectId}/stripe/sync`, {
        method: "POST",
        projectId,
      });
    } catch {
      // Stripe not configured - return empty result
      return { message: "Stripe not configured", results: {} };
    }
  }

  /**
   * Get revenue metrics for a project
   */
  async getRevenueMetrics(projectId: string): Promise<{
    data: StripeMetrics;
  }> {
    try {
      return await this.request(`/api/v1/projects/${projectId}/stripe/metrics`, {
        method: "GET",
        projectId,
      });
    } catch {
      // Stripe not configured - return default metrics
      return { data: this.getDefaultMetrics() };
    }
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
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const queryString = params.toString();
      const endpoint = `/api/v1/projects/${projectId}/stripe/analytics${
        queryString ? `?${queryString}` : ""
      }`;

      return await this.request(endpoint, {
        method: "GET",
        projectId,
      });
    } catch {
      // Stripe not configured - return default analytics
      return { data: this.getDefaultAnalytics(startDate, endDate) };
    }
  }

  /**
   * Get customer analytics for a project
   */
  async getCustomerAnalytics(projectId: string): Promise<{
    data: StripeCustomerAnalytics;
  }> {
    try {
      return await this.request(`/api/v1/projects/${projectId}/stripe/customers`, {
        method: "GET",
        projectId,
      });
    } catch {
      // Stripe not configured - return default customer analytics
      return { data: this.getDefaultCustomerAnalytics() };
    }
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
