/* TypeScript interfaces for assignment-related data structures */

/* ====================
   ENTITIES
==================== */

/* Ticket assignment details */
export interface TicketAssignment {
  assigned_to_user_id: number | null;
  assigned_to_user_name: string | null;
  assigned_to_role_id: number | null;
  assigned_to_role_name: string | null;
  assigned_at: string | null;
}

/* ====================
   API REQUESTS
==================== */

/* Payload for assigning ticket to user */
export interface TicketAssignmentRequest {
  assigned_to: number;
  notes?: string;
}

/* ====================
   API RESPONSES
==================== */

/* Assign ticket to user response */
export interface AssignTicketToUserApiResponse {
  success: boolean;
  message: string;
  data: {
    ticket_id: string;
  };
  error?: string;
  timestamp?: string;
}

/* Get Current Ticket Assignment response */
export interface GetCurrentTicketAssignmentApiResponse {
  success: boolean;
  message: string;
  data: {
    ticket_id: string;
    assignment_id: string;
    assigned_to_user_id: string | null;
    assigned_to_user_name: string | null;
    assigned_to_role_id: string | null;
    assigned_to_role_name: string | null;
    assigned_at: string | null;
  };
  error?: string;
  timestamp?: string;
}
