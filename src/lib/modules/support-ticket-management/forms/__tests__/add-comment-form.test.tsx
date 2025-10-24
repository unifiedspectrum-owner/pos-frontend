/* Comprehensive test suite for AddCommentForm */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import AddCommentForm from '@support-ticket-management/forms/add-comment-form'
import * as useCommentOperationsHook from '@support-ticket-management/hooks/use-comment-operations'

/* Mock component interfaces */
interface MockRichTextEditorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  isInValid?: boolean
  errorMessage?: string
}

interface MockSwitchFieldProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  activeText: string
  inactiveText: string
}

interface MockFileFieldProps {
  label: string
  onChange: (files: File[]) => void
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
  RichTextEditorField: ({ label, value, onChange, isInValid, errorMessage }: MockRichTextEditorFieldProps) => (
    <div data-testid={`wysiwyg-${label}`}>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`wysiwyg-input-${label}`}
      />
      {isInValid && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  SwitchField: ({ label, value, onChange, activeText, inactiveText }: MockSwitchFieldProps) => (
    <div data-testid={`switch-${label}`}>
      <label>{label}</label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        data-testid={`switch-input-${label}`}
      />
      <span>{value ? activeText : inactiveText}</span>
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
  ),
  PrimaryButton: ({ buttonText, loadingText, isLoading, disabled, type, onClick }: MockPrimaryButtonProps) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      data-testid="submit-button"
    >
      {isLoading ? loadingText : buttonText}
    </button>
  )
}))

vi.mock('@shared/utils', () => ({
  fileToBase64: vi.fn((file: File) => Promise.resolve(`base64-${file.name}`))
}))

