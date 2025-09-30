/* Routing constants for authentication module */

/* Authentication Module Name */
export const AUTH_MODULE_NAME = 'auth-management';

/* Authentication API endpoints */
export const AUTH_API_ROUTES = {
  LOGIN: '/login',
  VERIFY_2FA: '/2fa/verify',
  GENERATE_2FA: '/2fa/generate',
  ENABLE_2FA: '/2fa/enable',
  DISABLE_2FA: '/2fa/disable',
  LOGOUT: '/logout',
  REFRESH: '/refresh',
  FORGOT_PASSWORD: '/password/forgot',
  RESET_PASSWORD: '/password/reset',
  VALIDATE_TOKEN: '/password/token/validate'
} as const;

/* Authentication page routes */
export const AUTH_PAGE_ROUTES = {
  ADMIN_HOME: '/admin/user-management',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_2FA: '/auth/verify-2fa',
} as const;