/* HTTP client configuration for user management API */

/* Shared module imports */
import { createApiClient } from '@shared/api/base-client'

/* User management module imports */
import { USER_API_ROUTES } from '@user-management/constants'

/* Create user management specific client with authentication */
const userApiClient = createApiClient({
  basePath: USER_API_ROUTES.BASE_URL
})

export { userApiClient }