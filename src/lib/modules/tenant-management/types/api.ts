/* TypeScript interfaces for tenant management API contracts */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Tenant module imports */
import { TenantBasicDetails, TenantWithPlanDetails, TenantDetails, TenantSubscriptionDetails, TenantAssignedAddonDetails, TenantTransactionDetails, TenantTransactionSummary } from './entities';
import { TenantAccountInfo } from './ui';

/* Verification type definitions */
export type VerificationType = 'email_verification' | 'phone_verification'

/* ==================== Account Creation APIs ==================== */

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

/* ==================== Account Status APIs ==================== */

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

/* API response for resource provisioning */
export interface StartResourceProvisioningApiResponse {
  success: boolean;
  error?: string;
  data?: {
    request_id: string;
    status_url: string;
    estimated_time: string;
  };
  message: string;
  timestamp: string;
}

/* ==================== OTP Verification APIs ==================== */

/* Request payload for generating OTP codes */
export interface RequestOTPApiRequest {
  otp_type: VerificationType;
  email?: string;
  phone?: string;
}

/* API response for OTP generation request */
export interface RequestOTPApiResponse {
  success: boolean,
  message: string,
  data?: {
    contact: string,
    verification_type: VerificationType,
    otp_code?: number
  },
  error?: string,
  validation_errors?: ValidationError[],
  timestamp: string
}

/* Request payload for verifying OTP code */
export interface VerificationOTPApiRequest {
  otp_type: VerificationType;
  otp_code: number;
}

/* API response for OTP verification */
export interface VerificationOTPApiResponse {
  success: boolean,
  message: string,
  data?: {
    tenant_id: string,
    verification_type: 'email' | 'phone',
    verified: boolean
    verified_at: string
  },
  error?: string,
  validation_errors?: ValidationError[],
  timestamp: string
}

/* ==================== Tenant Action APIs ==================== */

/* Request payload for holding tenant account */
export interface HoldTenantApiRequest {
  reason: string;
  hold_until: string | null;
}

/* API response for hold operation */
export interface HoldTenantApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant_id: string;
    status: 'hold';
    suspension_id: string;
    email_sent: boolean;
  };
  timestamp: string;
}

/* Request payload for suspending tenant account */
export interface SuspendTenantApiRequest {
  reason: string;
  suspend_until: string | null;
}

/* API response for suspension operation */
export interface SuspendTenantApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant_id: string;
    status: 'suspended';
    suspension_id: string;
    email_sent: boolean;
  };
  timestamp: string;
}

/* Request payload for activating tenant account */
export interface ActivateTenantApiRequest {
  reason: string;
}

/* API response for activation operation */
export interface ActivateTenantApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant_id: string;
    status: 'active';
    suspension_id: string;
    email_sent: boolean;
  };
  timestamp: string;
}

/* API response for tenant deletion operation */
export interface deleteTenantApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant_id: string;
    status: 'inactive';
    deleted_at: string;
  };
  timestamp: string;
}

/* ==================== Tenant List and Details APIs ==================== */

/* Paginated tenant listing response */
export interface TenantListApiResponse {
  success: boolean;
  message: string;
  tenants: TenantWithPlanDetails[];
  pagination: {
    current_page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  timestamp: string
}

/* Paginated tenant basic listing response */
export interface TenantBasicListResponse {
  success: boolean;
  message: string;
  data: {
    tenants: TenantBasicDetails[];
  };
  timestamp: string;
}

/* Complete tenant information response */
export interface TenantDetailsApiResponse {
  success: boolean,
  message: string;
  error?: string;
  data?: {
    tenant_details: TenantDetails;
    subscription_details: {
      plan_details: TenantSubscriptionDetails | null;
      addon_details: TenantAssignedAddonDetails[]
    }
    transaction_details: {
      transactions: TenantTransactionDetails[];
      transaction_summary: TenantTransactionSummary;
    };
  }
  timestamp: string;
}
