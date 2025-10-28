/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import OrganizationAddonsSummary from '../organization-addons-summary'
import { AssignedAddonDetails } from '@tenant-management/types'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'

/* Mock component props interfaces */
interface MockGetBillingCycleLabelProps {
  billingCycle: string
}

interface MockEmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
}

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  getBillingCycleLabel: ({ billingCycle }: MockGetBillingCycleLabelProps) =>
    billingCycle === 'monthly' ? 'month' : 'year'
}))

/* Mock shared components */
vi.mock('@shared/components/common', () => ({
  EmptyStateContainer: ({ title, description, icon }: MockEmptyStateProps) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
      {icon && <div data-testid="empty-icon">{icon}</div>}
    </div>
  )
}))

describe('OrganizationAddonsSummary', () => {
  const mockAddon1: AssignedAddonDetails = {
    assignment_id: 1,
    tenant_id: 'tenant-1',
    branch_id: null,
    addon_id: 1,
    addon_name: 'Advanced Reporting',
    addon_description: 'Comprehensive reporting suite',
    addon_price: 49.99,
    pricing_scope: 'organization',
    status: 'active',
    feature_level: 'basic',
    billing_cycle: PLAN_BILLING_CYCLE.MONTHLY
  }

  const mockAddon2: AssignedAddonDetails = {
    assignment_id: 2,
    tenant_id: 'tenant-1',
    branch_id: null,
    addon_id: 2,
    addon_name: 'API Access',
    addon_description: 'Full API integration capabilities',
    addon_price: 29.99,
    pricing_scope: 'organization',
    status: 'active',
    feature_level: 'basic',
    billing_cycle: PLAN_BILLING_CYCLE.MONTHLY
  }

  const mockCalculatePrice = vi.fn((price: number) => price)

  beforeEach(() => {
    vi.clearAllMocks()
    mockCalculatePrice.mockImplementation((price: number) => price)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render organization addons summary', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization Add-ons (1)')).toBeInTheDocument()
    })

    it('should display header with addon count', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1, mockAddon2]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization Add-ons (2)')).toBeInTheDocument()
    })

    it('should display header with zero count when empty', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization Add-ons (0)')).toBeInTheDocument()
    })

    it('should render the organization icon', () => {
      const { container } = render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Total Cost Calculation', () => {
    it('should calculate total cost for single addon', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      const prices = screen.getAllByText(/\$49\.99/)
      expect(prices.length).toBeGreaterThan(0)
    })

    it('should calculate total cost for multiple addons', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1, mockAddon2]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\$79\.98/)).toBeInTheDocument()
    })

    it('should use calculateSingleAddonPrice function', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(mockCalculatePrice).toHaveBeenCalledWith(49.99)
    })

    it('should not display total cost when no addons', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
    })

    it('should format total with two decimal places', () => {
      const addonWithDecimal = { ...mockAddon1, addon_price: 49.995 }
      mockCalculatePrice.mockReturnValue(49.995)

      render(
        <OrganizationAddonsSummary
          organizationAddons={[addonWithDecimal]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
    })
  })

  describe('Billing Cycle', () => {
    it('should display monthly billing cycle', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\/month/)).toBeInTheDocument()
    })

    it('should display yearly billing cycle', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\/year/)).toBeInTheDocument()
    })

    it('should not display billing cycle when no addons', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/\/month/)).not.toBeInTheDocument()
    })
  })

  describe('Addon Display', () => {
    it('should display addon name and description', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive reporting suite')).toBeInTheDocument()
    })

    it('should display addon price', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      const prices = screen.getAllByText('$49.99')
      expect(prices.length).toBeGreaterThan(0)
    })

    it('should display multiple addons', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1, mockAddon2]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.getByText('API Access')).toBeInTheDocument()
    })

    it('should format individual addon prices with two decimals', () => {
      const addonWithDecimal = { ...mockAddon1, addon_price: 49.999 }
      mockCalculatePrice.mockReturnValue(49.999)

      render(
        <OrganizationAddonsSummary
          organizationAddons={[addonWithDecimal]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      const prices = screen.getAllByText('$50.00')
      expect(prices.length).toBeGreaterThan(0)
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no addons', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should display empty state title', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('No Organization Add-ons')).toBeInTheDocument()
    })

    it('should display empty state description', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/This plan doesn't include any organization-level add-ons/)).toBeInTheDocument()
    })

    it('should not display addon cards when empty', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Advanced Reporting')).not.toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should accept all required props', () => {
      expect(() =>
        render(
          <OrganizationAddonsSummary
            organizationAddons={[mockAddon1]}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            calculateSingleAddonPrice={mockCalculatePrice}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should update when addons change', () => {
      const { rerender } = render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization Add-ons (1)')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <OrganizationAddonsSummary
            organizationAddons={[mockAddon1, mockAddon2]}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            calculateSingleAddonPrice={mockCalculatePrice}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Organization Add-ons (2)')).toBeInTheDocument()
    })

    it('should update when billing cycle changes', () => {
      const { rerender } = render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\/month/)).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <OrganizationAddonsSummary
            organizationAddons={[mockAddon1]}
            billingCycle={PLAN_BILLING_CYCLE.YEARLY}
            calculateSingleAddonPrice={mockCalculatePrice}
          />
        </TestWrapper>
      )

      expect(screen.getByText(/\/year/)).toBeInTheDocument()
      expect(screen.queryByText(/\/month/)).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle large number of addons', () => {
      const manyAddons = Array.from({ length: 50 }, (_, i) => ({
        ...mockAddon1,
        assignment_id: i + 1,
        addon_id: i + 1,
        addon_name: `Addon ${i + 1}`
      }))

      render(
        <OrganizationAddonsSummary
          organizationAddons={manyAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization Add-ons (50)')).toBeInTheDocument()
    })

    it('should handle zero price addon', () => {
      const freeAddon = { ...mockAddon1, addon_price: 0 }
      mockCalculatePrice.mockReturnValue(0)

      render(
        <OrganizationAddonsSummary
          organizationAddons={[freeAddon]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      const zeroPrices = screen.getAllByText('$0.00')
      expect(zeroPrices.length).toBeGreaterThan(0)
    })

    it('should handle very long addon names', () => {
      const longNameAddon = {
        ...mockAddon1,
        addon_name: 'Very Long Organization Level Enterprise Premium Advanced Reporting and Analytics Suite'
      }

      render(
        <OrganizationAddonsSummary
          organizationAddons={[longNameAddon]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Very Long Organization Level Enterprise Premium Advanced Reporting and Analytics Suite')).toBeInTheDocument()
    })

    it('should handle very long descriptions', () => {
      const longDescAddon = {
        ...mockAddon1,
        addon_description: 'This is a very long description that explains in great detail what this organization-level addon provides to the customer including all features and capabilities'
      }

      render(
        <OrganizationAddonsSummary
          organizationAddons={[longDescAddon]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument()
    })

    it('should render without errors', () => {
      expect(() =>
        render(
          <OrganizationAddonsSummary
            organizationAddons={[mockAddon1]}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            calculateSingleAddonPrice={mockCalculatePrice}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })
  })

  describe('Layout', () => {
    it('should render in a flex container', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive reporting suite')).toBeInTheDocument()
    })

    it('should display separator', () => {
      render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization Add-ons (1)')).toBeInTheDocument()
      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
    })

    it('should use correct width class', () => {
      const { container } = render(
        <OrganizationAddonsSummary
          organizationAddons={[mockAddon1]}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
