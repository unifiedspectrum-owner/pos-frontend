/* Tenant module imports */
import { PlanBillingCycle } from "@tenant-management/types"

/* Billing cycle constants */
export const PLAN_BILLING_CYCLE = {
  MONTHLY: "monthly",
  YEARLY: "yearly"
} satisfies Record<string, PlanBillingCycle>

/* Available billing cycle options */
export const PLAN_BILLING_CYCLES: PlanBillingCycle[] = [PLAN_BILLING_CYCLE.MONTHLY, PLAN_BILLING_CYCLE.YEARLY];

/* Add-on pricing scope constants */
export const ADDON_PRICING_SCOPE = {
  ORGANIZATION: "organization",
  BRANCH: "branch"
} as const

/* Maximum number of branches allowed per account (system limit) */
export const MAX_BRANCH_COUNT = 100;

/* Plan data cache configuration */
export const PLANS_CACHE_CONFIG = {
  KEY: 'cached_subscription_plans',
  TIMESTAMP_KEY: 'cached_subscription_plans_timestamp',
  DURATION: 5 * 60 * 1000 /* 5 minutes */
} as const;