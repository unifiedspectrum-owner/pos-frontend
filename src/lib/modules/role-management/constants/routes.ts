/* Routing constants for role management module */

/* Role API endpoints */
export const ROLE_API_ROUTES = {
  LIST: '/list',
  DETAILS: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
  PERMISSIONS: '/permissions'
} as const

/* Module API endpoints */
export const MODULE_API_ROUTES = {
  LIST: '/modules/list',
} as const

/* Role management page routes */
export const ROLE_PAGE_ROUTES = {
  HOME: '/admin/role-management',
  CREATE: '/admin/role-management/create',
  VIEW: '/admin/role-management/view/:id',
  EDIT: '/admin/role-management/edit/:id',
} as const