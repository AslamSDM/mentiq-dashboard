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
import {
  playbooksService,
  Playbook,
  PlaybooksSummary,
  CreatePlaybookRequest,
} from "./services/playbooks";

// Cache configuration
const CACHE_TTL = {
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
  SESSIONS: 2 * 60 * 1000, // 2 minutes
  USERS: 5 * 60 * 1000, // 5 minutes
  EVENTS: 1 * 60 * 1000, // 1 minute
  EXPERIMENTS: 5 * 60 * 1000, // 5 minutes
  HEATMAPS: 10 * 60 * 1000, // 10 minutes
  ENHANCED_ANALYTICS: 5 * 60 * 1000, // 5 minutes
  PLAYBOOKS: 5 * 60 * 1000, // 5 minutes
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

  // Admin Impersonation
  impersonatedProjectId: string | null;
  impersonatedProjectName: string | null;
  impersonatedUserEmail: string | null;
  setImpersonatedProject: (
    projectId: string | null,
    projectName?: string | null,
    userEmail?: string | null
  ) => void;
  clearImpersonation: () => void;
  getEffectiveProjectId: () => string | null;

  // Projects
  projects: Project[];
  selectedProjectId: string | null;
  projectsLoaded: boolean;
  fetchProjects: (retryCount?: number) => Promise<void>;
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

  // Playbooks
  playbooks: Playbook[];
  playbooksCache: CacheEntry<Playbook[]> | null;
  playbooksSummary: PlaybooksSummary | null;
  playbooksSummaryCache: CacheEntry<PlaybooksSummary> | null;
  loadingPlaybooks: boolean;
  fetchPlaybooks: (forceRefresh?: boolean) => Promise<void>;
  fetchPlaybooksSummary: (forceRefresh?: boolean) => Promise<void>;
  createPlaybook: (data: CreatePlaybookRequest) => Promise<Playbook>;
  updatePlaybookStatus: (
    playbookId: string,
    status: "draft" | "active" | "paused" | "archived"
  ) => Promise<Playbook>;
  deletePlaybook: (playbookId: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiClient: apiClient,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setToken: (token, refreshToken) => {
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
          return false;
        }

        try {
          const { authService } = await import("./api");
          const response = await authService.refreshToken(currentRefreshToken);
          get().setToken(response.accessToken, response.refreshToken);
          return true;
        } catch {
          get().logout();
          return false;
        }
      },
      logout: () => {
        set({
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          projects: [],
          selectedProjectId: null,
          projectsLoaded: false,
          // Clear impersonation
          impersonatedProjectId: null,
          impersonatedProjectName: null,
          impersonatedUserEmail: null,
          // Clear all data
          analyticsData: null,
          events: [],
          heatmapPages: [],
          heatmapData: null,
          experiments: [],
          experimentResults: null,
          selectedExperimentId: null,
          sessions: [],
          users: [],
          sessionsOverview: null,
          selectedSession: null,
          selectedUser: null,
          apiKeys: {},
          // Clear playbooks
          playbooks: [],
          playbooksCache: null,
          playbooksSummary: null,
          playbooksSummaryCache: null,
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
          loadingApiKeys: {},
        });
        setAuthToken(null);
        centralizedData.clearAllCache();
        if (typeof window !== "undefined") {
          localStorage.removeItem("selectedProjectId");
          localStorage.removeItem("impersonatedProjectId");
        }
      },

      impersonatedProjectId: null,
      impersonatedProjectName: null,
      impersonatedUserEmail: null,
      setImpersonatedProject: (
        projectId,
        projectName = null,
        userEmail = null
      ) => {
        set({
          impersonatedProjectId: projectId,
          impersonatedProjectName: projectName,
          impersonatedUserEmail: userEmail,
          analyticsCache: {},
          eventsCache: null,
          sessionsCache: null,
          usersCache: null,
          sessionsOverviewCache: null,
          heatmapPagesCache: null,
          heatmapDataCache: {},
          enhancedAnalyticsCache: {},
          playbooksCache: null,
          playbooksSummaryCache: null,
        });
        // Also clear centralized cache
        centralizedData.clearAllCache();
      },
      clearImpersonation: () => {
        set({
          impersonatedProjectId: null,
          impersonatedProjectName: null,
          impersonatedUserEmail: null,
          analyticsCache: {},
          eventsCache: null,
          sessionsCache: null,
          usersCache: null,
          sessionsOverviewCache: null,
          heatmapPagesCache: null,
          heatmapDataCache: {},
          enhancedAnalyticsCache: {},
          playbooksCache: null,
          playbooksSummaryCache: null,
        });
        centralizedData.clearAllCache();
      },
      getEffectiveProjectId: () => {
        const state = get();
        return state.impersonatedProjectId || state.selectedProjectId;
      },

      projects: [],
      selectedProjectId: null,
      projectsLoaded: false,
      apiKeys: {},
      loadingApiKeys: {},
      fetchProjects: async (retryCount?: number) => {
        const currentRetry = retryCount ?? 0;
        const { isAuthenticated, token } = get();

        if (!isAuthenticated || !token) {
          return;
        }

        try {
          const projects = await apiClient.getProjects();
          set({ projects, projectsLoaded: true });
        } catch {
          if (currentRetry < 3) {
            const delay = Math.pow(2, currentRetry) * 1000;
            setTimeout(() => get().fetchProjects(currentRetry + 1), delay);
          } else {
            set({ projectsLoaded: true });
          }
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
            projects: Array.isArray(state.projects)
              ? [...state.projects, projectWithDescription]
              : [projectWithDescription],
          }));

          // Automatically select the newly created project
          get().setSelectedProjectId(projectWithDescription.id);

          return projectWithDescription;
        } catch (error) {
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
          throw error;
        }
      },
      setSelectedProjectId: (projectId) => {
        if (projectId) {
          const projects = get().projects;
          const projectExists = projects.find((p) => p.id === projectId);
          if (!projectExists && projects.length > 0) {
            if (projects[0]) {
              projectId = projects[0].id;
            } else {
              return;
            }
          }
        }

        set({ selectedProjectId: projectId });
        if (projectId) {
          apiClient.setProjectId(projectId);

          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);

          const dateRange = {
            start: startDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
          };

          centralizedData
            .prefetchAllData(projectId, dateRange)
            .catch(() => {});
        }
      },

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
        } catch {
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
          throw error;
        }
      },

      analyticsData: null,
      analyticsCache: {},
      loadingAnalytics: false,
      events: [],
      eventsCache: null,
      loadingEvents: false,
      enhancedAnalyticsCache: {},

      getCachedEnhancedData: <T>(
        key: keyof EnhancedAnalyticsCache
      ): T | null => {
        const cached = get().enhancedAnalyticsCache[key];
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > CACHE_TTL.ENHANCED_ANALYTICS) {
          return null;
        }
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
      },

      clearEnhancedCache: (key?: keyof EnhancedAnalyticsCache) => {
        if (key) {
          set((state) => {
            const newCache = { ...state.enhancedAnalyticsCache };
            delete newCache[key];
            return { enhancedAnalyticsCache: newCache };
          });
        } else {
          set({ enhancedAnalyticsCache: {} });
        }
      },

      fetchAnalytics: async (params, forceRefresh = false) => {
        const { isAuthenticated, analyticsCache, getEffectiveProjectId } =
          get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId || !isAuthenticated) {
          return;
        }

        const cacheKey = `${effectiveProjectId}_${params.startDate}_${
          params.endDate
        }_${params.groupBy || "none"}`;

        if (!forceRefresh) {
          const cached = analyticsCache[cacheKey];
          if (cached && Date.now() - cached.timestamp < CACHE_TTL.ANALYTICS) {
            set({ analyticsData: cached.data });
            return;
          }
        }

        set({ loadingAnalytics: true });
        try {
          apiClient.setProjectId(effectiveProjectId);
          const data = await apiClient.getAnalyticsGlobal(params);

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
        } catch {
          set({ loadingAnalytics: false });
        }
      },

      fetchEvents: async (forceRefresh = false) => {
        const { eventsCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) return;

        if (
          !forceRefresh &&
          eventsCache &&
          eventsCache.key === effectiveProjectId
        ) {
          if (Date.now() - eventsCache.timestamp < CACHE_TTL.EVENTS) {
            set({ events: eventsCache.data });
            return;
          }
        }

        set({ loadingEvents: true });
        try {
          const events = await apiClient.getEvents(effectiveProjectId);
          set({
            events,
            eventsCache: {
              data: events,
              timestamp: Date.now(),
              key: effectiveProjectId,
            },
            loadingEvents: false,
          });
        } catch {
          set({ loadingEvents: false, events: [] });
        }
      },

      heatmapPages: [],
      heatmapPagesCache: null,
      loadingHeatmapPages: false,
      heatmapData: null,
      heatmapDataCache: {},
      loadingHeatmapData: false,

      fetchHeatmapPages: async (forceRefresh = false) => {
        const { heatmapPagesCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) {
          set({ heatmapPages: [] });
          return;
        }

        if (
          !forceRefresh &&
          heatmapPagesCache &&
          heatmapPagesCache.key === effectiveProjectId
        ) {
          if (Date.now() - heatmapPagesCache.timestamp < CACHE_TTL.HEATMAPS) {
            set({ heatmapPages: heatmapPagesCache.data });
            return;
          }
        }

        set({ loadingHeatmapPages: true });
        try {
          const pages = await apiClient.getHeatmapPages(effectiveProjectId);
          set({
            heatmapPages: pages,
            heatmapPagesCache: {
              data: pages,
              timestamp: Date.now(),
              key: effectiveProjectId,
            },
            loadingHeatmapPages: false,
          });
        } catch {
          set({ loadingHeatmapPages: false, heatmapPages: [] });
        }
      },

      fetchHeatmapData: async (params, forceRefresh = false) => {
        const { heatmapDataCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) return;

        const cacheKey = `${effectiveProjectId}_${params.url}_${params.type}`;

        if (!forceRefresh) {
          const cached = heatmapDataCache[cacheKey];
          if (cached && Date.now() - cached.timestamp < CACHE_TTL.HEATMAPS) {
            set({ heatmapData: cached.data });
            return;
          }
        }

        set({ loadingHeatmapData: true });
        try {
          const data = await apiClient.getHeatmaps(effectiveProjectId, params);
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
        } catch {
          set({ loadingHeatmapData: false });
        }
      },

      experiments: [],
      experimentsCache: null,
      loadingExperiments: true,
      selectedExperimentId: null,
      experimentResults: null,
      experimentResultsCache: {},
      loadingExperimentResults: false,

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
        const { experimentsCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) {
          set({ experiments: [] });
          return;
        }

        if (
          !forceRefresh &&
          experimentsCache &&
          experimentsCache.key === effectiveProjectId
        ) {
          if (Date.now() - experimentsCache.timestamp < CACHE_TTL.EXPERIMENTS) {
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

        set({ loadingExperiments: true });
        try {
          const experiments = await apiClient.getExperiments(
            effectiveProjectId
          );
          set({
            experiments,
            experimentsCache: {
              data: experiments,
              timestamp: Date.now(),
              key: effectiveProjectId,
            },
            loadingExperiments: false,
          });
          if (experiments.length > 0 && !get().selectedExperimentId) {
            set({ selectedExperimentId: experiments[0].id });
          }
        } catch {
          set({ loadingExperiments: false, experiments: [] });
        }
      },

      fetchExperimentResults: async (experimentId, forceRefresh = false) => {
        const { experimentResultsCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) return;

        const cacheKey = `${effectiveProjectId}_${experimentId}`;

        if (!forceRefresh) {
          const cached = experimentResultsCache[cacheKey];
          if (cached && Date.now() - cached.timestamp < CACHE_TTL.EXPERIMENTS) {
            set({ experimentResults: cached.data });
            return;
          }
        }

        set({ loadingExperimentResults: true });
        try {
          const results = await apiClient.getExperimentResults(
            effectiveProjectId,
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
        } catch {
          set({ loadingExperimentResults: false });
        }
      },
      createExperiment: async (experiment) => {
        const { getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) return;

        const newExperiment = await apiClient.createExperiment(
          effectiveProjectId,
          experiment
        );
        set((state) => ({
          experiments: [...state.experiments, newExperiment],
        }));
      },
      setSelectedExperimentId: (experimentId) => {
        set({ selectedExperimentId: experimentId });
      },
      updateExperimentStatus: async (experimentId, status) => {
        const { fetchExperiments, apiClient, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) return;
        await apiClient.updateExperiment(effectiveProjectId, experimentId, {
          status,
        });
        await fetchExperiments();
      },

      fetchSessions: async (forceRefresh = false) => {
        const { apiClient, sessionsCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) return;

        if (
          !forceRefresh &&
          sessionsCache &&
          sessionsCache.key === effectiveProjectId
        ) {
          if (Date.now() - sessionsCache.timestamp < CACHE_TTL.SESSIONS) {
            set({ sessions: sessionsCache.data });
            return;
          }
        }

        set({ loadingSessions: true });
        try {
          const sessions = await apiClient.getSessions(effectiveProjectId);
          set({
            sessions,
            sessionsCache: {
              data: sessions,
              timestamp: Date.now(),
              key: effectiveProjectId,
            },
            loadingSessions: false,
          });
        } catch {
          set({ loadingSessions: false });
        }
      },

      fetchUsers: async (forceRefresh = false) => {
        const { apiClient, usersCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) return;

        if (
          !forceRefresh &&
          usersCache &&
          usersCache.key === effectiveProjectId
        ) {
          if (Date.now() - usersCache.timestamp < CACHE_TTL.USERS) {
            set({ users: usersCache.data });
            return;
          }
        }

        set({ loadingUsers: true });
        try {
          const response = await apiClient.getUsers(effectiveProjectId);
          const users = response.users?.map((profile: UserProfile) => ({
            id: profile.userId,
            email: undefined,
            firstSeen: profile.firstSeen,
            lastSeen: profile.lastSeen,
            totalSessions: profile.sessionCount,
            totalEvents: profile.totalEvents,
            avgSessionDuration: 0,
            properties: profile.customProperties,
            projectId: effectiveProjectId,
            createdAt: profile.firstSeen,
            updatedAt: profile.lastSeen,
          }));
          set({
            users,
            usersCache: {
              data: users,
              timestamp: Date.now(),
              key: effectiveProjectId,
            },
            loadingUsers: false,
          });
        } catch {
          set({ loadingUsers: false });
        }
      },

      fetchSessionsOverview: async (forceRefresh = false) => {
        const { apiClient, sessionsOverviewCache, getEffectiveProjectId } =
          get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) return;

        if (
          !forceRefresh &&
          sessionsOverviewCache &&
          sessionsOverviewCache.key === effectiveProjectId
        ) {
          if (
            Date.now() - sessionsOverviewCache.timestamp <
            CACHE_TTL.SESSIONS
          ) {
            set({ sessionsOverview: sessionsOverviewCache.data });
            return;
          }
        }

        set({ loadingSessionsOverview: true });
        try {
          const overview = await apiClient.getSessionsOverview(
            effectiveProjectId
          );
          set({
            sessionsOverview: overview,
            sessionsOverviewCache: {
              data: overview,
              timestamp: Date.now(),
              key: effectiveProjectId,
            },
            loadingSessionsOverview: false,
          });
        } catch {
          set({ loadingSessionsOverview: false });
        }
      },
      selectSession: async (session) => {
        set({ selectedSession: session });
        if (session) {
          const { apiClient, getEffectiveProjectId } = get();
          const effectiveProjectId = getEffectiveProjectId();
          if (!effectiveProjectId) return;
          try {
            const fullSession = await apiClient.getSession(
              effectiveProjectId,
              session.id
            );
            set({ selectedSession: fullSession });
          } catch {
            // Silent fail
          }
        }
      },
      selectUser: (user) => {
        set({ selectedUser: user });
      },

      playbooks: [],
      playbooksCache: null,
      playbooksSummary: null,
      playbooksSummaryCache: null,
      loadingPlaybooks: false,

      fetchPlaybooks: async (forceRefresh = false) => {
        const { playbooksCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) {
          set({ playbooks: [] });
          return;
        }

        if (
          !forceRefresh &&
          playbooksCache &&
          playbooksCache.key === effectiveProjectId
        ) {
          if (Date.now() - playbooksCache.timestamp < CACHE_TTL.PLAYBOOKS) {
            set({ playbooks: playbooksCache.data });
            return;
          }
        }

        set({ loadingPlaybooks: true });
        try {
          const playbooks = await playbooksService.getPlaybooks(effectiveProjectId);
          set({
            playbooks,
            playbooksCache: {
              data: playbooks,
              timestamp: Date.now(),
              key: effectiveProjectId,
            },
            loadingPlaybooks: false,
          });
        } catch {
          set({ loadingPlaybooks: false, playbooks: [] });
        }
      },

      fetchPlaybooksSummary: async (forceRefresh = false) => {
        const { playbooksSummaryCache, getEffectiveProjectId } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) {
          set({ playbooksSummary: null });
          return;
        }

        if (
          !forceRefresh &&
          playbooksSummaryCache &&
          playbooksSummaryCache.key === effectiveProjectId
        ) {
          if (Date.now() - playbooksSummaryCache.timestamp < CACHE_TTL.PLAYBOOKS) {
            set({ playbooksSummary: playbooksSummaryCache.data });
            return;
          }
        }

        try {
          const summary = await playbooksService.getPlaybooksSummary(effectiveProjectId);
          set({
            playbooksSummary: summary,
            playbooksSummaryCache: {
              data: summary,
              timestamp: Date.now(),
              key: effectiveProjectId,
            },
          });
        } catch {
          // Silent fail
        }
      },

      createPlaybook: async (data) => {
        const { getEffectiveProjectId, fetchPlaybooks, fetchPlaybooksSummary } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) throw new Error("No project selected");

        const playbook = await playbooksService.createPlaybook(effectiveProjectId, data);
        // Refresh playbooks list
        await fetchPlaybooks(true);
        await fetchPlaybooksSummary(true);
        return playbook;
      },

      updatePlaybookStatus: async (playbookId, status) => {
        const { getEffectiveProjectId, fetchPlaybooks, fetchPlaybooksSummary } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) throw new Error("No project selected");

        const playbook = await playbooksService.updatePlaybookStatus(
          effectiveProjectId,
          playbookId,
          status
        );
        // Refresh playbooks list
        await fetchPlaybooks(true);
        await fetchPlaybooksSummary(true);
        return playbook;
      },

      deletePlaybook: async (playbookId) => {
        const { getEffectiveProjectId, fetchPlaybooks, fetchPlaybooksSummary } = get();
        const effectiveProjectId = getEffectiveProjectId();
        if (!effectiveProjectId) throw new Error("No project selected");

        await playbooksService.deletePlaybook(effectiveProjectId, playbookId);
        // Refresh playbooks list
        await fetchPlaybooks(true);
        await fetchPlaybooksSummary(true);
      },

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
          playbooksCache: null,
          playbooksSummaryCache: null,
        });
      },

      invalidateProjectCache: (projectId: string) => {
        const state = get();

        const newAnalyticsCache: typeof state.analyticsCache = {};
        Object.keys(state.analyticsCache).forEach((key) => {
          if (!key.startsWith(projectId)) {
            newAnalyticsCache[key] = state.analyticsCache[key];
          }
        });

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
      },
    }),
    {
      name: "mentiq-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      // Persist auth tokens and impersonation state
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // Persist impersonation state so it survives page refresh
        impersonatedProjectId: state.impersonatedProjectId,
        impersonatedProjectName: state.impersonatedProjectName,
        impersonatedUserEmail: state.impersonatedUserEmail,
      }),
    }
  )
);

