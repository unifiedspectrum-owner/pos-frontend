/* Libraries imports */
import { AxiosError } from 'axios'
import { useState, useEffect, useCallback, useMemo } from 'react'

/* Shared module imports */
import { PaginationInfo } from '@shared/types'
import { handleApiError } from '@shared/utils/api'

/* Support ticket module imports */
import { ticketsService, categoriesService } from '@support-ticket-management/api'
import { TicketListItem, TicketCategory } from '@support-ticket-management/types'

/* Hook interface */
interface UseSupportTicketsParams {
  initialPage?: number
  initialLimit?: number
  autoFetch?: boolean
  autoFetchCategories?: boolean
}

interface UseSupportTicketsReturn {
  tickets: TicketListItem[]
  categories: TicketCategory[]
  categorySelectOptions: Array<{ label: string; value: string }>
  loading: boolean
  categoriesLoading: boolean
  error: string | null
  categoriesError: string | null
  lastUpdated: string
  pagination?: PaginationInfo
  fetchTickets: (page?: number, limit?: number) => Promise<void>
  fetchCategories: () => Promise<void>
  refetch: () => Promise<void>
}

/* Custom hook for fetching and managing support tickets */
export const useSupportTickets = (params: UseSupportTicketsParams = {}): UseSupportTicketsReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoFetch = false,
    autoFetchCategories = false
  } = params

  /* Tickets state */
  const [tickets, setTickets] = useState<TicketListItem[]>([])
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationInfo>()
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [currentLimit, setCurrentLimit] = useState<number>(initialLimit)

  /* Categories state */
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(autoFetchCategories)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  /* Fetch paginated support tickets */
  const fetchTickets = useCallback(async (page: number = currentPage, limit: number = currentLimit) => {
    try {
      setLoading(true)
      setError(null)

      /* Validate page number */
      if (isNaN(page)) {
        const errorMsg = 'Page number must be a valid number'
        setError(errorMsg)
        console.error('[useSupportTickets] Invalid page number:', page)
        return
      }

      console.log('[useSupportTickets] Fetching support tickets - page:', page, 'limit:', limit)

      /* Call API */
      const response = await ticketsService.listAllSupportTickets(page, limit)

      console.log('[useSupportTickets] Support tickets API response:', response)

      /* Handle success */
      if (response.success) {
        setTickets(response.data.tickets)
        setPagination(response.pagination)
        setLastUpdated(new Date().toLocaleString())
        setCurrentPage(page)
        setCurrentLimit(limit)
        console.log('[useSupportTickets] Successfully fetched', response.data.tickets.length, 'support tickets')
      } else {
        /* Handle API error response */
        const errorMsg = response.message || 'Failed to fetch support tickets'
        setError(errorMsg)
        console.error('[useSupportTickets] API error:', errorMsg)
      }
    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to load support ticket data'
      console.error('[useSupportTickets] Fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Support Tickets'
      })
      setTickets([])
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentLimit])

  /* Fetch all ticket categories */
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      setCategoriesError(null)

      console.log('[useSupportTickets] Fetching ticket categories')

      /* Call API */
      const response = await categoriesService.listAllCategories()

      console.log('[useSupportTickets] Categories API response:', response)

      /* Handle success */
      if (response.success) {
        setCategories(response.data.categories)
        console.log('[useSupportTickets] Successfully fetched', response.data.categories.length, 'categories')
      } else {
        /* Handle API error response */
        const errorMsg = response.message || 'Failed to fetch ticket categories'
        setCategoriesError(errorMsg)
        console.error('[useSupportTickets] Categories API error:', errorMsg)
      }
    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to load ticket categories'
      console.error('[useSupportTickets] Categories fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Ticket Categories'
      })
      setCategories([])
      setCategoriesError(errorMsg)
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  /* Refetch tickets with current pagination */
  const refetch = useCallback(async () => {
    await fetchTickets(currentPage, currentLimit)
  }, [fetchTickets, currentPage, currentLimit])

  /* Convert categories to select options */
  const categorySelectOptions = useMemo(() => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id.toString()
    }))
  }, [categories])

  /* Auto-fetch tickets on mount */
  useEffect(() => {
    if (autoFetch) {
      fetchTickets()
    }
  }, [fetchTickets, autoFetch])

  /* Auto-fetch categories on mount */
  useEffect(() => {
    if (autoFetchCategories) {
      fetchCategories()
    }
  }, [fetchCategories, autoFetchCategories])

  return {
    /* Tickets data */
    tickets,
    loading,
    error,
    lastUpdated,
    pagination,

    /* Categories data */
    categories,
    categorySelectOptions,
    categoriesLoading,
    categoriesError,

    /* Actions */
    fetchTickets,
    fetchCategories,
    refetch
  }
}
