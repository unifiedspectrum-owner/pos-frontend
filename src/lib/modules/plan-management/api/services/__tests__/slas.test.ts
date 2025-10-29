/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Plan management module imports */
import type { SlaListApiResponse, CreateSlaApiRequest, CreateSlaApiResponse } from '@plan-management/types'
import { PLAN_API_ROUTES } from '@plan-management/constants/routes'

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
vi.mock('@plan-management/api/client', () => ({
  planApiClient: mockAxiosInstance
}))

describe('slaService', () => {
  let slaService: typeof import('@plan-management/api/services/slas').slaService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@plan-management/api/services/slas')
    slaService = module.slaService
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
    it('should have slaService with all required methods', () => {
      expect(slaService).toBeDefined()
      expect(slaService.getAllSLAs).toBeTypeOf('function')
      expect(slaService.createSLA).toBeTypeOf('function')
    })
  })

  describe('getAllSLAs', () => {
    it('should fetch all SLAs successfully', async () => {
      const mockResponse: AxiosResponse<SlaListApiResponse> = {
        data: {
          success: true,
          message: 'SLAs retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 3,
          data: [
            {
              id: 1,
              name: 'Basic Support',
              support_channel: 'Email',
              response_time_hours: 48,
              availability_schedule: 'Business Hours (9-5 EST)',
              notes: 'Standard email support during business hours',
              display_order: 1
            },
            {
              id: 2,
              name: 'Priority Support',
              support_channel: 'Email, Phone',
              response_time_hours: 24,
              availability_schedule: 'Extended Hours (8-8 EST)',
              notes: 'Priority phone and email support with faster response',
              display_order: 2
            },
            {
              id: 3,
              name: 'Premium Support',
              support_channel: 'Email, Phone, Chat',
              response_time_hours: 4,
              availability_schedule: '24/7',
              notes: 'Round-the-clock premium support via multiple channels',
              display_order: 3
            }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await slaService.getAllSLAs()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.SLA.LIST)
      expect(result).toEqual(mockResponse.data)
      expect(result.count).toBe(3)
      expect(result.data).toHaveLength(3)
    })

    it('should fetch empty SLAs list successfully', async () => {
      const mockResponse: AxiosResponse<SlaListApiResponse> = {
        data: {
          success: true,
          message: 'No SLAs found',
          timestamp: '2024-01-01T00:00:00Z',
          count: 0,
          data: []
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await slaService.getAllSLAs()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.SLA.LIST)
      expect(result).toEqual(mockResponse.data)
      expect(result.count).toBe(0)
      expect(result.data).toHaveLength(0)
    })

    it('should handle errors when fetching SLAs fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(slaService.getAllSLAs()).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[SLAService] Failed to fetch SLAs:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('createSLA', () => {
    it('should create a new SLA successfully with all fields', async () => {
      const mockSlaData: CreateSlaApiRequest = {
        name: 'Enterprise Support',
        support_channel: 'Email, Phone, Chat, On-site',
        response_time_hours: 2,
        availability_schedule: '24/7 with dedicated account manager',
        notes: 'Highest tier support with on-site assistance available'
      }

      const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
        data: {
          success: true,
          message: 'SLA created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 4,
            name: 'Enterprise Support',
            status: true
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await slaService.createSLA(mockSlaData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(PLAN_API_ROUTES.SLA.CREATE, mockSlaData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.id).toBe(4)
      expect(result.data?.name).toBe('Enterprise Support')
      expect(result.data?.status).toBe(true)
    })

    it('should create SLA without notes field', async () => {
      const mockSlaData: CreateSlaApiRequest = {
        name: 'Standard Support',
        support_channel: 'Email',
        response_time_hours: 72,
        availability_schedule: 'Business Hours'
      }

      const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
        data: {
          success: true,
          message: 'SLA created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 5,
            name: 'Standard Support',
            status: true
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await slaService.createSLA(mockSlaData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(PLAN_API_ROUTES.SLA.CREATE, mockSlaData)
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(5)
    })

    it('should create SLA with null notes', async () => {
      const mockSlaData: CreateSlaApiRequest = {
        name: 'Basic Support Tier',
        support_channel: 'Email only',
        response_time_hours: 96,
        availability_schedule: 'Monday-Friday 9-5',
        notes: null
      }

      const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
        data: {
          success: true,
          message: 'SLA created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 6,
            name: 'Basic Support Tier',
            status: true
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await slaService.createSLA(mockSlaData)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Basic Support Tier')
    })

    it('should create SLA with fast response time', async () => {
      const mockSlaData: CreateSlaApiRequest = {
        name: 'VIP Support',
        support_channel: 'All channels',
        response_time_hours: 1,
        availability_schedule: '24/7 immediate response',
        notes: 'Dedicated team for VIP customers'
      }

      const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
        data: {
          success: true,
          message: 'SLA created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 7,
            name: 'VIP Support',
            status: true
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await slaService.createSLA(mockSlaData)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(7)
    })

    it('should handle SLA creation with validation errors', async () => {
      const mockSlaData: CreateSlaApiRequest = {
        name: '',
        support_channel: '',
        response_time_hours: -5,
        availability_schedule: ''
      }

      const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
        data: {
          success: false,
          message: 'Validation failed',
          timestamp: '2024-01-01T00:00:00Z',
          validation_errors: [
            {
              field: 'name',
              message: 'SLA name is required'
            },
            {
              field: 'support_channel',
              message: 'Support channel is required'
            },
            {
              field: 'response_time_hours',
              message: 'Response time must be positive'
            },
            {
              field: 'availability_schedule',
              message: 'Availability schedule is required'
            }
          ]
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await slaService.createSLA(mockSlaData)

      expect(result.success).toBe(false)
      expect(result.validation_errors).toHaveLength(4)
    })

    it('should handle SLA creation errors', async () => {
      const mockSlaData: CreateSlaApiRequest = {
        name: 'Test SLA',
        support_channel: 'Email',
        response_time_hours: 24,
        availability_schedule: 'Business Hours'
      }

      const mockError = new Error('Failed to create SLA')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(slaService.createSLA(mockSlaData)).rejects.toThrow('Failed to create SLA')
      expect(consoleSpy).toHaveBeenCalledWith('[SLAService] Failed to create SLA:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for list SLAs', async () => {
      const mockResponse: AxiosResponse<SlaListApiResponse> = {
        data: {
          success: true,
          message: 'SLAs retrieved',
          timestamp: '2024-01-01T00:00:00Z',
          count: 0,
          data: []
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await slaService.getAllSLAs()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('count')
      expect(result).toHaveProperty('data')
    })

    it('should return proper response structure for create SLA', async () => {
      const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
        data: {
          success: true,
          message: 'SLA created',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Test SLA',
            status: true
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await slaService.createSLA({} as CreateSlaApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('validation_errors')
    })
  })

  describe('Error Handling and Console Logging', () => {
    it('should log appropriate error messages for each method', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Generic API Error')

      const testCases = [
        {
          method: () => slaService.getAllSLAs(),
          expectedMessage: '[SLAService] Failed to fetch SLAs:'
        },
        {
          method: () => slaService.createSLA({} as CreateSlaApiRequest),
          expectedMessage: '[SLAService] Failed to create SLA:'
        }
      ]

      for (const testCase of testCases) {
        /* Reset mocks for each test case */
        mockAxiosInstance.get.mockRejectedValueOnce(mockError)
        mockAxiosInstance.post.mockRejectedValueOnce(mockError)

        try {
          await testCase.method()
        } catch (error) {
          expect(error).toBe(mockError)
        }

        expect(consoleSpy).toHaveBeenCalledWith(testCase.expectedMessage, mockError)
        consoleSpy.mockClear()
      }

      consoleSpy.mockRestore()
    })
  })

  describe('Type Safety and Parameter Validation', () => {
    it('should accept correct parameter types for SLA creation', async () => {
      const validSlaData: CreateSlaApiRequest = {
        name: 'Valid SLA',
        support_channel: 'Email, Phone',
        response_time_hours: 24,
        availability_schedule: 'Business Hours',
        notes: 'Additional information'
      }

      const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
        data: {
          success: true,
          message: 'SLA created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Valid SLA',
            status: true
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      await expect(slaService.createSLA(validSlaData)).resolves.toBeDefined()
    })

    it('should accept various response time hours', async () => {
      const responseTimes = [1, 4, 12, 24, 48, 72, 168]

      for (const hours of responseTimes) {
        const slaData: CreateSlaApiRequest = {
          name: `Support ${hours}h`,
          support_channel: 'Email',
          response_time_hours: hours,
          availability_schedule: 'Business Hours'
        }

        const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
          data: {
            success: true,
            message: 'SLA created successfully',
            timestamp: '2024-01-01T00:00:00Z',
            data: {
              id: 1,
              name: slaData.name,
              status: true
            },
            validation_errors: []
          },
          status: 201,
          statusText: 'Created',
          headers: {},
          config: createMockAxiosConfig()
        }

        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

        await expect(slaService.createSLA(slaData)).resolves.toBeDefined()
      }
    })
  })

  describe('Support Channel Variations', () => {
    it('should handle different support channel combinations', async () => {
      const channelVariations = [
        'Email',
        'Phone',
        'Chat',
        'Email, Phone',
        'Email, Chat',
        'Phone, Chat',
        'Email, Phone, Chat',
        'Email, Phone, Chat, On-site'
      ]

      for (const channel of channelVariations) {
        const slaData: CreateSlaApiRequest = {
          name: `Support via ${channel}`,
          support_channel: channel,
          response_time_hours: 24,
          availability_schedule: 'Business Hours'
        }

        const mockResponse: AxiosResponse<CreateSlaApiResponse> = {
          data: {
            success: true,
            message: 'SLA created successfully',
            timestamp: '2024-01-01T00:00:00Z',
            data: {
              id: 1,
              name: slaData.name,
              status: true
            },
            validation_errors: []
          },
          status: 201,
          statusText: 'Created',
          headers: {},
          config: createMockAxiosConfig()
        }

        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

        const result = await slaService.createSLA(slaData)
        expect(result.success).toBe(true)
      }
    })
  })
})
