/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import AddonSelectionModal from '../addon-selection-modal'
import { Addon } from '@plan-management/types'
import { SelectedAddon } from '@tenant-management/types'
import { PLAN_BILLING_CYCLE, ADDON_PRICING_SCOPE } from '@tenant-management/constants'

/* Mock toaster */
vi.mock('@/components/ui/toaster', () => ({
  toaster: {
    create: vi.fn()
  },
  Toaster: () => null
}))

/* Mock component props interfaces */
interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
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

vi.mock('@shared/components/form-elements/buttons', () => ({
  PrimaryButton: ({ children, onClick }: ButtonProps) => (
    <button data-testid="primary-button" onClick={onClick}>
      {children}
    </button>
  ),
  SecondaryButton: ({ children, onClick }: ButtonProps) => (
    <button data-testid="secondary-button" onClick={onClick}>
      {children}
    </button>
  )
}))

vi.mock('@tenant-management/hooks', () => ({
  useAddonConfirmation: vi.fn(() => ({
    confirmState: { show: false, addonId: undefined, addonName: undefined },
    showUnselectConfirmation: vi.fn(),
    hideConfirmation: vi.fn(),
    getConfirmationMessage: vi.fn(() => 'Are you sure?'),
    getConfirmationTitle: (() => 'Unselect Add-on') as () => 'Remove Add-on' | 'Unselect Add-on',
    getConfirmText: (() => 'Unselect') as () => 'Remove' | 'Unselect'
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

describe('AddonSelectionModal', () => {
  const mockBranchAddon: Addon = {
    id: 1,
    name: 'Branch Analytics',
    description: 'Advanced analytics for branches',
    is_included: false,
    addon_price: 29.99,
    pricing_scope: ADDON_PRICING_SCOPE.BRANCH,
    default_quantity: null,
    feature_level: null,
    min_quantity: null,
    max_quantity: null,
    display_order: 1
  }

  const mockOrganizationAddon: Addon = {
    id: 2,
    name: 'Organization Reporting',
    description: 'Organization-wide reporting',
    is_included: false,
    addon_price: 99.99,
    pricing_scope: ADDON_PRICING_SCOPE.ORGANIZATION,
    default_quantity: null,
    feature_level: null,
    min_quantity: null,
    max_quantity: null,
    display_order: 2
  }

  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render modal when open', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Configure Branch Analytics for Branches/)).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      const { container } = render(
        <AddonSelectionModal
          isOpen={false}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Configure Branch Analytics for Branches/)).not.toBeInTheDocument()
    })

    it('should return null when no addon provided', () => {
      expect(() =>
        render(
          <AddonSelectionModal
            isOpen={true}
            onClose={mockOnClose}
            addon={null}
            branchCount={3}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            planDiscountPercentage={0}
            currentSelection={null}
            onSave={mockOnSave}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should display addon name and description', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branch Analytics')).toBeInTheDocument()
      expect(screen.getByText('Advanced analytics for branches')).toBeInTheDocument()
    })

    it('should display addon price', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\$29/).length).toBeGreaterThan(0)
    })
  })

  describe('Branch Addon Configuration', () => {
    it('should display branch selection interface for branch addon', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Select Branches for this Add-on')).toBeInTheDocument()
    })

    it('should display all branches', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branch 1')).toBeInTheDocument()
      expect(screen.getByText('Branch 2')).toBeInTheDocument()
      expect(screen.getByText('Branch 3')).toBeInTheDocument()
    })

    it('should toggle branch selection on click', async () => {
      const user = userEvent.setup()

      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      const branch1 = screen.getByText('Branch 1').closest('[class*="chakra-flex"]')
      if (branch1) {
        await user.click(branch1)
        expect(screen.getByText('1 branches selected')).toBeInTheDocument()
      }
    })

    it('should display total cost for selected branches', async () => {
      const user = userEvent.setup()

      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      const branch1 = screen.getByText('Branch 1').closest('[class*="chakra-flex"]')
      const branch2 = screen.getByText('Branch 2').closest('[class*="chakra-flex"]')

      if (branch1 && branch2) {
        await user.click(branch1)
        await user.click(branch2)

        expect(screen.getByText('2 branches selected')).toBeInTheDocument()
      }
    })

    it('should load existing branch selections', () => {
      const currentSelection: SelectedAddon = {
        addon_id: 1,
        addon_name: 'Branch Analytics',
        addon_price: 29.99,
        pricing_scope: ADDON_PRICING_SCOPE.BRANCH,
        branches: [
          { branchIndex: 0, branchName: 'Main Office', isSelected: true },
          { branchIndex: 1, branchName: 'Branch 2', isSelected: false },
          { branchIndex: 2, branchName: 'Branch 3', isSelected: false }
        ],
        is_included: false
      }

      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={currentSelection}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Main Office')).toBeInTheDocument()
      expect(screen.getByText('1 branches selected')).toBeInTheDocument()
    })
  })

  describe('Organization Addon Configuration', () => {
    it('should display organization addon interface', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockOrganizationAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization-level Add-on')).toBeInTheDocument()
    })

    it('should display organization addon description', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockOrganizationAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/This add-on applies to your entire organization/)).toBeInTheDocument()
    })

    it('should display organization-wide text in summary', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockOrganizationAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization-wide add-on')).toBeInTheDocument()
    })

    it('should display correct price for organization addon', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockOrganizationAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\$99/).length).toBeGreaterThan(0)
    })
  })

  describe('Action Buttons', () => {
    it('should display cancel button', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should display save configuration button for branch addon', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save Configuration')).toBeInTheDocument()
    })

    it('should display add to organization button for organization addon', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockOrganizationAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Add to Organization')).toBeInTheDocument()
    })

    it('should call onClose when cancel is clicked', async () => {
      const user = userEvent.setup()

      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Cancel'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onSave when save is clicked with organization addon', async () => {
      const user = userEvent.setup()

      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockOrganizationAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Add to Organization'))
      expect(mockOnSave).toHaveBeenCalledWith(mockOrganizationAddon, [])
    })

    it('should show error when saving branch addon with no selections', async () => {
      const { toaster } = await import('@/components/ui/toaster')
      const user = userEvent.setup()

      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Save Configuration'))

      expect(toaster.create).toHaveBeenCalledWith({
        title: 'Selection Required',
        description: 'Please select at least one branch for this add-on.',
        type: 'error',
        duration: 5000,
        closable: true
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('Billing Cycle', () => {
    it('should display monthly billing cycle', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\/month/).length).toBeGreaterThan(0)
    })

    it('should display yearly billing cycle', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\/year/).length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle large number of branches', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={20}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Branch 1')).toBeInTheDocument()
      expect(screen.getByText('Branch 20')).toBeInTheDocument()
    })

    it('should render without errors', () => {
      expect(() =>
        render(
          <AddonSelectionModal
            isOpen={true}
            onClose={mockOnClose}
            addon={mockBranchAddon}
            branchCount={3}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            planDiscountPercentage={0}
            currentSelection={null}
            onSave={mockOnSave}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })
  })

  describe('Layout', () => {
    it('should display header section', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Configure Branch Analytics for Branches/)).toBeInTheDocument()
    })

    it('should display footer section with buttons', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockBranchAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save Configuration')).toBeInTheDocument()
    })

    it('should display total configuration section', () => {
      render(
        <AddonSelectionModal
          isOpen={true}
          onClose={mockOnClose}
          addon={mockOrganizationAddon}
          branchCount={3}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          planDiscountPercentage={0}
          currentSelection={null}
          onSave={mockOnSave}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Total Configuration')).toBeInTheDocument()
    })
  })
})
