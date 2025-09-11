/* Billing cycle formatting utilities */

/* Tenant module imports */
import { PlanBillingCycle } from '@tenant-management/types/subscription'
import { PLAN_BILLING_CYCLE } from '../../constants'

/* Get formatted billing cycle name */
export const getBillingCycleName = (cycle: PlanBillingCycle): string => {
  switch (cycle) {
    case PLAN_BILLING_CYCLE.MONTHLY:
      return 'Monthly'
    case PLAN_BILLING_CYCLE.YEARLY:
      return 'Yearly'
    default:
      return 'Month'
  }
}

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

/* Get billing cycle abbreviation */
export const getBillingCycleAbbreviation = (cycle: PlanBillingCycle): string => {
  switch (cycle) {
    case 'monthly':
      return 'Mo'
    case 'yearly':
      return 'Yr'
    default:
      return ''
  }
}

/* Get billing cycle period description */
export const getBillingCyclePeriod = (cycle: PlanBillingCycle): string => {
  switch (cycle) {
    case 'monthly':
      return 'per month'
    case 'yearly':
      return 'per year'
    default:
      return ''
  }
}