/* Imports */
import { Plan } from '@/lib/modules/plan-management/types/plans'
import { PlanBillingCycle, SelectedAddon } from '../types'
import { PLAN_BILLING_CYCLES } from '../constants'

/* Calculate plan price based on billing cycle and discounts */
export const calculatePlanPrice = (plan: Plan, billingCycle: PlanBillingCycle): number => {
  const monthlyPrice = plan.monthly_price
  
  if (billingCycle === PLAN_BILLING_CYCLES[1]) {
    /* Apply annual discount if available */
    const yearlyDiscount = plan.annual_discount_percentage || 0
    return Math.floor(monthlyPrice * 12 * (1 - yearlyDiscount / 100))
  }
  
  return monthlyPrice
}

/* Format plan price with appropriate currency and time unit */
export const formatPlanPriceLabel = (plan: Plan, billingCycle: PlanBillingCycle): string => {
  const price = calculatePlanPrice(plan, billingCycle)
  const suffix = billingCycle === PLAN_BILLING_CYCLES[1] ? 'year' : 'month'
  return `$${price}/${suffix}`
}

/* Calculate cost for a single addon based on pricing scope and branch selections */
export const calculateAddonCost = (addon: SelectedAddon): number => {
  /* No cost for included addons */
  if (addon.isIncluded) return 0
  
  /* Organization-scoped addons have flat pricing */
  if (addon.pricingScope === 'organization') {
    return addon.addonPrice
  }
  
  /* Branch-scoped addons multiply by selected branch count */
  const selectedBranchCount = addon.branches.filter(b => b.isSelected).length
  return addon.addonPrice * selectedBranchCount
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
export const formatBillingCycleLabel = (cycle: PlanBillingCycle): string => {
  return cycle.charAt(0).toUpperCase() + cycle.slice(1)
}