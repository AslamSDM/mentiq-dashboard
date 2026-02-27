import { BaseHttpService } from "./base";

export interface Project {
  id: string;
  name: string;
  description?: string;
  apiKey?: string;
  stripeApiKey?: string;
  hasStripeKey?: boolean;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  eventCount?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  failureCount: number;
}

export interface WebhookTestResult {
  success: boolean;
  responseCode?: number;
  responseTime: number;
  error?: string;
  timestamp: string;
}

export interface StorageMetrics {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  eventCount: number;
  oldestEvent: string;
  newestEvent: string;
  compressionRatio: number;
  costEstimate: {
    monthly: number;
    currency: string;
  };
}

export class ProjectService extends BaseHttpService {
  // Project CRUD operations
  async getProjects(): Promise<Project[]> {
    return this.request("/api/v1/projects");
  }

  async createProject(name: string): Promise<Project> {
    return this.request("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getProject(projectId: string): Promise<Project> {
    return this.request(`/api/v1/projects/${projectId}`);
  }

  async updateProject(
    projectId: string,
    data: { name?: string; domain?: string; settings?: any }
  ): Promise<Project> {
    return this.request(`/api/v1/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.request(`/api/v1/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  // API Key management
  async createApiKeys(
    projectId: string,
    name: string,
    permissions: string[] = []
  ): Promise<ApiKey> {
    return this.request(`/api/v1/projects/${projectId}/apikeys`, {
      method: "POST",
      body: JSON.stringify({ name, permissions }),
    });
  }

  async getApiKeys(projectId: string): Promise<ApiKey[]> {
    return this.request(`/api/v1/projects/${projectId}/apikeys`);
  }

  async deleteApiKey(projectId: string, keyId: string): Promise<void> {
    return this.request(`/api/v1/projects/${projectId}/apikeys/${keyId}`, {
      method: "DELETE",
    });
  }

  async updateApiKey(
    projectId: string,
    keyId: string,
    data: { name?: string; permissions?: string[]; isActive?: boolean }
  ): Promise<ApiKey> {
    return this.request(`/api/v1/projects/${projectId}/apikeys/${keyId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Webhook management
  async createWebhook(
    projectId: string,
    webhook: { url: string; events: string[]; secret?: string }
  ): Promise<Webhook> {
    return this.request(`/api/v1/projects/${projectId}/webhooks`, {
      method: "POST",
      body: JSON.stringify(webhook),
    });
  }

  async getWebhooks(projectId: string): Promise<Webhook[]> {
    return this.request(`/api/v1/projects/${projectId}/webhooks`);
  }

  async updateWebhook(
    projectId: string,
    webhookId: string,
    updates: Partial<Webhook>
  ): Promise<Webhook> {
    return this.request(`/api/v1/projects/${projectId}/webhooks/${webhookId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteWebhook(projectId: string, webhookId: string): Promise<void> {
    return this.request(`/api/v1/projects/${projectId}/webhooks/${webhookId}`, {
      method: "DELETE",
    });
  }

  async testWebhook(
    projectId: string,
    webhookId: string
  ): Promise<WebhookTestResult> {
    return this.request(
      `/api/v1/projects/${projectId}/webhooks/${webhookId}/test`,
      {
        method: "POST",
      }
    );
  }

  // Storage and system info
  async getStorageMetrics(projectId: string): Promise<StorageMetrics> {
    return this.request(`/api/v1/projects/${projectId}/storage/metrics`);
  }

  // Data export
  async exportAnalyticsData(
    projectId: string,
    params: {
      startDate: string;
      endDate: string;
      format?: "json" | "csv";
      dataTypes?: string[];
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set("startDate", params.startDate);
    searchParams.set("endDate", params.endDate);
    if (params.format) searchParams.set("format", params.format);
    if (params.dataTypes)
      searchParams.set("dataTypes", params.dataTypes.join(","));

    return this.request(
      `/api/v1/projects/${projectId}/export?${searchParams.toString()}`
    );
  }

  // Stripe Revenue Analytics methods

  /**
   * Updates the Stripe restricted API key for a project
   * @param projectId - The project ID
   * @param apiKey - Stripe restricted API key (must start with rk_live_ or rk_test_)
   * @security Only use restricted keys with read-only permissions for Customers, Subscriptions, Invoices, and Charges
   */
  async updateStripeApiKey(projectId: string, apiKey: string) {
    return this.request(`/api/v1/projects/${projectId}/stripe-key`, {
      method: "PUT",
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  async syncStripeData(projectId: string) {
    return this.request(`/api/v1/projects/${projectId}/stripe/sync`, {
      method: "POST",
    });
  }

  async getRevenueMetrics(
    projectId: string,
    date?: string
  ): Promise<{ status: string; data: RevenueMetrics }> {
    const params = date ? `?date=${date}` : "";
    return this.request(
      `/api/v1/projects/${projectId}/stripe/metrics${params}`
    );
  }

  async getRevenueAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ status: string; data: RevenueAnalytics }> {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.set("start_date", startDate);
    if (endDate) searchParams.set("end_date", endDate);

    const query = searchParams.toString();
    return this.request(
      `/api/v1/projects/${projectId}/stripe/analytics${
        query ? `?${query}` : ""
      }`
    );
  }

  async getCustomerAnalytics(
    projectId: string
  ): Promise<{ status: string; data: CustomerAnalytics }> {
    return this.request(`/api/v1/projects/${projectId}/stripe/customers`);
  }
}

// Stripe Revenue interfaces
export interface RevenueMetrics {
  date: string;
  mrr: number;
  arr: number;
  total_revenue: number;
  active_subscriptions: number;
  canceled_subscriptions: number;
  new_subscriptions: number;
  churned_subscriptions: number;
  expansion_revenue: number;
  contraction_revenue: number;
  net_revenue: number;
  churn_rate: number;
  growth_rate: number;
  arpu: number;
  customer_lifetime_value: number;
  trial_to_pay_conversion_rate: number;
  total_customers: number;
  active_customers: number;
  last_updated: string;
  time_series?: Array<{
    date: string;
    mrr: number;
    arr: number;
    revenue: number;
    active_subscriptions: number;
    churn_rate: number;
    arpu: number;
    new_customers: number;
    total_customers: number;
  }>;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface RevenueAnalytics {
  summary: {
    current_mrr: number;
    current_arr: number;
    active_subscriptions: number;
    churn_rate: number;
    arpu: number;
    trial_conversion_rate: number;
  };
  time_series: Array<{
    date: string;
    mrr: number;
    arr: number;
    active_subscriptions: number;
    churn_rate: number;
    arpu: number;
  }>;
  date_range: {
    start: string;
    end: string;
  };
}

export interface CustomerAnalytics {
  summary: {
    total_customers: number;
    paid_customers: number;
    free_customers: number;
    total_mrr: number;
    avg_mrr: number;
    conversion_rate: number;
  };
  customers: Array<{
    id: string;
    email: string;
    name: string;
    mrr: number;
    status: "active" | "free";
    created: string;
    subscriptions: number;
  }>;
}

// Export a singleton instance
export const projectService = new ProjectService();
