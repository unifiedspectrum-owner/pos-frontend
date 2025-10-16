/* Libraries imports */
import { z } from 'zod'

/* SLA validation schemas for creation */

/* SLA creation validation */
export const createSlaSchema = z.object({
  name: z.string()
    .min(1, 'SLA name is required')
    .max(100, 'SLA name must be less than 100 characters')
    .default(''),
  support_channel: z.string()
    .min(1, 'Support channel is required')
    .max(50, 'Support channel must be less than 50 characters')
    .default(''),
  response_time_hours: z.string()
    .min(1, 'Response time is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }, 'Response time must be a positive integer')
    .default(''),
  availability_schedule: z.string()
    .min(1, 'Availability schedule is required')
    .max(100, 'Availability schedule must be less than 100 characters')
    .default(''),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .nullable()
    .default('')
})

/* TypeScript type definitions inferred from validation schemas */

/* SLA creation form data type */
export type CreateSlaFormData = z.infer<typeof createSlaSchema>
