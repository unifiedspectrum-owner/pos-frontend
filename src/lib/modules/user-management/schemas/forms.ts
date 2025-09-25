/* Form validation schemas for user management */

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

  /* User account status management */
  is_2fa_enabled: z.boolean(),

  module_assignments: z.array(z.object({
    module_id: z.string().min(1, 'Module ID is required'),
    can_create: z.boolean(),
    can_read: z.boolean(),
    can_update: z.boolean(),
    can_delete: z.boolean(),
  })).optional(),

  is_active: z.boolean(),
});

/* Schema for updating existing user */
export const updateUserSchema = createUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/* TypeScript type definitions inferred from validation schemas */

/* Main form data type */
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;