/* Filter options for tenant table */
export const TENANT_STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Trial', value: 'trial' },
  { label: 'Setup', value: 'setup' },
] as const

/* Subscription status filter options */
export const TENANT_SUBSCRIPTION_FILTER_OPTIONS = [
  { label: 'All Subscriptions', value: 'all' },
  { label: 'Setup', value: 'setup' },
  { label: 'Active', value: 'active' },
  { label: 'Past Due', value: 'past_due' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Trialing', value: 'trialing' },
  { label: 'Incomplete', value: 'incomplete' },
  { label: 'Suspend', value: 'suspend' },
  { label: 'Paused', value: 'paused' },
  { label: 'No Subscription', value: 'none' },
] as const

/* Tenant status values for conditional logic */
export const TENANT_STATUS_VALUES = {           
  ACTIVE: 'active',
  HOLD: 'hold',
  SUSPENDED: 'suspended',
} as const  