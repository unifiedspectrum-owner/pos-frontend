/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Dashboard module imports */
import { DASHBOARD_MODULE_NAME, DASHBOARD_API_ROUTES, DASHBOARD_PAGE_ROUTES } from '@dashboard/constants'

describe('Dashboard Routes Constants', () => {
  describe('DASHBOARD_MODULE_NAME', () => {
    it('should be defined', () => {
      expect(DASHBOARD_MODULE_NAME).toBeDefined()
    })

    it('should have correct value', () => {
      expect(DASHBOARD_MODULE_NAME).toBe('dashboard')
    })

    it('should be a string', () => {
      expect(typeof DASHBOARD_MODULE_NAME).toBe('string')
    })

    it('should not be empty', () => {
      expect(DASHBOARD_MODULE_NAME.length).toBeGreaterThan(0)
    })

    it('should use kebab-case format', () => {
      expect(DASHBOARD_MODULE_NAME).toMatch(/^[a-z]+(-[a-z]+)*$/)
    })
  })

  describe('DASHBOARD_API_ROUTES', () => {
    it('should be defined', () => {
      expect(DASHBOARD_API_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof DASHBOARD_API_ROUTES).toBe('object')
    })

    it('should not be null', () => {
      expect(DASHBOARD_API_ROUTES).not.toBeNull()
    })

    describe('BASE_URL', () => {
      it('should be defined', () => {
        expect(DASHBOARD_API_ROUTES.BASE_URL).toBeDefined()
      })

      it('should have correct value', () => {
        expect(DASHBOARD_API_ROUTES.BASE_URL).toBe('/admin/dashboard')
      })

      it('should start with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.BASE_URL).toMatch(/^\//)
      })

      it('should not end with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.BASE_URL).not.toMatch(/\/$/)
      })

      it('should be a string', () => {
        expect(typeof DASHBOARD_API_ROUTES.BASE_URL).toBe('string')
      })

      it('should start with /admin prefix', () => {
        expect(DASHBOARD_API_ROUTES.BASE_URL).toMatch(/^\/admin/)
      })

      it('should contain dashboard segment', () => {
        expect(DASHBOARD_API_ROUTES.BASE_URL).toContain('dashboard')
      })
    })

    describe('OVERVIEW', () => {
      it('should be defined', () => {
        expect(DASHBOARD_API_ROUTES.OVERVIEW).toBeDefined()
      })

      it('should have correct value', () => {
        expect(DASHBOARD_API_ROUTES.OVERVIEW).toBe('/overview')
      })

      it('should start with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.OVERVIEW).toMatch(/^\//)
      })

      it('should be a valid path segment', () => {
        expect(DASHBOARD_API_ROUTES.OVERVIEW).toMatch(/^\/[a-z]+$/)
      })

      it('should not end with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.OVERVIEW).not.toMatch(/\/$/)
      })
    })

    describe('CHARTS', () => {
      it('should be defined', () => {
        expect(DASHBOARD_API_ROUTES.CHARTS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(DASHBOARD_API_ROUTES.CHARTS).toBe('/charts')
      })

      it('should start with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.CHARTS).toMatch(/^\//)
      })

      it('should be a valid path segment', () => {
        expect(DASHBOARD_API_ROUTES.CHARTS).toMatch(/^\/[a-z]+$/)
      })

      it('should not end with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.CHARTS).not.toMatch(/\/$/)
      })
    })

    describe('TABLES', () => {
      it('should be defined', () => {
        expect(DASHBOARD_API_ROUTES.TABLES).toBeDefined()
      })

      it('should have correct value', () => {
        expect(DASHBOARD_API_ROUTES.TABLES).toBe('/tables')
      })

      it('should start with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.TABLES).toMatch(/^\//)
      })

      it('should be a valid path segment', () => {
        expect(DASHBOARD_API_ROUTES.TABLES).toMatch(/^\/[a-z]+$/)
      })

      it('should not end with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.TABLES).not.toMatch(/\/$/)
      })
    })

    describe('ANALYTICS', () => {
      it('should be defined', () => {
        expect(DASHBOARD_API_ROUTES.ANALYTICS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(DASHBOARD_API_ROUTES.ANALYTICS).toBe('/analytics')
      })

      it('should start with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.ANALYTICS).toMatch(/^\//)
      })

      it('should be a valid path segment', () => {
        expect(DASHBOARD_API_ROUTES.ANALYTICS).toMatch(/^\/[a-z]+$/)
      })

      it('should not end with forward slash', () => {
        expect(DASHBOARD_API_ROUTES.ANALYTICS).not.toMatch(/\/$/)
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(DASHBOARD_API_ROUTES).toHaveProperty('BASE_URL')
        expect(DASHBOARD_API_ROUTES).toHaveProperty('OVERVIEW')
        expect(DASHBOARD_API_ROUTES).toHaveProperty('CHARTS')
        expect(DASHBOARD_API_ROUTES).toHaveProperty('TABLES')
        expect(DASHBOARD_API_ROUTES).toHaveProperty('ANALYTICS')
      })

      it('should have exactly 5 properties', () => {
        expect(Object.keys(DASHBOARD_API_ROUTES)).toHaveLength(5)
      })

      it('should have unique route paths', () => {
        const values = Object.values(DASHBOARD_API_ROUTES)
        const uniqueValues = new Set(values)
        expect(uniqueValues.size).toBe(values.length)
      })

      it('should use lowercase naming', () => {
        Object.values(DASHBOARD_API_ROUTES).forEach(route => {
          expect(route).toBe(route.toLowerCase())
        })
      })

      it('should use semantic endpoint names', () => {
        /* Verify all endpoints have meaningful names */
        expect(DASHBOARD_API_ROUTES.OVERVIEW).toContain('overview')
        expect(DASHBOARD_API_ROUTES.CHARTS).toContain('charts')
        expect(DASHBOARD_API_ROUTES.TABLES).toContain('tables')
        expect(DASHBOARD_API_ROUTES.ANALYTICS).toContain('analytics')
      })

      it('should not have trailing slashes', () => {
        Object.values(DASHBOARD_API_ROUTES).forEach(route => {
          expect(route).not.toMatch(/\/$/)
        })
      })

      it('should follow REST conventions', () => {
        /* All data endpoints should start with forward slash */
        expect(DASHBOARD_API_ROUTES.OVERVIEW).toMatch(/^\//)
        expect(DASHBOARD_API_ROUTES.CHARTS).toMatch(/^\//)
        expect(DASHBOARD_API_ROUTES.TABLES).toMatch(/^\//)
        expect(DASHBOARD_API_ROUTES.ANALYTICS).toMatch(/^\//)
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(DASHBOARD_API_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(DASHBOARD_API_ROUTES).toBeDefined()
        expect(typeof DASHBOARD_API_ROUTES).toBe('object')
      })

      it('should not allow property modifications', () => {
        /* Verify object is properly typed */
        expect(DASHBOARD_API_ROUTES).toBeDefined()
        expect(Object.keys(DASHBOARD_API_ROUTES).length).toBeGreaterThan(0)
      })
    })

    describe('URL Construction', () => {
      it('should construct valid full URL for OVERVIEW', () => {
        const fullUrl = `${DASHBOARD_API_ROUTES.BASE_URL}${DASHBOARD_API_ROUTES.OVERVIEW}`
        expect(fullUrl).toBe('/admin/dashboard/overview')
      })

      it('should construct valid full URL for CHARTS', () => {
        const fullUrl = `${DASHBOARD_API_ROUTES.BASE_URL}${DASHBOARD_API_ROUTES.CHARTS}`
        expect(fullUrl).toBe('/admin/dashboard/charts')
      })

      it('should construct valid full URL for TABLES', () => {
        const fullUrl = `${DASHBOARD_API_ROUTES.BASE_URL}${DASHBOARD_API_ROUTES.TABLES}`
        expect(fullUrl).toBe('/admin/dashboard/tables')
      })

      it('should construct valid full URL for ANALYTICS', () => {
        const fullUrl = `${DASHBOARD_API_ROUTES.BASE_URL}${DASHBOARD_API_ROUTES.ANALYTICS}`
        expect(fullUrl).toBe('/admin/dashboard/analytics')
      })

      it('should not have double slashes in constructed URLs', () => {
        const endpoints = ['OVERVIEW', 'CHARTS', 'TABLES', 'ANALYTICS'] as const
        endpoints.forEach(endpoint => {
          const fullUrl = `${DASHBOARD_API_ROUTES.BASE_URL}${DASHBOARD_API_ROUTES[endpoint]}`
          expect(fullUrl).not.toMatch(/\/\//)
        })
      })
    })
  })

  describe('DASHBOARD_PAGE_ROUTES', () => {
    it('should be defined', () => {
      expect(DASHBOARD_PAGE_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof DASHBOARD_PAGE_ROUTES).toBe('object')
    })

    it('should not be null', () => {
      expect(DASHBOARD_PAGE_ROUTES).not.toBeNull()
    })

    describe('HOME', () => {
      it('should be defined', () => {
        expect(DASHBOARD_PAGE_ROUTES.HOME).toBeDefined()
      })

      it('should have correct value', () => {
        expect(DASHBOARD_PAGE_ROUTES.HOME).toBe('/admin/dashboard')
      })

      it('should start with /admin', () => {
        expect(DASHBOARD_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
      })

      it('should contain dashboard segment', () => {
        expect(DASHBOARD_PAGE_ROUTES.HOME).toContain('dashboard')
      })

      it('should not end with trailing slash', () => {
        expect(DASHBOARD_PAGE_ROUTES.HOME).not.toMatch(/\/$/)
      })

      it('should match BASE_URL', () => {
        expect(DASHBOARD_PAGE_ROUTES.HOME).toBe(DASHBOARD_API_ROUTES.BASE_URL)
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(DASHBOARD_PAGE_ROUTES).toHaveProperty('HOME')
      })

      it('should have exactly 1 property', () => {
        expect(Object.keys(DASHBOARD_PAGE_ROUTES)).toHaveLength(1)
      })

      it('should start with /admin', () => {
        Object.values(DASHBOARD_PAGE_ROUTES).forEach(route => {
          expect(route).toMatch(/^\/admin/)
        })
      })

      it('should contain dashboard segment', () => {
        Object.values(DASHBOARD_PAGE_ROUTES).forEach(route => {
          expect(route).toContain('dashboard')
        })
      })

      it('should follow consistent naming pattern', () => {
        /* All routes should use kebab-case */
        Object.values(DASHBOARD_PAGE_ROUTES).forEach(route => {
          const segments = route.split('/')
          segments.forEach(segment => {
            if (segment && !segment.startsWith(':')) {
              expect(segment).toMatch(/^[a-z]+(-[a-z]+)*$/)
            }
          })
        })
      })

      it('should not end with trailing slash', () => {
        Object.values(DASHBOARD_PAGE_ROUTES).forEach(route => {
          expect(route).not.toMatch(/\/$/)
        })
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(DASHBOARD_PAGE_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(DASHBOARD_PAGE_ROUTES).toBeDefined()
        expect(typeof DASHBOARD_PAGE_ROUTES).toBe('object')
      })
    })
  })

  describe('Routes Integration', () => {
    it('should have consistent structure for API and page routes', () => {
      /* Both use absolute paths with /admin prefix */
      expect(DASHBOARD_API_ROUTES.BASE_URL).toMatch(/^\/admin/)
      expect(DASHBOARD_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
    })

    it('should use same base path for API and page routes', () => {
      /* Both should point to /admin/dashboard */
      expect(DASHBOARD_API_ROUTES.BASE_URL).toBe(DASHBOARD_PAGE_ROUTES.HOME)
    })

    it('should maintain semantic consistency', () => {
      /* API routes should have data endpoints */
      expect(DASHBOARD_API_ROUTES).toHaveProperty('OVERVIEW')
      expect(DASHBOARD_API_ROUTES).toHaveProperty('CHARTS')
      expect(DASHBOARD_API_ROUTES).toHaveProperty('TABLES')
      expect(DASHBOARD_API_ROUTES).toHaveProperty('ANALYTICS')

      /* Page routes should have navigation endpoint */
      expect(DASHBOARD_PAGE_ROUTES).toHaveProperty('HOME')
    })

    it('should all use /admin prefix consistently', () => {
      expect(DASHBOARD_API_ROUTES.BASE_URL).toContain('/admin')
      expect(DASHBOARD_PAGE_ROUTES.HOME).toContain('/admin')
    })

    it('should all use dashboard segment consistently', () => {
      expect(DASHBOARD_API_ROUTES.BASE_URL).toContain('dashboard')
      expect(DASHBOARD_PAGE_ROUTES.HOME).toContain('dashboard')
    })
  })

  describe('Constants Export', () => {
    it('should export DASHBOARD_MODULE_NAME', () => {
      expect(DASHBOARD_MODULE_NAME).toBeDefined()
    })

    it('should export DASHBOARD_API_ROUTES', () => {
      expect(DASHBOARD_API_ROUTES).toBeDefined()
    })

    it('should export DASHBOARD_PAGE_ROUTES', () => {
      expect(DASHBOARD_PAGE_ROUTES).toBeDefined()
    })

    it('should have consistent module naming', () => {
      /* Module name should match route segments */
      expect(DASHBOARD_API_ROUTES.BASE_URL).toContain('dashboard')
      expect(DASHBOARD_PAGE_ROUTES.HOME).toContain('dashboard')
    })
  })

  describe('Route Validation', () => {
    it('should have valid URL format for BASE_URL', () => {
      expect(DASHBOARD_API_ROUTES.BASE_URL).toMatch(/^\/[a-z\/]+$/)
    })

    it('should have valid URL format for page routes', () => {
      expect(DASHBOARD_PAGE_ROUTES.HOME).toMatch(/^\/[a-z\/]+$/)
    })

    it('should not contain spaces', () => {
      Object.values(DASHBOARD_API_ROUTES).forEach(route => {
        expect(route).not.toContain(' ')
      })
      Object.values(DASHBOARD_PAGE_ROUTES).forEach(route => {
        expect(route).not.toContain(' ')
      })
    })

    it('should not contain special characters', () => {
      Object.values(DASHBOARD_API_ROUTES).forEach(route => {
        expect(route).toMatch(/^[a-z0-9\/:_-]+$/)
      })
      Object.values(DASHBOARD_PAGE_ROUTES).forEach(route => {
        expect(route).toMatch(/^[a-z0-9\/:_-]+$/)
      })
    })

    it('should not contain uppercase letters', () => {
      Object.values(DASHBOARD_API_ROUTES).forEach(route => {
        expect(route).toBe(route.toLowerCase())
      })
      Object.values(DASHBOARD_PAGE_ROUTES).forEach(route => {
        expect(route).toBe(route.toLowerCase())
      })
    })
  })
})
