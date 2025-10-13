/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Support ticket module imports */
import { ticketsService } from '@support-ticket-management/api'
import { SupportTicketDetails } from '@support-ticket-management/types'
import { CreateTicketFormSchema } from '@support-ticket-management/schemas'

/* Hook interface */
interface UseTicketOperationsReturn {
  fetchTicketDetails: (ticketId: string) => Promise<boolean>
  createTicket: (data: CreateTicketFormSchema) => Promise<boolean>
  ticketDetails: SupportTicketDetails | null
  isFetching: boolean
  isCreating: boolean
  fetchError: string | null
  createError: string | null
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
        console.log('[useTicketOperations] Successfully created ticket:', response.data?.ticketId)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to create ticket'
        console.error('[useTicketOperations] Creation failed:', errorMsg)
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
  }
}
