/* Tenant account creation validation schemas */

/* Libraries imports */
import { z } from 'zod/v4';

/* Shared module imports */
import { PhoneNumberSchema } from '@shared/schema/validation';
import { OTP_REGEX } from '@shared/constants';

/* Schema for creating new tenant account with complete business information */
export const createTenantAccountSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  contact_person: z.string().min(1, 'Contact Person name is required').max(200),
  primary_email: z.email('Valid email address is required'),
  primary_phone: PhoneNumberSchema,
  email_otp: z
    .string()
    .length(6, { message: "Email OTP must be 6 digits long" })
    .regex(OTP_REGEX, 'Email OTP must contain only numbers')
    .optional(),
  phone_otp: z
    .string()
    .length(6, { message: "Phone OTP must be 6 digits long" })
    .regex(OTP_REGEX, 'Phone OTP must contain only numbers')
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