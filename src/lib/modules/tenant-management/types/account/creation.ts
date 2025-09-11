/* TypeScript interfaces for account creation data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Request payload for creating new account */
export interface CreateAccountApiRequest {
  tenant_id?: string;
  company_name: string;
  contact_person: string;
  primary_email: string;
  primary_phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  email_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* API response for account creation */
export interface CreateAccountApiResponse {
  success: boolean,
  message: string,
  data?: {
    tenant_id: string,
    company_name: string,
    status: string
  },
  error?: string,
  validation_errors?: ValidationError[],
  timestamp: string
}