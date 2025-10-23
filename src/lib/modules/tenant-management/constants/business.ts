/* Business configuration constants */

/* Tenant module imports */
import { PlanBillingCycle } from '@tenant-management/types'

/* Billing cycle constants */
export const PLAN_BILLING_CYCLE = {
  MONTHLY: "monthly",
  YEARLY: "yearly"
} as const

/* Available billing cycle options */
export const PLAN_BILLING_CYCLES: PlanBillingCycle[] = [PLAN_BILLING_CYCLE.MONTHLY, PLAN_BILLING_CYCLE.YEARLY];

/* Add-on pricing scope constants */
export const ADDON_PRICING_SCOPE = {
  ORGANIZATION: "organization",
  BRANCH: "branch"
} as const

/* Maximum number of branches allowed per account (system limit) */
export const MAX_BRANCH_COUNT = 100;

/* Tenant status constants */
export const TENANT_STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  HOLD: 'hold',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  TRIAL: 'trial',
  SETUP: 'setup',
  PENDING_VERIFICATION: 'pending_verification',
  INACTIVE: 'inactive'
} as const

/* Subscription status constants */
export const SUBSCRIPTION_STATUS = {
  ALL: 'all',
  SETUP: 'setup',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  TRIAL: 'trial',
  INCOMPLETE: 'incomplete',
  SUSPENDED: 'suspended',
  PAUSED: 'paused',
  NONE: 'none'
} as const

/* Filter options for tenant table */
export const TENANT_STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: TENANT_STATUS.ALL },
  { label: 'Active', value: TENANT_STATUS.ACTIVE },
  { label: 'Hold', value: TENANT_STATUS.HOLD },
  { label: 'Suspended', value: TENANT_STATUS.SUSPENDED },
  { label: 'Cancelled', value: TENANT_STATUS.CANCELLED },
  { label: 'Trial', value: TENANT_STATUS.TRIAL },
  { label: 'Setup', value: TENANT_STATUS.SETUP },
  { label: 'Pending Verification', value: TENANT_STATUS.PENDING_VERIFICATION },
  { label: 'Inactive', value: TENANT_STATUS.INACTIVE },
] as const

/* Subscription status filter options */
export const TENANT_SUBSCRIPTION_FILTER_OPTIONS = [
  { label: 'All Subscriptions', value: SUBSCRIPTION_STATUS.ALL },
  { label: 'Setup', value: SUBSCRIPTION_STATUS.SETUP },
  { label: 'Active', value: SUBSCRIPTION_STATUS.ACTIVE },
  { label: 'Past Due', value: SUBSCRIPTION_STATUS.PAST_DUE },
  { label: 'Cancelled', value: SUBSCRIPTION_STATUS.CANCELLED },
  { label: 'Trial', value: SUBSCRIPTION_STATUS.TRIAL },
  { label: 'Incomplete', value: SUBSCRIPTION_STATUS.INCOMPLETE },
  { label: 'Suspended', value: SUBSCRIPTION_STATUS.SUSPENDED },
  { label: 'Paused', value: SUBSCRIPTION_STATUS.PAUSED },
  { label: 'No Subscription', value: SUBSCRIPTION_STATUS.NONE },
] as const
