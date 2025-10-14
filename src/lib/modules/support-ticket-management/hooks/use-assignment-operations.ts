/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Support ticket module imports */
import { assignmentsService } from '@support-ticket-management/api'
import { AssignTicketFormSchema } from '@support-ticket-management/schemas'
import { GetCurrentTicketAssignmentApiResponse } from '@support-ticket-management/types'

/* Assignment data type */
type AssignmentData = GetCurrentTicketAssignmentApiResponse['data'] | null

/* Hook interface */
interface UseAssignmentOperationsReturn {
  fetchCurrentAssignment: (ticketId: string) => Promise<boolean>
  assignTicketToUser: (ticketId: string, data: AssignTicketFormSchema) => Promise<boolean>
  currentAssignment: AssignmentData
  isFetchingAssignment: boolean
  isAssigning: boolean
  fetchAssignmentError: string | null
  assignError: string | null
}

/* Custom hook for ticket assignment operations */
export const useAssignmentOperations = (): UseAssignmentOperationsReturn => {
  /* Fetch current assignment state */
  const [currentAssignment, setCurrentAssignment] = useState<AssignmentData>(null)
  const [isFetchingAssignment, setIsFetchingAssignment] = useState<boolean>(false)
  const [fetchAssignmentError, setFetchAssignmentError] = useState<string | null>(null)

  /* Assign ticket state */
  const [isAssigning, setIsAssigning] = useState<boolean>(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  /* Assign ticket to user */
  const assignTicketToUser = useCallback(async (ticketId: string, data: AssignTicketFormSchema): Promise<boolean> => {
    try {
      setIsAssigning(true)
      setAssignError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useAssignmentOperations] Assigning ticket:', ticketId, data)

      /* Call API */
      const response = await assignmentsService.assignTicketToUser(ticketId, data)

      /* Handle success */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Ticket Assigned Successfully',
          description: response.message || 'The ticket has been successfully assigned to the user.'
        })

        console.log('[useAssignmentOperations] Successfully assigned ticket:', response.data?.ticket_id)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to assign ticket'
        console.error('[useAssignmentOperations] Assignment failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Assignment Failed',
          description: errorMsg
        })

        setAssignError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to assign ticket'
      console.error('[useAssignmentOperations] Assignment error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Assign Ticket'
      })

      setAssignError(errorMsg)
      return false

    } finally {
      setIsAssigning(false)
    }
  }, [])

  /* Fetch current assignment for a ticket */
  const fetchCurrentAssignment = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      setIsFetchingAssignment(true)
      setFetchAssignmentError(null)

      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useAssignmentOperations] Fetching current assignment for ticket:', ticketId)

      /* Call API */
      const response = await assignmentsService.getCurrentAssignment(ticketId)

      /* Handle success */
      if (response.success && response.data) {
        setCurrentAssignment(response.data)
        console.log('[useAssignmentOperations] Successfully fetched assignment:', ticketId)
        return true
      } else {
        /* Handle API error response */
        const errorMsg = response.error || response.message || 'Failed to fetch assignment'
        console.error('[useAssignmentOperations] Fetch failed:', errorMsg)
        setFetchAssignmentError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      /* Handle exception */
      const errorMsg = 'Failed to fetch assignment'
      console.error('[useAssignmentOperations] Fetch error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Fetch Assignment'
      })

      setFetchAssignmentError(errorMsg)
      return false

    } finally {
      setIsFetchingAssignment(false)
    }
  }, [])

  return {
    /* Current assignment data */
    currentAssignment,
    isFetchingAssignment,
    fetchAssignmentError,
    fetchCurrentAssignment,

    /* Assign ticket data */
    isAssigning,
    assignError,
    assignTicketToUser,
  }
}
