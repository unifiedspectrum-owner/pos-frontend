/* Libraries imports */
import { z } from 'zod'

/* Create role form validation schema */
export const createRoleSchema = z.object({
  /* Role basic information */
  name: z.string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Role name must contain only letters and spaces'),

  code: z.string()
    .min(2, 'Role code must be at least 2 characters')
    .max(20, 'Role code must not exceed 20 characters'),
    //.regex(/^[A-Z_]+$/, 'Role code must contain only uppercase letters and underscores'),

  display_name: z.string()
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

/* Role info tab fields */
export const roleInfoSchema = createRoleSchema.pick({
  name: true,
  code: true,
  display_name: true,
  description: true,
  is_active: true
})

/* Module assignments tab fields */
export const moduleAssignmentsSchema = createRoleSchema.pick({
  module_assignments: true
})

/* Generate field keys dynamically from schemas */
export const ROLE_INFO_FIELD_KEYS = Object.keys(roleInfoSchema.shape) as Array<keyof typeof roleInfoSchema.shape>
export const MODULE_ASSIGNMENTS_FIELD_KEYS = Object.keys(moduleAssignmentsSchema.shape) as Array<keyof typeof moduleAssignmentsSchema.shape>

/* TypeScript types from schemas */
export type CreateRoleFormData = z.infer<typeof createRoleSchema>
export type RoleInfoFormData = z.infer<typeof roleInfoSchema>
export type ModuleAssignmentsFormData = z.infer<typeof moduleAssignmentsSchema>