/* Routing constants for tenant management module */

/* Tenant Module Name */
export const TENANT_MODULE_NAME = 'tenant-management';

/* Tenant API endpoints */
export const TENANT_API_ROUTES = {
  BASE_URL: '/tenants',
  LIST: '/list',
  PROVISION: {
    START: '/:id/provision'
  },
  LIST_WITH_BASIC_DETAILS: '/list/basic',
  DETAILS: '/details/:id',
  ACCOUNT: {
    CREATE: '/account/create',
    REQUEST_OTP: '/account/request-otp',
    VERIFY_OTP: '/account/verify-otp',
    STATUS: '/:id/status',
    ASSIGN_PLAN: '/:id/plan',
    GET_ASSIGNED_PLAN: '/:id/plan',
  },
  PAYMENT: {
    INITIATE: '/account/payment/initiate',
    STATUS: '/account/payment/status',
    COMPLETE: '/account/payment/complete',
  },
  ACTIONS: {
    SUSPEND: '/:id/suspend',
    ACTIVATE: '/:id/activate',
    HOLD: '/:id/hold',  
    DELETE: '/:id'
  }
} as const;

/* Tenant management page routes */
export const TENANT_PAGE_ROUTES = {
  HOME: '/admin/tenant-management',
  CREATE: '/admin/tenant-management/create',
  EDIT: '/admin/tenant-management/edit/:id',
  VIEW: '/admin/tenant-management/view/:id',
} as const;