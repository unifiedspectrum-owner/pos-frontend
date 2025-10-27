"use client"

/* Libraries imports */
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/* Shared module imports */
import { LoaderWrapper } from '@shared/components/common'
import { ADMIN_PAGE_ROUTES } from '@shared/constants'

/* Auth management module imports */
import { Verify2FAForm } from '@auth-management/forms'
import { AuthLayout } from '@auth-management/components'
import { useAuthGuard } from '@auth-management/hooks'
import { AUTH_STORAGE_KEYS, AUTH_PAGE_ROUTES } from '@auth-management/constants'

/* 2FA verification page component */
const Verify2FAPage: React.FC = () => {
  const router = useRouter()
  const { isAuthenticated, isCheckingAuth } = useAuthGuard()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  /* Get user email and ID from localStorage */
  useEffect(() => {
    const emailFromStorage = localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)
    const userIdFromStorage = localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)

    if (emailFromStorage && userIdFromStorage) {
      setUserEmail(emailFromStorage)
      setUserId(userIdFromStorage)
    } else {
      /* If no data found, redirect to login */
      router.push(AUTH_PAGE_ROUTES.LOGIN)
    }
  }, [router])

  /* Redirect if already authenticated */
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      router.push(ADMIN_PAGE_ROUTES.DASHBOARD.HOME)
    }
  }, [isCheckingAuth, isAuthenticated, router])

  /* Show loader while checking authentication */
  if (isCheckingAuth) {
    return (
      <AuthLayout>
        <LoaderWrapper
          isLoading={true}
          loadingText="Checking authentication..."
          minHeight="400px"
        >
          <></>
        </LoaderWrapper>
      </AuthLayout>
    )
  }

  /* Don't render if user is already authenticated */
  if (isAuthenticated) {
    return (
      <AuthLayout>
        <LoaderWrapper
          isLoading={true}
          loadingText="Redirecting..."
          minHeight="400px"
        >
          <></>
        </LoaderWrapper>
      </AuthLayout>
    )
  }

  /* Don't render form until we have the required data */
  if (!userEmail || !userId) {
    return (
      <AuthLayout>
        <LoaderWrapper
          isLoading={true}
          loadingText="Loading verification data..."
          minHeight="400px"
        >
          <></>
        </LoaderWrapper>
      </AuthLayout>
    )
  }

  /* Render 2FA verification form */
  return (
    <AuthLayout>
      <Verify2FAForm userEmail={userEmail} userId={userId} />
    </AuthLayout>
  )
}

export default Verify2FAPage