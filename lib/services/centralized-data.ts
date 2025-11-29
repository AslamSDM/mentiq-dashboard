/**
 * Centralized Data Service
 * Handles all API calls with intelligent caching and prefetching
 * Data is fetched once on app load and cached with TTL
 */

import { projectService } from "./project";
import { enhancedAnalyticsService } from "./enhanced-analytics";
import { cachedAnalyticsService } from "./cached-analytics";

// Cache configuration (in milliseconds)
const CACHE_CONFIG = {
  PROJECTS: 10 * 60 * 1000, // 10 minutes
  REVENUE: 15 * 60 * 1000, // 15 minutes
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
  ENHANCED: 10 * 60 * 1000, // 10 minutes
  SESSIONS: 5 * 60 * 1000, // 5 minutes
  EXPERIMENTS: 10 * 60 * 1000, // 10 minutes
  HEALTH_SCORE: 10 * 60 * 1000, // 10 minutes
};

// Cache version - increment this to invalidate all caches
const CACHE_VERSION = 2;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: number;
}

interface CentralizedCache {
  // Project data
  projects?: CacheEntry<any[]>;
  apiKeys?: Record<string, CacheEntry<any[]>>;

  // Revenue data
  revenueMetrics?: Record<string, CacheEntry<any>>;
  revenueAnalytics?: Record<string, CacheEntry<any>>;
  customerAnalytics?: Record<string, CacheEntry<any>>;

  // Analytics data
  analytics?: Record<string, CacheEntry<any>>;
  events?: Record<string, CacheEntry<any[]>>;

  // Enhanced analytics
  locationData?: Record<string, CacheEntry<any>>;
  deviceData?: Record<string, CacheEntry<any>>;
  retentionData?: Record<string, CacheEntry<any>>;
  featureAdoption?: Record<string, CacheEntry<any>>;
  churnRisk?: Record<string, CacheEntry<any>>;
  churnByChannel?: Record<string, CacheEntry<any>>;
  sessionAnalytics?: Record<string, CacheEntry<any>>;
  cohortData?: Record<string, CacheEntry<any>>;
  funnelData?: Record<string, CacheEntry<any>>;

  // Sessions & Users
  sessions?: Record<string, CacheEntry<any[]>>;
  users?: Record<string, CacheEntry<any[]>>;
  sessionsOverview?: Record<string, CacheEntry<any>>;

  // Experiments
  experiments?: Record<string, CacheEntry<any[]>>;
  experimentResults?: Record<string, CacheEntry<any>>;

  // Health Score
  healthScore?: Record<string, CacheEntry<any>>;
}

class CentralizedDataService {
  private cache: CentralizedCache = {};
  private fetchPromises: Map<string, Promise<any>> = new Map();
  private prefetchInProgress = false;

