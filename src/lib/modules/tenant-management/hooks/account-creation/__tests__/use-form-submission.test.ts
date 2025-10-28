/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import { useTenantFormSubmission } from '../use-form-submission'
import { subscriptionService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { Plan } from '@plan-management/types'
import { SelectedAddon, PlanBillingCycle } from '@tenant-management/types'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui'
import { handleApiError } from '@shared/utils/api'
import { validatePayload } from '@shared/utils/validation'

/* Mock the API services */
vi.mock('@tenant-management/api', () => ({
  subscriptionService: {
    assignPlanToTenant: vi.fn()
  }
}))

/* Mock shared utils */
vi.mock('@shared/utils/ui', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/validation', () => ({
  validatePayload: vi.fn()
}))

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  validatePlanSelection: vi.fn((plan) => ({ isValid: !!plan, message: plan ? null : 'Plan is required' })),
  validateBranchCount: vi.fn((count, included) => ({ isValid: count > 0, message: count > 0 ? null : 'Branch count must be greater than 0' })),
  StepTracker: {
    markStepCompleted: vi.fn()
  }
}))

describe('useTenantFormSubmission', () => {
  const mockPlan: Plan = {
    id: 1,
    name: 'Professional Plan',
    description: 'Professional features',
    features: [],
    is_featured: true,
    is_active: true,
    is_custom: false,
    display_order: 1,
    monthly_price: 299.99,
    included_branches_count: 5,
    annual_discount_percentage: 20,
    add_ons: []
  }

  const mockSelectedAddons: SelectedAddon[] = [
    {
      addon_id: 1,
      addon_name: 'Premium Analytics',
      addon_price: 50,
      pricing_scope: 'organization',
      branches: [],
      is_included: false
    },
    {
      addon_id: 2,
      addon_name: 'Extra Storage',
      addon_price: 30,
      pricing_scope: 'branch',
      branches: [
        { branchIndex: 0, branchName: 'Branch 1', isSelected: true },
        { branchIndex: 1, branchName: 'Branch 2', isSelected: false }
      ],
      is_included: false
    }
  ]

  const mockSubmissionData = {
    selectedPlan: mockPlan,
    billingCycle: 'monthly' as PlanBillingCycle,
    branchCount: 3,
    selectedAddons: mockSelectedAddons
  }

  const mockApiResponse = {
    success: true,
    message: 'Plan assigned successfully',
    timestamp: '2024-01-15T10:30:00Z',
    data: {
      tenant_id: 'tenant-001',
      plan_id: 1,
      subscription_status: 'active',
      billing_cycle: 'monthly' as const
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID, 'tenant-001')

    vi.mocked(validatePayload).mockReturnValue({
      isValid: true,
      data: {
        plan_id: 1,
        billing_cycle: 'monthly',
        branches_count: 3,
        organization_addon_assignments: [],
        branch_addon_assignments: []
      }
    })
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useTenantFormSubmission())

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.canSubmit).toBe(true)
      expect(result.current.hasError).toBe(false)
      expect(typeof result.current.submitTenantForm).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('provides all expected methods and properties', () => {
      const { result } = renderHook(() => useTenantFormSubmission())

      expect(result.current).toHaveProperty('isSubmitting')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('submitTenantForm')
      expect(result.current).toHaveProperty('clearError')
      expect(result.current).toHaveProperty('getSubmissionStatus')
      expect(result.current).toHaveProperty('validateSubmissionData')
      expect(result.current).toHaveProperty('canSubmit')
      expect(result.current).toHaveProperty('hasError')
    })
  })

  describe('validateSubmissionData', () => {
    it('validates plan selection successfully', () => {
      const { result } = renderHook(() => useTenantFormSubmission())

      const isValid = result.current.validateSubmissionData(mockSubmissionData)

      expect(isValid).toBe(true)
    })

    it('fails validation when plan is missing', () => {
      const { result } = renderHook(() => useTenantFormSubmission())

      const invalidData = { ...mockSubmissionData, selectedPlan: null }
      const isValid = result.current.validateSubmissionData(invalidData)

      expect(isValid).toBe(false)
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Plan Selection Required',
        description: 'Plan is required',
        type: 'warning'
      })
    })

    it('fails validation when branch count is invalid', async () => {
      const { validateBranchCount } = await import('@tenant-management/utils')
      vi.mocked(validateBranchCount).mockReturnValue({ isValid: false, message: 'Invalid branch count' })

      const { result } = renderHook(() => useTenantFormSubmission())

      const invalidData = { ...mockSubmissionData, branchCount: 0 }
      const isValid = result.current.validateSubmissionData(invalidData)

      expect(isValid).toBe(false)
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Branch Configuration Error',
        description: 'Invalid branch count',
        type: 'warning'
      })
    })
  })

  describe('submitTenantForm Operation', () => {
    it('successfully submits tenant form', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => useTenantFormSubmission())
      const mockOnSuccess = vi.fn()

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData, mockOnSuccess)
      })

      expect(subscriptionService.assignPlanToTenant).toHaveBeenCalled()
      expect(result.current.error).toBeNull()
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Plan Assigned Successfully',
        description: 'Professional Plan plan has been assigned to your tenant account.',
        type: 'success'
      })
    })

    it('formats organization addons correctly', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      /* Mock validatePayload to pass through the actual addon data */
      vi.mocked(validatePayload).mockReturnValue({
        isValid: true,
        data: {
          plan_id: 1,
          billing_cycle: 'monthly',
          branches_count: 3,
          organization_addon_assignments: [{
            addon_id: 1,
            feature_level: 'basic'
          }],
          branch_addon_assignments: []
        }
      })

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(subscriptionService.assignPlanToTenant).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_addon_assignments: expect.arrayContaining([
            expect.objectContaining({
              addon_id: 1,
              feature_level: 'basic'
            })
          ])
        }),
        'tenant-001'
      )
    })

    it('formats branch addons correctly', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      /* Mock validatePayload to pass through the actual addon data */
      vi.mocked(validatePayload).mockReturnValue({
        isValid: true,
        data: {
          plan_id: 1,
          billing_cycle: 'monthly',
          branches_count: 3,
          organization_addon_assignments: [],
          branch_addon_assignments: [{
            branch_id: 1,
            addon_assignments: [{
              addon_id: 2,
              feature_level: 'basic'
            }]
          }]
        }
      })

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(subscriptionService.assignPlanToTenant).toHaveBeenCalledWith(
        expect.objectContaining({
          branch_addon_assignments: expect.arrayContaining([
            expect.objectContaining({
              branch_id: 1,
              addon_assignments: expect.arrayContaining([
                expect.objectContaining({
                  addon_id: 2,
                  feature_level: 'basic'
                })
              ])
            })
          ])
        }),
        'tenant-001'
      )
    })

    it('sets loading state during submission', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockApiResponse), 100))
      )

      const { result } = renderHook(() => useTenantFormSubmission())

      act(() => {
        result.current.submitTenantForm(mockSubmissionData)
      })

      expect(result.current.isSubmitting).toBe(true)
      expect(result.current.canSubmit).toBe(false)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.canSubmit).toBe(true)
      })
    })

    it('caches submission data to localStorage', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      const cachedData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA)
      expect(cachedData).not.toBeNull()

      const parsed = JSON.parse(cachedData!)
      expect(parsed.selectedPlan).toEqual(mockPlan)
      expect(parsed.billingCycle).toBe('monthly')
      expect(parsed.branchCount).toBe(3)
    })

    it('marks step as completed after successful submission', async () => {
      const { StepTracker } = await import('@tenant-management/utils')
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(StepTracker.markStepCompleted).toHaveBeenCalledWith('PLAN_SELECTION')
    })

    it('resets error state before submission', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => useTenantFormSubmission())

      /* Set error state first */
      act(() => {
        result.current.clearError()
      })

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Validation Failures', () => {
    it('does not submit when plan validation fails', async () => {
      const { result } = renderHook(() => useTenantFormSubmission())

      const invalidData = { ...mockSubmissionData, selectedPlan: null }

      await act(async () => {
        await result.current.submitTenantForm(invalidData)
      })

      expect(subscriptionService.assignPlanToTenant).not.toHaveBeenCalled()
    })

    it('does not submit when branch validation fails', async () => {
      const { validateBranchCount } = await import('@tenant-management/utils')
      vi.mocked(validateBranchCount).mockReturnValue({ isValid: false, message: 'Invalid branch count' })

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(subscriptionService.assignPlanToTenant).not.toHaveBeenCalled()
    })

    it('does not submit when tenant ID is missing', async () => {
      localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(subscriptionService.assignPlanToTenant).not.toHaveBeenCalled()
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Tenant ID Required',
        description: 'Please complete the tenant information step before proceeding.',
        type: 'warning'
      })
    })

    it('does not submit when payload validation fails', async () => {
      vi.mocked(validatePayload).mockReturnValue({
        isValid: false,
        errors: [
          { field: 'plan_id', message: 'Plan ID is required' }
        ]
      })

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(subscriptionService.assignPlanToTenant).not.toHaveBeenCalled()
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Validation Error',
        description: 'plan_id: Plan ID is required',
        type: 'warning'
      })
    })
  })

  describe('API Error Handling', () => {
    it('handles API errors during submission', async () => {
      const error = new Error('API Error')
      vi.mocked(subscriptionService.assignPlanToTenant).mockRejectedValue(error)

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(result.current.error).toBe('API Error')
      expect(result.current.hasError).toBe(true)
      expect(handleApiError).toHaveBeenCalled()
    })

    it('handles unsuccessful API response', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue({
        success: false,
        error: 'Failed to assign plan',
        message: 'Failed to assign plan',
        timestamp: '2024-01-15T10:30:00Z'
      })

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(result.current.error).toBe('Failed to assign plan')
      expect(handleApiError).toHaveBeenCalled()
    })

    it('resets loading state after error', async () => {
      const error = new Error('API Error')
      vi.mocked(subscriptionService.assignPlanToTenant).mockRejectedValue(error)

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe('clearError Operation', () => {
    it('clears error state', async () => {
      const error = new Error('Test error')
      vi.mocked(subscriptionService.assignPlanToTenant).mockRejectedValue(error)

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.hasError).toBe(false)
    })
  })

  describe('getSubmissionStatus', () => {
    it('returns current submission status', () => {
      const { result } = renderHook(() => useTenantFormSubmission())

      const status = result.current.getSubmissionStatus()

      expect(status).toEqual({
        isSubmitting: false,
        hasError: false,
        errorMessage: null
      })
    })

    it('returns error status when error exists', async () => {
      const error = new Error('Test error')
      vi.mocked(subscriptionService.assignPlanToTenant).mockRejectedValue(error)

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      const status = result.current.getSubmissionStatus()

      expect(status).toEqual({
        isSubmitting: false,
        hasError: true,
        errorMessage: 'Test error'
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty addons array', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => useTenantFormSubmission())

      const dataWithNoAddons = {
        ...mockSubmissionData,
        selectedAddons: []
      }

      await act(async () => {
        await result.current.submitTenantForm(dataWithNoAddons)
      })

      expect(subscriptionService.assignPlanToTenant).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_addon_assignments: [],
          branch_addon_assignments: []
        }),
        'tenant-001'
      )
    })

    it('filters addons correctly by pricing scope', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      /* Mock validatePayload to pass through the actual addon data */
      vi.mocked(validatePayload).mockReturnValue({
        isValid: true,
        data: {
          plan_id: 1,
          billing_cycle: 'monthly',
          branches_count: 3,
          organization_addon_assignments: [{
            addon_id: 1,
            feature_level: 'basic'
          }],
          branch_addon_assignments: []
        }
      })

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      const callArgs = vi.mocked(subscriptionService.assignPlanToTenant).mock.calls[0][0]

      expect(callArgs.organization_addon_assignments).toHaveLength(1)
      expect(callArgs.organization_addon_assignments[0].addon_id).toBe(1)
    })

    it('only includes selected branches in branch addons', async () => {
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      /* Mock validatePayload to pass through the actual addon data */
      vi.mocked(validatePayload).mockReturnValue({
        isValid: true,
        data: {
          plan_id: 1,
          billing_cycle: 'monthly',
          branches_count: 3,
          organization_addon_assignments: [],
          branch_addon_assignments: [{
            branch_id: 1,
            addon_assignments: [{
              addon_id: 2,
              feature_level: 'basic'
            }]
          }]
        }
      })

      const { result } = renderHook(() => useTenantFormSubmission())

      await act(async () => {
        await result.current.submitTenantForm(mockSubmissionData)
      })

      const callArgs = vi.mocked(subscriptionService.assignPlanToTenant).mock.calls[0][0]

      /* Only branch 1 should have addon 2 assigned (branchIndex 0) */
      const branch1 = callArgs.branch_addon_assignments.find(b => b.branch_id === 1)
      expect(branch1).toBeDefined()
      expect(branch1?.addon_assignments).toHaveLength(1)

      /* Branch 2 should not have any addons */
      const branch2 = callArgs.branch_addon_assignments.find(b => b.branch_id === 2)
      expect(branch2).toBeUndefined()
    })
  })
})
