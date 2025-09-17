/* Shared module imports */
import { PhoneNumberSchema } from "@shared/schema/validation";
import z from "zod/v4";

/* User creation form validation schema */
export const createUserSchema = z.object({
  f_name: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),

  l_name: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),

  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .toLowerCase(),

  phone: PhoneNumberSchema,

  role_id: z.string().min(1, 'Role selection is required'),

  is_active: z.boolean(),
});

/* Schema for updating existing user */
export const updateUserSchema = z.object({
  /* Basic user information - all optional for partial updates */
  f_name: z.string()
    .min(1, 'First name cannot be empty')
    .max(100, 'First name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
    .optional(),

  l_name: z.string()
    .min(1, 'Last name cannot be empty')
    .max(100, 'Last name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
    .optional(),

  email: z
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .toLowerCase()
    .optional(),

  phone: PhoneNumberSchema.optional(),

  /* Role assignment */
  role_id: z.string()
    .min(1, 'Role ID must be an integer')
    .optional(),

  /* User account status management */
  is_active: z.boolean().default(true).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/* TypeScript type definitions inferred from validation schemas */

/* Main form data type */
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
