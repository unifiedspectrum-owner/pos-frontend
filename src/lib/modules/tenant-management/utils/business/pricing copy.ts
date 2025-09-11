/* Tenant subscription pricing calculation utilities */

/* Plan module imports */
import { Plan, Addon } from '@plan-management/types/plans'

/* Tenant module imports */
import { PlanBillingCycle, SelectedAddon } from '@tenant-management/types'
import { PLAN_BILLING_CYCLES, MAX_BRANCH_COUNT, PLAN_BILLING_CYCLE } from '@tenant-management/constants'

/* Calculate plan price based on billing cycle and discounts */
export const calculatePlanPrice = (plan: Plan, billingCycle: PlanBillingCycle, branchCount: number, isSelected: boolean = false): number => {
  const monthlyPrice = plan.monthly_price
  /* Limit branch count to prevent overflow and memory issues */
  const safeBranchCount = Math.min(Math.max(1, branchCount), MAX_BRANCH_COUNT)
  
  if (billingCycle === PLAN_BILLING_CYCLES[1]) {
    /* Apply annual discount if available */
    const yearlyDiscount = plan.annual_discount_percentage || 0
    const yearlyPrice = Math.floor(monthlyPrice * 12 * (1 - yearlyDiscount / 100));
    return isSelected ? yearlyPrice * safeBranchCount : yearlyPrice;
  }
  
  return isSelected ? monthlyPrice * safeBranchCount : monthlyPrice;
}

/* Get billing cycle display label */
export const getBillingCycleLabel = (billingCycle: PlanBillingCycle, extension: boolean = false): string => {
  if (extension) {
    return billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? '/monthly' : '/yearly'
  }
  return billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? '/month' : '/year'
}

/* Format plan price with appropriate currency and time unit */
export const getPlanPriceDisplayText = (plan: Plan, billingCycle: PlanBillingCycle, branchCount: number, isSelected: boolean = false): string => {
  const price = calculatePlanPrice(plan, billingCycle, branchCount, isSelected);
  const suffix = billingCycle === PLAN_BILLING_CYCLES[1] ? 'year' : 'month'
  return `$${price}/${suffix}`
}

/* Calculate cost for a single addon based on pricing scope and branch selections */
export const calculateAddonCost = (addon: SelectedAddon): number => {
  /* No cost for included addons */
  if (addon.is_included) return 0
  
  /* Organization-scoped addons have flat pricing */
  if (addon.pricing_scope === 'organization') {
    return addon.addon_price
  }
  
  /* Branch-scoped addons multiply by selected branch count */
  const selectedBranchCount = addon.branches.filter(b => b.isSelected).length
  return addon.addon_price * selectedBranchCount
}

/* Calculate total cost of all selected addons */
export const calculateTotalSelectedAddonsCost = (selectedAddons: SelectedAddon[]): number => {
  return selectedAddons.reduce((total, addon) => total + calculateAddonCost(addon), 0)
}

/* Apply billing cycle discount to any amount */
export const applyBillingCycleDiscount = (
  amount: number, 
  billingCycle: PlanBillingCycle, 
  discountPercentage: number = 0
): number => {
  if (billingCycle === PLAN_BILLING_CYCLES[1] && discountPercentage > 0) {
    /* Apply discount to annual amount */
    return Math.floor(amount * 12 * (1 - discountPercentage / 100))
  }
  /* Return annual or monthly amount without discount */
  return billingCycle === PLAN_BILLING_CYCLES[1] ? amount * 12 : amount
}

/* Format billing cycle for display with proper capitalization */
export const getBillingCycleDisplayText = (cycle: PlanBillingCycle): string => {
  return cycle.charAt(0).toUpperCase() + cycle.slice(1)
}


/* Format addon price with billing cycle and plan discount */
export const formatAddonPrice = (
  addon: Addon, 
  billingCycle: PlanBillingCycle, 
  planDiscountPercentage: number = 0
): string => {
  const price = applyBillingCycleDiscount(addon.add_on_price, billingCycle, planDiscountPercentage)
  const suffix = billingCycle === 'yearly' ? 'year' : 'month'
  return `$${price}/${suffix}`
}