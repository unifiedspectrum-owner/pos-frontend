"use client"

/* Libraries imports */
import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'

/* Auth management module imports */
import { AUTH_PAGE_ROUTES, AUTH_STORAGE_KEYS } from '@auth-management/constants'
import { ADMIN_PAGE_ROUTES } from '@shared/constants'

/* Authentication guard hook interface */
interface UseAuthGuardReturn {
  /* Whether the user is authenticated */
  isAuthenticated: boolean
  /* Whether authentication check is in progress */
  isCheckingAuth: boolean
  /* Redirect to login if not authenticated */
  requireAuth: () => void
  /* Redirect to dashboard if already authenticated */
  requireGuest: () => void
}

/* Custom hook for authentication guards and redirects */
export const useAuthGuard = (): UseAuthGuardReturn => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true)

  /* Check authentication status from localStorage */
  const checkAuthStatus = () => {
    try {
      const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      const loggedIn = localStorage.getItem(AUTH_STORAGE_KEYS.LOGGED_IN)

      const authenticated = !!(accessToken && loggedIn === 'true')
      setIsAuthenticated(authenticated)

      console.log('[useAuthGuard] Authentication status checked:', {
        hasToken: !!accessToken,
        loggedIn: loggedIn === 'true',
        authenticated
      })

      return authenticated
    } catch (error) {
      console.error('[useAuthGuard] Error checking auth status:', error)
      setIsAuthenticated(false)
      return false
    } finally {
      setIsCheckingAuth(false)
    }
  }

  /* Listen for auth state changes */
  useEffect(() => {
    /* Initial check */
    checkAuthStatus()

    /* Listen for auth state changes */
    const handleAuthStateChange = () => {
      console.log('[useAuthGuard] Auth state change detected')
      checkAuthStatus()
    }

    /* Listen for storage changes (for cross-tab sync) */
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEYS.ACCESS_TOKEN || e.key === AUTH_STORAGE_KEYS.LOGGED_IN) {
        console.log('[useAuthGuard] Storage change detected:', e.key)
        checkAuthStatus()
      }
    }

    /* Add event listeners */
    window.addEventListener('authStateChanged', handleAuthStateChange)
    window.addEventListener('storage', handleStorageChange)

    /* Cleanup */
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  /* Require authentication - redirect to login if not authenticated */
  const requireAuth = () => {
    const authenticated = checkAuthStatus()
    if (!authenticated) {
      console.log('[useAuthGuard] User not authenticated, redirecting to login')
      router.push(AUTH_PAGE_ROUTES.LOGIN)
    }
  }

  /* Require guest - redirect to dashboard if already authenticated */
  const requireGuest = () => {
    const authenticated = checkAuthStatus()
    if (authenticated) {
      console.log('[useAuthGuard] User already authenticated, redirecting to dashboard')
      /* Redirect to admin dashboard or home page */
      router.push(ADMIN_PAGE_ROUTES.DASHBOARD.HOME) /* Adjust this route as needed */
    }
  }

  return {
    isAuthenticated,
    isCheckingAuth,
    requireAuth,
    requireGuest
  }
}