  /**
   * Get data from cache or fetch if expired/missing
   */
  private async getCachedOrFetch<T>(
    cacheKey: string,
    cachePath: keyof CentralizedCache,
    ttl: number,
    fetchFn: () => Promise<T>,
    projectId?: string
  ): Promise<T> {
    const fullKey = projectId ? `${projectId}_${cacheKey}` : cacheKey;

    // Check if already fetching
    if (this.fetchPromises.has(fullKey)) {
      return this.fetchPromises.get(fullKey);
    }

    // Check cache
    let cacheStore = this.cache[cachePath] as any;
    if (!cacheStore) {
      cacheStore = {};
      (this.cache as any)[cachePath] = cacheStore;
    }

    // Use fullKey for cache lookup to avoid collisions
    const cached = cacheStore[fullKey];
    const now = Date.now();

    // Check if cache is valid (not expired and correct version)
    if (cached && cached.expiresAt > now && cached.version === CACHE_VERSION) {
      console.log(`✅ Cache hit: ${cachePath}/${fullKey}`);
      return cached.data;
    }

    if (cached && cached.version !== CACHE_VERSION) {
      console.log(
        `🔄 Cache version mismatch: ${cachePath}/${fullKey} - Invalidating...`
      );
      delete cacheStore[fullKey];
    }

    // Fetch fresh data
    console.log(`📡 Cache miss: ${cachePath}/${fullKey} - Fetching...`);
    const fetchPromise = fetchFn()
      .then((data) => {
        const entry: CacheEntry<T> = {
          data,
          timestamp: now,
          expiresAt: now + ttl,
          version: CACHE_VERSION,
        };

        // Store using fullKey to avoid collisions between different date ranges
        if (!this.cache[cachePath]) {
          (this.cache as any)[cachePath] = {};
        }
        (this.cache[cachePath] as any)[fullKey] = entry;

        this.fetchPromises.delete(fullKey);
        return data;
      })
      .catch((error) => {
        this.fetchPromises.delete(fullKey);
        throw error;
      });

    this.fetchPromises.set(fullKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Prefetch all data for a project at once
   */
  async prefetchAllData(
    projectId: string,
    dateRange: { start: string; end: string }
  ) {
    if (this.prefetchInProgress) {
      console.log("⏳ Prefetch already in progress, skipping...");
      return;
    }

    this.prefetchInProgress = true;
    console.log(`🚀 Prefetching all data for project ${projectId}...`);

    try {
      // Fetch everything in parallel
      await Promise.allSettled([
        // Revenue data
        this.getRevenueMetrics(projectId),
        this.getRevenueAnalytics(projectId, dateRange.start, dateRange.end),
        this.getCustomerAnalytics(projectId),

        // Enhanced analytics
        this.getLocationData(projectId, dateRange.start, dateRange.end),
        this.getDeviceData(projectId, dateRange.start, dateRange.end),
        this.getRetentionData(projectId, dateRange.start, dateRange.end),
        this.getFeatureAdoption(projectId, dateRange.start, dateRange.end),
        this.getChurnRisk(projectId),
        this.getChurnByChannel(projectId, dateRange.start, dateRange.end),
        this.getSessionAnalytics(projectId, dateRange.start, dateRange.end),

        // Basic analytics
        this.getAnalytics(projectId, dateRange.start, dateRange.end),
        this.getEvents(projectId),

        // Sessions & Users
        this.getSessions(projectId),
        this.getUsers(projectId),
        this.getSessionsOverview(projectId),

        // Experiments
        this.getExperiments(projectId),
      ]);

      console.log(`✅ Prefetch complete for project ${projectId}`);
    } catch (error) {
      console.error("❌ Error during prefetch:", error);
    } finally {
      this.prefetchInProgress = false;
    }
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache = {};
    this.fetchPromises.clear();
    console.log("🗑️ All cache cleared");
  }

  /**
   * Clear cache for specific project
   */
  clearProjectCache(projectId: string) {
    Object.keys(this.cache).forEach((key) => {
      const cacheStore = (this.cache as any)[key];
      if (cacheStore && typeof cacheStore === "object") {
        // Clear all cache entries that start with the projectId
        Object.keys(cacheStore).forEach((cacheKey) => {
          if (cacheKey.startsWith(projectId)) {
            delete cacheStore[cacheKey];
          }
        });
      }
    });
    console.log(`🗑️ Cache cleared for project ${projectId}`);
  }

  /**
   * Force refresh specific cache entry
   */
  async refreshCache(cachePath: keyof CentralizedCache, projectId?: string) {
    if (projectId && this.cache[cachePath]) {
      delete (this.cache[cachePath] as any)[projectId];
    } else {
      delete this.cache[cachePath];
    }
  }

  // ==================== PROJECT APIS ====================

  async getProjects(): Promise<any[]> {
    return this.getCachedOrFetch(
      "projects",
      "projects",
      CACHE_CONFIG.PROJECTS,
      () => projectService.getProjects()
    );
  }

  async getApiKeys(projectId: string): Promise<any[]> {
    return this.getCachedOrFetch(
      "apiKeys",
      "apiKeys",
      CACHE_CONFIG.PROJECTS,
      () => projectService.getApiKeys(projectId),
      projectId
    );
  }

  // ==================== REVENUE APIS ====================

  async getRevenueMetrics(projectId: string): Promise<any> {
    return this.getCachedOrFetch(
      "revenueMetrics",
      "revenueMetrics",
      CACHE_CONFIG.REVENUE,
      async () => {
        const response = await projectService.getRevenueMetrics(projectId);
        return response.status === "success" ? response.data : null;
      },
      projectId
    );
  }

  async getRevenueAnalytics(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const cacheKey = `${startDate}_${endDate}`;
    return this.getCachedOrFetch(
      cacheKey,
      "revenueAnalytics",
      CACHE_CONFIG.REVENUE,
      async () => {
        const response = await projectService.getRevenueAnalytics(
          projectId,
          startDate,
          endDate
        );
        return response.status === "success" ? response.data : null;
      },
      projectId
    );
  }

  async getCustomerAnalytics(projectId: string): Promise<any> {
    return this.getCachedOrFetch(
      "customerAnalytics",
      "customerAnalytics",
      CACHE_CONFIG.REVENUE,
      async () => {
        const response = await projectService.getCustomerAnalytics(projectId);
        return response.status === "success" ? response.data : null;
      },
      projectId
    );
  }

  // ==================== ANALYTICS APIS ====================

  async getAnalytics(
    projectId: string,
    startDate: string,
    endDate: string,
    groupBy = "day"
  ): Promise<any> {
    const cacheKey = `${startDate}_${endDate}_${groupBy}`;
    return this.getCachedOrFetch(
      cacheKey,
      "analytics",
      CACHE_CONFIG.ANALYTICS,
      async () => {
        const { analyticsService } = await import("./analytics");
        return analyticsService.getAnalytics(projectId, {
          startDate,
          endDate,
        });
      },
      projectId
    );
  }

  async getEvents(projectId: string): Promise<any[]> {
    return this.getCachedOrFetch(
      "events",
      "events",
      CACHE_CONFIG.ANALYTICS,
      async () => {
        const { analyticsService } = await import("./analytics");
        return analyticsService.getEvents(projectId);
      },
      projectId
    );
  }

  // ==================== ENHANCED ANALYTICS APIS ====================

  async getLocationData(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const cacheKey = `${startDate}_${endDate}`;
    return this.getCachedOrFetch(
      cacheKey,
      "locationData",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getLocationAnalytics(
          projectId,
          startDate,
          endDate
        );
        return response.data;
      },
      projectId
    );
  }

  async getDeviceData(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const cacheKey = `${startDate}_${endDate}`;
    return this.getCachedOrFetch(
      cacheKey,
      "deviceData",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getDeviceAnalytics(
          projectId,
          startDate,
          endDate
        );
        return response.data;
      },
      projectId
    );
  }

