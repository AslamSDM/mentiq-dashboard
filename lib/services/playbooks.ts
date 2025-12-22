import { BaseHttpService } from "./base";

// Types
export interface Playbook {
  id: string;
  project_id: string;
  name: string;
  description: string;
  type: "churn_prevention" | "growth_expansion" | "onboarding" | "engagement";
  status: "draft" | "active" | "paused" | "archived";
  source: "manual" | "llm_generated";
  llm_prompt_used?: string;
  llm_model_version?: string;
  created_by: string;
  activated_at?: string;
  created_at: string;
  updated_at: string;
  steps?: PlaybookStep[];
  triggers?: PlaybookTrigger[];
  // Computed from API
  total_enrolled?: number;
  active_enrolled?: number;
  completed_count?: number;
  completion_rate?: number;
}

export interface PlaybookStep {
  id: string;
  playbook_id: string;
  step_order: number;
  name: string;
  description: string;
  action_type:
    | "email"
    | "in_app_message"
    | "webhook"
    | "wait"
    | "condition"
    | "feature_flag";
  action_config: Record<string, any>;
  delay_minutes: number;
  conditions?: Record<string, any>;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaybookTrigger {
  id: string;
  playbook_id: string;
  name: string;
  trigger_type: "event" | "metric_threshold" | "segment" | "schedule";
  conditions: TriggerConditions;
  is_enabled: boolean;
  priority: number;
  cooldown_minutes: number;
  max_enrollments: number;
  created_at: string;
  updated_at: string;
}

export interface TriggerConditions {
  metric?: string;
  operator?: "gt" | "lt" | "eq" | "gte" | "lte";
  value?: number | string;
  event_type?: string;
  segment_id?: string;
}

export interface PlaybookEnrollment {
  id: string;
  playbook_id: string;
  project_id: string;
  user_id: string;
  trigger_id?: string;
  status: "active" | "completed" | "exited" | "paused";
  current_step_order: number;
  enrolled_at: string;
  completed_at?: string;
  exited_at?: string;
  exit_reason?: string;
  metrics_at_start: Record<string, any>;
  metrics_at_end?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlaybooksSummary {
  active_playbooks: number;
  total_triggers: number;
  completion_rate: number;
  in_progress: number;
  total_enrollments: number;
}

export interface PlaybookAnalytics {
  playbook_id: string;
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  exited_enrollments: number;
  completion_rate: number;
  step_count: number;
  active_trigger_count: number;
}

export interface LLMGeneration {
  id: string;
  project_id: string;
  playbook_type: string;
  input_context: Record<string, any>;
  prompt_used: string;
  llm_response?: string;
  parsed_playbook?: Record<string, any>;
  status: "pending" | "generating" | "completed" | "failed" | "applied";
  error_message?: string;
  playbook_id?: string;
  model_used: string;
  tokens_used: number;
  cost_cents: number;
  created_at: string;
  completed_at?: string;
}

// Request types
export interface CreatePlaybookRequest {
  name: string;
  description?: string;
  type: "churn_prevention" | "growth_expansion" | "onboarding" | "engagement";
}

export interface UpdatePlaybookRequest {
  name?: string;
  description?: string;
  type?: string;
}

export interface CreateStepRequest {
  name: string;
  description?: string;
  action_type: string;
  action_config?: Record<string, any>;
  delay_minutes?: number;
  conditions?: Record<string, any>;
  is_required?: boolean;
}

export interface CreateTriggerRequest {
  name: string;
  trigger_type: "event" | "metric_threshold" | "segment" | "schedule";
  conditions: TriggerConditions;
  is_enabled?: boolean;
  priority?: number;
  cooldown_minutes?: number;
  max_enrollments?: number;
}

export interface GeneratePlaybookRequest {
  playbook_type: "churn_prevention" | "growth_expansion";
  context_data?: Record<string, any>;
  goals?: string[];
}

// API functions
class PlaybooksService extends BaseHttpService {
  private getBaseUrl(projectId: string): string {
    return `/api/v1/projects/${projectId}/playbooks`;
  }

