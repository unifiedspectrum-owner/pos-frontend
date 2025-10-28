/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import PlansGrid from '../plans-grid'
import { Plan } from '@plan-management/types'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'

/* Mock component props interfaces */
interface MockEmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
}

interface MockNumberInputFieldProps {
  label: string
  value: number
  onChange: (value: string) => void
  min?: number
  max?: number
}

interface MockGetBillingCycleLabelProps {
  billingCycle: string
  isCyclePeriod?: boolean
}

interface MockPlanWithPricing {
  monthly_price: number
  annual_discount_percentage: number
}

/* Mock shared components */
vi.mock('@shared/components/common', () => ({
  EmptyStateContainer: ({ icon, title, description }: MockEmptyStateProps) => (
    <div data-testid="empty-state">
      <div data-testid="empty-icon">{icon}</div>
      <div>{title}</div>
      <div>{description}</div>
    </div>
  )
}))

vi.mock('@shared/components/form-elements/ui', () => ({
  NumberInputField: ({ label, value, onChange, min, max }: MockNumberInputFieldProps) => (
    <div data-testid="number-input">
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        data-testid="branch-count-input"
      />
    </div>
  )
}))

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  calculatePlanPrice: vi.fn((plan: MockPlanWithPricing, billingCycle: string, branchCount: number) => {
    const yearlyPrice = plan.monthly_price * 12 * (1 - plan.annual_discount_percentage / 100)
    return billingCycle === 'monthly' ? plan.monthly_price * branchCount : yearlyPrice * branchCount
  }),
  getBillingCycleLabel: vi.fn(({ billingCycle, isCyclePeriod }: MockGetBillingCycleLabelProps) => {
    if (isCyclePeriod) {
      return billingCycle === 'monthly' ? 'per month' : 'per year'
    }
    return billingCycle === 'monthly' ? 'month' : 'year'
  })
}))

