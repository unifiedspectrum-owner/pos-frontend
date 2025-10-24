/* Comprehensive test suite for useCommentOperations hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

/* Support ticket module imports */
import { useCommentOperations } from '@support-ticket-management/hooks/use-comment-operations'
import { communicationsService, attachmentsService } from '@support-ticket-management/api'
import { TicketCommunication, TicketAttachment } from '@support-ticket-management/types'

/* Mock dependencies */
vi.mock('@support-ticket-management/api', () => ({
  communicationsService: {
    getTicketCommunications: vi.fn(),
    createTicketCommunication: vi.fn()
  },
  attachmentsService: {
    downloadAttachment: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/config', () => ({
  LOADING_DELAY: 0,
  LOADING_DELAY_ENABLED: false
}))

describe('useCommentOperations', () => {
  const mockTicketId = 'TICK-001'

  const mockComments: (TicketCommunication & { attachments?: TicketAttachment[] })[] = [
    {
      id: 1,
      ticket_id: 1,
      communication_type: 'customer_message',
      sender_user_id: 1,
      sender_name: 'Customer',
      sender_email: 'customer@example.com',
      sender_type: 'customer',
      message_content: 'Test message',
      message_format: 'text',
      is_internal: false,
      is_auto_generated: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      attachments: []
    }
  ]

  const mockCommentData = {
    message_content: 'New comment',
    is_internal: false,
    attachments: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useCommentOperations())

      expect(result.current.ticketComments).toEqual([])
      expect(result.current.isFetchingComments).toBe(false)
      expect(result.current.isAddingComment).toBe(false)
      expect(result.current.isDownloadingAttachment).toBe(false)
      expect(result.current.fetchCommentsError).toBeNull()
      expect(result.current.addCommentError).toBeNull()
      expect(result.current.downloadAttachmentError).toBeNull()
    })

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useCommentOperations())

      expect(typeof result.current.fetchTicketComments).toBe('function')
      expect(typeof result.current.refetchTicketComments).toBe('function')
      expect(typeof result.current.addTicketComment).toBe('function')
      expect(typeof result.current.downloadTicketCommentAttachment).toBe('function')
    })
  })

  describe('fetchTicketComments', () => {
    it('should fetch ticket comments successfully', async () => {
      vi.mocked(communicationsService.getTicketCommunications).mockResolvedValueOnce({
        success: true,
        message: 'Success',
        data: {
          ticket_id: mockTicketId,
          communications: mockComments
        }
      })

      const { result } = renderHook(() => useCommentOperations())

      let fetchResult: boolean = false
      await act(async () => {
        fetchResult = await result.current.fetchTicketComments(mockTicketId)
      })

      expect(fetchResult).toBe(true)
      expect(result.current.ticketComments).toEqual(mockComments)
      expect(result.current.isFetchingComments).toBe(false)
      expect(result.current.fetchCommentsError).toBeNull()
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(communicationsService.getTicketCommunications).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          data: { ticket_id: mockTicketId, communications: mockComments }
        }), 100))
      )

      const { result } = renderHook(() => useCommentOperations())

      act(() => {
        result.current.fetchTicketComments(mockTicketId)
      })

      expect(result.current.isFetchingComments).toBe(true)

      await waitFor(() => {
        expect(result.current.isFetchingComments).toBe(false)
      })
    })

    it('should handle API error response', async () => {
      const errorMessage = 'Failed to fetch comments'
      vi.mocked(communicationsService.getTicketCommunications).mockResolvedValueOnce({
        success: false,
        message: 'Error',
        data: { ticket_id: mockTicketId, communications: [] },
        error: errorMessage
      })

      const { result } = renderHook(() => useCommentOperations())

      let fetchResult: boolean = false
      await act(async () => {
        fetchResult = await result.current.fetchTicketComments(mockTicketId)
      })

      expect(fetchResult).toBe(false)
      expect(result.current.fetchCommentsError).toBe(errorMessage)
      expect(result.current.ticketComments).toEqual([])
    })

    it('should handle exception during fetch', async () => {
      const error = new Error('Network error')
      vi.mocked(communicationsService.getTicketCommunications).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCommentOperations())

      let fetchResult: boolean = false
      await act(async () => {
        fetchResult = await result.current.fetchTicketComments(mockTicketId)
      })

      expect(fetchResult).toBe(false)
      expect(result.current.fetchCommentsError).toBe('Failed to fetch ticket comments')
    })

    it('should clear previous error on new fetch', async () => {
      vi.mocked(communicationsService.getTicketCommunications)
        .mockResolvedValueOnce({
          success: false,
          message: 'Error',
          data: { ticket_id: mockTicketId, communications: [] },
          error: 'First error'
        })
        .mockResolvedValueOnce({
          success: true,
          message: 'Success',
          data: { ticket_id: mockTicketId, communications: mockComments }
        })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await result.current.fetchTicketComments(mockTicketId)
      })

      expect(result.current.fetchCommentsError).toBe('First error')

      await act(async () => {
        await result.current.fetchTicketComments(mockTicketId)
      })

      expect(result.current.fetchCommentsError).toBeNull()
    })
  })

  describe('refetchTicketComments', () => {
    it('should refetch using last fetched ticket ID', async () => {
      vi.mocked(communicationsService.getTicketCommunications).mockResolvedValue({
        success: true,
        message: 'Success',
        data: { ticket_id: mockTicketId, communications: mockComments }
      })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await result.current.fetchTicketComments(mockTicketId)
      })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.refetchTicketComments()
      })

      expect(communicationsService.getTicketCommunications).toHaveBeenCalledWith(mockTicketId)
    })

    it('should return false if no ticket ID stored', async () => {
      const { result } = renderHook(() => useCommentOperations())

      let refetchResult: boolean = false
      await act(async () => {
        refetchResult = await result.current.refetchTicketComments()
      })

      expect(refetchResult).toBe(false)
      expect(communicationsService.getTicketCommunications).not.toHaveBeenCalled()
    })

    it('should update to new ticket ID when fetching different ticket', async () => {
      vi.mocked(communicationsService.getTicketCommunications).mockResolvedValue({
        success: true,
        message: 'Success',
        data: { ticket_id: mockTicketId, communications: mockComments }
      })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await result.current.fetchTicketComments('TICK-001')
      })

      await act(async () => {
        await result.current.fetchTicketComments('TICK-002')
      })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.refetchTicketComments()
      })

      expect(communicationsService.getTicketCommunications).toHaveBeenCalledWith('TICK-002')
    })
  })

  describe('addTicketComment', () => {
    it('should add comment successfully', async () => {
      vi.mocked(communicationsService.createTicketCommunication).mockResolvedValueOnce({
        success: true,
        message: 'Comment added',
        data: { communication_id: 123, ticket_id: mockTicketId }
      })

      const { result } = renderHook(() => useCommentOperations())

      let addResult: boolean = false
      await act(async () => {
        addResult = await result.current.addTicketComment(mockTicketId, mockCommentData)
      })

      expect(addResult).toBe(true)
      expect(result.current.isAddingComment).toBe(false)
      expect(result.current.addCommentError).toBeNull()
      expect(communicationsService.createTicketCommunication).toHaveBeenCalledWith(
        mockTicketId,
        mockCommentData
      )
    })

    it('should set loading state during add', async () => {
      vi.mocked(communicationsService.createTicketCommunication).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          data: { communication_id: 123, ticket_id: mockTicketId }
        }), 100))
      )

      const { result } = renderHook(() => useCommentOperations())

      act(() => {
        result.current.addTicketComment(mockTicketId, mockCommentData)
      })

      expect(result.current.isAddingComment).toBe(true)

      await waitFor(() => {
        expect(result.current.isAddingComment).toBe(false)
      })
    })

    it('should handle API error response when adding comment', async () => {
      const errorMessage = 'Failed to add comment'
      vi.mocked(communicationsService.createTicketCommunication).mockResolvedValueOnce({
        success: false,
        message: 'Error',
        data: { communication_id: 0, ticket_id: mockTicketId },
        error: errorMessage
      })

      const { result } = renderHook(() => useCommentOperations())

      let addResult: boolean = false
      await act(async () => {
        addResult = await result.current.addTicketComment(mockTicketId, mockCommentData)
      })

      expect(addResult).toBe(false)
      expect(result.current.addCommentError).toBe(errorMessage)
    })

    it('should handle exception during add comment', async () => {
      const error = new Error('Network error')
      vi.mocked(communicationsService.createTicketCommunication).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCommentOperations())

      let addResult: boolean = false
      await act(async () => {
        addResult = await result.current.addTicketComment(mockTicketId, mockCommentData)
      })

      expect(addResult).toBe(false)
      expect(result.current.addCommentError).toBe('Failed to add comment')
    })

    it('should clear previous error on new add attempt', async () => {
      vi.mocked(communicationsService.createTicketCommunication)
        .mockResolvedValueOnce({
          success: false,
          message: 'Error',
          data: { communication_id: 0, ticket_id: mockTicketId },
          error: 'First error'
        })
        .mockResolvedValueOnce({
          success: true,
          message: 'Success',
          data: { communication_id: 123, ticket_id: mockTicketId }
        })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await result.current.addTicketComment(mockTicketId, mockCommentData)
      })

      expect(result.current.addCommentError).toBe('First error')

      await act(async () => {
        await result.current.addTicketComment(mockTicketId, mockCommentData)
      })

      expect(result.current.addCommentError).toBeNull()
    })
  })

  describe('downloadTicketCommentAttachment', () => {
    const mockAttachmentId = 123
    const mockFilename = 'document.pdf'
    const mockBase64Content = 'VGVzdCBjb250ZW50' /* "Test content" in base64 */

    beforeEach(() => {
      /* Mock DOM methods for file download */
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()
      global.atob = vi.fn(() => 'Test content')

      /* Store original createElement */
      const originalCreateElement = document.createElement.bind(document)

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          const mockLink = {
            click: vi.fn(),
            setAttribute: vi.fn(),
            href: '',
            download: '',
            style: {}
          }
          return mockLink as unknown as HTMLElement
        }
        return originalCreateElement(tagName)
      })

      vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => node)
      vi.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => node)
    })

    it('should download attachment successfully', async () => {
      vi.mocked(attachmentsService.downloadAttachment).mockResolvedValueOnce({
        success: true,
        message: 'Success',
        data: {
          attachment_id: mockAttachmentId.toString(),
          filename: mockFilename,
          mime_type: 'application/pdf',
          file_size: '1024',
          file_extension: 'pdf',
          file_content: mockBase64Content
        }
      })

      const { result } = renderHook(() => useCommentOperations())

      let downloadResult: boolean = false
      await act(async () => {
        downloadResult = await result.current.downloadTicketCommentAttachment(
          mockAttachmentId,
          mockFilename
        )
      })

      expect(downloadResult).toBe(true)
      expect(result.current.isDownloadingAttachment).toBe(false)
      expect(result.current.downloadAttachmentError).toBeNull()
      expect(attachmentsService.downloadAttachment).toHaveBeenCalledWith(String(mockAttachmentId))
    })

    it('should set loading state during download', async () => {
      vi.mocked(attachmentsService.downloadAttachment).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          data: {
            attachment_id: mockAttachmentId.toString(),
            filename: mockFilename,
            mime_type: 'application/pdf',
            file_size: '1024',
            file_extension: 'pdf',
            file_content: mockBase64Content
          }
        }), 100))
      )

      const { result } = renderHook(() => useCommentOperations())

      act(() => {
        result.current.downloadTicketCommentAttachment(mockAttachmentId, mockFilename)
      })

      expect(result.current.isDownloadingAttachment).toBe(true)

      await waitFor(() => {
        expect(result.current.isDownloadingAttachment).toBe(false)
      })
    })

    it('should handle base64 data with prefix', async () => {
      const base64WithPrefix = `data:application/pdf;base64,${mockBase64Content}`
      vi.mocked(attachmentsService.downloadAttachment).mockResolvedValueOnce({
        success: true,
        message: 'Success',
        data: {
          attachment_id: mockAttachmentId.toString(),
          filename: mockFilename,
          mime_type: 'application/pdf',
          file_size: '1024',
          file_extension: 'pdf',
          file_content: base64WithPrefix
        }
      })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await result.current.downloadTicketCommentAttachment(mockAttachmentId, mockFilename)
      })

      expect(global.atob).toHaveBeenCalledWith(mockBase64Content)
    })

    it('should use fallback filename if not provided in response', async () => {
      vi.mocked(attachmentsService.downloadAttachment).mockResolvedValueOnce({
        success: true,
        message: 'Success',
        data: {
          attachment_id: mockAttachmentId.toString(),
          filename: '',
          mime_type: 'application/pdf',
          file_size: '1024',
          file_extension: 'pdf',
          file_content: mockBase64Content
        }
      })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await result.current.downloadTicketCommentAttachment(mockAttachmentId, mockFilename)
      })

      const link = document.createElement('a') as HTMLAnchorElement
      expect(link.download).toBeDefined()
    })

    it('should handle API error response during download', async () => {
      const errorMessage = 'Failed to download attachment'
      vi.mocked(attachmentsService.downloadAttachment).mockResolvedValueOnce({
        success: false,
        message: 'Error',
        data: {
          attachment_id: '',
          filename: '',
          mime_type: '',
          file_size: '',
          file_extension: '',
          file_content: ''
        },
        error: errorMessage
      })

      const { result } = renderHook(() => useCommentOperations())

      let downloadResult: boolean = false
      await act(async () => {
        downloadResult = await result.current.downloadTicketCommentAttachment(
          mockAttachmentId,
          mockFilename
        )
      })

      expect(downloadResult).toBe(false)
      expect(result.current.downloadAttachmentError).toBe(errorMessage)
    })

    it('should handle exception during download', async () => {
      const error = new Error('Network error')
      vi.mocked(attachmentsService.downloadAttachment).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCommentOperations())

      let downloadResult: boolean = false
      await act(async () => {
        downloadResult = await result.current.downloadTicketCommentAttachment(
          mockAttachmentId,
          mockFilename
        )
      })

      expect(downloadResult).toBe(false)
      expect(result.current.downloadAttachmentError).toBe('Failed to download attachment')
    })

    it('should clear previous error on new download attempt', async () => {
      vi.mocked(attachmentsService.downloadAttachment)
        .mockResolvedValueOnce({
          success: false,
          message: 'Error',
          data: {
            attachment_id: '',
            filename: '',
            mime_type: '',
            file_size: '',
            file_extension: '',
            file_content: ''
          },
          error: 'First error'
        })
        .mockResolvedValueOnce({
          success: true,
          message: 'Success',
          data: {
            attachment_id: mockAttachmentId.toString(),
            filename: mockFilename,
            mime_type: 'application/pdf',
            file_size: '1024',
            file_extension: 'pdf',
            file_content: mockBase64Content
          }
        })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await result.current.downloadTicketCommentAttachment(mockAttachmentId, mockFilename)
      })

      expect(result.current.downloadAttachmentError).toBe('First error')

      await act(async () => {
        await result.current.downloadTicketCommentAttachment(mockAttachmentId, mockFilename)
      })

      expect(result.current.downloadAttachmentError).toBeNull()
    })
  })

  describe('Multiple Operations', () => {
    it('should handle concurrent operations independently', async () => {
      vi.mocked(communicationsService.getTicketCommunications).mockResolvedValue({
        success: true,
        message: 'Success',
        data: { ticket_id: mockTicketId, communications: mockComments }
      })

      vi.mocked(communicationsService.createTicketCommunication).mockResolvedValue({
        success: true,
        message: 'Success',
        data: { communication_id: 123, ticket_id: mockTicketId }
      })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await Promise.all([
          result.current.fetchTicketComments(mockTicketId),
          result.current.addTicketComment(mockTicketId, mockCommentData)
        ])
      })

      expect(result.current.ticketComments).toEqual(mockComments)
      expect(result.current.isFetchingComments).toBe(false)
      expect(result.current.isAddingComment).toBe(false)
    })

    it('should maintain separate error states for different operations', async () => {
      vi.mocked(communicationsService.getTicketCommunications).mockResolvedValueOnce({
        success: false,
        message: 'Error',
        data: { ticket_id: mockTicketId, communications: [] },
        error: 'Fetch error'
      })

      vi.mocked(communicationsService.createTicketCommunication).mockResolvedValueOnce({
        success: false,
        message: 'Error',
        data: { communication_id: 0, ticket_id: mockTicketId },
        error: 'Add error'
      })

      const { result } = renderHook(() => useCommentOperations())

      await act(async () => {
        await result.current.fetchTicketComments(mockTicketId)
        await result.current.addTicketComment(mockTicketId, mockCommentData)
      })

      expect(result.current.fetchCommentsError).toBe('Fetch error')
      expect(result.current.addCommentError).toBe('Add error')
    })
  })
})
