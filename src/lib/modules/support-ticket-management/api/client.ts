/* HTTP client configuration for support ticket management API */

/* Shared module imports */
import { createApiClient } from '@shared/api'

/* Support ticket management module imports */
import { SUPPORT_TICKET_API_ROUTES } from '@support-ticket-management/constants'

/* Create support ticket management specific client with authentication */
const supportTicketApiClient = createApiClient({
  basePath: SUPPORT_TICKET_API_ROUTES.BASE_URL
})

export { supportTicketApiClient }
