/* Libraries imports */
import { useState, useEffect, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { PaginationInfo } from '@shared/types'
import { handleApiError } from '@shared/utils/api'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Tenant management module imports */
import { tenantManagementService } from '@tenant-management/api'
import { TenantWithPlanDetails } from '@tenant-management/types/account/list'

/* Hook interface */
interface UseTenantsParams {
  initialPage?: number
  initialLimit?: number
  autoFetch?: boolean
}

interface UseTenantsReturn {
  tenants: TenantWithPlanDetails[]
  loading: boolean
  error: string | null
  lastUpdated: string
  pagination?: PaginationInfo
  fetchTenants: (page?: number, limit?: number) => Promise<void>
  refetch: () => Promise<void>
}

/* Custom hook for fetching and managing tenants */
export const useTenants = (params: UseTenantsParams = {}): UseTenantsReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoFetch = true
  } = params

  /* Hook state */
  const [tenants, setTenants] = useState<TenantWithPlanDetails[]>([])
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationInfo>()
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [currentLimit, setCurrentLimit] = useState<number>(initialLimit)

  /* Fetch tenants from API */
  const fetchTenants = useCallback(async (page: number = currentPage, limit: number = currentLimit) => {
    try {
      setLoading(true)
      setError(null)

      if (isNaN(page)) {
        const errorMsg = 'Page number must be a valid number'
        setError(errorMsg)
        console.error('[useTenants] Invalid page number:', page)
        return
      }

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTenants] Fetching tenants - page:', page, 'limit:', limit)

      /* API call with pagination */
      const response = await tenantManagementService.listAllTenants(page, limit)

      console.log('[useTenants] Tenants API response:', response)

      /* Handle response */
      if (response.success) {
        setTenants(response.tenants)
        setPagination(response.pagination)
        setLastUpdated(new Date().toLocaleString())
        setCurrentPage(page)
        setCurrentLimit(limit)
        console.log('[useTenants] Successfully fetched', response.tenants.length, 'tenants')
      } else {
        /* Handle API error response */
        const errorMsg = response.message || 'Failed to fetch tenants'
        setError(errorMsg)
        console.error('[useTenants] API error:', errorMsg)
      }
    } catch (error: unknown) {
      const errorMsg = 'Failed to load tenant data'
      console.error('[useTenants] Fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Tenants'
      })
      setTenants([])
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentLimit])

  /* Refetch with current parameters */
  const refetch = useCallback(async () => {
    await fetchTenants(currentPage, currentLimit)
  }, [fetchTenants, currentPage, currentLimit])

  /* Auto-fetch on mount if enabled */
  useEffect(() => {
    if (autoFetch) {
      fetchTenants()
    }
  }, [fetchTenants, autoFetch])

  return {
    tenants,
    loading,
    error,
    lastUpdated,
    pagination,
    fetchTenants,
    refetch
  }
}