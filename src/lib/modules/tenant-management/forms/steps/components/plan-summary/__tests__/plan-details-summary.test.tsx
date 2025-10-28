/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import PlanDetailsSummary from '../plan-details-summary'
import { AssignedPlanDetails, PlanBillingCycle } from '@tenant-management/types'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'

/* Mock component props interfaces */
interface MockGetBillingCycleLabelProps {
  billingCycle: string
  withExt?: boolean
}

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  getBillingCycleLabel: ({ billingCycle, withExt }: MockGetBillingCycleLabelProps) => {
    const label = billingCycle === 'monthly' ? 'month' : 'year'
    return withExt ? `${label}ly` : label
  }
}))

describe('PlanDetailsSummary', () => {
  const basePlanDetails: AssignedPlanDetails = {
    plan: {
      id: 1,
      name: 'Premium Plan',
      description: 'Premium plan with all features',
      display_order: 1,
      is_active: true,
      is_custom: false,
      is_featured: true,
      monthly_price: 99.99,
      included_branches_count: 5,
      annual_discount_percentage: 10,
      features: [],
      add_ons: []
    },
    billingCycle: PLAN_BILLING_CYCLE.MONTHLY,
    branchCount: 10,
    branches: [],
    add_ons: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render plan details summary', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Plan Details')).toBeInTheDocument()
    })

    it('should display plan name', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Plan Name')).toBeInTheDocument()
      expect(screen.getByText('Premium Plan')).toBeInTheDocument()
    })

    it('should display billing cycle', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Billing Cycle')).toBeInTheDocument()
      expect(screen.getByText('monthly')).toBeInTheDocument()
    })

    it('should display status as Active', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should render the plan icon', () => {
      const { container } = render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Branch Information', () => {
    it('should display branch count information', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branches')).toBeInTheDocument()
      expect(screen.getByText('5 of 10 used')).toBeInTheDocument()
    })

    it('should display correct branch count when all branches used', () => {
      const planDetails = {
        ...basePlanDetails,
        plan: {
          ...basePlanDetails.plan,
          included_branches_count: 10
        },
        branchCount: 10
      }

      render(
        <PlanDetailsSummary
          planDetails={planDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('10 of 10 used')).toBeInTheDocument()
    })

    it('should display correct branch count when no branches used', () => {
      const planDetails = {
        ...basePlanDetails,
        plan: {
          ...basePlanDetails.plan,
          included_branches_count: 0
        },
        branchCount: 10
      }

      render(
        <PlanDetailsSummary
          planDetails={planDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('0 of 10 used')).toBeInTheDocument()
    })
  })

  describe('Pricing Information', () => {
    it('should display plan total amount', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\$99\.99/)).toBeInTheDocument()
    })

    it('should format amount with two decimal places', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.995}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\$100\.00/)).toBeInTheDocument()
    })

    it('should display billing cycle with monthly price', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\/month/)).toBeInTheDocument()
    })

    it('should display billing cycle with yearly price', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
          planTotalAMount={999.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\/year/)).toBeInTheDocument()
    })

    it('should handle zero amount', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={0}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument()
    })

    it('should handle large amounts', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={999999.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\$999999\.99/)).toBeInTheDocument()
    })
  })

  describe('Billing Cycle', () => {
    it('should display monthly billing cycle', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('monthly')).toBeInTheDocument()
    })

    it('should display yearly billing cycle', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
          planTotalAMount={999.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('yearly')).toBeInTheDocument()
    })

    it('should display billing cycle in price label for monthly', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\/month/)).toBeInTheDocument()
    })

    it('should display billing cycle in price label for yearly', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
          planTotalAMount={999.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\/year/)).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render in a flex container', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Plan')).toBeInTheDocument()
      expect(screen.getByText('$99.99')).toBeInTheDocument()
    })

    it('should display separator', () => {
      render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Plan Details')).toBeInTheDocument()
      expect(screen.getByText('Plan Name')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should accept all required props', () => {
      expect(() =>
        render(
          <PlanDetailsSummary
            planDetails={basePlanDetails}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            planTotalAMount={99.99}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should update when plan details change', () => {
      const { rerender } = render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Plan')).toBeInTheDocument()

      const updatedPlanDetails = {
        ...basePlanDetails,
        plan: {
          ...basePlanDetails.plan,
          name: 'Enterprise Plan'
        }
      }

      rerender(
        <TestWrapper>
          <PlanDetailsSummary
            planDetails={updatedPlanDetails}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            planTotalAMount={99.99}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument()
    })

    it('should update when billing cycle changes', () => {
      const { rerender } = render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('monthly')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <PlanDetailsSummary
            planDetails={basePlanDetails}
            billingCycle={PLAN_BILLING_CYCLE.YEARLY}
            planTotalAMount={999.99}
          />
        </TestWrapper>
      )

      expect(screen.getByText('yearly')).toBeInTheDocument()
      expect(screen.queryByText('monthly')).not.toBeInTheDocument()
    })

    it('should update when amount changes', () => {
      const { rerender } = render(
        <PlanDetailsSummary
          planDetails={basePlanDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\$99\.99/)).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <PlanDetailsSummary
            planDetails={basePlanDetails}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            planTotalAMount={149.99}
          />
        </TestWrapper>
      )

      expect(screen.getByText(/\$149\.99/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without errors', () => {
      expect(() =>
        render(
          <PlanDetailsSummary
            planDetails={basePlanDetails}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            planTotalAMount={99.99}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should handle plan with very long name', () => {
      const planDetails = {
        ...basePlanDetails,
        plan: {
          ...basePlanDetails.plan,
          name: 'Very Long Enterprise Premium Business Plan Name That Exceeds Normal Length'
        }
      }

      render(
        <PlanDetailsSummary
          planDetails={planDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Very Long Enterprise Premium Business Plan Name That Exceeds Normal Length')).toBeInTheDocument()
    })

    it('should handle high branch counts', () => {
      const planDetails = {
        ...basePlanDetails,
        plan: {
          ...basePlanDetails.plan,
          included_branches_count: 999
        },
        branchCount: 1000
      }

      render(
        <PlanDetailsSummary
          planDetails={planDetails}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planTotalAMount={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('999 of 1000 used')).toBeInTheDocument()
    })
  })
})
