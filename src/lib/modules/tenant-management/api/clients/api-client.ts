/* Libraries imports */
import axios from "axios"

/* Shared module imports */
import { BACKEND_BASE_URL } from "@shared/config"
import { tokenRefreshService } from '@shared/services'

/* Auth management module imports */
import { AUTH_STORAGE_KEYS } from "@auth-management/constants"

/* Tenant management module imports */
import { TENANT_API_ROUTES } from "@tenant-management/constants"

/* HTTP client configured for tenant management API endpoints */
const tenantApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}${TENANT_API_ROUTES.BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
})

/* Add request interceptor for token attachment */
tenantApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`[TenantApiClient] Token attached for ${config.url}`)
    } else {
      console.log(`[TenantApiClient] No token available for ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[TenantApiClient] Request interceptor error:', error)
    return Promise.reject(error)
  }
)

/* Add response interceptor for automatic token refresh */
tokenRefreshService.createResponseInterceptor(tenantApiClient)

export { tenantApiClient }