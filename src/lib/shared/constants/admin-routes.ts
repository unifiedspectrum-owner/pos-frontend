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
} as const;

/* Dashboard page routes */
export const DASHBOARD_PAGE_ROUTES = {
  HOME: `${ADMIN_BASE}/${MODULES.USER_MANAGEMENT}`,
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

/* All admin page routes combined */
export const ADMIN_PAGE_ROUTES = {
  DASHBOARD: DASHBOARD_PAGE_ROUTES,
  PLAN_MANAGEMENT: PLAN_MANAGEMENT_PAGE_ROUTES,
  TENANT_MANAGEMENT: TENANT_MANAGEMENT_PAGE_ROUTES,
  USER_MANAGEMENT: USER_MANAGEMENT_PAGE_ROUTES,
  ROLE_MANAGEMENT: ROLE_MANAGEMENT_PAGE_ROUTES,
} as const;