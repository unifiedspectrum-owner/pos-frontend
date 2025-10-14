/* Libraries imports */
import { AxiosError } from 'axios'
import { useState, useEffect, useCallback, useMemo } from 'react'

/* Shared module imports */
import { PaginationInfo } from '@shared/types'
import { handleApiError } from '@shared/utils/api'

/* Role module imports */
import { roleManagementService } from '@role-management/api'
import { Role, RolePermission } from '@role-management/types'
import { getCurrentISOString } from "@shared/utils";

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
  rolePermissions: RolePermission[]
  loading: boolean
  permissionsLoading: boolean
  error: string | null
  permissionsError: string | null
  lastUpdated: string
  pagination?: PaginationInfo
  fetchRoles: (page?: number, limit?: number) => Promise<void>
  fetchRolePermissions: () => Promise<void>
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
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionsError, setPermissionsError] = useState<string | null>(null)
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
        setLastUpdated(getCurrentISOString())
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

  /* Fetch role permissions from API */
  const fetchRolePermissions = useCallback(async () => {
    try {
      setPermissionsLoading(true)
      setPermissionsError(null)

      console.log('[useRoles] Fetching all role permissions')

      const response = await roleManagementService.listAllRolePermissions()

      console.log('[useRoles] Role permissions API response:', response)

      if (response.success) {
        setRolePermissions(response.data.permissions)
        console.log('[useRoles] Successfully fetched', response.data.permissions.length, 'role permissions')
      } else {
        const errorMsg = response.message || 'Failed to fetch role permissions'
        setPermissionsError(errorMsg)
        console.error('[useRoles] Role permissions API error:', errorMsg)
      }
    } catch (error: unknown) {
      const errorMsg = 'Failed to load role permissions data'
      console.error('[useRoles] Role permissions fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Role Permissions'
      })
      setRolePermissions([])
      setPermissionsError(errorMsg)
    } finally {
      setPermissionsLoading(false)
    }
  }, [])

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
        label: role.name,
        value: role.id.toString()
      }))
      options.push(...roleSelectOptions)
    }

    return options
  }, [roles])

  /* Transform roles to select options for form fields */
  const roleSelectOptions = useMemo(() => {
    return roles.map(role => ({
      label: role.name,
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
    rolePermissions,
    loading,
    permissionsLoading,
    error,
    permissionsError,
    lastUpdated,
    pagination,
    fetchRoles,
    fetchRolePermissions,
    refetch
  }
}