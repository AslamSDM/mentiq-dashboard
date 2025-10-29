import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  apiClient,
  ApiClient,
  Project,
  AnalyticsData,
  EventData,
  HeatmapData,
  HeatmapPage,
  Experiment,
  ExperimentResults,
  CreateExperimentRequest,
  Session,
  User,
  SessionsOverview,
} from "./api";

interface AppState {
  apiClient: ApiClient;
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
  setSelectedProjectId: (projectId: string | null) => void;

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
    status: "running" | "paused" | "completed"
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
        set({ token, isAuthenticated: !!token });
        if (token) {
          apiClient.setToken(token);
        }
      },
      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          projects: [],
          selectedProjectId: null,
          projectsLoaded: false,
        });
        apiClient.setToken("");
      },

      // Projects state
      projects: [],
      selectedProjectId: null,
      projectsLoaded: false,
      fetchProjects: async () => {
        if (get().projectsLoaded || !get().isAuthenticated) return;
        console.log("Zustand: Fetching projects...");
        try {
          const projects = await apiClient.getProjects();
          console.log("Zustand: Projects fetched", projects);
          set({ projects, projectsLoaded: true });
          if (projects.length > 0 && !get().selectedProjectId) {
            get().setSelectedProjectId(projects[0].id);
          }
        } catch (error) {
          console.error("Zustand: Failed to fetch projects", error);
        }
      },
      setSelectedProjectId: (projectId) => {
        console.log("Zustand: Setting project ID", projectId);
        set({ selectedProjectId: projectId });
        if (projectId) {
          apiClient.setProjectId(projectId);
        }
      },

      // Analytics state
      analyticsData: null,
      loadingAnalytics: false,
      events: [],
      loadingEvents: false,
      fetchAnalytics: async (params) => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) return;

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
          const users = response.users.map((profile) => ({
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
