/* HTTP client configuration for role management API */

/* Shared module imports */
import { createApiClient } from '@shared/api'

/* Role management module imports */
import { ROLE_API_ROUTES } from '@role-management/constants'

/* Create role management specific client with authentication */
const roleApiClient = createApiClient({
  basePath: ROLE_API_ROUTES.BASE_URL
})

export { roleApiClient }