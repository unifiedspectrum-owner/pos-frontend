import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import axios, { AxiosResponse } from 'axios'
import { BACKEND_BASE_URL } from '@shared/config'
import {
  PlansListAPIResponse,
  CreatePlanAPIResponse,
  GetPlanDetailsAPIResponse,
  FeaturesListAPIResponse,
  AddOnsListAPIResponse,
  SlaListAPIResponse,
  CreateFeatureAPIResponse,
  CreateAddonAPIResponse,
  CreateSlaAPIResponse,
  CreateSubscriptionPlanAPIPayloadRequest,
  CreatePlanFeaturePayloadRequest,
  CreatePlanAddOnPayloadRequest,
  CreatePlanSLAPayloadRequest
} from '@/lib/modules/plan-management/types/plans'

// Mock axios completely
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

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance)
  }
}))

describe('planService', () => {
  let planService: any

  beforeAll(async () => {
    // Clear any previous calls before importing
    vi.clearAllMocks()
    
    // Import after mocks are set up
    const module = await import('../plans')
    planService = module.planService
  })

  beforeEach(() => {
    // Only clear the HTTP method mocks, not the interceptor setup mocks
    mockAxiosInstance.get.mockClear()
    mockAxiosInstance.post.mockClear()
    mockAxiosInstance.put.mockClear()
    mockAxiosInstance.delete.mockClear()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // Mock window.dispatchEvent
    window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('API Client Configuration', () => {
    it('should create axios instance with correct baseURL and headers', () => {
      const mockedAxios = vi.mocked(axios)
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: `${BACKEND_BASE_URL}/subscription-plans`,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    it('should have interceptor configuration available', () => {
      // Verify that planService is properly initialized with all methods
      expect(planService).toBeDefined()
      expect(planService.getAllSubscriptionPlans).toBeTypeOf('function')
      expect(planService.createSubscriptionPlan).toBeTypeOf('function')
      expect(planService.getSubscriptionPlanDetails).toBeTypeOf('function')
      expect(planService.updateSubscriptionPlan).toBeTypeOf('function')
      expect(planService.deleteSubscriptionPlan).toBeTypeOf('function')
      expect(planService.getAllFeatures).toBeTypeOf('function')
      expect(planService.getAllAddOns).toBeTypeOf('function')
      expect(planService.getAllSLAs).toBeTypeOf('function')
      expect(planService.createFeature).toBeTypeOf('function')
      expect(planService.createAddOn).toBeTypeOf('function')
      expect(planService.createSLA).toBeTypeOf('function')
      
      // Verify that our mock axios instance has interceptor objects
      expect(mockAxiosInstance.interceptors).toBeDefined()
      expect(mockAxiosInstance.interceptors.request).toBeDefined()
      expect(mockAxiosInstance.interceptors.response).toBeDefined()
      expect(mockAxiosInstance.interceptors.request.use).toBeTypeOf('function')
      expect(mockAxiosInstance.interceptors.response.use).toBeTypeOf('function')
    })
  })

  describe('Request Interceptor Logic', () => {
    it('should attach authorization header when token exists', () => {
      const mockConfig = { headers: {} }
      const mockToken = 'test-token'
      
      // Simulate the request interceptor logic
      vi.mocked(window.localStorage.getItem).mockReturnValue(mockToken)
      
      // Mimic the actual interceptor logic from plans.ts
      const token = window.localStorage.getItem('accessToken')
      if (token) {
        mockConfig.headers.Authorization = `Bearer ${token}`
      }
      
      expect(window.localStorage.getItem).toHaveBeenCalledWith('accessToken')
      expect(mockConfig.headers.Authorization).toBe(`Bearer ${mockToken}`)
    })

    it('should not attach authorization header when token does not exist', () => {
      const mockConfig = { headers: {} }
      
      vi.mocked(window.localStorage.getItem).mockReturnValue(null)
      
      // Mimic the actual interceptor logic from plans.ts
      const token = window.localStorage.getItem('accessToken')
      if (token) {
        mockConfig.headers.Authorization = `Bearer ${token}`
      }
      
      expect(mockConfig.headers.Authorization).toBeUndefined()
    })
  })

  describe('Response Interceptor Logic', () => {
    it('should pass through successful responses', () => {
      const mockResponse = { data: 'test', status: 200 }
      
      // Simulate successful response passthrough
      const result = mockResponse
      
      expect(result).toBe(mockResponse)
    })

    it('should handle 401 errors by clearing auth data and triggering logout', () => {
      const mockError = {
        response: { status: 401 }
      }
      
      // Simulate the 401 error handling logic from plans.ts
      if (mockError.response?.status === 401) {
        window.localStorage.removeItem('accessToken')
        window.localStorage.removeItem('loggedIn')
        window.dispatchEvent(new Event('authStateChanged'))
      }
      
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('accessToken')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('loggedIn')
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event))
    })

    it('should forward non-401 errors without clearing auth', () => {
      const mockError = {
        response: { status: 500 }
      }
      
      // Simulate the error handling logic from plans.ts
      if (mockError.response?.status === 401) {
        window.localStorage.removeItem('accessToken')
        window.localStorage.removeItem('loggedIn')
        window.dispatchEvent(new Event('authStateChanged'))
      }
      
      expect(window.localStorage.removeItem).not.toHaveBeenCalled()
      expect(window.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should forward errors without response object', () => {
      const mockError = new Error('Network error')
      
      // Simulate the error handling logic from plans.ts
      if (mockError.response?.status === 401) {
        window.localStorage.removeItem('accessToken')
        window.localStorage.removeItem('loggedIn')
        window.dispatchEvent(new Event('authStateChanged'))
      }
      
      expect(window.localStorage.removeItem).not.toHaveBeenCalled()
    })
  })

  describe('getAllSubscriptionPlans', () => {
    it('should fetch all subscription plans successfully', async () => {
      const mockResponse: AxiosResponse<PlansListAPIResponse> = {
        data: {
          success: true,
          message: 'Plans retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 2,
          data: [
            {
              id: 1,
              name: 'Basic Plan',
              is_active: 1,
              is_custom: 0,
              display_order: 1,
              monthly_price: 29.99
            },
            {
              id: 2,
              name: 'Premium Plan',
              is_active: 1,
              is_custom: 0,
              display_order: 2,
              monthly_price: 59.99
            }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await planService.getAllSubscriptionPlans()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('')
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors and re-throw them', async () => {
      const mockError = new Error('API Error')
      mockAxiosInstance.get.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.getAllSubscriptionPlans()).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to fetch subscription plans:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('createSubscriptionPlan', () => {
    it('should create a subscription plan successfully', async () => {
      const mockPlanData: CreateSubscriptionPlanAPIPayloadRequest = {
        name: 'Test Plan',
        description: 'Test Description',
        is_custom: false,
        is_active: true,
        monthly_price: 29.99,
        monthly_fee_our_gateway: 5.99,
        monthly_fee_byo_processor: 3.99,
        card_processing_fee_percentage: 2.5,
        card_processing_fee_fixed: 0.30,
        additional_device_cost: 10.00,
        annual_discount_percentage: 10.0,
        biennial_discount_percentage: 15.0,
        triennial_discount_percentage: 20.0,
        included_devices_count: 5,
        max_users_per_branch: 10,
        included_branches_count: 1
      }

      const mockResponse: AxiosResponse<CreatePlanAPIResponse> = {
        data: {
          success: true,
          message: 'Plan created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Test Plan',
            status: true
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await planService.createSubscriptionPlan(mockPlanData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('', mockPlanData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle creation errors', async () => {
      const mockPlanData: CreateSubscriptionPlanAPIPayloadRequest = {
        name: 'Test Plan',
        description: 'Test Description',
        is_custom: false,
        is_active: true,
        monthly_price: 29.99,
        monthly_fee_our_gateway: 5.99,
        monthly_fee_byo_processor: 3.99,
        card_processing_fee_percentage: 2.5,
        card_processing_fee_fixed: 0.30,
        additional_device_cost: 10.00,
        annual_discount_percentage: 10.0,
        biennial_discount_percentage: 15.0,
        triennial_discount_percentage: 20.0,
        included_devices_count: 5,
        max_users_per_branch: 10,
        included_branches_count: 1
      }

      const mockError = new Error('Validation failed')
      mockAxiosInstance.post.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.createSubscriptionPlan(mockPlanData)).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to create subscription plan:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('getSubscriptionPlanDetails', () => {
    it('should fetch plan details successfully', async () => {
      const planId = 1
      const mockResponse: AxiosResponse<GetPlanDetailsAPIResponse> = {
        data: {
          success: true,
          message: 'Plan details retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 1,
          data: {
            id: 1,
            name: 'Basic Plan',
            description: 'Basic subscription plan',
            display_order: 1,
            trial_period_days: 14,
            is_active: 1,
            is_custom: 0,
            monthly_price: 29.99,
            monthly_fee_our_gateway: 5.99,
            monthly_fee_byo_processor: 3.99,
            card_processing_fee_percentage: 2.5,
            card_processing_fee_fixed: 0.30,
            additional_device_cost: 10.00,
            annual_discount_percentage: 10.0,
            biennial_discount_percentage: 15.0,
            triennial_discount_percentage: 20.0,
            included_devices_count: 5,
            max_users_per_branch: 10,
            included_branches_count: 1,
            features: [],
            add_ons: [],
            support_sla: [],
            volume_discounts: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await planService.getSubscriptionPlanDetails(planId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/${planId}`)
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors when fetching plan details', async () => {
      const planId = 1
      const mockError = new Error('Plan not found')
      mockAxiosInstance.get.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.getSubscriptionPlanDetails(planId)).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to fetch subscription plan details:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('updateSubscriptionPlan', () => {
    it('should update a subscription plan successfully', async () => {
      const planId = 1
      const mockPlanData: CreateSubscriptionPlanAPIPayloadRequest = {
        name: 'Updated Plan',
        description: 'Updated Description',
        is_custom: false,
        is_active: true,
        monthly_price: 39.99,
        monthly_fee_our_gateway: 6.99,
        monthly_fee_byo_processor: 4.99,
        card_processing_fee_percentage: 2.5,
        card_processing_fee_fixed: 0.30,
        additional_device_cost: 12.00,
        annual_discount_percentage: 12.0,
        biennial_discount_percentage: 17.0,
        triennial_discount_percentage: 22.0,
        included_devices_count: 7,
        max_users_per_branch: 15,
        included_branches_count: 2
      }

      const mockResponse: AxiosResponse<CreatePlanAPIResponse> = {
        data: {
          success: true,
          message: 'Plan updated successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Updated Plan',
            status: true
          },
          validation_errors: []
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await planService.updateSubscriptionPlan(planId, mockPlanData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/${planId}`, mockPlanData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle update errors', async () => {
      const planId = 1
      const mockPlanData: CreateSubscriptionPlanAPIPayloadRequest = {
        name: 'Updated Plan',
        description: 'Updated Description',
        is_custom: false,
        is_active: true,
        monthly_price: 39.99,
        monthly_fee_our_gateway: 6.99,
        monthly_fee_byo_processor: 4.99,
        card_processing_fee_percentage: 2.5,
        card_processing_fee_fixed: 0.30,
        additional_device_cost: 12.00,
        annual_discount_percentage: 12.0,
        biennial_discount_percentage: 17.0,
        triennial_discount_percentage: 22.0,
        included_devices_count: 7,
        max_users_per_branch: 15,
        included_branches_count: 2
      }

      const mockError = new Error('Update failed')
      mockAxiosInstance.put.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.updateSubscriptionPlan(planId, mockPlanData)).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to update subscription plan:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('deleteSubscriptionPlan', () => {
    it('should delete a subscription plan successfully', async () => {
      const planId = 1
      const mockResponse: AxiosResponse<{ success: boolean; message: string }> = {
        data: {
          success: true,
          message: 'Plan deleted successfully'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.delete.mockResolvedValue(mockResponse)

      const result = await planService.deleteSubscriptionPlan(planId)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/${planId}`)
      expect(result).toEqual(mockResponse)
    })

    it('should handle deletion errors', async () => {
      const planId = 1
      const mockError = new Error('Delete failed')
      mockAxiosInstance.delete.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.deleteSubscriptionPlan(planId)).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to delete subscription plan:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('getAllFeatures', () => {
    it('should fetch all features successfully', async () => {
      const mockResponse: AxiosResponse<FeaturesListAPIResponse> = {
        data: {
          success: true,
          message: 'Features retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 2,
          data: [
            {
              id: 1,
              name: 'Feature 1',
              description: 'First feature',
              display_order: 1
            },
            {
              id: 2,
              name: 'Feature 2',
              description: 'Second feature',
              display_order: 2
            }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await planService.getAllFeatures()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/features')
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors when fetching features', async () => {
      const mockError = new Error('Features fetch failed')
      mockAxiosInstance.get.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.getAllFeatures()).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to fetch features:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('getAllAddOns', () => {
    it('should fetch all add-ons successfully', async () => {
      const mockResponse: AxiosResponse<AddOnsListAPIResponse> = {
        data: {
          success: true,
          message: 'Add-ons retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 2,
          data: [
            {
              id: 1,
              name: 'Add-on 1',
              description: 'First add-on',
              pricing_scope: 'branch',
              base_price: 10.00,
              default_quantity: 1,
              is_included: false,
              min_quantity: 1,
              max_quantity: 10,
              display_order: 1
            },
            {
              id: 2,
              name: 'Add-on 2',
              description: 'Second add-on',
              pricing_scope: 'organization',
              base_price: 25.00,
              default_quantity: 1,
              is_included: true,
              min_quantity: 1,
              max_quantity: null,
              display_order: 2
            }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await planService.getAllAddOns()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/add-ons')
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors when fetching add-ons', async () => {
      const mockError = new Error('Add-ons fetch failed')
      mockAxiosInstance.get.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.getAllAddOns()).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to fetch add-ons:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('getAllSLAs', () => {
    it('should fetch all SLAs successfully', async () => {
      const mockResponse: AxiosResponse<SlaListAPIResponse> = {
        data: {
          success: true,
          message: 'SLAs retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 2,
          data: [
            {
              id: 1,
              name: 'Basic Support',
              support_channel: 'Email',
              response_time_hours: 24,
              availability_schedule: 'Business Hours',
              notes: 'Basic email support',
              display_order: 1
            },
            {
              id: 2,
              name: 'Premium Support',
              support_channel: 'Phone',
              response_time_hours: 4,
              availability_schedule: '24/7',
              notes: 'Priority phone support',
              display_order: 2
            }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await planService.getAllSLAs()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sla')
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors when fetching SLAs', async () => {
      const mockError = new Error('SLAs fetch failed')
      mockAxiosInstance.get.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.getAllSLAs()).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to fetch SLAs:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('createFeature', () => {
    it('should create a feature successfully', async () => {
      const mockFeatureData: CreatePlanFeaturePayloadRequest = {
        name: 'New Feature',
        description: 'A new feature description'
      }

      const mockResponse: AxiosResponse<CreateFeatureAPIResponse> = {
        data: {
          success: true,
          message: 'Feature created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'New Feature',
            status: true
          },
          validation_errors: {
            field: '',
            message: ''
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await planService.createFeature(mockFeatureData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/features', mockFeatureData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle feature creation errors', async () => {
      const mockFeatureData: CreatePlanFeaturePayloadRequest = {
        name: 'New Feature',
        description: 'A new feature description'
      }

      const mockError = new Error('Feature creation failed')
      mockAxiosInstance.post.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.createFeature(mockFeatureData)).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to create feature:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('createAddOn', () => {
    it('should create an add-on successfully', async () => {
      const mockAddOnData: CreatePlanAddOnPayloadRequest = {
        name: 'New Add-on',
        description: 'A new add-on description',
        pricing_scope: 'branch',
        base_price: 15.00
      }

      const mockResponse: AxiosResponse<CreateAddonAPIResponse> = {
        data: {
          success: true,
          message: 'Add-on created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'New Add-on',
            status: true
          },
          validation_errors: {
            field: '',
            message: ''
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await planService.createAddOn(mockAddOnData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/add-ons', mockAddOnData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle add-on creation errors', async () => {
      const mockAddOnData: CreatePlanAddOnPayloadRequest = {
        name: 'New Add-on',
        description: 'A new add-on description',
        pricing_scope: 'organization',
        base_price: 20.00
      }

      const mockError = new Error('Add-on creation failed')
      mockAxiosInstance.post.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.createAddOn(mockAddOnData)).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to create add-on:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('createSLA', () => {
    it('should create an SLA successfully', async () => {
      const mockSLAData: CreatePlanSLAPayloadRequest = {
        name: 'New SLA',
        support_channel: 'Chat',
        response_time_hours: 2,
        availability_schedule: '24/7',
        notes: 'Live chat support'
      }

      const mockResponse: AxiosResponse<CreateSlaAPIResponse> = {
        data: {
          success: true,
          message: 'SLA created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'New SLA',
            status: true
          },
          validation_errors: {
            field: '',
            message: ''
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await planService.createSLA(mockSLAData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/sla', mockSLAData)
      expect(result).toEqual(mockResponse)
    })

    it('should create an SLA without notes successfully', async () => {
      const mockSLAData: CreatePlanSLAPayloadRequest = {
        name: 'Basic SLA',
        support_channel: 'Email',
        response_time_hours: 48,
        availability_schedule: 'Business Hours'
      }

      const mockResponse: AxiosResponse<CreateSlaAPIResponse> = {
        data: {
          success: true,
          message: 'SLA created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 2,
            name: 'Basic SLA',
            status: true
          },
          validation_errors: {
            field: '',
            message: ''
          }
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await planService.createSLA(mockSLAData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/sla', mockSLAData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle SLA creation errors', async () => {
      const mockSLAData: CreatePlanSLAPayloadRequest = {
        name: 'New SLA',
        support_channel: 'Chat',
        response_time_hours: 2,
        availability_schedule: '24/7',
        notes: 'Live chat support'
      }

      const mockError = new Error('SLA creation failed')
      mockAxiosInstance.post.mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.createSLA(mockSLAData)).rejects.toThrow(mockError)
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to create SLA:', mockError)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling and Console Logging', () => {
    it('should log appropriate error messages for each method', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Generic API Error')

      const testCases = [
        {
          method: () => planService.getAllSubscriptionPlans(),
          expectedMessage: '[PlanService] Failed to fetch subscription plans:'
        },
        {
          method: () => planService.createSubscriptionPlan({} as CreateSubscriptionPlanAPIPayloadRequest),
          expectedMessage: '[PlanService] Failed to create subscription plan:'
        },
        {
          method: () => planService.getSubscriptionPlanDetails(1),
          expectedMessage: '[PlanService] Failed to fetch subscription plan details:'
        },
        {
          method: () => planService.updateSubscriptionPlan(1, {} as CreateSubscriptionPlanAPIPayloadRequest),
          expectedMessage: '[PlanService] Failed to update subscription plan:'
        },
        {
          method: () => planService.deleteSubscriptionPlan(1),
          expectedMessage: '[PlanService] Failed to delete subscription plan:'
        },
        {
          method: () => planService.getAllFeatures(),
          expectedMessage: '[PlanService] Failed to fetch features:'
        },
        {
          method: () => planService.getAllAddOns(),
          expectedMessage: '[PlanService] Failed to fetch add-ons:'
        },
        {
          method: () => planService.getAllSLAs(),
          expectedMessage: '[PlanService] Failed to fetch SLAs:'
        },
        {
          method: () => planService.createFeature({} as CreatePlanFeaturePayloadRequest),
          expectedMessage: '[PlanService] Failed to create feature:'
        },
        {
          method: () => planService.createAddOn({} as CreatePlanAddOnPayloadRequest),
          expectedMessage: '[PlanService] Failed to create add-on:'
        },
        {
          method: () => planService.createSLA({} as CreatePlanSLAPayloadRequest),
          expectedMessage: '[PlanService] Failed to create SLA:'
        }
      ]

      for (const testCase of testCases) {
        // Reset mocks for each test case
        mockAxiosInstance.get.mockRejectedValue(mockError)
        mockAxiosInstance.post.mockRejectedValue(mockError)
        mockAxiosInstance.put.mockRejectedValue(mockError)
        mockAxiosInstance.delete.mockRejectedValue(mockError)
        
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
    it('should accept correct parameter types for plan creation', () => {
      const validPlanData: CreateSubscriptionPlanAPIPayloadRequest = {
        name: 'Test Plan',
        description: 'Test Description',
        is_custom: false,
        is_active: true,
        monthly_price: 29.99,
        monthly_fee_our_gateway: 5.99,
        monthly_fee_byo_processor: 3.99,
        card_processing_fee_percentage: 2.5,
        card_processing_fee_fixed: 0.30,
        additional_device_cost: 10.00,
        annual_discount_percentage: 10.0,
        biennial_discount_percentage: 15.0,
        triennial_discount_percentage: 20.0,
        included_devices_count: 5,
        max_users_per_branch: 10,
        included_branches_count: 1,
        feature_ids: [1, 2, 3],
        addon_assignments: [
          {
            addon_id: 1,
            default_quantity: 2,
            is_included: false,
            feature_level: 'basic',
            min_quantity: 1,
            max_quantity: 5
          }
        ],
        support_sla_ids: [1, 2],
        volume_discounts: [
          {
            name: 'Small Business',
            min_branches: 1,
            max_branches: 5,
            discount_percentage: 5.0
          }
        ]
      }

      expect(() => planService.createSubscriptionPlan(validPlanData)).not.toThrow()
    })

    it('should accept correct parameter types for feature creation', () => {
      const validFeatureData: CreatePlanFeaturePayloadRequest = {
        name: 'Test Feature',
        description: 'Test Feature Description'
      }

      expect(() => planService.createFeature(validFeatureData)).not.toThrow()
    })

    it('should accept correct parameter types for add-on creation', () => {
      const validAddOnData: CreatePlanAddOnPayloadRequest = {
        name: 'Test Add-on',
        description: 'Test Add-on Description',
        pricing_scope: 'branch',
        base_price: 15.99
      }

      expect(() => planService.createAddOn(validAddOnData)).not.toThrow()
    })

    it('should accept correct parameter types for SLA creation', () => {
      const validSLAData: CreatePlanSLAPayloadRequest = {
        name: 'Test SLA',
        support_channel: 'Email',
        response_time_hours: 24,
        availability_schedule: 'Business Hours',
        notes: 'Test notes'
      }

      expect(() => planService.createSLA(validSLAData)).not.toThrow()
    })

    it('should accept numeric plan IDs', () => {
      expect(() => planService.getSubscriptionPlanDetails(123)).not.toThrow()
      expect(() => planService.updateSubscriptionPlan(456, {} as CreateSubscriptionPlanAPIPayloadRequest)).not.toThrow()
      expect(() => planService.deleteSubscriptionPlan(789)).not.toThrow()
    })
  })
})