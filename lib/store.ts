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

interface AppState {
  apiClient: typeof apiClient;
  // Auth
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;

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

  // Analytics
  analyticsData: AnalyticsData | null;
  loadingAnalytics: boolean;
  events: EventData[];
  loadingEvents: boolean;
  fetchAnalytics: (params: {
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  fetchEvents: () => Promise<void>;

  // Heatmaps
  heatmapPages: HeatmapPage[];
  loadingHeatmapPages: boolean;
  heatmapData: HeatmapData | null;
  loadingHeatmapData: boolean;
  fetchHeatmapPages: () => Promise<void>;
  fetchHeatmapData: (params: {
    url: string;
    type: "click" | "scroll" | "move";
  }) => Promise<void>;

  // A/B Testing
  experiments: Experiment[];
  loadingExperiments: boolean;
  selectedExperimentId: string | null;
  experimentResults: ExperimentResults | null;
  loadingExperimentResults: boolean;
  fetchExperiments: () => Promise<void>;
  fetchExperimentResults: (experimentId: string) => Promise<void>;
  createExperiment: (experiment: CreateExperimentRequest) => Promise<void>;
  setSelectedExperimentId: (experimentId: string | null) => void;
  updateExperimentStatus: (
    experimentId: string,
    status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED" | "ARCHIVED"
  ) => Promise<void>;

  // Sessions & Users
  sessions: Session[];
  users: User[];
  sessionsOverview: SessionsOverview | null;
  selectedSession: Session | null;
  selectedUser: User | null;
  loadingSessions: boolean;
  loadingUsers: boolean;
  loadingSessionsOverview: boolean;

  fetchSessions: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchSessionsOverview: () => Promise<void>;
  selectSession: (session: Session | null) => void;
  selectUser: (user: User | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiClient: apiClient,
      // Auth state
      token: null,
      isAuthenticated: false,
      setToken: (token) => {
        console.log("Zustand: Setting token", token);
        setAuthToken(token);
        set({ token, isAuthenticated: !!token });
      },
      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          projects: [],
          selectedProjectId: null,
          projectsLoaded: false,
        });
        setAuthToken(null);
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

      // Analytics state
      analyticsData: null,
      loadingAnalytics: false,
      events: [],
      loadingEvents: false,
      fetchAnalytics: async (params) => {
        const { selectedProjectId, isAuthenticated } = get();
        if (!selectedProjectId || !isAuthenticated) {
          console.warn(
            "Cannot fetch analytics: no project or not authenticated"
          );
          return;
        }

        console.log("Fetching analytics with params:", params);
        set({ loadingAnalytics: true });
        try {
          apiClient.setProjectId(selectedProjectId);
          const data = await apiClient.getAnalyticsGlobal(params);
          console.log("Fetched analytics data:", data);
          set({ analyticsData: data, loadingAnalytics: false });
        } catch (error) {
          console.error("Failed to fetch analytics", error);
          set({ loadingAnalytics: false });
        }
      },
      fetchEvents: async () => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) return;
        set({ loadingEvents: true });
        try {
          const events = await apiClient.getEvents(selectedProjectId);
          set({ events, loadingEvents: false });
        } catch (error) {
          console.error("Failed to fetch events", error);
          set({ loadingEvents: false, events: [] });
        }
      },

      // Heatmaps state
      heatmapPages: [],
      loadingHeatmapPages: false,
      heatmapData: null,
      loadingHeatmapData: false,
      fetchHeatmapPages: async () => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) {
          set({ heatmapPages: [] });
          return;
        }
        set({ loadingHeatmapPages: true });
        try {
          const pages = await apiClient.getHeatmapPages(selectedProjectId);
          set({ heatmapPages: pages, loadingHeatmapPages: false });
        } catch (error) {
          console.error("Failed to fetch heatmap pages", error);
          set({ loadingHeatmapPages: false, heatmapPages: [] });
        }
      },
      fetchHeatmapData: async (params) => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) return;

        set({ loadingHeatmapData: true });
        try {
          const data = await apiClient.getHeatmaps(selectedProjectId, params);
          set({ heatmapData: data, loadingHeatmapData: false });
        } catch (error) {
          console.error("Failed to fetch heatmap data", error);
          set({ loadingHeatmapData: false });
        }
      },

      // A/B Testing state
      experiments: [],
      loadingExperiments: true,
      selectedExperimentId: null,
      experimentResults: null,
      loadingExperimentResults: false,
      // Sessions & Users initial state
      sessions: [],
      users: [],
      sessionsOverview: null,
      selectedSession: null,
      selectedUser: null,
      loadingSessions: true,
      loadingUsers: true,
      loadingSessionsOverview: true,

      fetchExperiments: async () => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) {
          set({ experiments: [] });
          return;
        }
        set({ loadingExperiments: true });
        try {
          const experiments = await apiClient.getExperiments(selectedProjectId);
          set({ experiments, loadingExperiments: false });
          if (experiments.length > 0 && !get().selectedExperimentId) {
            set({ selectedExperimentId: experiments[0].id });
          }
        } catch (error) {
          console.error("Failed to fetch experiments", error);
          set({ loadingExperiments: false, experiments: [] });
        }
      },
      fetchExperimentResults: async (experimentId) => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) return;

        set({ loadingExperimentResults: true });
        try {
          const results = await apiClient.getExperimentResults(
            selectedProjectId,
            experimentId
          );
          set({ experimentResults: results, loadingExperimentResults: false });
        } catch (error) {
          console.error("Failed to fetch experiment results", error);
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

      // Sessions & Users actions
      fetchSessions: async () => {
        const { selectedProjectId, apiClient } = get();
        if (!selectedProjectId) return;
        set({ loadingSessions: true });
        try {
          const sessions = await apiClient.getSessions(selectedProjectId);
          set({ sessions, loadingSessions: false });
        } catch (error) {
          console.error("Failed to fetch sessions:", error);
          set({ loadingSessions: false });
        }
      },
      fetchUsers: async () => {
        const { selectedProjectId, apiClient } = get();
        if (!selectedProjectId) return;
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
          set({ users, loadingUsers: false });
        } catch (error) {
          console.error("Failed to fetch users:", error);
          set({ loadingUsers: false });
        }
      },
      fetchSessionsOverview: async () => {
        const { selectedProjectId, apiClient } = get();
        if (!selectedProjectId) return;
        set({ loadingSessionsOverview: true });
        try {
          const overview = await apiClient.getSessionsOverview(
            selectedProjectId
          );
          set({ sessionsOverview: overview, loadingSessionsOverview: false });
        } catch (error) {
          console.error("Failed to fetch sessions overview:", error);
          set({ loadingSessionsOverview: false });
        }
      },
      selectSession: (session) => {
        set({ selectedSession: session });
      },
      selectUser: (user) => {
        set({ selectedUser: user });
      },
    }),
    {
      name: "mentiq-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        selectedProjectId: state.selectedProjectId,
        selectedExperimentId: state.selectedExperimentId,
      }),
    }
  )
);
