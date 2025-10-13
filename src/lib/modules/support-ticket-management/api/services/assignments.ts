/* Ticket assignment operations API methods */

/* Support ticket management module imports */
import { AssignTicketToUserApiResponse } from "@support-ticket-management/types"
import { supportTicketApiClient } from "@support-ticket-management/api"
import { SUPPORT_TICKET_API_ROUTES } from "@support-ticket-management/constants"
import { assignTicketFormSchema } from "@support-ticket-management/schemas"

/* Service object for assignment operations */
export const assignmentsService = {

  /* Assign ticket to user */
  async assignTicketToUser(data: assignTicketFormSchema): Promise<AssignTicketToUserApiResponse> {
    try {
      const response = await supportTicketApiClient.post<AssignTicketToUserApiResponse>(SUPPORT_TICKET_API_ROUTES.ASSIGN, data)
      return response.data
    } catch (error) {
      console.error('[AssignmentsService] Failed to assign ticket:', error)
      throw error
    }
  },
}
