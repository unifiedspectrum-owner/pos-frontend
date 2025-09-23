/* Routing constants for tenant management module */

/* Tenant Module Name */
export const TENANT_MODULE_NAME = 'tenant-management';

/* Tenant API endpoints */
export const TENANT_API_ROUTES = {
  LIST: '/list',
  DETAILS: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
  ACTIONS: {
    SUSPEND: '/:id/suspend',
    ACTIVATE: '/:id/activate',
    HOLD: '/:id/hold'
  }
} as const;

/* Tenant management page routes */
export const TENANT_PAGE_ROUTES = {
  HOME: '/admin/tenant-management',
  CREATE: '/admin/tenant-management/create',
  EDIT: '/admin/tenant-management/edit/:id',
  VIEW: '/admin/tenant-management/view/:id',
} as const;