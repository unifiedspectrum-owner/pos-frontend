/* Routing constants for plan management module */

/* Plan Module Name */
export const PLAN_MODULE_NAME = 'plan-management';

/* Plan API endpoints */
export const PLAN_API_ROUTES = {
  BASE_URL: '/plans',
  PLAN: {
    CREATE: '',
    LIST: '',
    DETAILS: '/:id',
    UPDATE: '/:id',
    DELETE: '/:id',
  },
  FEATURE: {
    CREATE: '/features',
    LIST: '/features',
  },
  ADD_ON: {
    CREATE: '/add-ons',
    LIST: '/add-ons',
  },
  SLA: {
    CREATE: '/sla',
    LIST: '/sla',
  },
} as const;

/* Plan management page routes */
export const PLAN_PAGE_ROUTES = {
  HOME: '/admin/plan-management',
  CREATE: '/admin/plan-management/create',
  EDIT: '/admin/plan-management/edit/:id',
  VIEW: '/admin/plan-management/view/:id',
} as const;