describe('PlansGrid', () => {
  const mockFeature1 = {
    id: 1,
    name: 'Feature 1',
    description: 'Feature 1 description',
    display_order: 1
  }

  const mockFeature2 = {
    id: 2,
    name: 'Feature 2',
    description: 'Feature 2 description',
    display_order: 2
  }

  const mockAddon = {
    id: 1,
    name: 'Premium Support',
    description: 'Premium support addon',
    pricing_scope: 'branch' as const,
    addon_price: 29.99,
    default_quantity: null,
    is_included: false,
    feature_level: null,
    min_quantity: null,
    max_quantity: null,
    display_order: 1
  }

  const mockPlan1: Plan = {
    id: 1,
    name: 'Basic Plan',
    description: 'Basic plan for small businesses',
    features: [mockFeature1],
    is_featured: false,
    is_active: true,
    is_custom: false,
    display_order: 1,
    monthly_price: 49.99,
    included_branches_count: 5,
    annual_discount_percentage: 10,
    add_ons: []
  }

  const mockPlan2: Plan = {
    id: 2,
    name: 'Premium Plan',
    description: 'Premium plan for growing businesses',
    features: [mockFeature1, mockFeature2],
    is_featured: true,
    is_active: true,
    is_custom: false,
    display_order: 2,
    monthly_price: 99.99,
    included_branches_count: 10,
    annual_discount_percentage: 15,
    add_ons: [mockAddon]
  }

  const mockOnPlanSelect = vi.fn()
  const mockOnBranchCountChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render plans grid', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
    })

    it('should render multiple plans', () => {
      render(
        <PlansGrid
          plans={[mockPlan1, mockPlan2]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Premium Plan')).toBeInTheDocument()
    })

    it('should display plan descriptions', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic plan for small businesses')).toBeInTheDocument()
    })

    it('should display plan features', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Feature 1')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no plans', () => {
      render(
        <PlansGrid
          plans={[]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should display empty state title', () => {
      render(
        <PlansGrid
          plans={[]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('No Plans Available')).toBeInTheDocument()
    })

    it('should display empty state description', () => {
      render(
        <PlansGrid
          plans={[]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/There are currently no subscription plans to display/)).toBeInTheDocument()
    })
  })

  describe('Pricing Display', () => {
    it('should display monthly price', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('$49')).toBeInTheDocument()
    })

    it('should display yearly price', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.YEARLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('$539')).toBeInTheDocument()
    })

    it('should display billing cycle label', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('per month')).toBeInTheDocument()
    })

    it('should display per branch text when not selected', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('/ per branch')).toBeInTheDocument()
    })

    it('should floor the price display', () => {
      const planWithDecimal = {
        ...mockPlan1,
        monthly_price: 49.95
      }

      render(
        <PlansGrid
          plans={[planWithDecimal]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('$49')).toBeInTheDocument()
    })
  })

  describe('Popular Badge', () => {
    it('should display popular badge for featured plan', () => {
      render(
        <PlansGrid
          plans={[mockPlan2]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Most Popular')).toBeInTheDocument()
    })

    it('should not display popular badge for non-featured plan', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Most Popular')).not.toBeInTheDocument()
    })

    it('should display popular badge based on display_order', () => {
      const planWithOrder2 = {
        ...mockPlan1,
        is_featured: false,
        display_order: 2
      }

      render(
        <PlansGrid
          plans={[planWithOrder2]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Most Popular')).toBeInTheDocument()
    })
  })

  describe('Plan Selection', () => {
    it('should call onPlanSelect when plan card is clicked', async () => {
      const user = userEvent.setup()

      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Select Plan'))

      expect(mockOnPlanSelect).toHaveBeenCalledWith(mockPlan1)
    })

    it('should display Selected button for selected plan', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected')).toBeInTheDocument()
    })

    it('should display Select Plan button for non-selected plan', () => {
      render(
        <PlansGrid
          plans={[mockPlan1, mockPlan2]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected')).toBeInTheDocument()
      expect(screen.getByText('Select Plan')).toBeInTheDocument()
    })

    it('should highlight selected plan', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Selected')).toBeInTheDocument()
    })
  })

  describe('Branch Count Configuration', () => {
    it('should display branch count input for selected plan', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
          branchCount={3}
          onBranchCountChange={mockOnBranchCountChange}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('number-input')).toBeInTheDocument()
    })

    it('should not display branch count input for non-selected plan', () => {
      render(
        <PlansGrid
          plans={[mockPlan1, mockPlan2]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
          branchCount={3}
          onBranchCountChange={mockOnBranchCountChange}
        />,
        { wrapper: TestWrapper }
      )

      const numberInputs = screen.queryAllByTestId('number-input')
      expect(numberInputs).toHaveLength(1)
    })

    it('should display max branches text', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
          branchCount={3}
          onBranchCountChange={mockOnBranchCountChange}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/5 branches/)).toBeInTheDocument()
    })

    it('should call onBranchCountChange when value changes', async () => {
      const user = userEvent.setup()

      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
          branchCount={3}
          onBranchCountChange={mockOnBranchCountChange}
        />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByTestId('branch-count-input')
      await user.clear(input)
      await user.type(input, '5')

      expect(mockOnBranchCountChange).toHaveBeenCalled()
    })

    it('should not display branch count input when onBranchCountChange is not provided', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
          branchCount={3}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('number-input')).not.toBeInTheDocument()
    })
  })

  describe('Features Display', () => {
    it('should display all features', () => {
      render(
        <PlansGrid
          plans={[mockPlan2]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Feature 1')).toBeInTheDocument()
      expect(screen.getByText('Feature 2')).toBeInTheDocument()
    })

    it('should render features with checkmark icons', () => {
      const { container } = render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Add-ons Display', () => {
    it('should display addons count', () => {
      render(
        <PlansGrid
          plans={[mockPlan2]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Addons \(Optional\) - 1/)).toBeInTheDocument()
    })

    it('should not display addons section when no addons', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Addons \(Optional\)/)).not.toBeInTheDocument()
    })

    it('should display addon names in accordion', () => {
      render(
        <PlansGrid
          plans={[mockPlan2]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Support')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should accept all required props', () => {
      expect(() =>
        render(
          <PlansGrid
            plans={[mockPlan1]}
            selectedPlan={null}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            onPlanSelect={mockOnPlanSelect}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })

    it('should use default branchCount of 0', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
    })

    it('should accept optional branchCount prop', () => {
      render(
        <PlansGrid
          plans={[mockPlan1]}
          selectedPlan={mockPlan1}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
          branchCount={5}
          onBranchCountChange={mockOnBranchCountChange}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle plan with no features', () => {
      const planNoFeatures = {
        ...mockPlan1,
        features: []
      }

      render(
        <PlansGrid
          plans={[planNoFeatures]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
    })

    it('should handle large number of plans', () => {
      const manyPlans = Array.from({ length: 10 }, (_, i) => ({
        ...mockPlan1,
        id: i + 1,
        plan_id: i + 1,
        name: `Plan ${i + 1}`
      }))

      render(
        <PlansGrid
          plans={manyPlans}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Plan 1')).toBeInTheDocument()
      expect(screen.getByText('Plan 10')).toBeInTheDocument()
    })

    it('should render without errors', () => {
      expect(() =>
        render(
          <PlansGrid
            plans={[mockPlan1]}
            selectedPlan={null}
            billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
            onPlanSelect={mockOnPlanSelect}
          />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })
  })

  describe('Layout', () => {
    it('should render in a grid layout', () => {
      render(
        <PlansGrid
          plans={[mockPlan1, mockPlan2]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Premium Plan')).toBeInTheDocument()
    })

    it('should display plans in grid items', () => {
      render(
        <PlansGrid
          plans={[mockPlan1, mockPlan2]}
          selectedPlan={null}
          billingCycle={PLAN_BILLING_CYCLE.MONTHLY}
          onPlanSelect={mockOnPlanSelect}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Premium Plan')).toBeInTheDocument()
    })
  })
})
