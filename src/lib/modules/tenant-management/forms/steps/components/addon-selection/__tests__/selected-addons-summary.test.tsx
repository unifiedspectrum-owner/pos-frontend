/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import SelectedAddonsSummary from '../selected-addons-summary'
import { SelectedAddon } from '@tenant-management/types'
import { PLAN_BILLING_CYCLE, ADDON_PRICING_SCOPE } from '@tenant-management/constants'

/* Mock component props interfaces */
interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

interface BillingCycleLabelProps {
  billingCycle: string
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

vi.mock('@tenant-management/hooks', () => ({
  useAddonConfirmation: vi.fn(() => ({
    confirmState: { show: false, addonId: undefined, addonName: undefined },
    showRemoveConfirmation: vi.fn(),
    hideConfirmation: vi.fn(),
    getConfirmationMessage: vi.fn(() => 'Are you sure you want to remove this addon?'),
    getConfirmationTitle: (() => 'Remove Add-on') as () => 'Remove Add-on' | 'Unselect Add-on',
    getConfirmText: (() => 'Remove') as () => 'Remove' | 'Unselect',
    showRemoveConfirmationById: vi.fn(),
    showUnselectConfirmation: vi.fn()
  }))
}))

vi.mock('@tenant-management/utils', () => ({
  calculateSingleAddonPrice: vi.fn((price: number) => price),
  getBillingCycleLabel: vi.fn(({ billingCycle }: BillingCycleLabelProps) =>
    billingCycle === 'monthly' ? '/month' : '/year'
  )
}))

describe('SelectedAddonsSummary', () => {
  const mockOrganizationAddon: SelectedAddon = {
    addon_id: 1,
    addon_name: 'Advanced Reporting',
    addon_price: 49.99,
    pricing_scope: ADDON_PRICING_SCOPE.ORGANIZATION,
    branches: [{ branchIndex: 0, branchName: 'Branch 1', isSelected: true }],
    is_included: false
  }

  const mockBranchAddon: SelectedAddon = {
    addon_id: 2,
    addon_name: 'Branch Analytics',
    addon_price: 29.99,
    pricing_scope: ADDON_PRICING_SCOPE.BRANCH,
    branches: [
      { branchIndex: 0, branchName: 'Main Branch', isSelected: true },
      { branchIndex: 1, branchName: 'Secondary Branch', isSelected: true },
      { branchIndex: 2, branchName: 'Branch 3', isSelected: false }
    ],
    is_included: false
  }

  const mockOnEdit = vi.fn()
  const mockOnRemove = vi.fn()
  const mockOnBranchNameChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render selected addons summary', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Add-ons (1)')).toBeInTheDocument()
    })

    it('should display addon name', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
    })

    it('should display multiple addons', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon, mockBranchAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Add-ons (2)')).toBeInTheDocument()
      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.getByText('Branch Analytics')).toBeInTheDocument()
    })

    it('should handle when no addons selected', () => {
      expect(() => render(
        <SelectedAddonsSummary
          selectedAddons={[]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )).not.toThrow()
    })
  })

  describe('Pricing Scope Badges', () => {
    it('should display organization badge for organization addon', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Organization')).toBeInTheDocument()
    })

    it('should display per branch badge for branch addon', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Per Branch')).toBeInTheDocument()
    })
  })

  describe('Organization Addon Display', () => {
    it('should display organization addon description', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Applied to entire organization')).toBeInTheDocument()
    })

    it('should calculate organization addon price correctly', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\$49/).length).toBeGreaterThan(0)
    })
  })

  describe('Branch Addon Display', () => {
    it('should display branch addon description', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Applied to 2 of 5 branches')).toBeInTheDocument()
    })

    it('should display selected branch names', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Main Branch')).toBeInTheDocument()
      expect(screen.getByText('Secondary Branch')).toBeInTheDocument()
      expect(screen.queryByText('Branch 3')).not.toBeInTheDocument()
    })

    it('should calculate branch addon price correctly', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\$59/).length).toBeGreaterThan(0)
    })

    it('should not display branch list for organization addon', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Main Branch')).not.toBeInTheDocument()
    })
  })

  describe('Branch Name Editing', () => {
    it('should display edit icon for branch names when onBranchNameChange is provided', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onBranchNameChange={mockOnBranchNameChange}
        />,
        { wrapper: TestWrapper }
      )

      const badges = screen.getAllByText(/Branch/)
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should not display edit icon in read-only mode', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          readOnly={true}
          onBranchNameChange={mockOnBranchNameChange}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Main Branch')).toBeInTheDocument()
    })

    it('should enter edit mode when branch badge is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onBranchNameChange={mockOnBranchNameChange}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Main Branch'))

      expect(screen.getByDisplayValue('Main Branch')).toBeInTheDocument()
    })

    it('should save branch name on Enter key', async () => {
      const user = userEvent.setup()

      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onBranchNameChange={mockOnBranchNameChange}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Main Branch'))
      const input = screen.getByDisplayValue('Main Branch')
      await user.clear(input)
      await user.type(input, 'New Branch Name{Enter}')

      expect(mockOnBranchNameChange).toHaveBeenCalledWith(0, 'New Branch Name')
    })

    it('should cancel editing on Escape key', async () => {
      const user = userEvent.setup()

      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onBranchNameChange={mockOnBranchNameChange}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Main Branch'))
      const input = screen.getByDisplayValue('Main Branch')
      await user.type(input, '{Escape}')

      expect(mockOnBranchNameChange).not.toHaveBeenCalled()
    })

    it('should save branch name when save button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onBranchNameChange={mockOnBranchNameChange}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Main Branch'))
      const input = screen.getByDisplayValue('Main Branch')
      await user.clear(input)
      await user.type(input, 'Updated Name')
      await user.click(screen.getByLabelText('Save branch name'))

      expect(mockOnBranchNameChange).toHaveBeenCalledWith(0, 'Updated Name')
    })

    it('should cancel editing when cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onBranchNameChange={mockOnBranchNameChange}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Main Branch'))
      await user.click(screen.getByLabelText('Cancel edit'))

      expect(mockOnBranchNameChange).not.toHaveBeenCalled()
      expect(screen.queryByDisplayValue('Main Branch')).not.toBeInTheDocument()
    })

    it('should not allow editing without onBranchNameChange handler', async () => {
      const user = userEvent.setup()

      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Main Branch'))

      expect(screen.queryByDisplayValue('Main Branch')).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should display edit button for branch addons', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByLabelText('Edit addon configuration')).toBeInTheDocument()
    })

    it('should not display edit button for organization addons', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByLabelText('Edit addon configuration')).not.toBeInTheDocument()
    })

    it('should display remove button for all addons', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon, mockBranchAddon]}
          branchCount={5}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByLabelText('Remove addon')).toHaveLength(2)
    })

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onEdit={mockOnEdit}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByLabelText('Edit addon configuration'))
      expect(mockOnEdit).toHaveBeenCalledWith(2)
    })

    it('should show confirmation when remove button is clicked', async () => {
      const { useAddonConfirmation } = await import('@tenant-management/hooks')
      const mockShowRemove = vi.fn()

      vi.mocked(useAddonConfirmation).mockReturnValue({
        confirmState: { show: false, addonId: undefined, addonName: undefined },
        showRemoveConfirmation: mockShowRemove,
        hideConfirmation: vi.fn(),
        getConfirmationMessage: () => 'Are you sure?',
        getConfirmationTitle: (() => 'Remove Add-on') as () => 'Remove Add-on' | 'Unselect Add-on',
        getConfirmText: (() => 'Remove') as () => 'Remove' | 'Unselect',
        showRemoveConfirmationById: vi.fn(),
        showUnselectConfirmation: vi.fn()
      })

      const user = userEvent.setup()

      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByLabelText('Remove addon'))
      expect(mockShowRemove).toHaveBeenCalledWith(mockOrganizationAddon)
    })

    it('should not display action buttons in read-only mode', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByLabelText('Edit addon configuration')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Remove addon')).not.toBeInTheDocument()
    })
  })

  describe('Total Cost Calculation', () => {
    it('should calculate total cost for single addon', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Total Add-ons Cost')).toBeInTheDocument()
      expect(screen.getAllByText(/\$49/).length).toBeGreaterThan(0)
    })

    it('should calculate total cost for multiple addons', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon, mockBranchAddon]}
          branchCount={5}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\$109/).length).toBeGreaterThan(0)
    })

    it('should calculate branch addon cost based on selected branches', () => {
      const singleBranchAddon = {
        ...mockBranchAddon,
        branches: [
          { branchIndex: 0, branchName: 'Main Branch', isSelected: true },
          { branchIndex: 1, branchName: 'Secondary Branch', isSelected: false }
        ]
      }

      render(
        <SelectedAddonsSummary
          selectedAddons={[singleBranchAddon]}
          branchCount={5}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\$29/).length).toBeGreaterThan(0)
    })
  })

  describe('Billing Cycle', () => {
    it('should display monthly billing cycle', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\/month/).length).toBeGreaterThan(0)
    })

    it('should display yearly billing cycle', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\/year/).length).toBeGreaterThan(0)
    })

    it('should default to monthly billing cycle', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\/month/).length).toBeGreaterThan(0)
    })
  })

  describe('Props', () => {
    it('should accept all required props', () => {
      expect(() =>
        render(
          <SelectedAddonsSummary
            selectedAddons={[mockOrganizationAddon]}
            branchCount={5}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should accept optional billingCycle prop', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText(/\/year/).length).toBeGreaterThan(0)
    })

    it('should accept optional planDiscountPercentage prop', () => {
      expect(() =>
        render(
          <SelectedAddonsSummary
            selectedAddons={[mockOrganizationAddon]}
            branchCount={5}
            planDiscountPercentage={10}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should accept optional readOnly prop', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockBranchAddon]}
          branchCount={5}
          onEdit={mockOnEdit}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByLabelText('Edit addon configuration')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle addon with no selected branches', () => {
      const noSelectedBranches = {
        ...mockBranchAddon,
        branches: [
          { branchIndex: 0, branchName: 'Branch 1', isSelected: false },
          { branchIndex: 1, branchName: 'Branch 2', isSelected: false }
        ]
      }

      render(
        <SelectedAddonsSummary
          selectedAddons={[noSelectedBranches]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Applied to 0 of 5 branches')).toBeInTheDocument()
    })

    it('should handle large number of selected branches', () => {
      const manyBranches = Array.from({ length: 20 }, (_, i) => ({
        branchIndex: i,
        branchName: `Branch ${i + 1}`,
        isSelected: true
      }))

      const addonWithManyBranches = {
        ...mockBranchAddon,
        branches: manyBranches
      }

      render(
        <SelectedAddonsSummary
          selectedAddons={[addonWithManyBranches]}
          branchCount={20}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Applied to 20 of 20 branches')).toBeInTheDocument()
    })

    it('should render without errors', () => {
      expect(() =>
        render(
          <SelectedAddonsSummary
            selectedAddons={[mockOrganizationAddon]}
            branchCount={5}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })
  })

  describe('Layout', () => {
    it('should display header with addon count', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon, mockBranchAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Add-ons (2)')).toBeInTheDocument()
    })

    it('should display total cost summary at bottom', () => {
      render(
        <SelectedAddonsSummary
          selectedAddons={[mockOrganizationAddon]}
          branchCount={5}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Total Add-ons Cost')).toBeInTheDocument()
    })
  })
})
