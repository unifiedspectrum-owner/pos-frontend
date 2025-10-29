/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Plan management module imports */
import type { PlansListApiResponse, GetPlanDetailsApiResponse, CreatePlanApiRequest, CreatePlanApiResponse } from '@plan-management/types'
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

describe('planService', () => {
  let planService: typeof import('@plan-management/api/services/plans').planService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@plan-management/api/services/plans')
    planService = module.planService
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
    it('should have planService with all required methods', () => {
      expect(planService).toBeDefined()
      expect(planService.getAllSubscriptionPlans).toBeTypeOf('function')
      expect(planService.createSubscriptionPlan).toBeTypeOf('function')
      expect(planService.getSubscriptionPlanDetails).toBeTypeOf('function')
      expect(planService.updateSubscriptionPlan).toBeTypeOf('function')
      expect(planService.deleteSubscriptionPlan).toBeTypeOf('function')
    })
  })

  describe('getAllSubscriptionPlans', () => {
    it('should fetch all subscription plans successfully', async () => {
      const mockResponse: AxiosResponse<PlansListApiResponse> = {
        data: {
          success: true,
          message: 'Subscription plans retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 2,
          data: [
            {
              id: 1,
              name: 'Basic Plan',
              description: 'Starter plan for small businesses',
              features: [
                {
                  id: 1,
                  name: 'Inventory Management',
                  description: 'Track inventory in real-time',
                  display_order: 1
                }
              ],
              is_featured: false,
              is_active: true,
              is_custom: false,
              display_order: 1,
              monthly_price: 29.99,
              included_branches_count: 1,
              annual_discount_percentage: 10,
              add_ons: []
            },
            {
              id: 2,
              name: 'Professional Plan',
              description: 'Advanced plan for growing businesses',
              features: [
                {
                  id: 1,
                  name: 'Inventory Management',
                  description: 'Track inventory in real-time',
                  display_order: 1
                },
                {
                  id: 2,
                  name: 'Advanced Reporting',
                  description: 'Detailed analytics and insights',
                  display_order: 2
                }
              ],
              is_featured: true,
              is_active: true,
              is_custom: false,
              display_order: 2,
              monthly_price: 79.99,
              included_branches_count: 5,
              annual_discount_percentage: 15,
              add_ons: []
            }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await planService.getAllSubscriptionPlans()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.PLAN.LIST)
      expect(result).toEqual(mockResponse.data)
      expect(result.count).toBe(2)
      expect(result.data).toHaveLength(2)
    })

    it('should fetch empty plans list successfully', async () => {
      const mockResponse: AxiosResponse<PlansListApiResponse> = {
        data: {
          success: true,
          message: 'No subscription plans found',
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

      const result = await planService.getAllSubscriptionPlans()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.PLAN.LIST)
      expect(result).toEqual(mockResponse.data)
      expect(result.count).toBe(0)
    })

    it('should handle errors when fetching plans fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.getAllSubscriptionPlans()).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to fetch subscription plans:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getSubscriptionPlanDetails', () => {
    it('should fetch plan details successfully', async () => {
      const planId = 1
      const mockResponse: AxiosResponse<GetPlanDetailsApiResponse> = {
        data: {
          success: true,
          message: 'Plan details retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          count: 1,
          data: {
            id: 1,
            name: 'Basic Plan',
            description: 'Starter plan for small businesses',
            display_order: 1,
            trial_period_days: 14,
            is_active: 1,
            is_custom: 0,
            monthly_price: 29.99,
            monthly_fee_our_gateway: 2.5,
            monthly_fee_byo_processor: 1.5,
            card_processing_fee_percentage: 2.9,
            card_processing_fee_fixed: 0.3,
            additional_device_cost: 10,
            annual_discount_percentage: 10,
            biennial_discount_percentage: 15,
            triennial_discount_percentage: 20,
            included_devices_count: 2,
            max_users_per_branch: 5,
            included_branches_count: 1,
            features: [
              {
                id: 1,
                name: 'Inventory Management',
                description: 'Track inventory in real-time',
                display_order: 1
              }
            ],
            add_ons: [],
            support_sla: [],
            volume_discounts: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await planService.getSubscriptionPlanDetails(planId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(PLAN_API_ROUTES.PLAN.DETAILS.replace(':id', '1'))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.id).toBe(1)
      expect(result.data?.name).toBe('Basic Plan')
    })

    it('should handle errors when fetching plan details fails', async () => {
      const planId = 999
      const mockError = new Error('Plan not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.getSubscriptionPlanDetails(planId)).rejects.toThrow('Plan not found')
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to fetch subscription plan details:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('createSubscriptionPlan', () => {
    it('should create a new subscription plan successfully', async () => {
      const mockPlanData: CreatePlanApiRequest = {
        name: 'Enterprise Plan',
        description: 'Complete solution for large enterprises',
        is_custom: false,
        is_active: true,
        monthly_price: 199.99,
        monthly_fee_our_gateway: 5.0,
        monthly_fee_byo_processor: 3.0,
        card_processing_fee_percentage: 2.5,
        card_processing_fee_fixed: 0.25,
        additional_device_cost: 8,
        annual_discount_percentage: 20,
        included_devices_count: 10,
        max_users_per_branch: 50,
        included_branches_count: 10,
        feature_ids: [1, 2, 3],
        support_sla_ids: [1, 2]
      }

      const mockResponse: AxiosResponse<CreatePlanApiResponse> = {
        data: {
          success: true,
          message: 'Subscription plan created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 3,
            name: 'Enterprise Plan',
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

      const result = await planService.createSubscriptionPlan(mockPlanData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(PLAN_API_ROUTES.PLAN.CREATE, mockPlanData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.id).toBe(3)
      expect(result.data?.name).toBe('Enterprise Plan')
    })

    it('should handle plan creation with validation errors', async () => {
      const mockPlanData: CreatePlanApiRequest = {
        name: '',
        description: 'Invalid plan',
        is_custom: false,
        is_active: true,
        monthly_price: -10,
        monthly_fee_our_gateway: 2.5,
        monthly_fee_byo_processor: 1.5,
        card_processing_fee_percentage: 2.9,
        card_processing_fee_fixed: 0.3,
        additional_device_cost: 10,
        annual_discount_percentage: 10,
        included_devices_count: 2,
        max_users_per_branch: 5,
        included_branches_count: 1
      }

      const mockResponse: AxiosResponse<CreatePlanApiResponse> = {
        data: {
          success: false,
          message: 'Validation failed',
          timestamp: '2024-01-01T00:00:00Z',
          validation_errors: [
            {
              field: 'name',
              message: 'Plan name is required'
            },
            {
              field: 'monthly_price',
              message: 'Monthly price must be positive'
            }
          ]
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await planService.createSubscriptionPlan(mockPlanData)

      expect(result.success).toBe(false)
      expect(result.validation_errors).toHaveLength(2)
    })

    it('should handle plan creation errors', async () => {
      const mockPlanData: CreatePlanApiRequest = {
        name: 'Test Plan',
        description: 'Test description',
        is_custom: false,
        is_active: true,
        monthly_price: 49.99,
        monthly_fee_our_gateway: 2.5,
        monthly_fee_byo_processor: 1.5,
        card_processing_fee_percentage: 2.9,
        card_processing_fee_fixed: 0.3,
        additional_device_cost: 10,
        annual_discount_percentage: 10,
        included_devices_count: 2,
        max_users_per_branch: 5,
        included_branches_count: 1
      }

      const mockError = new Error('Failed to create plan')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.createSubscriptionPlan(mockPlanData)).rejects.toThrow('Failed to create plan')
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to create subscription plan:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('updateSubscriptionPlan', () => {
    it('should update subscription plan successfully', async () => {
      const planId = 1
      const mockUpdateData: CreatePlanApiRequest = {
        name: 'Basic Plan Updated',
        description: 'Updated starter plan',
        is_custom: false,
        is_active: true,
        monthly_price: 34.99,
        monthly_fee_our_gateway: 2.5,
        monthly_fee_byo_processor: 1.5,
        card_processing_fee_percentage: 2.9,
        card_processing_fee_fixed: 0.3,
        additional_device_cost: 10,
        annual_discount_percentage: 12,
        included_devices_count: 3,
        max_users_per_branch: 8,
        included_branches_count: 1
      }

      const mockResponse: AxiosResponse<CreatePlanApiResponse> = {
        data: {
          success: true,
          message: 'Subscription plan updated successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            id: 1,
            name: 'Basic Plan Updated',
            status: true
          },
          validation_errors: []
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await planService.updateSubscriptionPlan(planId, mockUpdateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(PLAN_API_ROUTES.PLAN.UPDATE.replace(':id', '1'), mockUpdateData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.name).toBe('Basic Plan Updated')
    })

    it('should handle update errors', async () => {
      const planId = 1
      const mockUpdateData: CreatePlanApiRequest = {
        name: 'Updated Plan',
        description: 'Updated description',
        is_custom: false,
        is_active: true,
        monthly_price: 49.99,
        monthly_fee_our_gateway: 2.5,
        monthly_fee_byo_processor: 1.5,
        card_processing_fee_percentage: 2.9,
        card_processing_fee_fixed: 0.3,
        additional_device_cost: 10,
        annual_discount_percentage: 10,
        included_devices_count: 2,
        max_users_per_branch: 5,
        included_branches_count: 1
      }

      const mockError = new Error('Failed to update plan')
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.updateSubscriptionPlan(planId, mockUpdateData)).rejects.toThrow('Failed to update plan')
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to update subscription plan:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('deleteSubscriptionPlan', () => {
    it('should delete subscription plan successfully', async () => {
      const planId = 5
      const mockResponse: AxiosResponse<{ success: boolean; message: string }> = {
        data: {
          success: true,
          message: 'Subscription plan deleted successfully'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.delete.mockResolvedValue(mockResponse)

      const result = await planService.deleteSubscriptionPlan(planId)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(PLAN_API_ROUTES.PLAN.DELETE.replace(':id', '5'))
      expect(result).toEqual(mockResponse.data)
      expect(result.success).toBe(true)
    })

    it('should handle deletion errors', async () => {
      const planId = 999
      const mockError = new Error('Plan not found')
      mockAxiosInstance.delete.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(planService.deleteSubscriptionPlan(planId)).rejects.toThrow('Plan not found')
      expect(consoleSpy).toHaveBeenCalledWith('[PlanService] Failed to delete subscription plan:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for list plans', async () => {
      const mockResponse: AxiosResponse<PlansListApiResponse> = {
        data: {
          success: true,
          message: 'Plans retrieved',
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

      const result = await planService.getAllSubscriptionPlans()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('count')
      expect(result).toHaveProperty('data')
    })

    it('should return proper response structure for create plan', async () => {
      const mockResponse: AxiosResponse<CreatePlanApiResponse> = {
        data: {
          success: true,
          message: 'Plan created',
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
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await planService.createSubscriptionPlan({} as CreatePlanApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('validation_errors')
    })
  })
})
