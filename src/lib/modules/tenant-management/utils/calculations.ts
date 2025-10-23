/* Pricing and billing calculation utilities */

/* Plan module imports */
import { Addon, Plan } from '@plan-management/types'

/* Tenant module imports */
import { PlanBillingCycle, SelectedAddon } from '@tenant-management/types'
import { ADDON_PRICING_SCOPE, MAX_BRANCH_COUNT, PLAN_BILLING_CYCLE } from '@tenant-management/constants'

/* ==================== Plan Pricing Calculations ==================== */

/* Calculate base plan price based on billing cycle */
export const calculatePlanPrice = (plan: Plan, billingCycle: PlanBillingCycle, branchCount: number): number => {
  const basePrice = plan.monthly_price * branchCount
  if (billingCycle === PLAN_BILLING_CYCLE.YEARLY) {
    /* Calculate yearly price with discount */
    const yearlyPrice = basePrice * 12 * (1 - plan.annual_discount_percentage / 100)
    return Number(yearlyPrice.toFixed(2))
  }
  return Number(basePrice.toFixed(2))
}

/* Calculate discounted annual price */
export const calculateDiscountedPrice = (plan: Plan, billingCycle: PlanBillingCycle, branchCount: number): number => {
  if (billingCycle !== PLAN_BILLING_CYCLE.YEARLY) return calculatePlanPrice(plan, billingCycle, branchCount)

  const monthlyTotal = plan.monthly_price * branchCount * 12
  const annualPrice = calculatePlanPrice(plan, billingCycle, branchCount)
  const discountPrice = monthlyTotal - annualPrice
  return Number(discountPrice.toFixed(2))
}

/* ==================== Addon Pricing Calculations ==================== */

/* Calculate individual addon price */
export const calculateAddonPrice = (
  addon: SelectedAddon | Addon,
  billingCycle: PlanBillingCycle,
  branchCount: number,
  addonDiscountPercentage: number = 0
): number => {
  if (addon.is_included) {
    return Number((0).toFixed(2))
  }

  const safeBranchCount = Math.max(branchCount, MAX_BRANCH_COUNT)
  const basePrice = addon.addon_price
  console.log("basePrice", basePrice)
  /* Calculate yearly price with discount if needed */
  let displayPrice = basePrice
  if (billingCycle === PLAN_BILLING_CYCLE.YEARLY) {
    displayPrice = basePrice * 12 * (1 - addonDiscountPercentage / 100)
  }

  if (addon.pricing_scope === ADDON_PRICING_SCOPE.ORGANIZATION) {
    return Number(displayPrice.toFixed(2))
  }

  return Number((displayPrice * safeBranchCount).toFixed(2))
}

/* Calculate organization-scoped addons price */
export const calculateOrganizationAddonsPrice = (
  selectedAddons: SelectedAddon[],
  billingCycle: PlanBillingCycle,
  branchCount: number,
  addonDiscountPercentage: number = 0
): number => {
  return selectedAddons
    .filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.ORGANIZATION)
    .reduce((total, selectedAddon) => {
      const addonPrice = calculateAddonPrice(selectedAddon, billingCycle, branchCount, addonDiscountPercentage)
      return total + addonPrice
    }, 0)
}

/* Calculate branch-scoped addons price */
export const calculateBranchAddonsPrice = (
  selectedAddons: SelectedAddon[],
  billingCycle: PlanBillingCycle,
  branchCount: number,
  addonDiscountPercentage: number = 0
): number => {
  return selectedAddons
    .filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.BRANCH)
    .reduce((total, selectedAddon) => {
      const addonPrice = calculateAddonPrice(selectedAddon, billingCycle, branchCount, addonDiscountPercentage)
      return total + addonPrice
    }, 0)
}

/* Calculate total price for all selected addons */
export const calculateTotalAddonsPrice = (
  selectedAddons: SelectedAddon[],
  billingCycle: PlanBillingCycle,
  branchCount: number,
  addonDiscountPercentage: number = 0
): number => {
  const orgAddonsPrice = calculateOrganizationAddonsPrice(selectedAddons, billingCycle, branchCount, addonDiscountPercentage)
  const branchAddonsPrice = calculateBranchAddonsPrice(selectedAddons, billingCycle, branchCount, addonDiscountPercentage)
  return orgAddonsPrice + branchAddonsPrice
}

/* Calculate total price (plan + addons) */
export const calculateTotalPrice = (
  plan: Plan,
  selectedAddons: SelectedAddon[],
  billingCycle: PlanBillingCycle,
  branchCount: number,
  addonDiscountPercentage: number = 0
): number => {
  const planPrice = calculatePlanPrice(plan, billingCycle, branchCount)
  const addonsPrice = calculateTotalAddonsPrice(selectedAddons, billingCycle, branchCount, addonDiscountPercentage)
  return planPrice + addonsPrice
}

/* Calculate monthly savings for annual billing */
export const calculateMonthlySavings = (
  plan: Plan,
  selectedAddons: SelectedAddon[],
  billingCycle: PlanBillingCycle,
  branchCount: number,
  addonDiscountPercentage: number = 0
): number => {
  if (billingCycle !== PLAN_BILLING_CYCLE.YEARLY) return 0

  const monthlyTotal = (plan.monthly_price * branchCount * 12) +
                      (selectedAddons.reduce((total, selectedAddon) => {
                        return total + (selectedAddon.addon_price || 0) *
                               (selectedAddon.pricing_scope === ADDON_PRICING_SCOPE.ORGANIZATION ? 1 : branchCount) * 12
                      }, 0))

  const annualTotal = calculateTotalPrice(plan, selectedAddons, billingCycle, branchCount, addonDiscountPercentage)
  return monthlyTotal - annualTotal
}

/* Calculate single addon price based on billing cycle with discount application */
export const calculateSingleAddonPrice = (
  monthlyPrice: number,
  billingCycle: PlanBillingCycle,
  discountPercentage: number = 0
): number => {
  /* Return 0 for invalid price */
  if (!monthlyPrice || monthlyPrice <= 0) {
    return Number((0).toFixed(2))
  }

  /* For monthly billing, return the monthly price */
  if (billingCycle === PLAN_BILLING_CYCLE.MONTHLY) {
    return Number(monthlyPrice.toFixed(2))
  }

  /* For yearly billing, calculate annual price with discount */
  const annualPrice = monthlyPrice * 12
  const discountFactor = (1 - discountPercentage/100)
  const discountedAnnualPrice = annualPrice * discountFactor

  return Number(discountedAnnualPrice.toFixed(2))
}

/* Format addon price display label */
export const formatAddonPriceLabel = (
  addon: SelectedAddon | Addon,
  billingCycle: PlanBillingCycle,
  branchCount: number = 1,
  addonDiscountPercentage: number = 0
): string => {
  const price = calculateAddonPrice(addon, billingCycle, branchCount, addonDiscountPercentage)
  const cycle = billingCycle === PLAN_BILLING_CYCLE.MONTHLY ? 'month' : 'year'

  return `$${price.toFixed(2)}/${cycle}`
}

/* ==================== Billing Cycle Formatting ==================== */

/* Get billing cycle label with various format options */
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
