/* Libraries imports */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

/* Shared module imports */
import { PROTECTED_ROUTES, getRoutePermission, isProtectedRoute, RoutePermission } from '@shared/config/route-permissions'

describe('route-permissions', () => {
  let consoleSpy: any

  beforeEach(() => {
    /* Mock console.log to suppress output during tests */
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('PROTECTED_ROUTES Configuration', () => {
    it('should export PROTECTED_ROUTES constant', () => {
      expect(PROTECTED_ROUTES).toBeDefined()
      expect(typeof PROTECTED_ROUTES).toBe('object')
    })

    it('should have all user management routes', () => {
      expect(PROTECTED_ROUTES['/admin/user-management']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/user-management/create']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/user-management/edit']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/user-management/view']).toBeDefined()
    })

    it('should have all role management routes', () => {
      expect(PROTECTED_ROUTES['/admin/role-management']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/role-management/create']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/role-management/edit']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/role-management/view']).toBeDefined()
    })

    it('should have all plan management routes', () => {
      expect(PROTECTED_ROUTES['/admin/plan-management']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/plan-management/create']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/plan-management/edit']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/plan-management/view']).toBeDefined()
    })

    it('should have all tenant management routes', () => {
      expect(PROTECTED_ROUTES['/admin/tenant-management']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/tenant-management/create']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/tenant-management/edit']).toBeDefined()
      expect(PROTECTED_ROUTES['/admin/tenant-management/view']).toBeDefined()
    })

    it('should have correct module name for user management routes', () => {
      expect(PROTECTED_ROUTES['/admin/user-management'].module).toBe('user-management')
      expect(PROTECTED_ROUTES['/admin/user-management/create'].module).toBe('user-management')
      expect(PROTECTED_ROUTES['/admin/user-management/edit'].module).toBe('user-management')
      expect(PROTECTED_ROUTES['/admin/user-management/view'].module).toBe('user-management')
    })

    it('should have correct permissions for CRUD operations', () => {
      /* User Management */
      expect(PROTECTED_ROUTES['/admin/user-management'].permission).toBe('READ')
      expect(PROTECTED_ROUTES['/admin/user-management/create'].permission).toBe('CREATE')
      expect(PROTECTED_ROUTES['/admin/user-management/edit'].permission).toBe('UPDATE')
      expect(PROTECTED_ROUTES['/admin/user-management/view'].permission).toBe('READ')

      /* Role Management */
      expect(PROTECTED_ROUTES['/admin/role-management'].permission).toBe('READ')
      expect(PROTECTED_ROUTES['/admin/role-management/create'].permission).toBe('CREATE')
      expect(PROTECTED_ROUTES['/admin/role-management/edit'].permission).toBe('UPDATE')
      expect(PROTECTED_ROUTES['/admin/role-management/view'].permission).toBe('READ')

      /* Plan Management */
      expect(PROTECTED_ROUTES['/admin/plan-management'].permission).toBe('READ')
      expect(PROTECTED_ROUTES['/admin/plan-management/create'].permission).toBe('CREATE')
      expect(PROTECTED_ROUTES['/admin/plan-management/edit'].permission).toBe('UPDATE')
      expect(PROTECTED_ROUTES['/admin/plan-management/view'].permission).toBe('READ')

      /* Tenant Management */
      expect(PROTECTED_ROUTES['/admin/tenant-management'].permission).toBe('READ')
      expect(PROTECTED_ROUTES['/admin/tenant-management/create'].permission).toBe('CREATE')
      expect(PROTECTED_ROUTES['/admin/tenant-management/edit'].permission).toBe('UPDATE')
      expect(PROTECTED_ROUTES['/admin/tenant-management/view'].permission).toBe('READ')
    })

    it('should have RoutePermission structure with module and permission', () => {
      Object.values(PROTECTED_ROUTES).forEach((route: RoutePermission) => {
        expect(route).toHaveProperty('module')
        expect(route).toHaveProperty('permission')
        expect(typeof route.module).toBe('string')
        expect(typeof route.permission).toBe('string')
      })
    })

    it('should have valid permission types', () => {
      const validPermissions = ['CREATE', 'READ', 'UPDATE', 'DELETE']

      Object.values(PROTECTED_ROUTES).forEach((route: RoutePermission) => {
        expect(validPermissions).toContain(route.permission)
      })
    })

    it('should not have duplicate route definitions', () => {
      const routePaths = Object.keys(PROTECTED_ROUTES)
      const uniqueRoutePaths = new Set(routePaths)
      expect(routePaths.length).toBe(uniqueRoutePaths.size)
    })

    it('should have all routes starting with /admin', () => {
      Object.keys(PROTECTED_ROUTES).forEach(route => {
        expect(route).toMatch(/^\/admin\//)
      })
    })
  })

  describe('getRoutePermission Function', () => {
    it('should be a function', () => {
      expect(typeof getRoutePermission).toBe('function')
    })

    it('should return null for unprotected routes', () => {
      const result = getRoutePermission('/public/pricing')
      expect(result).toBeNull()
    })

    it('should return null for root path', () => {
      const result = getRoutePermission('/')
      expect(result).toBeNull()
    })

    it('should return null for non-existent admin routes', () => {
      const result = getRoutePermission('/admin/non-existent-module')
      expect(result).toBeNull()
    })

    it('should return permission for exact route match', () => {
      const result = getRoutePermission('/admin/user-management')
      expect(result).not.toBeNull()
      expect(result?.module).toBe('user-management')
      expect(result?.permission).toBe('READ')
    })

    it('should handle routes with locale prefix', () => {
      const result = getRoutePermission('/en/admin/user-management')
      expect(result).not.toBeNull()
      expect(result?.module).toBe('user-management')
      expect(result?.permission).toBe('READ')
    })

    it('should handle different locale prefixes', () => {
      const locales = ['en', 'es', 'zh', 'fr', 'de']

      locales.forEach(locale => {
        const result = getRoutePermission(`/${locale}/admin/user-management`)
        expect(result).not.toBeNull()
        expect(result?.module).toBe('user-management')
      })
    })

    it('should return permission for create routes', () => {
      const result = getRoutePermission('/admin/user-management/create')
      expect(result).not.toBeNull()
      expect(result?.permission).toBe('CREATE')
    })

    it('should return permission for edit routes', () => {
      const result = getRoutePermission('/admin/role-management/edit')
      expect(result).not.toBeNull()
      expect(result?.permission).toBe('UPDATE')
    })

    it('should return permission for view routes', () => {
      const result = getRoutePermission('/admin/plan-management/view')
      expect(result).not.toBeNull()
      expect(result?.permission).toBe('READ')
    })

    it('should handle routes with dynamic IDs', () => {
      const result = getRoutePermission('/admin/user-management/edit/123')
      expect(result).not.toBeNull()
      expect(result?.module).toBe('user-management')
      expect(result?.permission).toBe('UPDATE')
    })

    it('should handle routes with UUID parameters', () => {
      const result = getRoutePermission('/admin/role-management/view/550e8400-e29b-41d4-a716-446655440000')
      expect(result).not.toBeNull()
      expect(result?.module).toBe('role-management')
      expect(result?.permission).toBe('READ')
    })

    it('should prioritize more specific routes', () => {
      const editResult = getRoutePermission('/admin/user-management/edit/123')
      const listResult = getRoutePermission('/admin/user-management')

      expect(editResult?.permission).toBe('UPDATE')
      expect(listResult?.permission).toBe('READ')
    })

    it('should handle routes with multiple path segments', () => {
      const result = getRoutePermission('/admin/user-management/edit/123/details')
      expect(result).not.toBeNull()
      expect(result?.permission).toBe('UPDATE')
    })

    it('should handle routes with query parameters', () => {
      /* Query parameters are part of URL, not pathname, so this won't match */
      const result = getRoutePermission('/admin/user-management?page=1&limit=10')
      /* The function doesn't strip query params, so it won't match */
      expect(result).toBeNull()
    })

    it('should be case-sensitive for routes', () => {
      const result = getRoutePermission('/Admin/user-management')
      expect(result).toBeNull()
    })

    it('should handle trailing slashes correctly', () => {
      const withoutSlash = getRoutePermission('/admin/user-management')
      const withSlash = getRoutePermission('/admin/user-management/')

      expect(withoutSlash).not.toBeNull()
      /* Trailing slash still matches via startsWith check */
      expect(withSlash).not.toBeNull()
      expect(withSlash?.module).toBe(withoutSlash?.module)
    })

    it('should return correct permissions for all modules', () => {
      const testCases = [
        { path: '/admin/user-management', module: 'user-management' },
        { path: '/admin/role-management', module: 'role-management' },
        { path: '/admin/plan-management', module: 'plan-management' },
        { path: '/admin/tenant-management', module: 'tenant-management' }
      ]

      testCases.forEach(({ path, module }) => {
        const result = getRoutePermission(path)
        expect(result).not.toBeNull()
        expect(result?.module).toBe(module)
      })
    })

    it('should log the original and cleaned path', () => {
      getRoutePermission('/en/admin/user-management')

      /* The function logs a single string with both paths, not separate arguments */
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[getRoutePermission] Original path:')
      )
    })

    it('should log exact match when found', () => {
      getRoutePermission('/admin/user-management')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[getRoutePermission] Exact match found:'),
        expect.anything()
      )
    })

    it('should log partial match when found', () => {
      getRoutePermission('/admin/user-management/edit/123')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[getRoutePermission] Partial match found'),
        expect.anything()
      )
    })

    it('should log when no permission is found', () => {
      getRoutePermission('/admin/non-existent')

      /* The function logs a single string, not separate arguments */
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[getRoutePermission] No route permission found')
      )
    })
  })

  describe('isProtectedRoute Function', () => {
    it('should be a function', () => {
      expect(typeof isProtectedRoute).toBe('function')
    })

    it('should return true for protected routes', () => {
      expect(isProtectedRoute('/admin/user-management')).toBe(true)
      expect(isProtectedRoute('/admin/role-management')).toBe(true)
      expect(isProtectedRoute('/admin/plan-management')).toBe(true)
      expect(isProtectedRoute('/admin/tenant-management')).toBe(true)
    })

    it('should return false for unprotected routes', () => {
      expect(isProtectedRoute('/')).toBe(false)
      expect(isProtectedRoute('/pricing')).toBe(false)
      expect(isProtectedRoute('/about')).toBe(false)
      expect(isProtectedRoute('/contact')).toBe(false)
    })

    it('should return true for routes with locale prefix', () => {
      expect(isProtectedRoute('/en/admin/user-management')).toBe(true)
      expect(isProtectedRoute('/es/admin/role-management')).toBe(true)
      expect(isProtectedRoute('/zh/admin/plan-management')).toBe(true)
    })

    it('should return true for routes with dynamic parameters', () => {
      expect(isProtectedRoute('/admin/user-management/edit/123')).toBe(true)
      expect(isProtectedRoute('/admin/role-management/view/456')).toBe(true)
    })

    it('should return false for non-admin routes', () => {
      expect(isProtectedRoute('/public/data')).toBe(false)
      expect(isProtectedRoute('/auth/login')).toBe(false)
      expect(isProtectedRoute('/tenant/create')).toBe(false)
    })

    it('should handle all CRUD route types', () => {
      expect(isProtectedRoute('/admin/user-management')).toBe(true)
      expect(isProtectedRoute('/admin/user-management/create')).toBe(true)
      expect(isProtectedRoute('/admin/user-management/edit/1')).toBe(true)
      expect(isProtectedRoute('/admin/user-management/view/1')).toBe(true)
    })

    it('should return consistent results with getRoutePermission', () => {
      const testPaths = [
        '/admin/user-management',
        '/admin/role-management/create',
        '/public/pricing',
        '/auth/login',
        '/en/admin/plan-management'
      ]

      testPaths.forEach(path => {
        const hasPermission = getRoutePermission(path) !== null
        const isProtected = isProtectedRoute(path)
        expect(isProtected).toBe(hasPermission)
      })
    })
  })

  describe('RoutePermission Type', () => {
    it('should have correct structure', () => {
      const sampleRoute = PROTECTED_ROUTES['/admin/user-management']

      expect(sampleRoute).toHaveProperty('module')
      expect(sampleRoute).toHaveProperty('permission')
      expect(typeof sampleRoute.module).toBe('string')
      expect(typeof sampleRoute.permission).toBe('string')
    })

    it('should optionally have exact property', () => {
      const routes = Object.values(PROTECTED_ROUTES)

      routes.forEach((route: RoutePermission) => {
        if ('exact' in route) {
          expect(typeof route.exact).toBe('boolean')
        }
      })
    })
  })

  describe('Locale Prefix Removal', () => {
    it('should remove two-letter locale prefixes', () => {
      const locales = ['en', 'es', 'zh', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'ar']

      locales.forEach(locale => {
        const result = getRoutePermission(`/${locale}/admin/user-management`)
        expect(result).not.toBeNull()
        expect(result?.module).toBe('user-management')
      })
    })

    it('should not remove three-letter paths', () => {
      const result = getRoutePermission('/eng/admin/user-management')
      expect(result).toBeNull()
    })

    it('should handle locale at the start of path', () => {
      const withLocale = getRoutePermission('/en/admin/user-management')
      const withoutLocale = getRoutePermission('/admin/user-management')

      expect(withLocale?.module).toBe(withoutLocale?.module)
      expect(withLocale?.permission).toBe(withoutLocale?.permission)
    })

    it('should not remove locale-like segments in the middle', () => {
      /* This should not match as 'en' in the middle is not a locale prefix */
      const result = getRoutePermission('/admin/en/user-management')
      expect(result).toBeNull()
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete user management workflow', () => {
      const listRoute = isProtectedRoute('/admin/user-management')
      const createRoute = isProtectedRoute('/admin/user-management/create')
      const editRoute = isProtectedRoute('/admin/user-management/edit/123')
      const viewRoute = isProtectedRoute('/admin/user-management/view/123')

      expect(listRoute).toBe(true)
      expect(createRoute).toBe(true)
      expect(editRoute).toBe(true)
      expect(viewRoute).toBe(true)
    })

    it('should work with all management modules', () => {
      const modules = ['user', 'role', 'plan', 'tenant']

      modules.forEach(module => {
        const basePath = `/admin/${module}-management`
        expect(isProtectedRoute(basePath)).toBe(true)
        expect(isProtectedRoute(`${basePath}/create`)).toBe(true)
        expect(isProtectedRoute(`${basePath}/edit/1`)).toBe(true)
        expect(isProtectedRoute(`${basePath}/view/1`)).toBe(true)
      })
    })

    it('should distinguish between different modules', () => {
      const userRoute = getRoutePermission('/admin/user-management')
      const roleRoute = getRoutePermission('/admin/role-management')
      const planRoute = getRoutePermission('/admin/plan-management')
      const tenantRoute = getRoutePermission('/admin/tenant-management')

      expect(userRoute?.module).toBe('user-management')
      expect(roleRoute?.module).toBe('role-management')
      expect(planRoute?.module).toBe('plan-management')
      expect(tenantRoute?.module).toBe('tenant-management')
    })

    it('should handle mixed locale and parameter routes', () => {
      const result = getRoutePermission('/en/admin/user-management/edit/123')
      expect(result).not.toBeNull()
      expect(result?.module).toBe('user-management')
      expect(result?.permission).toBe('UPDATE')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string path', () => {
      const result = getRoutePermission('')
      expect(result).toBeNull()
    })

    it('should handle path with only slash', () => {
      const result = getRoutePermission('/')
      expect(result).toBeNull()
    })

    it('should handle path with special characters', () => {
      const result = getRoutePermission('/admin/user-management/edit/123?query=test&page=1')
      expect(result).not.toBeNull()
    })

    it('should handle path with hash', () => {
      /* Hash fragments are part of URL, not pathname, so this won't match */
      const result = getRoutePermission('/admin/user-management#section')
      /* The function doesn't strip hash fragments, so it won't match */
      expect(result).toBeNull()
    })

    it('should handle deeply nested paths', () => {
      const result = getRoutePermission('/admin/user-management/edit/123/details/permissions')
      expect(result).not.toBeNull()
      expect(result?.permission).toBe('UPDATE')
    })

    it('should not match partial admin paths', () => {
      const result = getRoutePermission('/adm/user-management')
      expect(result).toBeNull()
    })

    it('should not match paths without /admin', () => {
      const result = getRoutePermission('/user-management')
      expect(result).toBeNull()
    })
  })

  describe('Performance and Consistency', () => {
    it('should return same result for multiple calls', () => {
      const path = '/admin/user-management/edit/123'
      const result1 = getRoutePermission(path)
      const result2 = getRoutePermission(path)

      expect(result1).toEqual(result2)
    })

    it('should handle all protected routes without errors', () => {
      const allRoutes = Object.keys(PROTECTED_ROUTES)

      allRoutes.forEach(route => {
        expect(() => getRoutePermission(route)).not.toThrow()
        expect(() => isProtectedRoute(route)).not.toThrow()
      })
    })

    it('should have reasonable route count', () => {
      const routeCount = Object.keys(PROTECTED_ROUTES).length
      expect(routeCount).toBeGreaterThan(0)
      expect(routeCount).toBeLessThan(100)
    })
  })
})
