/* External library imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { csrfApiService } from '@shared/api'
import { handleApiError } from '@shared/utils'

/* Hook options interface */
export interface UseCsrfTokenOptions {
  showErrorToast?: boolean
}

/* Hook return interface */
export interface UseCsrfTokenReturn {
  csrfToken: string | null
  isLoading: boolean
  error: string | null
  fetchCsrfToken: () => Promise<string | null>
  clearCsrfToken: () => void
}

/* Custom hook for fetching and managing CSRF token */
export const useCsrfToken = (options: UseCsrfTokenOptions = {}): UseCsrfTokenReturn => {
  const { showErrorToast = true } = options

  /* State management */
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Fetch CSRF token function */
  const fetchCsrfToken = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true)
      setError(null)

      /* Fetch from API */
      const response = await csrfApiService.getCsrfToken()

      if (response.success && response.data?.csrfToken) {
        const token = response.data.csrfToken
        setCsrfToken(token)
        console.log('CSRF token fetched successfully')
        return token
      } else {
        const errorMsg = response.message || 'Failed to fetch CSRF token'
        setError(errorMsg)
        console.warn('Failed to fetch CSRF token:', errorMsg)
        return null
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error fetching CSRF token'
      setError(errorMsg)
      console.error('Error fetching CSRF token:', error)
      const err = error as AxiosError
      if (showErrorToast) {
        handleApiError(err, {
          title: 'Failed to Load CSRF Token'
        })
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [showErrorToast])

  /* Clear CSRF token */
  const clearCsrfToken = useCallback(() => {
    setCsrfToken(null)
    setError(null)
    console.log('CSRF token cleared')
  }, [])

  return {
    csrfToken,
    isLoading,
    error,
    fetchCsrfToken,
    clearCsrfToken
  }
}

export default useCsrfToken
