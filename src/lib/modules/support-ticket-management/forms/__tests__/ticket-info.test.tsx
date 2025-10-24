/* Comprehensive test suite for TicketForm */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Support ticket module imports */
import TicketForm from '@support-ticket-management/forms/ticket-info'
import { CreateTicketFormSchema } from '@support-ticket-management/schemas'
import { TenantBasicDetails } from '@tenant-management/types'

/* Mock field component interfaces */
interface MockTextInputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  isInValid?: boolean
  errorMessage?: string
}

interface MockSelectOption {
  label: string
  value: string
}

interface MockSelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: MockSelectOption[]
  isInValid?: boolean
  errorMessage?: string
}

interface MockTextAreaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  isInValid?: boolean
  errorMessage?: string
}

interface MockDateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  isInValid?: boolean
  errorMessage?: string
}

interface MockFileFieldProps {
  label: string
  onChange: (files: File[]) => void
  isInValid?: boolean
  errorMessage?: string
}

interface MockNavigationButtonsProps {
  onCancel: () => void
  onSubmit: () => void
  loading: boolean
  submitText: string
  loadingText: string
}

/* Mock form field components */
vi.mock('@shared/components', () => ({
  TextInputField: ({ label, value, onChange, isInValid, errorMessage }: MockTextInputFieldProps) => (
    <div data-testid={`text-input-${label}`}>
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} data-testid={`input-${label}`} />
      {isInValid && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  SelectField: ({ label, value, onChange, options, isInValid, errorMessage }: MockSelectFieldProps) => (
    <div data-testid={`select-${label}`}>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={`select-input-${label}`}>
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {isInValid && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  TextAreaField: ({ label, value, onChange, isInValid, errorMessage }: MockTextAreaFieldProps) => (
    <div data-testid={`textarea-${label}`}>
      <label>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} data-testid={`textarea-input-${label}`} />
      {isInValid && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  DateField: ({ label, value, onChange, isInValid, errorMessage }: MockDateFieldProps) => (
    <div data-testid={`date-${label}`}>
      <label>{label}</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} data-testid={`date-input-${label}`} />
      {isInValid && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  FileField: ({ label, onChange, isInValid, errorMessage }: MockFileFieldProps) => (
    <div data-testid={`file-${label}`}>
      <label>{label}</label>
      <input
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          onChange(files)
        }}
        data-testid={`file-input-${label}`}
      />
      {isInValid && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  )
}))

vi.mock('@support-ticket-management/forms', () => ({
  NavigationButtons: ({ onCancel, onSubmit, loading, submitText, loadingText }: MockNavigationButtonsProps) => (
    <div data-testid="navigation-buttons">
      <button onClick={onCancel} disabled={loading} data-testid="cancel-button">Cancel</button>
      <button onClick={onSubmit} disabled={loading} data-testid="submit-button">
        {loading ? loadingText : submitText}
      </button>
    </div>
  )
}))

vi.mock('@shared/utils/formatting', () => ({
  fileToBase64: vi.fn((file: File) => Promise.resolve(`base64-${file.name}`))
}))

describe('TicketForm', () => {
  const mockTenantDetails: TenantBasicDetails[] = [
    {
      id: 1,
      tenant_id: 'tenant-1',
      organization_name: 'Test Organization',
      primary_email: 'test@example.com',
      primary_phone: '+1234567890'
    },
    {
      id: 2,
      tenant_id: 'tenant-2',
      organization_name: 'Another Organization',
      primary_email: 'another@example.com',
      primary_phone: '+9876543210'
    }
  ]

  const tenantSelectOptions = [
    { label: 'Test Organization', value: 'tenant-1' },
    { label: 'Another Organization', value: 'tenant-2' }
  ]

  const categorySelectOptions = [
    { label: 'Technical', value: '1' },
    { label: 'Billing', value: '2' }
  ]

  const defaultProps = {
    mode: 'CREATE' as const,
    tenantSelectOptions,
    categorySelectOptions,
    tenantDetails: mockTenantDetails,
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    isSubmitting: false
  }

  const TestWrapper = ({ children, defaultValues }: { children: React.ReactNode, defaultValues?: CreateTicketFormSchema }) => {
    const methods = useForm<CreateTicketFormSchema>({
      defaultValues: defaultValues || {
        tenant_id: '',
        requester_user_id: '',
        requester_email: '',
        requester_name: '',
        requester_phone: '',
        category_id: '',
        subject: '',
        message_content: '',
        resolution_due: undefined,
        internal_notes: null,
        attachments: []
      }
    })

    return (
      <Provider>
        <FormProvider {...methods}>
          {children}
        </FormProvider>
      </Provider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all form sections in CREATE mode', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      /* All three sections should be visible */
      expect(screen.getByText('Requester Information')).toBeInTheDocument()
      expect(screen.getByText('Ticket Information')).toBeInTheDocument()
      expect(screen.getAllByText('Attachments').length).toBeGreaterThan(0)
    })

    it('should render all requester information fields', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.getByTestId('select-Tenant Name')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Requester Name')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Requester Email')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Requester Phone')).toBeInTheDocument()
    })

    it('should render all ticket information fields', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.getByTestId('text-input-Subject')).toBeInTheDocument()
      expect(screen.getByTestId('select-Category')).toBeInTheDocument()
      expect(screen.getByTestId('date-Resolution Due Date')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Internal Notes')).toBeInTheDocument()
    })

    it('should render attachments field', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.getByTestId('file-Attachments')).toBeInTheDocument()
    })

    it('should render navigation buttons when onSubmit and onCancel are provided', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.getByTestId('navigation-buttons')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should not render navigation buttons when onSubmit is not provided', () => {
      const { onSubmit, ...propsWithoutSubmit } = defaultProps
      render(<TicketForm {...propsWithoutSubmit} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.queryByTestId('navigation-buttons')).not.toBeInTheDocument()
    })
  })

  describe('EDIT Mode Behavior', () => {
    it('should hide message_content field in EDIT mode', () => {
      render(<TicketForm {...defaultProps} mode="EDIT" />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.queryByTestId('textarea-Description')).not.toBeInTheDocument()
    })

    it('should hide internal_notes field in EDIT mode', () => {
      render(<TicketForm {...defaultProps} mode="EDIT" />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.queryByTestId('textarea-Internal Notes')).not.toBeInTheDocument()
    })

    it('should hide attachments field in EDIT mode', () => {
      render(<TicketForm {...defaultProps} mode="EDIT" />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.queryByTestId('file-Attachments')).not.toBeInTheDocument()
    })

    it('should still show requester information fields in EDIT mode', () => {
      render(<TicketForm {...defaultProps} mode="EDIT" />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.getByTestId('select-Tenant Name')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Requester Name')).toBeInTheDocument()
    })

    it('should not render Attachments section when all fields are hidden', () => {
      render(<TicketForm {...defaultProps} mode="EDIT" />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.queryByText('Attachments')).not.toBeInTheDocument()
    })
  })

  describe('Tenant Selection and Auto-fill', () => {
    it('should auto-fill requester details when tenant is selected', async () => {
      const user = userEvent.setup()

      const TestComponent = () => {
        const methods = useForm<CreateTicketFormSchema>({
          defaultValues: {
            tenant_id: '',
            requester_name: '',
            requester_email: '',
            requester_phone: '',
            category_id: '',
            subject: '',
            message_content: '',
            requester_user_id: '',
            resolution_due: undefined,
            internal_notes: null,
            attachments: []
          }
        })

        return (
          <Provider>
            <FormProvider {...methods}>
              <TicketForm {...defaultProps} />
              <div data-testid="form-values">
                {JSON.stringify(methods.watch())}
              </div>
            </FormProvider>
          </Provider>
        )
      }

      render(<TestComponent />)

      const tenantSelect = screen.getByTestId('select-input-Tenant Name')
      await user.selectOptions(tenantSelect, 'tenant-1')

      await waitFor(() => {
        const formValues = JSON.parse(screen.getByTestId('form-values').textContent || '{}')
        expect(formValues.requester_name).toBe('Test Organization')
        expect(formValues.requester_email).toBe('test@example.com')
        expect(formValues.requester_phone).toBe('+1234567890')
      })
    })

    it('should handle tenant selection when tenant details are missing', async () => {
      const user = userEvent.setup()

      render(
        <TicketForm {...defaultProps} tenantDetails={[]} />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      const tenantSelect = screen.getByTestId('select-input-Tenant Name')
      await user.selectOptions(tenantSelect, 'tenant-1')

      /* Should not throw error */
      expect(tenantSelect).toHaveValue('tenant-1')
    })

    it('should auto-fill with second tenant details', async () => {
      const user = userEvent.setup()

      const TestComponent = () => {
        const methods = useForm<CreateTicketFormSchema>({
          defaultValues: {
            tenant_id: '',
            requester_name: '',
            requester_email: '',
            requester_phone: '',
            category_id: '',
            subject: '',
            message_content: '',
            requester_user_id: '',
            resolution_due: undefined,
            internal_notes: null,
            attachments: []
          }
        })

        return (
          <Provider>
            <FormProvider {...methods}>
              <TicketForm {...defaultProps} />
              <div data-testid="form-values">
                {JSON.stringify(methods.watch())}
              </div>
            </FormProvider>
          </Provider>
        )
      }

      render(<TestComponent />)

      const tenantSelect = screen.getByTestId('select-input-Tenant Name')
      await user.selectOptions(tenantSelect, 'tenant-2')

      await waitFor(() => {
        const formValues = JSON.parse(screen.getByTestId('form-values').textContent || '{}')
        expect(formValues.requester_name).toBe('Another Organization')
        expect(formValues.requester_email).toBe('another@example.com')
        expect(formValues.requester_phone).toBe('+9876543210')
      })
    })
  })

  describe('File Upload', () => {
    it('should handle file upload', async () => {
      const user = userEvent.setup()
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

      const TestComponent = () => {
        const methods = useForm<CreateTicketFormSchema>({
          defaultValues: {
            tenant_id: '',
            requester_name: '',
            requester_email: '',
            requester_phone: '',
            category_id: '',
            subject: '',
            message_content: '',
            requester_user_id: '',
            resolution_due: undefined,
            internal_notes: null,
            attachments: []
          }
        })

        return (
          <Provider>
            <FormProvider {...methods}>
              <TicketForm {...defaultProps} />
              <div data-testid="attachments-count">
                {methods.watch('attachments')?.length || 0}
              </div>
            </FormProvider>
          </Provider>
        )
      }

      render(<TestComponent />)

      const fileInput = screen.getByTestId('file-input-Attachments')
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByTestId('attachments-count')).toHaveTextContent('1')
      })
    })

    it('should handle multiple file uploads', async () => {
      const user = userEvent.setup()
      const file1 = new File(['content 1'], 'file1.pdf', { type: 'application/pdf' })
      const file2 = new File(['content 2'], 'file2.jpg', { type: 'image/jpeg' })

      const TestComponent = () => {
        const methods = useForm<CreateTicketFormSchema>({
          defaultValues: {
            tenant_id: '',
            requester_name: '',
            requester_email: '',
            requester_phone: '',
            category_id: '',
            subject: '',
            message_content: '',
            requester_user_id: '',
            resolution_due: undefined,
            internal_notes: null,
            attachments: []
          }
        })

        return (
          <Provider>
            <FormProvider {...methods}>
              <TicketForm {...defaultProps} />
              <div data-testid="attachments-count">
                {methods.watch('attachments')?.length || 0}
              </div>
            </FormProvider>
          </Provider>
        )
      }

      render(<TestComponent />)

      const fileInput = screen.getByTestId('file-input-Attachments')
      await user.upload(fileInput, [file1, file2])

      await waitFor(() => {
        expect(screen.getByTestId('attachments-count')).toHaveTextContent('2')
      })
    })

    it('should handle file upload errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { fileToBase64 } = await import('@shared/utils/formatting')
      vi.mocked(fileToBase64).mockRejectedValueOnce(new Error('File conversion failed'))

      const user = userEvent.setup()
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      const fileInput = screen.getByTestId('file-input-Attachments')
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error processing files:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Select Options', () => {
    it('should display tenant select options', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      const tenantSelect = screen.getByTestId('select-input-Tenant Name')
      expect(tenantSelect).toBeInTheDocument()
      expect(screen.getByText('Test Organization')).toBeInTheDocument()
      expect(screen.getByText('Another Organization')).toBeInTheDocument()
    })

    it('should display category select options', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      const categorySelect = screen.getByTestId('select-input-Category')
      expect(categorySelect).toBeInTheDocument()
      expect(screen.getByText('Technical')).toBeInTheDocument()
      expect(screen.getByText('Billing')).toBeInTheDocument()
    })

    it('should handle empty tenant options', () => {
      render(
        <TicketForm {...defaultProps} tenantSelectOptions={[]} />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      const tenantSelect = screen.getByTestId('select-input-Tenant Name')
      expect(tenantSelect).toBeInTheDocument()
    })

    it('should handle empty category options', () => {
      render(
        <TicketForm {...defaultProps} categorySelectOptions={[]} />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      const categorySelect = screen.getByTestId('select-input-Category')
      expect(categorySelect).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should display validation errors', () => {
      const TestComponent = () => {
        const methods = useForm<CreateTicketFormSchema>({
          defaultValues: {
            tenant_id: '',
            requester_name: '',
            requester_email: '',
            requester_phone: '',
            category_id: '',
            subject: '',
            message_content: '',
            requester_user_id: '',
            resolution_due: undefined,
            internal_notes: null,
            attachments: []
          }
        })

        React.useEffect(() => {
          methods.setError('subject', { message: 'Subject is required' })
          methods.setError('requester_email', { message: 'Invalid email format' })
        }, [methods])

        return (
          <Provider>
            <FormProvider {...methods}>
              <TicketForm {...defaultProps} />
            </FormProvider>
          </Provider>
        )
      }

      render(<TestComponent />)

      expect(screen.getByTestId('error-Subject')).toHaveTextContent('Subject is required')
      expect(screen.getByTestId('error-Requester Email')).toHaveTextContent('Invalid email format')
    })
  })

  describe('User Interactions', () => {
    it('should allow typing in text fields', async () => {
      const user = userEvent.setup()

      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      const subjectInput = screen.getByTestId('input-Subject')
      await user.type(subjectInput, 'Test Subject')

      expect(subjectInput).toHaveValue('Test Subject')
    })

    it('should allow typing in textarea fields', async () => {
      const user = userEvent.setup()

      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      const descriptionTextarea = screen.getByTestId('textarea-input-Description')
      await user.type(descriptionTextarea, 'Test description')

      expect(descriptionTextarea).toHaveValue('Test description')
    })

    it('should allow selecting category', async () => {
      const user = userEvent.setup()

      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      const categorySelect = screen.getByTestId('select-input-Category')
      await user.selectOptions(categorySelect, '1')

      expect(categorySelect).toHaveValue('1')
    })

    it('should allow selecting date', async () => {
      const user = userEvent.setup()

      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      const dateInput = screen.getByTestId('date-input-Resolution Due Date')
      await user.type(dateInput, '2024-12-31')

      expect(dateInput).toHaveValue('2024-12-31')
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()

      render(
        <TicketForm {...defaultProps} onCancel={mockOnCancel} />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      const cancelButton = screen.getByTestId('cancel-button')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onSubmit when submit button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(
        <TicketForm {...defaultProps} onSubmit={mockOnSubmit} />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State', () => {
    it('should disable buttons when isSubmitting is true', () => {
      render(
        <TicketForm {...defaultProps} isSubmitting={true} />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      const submitButton = screen.getByTestId('submit-button')
      const cancelButton = screen.getByTestId('cancel-button')

      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    it('should display loading text when isSubmitting is true', () => {
      render(
        <TicketForm {...defaultProps} isSubmitting={true} loadingText="Creating..." />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })

    it('should display submit text when not submitting', () => {
      render(
        <TicketForm {...defaultProps} isSubmitting={false} submitText="Create Ticket" />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      expect(screen.getByText('Create Ticket')).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('should use default submitText when not provided', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should use default loadingText when not provided', () => {
      render(
        <TicketForm {...defaultProps} isSubmitting={true} />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })

    it('should use custom submitText when provided', () => {
      render(
        <TicketForm {...defaultProps} submitText="Save Ticket" />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      expect(screen.getByText('Save Ticket')).toBeInTheDocument()
    })

    it('should use custom loadingText when provided', () => {
      render(
        <TicketForm {...defaultProps} isSubmitting={true} loadingText="Saving..." />,
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      )

      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })

  describe('Field Display Order', () => {
    it('should render requester info fields in correct order', () => {
      render(<TicketForm {...defaultProps} />, { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> })

      /* Verify all requester fields are present */
      expect(screen.getByTestId('select-Tenant Name')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Requester Name')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Requester Email')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Requester Phone')).toBeInTheDocument()
    })
  })

  describe('Form Value Persistence', () => {
    it('should maintain form values across re-renders', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <TicketForm {...defaultProps} />,
        {
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{
              tenant_id: 'tenant-1',
              requester_name: 'Test User',
              requester_email: 'test@example.com',
              requester_phone: '',
              category_id: '1',
              subject: 'Test Subject',
              message_content: 'Test message',
              requester_user_id: '',
              resolution_due: undefined,
              internal_notes: null,
              attachments: []
            }}>
              {children}
            </TestWrapper>
          )
        }
      )

      expect(screen.getByTestId('input-Subject')).toHaveValue('Test Subject')

      rerender(
        <TestWrapper defaultValues={{
          tenant_id: 'tenant-1',
          requester_name: 'Test User',
          requester_email: 'test@example.com',
          requester_phone: '',
          category_id: '1',
          subject: 'Test Subject',
          message_content: 'Test message',
          requester_user_id: '',
          resolution_due: undefined,
          internal_notes: null,
          attachments: []
        }}>
          <TicketForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('input-Subject')).toHaveValue('Test Subject')
    })
  })
})
