/**
 * Custom hook for accessing centralized cached data
 * Provides a React-friendly interface to the centralized data service
 */

import { useEffect, useState } from "react";
import { centralizedData } from "@/lib/services/centralized-data";
import { useStore } from "@/lib/store";

export function useCentralizedData() {
  const { selectedProjectId } = useStore();
  const [loading, setLoading] = useState(false);

  /**
   * Get revenue metrics (cached)
   */
  const useRevenueMetrics = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getRevenueMetrics(selectedProjectId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId]);

    return { data, loading };
  };

  /**
   * Get revenue analytics (cached)
   */
  const useRevenueAnalytics = (startDate: string, endDate: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getRevenueAnalytics(selectedProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get location data (cached)
   */
  const useLocationData = (startDate: string, endDate: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getLocationData(selectedProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get device data (cached)
   */
  const useDeviceData = (startDate: string, endDate: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getDeviceData(selectedProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get retention data (cached)
   */
  const useRetentionData = (startDate: string, endDate: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getRetentionData(selectedProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get feature adoption (cached)
   */
  const useFeatureAdoption = (startDate?: string, endDate?: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getFeatureAdoption(selectedProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get churn risk (cached)
   */
  const useChurnRisk = (threshold = 50) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getChurnRisk(selectedProjectId, threshold)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId, threshold]);

    return { data, loading };
  };

  /**
   * Get session analytics (cached)
   */
  const useSessionAnalytics = (startDate?: string, endDate?: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getSessionAnalytics(selectedProjectId, startDate, endDate)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId, startDate, endDate]);

    return { data, loading };
  };

  /**
   * Get sessions (cached)
   */
  const useSessions = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getSessions(selectedProjectId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId]);

    return { data, loading };
  };

  /**
   * Get users (cached)
   */
  const useUsers = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getUsers(selectedProjectId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId]);

    return { data, loading };
  };

  /**
   * Get experiments (cached)
   */
  const useExperiments = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!selectedProjectId) return;

      setLoading(true);
      centralizedData
        .getExperiments(selectedProjectId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedProjectId]);

    return { data, loading };
  };

  /**
   * Trigger prefetch manually
   */
  const prefetchData = async (dateRange?: { start: string; end: string }) => {
    if (!selectedProjectId) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const range = dateRange || {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };

    setLoading(true);
    await centralizedData.prefetchAllData(selectedProjectId, range);
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
    selectedProjectId,
  };
}

/**
 * Direct access to centralized data service
 * Use this when you need programmatic access without React hooks
 */
export { centralizedData };
