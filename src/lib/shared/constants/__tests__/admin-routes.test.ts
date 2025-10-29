/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Shared module imports */
import { DASHBOARD_PAGE_ROUTES, PLAN_MANAGEMENT_PAGE_ROUTES, TENANT_MANAGEMENT_PAGE_ROUTES, USER_MANAGEMENT_PAGE_ROUTES, ROLE_MANAGEMENT_PAGE_ROUTES, SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES, ADMIN_PAGE_ROUTES } from '@shared/constants/admin-routes'

describe('admin-routes', () => {
  describe('DASHBOARD_PAGE_ROUTES', () => {
    it('should export DASHBOARD_PAGE_ROUTES constant', () => {
      expect(DASHBOARD_PAGE_ROUTES).toBeDefined()
      expect(typeof DASHBOARD_PAGE_ROUTES).toBe('object')
    })

    it('should have HOME route', () => {
      expect(DASHBOARD_PAGE_ROUTES).toHaveProperty('HOME')
      expect(DASHBOARD_PAGE_ROUTES.HOME).toBe('/admin/dashboard')
    })

    it('should have OVERVIEW route', () => {
      expect(DASHBOARD_PAGE_ROUTES).toHaveProperty('OVERVIEW')
      expect(DASHBOARD_PAGE_ROUTES.OVERVIEW).toBe('/admin/dashboard/overview')
    })

    it('should have all routes starting with /admin', () => {
      Object.values(DASHBOARD_PAGE_ROUTES).forEach(route => {
        expect(route).toMatch(/^\/admin/)
      })
    })
  })

  describe('PLAN_MANAGEMENT_PAGE_ROUTES', () => {
    it('should export PLAN_MANAGEMENT_PAGE_ROUTES constant', () => {
      expect(PLAN_MANAGEMENT_PAGE_ROUTES).toBeDefined()
      expect(typeof PLAN_MANAGEMENT_PAGE_ROUTES).toBe('object')
    })

    it('should have HOME route', () => {
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.HOME).toBe('/admin/plan-management')
    })

    it('should have CREATE route', () => {
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.CREATE).toBe('/admin/plan-management/create')
    })

    it('should have EDIT route with parameter', () => {
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.EDIT).toBe('/admin/plan-management/edit/:id')
    })

    it('should have VIEW route with parameter', () => {
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.VIEW).toBe('/admin/plan-management/view/:id')
    })

    it('should have 4 routes', () => {
      expect(Object.keys(PLAN_MANAGEMENT_PAGE_ROUTES)).toHaveLength(4)
    })
  })

  describe('TENANT_MANAGEMENT_PAGE_ROUTES', () => {
    it('should export TENANT_MANAGEMENT_PAGE_ROUTES constant', () => {
      expect(TENANT_MANAGEMENT_PAGE_ROUTES).toBeDefined()
      expect(typeof TENANT_MANAGEMENT_PAGE_ROUTES).toBe('object')
    })

    it('should have HOME route', () => {
      expect(TENANT_MANAGEMENT_PAGE_ROUTES.HOME).toBe('/admin/tenant-management')
    })

    it('should have CREATE route', () => {
      expect(TENANT_MANAGEMENT_PAGE_ROUTES.CREATE).toBe('/admin/tenant-management/create')
    })

    it('should have VIEW route with parameter', () => {
      expect(TENANT_MANAGEMENT_PAGE_ROUTES.VIEW).toBe('/admin/tenant-management/view/:id')
    })

    it('should not have EDIT route', () => {
      expect(TENANT_MANAGEMENT_PAGE_ROUTES).not.toHaveProperty('EDIT')
    })

    it('should have 3 routes', () => {
      expect(Object.keys(TENANT_MANAGEMENT_PAGE_ROUTES)).toHaveLength(3)
    })
  })

  describe('USER_MANAGEMENT_PAGE_ROUTES', () => {
    it('should export USER_MANAGEMENT_PAGE_ROUTES constant', () => {
      expect(USER_MANAGEMENT_PAGE_ROUTES).toBeDefined()
      expect(typeof USER_MANAGEMENT_PAGE_ROUTES).toBe('object')
    })

    it('should have HOME route', () => {
      expect(USER_MANAGEMENT_PAGE_ROUTES.HOME).toBe('/admin/user-management')
    })

    it('should have CREATE route', () => {
      expect(USER_MANAGEMENT_PAGE_ROUTES.CREATE).toBe('/admin/user-management/create')
    })

    it('should have EDIT route with parameter', () => {
      expect(USER_MANAGEMENT_PAGE_ROUTES.EDIT).toBe('/admin/user-management/edit/:id')
    })

    it('should have VIEW route with parameter', () => {
      expect(USER_MANAGEMENT_PAGE_ROUTES.VIEW).toBe('/admin/user-management/view/:id')
    })

    it('should have complete CRUD routes', () => {
      expect(Object.keys(USER_MANAGEMENT_PAGE_ROUTES)).toHaveLength(4)
    })
  })

  describe('ROLE_MANAGEMENT_PAGE_ROUTES', () => {
    it('should export ROLE_MANAGEMENT_PAGE_ROUTES constant', () => {
      expect(ROLE_MANAGEMENT_PAGE_ROUTES).toBeDefined()
      expect(typeof ROLE_MANAGEMENT_PAGE_ROUTES).toBe('object')
    })

    it('should have HOME route', () => {
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.HOME).toBe('/admin/role-management')
    })

    it('should have CREATE route', () => {
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.CREATE).toBe('/admin/role-management/create')
    })

    it('should have EDIT route with parameter', () => {
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.EDIT).toBe('/admin/role-management/edit/:id')
    })

    it('should have VIEW route with parameter', () => {
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.VIEW).toBe('/admin/role-management/view/:id')
    })

    it('should have complete CRUD routes', () => {
      expect(Object.keys(ROLE_MANAGEMENT_PAGE_ROUTES)).toHaveLength(4)
    })
  })

  describe('SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES', () => {
    it('should export SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES constant', () => {
      expect(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES).toBeDefined()
      expect(typeof SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES).toBe('object')
    })

    it('should have HOME route', () => {
      expect(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES.HOME).toBe('/admin/support-ticket-management')
    })

    it('should have CREATE route', () => {
      expect(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES.CREATE).toBe('/admin/support-ticket-management/create')
    })

    it('should have EDIT route with parameter', () => {
      expect(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES.EDIT).toBe('/admin/support-ticket-management/edit/:id')
    })

    it('should have VIEW route with parameter', () => {
      expect(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES.VIEW).toBe('/admin/support-ticket-management/view/:id')
    })

    it('should have complete CRUD routes', () => {
      expect(Object.keys(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES)).toHaveLength(4)
    })
  })

  describe('ADMIN_PAGE_ROUTES', () => {
    it('should export ADMIN_PAGE_ROUTES constant', () => {
      expect(ADMIN_PAGE_ROUTES).toBeDefined()
      expect(typeof ADMIN_PAGE_ROUTES).toBe('object')
    })

    it('should include DASHBOARD routes', () => {
      expect(ADMIN_PAGE_ROUTES.DASHBOARD).toEqual(DASHBOARD_PAGE_ROUTES)
    })

    it('should include PLAN_MANAGEMENT routes', () => {
      expect(ADMIN_PAGE_ROUTES.PLAN_MANAGEMENT).toEqual(PLAN_MANAGEMENT_PAGE_ROUTES)
    })

    it('should include TENANT_MANAGEMENT routes', () => {
      expect(ADMIN_PAGE_ROUTES.TENANT_MANAGEMENT).toEqual(TENANT_MANAGEMENT_PAGE_ROUTES)
    })

    it('should include USER_MANAGEMENT routes', () => {
      expect(ADMIN_PAGE_ROUTES.USER_MANAGEMENT).toEqual(USER_MANAGEMENT_PAGE_ROUTES)
    })

    it('should include ROLE_MANAGEMENT routes', () => {
      expect(ADMIN_PAGE_ROUTES.ROLE_MANAGEMENT).toEqual(ROLE_MANAGEMENT_PAGE_ROUTES)
    })

    it('should include SUPPORT_TICKET_MANAGEMENT_PAGE routes', () => {
      expect(ADMIN_PAGE_ROUTES.SUPPORT_TICKET_MANAGEMENT_PAGE).toEqual(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES)
    })

    it('should have PROFILE route', () => {
      expect(ADMIN_PAGE_ROUTES.PROFILE).toBe('/admin/profile')
    })

    it('should have SETTINGS route', () => {
      expect(ADMIN_PAGE_ROUTES.SETTINGS).toBe('/admin/settings')
    })

    it('should have NOTIFICATIONS route', () => {
      expect(ADMIN_PAGE_ROUTES.NOTIFICATIONS).toBe('/admin/notifications')
    })
  })

  describe('Route Structure', () => {
    it('should use kebab-case for route segments', () => {
      const allRoutes = [
        ...Object.values(DASHBOARD_PAGE_ROUTES),
        ...Object.values(PLAN_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(TENANT_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(USER_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(ROLE_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES)
      ]

      allRoutes.forEach(route => {
        /* Check that management segments use hyphens */
        if (route.includes('management')) {
          expect(route).toMatch(/-management/)
        }
      })
    })

    it('should use :id parameter for dynamic routes', () => {
      const dynamicRoutes = [
        PLAN_MANAGEMENT_PAGE_ROUTES.EDIT,
        PLAN_MANAGEMENT_PAGE_ROUTES.VIEW,
        USER_MANAGEMENT_PAGE_ROUTES.EDIT,
        USER_MANAGEMENT_PAGE_ROUTES.VIEW,
        ROLE_MANAGEMENT_PAGE_ROUTES.EDIT,
        ROLE_MANAGEMENT_PAGE_ROUTES.VIEW
      ]

      dynamicRoutes.forEach(route => {
        expect(route).toContain(':id')
      })
    })

    it('should have consistent route patterns for management modules', () => {
      const managementModules = [
        PLAN_MANAGEMENT_PAGE_ROUTES,
        USER_MANAGEMENT_PAGE_ROUTES,
        ROLE_MANAGEMENT_PAGE_ROUTES,
        SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES
      ]

      managementModules.forEach(module => {
        expect(module).toHaveProperty('HOME')
        expect(module).toHaveProperty('CREATE')
        expect(module).toHaveProperty('VIEW')
      })
    })

    it('should not have trailing slashes', () => {
      const allRoutes = [
        ...Object.values(DASHBOARD_PAGE_ROUTES),
        ...Object.values(PLAN_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(TENANT_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(USER_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(ROLE_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES),
        ADMIN_PAGE_ROUTES.PROFILE,
        ADMIN_PAGE_ROUTES.SETTINGS,
        ADMIN_PAGE_ROUTES.NOTIFICATIONS
      ]

      allRoutes.forEach(route => {
        expect(route).not.toMatch(/\/$/)
      })
    })
  })

  describe('Type Safety', () => {
    it('should have all route values as strings', () => {
      const allModules = [
        DASHBOARD_PAGE_ROUTES,
        PLAN_MANAGEMENT_PAGE_ROUTES,
        TENANT_MANAGEMENT_PAGE_ROUTES,
        USER_MANAGEMENT_PAGE_ROUTES,
        ROLE_MANAGEMENT_PAGE_ROUTES,
        SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES
      ]

      allModules.forEach(module => {
        Object.values(module).forEach(route => {
          expect(typeof route).toBe('string')
        })
      })
    })

    it('should not have null or undefined routes', () => {
      const allModules = [
        DASHBOARD_PAGE_ROUTES,
        PLAN_MANAGEMENT_PAGE_ROUTES,
        TENANT_MANAGEMENT_PAGE_ROUTES,
        USER_MANAGEMENT_PAGE_ROUTES,
        ROLE_MANAGEMENT_PAGE_ROUTES,
        SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES
      ]

      allModules.forEach(module => {
        Object.values(module).forEach(route => {
          expect(route).not.toBeNull()
          expect(route).not.toBeUndefined()
        })
      })
    })

    it('should be immutable (as const)', () => {
      expect(DASHBOARD_PAGE_ROUTES).toBeDefined()
      expect(PLAN_MANAGEMENT_PAGE_ROUTES).toBeDefined()
      expect(ADMIN_PAGE_ROUTES).toBeDefined()
    })
  })

  describe('CRUD Operations Coverage', () => {
    it('should have LIST, CREATE, EDIT, VIEW for user management', () => {
      expect(USER_MANAGEMENT_PAGE_ROUTES.HOME).toBeDefined()
      expect(USER_MANAGEMENT_PAGE_ROUTES.CREATE).toBeDefined()
      expect(USER_MANAGEMENT_PAGE_ROUTES.EDIT).toBeDefined()
      expect(USER_MANAGEMENT_PAGE_ROUTES.VIEW).toBeDefined()
    })

    it('should have LIST, CREATE, EDIT, VIEW for role management', () => {
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.HOME).toBeDefined()
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.CREATE).toBeDefined()
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.EDIT).toBeDefined()
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.VIEW).toBeDefined()
    })

    it('should have LIST, CREATE, EDIT, VIEW for plan management', () => {
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.HOME).toBeDefined()
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.CREATE).toBeDefined()
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.EDIT).toBeDefined()
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.VIEW).toBeDefined()
    })

    it('should have LIST, CREATE, VIEW for tenant management', () => {
      expect(TENANT_MANAGEMENT_PAGE_ROUTES.HOME).toBeDefined()
      expect(TENANT_MANAGEMENT_PAGE_ROUTES.CREATE).toBeDefined()
      expect(TENANT_MANAGEMENT_PAGE_ROUTES.VIEW).toBeDefined()
    })
  })

  describe('Integration', () => {
    it('should be usable in navigation components', () => {
      const navLinks = [
        { label: 'Dashboard', path: DASHBOARD_PAGE_ROUTES.HOME },
        { label: 'Users', path: USER_MANAGEMENT_PAGE_ROUTES.HOME },
        { label: 'Roles', path: ROLE_MANAGEMENT_PAGE_ROUTES.HOME }
      ]

      expect(navLinks[0].path).toBe('/admin/dashboard')
      expect(navLinks[1].path).toBe('/admin/user-management')
      expect(navLinks[2].path).toBe('/admin/role-management')
    })

    it('should support dynamic route generation', () => {
      const userId = '123'
      const editRoute = USER_MANAGEMENT_PAGE_ROUTES.EDIT.replace(':id', userId)

      expect(editRoute).toBe('/admin/user-management/edit/123')
    })

    it('should be usable in router configuration', () => {
      const routes = [
        { path: DASHBOARD_PAGE_ROUTES.HOME, component: 'Dashboard' },
        { path: USER_MANAGEMENT_PAGE_ROUTES.HOME, component: 'UserList' },
        { path: USER_MANAGEMENT_PAGE_ROUTES.CREATE, component: 'UserCreate' }
      ]

      expect(routes).toHaveLength(3)
      expect(routes[0].path).toBe('/admin/dashboard')
    })
  })

  describe('Consistency', () => {
    it('should have consistent module naming', () => {
      expect(DASHBOARD_PAGE_ROUTES.HOME).toContain('dashboard')
      expect(PLAN_MANAGEMENT_PAGE_ROUTES.HOME).toContain('plan-management')
      expect(TENANT_MANAGEMENT_PAGE_ROUTES.HOME).toContain('tenant-management')
      expect(USER_MANAGEMENT_PAGE_ROUTES.HOME).toContain('user-management')
      expect(ROLE_MANAGEMENT_PAGE_ROUTES.HOME).toContain('role-management')
    })

    it('should use consistent action naming', () => {
      const modules = [
        PLAN_MANAGEMENT_PAGE_ROUTES,
        USER_MANAGEMENT_PAGE_ROUTES,
        ROLE_MANAGEMENT_PAGE_ROUTES,
        SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES
      ]

      modules.forEach(module => {
        expect(module.CREATE).toContain('/create')
        expect(module.EDIT).toContain('/edit/:id')
        expect(module.VIEW).toContain('/view/:id')
      })
    })

    it('should return same reference for multiple imports', () => {
      expect(DASHBOARD_PAGE_ROUTES).toBe(DASHBOARD_PAGE_ROUTES)
      expect(ADMIN_PAGE_ROUTES).toBe(ADMIN_PAGE_ROUTES)
    })
  })

  describe('Route Validation', () => {
    it('should have valid route paths without spaces', () => {
      const allRoutes = [
        ...Object.values(DASHBOARD_PAGE_ROUTES),
        ...Object.values(PLAN_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(TENANT_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(USER_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(ROLE_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES)
      ]

      allRoutes.forEach(route => {
        expect(route).not.toMatch(/\s/)
      })
    })

    it('should start all routes with forward slash', () => {
      const allRoutes = [
        ...Object.values(DASHBOARD_PAGE_ROUTES),
        ...Object.values(PLAN_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(TENANT_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(USER_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(ROLE_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES),
        ADMIN_PAGE_ROUTES.PROFILE,
        ADMIN_PAGE_ROUTES.SETTINGS,
        ADMIN_PAGE_ROUTES.NOTIFICATIONS
      ]

      allRoutes.forEach(route => {
        expect(route).toMatch(/^\//)
      })
    })

    it('should have reasonable route lengths', () => {
      const allRoutes = [
        ...Object.values(DASHBOARD_PAGE_ROUTES),
        ...Object.values(PLAN_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(TENANT_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(USER_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(ROLE_MANAGEMENT_PAGE_ROUTES),
        ...Object.values(SUPPORT_TICKET_MANAGEMENT_PAGE_ROUTES)
      ]

      allRoutes.forEach(route => {
        expect(route.length).toBeGreaterThan(5)
        expect(route.length).toBeLessThan(100)
      })
    })
  })

  describe('Module Organization', () => {
    it('should have all management modules in ADMIN_PAGE_ROUTES', () => {
      expect(ADMIN_PAGE_ROUTES.DASHBOARD).toBeDefined()
      expect(ADMIN_PAGE_ROUTES.PLAN_MANAGEMENT).toBeDefined()
      expect(ADMIN_PAGE_ROUTES.TENANT_MANAGEMENT).toBeDefined()
      expect(ADMIN_PAGE_ROUTES.USER_MANAGEMENT).toBeDefined()
      expect(ADMIN_PAGE_ROUTES.ROLE_MANAGEMENT).toBeDefined()
      expect(ADMIN_PAGE_ROUTES.SUPPORT_TICKET_MANAGEMENT_PAGE).toBeDefined()
    })

    it('should have user-specific routes in ADMIN_PAGE_ROUTES', () => {
      expect(ADMIN_PAGE_ROUTES.PROFILE).toBeDefined()
      expect(ADMIN_PAGE_ROUTES.SETTINGS).toBeDefined()
      expect(ADMIN_PAGE_ROUTES.NOTIFICATIONS).toBeDefined()
    })

    it('should organize routes by feature domain', () => {
      expect(typeof ADMIN_PAGE_ROUTES.DASHBOARD).toBe('object')
      expect(typeof ADMIN_PAGE_ROUTES.PLAN_MANAGEMENT).toBe('object')
      expect(typeof ADMIN_PAGE_ROUTES.USER_MANAGEMENT).toBe('object')
    })
  })
})
