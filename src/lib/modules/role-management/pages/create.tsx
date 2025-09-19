"use client"

/* Libraries imports */
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

/* Role module imports */
import { CreateRoleFormData, createRoleSchema } from '@role-management/schemas'
import { useRoleOperations } from '@role-management/hooks'
import { ROLE_FORM_DEFAULT_VALUES, ROLE_PAGE_ROUTES, ROLE_FORM_MODES } from '@role-management/constants'
import { RoleFormLayout } from '@role-management/forms'
import { buildCreateRolePayload } from '@role-management/utils'

/* Role creation page with tab navigation */
const CreateRolePage: React.FC = () => {
  const router = useRouter() /* Navigation handler */
  const { createRole, isCreating } = useRoleOperations() /* Role creation API hook */

  /* Form configuration with Zod validation schema */
  const methods = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: ROLE_FORM_DEFAULT_VALUES
  })

  /* Handle form submission with API call and navigation */
  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      /* Build payload using utility function */
      const payload = buildCreateRolePayload(data)

      console.log('Form data before submission:', data)
      console.log('Payload being sent:', payload)

      const success = await createRole(payload) /* Submit role creation request */

      if (success) {
        router.push(ROLE_PAGE_ROUTES.HOME) /* Navigate to role list on success */
      }
    } catch (error) {
      console.error('Error creating role:', error)
    }
  }

  /* Navigate back to role management page */
  const handleCancel = () => {
    router.push(ROLE_PAGE_ROUTES.HOME)
  }

  return (
    <RoleFormLayout
      mode={ROLE_FORM_MODES.CREATE}
      methods={methods}
      onSubmit={onSubmit}
      onCancel={handleCancel}
      isSubmitting={isCreating}
    />
  )
}

export default CreateRolePage