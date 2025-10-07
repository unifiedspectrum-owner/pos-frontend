/* Libraries imports */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios'

/* Shared module imports */
import { BACKEND_BASE_URL } from '@shared/config'

/* Auth management module imports */
import { AUTH_STORAGE_KEYS, AUTH_API_ROUTES } from '@auth-management/constants'

/* Configuration interface for creating API clients */
interface ApiClientConfig {
  basePath: string
  requiresAuth?: boolean
  isPublic?: boolean
  timeout?: number
  customHeaders?: Record<string, string>
  authRoutes?: string[]
}

/* Base API client factory with common functionality */
export class BaseApiClient {
  private client: AxiosInstance
  private config: ApiClientConfig
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }> = []

  constructor(config: ApiClientConfig) {
    this.config = {
      requiresAuth: true,
      isPublic: false,
      timeout: 30000,
      ...config
    }

    /* Create axios instance with configuration */
    this.client = axios.create({
      baseURL: `${BACKEND_BASE_URL}/api/v1${this.config.isPublic ? `/public${this.config.basePath}` : this.config.basePath}`,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.customHeaders
      },
      timeout: this.config.timeout
    })

    /* Setup interceptors */
    this.setupRequestInterceptor()
    this.setupResponseInterceptor()
  }

  /* Setup request interceptor for authentication */
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config) => {
        /* Add authentication token if required */
        if (this.shouldAddAuth(config)) {
          const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => {
        console.error(`[BaseApiClient] Request interceptor error:`, error)
        return Promise.reject(error)
      }
    )
  }

  /* Setup response interceptor for error handling and token refresh */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        /* Handle 401 errors with automatic token refresh */
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            /* If already refreshing, queue this request */
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              return this.client(originalRequest)
            }).catch(err => {
              return Promise.reject(err)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newToken = await this.refreshToken()
            if (newToken) {
              /* Update token in localStorage */
              localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newToken)

              /* Process failed queue */
              this.processQueue(null, newToken)

              /* Retry original request with new token */
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            /* Token refresh failed, process queue with error */
            this.processQueue(refreshError, null)
            this.handleAuthError()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /* Determine if authentication should be added to request */
  private shouldAddAuth(config: AxiosRequestConfig): boolean {
    if (!this.config.requiresAuth) return false

    /* For auth routes, only add token for specific endpoints */
    if (this.config.authRoutes && config.url) {
      return this.config.authRoutes.some(route => config.url?.includes(route))
    }

    return this.config.requiresAuth
  }

  /* Process queued requests after token refresh */
  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })

    this.failedQueue = []
  }

  /* Refresh authentication token */
  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)

      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      /* Create auth client for refresh request */
      const authClient = axios.create({
        baseURL: `${BACKEND_BASE_URL}/auth`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      })

      const response = await authClient.post(AUTH_API_ROUTES.REFRESH)

      if (response.data.success && response.data.data?.accessToken) {
        return response.data.data.accessToken
      }

      throw new Error('Token refresh failed')
    } catch (error) {
      console.error('[BaseApiClient] Token refresh failed:', error)
      this.handleAuthError()
      return null
    }
  }

  /* Handle authentication errors */
  private handleAuthError(): void {
    /* Clear tokens and redirect to login */
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
    localStorage.removeItem(AUTH_STORAGE_KEYS.LOGGED_IN)
    window.dispatchEvent(new Event('authStateChanged'))
  }

  /* Get the underlying axios instance */
  getAxiosInstance(): AxiosInstance {
    return this.client
  }
}

/* Factory function for creating API clients */
export const createApiClient = (config: ApiClientConfig): AxiosInstance => {
  const client = new BaseApiClient(config)
  return client.getAxiosInstance()
}