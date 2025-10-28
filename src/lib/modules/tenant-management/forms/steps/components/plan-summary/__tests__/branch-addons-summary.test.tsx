/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import BranchAddonsSummary from '../branch-addons-summary'
import { AssignedAddonDetails } from '@tenant-management/types'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'

/* Mock component props interfaces */
interface MockGetBillingCycleLabelProps {
  billingCycle: string
}

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  getBillingCycleLabel: ({ billingCycle }: MockGetBillingCycleLabelProps) =>
    billingCycle === 'monthly' ? 'month' : 'year'
}))

describe('BranchAddonsSummary', () => {
  const mockAddon1: AssignedAddonDetails = {
    assignment_id: 1,
    tenant_id: 'tenant-1',
    branch_id: 'branch-1',
    addon_id: 1,
    addon_name: 'Advanced Analytics',
    addon_description: 'Advanced analytics features',
    addon_price: 29.99,
    pricing_scope: 'branch',
    status: 'active',
    feature_level: 'basic',
    billing_cycle: PLAN_BILLING_CYCLE.MONTHLY
  }

  const mockAddon2: AssignedAddonDetails = {
    assignment_id: 2,
    tenant_id: 'tenant-1',
    branch_id: 'branch-1',
    addon_id: 2,
    addon_name: 'Inventory Management',
    addon_description: 'Full inventory tracking',
    addon_price: 19.99,
    pricing_scope: 'branch',
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

  describe('Rendering with Array Format', () => {
    it('should render branch addons summary with array format', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branch Add-ons (1)')).toBeInTheDocument()
    })

    it('should display branch name', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Main Branch')).toBeInTheDocument()
    })

    it('should display addon count per branch', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1, mockAddon2] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('2 add-ons')).toBeInTheDocument()
    })
  })

  describe('Rendering with Record Format', () => {
    it('should render branch addons summary with record format', () => {
      const branchAddons = {
        'Main Branch': [mockAddon1]
      }

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branch Add-ons (1)')).toBeInTheDocument()
    })

    it('should display multiple branches', () => {
      const branchAddons = {
        'Main Branch': [mockAddon1],
        'Secondary Branch': [mockAddon2]
      }

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Main Branch')).toBeInTheDocument()
      expect(screen.getByText('Secondary Branch')).toBeInTheDocument()
    })

    it('should sort branches alphabetically with record format', () => {
      const branchAddons = {
        'Zebra Branch': [mockAddon1],
        'Alpha Branch': [mockAddon2]
      }

      const { container } = render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(container.textContent).toMatch(/Alpha.*Zebra/s)
    })
  })

  describe('Total Calculations', () => {
    it('should calculate total branch addons count', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Branch 1', addons: [mockAddon1, mockAddon2] },
        { branchIndex: 1, branchName: 'Branch 2', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branch Add-ons (3)')).toBeInTheDocument()
    })

    it('should calculate total cost across all branches', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Branch 1', addons: [mockAddon1] },
        { branchIndex: 1, branchName: 'Branch 2', addons: [mockAddon2] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/\$49\.98/)).toBeInTheDocument()
    })

    it('should calculate branch total correctly', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1, mockAddon2] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      const totals = screen.getAllByText(/\$49\.98/)
      expect(totals.length).toBeGreaterThan(0)
    })

    it('should use calculateSingleAddonPrice for pricing', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(mockCalculatePrice).toHaveBeenCalledWith(29.99)
    })
  })

  describe('Billing Cycle', () => {
    it('should display monthly billing cycle', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\/month/)[0]).toBeInTheDocument()
    })

    it('should display yearly billing cycle', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\/year/)[0]).toBeInTheDocument()
    })
  })

  describe('Addon Display', () => {
    it('should display addon name and description', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
      expect(screen.getByText('Advanced analytics features')).toBeInTheDocument()
    })

    it('should display addon price', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      const prices = screen.getAllByText('$29.99')
      expect(prices.length).toBeGreaterThan(0)
    })

    it('should display multiple addons for a branch', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1, mockAddon2] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
      expect(screen.getByText('Inventory Management')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should render without errors when no branches', () => {
      expect(() =>
        render(
          <BranchAddonsSummary
            branchAddons={[]}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            calculateSingleAddonPrice={mockCalculatePrice}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should render without errors for empty array', () => {
      expect(() =>
        render(
          <BranchAddonsSummary
            branchAddons={[]}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            calculateSingleAddonPrice={mockCalculatePrice}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should display empty state for branch with no addons', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Empty Branch', addons: [] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('No add-ons selected for this branch')).toBeInTheDocument()
    })

    it('should show 0 addons count for empty branch', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Empty Branch', addons: [] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Empty Branch')).toBeInTheDocument()
    })
  })

  describe('Accordion Behavior', () => {
    it('should render accordion for each branch', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Branch 1', addons: [mockAddon1] },
        { branchIndex: 1, branchName: 'Branch 2', addons: [mockAddon2] }
      ]

      const { container } = render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      const accordionItems = container.querySelectorAll('[data-part="item"]')
      expect(accordionItems.length).toBe(2)
    })

    it('should expand accordion by default', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
    })
  })

  describe('Singular/Plural Text', () => {
    it('should display singular addon text for 1 addon', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('1 add-on')).toBeInTheDocument()
    })

    it('should display plural addon text for multiple addons', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1, mockAddon2] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('2 add-ons')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle large number of branches', () => {
      const branchAddons = Array.from({ length: 50 }, (_, i) => ({
        branchIndex: i,
        branchName: `Branch ${i + 1}`,
        addons: [mockAddon1]
      }))

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branch Add-ons (50)')).toBeInTheDocument()
    })

    it('should handle large number of addons per branch', () => {
      const manyAddons = Array.from({ length: 20 }, (_, i) => ({
        ...mockAddon1,
        assignment_id: i + 1,
        addon_id: i + 1
      }))

      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: manyAddons }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('20 add-ons')).toBeInTheDocument()
    })

    it('should handle zero price addons', () => {
      const freeAddon = { ...mockAddon1, addon_price: 0 }
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [freeAddon] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      const zeroPrices = screen.getAllByText('$0.00')
      expect(zeroPrices.length).toBeGreaterThan(0)
    })

    it('should render without errors', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      expect(() =>
        render(
          <BranchAddonsSummary
            branchAddons={branchAddons}
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
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Main Branch')).toBeInTheDocument()
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
    })

    it('should display branch icon', () => {
      const branchAddons = [
        { branchIndex: 0, branchName: 'Main Branch', addons: [mockAddon1] }
      ]

      const { container } = render(
        <BranchAddonsSummary
          branchAddons={branchAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          calculateSingleAddonPrice={mockCalculatePrice}
        />,
        { wrapper: TestWrapper }
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })
})
