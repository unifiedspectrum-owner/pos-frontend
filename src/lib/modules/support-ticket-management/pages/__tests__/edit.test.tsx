/* Comprehensive test suite for EditTicketPage */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import EditTicketPage from '@support-ticket-management/pages/edit'
import * as useTicketOperationsHook from '@support-ticket-management/hooks/use-ticket-operations'
import * as useSupportTicketsHook from '@support-ticket-management/hooks/use-support-tickets'
import * as useCommentOperationsHook from '@support-ticket-management/hooks/use-comment-operations'
import { UpdateTicketFormSchema } from '@support-ticket-management/schemas'
import { SupportTicketDetails } from '@support-ticket-management/types'

/* Tenant module imports */
import * as useTenantsHook from '@tenant-management/hooks/data-management/use-tenants'

/* Mock dependencies */
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn()
  }))
}))

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    ...actual,
    useForm: vi.fn()
  }
})

vi.mock('@support-ticket-management/forms', () => ({
  TicketFormLayout: ({ mode, methods, onSubmit, onCancel, isSubmitting }: any) => (
    <div data-testid="ticket-form-layout">
      <div data-testid="form-mode">{mode}</div>
      <form onSubmit={(e) => {
        e.preventDefault()
        const formData = methods.getValues()
        onSubmit(formData)
      }}>
        <button type="submit" disabled={isSubmitting}>Submit</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  )
}))

vi.mock('@shared/components', () => ({
  ErrorMessageContainer: ({ error }: { error: string }) => (
    <div data-testid="error-container">{error}</div>
  ),
  LoaderWrapper: ({ children, isLoading, loadingText }: { children: React.ReactNode; isLoading: boolean; loadingText?: string }) => (
    <div data-testid="loader-wrapper">
      {isLoading ? <div data-testid="loading">{loadingText}</div> : children}
    </div>
  )
}))

