/* TypeScript interfaces for service level agreement data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Entity Interfaces */

/* Service Level Agreement configuration */
export interface SupportSLA {
  id: number;
  name: string;
  support_channel: string;
  response_time_hours: number;
  availability_schedule: string;
  notes: string;
  display_order: number;
}

/* API: Get SLAs List */

/* Response for fetching all SLAs */
export interface SlaListApiResponse {
  success: boolean;
  error?: string;
  message: string;
  timestamp: string;
  count: number;
  data?: SupportSLA[];
}

/* API: Create SLA */

/* SLA creation request payload */
export interface CreateSlaApiRequest {
  name: string;
  support_channel: string;
  response_time_hours: number;
  availability_schedule: string;
  notes?: string | null;
}

/* Response for SLA creation operations */
export interface CreateSlaApiResponse {
  success: boolean;
  error?: string;
  message: string;
  timestamp: string;
  data?: {
    id: number;
    name: string;
    status: boolean;
  };
  validation_errors?: ValidationError[];
}
