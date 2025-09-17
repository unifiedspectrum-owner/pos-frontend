"use client"

/* Libraries imports */
import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

/* Shared module imports */
import { parsePhoneFromAPI } from '@shared/utils/formatting/phone'
import { createToastNotification } from '@shared/utils/ui/notifications'

/* User module imports */
import { UpdateUserFormData, updateUserSchema } from '@user-management/schemas'
import { useUserOperations } from '@user-management/hooks'
import { USER_FORM_DEFAULT_VALUES, USER_PAGE_ROUTES } from '@user-management/constants'
import { UserFormLayout, UserFormActions } from '@user-management/forms/create/components'
import { buildUpdateUserPayload, getChangedFields } from '@user-management/utils/form'

/* Component props interface */
interface EditUserPageProps {
  userId: string
}

/* User edit page with shared components */
const EditUserPage: React.FC<EditUserPageProps> = ({ userId }) => {
  const router = useRouter()
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState<UpdateUserFormData | null>(null)
  const [isFormReady, setIsFormReady] = useState(false)
  const { fetchUserDetails, userDetails, updateUser, isUpdating, isFetching } = useUserOperations()

  /* Form configuration with Zod validation schema */
  const methods = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: USER_FORM_DEFAULT_VALUES
  })

  const { handleSubmit, reset } = methods;

  const fetchUserData =useCallback(async () => {
    if (userId) {
      try {
        /* Reset error and form ready state before fetching */
        setFetchError(null)
        setIsFormReady(false)

        /* Fetch basic user details for editing */
        const success = await fetchUserDetails(userId, true)

        if (!success) {
          setFetchError('Failed to load user details')
        }
      } catch {
        setFetchError('An error occurred while loading user details')
      }
    }
  }, [fetchUserDetails, userId])

  /* Fetch user data and populate form */
  useEffect(() => {
    fetchUserData()
  }, [userId, fetchUserData])

  /* Populate form when user details are loaded */
  useEffect(() => {
    if (userDetails) {
      /* Parse phone number from API format */
      const parsedPhone = parsePhoneFromAPI(userDetails.phone)

      /* Prepare form data */
      const formData: UpdateUserFormData = {
        f_name: userDetails.f_name,
        l_name: userDetails.l_name,
        email: userDetails.email,
        phone: parsedPhone,
        role_id: userDetails.role_details?.id.toString() || '',
        is_active: Boolean(userDetails.is_active),
      }

      /* Store original data for comparison */
      setOriginalData(formData)

      /* Populate form with user data */
      reset(formData)

      /* Mark form as ready after data is populated */
      setIsFormReady(true)
    }
  }, [userDetails, reset])


  /* Handle form submission with change detection */
  const onSubmit = async (data: UpdateUserFormData) => {
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

      /* Build payload using utility function */
      const payload = buildUpdateUserPayload(changedFields)

      console.log('Original data:', originalData)
      console.log('Current data:', data)
      console.log('Changed fields:', changedFields)
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

  return (
    <UserFormLayout<UpdateUserFormData>
      title="Edit User"
      isLoading={(isFetching && !fetchError) || !isFormReady}
      error={fetchError || (!isFetching && !userDetails ? 'User details not found' : null)}
      onRetry={fetchUserData}
      methods={methods}
      actions={
        <UserFormActions
          onCancel={handleCancel}
          onSubmit={handleSubmit(onSubmit)}
          loading={isUpdating}
          submitText="Update User"
          loadingText="Updating User..."
        />
      }
    />
  )
}

export default EditUserPage