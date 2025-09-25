"use client"

/* Libraries imports */
import React, { useEffect } from 'react'

/* Shared module imports */
import { LoaderWrapper } from '@shared/components/common'

/* Auth management module imports */
import { LoginForm } from '@auth-management/forms'
import { AuthLayout } from '@auth-management/components/layout'
import { useAuthGuard } from '@auth-management/hooks'

/* Login page component */
const LoginPage: React.FC = () => {
  const { isAuthenticated, isCheckingAuth, requireGuest } = useAuthGuard()

  /* Redirect if already authenticated */
  useEffect(() => {
    if (!isCheckingAuth) {
      requireGuest()
    }
  }, [isCheckingAuth, requireGuest])

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

  /* Don't render login form if user is already authenticated */
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

  /* Render login form for unauthenticated users */
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage