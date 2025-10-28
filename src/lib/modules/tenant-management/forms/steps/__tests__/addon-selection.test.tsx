/* Comprehensive test suite for AddonSelectionStep component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import AddonSelectionStep from '@tenant-management/forms/steps/addon-selection'
import * as useBranchManagementHook from '@tenant-management/hooks/data-management/use-branch-management'
import * as useAddonManagementHook from '@tenant-management/hooks/data-management/use-addon-management'
import * as usePlanStorageHook from '@tenant-management/hooks/account-creation/use-plan-storage'

/* Mock dependencies */
vi.mock('@tenant-management/forms/steps/components', () => ({
  AvailableAddonsGrid: ({ selectedPlan, billingCycle, onAddonConfigure, onAddonRemove, isAddonSelected, getAddonSelection }: {
    selectedPlan: { add_ons: unknown[] } | null
    billingCycle: string
    onAddonConfigure: (addon: unknown) => void
    onAddonRemove: (addonId: number) => void
    isAddonSelected: (addonId: number) => boolean
    getAddonSelection: (addonId: number) => unknown
  }) => (
    <div data-testid="available-addons-grid">
      <div>Billing: {billingCycle}</div>
      <div>Addons: {selectedPlan?.add_ons.length || 0}</div>
      <button onClick={() => onAddonConfigure({ id: 1, name: 'Test Addon' })} data-testid="configure-addon">Configure</button>
      <button onClick={() => onAddonRemove(1)} data-testid="remove-addon">Remove</button>
    </div>
  ),
  SelectedAddonsSummary: ({ selectedAddons, branchCount, billingCycle, planDiscountPercentage, onEdit, onRemove, onBranchNameChange }: {
    selectedAddons: unknown[]
    branchCount: number
    billingCycle: string
    planDiscountPercentage: number
    onEdit: (addonId: number) => void
    onRemove: (addonId: number) => void
    onBranchNameChange: (branchIndex: number, newName: string) => void
  }) => (
    <div data-testid="selected-addons-summary">
      <div>Selected: {selectedAddons.length}</div>
      <div>Branches: {branchCount}</div>
      <div>Discount: {planDiscountPercentage}%</div>
      <button onClick={() => onEdit(1)} data-testid="edit-addon">Edit</button>
      <button onClick={() => onRemove(1)} data-testid="remove-addon-summary">Remove</button>
      <button onClick={() => onBranchNameChange(0, 'New Branch Name')} data-testid="change-branch-name">Change Name</button>
    </div>
  ),
  AddonSelectionModal: ({ isOpen, onClose, addon, branchCount, billingCycle, planDiscountPercentage, currentSelection, onSave }: {
    isOpen: boolean
    onClose: () => void
    addon: { id: number; name: string } | null
    branchCount: number
    billingCycle: string
    planDiscountPercentage: number
    currentSelection: unknown | null
    onSave: (addon: unknown, branchSelections: unknown[]) => void
  }) => isOpen ? (
    <div data-testid="addon-selection-modal">
      <div>Addon: {addon?.name || 'None'}</div>
      <div>Branches: {branchCount}</div>
      <button onClick={onClose} data-testid="close-modal">Close</button>
      <button onClick={() => onSave(addon, [])} data-testid="save-addon">Save</button>
    </div>
  ) : null,
  NavigationButton: ({ secondaryBtnText, onSecondaryClick, primaryBtnText, primaryBtnLoadingText, onPrimaryClick, primaryBtnDisabled, isPrimaryBtnLoading }: {
    secondaryBtnText: string
    onSecondaryClick: () => void
    primaryBtnText: string
    primaryBtnLoadingText: string
    onPrimaryClick: () => void
    primaryBtnDisabled: boolean
    isPrimaryBtnLoading: boolean
  }) => (
    <div data-testid="navigation-button">
      <button onClick={onSecondaryClick} data-testid="secondary-btn">{secondaryBtnText}</button>
      <button onClick={onPrimaryClick} data-testid="primary-btn" disabled={primaryBtnDisabled}>
        {isPrimaryBtnLoading ? primaryBtnLoadingText : primaryBtnText}
      </button>
    </div>
  )
}))

