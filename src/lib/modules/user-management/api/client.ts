/* HTTP client configuration for user management API */

/* Libraries imports */
import axios from 'axios'

/* Shared module imports */
import { BACKEND_BASE_URL } from '@shared/config'
import { tokenRefreshService } from '@shared/services'

/* Auth management module imports */
import { AUTH_STORAGE_KEYS } from '@auth-management/constants'

/* User management module imports */
import { USER_API_ROUTES } from '@user-management/constants'

/* Create user management specific client with authentication and token refresh */
const userApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}${USER_API_ROUTES.BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
})

/* Add request interceptor for token attachment */
userApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`[UserApiClient] Token attached for ${config.url}`)
    } else {
      console.log(`[UserApiClient] No token available for ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[UserApiClient] Request interceptor error:', error)
    return Promise.reject(error)
  }
)

/* Add response interceptor for automatic token refresh */
tokenRefreshService.createResponseInterceptor(userApiClient)

export { userApiClient }