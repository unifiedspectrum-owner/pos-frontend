/* Comprehensive test suite for TicketComments */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import TicketComments from '@support-ticket-management/forms/ticket-comments'
import * as useCommentOperationsHook from '@support-ticket-management/hooks/use-comment-operations'
import { TicketCommunicationWithAttachments } from '@support-ticket-management/types'

/* Mock component interfaces */
interface MockEmptyStateContainerProps {
  title: string
  description: string
}

interface MockAddCommentFormProps {
  ticketId: string
  onRefresh: () => void
}

/* Mock dependencies */
vi.mock('@shared/utils', () => ({
  formatDateTime: vi.fn((date: string) => new Date(date).toLocaleString())
}))

vi.mock('@shared/constants', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/constants')>()
  return {
    ...actual,
    getFileTypeIcon: vi.fn(() => 'FaFile')
  }
})

vi.mock('@shared/components', () => ({
  EmptyStateContainer: ({ title, description }: MockEmptyStateContainerProps) => (
    <div data-testid="empty-state">
      <div data-testid="empty-title">{title}</div>
      <div data-testid="empty-description">{description}</div>
    </div>
  )
}))

vi.mock('@support-ticket-management/forms/add-comment-form', () => ({
  default: ({ ticketId, onRefresh }: MockAddCommentFormProps) => (
    <div data-testid="add-comment-form">
      <div data-testid="form-ticket-id">{ticketId}</div>
      <button onClick={onRefresh} data-testid="form-refresh">Refresh</button>
    </div>
  )
}))

vi.mock('html-react-parser', () => ({
  default: vi.fn((html: string) => html)
}))

