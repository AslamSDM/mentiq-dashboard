const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) {
    return authToken;
  }

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth_token");
    if (stored) {
      authToken = stored;
      return stored;
    }
  }

  return null;
};

export const isInvalidTokenError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  const err = error as { message?: string; error?: string; status?: number };
  const errorMessage = err.message || err.error || "";
  return (
    errorMessage.includes("Invalid token") ||
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("Token expired") ||
    err.status === 401
  );
};

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  requireAuth?: boolean;
  projectId?: string;
}

export class BaseHttpService {
  protected projectId: string | null = null;

  setProjectId(projectId: string) {
    this.projectId = projectId;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      requireAuth = true,
      projectId,
      headers: customHeaders = {},
      ...fetchOptions
    } = options;

    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    if (requireAuth) {
      const token = getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const targetProjectId = projectId || this.projectId;
    if (targetProjectId) {
      headers["X-Project-ID"] = targetProjectId;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  async healthCheck() {
    return this.request("/health", { requireAuth: false });
  }

  async getSystemStatus() {
    return this.request("/api/v1/system/status");
  }
}
