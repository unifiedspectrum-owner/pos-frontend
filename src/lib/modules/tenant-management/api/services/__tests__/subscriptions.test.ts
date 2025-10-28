/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Tenant management module imports */
import type { AssignPlanToTenantApiRequest, AssignPlanToTenantApiResponse, AssignedPlanApiResponse, StartResourceProvisioningApiResponse } from '@tenant-management/types'
import { TENANT_API_ROUTES } from '@tenant-management/constants'

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
vi.mock('@tenant-management/api/client', () => ({
  tenantApiClient: mockAxiosInstance
}))

describe('subscriptionService', () => {
  let subscriptionService: typeof import('@tenant-management/api/services/subscriptions').subscriptionService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@tenant-management/api/services/subscriptions')
    subscriptionService = module.subscriptionService
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
    it('should have subscriptionService with all required methods', () => {
      expect(subscriptionService).toBeDefined()
      expect(subscriptionService.assignPlanToTenant).toBeTypeOf('function')
      expect(subscriptionService.getAssignedPlanForTenant).toBeTypeOf('function')
      expect(subscriptionService.startTenantResourceProvisioning).toBeTypeOf('function')
    })
  })

  describe('assignPlanToTenant', () => {
    it('should assign plan to tenant successfully with monthly billing', async () => {
      const tenantId = 'tenant-1'
      const planData: AssignPlanToTenantApiRequest = {
        plan_id: 1,
        billing_cycle: 'monthly',
        branches_count: 3,
        organization_addon_assignments: [
          {
            addon_id: 1,
            feature_level: 'premium'
          }
        ],
        branch_addon_assignments: [
          {
            branch_id: 1,
            addon_assignments: [
              {
                addon_id: 2,
                feature_level: 'basic'
              }
            ]
          }
        ]
      }

      const mockResponse: AxiosResponse<AssignPlanToTenantApiResponse> = {
        data: {
          success: true,
          message: 'Plan assigned successfully',
          data: {
            tenant_id: 'tenant-1',
            plan_id: 1,
            subscription_status: 'active',
            billing_cycle: 'monthly'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await subscriptionService.assignPlanToTenant(planData, tenantId)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.ASSIGN_PLAN.replace(':id', tenantId), planData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.plan_id).toBe(1)
      expect(result.data?.billing_cycle).toBe('monthly')
    })

    it('should assign plan to tenant successfully with yearly billing', async () => {
      const tenantId = 'tenant-2'
      const planData: AssignPlanToTenantApiRequest = {
        plan_id: 2,
        billing_cycle: 'yearly',
        branches_count: 5,
        organization_addon_assignments: [],
        branch_addon_assignments: []
      }

      const mockResponse: AxiosResponse<AssignPlanToTenantApiResponse> = {
        data: {
          success: true,
          message: 'Plan assigned successfully',
          data: {
            tenant_id: 'tenant-2',
            plan_id: 2,
            subscription_status: 'active',
            billing_cycle: 'yearly'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await subscriptionService.assignPlanToTenant(planData, tenantId)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.ASSIGN_PLAN.replace(':id', tenantId), planData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.billing_cycle).toBe('yearly')
    })

    it('should handle plan assignment errors', async () => {
      const tenantId = 'tenant-1'
      const planData: AssignPlanToTenantApiRequest = {
        plan_id: 999,
        billing_cycle: 'monthly',
        branches_count: 1,
        organization_addon_assignments: [],
        branch_addon_assignments: []
      }

      const mockError = new Error('Plan not found')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(subscriptionService.assignPlanToTenant(planData, tenantId)).rejects.toThrow('Plan not found')
      expect(consoleSpy).toHaveBeenCalledWith('[SubscriptionService] Failed to assign plan:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle validation errors for plan assignment', async () => {
      const tenantId = 'tenant-1'
      const planData: AssignPlanToTenantApiRequest = {
        plan_id: 1,
        billing_cycle: 'monthly',
        branches_count: 0,
        organization_addon_assignments: [],
        branch_addon_assignments: []
      }

      const mockError = new Error('Branches count must be greater than 0')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(subscriptionService.assignPlanToTenant(planData, tenantId)).rejects.toThrow('Branches count must be greater than 0')
      expect(consoleSpy).toHaveBeenCalledWith('[SubscriptionService] Failed to assign plan:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getAssignedPlanForTenant', () => {
    it('should fetch assigned plan details successfully', async () => {
      const tenantId = 'tenant-1'
      const mockResponse: AxiosResponse<AssignedPlanApiResponse> = {
        data: {
          success: true,
          message: 'Assigned plan retrieved successfully',
          data: {
            plan: {
              id: 1,
              name: 'Premium Plan',
              description: 'Premium tier subscription',
              display_order: 1,
              is_active: true,
              is_custom: false,
              is_featured: true,
              monthly_price: 99.99,
              included_branches_count: 3,
              annual_discount_percentage: 20,
              features: [
                {
                  id: 1,
                  name: 'Advanced Analytics',
                  description: 'Detailed analytics and reporting',
                  display_order: 1
                }
              ],
              add_ons: [
                {
                  id: 1,
                  name: 'Extra Storage',
                  description: '100GB additional storage',
                  pricing_scope: 'organization',
                  addon_price: 10,
                  default_quantity: null,
                  is_included: true,
                  feature_level: null,
                  min_quantity: null,
                  max_quantity: null,
                  display_order: 1
                }
              ]
            },
            billingCycle: 'monthly',
            branchCount: 3,
            branches: [
              {
                branchIndex: 0,
                branchName: 'Main Branch',
                isSelected: true
              },
              {
                branchIndex: 1,
                branchName: 'Secondary Branch',
                isSelected: true
              },
              {
                branchIndex: 2,
                branchName: 'Tertiary Branch',
                isSelected: true
              }
            ],
            add_ons: [
              {
                addon_id: 1,
                addon_name: 'Extra Storage',
                addon_price: 10,
                pricing_scope: 'organization',
                branches: [],
                is_included: true
              }
            ]
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await subscriptionService.getAssignedPlanForTenant(tenantId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.GET_ASSIGNED_PLAN.replace(':id', tenantId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data.plan.id).toBe(1)
      expect(result.data.billingCycle).toBe('monthly')
      expect(result.data.branchCount).toBe(3)
    })

    it('should fetch assigned plan with no addons', async () => {
      const tenantId = 'tenant-2'
      const mockResponse: AxiosResponse<AssignedPlanApiResponse> = {
        data: {
          success: true,
          message: 'Assigned plan retrieved successfully',
          data: {
            plan: {
              id: 2,
              name: 'Basic Plan',
              description: 'Basic tier subscription',
              display_order: 2,
              is_active: true,
              is_custom: false,
              is_featured: false,
              monthly_price: 49.99,
              included_branches_count: 1,
              annual_discount_percentage: 15,
              features: [],
              add_ons: []
            },
            billingCycle: 'yearly',
            branchCount: 1,
            branches: [
              {
                branchIndex: 0,
                branchName: 'Main Branch',
                isSelected: true
              }
            ],
            add_ons: []
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await subscriptionService.getAssignedPlanForTenant(tenantId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.GET_ASSIGNED_PLAN.replace(':id', tenantId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data.add_ons).toHaveLength(0)
    })

    it('should handle errors when fetching assigned plan', async () => {
      const tenantId = 'tenant-999'
      const mockError = new Error('No plan assigned to tenant')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(subscriptionService.getAssignedPlanForTenant(tenantId)).rejects.toThrow('No plan assigned to tenant')
      expect(consoleSpy).toHaveBeenCalledWith('[SubscriptionService] Failed to get assigned plan:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('startTenantResourceProvisioning', () => {
    it('should start resource provisioning successfully', async () => {
      const tenantId = 'tenant-1'
      const mockResponse: AxiosResponse<StartResourceProvisioningApiResponse> = {
        data: {
          success: true,
          message: 'Resource provisioning started successfully',
          data: {
            request_id: 'req-12345',
            status_url: '/api/tenants/tenant-1/provision/status',
            estimated_time: '5 minutes'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await subscriptionService.startTenantResourceProvisioning(tenantId)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.PROVISION.START.replace(':id', tenantId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.request_id).toBe('req-12345')
      expect(result.data?.estimated_time).toBe('5 minutes')
    })

    it('should handle provisioning start errors', async () => {
      const tenantId = 'tenant-1'
      const mockError = new Error('No plan assigned to tenant')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(subscriptionService.startTenantResourceProvisioning(tenantId)).rejects.toThrow('No plan assigned to tenant')
      expect(consoleSpy).toHaveBeenCalledWith('[SubscriptionService] Failed to start resource provisioning:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle already provisioned tenant error', async () => {
      const tenantId = 'tenant-2'
      const mockError = new Error('Resources already provisioned for this tenant')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(subscriptionService.startTenantResourceProvisioning(tenantId)).rejects.toThrow('Resources already provisioned for this tenant')
      expect(consoleSpy).toHaveBeenCalledWith('[SubscriptionService] Failed to start resource provisioning:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for assign plan', async () => {
      const mockResponse: AxiosResponse<AssignPlanToTenantApiResponse> = {
        data: {
          success: true,
          message: 'Plan assigned',
          data: {
            tenant_id: 'tenant-1',
            plan_id: 1,
            subscription_status: 'active',
            billing_cycle: 'monthly'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await subscriptionService.assignPlanToTenant({} as AssignPlanToTenantApiRequest, 'tenant-1')

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('tenant_id')
      expect(result.data).toHaveProperty('plan_id')
      expect(result.data).toHaveProperty('subscription_status')
      expect(result.data).toHaveProperty('billing_cycle')
      expect(result).toHaveProperty('timestamp')
    })

    it('should return proper response structure for get assigned plan', async () => {
      const mockResponse: AxiosResponse<AssignedPlanApiResponse> = {
        data: {
          success: true,
          message: 'Assigned plan retrieved',
          data: {
            plan: {
              id: 1,
              name: 'Test Plan',
              description: 'Test Description',
              display_order: 1,
              is_active: true,
              is_custom: false,
              is_featured: false,
              monthly_price: 99.99,
              included_branches_count: 3,
              annual_discount_percentage: 20,
              features: [],
              add_ons: []
            },
            billingCycle: 'monthly',
            branchCount: 3,
            branches: [],
            add_ons: []
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await subscriptionService.getAssignedPlanForTenant('tenant-1')

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('plan')
      expect(result.data).toHaveProperty('billingCycle')
      expect(result.data).toHaveProperty('branchCount')
      expect(result.data).toHaveProperty('branches')
      expect(result.data).toHaveProperty('add_ons')
    })

    it('should return proper response structure for start provisioning', async () => {
      const mockResponse: AxiosResponse<StartResourceProvisioningApiResponse> = {
        data: {
          success: true,
          message: 'Provisioning started',
          data: {
            request_id: 'req-123',
            status_url: '/api/status',
            estimated_time: '5 minutes'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await subscriptionService.startTenantResourceProvisioning('tenant-1')

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('request_id')
      expect(result.data).toHaveProperty('status_url')
      expect(result.data).toHaveProperty('estimated_time')
    })
  })
})
