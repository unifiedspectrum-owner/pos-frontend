/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import { usePlanData } from '../use-plan-data'
import { planService } from '@plan-management/api'
import { Plan } from '@plan-management/types'
import { PLANS_CACHE_CONFIG } from '@tenant-management/constants'

/* Mock the API services */
vi.mock('@plan-management/api', () => ({
  planService: {
    getAllSubscriptionPlans: vi.fn()
  }
}))

/* Mock shared utils */
vi.mock('@shared/utils', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/ui', () => ({
  createToastNotification: vi.fn()
}))

describe('usePlanData', () => {
  const mockPlans: Plan[] = [
    {
      id: 1,
      name: 'Basic Plan',
      description: 'Basic features',
      features: [],
      is_featured: false,
      is_active: true,
      is_custom: false,
      display_order: 1,
      monthly_price: 99.99,
      included_branches_count: 1,
      annual_discount_percentage: 10,
      add_ons: []
    },
    {
      id: 2,
      name: 'Professional Plan',
      description: 'Professional features',
      features: [],
      is_featured: true,
      is_active: true,
      is_custom: false,
      display_order: 2,
      monthly_price: 299.99,
      included_branches_count: 5,
      annual_discount_percentage: 20,
      add_ons: []
    },
    {
      id: 3,
      name: 'Inactive Plan',
      description: 'Inactive',
      features: [],
      is_featured: false,
      is_active: false,
      is_custom: false,
      display_order: 3,
      monthly_price: 0,
      included_branches_count: 1,
      annual_discount_percentage: 0,
      add_ons: []
    }
  ]

  const mockPlansApiResponse = {
    success: true,
    message: 'Plans retrieved successfully',
    timestamp: '2024-01-15T10:30:00Z',
    count: mockPlans.length,
    data: mockPlans
  }

  const mockEmptyPlansApiResponse = {
    success: true,
    message: 'No plans found',
    timestamp: '2024-01-15T10:30:00Z',
    count: 0,
    data: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Hook Initialization', () => {
    it('initializes with loading state', () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockImplementation(
        () => new Promise(() => {})
      )

      const { result } = renderHook(() => usePlanData())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.plans).toEqual([])
      expect(result.current.error).toBe(null)
      expect(result.current.isRefreshing).toBe(false)
    })

    it('provides all expected properties and functions', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current).toHaveProperty('plans')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('isRefreshing')
      expect(result.current).toHaveProperty('refreshPlans')
      expect(result.current).toHaveProperty('clearError')
      expect(result.current).toHaveProperty('clearCache')
      expect(result.current).toHaveProperty('refetch')
      expect(result.current).toHaveProperty('hasPlans')
      expect(result.current).toHaveProperty('activePlansCount')
      expect(result.current).toHaveProperty('featuredPlansCount')
    })
  })

  describe('fetchPlans on Mount', () => {
    it('fetches plans from API on mount', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.plans).toEqual(mockPlans)
      expect(planService.getAllSubscriptionPlans).toHaveBeenCalledTimes(1)
    })

    it('caches fetched plans to localStorage', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      renderHook(() => usePlanData())

      await waitFor(() => {
        const cached = localStorage.getItem(PLANS_CACHE_CONFIG.KEY)
        expect(cached).not.toBeNull()
      })

      const cached = localStorage.getItem(PLANS_CACHE_CONFIG.KEY)
      const timestamp = localStorage.getItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY)

      expect(JSON.parse(cached!)).toEqual(mockPlans)
      expect(timestamp).not.toBeNull()
    })

    it('loads from cache when available and not expired', async () => {
      const now = Date.now()
      localStorage.setItem(PLANS_CACHE_CONFIG.KEY, JSON.stringify(mockPlans))
      localStorage.setItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY, now.toString())

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.plans).toEqual(mockPlans)
      expect(planService.getAllSubscriptionPlans).not.toHaveBeenCalled()
    })

    it('fetches from API when cache is expired', async () => {
      const oldTimestamp = Date.now() - PLANS_CACHE_CONFIG.DURATION - 1000
      localStorage.setItem(PLANS_CACHE_CONFIG.KEY, JSON.stringify([]))
      localStorage.setItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY, oldTimestamp.toString())

      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      renderHook(() => usePlanData())

      await waitFor(() => {
        expect(planService.getAllSubscriptionPlans).toHaveBeenCalled()
      })
    })
  })

  describe('API Success Cases', () => {
    it('handles successful API response', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.plans).toEqual(mockPlans)
      expect(result.current.error).toBe(null)
    })

    it('handles empty plans array', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockEmptyPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.plans).toEqual([])
      expect(result.current.hasPlans).toBe(false)
    })
  })

  describe('API Error Cases', () => {
    it('handles API error response', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue({
        success: false,
        message: 'Failed to fetch plans',
        timestamp: '2024-01-15T10:30:00Z',
        count: 0
      })

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch plans')
      expect(result.current.plans).toEqual([])
    })

    it('handles network errors', async () => {
      const error = new Error('Network error')
      vi.mocked(planService.getAllSubscriptionPlans).mockRejectedValue(error)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.plans).toEqual([])
    })

    it('handles errors without message', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockRejectedValue({})

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Unknown error occurred')
    })
  })

  describe('refreshPlans Operation', () => {
    it('refreshes plans from API', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.refreshPlans()
      })

      expect(planService.getAllSubscriptionPlans).toHaveBeenCalled()
    })

    it('sets isRefreshing during refresh', async () => {
      vi.mocked(planService.getAllSubscriptionPlans)
        .mockResolvedValueOnce(mockPlansApiResponse)
        .mockImplementationOnce(
          () => new Promise((resolve) => setTimeout(() => resolve(mockPlansApiResponse), 100))
        )

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.refreshPlans()
      })

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false)
      })
    })

    it('bypasses cache when refreshing', async () => {
      localStorage.setItem(PLANS_CACHE_CONFIG.KEY, JSON.stringify(mockPlans))
      localStorage.setItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY, Date.now().toString())

      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshPlans()
      })

      expect(planService.getAllSubscriptionPlans).toHaveBeenCalled()
    })
  })

  describe('clearError Operation', () => {
    it('clears error state', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockRejectedValue(
        new Error('Test error')
      )

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.error).not.toBe(null)
      })

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('clearCache Operation', () => {
    it('clears cached plans from localStorage', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(localStorage.getItem(PLANS_CACHE_CONFIG.KEY)).not.toBeNull()

      act(() => {
        result.current.clearCache()
      })

      expect(localStorage.getItem(PLANS_CACHE_CONFIG.KEY)).toBeNull()
      expect(localStorage.getItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY)).toBeNull()
    })

    it('handles localStorage errors gracefully', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      /* Set up fresh console.warn spy to track calls */
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      /* Create spy that throws on first call */
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementationOnce(() => {
        throw new Error('SecurityError')
      })

      act(() => {
        result.current.clearCache()
      })

      /* Verify the error was logged */
      expect(warnSpy).toHaveBeenCalledWith('Failed to clear plans cache:', expect.any(Error))

      removeItemSpy.mockRestore()
      warnSpy.mockRestore()
    })
  })

  describe('Computed Properties', () => {
    it('calculates hasPlans correctly', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.hasPlans).toBe(true)
      })
    })

    it('calculates activePlansCount correctly', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.activePlansCount).toBe(2)
      })
    })

    it('calculates featuredPlansCount correctly', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.featuredPlansCount).toBe(1)
      })
    })

    it('returns zero counts for empty plans', async () => {
      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockEmptyPlansApiResponse)

      const { result } = renderHook(() => usePlanData())

      await waitFor(() => {
        expect(result.current.hasPlans).toBe(false)
        expect(result.current.activePlansCount).toBe(0)
        expect(result.current.featuredPlansCount).toBe(0)
      })
    })
  })

  describe('Cache Invalidation', () => {
    it('handles corrupted cache data', async () => {
      localStorage.setItem(PLANS_CACHE_CONFIG.KEY, 'invalid json {')
      localStorage.setItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY, Date.now().toString())

      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      renderHook(() => usePlanData())

      await waitFor(() => {
        expect(planService.getAllSubscriptionPlans).toHaveBeenCalled()
      })
    })

    it('handles missing timestamp', async () => {
      localStorage.setItem(PLANS_CACHE_CONFIG.KEY, JSON.stringify(mockPlans))

      vi.mocked(planService.getAllSubscriptionPlans).mockResolvedValue(mockPlansApiResponse)

      renderHook(() => usePlanData())

      await waitFor(() => {
        expect(planService.getAllSubscriptionPlans).toHaveBeenCalled()
      })
    })
  })
})
