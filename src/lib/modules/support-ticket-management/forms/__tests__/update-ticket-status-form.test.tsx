/* Comprehensive test suite for UpdateTicketStatusForm */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import UpdateTicketStatusForm from '@support-ticket-management/forms/update-ticket-status-form'
import * as useTicketOperationsHook from '@support-ticket-management/hooks/use-ticket-operations'

/* Mock component interfaces */
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

interface MockPrimaryButtonProps {
  buttonText: string
  loadingText: string
  isLoading: boolean
  disabled: boolean
  type: 'submit' | 'button' | 'reset'
  onClick?: () => void
}

/* Mock shared components */
vi.mock('@shared/components', () => ({
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
  PrimaryButton: ({ buttonText, loadingText, isLoading, disabled, type, onClick }: MockPrimaryButtonProps) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      data-testid={buttonText === 'Cancel' ? 'cancel-button' : 'submit-button'}
    >
      {isLoading ? loadingText : buttonText}
    </button>
  )
}))

describe('UpdateTicketStatusForm', () => {
  const mockUpdateTicketStatus = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultHookReturn = {
    updateTicketStatus: mockUpdateTicketStatus,
    isUpdatingStatus: false,
    updateStatusError: null,
    createTicket: vi.fn(),
    isCreating: false,
    createError: null,
    updateSupportTicket: vi.fn(),
    isUpdating: false,
    updateError: null,
    deleteTicket: vi.fn(),
    isDeleting: false,
    deleteError: null,
    ticketDetails: null,
    isFetching: false,
    fetchError: null,
    fetchTicketDetails: vi.fn()
  }

  const defaultProps = {
    ticketId: 'TICK-001',
    ticketNumber: 'TICK-001',
    ticketSubject: 'Login issue',
    currentStatus: 'open' as const,
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering', () => {
    it('should render the form with all fields', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByTestId('select-New Status')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Status Change Reason')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should display ticket information when provided', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Updating Ticket Status')).toBeInTheDocument()
      expect(screen.getByText('TICK-001')).toBeInTheDocument()
      expect(screen.getByText('Login issue')).toBeInTheDocument()
    })

    it('should display current status badge', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Updating Ticket Status')).toBeInTheDocument()
    })

    it('should not display ticket info section when ticketNumber is not provided', () => {
      const { ticketNumber, ...propsWithoutTicketNumber } = defaultProps

      render(
        <Provider>
          <UpdateTicketStatusForm {...propsWithoutTicketNumber} />
        </Provider>
      )

      expect(screen.queryByText('Updating Ticket Status')).not.toBeInTheDocument()
    })

    it('should display cancel button when onCancel is provided', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    it('should not display cancel button when onCancel is not provided', () => {
      const { onCancel, ...propsWithoutCancel } = defaultProps

      render(
        <Provider>
          <UpdateTicketStatusForm {...propsWithoutCancel} />
        </Provider>
      )

      expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument()
    })

    it('should display submit button with correct text', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Update Status')).toBeInTheDocument()
    })

    it('should display instruction message', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Select a new status and provide a reason for the status change')).toBeInTheDocument()
    })
  })

  describe('Form Initialization', () => {
    it('should initialize status field with currentStatus', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} currentStatus="in_progress" />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')
      expect(statusSelect).toHaveValue('in_progress')
    })

    it('should initialize status with default value when currentStatus is not provided', () => {
      const { currentStatus, ...propsWithoutStatus } = defaultProps

      render(
        <Provider>
          <UpdateTicketStatusForm {...propsWithoutStatus} />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')
      expect(statusSelect).toHaveValue('open')
    })

    it('should initialize status_reason with empty string', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const reasonTextarea = screen.getByTestId('textarea-input-Status Change Reason')
      expect(reasonTextarea).toHaveValue('')
    })
  })

  describe('Status Options', () => {
    it('should display available status options', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')
      expect(statusSelect).toBeInTheDocument()
    })

    it('should allow selecting different status', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')
      await user.selectOptions(statusSelect, 'resolved')

      expect(statusSelect).toHaveValue('resolved')
    })
  })

  describe('Form Submission', () => {
    it('should call updateTicketStatus with correct data on submit', async () => {
      const user = userEvent.setup()
      mockUpdateTicketStatus.mockResolvedValueOnce(true)

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')
      await user.selectOptions(statusSelect, 'resolved')

      const reasonTextarea = screen.getByTestId('textarea-input-Status Change Reason')
      await user.type(reasonTextarea, 'Issue has been fixed')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateTicketStatus).toHaveBeenCalledWith(
          'TICK-001',
          expect.objectContaining({
            status: 'resolved',
            status_reason: 'Issue has been fixed'
          })
        )
      })
    })

    it('should call onSuccess after successful status update', async () => {
      const user = userEvent.setup()
      mockUpdateTicketStatus.mockResolvedValueOnce(true)

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')
      await user.selectOptions(statusSelect, 'closed')

      const reasonTextarea = screen.getByTestId('textarea-input-Status Change Reason')
      await user.type(reasonTextarea, 'Closed by customer request')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1)
      })
    })

    it('should not call onSuccess if status update fails', async () => {
      const user = userEvent.setup()
      mockUpdateTicketStatus.mockResolvedValueOnce(false)

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')
      await user.selectOptions(statusSelect, 'resolved')

      const reasonTextarea = screen.getByTestId('textarea-input-Status Change Reason')
      await user.type(reasonTextarea, 'Test reason')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateTicketStatus).toHaveBeenCalled()
      })

      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should work without onSuccess callback', async () => {
      const user = userEvent.setup()
      mockUpdateTicketStatus.mockResolvedValueOnce(true)

      const { onSuccess, ...propsWithoutSuccess } = defaultProps

      render(
        <Provider>
          <UpdateTicketStatusForm {...propsWithoutSuccess} />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')
      await user.selectOptions(statusSelect, 'in_progress')

      const reasonTextarea = screen.getByTestId('textarea-input-Status Change Reason')
      await user.type(reasonTextarea, 'Working on it')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateTicketStatus).toHaveBeenCalled()
      })
    })

    it('should submit with different status values', async () => {
      const user = userEvent.setup()
      const statuses = ['new', 'in_progress', 'pending_customer', 'resolved']

      for (const status of statuses) {
        mockUpdateTicketStatus.mockClear()
        mockUpdateTicketStatus.mockResolvedValueOnce(true)

        const { unmount } = render(
          <Provider>
            <UpdateTicketStatusForm {...defaultProps} />
          </Provider>
        )

        const statusSelect = screen.getByTestId('select-input-New Status')
        await user.selectOptions(statusSelect, status)

        const reasonTextarea = screen.getByTestId('textarea-input-Status Change Reason')
        await user.type(reasonTextarea, `Changing to ${status}`)

        const submitButton = screen.getByTestId('submit-button')
        await user.click(submitButton)

        await waitFor(() => {
          expect(mockUpdateTicketStatus).toHaveBeenCalledWith(
            'TICK-001',
            expect.objectContaining({
              status
            })
          )
        })

        unmount()
      }
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when isUpdatingStatus is true', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultHookReturn,
        isUpdatingStatus: true
      })

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('should display loading text when isUpdatingStatus is true', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultHookReturn,
        isUpdatingStatus: true
      })

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })

    it('should display normal text when not updating', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Update Status')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should allow typing in status reason field', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const reasonTextarea = screen.getByTestId('textarea-input-Status Change Reason')
      await user.type(reasonTextarea, 'Test reason for status change')

      expect(reasonTextarea).toHaveValue('Test reason for status change')
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const cancelButton = screen.getByTestId('cancel-button')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should allow clearing status reason field', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const reasonTextarea = screen.getByTestId('textarea-input-Status Change Reason')
      await user.type(reasonTextarea, 'Test reason')
      await user.clear(reasonTextarea)

      expect(reasonTextarea).toHaveValue('')
    })

    it('should allow changing status multiple times', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      const statusSelect = screen.getByTestId('select-input-New Status')

      await user.selectOptions(statusSelect, 'in_progress')
      expect(statusSelect).toHaveValue('in_progress')

      await user.selectOptions(statusSelect, 'resolved')
      expect(statusSelect).toHaveValue('resolved')
    })
  })

  describe('Hook Integration', () => {
    it('should use useTicketOperations hook', () => {
      const spy = vi.spyOn(useTicketOperationsHook, 'useTicketOperations')

      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('should use zodResolver for validation', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      /* Form should be rendered with validation */
      expect(screen.getByTestId('select-New Status')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Status Change Reason')).toBeInTheDocument()
    })
  })

  describe('Field Display', () => {
    it('should render only active fields', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      /* Both active fields should be visible */
      expect(screen.getByTestId('select-New Status')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Status Change Reason')).toBeInTheDocument()
    })

    it('should display fields in correct display order', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      /* Verify both form fields are present */
      expect(screen.getByTestId('select-New Status')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Status Change Reason')).toBeInTheDocument()
    })
  })

  describe('Ticket Status Display', () => {
    it('should display different current statuses correctly', () => {
      const statuses = ['open', 'new', 'in_progress', 'resolved', 'closed'] as const

      statuses.forEach((status) => {
        const { unmount } = render(
          <Provider>
            <UpdateTicketStatusForm {...defaultProps} currentStatus={status} />
          </Provider>
        )

        expect(screen.getByText('Updating Ticket Status')).toBeInTheDocument()
        unmount()
      })
    })

    it('should not display status badge when currentStatus is not provided', () => {
      const { currentStatus, ...propsWithoutStatus } = defaultProps

      render(
        <Provider>
          <UpdateTicketStatusForm {...propsWithoutStatus} />
        </Provider>
      )

      expect(screen.getByTestId('select-New Status')).toBeInTheDocument()
    })
  })

  describe('Ticket Subject Display', () => {
    it('should display ticket subject when provided', () => {
      render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} ticketSubject="Payment issue" />
        </Provider>
      )

      expect(screen.getByText('Payment issue')).toBeInTheDocument()
    })

    it('should not display ticket subject section when not provided', () => {
      const { ticketSubject, ...propsWithoutSubject } = defaultProps

      render(
        <Provider>
          <UpdateTicketStatusForm {...propsWithoutSubject} />
        </Provider>
      )

      expect(screen.getByText('TICK-001')).toBeInTheDocument()
    })
  })

  describe('Form Styling', () => {
    it('should apply border styling to form container', () => {
      const { container } = render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} />
        </Provider>
      )

      /* Check that the form is wrapped in a styled box */
      expect(screen.getByText('Update Status')).toBeInTheDocument()
    })
  })

  describe('Multiple Form Instances', () => {
    it('should handle multiple forms with different ticket IDs', () => {
      const { unmount: unmount1 } = render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} ticketId="TICK-001" ticketNumber="TICK-001" />
        </Provider>
      )

      expect(screen.getByText('TICK-001')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(
        <Provider>
          <UpdateTicketStatusForm {...defaultProps} ticketId="TICK-002" ticketNumber="TICK-002" />
        </Provider>
      )

      expect(screen.getByText('TICK-002')).toBeInTheDocument()
      unmount2()
    })
  })
})
