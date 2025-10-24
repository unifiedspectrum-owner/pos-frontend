/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* User management module imports */
import { USER_API_ROUTES } from '@user-management/constants'

describe('userApiClient', () => {
  describe('Client Configuration', () => {
    it('should use the correct base URL from constants', () => {
      expect(USER_API_ROUTES.BASE_URL).toBe('/users')
    })

    it('should export userApiClient instance', async () => {
      const module = await import('@user-management/api/client')

      expect(module.userApiClient).toBeDefined()
      expect(module.userApiClient).toHaveProperty('get')
      expect(module.userApiClient).toHaveProperty('post')
      expect(module.userApiClient).toHaveProperty('put')
      expect(module.userApiClient).toHaveProperty('delete')
    })
  })

  describe('HTTP Methods Availability', () => {
    it('should have GET method for fetching data', async () => {
      const module = await import('@user-management/api/client')

      expect(module.userApiClient.get).toBeTypeOf('function')
    })

    it('should have POST method for creating data', async () => {
      const module = await import('@user-management/api/client')

      expect(module.userApiClient.post).toBeTypeOf('function')
    })

    it('should have PUT method for updating data', async () => {
      const module = await import('@user-management/api/client')

      expect(module.userApiClient.put).toBeTypeOf('function')
    })

    it('should have DELETE method for removing data', async () => {
      const module = await import('@user-management/api/client')

      expect(module.userApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('Integration with Base Client', () => {
    it('should create client instance from base client factory', async () => {
      const module = await import('@user-management/api/client')

      /* Client should be defined with HTTP methods */
      expect(module.userApiClient).toBeDefined()
      expect(module.userApiClient.get).toBeTypeOf('function')
      expect(module.userApiClient.post).toBeTypeOf('function')
      expect(module.userApiClient.put).toBeTypeOf('function')
      expect(module.userApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions', () => {
      expect(USER_API_ROUTES).toHaveProperty('BASE_URL')
      expect(USER_API_ROUTES).toHaveProperty('LIST')
      expect(USER_API_ROUTES).toHaveProperty('DETAILS')
      expect(USER_API_ROUTES).toHaveProperty('CREATE')
      expect(USER_API_ROUTES).toHaveProperty('UPDATE')
      expect(USER_API_ROUTES).toHaveProperty('DELETE')
      expect(USER_API_ROUTES).toHaveProperty('PERMISSIONS_SUMMARY')
    })

    it('should use standard REST API path structure', () => {
      expect(USER_API_ROUTES.BASE_URL).toBe('/users')
      expect(USER_API_ROUTES.LIST).toBe('/list')
      expect(USER_API_ROUTES.DETAILS).toBe('/:id')
      expect(USER_API_ROUTES.CREATE).toBe('')
      expect(USER_API_ROUTES.UPDATE).toBe('/:id')
      expect(USER_API_ROUTES.DELETE).toBe('/:id')
    })

    it('should have permissions endpoint route', () => {
      expect(USER_API_ROUTES.PERMISSIONS_SUMMARY).toBe('/permissions/summary')
    })
  })
})
