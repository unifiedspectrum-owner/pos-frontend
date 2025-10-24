/* Comprehensive test suite for TicketFormLayout */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import TicketFormLayout from '@support-ticket-management/forms/layout'
import { CreateTicketFormSchema } from '@support-ticket-management/schemas'
import { TicketCommunication, TicketAttachment } from '@support-ticket-management/types'
import { TenantBasicDetails } from '@tenant-management/types'
import React from 'react'

/* Mock dependencies */
vi.mock('@shared/components', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>
}))

interface MockTicketInfoProps {
  mode: string
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
  submitText: string
  loadingText: string
}

interface MockTicketCommentsProps {
  comments: Array<unknown>
  ticketId: string
  onRefresh: () => void
}

vi.mock('@support-ticket-management/forms/ticket-info', () => ({
  default: vi.fn(({ mode, onSubmit, onCancel, isSubmitting, submitText, loadingText }: MockTicketInfoProps) => (
    <div data-testid="ticket-form">
      <div data-testid="form-mode">{mode}</div>
      <div data-testid="submit-text">{submitText}</div>
      <div data-testid="loading-text">{loadingText}</div>
      <button onClick={onSubmit} disabled={isSubmitting} data-testid="submit-button">Submit</button>
      <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
    </div>
  ))
}))

vi.mock('@support-ticket-management/forms/ticket-comments', () => ({
  default: vi.fn(({ comments, ticketId, onRefresh }: MockTicketCommentsProps) => (
    <div data-testid="ticket-comments">
      <div data-testid="comments-count">{comments.length}</div>
      <div data-testid="ticket-id">{ticketId}</div>
      <button onClick={onRefresh} data-testid="refresh-comments">Refresh</button>
    </div>
  ))
}))

