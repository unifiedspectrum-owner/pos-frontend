/* Route permission configuration for middleware protection */

import { PermissionTypes } from "@shared/types/validation";

export interface RoutePermission {
  module: string;
  permission: PermissionTypes;
  exact?: boolean; /* Exact path match, default: false */
}

/* Route permission mapping for protected admin routes */
export const PROTECTED_ROUTES: Record<string, RoutePermission> = {
  /* User Management Routes */
  '/admin/user-management': {
    module: 'user-management',
    permission: 'READ'
  },
  '/admin/user-management/create': {
    module: 'user-management',
    permission: 'CREATE'
  },
  '/admin/user-management/edit': {
    module: 'user-management',
    permission: 'UPDATE'
  },
  '/admin/user-management/view': {
    module: 'user-management',
    permission: 'READ'
  },

  /* Role Management Routes */
  '/admin/role-management': {
    module: 'role-management',
    permission: 'READ'
  },
  '/admin/role-management/create': {
    module: 'role-management',
    permission: 'CREATE'
  },
  '/admin/role-management/edit': {
    module: 'role-management',
    permission: 'UPDATE'
  },
  '/admin/role-management/view': {
    module: 'role-management',
    permission: 'READ'
  },

  /* Plan Management Routes */
  '/admin/plan-management': {
    module: 'plan-management',
    permission: 'READ'
  },
  '/admin/plan-management/create': {
    module: 'plan-management',
    permission: 'CREATE'
  },
  '/admin/plan-management/edit': {
    module: 'plan-management',
    permission: 'UPDATE'
  },
  '/admin/plan-management/view': {
    module: 'plan-management',
    permission: 'READ'
  },

  /* Tenant Management Routes */
  '/admin/tenant-management': {
    module: 'tenant-management',
    permission: 'READ'
  },
  '/admin/tenant-management/create': {
    module: 'tenant-management',
    permission: 'CREATE'
  },
  '/admin/tenant-management/edit': {
    module: 'tenant-management',
    permission: 'UPDATE'
  },
  '/admin/tenant-management/view': {
    module: 'tenant-management',
    permission: 'READ'
  }
};

/* Get permission requirement for a given path */
export function getRoutePermission(pathname: string): RoutePermission | null {
  /* Remove locale prefix (e.g., /en, /es, /zh) */
  const cleanPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');

  /* Check for exact matches first */
  if (PROTECTED_ROUTES[cleanPath]) {
    return PROTECTED_ROUTES[cleanPath];
  }

  /* Check for partial matches (e.g., /admin/user-management/edit/123) */
  for (const [route, permission] of Object.entries(PROTECTED_ROUTES)) {
    if (cleanPath.startsWith(route + '/') || cleanPath === route) {
      return permission;
    }
  }

  return null;
}

/* Check if a route requires protection */
export function isProtectedRoute(pathname: string): boolean {
  return getRoutePermission(pathname) !== null;
}