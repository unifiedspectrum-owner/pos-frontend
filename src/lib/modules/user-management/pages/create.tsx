"use client"

/* Libraries imports */
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

/* User module imports */
import { CreateUserFormData, createUserSchema } from '@user-management/schemas'
import { useUserOperations } from '@user-management/hooks'
import { USER_FORM_DEFAULT_VALUES, USER_PAGE_ROUTES } from '@user-management/constants'
import { UserFormLayout } from '@user-management/forms'
import { buildCreateUserPayload } from '@user-management/utils'

/* Role module imports */
import { RolePermission } from '@role-management/types'

/* User creation page with shared components */
const CreateUserPage: React.FC = () => {
  const router = useRouter() /* Navigation handler */
  const { createUser, isCreating } = useUserOperations() /* User creation API hook */

  /* Form configuration with Zod validation schema */
  const methods = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: USER_FORM_DEFAULT_VALUES
  })

  /* Handle form submission with API call and navigation */
  const onSubmit = async (data: CreateUserFormData, rolePermissions?: RolePermission[]) => {
    try {
      /* Build payload using utility function with role permissions filtering */
      const payload = buildCreateUserPayload(data, rolePermissions)

      console.log('Form data before submission:', data)
      console.log('Role permissions:', rolePermissions)
      console.log('Payload being sent:', payload)

      const success = await createUser(payload) /* Submit user creation request */

      if (success) {
        // router.push(USER_PAGE_ROUTES.HOME) /* Navigate to user list on success */
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  /* Navigate back to user management page */
  const handleCancel = () => {
    router.push(USER_PAGE_ROUTES.HOME)
  }

  return (
    <UserFormLayout
      title="Create New User"
      methods={methods}
      onSubmit={onSubmit}
      onCancel={handleCancel}
      isSubmitting={isCreating}
    />
  )
}

export default CreateUserPage