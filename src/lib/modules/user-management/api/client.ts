/* HTTP client configuration for user management API */

/* External library imports */
import axios from "axios"

/* Shared module imports */
import { BACKEND_BASE_URL } from "@shared/config"

/* Auth management module imports */
import { AUTH_STORAGE_KEYS } from "@auth-management/constants"
import { USER_API_ROUTES } from "@user-management/constants"

/* HTTP client configured for user management API endpoints */
const userApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}${USER_API_ROUTES.BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* Attach auth token to requests */
userApiClient.interceptors.request.use(
  (config) => {
    /* Get token from localStorage first, fallback to sample token for development */
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[UserAPI] Using token for request:', token.substring(0, 20) + '...');
    } else {
      console.log('[UserAPI] No token available for request');
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/* Handle auth errors and token cleanup */
userApiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOGGED_IN)
      window.dispatchEvent(new Event('authStateChanged'))
    }
    return Promise.reject(error)
  }
)

export { userApiClient }