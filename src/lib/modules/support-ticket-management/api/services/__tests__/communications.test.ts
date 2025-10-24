/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Support ticket management module imports */
import type { GetTicketCommunicationsApiResponse, CreateTicketCommunicationApiResponse } from '@support-ticket-management/types'
import type { CreateTicketCommentFormSchema } from '@support-ticket-management/schemas'
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

describe('communicationsService', () => {
  let communicationsService: typeof import('@support-ticket-management/api/services/communications').communicationsService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@support-ticket-management/api/services/communications')
    communicationsService = module.communicationsService
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
    it('should have communicationsService with all required methods', () => {
      expect(communicationsService).toBeDefined()
      expect(communicationsService.getTicketCommunications).toBeTypeOf('function')
      expect(communicationsService.createTicketCommunication).toBeTypeOf('function')
    })
  })

  describe('getTicketCommunications', () => {
    it('should fetch ticket communications successfully', async () => {
      const ticketId = '1'
      const mockResponse: AxiosResponse<GetTicketCommunicationsApiResponse> = {
        data: {
          success: true,
          message: 'Communications retrieved successfully',
          data: {
            ticket_id: '1',
            communications: [
              {
                id: 1,
                ticket_id: 1,
                communication_type: 'customer_message',
                sender_user_id: 1,
                sender_name: 'John Doe',
                sender_email: 'john@example.com',
                sender_type: 'customer',
                message_content: 'This is the initial ticket description',
                message_format: 'text',
                is_internal: false,
                is_auto_generated: false,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                attachments: []
              },
              {
                id: 2,
                ticket_id: 1,
                communication_type: 'agent_response',
                sender_user_id: 2,
                sender_name: 'Support Agent',
                sender_email: 'agent@example.com',
                sender_type: 'agent',
                message_content: 'We are looking into this issue',
                message_format: 'text',
                is_internal: false,
                is_auto_generated: false,
                created_at: '2024-01-01T01:00:00Z',
                updated_at: '2024-01-01T01:00:00Z',
                attachments: []
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await communicationsService.getTicketCommunications(ticketId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.GET_COMMENTS.replace(':id', ticketId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.communications).toHaveLength(2)
    })

    it('should fetch empty communications list', async () => {
      const ticketId = '5'
      const mockResponse: AxiosResponse<GetTicketCommunicationsApiResponse> = {
        data: {
          success: true,
          message: 'No communications found',
          data: {
            ticket_id: '5',
            communications: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await communicationsService.getTicketCommunications(ticketId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.GET_COMMENTS.replace(':id', ticketId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.communications).toHaveLength(0)
    })

    it('should fetch communications with attachments', async () => {
      const ticketId = '3'
      const mockResponse: AxiosResponse<GetTicketCommunicationsApiResponse> = {
        data: {
          success: true,
          message: 'Communications retrieved successfully',
          data: {
            ticket_id: '3',
            communications: [
              {
                id: 10,
                ticket_id: 3,
                communication_type: 'customer_message',
                sender_user_id: 5,
                sender_name: 'Jane Smith',
                sender_email: 'jane@example.com',
                sender_type: 'customer',
                message_content: 'Please see the attached screenshot',
                message_format: 'text',
                is_internal: false,
                is_auto_generated: false,
                created_at: '2024-01-03T10:00:00Z',
                updated_at: '2024-01-03T10:00:00Z',
                attachments: [
                  {
                    id: 1,
                    ticket_id: 3,
                    communication_id: 10,
                    filename: 'screenshot.png',
                    file_size: 102400,
                    mime_type: 'image/png',
                    file_extension: 'png',
                    file_path: 'https://example.com/files/screenshot.png',
                    is_public: false,
                    uploaded_by: 'Jane Smith',
                    uploaded_at: '2024-01-03T10:00:00Z',
                    created_at: '2024-01-03T10:00:00Z'
                  }
                ]
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await communicationsService.getTicketCommunications(ticketId)

      expect(result.data?.communications[0].attachments).toHaveLength(1)
      expect(result.data?.communications[0].attachments?.[0].filename).toBe('screenshot.png')
    })

    it('should handle errors when ticket not found', async () => {
      const ticketId = '999'
      const mockError = new Error('Ticket not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(communicationsService.getTicketCommunications(ticketId)).rejects.toThrow('Ticket not found')
      expect(consoleSpy).toHaveBeenCalledWith('[CommunicationsService] Failed to get ticket communications:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      const ticketId = '1'
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(communicationsService.getTicketCommunications(ticketId)).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[CommunicationsService] Failed to get ticket communications:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('createTicketCommunication', () => {
    it('should create public ticket communication successfully', async () => {
      const ticketId = '1'
      const mockCommentData: CreateTicketCommentFormSchema = {
        message_content: 'New comment on the ticket',
        is_internal: false
      }

      const mockResponse: AxiosResponse<CreateTicketCommunicationApiResponse> = {
        data: {
          success: true,
          message: 'Communication created successfully',
          data: {
            communication_id: 5,
            ticket_id: '1'
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await communicationsService.createTicketCommunication(ticketId, mockCommentData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT.replace(':id', ticketId), mockCommentData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.communication_id).toBe(5)
      expect(result.data.ticket_id).toBe('1')
    })

    it('should create internal ticket communication successfully', async () => {
      const ticketId = '2'
      const mockCommentData: CreateTicketCommentFormSchema = {
        message_content: 'Internal note: Need to escalate this issue',
        is_internal: true
      }

      const mockResponse: AxiosResponse<CreateTicketCommunicationApiResponse> = {
        data: {
          success: true,
          message: 'Internal communication created successfully',
          data: {
            communication_id: 8,
            ticket_id: '2'
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await communicationsService.createTicketCommunication(ticketId, mockCommentData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT.replace(':id', ticketId), mockCommentData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should create communication with long message', async () => {
      const ticketId = '3'
      const longMessage = 'This is a very long message that contains detailed information about the issue. '.repeat(10)
      const mockCommentData: CreateTicketCommentFormSchema = {
        message_content: longMessage,
        is_internal: false
      }

      const mockResponse: AxiosResponse<CreateTicketCommunicationApiResponse> = {
        data: {
          success: true,
          message: 'Communication created successfully',
          data: {
            communication_id: 15,
            ticket_id: '3'
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await communicationsService.createTicketCommunication(ticketId, mockCommentData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT.replace(':id', ticketId), mockCommentData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle communication creation errors', async () => {
      const ticketId = '1'
      const mockCommentData: CreateTicketCommentFormSchema = {
        message_content: 'New comment',
        is_internal: true
      }

      const mockError = new Error('Failed to create communication')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(communicationsService.createTicketCommunication(ticketId, mockCommentData)).rejects.toThrow('Failed to create communication')
      expect(consoleSpy).toHaveBeenCalledWith('[CommunicationsService] Failed to create communication:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle errors when ticket is closed', async () => {
      const ticketId = '10'
      const mockCommentData: CreateTicketCommentFormSchema = {
        message_content: 'Trying to add comment to closed ticket',
        is_internal: false
      }

      const mockError = new Error('Cannot add communication to closed ticket')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(communicationsService.createTicketCommunication(ticketId, mockCommentData)).rejects.toThrow('Cannot add communication to closed ticket')
      expect(consoleSpy).toHaveBeenCalledWith('[CommunicationsService] Failed to create communication:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for get communications', async () => {
      const ticketId = '1'
      const mockResponse: AxiosResponse<GetTicketCommunicationsApiResponse> = {
        data: {
          success: true,
          message: 'Communications retrieved',
          data: {
            ticket_id: '1',
            communications: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await communicationsService.getTicketCommunications(ticketId)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('communications')
      expect(Array.isArray(result.data?.communications)).toBe(true)
    })

    it('should return proper response structure for create communication', async () => {
      const ticketId = '1'
      const mockCommentData: CreateTicketCommentFormSchema = {
        message_content: 'Test message',
        is_internal: false
      }

      const mockResponse: AxiosResponse<CreateTicketCommunicationApiResponse> = {
        data: {
          success: true,
          message: 'Communication created',
          data: {
            communication_id: 1,
            ticket_id: '1'
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await communicationsService.createTicketCommunication(ticketId, mockCommentData)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('communication_id')
    })
  })

  describe('Type Safety and Parameter Validation', () => {
    it('should accept valid comment data with required fields', async () => {
      const ticketId = '1'
      const validCommentData: CreateTicketCommentFormSchema = {
        message_content: 'Valid comment message',
        is_internal: false
      }

      const mockResponse: AxiosResponse<CreateTicketCommunicationApiResponse> = {
        data: {
          success: true,
          message: 'Communication created',
          data: {
            communication_id: 1,
            ticket_id: '1'
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      await expect(communicationsService.createTicketCommunication(ticketId, validCommentData)).resolves.toBeDefined()
    })

    it('should accept string ticket IDs', async () => {
      const mockGetResponse: AxiosResponse<GetTicketCommunicationsApiResponse> = {
        data: {
          success: true,
          message: 'Communications retrieved',
          data: {
            ticket_id: '123',
            communications: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      const mockCreateResponse: AxiosResponse<CreateTicketCommunicationApiResponse> = {
        data: {
          success: true,
          message: 'Communication created',
          data: {
            communication_id: 1,
            ticket_id: '456'
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockGetResponse)
      mockAxiosInstance.post.mockResolvedValueOnce(mockCreateResponse)

      await expect(communicationsService.getTicketCommunications('123')).resolves.toBeDefined()
      await expect(communicationsService.createTicketCommunication('456', {} as CreateTicketCommentFormSchema)).resolves.toBeDefined()
    })

    it('should handle both internal and external communications', async () => {
      const ticketId = '1'

      const internalComment: CreateTicketCommentFormSchema = {
        message_content: 'Internal note',
        is_internal: true
      }

      const externalComment: CreateTicketCommentFormSchema = {
        message_content: 'Public reply',
        is_internal: false
      }

      const mockResponse: AxiosResponse<CreateTicketCommunicationApiResponse> = {
        data: {
          success: true,
          message: 'Communication created',
          data: {
            communication_id: 1,
            ticket_id: '1'
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      await expect(communicationsService.createTicketCommunication(ticketId, internalComment)).resolves.toBeDefined()
      await expect(communicationsService.createTicketCommunication(ticketId, externalComment)).resolves.toBeDefined()
    })
  })
})
