/* HTTP client configuration for tenant management API */

/* Shared module imports */
import { createApiClient } from '@shared/api'

/* Tenant management module imports */
import { TENANT_API_ROUTES } from '@tenant-management/constants'

/* HTTP client configured for tenant management API endpoints */
const tenantApiClient = createApiClient({
  basePath: TENANT_API_ROUTES.BASE_URL
})

export { tenantApiClient }