  // Playbook CRUD
  async createPlaybook(
    projectId: string,
    data: CreatePlaybookRequest
  ): Promise<Playbook> {
    return this.request<Playbook>(this.getBaseUrl(projectId), {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPlaybooks(projectId: string): Promise<Playbook[]> {
    return this.request<Playbook[]>(this.getBaseUrl(projectId));
  }

  async getPlaybook(projectId: string, playbookId: string): Promise<Playbook> {
    return this.request<Playbook>(
      `${this.getBaseUrl(projectId)}/${playbookId}`
    );
  }

  async updatePlaybook(
    projectId: string,
    playbookId: string,
    data: UpdatePlaybookRequest
  ): Promise<Playbook> {
    return this.request<Playbook>(
      `${this.getBaseUrl(projectId)}/${playbookId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deletePlaybook(projectId: string, playbookId: string): Promise<void> {
    await this.request(`${this.getBaseUrl(projectId)}/${playbookId}`, {
      method: "DELETE",
    });
  }

  async updatePlaybookStatus(
    projectId: string,
    playbookId: string,
    status: "draft" | "active" | "paused" | "archived"
  ): Promise<Playbook> {
    return this.request<Playbook>(
      `${this.getBaseUrl(projectId)}/${playbookId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
  }

  // Steps
  async addStep(
    projectId: string,
    playbookId: string,
    step: CreateStepRequest
  ): Promise<PlaybookStep> {
    return this.request<PlaybookStep>(
      `${this.getBaseUrl(projectId)}/${playbookId}/steps`,
      {
        method: "POST",
        body: JSON.stringify(step),
      }
    );
  }

  async updateStep(
    projectId: string,
    playbookId: string,
    stepId: string,
    data: CreateStepRequest
  ): Promise<PlaybookStep> {
    return this.request<PlaybookStep>(
      `${this.getBaseUrl(projectId)}/${playbookId}/steps/${stepId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteStep(
    projectId: string,
    playbookId: string,
    stepId: string
  ): Promise<void> {
    await this.request(
      `${this.getBaseUrl(projectId)}/${playbookId}/steps/${stepId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Triggers
  async createTrigger(
    projectId: string,
    playbookId: string,
    trigger: CreateTriggerRequest
  ): Promise<PlaybookTrigger> {
    return this.request<PlaybookTrigger>(
      `${this.getBaseUrl(projectId)}/${playbookId}/triggers`,
      {
        method: "POST",
        body: JSON.stringify(trigger),
      }
    );
  }

  async getTriggers(
    projectId: string,
    playbookId: string
  ): Promise<PlaybookTrigger[]> {
    return this.request<PlaybookTrigger[]>(
      `${this.getBaseUrl(projectId)}/${playbookId}/triggers`
    );
  }

  async updateTrigger(
    projectId: string,
    playbookId: string,
    triggerId: string,
    data: CreateTriggerRequest
  ): Promise<PlaybookTrigger> {
    return this.request<PlaybookTrigger>(
      `${this.getBaseUrl(projectId)}/${playbookId}/triggers/${triggerId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteTrigger(
    projectId: string,
    playbookId: string,
    triggerId: string
  ): Promise<void> {
    await this.request(
      `${this.getBaseUrl(projectId)}/${playbookId}/triggers/${triggerId}`,
      {
        method: "DELETE",
      }
    );
  }

  async toggleTrigger(
    projectId: string,
    playbookId: string,
    triggerId: string,
    enabled: boolean
  ): Promise<PlaybookTrigger> {
    return this.request<PlaybookTrigger>(
      `${this.getBaseUrl(projectId)}/${playbookId}/triggers/${triggerId}/toggle`,
      {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      }
    );
  }

  // Enrollments
  async enrollUsers(
    projectId: string,
    playbookId: string,
    userIds: string[]
  ): Promise<{ enrolled_count: number; enrollments: PlaybookEnrollment[] }> {
    return this.request<{
      enrolled_count: number;
      enrollments: PlaybookEnrollment[];
    }>(`${this.getBaseUrl(projectId)}/${playbookId}/enroll`, {
      method: "POST",
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  async getEnrollments(
    projectId: string,
    playbookId: string,
    status?: string
  ): Promise<PlaybookEnrollment[]> {
    const url = status
      ? `${this.getBaseUrl(projectId)}/${playbookId}/enrollments?status=${status}`
      : `${this.getBaseUrl(projectId)}/${playbookId}/enrollments`;
    return this.request<PlaybookEnrollment[]>(url);
  }

  async exitEnrollment(
    projectId: string,
    playbookId: string,
    enrollmentId: string,
    reason?: string
  ): Promise<PlaybookEnrollment> {
    return this.request<PlaybookEnrollment>(
      `${this.getBaseUrl(projectId)}/${playbookId}/enrollments/${enrollmentId}/exit`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  }

  // Analytics
  async getPlaybookAnalytics(
    projectId: string,
    playbookId: string
  ): Promise<PlaybookAnalytics> {
    return this.request<PlaybookAnalytics>(
      `${this.getBaseUrl(projectId)}/${playbookId}/analytics`
    );
  }

  async getPlaybooksSummary(projectId: string): Promise<PlaybooksSummary> {
    return this.request<PlaybooksSummary>(
      `${this.getBaseUrl(projectId)}/summary`
    );
  }

  // LLM Generation
  async generatePlaybook(
    projectId: string,
    request: GeneratePlaybookRequest
  ): Promise<LLMGeneration> {
    return this.request<LLMGeneration>(
      `${this.getBaseUrl(projectId)}/generate`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async getGenerationStatus(
    projectId: string,
    generationId: string
  ): Promise<LLMGeneration> {
    return this.request<LLMGeneration>(
      `${this.getBaseUrl(projectId)}/generate/${generationId}`
    );
  }

  async applyGeneratedPlaybook(
    projectId: string,
    generationId: string
  ): Promise<Playbook> {
    return this.request<Playbook>(
      `${this.getBaseUrl(projectId)}/generate/${generationId}/apply`,
      {
        method: "POST",
      }
    );
  }
}

export const playbooksService = new PlaybooksService();
export default playbooksService;