// ==================== SELECTOR HOOKS ====================
// Use these for fine-grained subscriptions to prevent unnecessary re-renders

import { useShallow } from "zustand/react/shallow";

/**
 * Selector for auth-related state
 */
export const useAuthState = () =>
  useStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      token: state.token,
      logout: state.logout,
      refreshAccessToken: state.refreshAccessToken,
    }))
  );

/**
 * Selector for projects state
 */
export const useProjectsState = () =>
  useStore(
    useShallow((state) => ({
      projects: state.projects,
      selectedProjectId: state.selectedProjectId,
      projectsLoaded: state.projectsLoaded,
      setSelectedProjectId: state.setSelectedProjectId,
      fetchProjects: state.fetchProjects,
    }))
  );

/**
 * Selector for effective project ID only
 */
export const useEffectiveProjectId = () =>
  useStore((state) => state.getEffectiveProjectId());

/**
 * Selector for impersonation state (admin only)
 */
export const useImpersonationState = () =>
  useStore(
    useShallow((state) => ({
      impersonatedProjectId: state.impersonatedProjectId,
      impersonatedProjectName: state.impersonatedProjectName,
      impersonatedUserEmail: state.impersonatedUserEmail,
      setImpersonatedProject: state.setImpersonatedProject,
      clearImpersonation: state.clearImpersonation,
    }))
  );

