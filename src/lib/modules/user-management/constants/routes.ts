/* Routing constants for user management module */

/* User Module Name */
export const USER_MODULE_NAME = 'user-management';

/* API routing constants */

/* User API endpoints */
export const USER_API_ROUTES = {
  BASE_URL: '/users',
  LIST: '/list',
  DETAILS: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
  PERMISSIONS_SUMMARY: '/permissions/summary',
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