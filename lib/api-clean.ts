// Export all services for easy access
export { authService } from "./services/auth";
export { projectService } from "./services/project";
export { analyticsService } from "./services/analytics";
export { experimentService } from "./services/experiment";
export { userService } from "./services/user";
export { stripeService } from "./services/stripe";
export { enhancedAnalyticsService } from "./services/enhanced-analytics";

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
import { stripeService } from "./services/stripe";
import { enhancedAnalyticsService } from "./services/enhanced-analytics";

export const apiClient = {
  // Set project ID globally
  setProjectId: (projectId: string) => {
    projectService.setProjectId(projectId);
    analyticsService.setProjectId(projectId);
    stripeService.setProjectId(projectId);
    enhancedAnalyticsService.setProjectId(projectId);
  },

  // Auth methods (no auth required)
  login: authService.login.bind(authService),
  signup: authService.signup.bind(authService),

  // Project methods
  getProjects: projectService.getProjects.bind(projectService),
  createProject: projectService.createProject.bind(projectService),
  getProject: projectService.getProject.bind(projectService),
  updateProject: projectService.updateProject.bind(projectService),
  deleteProject: projectService.deleteProject.bind(projectService),

  // API Keys
  createApiKeys: projectService.createApiKeys.bind(projectService),
  getApiKeys: projectService.getApiKeys.bind(projectService),
  deleteApiKey: projectService.deleteApiKey.bind(projectService),
  updateApiKey: projectService.updateApiKey.bind(projectService),

  // Analytics
  getAnalytics: analyticsService.getAnalytics.bind(analyticsService),
  getDashboard: analyticsService.getDashboard.bind(analyticsService),
  getUserMetrics: analyticsService.getUserMetrics.bind(analyticsService),
  getSessions: analyticsService.getSessions.bind(analyticsService),
  getSession: analyticsService.getSession.bind(analyticsService),
  getSessionsOverview:
    analyticsService.getSessionsOverview.bind(analyticsService),

  // Stripe Revenue Analytics
  syncStripeData: stripeService.syncStripeData.bind(stripeService),
  getRevenueMetrics: stripeService.getRevenueMetrics.bind(stripeService),
  getRevenueAnalytics: stripeService.getRevenueAnalytics.bind(stripeService),
  getCustomerAnalytics: stripeService.getCustomerAnalytics.bind(stripeService),
  updateStripeKey: stripeService.updateStripeKey.bind(stripeService),

  // Enhanced Analytics
  getLocationAnalytics: enhancedAnalyticsService.getLocationAnalytics.bind(
    enhancedAnalyticsService
  ),
  getDeviceAnalytics: enhancedAnalyticsService.getDeviceAnalytics.bind(
    enhancedAnalyticsService
  ),
  getRetentionCohorts: enhancedAnalyticsService.getRetentionCohorts.bind(
    enhancedAnalyticsService
  ),
  getFeatureAdoption: enhancedAnalyticsService.getFeatureAdoption.bind(
    enhancedAnalyticsService
  ),
  getChurnRisk: enhancedAnalyticsService.getChurnRisk.bind(
    enhancedAnalyticsService
  ),
  getConversionFunnel: enhancedAnalyticsService.getConversionFunnel.bind(
    enhancedAnalyticsService
  ),
  getSessionAnalytics: enhancedAnalyticsService.getSessionAnalytics.bind(
    enhancedAnalyticsService
  ),

  // Health check
  healthCheck: authService.healthCheck.bind(authService),
};

export function setApiProjectId(projectId: string) {
  apiClient.setProjectId(projectId);
}
