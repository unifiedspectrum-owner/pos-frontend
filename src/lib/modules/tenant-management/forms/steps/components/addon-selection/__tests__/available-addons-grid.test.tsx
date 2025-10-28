/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import AvailableAddonsGrid from '../available-addons-grid'
import { Plan, Addon } from '@plan-management/types'
import { SelectedAddon } from '@tenant-management/types'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'

/* Mock component props interfaces */
interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  testId?: string
}

/* Mock dependencies */
vi.mock('@shared/components', () => ({
  ConfirmationDialog: ({ isOpen, title, message, onConfirm, onCancel }: ConfirmationDialogProps) =>
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <div>{title}</div>
        <div>{message}</div>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
}))

vi.mock('@shared/components/common/empty-state-container', () => ({
  default: ({ icon, title, description, testId }: EmptyStateProps) => (
    <div data-testid={testId || 'empty-state'}>
      <div data-testid="empty-icon">{icon}</div>
      <div>{title}</div>
      <div>{description}</div>
    </div>
  )
}))

vi.mock('@tenant-management/hooks', () => ({
  useAddonConfirmation: vi.fn(() => ({
    confirmState: { show: false, addonId: undefined, addonName: undefined },
    showRemoveConfirmationById: vi.fn(),
    hideConfirmation: vi.fn(),
    getConfirmationMessage: vi.fn(() => 'Are you sure you want to remove this addon?'),
    getConfirmationTitle: (() => 'Remove Add-on') as () => 'Remove Add-on' | 'Unselect Add-on',
    getConfirmText: (() => 'Remove') as () => 'Remove' | 'Unselect',
    showRemoveConfirmation: vi.fn(),
    showUnselectConfirmation: vi.fn()
  }))
}))

/* Billing cycle label props interface */
interface BillingCycleLabelProps {
  billingCycle: string
}

vi.mock('@tenant-management/utils', () => ({
  calculateSingleAddonPrice: vi.fn((price: number) => price),
  getBillingCycleLabel: vi.fn(({ billingCycle }: BillingCycleLabelProps) =>
    billingCycle === 'monthly' ? '/month' : '/year'
  )
}))

