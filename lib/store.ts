import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  apiClient,
  setAuthToken,
  Project,
  ApiKey,
  AnalyticsData,
  EventData,
  HeatmapData,
  HeatmapPage,
  Experiment,
  ExperimentResults,
  CreateExperimentRequest,
  Session,
  User,
  UserProfile,
  UserListResponse,
  SessionsOverview,
} from "./api";
import { centralizedData } from "./services/centralized-data";

// Cache configuration
const CACHE_TTL = {
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
  SESSIONS: 2 * 60 * 1000, // 2 minutes
  USERS: 5 * 60 * 1000, // 5 minutes
  EVENTS: 1 * 60 * 1000, // 1 minute
  EXPERIMENTS: 5 * 60 * 1000, // 5 minutes
  HEATMAPS: 10 * 60 * 1000, // 10 minutes
  ENHANCED_ANALYTICS: 5 * 60 * 1000, // 5 minutes
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface EnhancedAnalyticsCache {
  churnRisk?: CacheEntry<any>;
  featureAdoption?: CacheEntry<any>;
  sessionAnalytics?: CacheEntry<any>;
  locationData?: CacheEntry<any>;
  deviceData?: CacheEntry<any>;
  cohortData?: CacheEntry<any>;
  funnelData?: CacheEntry<any>;
}

interface AppState {
  apiClient: typeof apiClient;
  // Auth
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;

  // Projects
  projects: Project[];
  selectedProjectId: string | null;
  projectsLoaded: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  setSelectedProjectId: (projectId: string | null) => void;

  // API Keys
  apiKeys: Record<string, ApiKey[]>;
  loadingApiKeys: Record<string, boolean>;
  fetchApiKeys: (projectId: string) => Promise<void>;
  createApiKey: (
    projectId: string,
    name: string,
    permissions: string[]
  ) => Promise<ApiKey>;
  deleteApiKey: (projectId: string, keyId: string) => Promise<void>;
  updateApiKey: (
    projectId: string,
    keyId: string,
    updates: Partial<ApiKey>
  ) => Promise<void>;

  // Analytics with cache
  analyticsData: AnalyticsData | null;
  analyticsCache: Record<string, CacheEntry<AnalyticsData>>;
  loadingAnalytics: boolean;
  events: EventData[];
  eventsCache: CacheEntry<EventData[]> | null;
  loadingEvents: boolean;
  fetchAnalytics: (
    params: {
      startDate: string;
      endDate: string;
      groupBy?: string;
    },
    forceRefresh?: boolean
  ) => Promise<void>;
  fetchEvents: (forceRefresh?: boolean) => Promise<void>;

  // Enhanced Analytics Cache
  enhancedAnalyticsCache: EnhancedAnalyticsCache;
  getCachedEnhancedData: <T>(key: keyof EnhancedAnalyticsCache) => T | null;
  setCachedEnhancedData: <T>(
    key: keyof EnhancedAnalyticsCache,
    data: T
  ) => void;
  clearEnhancedCache: (key?: keyof EnhancedAnalyticsCache) => void;

  // Global Cache Management
  clearAllCaches: () => void;
  invalidateProjectCache: (projectId: string) => void;

  // Heatmaps with cache
  heatmapPages: HeatmapPage[];
  heatmapPagesCache: CacheEntry<HeatmapPage[]> | null;
  loadingHeatmapPages: boolean;
  heatmapData: HeatmapData | null;
  heatmapDataCache: Record<string, CacheEntry<HeatmapData>>;
  loadingHeatmapData: boolean;
  fetchHeatmapPages: (forceRefresh?: boolean) => Promise<void>;
  fetchHeatmapData: (
    params: {
      url: string;
      type: "click" | "scroll" | "move";
    },
    forceRefresh?: boolean
  ) => Promise<void>;

  // A/B Testing with cache
  experiments: Experiment[];
  experimentsCache: CacheEntry<Experiment[]> | null;
  loadingExperiments: boolean;
  selectedExperimentId: string | null;
  experimentResults: ExperimentResults | null;
  experimentResultsCache: Record<string, CacheEntry<ExperimentResults>>;
  loadingExperimentResults: boolean;
  fetchExperiments: (forceRefresh?: boolean) => Promise<void>;
  fetchExperimentResults: (
    experimentId: string,
    forceRefresh?: boolean
  ) => Promise<void>;
  createExperiment: (experiment: CreateExperimentRequest) => Promise<void>;
  setSelectedExperimentId: (experimentId: string | null) => void;
  updateExperimentStatus: (
    experimentId: string,
    status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED" | "ARCHIVED"
  ) => Promise<void>;

  // Sessions & Users with cache
  sessions: Session[];
  sessionsCache: CacheEntry<Session[]> | null;
  users: User[];
  usersCache: CacheEntry<User[]> | null;
  sessionsOverview: SessionsOverview | null;
  sessionsOverviewCache: CacheEntry<SessionsOverview> | null;
  selectedSession: Session | null;
  selectedUser: User | null;
  loadingSessions: boolean;
  loadingUsers: boolean;
  loadingSessionsOverview: boolean;

  fetchSessions: (forceRefresh?: boolean) => Promise<void>;
  fetchUsers: (forceRefresh?: boolean) => Promise<void>;
  fetchSessionsOverview: (forceRefresh?: boolean) => Promise<void>;
  selectSession: (session: Session | null) => Promise<void>;
  selectUser: (user: User | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiClient: apiClient,
      // Auth state
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setToken: (token, refreshToken) => {
        console.log("Zustand: Setting token", token);
        setAuthToken(token);
        set({
          token,
          refreshToken:
            refreshToken !== undefined ? refreshToken : get().refreshToken,
          isAuthenticated: !!token,
        });
      },
      refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) {
          console.log("No refresh token available");
          return false;
        }

        try {
          const { authService } = await import("./api");
          const response = await authService.refreshToken(currentRefreshToken);

          // Update tokens
          get().setToken(response.accessToken, response.refreshToken);
          console.log("Access token refreshed successfully");
          return true;
        } catch (error) {
          console.error("Failed to refresh access token:", error);
          // Clear tokens and redirect to login
          get().logout();
          return false;
        }
      },
      logout: () => {
        // Clear all caches on logout
        set({
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          projects: [],
          selectedProjectId: null,
          projectsLoaded: false,
          // Clear all caches
          analyticsCache: {},
          eventsCache: null,
          experimentsCache: null,
          experimentResultsCache: {},
          sessionsCache: null,
          usersCache: null,
          sessionsOverviewCache: null,
          heatmapPagesCache: null,
          heatmapDataCache: {},
          enhancedAnalyticsCache: {},
        });
        setAuthToken(null);
        console.log("🗑️ Cleared all caches on logout");
      },

      // Projects state
      projects: [],
      selectedProjectId: null,
      projectsLoaded: false,

      // API Keys state
      apiKeys: {},
      loadingApiKeys: {},
      fetchProjects: async () => {
        if (!get().isAuthenticated) return;
        console.log("Zustand: Fetching projects...");
        try {
          const projects = await apiClient.getProjects();
          console.log("Zustand: Projects fetched", projects);
          set({ projects, projectsLoaded: true });
          if (projects?.length > 0 && !get().selectedProjectId) {
            get().setSelectedProjectId(projects[0].id);
          }
        } catch (error) {
          console.error("Zustand: Failed to fetch projects", error);
          set({ projectsLoaded: true });
        }
      },
      createProject: async (name, description) => {
        if (!get().isAuthenticated) throw new Error("Not authenticated");
        try {
          const project = await apiClient.createProject(name);
          const projectWithDescription = {
            ...project,
            description: description || "",
          };
          set((state) => ({
            projects: [...state.projects, projectWithDescription],
          }));

          // Automatically select the newly created project
          get().setSelectedProjectId(projectWithDescription.id);

          return projectWithDescription;
        } catch (error) {
          console.error("Zustand: Failed to create project", error);
          throw error;
        }
      },
      deleteProject: async (projectId) => {
        if (!get().isAuthenticated) throw new Error("Not authenticated");
        try {
          await apiClient.deleteProject(projectId);
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
            selectedProjectId:
              state.selectedProjectId === projectId
                ? null
                : state.selectedProjectId,
          }));
        } catch (error) {
          console.error("Zustand: Failed to delete project", error);
          throw error;
        }
      },
      setSelectedProjectId: (projectId) => {
        console.log("Zustand: Setting project ID", projectId);
        set({ selectedProjectId: projectId });
        if (projectId) {
          apiClient.setProjectId(projectId);

          // Prefetch all data for the selected project
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Default 30 days

          const dateRange = {
            start: startDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
          };

          console.log("🚀 Triggering prefetch for project", projectId);
          centralizedData
            .prefetchAllData(projectId, dateRange)
            .catch(console.error);
        }
      },

      // API Keys actions
      fetchApiKeys: async (projectId) => {
        if (!get().isAuthenticated) return;
        set((state) => ({
          loadingApiKeys: { ...state.loadingApiKeys, [projectId]: true },
        }));
        try {
          const keys = await apiClient.getApiKeys(projectId);
          set((state) => ({
            apiKeys: { ...state.apiKeys, [projectId]: keys },
            loadingApiKeys: { ...state.loadingApiKeys, [projectId]: false },
          }));
        } catch (error) {
          console.error("Zustand: Failed to fetch API keys", error);
          set((state) => ({
            apiKeys: { ...state.apiKeys, [projectId]: [] },
            loadingApiKeys: { ...state.loadingApiKeys, [projectId]: false },
          }));
        }
      },
      createApiKey: async (projectId, name, permissions) => {
        if (!get().isAuthenticated) throw new Error("Not authenticated");
        try {
          const newKey = await apiClient.createApiKeys(
            projectId,
            name,
            permissions
          );
          set((state) => ({
            apiKeys: {
              ...state.apiKeys,
              [projectId]: [...(state.apiKeys[projectId] || []), newKey],
            },
          }));
          return newKey;
        } catch (error) {
          console.error("Zustand: Failed to create API key", error);
          throw error;
        }
      },
      deleteApiKey: async (projectId, keyId) => {
        if (!get().isAuthenticated) throw new Error("Not authenticated");
        try {
          await apiClient.deleteApiKey(projectId, keyId);
          set((state) => ({
            apiKeys: {
              ...state.apiKeys,
              [projectId]: (state.apiKeys[projectId] || []).filter(
                (k) => k.id !== keyId
              ),
            },
          }));
        } catch (error) {
          console.error("Zustand: Failed to delete API key", error);
          throw error;
        }
      },
      updateApiKey: async (projectId, keyId, updates) => {
        if (!get().isAuthenticated) throw new Error("Not authenticated");
        try {
          const updatedKey = await apiClient.updateApiKey(
            projectId,
            keyId,
            updates
          );
          set((state) => ({
            apiKeys: {
              ...state.apiKeys,
              [projectId]: (state.apiKeys[projectId] || []).map((k) =>
                k.id === keyId ? updatedKey : k
              ),
            },
          }));
        } catch (error) {
          console.error("Zustand: Failed to update API key", error);
          throw error;
        }
      },

      // Analytics state with caching
      analyticsData: null,
      analyticsCache: {},
      loadingAnalytics: false,
      events: [],
      eventsCache: null,
      loadingEvents: false,
      enhancedAnalyticsCache: {},

      // Cache helper functions
      getCachedEnhancedData: <T>(
        key: keyof EnhancedAnalyticsCache
      ): T | null => {
        const cached = get().enhancedAnalyticsCache[key];
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > CACHE_TTL.ENHANCED_ANALYTICS) {
          // Cache expired
          return null;
        }

        console.log(`✅ Using cached ${key}`, {
          age: (now - cached.timestamp) / 1000 + "s",
        });
        return cached.data as T;
      },

      setCachedEnhancedData: <T>(
        key: keyof EnhancedAnalyticsCache,
        data: T
      ) => {
        set((state) => ({
          enhancedAnalyticsCache: {
            ...state.enhancedAnalyticsCache,
            [key]: {
              data,
              timestamp: Date.now(),
              key,
            },
          },
        }));
        console.log(`📦 Cached ${key}`);
      },

      clearEnhancedCache: (key?: keyof EnhancedAnalyticsCache) => {
        if (key) {
          set((state) => {
            const newCache = { ...state.enhancedAnalyticsCache };
            delete newCache[key];
            return { enhancedAnalyticsCache: newCache };
          });
          console.log(`🗑️ Cleared cache: ${key}`);
        } else {
          set({ enhancedAnalyticsCache: {} });
          console.log("🗑️ Cleared all enhanced analytics cache");
        }
      },

      fetchAnalytics: async (params, forceRefresh = false) => {
        const { selectedProjectId, isAuthenticated, analyticsCache } = get();
        if (!selectedProjectId || !isAuthenticated) {
          console.warn(
            "Cannot fetch analytics: no project or not authenticated"
          );
          return;
        }

        const cacheKey = `${selectedProjectId}_${params.startDate}_${
          params.endDate
        }_${params.groupBy || "none"}`;

        // Check cache unless force refresh
        if (!forceRefresh) {
          const cached = analyticsCache[cacheKey];
          if (cached && Date.now() - cached.timestamp < CACHE_TTL.ANALYTICS) {
            console.log("✅ Using cached analytics data", {
              age: (Date.now() - cached.timestamp) / 1000 + "s",
            });
            set({ analyticsData: cached.data });
            return;
          }
        }

        console.log("📡 Fetching fresh analytics with params:", params);
        set({ loadingAnalytics: true });
        try {
          apiClient.setProjectId(selectedProjectId);
          const data = await apiClient.getAnalyticsGlobal(params);
          console.log("✅ Fetched analytics data:", data);

          // Update cache
          set((state) => ({
            analyticsData: data,
            analyticsCache: {
              ...state.analyticsCache,
              [cacheKey]: {
                data,
                timestamp: Date.now(),
                key: cacheKey,
              },
            },
            loadingAnalytics: false,
          }));
        } catch (error) {
          console.error("❌ Failed to fetch analytics", error);
          set({ loadingAnalytics: false });
        }
      },

      fetchEvents: async (forceRefresh = false) => {
        const { selectedProjectId, eventsCache } = get();
        if (!selectedProjectId) return;

        // Check cache unless force refresh
        if (!forceRefresh && eventsCache) {
          if (Date.now() - eventsCache.timestamp < CACHE_TTL.EVENTS) {
            console.log("✅ Using cached events", {
              age: (Date.now() - eventsCache.timestamp) / 1000 + "s",
            });
            set({ events: eventsCache.data });
            return;
          }
        }

        console.log("📡 Fetching fresh events");
        set({ loadingEvents: true });
        try {
          const events = await apiClient.getEvents(selectedProjectId);
          set({
            events,
            eventsCache: {
              data: events,
              timestamp: Date.now(),
              key: selectedProjectId,
            },
            loadingEvents: false,
          });
          console.log("✅ Fetched and cached events");
        } catch (error) {
          console.error("❌ Failed to fetch events", error);
          set({ loadingEvents: false, events: [] });
        }
      },

      // Heatmaps state with caching
      heatmapPages: [],
      heatmapPagesCache: null,
      loadingHeatmapPages: false,
      heatmapData: null,
      heatmapDataCache: {},
      loadingHeatmapData: false,

      fetchHeatmapPages: async (forceRefresh = false) => {
        const { selectedProjectId, heatmapPagesCache } = get();
        if (!selectedProjectId) {
          set({ heatmapPages: [] });
          return;
        }

        // Check cache unless force refresh
        if (!forceRefresh && heatmapPagesCache) {
          if (Date.now() - heatmapPagesCache.timestamp < CACHE_TTL.HEATMAPS) {
            console.log("✅ Using cached heatmap pages", {
              age: (Date.now() - heatmapPagesCache.timestamp) / 1000 + "s",
            });
            set({ heatmapPages: heatmapPagesCache.data });
            return;
          }
        }

        console.log("📡 Fetching fresh heatmap pages");
        set({ loadingHeatmapPages: true });
        try {
          const pages = await apiClient.getHeatmapPages(selectedProjectId);
          set({
            heatmapPages: pages,
            heatmapPagesCache: {
              data: pages,
              timestamp: Date.now(),
              key: selectedProjectId,
            },
            loadingHeatmapPages: false,
          });
          console.log("✅ Fetched and cached heatmap pages");
        } catch (error) {
          console.error("❌ Failed to fetch heatmap pages", error);
          set({ loadingHeatmapPages: false, heatmapPages: [] });
        }
      },

      fetchHeatmapData: async (params, forceRefresh = false) => {
        const { selectedProjectId, heatmapDataCache } = get();
        if (!selectedProjectId) return;

        const cacheKey = `${selectedProjectId}_${params.url}_${params.type}`;

        // Check cache unless force refresh
        if (!forceRefresh) {
          const cached = heatmapDataCache[cacheKey];
          if (cached && Date.now() - cached.timestamp < CACHE_TTL.HEATMAPS) {
            console.log("✅ Using cached heatmap data", {
              age: (Date.now() - cached.timestamp) / 1000 + "s",
            });
            set({ heatmapData: cached.data });
            return;
          }
        }

        console.log("📡 Fetching fresh heatmap data");
        set({ loadingHeatmapData: true });
        try {
          const data = await apiClient.getHeatmaps(selectedProjectId, params);
          set((state) => ({
            heatmapData: data,
            heatmapDataCache: {
              ...state.heatmapDataCache,
              [cacheKey]: {
                data,
                timestamp: Date.now(),
                key: cacheKey,
              },
            },
            loadingHeatmapData: false,
          }));
          console.log("✅ Fetched and cached heatmap data");
        } catch (error) {
          console.error("❌ Failed to fetch heatmap data", error);
          set({ loadingHeatmapData: false });
        }
      },

      // A/B Testing state with caching
      experiments: [],
      experimentsCache: null,
      loadingExperiments: true,
      selectedExperimentId: null,
      experimentResults: null,
      experimentResultsCache: {},
      loadingExperimentResults: false,

      // Sessions & Users initial state with caching
      sessions: [],
      sessionsCache: null,
      users: [],
      usersCache: null,
      sessionsOverview: null,
      sessionsOverviewCache: null,
      selectedSession: null,
      selectedUser: null,
      loadingSessions: true,
      loadingUsers: true,
      loadingSessionsOverview: true,

      fetchExperiments: async (forceRefresh = false) => {
        const { selectedProjectId, experimentsCache } = get();
        if (!selectedProjectId) {
          set({ experiments: [] });
          return;
        }

        // Check cache unless force refresh
        if (!forceRefresh && experimentsCache) {
          if (Date.now() - experimentsCache.timestamp < CACHE_TTL.EXPERIMENTS) {
            console.log("✅ Using cached experiments", {
              age: (Date.now() - experimentsCache.timestamp) / 1000 + "s",
            });
            set({ experiments: experimentsCache.data });
            if (
              experimentsCache.data.length > 0 &&
              !get().selectedExperimentId
            ) {
              set({ selectedExperimentId: experimentsCache.data[0].id });
            }
            return;
          }
        }

        console.log("📡 Fetching fresh experiments");
        set({ loadingExperiments: true });
        try {
          const experiments = await apiClient.getExperiments(selectedProjectId);
          set({
            experiments,
            experimentsCache: {
              data: experiments,
              timestamp: Date.now(),
              key: selectedProjectId,
            },
            loadingExperiments: false,
          });
          if (experiments.length > 0 && !get().selectedExperimentId) {
            set({ selectedExperimentId: experiments[0].id });
          }
          console.log("✅ Fetched and cached experiments");
        } catch (error) {
          console.error("❌ Failed to fetch experiments", error);
          set({ loadingExperiments: false, experiments: [] });
        }
      },

      fetchExperimentResults: async (experimentId, forceRefresh = false) => {
        const { selectedProjectId, experimentResultsCache } = get();
        if (!selectedProjectId) return;

        const cacheKey = `${selectedProjectId}_${experimentId}`;

        // Check cache unless force refresh
        if (!forceRefresh) {
          const cached = experimentResultsCache[cacheKey];
          if (cached && Date.now() - cached.timestamp < CACHE_TTL.EXPERIMENTS) {
            console.log("✅ Using cached experiment results", {
              age: (Date.now() - cached.timestamp) / 1000 + "s",
            });
            set({ experimentResults: cached.data });
            return;
          }
        }

        console.log("📡 Fetching fresh experiment results");
        set({ loadingExperimentResults: true });
        try {
          const results = await apiClient.getExperimentResults(
            selectedProjectId,
            experimentId
          );
          set((state) => ({
            experimentResults: results,
            experimentResultsCache: {
              ...state.experimentResultsCache,
              [cacheKey]: {
                data: results,
                timestamp: Date.now(),
                key: cacheKey,
              },
            },
            loadingExperimentResults: false,
          }));
          console.log("✅ Fetched and cached experiment results");
        } catch (error) {
          console.error("❌ Failed to fetch experiment results", error);
          set({ loadingExperimentResults: false });
        }
      },
      createExperiment: async (experiment) => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) return;

        try {
          const newExperiment = await apiClient.createExperiment(
            selectedProjectId,
            experiment
          );
          set((state) => ({
            experiments: [...state.experiments, newExperiment],
          }));
        } catch (error) {
          console.error("Failed to create experiment", error);
        }
      },
      setSelectedExperimentId: (experimentId) => {
        set({ selectedExperimentId: experimentId });
      },
      updateExperimentStatus: async (experimentId, status) => {
        const { selectedProjectId, fetchExperiments, apiClient } = get();
        if (!selectedProjectId) return;
        try {
          await apiClient.updateExperiment(selectedProjectId, experimentId, {
            status,
          });
          await fetchExperiments();
        } catch (error) {
          console.error("Failed to update experiment status:", error);
        }
      },

      // Sessions & Users actions with caching
      fetchSessions: async (forceRefresh = false) => {
        const { selectedProjectId, apiClient, sessionsCache } = get();
        if (!selectedProjectId) return;

        // Check cache unless force refresh
        if (!forceRefresh && sessionsCache) {
          if (Date.now() - sessionsCache.timestamp < CACHE_TTL.SESSIONS) {
            console.log("✅ Using cached sessions", {
              age: (Date.now() - sessionsCache.timestamp) / 1000 + "s",
            });
            set({ sessions: sessionsCache.data });
            return;
          }
        }

        console.log("📡 Fetching fresh sessions");
        set({ loadingSessions: true });
        try {
          const sessions = await apiClient.getSessions(selectedProjectId);
          set({
            sessions,
            sessionsCache: {
              data: sessions,
              timestamp: Date.now(),
              key: selectedProjectId,
            },
            loadingSessions: false,
          });
          console.log("✅ Fetched and cached sessions");
        } catch (error) {
          console.error("❌ Failed to fetch sessions:", error);
          set({ loadingSessions: false });
        }
      },

      fetchUsers: async (forceRefresh = false) => {
        const { selectedProjectId, apiClient, usersCache } = get();
        if (!selectedProjectId) return;

        // Check cache unless force refresh
        if (!forceRefresh && usersCache) {
          if (Date.now() - usersCache.timestamp < CACHE_TTL.USERS) {
            console.log("✅ Using cached users", {
              age: (Date.now() - usersCache.timestamp) / 1000 + "s",
            });
            set({ users: usersCache.data });
            return;
          }
        }

        console.log("📡 Fetching fresh users");
        set({ loadingUsers: true });
        try {
          const response = await apiClient.getUsers(selectedProjectId);
          // Extract users array from UserListResponse
          const users = response.users?.map((profile: UserProfile) => ({
            id: profile.userId,
            email: undefined,
            firstSeen: profile.firstSeen,
            lastSeen: profile.lastSeen,
            totalSessions: profile.sessionCount,
            totalEvents: profile.totalEvents,
            avgSessionDuration: 0, // Not provided in UserProfile
            properties: profile.customProperties,
            projectId: selectedProjectId,
            createdAt: profile.firstSeen,
            updatedAt: profile.lastSeen,
          }));
          set({
            users,
            usersCache: {
              data: users,
              timestamp: Date.now(),
              key: selectedProjectId,
            },
            loadingUsers: false,
          });
          console.log("✅ Fetched and cached users");
        } catch (error) {
          console.error("❌ Failed to fetch users:", error);
          set({ loadingUsers: false });
        }
      },

      fetchSessionsOverview: async (forceRefresh = false) => {
        const { selectedProjectId, apiClient, sessionsOverviewCache } = get();
        if (!selectedProjectId) return;

        // Check cache unless force refresh
        if (!forceRefresh && sessionsOverviewCache) {
          if (
            Date.now() - sessionsOverviewCache.timestamp <
            CACHE_TTL.SESSIONS
          ) {
            console.log("✅ Using cached sessions overview", {
              age: (Date.now() - sessionsOverviewCache.timestamp) / 1000 + "s",
            });
            set({ sessionsOverview: sessionsOverviewCache.data });
            return;
          }
        }

        console.log("📡 Fetching fresh sessions overview");
        set({ loadingSessionsOverview: true });
        try {
          const overview = await apiClient.getSessionsOverview(
            selectedProjectId
          );
          set({
            sessionsOverview: overview,
            sessionsOverviewCache: {
              data: overview,
              timestamp: Date.now(),
              key: selectedProjectId,
            },
            loadingSessionsOverview: false,
          });
          console.log("✅ Fetched and cached sessions overview");
        } catch (error) {
          console.error("❌ Failed to fetch sessions overview:", error);
          set({ loadingSessionsOverview: false });
        }
      },
      selectSession: async (session) => {
        set({ selectedSession: session });
        if (session) {
          const { selectedProjectId, apiClient } = get();
          if (!selectedProjectId) return;
          console.log(session);
          try {
            const fullSession = await apiClient.getSession(
              selectedProjectId,
              session.id
            );
            set({ selectedSession: fullSession });
          } catch (error) {
            console.error("Failed to fetch session details:", error);
          }
        }
      },
      selectUser: (user) => {
        set({ selectedUser: user });
      },

      // Global cache management functions
      clearAllCaches: () => {
        set({
          analyticsCache: {},
          eventsCache: null,
          experimentsCache: null,
          experimentResultsCache: {},
          sessionsCache: null,
          usersCache: null,
          sessionsOverviewCache: null,
          heatmapPagesCache: null,
          heatmapDataCache: {},
          enhancedAnalyticsCache: {},
        });
        console.log("🗑️ Cleared all caches");
      },

      invalidateProjectCache: (projectId: string) => {
        const state = get();

        // Clear analytics cache for this project
        const newAnalyticsCache: typeof state.analyticsCache = {};
        Object.keys(state.analyticsCache).forEach((key) => {
          if (!key.startsWith(projectId)) {
            newAnalyticsCache[key] = state.analyticsCache[key];
          }
        });

        // Clear other project-specific caches
        set({
          analyticsCache: newAnalyticsCache,
          eventsCache:
            state.eventsCache?.key === projectId ? null : state.eventsCache,
          experimentsCache:
            state.experimentsCache?.key === projectId
              ? null
              : state.experimentsCache,
          sessionsCache:
            state.sessionsCache?.key === projectId ? null : state.sessionsCache,
          usersCache:
            state.usersCache?.key === projectId ? null : state.usersCache,
          sessionsOverviewCache:
            state.sessionsOverviewCache?.key === projectId
              ? null
              : state.sessionsOverviewCache,
          heatmapPagesCache:
            state.heatmapPagesCache?.key === projectId
              ? null
              : state.heatmapPagesCache,
        });

        console.log(`🗑️ Invalidated cache for project: ${projectId}`);
      },
    }),
    {
      name: "mentiq-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        selectedProjectId: state.selectedProjectId,
        selectedExperimentId: state.selectedExperimentId,
      }),
    }
  )
);
