/* Libraries imports */
import axios, { AxiosInstance } from 'axios'

/* Shared module imports */
import { BACKEND_BASE_URL } from '@shared/config'
import { tokenRefreshService } from '@shared/services'

/* Auth management module imports */
import { AUTH_STORAGE_KEYS } from '@auth-management/constants'

/* Create authenticated client factory function */
export const createAuthenticatedClient = (basePath: string): AxiosInstance => {
  /* Create axios instance with module-specific base path */
  const client = axios.create({
    baseURL: `${BACKEND_BASE_URL}${basePath}`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000
  })

  /* Add request interceptor for token attachment */
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log(`[AuthenticatedClient] Token attached for ${config.url}`)
      } else {
        console.log(`[AuthenticatedClient] No token available for ${config.url}`)
      }
      return config
    },
    (error) => {
      console.error('[AuthenticatedClient] Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  /* Add response interceptor for automatic token refresh */
  tokenRefreshService.createResponseInterceptor(client)

  return client
}