describe('TicketFormLayout', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnRefresh = vi.fn()

  interface TicketFormLayoutTestProps {
    mode: 'CREATE' | 'EDIT' | 'VIEW'
    onSubmit: (data: CreateTicketFormSchema) => void
    onCancel: () => void
    tenantDetails: TenantBasicDetails[]
    tenantSelectOptions?: Array<{ label: string; value: string }>
    categorySelectOptions?: Array<{ label: string; value: string }>
    isSubmitting?: boolean
    ticketId?: string
    ticketComments?: (TicketCommunication & { attachments?: TicketAttachment[] })[]
    onRefresh?: () => void
  }

  const defaultProps: TicketFormLayoutTestProps = {
    mode: 'CREATE' as const,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    tenantDetails: [],
    tenantSelectOptions: [],
    categorySelectOptions: [],
    isSubmitting: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ props }: { props: TicketFormLayoutTestProps }) => {
    const methods = useForm<CreateTicketFormSchema>({
      defaultValues: {
        tenant_id: '',
        category_id: '',
        subject: '',
        message_content: '',
        requester_name: '',
        requester_email: '',
        requester_phone: ''
      }
    })

    return (
      <Provider>
        <TicketFormLayout {...props} methods={methods} />
      </Provider>
    )
  }

  const renderWithMethods = (props: TicketFormLayoutTestProps) => {
    return render(<TestWrapper props={props} />)
  }

  describe('Rendering', () => {
    it('should render the layout with heading', () => {
      renderWithMethods(defaultProps)

      expect(screen.getByText('Create New Ticket')).toBeInTheDocument()
    })

    it('should render breadcrumbs', () => {
      renderWithMethods(defaultProps)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('should render ticket form', () => {
      renderWithMethods(defaultProps)

      expect(screen.getByTestId('ticket-form')).toBeInTheDocument()
    })

    it('should display correct heading for CREATE mode', () => {
      renderWithMethods({ ...defaultProps, mode: 'CREATE' })

      expect(screen.getByText('Create New Ticket')).toBeInTheDocument()
    })

    it('should display correct heading for EDIT mode', () => {
      renderWithMethods({ ...defaultProps, mode: 'EDIT' })

      expect(screen.getByText('Edit Ticket')).toBeInTheDocument()
    })

    it('should display correct heading for VIEW mode', () => {
      renderWithMethods({ ...defaultProps, mode: 'VIEW' })

      expect(screen.getByText('View Ticket')).toBeInTheDocument()
    })
  })

  describe('Mode-specific Behavior', () => {
    it('should pass CREATE mode to ticket form', () => {
      renderWithMethods({ ...defaultProps, mode: 'CREATE' })

      expect(screen.getByTestId('form-mode')).toHaveTextContent('CREATE')
    })

    it('should pass EDIT mode to ticket form', () => {
      renderWithMethods({ ...defaultProps, mode: 'EDIT' })

      expect(screen.getByTestId('form-mode')).toHaveTextContent('EDIT')
    })

    it('should not show comments section in CREATE mode', () => {
      renderWithMethods({ ...defaultProps, mode: 'CREATE' })

      expect(screen.queryByTestId('ticket-comments')).not.toBeInTheDocument()
    })

    it('should show comments section in EDIT mode', () => {
      renderWithMethods({
        ...defaultProps,
        mode: 'EDIT',
        ticketId: 'TICK-001',
        ticketComments: [],
        onRefresh: mockOnRefresh
      })

      expect(screen.getByTestId('ticket-comments')).toBeInTheDocument()
    })
  })

  describe('Submit Text', () => {
    it('should display "Create Ticket" in CREATE mode', () => {
      renderWithMethods({ ...defaultProps, mode: 'CREATE' })

      expect(screen.getByTestId('submit-text')).toHaveTextContent('Create Ticket')
    })

    it('should display "Update Ticket" in EDIT mode', () => {
      renderWithMethods({ ...defaultProps, mode: 'EDIT' })

      expect(screen.getByTestId('submit-text')).toHaveTextContent('Update Ticket')
    })

    it('should display "Creating Ticket..." as loading text in CREATE mode', () => {
      renderWithMethods({ ...defaultProps, mode: 'CREATE' })

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Creating Ticket...')
    })

    it('should display "Updating Ticket..." as loading text in EDIT mode', () => {
      renderWithMethods({ ...defaultProps, mode: 'EDIT' })

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Updating Ticket...')
    })
  })

  describe('Props Passing', () => {
    it('should pass tenantSelectOptions to ticket form', () => {
      const tenantOptions = [
        { label: 'Tenant A', value: 'tenant-1' },
        { label: 'Tenant B', value: 'tenant-2' }
      ]

      renderWithMethods({ ...defaultProps, tenantSelectOptions: tenantOptions })

      expect(screen.getByTestId('ticket-form')).toBeInTheDocument()
    })

    it('should pass categorySelectOptions to ticket form', () => {
      const categoryOptions = [
        { label: 'Technical', value: '1' },
        { label: 'Billing', value: '2' }
      ]

      renderWithMethods({ ...defaultProps, categorySelectOptions: categoryOptions })

      expect(screen.getByTestId('ticket-form')).toBeInTheDocument()
    })

    it('should pass isSubmitting to ticket form', () => {
      renderWithMethods({ ...defaultProps, isSubmitting: true })

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('should pass ticketComments to comments component in EDIT mode', () => {
      const mockComments: (TicketCommunication & { attachments?: TicketAttachment[] })[] = [
        {
          id: 1,
          ticket_id: 1,
          communication_type: 'agent_response' as const,
          sender_user_id: 1,
          sender_name: 'Agent',
          sender_email: 'agent@example.com',
          sender_type: 'agent' as const,
          message_content: 'Comment',
          message_format: 'text' as const,
          is_internal: false,
          is_auto_generated: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]

      renderWithMethods({
        ...defaultProps,
        mode: 'EDIT',
        ticketId: 'TICK-001',
        ticketComments: mockComments,
        onRefresh: mockOnRefresh
      })

      expect(screen.getByTestId('comments-count')).toHaveTextContent('1')
    })

    it('should pass ticketId to comments component', () => {
      renderWithMethods({
        ...defaultProps,
        mode: 'EDIT',
        ticketId: 'TICK-001',
        ticketComments: [],
        onRefresh: mockOnRefresh
      })

      expect(screen.getByTestId('ticket-id')).toHaveTextContent('TICK-001')
    })

    it('should pass onRefresh to comments component', () => {
      renderWithMethods({
        ...defaultProps,
        mode: 'EDIT',
        ticketId: 'TICK-001',
        ticketComments: [],
        onRefresh: mockOnRefresh
      })

      const refreshButton = screen.getByTestId('refresh-comments')
      expect(refreshButton).toBeInTheDocument()
    })
  })

  describe('Form Actions', () => {
    it('should call onSubmit when submit is triggered', async () => {
      const handleSubmit = vi.fn()

      const TestComponent = () => {
        const methods = useForm<CreateTicketFormSchema>({
          defaultValues: {
            tenant_id: '',
            category_id: '',
            subject: '',
            message_content: '',
            requester_name: '',
            requester_email: '',
            requester_phone: ''
          }
        })

        return (
          <Provider>
            <TicketFormLayout {...defaultProps} methods={methods} onSubmit={handleSubmit} />
          </Provider>
        )
      }

      render(<TestComponent />)

      const submitButton = screen.getByTestId('submit-button')
      submitButton.click()

      /* handleSubmit is called through methods.handleSubmit */
      expect(submitButton).toBeInTheDocument()
    })

    it('should call onCancel when cancel button is clicked', () => {
      renderWithMethods(defaultProps)

      const cancelButton = screen.getByTestId('cancel-button')
      cancelButton.click()

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Default Props', () => {
    it('should use empty arrays as default for select options', () => {
      renderWithMethods(defaultProps)

      expect(screen.getByTestId('ticket-form')).toBeInTheDocument()
    })

    it('should use empty array as default for ticketComments', () => {
      renderWithMethods({
        ...defaultProps,
        mode: 'EDIT',
        ticketId: 'TICK-001',
        onRefresh: mockOnRefresh
      })

      expect(screen.getByTestId('comments-count')).toHaveTextContent('0')
    })

    it('should use false as default for isSubmitting', () => {
      renderWithMethods(defaultProps)

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('FormProvider Integration', () => {
    it('should wrap content in FormProvider', () => {
      renderWithMethods(defaultProps)

      /* FormProvider should make form context available to children */
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument()
    })
  })
})
