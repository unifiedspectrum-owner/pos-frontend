/* Comprehensive test suite for TicketDetailsPage */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import TicketDetailsPage from '@support-ticket-management/pages/view'
import * as useTicketOperationsHook from '@support-ticket-management/hooks/use-ticket-operations'
import * as useCommentOperationsHook from '@support-ticket-management/hooks/use-comment-operations'
import { SupportTicketDetails } from '@support-ticket-management/types'

/* Mock Chakra UI Tabs component */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  const React = await import('react')

  const TabsContext = React.createContext<{ value: string; onValueChange: (e: { value: string }) => void } | null>(null)

  return {
    ...actual,
    Tabs: {
      Root: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (e: { value: string }) => void }) => (
        <TabsContext.Provider value={{ value, onValueChange }}>
          <div data-testid="tabs-root" data-value={value}>
            {children}
          </div>
        </TabsContext.Provider>
      ),
      List: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
      Trigger: ({ children, value }: { children: React.ReactNode; value: string }) => {
        const context = React.useContext(TabsContext)
        return (
          <button
            data-testid={`tab-${value}`}
            onClick={() => context?.onValueChange({ value })}
          >
            {children}
          </button>
        )
      },
      ContentGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-content-group">{children}</div>,
      Content: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <div data-testid={`tab-content-${value}`}>{children}</div>
      )
    }
  }
})

/* Mock shared components */
vi.mock('@shared/components/common', () => ({
  ErrorMessageContainer: ({ error }: { error: string }) => (
    <div data-testid="error-container">{error}</div>
  ),
  LoaderWrapper: ({ children, isLoading, loadingText }: { children: React.ReactNode; isLoading: boolean; loadingText?: string }) => (
    <div data-testid="loader-wrapper">
      {isLoading ? <div data-testid="loading">{loadingText}</div> : children}
    </div>
  ),
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>
}))

/* Mock TicketComments component */
vi.mock('@support-ticket-management/forms/ticket-comments', () => ({
  default: ({ comments, ticketId, onRefresh, showAddCommentForm }: any) => (
    <div data-testid="ticket-comments">
      <div data-testid="comments-count">{comments.length} comments</div>
      <div data-testid="ticket-id">{ticketId}</div>
      <div data-testid="show-add-form">{showAddCommentForm ? 'true' : 'false'}</div>
      <button onClick={onRefresh} data-testid="refresh-comments">Refresh Comments</button>
    </div>
  )
}))

