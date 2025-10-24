/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Support ticket management module imports */
import type { AssignTicketToUserApiResponse, GetCurrentTicketAssignmentApiResponse } from '@support-ticket-management/types'
import type { AssignTicketFormSchema } from '@support-ticket-management/schemas'
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

describe('assignmentsService', () => {
  let assignmentsService: typeof import('@support-ticket-management/api/services/assignments').assignmentsService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@support-ticket-management/api/services/assignments')
    assignmentsService = module.assignmentsService
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
    it('should have assignmentsService with all required methods', () => {
      expect(assignmentsService).toBeDefined()
      expect(assignmentsService.assignTicketToUser).toBeTypeOf('function')
      expect(assignmentsService.getCurrentAssignment).toBeTypeOf('function')
    })
  })

  describe('assignTicketToUser', () => {
    it('should assign ticket to user successfully', async () => {
      const ticketId = '1'
      const mockAssignmentData: AssignTicketFormSchema = {
        user_id: '2',
        reason: 'Assigning to technical support team'
      }

      const mockResponse: AxiosResponse<AssignTicketToUserApiResponse> = {
        data: {
          success: true,
          message: 'Ticket assigned successfully',
          data: {
            ticket_id: '1'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await assignmentsService.assignTicketToUser(ticketId, mockAssignmentData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.CREATE.replace(':id', ticketId), mockAssignmentData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.ticket_id).toBe('1')
    })

    it('should assign ticket to different user successfully', async () => {
      const ticketId = '5'
      const mockAssignmentData: AssignTicketFormSchema = {
        user_id: '10',
        reason: 'Escalating to senior support agent'
      }

      const mockResponse: AxiosResponse<AssignTicketToUserApiResponse> = {
        data: {
          success: true,
          message: 'Ticket reassigned successfully',
          data: {
            ticket_id: '5'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await assignmentsService.assignTicketToUser(ticketId, mockAssignmentData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.CREATE.replace(':id', ticketId), mockAssignmentData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle assignment errors when user not found', async () => {
      const ticketId = '1'
      const mockAssignmentData: AssignTicketFormSchema = {
        user_id: '999',
        reason: 'Assigning to non-existent user'
      }

      const mockError = new Error('User not found')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(assignmentsService.assignTicketToUser(ticketId, mockAssignmentData)).rejects.toThrow('User not found')
      expect(consoleSpy).toHaveBeenCalledWith('[AssignmentsService] Failed to assign ticket:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle assignment errors when ticket not found', async () => {
      const ticketId = '999'
      const mockAssignmentData: AssignTicketFormSchema = {
        user_id: '2',
        reason: 'Trying to assign non-existent ticket'
      }

      const mockError = new Error('Ticket not found')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(assignmentsService.assignTicketToUser(ticketId, mockAssignmentData)).rejects.toThrow('Ticket not found')
      expect(consoleSpy).toHaveBeenCalledWith('[AssignmentsService] Failed to assign ticket:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getCurrentAssignment', () => {
    it('should fetch current ticket assignment successfully', async () => {
      const ticketId = '1'
      const mockResponse: AxiosResponse<GetCurrentTicketAssignmentApiResponse> = {
        data: {
          success: true,
          message: 'Current assignment retrieved successfully',
          data: {
            ticket_id: '1',
            assignment_id: '1',
            assigned_to_user_id: '2',
            assigned_to_user_name: 'Jane Smith',
            assigned_to_role_id: '3',
            assigned_to_role_name: 'Support Agent',
            assigned_at: '2024-01-01T00:00:00Z'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await assignmentsService.getCurrentAssignment(ticketId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.GET.replace(':id', ticketId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.assigned_to_user_name).toBe('Jane Smith')
    })

    it('should fetch assignment with full details', async () => {
      const ticketId = '5'
      const mockResponse: AxiosResponse<GetCurrentTicketAssignmentApiResponse> = {
        data: {
          success: true,
          message: 'Current assignment retrieved successfully',
          data: {
            ticket_id: '5',
            assignment_id: '8',
            assigned_to_user_id: '10',
            assigned_to_user_name: 'Support Agent',
            assigned_to_role_id: '5',
            assigned_to_role_name: 'Senior Support',
            assigned_at: '2024-01-05T10:30:00Z'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await assignmentsService.getCurrentAssignment(ticketId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.GET.replace(':id', ticketId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.assignment_id).toBe('8')
    })

    it('should handle errors when ticket not found', async () => {
      const ticketId = '999'
      const mockError = new Error('Ticket not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(assignmentsService.getCurrentAssignment(ticketId)).rejects.toThrow('Ticket not found')
      expect(consoleSpy).toHaveBeenCalledWith('[AssignmentsService] Failed to assign ticket:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle errors when no assignment exists', async () => {
      const ticketId = '1'
      const mockError = new Error('No assignment found for ticket')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(assignmentsService.getCurrentAssignment(ticketId)).rejects.toThrow('No assignment found for ticket')
      expect(consoleSpy).toHaveBeenCalledWith('[AssignmentsService] Failed to assign ticket:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for assign ticket', async () => {
      const ticketId = '1'
      const mockAssignmentData: AssignTicketFormSchema = {
        user_id: '2',
        reason: 'Assignment for testing'
      }

      const mockResponse: AxiosResponse<AssignTicketToUserApiResponse> = {
        data: {
          success: true,
          message: 'Ticket assigned successfully',
          data: {
            ticket_id: '1'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await assignmentsService.assignTicketToUser(ticketId, mockAssignmentData)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('ticket_id')
    })

    it('should return proper response structure for get current assignment', async () => {
      const ticketId = '1'
      const mockResponse: AxiosResponse<GetCurrentTicketAssignmentApiResponse> = {
        data: {
          success: true,
          message: 'Current assignment retrieved successfully',
          data: {
            ticket_id: '1',
            assignment_id: '1',
            assigned_to_user_id: '2',
            assigned_to_user_name: 'Jane Smith',
            assigned_to_role_id: '3',
            assigned_to_role_name: 'Support Agent',
            assigned_at: '2024-01-01T00:00:00Z'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await assignmentsService.getCurrentAssignment(ticketId)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('assignment_id')
      expect(result.data).toHaveProperty('assigned_to_user_name')
      expect(result.data).toHaveProperty('assigned_at')
    })
  })

  describe('Type Safety and Parameter Validation', () => {
    it('should accept valid assignment data with required fields', async () => {
      const ticketId = '1'
      const validAssignmentData: AssignTicketFormSchema = {
        user_id: '5',
        reason: 'Assigning to available agent'
      }

      const mockResponse: AxiosResponse<AssignTicketToUserApiResponse> = {
        data: {
          success: true,
          message: 'Ticket assigned',
          data: {
            ticket_id: '1'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      await expect(assignmentsService.assignTicketToUser(ticketId, validAssignmentData)).resolves.toBeDefined()
    })

    it('should accept string ticket IDs', async () => {
      const mockAssignmentResponse: AxiosResponse<AssignTicketToUserApiResponse> = {
        data: {
          success: true,
          message: 'Ticket assigned',
          data: {
            ticket_id: '123'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      const mockGetResponse: AxiosResponse<GetCurrentTicketAssignmentApiResponse> = {
        data: {
          success: true,
          message: 'Assignment retrieved',
          data: {
            ticket_id: '456',
            assignment_id: '1',
            assigned_to_user_id: '2',
            assigned_to_user_name: 'John Doe',
            assigned_to_role_id: null,
            assigned_to_role_name: null,
            assigned_at: '2024-01-01T00:00:00Z'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockAssignmentResponse)
      mockAxiosInstance.get.mockResolvedValueOnce(mockGetResponse)

      await expect(assignmentsService.assignTicketToUser('123', { user_id: '2', reason: 'Test assignment' })).resolves.toBeDefined()
      await expect(assignmentsService.getCurrentAssignment('456')).resolves.toBeDefined()
    })
  })
})
