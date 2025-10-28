/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import { useAssignedPlan } from '../use-assigned-plan'
import { subscriptionService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

/* Mock the API services */
vi.mock('@tenant-management/api', () => ({
  subscriptionService: {
    getAssignedPlanForTenant: vi.fn()
  }
}))

describe('useAssignedPlan', () => {
  const mockAssignedPlanResponse = {
    success: true,
    message: 'Assigned plan retrieved successfully',
    data: {
      plan: {
        id: 1,
        name: 'Professional Plan',
        description: 'Professional features',
        features: [],
        is_featured: false,
        is_active: true,
        is_custom: false,
        display_order: 1,
        monthly_price: 299.99,
        included_branches_count: 5,
        annual_discount_percentage: 20,
        add_ons: []
      },
      add_ons: [
        {
          addon_id: 1,
          addon_name: 'Advanced Analytics',
          addon_price: 99.99,
          pricing_scope: 'organization' as const,
          branches: [],
          is_included: false
        }
      ],
      billingCycle: 'monthly' as const,
      branchCount: 5,
      branches: [
        { branchIndex: 0, branchName: 'Branch 1', isSelected: false },
        { branchIndex: 1, branchName: 'Branch 2', isSelected: false },
        { branchIndex: 2, branchName: 'Branch 3', isSelected: false },
        { branchIndex: 3, branchName: 'Branch 4', isSelected: false },
        { branchIndex: 4, branchName: 'Branch 5', isSelected: false }
      ]
    },
    timestamp: '2024-01-15T10:30:00Z'
  }

  const mockCachedPlanData = {
    selectedPlan: mockAssignedPlanResponse.data.plan,
    selectedAddons: mockAssignedPlanResponse.data.add_ons,
    billingCycle: 'monthly' as const,
    branchCount: 5,
    branches: [
      { branchIndex: 0, branchName: 'Branch 1', isSelected: false },
      { branchIndex: 1, branchName: 'Branch 2', isSelected: false },
      { branchIndex: 2, branchName: 'Branch 3', isSelected: false },
      { branchIndex: 3, branchName: 'Branch 4', isSelected: false },
      { branchIndex: 4, branchName: 'Branch 5', isSelected: false }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useAssignedPlan())

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(typeof result.current.fetchAssignedPlan).toBe('function')
      expect(typeof result.current.getCachedPlan).toBe('function')
    })

    it('provides all expected functions', () => {
      const { result } = renderHook(() => useAssignedPlan())

      expect(result.current).toHaveProperty('fetchAssignedPlan')
      expect(result.current).toHaveProperty('getCachedPlan')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('error')
    })
  })

  describe('fetchAssignedPlan Operation', () => {
    describe('Success Cases', () => {
      it('successfully fetches and caches assigned plan', async () => {
        vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
          mockAssignedPlanResponse
        )

        const { result } = renderHook(() => useAssignedPlan())

        let cachedData: any
        await act(async () => {
          cachedData = await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(cachedData).toEqual(mockCachedPlanData)
        expect(subscriptionService.getAssignedPlanForTenant).toHaveBeenCalledWith('tenant-001')

        /* Verify data is cached in localStorage */
        const storedData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA)
        expect(storedData).not.toBeNull()
        expect(JSON.parse(storedData!)).toEqual(mockCachedPlanData)
      })

      it('sets loading state during fetch', async () => {
        vi.mocked(subscriptionService.getAssignedPlanForTenant).mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(mockAssignedPlanResponse), 100))
        )

        const { result } = renderHook(() => useAssignedPlan())

        act(() => {
          result.current.fetchAssignedPlan('tenant-001')
        })

        expect(result.current.loading).toBe(true)

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
      })

      it('transforms API response to cached format correctly', async () => {
        vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
          mockAssignedPlanResponse
        )

        const { result } = renderHook(() => useAssignedPlan())

        let cachedData: any
        await act(async () => {
          cachedData = await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(cachedData).not.toBe(null)
        expect(cachedData).toHaveProperty('selectedPlan')
        expect(cachedData).toHaveProperty('selectedAddons')
        expect(cachedData?.selectedPlan).toEqual(mockAssignedPlanResponse.data.plan)
        expect(cachedData?.selectedAddons).toEqual(mockAssignedPlanResponse.data.add_ons)
      })

      it('resets error state on successful fetch', async () => {
        vi.mocked(subscriptionService.getAssignedPlanForTenant)
          .mockRejectedValueOnce(new Error('First error'))
          .mockResolvedValueOnce(mockAssignedPlanResponse)

        const { result } = renderHook(() => useAssignedPlan())

        await act(async () => {
          await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(result.current.error).not.toBe(null)

        await act(async () => {
          await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(result.current.error).toBe(null)
      })
    })

    describe('Empty Tenant ID', () => {
      it('returns null when tenant ID is empty', async () => {
        const { result } = renderHook(() => useAssignedPlan())

        let response: any
        await act(async () => {
          response = await result.current.fetchAssignedPlan('')
        })

        expect(response).toBe(null)
        expect(subscriptionService.getAssignedPlanForTenant).not.toHaveBeenCalled()
      })

      it('does not set loading state for empty tenant ID', async () => {
        const { result } = renderHook(() => useAssignedPlan())

        await act(async () => {
          await result.current.fetchAssignedPlan('')
        })

        expect(result.current.loading).toBe(false)
      })
    })

    describe('Error Handling', () => {
      it('handles API error with Error object', async () => {
        const error = new Error('Failed to fetch plan')
        vi.mocked(subscriptionService.getAssignedPlanForTenant).mockRejectedValue(error)

        const { result } = renderHook(() => useAssignedPlan())

        let response: any
        await act(async () => {
          response = await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(response).toBe(null)
        expect(result.current.error).toBe('Failed to fetch plan')
      })

      it('handles API error without Error object', async () => {
        vi.mocked(subscriptionService.getAssignedPlanForTenant).mockRejectedValue('String error')

        const { result } = renderHook(() => useAssignedPlan())

        let response: any
        await act(async () => {
          response = await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(response).toBe(null)
        expect(result.current.error).toBe('Failed to fetch assigned plan')
      })

      it('handles unsuccessful API response', async () => {
        vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue({
          success: false,
          message: 'Plan not found',
          data: {
            plan: {
              id: 0,
              name: '',
              description: '',
              features: [],
              is_featured: false,
              is_active: false,
              is_custom: false,
              display_order: 0,
              monthly_price: 0,
              included_branches_count: 0,
              annual_discount_percentage: 0,
              add_ons: []
            },
            billingCycle: 'monthly' as const,
            branchCount: 0,
            branches: [],
            add_ons: []
          },
          timestamp: '2024-01-15T10:30:00Z'
        })

        const { result } = renderHook(() => useAssignedPlan())

        let response: any
        await act(async () => {
          response = await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(response).toBe(null)
      })

      it('handles API response with no data', async () => {
        vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue({
          success: true,
          message: 'No plan assigned',
          data: null as any,
          timestamp: '2024-01-15T10:30:00Z'
        })

        const { result } = renderHook(() => useAssignedPlan())

        let response: any
        await act(async () => {
          response = await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(response).toBe(null)
      })

      it('resets loading state after error', async () => {
        vi.mocked(subscriptionService.getAssignedPlanForTenant).mockRejectedValue(
          new Error('Test error')
        )

        const { result } = renderHook(() => useAssignedPlan())

        await act(async () => {
          await result.current.fetchAssignedPlan('tenant-001')
        })

        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('getCachedPlan Operation', () => {
    it('retrieves cached plan data from localStorage', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )

      const { result } = renderHook(() => useAssignedPlan())

      const cachedData = result.current.getCachedPlan()
      expect(cachedData).toEqual(mockCachedPlanData)
    })

    it('returns null when no cached data exists', () => {
      const { result } = renderHook(() => useAssignedPlan())

      const cachedData = result.current.getCachedPlan()
      expect(cachedData).toBe(null)
    })

    it('handles invalid JSON in localStorage', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        'invalid json {'
      )

      const { result } = renderHook(() => useAssignedPlan())

      const cachedData = result.current.getCachedPlan()
      expect(cachedData).toBe(null)
    })

    it('does not modify cached data', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )

      const { result } = renderHook(() => useAssignedPlan())

      const cachedData1 = result.current.getCachedPlan()
      const cachedData2 = result.current.getCachedPlan()

      expect(cachedData1).toEqual(cachedData2)
    })
  })

  describe('Integration: Fetch and Retrieve', () => {
    it('fetches plan and then retrieves from cache', async () => {
      vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
        mockAssignedPlanResponse
      )

      const { result } = renderHook(() => useAssignedPlan())

      await act(async () => {
        await result.current.fetchAssignedPlan('tenant-001')
      })

      const cachedData = result.current.getCachedPlan()
      expect(cachedData).toEqual(mockCachedPlanData)
    })

    it('fetches new plan and overwrites existing cache', async () => {
      /* Set initial cache */
      const initialData = {
        selectedPlan: { ...mockCachedPlanData.selectedPlan, id: 999, name: 'Old Plan' },
        selectedAddons: [],
        billing_cycle: 'annual',
        branch_count: 1
      }
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(initialData)
      )

      vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
        mockAssignedPlanResponse
      )

      const { result } = renderHook(() => useAssignedPlan())

      await act(async () => {
        await result.current.fetchAssignedPlan('tenant-001')
      })

      const cachedData = result.current.getCachedPlan()
      expect(cachedData?.selectedPlan?.id).toBe(1)
      expect(cachedData?.selectedPlan?.name).toBe('Professional Plan')
    })
  })

  describe('Multiple Operations', () => {
    it('handles sequential fetches for different tenants', async () => {
      const response1 = {
        success: true,
        message: 'Assigned plan retrieved successfully',
        data: {
          ...mockAssignedPlanResponse.data,
          plan: { ...mockAssignedPlanResponse.data.plan, id: 1, name: 'Plan 1' }
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      const response2 = {
        success: true,
        message: 'Assigned plan retrieved successfully',
        data: {
          ...mockAssignedPlanResponse.data,
          plan: { ...mockAssignedPlanResponse.data.plan, id: 2, name: 'Plan 2' }
        },
        timestamp: '2024-01-15T10:31:00Z'
      }

      vi.mocked(subscriptionService.getAssignedPlanForTenant)
        .mockResolvedValueOnce(response1)
        .mockResolvedValueOnce(response2)

      const { result } = renderHook(() => useAssignedPlan())

      await act(async () => {
        await result.current.fetchAssignedPlan('tenant-001')
      })

      let cachedData = result.current.getCachedPlan()
      expect(cachedData?.selectedPlan?.name).toBe('Plan 1')

      await act(async () => {
        await result.current.fetchAssignedPlan('tenant-002')
      })

      cachedData = result.current.getCachedPlan()
      expect(cachedData?.selectedPlan?.name).toBe('Plan 2')
    })

    it('handles multiple getCachedPlan calls', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(mockCachedPlanData)
      )

      const { result } = renderHook(() => useAssignedPlan())

      const data1 = result.current.getCachedPlan()
      const data2 = result.current.getCachedPlan()
      const data3 = result.current.getCachedPlan()

      expect(data1).toEqual(data2)
      expect(data2).toEqual(data3)
    })
  })

  describe('Edge Cases', () => {
    it('handles plan with no addons', async () => {
      const responseNoAddons = {
        success: true,
        message: 'Assigned plan retrieved successfully',
        data: {
          ...mockAssignedPlanResponse.data,
          add_ons: []
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
        responseNoAddons
      )

      const { result } = renderHook(() => useAssignedPlan())

      let cachedData: any
      await act(async () => {
        cachedData = await result.current.fetchAssignedPlan('tenant-001')
      })

      expect(cachedData.selectedAddons).toEqual([])
    })

    it('handles plan with many addons', async () => {
      const manyAddons = Array.from({ length: 20 }, (_, i) => ({
        addon_id: i + 1,
        addon_name: `Addon ${i + 1}`,
        addon_price: (i + 1) * 10,
        pricing_scope: i % 2 === 0 ? ('organization' as const) : ('branch' as const),
        branches: [],
        is_included: false
      }))

      const responseWithManyAddons = {
        success: true,
        message: 'Assigned plan retrieved successfully',
        data: {
          ...mockAssignedPlanResponse.data,
          add_ons: manyAddons
        },
        timestamp: '2024-01-15T10:30:00Z'
      }

      vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
        responseWithManyAddons
      )

      const { result } = renderHook(() => useAssignedPlan())

      let cachedData: any
      await act(async () => {
        cachedData = await result.current.fetchAssignedPlan('tenant-001')
      })

      expect(cachedData.selectedAddons).toHaveLength(20)
    })

    it('handles localStorage quota exceeded error', async () => {
      /* Mock localStorage.setItem to throw quota exceeded error BEFORE rendering hook */
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
        mockAssignedPlanResponse
      )

      const { result } = renderHook(() => useAssignedPlan())

      let fetchResult: any
      await act(async () => {
        fetchResult = await result.current.fetchAssignedPlan('tenant-001')
      })

      /* The error should be caught and set in state */
      expect(result.current.error).toBe('QuotaExceededError')
      expect(fetchResult).toBe(null)

      /* Restore */
      setItemSpy.mockRestore()
    })

    it('handles undefined values in response data', async () => {
      const responseWithUndefined = {
        success: true,
        data: {
          plan: mockAssignedPlanResponse.data.plan,
          add_ons: mockAssignedPlanResponse.data.add_ons,
          billing_cycle: undefined,
          branch_count: undefined
        }
      }

      vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
        responseWithUndefined as any
      )

      const { result } = renderHook(() => useAssignedPlan())

      let cachedData: any
      await act(async () => {
        cachedData = await result.current.fetchAssignedPlan('tenant-001')
      })

      expect(cachedData.billing_cycle).toBeUndefined()
      expect(cachedData.branch_count).toBeUndefined()
    })
  })

  describe('Callback Stability', () => {
    it('maintains stable function references', () => {
      const { result, rerender } = renderHook(() => useAssignedPlan())

      const { fetchAssignedPlan: fn1, getCachedPlan: fn2 } = result.current

      rerender()

      expect(result.current.fetchAssignedPlan).toBe(fn1)
      expect(result.current.getCachedPlan).toBe(fn2)
    })
  })

  describe('Console Logging', () => {
    it('logs success message when plan is fetched', async () => {
      vi.mocked(subscriptionService.getAssignedPlanForTenant).mockResolvedValue(
        mockAssignedPlanResponse
      )

      const { result } = renderHook(() => useAssignedPlan())

      await act(async () => {
        await result.current.fetchAssignedPlan('tenant-001')
      })

      expect(console.log).toHaveBeenCalledWith(
        'Assigned plan data fetched and cached successfully'
      )
    })

    it('logs warning when error occurs', async () => {
      const error = new Error('API Error')
      vi.mocked(subscriptionService.getAssignedPlanForTenant).mockRejectedValue(error)

      const { result } = renderHook(() => useAssignedPlan())

      await act(async () => {
        await result.current.fetchAssignedPlan('tenant-001')
      })

      expect(console.warn).toHaveBeenCalledWith('Error fetching assigned plan:', error)
    })
  })
})
