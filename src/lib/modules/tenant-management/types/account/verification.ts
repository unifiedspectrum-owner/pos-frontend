/* TypeScript interfaces for OTP verification data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Verification type definitions */
export type VerificationType = 'email_verification' | 'phone_verification'


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