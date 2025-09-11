/* Tenant subscription pricing calculation utilities */

/* Plan module imports */

/* Tenant module imports */
import { PlanBillingCycle } from '@tenant-management/types'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'

/* Get billing cycle display label */
export const getBillingCycleLabel = (billingCycle: PlanBillingCycle, extension: boolean = false): string => {
  if (extension) {
    return billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? '/monthly' : '/yearly'
  }
  return billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? '/month' : '/year'
}