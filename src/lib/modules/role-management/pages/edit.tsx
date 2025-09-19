"use client"

/* Libraries imports */
import React, { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui/notifications'

/* Role module imports */
import { CreateRoleFormData, createRoleSchema } from '@role-management/schemas'
import { useRoleOperations } from '@role-management/hooks'
import { ROLE_FORM_DEFAULT_VALUES, ROLE_PAGE_ROUTES, ROLE_FORM_MODES } from '@role-management/constants'
import { RoleFormLayout } from '@role-management/forms'
import { buildUpdateRolePayload, getChangedFields } from '@role-management/utils'

/* Component props interface */
interface EditRolePageProps {
  roleId: string
}

/* Role editing page with tab navigation */
const EditRolePage: React.FC<EditRolePageProps> = ({ roleId }) => {
  const router = useRouter()

  /* Local state for form tracking */
  const [originalData, setOriginalData] = useState<CreateRoleFormData | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  /* Role operations hooks */
  const { fetchRoleDetails, isFetching, fetchError, updateRole, isUpdating } = useRoleOperations()

  /* Form configuration with Zod validation schema */
  const methods = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: ROLE_FORM_DEFAULT_VALUES
  })

  /* Load role details function */
  const loadRoleDetails = useCallback(async () => {
    if (roleId) {
      const roleData = await fetchRoleDetails(roleId)
      if (roleData) {
        const { role, permissions } = roleData

        /* Transform permissions to module_assignments format */
        const moduleAssignments = permissions?.map(permission => ({
          module_id: permission.module_id.toString(),
          can_create: Boolean(permission.can_create),
          can_read: Boolean(permission.can_read),
          can_update: Boolean(permission.can_update),
          can_delete: Boolean(permission.can_delete)
        })) || []

        /* Prepare form data structure */
        const formData: CreateRoleFormData = {
          name: role.name,
          description: role.description,
          is_active: Boolean(role.is_active),
          module_assignments: moduleAssignments
        }

        /* Store original data for comparison */
        setOriginalData(formData)

        /* Populate form with fetched data */
        methods.reset(formData)
      }
      setInitialLoadComplete(true)
    }
  }, [roleId, fetchRoleDetails, methods])

  /* Fetch role details on component mount */
  useEffect(() => {
    loadRoleDetails()
  }, [loadRoleDetails])

  /* Handle form submission with change detection */
  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      /* Detect what fields have changed using utility function */
      const changedFields = getChangedFields(data, originalData)

      /* If no changes, show toast and return */
      if (!changedFields) {
        createToastNotification({
          type: 'warning',
          title: 'No Changes Detected',
          description: 'No modifications were made to the role data.'
        })
        return
      }

      /* Build payload using utility function with only changed fields */
      const payload = buildUpdateRolePayload(changedFields)

      console.log('Original data:', originalData)
      console.log('Current data:', data)
      console.log('Changed fields:', changedFields)
      console.log('Payload being sent:', payload)

      /* Call updateRole API with only changed fields */
      const success = await updateRole(roleId, payload)

      if (success) {
        router.push(ROLE_PAGE_ROUTES.HOME) /* Navigate to role list on success */
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  /* Navigate back to role management page */
  const handleCancel = () => {
    router.push(ROLE_PAGE_ROUTES.HOME)
  }

  /* Retry loading role details */
  const handleRetry = () => {
    setInitialLoadComplete(false)
    loadRoleDetails()
  }

  return (
    <RoleFormLayout
      mode={ROLE_FORM_MODES.EDIT}
      isLoading={isFetching && !initialLoadComplete}
      error={fetchError && initialLoadComplete ? fetchError : null}
      onRetry={handleRetry}
      methods={methods}
      onSubmit={onSubmit}
      onCancel={handleCancel}
      isSubmitting={isUpdating}
    />
  )
}

export default EditRolePage