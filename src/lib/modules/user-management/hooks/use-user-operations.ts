/* Libraries imports */
import { useState, useCallback } from 'react'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* User module imports */
import { userManagementService } from '@user-management/api'
import { UserAccountDetails, UserAccountStatistics, UserPermissions, UserCreationApiRequest, UserUpdationApiRequest } from '@user-management/types'
import { AxiosError } from 'axios'

/* Hook interface */
interface UseUserOperationsReturn {
  /* Fetch operations */
  fetchUserDetails: (userId: string, basicOnly?: boolean) => Promise<boolean>
  userDetails: UserAccountDetails | null
  userStatistics: UserAccountStatistics | null
  permissions: UserPermissions[]
  isFetching: boolean
  fetchError: string | null
  /* Create operations */
  createUser: (userData: UserCreationApiRequest) => Promise<boolean>
  isCreating: boolean
  createError: string | null
  /* Update operations */
  updateUser: (userId: string, userData: UserUpdationApiRequest) => Promise<boolean>
  isUpdating: boolean
  updateError: string | null
  /* Delete operations */
  deleteUser: (userId: string, userName?: string) => Promise<boolean>
  isDeleting: boolean
  deleteError: string | null
}

/* Custom hook for user CRUD operations */
export const useUserOperations = (): UseUserOperationsReturn => {
  /* Hook state */
  const [userDetails, setUserDetails] = useState<UserAccountDetails | null>(null)
  const [userStatistics, setUserStatistics] = useState<UserAccountStatistics | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions[]>([])
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  /* Fetch user details operation - supports both full and basic details */
  const fetchUserDetails = useCallback(async (userId: string, basicOnly: boolean = false): Promise<boolean> => {
    try {
      setIsFetching(true)
      setFetchError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useUserOperations] Fetching user details:', userId, 'basicOnly:', basicOnly)

      if (basicOnly) {
        /* Call basic user details API */
        const response = await userManagementService.getUserBasicDetails(userId)

        /* Check if fetch was successful */
        if (response.success && response.data) {
          setUserDetails(response.data.user_details)
          /* Clear statistics and permissions for basic fetch */
          setUserStatistics(null)
          setPermissions([])

          console.log('[useUserOperations] Successfully fetched basic user details:', userId)
          return true
        } else {
          /* Handle API success=false case */
          const errorMsg = response.error || response.message || 'Failed to fetch user basic details'
          console.error('[useUserOperations] Basic fetch failed:', errorMsg)

          setFetchError(errorMsg)
          return false
        }
      } else {
        /* Call full user details API */
        const response = await userManagementService.getUserDetails(userId)

        /* Check if fetch was successful */
        if (response.success && response.data) {
          setUserDetails(response.data.user_details)
          setUserStatistics(response.data.user_statistics)
          setPermissions(response.data.permissions || [])

          console.log('[useUserOperations] Successfully fetched full user details:', userId)
          return true
        } else {
          /* Handle API success=false case */
          const errorMsg = response.error || response.message || 'Failed to fetch user details'
          console.error('[useUserOperations] Full fetch failed:', errorMsg)

          setFetchError(errorMsg)
          return false
        }
      }

    } catch (error: unknown) {
      const errorMsg = basicOnly ? 'Failed to fetch user basic details' : 'Failed to fetch user details'
      console.error('[useUserOperations] Fetch error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: basicOnly ? 'Failed to Fetch User Basic Details' : 'Failed to Fetch User Details'
      })

      setFetchError(errorMsg)
      return false

    } finally {
      setIsFetching(false)
    }
  }, [])

  /* Create new user operation */
  const createUser = useCallback(async (userData: UserCreationApiRequest): Promise<boolean> => {
    try {
      setIsCreating(true)
      setCreateError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useUserOperations] Creating new user:', userData)

      /* Call user creation API */
      const response = await userManagementService.createUser(userData)

      /* Check if creation was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'User Created Successfully',
          description: response.message || 'The user has been successfully created.'
        })

        console.log('[useUserOperations] Successfully created user')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to create user'
        console.error('[useUserOperations] Create failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Creation Failed',
          description: errorMsg
        })

        setCreateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to create user'
      console.error('[useUserOperations] Create error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Create User'
      })

      setCreateError(errorMsg)
      return false

    } finally {
      setIsCreating(false)
    }
  }, [])

  /* Update user operation */
  const updateUser = useCallback(async (userId: string, userData: UserUpdationApiRequest): Promise<boolean> => {
    try {
      setIsUpdating(true)
      setUpdateError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useUserOperations] Updating user:', userId, userData)

      /* Call user update API */
      const response = await userManagementService.updateUser(userId, userData)

      /* Check if update was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'User Updated Successfully',
          description: response.message || 'The user has been successfully updated.'
        })

        console.log('[useUserOperations] Successfully updated user')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to update user'
        console.error('[useUserOperations] Update failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Update Failed',
          description: errorMsg
        })

        setUpdateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to update user'
      console.error('[useUserOperations] Update error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Update User'
      })

      setUpdateError(errorMsg)
      return false

    } finally {
      setIsUpdating(false)
    }
  }, [])

  /* Delete user operation */
  const deleteUser = useCallback(async (userId: string, userName?: string): Promise<boolean> => {
    try {
      setIsDeleting(true)
      setDeleteError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useUserOperations] Deleting user:', userId)

      /* Call user deletion API */
      const response = await userManagementService.deleteUser(userId)

      /* Check if deletion was successful */
      if (response.success) {
        /* Success notification with cleanup details */
        createToastNotification({
          type: 'success',
          title: 'User Deleted Successfully',
          description: response.message || (userName
            ? `The user '${userName}' has been successfully deleted.`
            : 'The user has been successfully deleted.')
        })

        console.log('[useUserOperations] Successfully deleted user:', userId, 'Cleanup:', response.data?.cleanupSummary)
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to delete user'
        console.error('[useUserOperations] Delete failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Deletion Failed',
          description: errorMsg
        })

        setDeleteError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to delete user'
      console.error('[useUserOperations] Delete error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Delete User'
      })

      setDeleteError(errorMsg)
      return false

    } finally {
      setIsDeleting(false)
    }
  }, [])

  return {
    /* Fetch operations */
    fetchUserDetails,
    userDetails,
    userStatistics,
    permissions,
    isFetching,
    fetchError,
    /* Create operations */
    createUser,
    isCreating,
    createError,
    /* Update operations */
    updateUser,
    isUpdating,
    updateError,
    /* Delete operations */
    deleteUser,
    isDeleting,
    deleteError
  }
}