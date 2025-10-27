/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Auth management module imports */
import { AUTH_API_ROUTES } from '@auth-management/constants'

describe('authApiClient', () => {
  describe('Client Configuration', () => {
    it('should export authApiClient instance', async () => {
      const module = await import('@auth-management/api/client')

      expect(module.authApiClient).toBeDefined()
      expect(module.authApiClient).toHaveProperty('get')
      expect(module.authApiClient).toHaveProperty('post')
      expect(module.authApiClient).toHaveProperty('put')
      expect(module.authApiClient).toHaveProperty('delete')
    })
  })

  describe('HTTP Methods Availability', () => {
    it('should have GET method for fetching data', async () => {
      const module = await import('@auth-management/api/client')

      expect(module.authApiClient.get).toBeTypeOf('function')
    })

    it('should have POST method for creating data', async () => {
      const module = await import('@auth-management/api/client')

      expect(module.authApiClient.post).toBeTypeOf('function')
    })

    it('should have PUT method for updating data', async () => {
      const module = await import('@auth-management/api/client')

      expect(module.authApiClient.put).toBeTypeOf('function')
    })

    it('should have DELETE method for removing data', async () => {
      const module = await import('@auth-management/api/client')

      expect(module.authApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('Integration with Base Client', () => {
    it('should create client instance from base client factory', async () => {
      const module = await import('@auth-management/api/client')

      /* Client should be defined with HTTP methods */
      expect(module.authApiClient).toBeDefined()
      expect(module.authApiClient.get).toBeTypeOf('function')
      expect(module.authApiClient.post).toBeTypeOf('function')
      expect(module.authApiClient.put).toBeTypeOf('function')
      expect(module.authApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions', () => {
      expect(AUTH_API_ROUTES).toHaveProperty('LOGIN')
      expect(AUTH_API_ROUTES).toHaveProperty('VERIFY_2FA')
      expect(AUTH_API_ROUTES).toHaveProperty('GENERATE_2FA')
      expect(AUTH_API_ROUTES).toHaveProperty('ENABLE_2FA')
      expect(AUTH_API_ROUTES).toHaveProperty('DISABLE_2FA')
      expect(AUTH_API_ROUTES).toHaveProperty('LOGOUT')
      expect(AUTH_API_ROUTES).toHaveProperty('REFRESH')
      expect(AUTH_API_ROUTES).toHaveProperty('FORGOT_PASSWORD')
      expect(AUTH_API_ROUTES).toHaveProperty('RESET_PASSWORD')
      expect(AUTH_API_ROUTES).toHaveProperty('VALIDATE_TOKEN')
    })

    it('should use standard authentication API path structure', () => {
      expect(AUTH_API_ROUTES.LOGIN).toBe('/login')
      expect(AUTH_API_ROUTES.LOGOUT).toBe('/logout')
      expect(AUTH_API_ROUTES.REFRESH).toBe('/refresh')
      expect(AUTH_API_ROUTES.FORGOT_PASSWORD).toBe('/forgot-password')
      expect(AUTH_API_ROUTES.RESET_PASSWORD).toBe('/reset-password')
      expect(AUTH_API_ROUTES.VALIDATE_TOKEN).toBe('/validate-reset-token')
    })

    it('should have 2FA endpoint routes', () => {
      expect(AUTH_API_ROUTES.VERIFY_2FA).toBe('/2fa/verify')
      expect(AUTH_API_ROUTES.GENERATE_2FA).toBe('/2fa/generate')
      expect(AUTH_API_ROUTES.ENABLE_2FA).toBe('/2fa/enable')
      expect(AUTH_API_ROUTES.DISABLE_2FA).toBe('/2fa/disable')
    })

    it('should have all required authentication routes', () => {
      const expectedRoutes = [
        'LOGIN',
        'VERIFY_2FA',
        'GENERATE_2FA',
        'ENABLE_2FA',
        'DISABLE_2FA',
        'LOGOUT',
        'REFRESH',
        'FORGOT_PASSWORD',
        'RESET_PASSWORD',
        'VALIDATE_TOKEN'
      ]

      expectedRoutes.forEach(route => {
        expect(AUTH_API_ROUTES).toHaveProperty(route)
      })
    })
  })
})
