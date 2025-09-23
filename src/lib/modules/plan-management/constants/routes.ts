/* Routing constants for plan management module */

/* Plan Module Name */
export const PLAN_MODULE_NAME = 'plan-management';

/* Plan API endpoints */
export const PLAN_API_ROUTES = {
  LIST: '/list',
  DETAILS: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
} as const;

/* Plan management page routes */
export const PLAN_PAGE_ROUTES = {
  HOME: '/admin/plan-management',
  CREATE: '/admin/plan-management/create',
  EDIT: '/admin/plan-management/edit/:id',
  VIEW: '/admin/plan-management/view/:id',
} as const;