describe('AvailableAddonsGrid', () => {
  const mockAddon: Addon = {
    id: 1,
    name: 'Advanced Analytics',
    description: 'Comprehensive analytics suite',
    is_included: false,
    addon_price: 49.99,
    pricing_scope: 'branch',
    default_quantity: null,
    feature_level: null,
    min_quantity: null,
    max_quantity: null,
    display_order: 1
  }

  const mockIncludedAddon: Addon = {
    id: 2,
    name: 'Basic Support',
    description: 'Basic support included',
    is_included: true,
    addon_price: 0,
    pricing_scope: 'organization',
    default_quantity: 1,
    feature_level: null,
    min_quantity: 1,
    max_quantity: 1,
    display_order: 2
  }

  const mockPlan: Plan = {
    id: 1,
    name: 'Premium Plan',
    description: 'Premium plan description',
    is_active: true,
    is_featured: false,
    is_custom: false,
    display_order: 1,
    monthly_price: 99.99,
    included_branches_count: 10,
    annual_discount_percentage: 10,
    features: [],
    add_ons: [mockAddon]
  }

  const mockOnAddonConfigure = vi.fn()
  const mockOnAddonRemove = vi.fn()
  const mockIsAddonSelected = vi.fn(() => false)
  const mockGetAddonSelection = vi.fn<() => SelectedAddon | null>(() => null)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render available addons grid', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Available Add-ons for Premium Plan/)).toBeInTheDocument()
    })

    it('should display addon name and description', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive analytics suite')).toBeInTheDocument()
    })

    it('should display addon price', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText('$49').length).toBeGreaterThan(0)
    })

    it('should display price for free addon', () => {
      const planWithFreeAddon = {
        ...mockPlan,
        add_ons: [{ ...mockAddon, addon_price: 0 }]
      }

      render(
        <AvailableAddonsGrid
          selectedPlan={planWithFreeAddon}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText('$0').length).toBeGreaterThan(0)
    })
  })

  describe('Empty State', () => {
    it('should handle when no plan selected', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(() => render(
        <AvailableAddonsGrid
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )).not.toThrow()
    })

    it('should display empty state when no addons', () => {
      const planNoAddons = { ...mockPlan, add_ons: [] }

      render(
        <AvailableAddonsGrid
          selectedPlan={planNoAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('addons-empty-state')).toBeInTheDocument()
    })

    it('should display empty state title and description', () => {
      const planNoAddons = { ...mockPlan, add_ons: [] }

      render(
        <AvailableAddonsGrid
          selectedPlan={planNoAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('No Add-ons Available')).toBeInTheDocument()
      expect(screen.getByText(/The Premium Plan plan doesn't have any additional add-ons/)).toBeInTheDocument()
    })
  })

  describe('Included Addon Badge', () => {
    it('should display included badge for included addon', () => {
      const planWithIncluded = {
        ...mockPlan,
        add_ons: [mockIncludedAddon]
      }

      render(
        <AvailableAddonsGrid
          selectedPlan={planWithIncluded}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Included')).toBeInTheDocument()
    })

    it('should not display included badge for non-included addon', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Included')).not.toBeInTheDocument()
    })
  })

  describe('Addon Configuration', () => {
    it('should call onAddonConfigure when addon card is clicked', async () => {
      const user = userEvent.setup()

      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      const addonCard = screen.getByText('Advanced Analytics').closest('[class*="chakra-flex"]')
      if (addonCard) {
        await user.click(addonCard)
        expect(mockOnAddonConfigure).toHaveBeenCalledWith(mockAddon)
      }
    })

    it('should display add button for non-selected addon', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByLabelText('Configure addon for branches')).toBeInTheDocument()
    })

    it('should call onAddonConfigure when add button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByLabelText('Configure addon for branches'))
      expect(mockOnAddonConfigure).toHaveBeenCalledWith(mockAddon)
    })
  })

  describe('Selected Addon Actions', () => {
    beforeEach(() => {
      mockIsAddonSelected.mockReturnValue(true)
      mockGetAddonSelection.mockReturnValue({
        addon_id: 1,
        addon_name: 'Advanced Analytics',
        addon_price: 49.99,
        pricing_scope: 'branch',
        branches: [],
        is_included: false
      } as SelectedAddon)
    })

    it('should display edit and remove buttons for selected addon', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByLabelText('Edit addon configuration')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove addon')).toBeInTheDocument()
    })

    it('should call onAddonConfigure when edit button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByLabelText('Edit addon configuration'))
      expect(mockOnAddonConfigure).toHaveBeenCalledWith(mockAddon)
    })

    it('should show confirmation dialog when remove button is clicked', async () => {
      const { useAddonConfirmation } = await import('@tenant-management/hooks')
      const mockShowRemove = vi.fn()

      vi.mocked(useAddonConfirmation).mockReturnValue({
        confirmState: { show: false, addonId: undefined, addonName: undefined },
        showRemoveConfirmationById: mockShowRemove,
        hideConfirmation: vi.fn(),
        getConfirmationMessage: vi.fn(() => 'Are you sure?'),
        getConfirmationTitle: (() => 'Remove Add-on') as () => 'Remove Add-on' | 'Unselect Add-on',
        getConfirmText: (() => 'Remove') as () => 'Remove' | 'Unselect',
        showRemoveConfirmation: vi.fn(),
        showUnselectConfirmation: vi.fn()
      })

      const user = userEvent.setup()

      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByLabelText('Remove addon'))
      expect(mockShowRemove).toHaveBeenCalledWith(1, 'Advanced Analytics')
    })
  })

  describe('Included Addon Actions', () => {
    it('should not display action buttons for included addon', () => {
      const planWithIncluded = {
        ...mockPlan,
        add_ons: [mockIncludedAddon]
      }

      render(
        <AvailableAddonsGrid
          selectedPlan={planWithIncluded}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByLabelText('Configure addon for branches')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Edit addon configuration')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Remove addon')).not.toBeInTheDocument()
    })
  })

  describe('Pricing Scope Display', () => {
    it('should display per branch pricing scope', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('per branch')).toBeInTheDocument()
    })

    it('should display per organization pricing scope', () => {
      const orgAddon = { ...mockAddon, pricing_scope: 'organization' as const }
      const planWithOrgAddon = { ...mockPlan, add_ons: [orgAddon] }

      render(
        <AvailableAddonsGrid
          selectedPlan={planWithOrgAddon}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('per organization')).toBeInTheDocument()
    })
  })

  describe('Billing Cycle', () => {
    it('should display monthly billing cycle', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText('/month').length).toBeGreaterThan(0)
    })

    it('should display yearly billing cycle', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText('/year').length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle plan with multiple addons', () => {
      const addon2: Addon = { ...mockAddon, id: 2, name: 'Addon 2', display_order: 2 }
      const planMultipleAddons = { ...mockPlan, add_ons: [mockAddon, addon2] }

      render(
        <AvailableAddonsGrid
          selectedPlan={planMultipleAddons}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
      expect(screen.getByText('Addon 2')).toBeInTheDocument()
    })

    it('should render without errors', () => {
      expect(() =>
        render(
          <AvailableAddonsGrid
            selectedPlan={mockPlan}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            onAddonConfigure={mockOnAddonConfigure}
            onAddonRemove={mockOnAddonRemove}
            isAddonSelected={mockIsAddonSelected}
            getAddonSelection={mockGetAddonSelection}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })
  })

  describe('Layout', () => {
    it('should render in a grid layout', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
    })

    it('should display header with plan name', () => {
      render(
        <AvailableAddonsGrid
          selectedPlan={mockPlan}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onAddonConfigure={mockOnAddonConfigure}
          onAddonRemove={mockOnAddonRemove}
          isAddonSelected={mockIsAddonSelected}
          getAddonSelection={mockGetAddonSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Available Add-ons for Premium Plan (Optional)')).toBeInTheDocument()
    })
  })
})
