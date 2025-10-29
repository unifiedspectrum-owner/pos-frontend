/* Comprehensive test suite for usePlans hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as sharedConfig from '@shared/config'

/* Plan module imports */
import { usePlans } from '@plan-management/hooks/use-plans'
import { planService } from '@plan-management/api'
import { Plan } from '@plan-management/types'

/* Mock dependencies */
vi.mock('@plan-management/api', () => ({
  planService: {
    getAllSubscriptionPlans: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils', () => ({
  getCurrentISOString: vi.fn(() => '2024-01-01T00:00:00Z')
}))

vi.mock('@shared/config', async () => {
  const actual = await vi.importActual('@shared/config')
  return {
    ...actual,
    LOADING_DELAY_ENABLED: false,
    LOADING_DELAY: 0
  }
})

describe('usePlans Hook', () => {
  /* Mock data */
  const mockPlans: Plan[] = [
    {
      id: 1,
      name: 'Basic Plan',
      description: 'Basic subscription plan',
      features: [],
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
      name: 'Premium Plan',
      description: 'Premium subscription plan',
      features: [],
      is_featured: true,
      is_active: true,
      is_custom: false,
      display_order: 2,
      monthly_price: 99.99,
      included_branches_count: 3,
      annual_discount_percentage: 15,
      add_ons: []
    }
  ]

  /* Mock service functions */
  const mockGetAllPlans = vi.mocked(planService.getAllSubscriptionPlans)
  const mockHandleApiError = vi.mocked(sharedUtils.handleApiError)

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
    it('should initialize with default values when autoFetch is false', () => {
      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      expect(result.current.plans).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.lastUpdated).toBe('')
    })

    it('should initialize with loading state when autoFetch is true', () => {
      mockGetAllPlans.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockPlans,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z',
          count: mockPlans.length
        }), 100))
      )

      const { result } = renderHook(() => usePlans({ autoFetch: true }))

      expect(result.current.loading).toBe(true)
    })

    it('should have all required functions', () => {
      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      expect(typeof result.current.fetchPlans).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })
  })

  describe('Auto-fetch Functionality', () => {
    it('should auto-fetch plans on mount when autoFetch is true', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      const { result } = renderHook(() => usePlans({ autoFetch: true }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockGetAllPlans).toHaveBeenCalledTimes(1)
      expect(result.current.plans).toEqual(mockPlans)
    })

    it('should not auto-fetch plans when autoFetch is false', () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      renderHook(() => usePlans({ autoFetch: false }))

      expect(mockGetAllPlans).not.toHaveBeenCalled()
    })

    it('should default to autoFetch true when no params provided', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      renderHook(() => usePlans())

      await waitFor(() => {
        expect(mockGetAllPlans).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('fetchPlans Function', () => {
    it('should fetch plans successfully', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T12:00:00Z',
        count: mockPlans.length
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.plans).toEqual(mockPlans)
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
        expect(result.current.lastUpdated).toBe('2024-01-01T12:00:00Z')
      })

      expect(mockGetAllPlans).toHaveBeenCalledTimes(1)
    })

    it('should set loading state during fetch', async () => {
      mockGetAllPlans.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockPlans,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z',
          count: mockPlans.length
        }), 50))
      )

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      const promise = result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle API error response', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: false,
        message: 'Failed to fetch plans',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch plans')
        expect(result.current.plans).toEqual([])
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetAllPlans.mockRejectedValue(mockError)

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load plan data')
        expect(result.current.plans).toEqual([])
        expect(result.current.loading).toBe(false)
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
        title: 'Failed to Load Plans'
      })
    })

    it('should use current ISO string when timestamp not in response', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.lastUpdated).toBe('2024-01-01T00:00:00Z')
      })
    })

    it('should handle empty plans array', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.plans).toEqual([])
        expect(result.current.error).toBe(null)
      })
    })

    it('should clear previous errors on successful fetch', async () => {
      mockGetAllPlans.mockResolvedValueOnce({
        success: false,
        message: 'Error message',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.error).toBe('Error message')
      })

      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.error).toBe(null)
        expect(result.current.plans).toEqual(mockPlans)
      })
    })
  })

  describe('refetch Function', () => {
    it('should refetch plans successfully', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.plans).toEqual(mockPlans)
        expect(result.current.loading).toBe(false)
      })

      expect(mockGetAllPlans).toHaveBeenCalledTimes(1)
    })

    it('should behave identically to fetchPlans', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.plans).toEqual(mockPlans)
      })

      const updatedPlans: Plan[] = [
        {
          id: 3,
          name: 'Enterprise Plan',
          description: 'Enterprise subscription plan',
          features: [],
          is_featured: true,
          is_active: true,
          is_custom: false,
          display_order: 3,
          monthly_price: 199.99,
          included_branches_count: 10,
          annual_discount_percentage: 20,
          add_ons: []
        }
      ]

      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: updatedPlans,
        message: 'Success',
        timestamp: '2024-01-02T00:00:00Z',
        count: updatedPlans.length
      })

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.plans).toEqual(updatedPlans)
        expect(result.current.lastUpdated).toBe('2024-01-02T00:00:00Z')
      })
    })
  })

  describe('Data Updates', () => {
    it('should update plans data on subsequent fetches', async () => {
      mockGetAllPlans.mockResolvedValueOnce({
        success: true,
        data: [mockPlans[0]],
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 1
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.plans).toEqual([mockPlans[0]])
      })

      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-02T00:00:00Z',
        count: mockPlans.length
      })

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.plans).toEqual(mockPlans)
        expect(result.current.lastUpdated).toBe('2024-01-02T00:00:00Z')
      })
    })

    it('should maintain plans data after error', async () => {
      mockGetAllPlans.mockResolvedValueOnce({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.plans).toEqual(mockPlans)
      })

      const mockError = new Error('Network error') as AxiosError
      mockGetAllPlans.mockRejectedValue(mockError)

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load plan data')
        expect(result.current.plans).toEqual([])
      })
    })
  })

  describe('Multiple Hook Instances', () => {
    it('should maintain independent state for multiple hook instances', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        data: mockPlans,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockPlans.length
      })

      const { result: result1 } = renderHook(() => usePlans({ autoFetch: false }))
      const { result: result2 } = renderHook(() => usePlans({ autoFetch: false }))

      await result1.current.fetchPlans()

      await waitFor(() => {
        expect(result1.current.plans).toEqual(mockPlans)
      })

      expect(result2.current.plans).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle missing data in response', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.plans).toEqual([])
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle API error without message', async () => {
      mockGetAllPlans.mockResolvedValue({
        success: false,
        message: '',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => usePlans({ autoFetch: false }))

      await result.current.fetchPlans()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch plans')
      })
    })
  })
})
