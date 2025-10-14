/* Admin page routes constants */

/* Base admin path */
const ADMIN_BASE = '/admin';

/* Module base paths */
const MODULES = {
  DASHBOARD: 'dashboard',
  PLAN_MANAGEMENT: 'plan-management',
  TENANT_MANAGEMENT: 'tenant-management',
  USER_MANAGEMENT: 'user-management',
  ROLE_MANAGEMENT: 'role-management',
  SUPPORT_TICKET_MANAGEMENT: 'support-ticket-management',
} as const;

/* Dashboard page routes */
export const DASHBOARD_PAGE_ROUTES = {
  HOME: `${ADMIN_BASE}/${MODULES.DASHBOARD}`,
  //HOME: `${ADMIN_BASE}/${MODULES.DASHBOARD}`,
  OVERVIEW: `${ADMIN_BASE}/${MODULES.DASHBOARD}/overview`,
} as const;

/* Plan Management page routes */
export const PLAN_MANAGEMENT_PAGE_ROUTES = {
  HOME: `${ADMIN_BASE}/${MODULES.PLAN_MANAGEMENT}`,
  CREATE: `${ADMIN_BASE}/${MODULES.PLAN_MANAGEMENT}/create`,
  EDIT: `${ADMIN_BASE}/${MODULES.PLAN_MANAGEMENT}/edit/:id`,
  VIEW: `${ADMIN_BASE}/${MODULES.PLAN_MANAGEMENT}/view/:id`,
} as const;

/* Tenant Management page routes */
export const TENANT_MANAGEMENT_PAGE_ROUTES = {
  HOME: `${ADMIN_BASE}/${MODULES.TENANT_MANAGEMENT}`,
  CREATE: `${ADMIN_BASE}/${MODULES.TENANT_MANAGEMENT}/create`,
  VIEW: `${ADMIN_BASE}/${MODULES.TENANT_MANAGEMENT}/view/:id`,
} as const;

/* User Management page routes */
export const USER_MANAGEMENT_PAGE_ROUTES = {
  HOME: `${ADMIN_BASE}/${MODULES.USER_MANAGEMENT}`,
  CREATE: `${ADMIN_BASE}/${MODULES.USER_MANAGEMENT}/create`,
  EDIT: `${ADMIN_BASE}/${MODULES.USER_MANAGEMENT}/edit/:id`,
  VIEW: `${ADMIN_BASE}/${MODULES.USER_MANAGEMENT}/view/:id`,
} as const;

/* Role Management page routes */
export const ROLE_MANAGEMENT_PAGE_ROUTES = {
  HOME: `${ADMIN_BASE}/${MODULES.ROLE_MANAGEMENT}`,
  CREATE: `${ADMIN_BASE}/${MODULES.ROLE_MANAGEMENT}/create`,
  EDIT: `${ADMIN_BASE}/${MODULES.ROLE_MANAGEMENT}/edit/:id`,
  VIEW: `${ADMIN_BASE}/${MODULES.ROLE_MANAGEMENT}/view/:id`,
} as const;

/* Role Management page routes */
export const SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES = {
  HOME: `${ADMIN_BASE}/${MODULES.SUPPORT_TICKET_MANAGEMENT}`,
  CREATE: `${ADMIN_BASE}/${MODULES.SUPPORT_TICKET_MANAGEMENT}/create`,
  EDIT: `${ADMIN_BASE}/${MODULES.SUPPORT_TICKET_MANAGEMENT}/edit/:id`,
  VIEW: `${ADMIN_BASE}/${MODULES.SUPPORT_TICKET_MANAGEMENT}/view/:id`,
} as const;


/* All admin page routes combined */
export const ADMIN_PAGE_ROUTES = {
  DASHBOARD: DASHBOARD_PAGE_ROUTES,
  PLAN_MANAGEMENT: PLAN_MANAGEMENT_PAGE_ROUTES,
  TENANT_MANAGEMENT: TENANT_MANAGEMENT_PAGE_ROUTES,
  USER_MANAGEMENT: USER_MANAGEMENT_PAGE_ROUTES,
  ROLE_MANAGEMENT: ROLE_MANAGEMENT_PAGE_ROUTES,
  SUPPORT_TICKET_MANAGEMENT_PAGE: SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES,
  /* User account and app routes */
  PROFILE: `${ADMIN_BASE}/profile`,
  SETTINGS: `${ADMIN_BASE}/settings`,
  NOTIFICATIONS: `${ADMIN_BASE}/notifications`,
} as const;