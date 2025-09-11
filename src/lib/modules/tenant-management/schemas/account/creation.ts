/* Tenant account creation validation schemas */

/* External library imports */
import { z } from 'zod/v4';

/* Phone number tuple validation schema */
const PhoneSchema = z.tuple([
  z.string().regex(/^\+\d{1,4}$/, "Invalid dial code"),  // First element
  z.string().regex(/^\d{4,15}$/, "Invalid phone number"), // Second element
]);

/* Schema for creating new tenant account with complete business information */
export const createTenantAccountSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  contact_person: z.string().min(1, 'Contact Person name is required').max(200),
  primary_email: z.email('Valid email address is required'),
  primary_phone: PhoneSchema,
  email_otp: z
    .string()
    .length(6, { message: "Email OTP must be 6 digits long" })
    .regex(/^\d{6}$/, 'Email OTP must contain only numbers')
    .optional(),
  phone_otp: z
    .string()
    .length(6, { message: "Phone OTP must be 6 digits long" })
    .regex(/^\d{6}$/, 'Phone OTP must contain only numbers')
    .optional(),
  address_line1: z.string().min(1, 'Address line 1 is required').max(200),
  address_line2: z.string().max(200).nullable(),
  city: z.string().min(1, 'City is required').max(100),
  state_province: z.string().min(1, 'State/Province is required').max(100),
  postal_code: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required')
});

/* TypeScript type for tenant account creation form data */
export type TenantInfoFormData = z.infer<typeof createTenantAccountSchema>;