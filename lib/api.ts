// Export all services for easy access
export { authService } from "./services/auth";
export { projectService } from "./services/project";
export { analyticsService } from "./services/analytics";
export { experimentService } from "./services/experiment";
export { userService } from "./services/user";

// Export token management
export { setAuthToken, getAuthToken } from "./services/base";

// Export all types
export * from "./types";

// Export analytics helper functions
export {
  getMetricValue,
  getDAUValue,
  getWAUValue,
  getMAUValue,
  getPageViewsValue,
  getTotalEventsValue,
  getUniqueUsersValue,
  getTopEventsValue,
  getConversionRate,
  getTotalSessionsValue,
} from "./services/analytics";

// Simple backward compatibility
import { authService } from "./services/auth";
import { projectService } from "./services/project";
import { analyticsService } from "./services/analytics";
import { experimentService } from "./services/experiment";
import { userService } from "./services/user";

export const apiClient = {
  // Set project ID globally
  setProjectId: (projectId: string) => {
    projectService.setProjectId(projectId);
    analyticsService.setProjectId(projectId);
    experimentService.setProjectId(projectId);
    userService.setProjectId(projectId);
  },

  // Auth methods (no auth required)
  login: authService.login.bind(authService),
  signup: authService.signup.bind(authService),

  // Project methods
  getProjects: projectService.getProjects.bind(projectService),
  createProject: projectService.createProject.bind(projectService),
  updateProject: projectService.updateProject.bind(projectService),
  deleteProject: projectService.deleteProject.bind(projectService),
  getProject: projectService.getProject.bind(projectService),

  // API Keys
  createApiKeys: projectService.createApiKeys.bind(projectService),
  getApiKeys: projectService.getApiKeys.bind(projectService),
  deleteApiKey: projectService.deleteApiKey.bind(projectService),
  updateApiKey: projectService.updateApiKey.bind(projectService),

  // Analytics
  getAnalytics: analyticsService.getAnalytics.bind(analyticsService),
  getAnalyticsGlobal:
    analyticsService.getAnalyticsGlobal.bind(analyticsService),
  getDashboard: analyticsService.getDashboard.bind(analyticsService),
  getUserMetrics: analyticsService.getUserMetrics.bind(analyticsService),
  getSessions: analyticsService.getSessions.bind(analyticsService),
  getSession: analyticsService.getSession.bind(analyticsService),
  getSessionsOverview:
    analyticsService.getSessionsOverview.bind(analyticsService),
  getEvents: analyticsService.getEvents.bind(analyticsService),

  // Experiments (A/B Testing)
  getExperiments: experimentService.getExperiments.bind(experimentService),
  createExperiment: experimentService.createExperiment.bind(experimentService),
  updateExperiment: experimentService.updateExperiment.bind(experimentService),
  updateExperimentStatus:
    experimentService.updateExperimentStatus.bind(experimentService),
  getExperimentResults:
    experimentService.getExperimentResults.bind(experimentService),

  // Heatmaps
  getHeatmaps: experimentService.getHeatmaps.bind(experimentService),
  getHeatmapPages: experimentService.getHeatmapPages.bind(experimentService),

  // Users
  getUsers: userService.getUsers.bind(userService),
  getUser: userService.getUser.bind(userService),

  // Health check
  healthCheck: authService.healthCheck.bind(authService),
};

export function setApiProjectId(projectId: string) {
  apiClient.setProjectId(projectId);
}
