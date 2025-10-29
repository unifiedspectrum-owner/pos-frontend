/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Plan management module imports */
import type { AddonsListApiResponse, CreateAddonApiRequest, CreateAddonApiResponse } from '@plan-management/types'
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

describe('addonService', () => {
  let addonService: typeof import('@plan-management/api/services/addons').addonService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@plan-management/api/services/addons')
    addonService = module.addonService
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
    it('should have addonService with all required methods', () => {
      expect(addonService).toBeDefined()
      expect(addonService.getAllAddOns).toBeTypeOf('function')
      expect(addonService.createAddOn).toBeTypeOf('function')
    })
  })

  describe('getAllAddOns', () => {
    it('should fetch all add-ons successfully', async () => {
      const mockResponse: AxiosResponse<AddonsListApiResponse> = {
        data: {
          success: true,
          message: 'Add-ons retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 3,
          data: [
            {
              id: 1,
              name: 'Additional Device',
              description: 'Add extra POS devices to your plan',
              pricing_scope: 'branch',
              addon_price: 15.00,
              default_quantity: 1,
              is_included: false,
              feature_level: 'basic',
              min_quantity: 1,
              max_quantity: 10,
              display_order: 1
            },
            {
              id: 2,
              name: 'Premium Support',
              description: '24/7 priority customer support',
              pricing_scope: 'organization',
              addon_price: 49.99,
              default_quantity: null,
              is_included: false,
              feature_level: 'custom',
              min_quantity: null,
              max_quantity: null,
              display_order: 2
            },
            {
              id: 3,
              name: 'Extra Branch',
              description: 'Add another business location',
              pricing_scope: 'branch',
              addon_price: 25.00,
              default_quantity: 1,
              is_included: false,
              feature_level: 'basic',
              min_quantity: 1,
              max_quantity: 20,
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

      const result = await addonService.getAllAddOns()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.ADD_ON.LIST)
      expect(result).toEqual(mockResponse.data)
      expect(result.count).toBe(3)
      expect(result.data).toHaveLength(3)
    })

    it('should fetch empty add-ons list successfully', async () => {
      const mockResponse: AxiosResponse<AddonsListApiResponse> = {
        data: {
          success: true,
          message: 'No add-ons found',
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

      const result = await addonService.getAllAddOns()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.ADD_ON.LIST)
      expect(result).toEqual(mockResponse.data)
      expect(result.count).toBe(0)
      expect(result.data).toHaveLength(0)
    })

    it('should handle errors when fetching add-ons fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(addonService.getAllAddOns()).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[AddonService] Failed to fetch add-ons:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('createAddOn', () => {
    it('should create a new add-on successfully with branch pricing', async () => {
      const mockAddonData: CreateAddonApiRequest = {
        name: 'Mobile App Access',
        description: 'Enable mobile POS functionality',
        pricing_scope: 'branch',
        base_price: 12.99
      }

      const mockResponse: AxiosResponse<CreateAddonApiResponse> = {
        data: {
          success: true,
          message: 'Add-on created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 4,
            name: 'Mobile App Access',
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

      const result = await addonService.createAddOn(mockAddonData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(PLAN_API_ROUTES.ADD_ON.CREATE, mockAddonData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.id).toBe(4)
      expect(result.data?.name).toBe('Mobile App Access')
      expect(result.data?.status).toBe(true)
    })

    it('should create add-on with organization-level pricing', async () => {
      const mockAddonData: CreateAddonApiRequest = {
        name: 'Advanced Analytics',
        description: 'Comprehensive business intelligence and reporting',
        pricing_scope: 'organization',
        base_price: 99.99
      }

      const mockResponse: AxiosResponse<CreateAddonApiResponse> = {
        data: {
          success: true,
          message: 'Add-on created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 5,
            name: 'Advanced Analytics',
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

      const result = await addonService.createAddOn(mockAddonData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(PLAN_API_ROUTES.ADD_ON.CREATE, mockAddonData)
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(5)
    })

    it('should create add-on with branch pricing', async () => {
      const mockAddonData: CreateAddonApiRequest = {
        name: 'Staff Management Module',
        description: 'Employee scheduling and time tracking per location',
        pricing_scope: 'branch',
        base_price: 29.99
      }

      const mockResponse: AxiosResponse<CreateAddonApiResponse> = {
        data: {
          success: true,
          message: 'Add-on created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 6,
            name: 'Staff Management Module',
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

      const result = await addonService.createAddOn(mockAddonData)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Staff Management Module')
    })

    it('should create add-on with null base price', async () => {
      const mockAddonData: CreateAddonApiRequest = {
        name: 'Custom Integration',
        description: 'Custom API integration service',
        pricing_scope: 'organization',
        base_price: null
      }

      const mockResponse: AxiosResponse<CreateAddonApiResponse> = {
        data: {
          success: true,
          message: 'Add-on created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 7,
            name: 'Custom Integration',
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

      const result = await addonService.createAddOn(mockAddonData)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(7)
    })

    it('should handle add-on creation with validation errors', async () => {
      const mockAddonData: CreateAddonApiRequest = {
        name: '',
        description: 'Missing name field',
        pricing_scope: 'branch',
        base_price: -10
      }

      const mockResponse: AxiosResponse<CreateAddonApiResponse> = {
        data: {
          success: false,
          message: 'Validation failed',
          timestamp: '2024-01-01T00:00:00Z',
          validation_errors: [
            {
              field: 'name',
              message: 'Add-on name is required'
            },
            {
              field: 'base_price',
              message: 'Base price must be positive'
            }
          ]
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await addonService.createAddOn(mockAddonData)

      expect(result.success).toBe(false)
      expect(result.validation_errors).toHaveLength(2)
    })

    it('should handle add-on creation errors', async () => {
      const mockAddonData: CreateAddonApiRequest = {
        name: 'Test Add-on',
        description: 'Test description',
        pricing_scope: 'organization',
        base_price: 19.99
      }

      const mockError = new Error('Failed to create add-on')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(addonService.createAddOn(mockAddonData)).rejects.toThrow('Failed to create add-on')
      expect(consoleSpy).toHaveBeenCalledWith('[AddonService] Failed to create add-on:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for list add-ons', async () => {
      const mockResponse: AxiosResponse<AddonsListApiResponse> = {
        data: {
          success: true,
          message: 'Add-ons retrieved',
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

      const result = await addonService.getAllAddOns()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('count')
      expect(result).toHaveProperty('data')
    })

    it('should return proper response structure for create add-on', async () => {
      const mockResponse: AxiosResponse<CreateAddonApiResponse> = {
        data: {
          success: true,
          message: 'Add-on created',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Test Add-on',
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

      const result = await addonService.createAddOn({} as CreateAddonApiRequest)

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
          method: () => addonService.getAllAddOns(),
          expectedMessage: '[AddonService] Failed to fetch add-ons:'
        },
        {
          method: () => addonService.createAddOn({} as CreateAddonApiRequest),
          expectedMessage: '[AddonService] Failed to create add-on:'
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
    it('should accept correct parameter types for add-on creation', async () => {
      const validAddonData: CreateAddonApiRequest = {
        name: 'Valid Add-on',
        description: 'Valid description',
        pricing_scope: 'branch',
        base_price: 19.99
      }

      const mockResponse: AxiosResponse<CreateAddonApiResponse> = {
        data: {
          success: true,
          message: 'Add-on created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Valid Add-on',
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

      await expect(addonService.createAddOn(validAddonData)).resolves.toBeDefined()
    })

    it('should accept all valid pricing scopes', async () => {
      const pricingScopes = ['branch', 'organization'] as const

      for (const scope of pricingScopes) {
        const addonData: CreateAddonApiRequest = {
          name: `Test Add-on ${scope}`,
          description: `Test for ${scope}`,
          pricing_scope: scope,
          base_price: 29.99
        }

        const mockResponse: AxiosResponse<CreateAddonApiResponse> = {
          data: {
            success: true,
            message: 'Add-on created successfully',
            timestamp: '2024-01-01T00:00:00Z',
            data: {
              id: 1,
              name: addonData.name,
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

        await expect(addonService.createAddOn(addonData)).resolves.toBeDefined()
      }
    })
  })
})
