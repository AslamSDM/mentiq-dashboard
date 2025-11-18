const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Token management - stored in memory and localStorage
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  console.log(
    "setAuthToken called with:",
    token ? `${token.substring(0, 20)}...` : "null"
  );
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
      console.log("Token saved to localStorage ✅");
    } else {
      localStorage.removeItem("auth_token");
      console.log("Token removed from localStorage ❌");
    }
  }
};

export const getAuthToken = (): string | null => {
  // First check memory
  if (authToken) {
    return authToken;
  }

  // Then check localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth_token");
    if (stored) {
      authToken = stored;
      return stored;
    }
  }

  return null;
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
    console.log("BaseHttpService: Project ID set", projectId);
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
    console.log(`Making request to: ${url}`);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Only add auth token if required (default true, but can be disabled for login/signup)
    if (requireAuth) {
      const token = getAuthToken();

      console.log("API Request: Using token", token ? "✅" : "❌");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log(`API Request: ${endpoint} with auth token ✅`);
      } else {
        console.warn(`API Request: ${endpoint} without auth token ⚠️`);
      }
    } else {
      console.log(`API Request: ${endpoint} without auth requirement ✅`);
    }

    // Add project ID if provided or set globally
    const targetProjectId = projectId || this.projectId;
    if (targetProjectId) {
      headers["X-Project-ID"] = targetProjectId;
    }

    console.log("Request headers:", headers);

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error: ${endpoint} - ${response.status}`, errorData);
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
