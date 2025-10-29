/* Comprehensive test suite for usePlanOperations hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'
import * as sharedConfig from '@shared/config'

/* Plan module imports */
import { usePlanOperations } from '@plan-management/hooks/use-plan-operations'
import { planService } from '@plan-management/api'
import { CreatePlanApiRequest, PlanDetails } from '@plan-management/types'

/* Mock dependencies */
vi.mock('@plan-management/api', () => ({
  planService: {
    createSubscriptionPlan: vi.fn(),
    getSubscriptionPlanDetails: vi.fn(),
    updateSubscriptionPlan: vi.fn(),
    deleteSubscriptionPlan: vi.fn()
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

describe('usePlanOperations Hook', () => {
  /* Mock data */
  const mockPlanData: CreatePlanApiRequest = {
    name: 'Premium Plan',
    description: 'Premium subscription plan',
    is_custom: false,
    is_active: true,
    monthly_price: 99.99,
    monthly_fee_our_gateway: 2.5,
    monthly_fee_byo_processor: 0,
    card_processing_fee_percentage: 2.9,
    card_processing_fee_fixed: 0.30,
    additional_device_cost: 15.00,
    annual_discount_percentage: 10,
    included_devices_count: 2,
    max_users_per_branch: 10,
    included_branches_count: 1,
    feature_ids: [1, 2, 3],
    addon_assignments: [],
    support_sla_ids: [1],
    volume_discounts: []
  }

  const mockPlanDetails: PlanDetails = {
    id: 1,
    name: 'Premium Plan',
    description: 'Premium subscription plan',
    display_order: 1,
    trial_period_days: 14,
    is_active: 1,
    is_custom: 0,
    monthly_price: 99.99,
    monthly_fee_our_gateway: 2.5,
    monthly_fee_byo_processor: 0,
    card_processing_fee_percentage: 2.9,
    card_processing_fee_fixed: 0.30,
    additional_device_cost: 15.00,
    annual_discount_percentage: 10,
    biennial_discount_percentage: 15,
    triennial_discount_percentage: 20,
    included_devices_count: 2,
    max_users_per_branch: 10,
    included_branches_count: 1,
    features: [],
    add_ons: [],
    support_sla: [],
    volume_discounts: []
  }

  /* Mock service functions */
  const mockCreatePlan = vi.mocked(planService.createSubscriptionPlan)
  const mockGetPlanDetails = vi.mocked(planService.getSubscriptionPlanDetails)
  const mockUpdatePlan = vi.mocked(planService.updateSubscriptionPlan)
  const mockDeletePlan = vi.mocked(planService.deleteSubscriptionPlan)
  const mockHandleApiError = vi.mocked(sharedUtils.handleApiError)
  const mockCreateToastNotification = vi.mocked(notificationUtils.createToastNotification)

  beforeEach(() => {
    vi.clearAllMocks()
    /* Suppress console logs */
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePlanOperations())

      expect(result.current.isCreating).toBe(false)
      expect(result.current.createError).toBe(null)
      expect(result.current.isFetching).toBe(false)
      expect(result.current.fetchError).toBe(null)
      expect(result.current.isUpdating).toBe(false)
      expect(result.current.updateError).toBe(null)
      expect(result.current.isDeleting).toBe(false)
      expect(result.current.deleteError).toBe(null)
    })

    it('should have all required functions', () => {
      const { result } = renderHook(() => usePlanOperations())

      expect(typeof result.current.createPlan).toBe('function')
      expect(typeof result.current.fetchPlanDetails).toBe('function')
      expect(typeof result.current.updatePlan).toBe('function')
      expect(typeof result.current.deletePlan).toBe('function')
    })
  })

  describe('createPlan Function', () => {
    it('should create plan successfully', async () => {
      mockCreatePlan.mockResolvedValue({
        success: true,
        data: { id: 1, name: 'Premium Plan', status: true },
        message: 'Plan created successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isCreating).toBe(false)
        expect(result.current.createError).toBe(null)
      })

      expect(mockCreatePlan).toHaveBeenCalledWith(mockPlanData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Plan Created Successfully',
        description: 'Plan created successfully'
      })
    })

    it('should set loading state during creation', async () => {
      mockCreatePlan.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { id: 1, name: 'Premium Plan', status: true },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => usePlanOperations())

      const promise = result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })

    it('should handle create API error', async () => {
      mockCreatePlan.mockResolvedValue({
        success: false,
        message: 'Plan name already exists',
        error: 'Duplicate plan name',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Duplicate plan name')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Creation Failed',
        description: 'Duplicate plan name'
      })
    })

    it('should handle create network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockCreatePlan.mockRejectedValue(mockError)

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Failed to create plan')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Create Plan'
        })
      })
    })

    it('should clear previous create errors on new creation', async () => {
      mockCreatePlan.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Error 1')
      })

      mockCreatePlan.mockResolvedValue({
        success: true,
        data: { id: 1, name: 'Premium Plan', status: true },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(result.current.createError).toBe(null)
      })
    })

    it('should handle missing message in success response', async () => {
      mockCreatePlan.mockResolvedValue({
        success: true,
        data: { id: 1, name: 'Premium Plan', status: true },
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Plan Created Successfully',
          description: 'The plan has been successfully created.'
        })
      })
    })

    it('should handle missing error in failure response', async () => {
      mockCreatePlan.mockResolvedValue({
        success: false,
        message: 'Failed to create',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Failed to create')
      })
    })
  })

  describe('fetchPlanDetails Function', () => {
    it('should fetch plan details successfully', async () => {
      mockGetPlanDetails.mockResolvedValue({
        success: true,
        data: mockPlanDetails,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 1
      })

      const { result } = renderHook(() => usePlanOperations())

      const details = await result.current.fetchPlanDetails(1)

      await waitFor(() => {
        expect(details).toEqual(mockPlanDetails)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.fetchError).toBe(null)
      })

      expect(mockGetPlanDetails).toHaveBeenCalledWith(1)
    })

    it('should set loading state during fetch', async () => {
      mockGetPlanDetails.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockPlanDetails,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z',
          count: 1
        }), 50))
      )

      const { result } = renderHook(() => usePlanOperations())

      const promise = result.current.fetchPlanDetails(1)

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
    })

    it('should handle fetch API error', async () => {
      mockGetPlanDetails.mockResolvedValue({
        success: false,
        message: 'Plan not found',
        error: 'Not found',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => usePlanOperations())

      const details = await result.current.fetchPlanDetails(999)

      await waitFor(() => {
        expect(details).toBe(null)
        expect(result.current.fetchError).toBe('Not found')
      })
    })

    it('should handle fetch network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetPlanDetails.mockRejectedValue(mockError)

      const { result } = renderHook(() => usePlanOperations())

      const details = await result.current.fetchPlanDetails(1)

      await waitFor(() => {
        expect(details).toBe(null)
        expect(result.current.fetchError).toBe('Failed to fetch plan details')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Fetch Plan Details'
        })
      })
    })

    it('should clear previous fetch errors on new fetch', async () => {
      mockGetPlanDetails.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.fetchPlanDetails(1)

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Error 1')
      })

      mockGetPlanDetails.mockResolvedValue({
        success: true,
        data: mockPlanDetails,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 1
      })

      await result.current.fetchPlanDetails(1)

      await waitFor(() => {
        expect(result.current.fetchError).toBe(null)
      })
    })

    it('should handle missing data in response', async () => {
      mockGetPlanDetails.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 1
      })

      const { result } = renderHook(() => usePlanOperations())

      const details = await result.current.fetchPlanDetails(1)

      await waitFor(() => {
        expect(details).toBe(null)
      })
    })
  })

  describe('updatePlan Function', () => {
    it('should update plan successfully', async () => {
      mockUpdatePlan.mockResolvedValue({
        success: true,
        message: 'Plan updated successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.updatePlan(1, mockPlanData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isUpdating).toBe(false)
        expect(result.current.updateError).toBe(null)
      })

      expect(mockUpdatePlan).toHaveBeenCalledWith(1, mockPlanData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Plan Updated Successfully',
        description: 'Plan updated successfully'
      })
    })

    it('should set loading state during update', async () => {
      mockUpdatePlan.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => usePlanOperations())

      const promise = result.current.updatePlan(1, mockPlanData)

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })
    })

    it('should handle update API error', async () => {
      mockUpdatePlan.mockResolvedValue({
        success: false,
        message: 'Plan not found',
        error: 'Not found',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.updatePlan(999, mockPlanData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateError).toBe('Not found')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Update Failed',
        description: 'Not found'
      })
    })

    it('should handle update network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockUpdatePlan.mockRejectedValue(mockError)

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.updatePlan(1, mockPlanData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateError).toBe('Failed to update plan')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Update Plan'
        })
      })
    })

    it('should clear previous update errors on new update', async () => {
      mockUpdatePlan.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.updatePlan(1, mockPlanData)

      await waitFor(() => {
        expect(result.current.updateError).toBe('Error 1')
      })

      mockUpdatePlan.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.updatePlan(1, mockPlanData)

      await waitFor(() => {
        expect(result.current.updateError).toBe(null)
      })
    })

    it('should handle missing message in success response', async () => {
      mockUpdatePlan.mockResolvedValue({
        success: true,
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.updatePlan(1, mockPlanData)

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Plan Updated Successfully',
          description: 'The plan has been successfully updated.'
        })
      })
    })
  })

  describe('deletePlan Function', () => {
    it('should delete plan successfully', async () => {
      mockDeletePlan.mockResolvedValue({
        success: true,
        message: 'Plan deleted successfully'
      })

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.deletePlan(1, 'Premium Plan')

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.deleteError).toBe(null)
      })

      expect(mockDeletePlan).toHaveBeenCalledWith(1)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Plan Deleted Successfully',
        description: 'Plan deleted successfully'
      })
    })

    it('should delete plan without planName', async () => {
      mockDeletePlan.mockResolvedValue({
        success: true,
        message: 'Plan deleted'
      })

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.deletePlan(1)

      await waitFor(() => {
        expect(success).toBe(true)
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Plan Deleted Successfully',
        description: 'Plan deleted'
      })
    })

    it('should use default message when planName provided but no message in response', async () => {
      mockDeletePlan.mockResolvedValue({
        success: true,
        message: ''
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.deletePlan(1, 'Premium Plan')

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Plan Deleted Successfully',
          description: "The plan 'Premium Plan' has been successfully deleted."
        })
      })
    })

    it('should set loading state during deletion', async () => {
      mockDeletePlan.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success'
        }), 50))
      )

      const { result } = renderHook(() => usePlanOperations())

      const promise = result.current.deletePlan(1)

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })
    })

    it('should handle delete API error', async () => {
      mockDeletePlan.mockResolvedValue({
        success: false,
        message: 'Cannot delete plan with active subscriptions'
      })

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.deletePlan(1)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.deleteError).toBe('Cannot delete plan with active subscriptions')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Deletion Failed',
        description: 'Cannot delete plan with active subscriptions'
      })
    })

    it('should handle delete network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockDeletePlan.mockRejectedValue(mockError)

      const { result } = renderHook(() => usePlanOperations())

      const success = await result.current.deletePlan(1)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.deleteError).toBe('Failed to delete plan')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Delete Plan'
        })
      })
    })

    it('should clear previous delete errors on new deletion', async () => {
      mockDeletePlan.mockResolvedValueOnce({
        success: false,
        message: 'Error 1'
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.deletePlan(1)

      await waitFor(() => {
        expect(result.current.deleteError).toBe('Error 1')
      })

      mockDeletePlan.mockResolvedValue({
        success: true,
        message: 'Success'
      })

      await result.current.deletePlan(1)

      await waitFor(() => {
        expect(result.current.deleteError).toBe(null)
      })
    })
  })

  describe('State Independence', () => {
    it('should maintain independent state for create, fetch, update, and delete operations', async () => {
      mockCreatePlan.mockResolvedValue({
        success: false,
        message: 'Create error',
        timestamp: '2024-01-01T00:00:00Z'
      })
      mockGetPlanDetails.mockResolvedValue({
        success: false,
        message: 'Fetch error',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })
      mockUpdatePlan.mockResolvedValue({
        success: false,
        message: 'Update error',
        timestamp: '2024-01-01T00:00:00Z'
      })
      mockDeletePlan.mockResolvedValue({
        success: false,
        message: 'Delete error'
      })

      const { result } = renderHook(() => usePlanOperations())

      await result.current.createPlan(mockPlanData)
      await result.current.fetchPlanDetails(1)
      await result.current.updatePlan(1, mockPlanData)
      await result.current.deletePlan(1)

      await waitFor(() => {
        expect(result.current.createError).toBe('Create error')
        expect(result.current.fetchError).toBe('Fetch error')
        expect(result.current.updateError).toBe('Update error')
        expect(result.current.deleteError).toBe('Delete error')
      })
    })

    it('should not interfere with other operations when one is in progress', async () => {
      mockCreatePlan.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 200))
      )

      mockGetPlanDetails.mockResolvedValue({
        success: true,
        data: mockPlanDetails,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 1
      })

      const { result } = renderHook(() => usePlanOperations())

      const createPromise = result.current.createPlan(mockPlanData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await result.current.fetchPlanDetails(1)

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })

      /* Create should still be in progress */
      expect(result.current.isCreating).toBe(true)

      await createPromise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })
  })
})
