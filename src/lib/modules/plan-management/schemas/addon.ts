/* Libraries imports */
import { z } from 'zod'

/* Add-on validation schemas for creation */

/* Add-on creation validation */
export const createAddonSchema = z.object({
  name: z.string()
    .min(1, 'Add-on name is required')
    .max(100, 'Add-on name must be less than 100 characters')
    .default(''),
  description: z.string()
    .min(1, 'Add-on description is required')
    .max(500, 'Add-on description must be less than 500 characters')
    .default(''),
  base_price: z.string()
    .refine((val) => {
      if (!val || val === '') return true; /* Optional field */
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Base price must be a non-negative number')
    .default(''),
  pricing_scope: z.enum(['branch', 'organization']).refine(val => val !== undefined, {
    message: 'Pricing scope is required',
  }).default('branch')
})

/* TypeScript type definitions inferred from validation schemas */

/* Add-on creation form data type */
export type CreateAddonFormData = z.infer<typeof createAddonSchema>
