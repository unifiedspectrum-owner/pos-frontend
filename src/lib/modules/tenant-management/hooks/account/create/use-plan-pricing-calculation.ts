/* React hooks */
import { useMemo } from 'react'

/* Tenant module imports */
import { AssignedPlanApiResponse, PlanBillingCycle } from '@tenant-management/types'
import { PLAN_BILLING_CYCLES } from '@tenant-management/constants'

/* Interface for pricing calculation results */
interface PricingCalculationResult {
  planTotalAmount: number
  organizationAddonsTotal: number
  branchAddonsTotal: number
  grandTotal: number
  calculateSingleAddonPrice: (monthlyPrice: number) => number
}

/* Custom hook for calculating plan and addon pricing */
export const usePlanPricingCalculation = (
  assignedPlanData: AssignedPlanApiResponse['data'] | null,
  billingCycle: PlanBillingCycle | null
): PricingCalculationResult => {
  
  const pricingCalculation = useMemo(() => {
    /* Return zero values and default functions if data is not available */
    if (!assignedPlanData || !billingCycle) {
      return {
        planTotalAmount: 0,
        organizationAddonsTotal: 0,
        branchAddonsTotal: 0,
        grandTotal: 0,
        calculateSingleAddonPrice: () => 0,
      }
    }

    const planDetails = assignedPlanData.plan_details
    const addonDetails = assignedPlanData.addon_details

    /* Calculate base plan pricing */
    const monthlyPrice = planDetails?.monthly_price || 0
    const annualDiscountPercent = planDetails?.annual_discount_percentage || 0
    const annualPrice = Math.floor(monthlyPrice * 12 * (1 - annualDiscountPercent / 100))
    const planPrice = billingCycle === PLAN_BILLING_CYCLES[1] ? annualPrice : monthlyPrice
    const planTotalAmount = planPrice * planDetails.current_branches_count

    /* Utility function to calculate single addon price with billing cycle adjustment */
    const calculateSingleAddonPrice = (addonMonthlyPrice: number): number => {
      if (billingCycle === PLAN_BILLING_CYCLES[1]) {
        return Math.floor(addonMonthlyPrice * 12 * (1 - annualDiscountPercent / 100))
      }
      return addonMonthlyPrice
    }

    /* Calculate organization addons total cost */
    const orgAddons = addonDetails?.organization_addons
    const orgAddonsMonthlyTotal = Array.isArray(orgAddons) 
      ? orgAddons.reduce((sum, addon) => sum + addon.addon_price, 0) 
      : 0
    const orgAddonsAnnualTotal = Math.floor(orgAddonsMonthlyTotal * 12 * (1 - annualDiscountPercent / 100))
    const organizationAddonsTotal = billingCycle === PLAN_BILLING_CYCLES[1] ? orgAddonsAnnualTotal : orgAddonsMonthlyTotal

    /* Calculate branch addons total cost */
    const branchAddons = addonDetails?.branch_addons
    let branchAddonsMonthlyTotal = 0
    
    if (branchAddons && typeof branchAddons === 'object') {
      /* Flatten all branch addons and calculate total */
      branchAddonsMonthlyTotal = Object.values(branchAddons).flat().reduce((sum, addon) => sum + addon.addon_price, 0)
    }
    
    const branchAddonsAnnualTotal = Math.floor(branchAddonsMonthlyTotal * 12 * (1 - annualDiscountPercent / 100))
    const branchAddonsTotal = billingCycle === PLAN_BILLING_CYCLES[1] ? branchAddonsAnnualTotal : branchAddonsMonthlyTotal

    /* Calculate grand total */
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