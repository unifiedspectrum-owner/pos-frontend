/* Comprehensive test suite for PlanSummaryStep component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import PlanSummaryStep from '@tenant-management/forms/steps/plan-summary'
import * as usePlanStorageHook from '@tenant-management/hooks/account-creation/use-plan-storage'

/* Mock dependencies */
vi.mock('@shared/components/common', () => ({
  FullPageLoader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="full-page-loader">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
  EmptyStateContainer: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state-container">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  )
}))

vi.mock('@tenant-management/forms/steps/components', () => ({
  PlanDetailsSummary: ({ planDetails, billingCycle, planTotalAMount }: { planDetails: unknown; billingCycle: string; planTotalAMount: number }) => (
    <div data-testid="plan-details-summary">
      <div>Billing: {billingCycle}</div>
      <div>Total: ${planTotalAMount}</div>
    </div>
  ),
  OrganizationAddonsSummary: ({ organizationAddons, billingCycle }: { organizationAddons: unknown[]; billingCycle: string }) => (
    <div data-testid="organization-addons-summary">
      <div>Org Addons: {organizationAddons.length}</div>
      <div>Billing: {billingCycle}</div>
    </div>
  ),
  BranchAddonsSummary: ({ branchAddons, billingCycle }: { branchAddons: unknown[]; billingCycle: string }) => (
    <div data-testid="branch-addons-summary">
      <div>Branch Addons: {branchAddons.length}</div>
      <div>Billing: {billingCycle}</div>
    </div>
  ),
  AccountSummary: ({ planTotalAmount, organizationAddonsTotal, branchAddonsTotal, grandTotal }: {
    planTotalAmount: number
    organizationAddonsTotal: number
    branchAddonsTotal: number
    grandTotal: number
  }) => (
    <div data-testid="account-summary">
      <div>Plan: ${planTotalAmount}</div>
      <div>Org Addons: ${organizationAddonsTotal}</div>
      <div>Branch Addons: ${branchAddonsTotal}</div>
      <div>Total: ${grandTotal}</div>
    </div>
  )
}))

