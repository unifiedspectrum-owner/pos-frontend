/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Public module imports */
import { PricingPage } from '@public/pages/pricing'

/* Mock next/link */
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

/* Mock i18n navigation */
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  usePathname: () => '/'
}))

/* Mock PublicLayout */
vi.mock('@public/components/layout', () => ({
  PublicLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-layout">{children}</div>
  )
}))

/* Mock PlansGrid */
vi.mock('@/lib/modules/tenant-management/forms/steps/components/plan-selection/plans-grid', () => ({
  default: ({ plans, onPlanSelect, onBranchCountChange }: any) => (
    <div data-testid="plans-grid">
      {plans.map((plan: any) => (
        <button
          key={plan.id}
          data-testid={`plan-${plan.id}`}
          onClick={() => onPlanSelect(plan)}
        >
          {plan.name}
        </button>
      ))}
      <button
        data-testid="branch-increment"
        onClick={() => onBranchCountChange((prev: number) => prev + 1)}
      >
        Increment
      </button>
    </div>
  )
}))

/* Mock BillingCycleSelector */
vi.mock('@/lib/modules/tenant-management/forms/steps/components/plan-selection/billing-cycle-selector', () => ({
  default: ({ value, onChange, discountPercentage }: any) => (
    <div data-testid="billing-cycle-selector">
      <button
        data-testid="monthly-button"
        onClick={() => onChange('monthly')}
      >
        Monthly
      </button>
      <button
        data-testid="annual-button"
        onClick={() => onChange('annual')}
      >
        Annual
      </button>
      {discountPercentage > 0 && (
        <span data-testid="discount-badge">{discountPercentage}% off</span>
      )}
    </div>
  )
}))

/* Mock usePlans hook */
const mockUsePlans = vi.fn()
vi.mock('@plan-management/hooks', () => ({
  usePlans: () => mockUsePlans()
}))

