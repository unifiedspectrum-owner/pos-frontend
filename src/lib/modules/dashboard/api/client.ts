/* HTTP client configuration for dashboard API */

/* Shared module imports */
import { createApiClient } from '@shared/api/base-client'

/* Dashboard module imports */
import { DASHBOARD_API_ROUTES } from '@dashboard/constants/routes'

/* HTTP client for dashboard API endpoints */
const dashboardApiClient = createApiClient({
  basePath: DASHBOARD_API_ROUTES.BASE_URL
})

export { dashboardApiClient }
