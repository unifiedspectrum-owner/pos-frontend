/* Libraries imports */
import z from "zod";

/* Shared module imports */
import { DATE_FORMAT_REGEX } from '@shared/constants';

/* Date string validation schema for YYYY-MM-DD format */
const dateStringSchema = z.string()
  .regex(DATE_FORMAT_REGEX, "Date must be in YYYY-MM-DD format");

/* Schema for holding tenant account */
export const holdTenantAccountSchema = z.object({
  reason: z.string().min(1, 'Hold reason is required').max(500),
  hold_until: dateStringSchema.nullable(),
});

/* Schema for suspending tenant account */
export const suspendTenantAccountSchema = z.object({
  reason: z.string().min(1, 'Suspension reason is required').max(500),
  suspend_until: dateStringSchema.nullable(),
});

/* Schema for activating tenant account */
export const activateTenantAccountSchema = z.object({
  reason: z.string().min(1, 'Activation reason is required').max(500),
});

/* TypeScript type definitions inferred from validation schemas */
export type HoldTenantFormData = z.infer<typeof holdTenantAccountSchema>;
export type SuspendTenantFormData = z.infer<typeof suspendTenantAccountSchema>;
export type ActivateTenantFormData = z.infer<typeof activateTenantAccountSchema>;