import { BaseHttpService } from "./base";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class AuthService extends BaseHttpService {
  // Auth endpoints - these don't require authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      requireAuth: false, // Login doesn't need auth token
    });
  }

  async signup(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    return this.request("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      requireAuth: false, // Signup doesn't need auth token
    });
  }

  async logout(): Promise<void> {
    // Just clear the local token - no server call needed
    const { setAuthToken } = await import("./base");
    setAuthToken(null);
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request("/auth/refresh", {
      method: "POST",
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      requireAuth: false,
    });
  }

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      requireAuth: false,
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      requireAuth: false,
    });
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    return this.request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
      requireAuth: false,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getProfile(): Promise<AuthUser> {
    return this.request("/auth/profile");
  }

  async updateProfile(
    data: Partial<Pick<AuthUser, "name" | "email">>
  ): Promise<AuthUser> {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

// Export a singleton instance
export const authService = new AuthService();
