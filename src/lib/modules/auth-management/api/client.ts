/* HTTP client configuration for authentication API */

/* Shared module imports */
import { createApiClient } from '@shared/api'

/* Auth management module imports */
import { AUTH_API_ROUTES } from '@auth-management/constants'

/* HTTP client configured for authentication API endpoints */
const authApiClient = createApiClient({
  basePath: '/auth',
  requiresAuth: false,
  authRoutes: [
    AUTH_API_ROUTES.LOGOUT, 
    AUTH_API_ROUTES.REFRESH,
    AUTH_API_ROUTES.GENERATE_2FA,
    AUTH_API_ROUTES.ENABLE_2FA,
    AUTH_API_ROUTES.DISABLE_2FA,
    AUTH_API_ROUTES.VERIFY_2FA,
  ]
})

export { authApiClient }