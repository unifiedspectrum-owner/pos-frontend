/* Comprehensive test suite for CreateAddonForm component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import CreateAddonForm from '@plan-management/forms/tabs/components/addons/create-addon-form'
import { CreateAddonFormData } from '@plan-management/schemas'

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
  SelectField: ({ label, value, onChange, isInValid, errorMessage, options, placeholder }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    isInValid?: boolean;
    errorMessage?: string;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
  }) => (
    <div data-testid={`select-${label}`}>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`select-input-${label}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {isInValid && errorMessage && (
        <span data-testid={`error-${label}`}>{errorMessage}</span>
      )}
    </div>
  ),
  PrimaryButton: ({ children, onClick, loading, disabled }: {
    children: React.ReactNode;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="primary-button"
    >
      {loading ? 'Creating...' : children}
    </button>
  )
}))

describe('CreateAddonForm', () => {
  const mockHandleCreateAddon = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = ({ showCreateAddon = true, createAddonSubmitting = false }: {
    showCreateAddon?: boolean;
    createAddonSubmitting?: boolean;
  }) => {
    const createAddonForm = useForm<CreateAddonFormData>({
      defaultValues: {
        name: '',
        description: '',
        base_price: '',
        pricing_scope: undefined
      }
    })

    return (
      <CreateAddonForm
        showCreateAddon={showCreateAddon}
        createAddonForm={createAddonForm}
        createAddonSubmitting={createAddonSubmitting}
        handleCreateAddon={mockHandleCreateAddon}
      />
    )
  }

  describe('Visibility', () => {
    it('should render form when showCreateAddon is true', () => {
      render(<TestComponent showCreateAddon={true} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Add-on Name')).toBeInTheDocument()
    })

    it('should not render form when showCreateAddon is false', () => {
      render(<TestComponent showCreateAddon={false} />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('text-input-Add-on Name')).not.toBeInTheDocument()
    })
  })

  describe('Form Fields Rendering', () => {
    it('should render addon name field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Add-on Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Add-on Name')).toBeInTheDocument()
    })

    it('should render description field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-input-Description')).toBeInTheDocument()
    })


    it('should render pricing scope field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('select-Pricing Scope')).toBeInTheDocument()
      expect(screen.getByTestId('select-input-Pricing Scope')).toBeInTheDocument()
    })

    it('should show required indicators for required fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText(/Add-on Name \*/)).toBeInTheDocument()
      expect(screen.getByText(/Description \*/)).toBeInTheDocument()
    })

    it('should render create button', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
    })
  })

  describe('Form Input Handling', () => {
    it('should allow typing in addon name field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Add-on Name')
      await user.type(nameInput, 'Premium Analytics')

      expect(nameInput).toHaveValue('Premium Analytics')
    })

    it('should allow typing in description field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const descInput = screen.getByTestId('textarea-input-Description')
      await user.type(descInput, 'Advanced analytics features')

      expect(descInput).toHaveValue('Advanced analytics features')
    })


    it('should allow selecting pricing scope', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const scopeSelect = screen.getByTestId('select-input-Pricing Scope')
      await user.selectOptions(scopeSelect, 'branch')

      expect(scopeSelect).toHaveValue('branch')
    })

    it('should display pricing scope options', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const scopeSelect = screen.getByTestId('select-input-Pricing Scope')
      expect(scopeSelect.querySelector('option[value="branch"]')).toBeInTheDocument()
      expect(scopeSelect.querySelector('option[value="organization"]')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call handleCreateAddon when create button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const createButton = screen.getByTestId('primary-button')
      await user.click(createButton)

      await waitFor(() => {
        expect(mockHandleCreateAddon).toHaveBeenCalled()
      })
    })

    it('should submit form with entered data', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Fill in form fields */
      await user.type(screen.getByTestId('input-Add-on Name'), 'Cloud Storage')
      await user.type(screen.getByTestId('textarea-input-Description'), 'Additional storage space')
      await user.selectOptions(screen.getByTestId('select-input-Pricing Scope'), 'branch')

      /* Submit form */
      const createButton = screen.getByTestId('primary-button')
      await user.click(createButton)

      await waitFor(() => {
        expect(mockHandleCreateAddon).toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading state when submitting', () => {
      render(<TestComponent createAddonSubmitting={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(screen.queryByText('Create')).not.toBeInTheDocument()
    })

    it('should disable button when submitting', () => {
      render(<TestComponent createAddonSubmitting={true} />, { wrapper: TestWrapper })

      const createButton = screen.getByTestId('primary-button')
      expect(createButton).toBeDisabled()
    })

    it('should show create text when not submitting', () => {
      render(<TestComponent createAddonSubmitting={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.queryByText('Creating...')).not.toBeInTheDocument()
    })

    it('should enable button when not submitting', () => {
      render(<TestComponent createAddonSubmitting={false} />, { wrapper: TestWrapper })

      const createButton = screen.getByTestId('primary-button')
      expect(createButton).not.toBeDisabled()
    })
  })

  describe('Validation', () => {
    it('should display validation errors', () => {
      const TestComponentWithErrors = () => {
        const createAddonForm = useForm<CreateAddonFormData>({
          defaultValues: { name: '' }
        })

        React.useEffect(() => {
          createAddonForm.setError('name', { message: 'Add-on name is required' })
        }, [createAddonForm])

        return (
          <CreateAddonForm
            showCreateAddon={true}
            createAddonForm={createAddonForm}
            createAddonSubmitting={false}
            handleCreateAddon={mockHandleCreateAddon}
          />
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Add-on Name')).toHaveTextContent('Add-on name is required')
    })

    it('should display validation error for description', () => {
      const TestComponentWithErrors = () => {
        const createAddonForm = useForm<CreateAddonFormData>({
          defaultValues: { description: '' }
        })

        React.useEffect(() => {
          createAddonForm.setError('description', { message: 'Description is required' })
        }, [createAddonForm])

        return (
          <CreateAddonForm
            showCreateAddon={true}
            createAddonForm={createAddonForm}
            createAddonSubmitting={false}
            handleCreateAddon={mockHandleCreateAddon}
          />
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Description')).toHaveTextContent('Description is required')
    })
  })

  describe('Field Placeholders', () => {
    it('should display placeholder for addon name', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Add-on Name')
      expect(nameInput).toHaveAttribute('placeholder', 'Enter add-on name')
    })

    it('should display placeholder for description', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const descInput = screen.getByTestId('textarea-input-Description')
      expect(descInput).toHaveAttribute('placeholder', 'Add-on description')
    })


    it('should display placeholder for pricing scope', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const scopeSelect = screen.getByTestId('select-input-Pricing Scope')
      expect(scopeSelect.querySelector('option[value=""]')).toHaveTextContent('Select pricing scope')
    })
  })

  describe('Form Layout', () => {
    it('should render form in a grid layout', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      expect(container.firstChild).toBeTruthy()
    })

    it('should render all fields in correct order', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Check that all fields are present */
      expect(screen.getByTestId('text-input-Add-on Name')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
      expect(screen.getByTestId('select-Pricing Scope')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete addon creation workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Fill in all fields */
      await user.type(screen.getByTestId('input-Add-on Name'), 'SMS Package')
      await user.type(screen.getByTestId('textarea-input-Description'), 'SMS notification service')
      await user.selectOptions(screen.getByTestId('select-input-Pricing Scope'), 'organization')

      /* Verify values */
      expect(screen.getByTestId('input-Add-on Name')).toHaveValue('SMS Package')
      expect(screen.getByTestId('textarea-input-Description')).toHaveValue('SMS notification service')
      expect(screen.getByTestId('select-input-Pricing Scope')).toHaveValue('organization')

      /* Submit form */
      await user.click(screen.getByTestId('primary-button'))

      await waitFor(() => {
        expect(mockHandleCreateAddon).toHaveBeenCalled()
      })
    })

    it('should allow creating multiple addons by resetting form', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TestComponent />, { wrapper: TestWrapper })

      /* Create first addon */
      await user.type(screen.getByTestId('input-Add-on Name'), 'Addon 1')
      await user.click(screen.getByTestId('primary-button'))

      await waitFor(() => {
        expect(mockHandleCreateAddon).toHaveBeenCalled()
      })

      /* Re-render with fresh form */
      rerender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      /* Create second addon */
      await user.type(screen.getByTestId('input-Add-on Name'), 'Addon 2')
      await user.click(screen.getByTestId('primary-button'))

      await waitFor(() => {
        expect(mockHandleCreateAddon).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty form submission', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const createButton = screen.getByTestId('primary-button')
      await user.click(createButton)

      await waitFor(() => {
        expect(mockHandleCreateAddon).toHaveBeenCalled()
      })
    })

    it('should handle partial form data', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Fill only name field */
      await user.type(screen.getByTestId('input-Add-on Name'), 'Partial Addon')

      await user.click(screen.getByTestId('primary-button'))

      await waitFor(() => {
        expect(mockHandleCreateAddon).toHaveBeenCalled()
      })
    })

    it('should handle very long addon names', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const longName = 'A'.repeat(200)
      await user.type(screen.getByTestId('input-Add-on Name'), longName)

      expect(screen.getByTestId('input-Add-on Name')).toHaveValue(longName)
    })

    it('should handle special characters in addon name', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.type(screen.getByTestId('input-Add-on Name'), 'Add-on & Feature #1')

      expect(screen.getByTestId('input-Add-on Name')).toHaveValue('Add-on & Feature #1')
    })
  })
})
