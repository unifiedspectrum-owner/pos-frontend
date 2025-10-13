/* Ticket attachment operations API methods */

/* Support ticket management module imports */
import { DownloadTicketCommunicationAttachmentApiResponse } from "@support-ticket-management/types"
import { supportTicketApiClient } from "@support-ticket-management/api"
import { SUPPORT_TICKET_API_ROUTES } from "@support-ticket-management/constants"

/* Service object for attachment operations */
export const attachmentsService = {

  /* Download ticket communication attachment */
  async downloadAttachment(attachmentId: string): Promise<DownloadTicketCommunicationAttachmentApiResponse> {
    try {
      const response = await supportTicketApiClient.get<DownloadTicketCommunicationAttachmentApiResponse>(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD.replace(':id', attachmentId))
      return response.data
    } catch (error) {
      console.error('[AttachmentsService] Failed to download attachment:', error)
      throw error
    }
  },
}
