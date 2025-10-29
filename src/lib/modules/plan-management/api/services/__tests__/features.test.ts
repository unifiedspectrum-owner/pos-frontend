/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Plan management module imports */
import type { FeaturesListApiResponse, CreateFeatureApiRequest, CreateFeatureApiResponse } from '@plan-management/types'
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

describe('featureService', () => {
  let featureService: typeof import('@plan-management/api/services/features').featureService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@plan-management/api/services/features')
    featureService = module.featureService
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
    it('should have featureService with all required methods', () => {
      expect(featureService).toBeDefined()
      expect(featureService.getAllFeatures).toBeTypeOf('function')
      expect(featureService.createFeature).toBeTypeOf('function')
    })
  })

  describe('getAllFeatures', () => {
    it('should fetch all features successfully', async () => {
      const mockResponse: AxiosResponse<FeaturesListApiResponse> = {
        data: {
          success: true,
          message: 'Features retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 3,
          data: [
            {
              id: 1,
              name: 'Inventory Management',
              description: 'Track and manage inventory in real-time',
              display_order: 1
            },
            {
              id: 2,
              name: 'Advanced Reporting',
              description: 'Comprehensive analytics and insights',
              display_order: 2
            },
            {
              id: 3,
              name: 'Multi-Location Support',
              description: 'Manage multiple business locations',
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

      const result = await featureService.getAllFeatures()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.FEATURE.LIST)
      expect(result).toEqual(mockResponse.data)
      expect(result.count).toBe(3)
      expect(result.data).toHaveLength(3)
    })

    it('should fetch empty features list successfully', async () => {
      const mockResponse: AxiosResponse<FeaturesListApiResponse> = {
        data: {
          success: true,
          message: 'No features found',
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

      const result = await featureService.getAllFeatures()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.FEATURE.LIST)
      expect(result).toEqual(mockResponse.data)
      expect(result.count).toBe(0)
      expect(result.data).toHaveLength(0)
    })

    it('should handle errors when fetching features fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(featureService.getAllFeatures()).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[FeatureService] Failed to fetch features:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('createFeature', () => {
    it('should create a new feature successfully', async () => {
      const mockFeatureData: CreateFeatureApiRequest = {
        name: 'Customer Loyalty Program',
        description: 'Built-in customer rewards and loyalty tracking'
      }

      const mockResponse: AxiosResponse<CreateFeatureApiResponse> = {
        data: {
          success: true,
          message: 'Feature created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 4,
            name: 'Customer Loyalty Program',
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

      const result = await featureService.createFeature(mockFeatureData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(PLAN_API_ROUTES.FEATURE.CREATE, mockFeatureData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.id).toBe(4)
      expect(result.data?.name).toBe('Customer Loyalty Program')
      expect(result.data?.status).toBe(true)
    })

    it('should handle feature creation with validation errors', async () => {
      const mockFeatureData: CreateFeatureApiRequest = {
        name: '',
        description: 'Missing name field'
      }

      const mockResponse: AxiosResponse<CreateFeatureApiResponse> = {
        data: {
          success: false,
          message: 'Validation failed',
          timestamp: '2024-01-01T00:00:00Z',
          validation_errors: [
            { field: 'name', message: 'Feature name is required' }
          ]
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await featureService.createFeature(mockFeatureData)

      expect(result.success).toBe(false)
      expect(result.validation_errors).toBeDefined()
    })

    it('should create feature with minimal data', async () => {
      const mockFeatureData: CreateFeatureApiRequest = {
        name: 'Email Marketing',
        description: 'Automated email campaigns'
      }

      const mockResponse: AxiosResponse<CreateFeatureApiResponse> = {
        data: {
          success: true,
          message: 'Feature created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 5,
            name: 'Email Marketing',
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

      const result = await featureService.createFeature(mockFeatureData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(PLAN_API_ROUTES.FEATURE.CREATE, mockFeatureData)
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(5)
    })

    it('should handle feature creation errors', async () => {
      const mockFeatureData: CreateFeatureApiRequest = {
        name: 'Test Feature',
        description: 'Test description'
      }

      const mockError = new Error('Failed to create feature')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(featureService.createFeature(mockFeatureData)).rejects.toThrow('Failed to create feature')
      expect(consoleSpy).toHaveBeenCalledWith('[FeatureService] Failed to create feature:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for list features', async () => {
      const mockResponse: AxiosResponse<FeaturesListApiResponse> = {
        data: {
          success: true,
          message: 'Features retrieved',
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

      const result = await featureService.getAllFeatures()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('count')
      expect(result).toHaveProperty('data')
    })

    it('should return proper response structure for create feature', async () => {
      const mockResponse: AxiosResponse<CreateFeatureApiResponse> = {
        data: {
          success: true,
          message: 'Feature created',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Test Feature',
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

      const result = await featureService.createFeature({} as CreateFeatureApiRequest)

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
          method: () => featureService.getAllFeatures(),
          expectedMessage: '[FeatureService] Failed to fetch features:'
        },
        {
          method: () => featureService.createFeature({} as CreateFeatureApiRequest),
          expectedMessage: '[FeatureService] Failed to create feature:'
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
    it('should accept correct parameter types for feature creation', async () => {
      const validFeatureData: CreateFeatureApiRequest = {
        name: 'Valid Feature',
        description: 'Valid description'
      }

      const mockResponse: AxiosResponse<CreateFeatureApiResponse> = {
        data: {
          success: true,
          message: 'Feature created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Valid Feature',
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

      await expect(featureService.createFeature(validFeatureData)).resolves.toBeDefined()
    })
  })
})
