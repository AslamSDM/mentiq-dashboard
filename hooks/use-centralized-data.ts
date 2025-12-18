/**
 * Custom hook for accessing centralized cached data
 * Provides a React-friendly interface to the centralized data service
 */

import { useEffect, useState } from "react";
import { centralizedData } from "@/lib/services/centralized-data";
import { useStore } from "@/lib/store";

export function useCentralizedData() {
  const { getEffectiveProjectId } = useStore();
  const [loading, setLoading] = useState(false);
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);

  // Use the centralized getEffectiveProjectId function
  const effectiveProjectId = getEffectiveProjectId();

  // Detect project ID changes and clear cache
  useEffect(() => {
    if (effectiveProjectId !== lastProjectId) {
      console.log("🔄 Effective project ID changed, clearing cache");
      if (lastProjectId) {
        // Clear cache for old project
        centralizedData.clearProjectCache(lastProjectId);
      }
      setLastProjectId(effectiveProjectId);
    }
  }, [effectiveProjectId, lastProjectId]);

  /**
   * Get revenue metrics (cached)
   */
  const useRevenueMetrics = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getRevenueMetrics(effectiveProjectId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId]);

    return { data, loading };
  };

  /**
   * Get revenue analytics (cached)
   */
  const useRevenueAnalytics = (startDate: string, endDate: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getRevenueAnalytics(effectiveProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get location data (cached)
   */
  const useLocationData = (startDate: string, endDate: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getLocationData(effectiveProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get device data (cached)
   */
  const useDeviceData = (startDate: string, endDate: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getDeviceData(effectiveProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get retention data (cached)
   */
  const useRetentionData = (startDate: string, endDate: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getRetentionData(effectiveProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get feature adoption (cached)
   */
  const useFeatureAdoption = (startDate?: string, endDate?: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getFeatureAdoption(effectiveProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get churn risk (cached)
   */
  const useChurnRisk = (threshold = 50) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    console.log("useChurnRisk: effectiveProjectId =", effectiveProjectId);
    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getChurnRisk(effectiveProjectId, threshold)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId, threshold]);

    return { data, loading };
  };

  /**
   * Get session analytics (cached)
   */
  const useSessionAnalytics = (startDate?: string, endDate?: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getSessionAnalytics(effectiveProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get sessions (cached)
   */
  const useSessions = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getSessions(effectiveProjectId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId]);

    return { data, loading };
  };

  /**
   * Get users (cached)
   */
  const useUsers = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getUsers(effectiveProjectId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId]);

    return { data, loading };
  };

  /**
   * Get experiments (cached)
   */
  const useExperiments = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!effectiveProjectId) return;

      setLoading(true);
      centralizedData
        .getExperiments(effectiveProjectId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [effectiveProjectId]);

    return { data, loading };
  };

  /**
   * Trigger prefetch manually
   */
  const prefetchData = async (dateRange?: { start: string; end: string }) => {
    if (!effectiveProjectId) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const range = dateRange || {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };

    setLoading(true);
    await centralizedData.prefetchAllData(effectiveProjectId, range);
    setLoading(false);
  };

  /**
   * Clear cache
   */
  const clearCache = (projectId?: string) => {
    if (projectId) {
      centralizedData.clearProjectCache(projectId);
    } else {
      centralizedData.clearAllCache();
    }
  };

  /**
   * Get cache stats
   */
  const getCacheStats = () => {
    return centralizedData.getCacheStats();
  };

  return {
    // Hooks for specific data
    useRevenueMetrics,
    useRevenueAnalytics,
    useLocationData,
    useDeviceData,
    useRetentionData,
    useFeatureAdoption,
    useChurnRisk,
    useSessionAnalytics,
    useSessions,
    useUsers,
    useExperiments,

    // Utility functions
    prefetchData,
    clearCache,
    getCacheStats,
    loading,
    effectiveProjectId,
  };
}

/**
 * Direct access to centralized data service
 * Use this when you need programmatic access without React hooks
 */
export { centralizedData };
