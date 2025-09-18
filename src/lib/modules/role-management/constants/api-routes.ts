/* API routing constants for role management module */

/* Role API endpoints */
export const ROLE_API_ROUTES = {
  LIST: '/list',
  DETAILS: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
} as const

/* Module API endpoints */
export const MODULE_API_ROUTES = {
  LIST: '/modules/list',
} as const