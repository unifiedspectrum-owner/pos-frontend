/* API routing constants for user management module */

/* User API endpoints */
export const USER_API_ROUTES = {
  LIST: '/list',
  DETAILS: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
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