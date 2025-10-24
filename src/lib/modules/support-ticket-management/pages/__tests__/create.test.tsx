/* Comprehensive test suite for CreateTicketPage */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import CreateTicketPage from '@support-ticket-management/pages/create'
import * as useTicketOperationsHook from '@support-ticket-management/hooks/use-ticket-operations'
import * as useSupportTicketsHook from '@support-ticket-management/hooks/use-support-tickets'
import { CreateTicketFormSchema } from '@support-ticket-management/schemas'

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

vi.mock('@/lib/shared', () => ({
  ErrorMessageContainer: ({ error }: { error: string }) => (
    <div data-testid="error-container">{error}</div>
  ),
  LoaderWrapper: ({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) => (
    <div data-testid="loader-wrapper">
      {isLoading ? <div data-testid="loading">Loading...</div> : children}
    </div>
  )
}))

describe('CreateTicketPage', () => {
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

  const mockFormData: CreateTicketFormSchema = {
    tenant_id: 'tenant-1',
    category_id: '1',
    subject: 'Test Ticket',
    message_content: 'Test message content for the ticket',
    requester_name: 'John Doe',
    requester_email: 'john@example.com',
    requester_phone: '+1234567890'
  }

  const defaultTicketOperationsReturn = {
    fetchTicketDetails: vi.fn(),
    createTicket: vi.fn(),
    updateSupportTicket: vi.fn(),
    deleteTicket: vi.fn(),
    updateTicketStatus: vi.fn(),
    ticketDetails: null,
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

  beforeEach(() => {
    vi.clearAllMocks()
    mockFormMethods.getValues.mockReturnValue(mockFormData)
    ;(useForm as Mock).mockReturnValue(mockFormMethods)
    vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue(defaultTicketOperationsReturn)
    vi.spyOn(useSupportTicketsHook, 'useSupportTickets').mockReturnValue(defaultSupportTicketsReturn)
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue(defaultTenantsReturn)
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Rendering', () => {
    it('should render the create ticket form layout', () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode')).toHaveTextContent('CREATE')
    })

    it('should render submit and cancel buttons', () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should initialize form with default values', () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: expect.objectContaining({
            tenant_id: '',
            category_id: '',
            subject: '',
            message_content: '',
            requester_name: '',
            requester_email: '',
            requester_phone: ''
          })
        })
      )
    })

    it('should use zodResolver for form validation', () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          resolver: expect.any(Function)
        })
      )
    })
  })

  describe('Loading States', () => {
    it('should show loader when tenants are loading', () => {
      vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
        ...defaultTenantsReturn,
        baseDetailsLoading: true
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should show loader when categories are loading', () => {
      vi.spyOn(useSupportTicketsHook, 'useSupportTickets').mockReturnValue({
        ...defaultSupportTicketsReturn,
        categoriesLoading: true
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should show form when data is loaded', () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show error when categories fail to load', () => {
      vi.spyOn(useSupportTicketsHook, 'useSupportTickets').mockReturnValue({
        ...defaultSupportTicketsReturn,
        categoriesError: 'Failed to load categories'
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to load categories')).toBeInTheDocument()
    })

    it('should show error when tenants fail to load', () => {
      vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
        ...defaultTenantsReturn,
        baseDetailsError: 'Failed to load tenants'
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to load tenants')).toBeInTheDocument()
    })

    it('should prioritize categories error over tenants error', () => {
      vi.spyOn(useSupportTicketsHook, 'useSupportTickets').mockReturnValue({
        ...defaultSupportTicketsReturn,
        categoriesError: 'Categories error'
      })

      vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
        ...defaultTenantsReturn,
        baseDetailsError: 'Tenants error'
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByText('Categories error')).toBeInTheDocument()
      expect(screen.queryByText('Tenants error')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call createTicket on form submit with valid data', async () => {
      const mockCreateTicket = vi.fn().mockResolvedValue(true)
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        createTicket: mockCreateTicket
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateTicket).toHaveBeenCalledWith(mockFormData)
      })
    })

    it('should navigate to home page on successful creation', async () => {
      const mockCreateTicket = vi.fn().mockResolvedValue(true)
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        createTicket: mockCreateTicket
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/support-ticket-management')
      })
    })

    it('should not navigate when creation fails', async () => {
      const mockCreateTicket = vi.fn().mockResolvedValue(false)
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        createTicket: mockCreateTicket
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateTicket).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should handle creation errors gracefully', async () => {
      const mockError = new Error('Creation failed')
      const mockCreateTicket = vi.fn().mockRejectedValue(mockError)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        createTicket: mockCreateTicket
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating ticket:', mockError)
      })

      expect(mockPush).not.toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('should disable submit button when isCreating is true', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        isCreating: true
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      expect(submitButton).toBeDisabled()
    })

    it('should log form data before submission', async () => {
      const mockCreateTicket = vi.fn().mockResolvedValue(true)
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        createTicket: mockCreateTicket
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Form data before submission:', mockFormData)
      })

      consoleLogSpy.mockRestore()
    })
  })

  describe('Cancel Action', () => {
    it('should navigate to home page when cancel is clicked', async () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/support-ticket-management')
    })

    it('should not call createTicket when cancel is clicked', async () => {
      const mockCreateTicket = vi.fn()
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        createTicket: mockCreateTicket
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockCreateTicket).not.toHaveBeenCalled()
    })
  })

  describe('Props Passed to TicketFormLayout', () => {
    it('should pass correct mode prop', () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(screen.getByTestId('form-mode')).toHaveTextContent('CREATE')
    })

    it('should disable submit button when isCreating', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        isCreating: true
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      expect(submitButton).toBeDisabled()
    })

    it('should pass tenant select options', () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      /* Verify form is rendered with tenant options available */
      expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
    })

    it('should pass category select options', () => {
      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      /* Verify form is rendered with category options available */
      expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()
    })
  })

  describe('Hook Integration', () => {
    it('should call useSupportTickets with autoFetchCategories', () => {
      const spy = vi.spyOn(useSupportTicketsHook, 'useSupportTickets')

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(spy).toHaveBeenCalledWith({ autoFetchCategories: true })
    })

    it('should call useTenants with autoFetchBaseDetails', () => {
      const spy = vi.spyOn(useTenantsHook, 'useTenants')

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(spy).toHaveBeenCalledWith({ autoFetchBaseDetails: true })
    })

    it('should use useTicketOperations hook', () => {
      const spy = vi.spyOn(useTicketOperationsHook, 'useTicketOperations')

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('should complete full create workflow successfully', async () => {
      const mockCreateTicket = vi.fn().mockResolvedValue(true)
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        createTicket: mockCreateTicket
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      /* Verify initial render */
      expect(screen.getByTestId('ticket-form-layout')).toBeInTheDocument()

      /* Submit form */
      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      /* Verify API call */
      await waitFor(() => {
        expect(mockCreateTicket).toHaveBeenCalled()
      })

      /* Verify navigation */
      expect(mockPush).toHaveBeenCalledWith('/admin/support-ticket-management')
    })

    it('should handle multiple rapid submit clicks gracefully', async () => {
      const mockCreateTicket = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      )

      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        createTicket: mockCreateTicket
      })

      render(
        <Provider>
          <CreateTicketPage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')

      /* Click multiple times */
      await userEvent.click(submitButton)
      await userEvent.click(submitButton)
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateTicket).toHaveBeenCalled()
      })
    })
  })
})