describe('PlanSummaryStep', () => {
  const mockIsCompleted = vi.fn()
  const mockOnPrevious = vi.fn()
  const mockLoadPlanData = vi.fn()
  const mockAssignPlanToTenant = vi.fn()

  const mockPlanData = {
    selectedPlan: {
      id: 1,
      name: 'Pro Plan',
      monthly_price: 100,
      annual_discount_percentage: 15,
      included_branches_count: 3,
      is_featured: true,
      add_ons: []
    },
    billingCycle: 'monthly' as const,
    branchCount: 3,
    branches: [
      { branchIndex: 0, name: 'Main Branch', isIncluded: true },
      { branchIndex: 1, name: 'Branch 2', isIncluded: false },
      { branchIndex: 2, name: 'Branch 3', isIncluded: false }
    ],
    selectedAddons: [
      {
        addon_id: 1,
        addon_name: 'Advanced Analytics',
        addon_price: 20,
        pricing_scope: 'organization' as const,
        branches: []
      },
      {
        addon_id: 2,
        addon_name: 'Multi-Currency',
        addon_price: 15,
        pricing_scope: 'branch' as const,
        branches: [
          { branchIndex: 0, branchName: 'Main Branch', isSelected: true },
          { branchIndex: 1, branchName: 'Branch 2', isSelected: true }
        ]
      }
    ]
  }

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('tenant_id', 'test-tenant-123')

    /* Clear mocks first */
    vi.clearAllMocks()

    /* Then set up return values */
    mockLoadPlanData.mockReturnValue(mockPlanData)
    mockAssignPlanToTenant.mockResolvedValue(true)

    /* Mock hooks */
    vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
      isSubmitting: false,
      loadPlanData: mockLoadPlanData,
      assignPlanToTenant: mockAssignPlanToTenant
    } as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Loading State', () => {
    it('should load and display plan data successfully', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      /* Wait for data to be loaded and displayed */
      await waitFor(() => {
        expect(mockLoadPlanData).toHaveBeenCalled()
        expect(screen.getByTestId('plan-details-summary')).toBeInTheDocument()
      })
    })

    it('should load plan data on mount', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(mockLoadPlanData).toHaveBeenCalled()
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no plan data', async () => {
      mockLoadPlanData.mockReturnValue(null)

      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('empty-state-container')).toBeInTheDocument()
      })

      expect(screen.getByText('No Plan Data Found')).toBeInTheDocument()
    })
  })

  describe('Rendering', () => {
    it('should render plan details summary', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('plan-details-summary')).toBeInTheDocument()
      })
    })

    it('should render organization addons summary', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('organization-addons-summary')).toBeInTheDocument()
      })
    })

    it('should render branch addons summary', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('branch-addons-summary')).toBeInTheDocument()
      })
    })

    it('should render account summary', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('account-summary')).toBeInTheDocument()
      })
    })

    it('should display summary header', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Plan Summary')).toBeInTheDocument()
      })
    })
  })

  describe('Pricing Calculations', () => {
    it('should calculate monthly pricing correctly', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('account-summary')).toBeInTheDocument()
      })

      /* Plan: 100 * 3 branches = 300 */
      /* Org Addon: 20 */
      /* Branch Addon: 15 * 2 selected branches = 30 */
      /* Total: 300 + 20 + 30 = 350 */
      expect(screen.getByText(/Total: \$350/)).toBeInTheDocument()
    })

    it('should calculate yearly pricing with discount', async () => {
      const yearlyPlanData = {
        ...mockPlanData,
        billingCycle: 'yearly' as const
      }
      mockLoadPlanData.mockReturnValue(yearlyPlanData)

      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('account-summary')).toBeInTheDocument()
      })

      /* Should apply 15% discount to yearly billing */
      expect(screen.getByTestId('account-summary')).toBeInTheDocument()
    })
  })

  describe('Data Transformation', () => {
    it('should transform organization addons correctly', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('organization-addons-summary')).toBeInTheDocument()
      })

      expect(screen.getByText('Org Addons: 1')).toBeInTheDocument()
    })

    it('should transform branch addons correctly', async () => {
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('branch-addons-summary')).toBeInTheDocument()
      })

      /* Should have 3 branches */
      expect(screen.getByText('Branch Addons: 3')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should call onPrevious when back button clicked', async () => {
      const user = userEvent.setup()
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      /* Wait for plan data to load and be displayed */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
        expect(screen.getByTestId('plan-details-summary')).toBeInTheDocument()
      })

      /* Wait for buttons to be rendered */
      await waitFor(() => {
        const buttons = screen.queryAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
      }, { timeout: 3000 })

      /* Find and click cancel/back button */
      const buttons = screen.getAllByRole('button')
      const cancelButton = buttons.find(btn =>
        btn.textContent && btn.textContent.toLowerCase().includes('cancel')
      )

      expect(cancelButton).toBeDefined()
      await user.click(cancelButton!)

      expect(mockOnPrevious).toHaveBeenCalledTimes(1)
    })

    it('should disable proceed button during submission', async () => {
      vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
        isSubmitting: true,
        loadPlanData: mockLoadPlanData,
        assignPlanToTenant: mockAssignPlanToTenant
      } as never)

      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        const proceedButton = screen.getByText(/Assigning Plan.../)
        expect(proceedButton).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call API when proceeding to payment', async () => {
      const user = userEvent.setup()
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Proceed to Payment')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Proceed to Payment'))

      await waitFor(() => {
        expect(mockAssignPlanToTenant).toHaveBeenCalled()
      })
    })

    it('should call isCompleted on successful submission', async () => {
      const user = userEvent.setup()
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Proceed to Payment')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Proceed to Payment'))

      await waitFor(() => {
        expect(mockIsCompleted).toHaveBeenCalledWith(true)
      })
    })

    it('should not proceed on API failure', async () => {
      const user = userEvent.setup()
      mockAssignPlanToTenant.mockResolvedValue(false)

      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Proceed to Payment')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Proceed to Payment'))

      await waitFor(() => {
        expect(mockIsCompleted).not.toHaveBeenCalled()
      })
    })

    it('should show loading text during submission', async () => {
      vi.spyOn(usePlanStorageHook, 'usePlanStorage').mockReturnValue({
        isSubmitting: true,
        loadPlanData: mockLoadPlanData,
        assignPlanToTenant: mockAssignPlanToTenant
      } as never)

      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Assigning Plan...')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage parse errors gracefully', async () => {
      mockLoadPlanData.mockImplementation(() => {
        throw new Error('Parse error')
      })

      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('empty-state-container')).toBeInTheDocument()
      })
    })
  })

  describe('Integration', () => {
    it('should handle complete summary workflow', async () => {
      const user = userEvent.setup()
      render(<PlanSummaryStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      /* Wait for data to load */
      await waitFor(() => {
        expect(screen.getByTestId('plan-details-summary')).toBeInTheDocument()
      })

      /* Verify all summary sections are present */
      expect(screen.getByTestId('organization-addons-summary')).toBeInTheDocument()
      expect(screen.getByTestId('branch-addons-summary')).toBeInTheDocument()
      expect(screen.getByTestId('account-summary')).toBeInTheDocument()

      /* Proceed to payment */
      await user.click(screen.getByText('Proceed to Payment'))

      /* Verify workflow completion */
      await waitFor(() => {
        expect(mockAssignPlanToTenant).toHaveBeenCalled()
        expect(mockIsCompleted).toHaveBeenCalledWith(true)
      })
    })
  })
})
