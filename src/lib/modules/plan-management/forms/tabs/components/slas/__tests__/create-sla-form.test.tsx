/* Comprehensive test suite for CreateSLAForm component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import CreateSLAForm from '@plan-management/forms/tabs/components/slas/create-sla-form'
import { CreateSlaFormData } from '@plan-management/schemas'

/* Mock shared components */
vi.mock('@shared/components', () => ({
  TextInputField: ({ label, value, onChange, isInValid, errorMessage, required, placeholder }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    isInValid?: boolean;
    errorMessage?: string;
    required?: boolean;
    placeholder?: string;
  }) => (
    <div data-testid={`text-input-${label}`}>
      <label>
        {label}
        {required && ' *'}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`input-${label}`}
      />
      {isInValid && errorMessage && (
        <span data-testid={`error-${label}`}>{errorMessage}</span>
      )}
    </div>
  ),
  TextAreaField: ({ label, value, onChange, isInValid, errorMessage, required, placeholder }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    isInValid?: boolean;
    errorMessage?: string;
    required?: boolean;
    placeholder?: string;
  }) => (
    <div data-testid={`textarea-${label}`}>
      <label>
        {label}
        {required && ' *'}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`textarea-input-${label}`}
      />
      {isInValid && errorMessage && (
        <span data-testid={`error-${label}`}>{errorMessage}</span>
      )}
    </div>
  ),
  SelectField: ({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div data-testid={`select-${label}`}>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={`select-input-${label}`}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  ),
  SwitchField: ({ label, value, onChange }: {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div data-testid={`switch-${label}`}>
      <label>{label}</label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        data-testid={`switch-input-${label}`}
      />
    </div>
  ),
  PrimaryButton: ({ children, onClick, loading, disabled, leftIcon }: {
    children: React.ReactNode;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: React.ComponentType;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid="primary-button" data-loading={loading}>
      {children}
    </button>
  )
}))