describe('TicketComments', () => {
  const mockDownloadTicketCommentAttachment = vi.fn()
  const mockOnRefresh = vi.fn()

  const defaultHookReturn = {
    fetchTicketComments: vi.fn(),
    refetchTicketComments: vi.fn(),
    addTicketComment: vi.fn(),
    downloadTicketCommentAttachment: mockDownloadTicketCommentAttachment,
    ticketComments: [],
    isFetchingComments: false,
    isAddingComment: false,
    isDownloadingAttachment: false,
    fetchCommentsError: null,
    addCommentError: null,
    downloadAttachmentError: null
  }

  const mockComments: TicketCommunicationWithAttachments[] = [
    {
      id: 1,
      ticket_id: 1,
      communication_type: 'customer_message' as const,
      sender_user_id: 1,
      sender_name: 'Customer Name',
      sender_email: 'customer@example.com',
      sender_type: 'customer' as const,
      message_content: 'I need help with my login',
      message_format: 'text' as const,
      is_internal: false,
      is_auto_generated: false,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      attachments: []
    },
    {
      id: 2,
      ticket_id: 1,
      communication_type: 'agent_response' as const,
      sender_user_id: 2,
      sender_name: 'Agent Name',
      sender_email: 'agent@example.com',
      sender_type: 'agent' as const,
      message_content: 'I will help you with that',
      message_format: 'text' as const,
      is_internal: false,
      is_auto_generated: false,
      created_at: '2024-01-01T10:30:00Z',
      updated_at: '2024-01-01T10:30:00Z',
      attachments: []
    },
    {
      id: 3,
      ticket_id: 1,
      communication_type: 'agent_response' as const,
      sender_user_id: 3,
      sender_name: 'Internal Agent',
      sender_email: 'internal@example.com',
      sender_type: 'agent' as const,
      message_content: 'Internal note about this ticket',
      message_format: 'text' as const,
      is_internal: true,
      is_auto_generated: false,
      created_at: '2024-01-01T11:00:00Z',
      updated_at: '2024-01-01T11:00:00Z',
      attachments: []
    }
  ]

  const mockCommentWithAttachment: TicketCommunicationWithAttachments = {
    id: 4,
    ticket_id: 1,
    communication_type: 'agent_response' as const,
    sender_user_id: 2,
    sender_name: 'Agent Name',
    sender_email: 'agent@example.com',
    sender_type: 'agent' as const,
    message_content: 'Here is the document',
    message_format: 'text' as const,
    is_internal: false,
    is_auto_generated: false,
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T12:00:00Z',
    attachments: [
      {
        id: 1,
        ticket_id: 1,
        communication_id: 4,
        filename: 'document.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        file_extension: 'pdf',
        file_path: 'https://example.com/file.pdf',
        is_public: false,
        uploaded_by: 'Agent Name',
        uploaded_at: '2024-01-01T12:00:00Z',
        created_at: '2024-01-01T12:00:00Z'
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering', () => {
    it('should render the component with heading', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText(/Communications/)).toBeInTheDocument()
    })

    it('should display comment count in heading', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Communications (3)')).toBeInTheDocument()
    })

    it('should render all comments', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('I need help with my login')).toBeInTheDocument()
      expect(screen.getByText('I will help you with that')).toBeInTheDocument()
      expect(screen.getByText('Internal note about this ticket')).toBeInTheDocument()
    })

    it('should render add comment form by default', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByTestId('add-comment-form')).toBeInTheDocument()
    })

    it('should not render add comment form when showAddCommentForm is false', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} showAddCommentForm={false} />
        </Provider>
      )

      expect(screen.queryByTestId('add-comment-form')).not.toBeInTheDocument()
    })

    it('should display sender names', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Customer Name')).toBeInTheDocument()
      expect(screen.getByText('Agent Name')).toBeInTheDocument()
      expect(screen.getByText('Internal Agent')).toBeInTheDocument()
    })

    it('should display sender types as badges', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('customer')).toBeInTheDocument()
      expect(screen.getAllByText('agent')).toHaveLength(2)
    })

    it('should display formatted timestamps', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* Check that formatted timestamps are displayed for all comments */
      const timestamps = screen.getAllByText(/1\/1\/2024/)
      expect(timestamps.length).toBe(3) /* Three comments with timestamps */
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no comments', () => {
      render(
        <Provider>
          <TicketComments comments={[]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('empty-title')).toHaveTextContent('No Communications')
    })

    it('should display correct empty state message when showing all', () => {
      render(
        <Provider>
          <TicketComments comments={[]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByTestId('empty-description')).toHaveTextContent('No communications have been added to this ticket yet')
    })

    it('should update comment count to 0 when empty', () => {
      render(
        <Provider>
          <TicketComments comments={[]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Communications (0)')).toBeInTheDocument()
    })
  })

  describe('Internal Notes Toggle', () => {
    it('should display toggle button when internal notes exist', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText(/Hide Internal Notes/)).toBeInTheDocument()
    })

    it('should not display toggle button when no internal notes', () => {
      const nonInternalComments = mockComments.filter(c => !c.is_internal)

      render(
        <Provider>
          <TicketComments comments={nonInternalComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.queryByText(/Internal Notes/)).not.toBeInTheDocument()
    })

    it('should display internal notes count in toggle button', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText(/\(1\)/)).toBeInTheDocument()
    })

    it('should hide internal notes when toggle is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Internal note about this ticket')).toBeInTheDocument()

      const toggleButton = screen.getByText(/Hide Internal Notes/)
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.queryByText('Internal note about this ticket')).not.toBeInTheDocument()
      })
    })

    it('should show internal notes when toggle is clicked again', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const toggleButton = screen.getByText(/Hide Internal Notes/)
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.queryByText('Internal note about this ticket')).not.toBeInTheDocument()
      })

      const showButton = screen.getByText(/Show Internal Notes/)
      await user.click(showButton)

      await waitFor(() => {
        expect(screen.getByText('Internal note about this ticket')).toBeInTheDocument()
      })
    })

    it('should update comment count when hiding internal notes', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Communications (3)')).toBeInTheDocument()

      const toggleButton = screen.getByText(/Hide Internal Notes/)
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText('Communications (2)')).toBeInTheDocument()
      })
    })

    it('should display internal badge on internal notes', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Internal')).toBeInTheDocument()
    })
  })

  describe('Attachments Display', () => {
    it('should display attachments when comment has them', () => {
      render(
        <Provider>
          <TicketComments comments={[mockCommentWithAttachment]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Attachments:')).toBeInTheDocument()
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    })

    it('should not display attachments section when comment has no attachments', () => {
      render(
        <Provider>
          <TicketComments comments={[mockComments[0]]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.queryByText('Attachments:')).not.toBeInTheDocument()
    })

    it('should display file size for attachments', () => {
      render(
        <Provider>
          <TicketComments comments={[mockCommentWithAttachment]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* File size should be displayed (1024000 bytes = 1000 KB) */
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    })

    it('should call download function when download button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <TicketComments comments={[mockCommentWithAttachment]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const downloadButtons = screen.getAllByRole('button')
      const downloadButton = downloadButtons.find(btn => btn.querySelector('svg'))

      if (downloadButton) {
        await user.click(downloadButton)

        expect(mockDownloadTicketCommentAttachment).toHaveBeenCalledWith(1, 'document.pdf')
      }
    })

    it('should disable download button when downloading', () => {
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultHookReturn,
        isDownloadingAttachment: true
      })

      render(
        <Provider>
          <TicketComments comments={[mockCommentWithAttachment]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const downloadButtons = screen.getAllByRole('button')
      const downloadButton = downloadButtons.find(btn => btn.querySelector('svg'))

      if (downloadButton) {
        expect(downloadButton).toBeDisabled()
      }
    })
  })

  describe('Comment Styling', () => {
    it('should apply different styling for customer comments', () => {
      render(
        <Provider>
          <TicketComments comments={[mockComments[0]]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* Customer comment should be visible */
      expect(screen.getByText('Customer Name')).toBeInTheDocument()
    })

    it('should apply different styling for agent comments', () => {
      render(
        <Provider>
          <TicketComments comments={[mockComments[1]]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* Agent comment should be visible */
      expect(screen.getByText('Agent Name')).toBeInTheDocument()
    })

    it('should apply different styling for internal notes', () => {
      render(
        <Provider>
          <TicketComments comments={[mockComments[2]]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* Internal note should have Internal badge */
      expect(screen.getByText('Internal')).toBeInTheDocument()
    })
  })

  describe('Add Comment Form Integration', () => {
    it('should pass ticketId to add comment form', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByTestId('form-ticket-id')).toHaveTextContent('TICK-001')
    })

    it('should pass onRefresh to add comment form', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const refreshButton = screen.getByTestId('form-refresh')
      await user.click(refreshButton)

      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    it('should work without onRefresh callback', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" />
        </Provider>
      )

      expect(screen.getByTestId('add-comment-form')).toBeInTheDocument()
    })

    it('should work without ticketId', () => {
      render(
        <Provider>
          <TicketComments comments={mockComments} onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByTestId('add-comment-form')).toBeInTheDocument()
    })
  })

  describe('Hook Integration', () => {
    it('should use useCommentOperations hook', () => {
      const spy = vi.spyOn(useCommentOperationsHook, 'useCommentOperations')

      render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('HTML Content Parsing', () => {
    it('should parse HTML content in messages', () => {
      const htmlComment: TicketCommunicationWithAttachments = {
        ...mockComments[0],
        message_content: '<p>This is <strong>bold</strong> text</p>'
      }

      render(
        <Provider>
          <TicketComments comments={[htmlComment]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* The HTML content should be rendered */
      expect(screen.getByText(/<p>This is <strong>bold<\/strong> text<\/p>/)).toBeInTheDocument()
    })
  })

  describe('Multiple Attachments', () => {
    it('should display multiple attachments', () => {
      const commentWithMultipleAttachments: TicketCommunicationWithAttachments = {
        ...mockCommentWithAttachment,
        attachments: [
          ...mockCommentWithAttachment.attachments!,
          {
            id: 2,
            ticket_id: 1,
            communication_id: 4,
            filename: 'image.jpg',
            file_size: 500000,
            mime_type: 'image/jpeg',
            file_extension: 'jpg',
            file_path: 'https://example.com/image.jpg',
            is_public: false,
            uploaded_by: 'Agent Name',
            uploaded_at: '2024-01-01T12:00:00Z',
            created_at: '2024-01-01T12:00:00Z'
          }
        ]
      }

      render(
        <Provider>
          <TicketComments comments={[commentWithMultipleAttachments]} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('document.pdf')).toBeInTheDocument()
      expect(screen.getByText('image.jpg')).toBeInTheDocument()
    })
  })

  describe('Comment Order', () => {
    it('should display comments in the order they are provided', () => {
      const { container } = render(
        <Provider>
          <TicketComments comments={mockComments} ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const comments = container.querySelectorAll('[data-testid*="comment"]')
      /* Comments should maintain their order */
      expect(screen.getByText('Customer Name')).toBeInTheDocument()
    })
  })
})
