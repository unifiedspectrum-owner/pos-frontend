/* TypeScript interfaces for attachment-related data structures */

/* ====================
   ENTITIES
==================== */

/* Ticket attachment details */
export interface TicketAttachment {
  id: number;
  ticket_id: number;
  communication_id: number | null;
  filename: string;
  file_size: number;
  mime_type: string;
  file_extension: string | null;
  file_path: string;
  is_public: boolean;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
}

/* ====================
   API RESPONSES
==================== */

/* Download ticket communication attachment response */
export interface DownloadTicketCommunicationAttachmentApiResponse {
  success: boolean;
  message: string;
  data: {
    attachment_id: string;
    filename: string;
    mime_type: string;
    file_size: string;
    file_extension: string;
    file_content: string;
  };
  error?: string;
  timestamp?: string;
}