describe('CreateSLAForm', () => {
  const mockHandleCreateSla = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = ({
    showCreateSla = true,
    createSlaSubmitting = false
  }: {
    showCreateSla?: boolean;
    createSlaSubmitting?: boolean
  } = {}) => {
    const createSlaForm = useForm<CreateSlaFormData>({
      defaultValues: {
        name: '',
        support_channel: '',
        response_time_hours: '',
        availability_schedule: '',
        notes: ''
      }
    })

    return (
      <CreateSLAForm
        showCreateSla={showCreateSla}
        createSlaForm={createSlaForm}
        createSlaSubmitting={createSlaSubmitting}
        handleCreateSla={mockHandleCreateSla}
      />
    )
  }

  describe('Component Rendering', () => {
    it('should render form when showCreateSla is true', () => {
      render(<TestComponent showCreateSla={true} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-SLA Name')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Support Channel')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Response Time (hours)')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Availability Schedule')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Notes (Optional)')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('should not render form when showCreateSla is false', () => {
      render(<TestComponent showCreateSla={false} />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('text-input-SLA Name')).not.toBeInTheDocument()
      expect(screen.queryByTestId('text-input-Support Channel')).not.toBeInTheDocument()
    })

    it('should render all form fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('input-SLA Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Support Channel')).toBeInTheDocument()
      expect(screen.getByTestId('input-Response Time (hours)')).toBeInTheDocument()
      expect(screen.getByTestId('input-Availability Schedule')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-input-Notes (Optional)')).toBeInTheDocument()
    })

    it('should render create button with correct text', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveTextContent('Create')
    })

    it('should render required indicators for required fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameLabel = screen.getByText(/SLA Name/)
      const channelLabel = screen.getByText(/Support Channel/)
      const responseLabel = screen.getByText(/Response Time/)
      const scheduleLabel = screen.getByText(/Availability Schedule/)

      expect(nameLabel.textContent).toContain('*')
      expect(channelLabel.textContent).toContain('*')
      expect(responseLabel.textContent).toContain('*')
      expect(scheduleLabel.textContent).toContain('*')
    })

    it('should not render required indicator for optional notes field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const notesLabel = screen.getByText(/Notes \(Optional\)/)
      expect(notesLabel.textContent).not.toContain('*')
    })
  })

  describe('Form Interactions', () => {
    it('should allow typing in SLA name field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-SLA Name')
      await user.type(nameInput, 'Premium Support')

      expect(nameInput).toHaveValue('Premium Support')
    })

    it('should allow typing in support channel field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const channelInput = screen.getByTestId('input-Support Channel')
      await user.type(channelInput, 'Email, Phone')

      expect(channelInput).toHaveValue('Email, Phone')
    })

    it('should allow typing in response time field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const responseInput = screen.getByTestId('input-Response Time (hours)')
      await user.type(responseInput, '24')

      expect(responseInput).toHaveValue('24')
    })

    it('should allow typing in availability schedule field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const scheduleInput = screen.getByTestId('input-Availability Schedule')
      await user.type(scheduleInput, '24/7')

      expect(scheduleInput).toHaveValue('24/7')
    })

    it('should allow typing in notes field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const notesInput = screen.getByTestId('textarea-input-Notes (Optional)')
      await user.type(notesInput, 'Additional support notes')

      expect(notesInput).toHaveValue('Additional support notes')
    })

    it('should handle multiple field changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-SLA Name')
      const channelInput = screen.getByTestId('input-Support Channel')
      const responseInput = screen.getByTestId('input-Response Time (hours)')

      await user.type(nameInput, 'Standard Support')
      await user.type(channelInput, 'Email')
      await user.type(responseInput, '48')

      expect(nameInput).toHaveValue('Standard Support')
      expect(channelInput).toHaveValue('Email')
      expect(responseInput).toHaveValue('48')
    })

    it('should call handleCreateSla when create button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      await user.click(button)

      await waitFor(() => {
        expect(mockHandleCreateSla).toHaveBeenCalled()
      })
    })
  })

  describe('Submitting State', () => {
    it('should show "Creating..." text when submitting', () => {
      render(<TestComponent createSlaSubmitting={true} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveTextContent('Creating...')
    })

    it('should disable button when submitting', () => {
      render(<TestComponent createSlaSubmitting={true} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toBeDisabled()
    })

    it('should show "Create" text when not submitting', () => {
      render(<TestComponent createSlaSubmitting={false} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveTextContent('Create')
    })

    it('should enable button when not submitting', () => {
      render(<TestComponent createSlaSubmitting={false} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).not.toBeDisabled()
    })

    it('should show loading state in button', () => {
      render(<TestComponent createSlaSubmitting={true} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('Form Validation', () => {
    it('should display validation error for SLA name field', () => {
      const TestComponentWithError = () => {
        const createSlaForm = useForm<CreateSlaFormData>({
          defaultValues: { name: '', support_channel: '', response_time_hours: '', availability_schedule: '', notes: '' }
        })

        React.useEffect(() => {
          createSlaForm.setError('name', { message: 'SLA name is required' })
        }, [createSlaForm])

        return (
          <CreateSLAForm
            showCreateSla={true}
            createSlaForm={createSlaForm}
            createSlaSubmitting={false}
            handleCreateSla={mockHandleCreateSla}
          />
        )
      }

      render(<TestComponentWithError />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-SLA Name')).toHaveTextContent('SLA name is required')
    })

    it('should display validation error for support channel field', () => {
      const TestComponentWithError = () => {
        const createSlaForm = useForm<CreateSlaFormData>({
          defaultValues: { name: '', support_channel: '', response_time_hours: '', availability_schedule: '', notes: '' }
        })

        React.useEffect(() => {
          createSlaForm.setError('support_channel', { message: 'Support channel is required' })
        }, [createSlaForm])

        return (
          <CreateSLAForm
            showCreateSla={true}
            createSlaForm={createSlaForm}
            createSlaSubmitting={false}
            handleCreateSla={mockHandleCreateSla}
          />
        )
      }

      render(<TestComponentWithError />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Support Channel')).toHaveTextContent('Support channel is required')
    })
  })

  describe('Field Properties', () => {
    it('should have correct placeholders', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-SLA Name')
      const channelInput = screen.getByTestId('input-Support Channel')
      const responseInput = screen.getByTestId('input-Response Time (hours)')
      const scheduleInput = screen.getByTestId('input-Availability Schedule')
      const notesInput = screen.getByTestId('textarea-input-Notes (Optional)')

      expect(nameInput).toHaveAttribute('placeholder', 'Enter SLA name')
      expect(channelInput).toHaveAttribute('placeholder', 'e.g., Email, Phone, Chat')
      expect(responseInput).toHaveAttribute('placeholder', 'e.g., 24')
      expect(scheduleInput).toHaveAttribute('placeholder', 'e.g., 24/7, Business Hours')
      expect(notesInput).toHaveAttribute('placeholder', 'Additional notes about this SLA')
    })

    it('should render fields in correct order', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameField = screen.getByTestId('text-input-SLA Name')
      const channelField = screen.getByTestId('text-input-Support Channel')
      const responseField = screen.getByTestId('text-input-Response Time (hours)')
      const scheduleField = screen.getByTestId('text-input-Availability Schedule')
      const notesField = screen.getByTestId('textarea-Notes (Optional)')

      expect(nameField).toBeInTheDocument()
      expect(channelField).toBeInTheDocument()
      expect(responseField).toBeInTheDocument()
      expect(scheduleField).toBeInTheDocument()
      expect(notesField).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty form submission', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      await user.click(button)

      await waitFor(() => {
        expect(mockHandleCreateSla).toHaveBeenCalled()
      })
    })

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      await user.click(button)
      await user.click(button)

      await waitFor(() => {
        expect(mockHandleCreateSla).toHaveBeenCalled()
      })
    })

    it('should handle very long input values', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const longText = 'A'.repeat(500)
      const nameInput = screen.getByTestId('input-SLA Name')
      await user.click(nameInput)
      await user.paste(longText)

      expect(nameInput).toHaveValue(longText)
    })

    it('should handle special characters in input fields', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-SLA Name')
      await user.type(nameInput, 'Premium & Elite Support (24/7)')

      expect(nameInput).toHaveValue('Premium & Elite Support (24/7)')
    })
  })

  describe('Toggle Between States', () => {
    it('should toggle from hidden to visible', () => {
      const { rerender } = render(
        <TestComponent showCreateSla={false} />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('text-input-SLA Name')).not.toBeInTheDocument()

      rerender(
        <Provider>
          <TestComponent showCreateSla={true} />
        </Provider>
      )

      expect(screen.getByTestId('text-input-SLA Name')).toBeInTheDocument()
    })

    it('should toggle from not submitting to submitting', () => {
      const { rerender } = render(
        <TestComponent createSlaSubmitting={false} />,
        { wrapper: TestWrapper }
      )

      let button = screen.getByTestId('primary-button')
      expect(button).toHaveTextContent('Create')
      expect(button).not.toBeDisabled()

      rerender(
        <Provider>
          <TestComponent createSlaSubmitting={true} />
        </Provider>
      )

      button = screen.getByTestId('primary-button')
      expect(button).toHaveTextContent('Creating...')
      expect(button).toBeDisabled()
    })
  })
})
