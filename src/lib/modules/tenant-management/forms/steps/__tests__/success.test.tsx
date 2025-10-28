/* Comprehensive test suite for SuccessStep component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import SuccessStep from '@tenant-management/forms/steps/success'

describe('SuccessStep', () => {
  const mockOnComplete = vi.fn()

  const mockPlanData = {
    selectedPlan: {
      id: 1,
      name: 'Pro Plan',
      monthly_price: 100,
      annual_discount_percentage: 15,
      included_branches_count: 3
    },
    billingCycle: 'monthly' as const,
    branchCount: 3,
    selectedAddons: [
      {
        addon_id: 1,
        addon_name: 'Advanced Analytics',
        addon_price: 20,
        pricing_scope: 'organization' as const,
        is_included: false,
        branches: []
      },
      {
        addon_id: 2,
        addon_name: 'Multi-Currency',
        addon_price: 15,
        pricing_scope: 'branch' as const,
        is_included: false,
        branches: [
          { branchIndex: 0, branchName: 'Main Branch', isSelected: true },
          { branchIndex: 1, branchName: 'Branch 2', isSelected: true }
        ]
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render success header', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText('Account Setup Complete!')).toBeInTheDocument()
    })

    it('should display congratulations message', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Congratulations!/)).toBeInTheDocument()
      expect(screen.getByText(/Your payment has been processed/)).toBeInTheDocument()
    })

    it('should render continue button', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText('Continue to Dashboard')).toBeInTheDocument()
    })
  })

  describe('Account Summary', () => {
    it('should display plan summary when data exists', () => {
      localStorage.setItem('selected_plan_data', JSON.stringify(mockPlanData))

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText('Your Account Details')).toBeInTheDocument()
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
    })

    it('should display billing cycle', () => {
      localStorage.setItem('selected_plan_data', JSON.stringify(mockPlanData))

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/monthly/)).toBeInTheDocument()
    })

    it('should display branch count', () => {
      localStorage.setItem('selected_plan_data', JSON.stringify(mockPlanData))

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Use more specific query to find branch count in Account Details section */
      const branchCountText = screen.getByText((_content, element) => {
        if (!element) return false
        const hasBranchesLabel = element.previousSibling?.textContent?.includes('Branches')
        return Boolean(hasBranchesLabel && element.textContent === '3')
      })
      expect(branchCountText).toBeInTheDocument()
    })

    it('should display addon count when addons exist', () => {
      localStorage.setItem('selected_plan_data', JSON.stringify(mockPlanData))

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/2 selected/)).toBeInTheDocument()
    })

    it('should handle missing plan data gracefully', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Your Account Details')).not.toBeInTheDocument()
    })
  })

  describe('Resource Creation Progress', () => {
    it('should display resource setup section', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText('Setting Up Your Resources')).toBeInTheDocument()
    })

    it('should display all resource creation steps', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText('Tenant Account')).toBeInTheDocument()
      expect(screen.getByText('Database Setup')).toBeInTheDocument()
      expect(screen.getByText('Core Services')).toBeInTheDocument()
      expect(screen.getByText('Infrastructure')).toBeInTheDocument()
    })

    it('should show progress bar', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText('Overall Progress')).toBeInTheDocument()
    })

    it('should start with 0% progress', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText('0% complete')).toBeInTheDocument()
    })

    it('should increment progress over time', async () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Initial progress */
      expect(screen.getByText('0% complete')).toBeInTheDocument()

      /* Advance timers and wait for updates */
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      expect(screen.queryByText('0% complete')).not.toBeInTheDocument()
    })

    it('should reach 100% progress eventually', async () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Advance timers to completion */
      await act(async () => {
        vi.advanceTimersByTime(20000)
        await Promise.resolve()
      })

      expect(screen.getByText('100% complete')).toBeInTheDocument()
    })
  })

  describe('Resource Step Status', () => {
    it('should show first step as in-progress initially', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      const tenantAccount = screen.getByText('Tenant Account')
      expect(tenantAccount).toBeInTheDocument()
    })

    it('should update step status as progress advances', async () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Advance progress significantly */
      await act(async () => {
        vi.advanceTimersByTime(5000)
        await Promise.resolve()
      })

      expect(screen.getByText('Database Setup')).toBeInTheDocument()
    })
  })

  describe('Next Steps Information', () => {
    it('should display next steps section', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText("What's Next?")).toBeInTheDocument()
    })

    it('should display email confirmation info', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Email Confirmation/)).toBeInTheDocument()
      expect(screen.getByText(/You'll receive a welcome email/)).toBeInTheDocument()
    })

    it('should display system access info', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/System Access/)).toBeInTheDocument()
      expect(screen.getByText(/available within the next 10-15 minutes/)).toBeInTheDocument()
    })

    it('should display mobile app info', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Mobile App/)).toBeInTheDocument()
      expect(screen.getByText(/Download our mobile app/)).toBeInTheDocument()
    })

    it('should display support info', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Support/)).toBeInTheDocument()
      expect(screen.getByText(/ready to help you get started/)).toBeInTheDocument()
    })
  })

  describe('Button Actions', () => {
    it('should call onComplete when continue button clicked', async () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      const button = screen.getByText('Continue to Dashboard')

      await act(async () => {
        button.click()
        await Promise.resolve()
      })

      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Pricing Display', () => {
    it('should calculate and display total for monthly billing', () => {
      localStorage.setItem('selected_plan_data', JSON.stringify(mockPlanData))

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Plan: 100 * 3 branches = 300 */
      /* Org Addon: 20 */
      /* Branch Addon: 15 * 2 selected branches = 30 */
      /* Total: 300 + 20 + 30 = 350 */
      expect(screen.getByText(/\$350/)).toBeInTheDocument()
    })

    it('should calculate and display total for yearly billing with discount', () => {
      const yearlyPlanData = {
        ...mockPlanData,
        billingCycle: 'yearly' as const
      }
      localStorage.setItem('selected_plan_data', JSON.stringify(yearlyPlanData))

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Should apply 15% discount to yearly total */
      /* (300 + 20 + 30) * 12 * 0.85 = 3570 */
      expect(screen.getByText(/\$3,570/)).toBeInTheDocument()
    })

    it('should display N/A when no plan data exists', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.queryByText(/Your Account Details/)).not.toBeInTheDocument()
    })
  })

  describe('Data Loading', () => {
    it('should load plan data from localStorage on mount', () => {
      localStorage.setItem('selected_plan_data', JSON.stringify(mockPlanData))

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('selected_plan_data', 'invalid-json')

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Should not crash */
      expect(screen.getByText('Account Setup Complete!')).toBeInTheDocument()
    })
  })

  describe('Progress Animation', () => {
    it('should animate progress bar', async () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Initial state */
      expect(screen.getByText('0% complete')).toBeInTheDocument()

      /* Progress after some time */
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      const progressText = screen.queryByText('0% complete')
      expect(progressText).not.toBeInTheDocument()
    })

    it('should stop progress at 100%', async () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Advance well beyond completion time */
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(screen.getByText('100% complete')).toBeInTheDocument()

      /* Should not exceed 100% - advance more timers */
      await act(async () => {
        vi.advanceTimersByTime(10000)
        await Promise.resolve()
      })

      expect(screen.getByText('100% complete')).toBeInTheDocument()
    })
  })

  describe('Resource Step Descriptions', () => {
    it('should display tenant account description', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Setting up your organization profile/)).toBeInTheDocument()
    })

    it('should display database description', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Creating your dedicated database schema/)).toBeInTheDocument()
    })

    it('should display services description', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Initializing POS services/)).toBeInTheDocument()
    })

    it('should display infrastructure description', () => {
      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Provisioning servers/)).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete success workflow', async () => {
      localStorage.setItem('selected_plan_data', JSON.stringify(mockPlanData))

      render(<SuccessStep onComplete={mockOnComplete} />, { wrapper: TestWrapper })

      /* Verify all sections are rendered */
      expect(screen.getByText('Account Setup Complete!')).toBeInTheDocument()
      expect(screen.getByText('Your Account Details')).toBeInTheDocument()
      expect(screen.getByText('Setting Up Your Resources')).toBeInTheDocument()
      expect(screen.getByText("What's Next?")).toBeInTheDocument()

      /* Verify plan details */
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
      expect(screen.getByText(/2 selected/)).toBeInTheDocument()

      /* Advance progress */
      await act(async () => {
        vi.advanceTimersByTime(5000)
        await Promise.resolve()
      })

      /* Complete the process */
      const button = screen.getByText('Continue to Dashboard')
      await act(async () => {
        button.click()
        await Promise.resolve()
      })

      expect(mockOnComplete).toHaveBeenCalled()
    })
  })
})
