/* Comprehensive test suite for useTenantOperations hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'
import * as sharedConfig from '@shared/config'

/* Tenant module imports */
import { useTenantOperations } from '@tenant-management/hooks/tenant-actions/use-tenant-operations'
import { tenantService, paymentService, subscriptionService } from '@tenant-management/api'
import type { CompleteSubscriptionPaymentApiResponse, StartResourceProvisioningApiResponse } from '@tenant-management/types'

/* Mock dependencies */
vi.mock('@tenant-management/api', () => ({
  tenantService: {
    deleteTenant: vi.fn()
  },
  paymentService: {
    completeTenantSubscriptionPayment: vi.fn()
  },
  subscriptionService: {
    startTenantResourceProvisioning: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/config', async () => {
  const actual = await vi.importActual('@shared/config')
  return {
    ...actual,
    LOADING_DELAY_ENABLED: false,
    LOADING_DELAY: 0
  }
})

describe('useTenantOperations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Hook Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useTenantOperations())

      expect(result.current.isDeleting).toBe(false)
      expect(result.current.deleteError).toBe(null)
      expect(result.current.isCompletingPayment).toBe(false)
      expect(result.current.paymentError).toBe(null)
      expect(result.current.isProvisioning).toBe(false)
      expect(result.current.provisioningError).toBe(null)
    })

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useTenantOperations())

      expect(typeof result.current.deleteTenant).toBe('function')
      expect(typeof result.current.completePayment).toBe('function')
      expect(typeof result.current.startResourceProvisioning).toBe('function')
    })

    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useTenantOperations())

      const firstDeleteTenant = result.current.deleteTenant
      const firstCompletePayment = result.current.completePayment
      const firstStartProvisioning = result.current.startResourceProvisioning

      rerender()

      expect(result.current.deleteTenant).toBe(firstDeleteTenant)
      expect(result.current.completePayment).toBe(firstCompletePayment)
      expect(result.current.startResourceProvisioning).toBe(firstStartProvisioning)
    })
  })

  describe('deleteTenant', () => {
    it('should successfully delete a tenant', async () => {
      const mockResponse = {
        success: true,
        message: 'Tenant deleted successfully',
        data: {
          tenant_id: 'tenant-001',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(tenantService.deleteTenant).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      let deleteResult: boolean = false
      await act(async () => {
        deleteResult = await result.current.deleteTenant('tenant-123', 'Test Org')
      })

      expect(deleteResult).toBe(true)
      expect(tenantService.deleteTenant).toHaveBeenCalledWith('tenant-123')
      expect(notificationUtils.createToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Tenant Deleted Successfully',
        description: "The tenant 'Test Org' has been successfully deleted."
      })
    })

    it('should handle deletion without tenant name', async () => {
      const mockResponse = {
        success: true,
        message: 'Tenant deleted successfully',
        data: {
          tenant_id: 'tenant-123',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(tenantService.deleteTenant).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      let deleteResult: boolean = false
      await act(async () => {
        deleteResult = await result.current.deleteTenant('tenant-123')
      })

      expect(deleteResult).toBe(true)
      expect(notificationUtils.createToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Tenant Deleted Successfully',
        description: 'The tenant has been successfully deleted.'
      })
    })

    it('should set isDeleting to true during deletion', async () => {
      const mockResponse = {
        success: true,
        message: 'Tenant deleted successfully',
        data: {
          tenant_id: 'tenant-123',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(tenantService.deleteTenant).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )

      const { result } = renderHook(() => useTenantOperations())

      act(() => {
        result.current.deleteTenant('tenant-123')
      })

      expect(result.current.isDeleting).toBe(true)

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })
    })

    it('should handle API success=false response', async () => {
      const mockResponse = {
        success: false,
        message: 'Tenant has active subscriptions',
        data: {
          tenant_id: 'tenant-123',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(tenantService.deleteTenant).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      let deleteResult: boolean = true
      await act(async () => {
        deleteResult = await result.current.deleteTenant('tenant-123')
      })

      expect(deleteResult).toBe(false)
      expect(result.current.deleteError).toBe('Tenant has active subscriptions')
      expect(notificationUtils.createToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Deletion Failed',
        description: 'Tenant has active subscriptions'
      })
    })

    it('should handle network errors', async () => {
      const mockError = new Error('Network error') as AxiosError

      vi.mocked(tenantService.deleteTenant).mockRejectedValue(mockError)

      const { result } = renderHook(() => useTenantOperations())

      let deleteResult: boolean = true
      await act(async () => {
        deleteResult = await result.current.deleteTenant('tenant-123')
      })

      expect(deleteResult).toBe(false)
      expect(result.current.deleteError).toBe('Failed to delete tenant')
      expect(sharedUtils.handleApiError).toHaveBeenCalledWith(mockError, {
        title: 'Failed to Delete Tenant'
      })
    })

    it('should reset error state on new deletion', async () => {
      const errorResponse = {
        success: false,
        message: 'Error message',
        data: {
          tenant_id: 'tenant-123',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      const successResponse = {
        success: true,
        message: 'Success',
        data: {
          tenant_id: 'tenant-456',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(tenantService.deleteTenant).mockResolvedValueOnce(errorResponse)

      const { result } = renderHook(() => useTenantOperations())

      await act(async () => {
        await result.current.deleteTenant('tenant-123')
      })

      expect(result.current.deleteError).not.toBe(null)

      vi.mocked(tenantService.deleteTenant).mockResolvedValueOnce(successResponse)

      await act(async () => {
        await result.current.deleteTenant('tenant-456')
      })

      expect(result.current.deleteError).toBe(null)
    })

    it('should always set isDeleting to false after completion', async () => {
      const mockError = new Error('Network error') as AxiosError
      vi.mocked(tenantService.deleteTenant).mockRejectedValue(mockError)

      const { result } = renderHook(() => useTenantOperations())

      await act(async () => {
        await result.current.deleteTenant('tenant-123')
      })

      expect(result.current.isDeleting).toBe(false)
    })
  })

  describe('completePayment', () => {
    const mockPaymentData = {
      tenant_id: 'tenant-123',
      payment_intent: 'pi_123456789'
    }

    it('should successfully complete payment', async () => {
      const mockResponse: CompleteSubscriptionPaymentApiResponse = {
        success: true,
        message: 'Payment completed successfully',
        data: {
          tenant: {
            tenant_id: 'tenant-123',
            organization_name: 'Test Organization',
            status: 'active'
          }
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(paymentService.completeTenantSubscriptionPayment).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      let paymentResult: CompleteSubscriptionPaymentApiResponse | null = null
      await act(async () => {
        paymentResult = await result.current.completePayment(mockPaymentData)
      })

      expect(paymentResult).toEqual(mockResponse)
      expect(paymentService.completeTenantSubscriptionPayment).toHaveBeenCalledWith(mockPaymentData)
      expect(notificationUtils.createToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Payment Completed Successfully',
        description: 'Payment completed successfully'
      })
    })

    it('should set isCompletingPayment to true during payment', async () => {
      const mockResponse: CompleteSubscriptionPaymentApiResponse = {
        success: true,
        message: 'Payment completed',
        data: {
          tenant: {
            tenant_id: 'tenant-123',
            organization_name: 'Test Organization',
            status: 'active'
          }
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(paymentService.completeTenantSubscriptionPayment).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )

      const { result } = renderHook(() => useTenantOperations())

      act(() => {
        result.current.completePayment(mockPaymentData)
      })

      expect(result.current.isCompletingPayment).toBe(true)

      await waitFor(() => {
        expect(result.current.isCompletingPayment).toBe(false)
      })
    })

    it('should handle payment API success=false response', async () => {
      const mockResponse: CompleteSubscriptionPaymentApiResponse = {
        success: false,
        message: 'Payment verification failed',
        data: {
          tenant: {
            tenant_id: 'tenant-123',
            organization_name: 'Test Organization',
            status: 'active'
          }
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(paymentService.completeTenantSubscriptionPayment).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      let paymentResult: CompleteSubscriptionPaymentApiResponse | null = null
      await act(async () => {
        paymentResult = await result.current.completePayment(mockPaymentData)
      })

      expect(paymentResult).toBe(null)
      expect(result.current.paymentError).toBe('Payment verification failed')
      expect(notificationUtils.createToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Payment Completion Failed',
        description: 'Payment verification failed'
      })
    })

    it('should handle payment network errors', async () => {
      const mockError = new Error('Network error') as AxiosError

      vi.mocked(paymentService.completeTenantSubscriptionPayment).mockRejectedValue(mockError)

      const { result } = renderHook(() => useTenantOperations())

      let paymentResult: CompleteSubscriptionPaymentApiResponse | null = null
      await act(async () => {
        paymentResult = await result.current.completePayment(mockPaymentData)
      })

      expect(paymentResult).toBe(null)
      expect(result.current.paymentError).toBe('Failed to complete payment')
      expect(sharedUtils.handleApiError).toHaveBeenCalledWith(mockError, {
        title: 'Failed to Complete Payment'
      })
    })

    it('should reset payment error on new payment attempt', async () => {
      const errorResponse: CompleteSubscriptionPaymentApiResponse = {
        success: false,
        message: 'Payment failed',
        data: {
          tenant: {
            tenant_id: 'tenant-123',
            organization_name: 'Test Organization',
            status: 'active'
          }
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      const successResponse: CompleteSubscriptionPaymentApiResponse = {
        success: true,
        message: 'Payment completed',
        data: {
          tenant: {
            tenant_id: 'tenant-123',
            organization_name: 'Test Organization',
            status: 'active'
          }
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(paymentService.completeTenantSubscriptionPayment).mockResolvedValueOnce(errorResponse)

      const { result } = renderHook(() => useTenantOperations())

      await act(async () => {
        await result.current.completePayment(mockPaymentData)
      })

      expect(result.current.paymentError).not.toBe(null)

      vi.mocked(paymentService.completeTenantSubscriptionPayment).mockResolvedValueOnce(successResponse)

      await act(async () => {
        await result.current.completePayment(mockPaymentData)
      })

      expect(result.current.paymentError).toBe(null)
    })
  })

  describe('startResourceProvisioning', () => {
    it('should successfully start resource provisioning', async () => {
      const mockResponse: StartResourceProvisioningApiResponse = {
        success: true,
        message: 'Resource provisioning initiated',
        data: {
          request_id: 'req-123',
          status_url: '/api/provisioning/status/req-123',
          estimated_time: '5 minutes'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(subscriptionService.startTenantResourceProvisioning).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      let provisioningResult: StartResourceProvisioningApiResponse | null = null
      await act(async () => {
        provisioningResult = await result.current.startResourceProvisioning('tenant-123', 'Test Org')
      })

      expect(provisioningResult).toEqual(mockResponse)
      expect(subscriptionService.startTenantResourceProvisioning).toHaveBeenCalledWith('tenant-123')
      expect(notificationUtils.createToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Resource Provisioning Started',
        description: "Resource provisioning has been initiated for 'Test Org'."
      })
    })

    it('should handle provisioning without tenant name', async () => {
      const mockResponse: StartResourceProvisioningApiResponse = {
        success: true,
        message: 'Provisioning started',
        data: {
          request_id: 'req-456',
          status_url: '/api/provisioning/status/req-456',
          estimated_time: '5 minutes'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(subscriptionService.startTenantResourceProvisioning).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      await act(async () => {
        await result.current.startResourceProvisioning('tenant-123')
      })

      expect(notificationUtils.createToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Resource Provisioning Started',
        description: 'Provisioning started'
      })
    })

    it('should set isProvisioning to true during provisioning', async () => {
      const mockResponse: StartResourceProvisioningApiResponse = {
        success: true,
        message: 'Provisioning started',
        data: {
          request_id: 'req-789',
          status_url: '/api/provisioning/status/req-789',
          estimated_time: '5 minutes'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(subscriptionService.startTenantResourceProvisioning).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )

      const { result } = renderHook(() => useTenantOperations())

      act(() => {
        result.current.startResourceProvisioning('tenant-123')
      })

      expect(result.current.isProvisioning).toBe(true)

      await waitFor(() => {
        expect(result.current.isProvisioning).toBe(false)
      })
    })

    it('should handle provisioning API success=false response', async () => {
      const mockResponse: StartResourceProvisioningApiResponse = {
        success: false,
        message: 'Tenant resources already exist',
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(subscriptionService.startTenantResourceProvisioning).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      let provisioningResult: StartResourceProvisioningApiResponse | null = null
      await act(async () => {
        provisioningResult = await result.current.startResourceProvisioning('tenant-123')
      })

      expect(provisioningResult).toBe(null)
      expect(result.current.provisioningError).toBe('Tenant resources already exist')
      expect(notificationUtils.createToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Provisioning Failed',
        description: 'Tenant resources already exist'
      })
    })

    it('should handle provisioning network errors', async () => {
      const mockError = new Error('Network error') as AxiosError

      vi.mocked(subscriptionService.startTenantResourceProvisioning).mockRejectedValue(mockError)

      const { result } = renderHook(() => useTenantOperations())

      let provisioningResult: StartResourceProvisioningApiResponse | null = null
      await act(async () => {
        provisioningResult = await result.current.startResourceProvisioning('tenant-123')
      })

      expect(provisioningResult).toBe(null)
      expect(result.current.provisioningError).toBe('Failed to start resource provisioning')
      expect(sharedUtils.handleApiError).toHaveBeenCalledWith(mockError, {
        title: 'Failed to Start Resource Provisioning'
      })
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle multiple delete operations sequentially', async () => {
      const mockResponse = {
        success: true,
        message: 'Tenant deleted',
        data: {
          tenant_id: 'tenant-1',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(tenantService.deleteTenant).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      await act(async () => {
        await result.current.deleteTenant('tenant-1')
        await result.current.deleteTenant('tenant-2')
      })

      expect(tenantService.deleteTenant).toHaveBeenCalledTimes(2)
      expect(tenantService.deleteTenant).toHaveBeenNthCalledWith(1, 'tenant-1')
      expect(tenantService.deleteTenant).toHaveBeenNthCalledWith(2, 'tenant-2')
    })

    it('should maintain separate error states for different operations', async () => {
      vi.mocked(tenantService.deleteTenant).mockResolvedValue({
        success: false,
        message: 'Delete error',
        data: {
          tenant_id: 'tenant-123',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      })

      vi.mocked(paymentService.completeTenantSubscriptionPayment).mockResolvedValue({
        success: false,
        message: 'Payment error',
        data: {
          tenant: {
            tenant_id: 'tenant-123',
            organization_name: 'Test Org',
            status: 'active' as const
          }
        },
        timestamp: '2024-01-15T10:30:00Z'
      })

      const { result } = renderHook(() => useTenantOperations())

      await act(async () => {
        await result.current.deleteTenant('tenant-123')
        await result.current.completePayment({ tenant_id: 'tenant-123', payment_intent: 'pi_123' })
      })

      expect(result.current.deleteError).toBe('Delete error')
      expect(result.current.paymentError).toBe('Payment error')
      expect(result.current.provisioningError).toBe(null)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty tenant ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Deleted',
        data: {
          tenant_id: '',
          status: 'inactive' as const,
          deleted_at: '2024-01-15T10:30:00Z'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(tenantService.deleteTenant).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTenantOperations())

      await act(async () => {
        await result.current.deleteTenant('')
      })

      expect(tenantService.deleteTenant).toHaveBeenCalledWith('')
    })

    it('should handle undefined error messages gracefully', async () => {
      const mockResponse = {
        success: false,
        message: undefined,
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(tenantService.deleteTenant).mockResolvedValue(mockResponse as any)

      const { result } = renderHook(() => useTenantOperations())

      await act(async () => {
        await result.current.deleteTenant('tenant-123')
      })

      expect(result.current.deleteError).toBe('Failed to delete tenant')
    })
  })
})