  async getRetentionData(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const cacheKey = `${startDate || "default"}_${endDate || "default"}`;
    return this.getCachedOrFetch(
      cacheKey,
      "retentionData",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getRetentionCohorts(
          projectId,
          startDate,
          endDate
        );
        console.log("🔍 Retention raw API response:", response);
        // The API returns { cohorts: [...] }
        return response;
      },
      projectId
    );
  }

  async getFeatureAdoption(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const cacheKey =
      startDate && endDate ? `${startDate}_${endDate}` : "default";
    return this.getCachedOrFetch(
      cacheKey,
      "featureAdoption",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getFeatureAdoption(
          projectId,
          startDate,
          endDate
        );
        return response.data;
      },
      projectId
    );
  }

  async getChurnRisk(projectId: string, threshold = 50): Promise<any> {
    return this.getCachedOrFetch(
      `threshold_${threshold}`,
      "churnRisk",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getChurnRisk(
          projectId,
          threshold
        );
        return response.data;
      },
      projectId
    );
  }

  async getChurnByChannel(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const cacheKey = `${startDate || ""}_${endDate || ""}`;
    return this.getCachedOrFetch(
      cacheKey,
      "churnByChannel",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getChurnByChannel(
          projectId,
          startDate,
          endDate
        );
        return response.data;
      },
      projectId
    );
  }

  async getSessionAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const cacheKey =
      startDate && endDate ? `${startDate}_${endDate}` : "default";
    return this.getCachedOrFetch(
      cacheKey,
      "sessionAnalytics",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getSessionAnalytics(
          projectId,
          startDate,
          endDate
        );
        return response.session_data;
      },
      projectId
    );
  }

  async getCohortData(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const cacheKey = `${startDate}_${endDate}`;
    return this.getCachedOrFetch(
      cacheKey,
      "cohortData",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getRetentionCohorts(
          projectId,
          startDate,
          endDate
        );
        return response;
      },
      projectId
    );
  }

  async getFunnelData(projectId: string, events?: string[]): Promise<any> {
    const cacheKey = events ? events.join("_") : "default";
    return this.getCachedOrFetch(
      cacheKey,
      "funnelData",
      CACHE_CONFIG.ENHANCED,
      async () => {
        const response = await enhancedAnalyticsService.getConversionFunnel(
          projectId,
          events
        );
        return response.data;
      },
      projectId
    );
  }

  // ==================== SESSIONS & USERS APIS ====================

  async getSessions(projectId: string): Promise<any[]> {
    return this.getCachedOrFetch(
      "sessions",
      "sessions",
      CACHE_CONFIG.SESSIONS,
      async () => {
        const { analyticsService } = await import("./analytics");
        return analyticsService.getSessions(projectId);
      },
      projectId
    );
  }

  async getUsers(projectId: string): Promise<any> {
    return this.getCachedOrFetch(
      "users",
      "users",
      CACHE_CONFIG.SESSIONS,
      async () => {
        const { apiClient } = await import("../api");
        return apiClient.getUsers(projectId);
      },
      projectId
    );
  }

  async getSessionsOverview(projectId: string): Promise<any> {
    return this.getCachedOrFetch(
      "overview",
      "sessionsOverview",
      CACHE_CONFIG.SESSIONS,
      async () => {
        const { analyticsService } = await import("./analytics");
        return analyticsService.getSessionsOverview(projectId);
      },
      projectId
    );
  }

  // ==================== EXPERIMENTS APIS ====================

  async getExperiments(projectId: string): Promise<any[]> {
    return this.getCachedOrFetch(
      "experiments",
      "experiments",
      CACHE_CONFIG.EXPERIMENTS,
      async () => {
        const { apiClient } = await import("../api");
        return apiClient.getExperiments(projectId);
      },
      projectId
    );
  }

  async getExperimentResults(
    projectId: string,
    experimentId: string
  ): Promise<any> {
    return this.getCachedOrFetch(
      experimentId,
      "experimentResults",
      CACHE_CONFIG.EXPERIMENTS,
      async () => {
        const { apiClient } = await import("../api");
        return apiClient.getExperimentResults(projectId, experimentId);
      },
      projectId
    );
  }

  // ==================== HEALTH SCORE APIS ====================

  async getHealthScore(projectId: string, inputs: any): Promise<any> {
    return this.getCachedOrFetch(
      "healthScore",
      "healthScore",
      CACHE_CONFIG.HEALTH_SCORE,
      async () => {
        const response = await fetch("/api/health-score/llm-context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs),
        });
        const result = await response.json();
        return result.data;
      },
      projectId
    );
  }

  // ==================== CACHE STATS ====================

  getCacheStats() {
    const stats: Record<string, any> = {};
    Object.keys(this.cache).forEach((key) => {
      const cacheStore = (this.cache as any)[key];
      if (cacheStore) {
        if (typeof cacheStore === "object" && "data" in cacheStore) {
          stats[key] = {
            cached: true,
            expiresIn: Math.max(0, cacheStore.expiresAt - Date.now()),
          };
        } else {
          stats[key] = {
            entries: Object.keys(cacheStore).length,
          };
        }
      }
    });
    return stats;
  }
}

// Export singleton instance
export const centralizedData = new CentralizedDataService();
