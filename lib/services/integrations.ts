// Integration Types and API Service

export interface ProjectIntegration {
  id: string;
  project_id: string;
  provider: "mailchimp" | "sendgrid" | "resend" | "customer_io";
  is_active: boolean;
  settings: MailchimpSettings | APIKeyProviderSettings | Record<string, unknown>;
  last_sync_at?: string;
  sync_status: "idle" | "syncing" | "error";
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface APIKeyProviderSettings {
  from_email?: string;
  from_name?: string;
}

export interface MailchimpSettings {
  server_prefix: string;
  account_name?: string;
  account_email?: string;
  audience_id?: string;
  audience_name?: string;
  sync_high_risk: boolean;
  risk_threshold: number;
  add_tags: boolean;
  tag_name: string;
}

export interface MailchimpAudience {
  id: string;
  name: string;
  member_count: number;
}

export interface IntegrationSyncLog {
  id: string;
  integration_id: string;
  sync_type: "auto" | "manual" | "playbook";
  contacts_synced: number;
  contacts_failed: number;
  contacts_skipped: number;
  error_message?: string;
  duration: number;
  created_at: string;
}

export interface SyncResult {
  message: string;
  contacts_synced: number;
  contacts_failed: number;
  contacts_skipped: number;
  duration_ms: number;
}

import { getAuthToken } from "./base";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

class IntegrationsService {
  private getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // Get all integrations for a project
  async getIntegrations(projectId: string): Promise<ProjectIntegration[]> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch integrations");
    }

    return response.json();
  }

  // Get a specific integration
  async getIntegration(
    projectId: string,
    provider: string
  ): Promise<ProjectIntegration | null> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/${provider}`,
      { headers: this.getAuthHeaders() }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch integration");
    }

    return response.json();
  }

  // ==========================================
  // MAILCHIMP
  // ==========================================

  // Start Mailchimp OAuth flow - returns auth URL
  async connectMailchimp(projectId: string): Promise<{ auth_url: string }> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/mailchimp/connect`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to start Mailchimp connection");
    }

    return response.json();
  }

  // Disconnect Mailchimp
  async disconnectMailchimp(projectId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/mailchimp`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to disconnect Mailchimp");
    }
  }

  // Get Mailchimp audiences
  async getMailchimpAudiences(
    projectId: string
  ): Promise<{ audiences: MailchimpAudience[] }> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/mailchimp/audiences`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Mailchimp audiences");
    }

    return response.json();
  }

  // Update Mailchimp settings
  async updateMailchimpSettings(
    projectId: string,
    settings: Partial<MailchimpSettings>
  ): Promise<ProjectIntegration> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/mailchimp/settings`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update Mailchimp settings");
    }

    return response.json();
  }

  // Trigger manual sync
  async triggerMailchimpSync(projectId: string): Promise<SyncResult> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/mailchimp/sync`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to trigger sync");
    }

    return response.json();
  }

  // Get sync logs
  async getMailchimpSyncLogs(
    projectId: string
  ): Promise<{ logs: IntegrationSyncLog[] }> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/mailchimp/logs`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch sync logs");
    }

    return response.json();
  }
  // ==========================================
  // RESEND
  // ==========================================

  async connectResend(
    projectId: string,
    data: { api_key: string; from_email?: string; from_name?: string }
  ): Promise<ProjectIntegration> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/resend/connect`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to connect Resend");
    }

    return response.json();
  }

  async disconnectResend(projectId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/resend`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to disconnect Resend");
    }
  }

  async updateResendSettings(
    projectId: string,
    settings: { api_key?: string; from_email?: string; from_name?: string }
  ): Promise<ProjectIntegration> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/resend/settings`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update Resend settings");
    }

    return response.json();
  }

  async testResend(
    projectId: string,
    toEmail: string
  ): Promise<{ message: string; message_id: string }> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/resend/test`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ to_email: toEmail }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send test email");
    }

    return response.json();
  }

  // ==========================================
  // SENDGRID
  // ==========================================

  async connectSendGrid(
    projectId: string,
    data: { api_key: string; from_email?: string; from_name?: string }
  ): Promise<ProjectIntegration> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/sendgrid/connect`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to connect SendGrid");
    }

    return response.json();
  }

  async disconnectSendGrid(projectId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/sendgrid`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to disconnect SendGrid");
    }
  }

  async updateSendGridSettings(
    projectId: string,
    settings: { api_key?: string; from_email?: string; from_name?: string }
  ): Promise<ProjectIntegration> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/sendgrid/settings`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update SendGrid settings");
    }

    return response.json();
  }

  async testSendGrid(
    projectId: string,
    toEmail: string
  ): Promise<{ message: string; message_id: string }> {
    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/integrations/sendgrid/test`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ to_email: toEmail }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send test email");
    }

    return response.json();
  }
}

export const integrationsService = new IntegrationsService();
