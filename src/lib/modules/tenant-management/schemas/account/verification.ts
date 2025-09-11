/* Tenant account verification validation schemas */

/* External library imports */
import { z } from 'zod/v4';

/* Schema for requesting OTP delivery to tenant contact methods */
export const requestOtpSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID is required').default(''),
  otp_type: z.enum(['email_verification', 'phone_verification', 'all'], {
    message: 'OTP type must be either email_verification, phone_verification, or all'
  }).default('all')
});

/* Schema for verifying tenant account using OTP code */
export const verifyTenantAccountSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID is required').default(''),
  otp_type: z.enum(['email_verification', 'phone_verification'], {
    message: 'OTP type must be either email_verification, phone_verification'
  }).default('email_verification'),
  otp_code: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
    .default('')
});

/* Schema for email OTP input fields (string-based input) */
export const emailOTPVerificationSchema = z.object({
  email_otp: z
    .string()
    .length(6, { message: "Email OTP must be 6 digits long" })
    .regex(/^\d{6}$/, 'Email OTP must contain only numbers')
});

/* Schema for phone OTP input fields (string-based input) */
export const phoneOTPVerificationSchema = z.object({
  phone_otp: z
    .string()
    .length(6, { message: "Phone OTP must be 6 digits long" })
    .regex(/^\d{6}$/, 'Phone OTP must contain only numbers')
});

/* TypeScript type for email OTP verification form data */
export type EmailOTPVerificationData = z.infer<typeof emailOTPVerificationSchema>;

/* TypeScript type for phone OTP verification form data */
export type PhoneOTPVerificationData = z.infer<typeof phoneOTPVerificationSchema>;