describe('EditTicketPage', () => {
  const mockFormMethods = {
    handleSubmit: vi.fn((callback) => (e: any) => {
      e?.preventDefault()
      callback(mockFormData)
    }),
    reset: vi.fn(),
    getValues: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn(),
    formState: { errors: {}, isSubmitting: false }
  }

  const mockFormData: UpdateTicketFormSchema = {
    tenant_id: 'tenant-1',
    category_id: '1',
    subject: 'Updated Ticket Subject',
    resolution_due: '2024-01-10T00:00:00Z',
    internal_notes: 'Updated notes',
    requester_name: 'John Doe',
    requester_email: 'john@example.com',
    requester_phone: '+1234567890'
  }

  const mockTicketDetails: SupportTicketDetails = {
    id: 1,
    ticket_id: 'TICK-001',
    tenant_id: 'tenant-1',
    requester_user_id: 123,
    requester_email: 'john@example.com',
    requester_name: 'John Doe',
    requester_phone: '+1234567890',
    category_id: 1,
    subject: 'Login Issue',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    resolution_due: '2024-01-05T00:00:00Z',
    first_response_at: '2024-01-02T00:00:00Z',
    resolved_at: null,
    closed_at: null,
    escalated_at: null,
    escalated_by: null,
    escalation_reason: null,
    satisfaction_rating: null,
    satisfaction_feedback: null,
    satisfaction_submitted_at: null,
    internal_notes: 'Original notes',
    is_active: true,
    updated_at: '2024-01-01T00:00:00Z',
    is_overdue: false,
    category_details: null,
    assignment_details: null
  }

  const mockComments = [
    {
      id: 1,
      ticket_id: 1,
      communication_type: 'agent_response' as const,
      sender_user_id: 456,
      sender_name: 'Jane Agent',
      sender_email: 'jane.agent@example.com',
      sender_type: 'agent' as const,
      message_content: 'Working on this issue',
      message_format: 'text' as const,
      is_internal: false,
      is_auto_generated: false,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      attachments: []
    }
  ]

  const defaultTicketOperationsReturn = {
    fetchTicketDetails: vi.fn(),
    createTicket: vi.fn(),
    updateSupportTicket: vi.fn(),
    deleteTicket: vi.fn(),
    updateTicketStatus: vi.fn(),
    ticketDetails: mockTicketDetails,
    isFetching: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isUpdatingStatus: false,
    fetchError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    updateStatusError: null
  }

  const defaultSupportTicketsReturn = {
    tickets: [],
    categories: [
      { id: 1, name: 'Technical', description: 'Technical issues', display_order: 1, is_active: true },
      { id: 2, name: 'Billing', description: 'Billing issues', display_order: 2, is_active: true }
    ],
    categorySelectOptions: [
      { label: 'Technical', value: '1' },
      { label: 'Billing', value: '2' }
    ],
    loading: false,
    categoriesLoading: false,
    error: null,
    categoriesError: null,
    lastUpdated: '2024-01-01T00:00:00Z',
    pagination: undefined,
    fetchTickets: vi.fn(),
    fetchCategories: vi.fn(),
    refetch: vi.fn()
  }

  const defaultTenantsReturn = {
    tenants: [],
    tenantSelectOptions: [
      { label: 'Tenant A', value: 'tenant-1' },
      { label: 'Tenant B', value: 'tenant-2' }
    ],
    baseDetailsTenants: [
      { id: 1, tenant_id: 'tenant-1', organization_name: 'Tenant A', primary_email: 'tenanta@example.com', primary_phone: '+1234567890' },
      { id: 2, tenant_id: 'tenant-2', organization_name: 'Tenant B', primary_email: 'tenantb@example.com', primary_phone: '+9876543210' }
    ],
    loading: false,
    baseDetailsLoading: false,
    error: null,
    baseDetailsError: null,
    lastUpdated: '2024-01-01T00:00:00Z',
    pagination: undefined,
    fetchTenants: vi.fn(),
    fetchTenantsWithBaseDetails: vi.fn(),
    refetch: vi.fn()
  }

  const defaultCommentOperationsReturn = {
    fetchTicketComments: vi.fn(),
    refetchTicketComments: vi.fn(),
    addTicketComment: vi.fn(),
    downloadTicketCommentAttachment: vi.fn(),
    ticketComments: mockComments,
    isFetchingComments: false,
    isAddingComment: false,
    isDownloadingAttachment: false,
    fetchCommentsError: null,
    addCommentError: null,
    downloadAttachmentError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFormMethods.getValues.mockReturnValue(mockFormData)
    ;(useForm as Mock).mockReturnValue(mockFormMethods)
    vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue(defaultTicketOperationsReturn)
    vi.spyOn(useSupportTicketsHook, 'useSupportTickets').mockReturnValue(defaultSupportTicketsReturn)
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue(defaultTenantsReturn)
    vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue(defaultCommentOperationsReturn)
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render the edit ticket form layout', async () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      expect(screen.getByTestId('form-mode')).toHaveTextContent('EDIT')
    })

    it('should render submit and cancel buttons', async () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })
    })

    it('should initialize form with default values', () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: expect.objectContaining({
            tenant_id: '',
            category_id: '',
            subject: '',
            resolution_due: undefined,
            internal_notes: '',
            requester_name: '',
            requester_email: '',
            requester_phone: ''
          })
        })
      )
    })

    it('should use zodResolver for form validation', () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          resolver: expect.any(Function)
        })
      )
    })
  })

  describe('Data Fetching', () => {
    it('should fetch ticket details on mount', () => {
      const mockFetchTicketDetails = vi.fn()
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        fetchTicketDetails: mockFetchTicketDetails
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(mockFetchTicketDetails).toHaveBeenCalledWith('TICK-001')
    })

    it('should fetch ticket comments on mount', () => {
      const mockFetchTicketComments = vi.fn()
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultCommentOperationsReturn,
        fetchTicketComments: mockFetchTicketComments
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(mockFetchTicketComments).toHaveBeenCalledWith('TICK-001')
    })

    it('should populate form when ticket details are loaded', async () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(mockFormMethods.reset).toHaveBeenCalledWith(
          expect.objectContaining({
            tenant_id: 'tenant-1',
            category_id: '1',
            subject: 'Login Issue',
            internal_notes: 'Original notes'
          })
        )
      })
    })

    it('should log fetched comments', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('[EditTicketPage] Fetched ticket comments:', mockComments)
      })

      consoleLogSpy.mockRestore()
    })
  })

  describe('Loading States', () => {
    it('should show loader when ticket details are loading', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        isFetching: true
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.getByText('Loading ticket details...')).toBeInTheDocument()
    })

    it('should show loader when categories are loading', () => {
      vi.spyOn(useSupportTicketsHook, 'useSupportTickets').mockReturnValue({
        ...defaultSupportTicketsReturn,
        categoriesLoading: true
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should show loader when comments are loading', () => {
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultCommentOperationsReturn,
        isFetchingComments: true
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should show loader when tenants are loading', () => {
      vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
        ...defaultTenantsReturn,
        baseDetailsLoading: true
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should show form when all data is loaded', async () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error when ticket fetch fails', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        fetchError: 'Failed to load ticket'
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to load ticket')).toBeInTheDocument()
    })

    it('should show error when categories fail to load', () => {
      vi.spyOn(useSupportTicketsHook, 'useSupportTickets').mockReturnValue({
        ...defaultSupportTicketsReturn,
        categoriesError: 'Failed to load categories'
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to load categories')).toBeInTheDocument()
    })

    it('should show error when comments fail to load', () => {
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultCommentOperationsReturn,
        fetchCommentsError: 'Failed to load comments'
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to load comments')).toBeInTheDocument()
    })

    it('should show error when tenants fail to load', () => {
      vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
        ...defaultTenantsReturn,
        baseDetailsError: 'Failed to load tenants'
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to load tenants')).toBeInTheDocument()
    })

    it('should show error when ticket details are not found', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        ticketDetails: null,
        isFetching: false
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Ticket not found')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call updateSupportTicket on form submit', async () => {
      const mockUpdateSupportTicket = vi.fn().mockResolvedValue(true)
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        updateSupportTicket: mockUpdateSupportTicket
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateSupportTicket).toHaveBeenCalledWith('TICK-001', mockFormData)
      })
    })

    it('should navigate to home page on successful update', async () => {
      const mockUpdateSupportTicket = vi.fn().mockResolvedValue(true)
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        updateSupportTicket: mockUpdateSupportTicket
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/support-ticket-management')
      })
    })

    it('should not navigate when update fails', async () => {
      const mockUpdateSupportTicket = vi.fn().mockResolvedValue(false)
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        updateSupportTicket: mockUpdateSupportTicket
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateSupportTicket).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should handle update errors gracefully', async () => {
      const mockError = new Error('Update failed')
      const mockUpdateSupportTicket = vi.fn().mockRejectedValue(mockError)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        updateSupportTicket: mockUpdateSupportTicket
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('[EditTicketPage] Error updating ticket:', mockError)
      })

      expect(mockPush).not.toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('should disable submit button when isUpdating is true', async () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        isUpdating: true
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      const submitButton = screen.getByText('Submit')
      expect(submitButton).toBeDisabled()
    })

    it('should log form data and ticket ID before submission', async () => {
      const mockUpdateSupportTicket = vi.fn().mockResolvedValue(true)
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        updateSupportTicket: mockUpdateSupportTicket
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('[EditTicketPage] Form data for update:', mockFormData)
        expect(consoleLogSpy).toHaveBeenCalledWith('[EditTicketPage] Ticket ID:', 'TICK-001')
      })

      consoleLogSpy.mockRestore()
    })
  })

  describe('Cancel Action', () => {
    it('should navigate to home page when cancel is clicked', async () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/support-ticket-management')
    })

    it('should not call updateSupportTicket when cancel is clicked', async () => {
      const mockUpdateSupportTicket = vi.fn()
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        updateSupportTicket: mockUpdateSupportTicket
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockUpdateSupportTicket).not.toHaveBeenCalled()
    })
  })

  describe('Props Passed to TicketFormLayout', () => {
    it('should pass correct mode prop', async () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('form-mode')).toHaveTextContent('EDIT')
      })
    })

    it('should pass ticket comments', async () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        /* Verify form is rendered with ticket data loaded */
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })
    })

    it('should pass ticket ID', async () => {
      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      await waitFor(() => {
        /* Verify form is rendered for the correct ticket */
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })
    })
  })

  describe('Hook Integration', () => {
    it('should call useSupportTickets with autoFetchCategories', () => {
      const spy = vi.spyOn(useSupportTicketsHook, 'useSupportTickets')

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(spy).toHaveBeenCalledWith({ autoFetchCategories: true })
    })

    it('should call useTenants with autoFetchBaseDetails', () => {
      const spy = vi.spyOn(useTenantsHook, 'useTenants')

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(spy).toHaveBeenCalledWith({ autoFetchBaseDetails: true })
    })

    it('should use useTicketOperations hook', () => {
      const spy = vi.spyOn(useTicketOperationsHook, 'useTicketOperations')

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(spy).toHaveBeenCalled()
    })

    it('should use useCommentOperations hook', () => {
      const spy = vi.spyOn(useCommentOperationsHook, 'useCommentOperations')

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('should complete full edit workflow successfully', async () => {
      const mockUpdateSupportTicket = vi.fn().mockResolvedValue(true)
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        updateSupportTicket: mockUpdateSupportTicket
      })

      render(<EditTicketPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      /* Wait for data to load */
      await waitFor(() => {
        expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      })

      /* Submit form */
      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      /* Verify API call */
      await waitFor(() => {
        expect(mockUpdateSupportTicket).toHaveBeenCalled()
      })

      /* Verify navigation */
      expect(mockPush).toHaveBeenCalledWith('/admin/support-ticket-management')
    })
  })
})
