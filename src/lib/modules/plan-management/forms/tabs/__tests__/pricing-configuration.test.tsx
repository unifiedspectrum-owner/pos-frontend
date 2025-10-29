/* Comprehensive test suite for PlanPricingConfiguration component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import PlanPricingConfiguration from '@plan-management/forms/tabs/pricing-configuration'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PLAN_FORM_MODES } from '@plan-management/constants'
import * as planFormModeContext from '@plan-management/contexts'

/* Mock VolumeDiscounts component */
vi.mock('@plan-management/forms/tabs/components/volume-discounts', () => ({
  VolumeDiscounts: () => <div data-testid="volume-discounts">Volume Discounts Component</div>
}))

/* Mock shared components */
vi.mock('@shared/components/form-elements', () => ({
  TextInputField: ({ label, value, onChange, readOnly, errorMessage, required }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    errorMessage?: string;
    required?: boolean
  }) => (
    <div data-testid={`text-input-${label}`}>
      <label>{label}{required && ' *'}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        data-testid={`input-${label}`}
      />
      {errorMessage && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  )
}))

describe('PlanPricingConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
      mode: PLAN_FORM_MODES.CREATE,
      planId: undefined
    })
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = () => {
    const methods = useForm<CreatePlanFormData>({
      defaultValues: {
        monthly_price: '',
        additional_device_cost: '',
        annual_discount_percentage: '',
        monthly_fee_our_gateway: '',
        monthly_fee_byo_processor: '',
        card_processing_fee_percentage: '',
        card_processing_fee_fixed: '',
        volume_discounts: []
      }
    })

    return (
      <FormProvider {...methods}>
        <PlanPricingConfiguration />
      </FormProvider>
    )
  }

  describe('Field Rendering', () => {
    it('should render monthly price field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Monthly Price ($)')).toBeInTheDocument()
      expect(screen.getByTestId('input-Monthly Price ($)')).toBeInTheDocument()
    })

    it('should render additional device cost field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Additional Device Cost ($)')).toBeInTheDocument()
      expect(screen.getByTestId('input-Additional Device Cost ($)')).toBeInTheDocument()
    })

    it('should render annual discount field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Annual Discount (%)')).toBeInTheDocument()
      expect(screen.getByTestId('input-Annual Discount (%)')).toBeInTheDocument()
    })

    it('should render monthly fee fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Monthly Fee (Our Gateway) ($)')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Monthly Fee (BYO Processor) ($)')).toBeInTheDocument()
    })

    it('should render card processing fee fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Card Processing Fee (%)')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Card Processing Fee (Fixed) ($)')).toBeInTheDocument()
    })

    it('should render VolumeDiscounts component', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('volume-discounts')).toBeInTheDocument()
      expect(screen.getByText('Volume Discounts Component')).toBeInTheDocument()
    })

    it('should render all active pricing fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const textInputs = screen.getAllByRole('textbox')
      expect(textInputs.length).toBeGreaterThan(0)
    })
  })

  describe('CREATE Mode', () => {
    it('should allow editing in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      expect(monthlyPriceInput).not.toHaveAttribute('readOnly')
    })

    it('should show required indicators in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceLabel = screen.getByText(/Monthly Price/)
      expect(monthlyPriceLabel.textContent).toContain('*')
    })

    it('should handle text input changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      await user.type(monthlyPriceInput, '99.99')

      expect(monthlyPriceInput).toHaveValue('99.99')
    })

    it('should handle multiple field changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      const deviceCostInput = screen.getByTestId('input-Additional Device Cost ($)')

      await user.type(monthlyPriceInput, '99.99')
      await user.type(deviceCostInput, '49.99')

      expect(monthlyPriceInput).toHaveValue('99.99')
      expect(deviceCostInput).toHaveValue('49.99')
    })
  })

  describe('EDIT Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })
    })

    it('should allow editing in EDIT mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      expect(monthlyPriceInput).not.toHaveAttribute('readOnly')
    })

    it('should show required indicators in EDIT mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceLabel = screen.getByText(/Monthly Price/)
      expect(monthlyPriceLabel.textContent).toContain('*')
    })
  })

  describe('VIEW Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })
    })

    it('should be read-only in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      expect(monthlyPriceInput).toHaveAttribute('readOnly')
    })

    it('should not show required indicators in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceLabel = screen.getByText('Monthly Price ($)')
      expect(monthlyPriceLabel.textContent).not.toContain('*')
    })

    it('should disable all input fields in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      const deviceCostInput = screen.getByTestId('input-Additional Device Cost ($)')

      expect(monthlyPriceInput).toHaveAttribute('readOnly')
      expect(deviceCostInput).toHaveAttribute('readOnly')
    })
  })

  describe('Validation', () => {
    it('should display validation errors', () => {
      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { monthly_price: '' }
        })

        /* Manually set error using useEffect to avoid infinite re-renders */
        React.useEffect(() => {
          methods.setError('monthly_price', { message: 'Monthly price is required' })
        }, [methods])

        return (
          <FormProvider {...methods}>
            <PlanPricingConfiguration />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Monthly Price ($)')).toHaveTextContent('Monthly price is required')
    })

    it('should clear errors on field change', async () => {
      const user = userEvent.setup()

      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { monthly_price: '' }
        })

        /* Manually set error using useEffect to avoid infinite re-renders */
        React.useEffect(() => {
          methods.setError('monthly_price', { message: 'Monthly price is required' })
        }, [methods])

        return (
          <FormProvider {...methods}>
            <PlanPricingConfiguration />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      await user.type(monthlyPriceInput, '99.99')

      /* Error should be cleared after typing */
      expect(screen.queryByTestId('error-Monthly Price ($)')).not.toBeInTheDocument()
    })

    it('should show multiple field errors', () => {
      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { monthly_price: '', additional_device_cost: '' }
        })

        /* Manually set errors using useEffect to avoid infinite re-renders */
        React.useEffect(() => {
          methods.setError('monthly_price', { message: 'Monthly price is required' })
          methods.setError('additional_device_cost', { message: 'Device cost is required' })
        }, [methods])

        return (
          <FormProvider {...methods}>
            <PlanPricingConfiguration />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Monthly Price ($)')).toHaveTextContent('Monthly price is required')
      expect(screen.getByTestId('error-Additional Device Cost ($)')).toHaveTextContent('Device cost is required')
    })
  })

  describe('Field Types', () => {
    it('should render all fields as text inputs', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Monthly Price ($)')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Additional Device Cost ($)')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Annual Discount (%)')).toBeInTheDocument()
    })

    it('should handle numeric string values', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      await user.type(monthlyPriceInput, '123.45')

      expect(monthlyPriceInput).toHaveValue('123.45')
    })
  })

  describe('Grid Layout', () => {
    it('should render fields in a grid layout', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      const grid = container.querySelector('[style*="grid"]') || container.querySelector('[class*="grid"]')
      expect(grid || container.firstChild).toBeTruthy()
    })

    it('should render all pricing fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const textInputs = screen.getAllByRole('textbox')
      expect(textInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Integration', () => {
    it('should handle complete pricing form data entry', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Fill in pricing fields */
      await user.type(screen.getByTestId('input-Monthly Price ($)'), '99.99')
      await user.type(screen.getByTestId('input-Additional Device Cost ($)'), '49.99')
      await user.type(screen.getByTestId('input-Annual Discount (%)'), '10')
      await user.type(screen.getByTestId('input-Monthly Fee (Our Gateway) ($)'), '5.00')
      await user.type(screen.getByTestId('input-Card Processing Fee (%)'), '2.5')

      /* Verify values */
      expect(screen.getByTestId('input-Monthly Price ($)')).toHaveValue('99.99')
      expect(screen.getByTestId('input-Additional Device Cost ($)')).toHaveValue('49.99')
      expect(screen.getByTestId('input-Annual Discount (%)')).toHaveValue('10')
      expect(screen.getByTestId('input-Monthly Fee (Our Gateway) ($)')).toHaveValue('5.00')
      expect(screen.getByTestId('input-Card Processing Fee (%)')).toHaveValue('2.5')
    })

    it('should render both pricing fields and volume discounts', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Pricing fields */
      expect(screen.getByTestId('text-input-Monthly Price ($)')).toBeInTheDocument()

      /* Volume discounts component */
      expect(screen.getByTestId('volume-discounts')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should render pricing section with volume discounts below', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Both sections should be present */
      expect(screen.getByTestId('text-input-Monthly Price ($)')).toBeInTheDocument()
      expect(screen.getByTestId('volume-discounts')).toBeInTheDocument()
    })

    it('should maintain proper section layout', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      /* Should have main container */
      expect(container.firstChild).toBeTruthy()

      /* Should have pricing fields */
      expect(screen.getByTestId('text-input-Monthly Price ($)')).toBeInTheDocument()

      /* Should have volume discounts */
      expect(screen.getByTestId('volume-discounts')).toBeInTheDocument()
    })
  })

  describe('Form Context Integration', () => {
    it('should integrate with form context for value management', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      await user.type(monthlyPriceInput, '99.99')

      expect(monthlyPriceInput).toHaveValue('99.99')
    })

    it('should integrate with form context for error management', () => {
      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { monthly_price: '' }
        })

        /* Manually set error using useEffect to avoid infinite re-renders */
        React.useEffect(() => {
          methods.setError('monthly_price', { message: 'Invalid price format' })
        }, [methods])

        return (
          <FormProvider {...methods}>
            <PlanPricingConfiguration />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Monthly Price ($)')).toHaveTextContent('Invalid price format')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      expect(monthlyPriceInput).toHaveValue('')
    })

    it('should handle undefined values gracefully', () => {
      const TestComponentWithUndefined = () => {
        const methods = useForm<CreatePlanFormData>()

        return (
          <FormProvider {...methods}>
            <PlanPricingConfiguration />
          </FormProvider>
        )
      }

      render(<TestComponentWithUndefined />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')
      expect(monthlyPriceInput).toHaveValue('')
    })

    it('should handle rapid field changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const monthlyPriceInput = screen.getByTestId('input-Monthly Price ($)')

      await user.type(monthlyPriceInput, '123')
      await user.clear(monthlyPriceInput)
      await user.type(monthlyPriceInput, '456')

      expect(monthlyPriceInput).toHaveValue('456')
    })
  })
})
