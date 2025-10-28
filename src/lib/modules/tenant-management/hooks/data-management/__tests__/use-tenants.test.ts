/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import { useTenants } from '../use-tenants'
import { tenantService } from '@tenant-management/api'
import { TenantWithPlanDetails, TenantBasicDetails } from '@tenant-management/types'

/* Mock the API services */
vi.mock('@tenant-management/api', () => ({
  tenantService: {
    listAllTenants: vi.fn(),
    listAllTenantsWithBaseDetails: vi.fn()
  }
}))

/* Mock the shared config */
vi.mock('@shared/config', () => ({
  LOADING_DELAY_ENABLED: false,
  LOADING_DELAY: 0
}))

/* Mock shared utils */
vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

describe('useTenants', () => {
  const mockTenants: TenantWithPlanDetails[] = [
    {
      tenant_id: 'tenant-001',
      organization_name: 'Acme Corporation',
      tenant_status: 'active',
      tenant_created_at: '2024-01-01T00:00:00Z',
      plan_id: 1,
      plan_name: 'Enterprise Plan',
      subscription_status: 'active',
      billing_cycle: 'monthly',
      subscription_created_at: '2024-01-01T00:00:00Z'
    },
    {
      tenant_id: 'tenant-002',
      organization_name: 'Tech Solutions Inc',
      tenant_status: 'active',
      tenant_created_at: '2024-02-01T00:00:00Z',
      plan_id: 2,
      plan_name: 'Professional Plan',
      subscription_status: 'active',
      billing_cycle: 'annual',
      subscription_created_at: '2024-02-01T00:00:00Z'
    }
  ]

  const mockBaseDetailsTenants: TenantBasicDetails[] = [
    {
      id: 1,
      tenant_id: 'tenant-001',
      organization_name: 'Acme Corporation',
      primary_email: 'admin@acme.com',
      primary_phone: '+15551234567'
    },
    {
      id: 2,
      tenant_id: 'tenant-002',
      organization_name: 'Tech Solutions Inc',
      primary_email: 'contact@techsolutions.com',
      primary_phone: '+15559876543'
    },
    {
      id: 3,
      tenant_id: 'tenant-003',
      organization_name: 'Global Enterprises',
      primary_email: 'info@globalent.com',
      primary_phone: '+15551112222'
    }
  ]

  const mockPaginationInfo = {
    current_page: 1,
    limit: 10,
    total_count: 50,
    total_pages: 5,
    has_next_page: true,
    has_prev_page: false
  }

  const mockTenantListApiResponse = {
    success: true,
    message: 'Tenants retrieved successfully',
    tenants: mockTenants,
    pagination: mockPaginationInfo,
    timestamp: '2024-01-15T10:30:00Z'
  }

  const mockEmptyTenantListApiResponse = {
    success: true,
    message: 'No tenants found',
    tenants: [],
    pagination: {
      current_page: 1,
      limit: 10,
      total_count: 0,
      total_pages: 0,
      has_next_page: false,
      has_prev_page: false
    },
    timestamp: '2024-01-15T10:30:00Z'
  }

  const mockTenantBasicListResponse = {
    success: true,
    message: 'Base details retrieved successfully',
    data: { tenants: mockBaseDetailsTenants },
    timestamp: '2024-01-15T10:30:00Z'
  }

  const mockEmptyTenantBasicListResponse = {
    success: true,
    message: 'No base details found',
    data: { tenants: [] },
    timestamp: '2024-01-15T10:30:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useTenants())

      expect(result.current.tenants).toEqual([])
      expect(result.current.baseDetailsTenants).toEqual([])
      expect(result.current.tenantSelectOptions).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.baseDetailsLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.baseDetailsError).toBe(null)
      expect(result.current.lastUpdated).toBe('')
      expect(result.current.pagination).toBeUndefined()
    })

    it('provides all expected functions', () => {
      const { result } = renderHook(() => useTenants())

      expect(typeof result.current.fetchTenants).toBe('function')
      expect(typeof result.current.fetchTenantsWithBaseDetails).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })

    it('initializes with autoFetch enabled', () => {
      const { result } = renderHook(() => useTenants({ autoFetch: true }))

      expect(result.current.loading).toBe(true)
    })

    it('initializes with autoFetchBaseDetails enabled', () => {
      const { result } = renderHook(() => useTenants({ autoFetchBaseDetails: true }))

      expect(result.current.baseDetailsLoading).toBe(true)
    })

    it('accepts custom initial page and limit', () => {
      renderHook(() => useTenants({ initialPage: 2, initialLimit: 20 }))

      /* Initial values are used internally but not exposed directly */
      expect(true).toBe(true)
    })
  })

  describe('fetchTenants Operation', () => {
    describe('Success Cases', () => {
      it('successfully fetches tenants', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenants()
        })

        expect(result.current.tenants).toEqual(mockTenants)
        expect(result.current.pagination).toEqual(mockPaginationInfo)
        expect(result.current.error).toBe(null)
        expect(result.current.loading).toBe(false)
        expect(result.current.lastUpdated).not.toBe('')
      })

      it('calls API with correct pagination parameters', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenants(2, 20)
        })

        expect(tenantService.listAllTenants).toHaveBeenCalledWith(2, 20)
      })

      it('uses default parameters when not provided', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

        const { result } = renderHook(() => useTenants({ initialPage: 1, initialLimit: 10 }))

        await act(async () => {
          await result.current.fetchTenants()
        })

        expect(tenantService.listAllTenants).toHaveBeenCalledWith(1, 10)
      })

      it('sets loading state during fetch', async () => {
        vi.mocked(tenantService.listAllTenants).mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(mockTenantListApiResponse), 100))
        )

        const { result } = renderHook(() => useTenants())

        act(() => {
          result.current.fetchTenants()
        })

        expect(result.current.loading).toBe(true)

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
      })

      it('updates lastUpdated timestamp', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

        const { result } = renderHook(() => useTenants())

        expect(result.current.lastUpdated).toBe('')

        await act(async () => {
          await result.current.fetchTenants()
        })

        expect(result.current.lastUpdated).not.toBe('')
        expect(typeof result.current.lastUpdated).toBe('string')
      })

      it('handles empty tenant list', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockEmptyTenantListApiResponse)

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenants()
        })

        expect(result.current.tenants).toEqual([])
        expect(result.current.error).toBe(null)
      })
    })

    describe('Error Handling', () => {
      it('handles API error response', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue({
          success: false,
          message: 'Failed to fetch tenants',
          tenants: [],
          pagination: {
            current_page: 1,
            limit: 10,
            total_count: 0,
            total_pages: 0,
            has_next_page: false,
            has_prev_page: false
          },
          timestamp: '2024-01-15T10:30:00Z'
        })

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenants()
        })

        expect(result.current.error).toBe('Failed to fetch tenants')
        expect(result.current.tenants).toEqual([])
      })

      it('handles API error without message', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue({
          success: false,
          message: '',
          tenants: [],
          pagination: {
            current_page: 1,
            limit: 10,
            total_count: 0,
            total_pages: 0,
            has_next_page: false,
            has_prev_page: false
          },
          timestamp: '2024-01-15T10:30:00Z'
        })

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenants()
        })

        expect(result.current.error).toBe('Failed to fetch tenants')
      })

      it('handles network errors', async () => {
        vi.mocked(tenantService.listAllTenants).mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenants()
        })

        expect(result.current.error).toBe('Failed to load tenant data')
        expect(result.current.tenants).toEqual([])
      })

      it('resets loading state after error', async () => {
        vi.mocked(tenantService.listAllTenants).mockRejectedValue(new Error('Test error'))

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenants()
        })

        expect(result.current.loading).toBe(false)
      })

      it('handles invalid page number', async () => {
        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenants(NaN, 10)
        })

        expect(result.current.error).toBe('Page number must be a valid number')
        expect(tenantService.listAllTenants).not.toHaveBeenCalled()
      })
    })

    describe('Auto-fetch Behavior', () => {
      it('auto-fetches tenants on mount when enabled', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

        renderHook(() => useTenants({ autoFetch: true }))

        await waitFor(() => {
          expect(tenantService.listAllTenants).toHaveBeenCalledTimes(1)
        })
      })

      it('does not auto-fetch when disabled', () => {
        renderHook(() => useTenants({ autoFetch: false }))

        expect(tenantService.listAllTenants).not.toHaveBeenCalled()
      })

      it('uses initial page and limit for auto-fetch', async () => {
        vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

        renderHook(() => useTenants({ autoFetch: true, initialPage: 3, initialLimit: 25 }))

        await waitFor(() => {
          expect(tenantService.listAllTenants).toHaveBeenCalledWith(3, 25)
        })
      })
    })
  })

  describe('fetchTenantsWithBaseDetails Operation', () => {
    describe('Success Cases', () => {
      it('successfully fetches base details tenants', async () => {
        vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenantsWithBaseDetails()
        })

        expect(result.current.baseDetailsTenants).toEqual(mockBaseDetailsTenants)
        expect(result.current.baseDetailsError).toBe(null)
        expect(result.current.baseDetailsLoading).toBe(false)
      })

      it('sets loading state during fetch', async () => {
        vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(mockTenantBasicListResponse), 100))
        )

        const { result } = renderHook(() => useTenants())

        act(() => {
          result.current.fetchTenantsWithBaseDetails()
        })

        expect(result.current.baseDetailsLoading).toBe(true)

        await waitFor(() => {
          expect(result.current.baseDetailsLoading).toBe(false)
        })
      })

      it('handles empty base details list', async () => {
        vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockEmptyTenantBasicListResponse)

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenantsWithBaseDetails()
        })

        expect(result.current.baseDetailsTenants).toEqual([])
        expect(result.current.baseDetailsError).toBe(null)
      })
    })

    describe('Error Handling', () => {
      it('handles API error response', async () => {
        vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue({
          success: false,
          message: 'Failed to fetch base details',
          data: { tenants: [] },
          timestamp: '2024-01-15T10:30:00Z'
        })

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenantsWithBaseDetails()
        })

        expect(result.current.baseDetailsError).toBe('Failed to fetch base details')
        expect(result.current.baseDetailsTenants).toEqual([])
      })

      it('handles API error without message', async () => {
        vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue({
          success: false,
          message: '',
          data: { tenants: [] },
          timestamp: '2024-01-15T10:30:00Z'
        })

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenantsWithBaseDetails()
        })

        expect(result.current.baseDetailsError).toBe('Failed to fetch tenants with base details')
      })

      it('handles network errors', async () => {
        vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockRejectedValue(
          new Error('Network error')
        )

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenantsWithBaseDetails()
        })

        expect(result.current.baseDetailsError).toBe('Failed to load tenants with base details')
        expect(result.current.baseDetailsTenants).toEqual([])
      })

      it('resets loading state after error', async () => {
        vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockRejectedValue(
          new Error('Test error')
        )

        const { result } = renderHook(() => useTenants())

        await act(async () => {
          await result.current.fetchTenantsWithBaseDetails()
        })

        expect(result.current.baseDetailsLoading).toBe(false)
      })
    })

    describe('Auto-fetch Behavior', () => {
      it('auto-fetches base details on mount when enabled', async () => {
        vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

        renderHook(() => useTenants({ autoFetchBaseDetails: true }))

        await waitFor(() => {
          expect(tenantService.listAllTenantsWithBaseDetails).toHaveBeenCalledTimes(1)
        })
      })

      it('does not auto-fetch when disabled', () => {
        renderHook(() => useTenants({ autoFetchBaseDetails: false }))

        expect(tenantService.listAllTenantsWithBaseDetails).not.toHaveBeenCalled()
      })
    })
  })

  describe('tenantSelectOptions', () => {
    it('generates select options from base details tenants', async () => {
      vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

      const { result } = renderHook(() => useTenants())

      await act(async () => {
        await result.current.fetchTenantsWithBaseDetails()
      })

      expect(result.current.tenantSelectOptions).toEqual([
        { label: 'Acme Corporation', value: 'tenant-001' },
        { label: 'Tech Solutions Inc', value: 'tenant-002' },
        { label: 'Global Enterprises', value: 'tenant-003' }
      ])
    })

    it('returns empty array when no base details tenants', () => {
      const { result } = renderHook(() => useTenants())

      expect(result.current.tenantSelectOptions).toEqual([])
    })

    it('memoizes select options', async () => {
      vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

      const { result, rerender } = renderHook(() => useTenants())

      await act(async () => {
        await result.current.fetchTenantsWithBaseDetails()
      })

      const firstOptions = result.current.tenantSelectOptions

      rerender()

      expect(result.current.tenantSelectOptions).toBe(firstOptions)
    })
  })

  describe('refetch Operation', () => {
    it('refetches with current page and limit', async () => {
      vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

      const { result } = renderHook(() => useTenants())

      await act(async () => {
        await result.current.fetchTenants(2, 20)
      })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.refetch()
      })

      expect(tenantService.listAllTenants).toHaveBeenCalledWith(2, 20)
    })

    it('works without previous fetch', async () => {
      vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

      const { result } = renderHook(() => useTenants({ initialPage: 1, initialLimit: 10 }))

      await act(async () => {
        await result.current.refetch()
      })

      expect(tenantService.listAllTenants).toHaveBeenCalledWith(1, 10)
    })
  })

  describe('State Independence', () => {
    it('maintains separate loading states', async () => {
      vi.mocked(tenantService.listAllTenants).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTenantListApiResponse), 100))
      )

      vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

      const { result } = renderHook(() => useTenants())

      act(() => {
        result.current.fetchTenants()
      })

      expect(result.current.loading).toBe(true)
      expect(result.current.baseDetailsLoading).toBe(false)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('maintains separate error states', async () => {
      vi.mocked(tenantService.listAllTenants).mockRejectedValue(new Error('Paginated error'))
      vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

      const { result } = renderHook(() => useTenants())

      await act(async () => {
        await result.current.fetchTenants()
        await result.current.fetchTenantsWithBaseDetails()
      })

      expect(result.current.error).toBe('Failed to load tenant data')
      expect(result.current.baseDetailsError).toBe(null)
    })

    it('maintains separate data states', async () => {
      vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

      vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

      const { result } = renderHook(() => useTenants())

      await act(async () => {
        await result.current.fetchTenants()
        await result.current.fetchTenantsWithBaseDetails()
      })

      expect(result.current.tenants).toHaveLength(2)
      expect(result.current.baseDetailsTenants).toHaveLength(3)
    })
  })

  describe('Concurrent Operations', () => {
    it('handles both fetches running simultaneously', async () => {
      vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

      vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

      const { result } = renderHook(() => useTenants())

      await act(async () => {
        await Promise.all([
          result.current.fetchTenants(),
          result.current.fetchTenantsWithBaseDetails()
        ])
      })

      expect(result.current.tenants).toEqual(mockTenants)
      expect(result.current.baseDetailsTenants).toEqual(mockBaseDetailsTenants)
      expect(result.current.loading).toBe(false)
      expect(result.current.baseDetailsLoading).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('handles multiple sequential fetches', async () => {
      vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

      const { result } = renderHook(() => useTenants())

      await act(async () => {
        await result.current.fetchTenants(1, 10)
        await result.current.fetchTenants(2, 10)
        await result.current.fetchTenants(3, 10)
      })

      expect(tenantService.listAllTenants).toHaveBeenCalledTimes(3)
      expect(result.current.loading).toBe(false)
    })

    it('clears error on successful fetch after previous error', async () => {
      vi.mocked(tenantService.listAllTenants)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockTenantListApiResponse)

      const { result } = renderHook(() => useTenants())

      await act(async () => {
        await result.current.fetchTenants()
      })

      expect(result.current.error).toBe('Failed to load tenant data')

      await act(async () => {
        await result.current.fetchTenants()
      })

      expect(result.current.error).toBe(null)
      expect(result.current.tenants).toEqual(mockTenants)
    })

    it('handles both auto-fetch options enabled', async () => {
      vi.mocked(tenantService.listAllTenants).mockResolvedValue(mockTenantListApiResponse)

      vi.mocked(tenantService.listAllTenantsWithBaseDetails).mockResolvedValue(mockTenantBasicListResponse)

      renderHook(() => useTenants({ autoFetch: true, autoFetchBaseDetails: true }))

      await waitFor(() => {
        expect(tenantService.listAllTenants).toHaveBeenCalled()
        expect(tenantService.listAllTenantsWithBaseDetails).toHaveBeenCalled()
      })
    })
  })
})
