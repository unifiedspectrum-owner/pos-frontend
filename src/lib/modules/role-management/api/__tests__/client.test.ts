/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Role management module imports */
import { ROLE_API_ROUTES } from '@role-management/constants'

describe('roleApiClient', () => {
  describe('Client Configuration', () => {
    it('should use the correct base URL from constants', () => {
      expect(ROLE_API_ROUTES.BASE_URL).toBe('/users/roles')
    })

    it('should export roleApiClient instance', async () => {
      const module = await import('@role-management/api/client')

      expect(module.roleApiClient).toBeDefined()
      expect(module.roleApiClient).toHaveProperty('get')
      expect(module.roleApiClient).toHaveProperty('post')
      expect(module.roleApiClient).toHaveProperty('put')
      expect(module.roleApiClient).toHaveProperty('delete')
    })
  })

  describe('HTTP Methods Availability', () => {
    it('should have GET method for fetching data', async () => {
      const module = await import('@role-management/api/client')

      expect(module.roleApiClient.get).toBeTypeOf('function')
    })

    it('should have POST method for creating data', async () => {
      const module = await import('@role-management/api/client')

      expect(module.roleApiClient.post).toBeTypeOf('function')
    })

    it('should have PUT method for updating data', async () => {
      const module = await import('@role-management/api/client')

      expect(module.roleApiClient.put).toBeTypeOf('function')
    })

    it('should have DELETE method for removing data', async () => {
      const module = await import('@role-management/api/client')

      expect(module.roleApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('Integration with Base Client', () => {
    it('should create client instance from base client factory', async () => {
      const module = await import('@role-management/api/client')

      /* Client should be defined with HTTP methods */
      expect(module.roleApiClient).toBeDefined()
      expect(module.roleApiClient.get).toBeTypeOf('function')
      expect(module.roleApiClient.post).toBeTypeOf('function')
      expect(module.roleApiClient.put).toBeTypeOf('function')
      expect(module.roleApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions', () => {
      expect(ROLE_API_ROUTES).toHaveProperty('BASE_URL')
      expect(ROLE_API_ROUTES).toHaveProperty('LIST')
      expect(ROLE_API_ROUTES).toHaveProperty('DETAILS')
      expect(ROLE_API_ROUTES).toHaveProperty('CREATE')
      expect(ROLE_API_ROUTES).toHaveProperty('UPDATE')
      expect(ROLE_API_ROUTES).toHaveProperty('DELETE')
      expect(ROLE_API_ROUTES).toHaveProperty('PERMISSIONS')
    })

    it('should use standard REST API path structure', () => {
      expect(ROLE_API_ROUTES.BASE_URL).toBe('/users/roles')
      expect(ROLE_API_ROUTES.LIST).toBe('/list')
      expect(ROLE_API_ROUTES.DETAILS).toBe('/:id')
      expect(ROLE_API_ROUTES.CREATE).toBe('')
      expect(ROLE_API_ROUTES.UPDATE).toBe('/:id')
      expect(ROLE_API_ROUTES.DELETE).toBe('/:id')
    })

    it('should have permissions endpoint route', () => {
      expect(ROLE_API_ROUTES.PERMISSIONS).toBe('/permissions')
    })
  })
})
