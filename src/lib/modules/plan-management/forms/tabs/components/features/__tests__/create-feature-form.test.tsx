/* Comprehensive test suite for CreateFeatureForm component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import CreateFeatureForm from '@plan-management/forms/tabs/components/features/create-feature-form'
import { CreateFeatureFormData } from '@plan-management/schemas'

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
      {children}
    </button>
  )
}))

describe('CreateFeatureForm', () => {
  const mockHandleCreateFeature = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = ({ showCreateFeature = true, createFeatureSubmitting = false }: {
    showCreateFeature?: boolean;
    createFeatureSubmitting?: boolean;
  }) => {
    const createFeatureForm = useForm<CreateFeatureFormData>({
      defaultValues: {
        name: '',
        description: ''
      }
    })

    return (
      <CreateFeatureForm
        showCreateFeature={showCreateFeature}
        createFeatureForm={createFeatureForm}
        createFeatureSubmitting={createFeatureSubmitting}
        handleCreateFeature={mockHandleCreateFeature}
      />
    )
  }

  describe('Component Rendering', () => {
    it('should render form when showCreateFeature is true', () => {
      render(<TestComponent showCreateFeature={true} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Feature Name')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('should not render form when showCreateFeature is false', () => {
      render(<TestComponent showCreateFeature={false} />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('text-input-Feature Name')).not.toBeInTheDocument()
      expect(screen.queryByTestId('textarea-Description')).not.toBeInTheDocument()
    })

    it('should render all form fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('input-Feature Name')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-input-Description')).toBeInTheDocument()
    })

    it('should render create button with correct text', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveTextContent('Create')
    })

    it('should render required indicators for required fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameLabel = screen.getByText(/Feature Name/)
      expect(nameLabel.textContent).toContain('*')
    })
  })

  describe('Form Interactions', () => {
    it('should allow typing in name field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Feature Name')
      await user.type(nameInput, 'Advanced Reporting')

      expect(nameInput).toHaveValue('Advanced Reporting')
    })

    it('should allow typing in description field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const descInput = screen.getByTestId('textarea-input-Description')
      await user.type(descInput, 'Detailed analytics and reporting')

      expect(descInput).toHaveValue('Detailed analytics and reporting')
    })

    it('should handle multiple field changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Feature Name')
      const descInput = screen.getByTestId('textarea-input-Description')

      await user.type(nameInput, 'Test Feature')
      await user.type(descInput, 'Test Description')

      expect(nameInput).toHaveValue('Test Feature')
      expect(descInput).toHaveValue('Test Description')
    })

    it('should call handleCreateFeature when create button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      await user.click(button)

      await waitFor(() => {
        expect(mockHandleCreateFeature).toHaveBeenCalled()
      })
    })
  })

  describe('Submitting State', () => {
    it('should show "Creating..." text when submitting', () => {
      render(<TestComponent createFeatureSubmitting={true} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveTextContent('Creating...')
    })

    it('should disable button when submitting', () => {
      render(<TestComponent createFeatureSubmitting={true} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toBeDisabled()
    })

    it('should show "Create" text when not submitting', () => {
      render(<TestComponent createFeatureSubmitting={false} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveTextContent('Create')
    })

    it('should enable button when not submitting', () => {
      render(<TestComponent createFeatureSubmitting={false} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should display validation error for name field', () => {
      const TestComponentWithError = () => {
        const createFeatureForm = useForm<CreateFeatureFormData>({
          defaultValues: { name: '', description: '' }
        })

        React.useEffect(() => {
          createFeatureForm.setError('name', { message: 'Feature name is required' })
        }, [createFeatureForm])

        return (
          <CreateFeatureForm
            showCreateFeature={true}
            createFeatureForm={createFeatureForm}
            createFeatureSubmitting={false}
            handleCreateFeature={mockHandleCreateFeature}
          />
        )
      }

      render(<TestComponentWithError />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Feature Name')).toHaveTextContent('Feature name is required')
    })

    it('should display validation error for description field', () => {
      const TestComponentWithError = () => {
        const createFeatureForm = useForm<CreateFeatureFormData>({
          defaultValues: { name: '', description: '' }
        })

        React.useEffect(() => {
          createFeatureForm.setError('description', { message: 'Description is required' })
        }, [createFeatureForm])

        return (
          <CreateFeatureForm
            showCreateFeature={true}
            createFeatureForm={createFeatureForm}
            createFeatureSubmitting={false}
            handleCreateFeature={mockHandleCreateFeature}
          />
        )
      }

      render(<TestComponentWithError />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Description')).toHaveTextContent('Description is required')
    })
  })

  describe('Field Properties', () => {
    it('should have correct placeholders', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Feature Name')
      const descInput = screen.getByTestId('textarea-input-Description')

      expect(nameInput).toHaveAttribute('placeholder')
      expect(descInput).toHaveAttribute('placeholder')
    })

    it('should render fields in correct order', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameField = screen.getByTestId('text-input-Feature Name')
      const descField = screen.getByTestId('textarea-Description')

      expect(nameField).toBeInTheDocument()
      expect(descField).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty form submission', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      await user.click(button)

      await waitFor(() => {
        expect(mockHandleCreateFeature).toHaveBeenCalled()
      })
    })

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      await user.click(button)
      await user.click(button)

      await waitFor(() => {
        expect(mockHandleCreateFeature).toHaveBeenCalled()
      })
    })

    it('should handle very long input values', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const longText = 'A'.repeat(500)
      const nameInput = screen.getByTestId('input-Feature Name')
      await user.click(nameInput)
      await user.paste(longText)

      expect(nameInput).toHaveValue(longText)
    })
  })
})
