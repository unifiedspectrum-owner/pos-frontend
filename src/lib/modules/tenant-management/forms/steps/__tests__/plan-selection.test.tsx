/* Comprehensive test suite for PlanSelectionStep component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import PlanSelectionStep from '@tenant-management/forms/steps/plan-selection'
import * as usePlanDataHook from '@tenant-management/hooks/data-management/use-plan-data'
import * as useBranchManagementHook from '@tenant-management/hooks/data-management/use-branch-management'
import * as useAddonManagementHook from '@tenant-management/hooks/data-management/use-addon-management'
import * as usePlanStorageHook from '@tenant-management/hooks/account-creation/use-plan-storage'

/* Mock dependencies */
vi.mock('@tenant-management/forms/steps/components', () => ({
  PlansGrid: ({ plans, selectedPlan, billingCycle, onPlanSelect, branchCount, onBranchCountChange }: {
    plans: unknown[]
    selectedPlan: unknown
    billingCycle: string
    onPlanSelect: (plan: unknown) => void
    branchCount: number
    onBranchCountChange: (count: number) => void
  }) => (
    <div data-testid="plans-grid">
      <div>Plans: {plans.length}</div>
      <div>Selected: {selectedPlan ? 'Yes' : 'No'}</div>
      <div>Billing: {billingCycle}</div>
      <div>Branches: {branchCount}</div>
      <button onClick={() => onPlanSelect(plans[0])} data-testid="select-plan">Select Plan</button>
      <button onClick={() => onBranchCountChange(5)} data-testid="change-branches">Change Branches</button>
    </div>
  ),
  BillingCycleSelector: ({ value, onChange, discountPercentage }: {
    value: string
    onChange: (cycle: 'monthly' | 'yearly') => void
    discountPercentage: number
  }) => (
    <div data-testid="billing-cycle-selector">
      <div>Current: {value}</div>
      <div>Discount: {discountPercentage}%</div>
      <button onClick={() => onChange('yearly')} data-testid="select-yearly">Yearly</button>
      <button onClick={() => onChange('monthly')} data-testid="select-monthly">Monthly</button>
    </div>
  ),
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

vi.mock('@tenant-management/components/loading', () => ({
  PlanSelectionSkeleton: ({ showBranchConfig, showAddons, planCount }: {
    showBranchConfig: boolean
    showAddons: boolean
    planCount: number
  }) => (
    <div data-testid="plan-selection-skeleton">
      <div>Loading {planCount} plans...</div>
    </div>
  )
}))

describe('PlanSelectionStep', () => {
  const mockIsCompleted = vi.fn()
  const mockOnPrevious = vi.fn()
  const mockAssignPlanToTenant = vi.fn()
  const mockHandleBranchCountChange = vi.fn()
  const mockSetSelectedAddons = vi.fn()

  const mockPlans = [
    {
      id: 1,
      name: 'Basic Plan',
      monthly_price: 50,
      annual_discount_percentage: 10,
      included_branches_count: 1,
      is_featured: false,
      add_ons: []
    },
    {
      id: 2,
      name: 'Pro Plan',
      monthly_price: 100,
      annual_discount_percentage: 15,
      included_branches_count: 3,
      is_featured: true,
      add_ons: []
    },
    {
      id: 3,
      name: 'Enterprise Plan',
      monthly_price: 200,
      annual_discount_percentage: 20,
      included_branches_count: 10,
      is_featured: false,
      add_ons: []
    },
    {
      id: 4,
      name: 'Ultimate Plan',
      monthly_price: 500,
      annual_discount_percentage: 25,
      included_branches_count: 50,
      is_featured: false,
      add_ons: []
    }
  ]

  const mockBranches = [
    { branchIndex: 0, name: 'Main Branch', isIncluded: true },
    { branchIndex: 1, name: 'Branch 2', isIncluded: false },
    { branchIndex: 2, name: 'Branch 3', isIncluded: false }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    /* Mock hooks */
    vi.spyOn(usePlanDataHook, 'usePlanData').mockReturnValue({
      plans: mockPlans,
      isLoading: false
    } as never)

    vi.spyOn(useBranchManagementHook, 'useBranchManagement').mockReturnValue({
      branchCount: 3,
      branches: mockBranches,
      handleBranchCountChange: mockHandleBranchCountChange
    } as never)

    vi.spyOn(useAddonManagementHook, 'useAddonManagement').mockReturnValue({
      selectedAddons: [],
      setSelectedAddons: mockSetSelectedAddons
    } as never)

    vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
      isSubmitting: false,
      assignPlanToTenant: mockAssignPlanToTenant
    } as never)

    mockAssignPlanToTenant.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render billing cycle selector', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('billing-cycle-selector')).toBeInTheDocument()
      })
    })

    it('should render plans grid', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('plans-grid')).toBeInTheDocument()
      })
    })

    it('should render navigation buttons', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('navigation-button')).toBeInTheDocument()
      })
    })

    it('should display correct button labels', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Back to Account Info')).toBeInTheDocument()
        expect(screen.getByText('Continue to Addon Selection')).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show skeleton while loading plans', () => {
      vi.spyOn(usePlanDataHook, 'usePlanData').mockReturnValue({
        plans: [],
        isLoading: true
      } as never)

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('plan-selection-skeleton')).toBeInTheDocument()
      expect(screen.getByText('Loading 4 plans...')).toBeInTheDocument()
    })

    it('should hide skeleton when plans are loaded', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByTestId('plan-selection-skeleton')).not.toBeInTheDocument()
      })
    })
  })

  describe('Plan Selection', () => {
    it('should auto-select featured plan on mount', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Selected: Yes')).toBeInTheDocument()
      })
    })

    it('should handle plan selection', async () => {
      const user = userEvent.setup()
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('select-plan')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('select-plan'))

      await waitFor(() => {
        expect(screen.getByText('Selected: Yes')).toBeInTheDocument()
      })
    })

    it('should adjust branch count when selecting plan with lower limit', async () => {
      const user = userEvent.setup()

      /* Start with 10 branches */
      vi.spyOn(useBranchManagementHook, 'useBranchManagement').mockReturnValue({
        branchCount: 10,
        branches: mockBranches,
        handleBranchCountChange: mockHandleBranchCountChange
      } as never)

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('select-plan')).toBeInTheDocument()
      })

      /* Select plan with lower branch limit */
      await user.click(screen.getByTestId('select-plan'))

      /* Should trigger branch count adjustment */
      expect(mockHandleBranchCountChange).toHaveBeenCalled()
    })

    it('should filter addons when changing plans', async () => {
      const user = userEvent.setup()

      /* Set up selected addons */
      vi.spyOn(useAddonManagementHook, 'useAddonManagement').mockReturnValue({
        selectedAddons: [
          { addon_id: 1, addon_name: 'Addon 1', pricing_scope: 'organization', branches: [] }
        ],
        setSelectedAddons: mockSetSelectedAddons
      } as never)

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('select-plan')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('select-plan'))

      /* Should update addons */
      expect(mockSetSelectedAddons).toHaveBeenCalled()
    })
  })

  describe('Billing Cycle', () => {
    it('should default to monthly billing', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Current: monthly')).toBeInTheDocument()
      })
    })

    it('should allow changing to yearly billing', async () => {
      const user = userEvent.setup()
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('select-yearly')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('select-yearly'))

      await waitFor(() => {
        expect(screen.getByText('Current: yearly')).toBeInTheDocument()
      })
    })

    it('should display discount percentage', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText(/Discount: 25%/)).toBeInTheDocument()
      })
    })
  })

  describe('Branch Management', () => {
    it('should display current branch count', async () => {
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Branches: 3')).toBeInTheDocument()
      })
    })

    it('should handle branch count changes', async () => {
      const user = userEvent.setup()
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('change-branches')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('change-branches'))

      expect(mockHandleBranchCountChange).toHaveBeenCalledWith(5, mockSetSelectedAddons)
    })
  })

  describe('Data Persistence', () => {
    it('should restore plan data from localStorage', async () => {
      const savedPlanData = {
        selectedPlan: mockPlans[1],
        billingCycle: 'yearly',
        branchCount: 5,
        branches: mockBranches,
        selectedAddons: []
      }
      localStorage.setItem('selected_plan_data', JSON.stringify(savedPlanData))

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Current: yearly')).toBeInTheDocument()
      })
    })

    it('should save plan data to localStorage on continue', async () => {
      const user = userEvent.setup()
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('primary-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        const savedData = localStorage.getItem('selected_plan_data')
        expect(savedData).toBeTruthy()
      })
    })
  })

  describe('Navigation', () => {
    it('should call onPrevious when back button clicked', async () => {
      const user = userEvent.setup()
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('secondary-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('secondary-btn'))

      expect(mockOnPrevious).toHaveBeenCalledTimes(1)
    })

    it('should disable continue button when no plan selected', async () => {
      /* Mock no plan selected */
      vi.spyOn(usePlanDataHook, 'usePlanData').mockReturnValue({
        plans: [],
        isLoading: false
      } as never)

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('primary-btn')).toBeDisabled()
      })
    })

    it('should disable continue button during submission', async () => {
      vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
        isSubmitting: true,
        assignPlanToTenant: mockAssignPlanToTenant
      } as never)

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('primary-btn')).toBeDisabled()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call API when continuing', async () => {
      const user = userEvent.setup()
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('primary-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockAssignPlanToTenant).toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
        isSubmitting: true,
        assignPlanToTenant: mockAssignPlanToTenant
      } as never)

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Assigning Plan...')).toBeInTheDocument()
      })
    })

    it('should call isCompleted on successful submission', async () => {
      const user = userEvent.setup()
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('primary-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockIsCompleted).toHaveBeenCalledWith(true)
      })
    })

    it('should not proceed on API failure', async () => {
      const user = userEvent.setup()
      mockAssignPlanToTenant.mockResolvedValue(false)

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('primary-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockIsCompleted).not.toHaveBeenCalled()
      })
    })

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup()
      mockAssignPlanToTenant.mockRejectedValue(new Error('API Error'))

      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('primary-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('primary-btn'))

      await waitFor(() => {
        expect(mockIsCompleted).not.toHaveBeenCalled()
      })
    })
  })

  describe('Integration', () => {
    it('should handle complete workflow', async () => {
      const user = userEvent.setup()
      render(<PlanSelectionStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      /* Wait for component to load */
      await waitFor(() => {
        expect(screen.getByTestId('plans-grid')).toBeInTheDocument()
      })

      /* Select a plan */
      await user.click(screen.getByTestId('select-plan'))

      /* Change billing cycle */
      await user.click(screen.getByTestId('select-yearly'))

      /* Continue to next step */
      await user.click(screen.getByTestId('primary-btn'))

      /* Verify workflow completion */
      await waitFor(() => {
        expect(mockAssignPlanToTenant).toHaveBeenCalled()
        expect(mockIsCompleted).toHaveBeenCalledWith(true)
      })
    })
  })
})