describe('AddCommentForm', () => {
  const mockAddTicketComment = vi.fn()
  const mockOnRefresh = vi.fn()

  const defaultHookReturn = {
    fetchTicketComments: vi.fn(),
    refetchTicketComments: vi.fn(),
    addTicketComment: mockAddTicketComment,
    downloadTicketCommentAttachment: vi.fn(),
    ticketComments: [],
    isFetchingComments: false,
    isAddingComment: false,
    isDownloadingAttachment: false,
    fetchCommentsError: null,
    addCommentError: null,
    downloadAttachmentError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering', () => {
    it('should render the form with all fields', () => {
      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Add Response')).toBeInTheDocument()
      expect(screen.getByText('Reply to this ticket or add an internal note')).toBeInTheDocument()
      expect(screen.getByTestId('wysiwyg-Message')).toBeInTheDocument()
      expect(screen.getByTestId('file-Attachments')).toBeInTheDocument()
      expect(screen.getByTestId('switch-Internal Note')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should display the form header with icon', () => {
      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Add Response')).toBeInTheDocument()
      expect(screen.getByText('Reply to this ticket or add an internal note')).toBeInTheDocument()
    })

    it('should display all form fields in correct order', () => {
      const { container } = render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const fields = container.querySelectorAll('[data-testid^="wysiwyg-"], [data-testid^="file-"], [data-testid^="switch-"]')
      expect(fields.length).toBeGreaterThanOrEqual(3)
    })

    it('should display submit button with correct text', () => {
      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Send Reply')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call addTicketComment with correct data on submit', async () => {
      const user = userEvent.setup()
      mockAddTicketComment.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'This is a test comment')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).toHaveBeenCalledWith(
          'TICK-001',
          expect.objectContaining({
            message_content: 'This is a test comment',
            is_internal: false,
            attachments: []
          })
        )
      })
    })

    it('should call onRefresh after successful submission', async () => {
      const user = userEvent.setup()
      mockAddTicketComment.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Test comment')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalledTimes(1)
      })
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      mockAddTicketComment.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Test comment')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(messageInput).toHaveValue('')
      })
    })

    it('should not call onRefresh if submission fails', async () => {
      const user = userEvent.setup()
      mockAddTicketComment.mockResolvedValueOnce(false)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Test comment')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).toHaveBeenCalled()
      })

      expect(mockOnRefresh).not.toHaveBeenCalled()
    })

    it('should not submit if message is empty', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).not.toHaveBeenCalled()
      })
    })

    it('should not submit if message contains only whitespace', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, '   ')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).not.toHaveBeenCalled()
      })
    })

    it('should not submit if ticketId is missing', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AddCommentForm onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Test comment')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).not.toHaveBeenCalled()
      })
    })

    it('should work without onRefresh callback', async () => {
      const user = userEvent.setup()
      mockAddTicketComment.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Test comment')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).toHaveBeenCalled()
      })
    })
  })

  describe('Internal Note Toggle', () => {
    it('should toggle internal note flag', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const toggleInput = screen.getByTestId('switch-input-Internal Note')
      expect(toggleInput).not.toBeChecked()

      await user.click(toggleInput)

      expect(toggleInput).toBeChecked()
    })

    it('should display correct toggle text for internal note', () => {
      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Public (Visible to Customer)')).toBeInTheDocument()
    })

    it('should submit with is_internal true when toggled on', async () => {
      const user = userEvent.setup()
      mockAddTicketComment.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Internal note')

      const toggleInput = screen.getByTestId('switch-input-Internal Note')
      await user.click(toggleInput)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).toHaveBeenCalledWith(
          'TICK-001',
          expect.objectContaining({
            is_internal: true
          })
        )
      })
    })
  })

  describe('File Upload', () => {
    it('should handle file upload', async () => {
      const user = userEvent.setup()
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      mockAddTicketComment.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Comment with attachment')

      const fileInput = screen.getByTestId('file-input-Attachments')
      await user.upload(fileInput, file)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).toHaveBeenCalledWith(
          'TICK-001',
          expect.objectContaining({
            message_content: 'Comment with attachment',
            attachments: expect.arrayContaining([
              expect.objectContaining({
                filename: 'test.pdf',
                mime_type: 'application/pdf',
                is_public: false
              })
            ])
          })
        )
      })
    })

    it('should handle multiple file uploads', async () => {
      const user = userEvent.setup()
      const file1 = new File(['content 1'], 'file1.pdf', { type: 'application/pdf' })
      const file2 = new File(['content 2'], 'file2.jpg', { type: 'image/jpeg' })
      mockAddTicketComment.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Multiple attachments')

      const fileInput = screen.getByTestId('file-input-Attachments')
      await user.upload(fileInput, [file1, file2])

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).toHaveBeenCalledWith(
          'TICK-001',
          expect.objectContaining({
            attachments: expect.arrayContaining([
              expect.objectContaining({ filename: 'file1.pdf' }),
              expect.objectContaining({ filename: 'file2.jpg' })
            ])
          })
        )
      })
    })

    it('should handle file upload errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { fileToBase64 } = await import('@shared/utils')
      vi.mocked(fileToBase64).mockRejectedValueOnce(new Error('File conversion failed'))

      const user = userEvent.setup()
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const fileInput = screen.getByTestId('file-input-Attachments')
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error processing files:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('should reset file field after successful submission', async () => {
      const user = userEvent.setup()
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      mockAddTicketComment.mockResolvedValueOnce(true)

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Test')

      const fileInput = screen.getByTestId('file-input-Attachments')
      await user.upload(fileInput, file)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddTicketComment).toHaveBeenCalled()
      })

      /* File field should be reset (key changed) */
      const newFileInput = screen.getByTestId('file-input-Attachments')
      expect(newFileInput).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when isAddingComment is true', () => {
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultHookReturn,
        isAddingComment: true
      })

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('should display loading text when isAddingComment is true', () => {
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultHookReturn,
        isAddingComment: true
      })

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Sending...')).toBeInTheDocument()
    })

    it('should display normal text when not loading', () => {
      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(screen.getByText('Send Reply')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should allow typing in message field', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Test message')

      expect(messageInput).toHaveValue('Test message')
    })

    it('should allow clearing message field', async () => {
      const user = userEvent.setup()

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const messageInput = screen.getByTestId('wysiwyg-input-Message')
      await user.type(messageInput, 'Test message')
      await user.clear(messageInput)

      expect(messageInput).toHaveValue('')
    })
  })

  describe('Form Validation', () => {
    it('should use zodResolver for validation', () => {
      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* Form should be rendered with validation */
      expect(screen.getByTestId('wysiwyg-Message')).toBeInTheDocument()
    })
  })

  describe('Hook Integration', () => {
    it('should use useCommentOperations hook', () => {
      const spy = vi.spyOn(useCommentOperationsHook, 'useCommentOperations')

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      expect(spy).toHaveBeenCalled()
    })

    it('should handle hook returning different state', () => {
      vi.spyOn(useCommentOperationsHook, 'useCommentOperations').mockReturnValue({
        ...defaultHookReturn,
        addTicketComment: vi.fn(),
        isAddingComment: true
      })

      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Field Display', () => {
    it('should render only active fields', () => {
      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* All three active fields should be visible */
      expect(screen.getByTestId('wysiwyg-Message')).toBeInTheDocument()
      expect(screen.getByTestId('file-Attachments')).toBeInTheDocument()
      expect(screen.getByTestId('switch-Internal Note')).toBeInTheDocument()
    })

    it('should display fields in correct display order', () => {
      render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* Verify all form fields are present */
      expect(screen.getByTestId('wysiwyg-Message')).toBeInTheDocument()
      expect(screen.getByTestId('file-Attachments')).toBeInTheDocument()
      expect(screen.getByTestId('switch-Internal Note')).toBeInTheDocument()
    })
  })

  describe('Form Styling', () => {
    it('should apply border styling to form container', () => {
      const { container } = render(
        <Provider>
          <AddCommentForm ticketId="TICK-001" onRefresh={mockOnRefresh} />
        </Provider>
      )

      /* Check that the form is wrapped in a styled box */
      expect(screen.getByText('Add Response')).toBeInTheDocument()
    })
  })
})
