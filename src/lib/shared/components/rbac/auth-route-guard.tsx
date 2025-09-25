"use client"

/* Libraries imports */
import React, { useEffect } from 'react'

/* Shared module imports */
import { LoaderWrapper } from '@shared/components/common'

/* Auth management module imports */
import { useAuthGuard } from '@auth-management/hooks'

/* Auth route guard component props */
interface AuthRouteGuardProps {
  /* Child components to render if authenticated */
  children: React.ReactNode
  /* Whether to show loading state while checking auth */
  showLoader?: boolean
  /* Custom loading message */
  loadingMessage?: string
}

/* Route guard component that requires authentication */
const AuthRouteGuard: React.FC<AuthRouteGuardProps> = ({
  children,
  showLoader = true,
  loadingMessage = "Checking authentication..."
}) => {
  const { isAuthenticated, isCheckingAuth, requireAuth } = useAuthGuard()

  /* Redirect to login if not authenticated */
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      requireAuth()
    }
  }, [isCheckingAuth, isAuthenticated, requireAuth])

  /* Show loader while checking authentication */
  if (isCheckingAuth) {
    if (showLoader) {
      return (
        <LoaderWrapper
          isLoading={true}
          loadingText={loadingMessage}
          minHeight="100vh"
        >
          <></>
        </LoaderWrapper>
      )
    }
    return null
  }

  /* Don't render children if not authenticated */
  if (!isAuthenticated) {
    if (showLoader) {
      return (
        <LoaderWrapper
          isLoading={true}
          loadingText="Redirecting to login..."
          minHeight="100vh"
        >
          <></>
        </LoaderWrapper>
      )
    }
    return null
  }

  /* Render children for authenticated users */
  return <>{children}</>
}

export default AuthRouteGuard