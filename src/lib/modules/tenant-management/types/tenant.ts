/* Field validation error structure */
export interface ValidationError {
  field: string;
  message: string;
}

/* Request payload for tenant account creation */
export interface TenantAccountCreationAPIRequest {
  company_name: string;
  primary_email: string;
  primary_phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

/* API response for tenant account creation */
export interface TenantAccountCreationAPIResponse {
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

/* Request payload for OTP generation */
export interface RequestTenantAccountVerificationOTPAPIRequest {
  tenant_id: string;
  otp_type: "email_verification" | "phone_verification" | "all";
}

/* API response for OTP request */
export interface RequestTenantAccountVerificationOTPAPIResponse {
  success: boolean,
  message: string,
  data?: {
    tenant_id: string,
    verification_type: 'email_verification' | 'phone_verification' | 'all',
    otp_code?: number
    otps?: {
      type: string;
      destination: string;
      otp_code: number;
    }[]
  },
  error?: string,
  validation_errors?: ValidationError[],
  timestamp: string
}

/* Request payload for OTP verification */
export interface VerifyTenantAccountVerificationOTPAPIRequest {
  tenant_id: string;
  otp_type: "email_verification" | "phone_verification";
  otp_code: number;
}

/* API response for OTP verification */
export interface VerifyTenantAccountVerificationOTPAPIResponse {
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

/* Union type for tenant creation workflow steps */
export type TenantAccountCreationStepType = 'tenant-info' | 'verification' | 'plan-selection'

/* Complete tenant organization information */
export interface TenantInfo {
  organization_name: string;
  business_category: string;
  website_url: string | null;
  primary_email: string;
  secondary_email: string | null;
  primary_phone: string;
  secondary_phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

/* Account verification status tracking */
export interface VerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  both_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* Complete tenant data structure */
export interface TenantData {
  tenant_id: string;
  tenant_info: TenantInfo;
  verification_status: VerificationStatus;
}

/* API response for tenant status queries */
export interface TenantStatusApiResponse {
  success: boolean;
  data: TenantData;
  message: string;
  timestamp: string;
}

/* Request payload for tenant status check */
export interface TenantStatusApiRquest {
  tenant_id: string
}