describe('TicketDetailsPage', () => {
  const mockFetchTicketDetails = vi.fn()
  const mockFetchTicketComments = vi.fn()
  const mockRefetchTicketComments = vi.fn()

  const mockTicketDetails: SupportTicketDetails = {
    id: 1,
    ticket_id: 'TICK-001',
    tenant_id: 'tenant-1',
    requester_user_id: 123,
    requester_email: 'requester@example.com',
    requester_name: 'John Requester',
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
    satisfaction_rating: 4,
    satisfaction_feedback: 'Good service',
    satisfaction_submitted_at: '2024-01-03T00:00:00Z',
    internal_notes: 'Needs urgent attention',
    is_active: true,
    updated_at: '2024-01-01T00:00:00Z',
    is_overdue: false,
    category_details: {
      id: 1,
      name: 'Technical',
      description: 'Technical issues',
      display_order: 1,
      is_active: true
    },
    assignment_details: {
      assigned_to_user_id: 456,
      assigned_to_user_name: 'Jane Agent',
      assigned_to_role_id: 2,
      assigned_to_role_name: 'Support Agent',
      assigned_at: '2024-01-01T00:00:00Z'
    }
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
    fetchTicketDetails: mockFetchTicketDetails,
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

  const defaultCommentOperationsReturn = {
    fetchTicketComments: mockFetchTicketComments,
    refetchTicketComments: mockRefetchTicketComments,
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
    vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue(defaultTicketOperationsReturn)
    vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue(defaultCommentOperationsReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render the ticket details page', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByText(/TICK-001 - Login Issue/)).toBeInTheDocument()
    })

    it('should fetch ticket details on mount', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(mockFetchTicketDetails).toHaveBeenCalledWith('TICK-001')
    })

    it('should render breadcrumbs component', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('should render tabs navigation', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tabs-root')).toBeInTheDocument()
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
    })

    it('should display ticket subject in heading', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByText('TICK-001 - Login Issue')).toBeInTheDocument()
    })

    it('should display generic heading when ticket details are not loaded', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        ticketDetails: null
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByText('Ticket Details')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading state while fetching ticket details', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        isFetching: true
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.getByText('Loading ticket details...')).toBeInTheDocument()
    })

    it('should show form when data is loaded', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tabs-root')).toBeInTheDocument()
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show error when fetch fails', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        fetchError: 'Failed to fetch ticket details'
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch ticket details')).toBeInTheDocument()
    })

    it('should show error when ticket details are not found', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        ticketDetails: null,
        isFetching: false
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Ticket details not found')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should default to overview tab', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      const tabsRoot = screen.getByTestId('tabs-root')
      expect(tabsRoot).toHaveAttribute('data-value', 'overview')
    })

    it('should switch to communications tab when clicked', async () => {
      const user = userEvent.setup()
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      const communicationsTab = screen.getByTestId('tab-communications')
      await user.click(communicationsTab)

      /* Tab should be active */
      expect(communicationsTab).toBeInTheDocument()
    })
  })

  describe('Comments Integration', () => {
    it('should not fetch comments initially', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      /* Comments should only be fetched when switching to communications tab */
      expect(mockFetchTicketComments).not.toHaveBeenCalled()
    })

    it('should fetch comments when switching to communications tab', async () => {
      const user = userEvent.setup()
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      const communicationsTab = screen.getByTestId('tab-communications')
      await user.click(communicationsTab)

      await waitFor(() => {
        expect(mockFetchTicketComments).toHaveBeenCalledWith('TICK-001')
      })
    })

    it('should not fetch comments again if already loaded', async () => {
      const user = userEvent.setup()
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      const communicationsTab = screen.getByTestId('tab-communications')

      /* First click */
      await user.click(communicationsTab)

      await waitFor(() => {
        expect(mockFetchTicketComments).toHaveBeenCalledTimes(1)
      })

      /* Switch to overview and back to communications */
      const overviewTab = screen.getByTestId('tab-overview')
      await user.click(overviewTab)
      await user.click(communicationsTab)

      /* Should still only be called once */
      expect(mockFetchTicketComments).toHaveBeenCalledTimes(1)
    })

    it('should show loading state when fetching comments', async () => {
      const user = userEvent.setup()
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultCommentOperationsReturn,
        isFetchingComments: true
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      const communicationsTab = screen.getByTestId('tab-communications')
      await user.click(communicationsTab)

      await waitFor(() => {
        expect(screen.getByText('Loading communications...')).toBeInTheDocument()
      })
    })

    it('should show error when comments fetch fails', async () => {
      const user = userEvent.setup()
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultCommentOperationsReturn,
        fetchCommentsError: 'Failed to load comments'
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      const communicationsTab = screen.getByTestId('tab-communications')
      await user.click(communicationsTab)

      await waitFor(() => {
        expect(screen.getByText('Failed to load comments')).toBeInTheDocument()
      })
    })

    it('should render TicketComments component with correct props', async () => {
      const user = userEvent.setup()
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      const communicationsTab = screen.getByTestId('tab-communications')
      await user.click(communicationsTab)

      await waitFor(() => {
        expect(screen.getByTestId('ticket-comments')).toBeInTheDocument()
        expect(screen.getByTestId('comments-count')).toHaveTextContent('1 comments')
        expect(screen.getByTestId('ticket-id')).toHaveTextContent('TICK-001')
        expect(screen.getByTestId('show-add-form')).toHaveTextContent('false')
      })
    })

    it('should call refetchTicketComments when refresh is triggered', async () => {
      const user = userEvent.setup()
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      const communicationsTab = screen.getByTestId('tab-communications')
      await user.click(communicationsTab)

      await waitFor(() => {
        expect(screen.getByTestId('ticket-comments')).toBeInTheDocument()
      })

      const refreshButton = screen.getByTestId('refresh-comments')
      await user.click(refreshButton)

      expect(mockRefetchTicketComments).toHaveBeenCalled()
    })
  })

  describe('Ticket Details Display', () => {
    it('should display internal notes when available', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByText('Needs urgent attention')).toBeInTheDocument()
    })

    it('should not display internal notes section when notes are null', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        ticketDetails: {
          ...mockTicketDetails,
          internal_notes: null
        }
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.queryByText('Internal Notes')).not.toBeInTheDocument()
    })

    it('should display satisfaction feedback when available', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByText('Good service')).toBeInTheDocument()
    })

    it('should not display satisfaction feedback when null', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        ticketDetails: {
          ...mockTicketDetails,
          satisfaction_feedback: null
        }
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.queryByText('Feedback')).not.toBeInTheDocument()
    })

    it('should display satisfaction rating as stars', () => {
      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      /* Ticket has rating of 4, should display star rating */
      expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument()
    })
  })

  describe('Component Memoization', () => {
    it('should memoize the component', () => {
      const { rerender } = render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      rerender(<TicketDetailsPage ticketId="TICK-001" />)

      /* Should only fetch once due to memoization */
      expect(mockFetchTicketDetails).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing ticket ID gracefully', () => {
      render(<TicketDetailsPage ticketId="" />, { wrapper: TestWrapper })

      expect(mockFetchTicketDetails).not.toHaveBeenCalled()
    })

    it('should handle missing category details', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        ticketDetails: {
          ...mockTicketDetails,
          category_details: null
        }
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByText('TICK-001 - Login Issue')).toBeInTheDocument()
    })

    it('should handle missing assignment details', () => {
      vi.spyOn(useTicketOperationsHook, 'useTicketOperations').mockReturnValue({
        ...defaultTicketOperationsReturn,
        ticketDetails: {
          ...mockTicketDetails,
          assignment_details: null
        }
      })

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(screen.getByText('TICK-001 - Login Issue')).toBeInTheDocument()
    })
  })

  describe('Hook Integration', () => {
    it('should use useTicketOperations hook', () => {
      const spy = vi.spyOn(useTicketOperationsHook, 'useTicketOperations')

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(spy).toHaveBeenCalled()
    })

    it('should use useCommentOperations hook', () => {
      const spy = vi.spyOn(useCommentOperationsHook, 'useCommentOperations')

      render(<TicketDetailsPage ticketId="TICK-001" />, { wrapper: TestWrapper })

      expect(spy).toHaveBeenCalled()
    })
  })
})
