/* External library imports */
import axios from "axios"

/* Shared module imports */
import { BACKEND_BASE_URL } from "@shared/config"

/* Auth management module imports */
import { AUTH_STORAGE_KEYS } from "@auth-management/constants"
import { TENANT_API_ROUTES } from "@tenant-management/constants"

/* HTTP client configured for tenant management API endpoints */
const tenantApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}${TENANT_API_ROUTES.BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* Attach auth token to requests */
tenantApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/* Handle auth errors and token cleanup */
tenantApiClient.interceptors.response.use(
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

export { tenantApiClient }