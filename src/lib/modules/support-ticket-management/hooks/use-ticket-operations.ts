/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Support ticket module imports */
import { ticketsService } from '@support-ticket-management/api'
import { SupportTicketDetails } from '@support-ticket-management/types'
import { CreateTicketFormSchema, UpdateTicketFormSchema, UpdateTicketStatusFormSchema } from '@support-ticket-management/schemas'

/* Hook interface */
interface UseTicketOperationsReturn {
  fetchTicketDetails: (ticketId: string) => Promise<boolean>
  createTicket: (data: CreateTicketFormSchema) => Promise<boolean>
  updateSupportTicket: (ticketId: string, data: UpdateTicketFormSchema) => Promise<boolean>
  deleteTicket: (ticketId: string) => Promise<boolean>
  updateTicketStatus: (ticketId: string, data: UpdateTicketStatusFormSchema) => Promise<boolean>
  ticketDetails: SupportTicketDetails | null
  isFetching: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isUpdatingStatus: boolean
  fetchError: string | null
  createError: string | null
  updateError: string | null
  deleteError: string | null
  updateStatusError: string | null
}

/* Custom hook for support ticket operations */
export const useTicketOperations = (): UseTicketOperationsReturn => {
  /* Fetch ticket details state */
  const [ticketDetails, setTicketDetails] = useState<SupportTicketDetails | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  /* Create ticket state */
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)

  /* Update ticket state */
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  /* Delete ticket state */
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  /* Update ticket status state */
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)
  const [updateStatusError, setUpdateStatusError] = useState<string | null>(null)

  /* Fetch ticket details by ID */
  const fetchTicketDetails = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      setIsFetching(true)
      setFetchError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTicketOperations] Fetching ticket details:', ticketId)

      /* Call API */
      const response = await ticketsService.getSupportTicketDetails(ticketId)

      /* Handle success */
      if (response.success && response.data) {
        setTicketDetails(response.data.ticket)
        console.log('[useTicketOperations] Successfully fetched ticket details:', ticketId)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to fetch ticket details'
        console.error('[useTicketOperations] Fetch failed:', errorMsg)
        setFetchError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to fetch ticket details'
      console.error('[useTicketOperations] Fetch error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Fetch Ticket Details'
      })

      setFetchError(errorMsg)
      return false

    } finally {
      setIsFetching(false)
    }
  }, [])

  /* Create new support ticket */
  const createTicket = useCallback(async (data: CreateTicketFormSchema): Promise<boolean> => {
    try {
      setIsCreating(true)
      setCreateError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTicketOperations] Creating ticket:', data)

      /* Call API */
      const response = await ticketsService.createSupportTicket(data)

      /* Handle success */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Ticket Created Successfully',
          description: response.message || 'The support ticket has been successfully created.'
        })

        console.log('[useTicketOperations] Successfully created ticket:', response.data?.ticketId)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to create ticket'
        console.error('[useTicketOperations] Creation failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Creation Failed',
          description: errorMsg
        })

        setCreateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to create ticket'
      console.error('[useTicketOperations] Creation error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Create Ticket'
      })

      setCreateError(errorMsg)
      return false

    } finally {
      setIsCreating(false)
    }
  }, [])

  /* Update support ticket */
  const updateSupportTicket = useCallback(async (ticketId: string, data: UpdateTicketFormSchema): Promise<boolean> => {
    try {
      setIsUpdating(true)
      setUpdateError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTicketOperations] Updating ticket:', ticketId, data)

      /* Call API */
      const response = await ticketsService.updateSupportTicket(ticketId, data)

      /* Handle success */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Ticket Updated Successfully',
          description: response.message || 'The support ticket has been successfully updated.'
        })

        console.log('[useTicketOperations] Successfully updated ticket:', ticketId)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to update ticket'
        console.error('[useTicketOperations] Update failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Update Failed',
          description: errorMsg
        })

        setUpdateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to update ticket'
      console.error('[useTicketOperations] Update error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Update Ticket'
      })

      setUpdateError(errorMsg)
      return false

    } finally {
      setIsUpdating(false)
    }
  }, [])

  /* Delete support ticket */
  const deleteTicket = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      setIsDeleting(true)
      setDeleteError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTicketOperations] Deleting ticket:', ticketId)

      /* Call API */
      const response = await ticketsService.deleteSupportTicket(ticketId)

      /* Handle success */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Ticket Deleted Successfully',
          description: response.message || 'The support ticket has been successfully deleted.'
        })

        console.log('[useTicketOperations] Successfully deleted ticket:', ticketId)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to delete ticket'
        console.error('[useTicketOperations] Deletion failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Deletion Failed',
          description: errorMsg
        })

        setDeleteError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to delete ticket'
      console.error('[useTicketOperations] Deletion error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Delete Ticket'
      })

      setDeleteError(errorMsg)
      return false

    } finally {
      setIsDeleting(false)
    }
  }, [])

  /* Update ticket status */
  const updateTicketStatus = useCallback(async (ticketId: string, data: UpdateTicketStatusFormSchema): Promise<boolean> => {
    try {
      setIsUpdatingStatus(true)
      setUpdateStatusError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTicketOperations] Updating ticket status:', ticketId, data)

      /* Call API */
      const response = await ticketsService.updateTicketStatus(ticketId, data)

      /* Handle success */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Status Updated Successfully',
          description: response.message || 'The ticket status has been successfully updated.'
        })

        console.log('[useTicketOperations] Successfully updated ticket status:', ticketId)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to update ticket status'
        console.error('[useTicketOperations] Status update failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Status Update Failed',
          description: errorMsg
        })

        setUpdateStatusError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to update ticket status'
      console.error('[useTicketOperations] Status update error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Update Ticket Status'
      })

      setUpdateStatusError(errorMsg)
      return false

    } finally {
      setIsUpdatingStatus(false)
    }
  }, [])

  return {
    /* Ticket details data */
    ticketDetails,
    isFetching,
    fetchError,
    fetchTicketDetails,

    /* Create ticket data */
    isCreating,
    createError,
    createTicket,

    /* Update ticket data */
    isUpdating,
    updateError,
    updateSupportTicket,

    /* Delete ticket data */
    isDeleting,
    deleteError,
    deleteTicket,

    /* Update ticket status data */
    isUpdatingStatus,
    updateStatusError,
    updateTicketStatus,
  }
}
