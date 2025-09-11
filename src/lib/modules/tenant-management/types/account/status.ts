/* TypeScript interfaces for account status data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

export interface TenantAccountFormCacheData {
  company_name: string;
  contact_person: string;
  primary_email: string;
  primary_phone: string,
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

/* Complete tenant organization information */
export interface TenantInfo {
  company_name: string;
  contact_person: string;
  primary_email: string;
  primary_phone: string,
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

/* Account verification status tracking */
export interface TenantVerificationInfo {
  email_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* Account verification status tracking */
export interface TenantVerificationStatusCachedData {
  email_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* Account verification status tracking */
export interface TenantVerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  both_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* Complete tenant data structure */
export interface TenantAccountInfo {
  tenant_id: string;
  tenant_info: TenantInfo;
  basic_info_status: {
    is_complete: boolean;
    validation_errors: ValidationError[];
    validation_message: string;
  };
  verification_status: TenantVerificationStatus;
}

/* Request payload for account status check */
export interface AccountStatusApiRequest {
  tenant_id: string
}

/* API response for account status queries */
export interface AccountStatusApiResponse {
  success: boolean;
  data: TenantAccountInfo;
  message: string;
  timestamp: string;
}