/* TypeScript interfaces for category-related data structures */

/* ====================
   ENTITIES
==================== */

/* Ticket category configuration */
export interface TicketCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

/* ====================
   API RESPONSES
==================== */

/* Ticket categories list API response */
export interface ListTicketCategoriesApiResponse {
  success: boolean;
  message: string;
  data: {
    categories: TicketCategory[];
  };
  error?: string;
  timestamp?: string;
}

/* Response containing list of ticket categories */
export interface TicketCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: TicketCategory[];
  };
  error?: string;
  timestamp: string;
}