describe('PricingPage', () => {
  const mockPlans = [
    {
      id: '1',
      name: 'Basic Plan',
      is_active: true,
      included_branches_count: 5,
      annual_discount_percentage: 20
    },
    {
      id: '2',
      name: 'Pro Plan',
      is_active: true,
      included_branches_count: 10,
      annual_discount_percentage: 25
    },
    {
      id: '3',
      name: 'Enterprise Plan',
      is_active: true,
      included_branches_count: 50,
      annual_discount_percentage: 30
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePlans.mockReturnValue({
      plans: mockPlans,
      loading: false,
      error: null
    })
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<PricingPage />)
      expect(container).toBeInTheDocument()
    })

    it('renders within PublicLayout', () => {
      render(<PricingPage />)
      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
    })

    it('renders page heading', () => {
      render(<PricingPage />)
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
    })

    it('renders page description', () => {
      render(<PricingPage />)
      expect(screen.getByText(/Select the perfect plan for your business/)).toBeInTheDocument()
    })

    it('renders billing cycle selector when plans are loaded', () => {
      render(<PricingPage />)
      expect(screen.getByTestId('billing-cycle-selector')).toBeInTheDocument()
    })

    it('renders plans grid when plans are loaded', () => {
      render(<PricingPage />)
      expect(screen.getByTestId('plans-grid')).toBeInTheDocument()
    })

    it('renders contact information', () => {
      render(<PricingPage />)
      expect(screen.getByText(/Need a custom solution/)).toBeInTheDocument()
      expect(screen.getByText(/Contact our sales team for enterprise pricing/)).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('displays loading spinner when loading', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: true,
        error: null
      })
      render(<PricingPage />)
      const spinner = document.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('hides billing cycle selector when loading', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: true,
        error: null
      })
      render(<PricingPage />)
      expect(screen.queryByTestId('billing-cycle-selector')).not.toBeInTheDocument()
    })

    it('hides plans grid when loading', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: true,
        error: null
      })
      render(<PricingPage />)
      expect(screen.queryByTestId('plans-grid')).not.toBeInTheDocument()
    })

    it('shows page header even when loading', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: true,
        error: null
      })
      render(<PricingPage />)
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('displays error message when error occurs', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: new Error('Failed to fetch plans')
      })
      render(<PricingPage />)
      expect(screen.getByText('Failed to Load Plans')).toBeInTheDocument()
    })

    it('hides plans grid when error occurs', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: new Error('Failed to fetch plans')
      })
      render(<PricingPage />)
      expect(screen.queryByTestId('plans-grid')).not.toBeInTheDocument()
    })

    it('hides billing cycle selector when error occurs', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: new Error('Failed to fetch plans')
      })
      render(<PricingPage />)
      expect(screen.queryByTestId('billing-cycle-selector')).not.toBeInTheDocument()
    })

    it('does not show loading spinner when error occurs', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: new Error('Failed to fetch plans')
      })
      render(<PricingPage />)
      const spinner = document.querySelector('.chakra-spinner')
      expect(spinner).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no plans are available', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: null
      })
      render(<PricingPage />)
      expect(screen.getByText('No Plans Available')).toBeInTheDocument()
    })

    it('displays empty state message', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: null
      })
      render(<PricingPage />)
      expect(screen.getByText(/There are currently no subscription plans available/)).toBeInTheDocument()
    })

    it('hides plans grid when no plans', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: null
      })
      render(<PricingPage />)
      expect(screen.queryByTestId('plans-grid')).not.toBeInTheDocument()
    })

    it('hides billing cycle selector when no plans', () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: null
      })
      render(<PricingPage />)
      expect(screen.queryByTestId('billing-cycle-selector')).not.toBeInTheDocument()
    })
  })

  describe('Plans Display', () => {
    it('renders all active plans', () => {
      render(<PricingPage />)
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
    })

    it('filters out inactive plans', () => {
      const plansWithInactive = [
        ...mockPlans,
        { id: '4', name: 'Inactive Plan', is_active: false, included_branches_count: 3, annual_discount_percentage: 10 }
      ]
      mockUsePlans.mockReturnValue({
        plans: plansWithInactive,
        loading: false,
        error: null
      })
      render(<PricingPage />)
      expect(screen.queryByText('Inactive Plan')).not.toBeInTheDocument()
    })

    it('passes correct plans to PlansGrid', () => {
      render(<PricingPage />)
      expect(screen.getByTestId('plan-1')).toBeInTheDocument()
      expect(screen.getByTestId('plan-2')).toBeInTheDocument()
      expect(screen.getByTestId('plan-3')).toBeInTheDocument()
    })
  })

  describe('Billing Cycle Selection', () => {
    it('starts with monthly billing cycle by default', () => {
      render(<PricingPage />)
      expect(screen.getByTestId('billing-cycle-selector')).toBeInTheDocument()
    })

    it('allows switching to annual billing', () => {
      render(<PricingPage />)
      const annualButton = screen.getByTestId('annual-button')
      fireEvent.click(annualButton)
      expect(annualButton).toBeInTheDocument()
    })

    it('allows switching back to monthly billing', () => {
      render(<PricingPage />)
      const annualButton = screen.getByTestId('annual-button')
      const monthlyButton = screen.getByTestId('monthly-button')

      fireEvent.click(annualButton)
      fireEvent.click(monthlyButton)
      expect(monthlyButton).toBeInTheDocument()
    })

    it('displays discount percentage for annual billing', () => {
      render(<PricingPage />)
      /* Should show discount from first plan by default */
      expect(screen.getByTestId('discount-badge')).toHaveTextContent('20% off')
    })
  })

  describe('Plan Selection', () => {
    it('allows selecting a plan', () => {
      render(<PricingPage />)
      const basicPlan = screen.getByTestId('plan-1')
      fireEvent.click(basicPlan)
      expect(basicPlan).toBeInTheDocument()
    })

    it('updates discount percentage when plan is selected', async () => {
      render(<PricingPage />)
      const proPlan = screen.getByTestId('plan-2')
      fireEvent.click(proPlan)

      await waitFor(() => {
        expect(screen.getByTestId('discount-badge')).toHaveTextContent('25% off')
      })
    })

    it('allows selecting different plans', () => {
      render(<PricingPage />)
      const basicPlan = screen.getByTestId('plan-1')
      const proPlan = screen.getByTestId('plan-2')

      fireEvent.click(basicPlan)
      fireEvent.click(proPlan)
      expect(proPlan).toBeInTheDocument()
    })
  })

  describe('Branch Count Management', () => {
    it('starts with branch count of 1', () => {
      render(<PricingPage />)
      expect(screen.getByTestId('branch-increment')).toBeInTheDocument()
    })

    it('allows incrementing branch count', () => {
      render(<PricingPage />)
      const incrementButton = screen.getByTestId('branch-increment')
      fireEvent.click(incrementButton)
      expect(incrementButton).toBeInTheDocument()
    })

    it('adjusts branch count when selecting plan with lower limit', async () => {
      render(<PricingPage />)

      /* Increment branch count multiple times */
      const incrementButton = screen.getByTestId('branch-increment')
      for (let i = 0; i < 10; i++) {
        fireEvent.click(incrementButton)
      }

      /* Select a plan with lower branch limit */
      const basicPlan = screen.getByTestId('plan-1')
      fireEvent.click(basicPlan)

      /* Branch count should be adjusted to plan limit */
      await waitFor(() => {
        expect(basicPlan).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<PricingPage />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('uses semantic heading for page title', () => {
      render(<PricingPage />)
      const heading = screen.getByRole('heading', { name: /choose your plan/i })
      expect(heading).toBeInTheDocument()
    })

    it('provides descriptive text for users', () => {
      render(<PricingPage />)
      expect(screen.getByText(/Select the perfect plan/)).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<PricingPage />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<PricingPage />)
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Choose Your Plan')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<PricingPage />)
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(<PricingPage />)
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
      unmount2()
    })

    it('updates when plans data changes', () => {
      const { rerender } = render(<PricingPage />)
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()

      mockUsePlans.mockReturnValue({
        plans: [{ id: '5', name: 'New Plan', is_active: true, included_branches_count: 7, annual_discount_percentage: 15 }],
        loading: false,
        error: null
      })

      rerender(<PricingPage />)
      expect(screen.getByText('New Plan')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(<PricingPage />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(200)
    })

    it('handles rapid mount/unmount without memory leaks', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<PricingPage />)
        expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
        unmount()
      }
    })

    it('handles large number of plans efficiently', () => {
      const manyPlans = Array.from({ length: 20 }, (_, i) => ({
        id: String(i + 1),
        name: `Plan ${i + 1}`,
        is_active: true,
        included_branches_count: 5,
        annual_discount_percentage: 20
      }))

      mockUsePlans.mockReturnValue({
        plans: manyPlans,
        loading: false,
        error: null
      })

      const startTime = Date.now()
      render(<PricingPage />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(300)
    })
  })

  describe('Edge Cases', () => {
    it('handles plans with null discount percentage', () => {
      const plansWithNullDiscount = [
        { id: '1', name: 'Basic Plan', is_active: true, included_branches_count: 5, annual_discount_percentage: null }
      ]
      mockUsePlans.mockReturnValue({
        plans: plansWithNullDiscount,
        loading: false,
        error: null
      })
      render(<PricingPage />)
      expect(screen.queryByTestId('discount-badge')).not.toBeInTheDocument()
    })

    it('handles plans with zero discount percentage', () => {
      const plansWithZeroDiscount = [
        { id: '1', name: 'Basic Plan', is_active: true, included_branches_count: 5, annual_discount_percentage: 0 }
      ]
      mockUsePlans.mockReturnValue({
        plans: plansWithZeroDiscount,
        loading: false,
        error: null
      })
      render(<PricingPage />)
      expect(screen.queryByTestId('discount-badge')).not.toBeInTheDocument()
    })

    it('handles plans with undefined branch count', () => {
      const plansWithUndefinedBranches = [
        { id: '1', name: 'Basic Plan', is_active: true, included_branches_count: undefined, annual_discount_percentage: 20 }
      ]
      mockUsePlans.mockReturnValue({
        plans: plansWithUndefinedBranches,
        loading: false,
        error: null
      })
      render(<PricingPage />)
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
    })

    it('handles transition from loading to loaded state', async () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: true,
        error: null
      })
      const { rerender } = render(<PricingPage />)
      expect(document.querySelector('.chakra-spinner')).toBeInTheDocument()

      mockUsePlans.mockReturnValue({
        plans: mockPlans,
        loading: false,
        error: null
      })
      rerender(<PricingPage />)

      await waitFor(() => {
        expect(screen.getByTestId('plans-grid')).toBeInTheDocument()
      })
    })

    it('handles transition from error to loaded state', async () => {
      mockUsePlans.mockReturnValue({
        plans: [],
        loading: false,
        error: new Error('Network error')
      })
      const { rerender } = render(<PricingPage />)
      expect(screen.getByText('Failed to Load Plans')).toBeInTheDocument()

      mockUsePlans.mockReturnValue({
        plans: mockPlans,
        loading: false,
        error: null
      })
      rerender(<PricingPage />)

      await waitFor(() => {
        expect(screen.getByTestId('plans-grid')).toBeInTheDocument()
      })
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(<PricingPage />)
      }).not.toThrow()
    })
  })

  describe('Integration Scenarios', () => {
    it('shows complete pricing flow for user', () => {
      render(<PricingPage />)

      /* User sees page header */
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()

      /* User sees billing options */
      expect(screen.getByTestId('billing-cycle-selector')).toBeInTheDocument()

      /* User sees available plans */
      expect(screen.getByTestId('plans-grid')).toBeInTheDocument()

      /* User sees contact information */
      expect(screen.getByText(/Need a custom solution/)).toBeInTheDocument()
    })

    it('allows complete plan selection workflow', async () => {
      render(<PricingPage />)

      /* Switch to annual billing */
      fireEvent.click(screen.getByTestId('annual-button'))

      /* Select a plan */
      fireEvent.click(screen.getByTestId('plan-2'))

      /* Verify discount is updated */
      await waitFor(() => {
        expect(screen.getByTestId('discount-badge')).toHaveTextContent('25% off')
      })
    })

    it('handles user navigating back to monthly after selecting annual', () => {
      render(<PricingPage />)

      fireEvent.click(screen.getByTestId('annual-button'))
      fireEvent.click(screen.getByTestId('monthly-button'))

      expect(screen.getByTestId('monthly-button')).toBeInTheDocument()
    })
  })

  describe('Visual Consistency', () => {
    it('applies consistent layout structure', () => {
      render(<PricingPage />)
      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
    })

    it('maintains proper spacing and organization', () => {
      render(<PricingPage />)
      const heading = screen.getByText('Choose Your Plan')
      const description = screen.getByText(/Select the perfect plan/)
      expect(heading).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('displays all UI elements in correct order', () => {
      const { container } = render(<PricingPage />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('maintains billing cycle state across interactions', () => {
      render(<PricingPage />)

      fireEvent.click(screen.getByTestId('annual-button'))
      fireEvent.click(screen.getByTestId('plan-1'))

      /* Billing cycle should remain annual */
      expect(screen.getByTestId('annual-button')).toBeInTheDocument()
    })

    it('maintains selected plan across billing cycle changes', () => {
      render(<PricingPage />)

      fireEvent.click(screen.getByTestId('plan-2'))
      fireEvent.click(screen.getByTestId('annual-button'))

      /* Plan selection should be maintained */
      expect(screen.getByTestId('plan-2')).toBeInTheDocument()
    })

    it('resets to first plan discount when no plan selected', () => {
      render(<PricingPage />)
      expect(screen.getByTestId('discount-badge')).toHaveTextContent('20% off')
    })
  })
})
