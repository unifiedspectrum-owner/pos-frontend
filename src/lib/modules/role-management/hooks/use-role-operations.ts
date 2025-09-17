/* Libraries imports */
import { useState, useCallback } from 'react'

/* Shared module imports */
import { handleApiError } from '@shared/utils'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Role module imports */
import { roleManagementService } from '@role-management/api'
import { RoleCreationApiRequest } from '@role-management/types'
import { AxiosError } from 'axios'

/* Hook interface */
interface UseRoleOperationsReturn {
  /* Create operations */
  createRole: (roleData: RoleCreationApiRequest) => Promise<boolean>
  isCreating: boolean
  createError: string | null
  /* Delete operations */
  deleteRole: (roleId: string, roleName?: string) => Promise<boolean>
  isDeleting: boolean
  deleteError: string | null
}

/* Custom hook for role CRUD operations */
export const useRoleOperations = (): UseRoleOperationsReturn => {
  /* Hook state */
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  /* Create new role operation */
  const createRole = useCallback(async (roleData: RoleCreationApiRequest): Promise<boolean> => {
    try {
      setIsCreating(true)
      setCreateError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useRoleOperations] Creating new role:', roleData)

      /* Call role creation API */
      const response = await roleManagementService.createRole(roleData)

      /* Check if creation was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Role Created Successfully',
          description: response.message || 'The role has been successfully created.'
        })

        console.log('[useRoleOperations] Successfully created role')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to create role'
        console.error('[useRoleOperations] Create failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Creation Failed',
          description: errorMsg
        })

        setCreateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to create role'
      console.error('[useRoleOperations] Create error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Create Role'
      })

      setCreateError(errorMsg)
      return false

    } finally {
      setIsCreating(false)
    }
  }, [])

  /* Delete role operation */
  const deleteRole = useCallback(async (roleId: string, roleName?: string): Promise<boolean> => {
    try {
      setIsDeleting(true)
      setDeleteError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useRoleOperations] Deleting role:', roleId)

      /* Call role deletion API */
      const response = await roleManagementService.deleteRole(roleId)

      /* Check if deletion was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Role Deleted Successfully',
          description: response.message || (roleName
            ? `The role '${roleName}' has been successfully deleted.`
            : 'The role has been successfully deleted.')
        })

        console.log('[useRoleOperations] Successfully deleted role:', roleId)
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to delete role'
        console.error('[useRoleOperations] Delete failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Deletion Failed',
          description: errorMsg
        })

        setDeleteError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to delete role'
      console.error('[useRoleOperations] Delete error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Delete Role'
      })

      setDeleteError(errorMsg)
      return false

    } finally {
      setIsDeleting(false)
    }
  }, [])

  return {
    /* Create operations */
    createRole,
    isCreating,
    createError,
    /* Delete operations */
    deleteRole,
    isDeleting,
    deleteError
  }
}