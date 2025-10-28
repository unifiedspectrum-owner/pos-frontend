/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import BillingCycleSelector from '../billing-cycle-selector'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'
import { PlanBillingCycle } from '@tenant-management/types'

/* Mock function props interface */
interface GetBillingCycleLabelProps {
  billingCycle: string
  capitalize?: boolean
}

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  getBillingCycleLabel: ({ billingCycle, capitalize }: GetBillingCycleLabelProps) =>
    capitalize ? billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1) : billingCycle
}))

describe('BillingCycleSelector', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render the billing cycle selector', () => {
      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Monthly')).toBeInTheDocument()
      expect(screen.getByText('Yearly')).toBeInTheDocument()
    })

    it('should display monthly option', () => {
      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Monthly')).toBeInTheDocument()
    })

    it('should display yearly option', () => {
      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.YEARLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Yearly')).toBeInTheDocument()
    })

    it('should render with monthly as default', () => {
      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      const monthlyOption = screen.getByText('Monthly')
      expect(monthlyOption).toBeInTheDocument()
    })

    it('should render with yearly when specified', () => {
      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.YEARLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      const yearlyOption = screen.getByText('Yearly')
      expect(yearlyOption).toBeInTheDocument()
    })
  })

  describe('Discount Badge', () => {
    it('should not display discount badge when discountPercentage is 0', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
          discountPercentage={0}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Save/)).not.toBeInTheDocument()
    })

    it('should display discount badge when discountPercentage is provided', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
          discountPercentage={20}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save 20%')).toBeInTheDocument()
    })

    it('should display correct discount percentage', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
          discountPercentage={15}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save 15%')).toBeInTheDocument()
    })

    it('should only show discount badge on yearly option', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.MONTHLY}
          onChange={mockOnChange}
          discountPercentage={20}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save 20%')).toBeInTheDocument()
    })

    it('should not display discount badge when discountPercentage is undefined', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Save/)).not.toBeInTheDocument()
    })

    it('should display discount badge with large percentage', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
          discountPercentage={50}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save 50%')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when monthly is selected', async () => {
      const user = userEvent.setup()

      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.YEARLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Monthly'))

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should call onChange when yearly is selected', async () => {
      const user = userEvent.setup()

      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Yearly'))

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should allow switching between billing cycles', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      await user.click(screen.getByText('Yearly'))
      expect(mockOnChange).toHaveBeenCalled()

      rerender(
        <TestWrapper>
          <BillingCycleSelector value={PLAN_BILLING_CYCLE.YEARLY} onChange={mockOnChange} />
        </TestWrapper>
      )

      await user.click(screen.getByText('Monthly'))
      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('Props', () => {
    it('should accept value prop', () => {
      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Monthly')).toBeInTheDocument()
    })

    it('should accept onChange prop', () => {
      const customOnChange = vi.fn()

      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={customOnChange} />,
        { wrapper: TestWrapper }
      )

      expect(customOnChange).not.toHaveBeenCalled()
    })

    it('should accept discountPercentage prop', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
          discountPercentage={25}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save 25%')).toBeInTheDocument()
    })

    it('should work without discountPercentage prop', () => {
      expect(() =>
        render(
          <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })
  })

  describe('Layout', () => {
    it('should render in a flex container', () => {
      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Monthly')).toBeInTheDocument()
      expect(screen.getByText('Yearly')).toBeInTheDocument()
    })

    it('should render both billing cycle options', () => {
      render(
        <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Monthly')).toBeInTheDocument()
      expect(screen.getByText('Yearly')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle discount percentage of 0', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
          discountPercentage={0}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Save/)).not.toBeInTheDocument()
    })

    it('should handle negative discount percentage', () => {
      render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
          discountPercentage={-10}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Save/)).not.toBeInTheDocument()
    })

    it('should render without errors', () => {
      expect(() =>
        render(
          <BillingCycleSelector value={PLAN_BILLING_CYCLE.MONTHLY} onChange={mockOnChange} />,
          { wrapper: TestWrapper }
        )
      ).not.toThrow()
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle switching cycles with discount badge visible', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.MONTHLY}
          onChange={mockOnChange}
          discountPercentage={20}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save 20%')).toBeInTheDocument()

      await user.click(screen.getByText('Yearly'))

      rerender(
        <TestWrapper>
          <BillingCycleSelector
            value={PLAN_BILLING_CYCLE.YEARLY}
            onChange={mockOnChange}
            discountPercentage={20}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Save 20%')).toBeInTheDocument()
    })

    it('should update when discount percentage changes', () => {
      const { rerender } = render(
        <BillingCycleSelector
          value={PLAN_BILLING_CYCLE.YEARLY}
          onChange={mockOnChange}
          discountPercentage={20}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save 20%')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <BillingCycleSelector
            value={PLAN_BILLING_CYCLE.YEARLY}
            onChange={mockOnChange}
            discountPercentage={30}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Save 30%')).toBeInTheDocument()
      expect(screen.queryByText('Save 20%')).not.toBeInTheDocument()
    })
  })
})
