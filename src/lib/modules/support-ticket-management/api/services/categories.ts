/* Ticket category operations API methods */

/* Support ticket management module imports */
import { ListTicketCategoriesApiResponse } from "@support-ticket-management/types"
import { supportTicketApiClient } from "@support-ticket-management/api"
import { SUPPORT_TICKET_API_ROUTES } from "@support-ticket-management/constants"

/* Service object for category operations */
export const categoriesService = {

  /* Get all ticket categories */
  async listAllCategories(): Promise<ListTicketCategoriesApiResponse> {
    try {
      const response = await supportTicketApiClient.get<ListTicketCategoriesApiResponse>(SUPPORT_TICKET_API_ROUTES.CATEGORIES)
      return response.data
    } catch (error) {
      console.error('[CategoriesService] Failed to list ticket categories:', error)
      throw error
    }
  },
}
