import { BaseHttpService } from "./base";

export interface SupportTicket {
  id: string;
  account_id: string;
  user_id: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  category: "bug" | "feature_request" | "billing" | "general" | "technical";
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  account?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    email: string;
    name?: string;
  };
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: string;
  category?: string;
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  priority?: string;
  status?: string;
  category?: string;
  assigned_to?: string;
}

export interface CreateCommentRequest {
  content: string;
  is_internal?: boolean;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent: number;
  high: number;
}

export class TicketService extends BaseHttpService {
  // User ticket operations
  async createTicket(data: CreateTicketRequest): Promise<SupportTicket> {
    return this.request<SupportTicket>("/api/v1/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTickets(filters?: {
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<SupportTicket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.category) params.append("category", filters.category);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<SupportTicket[]>(`/api/v1/tickets${query}`);
  }

  async getTicket(id: string): Promise<SupportTicket> {
    return this.request<SupportTicket>(`/api/v1/tickets/${id}`);
  }

  async updateTicket(id: string, data: UpdateTicketRequest): Promise<SupportTicket> {
    return this.request<SupportTicket>(`/api/v1/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async addComment(ticketId: string, data: CreateCommentRequest): Promise<TicketComment> {
    return this.request<TicketComment>(`/api/v1/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Admin ticket operations
  async getAllTickets(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    assigned_to?: string;
  }): Promise<SupportTicket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.assigned_to) params.append("assigned_to", filters.assigned_to);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<SupportTicket[]>(`/api/v1/admin/tickets${query}`);
  }

  async getTicketStats(): Promise<TicketStats> {
    return this.request<TicketStats>("/api/v1/admin/tickets/stats");
  }
}

// Export a singleton instance
export const ticketService = new TicketService();
