/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Support ticket module imports */
import { communicationsService, attachmentsService } from '@support-ticket-management/api'
import { TicketCommunication, TicketAttachment } from '@support-ticket-management/types'
import { CreateTicketCommentFormSchema } from '@support-ticket-management/schemas'

/* Hook interface */
interface UseCommentOperationsReturn {
  fetchTicketComments: (ticketId: string) => Promise<boolean>
  refetchTicketComments: () => Promise<boolean>
  addTicketComment: (ticketId: string, data: CreateTicketCommentFormSchema) => Promise<boolean>
  downloadTicketCommentAttachment: (attachmentId: number, filename: string) => Promise<boolean>
  ticketComments: (TicketCommunication & { attachments?: TicketAttachment[] })[]
  isFetchingComments: boolean
  isAddingComment: boolean
  isDownloadingAttachment: boolean
  fetchCommentsError: string | null
  addCommentError: string | null
  downloadAttachmentError: string | null
}

/* Custom hook for ticket comment operations */
export const useCommentOperations = (): UseCommentOperationsReturn => {
  /* Fetch ticket comments state */
  const [ticketComments, setTicketComments] = useState<(TicketCommunication & { attachments?: TicketAttachment[] })[]>([])
  const [isFetchingComments, setIsFetchingComments] = useState<boolean>(false)
  const [fetchCommentsError, setFetchCommentsError] = useState<string | null>(null)
  const [lastFetchedTicketId, setLastFetchedTicketId] = useState<string | null>(null)

  /* Add comment state */
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false)
  const [addCommentError, setAddCommentError] = useState<string | null>(null)

  /* Download attachment state */
  const [isDownloadingAttachment, setIsDownloadingAttachment] = useState<boolean>(false)
  const [downloadAttachmentError, setDownloadAttachmentError] = useState<string | null>(null)

  /* Fetch ticket comments by ID */
  const fetchTicketComments = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      setIsFetchingComments(true)
      setFetchCommentsError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useCommentOperations] Fetching ticket comments:', ticketId)

      /* Call API */
      const response = await communicationsService.getTicketCommunications(ticketId)

      /* Handle success */
      if (response.success && response.data) {
        setTicketComments(response.data.communications)
        setLastFetchedTicketId(ticketId)
        console.log('[useCommentOperations] Successfully fetched ticket comments:', ticketId)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to fetch ticket comments'
        console.error('[useCommentOperations] Fetch failed:', errorMsg)
        setFetchCommentsError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to fetch ticket comments'
      console.error('[useCommentOperations] Fetch error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Fetch Ticket Comments'
      })

      setFetchCommentsError(errorMsg)
      return false

    } finally {
      setIsFetchingComments(false)
    }
  }, [])

  /* Refetch ticket comments using last fetched ticket ID */
  const refetchTicketComments = useCallback(async (): Promise<boolean> => {
    if (!lastFetchedTicketId) {
      console.warn('[useCommentOperations] Cannot refetch: No ticket ID stored')
      return false
    }

    console.log('[useCommentOperations] Refetching comments for ticket:', lastFetchedTicketId)
    return fetchTicketComments(lastFetchedTicketId)
  }, [lastFetchedTicketId, fetchTicketComments])

  /* Add new comment to ticket */
  const addTicketComment = useCallback(async (ticketId: string, data: CreateTicketCommentFormSchema): Promise<boolean> => {
    try {
      setIsAddingComment(true)
      setAddCommentError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useCommentOperations] Adding ticket comment:', ticketId, data)

      /* Call API */
      const response = await communicationsService.createTicketCommunication(ticketId, data)

      /* Handle success */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Comment Added Successfully',
          description: response.message || 'Your comment has been successfully added to the ticket.'
        })

        console.log('[useCommentOperations] Successfully added comment:', response.data?.communication_id)

        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to add comment'
        console.error('[useCommentOperations] Add comment failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Failed to Add Comment',
          description: errorMsg
        })

        setAddCommentError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to add comment'
      console.error('[useCommentOperations] Add comment error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Add Comment'
      })

      setAddCommentError(errorMsg)
      return false

    } finally {
      setIsAddingComment(false)
    }
  }, [])

  /* Download ticket comment attachment */
  const downloadTicketCommentAttachment = useCallback(async (attachmentId: number, filename: string): Promise<boolean> => {
    try {
      setIsDownloadingAttachment(true)
      setDownloadAttachmentError(null)

      console.log('[useCommentOperations] Downloading attachment:', attachmentId)

      /* Call API */
      const response = await attachmentsService.downloadAttachment(String(attachmentId))

      /* Handle success */
      if (response.success && response.data) {
        console.log('[useCommentOperations] Successfully downloaded attachment:', attachmentId)

        /* Get base64 file content from response */
        const base64Data = response.data.file_content
        const mimeType = response.data.mime_type || 'application/octet-stream'
        const downloadFilename = response.data.filename || filename

        /* Remove base64 prefix if present (e.g., "data:image/png;base64,") */
        const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data

        /* Convert base64 to blob */
        const byteCharacters = atob(base64Content)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType })

        /* Create download link and trigger download */
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = downloadFilename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Attachment Downloaded',
          description: `File "${downloadFilename}" has been successfully downloaded.`
        })

        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to download attachment'
        console.error('[useCommentOperations] Download failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Download Failed',
          description: errorMsg
        })

        setDownloadAttachmentError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to download attachment'
      console.error('[useCommentOperations] Download error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Download Attachment'
      })

      setDownloadAttachmentError(errorMsg)
      return false

    } finally {
      setIsDownloadingAttachment(false)
    }
  }, [])

  return {
    /* Ticket comments data */
    ticketComments,
    isFetchingComments,
    fetchCommentsError,
    fetchTicketComments,
    refetchTicketComments,

    /* Add comment data */
    isAddingComment,
    addCommentError,
    addTicketComment,

    /* Download attachment data */
    isDownloadingAttachment,
    downloadAttachmentError,
    downloadTicketCommentAttachment,
  }
}
