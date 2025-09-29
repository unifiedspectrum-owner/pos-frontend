/* HTTP client configuration for plan management API */

/* Shared module imports */
import { createApiClient } from '@shared/api'

/* Plan management module imports */
import { PLAN_API_ROUTES } from '@plan-management/constants/routes'

/* HTTP client for subscription plan API endpoints */
const planApiClient = createApiClient({
  basePath: PLAN_API_ROUTES.BASE_URL
})

export { planApiClient }