/**
 * Custom hooks for accessing centralized cached data
 * Provides React-friendly interfaces to the centralized data service
 * 
 * IMPORTANT: These are standalone hooks that should be imported directly.
 * The useCentralizedData() wrapper is maintained for backward compatibility.
 */

import { useEffect, useState, useCallback } from "react";
import { centralizedData } from "@/lib/services/centralized-data";
import { useStore } from "@/lib/store";

// ==================== STANDALONE HOOKS ====================

/**
 * Hook to get effective project ID with proper reactivity
 */
export function useEffectiveProjectId() {
  return useStore((state) => state.getEffectiveProjectId());
}

/**
 * Get revenue metrics (cached)
 */
export function useRevenueMetrics() {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getRevenueMetrics(effectiveProjectId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId]);

  return { data, loading, error };
}

/**
 * Get revenue analytics (cached)
 */
export function useRevenueAnalytics(startDate: string, endDate: string) {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getRevenueAnalytics(effectiveProjectId, startDate, endDate)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId, startDate, endDate]);

  return { data, loading, error };
}

/**
 * Get location data (cached)
 */
export function useLocationData(startDate: string, endDate: string) {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getLocationData(effectiveProjectId, startDate, endDate)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId, startDate, endDate]);

  return { data, loading, error };
}

/**
 * Get device data (cached)
 */
export function useDeviceData(startDate: string, endDate: string) {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getDeviceData(effectiveProjectId, startDate, endDate)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId, startDate, endDate]);

  return { data, loading, error };
}

/**
 * Get retention data (cached)
 */
export function useRetentionData(startDate?: string, endDate?: string) {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getRetentionData(effectiveProjectId, startDate, endDate)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId, startDate, endDate]);

  return { data, loading, error };
}

/**
 * Get feature adoption (cached)
 */
export function useFeatureAdoption(startDate?: string, endDate?: string) {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getFeatureAdoption(effectiveProjectId, startDate, endDate)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId, startDate, endDate]);

  return { data, loading, error };
}

/**
 * Get churn risk (cached)
 */
export function useChurnRisk(threshold = 50) {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getChurnRisk(effectiveProjectId, threshold)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId, threshold]);

  return { data, loading, error };
}

/**
 * Get session analytics (cached)
 */
export function useSessionAnalytics(startDate?: string, endDate?: string) {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getSessionAnalytics(effectiveProjectId, startDate, endDate)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId, startDate, endDate]);

  return { data, loading, error };
}

/**
 * Get sessions (cached)
 */
export function useSessions() {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getSessions(effectiveProjectId)
      .then((result) => {
        if (!cancelled) setData(result || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId]);

  return { data, loading, error };
}

/**
 * Get users (cached)
 */
export function useUsers() {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getUsers(effectiveProjectId)
      .then((result) => {
        if (!cancelled) setData(result || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId]);

  return { data, loading, error };
}

/**
 * Get experiments (cached)
 */
export function useExperiments() {
  const effectiveProjectId = useEffectiveProjectId();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!effectiveProjectId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    centralizedData
      .getExperiments(effectiveProjectId)
      .then((result) => {
        if (!cancelled) setData(result || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId]);

  return { data, loading, error };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Trigger prefetch manually
 */
export function usePrefetchData() {
  const effectiveProjectId = useEffectiveProjectId();
  const [loading, setLoading] = useState(false);

  const prefetch = useCallback(
    async (dateRange?: { start: string; end: string }) => {
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
    },
    [effectiveProjectId]
  );

  return { prefetch, loading };
}

/**
 * Clear cache utility
 */
export function useClearCache() {
  return useCallback((projectId?: string) => {
    if (projectId) {
      centralizedData.clearProjectCache(projectId);
    } else {
      centralizedData.clearAllCache();
    }
  }, []);
}

/**
 * Get cache stats
 */
export function useGetCacheStats() {
  return useCallback(() => {
    return centralizedData.getCacheStats();
  }, []);
}

// ==================== BACKWARD COMPATIBILITY WRAPPER ====================

/**
 * @deprecated Use individual hooks directly for better performance.
 * This wrapper is maintained for backward compatibility only.
 * 
 * Instead of:
 *   const { useRevenueMetrics } = useCentralizedData();
 *   const { data } = useRevenueMetrics();
 * 
 * Use:
 *   import { useRevenueMetrics } from "@/hooks/use-centralized-data";
 *   const { data } = useRevenueMetrics();
 */
export function useCentralizedData() {
  const effectiveProjectId = useEffectiveProjectId();
  const { prefetch, loading } = usePrefetchData();
  const clearCache = useClearCache();
  const getCacheStats = useGetCacheStats();

  return {
    // Individual hooks - consumers should call these
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
    prefetchData: prefetch,
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
