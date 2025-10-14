/* Support ticket CRUD operations API methods */

/* Support ticket management module imports */
import { SupportTicketListResponse, SupportTicketDetailsResponse, CreateSupportTicketApiResponse, SupportTicketDeletionResponse, UpdateTicketStatusApiResponse, UpdateSupportTicketApiResponse } from "@support-ticket-management/types"
import { supportTicketApiClient } from "@support-ticket-management/api"
import { SUPPORT_TICKET_API_ROUTES } from "@support-ticket-management/constants"
import { CreateTicketFormSchema, UpdateTicketFormSchema, UpdateTicketStatusFormSchema } from "@support-ticket-management/schemas"

/* Service object for ticket CRUD operations */
export const ticketsService = {

  /* Get all support tickets with pagination and filtering */
  async listAllSupportTickets(page?: number, limit?: number): Promise<SupportTicketListResponse> {
    try {
      const response = await supportTicketApiClient.get<SupportTicketListResponse>(SUPPORT_TICKET_API_ROUTES.LIST, {
        params: {
          page,
          limit
        }
      })
      return response.data
    } catch (error) {
      console.error('[TicketsService] Failed to list support tickets:', error)
      throw error
    }
  },

  /* Get support ticket details by ID */
  async getSupportTicketDetails(ticketId: string): Promise<SupportTicketDetailsResponse> {
    try {
      const response = await supportTicketApiClient.get<SupportTicketDetailsResponse>(SUPPORT_TICKET_API_ROUTES.DETAILS.replace(':id', ticketId))
      return response.data
    } catch (error) {
      console.error('[TicketsService] Failed to get support ticket details:', error)
      throw error
    }
  },

  /* Create new support ticket with provided data */
  async createSupportTicket(data: CreateTicketFormSchema): Promise<CreateSupportTicketApiResponse> {
    try {
      const response = await supportTicketApiClient.post<CreateSupportTicketApiResponse>(SUPPORT_TICKET_API_ROUTES.CREATE, data)
      return response.data
    } catch (error) {
      console.error('[TicketsService] Failed to create support ticket:', error)
      throw error
    }
  },

  /* Update existing support ticket with provided data */
  async updateSupportTicket(ticketId: string, data: UpdateTicketFormSchema): Promise<UpdateSupportTicketApiResponse> {
    try {
      const response = await supportTicketApiClient.put<UpdateSupportTicketApiResponse>(SUPPORT_TICKET_API_ROUTES.UPDATE.replace(':id', ticketId), data)
      return response.data
    } catch (error) {
      console.error('[TicketsService] Failed to update support ticket:', error)
      throw error
    }
  },

  /* Remove support ticket permanently by ID */
  async deleteSupportTicket(ticketId: string): Promise<SupportTicketDeletionResponse> {
    try {
      const response = await supportTicketApiClient.delete<SupportTicketDeletionResponse>(SUPPORT_TICKET_API_ROUTES.DELETE.replace(':id', ticketId))
      return response.data
    } catch (error) {
      console.error('[TicketsService] Failed to delete support ticket:', error)
      throw error
    }
  },

  /* Update ticket status */
  async updateTicketStatus(ticketId: string, data: UpdateTicketStatusFormSchema): Promise<UpdateTicketStatusApiResponse> {
    try {
      const response = await supportTicketApiClient.post<UpdateTicketStatusApiResponse>(SUPPORT_TICKET_API_ROUTES.UPDATE_STATUS.replace(':id', ticketId), data)
      return response.data
    } catch (error) {
      console.error('[TicketsService] Failed to update ticket status:', error)
      throw error
    }
  },
}
