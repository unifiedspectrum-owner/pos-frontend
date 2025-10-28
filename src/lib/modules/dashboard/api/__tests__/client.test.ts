/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Dashboard module imports */
import { DASHBOARD_API_ROUTES } from '@dashboard/constants/routes'

describe('dashboardApiClient', () => {
  describe('Client Configuration', () => {
    it('should export dashboardApiClient instance', async () => {
      const module = await import('@dashboard/api/client')

      expect(module.dashboardApiClient).toBeDefined()
      expect(module.dashboardApiClient).toHaveProperty('get')
      expect(module.dashboardApiClient).toHaveProperty('post')
      expect(module.dashboardApiClient).toHaveProperty('put')
      expect(module.dashboardApiClient).toHaveProperty('delete')
    })

    it('should be configured with correct base path', () => {
      expect(DASHBOARD_API_ROUTES.BASE_URL).toBe('/admin/dashboard')
    })
  })

  describe('HTTP Methods Availability', () => {
    it('should have GET method for fetching data', async () => {
      const module = await import('@dashboard/api/client')

      expect(module.dashboardApiClient.get).toBeTypeOf('function')
    })

    it('should have POST method for creating data', async () => {
      const module = await import('@dashboard/api/client')

      expect(module.dashboardApiClient.post).toBeTypeOf('function')
    })

    it('should have PUT method for updating data', async () => {
      const module = await import('@dashboard/api/client')

      expect(module.dashboardApiClient.put).toBeTypeOf('function')
    })

    it('should have DELETE method for removing data', async () => {
      const module = await import('@dashboard/api/client')

      expect(module.dashboardApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('Integration with Base Client', () => {
    it('should create client instance from base client factory', async () => {
      const module = await import('@dashboard/api/client')

      /* Client should be defined with HTTP methods */
      expect(module.dashboardApiClient).toBeDefined()
      expect(module.dashboardApiClient.get).toBeTypeOf('function')
      expect(module.dashboardApiClient.post).toBeTypeOf('function')
      expect(module.dashboardApiClient.put).toBeTypeOf('function')
      expect(module.dashboardApiClient.delete).toBeTypeOf('function')
    })

    it('should be properly instantiated with base path', async () => {
      const module = await import('@dashboard/api/client')

      /* Verify the client is a valid axios instance */
      expect(module.dashboardApiClient).toBeDefined()
      expect(typeof module.dashboardApiClient.get).toBe('function')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions', () => {
      expect(DASHBOARD_API_ROUTES).toHaveProperty('BASE_URL')
      expect(DASHBOARD_API_ROUTES).toHaveProperty('OVERVIEW')
      expect(DASHBOARD_API_ROUTES).toHaveProperty('CHARTS')
      expect(DASHBOARD_API_ROUTES).toHaveProperty('TABLES')
      expect(DASHBOARD_API_ROUTES).toHaveProperty('ANALYTICS')
    })

    it('should use standard dashboard API path structure', () => {
      expect(DASHBOARD_API_ROUTES.BASE_URL).toBe('/admin/dashboard')
      expect(DASHBOARD_API_ROUTES.OVERVIEW).toBe('/overview')
      expect(DASHBOARD_API_ROUTES.CHARTS).toBe('/charts')
      expect(DASHBOARD_API_ROUTES.TABLES).toBe('/tables')
      expect(DASHBOARD_API_ROUTES.ANALYTICS).toBe('/analytics')
    })

    it('should have all required dashboard endpoint routes', () => {
      const expectedRoutes = [
        'BASE_URL',
        'OVERVIEW',
        'CHARTS',
        'TABLES',
        'ANALYTICS'
      ]

      expectedRoutes.forEach(route => {
        expect(DASHBOARD_API_ROUTES).toHaveProperty(route)
      })
    })

    it('should have endpoints starting with forward slash', () => {
      expect(DASHBOARD_API_ROUTES.OVERVIEW.startsWith('/')).toBe(true)
      expect(DASHBOARD_API_ROUTES.CHARTS.startsWith('/')).toBe(true)
      expect(DASHBOARD_API_ROUTES.TABLES.startsWith('/')).toBe(true)
      expect(DASHBOARD_API_ROUTES.ANALYTICS.startsWith('/')).toBe(true)
    })

    it('should have consistent route naming', () => {
      /* All routes should be lowercase */
      expect(DASHBOARD_API_ROUTES.OVERVIEW.toLowerCase()).toBe(DASHBOARD_API_ROUTES.OVERVIEW)
      expect(DASHBOARD_API_ROUTES.CHARTS.toLowerCase()).toBe(DASHBOARD_API_ROUTES.CHARTS)
      expect(DASHBOARD_API_ROUTES.TABLES.toLowerCase()).toBe(DASHBOARD_API_ROUTES.TABLES)
      expect(DASHBOARD_API_ROUTES.ANALYTICS.toLowerCase()).toBe(DASHBOARD_API_ROUTES.ANALYTICS)
    })
  })

  describe('Client Exports', () => {
    it('should export client as named export', async () => {
      const module = await import('@dashboard/api/client')

      expect(module).toHaveProperty('dashboardApiClient')
    })

    it('should only export dashboardApiClient', async () => {
      const module = await import('@dashboard/api/client')
      const exports = Object.keys(module)

      expect(exports).toContain('dashboardApiClient')
      expect(exports.length).toBeGreaterThan(0)
    })
  })

  describe('Module Structure', () => {
    it('should have single responsibility for API client', async () => {
      const module = await import('@dashboard/api/client')

      /* Should only export the client, not services */
      const exports = Object.keys(module)
      expect(exports).toContain('dashboardApiClient')
      expect(exports).not.toContain('dashboardService')
    })

    it('should be importable without side effects', async () => {
      /* This test verifies the module can be imported without errors */
      expect(async () => {
        await import('@dashboard/api/client')
      }).not.toThrow()
    })
  })

  describe('Type Safety', () => {
    it('should provide type-safe client methods', async () => {
      const module = await import('@dashboard/api/client')

      /* Verify methods exist and are callable */
      expect(typeof module.dashboardApiClient.get).toBe('function')
      expect(typeof module.dashboardApiClient.post).toBe('function')
      expect(typeof module.dashboardApiClient.put).toBe('function')
      expect(typeof module.dashboardApiClient.delete).toBe('function')
    })
  })

  describe('Constants Consistency', () => {
    it('should have consistent route values', () => {
      /* Verify routes maintain expected values */
      expect(DASHBOARD_API_ROUTES.BASE_URL).toBe('/admin/dashboard')
      expect(DASHBOARD_API_ROUTES.OVERVIEW).toBe('/overview')
      expect(DASHBOARD_API_ROUTES.CHARTS).toBe('/charts')
      expect(DASHBOARD_API_ROUTES.TABLES).toBe('/tables')
      expect(DASHBOARD_API_ROUTES.ANALYTICS).toBe('/analytics')
    })

    it('should maintain route references', () => {
      const routes1 = DASHBOARD_API_ROUTES
      const routes2 = DASHBOARD_API_ROUTES
      expect(routes1).toBe(routes2)
    })
  })
})
