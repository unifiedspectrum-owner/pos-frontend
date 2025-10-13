/* TypeScript interfaces for ticket-related data structures */

/* Shared module imports */
import { PaginationInfo, ValidationError } from '@shared/types'

/* Support ticket module imports */
import { TicketCategory } from './category'
import { TicketAssignment } from './assignment'
import { TicketCommunication } from './communication'
import { TicketAttachment } from './attachment'

/* ====================
   ENUMS & TYPES
==================== */

/* Support ticket status type matching database schema */
export type TicketStatus =
  | 'new'                     // Ticket has been created but not yet assigned
  | 'open'                    // Ticket is open and assigned to an agent
  | 'in_progress'             // Ticket is actively being worked on
  | 'pending_customer'        // Awaiting customer response
  | 'pending_internal'        // Awaiting internal team response
  | 'escalated'               // Ticket has been escalated to higher priority
  | 'resolved'                // Issue has been resolved, awaiting customer confirmation
  | 'closed'                  // Ticket is closed and completed
  | 'cancelled';              // Ticket has been cancelled

/* Support ticket priority levels */
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

/* ====================
   ENTITIES
==================== */

/* Ticket list item with essential details for listing */
export interface TicketListItem {
  id: number;
  ticket_id: string;
  tenant_id: string | null;
  subject: string;
  status: TicketStatus;
  created_at: string;
  resolution_due: string | null;
  first_response_at: string | null;
  category_name: string | null;
  assigned_to_user_name: string | null;
}

/* Support ticket for list display */
export interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category_id: number;
  category_name: string;
  created_by: number;
  created_by_name: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
}

/* Complete support ticket details */
export interface SupportTicketDetails {
  id: number;
  ticket_id: string;
  tenant_id: string | null;
  requester_user_id: number | null;
  requester_email: string;
  requester_name: string;
  requester_phone: string | null;
  category_id: number;
  subject: string;
  status: TicketStatus;
  created_at: string;
  resolution_due: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  escalated_at: string | null;
  escalated_by: number | null;
  escalation_reason: string | null;
  satisfaction_rating: number | null;
  satisfaction_feedback: string | null;
  satisfaction_submitted_at: string | null;
  internal_notes: string | null;
  is_active: boolean;
  updated_at: string | null;
  is_overdue: boolean;
  category_details: TicketCategory | null;
  assignment_details: TicketAssignment | null;
  communications: (TicketCommunication & {
    attachments?: TicketAttachment[];
  })[];
}

/* ====================
   API REQUESTS
==================== */

/* Payload for creating new support ticket */
export interface SupportTicketCreationRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
  category_id: number;
  attachments?: File[];
}

/* Payload for updating existing support ticket */
export interface SupportTicketUpdateRequest {
  subject?: string;
  description?: string;
  priority?: TicketPriority;
  category_id?: number;
  status?: TicketStatus;
}

/* Payload for updating ticket status */
export interface TicketStatusUpdateRequest {
  status: TicketStatus;
  resolution_notes?: string;
}

/* ====================
   API RESPONSES
==================== */

/* Paginated list of support tickets with metadata */
export interface SupportTicketListResponse {
  success: boolean;
  message: string;
  data: {
    tickets: TicketListItem[];
  }
  pagination: PaginationInfo;
}

/* Response containing support ticket details */
export interface SupportTicketDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    ticket: SupportTicketDetails;
  };
  error?: string;
  timestamp: string;
}

/* Response after successful support ticket creation */
export interface CreateSupportTicketApiResponse {
  success: boolean;
  message: string;
  data?: {
    ticketId: number;
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Response after support ticket update operation */
export interface SupportTicketUpdateResponse {
  success: boolean;
  message: string;
  data?: {
    ticketId: number;
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Response after support ticket deletion operation */
export interface SupportTicketDeletionResponse {
  success: boolean;
  message: string;
  data?: {
    ticketId: number;
  };
  error?: string;
  timestamp: string;
}
