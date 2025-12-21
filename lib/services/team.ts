import { BaseHttpService } from "./base";

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "member" | "viewer";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "canceled";
  expires_at: string;
  created_at: string;
  invited_by?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface TeamMembersResponse {
  members: TeamMember[];
  total: number;
  limit: number;
  tier: string;
}

export interface InvitationsResponse {
  invitations: Invitation[];
  total: number;
}

export interface CreateInvitationRequest {
  email: string;
  role: string;
}

export interface AcceptInvitationRequest {
  token: string;
  full_name: string;
  password: string;
}

export interface AcceptInvitationResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  project_id?: string;
  user: {
    id: string;
    name: string;
    email: string;
    is_admin: boolean;
    has_active_subscription: boolean;
    subscription_status: string;
    created_at: string;
    updated_at: string;
  };
}

export class TeamService extends BaseHttpService {
  /**
   * List all team members for the current account
   */
  async listMembers(): Promise<TeamMembersResponse> {
    return this.request<TeamMembersResponse>("/api/v1/team/members");
  }

  /**
   * Create a new team invitation
   */
  async createInvitation(
    email: string,
    role: string
  ): Promise<{ message: string; invitation: Invitation }> {
    return this.request("/api/v1/invitations", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  }

  /**
   * List all invitations for the current account
   */
  async listInvitations(status?: string): Promise<InvitationsResponse> {
    const params = status ? `?status=${status}` : "";
    return this.request<InvitationsResponse>(`/api/v1/invitations${params}`);
  }

  /**
   * Accept an invitation and create a user account (no auth required)
   */
  async acceptInvitation(
    token: string,
    fullName: string,
    password: string
  ): Promise<AcceptInvitationResponse> {
    return this.request<AcceptInvitationResponse>(
      "/api/v1/invitations/accept",
      {
        method: "POST",
        body: JSON.stringify({
          token,
          full_name: fullName,
          password,
        }),
        requireAuth: false,
      }
    );
  }

  /**
   * Update a team member's role
   */
  async updateMemberRole(
    memberId: string,
    role: string
  ): Promise<{ message: string; member: TeamMember }> {
    return this.request(`/api/v1/team/members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  /**
   * Remove a team member from the account
   */
  async removeMember(memberId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/team/members/${memberId}`, {
      method: "DELETE",
    });
  }

  /**
   * Cancel a pending invitation
   */
  async cancelInvitation(
    invitationId: string
  ): Promise<{ message: string; invitation: Invitation }> {
    return this.request(`/api/v1/invitations/${invitationId}`, {
      method: "DELETE",
    });
  }

  /**
   * Resend an invitation email
   */
  async resendInvitation(
    invitationId: string
  ): Promise<{ message: string; invitation: Invitation }> {
    return this.request(`/api/v1/invitations/${invitationId}/resend`, {
      method: "POST",
    });
  }
}

// Export a singleton instance
export const teamService = new TeamService();
