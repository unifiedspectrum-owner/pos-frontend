/* TypeScript interfaces for communication-related data structures */

/* Support ticket module imports */
import { SenderType } from '../constants';
import { TicketAttachment } from './attachment'

/* ====================
   ENUMS & TYPES
==================== */

/* Ticket communication types */
export type CommunicationType =
  | 'customer_message'
  | 'agent_response'
  | 'internal_note'
  | 'system_update';

/* Message format types */
export type MessageFormat = 'text' | 'html' | 'markdown';

/* ====================
   ENTITIES
==================== */

/* Ticket communication details */
export interface TicketCommunication {
  id: number;
  ticket_id: number;
  communication_type: CommunicationType;
  sender_user_id: number | null;
  sender_name: string;
  sender_email: string | null;
  sender_type: SenderType;
  message_content: string;
  message_format: MessageFormat;
  is_internal: boolean;
  is_auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

/* Ticket communication with attachments */
export interface TicketCommunicationWithAttachments extends TicketCommunication {
  attachments?: TicketAttachment[];
}

/* ====================
   API REQUESTS
==================== */

/* Payload for adding comment to ticket */
export interface TicketCommentRequest {
  ticket_id: string;
  message_content: string;
  is_internal: boolean;
  attachments?: any[];
}

/* ====================
   API RESPONSES
==================== */

/* Get ticket communications response */
export interface GetTicketCommunicationsApiResponse {
  success: boolean;
  message: string;
  data: {
    ticket_id: string;
    communications: (TicketCommunication & {
      attachments?: TicketAttachment[];
    })[];
  };
  error?: string;
  timestamp?: string;
}

/* Create communication response */
export interface CreateTicketCommunicationApiResponse {
  success: boolean;
  message: string;
  data: {
    communication_id: number;
    ticket_id: string;
  };
  error?: string;
  timestamp?: string;
}

/* Response containing list of ticket comments */
export interface TicketCommentsListResponse {
  success: boolean;
  message: string;
  data: {
    comments: TicketCommunication[];
  };
  error?: string;
  timestamp: string;
}
