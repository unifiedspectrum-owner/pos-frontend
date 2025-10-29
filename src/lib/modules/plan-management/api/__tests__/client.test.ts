/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Plan management module imports */
import { PLAN_API_ROUTES } from '@plan-management/constants/routes'

describe('planApiClient', () => {
  describe('Client Configuration', () => {
    it('should use the correct base URL from constants', () => {
      expect(PLAN_API_ROUTES.BASE_URL).toBe('/plans')
    })

    it('should export planApiClient instance', async () => {
      const module = await import('@plan-management/api/client')

      expect(module.planApiClient).toBeDefined()
      expect(module.planApiClient).toHaveProperty('get')
      expect(module.planApiClient).toHaveProperty('post')
      expect(module.planApiClient).toHaveProperty('put')
      expect(module.planApiClient).toHaveProperty('delete')
    })
  })

  describe('HTTP Methods Availability', () => {
    it('should have GET method for fetching data', async () => {
      const module = await import('@plan-management/api/client')

      expect(module.planApiClient.get).toBeTypeOf('function')
    })

    it('should have POST method for creating data', async () => {
      const module = await import('@plan-management/api/client')

      expect(module.planApiClient.post).toBeTypeOf('function')
    })

    it('should have PUT method for updating data', async () => {
      const module = await import('@plan-management/api/client')

      expect(module.planApiClient.put).toBeTypeOf('function')
    })

    it('should have DELETE method for removing data', async () => {
      const module = await import('@plan-management/api/client')

      expect(module.planApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('Integration with Base Client', () => {
    it('should create client instance from base client factory', async () => {
      const module = await import('@plan-management/api/client')

      /* Client should be defined with HTTP methods */
      expect(module.planApiClient).toBeDefined()
      expect(module.planApiClient.get).toBeTypeOf('function')
      expect(module.planApiClient.post).toBeTypeOf('function')
      expect(module.planApiClient.put).toBeTypeOf('function')
      expect(module.planApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions for plans', () => {
      expect(PLAN_API_ROUTES).toHaveProperty('BASE_URL')
      expect(PLAN_API_ROUTES).toHaveProperty('PLAN')
      expect(PLAN_API_ROUTES.PLAN).toHaveProperty('CREATE')
      expect(PLAN_API_ROUTES.PLAN).toHaveProperty('LIST')
      expect(PLAN_API_ROUTES.PLAN).toHaveProperty('DETAILS')
      expect(PLAN_API_ROUTES.PLAN).toHaveProperty('UPDATE')
      expect(PLAN_API_ROUTES.PLAN).toHaveProperty('DELETE')
    })

    it('should have correct route definitions for features', () => {
      expect(PLAN_API_ROUTES).toHaveProperty('FEATURE')
      expect(PLAN_API_ROUTES.FEATURE).toHaveProperty('CREATE')
      expect(PLAN_API_ROUTES.FEATURE).toHaveProperty('LIST')
    })

    it('should have correct route definitions for add-ons', () => {
      expect(PLAN_API_ROUTES).toHaveProperty('ADD_ON')
      expect(PLAN_API_ROUTES.ADD_ON).toHaveProperty('CREATE')
      expect(PLAN_API_ROUTES.ADD_ON).toHaveProperty('LIST')
    })

    it('should have correct route definitions for SLAs', () => {
      expect(PLAN_API_ROUTES).toHaveProperty('SLA')
      expect(PLAN_API_ROUTES.SLA).toHaveProperty('CREATE')
      expect(PLAN_API_ROUTES.SLA).toHaveProperty('LIST')
    })

    it('should use standard REST API path structure for plans', () => {
      expect(PLAN_API_ROUTES.BASE_URL).toBe('/plans')
      expect(PLAN_API_ROUTES.PLAN.CREATE).toBe('')
      expect(PLAN_API_ROUTES.PLAN.LIST).toBe('')
      expect(PLAN_API_ROUTES.PLAN.DETAILS).toBe('/:id')
      expect(PLAN_API_ROUTES.PLAN.UPDATE).toBe('/:id')
      expect(PLAN_API_ROUTES.PLAN.DELETE).toBe('/:id')
    })

    it('should have correct endpoint routes for features', () => {
      expect(PLAN_API_ROUTES.FEATURE.CREATE).toBe('/features')
      expect(PLAN_API_ROUTES.FEATURE.LIST).toBe('/features')
    })

    it('should have correct endpoint routes for add-ons', () => {
      expect(PLAN_API_ROUTES.ADD_ON.CREATE).toBe('/add-ons')
      expect(PLAN_API_ROUTES.ADD_ON.LIST).toBe('/add-ons')
    })

    it('should have correct endpoint routes for SLAs', () => {
      expect(PLAN_API_ROUTES.SLA.CREATE).toBe('/sla')
      expect(PLAN_API_ROUTES.SLA.LIST).toBe('/sla')
    })
  })
})
