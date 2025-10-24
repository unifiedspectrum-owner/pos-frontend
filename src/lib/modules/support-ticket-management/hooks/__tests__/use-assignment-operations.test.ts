/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'

/* Support ticket module imports */
import { useAssignmentOperations } from '@support-ticket-management/hooks'
import { assignmentsService } from '@support-ticket-management/api'
import { AssignTicketFormSchema } from '@support-ticket-management/schemas'
import { GetCurrentTicketAssignmentApiResponse, AssignTicketToUserApiResponse } from '@support-ticket-management/types'

/* Mock dependencies */
vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@support-ticket-management/api', () => ({
  assignmentsService: {
    getCurrentAssignment: vi.fn(),
    assignTicketToUser: vi.fn()
  }
}))

vi.mock('@shared/config', () => ({
  LOADING_DELAY_ENABLED: false,
  LOADING_DELAY: 0
}))

describe('useAssignmentOperations', () => {
  const mockGetCurrentAssignment = vi.mocked(assignmentsService.getCurrentAssignment)
  const mockAssignTicketToUser = vi.mocked(assignmentsService.assignTicketToUser)
  const mockHandleApiError = vi.mocked(handleApiError)
  const mockCreateToastNotification = vi.mocked(createToastNotification)

  /* Console spies */
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  const mockAssignmentData: GetCurrentTicketAssignmentApiResponse['data'] = {
    ticket_id: 'TKT-2024-001',
    assignment_id: 'ASSIGN-001',
    assigned_to_user_id: '123',
    assigned_to_user_name: 'John Doe',
    assigned_to_role_id: '456',
    assigned_to_role_name: 'Support Agent',
    assigned_at: '2024-01-01T10:00:00Z'
  }

  const mockAssignFormData: AssignTicketFormSchema = {
    user_id: '123',
    reason: 'Assigning to support team'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Hook Initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAssignmentOperations())

      expect(result.current.currentAssignment).toBeNull()
      expect(result.current.isFetchingAssignment).toBe(false)
      expect(result.current.fetchAssignmentError).toBeNull()
      expect(result.current.isAssigning).toBe(false)
      expect(result.current.assignError).toBeNull()
    })

    it('should be defined', () => {
      const { result } = renderHook(() => useAssignmentOperations())
      expect(result.current).toBeDefined()
    })

    it('should return an object', () => {
      const { result } = renderHook(() => useAssignmentOperations())
      expect(typeof result.current).toBe('object')
    })

    it('should have all required properties', () => {
      const { result } = renderHook(() => useAssignmentOperations())

      expect(result.current).toHaveProperty('currentAssignment')
      expect(result.current).toHaveProperty('isFetchingAssignment')
      expect(result.current).toHaveProperty('fetchAssignmentError')
      expect(result.current).toHaveProperty('fetchCurrentAssignment')
      expect(result.current).toHaveProperty('isAssigning')
      expect(result.current).toHaveProperty('assignError')
      expect(result.current).toHaveProperty('assignTicketToUser')
    })

    it('should have correct property types', () => {
      const { result } = renderHook(() => useAssignmentOperations())

      expect(result.current.currentAssignment).toBeNull()
      expect(typeof result.current.isFetchingAssignment).toBe('boolean')
      expect(result.current.fetchAssignmentError).toBeNull()
      expect(typeof result.current.fetchCurrentAssignment).toBe('function')
      expect(typeof result.current.isAssigning).toBe('boolean')
      expect(result.current.assignError).toBeNull()
      expect(typeof result.current.assignTicketToUser).toBe('function')
    })

    it('should initialize with null assignment', () => {
      const { result } = renderHook(() => useAssignmentOperations())
      expect(result.current.currentAssignment).toBeNull()
    })

    it('should initialize with no loading states', () => {
      const { result } = renderHook(() => useAssignmentOperations())
      expect(result.current.isFetchingAssignment).toBe(false)
      expect(result.current.isAssigning).toBe(false)
    })

    it('should initialize with no errors', () => {
      const { result } = renderHook(() => useAssignmentOperations())
      expect(result.current.fetchAssignmentError).toBeNull()
      expect(result.current.assignError).toBeNull()
    })

    it('should not be undefined', () => {
      const { result } = renderHook(() => useAssignmentOperations())
      expect(result.current).not.toBeUndefined()
    })

    it('should not be null', () => {
      const { result } = renderHook(() => useAssignmentOperations())
      expect(result.current).not.toBeNull()
    })

    it('should have stable function references', () => {
      const { result, rerender } = renderHook(() => useAssignmentOperations())
      const firstFetch = result.current.fetchCurrentAssignment
      const firstAssign = result.current.assignTicketToUser

      rerender()

      expect(result.current.fetchCurrentAssignment).toBe(firstFetch)
      expect(result.current.assignTicketToUser).toBe(firstAssign)
    })
  })

  describe('fetchCurrentAssignment', () => {
    describe('Success Cases', () => {
      it('should fetch current assignment successfully', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(success).toBe(true)
          expect(result.current.currentAssignment).toEqual(mockAssignmentData)
          expect(result.current.fetchAssignmentError).toBeNull()
        })
      })

      it('should set loading state while fetching', async () => {
        mockGetCurrentAssignment.mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve({
            success: true,
            message: 'Success',
            data: mockAssignmentData
          }), 100))
        )

        const { result } = renderHook(() => useAssignmentOperations())
        const promise = result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.isFetchingAssignment).toBe(true)
        })

        await promise

        await waitFor(() => {
          expect(result.current.isFetchingAssignment).toBe(false)
        })
      })

      it('should clear error on successful fetch', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.fetchAssignmentError).toBeNull()
        })
      })

      it('should update currentAssignment state', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.currentAssignment).toEqual(mockAssignmentData)
        })
      })

      it('should call API with correct ticket ID', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        expect(mockGetCurrentAssignment).toHaveBeenCalledWith('TKT-2024-001')
      })

      it('should return true on success', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(success).toBe(true)
        })
      })

      it('should handle assignment with all fields populated', async () => {
        const fullAssignment: GetCurrentTicketAssignmentApiResponse['data'] = {
          ticket_id: 'TKT-2024-002',
          assignment_id: 'ASSIGN-002',
          assigned_to_user_id: '789',
          assigned_to_user_name: 'Jane Smith',
          assigned_to_role_id: '101',
          assigned_to_role_name: 'Senior Agent',
          assigned_at: '2024-01-02T15:30:00Z'
        }

        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: fullAssignment
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-002')

        await waitFor(() => {
          expect(result.current.currentAssignment).toEqual(fullAssignment)
        })
      })

      it('should handle assignment with null fields', async () => {
        const unassignedData: GetCurrentTicketAssignmentApiResponse['data'] = {
          ticket_id: 'TKT-2024-003',
          assignment_id: 'ASSIGN-003',
          assigned_to_user_id: null,
          assigned_to_user_name: null,
          assigned_to_role_id: null,
          assigned_to_role_name: null,
          assigned_at: null
        }

        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: unassignedData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-003')

        await waitFor(() => {
          expect(result.current.currentAssignment).toEqual(unassignedData)
        })
      })

      it('should log success message', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.isFetchingAssignment).toBe(false)
          expect(consoleSpy).toHaveBeenCalledWith(
            '[useAssignmentOperations] Successfully fetched assignment:',
            'TKT-2024-001'
          )
        })
      })

      it('should maintain state after successful fetch', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.currentAssignment).toEqual(mockAssignmentData)
          expect(result.current.isFetchingAssignment).toBe(false)
          expect(result.current.fetchAssignmentError).toBeNull()
        })
      })
    })

    describe('Error Cases', () => {
      it('should handle API error response', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: false,
          message: 'Failed to fetch assignment',
          data: mockAssignmentData,
          error: 'Assignment not found'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchAssignmentError).toBe('Assignment not found')
        })
      })

      it('should handle API exception', async () => {
        const error = new AxiosError('Network error')
        mockGetCurrentAssignment.mockRejectedValue(error)

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchAssignmentError).toBe('Failed to fetch assignment')
        })

        expect(mockHandleApiError).toHaveBeenCalledWith(error, {
          title: 'Failed to Fetch Assignment'
        })
      })

      it('should set error state on failure', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: false,
          message: 'Error',
          data: mockAssignmentData,
          error: 'Assignment not found'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.fetchAssignmentError).toBe('Assignment not found')
        })
      })

      it('should return false on error', async () => {
        mockGetCurrentAssignment.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        expect(success).toBe(false)
      })

      it('should clear loading state on error', async () => {
        mockGetCurrentAssignment.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.isFetchingAssignment).toBe(false)
        })
      })

      it('should handle error without response data', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: false,
          message: 'Failed',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchAssignmentError).toBe('Failed')
        })
      })

      it('should use default error message when none provided', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: false,
          message: '',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.fetchAssignmentError).toBe('Failed to fetch assignment')
        })
      })

      it('should log error message', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: false,
          message: 'Error',
          data: mockAssignmentData,
          error: 'Assignment not found'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.fetchAssignmentError).toBe('Assignment not found')
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[useAssignmentOperations] Fetch failed:',
            'Assignment not found'
          )
        })
      })

      it('should handle network timeout', async () => {
        const timeoutError = new AxiosError('timeout of 5000ms exceeded')
        mockGetCurrentAssignment.mockRejectedValue(timeoutError)

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        expect(success).toBe(false)
        expect(mockHandleApiError).toHaveBeenCalled()
      })

      it('should handle 404 not found', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: false,
          message: 'Not found',
          data: mockAssignmentData,
          error: 'Ticket not found'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-9999')

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchAssignmentError).toBe('Ticket not found')
        })
      })

      it('should handle 500 server error', async () => {
        const serverError = new AxiosError('Internal Server Error')
        mockGetCurrentAssignment.mockRejectedValue(serverError)

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchAssignmentError).toBe('Failed to fetch assignment')
        })
      })
    })

    describe('Loading State', () => {
      it('should set loading to true when fetching starts', async () => {
        mockGetCurrentAssignment.mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve({
            success: true,
            message: 'Success',
            data: mockAssignmentData
          }), 100))
        )

        const { result } = renderHook(() => useAssignmentOperations())
        const promise = result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.isFetchingAssignment).toBe(true)
        })

        await promise
      })

      it('should set loading to false when fetching completes', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        expect(result.current.isFetchingAssignment).toBe(false)
      })

      it('should set loading to false when fetch fails', async () => {
        mockGetCurrentAssignment.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        expect(result.current.isFetchingAssignment).toBe(false)
      })

      it('should clear previous error on new fetch', async () => {
        /* First call fails */
        mockGetCurrentAssignment.mockResolvedValueOnce({
          success: false,
          message: 'Error',
          data: mockAssignmentData,
          error: 'Assignment not found'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.fetchAssignmentError).toBe('Assignment not found')
        })

        /* Second call succeeds */
        mockGetCurrentAssignment.mockResolvedValueOnce({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(result.current.fetchAssignmentError).toBeNull()
        })
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty ticket ID', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('')

        expect(mockGetCurrentAssignment).toHaveBeenCalledWith('')
      })

      it('should handle special characters in ticket ID', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment('TKT-2024-001-A/B')

        expect(mockGetCurrentAssignment).toHaveBeenCalledWith('TKT-2024-001-A/B')
      })

      it('should handle rapid consecutive calls', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())

        const promise1 = result.current.fetchCurrentAssignment('TKT-001')
        const promise2 = result.current.fetchCurrentAssignment('TKT-002')
        const promise3 = result.current.fetchCurrentAssignment('TKT-003')

        const results = await Promise.all([promise1, promise2, promise3])

        expect(results).toEqual([true, true, true])
        expect(mockGetCurrentAssignment).toHaveBeenCalledTimes(3)
      })

      it('should handle very long ticket ID', async () => {
        const longTicketId = 'TKT-' + 'A'.repeat(1000)
        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.fetchCurrentAssignment(longTicketId)

        expect(mockGetCurrentAssignment).toHaveBeenCalledWith(longTicketId)
      })

      it('should handle assignment data with unexpected structure', async () => {
        const unexpectedData = {
          ...mockAssignmentData,
          extra_field: 'unexpected'
        }

        mockGetCurrentAssignment.mockResolvedValue({
          success: true,
          message: 'Success',
          data: unexpectedData
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        await waitFor(() => {
          expect(success).toBe(true)
          expect(result.current.currentAssignment).toEqual(unexpectedData)
        })
      })

      it('should handle missing data in success response', async () => {
        mockGetCurrentAssignment.mockResolvedValue({
          success: false,
          message: 'No assignment data available',
          data: {
            ticket_id: '',
            assignment_id: '',
            assigned_to_user_id: null,
            assigned_to_user_name: null,
            assigned_to_role_id: null,
            assigned_to_role_name: null,
            assigned_at: null
          }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.fetchCurrentAssignment('TKT-2024-001')

        expect(success).toBe(false)
      })
    })
  })

  describe('assignTicketToUser', () => {
    describe('Success Cases', () => {
      it('should assign ticket successfully', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Ticket assigned successfully',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(success).toBe(true)
        expect(result.current.assignError).toBeNull()
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Ticket Assigned Successfully',
          description: 'Ticket assigned successfully'
        })
      })

      it('should set loading state while assigning', async () => {
        mockAssignTicketToUser.mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve({
            success: true,
            message: 'Success',
            data: { ticket_id: 'TKT-2024-001' }
          }), 100))
        )

        const { result } = renderHook(() => useAssignmentOperations())
        const promise = result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.isAssigning).toBe(true)
        })

        await promise

        await waitFor(() => {
          expect(result.current.isAssigning).toBe(false)
        })
      })

      it('should call API with correct parameters', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(mockAssignTicketToUser).toHaveBeenCalledWith('TKT-2024-001', mockAssignFormData)
      })

      it('should clear error on successful assignment', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(result.current.assignError).toBeNull()
      })

      it('should return true on success', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(success).toBe(true)
      })

      it('should show success toast notification', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Assignment completed',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Ticket Assigned Successfully',
          description: 'Assignment completed'
        })
      })

      it('should use default success message when none provided', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: '',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Ticket Assigned Successfully',
          description: 'The ticket has been successfully assigned to the user.'
        })
      })

      it('should log success message', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.isAssigning).toBe(false)
          expect(consoleSpy).toHaveBeenCalledWith(
            '[useAssignmentOperations] Successfully assigned ticket:',
            'TKT-2024-001'
          )
        })
      })

      it('should handle assignment without optional fields', async () => {
        const dataMinimal: AssignTicketFormSchema = {
          user_id: '123',
          reason: 'Basic assignment'
        }

        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', dataMinimal)

        expect(success).toBe(true)
        expect(mockAssignTicketToUser).toHaveBeenCalledWith('TKT-2024-001', dataMinimal)
      })

      it('should maintain state after successful assignment', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(result.current.isAssigning).toBe(false)
        expect(result.current.assignError).toBeNull()
      })
    })

    describe('Error Cases', () => {
      it('should handle API error response', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: false,
          message: 'Assignment failed',
          data: { ticket_id: '' },
          error: 'User not found'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.assignError).toBe('User not found')
        })

        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'error',
          title: 'Assignment Failed',
          description: 'User not found'
        })
      })

      it('should handle API exception', async () => {
        const error = new AxiosError('Network error')
        mockAssignTicketToUser.mockRejectedValue(error)

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.assignError).toBe('Failed to assign ticket')
        })

        expect(mockHandleApiError).toHaveBeenCalledWith(error, {
          title: 'Failed to Assign Ticket'
        })
      })

      it('should set error state on failure', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: false,
          message: 'Failed',
          data: { ticket_id: '' },
          error: 'Invalid user ID'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.assignError).toBe('Invalid user ID')
        })
      })

      it('should return false on error', async () => {
        mockAssignTicketToUser.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(success).toBe(false)
      })

      it('should clear loading state on error', async () => {
        mockAssignTicketToUser.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.isAssigning).toBe(false)
        })
      })

      it('should show error toast notification', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: false,
          message: 'Assignment failed',
          data: { ticket_id: '' },
          error: 'Permission denied'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'error',
          title: 'Assignment Failed',
          description: 'Permission denied'
        })
      })

      it('should use default error message when none provided', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: false,
          message: '',
          data: { ticket_id: '' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.assignError).toBe('Failed to assign ticket')
        })
      })

      it('should log error message', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: false,
          message: 'Failed',
          data: { ticket_id: '' },
          error: 'User not found'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.assignError).toBe('User not found')
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[useAssignmentOperations] Assignment failed:',
            'User not found'
          )
        })
      })

      it('should handle network timeout', async () => {
        const timeoutError = new AxiosError('timeout of 5000ms exceeded')
        mockAssignTicketToUser.mockRejectedValue(timeoutError)

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(success).toBe(false)
        expect(mockHandleApiError).toHaveBeenCalled()
      })

      it('should handle 403 permission denied', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: false,
          message: 'Permission denied',
          data: { ticket_id: '' },
          error: 'Insufficient permissions'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.assignError).toBe('Insufficient permissions')
        })
      })

      it('should handle 500 server error', async () => {
        const serverError = new AxiosError('Internal Server Error')
        mockAssignTicketToUser.mockRejectedValue(serverError)

        const { result } = renderHook(() => useAssignmentOperations())
        const success = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.assignError).toBe('Failed to assign ticket')
        })
      })
    })

    describe('Loading State', () => {
      it('should set loading to true when assignment starts', async () => {
        mockAssignTicketToUser.mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve({
            success: true,
            message: 'Success',
            data: { ticket_id: 'TKT-2024-001' }
          }), 100))
        )

        const { result } = renderHook(() => useAssignmentOperations())
        const promise = result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.isAssigning).toBe(true)
        })

        await promise
      })

      it('should set loading to false when assignment completes', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(result.current.isAssigning).toBe(false)
      })

      it('should set loading to false when assignment fails', async () => {
        mockAssignTicketToUser.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        expect(result.current.isAssigning).toBe(false)
      })

      it('should clear previous error on new assignment', async () => {
        /* First call fails */
        mockAssignTicketToUser.mockResolvedValueOnce({
          success: false,
          message: 'Failed',
          data: { ticket_id: '' },
          error: 'User not found'
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.assignError).toBe('User not found')
        })

        /* Second call succeeds */
        mockAssignTicketToUser.mockResolvedValueOnce({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

        await waitFor(() => {
          expect(result.current.assignError).toBeNull()
        })
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty ticket ID', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: '' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('', mockAssignFormData)

        expect(mockAssignTicketToUser).toHaveBeenCalledWith('', mockAssignFormData)
      })

      it('should handle special characters in ticket ID', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001-A/B' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001-A/B', mockAssignFormData)

        expect(mockAssignTicketToUser).toHaveBeenCalledWith('TKT-2024-001-A/B', mockAssignFormData)
      })

      it('should handle empty user ID', async () => {
        const dataWithEmptyId: AssignTicketFormSchema = {
          user_id: '',
          reason: 'Test assignment'
        }

        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', dataWithEmptyId)

        expect(mockAssignTicketToUser).toHaveBeenCalledWith('TKT-2024-001', dataWithEmptyId)
      })

      it('should handle special characters in user ID', async () => {
        const dataWithSpecialId: AssignTicketFormSchema = {
          user_id: 'user-123',
          reason: 'Test assignment'
        }

        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', dataWithSpecialId)

        expect(mockAssignTicketToUser).toHaveBeenCalledWith('TKT-2024-001', dataWithSpecialId)
      })

      it('should handle very long reason', async () => {
        const dataWithLongReason: AssignTicketFormSchema = {
          user_id: '123',
          reason: 'A'.repeat(10000)
        }

        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', dataWithLongReason)

        expect(mockAssignTicketToUser).toHaveBeenCalledWith('TKT-2024-001', dataWithLongReason)
      })

      it('should handle rapid consecutive assignments', async () => {
        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())

        const promise1 = result.current.assignTicketToUser('TKT-001', mockAssignFormData)
        const promise2 = result.current.assignTicketToUser('TKT-002', mockAssignFormData)
        const promise3 = result.current.assignTicketToUser('TKT-003', mockAssignFormData)

        const results = await Promise.all([promise1, promise2, promise3])

        expect(results).toEqual([true, true, true])
        expect(mockAssignTicketToUser).toHaveBeenCalledTimes(3)
      })

      it('should handle minimum reason length', async () => {
        const dataWithMinReason: AssignTicketFormSchema = {
          user_id: '123',
          reason: 'Short'
        }

        mockAssignTicketToUser.mockResolvedValue({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        })

        const { result } = renderHook(() => useAssignmentOperations())
        await result.current.assignTicketToUser('TKT-2024-001', dataWithMinReason)

        expect(mockAssignTicketToUser).toHaveBeenCalledWith('TKT-2024-001', dataWithMinReason)
      })
    })
  })

  describe('State Independence', () => {
    it('should maintain separate loading states for fetch and assign', async () => {
      mockGetCurrentAssignment.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        }), 100))
      )

      mockAssignTicketToUser.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { ticket_id: 'TKT-2024-001' }
      })

      const { result } = renderHook(() => useAssignmentOperations())

      const fetchPromise = result.current.fetchCurrentAssignment('TKT-2024-001')

      await waitFor(() => {
        expect(result.current.isFetchingAssignment).toBe(true)
        expect(result.current.isAssigning).toBe(false)
      })

      await fetchPromise

      await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

      await waitFor(() => {
        expect(result.current.isFetchingAssignment).toBe(false)
        expect(result.current.isAssigning).toBe(false)
      })
    })

    it('should maintain separate error states for fetch and assign', async () => {
      /* Fetch fails */
      mockGetCurrentAssignment.mockResolvedValue({
        success: false,
        message: 'Failed',
        data: mockAssignmentData,
        error: 'Fetch error'
      })

      const { result } = renderHook(() => useAssignmentOperations())
      await result.current.fetchCurrentAssignment('TKT-2024-001')

      await waitFor(() => {
        expect(result.current.fetchAssignmentError).toBe('Fetch error')
        expect(result.current.assignError).toBeNull()
      })

      /* Assign fails */
      mockAssignTicketToUser.mockResolvedValue({
        success: false,
        message: 'Failed',
        data: { ticket_id: '' },
        error: 'Assign error'
      })

      await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

      await waitFor(() => {
        expect(result.current.fetchAssignmentError).toBe('Fetch error')
        expect(result.current.assignError).toBe('Assign error')
      })
    })

    it('should allow concurrent fetch and assign operations', async () => {
      mockGetCurrentAssignment.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          data: mockAssignmentData
        }), 50))
      )

      mockAssignTicketToUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          data: { ticket_id: 'TKT-2024-001' }
        }), 50))
      )

      const { result } = renderHook(() => useAssignmentOperations())

      const fetchPromise = result.current.fetchCurrentAssignment('TKT-2024-001')
      const assignPromise = result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

      const [fetchSuccess, assignSuccess] = await Promise.all([fetchPromise, assignPromise])

      expect(fetchSuccess).toBe(true)
      expect(assignSuccess).toBe(true)
    })
  })

  describe('Function Stability', () => {
    it('should maintain stable function references across renders', () => {
      const { result, rerender } = renderHook(() => useAssignmentOperations())

      const firstFetch = result.current.fetchCurrentAssignment
      const firstAssign = result.current.assignTicketToUser

      rerender()

      expect(result.current.fetchCurrentAssignment).toBe(firstFetch)
      expect(result.current.assignTicketToUser).toBe(firstAssign)
    })

    it('should not recreate functions on state changes', async () => {
      mockGetCurrentAssignment.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockAssignmentData
      })

      const { result } = renderHook(() => useAssignmentOperations())

      const firstFetch = result.current.fetchCurrentAssignment
      const firstAssign = result.current.assignTicketToUser

      await result.current.fetchCurrentAssignment('TKT-2024-001')

      expect(result.current.fetchCurrentAssignment).toBe(firstFetch)
      expect(result.current.assignTicketToUser).toBe(firstAssign)
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete workflow: fetch then assign', async () => {
      mockGetCurrentAssignment.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockAssignmentData
      })

      mockAssignTicketToUser.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { ticket_id: 'TKT-2024-001' }
      })

      const { result } = renderHook(() => useAssignmentOperations())

      /* Fetch current assignment */
      const fetchSuccess = await result.current.fetchCurrentAssignment('TKT-2024-001')

      await waitFor(() => {
        expect(fetchSuccess).toBe(true)
        expect(result.current.currentAssignment).toEqual(mockAssignmentData)
      })

      /* Assign to new user */
      const assignSuccess = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)
      expect(assignSuccess).toBe(true)
    })

    it('should handle multiple assignments to different tickets', async () => {
      mockAssignTicketToUser.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { ticket_id: 'TKT-2024-001' }
      })

      const { result } = renderHook(() => useAssignmentOperations())

      const success1 = await result.current.assignTicketToUser('TKT-001', mockAssignFormData)
      const success2 = await result.current.assignTicketToUser('TKT-002', mockAssignFormData)
      const success3 = await result.current.assignTicketToUser('TKT-003', mockAssignFormData)

      expect(success1).toBe(true)
      expect(success2).toBe(true)
      expect(success3).toBe(true)
      expect(mockAssignTicketToUser).toHaveBeenCalledTimes(3)
    })

    it('should handle error recovery workflow', async () => {
      /* First attempt fails */
      mockAssignTicketToUser.mockResolvedValueOnce({
        success: false,
        message: 'Failed',
        data: { ticket_id: '' },
        error: 'User not available'
      })

      const { result } = renderHook(() => useAssignmentOperations())

      const firstAttempt = await result.current.assignTicketToUser('TKT-2024-001', mockAssignFormData)

      await waitFor(() => {
        expect(firstAttempt).toBe(false)
        expect(result.current.assignError).toBe('User not available')
      })

      /* Retry succeeds */
      mockAssignTicketToUser.mockResolvedValueOnce({
        success: true,
        message: 'Success',
        data: { ticket_id: 'TKT-2024-001' }
      })

      const secondAttempt = await result.current.assignTicketToUser('TKT-2024-001', {
        user_id: '456',
        reason: 'Reassigning to different user'
      })

      await waitFor(() => {
        expect(secondAttempt).toBe(true)
        expect(result.current.assignError).toBeNull()
      })
    })
  })
})
