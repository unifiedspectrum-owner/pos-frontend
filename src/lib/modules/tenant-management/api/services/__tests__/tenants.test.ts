/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Tenant management module imports */
import type { TenantListApiResponse, TenantBasicListResponse, TenantDetailsApiResponse, SuspendTenantApiRequest, SuspendTenantApiResponse, HoldTenantApiRequest, HoldTenantApiResponse, ActivateTenantApiRequest, ActivateTenantApiResponse, deleteTenantApiResponse } from '@tenant-management/types'
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

describe('tenantService', () => {
  let tenantService: typeof import('@tenant-management/api/services/tenants').tenantService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@tenant-management/api/services/tenants')
    tenantService = module.tenantService
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
    it('should have tenantService with all required methods', () => {
      expect(tenantService).toBeDefined()
      expect(tenantService.listAllTenants).toBeTypeOf('function')
      expect(tenantService.listAllTenantsWithBaseDetails).toBeTypeOf('function')
      expect(tenantService.getTenantDetails).toBeTypeOf('function')
      expect(tenantService.suspendTenant).toBeTypeOf('function')
      expect(tenantService.holdTenant).toBeTypeOf('function')
      expect(tenantService.activateTenant).toBeTypeOf('function')
      expect(tenantService.deleteTenant).toBeTypeOf('function')
    })
  })

  describe('listAllTenants', () => {
    it('should fetch paginated tenant list successfully with default parameters', async () => {
      const mockResponse: AxiosResponse<TenantListApiResponse> = {
        data: {
          success: true,
          message: 'Tenants retrieved successfully',
          tenants: [
            {
              tenant_id: 'tenant-1',
              organization_name: 'Acme Corp',
              tenant_status: 'active',
              tenant_created_at: '2024-01-01T00:00:00Z',
              plan_id: 1,
              plan_name: 'Premium Plan',
              subscription_status: 'active',
              billing_cycle: 'monthly',
              subscription_created_at: '2024-01-01T00:00:00Z'
            },
            {
              tenant_id: 'tenant-2',
              organization_name: 'Tech Solutions',
              tenant_status: 'active',
              tenant_created_at: '2024-01-02T00:00:00Z',
              plan_id: 2,
              plan_name: 'Basic Plan',
              subscription_status: 'active',
              billing_cycle: 'monthly',
              subscription_created_at: '2024-01-02T00:00:00Z'
            }
          ],
          pagination: {
            current_page: 1,
            limit: 10,
            total_count: 2,
            total_pages: 1,
            has_next_page: false,
            has_prev_page: false
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await tenantService.listAllTenants(1, 10)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(TENANT_API_ROUTES.LIST, {
        params: { page: 1, limit: 10 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch paginated tenant list with custom page and limit', async () => {
      const mockResponse: AxiosResponse<TenantListApiResponse> = {
        data: {
          success: true,
          message: 'Tenants retrieved successfully',
          tenants: [],
          pagination: {
            current_page: 2,
            limit: 5,
            total_count: 15,
            total_pages: 3,
            has_next_page: true,
            has_prev_page: true
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await tenantService.listAllTenants(2, 5)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(TENANT_API_ROUTES.LIST, {
        params: { page: 2, limit: 5 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching tenant list', async () => {
      const mockError = new Error('Failed to fetch tenants')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(tenantService.listAllTenants()).rejects.toThrow('Failed to fetch tenants')
      expect(consoleSpy).toHaveBeenCalledWith('[TenantService] Failed to list tenants:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('listAllTenantsWithBaseDetails', () => {
    it('should fetch tenant list with basic details successfully', async () => {
      const mockResponse: AxiosResponse<TenantBasicListResponse> = {
        data: {
          success: true,
          message: 'Tenants retrieved successfully',
          data: {
            tenants: [
              {
                id: 1,
                tenant_id: 'tenant-1',
                organization_name: 'Acme Corp',
                primary_email: 'john@acme.com',
                primary_phone: '+1234567890'
              },
              {
                id: 2,
                tenant_id: 'tenant-2',
                organization_name: 'Tech Solutions',
                primary_email: 'jane@techsolutions.com',
                primary_phone: '+1987654321'
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

      const result = await tenantService.listAllTenantsWithBaseDetails()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(TENANT_API_ROUTES.LIST_WITH_BASIC_DETAILS)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.tenants).toHaveLength(2)
    })

    it('should handle errors when fetching tenant list with basic details', async () => {
      const mockError = new Error('Failed to fetch tenants')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(tenantService.listAllTenantsWithBaseDetails()).rejects.toThrow('Failed to fetch tenants')
      expect(consoleSpy).toHaveBeenCalledWith('[TenantService] Failed to list tenants:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getTenantDetails', () => {
    it('should fetch tenant details successfully', async () => {
      const tenantId = 'tenant-1'
      const mockResponse: AxiosResponse<TenantDetailsApiResponse> = {
        data: {
          success: true,
          message: 'Tenant details retrieved successfully',
          data: {
            tenant_details: {
              tenant_id: 'tenant-1',
              organization_name: 'Acme Corp',
              contact_person: 'John Doe',
              primary_email: 'john@acme.com',
              primary_phone: '+1234567890',
              address_line1: '123 Main St',
              address_line2: 'Suite 100',
              city: 'New York',
              state_province: 'NY',
              postal_code: '10001',
              country: 'USA',
              email_verified: true,
              phone_verified: true,
              deployment_type: 'cloud',
              last_deployment_status: 'completed',
              last_deployed_at: '2024-01-01T00:00:00Z',
              max_branches_count: 10,
              current_branches_count: 5,
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            subscription_details: {
              plan_details: {
                plan_id: 1,
                plan_name: 'Premium Plan',
                plan_description: 'Premium tier subscription',
                billing_cycle: 'monthly',
                billing_period_start: '2024-01-01T00:00:00Z',
                billing_period_end: '2024-01-31T00:00:00Z',
                next_billing_date: '2024-02-01T00:00:00Z',
                last_billing_date: '2024-01-01T00:00:00Z',
                subscription_status: 'active'
              },
              addon_details: []
            },
            transaction_details: {
              transactions: [],
              transaction_summary: {
                total_transactions: 1,
                successful_transactions: 1,
                failed_transactions: 0,
                pending_transactions: 0,
                total_paid_amount: 99.99,
                total_pending_amount: 0,
                last_successful_payment_date: '2024-01-01T00:00:00Z'
              }
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await tenantService.getTenantDetails(tenantId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(TENANT_API_ROUTES.DETAILS.replace(':id', tenantId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.tenant_details.tenant_id).toBe('tenant-1')
    })

    it('should handle errors when fetching tenant details', async () => {
      const tenantId = 'tenant-999'
      const mockError = new Error('Tenant not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(tenantService.getTenantDetails(tenantId)).rejects.toThrow('Tenant not found')
      expect(consoleSpy).toHaveBeenCalledWith('[TenantService] Failed to get tenant details:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('suspendTenant', () => {
    it('should suspend tenant successfully', async () => {
      const tenantId = 'tenant-1'
      const suspendData: SuspendTenantApiRequest = {
        reason: 'Non-payment of subscription fees',
        suspend_until: '2024-02-01T00:00:00Z'
      }

      const mockResponse: AxiosResponse<SuspendTenantApiResponse> = {
        data: {
          success: true,
          message: 'Tenant suspended successfully',
          data: {
            tenant_id: 'tenant-1',
            status: 'suspended',
            suspension_id: 'susp-123',
            email_sent: true
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await tenantService.suspendTenant(suspendData, tenantId)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(TENANT_API_ROUTES.ACTIONS.SUSPEND.replace(':id', tenantId), suspendData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.status).toBe('suspended')
    })

    it('should handle errors when suspending tenant', async () => {
      const tenantId = 'tenant-1'
      const suspendData: SuspendTenantApiRequest = {
        reason: 'Violation of terms',
        suspend_until: null
      }

      const mockError = new Error('Failed to suspend tenant')
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(tenantService.suspendTenant(suspendData, tenantId)).rejects.toThrow('Failed to suspend tenant')
      expect(consoleSpy).toHaveBeenCalledWith('[TenantService] Failed to suspend tenant:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('holdTenant', () => {
    it('should put tenant on hold successfully', async () => {
      const tenantId = 'tenant-1'
      const holdData: HoldTenantApiRequest = {
        reason: 'Pending verification',
        hold_until: '2024-01-15T00:00:00Z'
      }

      const mockResponse: AxiosResponse<HoldTenantApiResponse> = {
        data: {
          success: true,
          message: 'Tenant put on hold successfully',
          data: {
            tenant_id: 'tenant-1',
            status: 'hold',
            suspension_id: 'hold-456',
            email_sent: true
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await tenantService.holdTenant(holdData, tenantId)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(TENANT_API_ROUTES.ACTIONS.HOLD.replace(':id', tenantId), holdData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.status).toBe('hold')
    })

    it('should handle errors when putting tenant on hold', async () => {
      const tenantId = 'tenant-1'
      const holdData: HoldTenantApiRequest = {
        reason: 'Account verification',
        hold_until: null
      }

      const mockError = new Error('Failed to hold tenant')
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(tenantService.holdTenant(holdData, tenantId)).rejects.toThrow('Failed to hold tenant')
      expect(consoleSpy).toHaveBeenCalledWith('[TenantService] Failed to hold tenant:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('activateTenant', () => {
    it('should activate tenant successfully', async () => {
      const tenantId = 'tenant-1'
      const activateData: ActivateTenantApiRequest = {
        reason: 'Payment received and verified'
      }

      const mockResponse: AxiosResponse<ActivateTenantApiResponse> = {
        data: {
          success: true,
          message: 'Tenant activated successfully',
          data: {
            tenant_id: 'tenant-1',
            status: 'active',
            suspension_id: 'act-789',
            email_sent: true
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await tenantService.activateTenant(activateData, tenantId)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(TENANT_API_ROUTES.ACTIONS.ACTIVATE.replace(':id', tenantId), activateData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.status).toBe('active')
    })

    it('should handle errors when activating tenant', async () => {
      const tenantId = 'tenant-1'
      const activateData: ActivateTenantApiRequest = {
        reason: 'Reactivation request'
      }

      const mockError = new Error('Failed to activate tenant')
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(tenantService.activateTenant(activateData, tenantId)).rejects.toThrow('Failed to activate tenant')
      expect(consoleSpy).toHaveBeenCalledWith('[TenantService] Failed to activate tenant:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('deleteTenant', () => {
    it('should delete tenant successfully', async () => {
      const tenantId = 'tenant-5'
      const mockResponse: AxiosResponse<deleteTenantApiResponse> = {
        data: {
          success: true,
          message: 'Tenant deleted successfully',
          data: {
            tenant_id: 'tenant-5',
            status: 'inactive',
            deleted_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.delete.mockResolvedValue(mockResponse)

      const result = await tenantService.deleteTenant(tenantId)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(TENANT_API_ROUTES.ACTIONS.DELETE.replace(':id', tenantId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data.status).toBe('inactive')
    })

    it('should handle deletion errors', async () => {
      const tenantId = 'tenant-999'
      const mockError = new Error('Tenant not found')
      mockAxiosInstance.delete.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(tenantService.deleteTenant(tenantId)).rejects.toThrow('Tenant not found')
      expect(consoleSpy).toHaveBeenCalledWith('[TenantService] Failed to delete tenant:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for list tenants', async () => {
      const mockResponse: AxiosResponse<TenantListApiResponse> = {
        data: {
          success: true,
          message: 'Tenants retrieved',
          tenants: [],
          pagination: {
            current_page: 1,
            limit: 10,
            total_count: 0,
            total_pages: 1,
            has_next_page: false,
            has_prev_page: false
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await tenantService.listAllTenants()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('tenants')
      expect(result).toHaveProperty('pagination')
      expect(result).toHaveProperty('timestamp')
    })

    it('should return proper response structure for tenant details', async () => {
      const mockResponse: AxiosResponse<TenantDetailsApiResponse> = {
        data: {
          success: true,
          message: 'Tenant details retrieved',
          data: {
            tenant_details: {
              tenant_id: 'tenant-1',
              organization_name: 'Test Corp',
              contact_person: 'Test User',
              primary_email: 'test@example.com',
              primary_phone: '+1234567890',
              address_line1: '123 Test St',
              address_line2: undefined,
              city: 'Test City',
              state_province: 'TS',
              postal_code: '12345',
              country: 'USA',
              email_verified: true,
              phone_verified: true,
              deployment_type: 'cloud',
              last_deployment_status: 'pending',
              last_deployed_at: '2024-01-01T00:00:00Z',
              max_branches_count: null,
              current_branches_count: 0,
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            subscription_details: {
              plan_details: null,
              addon_details: []
            },
            transaction_details: {
              transactions: [],
              transaction_summary: {
                total_transactions: 0,
                successful_transactions: 0,
                failed_transactions: 0,
                pending_transactions: 0,
                total_paid_amount: 0,
                total_pending_amount: 0
              }
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await tenantService.getTenantDetails('tenant-1')

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('tenant_details')
      expect(result.data).toHaveProperty('subscription_details')
      expect(result.data).toHaveProperty('transaction_details')
    })
  })
})
