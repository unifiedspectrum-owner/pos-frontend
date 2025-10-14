/* Ticket assignment operations API methods */

/* Support ticket management module imports */
import { AssignTicketToUserApiResponse, GetCurrentTicketAssignmentApiResponse } from "@support-ticket-management/types"
import { supportTicketApiClient } from "@support-ticket-management/api"
import { SUPPORT_TICKET_API_ROUTES } from "@support-ticket-management/constants"
import { AssignTicketFormSchema } from "@support-ticket-management/schemas"

/* Service object for assignment operations */
export const assignmentsService = {

  /* Assign ticket to user */
  async assignTicketToUser(ticketId: string, data: AssignTicketFormSchema): Promise<AssignTicketToUserApiResponse> {
    try {
      const response = await supportTicketApiClient.post<AssignTicketToUserApiResponse>(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.CREATE.replace(':id', ticketId), data)
      return response.data
    } catch (error) {
      console.error('[AssignmentsService] Failed to assign ticket:', error)
      throw error
    }
  },

  /* Assign ticket to user */
  async getCurrentAssignment(ticketId: string): Promise<GetCurrentTicketAssignmentApiResponse> {
    try {
      const response = await supportTicketApiClient.get<GetCurrentTicketAssignmentApiResponse>(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.GET.replace(':id', ticketId))
      return response.data
    } catch (error) {
      console.error('[AssignmentsService] Failed to assign ticket:', error)
      throw error
    }
  },
}
