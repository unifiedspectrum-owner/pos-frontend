/* Ticket communication/comment operations API methods */

/* Support ticket management module imports */
import { GetTicketCommunicationsApiResponse, CreateTicketCommunicationApiResponse } from "@support-ticket-management/types"
import { supportTicketApiClient } from "@support-ticket-management/api"
import { SUPPORT_TICKET_API_ROUTES } from "@support-ticket-management/constants"
import { CreateTicketCommentFormSchema } from "@support-ticket-management/schemas"

/* Service object for communication operations */
export const communicationsService = {

  /* Get all communications for a ticket */
  async getTicketCommunications(ticketId: string): Promise<GetTicketCommunicationsApiResponse> {
    try {
      const response = await supportTicketApiClient.get<GetTicketCommunicationsApiResponse>(SUPPORT_TICKET_API_ROUTES.GET_COMMENTS.replace(':id', ticketId))
      return response.data
    } catch (error) {
      console.error('[CommunicationsService] Failed to get ticket communications:', error)
      throw error
    }
  },

  /* Add communication/comment to ticket */
  async createTicketCommunication(ticketId: string, data: CreateTicketCommentFormSchema): Promise<CreateTicketCommunicationApiResponse> {
    try {
      const response = await supportTicketApiClient.post<CreateTicketCommunicationApiResponse>(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT.replace(':id', ticketId), data)
      return response.data
    } catch (error) {
      console.error('[CommunicationsService] Failed to create communication:', error)
      throw error
    }
  },
}
