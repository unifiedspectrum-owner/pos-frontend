/* Libraries imports */
import { useMemo } from 'react'

/* Tenant module imports */
import { AssignedPlanDetails, PlanBillingCycle } from '@tenant-management/types/subscription'
import { PLAN_BILLING_CYCLES } from '@tenant-management/constants'

/* Pricing calculation result interface */
interface PricingCalculationResult {
  planTotalAmount: number
  organizationAddonsTotal: number
  branchAddonsTotal: number
  grandTotal: number
  calculateSingleAddonPrice: (monthlyPrice: number) => number
}

/* Calculate plan and addon pricing with billing cycle adjustments */
export const usePlanPricingCalculation = (
  assignedPlanData: AssignedPlanDetails | null,
  billingCycle: PlanBillingCycle | null
): PricingCalculationResult => {
  
  const pricingCalculation = useMemo(() => {
    /* Return defaults when data unavailable */
    if (!assignedPlanData || !billingCycle) {
      return {
        planTotalAmount: 0,
        organizationAddonsTotal: 0,
        branchAddonsTotal: 0,
        grandTotal: 0,
        calculateSingleAddonPrice: () => 0,
      }
    }

    const planDetails = assignedPlanData.plan
    const addonDetails = assignedPlanData.add_ons

    /* Calculate base plan cost with billing cycle */
    const monthlyPrice = planDetails?.monthly_price || 0
    const annualDiscountPercent = planDetails?.annual_discount_percentage || 0
    const annualPrice = Math.floor(monthlyPrice * 12 * (1 - annualDiscountPercent / 100))
    const planPrice = billingCycle === PLAN_BILLING_CYCLES[1] ? annualPrice : monthlyPrice
    const planTotalAmount = planPrice * planDetails.included_branches_count

    /* Calculate addon price with billing cycle adjustment */
    const calculateSingleAddonPrice = (addonMonthlyPrice: number): number => {
      if (billingCycle === PLAN_BILLING_CYCLES[1]) {
        return Math.floor(addonMonthlyPrice * 12 * (1 - annualDiscountPercent / 100))
      }
      return addonMonthlyPrice
    }

    /* Calculate organization-level addon costs */
    const orgAddons = addonDetails?.filter((addon) => addon.pricing_scope == 'organization');
    const orgAddonsMonthlyTotal = Array.isArray(orgAddons) 
      ? orgAddons.reduce((sum, addon) => sum + (addon.is_included ? 0 : addon.addon_price), 0) 
      : 0
    const orgAddonsAnnualTotal = Math.floor(orgAddonsMonthlyTotal * 12 * (1 - annualDiscountPercent / 100))
    const organizationAddonsTotal = billingCycle === PLAN_BILLING_CYCLES[1] ? orgAddonsAnnualTotal : orgAddonsMonthlyTotal

    /* Calculate branch-level addon costs */
    const branchAddons = addonDetails?.filter((addon) => addon.pricing_scope == 'branch')
    const branchAddonsMonthlyTotal = Array.isArray(branchAddons) 
      ? branchAddons.reduce((sum, addon) => sum + (addon.is_included ? 0 : addon.addon_price), 0) 
      : 0
    
    const branchAddonsAnnualTotal = Math.floor(branchAddonsMonthlyTotal * 12 * (1 - annualDiscountPercent / 100))
    const branchAddonsTotal = billingCycle === PLAN_BILLING_CYCLES[1] ? branchAddonsAnnualTotal : branchAddonsMonthlyTotal

    /* Calculate total subscription cost */
    const grandTotal = planTotalAmount + organizationAddonsTotal + branchAddonsTotal

    return {
      planTotalAmount,
      organizationAddonsTotal,
      branchAddonsTotal,
      grandTotal,
      calculateSingleAddonPrice,
    }
  }, [assignedPlanData, billingCycle])

  return pricingCalculation
}