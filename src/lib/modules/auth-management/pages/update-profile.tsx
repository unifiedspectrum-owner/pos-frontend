"use client"

/* Libraries imports */
import React, { useCallback, useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Flex, Heading } from '@chakra-ui/react'

/* Shared module imports */
import { LoaderWrapper, ErrorMessageContainer } from '@shared/components/common'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { AUTH_STORAGE_KEYS } from '@auth-management/constants'
import { parsePhoneFromAPI, formatPhoneForAPI } from '@shared/utils/formatting'
import { DEFAULT_DIAL_CODE } from '@shared/constants'

/* Auth module imports */
import { UpdateProfileFormData, updateProfileSchema } from '@auth-management/schemas'
import { UpdateProfileForm, TwoFactorForm } from '@auth-management/forms'
import { AUTH_PAGE_ROUTES } from '@auth-management/constants'

/* User module imports */
import { useUserOperations } from '@user-management/hooks'
import { UserUpdationApiRequest } from '@user-management/types'
import { UserDetailsCache } from '../types'

/* User profile update page */
const UpdateProfilePage: React.FC = () => {
  const router = useRouter()

  /* User operations hook */
  const {
    fetchUserDetails, userDetails, isFetching, fetchError,
    updateUser, isUpdating
  } = useUserOperations()

  /* Local state */
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  /* Form configuration with Zod validation schema */
  const methods = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      f_name: '',
      l_name: '',
      email: '',
      phone: [DEFAULT_DIAL_CODE, ''],
    }
  })

  /* Load current user profile data */
  const loadUserProfile = useCallback(async () => {
    try {
      /* Get current user ID from localStorage */
      const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER)
      if (!userData) {
        router.push(AUTH_PAGE_ROUTES.LOGIN)
        return
      }

      const user: UserDetailsCache = JSON.parse(userData)
      const userId = user.id?.toString()

      if (!userId) {
        router.push(AUTH_PAGE_ROUTES.LOGIN)
        return
      }

      setCurrentUserId(userId)

      /* Fetch user details using the hook */
      console.log('[UpdateProfilePage] Fetching user profile for ID:', userId)
      const success = await fetchUserDetails(userId, true) /* basicOnly = true */

      if (!success) {
        console.error('[UpdateProfilePage] Failed to fetch user details')
      }
    } catch (err) {
      console.error('[UpdateProfilePage] Error loading user profile:', err)
    }
  }, [fetchUserDetails, router])

  /* Load profile data on component mount */
  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  /* Populate form when user details are loaded */
  useEffect(() => {
    if (userDetails) {
      /* Convert phone string to [dialCode, number] format using shared utility */
      const phoneArray = parsePhoneFromAPI(userDetails.phone || '')

      /* Populate form with user data */
      methods.reset({
        f_name: userDetails.f_name || '',
        l_name: userDetails.l_name || '',
        email: userDetails.email || '',
        phone: phoneArray,
      })

      console.log('[UpdateProfilePage] Form populated with user details:', userDetails)
    }
  }, [userDetails, methods])

  /* Handle profile update submission */
  const handleSubmit = async (data: UpdateProfileFormData) => {
    if (!currentUserId) {
      createToastNotification({
        type: 'error',
        title: 'Update Failed',
        description: 'User ID not found. Please log in again.'
      })
      return
    }

    console.log('[UpdateProfilePage] Updating profile with data:', data)

    /* Convert phone array back to string format for API using shared utility */
    const phoneString = formatPhoneForAPI(data.phone || ['', ''])

    /* Prepare update payload */
    const updatePayload: UserUpdationApiRequest = {
      f_name: data.f_name,
      l_name: data.l_name,
      email: data.email,
      phone: phoneString || undefined,
    }

    /* Call update user API through hook */
    const success = await updateUser(currentUserId, updatePayload)

    if (success) {
      /* Reload profile data to reflect changes */
      await loadUserProfile()
    }
  }

  /* Handle form cancellation */
  const handleCancel = () => {
    /* Reset form to original values */
    if (userDetails) {
      /* Convert phone string to [dialCode, number] format using shared utility */
      const phoneArray = parsePhoneFromAPI(userDetails.phone || '')

      methods.reset({
        f_name: userDetails.f_name || '',
        l_name: userDetails.l_name || '',
        email: userDetails.email || '',
        phone: phoneArray,
      })
    }

    /* Show cancellation notification */
    createToastNotification({
      type: 'warning',
      title: 'Changes Cancelled',
      description: 'Your changes have been discarded.'
    })
  }

  /* Error state display */
  if (fetchError) {
    return (
      <ErrorMessageContainer
        error={fetchError}
        onRetry={loadUserProfile}
      />
    )
  }

  return (
    <FormProvider {...methods}>
      <Flex w="100%" flexDir="column">
        {/* Responsive main container */}
        <Flex flexDir="column" p={6} maxW="1200px" mx="auto" w="full" gap={4}>
          {/* Page header section */}
          <Heading as="h1" fontWeight="700" mb={0}>
            My Profile
          </Heading>

          <LoaderWrapper
            isLoading={isFetching}
            loadingText="Loading profile..."
            minHeight="400px"
          >
            {/* Profile update form */}
            <UpdateProfileForm
              onSubmit={methods.handleSubmit(handleSubmit)}
              onCancel={handleCancel}
              isSubmitting={isUpdating}
            />
          </LoaderWrapper>

          <TwoFactorForm
            isEnabled={Boolean(userDetails?.is_2fa_enabled)}
            onRefresh={loadUserProfile}
            userId={currentUserId || undefined}
          />
        </Flex>
      </Flex>
    </FormProvider>
  )
}

export default UpdateProfilePage