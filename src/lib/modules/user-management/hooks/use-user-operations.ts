/* Libraries imports */
import { useState, useCallback } from 'react'

/* Shared module imports */
import { handleApiError } from '@shared/utils'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* User module imports */
import { userManagementService } from '@user-management/api'
import { AxiosError } from 'axios'

/* Hook interface */
interface UseUserOperationsReturn {
  /* Delete operations */
  deleteUser: (userId: string, userName?: string) => Promise<boolean>
  isDeleting: boolean
  deleteError: string | null
}

/* Custom hook for user CRUD operations */
export const useUserOperations = (): UseUserOperationsReturn => {
  /* Hook state */
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
      await userManagementService.deleteUser(userId)

      /* Success notification */
      createToastNotification({
        type: 'success',
        title: 'User Deleted',
        description: userName
          ? `The user '${userName}' has been successfully deleted.`
          : 'The user has been successfully deleted.'
      })

      console.log('[useUserOperations] Successfully deleted user:', userId)
      return true

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
    /* Delete operations */
    deleteUser,
    isDeleting,
    deleteError
  }
}