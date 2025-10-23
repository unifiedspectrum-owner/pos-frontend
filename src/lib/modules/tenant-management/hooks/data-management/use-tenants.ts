"use client"

/* Libraries imports */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { PaginationInfo } from '@shared/types'
import { handleApiError } from '@shared/utils/api'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Tenant management module imports */
import { tenantService } from '@tenant-management/api'
import { TenantBasicDetails, TenantWithPlanDetails } from '@tenant-management/types'

/* Hook interface */
interface UseTenantsParams {
  initialPage?: number
  initialLimit?: number
  autoFetch?: boolean
  autoFetchBaseDetails?: boolean
}

interface UseTenantsReturn {
  tenants: TenantWithPlanDetails[]
  baseDetailsTenants: TenantBasicDetails[]
  tenantSelectOptions: Array<{ label: string; value: string }>
  loading: boolean
  baseDetailsLoading: boolean
  error: string | null
  baseDetailsError: string | null
  lastUpdated: string
  pagination?: PaginationInfo
  fetchTenants: (page?: number, limit?: number) => Promise<void>
  fetchTenantsWithBaseDetails: () => Promise<void>
  refetch: () => Promise<void>
}

/* Custom hook for fetching and managing tenants */
export const useTenants = (params: UseTenantsParams = {}): UseTenantsReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoFetch = false,
    autoFetchBaseDetails = false
  } = params

  /* Paginated tenants state */
  const [tenants, setTenants] = useState<TenantWithPlanDetails[]>([])
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationInfo>()
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [currentLimit, setCurrentLimit] = useState<number>(initialLimit)

  /* Base details tenants state */
  const [baseDetailsTenants, setBaseDetailsTenants] = useState<TenantBasicDetails[]>([])
  const [baseDetailsLoading, setBaseDetailsLoading] = useState<boolean>(autoFetchBaseDetails)
  const [baseDetailsError, setBaseDetailsError] = useState<string | null>(null)

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
      const response = await tenantService.listAllTenants(page, limit)

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

  /* Fetch tenants with base details */
  const fetchTenantsWithBaseDetails = useCallback(async () => {
    try {
      setBaseDetailsLoading(true)
      setBaseDetailsError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTenants] Fetching tenants with base details')

      /* Call API */
      const response = await tenantService.listAllTenantsWithBaseDetails()

      console.log('[useTenants] Base details API response:', response)

      /* Handle success */
      if (response.success) {
        setBaseDetailsTenants(response.data.tenants)
        console.log('[useTenants] Successfully fetched', response.data.tenants.length, 'tenants with base details')
      } else {
        /* Handle API error response */
        const errorMsg = response.message || 'Failed to fetch tenants with base details'
        setBaseDetailsError(errorMsg)
        console.error('[useTenants] Base details API error:', errorMsg)
      }
    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to load tenants with base details'
      console.error('[useTenants] Base details fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Tenants'
      })
      setBaseDetailsTenants([])
      setBaseDetailsError(errorMsg)
    } finally {
      setBaseDetailsLoading(false)
    }
  }, [])

  /* Refetch with current parameters */
  const refetch = useCallback(async () => {
    await fetchTenants(currentPage, currentLimit)
  }, [fetchTenants, currentPage, currentLimit])

  /* Convert tenants to select options */
  const tenantSelectOptions = useMemo(() => {
    return baseDetailsTenants.map((tenant) => ({
      label: tenant.organization_name,
      value: tenant.tenant_id
    }))
  }, [baseDetailsTenants])

  /* Auto-fetch paginated tenants on mount */
  useEffect(() => {
    if (autoFetch) {
      fetchTenants()
    }
  }, [fetchTenants, autoFetch])

  /* Auto-fetch base details tenants on mount */
  useEffect(() => {
    if (autoFetchBaseDetails) {
      fetchTenantsWithBaseDetails()
    }
  }, [fetchTenantsWithBaseDetails, autoFetchBaseDetails])

  return {
    /* Paginated tenants data */
    tenants,
    loading,
    error,
    lastUpdated,
    pagination,

    /* Base details tenants data */
    baseDetailsTenants,
    tenantSelectOptions,
    baseDetailsLoading,
    baseDetailsError,

    /* Actions */
    fetchTenants,
    fetchTenantsWithBaseDetails,
    refetch
  }
}