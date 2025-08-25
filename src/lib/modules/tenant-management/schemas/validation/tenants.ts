import { z } from 'zod';

/* Schema for creating new tenant account */
export const createTenantAccountSchema = z.object({
  /* Basic tenant company information */
  company_name: z.string().min(1, 'Company name is required').max(200).default(''),
  
  /* Primary and secondary contact information */
  primary_email: z.string().email('Valid email address is required').default(''),
  primary_phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .default(''),
  
  /* Complete address details */
  address_line1: z.string().min(1, 'Address line 1 is required').max(200).default(''),
  address_line2: z.string().max(200).optional().default(''),
  city: z.string().min(1, 'City is required').max(100).default(''),
  state_province: z.string().min(1, 'State/Province is required').max(100).default(''),
  postal_code: z.string().min(1, 'Postal code is required').max(20).default(''),
  country: z.string().min(1, 'Country is required').default('USA')
});


/* Schema for requesting new OTP */
export const requestOtpSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID is required').default(''), /* Target tenant for OTP */
  otp_type: z.enum(['email_verification', 'phone_verification', 'all'], {
    message: 'OTP type must be either email_verification, phone_verification, or all'
  }).default('all') /* Verification method or both */
});

/* Schema for verifying tenant account with OTP */
export const verifyTenantAccountSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID is required').default(''), /* Unique tenant identifier */
  otp_type: z.enum(['email_verification', 'phone_verification'], {
    message: 'OTP type must be either email_verification, phone_verification'
  }).default('email_verification'), /* Type of verification being performed */
  otp_code: z.string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers')
  .default('') /* 6-digit numeric OTP */
});

/* Validation schemas for email OTP fields */
export const emailOTPVerificationSchema = z.object({
  email_otp: z
  .array(z.string().min(1), { error: "Email OTP is required" })
  .length(6, { message: "Email OTP must be 4 digits long" }),
})

/* Validation schemas for phone OTP fields */
export const phoneOTPVerificationSchema = z.object({
  phone_otp: z
  .array(z.string().min(1), { error: "Phone OTP is required" })
  .length(6, { message: "Phone OTP must be 4 digits long" }),
})

/* TypeScript type for tenant account creation form data */
export type TenantInfoFormData = z.infer<typeof createTenantAccountSchema>;

/* TypeScript type for email OTP verification form data */
export type EmailOTPVerificationData = z.infer<typeof emailOTPVerificationSchema>;

/* TypeScript type for phone OTP verification form data */
export type PhoneOTPVerificationData = z.infer<typeof phoneOTPVerificationSchema>;