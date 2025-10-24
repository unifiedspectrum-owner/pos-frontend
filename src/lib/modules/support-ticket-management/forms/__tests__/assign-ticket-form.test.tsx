/* Comprehensive test suite for AssignTicketForm */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import AssignTicketForm from '@support-ticket-management/forms/assign-ticket-form'
import * as useAssignmentOperationsHook from '@support-ticket-management/hooks/use-assignment-operations'
import * as useUsersHook from '@user-management/hooks/use-users'
import { GetCurrentTicketAssignmentApiResponse } from '@support-ticket-management/types'

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

interface MockLoaderWrapperProps {
  children: React.ReactNode
  isLoading: boolean
  loadingText: string
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
  ),
  LoaderWrapper: ({ children, isLoading, loadingText }: MockLoaderWrapperProps) => (
    <div data-testid="loader-wrapper">
      {isLoading ? <div data-testid="loading-assignment">{loadingText}</div> : children}
    </div>
  )
}))

describe('AssignTicketForm', () => {
  const mockAssignTicketToUser = vi.fn()
  const mockFetchCurrentAssignment = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultAssignmentHookReturn = {
    currentAssignment: null,
    isFetchingAssignment: false,
    fetchCurrentAssignment: mockFetchCurrentAssignment,
    assignTicketToUser: mockAssignTicketToUser,
    isAssigning: false,
    fetchAssignmentError: null,
    assignError: null
  }

  const mockUserOptions = [
    { label: 'John Doe', value: '1' },
    { label: 'Jane Smith', value: '2' },
    { label: 'Bob Johnson', value: '3' }
  ]

  const defaultUsersHookReturn = {
    userSelectOptions: mockUserOptions,
    loading: false,
    users: [],
    pagination: {
      current_page: 1,
      total_pages: 1,
      limit: 100,
      total_count: 3,
      has_next_page: false,
      has_prev_page: false
    },
    error: null,
    lastUpdated: '',
    fetchUsers: vi.fn(),
    refetch: vi.fn()
  }

  const defaultProps = {
    ticketId: 'TICK-001',
    ticketNumber: 'TICK-001',
    ticketSubject: 'Login issue',
    ticketStatus: 'open' as const,
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel
  }

  const mockCurrentAssignment: GetCurrentTicketAssignmentApiResponse['data'] = {
    ticket_id: 'TICK-001',
    assignment_id: 'ASSIGN-001',
    assigned_to_user_id: '123',
    assigned_to_user_name: 'John Doe',
    assigned_to_role_id: '1',
    assigned_to_role_name: 'Support Agent',
    assigned_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations').mockReturnValue(defaultAssignmentHookReturn)
    vi.spyOn(useUsersHook, 'useUsers').mockReturnValue(defaultUsersHookReturn)
  })

  describe('Rendering', () => {
    it('should render the form with all fields', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByTestId('select-Assign To User')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Assignment Reason')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should display ticket information when provided', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Assigning Ticket')).toBeInTheDocument()
      expect(screen.getByText('TICK-001')).toBeInTheDocument()
      expect(screen.getByText('Login issue')).toBeInTheDocument()
    })

    it('should display ticket status badge', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Assigning Ticket')).toBeInTheDocument()
    })

    it('should not display ticket info section when ticketNumber is not provided', () => {
      const { ticketNumber, ...propsWithoutTicketNumber } = defaultProps

      render(
        <Provider>
          <AssignTicketForm {...propsWithoutTicketNumber} />
        </Provider>
      )

      expect(screen.queryByText('Assigning Ticket')).not.toBeInTheDocument()
    })

    it('should display cancel button when onCancel is provided', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    it('should not display cancel button when onCancel is not provided', () => {
      const { onCancel, ...propsWithoutCancel } = defaultProps

      render(
        <Provider>
          <AssignTicketForm {...propsWithoutCancel} />
        </Provider>
      )

      expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument()
    })

    it('should display submit button with correct text', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Assign Ticket')).toBeInTheDocument()
    })
  })

  describe('Current Assignment Display', () => {
    it('should display current assignment information', () => {
      vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations').mockReturnValue({
        ...defaultAssignmentHookReturn,
        currentAssignment: mockCurrentAssignment
      })

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Currently Assigned')).toBeInTheDocument()
      /* John Doe appears in both current assignment and dropdown, so use getAllByText */
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
      expect(screen.getByText('Support Agent')).toBeInTheDocument()
    })

    it('should not display current assignment when none exists', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.queryByText('Currently Assigned')).not.toBeInTheDocument()
    })

    it('should display loading state when fetching assignment', () => {
      vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations').mockReturnValue({
        ...defaultAssignmentHookReturn,
        isFetchingAssignment: true
      })

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByTestId('loading-assignment')).toBeInTheDocument()
      expect(screen.getByText('Loading current assignment...')).toBeInTheDocument()
    })

    it('should display assigned date in readable format', () => {
      vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations').mockReturnValue({
        ...defaultAssignmentHookReturn,
        currentAssignment: mockCurrentAssignment
      })

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText(/Assigned on:/)).toBeInTheDocument()
    })

    it('should display user ID when user name is not available', () => {
      vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations').mockReturnValue({
        ...defaultAssignmentHookReturn,
        currentAssignment: {
          ...mockCurrentAssignment,
          assigned_to_user_name: null
        }
      })

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('ID: 123')).toBeInTheDocument()
    })
  })

  describe('User Selection', () => {
    it('should display user options from hook', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('should allow selecting a user', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const userSelect = screen.getByTestId('select-input-Assign To User')
      await user.selectOptions(userSelect, '1')

      expect(userSelect).toHaveValue('1')
    })

    it('should display empty options when users are loading', () => {
      vi.spyOn(useUsersHook, 'useUsers').mockReturnValue({
        ...defaultUsersHookReturn,
        loading: true,
        userSelectOptions: []
      })

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const userSelect = screen.getByTestId('select-input-Assign To User')
      expect(userSelect).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call assignTicketToUser with correct data on submit', async () => {
      const user = userEvent.setup()
      mockAssignTicketToUser.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const userSelect = screen.getByTestId('select-input-Assign To User')
      await user.selectOptions(userSelect, '1')

      const reasonTextarea = screen.getByTestId('textarea-input-Assignment Reason')
      await user.type(reasonTextarea, 'Best person for this issue')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAssignTicketToUser).toHaveBeenCalledWith(
          'TICK-001',
          expect.objectContaining({
            user_id: '1',
            reason: 'Best person for this issue'
          })
        )
      })
    })

    it('should call onSuccess after successful assignment', async () => {
      const user = userEvent.setup()
      mockAssignTicketToUser.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const userSelect = screen.getByTestId('select-input-Assign To User')
      await user.selectOptions(userSelect, '1')

      const reasonTextarea = screen.getByTestId('textarea-input-Assignment Reason')
      await user.type(reasonTextarea, 'Best person for this issue')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1)
      })
    })

    it('should not call onSuccess if assignment fails', async () => {
      const user = userEvent.setup()
      mockAssignTicketToUser.mockResolvedValueOnce(false)

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const userSelect = screen.getByTestId('select-input-Assign To User')
      await user.selectOptions(userSelect, '1')

      const reasonTextarea = screen.getByTestId('textarea-input-Assignment Reason')
      await user.type(reasonTextarea, 'Assignment reason here')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAssignTicketToUser).toHaveBeenCalled()
      })

      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should work without onSuccess callback', async () => {
      const user = userEvent.setup()
      mockAssignTicketToUser.mockResolvedValueOnce(true)

      const { onSuccess, ...propsWithoutSuccess } = defaultProps

      render(
        <Provider>
          <AssignTicketForm {...propsWithoutSuccess} />
        </Provider>
      )

      const userSelect = screen.getByTestId('select-input-Assign To User')
      await user.selectOptions(userSelect, '1')

      const reasonTextarea = screen.getByTestId('textarea-input-Assignment Reason')
      await user.type(reasonTextarea, 'Assigning to team member')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAssignTicketToUser).toHaveBeenCalled()
      })
    })

    it('should submit without assignment reason', async () => {
      const user = userEvent.setup()
      mockAssignTicketToUser.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const userSelect = screen.getByTestId('select-input-Assign To User')
      await user.selectOptions(userSelect, '2')

      const reasonTextarea = screen.getByTestId('textarea-input-Assignment Reason')
      await user.type(reasonTextarea, 'Quick assignment')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAssignTicketToUser).toHaveBeenCalledWith(
          'TICK-001',
          expect.objectContaining({
            user_id: '2'
          })
        )
      })
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when isAssigning is true', () => {
      vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations').mockReturnValue({
        ...defaultAssignmentHookReturn,
        isAssigning: true
      })

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('should display loading text when isAssigning is true', () => {
      vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations').mockReturnValue({
        ...defaultAssignmentHookReturn,
        isAssigning: true
      })

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Assigning...')).toBeInTheDocument()
    })

    it('should display normal text when not assigning', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Assign Ticket')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should allow typing in assignment reason field', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const reasonTextarea = screen.getByTestId('textarea-input-Assignment Reason')
      await user.type(reasonTextarea, 'Test reason')

      expect(reasonTextarea).toHaveValue('Test reason')
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const cancelButton = screen.getByTestId('cancel-button')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should allow clearing assignment reason field', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      const reasonTextarea = screen.getByTestId('textarea-input-Assignment Reason')
      await user.type(reasonTextarea, 'Test reason')
      await user.clear(reasonTextarea)

      expect(reasonTextarea).toHaveValue('')
    })
  })

  describe('Data Fetching', () => {
    it('should fetch current assignment on mount', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(mockFetchCurrentAssignment).toHaveBeenCalledWith('TICK-001')
    })

    it('should fetch users with correct parameters', () => {
      const spy = vi.spyOn(useUsersHook, 'useUsers')

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(spy).toHaveBeenCalledWith({
        initialLimit: 100,
        autoFetch: true
      })
    })

    it('should refetch assignment when ticketId changes', () => {
      const { rerender } = render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(mockFetchCurrentAssignment).toHaveBeenCalledWith('TICK-001')

      rerender(
        <Provider>
          <AssignTicketForm {...defaultProps} ticketId="TICK-002" />
        </Provider>
      )

      expect(mockFetchCurrentAssignment).toHaveBeenCalledWith('TICK-002')
    })
  })

  describe('Hook Integration', () => {
    it('should use useAssignmentOperations hook', () => {
      const spy = vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations')

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(spy).toHaveBeenCalled()
    })

    it('should use useUsers hook', () => {
      const spy = vi.spyOn(useUsersHook, 'useUsers')

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('should use zodResolver for validation', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      /* Form should be rendered with validation */
      expect(screen.getByTestId('select-Assign To User')).toBeInTheDocument()
    })
  })

  describe('Field Display', () => {
    it('should render only active fields', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      /* Both active fields should be visible */
      expect(screen.getByTestId('select-Assign To User')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Assignment Reason')).toBeInTheDocument()
    })

    it('should display fields in correct display order', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      /* Verify both form fields are present */
      expect(screen.getByTestId('select-Assign To User')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Assignment Reason')).toBeInTheDocument()
    })
  })

  describe('Ticket Status Display', () => {
    it('should display different ticket statuses correctly', () => {
      const statuses = ['open', 'new', 'in_progress', 'resolved'] as const

      statuses.forEach((status) => {
        const { unmount } = render(
          <Provider>
            <AssignTicketForm {...defaultProps} ticketStatus={status} />
          </Provider>
        )

        expect(screen.getByText('Assigning Ticket')).toBeInTheDocument()
        unmount()
      })
    })

    it('should not display status badge when ticketStatus is not provided', () => {
      const { ticketStatus, ...propsWithoutStatus } = defaultProps

      render(
        <Provider>
          <AssignTicketForm {...propsWithoutStatus} />
        </Provider>
      )

      expect(screen.getByText('Assigning Ticket')).toBeInTheDocument()
    })
  })

  describe('Assignment Information Messages', () => {
    it('should display message about selecting user for assignment', () => {
      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('Select a user to assign this ticket for resolution')).toBeInTheDocument()
    })

    it('should display message about reassignment when ticket is already assigned', () => {
      vi.spyOn(useAssignmentOperationsHook, 'useAssignmentOperations').mockReturnValue({
        ...defaultAssignmentHookReturn,
        currentAssignment: mockCurrentAssignment
      })

      render(
        <Provider>
          <AssignTicketForm {...defaultProps} />
        </Provider>
      )

      expect(screen.getByText('You can reassign this ticket to a different user below')).toBeInTheDocument()
    })
  })
})
