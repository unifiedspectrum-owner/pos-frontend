"use client"

/* Libraries imports */
import React, { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

/* Role module imports */
import { CreateRoleFormData } from '@role-management/schemas'
import { useRoleOperations } from '@role-management/hooks'
import { ROLE_FORM_DEFAULT_VALUES, ROLE_PAGE_ROUTES, ROLE_FORM_MODES } from '@role-management/constants'
import { RoleFormLayout } from '@role-management/forms/create/components'

/* Component props interface */
interface ViewRolePageProps {
  roleId: string
}

/* Role viewing page with readonly fields */
const ViewRolePage: React.FC<ViewRolePageProps> = ({ roleId }) => {
  const router = useRouter()

  /* Local state for loading tracking */
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  /* Role operations hooks */
  const { fetchRoleDetails, isFetching, fetchError } = useRoleOperations()

  /* Form configuration without validation for view mode */
  const methods = useForm<CreateRoleFormData>({
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
          code: role.code,
          display_name: role.display_name,
          description: role.description,
          is_active: Boolean(role.is_active),
          module_assignments: moduleAssignments
        }

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

  /* Navigate back to role management page */
  const handleCancel = () => {
    router.push(ROLE_PAGE_ROUTES.HOME)
  }

  /* No-op function for view mode - no form submission */
  const onSubmit = () => {
    /* View mode - no submission needed */
  }

  /* Retry loading role details */
  const handleRetry = () => {
    setInitialLoadComplete(false)
    loadRoleDetails()
  }

  return (
    <RoleFormLayout
      mode={ROLE_FORM_MODES.VIEW}
      isLoading={isFetching && !initialLoadComplete}
      error={fetchError && initialLoadComplete ? fetchError : null}
      onRetry={handleRetry}
      methods={methods}
      onSubmit={onSubmit}
      onCancel={handleCancel}
      isSubmitting={false}
    />
  )
}

export default ViewRolePage