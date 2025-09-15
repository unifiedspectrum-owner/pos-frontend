/* Libraries imports */
import { useState, useEffect, useCallback, useMemo } from 'react'

/* Shared module imports */
import { handleApiError } from '@shared/utils'

/* User module imports */
import { roleManagementService } from '@user-management/api'
import { Role } from '@user-management/types/roles'
import { AxiosError } from 'axios'

/* Hook interface */
interface UseRolesReturn {
  roles: Role[]
  roleOptions: Array<{ label: string; value: string }>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/* Custom hook for fetching and managing roles */
export const useRoles = (): UseRolesReturn => {
  /* Hook state */
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /* Fetch roles from API */
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[useRoles] Starting to fetch roles...')

      const response = await roleManagementService.listAllRoles() /* Fetch all roles */

      console.log('[useRoles] Roles API response:', response)

      if (response.success && response.data?.roles) {
        setRoles(response.data.roles)
        console.log('[useRoles] Successfully loaded', response.data.roles.length, 'roles')
      } else {
        const errorMsg = response.message || 'Failed to fetch roles'
        setError(errorMsg)
        console.warn('[useRoles] Roles API returned unsuccessful response:', response)
      }
    } catch (error: unknown) {
      const errorMsg = 'Failed to load roles'
      console.error('[useRoles] Fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Roles'
      })
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  /* Refetch function for manual refresh */
  const refetch = useCallback(async () => {
    await fetchRoles()
  }, [fetchRoles])

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

  /* Load roles on hook mount */
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return {
    roles,
    roleOptions,
    loading,
    error,
    refetch
  }
}