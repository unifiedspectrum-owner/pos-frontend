/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Support ticket management module imports */
import type { SupportTicketListResponse, SupportTicketDetailsResponse, CreateSupportTicketApiResponse, UpdateSupportTicketApiResponse, SupportTicketDeletionResponse, UpdateTicketStatusApiResponse } from '@support-ticket-management/types'
import type { CreateTicketFormSchema, UpdateTicketFormSchema, UpdateTicketStatusFormSchema } from '@support-ticket-management/schemas'
import { SUPPORT_TICKET_API_ROUTES } from '@support-ticket-management/constants'

/* Helper to create mock axios config */
const createMockAxiosConfig = (): InternalAxiosRequestConfig => ({
  headers: {} as AxiosRequestHeaders,
  url: '',
  method: 'get'
})

/* Mock axios instance */
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  }
}

/* Mock createApiClient to return our mock instance */
vi.mock('@shared/api/base-client', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance)
}))

/* Mock the client module to use our mock instance */
vi.mock('@support-ticket-management/api/client', () => ({
  supportTicketApiClient: mockAxiosInstance
}))

describe('ticketsService', () => {
  let ticketsService: typeof import('@support-ticket-management/api/services/tickets').ticketsService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@support-ticket-management/api/services/tickets')
    ticketsService = module.ticketsService
  })

  beforeEach(() => {
    /* Clear HTTP method mocks */
    mockAxiosInstance.get.mockClear()
    mockAxiosInstance.post.mockClear()
    mockAxiosInstance.put.mockClear()
    mockAxiosInstance.delete.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('API Client Configuration', () => {
    it('should have ticketsService with all required methods', () => {
      expect(ticketsService).toBeDefined()
      expect(ticketsService.listAllSupportTickets).toBeTypeOf('function')
      expect(ticketsService.getSupportTicketDetails).toBeTypeOf('function')
      expect(ticketsService.createSupportTicket).toBeTypeOf('function')
      expect(ticketsService.updateSupportTicket).toBeTypeOf('function')
      expect(ticketsService.deleteSupportTicket).toBeTypeOf('function')
      expect(ticketsService.updateTicketStatus).toBeTypeOf('function')
    })
  })

  describe('listAllSupportTickets', () => {
    it('should fetch paginated ticket list successfully with default parameters', async () => {
      const mockResponse: AxiosResponse<SupportTicketListResponse> = {
        data: {
          success: true,
          message: 'Support tickets retrieved successfully',
          data: {
            tickets: [
              {
                id: 1,
                ticket_id: 'TKT-001',
                tenant_id: 'tenant-1',
                subject: 'Login Issue',
                status: 'open',
                created_at: '2024-01-01T00:00:00Z',
                resolution_due: '2024-01-03T00:00:00Z',
                first_response_at: '2024-01-01T01:00:00Z',
                category_name: 'Technical',
                assigned_to_user_name: null
              },
              {
                id: 2,
                ticket_id: 'TKT-002',
                tenant_id: 'tenant-1',
                subject: 'Billing Question',
                status: 'in_progress',
                created_at: '2024-01-02T00:00:00Z',
                resolution_due: null,
                first_response_at: '2024-01-02T00:30:00Z',
                category_name: 'Billing',
                assigned_to_user_name: 'Support Agent'
              }
            ]
          },
          pagination: {
            current_page: 1,
            limit: 10,
            total_count: 2,
            total_pages: 1,
            has_next_page: false,
            has_prev_page: false
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await ticketsService.listAllSupportTickets()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.LIST, {
        params: { page: undefined, limit: undefined }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch paginated ticket list with custom page and limit', async () => {
      const mockResponse: AxiosResponse<SupportTicketListResponse> = {
        data: {
          success: true,
          message: 'Support tickets retrieved successfully',
          data: {
            tickets: []
          },
          pagination: {
            current_page: 2,
            limit: 5,
            total_count: 15,
            total_pages: 3,
            has_next_page: true,
            has_prev_page: true
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await ticketsService.listAllSupportTickets(2, 5)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.LIST, {
        params: { page: 2, limit: 5 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching ticket list', async () => {
      const mockError = new Error('Failed to fetch tickets')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(ticketsService.listAllSupportTickets()).rejects.toThrow('Failed to fetch tickets')
      expect(consoleSpy).toHaveBeenCalledWith('[TicketsService] Failed to list support tickets:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getSupportTicketDetails', () => {
    it('should fetch ticket details successfully', async () => {
      const ticketId = '1'
      const mockResponse: AxiosResponse<SupportTicketDetailsResponse> = {
        data: {
          success: true,
          message: 'Support ticket details retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            ticket: {
              id: 1,
              ticket_id: 'TKT-001',
              tenant_id: 'tenant-1',
              requester_user_id: 1,
              requester_email: 'john@example.com',
              requester_name: 'John Doe',
              requester_phone: '+1234567890',
              category_id: 1,
              subject: 'Login Issue',
              status: 'open',
              created_at: '2024-01-01T00:00:00Z',
              resolution_due: '2024-01-03T00:00:00Z',
              first_response_at: '2024-01-01T01:00:00Z',
              resolved_at: null,
              closed_at: null,
              escalated_at: null,
              escalated_by: null,
              escalation_reason: null,
              satisfaction_rating: null,
              satisfaction_feedback: null,
              satisfaction_submitted_at: null,
              internal_notes: null,
              is_active: true,
              updated_at: '2024-01-01T00:00:00Z',
              is_overdue: false,
              category_details: {
                id: 1,
                name: 'Technical',
                description: 'Technical support',
                is_active: true,
                display_order: 1
              },
              assignment_details: {
                assigned_to_user_id: 2,
                assigned_to_user_name: 'Jane Smith',
                assigned_to_role_id: 3,
                assigned_to_role_name: 'Support Agent',
                assigned_at: '2024-01-01T02:00:00Z'
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await ticketsService.getSupportTicketDetails(ticketId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.DETAILS.replace(':id', ticketId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.ticket.id).toBe(1)
      expect(result.data?.ticket.subject).toBe('Login Issue')
    })

    it('should handle errors when fetching ticket details', async () => {
      const ticketId = '999'
      const mockError = new Error('Ticket not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(ticketsService.getSupportTicketDetails(ticketId)).rejects.toThrow('Ticket not found')
      expect(consoleSpy).toHaveBeenCalledWith('[TicketsService] Failed to get support ticket details:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('createSupportTicket', () => {
    it('should create a new support ticket successfully', async () => {
      const mockTicketData: CreateTicketFormSchema = {
        tenant_id: '1',
        requester_email: 'user@example.com',
        requester_name: 'John Doe',
        category_id: '1',
        subject: 'New Issue with Login',
        message_content: 'Description of the issue in detail'
      }

      const mockResponse: AxiosResponse<CreateSupportTicketApiResponse> = {
        data: {
          success: true,
          message: 'Support ticket created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            ticketId: 5
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await ticketsService.createSupportTicket(mockTicketData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.CREATE, mockTicketData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.ticketId).toBe(5)
    })

    it('should handle ticket creation errors', async () => {
      const mockTicketData: CreateTicketFormSchema = {
        tenant_id: '1',
        requester_email: 'user@example.com',
        requester_name: 'Jane Doe',
        category_id: '1',
        subject: 'Issue requiring attention',
        message_content: 'Description of the issue'
      }

      const mockError = new Error('Failed to create ticket')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(ticketsService.createSupportTicket(mockTicketData)).rejects.toThrow('Failed to create ticket')
      expect(consoleSpy).toHaveBeenCalledWith('[TicketsService] Failed to create support ticket:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('updateSupportTicket', () => {
    it('should update support ticket successfully with full data', async () => {
      const ticketId = '1'
      const mockUpdateData: UpdateTicketFormSchema = {
        subject: 'Updated Subject',
        message_content: 'Updated description',
        category_id: '2'
      }

      const mockResponse: AxiosResponse<UpdateSupportTicketApiResponse> = {
        data: {
          success: true,
          message: 'Support ticket updated successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            ticketId: 1
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await ticketsService.updateSupportTicket(ticketId, mockUpdateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.UPDATE.replace(':id', ticketId), mockUpdateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should update support ticket with partial data', async () => {
      const ticketId = '2'
      const mockUpdateData: UpdateTicketFormSchema = {
        subject: 'Partially updated subject'
      }

      const mockResponse: AxiosResponse<UpdateSupportTicketApiResponse> = {
        data: {
          success: true,
          message: 'Support ticket updated successfully',
          timestamp: '2024-01-02T00:00:00Z',
          data: {
            ticketId: 2
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await ticketsService.updateSupportTicket(ticketId, mockUpdateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.UPDATE.replace(':id', ticketId), mockUpdateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle update errors', async () => {
      const ticketId = '1'
      const mockUpdateData: UpdateTicketFormSchema = {
        subject: 'Updated Subject'
      }

      const mockError = new Error('Failed to update ticket')
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(ticketsService.updateSupportTicket(ticketId, mockUpdateData)).rejects.toThrow('Failed to update ticket')
      expect(consoleSpy).toHaveBeenCalledWith('[TicketsService] Failed to update support ticket:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('deleteSupportTicket', () => {
    it('should delete support ticket successfully', async () => {
      const ticketId = '5'
      const mockResponse: AxiosResponse<SupportTicketDeletionResponse> = {
        data: {
          success: true,
          message: 'Support ticket deleted successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            ticketId: 5
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.delete.mockResolvedValue(mockResponse)

      const result = await ticketsService.deleteSupportTicket(ticketId)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.DELETE.replace(':id', ticketId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.ticketId).toBe(5)
    })

    it('should handle deletion errors', async () => {
      const ticketId = '999'
      const mockError = new Error('Ticket not found')
      mockAxiosInstance.delete.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(ticketsService.deleteSupportTicket(ticketId)).rejects.toThrow('Ticket not found')
      expect(consoleSpy).toHaveBeenCalledWith('[TicketsService] Failed to delete support ticket:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('updateTicketStatus', () => {
    it('should update ticket status to resolved successfully', async () => {
      const ticketId = '1'
      const mockStatusData: UpdateTicketStatusFormSchema = {
        status: 'resolved',
        status_reason: 'Issue resolved by restarting the service'
      }

      const mockResponse: AxiosResponse<UpdateTicketStatusApiResponse> = {
        data: {
          success: true,
          message: 'Ticket status updated successfully',
          data: {
            ticket_id: '1',
            status: 'resolved'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await ticketsService.updateTicketStatus(ticketId, mockStatusData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.UPDATE_STATUS.replace(':id', ticketId), mockStatusData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.status).toBe('resolved')
    })

    it('should update ticket status to closed successfully', async () => {
      const ticketId = '2'
      const mockStatusData: UpdateTicketStatusFormSchema = {
        status: 'closed',
        status_reason: 'Ticket resolved and confirmed by customer'
      }

      const mockResponse: AxiosResponse<UpdateTicketStatusApiResponse> = {
        data: {
          success: true,
          message: 'Ticket status updated successfully',
          data: {
            ticket_id: '2',
            status: 'closed'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await ticketsService.updateTicketStatus(ticketId, mockStatusData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.UPDATE_STATUS.replace(':id', ticketId), mockStatusData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle status update errors', async () => {
      const ticketId = '1'
      const mockStatusData: UpdateTicketStatusFormSchema = {
        status: 'closed',
        status_reason: 'Attempting to close ticket'
      }

      const mockError = new Error('Failed to update status')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(ticketsService.updateTicketStatus(ticketId, mockStatusData)).rejects.toThrow('Failed to update status')
      expect(consoleSpy).toHaveBeenCalledWith('[TicketsService] Failed to update ticket status:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for list tickets', async () => {
      const mockResponse: AxiosResponse<SupportTicketListResponse> = {
        data: {
          success: true,
          message: 'Tickets retrieved',
          data: {
            tickets: []
          },
          pagination: {
            current_page: 1,
            limit: 10,
            total_count: 0,
            total_pages: 1,
            has_next_page: false,
            has_prev_page: false
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await ticketsService.listAllSupportTickets()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('tickets')
      expect(result).toHaveProperty('pagination')
    })

    it('should return proper response structure for create ticket', async () => {
      const mockResponse: AxiosResponse<CreateSupportTicketApiResponse> = {
        data: {
          success: true,
          message: 'Ticket created',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            ticketId: 1
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await ticketsService.createSupportTicket({} as CreateTicketFormSchema)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('ticketId')
      expect(result).toHaveProperty('timestamp')
    })
  })
})
