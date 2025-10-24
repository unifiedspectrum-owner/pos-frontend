/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as apiUtils from '@shared/utils/api'

/* Support ticket module imports */
import { useSupportTickets } from '@support-ticket-management/hooks/use-support-tickets'
import { ticketsService, categoriesService } from '@support-ticket-management/api'
import { TicketListItem, TicketCategory } from '@support-ticket-management/types'
import { PaginationInfo } from '@shared/types'

/* Mock dependencies */
vi.mock('@support-ticket-management/api', () => ({
  ticketsService: {
    listAllSupportTickets: vi.fn()
  },
  categoriesService: {
    listAllCategories: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn(),
  getCurrentISOString: vi.fn(() => '2024-01-01T00:00:00.000Z')
}))

describe('useSupportTickets Hook', () => {
  /* Mock data */
  const mockTickets: TicketListItem[] = [
    {
      id: 1,
      ticket_id: 'TKT-2024-001',
      tenant_id: 'tenant-123',
      subject: 'Unable to login to my account',
      status: 'open',
      category_name: 'Login Issues',
      assigned_to_user_name: null,
      created_at: '2024-01-01T10:00:00Z',
      resolution_due: null,
      first_response_at: null
    },
    {
      id: 2,
      ticket_id: 'TKT-2024-002',
      tenant_id: 'tenant-123',
      subject: 'Payment processing error',
      status: 'in_progress',
      category_name: 'Payment Issues',
      assigned_to_user_name: 'Agent Smith',
      created_at: '2024-01-02T11:00:00Z',
      resolution_due: '2024-01-05T11:00:00Z',
      first_response_at: '2024-01-02T12:00:00Z'
    }
  ]

  const mockCategories: TicketCategory[] = [
    {
      id: 1,
      name: 'Login Issues',
      description: 'Issues related to login',
      display_order: 1,
      is_active: true,
    },
    {
      id: 2,
      name: 'Payment Issues',
      description: 'Issues related to payments',
      display_order: 2,
      is_active: true,
    }
  ]

  const mockPagination: PaginationInfo = {
    current_page: 1,
    total_pages: 5,
    limit: 10,
    total_count: 50,
    has_next_page: true,
    has_prev_page: false
  }

  /* Mock service functions */
  const mockListAllSupportTickets = vi.mocked(ticketsService.listAllSupportTickets)
  const mockListAllCategories = vi.mocked(categoriesService.listAllCategories)
  const mockHandleApiError = vi.mocked(apiUtils.handleApiError)

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
      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      expect(result.current.tickets).toEqual([])
      expect(result.current.categories).toEqual([])
      expect(result.current.categorySelectOptions).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.categoriesLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.categoriesError).toBe(null)
      expect(result.current.lastUpdated).toBe('')
      expect(result.current.pagination).toBeUndefined()
    })

    it('should initialize with loading state when autoFetch is true', () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: true }))

      expect(result.current.loading).toBe(true)
    })

    it('should initialize with categories loading state when autoFetchCategories is true', () => {
      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: mockCategories },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: true }))

      expect(result.current.categoriesLoading).toBe(true)
    })

    it('should use default parameters when none provided', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: true }))

      await waitFor(() => {
        expect(mockListAllSupportTickets).toHaveBeenCalledWith(1, 10)
      })
    })

    it('should use custom initial page and limit', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useSupportTickets({ initialPage: 2, initialLimit: 25, autoFetch: true }))

      await waitFor(() => {
        expect(mockListAllSupportTickets).toHaveBeenCalledWith(2, 25)
      })
    })
  })

  describe('fetchTickets Function', () => {
    it('should fetch tickets successfully', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      await waitFor(() => expect(result.current.loading).toBe(false))

      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.tickets).toEqual(mockTickets)
        expect(result.current.pagination).toEqual(mockPagination)
        expect(result.current.lastUpdated).toBe('2024-01-01T00:00:00.000Z')
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
      })
    })

    it('should set loading state during fetch', async () => {
      mockListAllSupportTickets.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { tickets: mockTickets },
          pagination: mockPagination,
          message: 'Success'
        }), 100))
      )

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })
    })

    it('should handle API success response', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Tickets fetched successfully'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.tickets).toHaveLength(2)
        expect(result.current.tickets[0].ticket_id).toBe('TKT-2024-001')
        expect(result.current.pagination).toEqual(mockPagination)
      })
    })

    it('should handle API error response', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: false,
        data: { tickets: [] },
        pagination: mockPagination,
        message: 'Failed to fetch tickets'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch tickets')
        expect(result.current.tickets).toEqual([])
      })
    })

    it('should handle network error', async () => {
      const mockError = new AxiosError('Network Error')
      mockListAllSupportTickets.mockRejectedValue(mockError)

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load support ticket data')
        expect(result.current.tickets).toEqual([])
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        mockError,
        { title: 'Failed to Load Support Tickets' }
      )
    })

    it('should handle invalid page number', async () => {
      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets(NaN, 10)

      await waitFor(() => {
        expect(result.current.error).toBe('Page number must be a valid number')
        expect(mockListAllSupportTickets).not.toHaveBeenCalled()
      })
    })

    it('should fetch with custom page and limit', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: { ...mockPagination, current_page: 3 },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets(3, 20)

      await waitFor(() => {
        expect(mockListAllSupportTickets).toHaveBeenCalledWith(3, 20)
        expect(result.current.pagination?.current_page).toBe(3)
      })
    })

    it('should clear error on successful fetch', async () => {
      mockListAllSupportTickets
        .mockResolvedValueOnce({
          success: false,
          data: { tickets: [] },
          pagination: mockPagination,
          message: 'Error occurred'
        })
        .mockResolvedValueOnce({
          success: true,
          data: { tickets: mockTickets },
          pagination: mockPagination,
          message: 'Success'
        })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      /* First fetch - should set error */
      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.error).toBe('Error occurred')
      })

      /* Second fetch - should clear error */
      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.error).toBe(null)
        expect(result.current.tickets).toEqual(mockTickets)
      })
    })
  })

  describe('fetchCategories Function', () => {
    it('should fetch categories successfully', async () => {
      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: mockCategories },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      await waitFor(() => expect(result.current.categoriesLoading).toBe(false))

      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories)
        expect(result.current.categoriesLoading).toBe(false)
        expect(result.current.categoriesError).toBe(null)
      })
    })

    it('should set loading state during categories fetch', async () => {
      mockListAllCategories.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { categories: mockCategories },
          message: 'Success'
        }), 100))
      )

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categoriesLoading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.categoriesLoading).toBe(false)
      }, { timeout: 2000 })
    })

    it('should handle categories API error response', async () => {
      mockListAllCategories.mockResolvedValue({
        success: false,
        data: { categories: [] },
        message: 'Failed to fetch categories'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categoriesError).toBe('Failed to fetch categories')
        expect(result.current.categories).toEqual([])
      })
    })

    it('should handle categories network error', async () => {
      const mockError = new AxiosError('Network Error')
      mockListAllCategories.mockRejectedValue(mockError)

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categoriesError).toBe('Failed to load ticket categories')
        expect(result.current.categories).toEqual([])
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        mockError,
        { title: 'Failed to Load Ticket Categories' }
      )
    })

    it('should clear categories error on successful fetch', async () => {
      mockListAllCategories
        .mockResolvedValueOnce({
          success: false,
          data: { categories: [] },
          message: 'Error occurred'
        })
        .mockResolvedValueOnce({
          success: true,
          data: { categories: mockCategories },
          message: 'Success'
        })

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      /* First fetch - should set error */
      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categoriesError).toBe('Error occurred')
      })

      /* Second fetch - should clear error */
      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categoriesError).toBe(null)
        expect(result.current.categories).toEqual(mockCategories)
      })
    })
  })

  describe('refetch Function', () => {
    it('should refetch tickets with current pagination', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ initialPage: 2, initialLimit: 15, autoFetch: false }))

      result.current.refetch()

      await waitFor(() => {
        expect(mockListAllSupportTickets).toHaveBeenCalledWith(2, 15)
      })
    })

    it('should update last updated timestamp on refetch', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.refetch()

      await waitFor(() => {
        expect(result.current.lastUpdated).toBe('2024-01-01T00:00:00.000Z')
      })
    })

    it('should maintain pagination after refetch', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      /* Fetch with page 3 */
      result.current.fetchTickets(3, 20)

      await waitFor(() => {
        expect(result.current.tickets).toHaveLength(2)
      })

      /* Refetch should use page 3 */
      result.current.refetch()

      await waitFor(() => {
        expect(mockListAllSupportTickets).toHaveBeenLastCalledWith(3, 20)
      })
    })
  })

  describe('categorySelectOptions', () => {
    it('should convert categories to select options', async () => {
      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: mockCategories },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categorySelectOptions).toEqual([
          { label: 'Login Issues', value: '1' },
          { label: 'Payment Issues', value: '2' }
        ])
      })
    })

    it('should return empty array when no categories', () => {
      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      expect(result.current.categorySelectOptions).toEqual([])
    })

    it('should update select options when categories change', async () => {
      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: mockCategories },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categorySelectOptions).toHaveLength(2)
      })

      /* Update with new categories */
      const newCategories = [mockCategories[0]]
      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: newCategories },
        message: 'Success'
      })

      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categorySelectOptions).toHaveLength(1)
      })
    })
  })

  describe('Auto-fetch Functionality', () => {
    it('should automatically fetch tickets when autoFetch is true', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useSupportTickets({ autoFetch: true }))

      await waitFor(() => {
        expect(mockListAllSupportTickets).toHaveBeenCalled()
      })
    })

    it('should not automatically fetch tickets when autoFetch is false', () => {
      renderHook(() => useSupportTickets({ autoFetch: false }))

      expect(mockListAllSupportTickets).not.toHaveBeenCalled()
    })

    it('should automatically fetch categories when autoFetchCategories is true', async () => {
      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: mockCategories },
        message: 'Success'
      })

      renderHook(() => useSupportTickets({ autoFetchCategories: true }))

      await waitFor(() => {
        expect(mockListAllCategories).toHaveBeenCalled()
      })
    })

    it('should not automatically fetch categories when autoFetchCategories is false', () => {
      renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      expect(mockListAllCategories).not.toHaveBeenCalled()
    })

    it('should auto-fetch both tickets and categories when both flags are true', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: mockCategories },
        message: 'Success'
      })

      renderHook(() => useSupportTickets({ autoFetch: true, autoFetchCategories: true }))

      await waitFor(() => {
        expect(mockListAllSupportTickets).toHaveBeenCalled()
        expect(mockListAllCategories).toHaveBeenCalled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty tickets array', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: [] },
        pagination: { ...mockPagination, total_count: 0 },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.tickets).toEqual([])
        expect(result.current.pagination?.total_count).toBe(0)
      })
    })

    it('should handle empty categories array', async () => {
      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: [] },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetchCategories: false }))

      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.categories).toEqual([])
        expect(result.current.categorySelectOptions).toEqual([])
      })
    })

    it('should handle empty pagination', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: {
          current_page: 0,
          total_pages: 0,
          total_count: 0,
          limit: 0,
          has_next_page: false,
          has_prev_page: false
        },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.tickets).toEqual(mockTickets)
        expect(result.current.pagination).toEqual({
          current_page: 0,
          total_pages: 0,
          total_count: 0,
          limit: 0,
          has_next_page: false,
          has_prev_page: false
        })
      })
    })

    it('should handle concurrent fetch requests', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      /* Trigger multiple fetches */
      result.current.fetchTickets()
      result.current.fetchTickets()
      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.tickets).toEqual(mockTickets)
      })

      expect(mockListAllSupportTickets).toHaveBeenCalledTimes(3)
    })

    it('should handle missing error message in API response', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: false,
        data: { tickets: [] },
        pagination: mockPagination,
        message: ''
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch support tickets')
      })
    })
  })

  describe('State Management', () => {
    it('should update current page after successful fetch', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: true,
        data: { tickets: mockTickets },
        pagination: { ...mockPagination, current_page: 5 },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false }))

      result.current.fetchTickets(5, 10)

      await waitFor(() => {
        expect(result.current.pagination?.current_page).toBe(5)
      })
    })

    it('should maintain separate loading states for tickets and categories', async () => {
      mockListAllSupportTickets.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { tickets: mockTickets },
          pagination: mockPagination,
          message: 'Success'
        }), 200))
      )

      mockListAllCategories.mockResolvedValue({
        success: true,
        data: { categories: mockCategories },
        message: 'Success'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false, autoFetchCategories: false }))

      result.current.fetchTickets()
      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
        expect(result.current.categoriesLoading).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 3000 })
    })

    it('should maintain separate error states for tickets and categories', async () => {
      mockListAllSupportTickets.mockResolvedValue({
        success: false,
        data: { tickets: [] },
        pagination: mockPagination,
        message: 'Tickets error'
      })

      mockListAllCategories.mockResolvedValue({
        success: false,
        data: { categories: [] },
        message: 'Categories error'
      })

      const { result } = renderHook(() => useSupportTickets({ autoFetch: false, autoFetchCategories: false }))

      result.current.fetchTickets()
      result.current.fetchCategories()

      await waitFor(() => {
        expect(result.current.error).toBe('Tickets error')
        expect(result.current.categoriesError).toBe('Categories error')
      })
    })
  })
})
