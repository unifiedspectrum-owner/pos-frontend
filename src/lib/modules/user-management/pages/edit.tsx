"use client"

/* Libraries imports */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

/* Shared module imports */
import { parsePhoneFromAPI } from '@shared/utils/formatting/phone'
import { createToastNotification } from '@shared/utils/ui/notifications'

/* User module imports */
import { CreateUserFormData, createUserSchema } from '@user-management/schemas'
import { useUserOperations } from '@user-management/hooks'
import { USER_FORM_DEFAULT_VALUES, USER_PAGE_ROUTES } from '@user-management/constants'
import { UserFormLayout } from '@user-management/forms/create/components'
import { buildUpdateUserPayload, getChangedFields, mergeRoleAndUserPermissions, convertPermissionsToModuleAssignments } from '@user-management/utils'

/* Role module imports */
import { RolePermission } from '@role-management/types'
import { useRoles } from '@role-management/hooks'

/* Component props interface */
interface EditUserPageProps {
  userId: string
}

/* User edit page with shared components */
const EditUserPage: React.FC<EditUserPageProps> = ({ userId }) => {
  const router = useRouter()
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState<CreateUserFormData | null>(null)
  const [isFormReady, setIsFormReady] = useState(false)
  const { fetchUserDetails, userDetails, permissions, updateUser, isUpdating, isFetching } = useUserOperations()
  const { rolePermissions, fetchRolePermissions } = useRoles()

  /* Form configuration with Zod validation schema */
  const methods = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: USER_FORM_DEFAULT_VALUES
  })

  const { reset } = methods;

  const fetchUserData = useCallback(async () => {
    if (userId) {
      try {
        /* Reset error and form ready state before fetching */
        setFetchError(null)
        setIsFormReady(false)

        /* Fetch user details and role permissions in parallel */
        const [userSuccess] = await Promise.all([
          fetchUserDetails(userId, false),
          fetchRolePermissions()
        ])

        if (!userSuccess) {
          setFetchError('Failed to load user details')
        }
      } catch {
        setFetchError('An error occurred while loading user details')
      }
    }
  }, [fetchUserDetails, fetchRolePermissions, userId])

  /* Fetch user data and populate form */
  useEffect(() => {
    fetchUserData()
  }, [userId, fetchUserData])

  /* Populate form when user details, permissions, and role permissions are loaded */
  useEffect(() => {
    if (userDetails && rolePermissions.length > 0) {
      /* Parse phone number from API format */
      const parsedPhone = parsePhoneFromAPI(userDetails.phone)

      /* Merge role permissions with user permissions for display */
      /* If user has no custom permissions, still show role permissions */
      const moduleAssignments = mergeRoleAndUserPermissions(
        permissions,
        rolePermissions,
        userDetails.role_details?.id.toString(),
        userDetails.role_details?.id.toString() // original role ID (same as current for initial load)
      )

      /* Prepare form data */
      const formData: CreateUserFormData = {
        f_name: userDetails.f_name,
        l_name: userDetails.l_name,
        email: userDetails.email,
        phone: parsedPhone,
        role_id: userDetails.role_details?.id.toString() || '',
        is_active: Boolean(userDetails.is_active),
        module_assignments: moduleAssignments,
      }

      /* Store original data for comparison */
      setOriginalData(formData)

      /* Populate form with user data */
      reset(formData)

      /* Mark form as ready after data is populated */
      setIsFormReady(true)
    }
  }, [userDetails, permissions, rolePermissions, reset])


  /* Handle form submission with change detection */
  const onSubmit = async (data: CreateUserFormData, passedRolePermissions?: RolePermission[]) => {
    try {
      /* Detect what fields have changed using utility function */
      const changedFields = getChangedFields(data, originalData)

      /* If no changes, show toast and return */
      if (!changedFields) {
        createToastNotification({
          type: 'warning',
          title: 'No Changes Detected',
          description: 'No modifications were made to the user data.'
        })
        return
      }

      /* Use role permissions from hook (passed from UserFormLayout) or fallback to hook data */
      const currentRolePermissions = passedRolePermissions || rolePermissions

      /* Build payload using utility function with role permissions filtering */
      const payload = buildUpdateUserPayload(
        changedFields,
        currentRolePermissions,
        userDetails?.role_details?.id.toString()
      )

      console.log('Original data:', originalData)
      console.log('Current data:', data)
      console.log('Changed fields:', changedFields)
      console.log('Role permissions:', currentRolePermissions)
      console.log('Payload being sent:', payload)

      /* Call updateUser API with only changed fields */
      const success = await updateUser(userId, payload)

      if (success) {
        router.push(USER_PAGE_ROUTES.HOME)
      }

    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  /* Navigate back to user management page */
  const handleCancel = () => {
    router.push(USER_PAGE_ROUTES.HOME)
  }

  /* Memoize converted permissions to prevent infinite re-renders */
  const userPermissionsFromAPI = useMemo(() => {
    return convertPermissionsToModuleAssignments(permissions)
  }, [permissions])

  return (
    <UserFormLayout
      title="Edit User"
      isLoading={(isFetching && !fetchError) || !isFormReady}
      error={fetchError || (!isFetching && !userDetails ? 'User details not found' : null)}
      onRetry={fetchUserData}
      methods={methods}
      onSubmit={onSubmit}
      onCancel={handleCancel}
      isSubmitting={isUpdating}
      submitText="Update User"
      loadingText="Updating User..."
      userPermissionsFromAPI={userPermissionsFromAPI}
    />
  )
}

export default EditUserPage