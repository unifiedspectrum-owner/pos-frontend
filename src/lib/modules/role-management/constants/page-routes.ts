/* Page routing constants for role management module */

/* Role management page routes */
export const ROLE_PAGE_ROUTES = {
  HOME: '/admin/role-management',
  CREATE: '/admin/role-management/create',
  VIEW: '/admin/role-management/view/:id',
  EDIT: '/admin/role-management/edit/:id',
} as const