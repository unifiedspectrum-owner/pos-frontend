/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import { usePlanStorage } from '../use-plan-storage'
import { subscriptionService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { CachedPlanData } from '@tenant-management/types'
import { Plan } from '@plan-management/types'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui'
import { handleApiError } from '@shared/utils/api'

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

describe('usePlanStorage', () => {
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

  const mockCachedPlanData: CachedPlanData = {
    selectedPlan: mockPlan,
    billingCycle: 'monthly',
    branchCount: 3,
    selectedAddons: [
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
          { branchIndex: 1, branchName: 'Branch 2', isSelected: false },
          { branchIndex: 2, branchName: 'Branch 3', isSelected: true }
        ],
        is_included: false
      }
    ],
    branches: [
      { branchIndex: 0, branchName: 'Branch 1', isSelected: true },
      { branchIndex: 1, branchName: 'Branch 2', isSelected: false },
      { branchIndex: 2, branchName: 'Branch 3', isSelected: true }
    ]
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
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => usePlanStorage())

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.loadPlanData).toBe('function')
      expect(typeof result.current.assignPlanToTenant).toBe('function')
      expect(typeof result.current.markPlanSummaryCompleted).toBe('function')
      expect(typeof result.current.isPlanSummaryCompleted).toBe('function')
    })
  })

  describe('loadPlanData Operation', () => {
    it('successfully loads plan data from localStorage', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )

      const { result } = renderHook(() => usePlanStorage())

      const planData = result.current.loadPlanData()

      expect(planData).toEqual(mockCachedPlanData)
      expect(result.current.error).toBeNull()
    })

    it('returns null when no plan data exists', () => {
      const { result } = renderHook(() => usePlanStorage())

      act(() => {
        result.current.loadPlanData()
      })

      expect(result.current.error).toBe('No plan data found in localStorage')
    })

    it('handles corrupted localStorage data', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        'invalid json {'
      )

      const { result } = renderHook(() => usePlanStorage())

      act(() => {
        result.current.loadPlanData()
      })

      expect(result.current.error).toBe('Failed to parse plan data from storage')
      expect(errorSpy).toHaveBeenCalledWith('Failed to load plan data from localStorage:', expect.any(Error))

      errorSpy.mockRestore()
    })

    it('clears error when successfully loading data', () => {
      const { result } = renderHook(() => usePlanStorage())

      /* First load with no data to set error */
      act(() => {
        result.current.loadPlanData()
      })
      expect(result.current.error).not.toBeNull()

      /* Set data and load again */
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )

      act(() => {
        result.current.loadPlanData()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('assignPlanToTenant Operation', () => {
    it('successfully assigns plan to tenant', async () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => usePlanStorage())

      let success: boolean = false
      await act(async () => {
        success = await result.current.assignPlanToTenant()
      })

      expect(success).toBe(true)
      expect(subscriptionService.assignPlanToTenant).toHaveBeenCalled()
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Plan Assigned Successfully',
        description: 'Your plan has been assigned successfully. Proceeding to payment.'
      })
    })

    it('transforms organization addons correctly', async () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => usePlanStorage())

      await act(async () => {
        await result.current.assignPlanToTenant()
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

    it('transforms branch addons correctly', async () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => usePlanStorage())

      await act(async () => {
        await result.current.assignPlanToTenant()
      })

      const callArgs = vi.mocked(subscriptionService.assignPlanToTenant).mock.calls[0][0]

      /* Branch 1 and Branch 3 should have addon 2 (indexes 0 and 2) */
      expect(callArgs.branch_addon_assignments).toHaveLength(2)
      expect(callArgs.branch_addon_assignments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ branch_id: 1 }),
          expect.objectContaining({ branch_id: 3 })
        ])
      )
    })

    it('filters branches beyond branch count', async () => {
      const dataWithExtraBranches = {
        ...mockCachedPlanData,
        branchCount: 2,
        selectedAddons: [
          {
            addon_id: 2,
            addon_name: 'Extra Storage',
            addon_price: 30,
            pricing_scope: 'branch' as const,
            branches: [
              { branchIndex: 0, branchName: 'Branch 1', isSelected: true },
              { branchIndex: 1, branchName: 'Branch 2', isSelected: true },
              { branchIndex: 2, branchName: 'Branch 3', isSelected: true }
            ],
            is_included: false
          }
        ]
      }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(dataWithExtraBranches)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => usePlanStorage())

      await act(async () => {
        await result.current.assignPlanToTenant()
      })

      const callArgs = vi.mocked(subscriptionService.assignPlanToTenant).mock.calls[0][0]

      /* Only branches 1 and 2 should be included (indexes 0 and 1) */
      expect(callArgs.branch_addon_assignments).toHaveLength(2)
      expect(callArgs.branch_addon_assignments.some(b => b.branch_id === 3)).toBe(false)
    })

    it('sets loading state during operation', async () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockApiResponse), 100))
      )

      const { result } = renderHook(() => usePlanStorage())

      act(() => {
        result.current.assignPlanToTenant()
      })

      expect(result.current.isSubmitting).toBe(true)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    it('returns false when plan data is missing', async () => {
      const { result } = renderHook(() => usePlanStorage())

      let success: boolean = true
      await act(async () => {
        success = await result.current.assignPlanToTenant()
      })

      expect(success).toBe(false)
      expect(subscriptionService.assignPlanToTenant).not.toHaveBeenCalled()
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'No Plan Data',
        description: 'Please go back and select a plan first.',
        type: 'error'
      })
    })

    it('returns false when tenant ID is missing', async () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )
      localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)

      const { result } = renderHook(() => usePlanStorage())

      let success: boolean = true
      await act(async () => {
        success = await result.current.assignPlanToTenant()
      })

      expect(success).toBe(false)
      expect(subscriptionService.assignPlanToTenant).not.toHaveBeenCalled()
      /* transformPlanDataToApiRequest returns null when tenant ID is missing,
         which triggers "Invalid Plan Data" toast */
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Invalid Plan Data',
        description: 'Unable to process plan data. Please try again.',
        type: 'error'
      })
    })

    it('handles API errors', async () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )
      const error = new Error('API Error')
      vi.mocked(subscriptionService.assignPlanToTenant).mockRejectedValue(error)

      const { result } = renderHook(() => usePlanStorage())

      let success: boolean = true
      await act(async () => {
        success = await result.current.assignPlanToTenant()
      })

      expect(success).toBe(false)
      expect(handleApiError).toHaveBeenCalled()
      expect(result.current.isSubmitting).toBe(false)
    })

    it('returns false when plan data is invalid', async () => {
      const invalidData = {
        ...mockCachedPlanData,
        selectedPlan: null
      }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(invalidData)
      )

      const { result } = renderHook(() => usePlanStorage())

      let success: boolean = true
      await act(async () => {
        success = await result.current.assignPlanToTenant()
      })

      expect(success).toBe(false)
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Invalid Plan Data',
        description: 'Unable to process plan data. Please try again.',
        type: 'error'
      })
    })
  })

  describe('markPlanSummaryCompleted Operation', () => {
    it('marks plan summary as completed in localStorage', () => {
      const { result } = renderHook(() => usePlanStorage())

      result.current.markPlanSummaryCompleted()

      const completed = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PLAN_SUMMARY_COMPLETED)
      expect(completed).toBe('true')
    })

    it('handles localStorage errors gracefully', () => {
      const { result } = renderHook(() => usePlanStorage())

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        throw new Error('QuotaExceededError')
      })

      result.current.markPlanSummaryCompleted()

      expect(errorSpy).toHaveBeenCalledWith('Failed to mark plan summary as completed:', expect.any(Error))

      setItemSpy.mockRestore()
      errorSpy.mockRestore()
    })
  })

  describe('isPlanSummaryCompleted Operation', () => {
    it('returns true when plan summary is completed', () => {
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PLAN_SUMMARY_COMPLETED, 'true')

      const { result } = renderHook(() => usePlanStorage())

      const completed = result.current.isPlanSummaryCompleted()

      expect(completed).toBe(true)
    })

    it('returns false when plan summary is not completed', () => {
      const { result } = renderHook(() => usePlanStorage())

      const completed = result.current.isPlanSummaryCompleted()

      expect(completed).toBe(false)
    })

    it('handles localStorage errors gracefully', () => {
      const { result } = renderHook(() => usePlanStorage())

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('SecurityError')
      })

      const completed = result.current.isPlanSummaryCompleted()

      expect(completed).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith('Failed to check plan summary completion status:', expect.any(Error))

      getItemSpy.mockRestore()
      errorSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('handles plan data with no addons', async () => {
      const dataWithNoAddons = {
        ...mockCachedPlanData,
        selectedAddons: []
      }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(dataWithNoAddons)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => usePlanStorage())

      await act(async () => {
        await result.current.assignPlanToTenant()
      })

      expect(subscriptionService.assignPlanToTenant).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_addon_assignments: [],
          branch_addon_assignments: []
        }),
        'tenant-001'
      )
    })

    it('handles branch addons with no selected branches', async () => {
      const dataWithUnselectedBranches = {
        ...mockCachedPlanData,
        selectedAddons: [
          {
            addon_id: 2,
            addon_name: 'Extra Storage',
            addon_price: 30,
            pricing_scope: 'branch' as const,
            branches: [
              { branchIndex: 0, branchName: 'Branch 1', isSelected: false },
              { branchIndex: 1, branchName: 'Branch 2', isSelected: false }
            ],
            is_included: false
          }
        ]
      }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(dataWithUnselectedBranches)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => usePlanStorage())

      await act(async () => {
        await result.current.assignPlanToTenant()
      })

      const callArgs = vi.mocked(subscriptionService.assignPlanToTenant).mock.calls[0][0]

      expect(callArgs.branch_addon_assignments).toEqual([])
    })

    it('converts 0-based branch indexes to 1-based branch IDs', async () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => usePlanStorage())

      await act(async () => {
        await result.current.assignPlanToTenant()
      })

      const callArgs = vi.mocked(subscriptionService.assignPlanToTenant).mock.calls[0][0]

      /* branchIndex 0 should become branch_id 1 */
      /* branchIndex 2 should become branch_id 3 */
      const branchIds = callArgs.branch_addon_assignments.map(b => b.branch_id)
      expect(branchIds).toContain(1)
      expect(branchIds).toContain(3)
      expect(branchIds).not.toContain(0)
      expect(branchIds).not.toContain(2)
    })

    it('groups multiple branch addons for same branch', async () => {
      const dataWithMultipleAddons = {
        ...mockCachedPlanData,
        selectedAddons: [
          {
            addon_id: 2,
            addon_name: 'Extra Storage',
            addon_price: 30,
            pricing_scope: 'branch' as const,
            branches: [
              { branchIndex: 0, branchName: 'Branch 1', isSelected: true }
            ],
            is_included: false
          },
          {
            addon_id: 3,
            addon_name: 'Advanced Reporting',
            addon_price: 40,
            pricing_scope: 'branch' as const,
            branches: [
              { branchIndex: 0, branchName: 'Branch 1', isSelected: true }
            ],
            is_included: false
          }
        ]
      }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(dataWithMultipleAddons)
      )
      vi.mocked(subscriptionService.assignPlanToTenant).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => usePlanStorage())

      await act(async () => {
        await result.current.assignPlanToTenant()
      })

      const callArgs = vi.mocked(subscriptionService.assignPlanToTenant).mock.calls[0][0]

      /* Should have only one branch entry with two addons */
      expect(callArgs.branch_addon_assignments).toHaveLength(1)
      expect(callArgs.branch_addon_assignments[0].branch_id).toBe(1)
      expect(callArgs.branch_addon_assignments[0].addon_assignments).toHaveLength(2)
    })
  })
})
