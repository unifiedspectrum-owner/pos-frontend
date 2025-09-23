/* Routing constants for user management module */

/* User Module Name */
export const USER_MODULE_NAME = 'user-management';

/* API routing constants */

/* User API endpoints */
export const USER_API_ROUTES = {
  LIST: '/list',
  DETAILS: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
  PERMISSIONS_SUMMARY: '/permissions/summary',
} as const

/* Authentication API endpoints */
export const AUTH_API_ROUTES = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/change-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_ACCOUNT: '/auth/verify',
} as const

/* Frontend page routing constants */

/* User management page routes */
export const USER_PAGE_ROUTES = {
  /* Main user management pages */
  HOME: '/admin/user-management',
  LIST: '/admin/user-management',
  CREATE: '/admin/user-management/create',
  EDIT: '/admin/user-management/edit/:id',
  VIEW: '/admin/user-management/view/:id',
} as const

/* Authentication page routes */
export const AUTH_PAGE_ROUTES = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
} as const