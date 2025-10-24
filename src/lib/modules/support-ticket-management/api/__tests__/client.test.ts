/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { SUPPORT_TICKET_API_ROUTES } from '@support-ticket-management/constants'

describe('supportTicketApiClient', () => {
  describe('Client Configuration', () => {
    it('should use the correct base URL from constants', () => {
      expect(SUPPORT_TICKET_API_ROUTES.BASE_URL).toBe('/support-tickets')
    })

    it('should export supportTicketApiClient instance', async () => {
      const module = await import('@support-ticket-management/api/client')

      expect(module.supportTicketApiClient).toBeDefined()
      expect(module.supportTicketApiClient).toHaveProperty('get')
      expect(module.supportTicketApiClient).toHaveProperty('post')
      expect(module.supportTicketApiClient).toHaveProperty('put')
      expect(module.supportTicketApiClient).toHaveProperty('delete')
    })
  })

  describe('HTTP Methods Availability', () => {
    it('should have GET method for fetching data', async () => {
      const module = await import('@support-ticket-management/api/client')

      expect(module.supportTicketApiClient.get).toBeTypeOf('function')
    })

    it('should have POST method for creating data', async () => {
      const module = await import('@support-ticket-management/api/client')

      expect(module.supportTicketApiClient.post).toBeTypeOf('function')
    })

    it('should have PUT method for updating data', async () => {
      const module = await import('@support-ticket-management/api/client')

      expect(module.supportTicketApiClient.put).toBeTypeOf('function')
    })

    it('should have DELETE method for removing data', async () => {
      const module = await import('@support-ticket-management/api/client')

      expect(module.supportTicketApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('Integration with Base Client', () => {
    it('should create client instance from base client factory', async () => {
      const module = await import('@support-ticket-management/api/client')

      /* Client should be defined with HTTP methods */
      expect(module.supportTicketApiClient).toBeDefined()
      expect(module.supportTicketApiClient.get).toBeTypeOf('function')
      expect(module.supportTicketApiClient.post).toBeTypeOf('function')
      expect(module.supportTicketApiClient.put).toBeTypeOf('function')
      expect(module.supportTicketApiClient.delete).toBeTypeOf('function')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions', () => {
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('BASE_URL')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('LIST')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('DETAILS')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('CREATE')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('UPDATE')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('DELETE')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('UPDATE_STATUS')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('ASSIGNMENT')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('ADD_COMMENT')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('GET_COMMENTS')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('CATEGORIES')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('ATTACHEMENT')
    })

    it('should use standard REST API path structure', () => {
      expect(SUPPORT_TICKET_API_ROUTES.BASE_URL).toBe('/support-tickets')
      expect(SUPPORT_TICKET_API_ROUTES.LIST).toBe('/list')
      expect(SUPPORT_TICKET_API_ROUTES.DETAILS).toBe('/:id')
      expect(SUPPORT_TICKET_API_ROUTES.CREATE).toBe('')
      expect(SUPPORT_TICKET_API_ROUTES.UPDATE).toBe('/:id')
      expect(SUPPORT_TICKET_API_ROUTES.DELETE).toBe('/:id')
    })

    it('should have ticket-specific endpoint routes', () => {
      expect(SUPPORT_TICKET_API_ROUTES.UPDATE_STATUS).toBe('/:id/status')
      expect(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT).toBe('/:id/communications')
      expect(SUPPORT_TICKET_API_ROUTES.GET_COMMENTS).toBe('/:id/communications')
      expect(SUPPORT_TICKET_API_ROUTES.CATEGORIES).toBe('/categories')
    })

    it('should have assignment nested routes', () => {
      expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT).toHaveProperty('CREATE')
      expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT).toHaveProperty('GET')
      expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.CREATE).toBe('/:id/assign')
      expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.GET).toBe('/:id/assignment')
    })

    it('should have attachment nested routes', () => {
      expect(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT).toHaveProperty('DOWNLOAD')
      expect(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD).toBe('/attachments/:id/download')
    })
  })
})
