/* Routing constants for dashboard module */

/* Dashboard Module Name */
export const DASHBOARD_MODULE_NAME = 'dashboard';

/* Dashboard API endpoints */
export const DASHBOARD_API_ROUTES = {
  BASE_URL: '/admin/dashboard',
  OVERVIEW: '/overview',
  CHARTS: '/charts',
  TABLES: '/tables',
  ANALYTICS: '/analytics',
} as const;

/* Dashboard page routes */
export const DASHBOARD_PAGE_ROUTES = {
  HOME: '/admin/dashboard',
} as const;