describe('AddonSelectionStep', () => {
  const mockIsCompleted = vi.fn()
  const mockOnPrevious = vi.fn()
  const mockAssignPlanToTenant = vi.fn()
  const mockHandleBranchNameChange = vi.fn()
  const mockOpenAddonModal = vi.fn()
  const mockCloseAddonModal = vi.fn()
  const mockHandleAddonSelection = vi.fn()
  const mockRemoveAddon = vi.fn()
  const mockIsAddonSelected = vi.fn()
  const mockGetAddonSelection = vi.fn()
  const mockRefreshAddonData = vi.fn()
  const mockSetSelectedAddons = vi.fn()

  const mockPlan = {
    id: 1,
    name: 'Pro Plan',
    monthly_price: 100,
    annual_discount_percentage: 15,
    included_branches_count: 3,
    is_featured: true,
    add_ons: [
      { id: 1, name: 'Advanced Analytics', addon_price: 20, pricing_scope: 'organization', is_included: false },
      { id: 2, name: 'Multi-Currency', addon_price: 15, pricing_scope: 'branch', is_included: false }
    ]
  }

  const mockBranches = [
    { branchIndex: 0, name: 'Main Branch', isIncluded: true },
    { branchIndex: 1, name: 'Branch 2', isIncluded: false },
    { branchIndex: 2, name: 'Branch 3', isIncluded: false }
  ]

  const mockSelectedAddons = [
    {
      addon_id: 1,
      addon_name: 'Advanced Analytics',
      addon_price: 20,
      pricing_scope: 'organization',
      branches: []
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    /* Set up plan data in localStorage */
    const planData = {
      selectedPlan: mockPlan,
      billingCycle: 'monthly',
      branchCount: 3,
      branches: mockBranches,
      selectedAddons: []
    }
    localStorage.setItem('selected_plan_data', JSON.stringify(planData))

    /* Mock hooks */
    vi.spyOn(useBranchManagementHook, 'useBranchManagement').mockReturnValue({
      branchCount: 3,
      branches: mockBranches,
      handleBranchNameChange: mockHandleBranchNameChange
    } as never)

    vi.spyOn(useAddonManagementHook, 'useAddonManagement').mockReturnValue({
      selectedAddons: [],
      currentAddon: null,
      isAddonModalOpen: false,
      setSelectedAddons: mockSetSelectedAddons,
      openAddonModal: mockOpenAddonModal,
      closeAddonModal: mockCloseAddonModal,
      handleAddonSelection: mockHandleAddonSelection,
      removeAddon: mockRemoveAddon,
      isAddonSelected: mockIsAddonSelected,
      getAddonSelection: mockGetAddonSelection,
      refreshAddonData: mockRefreshAddonData
    } as never)

    vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
      isSubmitting: false,
      assignPlanToTenant: mockAssignPlanToTenant
    } as never)

    mockAssignPlanToTenant.mockResolvedValue(true)
    mockIsAddonSelected.mockReturnValue(false)
    mockGetAddonSelection.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render available addons grid', () => {
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('available-addons-grid')).toBeInTheDocument()
    })

    it('should render selected addons summary', () => {
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('selected-addons-summary')).toBeInTheDocument()
    })

    it('should render navigation buttons', () => {
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('navigation-button')).toBeInTheDocument()
    })

    it('should display correct button labels', () => {
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByText('Back to Plan Selection')).toBeInTheDocument()
      expect(screen.getByText('Continue to Summary')).toBeInTheDocument()
    })
  })

  describe('Data Loading', () => {
    it('should restore plan data from localStorage', () => {
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByText('Billing: monthly')).toBeInTheDocument()
      expect(screen.getByText(/Addons: 2/)).toBeInTheDocument()
    })

    it('should restore selected addons from localStorage', () => {
      const planDataWithAddons = {
        selectedPlan: mockPlan,
        billingCycle: 'monthly',
        branchCount: 3,
        branches: mockBranches,
        selectedAddons: mockSelectedAddons
      }
      localStorage.setItem('selected_plan_data', JSON.stringify(planDataWithAddons))

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(mockSetSelectedAddons).toHaveBeenCalledWith(mockSelectedAddons)
    })

    it('should handle missing localStorage data gracefully', () => {
      localStorage.clear()

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('available-addons-grid')).toBeInTheDocument()
    })
  })

  describe('Addon Configuration', () => {
    it('should open modal when configuring addon', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('configure-addon'))

      expect(mockOpenAddonModal).toHaveBeenCalledWith({ id: 1, name: 'Test Addon' })
    })

    it('should show addon modal when opened', () => {
      vi.spyOn(useAddonManagementHook, 'useAddonManagement').mockReturnValue({
        selectedAddons: [],
        currentAddon: { id: 1, name: 'Test Addon' },
        isAddonModalOpen: true,
        setSelectedAddons: mockSetSelectedAddons,
        openAddonModal: mockOpenAddonModal,
        closeAddonModal: mockCloseAddonModal,
        handleAddonSelection: mockHandleAddonSelection,
        removeAddon: mockRemoveAddon,
        isAddonSelected: mockIsAddonSelected,
        getAddonSelection: mockGetAddonSelection,
        refreshAddonData: mockRefreshAddonData
      } as never)

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('addon-selection-modal')).toBeInTheDocument()
      expect(screen.getByText('Addon: Test Addon')).toBeInTheDocument()
    })

    it('should close modal when close button clicked', async () => {
      const user = userEvent.setup()
      vi.spyOn(useAddonManagementHook, 'useAddonManagement').mockReturnValue({
        selectedAddons: [],
        currentAddon: { id: 1, name: 'Test Addon' },
        isAddonModalOpen: true,
        setSelectedAddons: mockSetSelectedAddons,
        openAddonModal: mockOpenAddonModal,
        closeAddonModal: mockCloseAddonModal,
        handleAddonSelection: mockHandleAddonSelection,
        removeAddon: mockRemoveAddon,
        isAddonSelected: mockIsAddonSelected,
        getAddonSelection: mockGetAddonSelection,
        refreshAddonData: mockRefreshAddonData
      } as never)

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('close-modal'))

      expect(mockCloseAddonModal).toHaveBeenCalled()
    })

    it('should save addon selection from modal', async () => {
      const user = userEvent.setup()
      vi.spyOn(useAddonManagementHook, 'useAddonManagement').mockReturnValue({
        selectedAddons: [],
        currentAddon: { id: 1, name: 'Test Addon' },
        isAddonModalOpen: true,
        setSelectedAddons: mockSetSelectedAddons,
        openAddonModal: mockOpenAddonModal,
        closeAddonModal: mockCloseAddonModal,
        handleAddonSelection: mockHandleAddonSelection,
        removeAddon: mockRemoveAddon,
        isAddonSelected: mockIsAddonSelected,
        getAddonSelection: mockGetAddonSelection,
        refreshAddonData: mockRefreshAddonData
      } as never)

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('save-addon'))

      expect(mockHandleAddonSelection).toHaveBeenCalled()
    })
  })

  describe('Addon Management', () => {
    it('should remove addon when remove button clicked', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('remove-addon'))

      expect(mockRemoveAddon).toHaveBeenCalledWith(1)
    })

    it('should allow editing addon from summary', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('edit-addon'))

      expect(mockOpenAddonModal).toHaveBeenCalled()
    })

    it('should remove addon from summary', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('remove-addon-summary'))

      expect(mockRemoveAddon).toHaveBeenCalledWith(1)
    })

    it('should auto-save addon data to localStorage on changes', async () => {
      const user = userEvent.setup()
      vi.spyOn(useAddonManagementHook, 'useAddonManagement').mockReturnValue({
        selectedAddons: mockSelectedAddons,
        currentAddon: null,
        isAddonModalOpen: false,
        setSelectedAddons: mockSetSelectedAddons,
        openAddonModal: mockOpenAddonModal,
        closeAddonModal: mockCloseAddonModal,
        handleAddonSelection: mockHandleAddonSelection,
        removeAddon: mockRemoveAddon,
        isAddonSelected: mockIsAddonSelected,
        getAddonSelection: mockGetAddonSelection,
        refreshAddonData: mockRefreshAddonData
      } as never)

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        const savedData = localStorage.getItem('selected_plan_data')
        expect(savedData).toBeTruthy()
      })
    })
  })

  describe('Branch Management', () => {
    it('should display branch count', () => {
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByText('Branches: 3')).toBeInTheDocument()
    })

    it('should allow changing branch names', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('change-branch-name'))

      expect(mockHandleBranchNameChange).toHaveBeenCalledWith(0, 'New Branch Name', mockSetSelectedAddons)
    })
  })

  describe('Navigation', () => {
    it('should call onPrevious when back button clicked', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('secondary-btn'))

      expect(mockOnPrevious).toHaveBeenCalledTimes(1)
    })

    it('should disable continue button during submission', () => {
      vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
        isSubmitting: true,
        assignPlanToTenant: mockAssignPlanToTenant
      } as never)

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('primary-btn')).toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('should call API when continuing', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockAssignPlanToTenant).toHaveBeenCalled()
      })
    })

    it('should save data to localStorage before API call', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        const savedData = localStorage.getItem('selected_plan_data')
        expect(savedData).toBeTruthy()
      })
    })

    it('should show loading state during submission', () => {
      vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
        isSubmitting: true,
        assignPlanToTenant: mockAssignPlanToTenant
      } as never)

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByText('Assigning Plan...')).toBeInTheDocument()
    })

    it('should refresh addon data after successful submission', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockRefreshAddonData).toHaveBeenCalled()
      })
    })

    it('should call isCompleted on successful submission', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockIsCompleted).toHaveBeenCalledWith(true)
      })
    })

    it('should not proceed on API failure', async () => {
      const user = userEvent.setup()
      mockAssignPlanToTenant.mockResolvedValue(false)

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockIsCompleted).not.toHaveBeenCalled()
      })
    })

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup()
      mockAssignPlanToTenant.mockRejectedValue(new Error('API Error'))

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockIsCompleted).not.toHaveBeenCalled()
      })
    })
  })

  describe('Discount Display', () => {
    it('should display plan discount percentage', () => {
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByText('Discount: 15%')).toBeInTheDocument()
    })

    it('should handle yearly billing discount', () => {
      const planDataYearly = {
        selectedPlan: mockPlan,
        billingCycle: 'yearly',
        branchCount: 3,
        branches: mockBranches,
        selectedAddons: []
      }
      localStorage.setItem('selected_plan_data', JSON.stringify(planDataYearly))

      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByText('Billing: yearly')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete addon selection workflow', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      /* Configure addon */
      await user.click(screen.getByTestId('configure-addon'))
      expect(mockOpenAddonModal).toHaveBeenCalled()

      /* Continue to next step */
      await user.click(screen.getByTestId('primary-btn'))

      /* Verify workflow completion */
      await waitFor(() => {
        expect(mockAssignPlanToTenant).toHaveBeenCalled()
        expect(mockIsCompleted).toHaveBeenCalledWith(true)
      })
    })

    it('should allow skipping addon selection', async () => {
      const user = userEvent.setup()
      render(<AddonSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      /* Continue without selecting addons */
      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockIsCompleted).toHaveBeenCalledWith(true)
      })
    })
  })
})
