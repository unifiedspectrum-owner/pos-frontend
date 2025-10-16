/* Libraries imports */
import { z } from 'zod'

/* Feature validation schemas for creation */

/* Feature creation validation */
export const createFeatureSchema = z.object({
  name: z.string()
    .min(1, 'Feature name is required')
    .max(100, 'Feature name must be less than 100 characters')
    .default(''),
  description: z.string()
    .min(1, 'Feature description is required')
    .max(500, 'Feature description must be less than 500 characters')
    .default('')
})

/* TypeScript type definitions inferred from validation schemas */

/* Feature creation form data type */
export type CreateFeatureFormData = z.infer<typeof createFeatureSchema>
