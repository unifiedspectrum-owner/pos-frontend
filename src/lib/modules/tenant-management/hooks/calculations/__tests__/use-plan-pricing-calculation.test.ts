/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

/* Tenant module imports */
import { usePlanPricingCalculation } from '../use-plan-pricing-calculation'
import { AssignedPlanDetails, PlanBillingCycle } from '@tenant-management/types'
import { PLAN_BILLING_CYCLES } from '@tenant-management/constants'

describe('usePlanPricingCalculation', () => {
  const mockAssignedPlanData: AssignedPlanDetails = {
    plan: {
      id: 1,
      name: 'Professional Plan',
      description: 'Professional features',
      features: [],
      is_featured: false,
      is_active: true,
      is_custom: false,
      display_order: 1,
      monthly_price: 100,
      included_branches_count: 3,
      annual_discount_percentage: 20,
      add_ons: []
    },
    billingCycle: 'monthly',
    branchCount: 3,
    branches: [
      { branchIndex: 0, branchName: 'Branch 1', isSelected: false },
      { branchIndex: 1, branchName: 'Branch 2', isSelected: false },
      { branchIndex: 2, branchName: 'Branch 3', isSelected: false }
    ],
    add_ons: [
      {
        addon_id: 1,
        addon_name: 'Advanced Reporting',
        addon_price: 50,
        pricing_scope: 'organization' as const,
        branches: [],
        is_included: false
      },
      {
        addon_id: 2,
        addon_name: 'Extra Storage',
        addon_price: 30,
        pricing_scope: 'branch' as const,
        branches: [],
        is_included: false
      },
      {
        addon_id: 3,
        addon_name: 'Free Feature',
        addon_price: 25,
        pricing_scope: 'organization' as const,
        branches: [],
        is_included: true
      }
    ]
  }

  describe('Hook Initialization', () => {
    it('returns default values when no data provided', () => {
      const { result } = renderHook(() => usePlanPricingCalculation(null, null))

      expect(result.current.planTotalAmount).toBe(0)
      expect(result.current.organizationAddonsTotal).toBe(0)
      expect(result.current.branchAddonsTotal).toBe(0)
      expect(result.current.grandTotal).toBe(0)
      expect(typeof result.current.calculateSingleAddonPrice).toBe('function')
    })

    it('returns default values when assignedPlanData is null', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(null, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.planTotalAmount).toBe(0)
      expect(result.current.grandTotal).toBe(0)
    })

    it('returns default values when billingCycle is null', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, null)
      )

      expect(result.current.planTotalAmount).toBe(0)
      expect(result.current.grandTotal).toBe(0)
    })

    it('provides calculateSingleAddonPrice function that returns 0 when data is null', () => {
      const { result } = renderHook(() => usePlanPricingCalculation(null, null))

      expect(result.current.calculateSingleAddonPrice(100)).toBe(0)
    })
  })

  describe('Monthly Billing Calculations', () => {
    it('calculates plan total amount for monthly billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[0])
      )

      /* monthly_price (100) * included_branches_count (3) = 300 */
      expect(result.current.planTotalAmount).toBe(300)
    })

    it('calculates organization addons total for monthly billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[0])
      )

      /* Only addon 1 (50), addon 3 is included so not counted */
      expect(result.current.organizationAddonsTotal).toBe(50)
    })

    it('calculates branch addons total for monthly billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[0])
      )

      /* Only addon 2 (30) */
      expect(result.current.branchAddonsTotal).toBe(30)
    })

    it('calculates grand total for monthly billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[0])
      )

      /* plan (300) + org addons (50) + branch addons (30) = 380 */
      expect(result.current.grandTotal).toBe(380)
    })

    it('calculates single addon price for monthly billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.calculateSingleAddonPrice(100)).toBe(100)
    })
  })

  describe('Annual Billing Calculations', () => {
    it('calculates plan total amount for annual billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[1])
      )

      /* monthly_price (100) * 12 * (1 - 0.20) = 960, then * 3 branches = 2880 */
      expect(result.current.planTotalAmount).toBe(2880)
    })

    it('calculates organization addons total for annual billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[1])
      )

      /* monthly (50) * 12 * (1 - 0.20) = 480 */
      expect(result.current.organizationAddonsTotal).toBe(480)
    })

    it('calculates branch addons total for annual billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[1])
      )

      /* monthly (30) * 12 * (1 - 0.20) = 288 */
      expect(result.current.branchAddonsTotal).toBe(288)
    })

    it('calculates grand total for annual billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[1])
      )

      /* plan (2880) + org addons (480) + branch addons (288) = 3648 */
      expect(result.current.grandTotal).toBe(3648)
    })

    it('calculates single addon price for annual billing', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[1])
      )

      /* 100 * 12 * (1 - 0.20) = 960 */
      expect(result.current.calculateSingleAddonPrice(100)).toBe(960)
    })
  })

  describe('Discount Calculations', () => {
    it('applies annual discount correctly', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[1])
      )

      /* With 20% discount, annual should be 80% of monthly * 12 */
      const monthlyTotal = 100 * 3 * 12 /* 3600 */
      const expectedAnnual = Math.floor(monthlyTotal * 0.8) /* 2880 */

      expect(result.current.planTotalAmount).toBe(expectedAnnual)
    })

    it('handles zero discount percentage', () => {
      const dataWithNoDiscount: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          annual_discount_percentage: 0
        }
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithNoDiscount, PLAN_BILLING_CYCLES[1])
      )

      /* 100 * 12 * 3 = 3600 (no discount) */
      expect(result.current.planTotalAmount).toBe(3600)
    })

    it('handles high discount percentage', () => {
      const dataWithHighDiscount: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          annual_discount_percentage: 50
        }
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithHighDiscount, PLAN_BILLING_CYCLES[1])
      )

      /* 100 * 12 * 0.5 * 3 = 1800 */
      expect(result.current.planTotalAmount).toBe(1800)
    })
  })

  describe('Addon Filtering', () => {
    it('excludes included addons from calculations', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[0])
      )

      /* Addon 3 (25) is included, so org addons total should be 50 (only addon 1) */
      expect(result.current.organizationAddonsTotal).toBe(50)
    })

    it('separates organization and branch addons correctly', () => {
      const { result } = renderHook(() =>
        usePlanPricingCalculation(mockAssignedPlanData, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.organizationAddonsTotal).toBe(50)
      expect(result.current.branchAddonsTotal).toBe(30)
    })

    it('handles empty addons array', () => {
      const dataWithNoAddons: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        add_ons: []
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithNoAddons, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.organizationAddonsTotal).toBe(0)
      expect(result.current.branchAddonsTotal).toBe(0)
    })

    it('handles undefined addons', () => {
      const dataWithUndefinedAddons: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        add_ons: undefined as any
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithUndefinedAddons, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.organizationAddonsTotal).toBe(0)
      expect(result.current.branchAddonsTotal).toBe(0)
    })

    it('handles only organization addons', () => {
      const dataWithOrgAddonsOnly: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        add_ons: [
          {
            addon_id: 1,
            addon_name: 'Org Addon 1',
            addon_price: 40,
            pricing_scope: 'organization' as const,
            branches: [],
            is_included: false
          },
          {
            addon_id: 2,
            addon_name: 'Org Addon 2',
            addon_price: 60,
            pricing_scope: 'organization' as const,
            branches: [],
            is_included: false
          }
        ]
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithOrgAddonsOnly, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.organizationAddonsTotal).toBe(100)
      expect(result.current.branchAddonsTotal).toBe(0)
    })

    it('handles only branch addons', () => {
      const dataWithBranchAddonsOnly: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        add_ons: [
          {
            addon_id: 1,
            addon_name: 'Branch Addon 1',
            addon_price: 20,
            pricing_scope: 'branch' as const,
            branches: [],
            is_included: false
          },
          {
            addon_id: 2,
            addon_name: 'Branch Addon 2',
            addon_price: 35,
            pricing_scope: 'branch' as const,
            branches: [],
            is_included: false
          }
        ]
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithBranchAddonsOnly, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.organizationAddonsTotal).toBe(0)
      expect(result.current.branchAddonsTotal).toBe(55)
    })
  })

  describe('Edge Cases', () => {
    it('handles zero monthly price', () => {
      const dataWithZeroPrice: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          monthly_price: 0
        }
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithZeroPrice, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.planTotalAmount).toBe(0)
    })

    it('handles undefined monthly price', () => {
      const dataWithUndefinedPrice: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          monthly_price: undefined as any
        }
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithUndefinedPrice, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.planTotalAmount).toBe(0)
    })

    it('handles undefined annual discount percentage', () => {
      const dataWithUndefinedDiscount: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          annual_discount_percentage: undefined as any
        }
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithUndefinedDiscount, PLAN_BILLING_CYCLES[1])
      )

      /* Should use 0% discount: 100 * 12 * 3 = 3600 */
      expect(result.current.planTotalAmount).toBe(3600)
    })

    it('handles single branch count', () => {
      const dataWithOneBranch: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          included_branches_count: 1
        }
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithOneBranch, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.planTotalAmount).toBe(100)
    })

    it('handles large branch count', () => {
      const dataWithManyBranches: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          included_branches_count: 100
        }
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithManyBranches, PLAN_BILLING_CYCLES[0])
      )

      expect(result.current.planTotalAmount).toBe(10000)
    })

    it('uses Math.floor for annual calculations', () => {
      const dataWithDecimalResult: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          monthly_price: 33,
          included_branches_count: 1,
          annual_discount_percentage: 15
        }
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(dataWithDecimalResult, PLAN_BILLING_CYCLES[1])
      )

      /* 33 * 12 * 0.85 = 336.6, Math.floor = 336 */
      expect(result.current.planTotalAmount).toBe(336)
    })
  })

  describe('Memoization', () => {
    it('memoizes result when inputs do not change', () => {
      const { result, rerender } = renderHook(
        ({ data, cycle }) => usePlanPricingCalculation(data, cycle),
        {
          initialProps: {
            data: mockAssignedPlanData,
            cycle: PLAN_BILLING_CYCLES[0] as PlanBillingCycle
          }
        }
      )

      const firstResult = result.current

      rerender({
        data: mockAssignedPlanData,
        cycle: PLAN_BILLING_CYCLES[0] as PlanBillingCycle
      })

      expect(result.current).toBe(firstResult)
    })

    it('recalculates when billing cycle changes', () => {
      const { result, rerender } = renderHook(
        ({ data, cycle }) => usePlanPricingCalculation(data, cycle),
        {
          initialProps: {
            data: mockAssignedPlanData,
            cycle: PLAN_BILLING_CYCLES[0] as PlanBillingCycle
          }
        }
      )

      const monthlyTotal = result.current.grandTotal

      rerender({
        data: mockAssignedPlanData,
        cycle: PLAN_BILLING_CYCLES[1] as PlanBillingCycle
      })

      expect(result.current.grandTotal).not.toBe(monthlyTotal)
    })

    it('recalculates when plan data changes', () => {
      const { result, rerender } = renderHook(
        ({ data, cycle }) => usePlanPricingCalculation(data, cycle),
        {
          initialProps: {
            data: mockAssignedPlanData,
            cycle: PLAN_BILLING_CYCLES[0] as PlanBillingCycle
          }
        }
      )

      const firstTotal = result.current.grandTotal

      const newData: AssignedPlanDetails = {
        ...mockAssignedPlanData,
        plan: {
          ...mockAssignedPlanData.plan,
          monthly_price: 200
        }
      }

      rerender({
        data: newData,
        cycle: PLAN_BILLING_CYCLES[0] as PlanBillingCycle
      })

      expect(result.current.grandTotal).not.toBe(firstTotal)
    })
  })

  describe('Complex Scenarios', () => {
    it('calculates correctly with multiple addons of each type', () => {
      const complexData: AssignedPlanDetails = {
        plan: {
          id: 1,
          name: 'Enterprise Plan',
          description: 'Full features',
          features: [],
          is_featured: true,
          is_active: true,
          is_custom: false,
          display_order: 1,
          monthly_price: 500,
          included_branches_count: 10,
          annual_discount_percentage: 25,
          add_ons: []
        },
        billingCycle: 'yearly',
        branchCount: 10,
        branches: Array.from({ length: 10 }, (_, i) => ({
          branchIndex: i,
          branchName: `Branch ${i + 1}`,
          isSelected: false
        })),
        add_ons: [
          { addon_id: 1, addon_name: 'Org 1', addon_price: 100, pricing_scope: 'organization' as const, branches: [], is_included: false },
          { addon_id: 2, addon_name: 'Org 2', addon_price: 150, pricing_scope: 'organization' as const, branches: [], is_included: false },
          { addon_id: 3, addon_name: 'Branch 1', addon_price: 50, pricing_scope: 'branch' as const, branches: [], is_included: false },
          { addon_id: 4, addon_name: 'Branch 2', addon_price: 75, pricing_scope: 'branch' as const, branches: [], is_included: false },
          { addon_id: 5, addon_name: 'Free Org', addon_price: 200, pricing_scope: 'organization' as const, branches: [], is_included: true }
        ]
      }

      const { result } = renderHook(() =>
        usePlanPricingCalculation(complexData, PLAN_BILLING_CYCLES[1])
      )

      /* Plan: 500 * 12 * 0.75 * 10 = 45000 */
      expect(result.current.planTotalAmount).toBe(45000)
      /* Org addons: (100 + 150) * 12 * 0.75 = 2250 */
      expect(result.current.organizationAddonsTotal).toBe(2250)
      /* Branch addons: (50 + 75) * 12 * 0.75 = 1125 */
      expect(result.current.branchAddonsTotal).toBe(1125)
      /* Grand total: 45000 + 2250 + 1125 = 48375 */
      expect(result.current.grandTotal).toBe(48375)
    })
  })
})
