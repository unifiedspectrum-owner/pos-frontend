import { z } from 'zod/v4';

/* Schema for creating new tenant account with complete business information */
export const createTenantAccountSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200).default(''),
  primary_email: z.string().email('Valid email address is required').default(''),
  primary_phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .default(''),
  address_line1: z.string().min(1, 'Address line 1 is required').max(200).default(''),
  address_line2: z.string().max(200).optional().default(''),
  city: z.string().min(1, 'City is required').max(100).default(''),
  state_province: z.string().min(1, 'State/Province is required').max(100).default(''),
  postal_code: z.string().min(1, 'Postal code is required').max(20).default(''),
  country: z.string().min(1, 'Country is required').default('USA')
});

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

/* Schema for email OTP input fields (array-based input) */
export const emailOTPVerificationSchema = z.object({
  email_otp: z
    .array(z.string().min(1), { error: "Email OTP is required" })
    .length(6, { message: "Email OTP must be 6 digits long" })
});

/* Schema for phone OTP input fields (array-based input) */
export const phoneOTPVerificationSchema = z.object({
  phone_otp: z
    .array(z.string().min(1), { error: "Phone OTP is required" })
    .length(6, { message: "Phone OTP must be 6 digits long" })
});

/* Schema for addon assignment configuration */
export const addonAssignements = z.object({
  addon_id: z.number()
    .int('Addon ID must be an integer')
    .positive('Addon ID must be positive'),
  feature_level: z.enum(['basic', 'premium', 'custom'], {
    error: 'Feature level must be basic, premium, or custom'
  }).optional().default('basic')
});

/* Schema for assigning subscription plan to tenant with addons */
export const assignPlanToTenantSchema = z.object({
  tenant_id: z.string(),
  plan_id: z.number()
    .int('Plan ID must be an integer')
    .positive('Plan ID must be positive'),
  billing_cycle: z.enum(['monthly', 'yearly'], {
    error: 'Billing cycle must be either monthly or annual'
  }),
  branches_count: z.number()
    .int('Branches Count must be an integer')
    .positive('Branches must be positive')
    .default(1),
  organization_addon_assignments: z.array(addonAssignements).default([]),
  branch_addon_assignments: z.array(z.object({
    branch_id: z.number()
      .min(1, 'Branch ID is required')
      .positive('Branch ID must be positive'),
    addon_assignments: z.array(addonAssignements)
  })).default([])
});

/* TypeScript type for tenant account creation form data */
export type TenantInfoFormData = z.infer<typeof createTenantAccountSchema>;

/* TypeScript type for email OTP verification form data */
export type EmailOTPVerificationData = z.infer<typeof emailOTPVerificationSchema>;

/* TypeScript type for phone OTP verification form data */
export type PhoneOTPVerificationData = z.infer<typeof phoneOTPVerificationSchema>;