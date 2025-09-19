/* Form validation schemas for role management */

/* Libraries imports */
import { z } from 'zod'

/* Create role form validation schema */
export const createRoleSchema = z.object({
  /* Role basic information */
  name: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must not exceed 50 characters'),

  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),

  module_assignments: z.array(z.object({
    module_id: z.string().min(1, 'Module ID is required'),
    can_create: z.boolean(),
    can_read: z.boolean(),
    can_update: z.boolean(),
    can_delete: z.boolean(),
  })),

  is_active: z.boolean()
})

/* Update role form validation schema (partial) */
export const updateRoleSchema = createRoleSchema.partial()

/* TypeScript types from schemas */
export type CreateRoleFormData = z.infer<typeof createRoleSchema>
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>