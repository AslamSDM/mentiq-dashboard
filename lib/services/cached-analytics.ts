import { enhancedAnalyticsService } from "./enhanced-analytics";
import { useStore } from "../store";

/**
 * Cached wrapper for enhanced analytics service
 * Automatically handles caching in Zustand store
 */
export class CachedAnalyticsService {
  /**
   * Get churn risk data with caching
   */
  async getChurnRisk(projectId: string, riskThreshold?: number) {
    const cached = useStore.getState().getCachedEnhancedData<any>("churnRisk");

    if (cached) {
      return { data: cached };
    }

    const response = await enhancedAnalyticsService.getChurnRisk(
      projectId,
      riskThreshold
    );

    if (response.data) {
      useStore.getState().setCachedEnhancedData("churnRisk", response.data);
    }

    return response;
  }

  /**
   * Get feature adoption with caching
   */
  async getFeatureAdoption(
    projectId: string,
    startDate?: string,
    endDate?: string
  ) {
    const cacheKey = "featureAdoption";
    const cached = useStore.getState().getCachedEnhancedData<any>(cacheKey);

    if (cached) {
      return { data: cached };
    }

    const response = await enhancedAnalyticsService.getFeatureAdoption(
      projectId,
      startDate,
      endDate
    );

    if (response.data) {
      useStore.getState().setCachedEnhancedData(cacheKey, response.data);
    }

    return response;
  }

  /**
   * Get session analytics with caching
   */
  async getSessionAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ) {
    const cacheKey = "sessionAnalytics";
    const cached = useStore.getState().getCachedEnhancedData<any>(cacheKey);

    if (cached) {
      console.log("✅ Using cached session analytics");
      return { session_data: cached };
    }

    const response = await enhancedAnalyticsService.getSessionAnalytics(
      projectId,
      startDate,
      endDate
    );

    console.log("📡 Session analytics API response:", response);

    // The API returns { session_data: {...} }
    const sessionData = (response as any).session_data;

    if (sessionData) {
      useStore.getState().setCachedEnhancedData(cacheKey, sessionData);
      console.log("📦 Cached session analytics");
    }

    return response;
  }

  /**
   * Get location analytics with caching
   */
  async getLocationAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ) {
    const cacheKey = "locationData";
    const cached = useStore.getState().getCachedEnhancedData<any>(cacheKey);

    if (cached) {
      return { data: cached };
    }

    const response = await enhancedAnalyticsService.getLocationAnalytics(
      projectId,
      startDate,
      endDate
    );

    if (response.data) {
      useStore.getState().setCachedEnhancedData(cacheKey, response.data);
    }

    return response;
  }

  /**
   * Get device analytics with caching
   */
  async getDeviceAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ) {
    const cacheKey = "deviceData";
    const cached = useStore.getState().getCachedEnhancedData<any>(cacheKey);

    if (cached) {
      return { data: cached };
    }

    const response = await enhancedAnalyticsService.getDeviceAnalytics(
      projectId,
      startDate,
      endDate
    );

    if (response.data) {
      useStore.getState().setCachedEnhancedData(cacheKey, response.data);
    }

    return response;
  }

  /**
   * Get cohort data with caching
   */
  async getCohortData(projectId: string, startDate?: string, endDate?: string) {
    const cacheKey = "cohortData";
    const cached = useStore.getState().getCachedEnhancedData<any>(cacheKey);

    if (cached) {
      return { data: cached };
    }

    const response = await enhancedAnalyticsService.getRetentionCohorts(
      projectId,
      startDate,
      endDate
    );

    if (response.data) {
      useStore.getState().setCachedEnhancedData(cacheKey, response.data);
    }

    return response;
  }

  /**
   * Get funnel data with caching
   */
  async getFunnelData(projectId: string, events?: string[]) {
    const cacheKey = "funnelData";
    const cached = useStore.getState().getCachedEnhancedData<any>(cacheKey);

    if (cached) {
      return { data: cached };
    }

    const response = await enhancedAnalyticsService.getConversionFunnel(
      projectId,
      events
    );

    if (response.data) {
      useStore.getState().setCachedEnhancedData(cacheKey, response.data);
    }

    return response;
  }

  /**
   * Force refresh all cached data
   */
  clearCache() {
    useStore.getState().clearEnhancedCache();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheKey(
    key:
      | "churnRisk"
      | "featureAdoption"
      | "sessionAnalytics"
      | "locationData"
      | "deviceData"
      | "cohortData"
      | "funnelData"
  ) {
    useStore.getState().clearEnhancedCache(key);
  }
}

export const cachedAnalyticsService = new CachedAnalyticsService();
