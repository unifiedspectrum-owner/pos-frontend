/* Billing cycle formatting utilities */

/* Tenant module imports */
import { PlanBillingCycle } from '@tenant-management/types/subscription'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'

export const getBillingCycleLabel = ({
  billingCycle, 
  withExt = false,
  capitalize = false,
  isCyclePeriod = false
}: {billingCycle: PlanBillingCycle, withExt?: boolean, capitalize?: boolean, isCyclePeriod?: boolean}): string => {
  if (withExt) {
    return billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? '/monthly' : '/yearly'
  } else if (capitalize) {
    return billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? 'Monthly' : 'Yearly'
  } else if (isCyclePeriod) {
    return billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? 'per month' : 'per year'
  }
  return billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? '/month' : '/year'
}

