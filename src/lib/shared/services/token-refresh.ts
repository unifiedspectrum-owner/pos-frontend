/* Libraries imports */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

/* Shared module imports */
import { BACKEND_BASE_URL } from '@shared/config'

/* Auth management module imports */
import { AUTH_STORAGE_KEYS, AUTH_API_ROUTES } from '@auth-management/constants'

/* Token refresh service interface */
interface TokenRefreshResponse {
  success: boolean
  data?: {
    accessToken: string
  }
  error?: string
  message?: string
}

/* Queue item with timeout handling */
interface QueueItem {
  resolve: (value: string | null) => void
  reject: (error: any) => void
  timestamp: number
  timeoutId: NodeJS.Timeout
}

/* Token refresh service class */
class TokenRefreshService {
  private isRefreshing = false
  private failedQueue: QueueItem[] = []
  private readonly QUEUE_TIMEOUT = 30000
  private readonly MAX_QUEUE_SIZE = 100
  private interceptorIds = new Map<AxiosInstance, number>()

  /* Process queued requests after token refresh */
  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject, timeoutId }) => {
      clearTimeout(timeoutId)
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })

    this.failedQueue = []
  }

  /* Clean up expired queue items */
  private cleanupExpiredQueue() {
    const now = Date.now()
    const validItems: QueueItem[] = []

    this.failedQueue.forEach((item) => {
      if (now - item.timestamp > this.QUEUE_TIMEOUT) {
        clearTimeout(item.timeoutId)
        item.reject(new Error('Token refresh timeout'))
      } else {
        validItems.push(item)
      }
    })

    this.failedQueue = validItems
  }

  /* Clear all queued requests */
  public clearQueue() {
    this.failedQueue.forEach(({ timeoutId, reject }) => {
      clearTimeout(timeoutId)
      reject(new Error('Token refresh service cleared'))
    })
    this.failedQueue = []
  }

  /* Remove interceptor for cleanup */
  public removeInterceptor(apiClient: AxiosInstance) {
    const interceptorId = this.interceptorIds.get(apiClient)
    if (interceptorId !== undefined) {
      apiClient.interceptors.response.eject(interceptorId)
      this.interceptorIds.delete(apiClient)
      console.log('[TokenRefreshService] Interceptor removed for client')
    }
  }

  /* Cleanup all interceptors */
  public cleanup() {
    this.clearQueue()
    this.interceptorIds.forEach((interceptorId, apiClient) => {
      apiClient.interceptors.response.eject(interceptorId)
    })
    this.interceptorIds.clear()
    console.log('[TokenRefreshService] All interceptors and queue cleared')
  }

  /* Refresh access token using refresh token */
  async refreshToken(): Promise<string | null> {
    /* Clean up expired items before processing */
    this.cleanupExpiredQueue()

    /* Check queue size limit */
    if (this.failedQueue.length >= this.MAX_QUEUE_SIZE) {
      throw new Error('Token refresh queue is full')
    }

    /* If already refreshing, queue the request */
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          const index = this.failedQueue.findIndex(item => item.resolve === resolve)
          if (index !== -1) {
            this.failedQueue.splice(index, 1)
            reject(new Error('Token refresh timeout'))
          }
        }, this.QUEUE_TIMEOUT)

        this.failedQueue.push({
          resolve,
          reject,
          timestamp: Date.now(),
          timeoutId
        })
      })
    }

    console.log('[TokenRefreshService] Starting token refresh process')
    this.isRefreshing = true

    try {
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      const userEmail = localStorage.getItem(AUTH_STORAGE_KEYS.USER_EMAIL)

      if (!refreshToken || !userEmail) {
        throw new Error('No refresh token or user email available')
      }

      /* Call refresh token API */
      const response = await axios.post<TokenRefreshResponse>(
        `${BACKEND_BASE_URL}/auth${AUTH_API_ROUTES.REFRESH}`,
        { email: userEmail },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success && response.data.data?.accessToken) {
        const newAccessToken = response.data.data.accessToken

        /* Update stored token */
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)

        console.log('[TokenRefreshService] Token refreshed successfully')
        this.processQueue(null, newAccessToken)

        return newAccessToken
      } else {
        throw new Error(response.data.error || response.data.message || 'Token refresh failed')
      }
    } catch (error: any) {
      console.error('[TokenRefreshService] Token refresh failed:', error)

      /* Clear all auth data on refresh failure */
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOGGED_IN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER_EMAIL)

      /* Dispatch auth state change event */
      window.dispatchEvent(new Event('authStateChanged'))

      this.processQueue(error, null)
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  /* Create response interceptor for automatic token refresh */
  createResponseInterceptor(apiClient: AxiosInstance) {
    /* Store interceptor ID for cleanup */
    const interceptorId = apiClient.interceptors.response.use(
      /* Success response - pass through */
      (response: AxiosResponse) => response,

      /* Error response - handle token refresh */
      async (error: any) => {
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config

        /* Handle 401 errors with automatic token refresh */
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            /* Add timeout for token refresh operation */
            const refreshPromise = this.refreshToken()
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Token refresh operation timeout')), this.QUEUE_TIMEOUT)
            })

            const newToken = await Promise.race([refreshPromise, timeoutPromise])

            if (newToken && originalRequest.headers) {
              /* Update the original request with new token */
              originalRequest.headers.Authorization = `Bearer ${newToken}`

              console.log('[TokenRefreshService] Retrying original request with new token')

              /* Retry the original request */
              return apiClient(originalRequest)
            }
          } catch (refreshError) {
            console.error('[TokenRefreshService] Failed to refresh token, redirecting to login')

            /* Redirect to login page */
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login'
            }

            return Promise.reject(refreshError)
          }
        }

        /* For non-401 errors or failed retries, reject as normal */
        return Promise.reject(error)
      }
    )

    /* Store interceptor ID for cleanup */
    this.interceptorIds.set(apiClient, interceptorId)

    return interceptorId
  }
}

/* Export singleton instance */
export const tokenRefreshService = new TokenRefreshService()