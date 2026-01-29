// Automation Types and API Service

export interface AutomationSettings {
  id: string;
  project_id: string;
  name: string;
  description: string;
  type: "churn_prevention" | "feature_adoption" | "engagement";
  is_enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  project_id: string;
  name: string;
  type: "churn_prevention" | "feature_adoption" | "engagement" | "discount";
  subject_template: string;
  content_template: string;
  personalization_vars: string[];
  is_active: boolean;
  last_generated_at?: string;
  generation_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface DiscountCode {
  id: string;
  project_id: string;
  code: string;
  discount_percent: number;
  valid_until?: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  automation_id?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationExecution {
  id: string;
  automation_id: string;
  project_id: string;
  user_id: string;
  email_template_id: string;
  campaign_id?: string;
  status: "pending" | "sent" | "failed" | "skipped";
  trigger_reason: string;
  personalization: Record<string, any>;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
}

export interface CreateAutomationRequest {
  name: string;
  description?: string;
  type: "churn_prevention" | "feature_adoption" | "engagement";
  config: Record<string, any>;
  is_enabled?: boolean;
}

export interface CreateEmailTemplateRequest {
  name: string;
  type: "churn_prevention" | "feature_adoption" | "engagement" | "discount";
  subject_template: string;
  content_template: string;
  personalization_vars?: string[];
  is_active?: boolean;
}

export interface CreateDiscountCodeRequest {
  code: string;
  discount_percent: number;
  valid_until?: string;
  max_uses: number;
  is_active?: boolean;
}

export interface GenerateEmailContentRequest {
  template_type: "churn_prevention" | "feature_adoption" | "engagement" | "discount";
  user_context: Record<string, any>;
  product_context: Record<string, any>;
  personalization: Record<string, any>;
}

export interface GeneratedEmailContent {
  subject: string;
  html_content: string;
  plain_text: string;
  personalization: Record<string, any>;
  generated_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class AutomationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // Automation Settings API
  async createAutomation(projectId: string, data: CreateAutomationRequest): Promise<AutomationSettings> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/automations`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create automation");
    }

    return response.json();
  }

  async getAutomations(projectId: string): Promise<AutomationSettings[]> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/automations`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch automations");
    }

    const data = await response.json();
    return data.automations;
  }

  async updateAutomation(projectId: string, automationId: string, data: Partial<CreateAutomationRequest>): Promise<AutomationSettings> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/automations/${automationId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update automation");
    }

    return response.json();
  }

  async deleteAutomation(projectId: string, automationId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/automations/${automationId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete automation");
    }
  }

  // Email Templates API
  async createEmailTemplate(projectId: string, data: CreateEmailTemplateRequest): Promise<EmailTemplate> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/email-templates`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create email template");
    }

    return response.json();
  }

  async getEmailTemplates(projectId: string, type?: string): Promise<EmailTemplate[]> {
    const url = type 
      ? `${API_BASE}/api/v1/projects/${projectId}/email-templates?type=${type}`
      : `${API_BASE}/api/v1/projects/${projectId}/email-templates`;

    const response = await fetch(url, { headers: this.getAuthHeaders() });

    if (!response.ok) {
      throw new Error("Failed to fetch email templates");
    }

    const data = await response.json();
    return data.templates;
  }

  async updateEmailTemplate(projectId: string, templateId: string, data: Partial<CreateEmailTemplateRequest>): Promise<EmailTemplate> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/email-templates/${templateId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update email template");
    }

    return response.json();
  }

  async deleteEmailTemplate(projectId: string, templateId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/email-templates/${templateId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete email template");
    }
  }

  // Discount Codes API
  async createDiscountCode(projectId: string, data: CreateDiscountCodeRequest): Promise<DiscountCode> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/discount-codes`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create discount code");
    }

    return response.json();
  }

  async getDiscountCodes(projectId: string, automationId?: string): Promise<DiscountCode[]> {
    const url = automationId
      ? `${API_BASE}/api/v1/projects/${projectId}/discount-codes?automation_id=${automationId}`
      : `${API_BASE}/api/v1/projects/${projectId}/discount-codes`;

    const response = await fetch(url, { headers: this.getAuthHeaders() });

    if (!response.ok) {
      throw new Error("Failed to fetch discount codes");
    }

    const data = await response.json();
    return data.discount_codes;
  }

  async updateDiscountCode(projectId: string, codeId: string, data: Partial<CreateDiscountCodeRequest>): Promise<DiscountCode> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/discount-codes/${codeId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update discount code");
    }

    return response.json();
  }

  // Automation Executions API
  async getAutomationExecutions(
    projectId: string,
    automationId?: string,
    userId?: string,
    status?: string
  ): Promise<AutomationExecution[]> {
    const params = new URLSearchParams();
    if (automationId) params.append("automation_id", automationId);
    if (userId) params.append("user_id", userId);
    if (status) params.append("status", status);

    const url = `${API_BASE}/api/v1/projects/${projectId}/automation-executions?${params.toString()}`;

    const response = await fetch(url, { headers: this.getAuthHeaders() });

    if (!response.ok) {
      throw new Error("Failed to fetch automation executions");
    }

    const data = await response.json();
    return data.executions;
  }

  // Generate personalized email content
  async generateEmailContent(data: GenerateEmailContentRequest): Promise<GeneratedEmailContent> {
    const response = await fetch(
      `${API_BASE}/api/v1/generate-email-content`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate email content");
    }

    return response.json();
  }

  // Test automation by generating sample content
  async testAutomation(projectId: string, automationId: string, testUserId: string): Promise<GeneratedEmailContent> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/automations/${automationId}/test`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ user_id: testUserId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to test automation");
    }

    return response.json();
  }
}

export const automationService = new AutomationService();