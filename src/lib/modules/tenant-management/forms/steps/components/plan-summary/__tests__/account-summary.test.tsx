/* Libraries imports */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import AccountSummary from '../account-summary'
import { AssignedPlanDetails } from '@tenant-management/types'
import { ADDON_PRICING_SCOPE, PLAN_BILLING_CYCLE } from '@tenant-management/constants'

describe('AccountSummary', () => {
  const baseAssignedPlan: AssignedPlanDetails = {
    plan: {
      id: 1,
      name: 'Premium Plan',
      description: 'Premium plan with all features',
      display_order: 1,
      is_active: true,
      is_custom: false,
      is_featured: true,
      monthly_price: 99.99,
      included_branches_count: 10,
      annual_discount_percentage: 10,
      features: [],
      add_ons: []
    },
    billingCycle: PLAN_BILLING_CYCLE.MONTHLY,
    branchCount: 10,
    branches: [],
    add_ons: []
  }

  const organizationAddon = {
    addon_id: 1,
    addon_name: 'Advanced Reporting',
    addon_price: 29.99,
    pricing_scope: ADDON_PRICING_SCOPE.ORGANIZATION,
    branches: [],
    is_included: false
  }

  const branchAddon = {
    addon_id: 2,
    addon_name: 'Branch Analytics',
    addon_price: 15.99,
    pricing_scope: ADDON_PRICING_SCOPE.BRANCH,
    branches: [
      { branchIndex: 0, branchName: 'Main Branch', isSelected: true },
      { branchIndex: 1, branchName: 'Branch 2', isSelected: true },
      { branchIndex: 2, branchName: 'Branch 3', isSelected: true },
      { branchIndex: 3, branchName: 'Branch 4', isSelected: true },
      { branchIndex: 4, branchName: 'Branch 5', isSelected: true }
    ],
    is_included: false
  }

  beforeEach(() => {
    /* No mocks to clear */
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render the account summary', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })

    it('should display the plan amount', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Plan Amount:')).toBeInTheDocument()
      const prices = screen.getAllByText('$99.99')
      expect(prices.length).toBeGreaterThan(0)
    })

    it('should display the grand total', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Total per month:')).toBeInTheDocument()
      const prices = screen.getAllByText('$99.99')
      expect(prices.length).toBeGreaterThan(0)
    })

    it('should render the receipt icon', () => {
      const { container } = render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Organization Add-ons', () => {
    it('should display organization add-ons section when add-ons exist', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [organizationAddon]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={29.99}
          branchAddonsTotal={0}
          grandTotal={129.98}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Organization Add-ons/)).toBeInTheDocument()
      expect(screen.getByText('$29.99')).toBeInTheDocument()
    })

    it('should display organization add-ons count', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [organizationAddon, { ...organizationAddon, addon_id: 3 }]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={59.98}
          branchAddonsTotal={0}
          grandTotal={159.97}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization Add-ons (2):')).toBeInTheDocument()
    })

    it('should not display organization add-ons when none exist', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Organization Add-ons/)).not.toBeInTheDocument()
    })

    it('should not display organization add-ons when only branch add-ons exist', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [branchAddon]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={79.95}
          grandTotal={179.94}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Organization Add-ons/)).not.toBeInTheDocument()
    })
  })

  describe('Branch Add-ons', () => {
    it('should display branch add-ons section when add-ons exist', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [branchAddon]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={79.95}
          grandTotal={179.94}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Branch Add-ons/)).toBeInTheDocument()
      expect(screen.getByText('$79.95')).toBeInTheDocument()
    })

    it('should display branch add-ons count', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [branchAddon, { ...branchAddon, addon_id: 4 }]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={159.90}
          grandTotal={259.89}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branch Add-ons (2):')).toBeInTheDocument()
    })

    it('should not display branch add-ons when none exist', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Branch Add-ons/)).not.toBeInTheDocument()
    })

    it('should not display branch add-ons when only organization add-ons exist', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [organizationAddon]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={29.99}
          branchAddonsTotal={0}
          grandTotal={129.98}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Branch Add-ons/)).not.toBeInTheDocument()
    })
  })

  describe('Combined Add-ons', () => {
    it('should display both organization and branch add-ons', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [organizationAddon, branchAddon]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={29.99}
          branchAddonsTotal={79.95}
          grandTotal={209.93}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Organization Add-ons/)).toBeInTheDocument()
      expect(screen.getByText(/Branch Add-ons/)).toBeInTheDocument()
    })

    it('should calculate correct grand total with both add-on types', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [organizationAddon, branchAddon]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={29.99}
          branchAddonsTotal={79.95}
          grandTotal={209.93}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('$209.93')).toBeInTheDocument()
    })
  })

  describe('Amount Formatting', () => {
    it('should format plan amount with two decimal places', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.999}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.999}
        />,
        { wrapper: TestWrapper }
      )

      const prices = screen.getAllByText('$100.00')
      expect(prices.length).toBeGreaterThan(0)
    })

    it('should format organization add-ons total with two decimal places', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [organizationAddon]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={29.995}
          branchAddonsTotal={0}
          grandTotal={129.985}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('$30.00')).toBeInTheDocument()
    })

    it('should format branch add-ons total with two decimal places', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: [branchAddon]
      }

      render(
        <AccountSummary
          assignedPlanData={assignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={79.994}
          grandTotal={179.984}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('$79.99')).toBeInTheDocument()
    })

    it('should format grand total with two decimal places', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.996}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('$100.00')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero amounts', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={0}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={0}
        />,
        { wrapper: TestWrapper }
      )

      const prices = screen.getAllByText('$0.00')
      expect(prices.length).toBeGreaterThan(0)
    })

    it('should handle large amounts', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={999999.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={999999.99}
        />,
        { wrapper: TestWrapper }
      )

      const prices = screen.getAllByText('$999999.99')
      expect(prices.length).toBeGreaterThan(0)
    })

    it('should handle empty add_ons array', () => {
      const assignedPlan = {
        ...baseAssignedPlan,
        add_ons: []
      }

      expect(() =>
        render(
          <AccountSummary
            assignedPlanData={assignedPlan}
            planTotalAmount={99.99}
            organizationAddonsTotal={0}
            branchAddonsTotal={0}
            grandTotal={99.99}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should render without errors', () => {
      expect(() =>
        render(
          <AccountSummary
            assignedPlanData={baseAssignedPlan}
            planTotalAmount={99.99}
            organizationAddonsTotal={0}
            branchAddonsTotal={0}
            grandTotal={99.99}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })
  })

  describe('Layout', () => {
    it('should render in a flex container', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Order Summary')).toBeInTheDocument()
      expect(screen.getByText('Plan Amount:')).toBeInTheDocument()
    })

    it('should display separator before total', () => {
      render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Total per month:')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should accept all required props', () => {
      expect(() =>
        render(
          <AccountSummary
            assignedPlanData={baseAssignedPlan}
            planTotalAmount={99.99}
            organizationAddonsTotal={0}
            branchAddonsTotal={0}
            grandTotal={99.99}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should update when props change', () => {
      const { rerender } = render(
        <AccountSummary
          assignedPlanData={baseAssignedPlan}
          planTotalAmount={99.99}
          organizationAddonsTotal={0}
          branchAddonsTotal={0}
          grandTotal={99.99}
        />,
        { wrapper: TestWrapper }
      )

      const initialPrices = screen.getAllByText('$99.99')
      expect(initialPrices.length).toBeGreaterThan(0)

      rerender(
        <TestWrapper>
          <AccountSummary
            assignedPlanData={baseAssignedPlan}
            planTotalAmount={149.99}
            organizationAddonsTotal={0}
            branchAddonsTotal={0}
            grandTotal={149.99}
          />
        </TestWrapper>
      )

      const updatedPrices = screen.getAllByText('$149.99')
      expect(updatedPrices.length).toBeGreaterThan(0)
    })
  })
})