/**
 * Selector for sessions state
 */
export const useSessionsState = () =>
  useStore(
    useShallow((state) => ({
      sessions: state.sessions,
      loadingSessions: state.loadingSessions,
      selectedSession: state.selectedSession,
      fetchSessions: state.fetchSessions,
      selectSession: state.selectSession,
    }))
  );

/**
 * Selector for users state
 */
export const useUsersState = () =>
  useStore(
    useShallow((state) => ({
      users: state.users,
      loadingUsers: state.loadingUsers,
      selectedUser: state.selectedUser,
      fetchUsers: state.fetchUsers,
      selectUser: state.selectUser,
    }))
  );

/**
 * Selector for experiments state
 */
export const useExperimentsState = () =>
  useStore(
    useShallow((state) => ({
      experiments: state.experiments,
      loadingExperiments: state.loadingExperiments,
      selectedExperimentId: state.selectedExperimentId,
      fetchExperiments: state.fetchExperiments,
      setSelectedExperimentId: state.setSelectedExperimentId,
    }))
  );

/**
 * Selector for playbooks state
 */
export const usePlaybooksState = () =>
  useStore(
    useShallow((state) => ({
      playbooks: state.playbooks,
      playbooksSummary: state.playbooksSummary,
      loadingPlaybooks: state.loadingPlaybooks,
      fetchPlaybooks: state.fetchPlaybooks,
      fetchPlaybooksSummary: state.fetchPlaybooksSummary,
      createPlaybook: state.createPlaybook,
      updatePlaybookStatus: state.updatePlaybookStatus,
      deletePlaybook: state.deletePlaybook,
    }))
  );
