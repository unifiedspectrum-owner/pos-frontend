/* Tenant subscription plan assignment validation schemas */

/* External library imports */
import { z } from 'zod/v4';

/* Schema for addon assignment configuration */
export const addonAssignments = z.object({
  addon_id: z.number()
    .int('Addon ID must be an integer')
    .positive('Addon ID must be positive'),
  feature_level: z.enum(['basic', 'premium', 'custom'], {
    error: 'Feature level must be basic, premium, or custom'
  }).optional().default('basic')
});

/* Schema for assigning subscription plan to tenant with addons */
export const assignPlanToTenantSchema = z.object({
  plan_id: z.number()
    .int('Plan ID must be an integer')
    .positive('Plan ID must be positive'),
  billing_cycle: z.enum(['monthly', 'yearly'], {
    error: 'Billing cycle must be either monthly or annual'
  }),
  branches_count: z.number()
    .int('Branches Count must be an integer')
    .positive('Branches must be positive')
    .default(1),
  organization_addon_assignments: z.array(addonAssignments).default([]),
  branch_addon_assignments: z.array(z.object({
    branch_id: z.number()
      .min(1, 'Branch ID is required')
      .positive('Branch ID must be positive'),
    addon_assignments: z.array(addonAssignments)
  })).default([])
});

/* Stripe payment intent ID validation */
export const STRIPE_PAYMENT_INTENT_ID_REGEX = /^pi_[a-zA-Z0-9_]+$/;

/* Schema for completing payment and updating transaction records */
export const completePaymentSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID is required'),
  payment_intent: z.string()
    .min(1, 'Payment intent ID is required')
    .regex(STRIPE_PAYMENT_INTENT_ID_REGEX, 'Payment intent ID must be a valid Stripe payment intent ID (starts with pi_)')
});

export type completeTenantSubscriptionPayment = z.infer<typeof completePaymentSchema>;