/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Tenant management module imports */
import { TENANT_API_ROUTES } from '@tenant-management/constants'

describe('tenantApiClient', () => {
  describe('Client Configuration', () => {
    it('should use the correct base URL from constants', () => {
      expect(TENANT_API_ROUTES.BASE_URL).toBe('/tenants')
    })

    it('should export tenantApiClient instance', async () => {
      const module = await import('@tenant-management/api/client')

      expect(module.tenantApiClient).toBeDefined()
      expect(module.tenantApiClient).toHaveProperty('get')
      expect(module.tenantApiClient).toHaveProperty('post')
      expect(module.tenantApiClient).toHaveProperty('put')
      expect(module.tenantApiClient).toHaveProperty('delete')
    })
  })

  describe('HTTP Methods Availability', () => {
    it('should have GET method for fetching data', async () => {
      const module = await import('@tenant-management/api/client')

      expect(module.tenantApiClient.get).toBeTypeOf('function')
    })

    it('should have POST method for creating data', async () => {
      const module = await import('@tenant-management/api/client')

      expect(module.tenantApiClient.post).toBeTypeOf('function')
    })

    it('should have PUT method for updating data', async () => {
      const module = await import('@tenant-management/api/client')

      expect(module.tenantApiClient.put).toBeTypeOf('function')
    })

    it('should have DELETE method for removing data', async () => {
      const module = await import('@tenant-management/api/client')

      expect(module.tenantApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('Integration with Base Client', () => {
    it('should create client instance from base client factory', async () => {
      const module = await import('@tenant-management/api/client')

      /* Client should be defined with HTTP methods */
      expect(module.tenantApiClient).toBeDefined()
      expect(module.tenantApiClient.get).toBeTypeOf('function')
      expect(module.tenantApiClient.post).toBeTypeOf('function')
      expect(module.tenantApiClient.put).toBeTypeOf('function')
      expect(module.tenantApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions', () => {
      expect(TENANT_API_ROUTES).toHaveProperty('BASE_URL')
      expect(TENANT_API_ROUTES).toHaveProperty('LIST')
      expect(TENANT_API_ROUTES).toHaveProperty('LIST_WITH_BASIC_DETAILS')
      expect(TENANT_API_ROUTES).toHaveProperty('DETAILS')
      expect(TENANT_API_ROUTES).toHaveProperty('ACCOUNT')
      expect(TENANT_API_ROUTES).toHaveProperty('PAYMENT')
      expect(TENANT_API_ROUTES).toHaveProperty('ACTIONS')
      expect(TENANT_API_ROUTES).toHaveProperty('PROVISION')
    })

    it('should use standard REST API path structure', () => {
      expect(TENANT_API_ROUTES.BASE_URL).toBe('/tenants')
      expect(TENANT_API_ROUTES.LIST).toBe('/list')
      expect(TENANT_API_ROUTES.LIST_WITH_BASIC_DETAILS).toBe('/list/basic')
      expect(TENANT_API_ROUTES.DETAILS).toBe('/details/:id')
    })

    it('should have account management endpoint routes', () => {
      expect(TENANT_API_ROUTES.ACCOUNT).toHaveProperty('CREATE')
      expect(TENANT_API_ROUTES.ACCOUNT).toHaveProperty('REQUEST_OTP')
      expect(TENANT_API_ROUTES.ACCOUNT).toHaveProperty('VERIFY_OTP')
      expect(TENANT_API_ROUTES.ACCOUNT).toHaveProperty('STATUS')
      expect(TENANT_API_ROUTES.ACCOUNT).toHaveProperty('ASSIGN_PLAN')
      expect(TENANT_API_ROUTES.ACCOUNT).toHaveProperty('GET_ASSIGNED_PLAN')
      expect(TENANT_API_ROUTES.ACCOUNT.CREATE).toBe('/account/create')
      expect(TENANT_API_ROUTES.ACCOUNT.REQUEST_OTP).toBe('/account/request-otp')
      expect(TENANT_API_ROUTES.ACCOUNT.VERIFY_OTP).toBe('/account/verify-otp')
      expect(TENANT_API_ROUTES.ACCOUNT.STATUS).toBe('/:id/status')
      expect(TENANT_API_ROUTES.ACCOUNT.ASSIGN_PLAN).toBe('/:id/plan')
      expect(TENANT_API_ROUTES.ACCOUNT.GET_ASSIGNED_PLAN).toBe('/:id/plan')
    })

    it('should have payment endpoint routes', () => {
      expect(TENANT_API_ROUTES.PAYMENT).toHaveProperty('INITIATE')
      expect(TENANT_API_ROUTES.PAYMENT).toHaveProperty('STATUS')
      expect(TENANT_API_ROUTES.PAYMENT).toHaveProperty('COMPLETE')
      expect(TENANT_API_ROUTES.PAYMENT.INITIATE).toBe('/account/payment/initiate')
      expect(TENANT_API_ROUTES.PAYMENT.STATUS).toBe('/account/payment/status')
      expect(TENANT_API_ROUTES.PAYMENT.COMPLETE).toBe('/account/payment/complete')
    })

    it('should have tenant action endpoint routes', () => {
      expect(TENANT_API_ROUTES.ACTIONS).toHaveProperty('SUSPEND')
      expect(TENANT_API_ROUTES.ACTIONS).toHaveProperty('ACTIVATE')
      expect(TENANT_API_ROUTES.ACTIONS).toHaveProperty('HOLD')
      expect(TENANT_API_ROUTES.ACTIONS).toHaveProperty('DELETE')
      expect(TENANT_API_ROUTES.ACTIONS.SUSPEND).toBe('/:id/suspend')
      expect(TENANT_API_ROUTES.ACTIONS.ACTIVATE).toBe('/:id/activate')
      expect(TENANT_API_ROUTES.ACTIONS.HOLD).toBe('/:id/hold')
      expect(TENANT_API_ROUTES.ACTIONS.DELETE).toBe('/:id')
    })

    it('should have provisioning endpoint routes', () => {
      expect(TENANT_API_ROUTES.PROVISION).toHaveProperty('START')
      expect(TENANT_API_ROUTES.PROVISION.START).toBe('/:id/provision')
    })
  })
})
