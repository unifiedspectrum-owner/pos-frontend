/* Libraries imports */
import { useState, useEffect, useCallback, useMemo } from 'react'

/* Shared module imports */
import { PaginationInfo } from '@shared/types'
import { handleApiError } from '@shared/utils'

/* Role module imports */
import { roleManagementService } from '@role-management/api'
import { Role } from '@role-management/types'
import { AxiosError } from 'axios'

/* Hook interface */
interface UseRolesParams {
  initialPage?: number
  initialLimit?: number
  autoFetch?: boolean
}

interface UseRolesReturn {
  roles: Role[]
  roleOptions: Array<{ label: string; value: string }>
  roleSelectOptions: Array<{ label: string; value: string }>
  loading: boolean
  error: string | null
  lastUpdated: string
  pagination?: PaginationInfo
  fetchRoles: (page?: number, limit?: number) => Promise<void>
  refetch: () => Promise<void>
}

/* Custom hook for fetching and managing roles */
export const useRoles = (params: UseRolesParams = {}): UseRolesReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoFetch = true
  } = params

  /* Hook state */
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationInfo>()
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [currentLimit, setCurrentLimit] = useState<number>(initialLimit)

  /* Fetch roles from API */
  const fetchRoles = useCallback(async (page: number = currentPage, limit: number = currentLimit) => {
    try {
      setLoading(true)
      setError(null)

      if (isNaN(page)) {
        const errorMsg = 'Page number must be a valid number'
        setError(errorMsg)
        console.error('[useRoles] Invalid page number:', page)
        return
      }

      console.log('[useRoles] Fetching roles - page:', page, 'limit:', limit)

      const response = await roleManagementService.listAllRoles(page, limit)

      console.log('[useRoles] Roles API response:', response)

      if (response.success) {
        setRoles(response.data.roles)
        setPagination(response.pagination)
        setLastUpdated(new Date().toLocaleString())
        setCurrentPage(page)
        setCurrentLimit(limit)
        console.log('[useRoles] Successfully fetched', response.data.roles.length, 'roles')
      } else {
        const errorMsg = response.message || 'Failed to fetch roles'
        setError(errorMsg)
        console.error('[useRoles] API error:', errorMsg)
      }
    } catch (error: unknown) {
      const errorMsg = 'Failed to load role data'
      console.error('[useRoles] Fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Roles'
      })
      setRoles([])
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentLimit])

  /* Refetch with current parameters */
  const refetch = useCallback(async () => {
    await fetchRoles(currentPage, currentLimit)
  }, [fetchRoles, currentPage, currentLimit])

  /* Transform roles to select options */
  const roleOptions = useMemo(() => {
    const options = [
      { label: 'All Roles', value: 'all' }
    ]

    if (roles.length > 0) {
      const roleSelectOptions = roles.map(role => ({
        label: role.display_name || role.name,
        value: role.code
      }))
      options.push(...roleSelectOptions)
    }

    return options
  }, [roles])

  /* Transform roles to select options for form fields */
  const roleSelectOptions = useMemo(() => {
    return roles.map(role => ({
      label: role.display_name || role.name,
      value: role.id.toString()
    }))
  }, [roles])

  /* Auto-fetch on mount if enabled */
  useEffect(() => {
    if (autoFetch) {
      fetchRoles()
    }
  }, [fetchRoles, autoFetch])

  return {
    roles,
    roleOptions,
    roleSelectOptions,
    loading,
    error,
    lastUpdated,
    pagination,
    fetchRoles,
    refetch
  }
}