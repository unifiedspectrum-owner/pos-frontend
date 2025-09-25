/* HTTP client configuration for role management API */

/* Libraries imports */
import axios from 'axios'

/* Shared module imports */
import { BACKEND_BASE_URL } from '@shared/config'
import { tokenRefreshService } from '@shared/services'

/* Auth management module imports */
import { AUTH_STORAGE_KEYS } from '@auth-management/constants'

/* Role management module imports */
import { ROLE_API_ROUTES } from '@role-management/constants'

/* Create role management specific client with authentication and token refresh */
const roleApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}${ROLE_API_ROUTES.BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
})

/* Add request interceptor for token attachment */
roleApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`[RoleApiClient] Token attached for ${config.url}`)
    } else {
      console.log(`[RoleApiClient] No token available for ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[RoleApiClient] Request interceptor error:', error)
    return Promise.reject(error)
  }
)

/* Add response interceptor for automatic token refresh */
tokenRefreshService.createResponseInterceptor(roleApiClient)

export { roleApiClient }