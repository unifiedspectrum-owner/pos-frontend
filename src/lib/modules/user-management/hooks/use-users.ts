/* Libraries imports */
import { useState, useEffect, useCallback } from 'react'

/* Shared module imports */
import { PaginationInfo } from '@shared/types'
import { handleApiError } from '@shared/utils'

/* User module imports */
import { userManagementService } from '@user-management/api'
import { UserAccountDetails } from '@user-management/types'
import { AxiosError } from 'axios'

/* Hook interface */
interface UseUsersParams {
  initialPage?: number
  initialLimit?: number
  autoFetch?: boolean
}

interface UseUsersReturn {
  users: UserAccountDetails[]
  loading: boolean
  error: string | null
  lastUpdated: string
  pagination?: PaginationInfo
  fetchUsers: (page?: number, limit?: number) => Promise<void>
  refetch: () => Promise<void>
}

/* Custom hook for fetching and managing users */
export const useUsers = (params: UseUsersParams = {}): UseUsersReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoFetch = true
  } = params

  /* Hook state */
  const [users, setUsers] = useState<UserAccountDetails[]>([])
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationInfo>()
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [currentLimit, setCurrentLimit] = useState<number>(initialLimit)

  /* Fetch users from API */
  const fetchUsers = useCallback(async (page: number = currentPage, limit: number = currentLimit) => {
    try {
      setLoading(true)
      setError(null)

      if (isNaN(page)) {
        const errorMsg = 'Page number must be a valid number'
        setError(errorMsg)
        console.error('[useUsers] Invalid page number:', page)
        return
      }

      console.log('[useUsers] Fetching users - page:', page, 'limit:', limit)

      const response = await userManagementService.listAllUsers(page, limit)

      console.log('[useUsers] Users API response:', response)

      if (response.success) {
        setUsers(response.data.users)
        setPagination(response.pagination)
        setLastUpdated(new Date().toLocaleString())
        setCurrentPage(page)
        setCurrentLimit(limit)
        console.log('[useUsers] Successfully fetched', response.data.users.length, 'users')
      } else {
        const errorMsg = response.message || 'Failed to fetch users'
        setError(errorMsg)
        console.error('[useUsers] API error:', errorMsg)
      }
    } catch (error: unknown) {
      const errorMsg = 'Failed to load user data'
      console.error('[useUsers] Fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Users'
      })
      setUsers([])
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentLimit])

  /* Refetch with current parameters */
  const refetch = useCallback(async () => {
    await fetchUsers(currentPage, currentLimit)
  }, [fetchUsers, currentPage, currentLimit])

  /* Auto-fetch on mount if enabled */
  useEffect(() => {
    if (autoFetch) {
      fetchUsers()
    }
  }, [fetchUsers, autoFetch])

  return {
    users,
    loading,
    error,
    lastUpdated,
    pagination,
    fetchUsers,
    refetch
  }
}