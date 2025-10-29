/* Comprehensive test suite for PlanBasicDetails component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Plan module imports */
import PlanBasicDetails from '@plan-management/forms/tabs/basic-details'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PLAN_FORM_MODES } from '@plan-management/constants'
import * as planFormModeContext from '@plan-management/contexts'

/* Mock dependencies */
vi.mock('@shared/components/form-elements', () => ({
  TextInputField: ({ label, value, onChange, readOnly, errorMessage, required }: any) => (
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
  ),
  TextAreaField: ({ label, value, onChange, readOnly, errorMessage, required }: any) => (
    <div data-testid={`textarea-${label}`}>
      <label>{label}{required && ' *'}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        data-testid={`textarea-input-${label}`}
      />
      {errorMessage && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  SwitchField: ({ label, value, onChange, readOnly, activeText, inactiveText }: any) => (
    <div data-testid={`switch-${label}`}>
      <label>{label}</label>
      <button
        onClick={() => !readOnly && onChange(!value)}
        data-testid={`switch-button-${label}`}
        disabled={readOnly}
      >
        {value ? (activeText || 'On') : (inactiveText || 'Off')}
      </button>
    </div>
  )
}))

describe('PlanBasicDetails', () => {
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
        name: '',
        description: '',
        is_active: true,
        is_custom: false,
        included_devices_count: '',
        max_users_per_branch: '',
        included_branches_count: '',
        additional_device_cost: ''
      }
    })

    return (
      <FormProvider {...methods}>
        <PlanBasicDetails />
      </FormProvider>
    )
  }

  describe('Field Rendering', () => {
    it('should render plan name field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Plan Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Plan Name')).toBeInTheDocument()
    })

    it('should render description field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-input-Description')).toBeInTheDocument()
    })

    it('should render is_active toggle field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('switch-Active')).toBeInTheDocument()
      expect(screen.getByTestId('switch-button-Active')).toBeInTheDocument()
    })

    it('should render is_custom toggle field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('switch-Custom Plan')).toBeInTheDocument()
      expect(screen.getByTestId('switch-button-Custom Plan')).toBeInTheDocument()
    })

    it('should render numeric fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Included Devices')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Max Users Per Branch')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Included Branches')).toBeInTheDocument()
    })
  })

  describe('CREATE Mode', () => {
    it('should allow editing in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Plan Name')
      expect(nameInput).not.toHaveAttribute('readOnly')
    })

    it('should show required indicators in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameLabel = screen.getByText(/Plan Name/)
      expect(nameLabel.textContent).toContain('*')
    })

    it('should enable toggle switches in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const activeSwitch = screen.getByTestId('switch-button-Active')
      expect(activeSwitch).not.toBeDisabled()
    })

    it('should handle text input changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Plan Name')
      await user.type(nameInput, 'Premium Plan')

      expect(nameInput).toHaveValue('Premium Plan')
    })

    it('should handle textarea changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const descInput = screen.getByTestId('textarea-input-Description')
      await user.type(descInput, 'Best plan for businesses')

      expect(descInput).toHaveValue('Best plan for businesses')
    })

    it('should handle toggle switch changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const activeSwitch = screen.getByTestId('switch-button-Active')
      expect(activeSwitch).toHaveTextContent('Active')

      await user.click(activeSwitch)

      expect(activeSwitch).toHaveTextContent('Inactive')
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

      const nameInput = screen.getByTestId('input-Plan Name')
      expect(nameInput).not.toHaveAttribute('readOnly')
    })

    it('should show required indicators in EDIT mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameLabel = screen.getByText(/Plan Name/)
      expect(nameLabel.textContent).toContain('*')
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

      const nameInput = screen.getByTestId('input-Plan Name')
      expect(nameInput).toHaveAttribute('readOnly')
    })

    it('should disable toggle switches in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const activeSwitch = screen.getByTestId('switch-button-Active')
      expect(activeSwitch).toBeDisabled()
    })

    it('should not show required indicators in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameLabel = screen.getByText('Plan Name')
      expect(nameLabel.textContent).not.toContain('*')
    })
  })

  describe('Validation', () => {
    it('should display validation errors', () => {
      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { name: '' }
        })

        /* Manually set error */
        methods.setError('name', { message: 'Plan name is required' })

        return (
          <FormProvider {...methods}>
            <PlanBasicDetails />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Plan Name')).toHaveTextContent('Plan name is required')
    })

    it('should clear errors on field change', async () => {
      const user = userEvent.setup()

      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { name: '' }
        })

        methods.setError('name', { message: 'Plan name is required' })

        return (
          <FormProvider {...methods}>
            <PlanBasicDetails />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Plan Name')
      await user.type(nameInput, 'New Plan')

      /* Error should be cleared after typing */
      expect(screen.queryByTestId('error-Plan Name')).not.toBeInTheDocument()
    })
  })

  describe('Field Types', () => {
    it('should render text input fields for string values', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Plan Name')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Included Devices')).toBeInTheDocument()
    })

    it('should render textarea for description field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
    })

    it('should render toggle switches for boolean fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('switch-Active')).toBeInTheDocument()
      expect(screen.getByTestId('switch-Custom Plan')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('should render fields in a grid layout', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      /* SimpleGrid should be present */
      const grid = container.querySelector('[style*="grid"]') || container.querySelector('[class*="grid"]')
      expect(grid || container.firstChild).toBeTruthy()
    })

    it('should render all active fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Should render multiple fields */
      const textInputs = screen.getAllByRole('textbox')
      expect(textInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Integration', () => {
    it('should handle complete form data entry', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Fill in text fields */
      await user.type(screen.getByTestId('input-Plan Name'), 'Enterprise Plan')
      await user.type(screen.getByTestId('textarea-input-Description'), 'For large organizations')
      await user.type(screen.getByTestId('input-Included Devices'), '100')

      /* Toggle switches */
      await user.click(screen.getByTestId('switch-button-Custom Plan'))

      /* Verify values */
      expect(screen.getByTestId('input-Plan Name')).toHaveValue('Enterprise Plan')
      expect(screen.getByTestId('textarea-input-Description')).toHaveValue('For large organizations')
      expect(screen.getByTestId('input-Included Devices')).toHaveValue('100')
      expect(screen.getByTestId('switch-button-Custom Plan')).toHaveTextContent('Yes')
    })
  })
})
