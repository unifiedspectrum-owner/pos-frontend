/* Frontend page routing constants for user management module */

/* User management page routes */
export const USER_PAGE_ROUTES = {
  /* Main user management pages */
  HOME: '/admin/user-management',
  LIST: '/admin/user-management',
  CREATE: '/admin/user-management/create',
  EDIT: '/admin/user-management/edit/:id',
  VIEW: '/admin/user-management/view/:id',
} as const

/* Role management page routes */
export const ROLE_PAGE_ROUTES = {
  /* Main role management pages */
  HOME: '/admin/role-management',
  LIST: '/admin/role-management',
  CREATE: '/admin/role-management/create',
  EDIT: '/admin/role-management/edit/:id',
  VIEW: '/admin/role-management/view/:id',
} as const

/* Authentication page routes */
export const AUTH_PAGE_ROUTES = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
} as const

/* Admin base routes */
export const ADMIN_PAGE_ROUTES = {
  DASHBOARD: '/admin',
  USER_MANAGEMENT: '/admin/user-management',
  ROLE_MANAGEMENT: '/admin/role-management',
  TENANT_MANAGEMENT: '/admin/tenant-management',
  PLAN_MANAGEMENT: '/admin/plan-management',
} as const