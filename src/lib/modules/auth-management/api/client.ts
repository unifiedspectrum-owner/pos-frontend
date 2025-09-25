/* HTTP client configuration for authentication API */

/* External library imports */
import axios from "axios"

/* Shared module imports */
import { BACKEND_BASE_URL } from "@shared/config"
import { AUTH_API_ROUTES, AUTH_STORAGE_KEYS } from "@auth-management/constants"

/* HTTP client configured for authentication API endpoints */
const authApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* Request interceptor for auth client - no token needed for auth endpoints */
authApiClient.interceptors.request.use(
  (config) => {
    /* Add token only for certain auth endpoints that require it */
    if (config.url?.includes(AUTH_API_ROUTES.LOGOUT) || config.url?.includes(AUTH_API_ROUTES.REFRESH)) {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/* Response interceptor for auth client */
authApiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    /* Handle specific auth errors */
    if (error.response?.status === 401 && error.config?.url?.includes('/refresh')) {
      /* Clear tokens if refresh fails */
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOGGED_IN)
      window.dispatchEvent(new Event('authStateChanged'))
    }
    return Promise.reject(error)
  }
)

export { authApiClient }