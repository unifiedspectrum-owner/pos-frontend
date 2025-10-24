/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as apiUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'

/* Support ticket module imports */
import { useTicketOperations } from '@support-ticket-management/hooks/use-ticket-operations'
import { ticketsService } from '@support-ticket-management/api'
import { SupportTicketDetails } from '@support-ticket-management/types'
import { CreateTicketFormSchema, UpdateTicketFormSchema, UpdateTicketStatusFormSchema } from '@support-ticket-management/schemas'

/* Mock dependencies */
vi.mock('@support-ticket-management/api', () => ({
  ticketsService: {
    getSupportTicketDetails: vi.fn(),
    createSupportTicket: vi.fn(),
    updateSupportTicket: vi.fn(),
    deleteSupportTicket: vi.fn(),
    updateTicketStatus: vi.fn()
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

describe('useTicketOperations Hook', () => {
  /* Mock data */
  const mockTicketDetails: SupportTicketDetails = {
    id: 1,
    ticket_id: 'TKT-2024-001',
    tenant_id: 'tenant-123',
    requester_user_id: 1,
    requester_email: 'user@example.com',
    requester_name: 'John Doe',
    requester_phone: '+11234567890',
    category_id: 1,
    subject: 'Unable to login',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    resolution_due: null,
    first_response_at: null,
    resolved_at: null,
    closed_at: null,
    escalated_at: null,
    escalated_by: null,
    escalation_reason: null,
    satisfaction_rating: null,
    satisfaction_feedback: null,
    satisfaction_submitted_at: null,
    internal_notes: null,
    is_active: true,
    updated_at: null,
    is_overdue: false,
    category_details: null,
    assignment_details: null
  }

  const mockCreateData: CreateTicketFormSchema = {
    tenant_id: 'tenant-123',
    requester_email: 'user@example.com',
    requester_name: 'John Doe',
    category_id: '1',
    subject: 'Test ticket',
    message_content: 'This is a test ticket message',
    requester_user_id: '1',
    requester_phone: '+11234567890',
    resolution_due: null,
    internal_notes: null,
    attachments: null
  }

  const mockUpdateData: UpdateTicketFormSchema = {
    subject: 'Updated subject',
    message_content: 'Updated message'
  }

  const mockStatusUpdateData: UpdateTicketStatusFormSchema = {
    status: 'resolved',
    status_reason: 'Issue has been fixed'
  }

  /* Mock service functions */
  const mockGetSupportTicketDetails = vi.mocked(ticketsService.getSupportTicketDetails)
  const mockCreateSupportTicket = vi.mocked(ticketsService.createSupportTicket)
  const mockUpdateSupportTicket = vi.mocked(ticketsService.updateSupportTicket)
  const mockDeleteSupportTicket = vi.mocked(ticketsService.deleteSupportTicket)
  const mockUpdateTicketStatus = vi.mocked(ticketsService.updateTicketStatus)
  const mockHandleApiError = vi.mocked(apiUtils.handleApiError)
  const mockCreateToastNotification = vi.mocked(notificationUtils.createToastNotification)

  beforeEach(() => {
    vi.clearAllMocks()
    /* Suppress console logs */
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTicketOperations())

      expect(result.current.ticketDetails).toBe(null)
      expect(result.current.isFetching).toBe(false)
      expect(result.current.isCreating).toBe(false)
      expect(result.current.isUpdating).toBe(false)
      expect(result.current.isDeleting).toBe(false)
      expect(result.current.isUpdatingStatus).toBe(false)
      expect(result.current.fetchError).toBe(null)
      expect(result.current.createError).toBe(null)
      expect(result.current.updateError).toBe(null)
      expect(result.current.deleteError).toBe(null)
      expect(result.current.updateStatusError).toBe(null)
    })

    it('should provide all operation functions', () => {
      const { result } = renderHook(() => useTicketOperations())

      expect(typeof result.current.fetchTicketDetails).toBe('function')
      expect(typeof result.current.createTicket).toBe('function')
      expect(typeof result.current.updateSupportTicket).toBe('function')
      expect(typeof result.current.deleteTicket).toBe('function')
      expect(typeof result.current.updateTicketStatus).toBe('function')
    })
  })

  describe('fetchTicketDetails Function', () => {
    it('should fetch ticket details successfully', async () => {
      mockGetSupportTicketDetails.mockResolvedValue({
        success: true,
        data: { ticket: mockTicketDetails },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.fetchTicketDetails('1')

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.ticketDetails).toEqual(mockTicketDetails)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.fetchError).toBe(null)
      })
      expect(mockGetSupportTicketDetails).toHaveBeenCalledWith('1')
    })

    it('should set loading state during fetch', async () => {
      mockGetSupportTicketDetails.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { ticket: mockTicketDetails },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 100))
      )

      const { result } = renderHook(() => useTicketOperations())

      const promise = result.current.fetchTicketDetails('1')

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
    })

    it('should handle API error response', async () => {
      mockGetSupportTicketDetails.mockResolvedValue({
        success: false,
        message: 'Ticket not found',
        error: 'Ticket does not exist',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.fetchTicketDetails('999')

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.fetchError).toBe('Ticket does not exist')
        expect(result.current.ticketDetails).toBe(null)
      })
    })

    it('should handle network error', async () => {
      const mockError = new AxiosError('Network Error')
      mockGetSupportTicketDetails.mockRejectedValue(mockError)

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.fetchTicketDetails('1')

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.fetchError).toBe('Failed to fetch ticket details')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        mockError,
        { title: 'Failed to Fetch Ticket Details' }
      )
    })

    it('should clear error on successful fetch', async () => {
      mockGetSupportTicketDetails
        .mockResolvedValueOnce({
          success: false,
          message: 'Error',
          error: 'Fetch failed',
          timestamp: '2024-01-01T00:00:00Z'
        })
        .mockResolvedValueOnce({
          success: true,
          data: { ticket: mockTicketDetails },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        })

      const { result } = renderHook(() => useTicketOperations())

      await result.current.fetchTicketDetails('1')
      await waitFor(() => {
        expect(result.current.fetchError).toBe('Fetch failed')
      })

      await result.current.fetchTicketDetails('1')
      await waitFor(() => {
        expect(result.current.fetchError).toBe(null)
      })
    })
  })

  describe('createTicket Function', () => {
    it('should create ticket successfully', async () => {
      mockCreateSupportTicket.mockResolvedValue({
        success: true,
        data: { ticketId: 1 },
        message: 'Ticket created successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.createTicket(mockCreateData)

      expect(success).toBe(true)
      expect(result.current.isCreating).toBe(false)
      expect(result.current.createError).toBe(null)
      expect(mockCreateSupportTicket).toHaveBeenCalledWith(mockCreateData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Ticket Created Successfully',
        description: 'Ticket created successfully'
      })
    })

    it('should set loading state during creation', async () => {
      mockCreateSupportTicket.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { ticketId: 1 },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 100))
      )

      const { result } = renderHook(() => useTicketOperations())

      const promise = result.current.createTicket(mockCreateData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })

    it('should handle creation failure', async () => {
      mockCreateSupportTicket.mockResolvedValue({
        success: false,
        message: 'Creation failed',
        error: 'Invalid data',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.createTicket(mockCreateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Invalid data')
      })
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Creation Failed',
        description: 'Invalid data'
      })
    })

    it('should handle network error during creation', async () => {
      const mockError = new AxiosError('Network Error')
      mockCreateSupportTicket.mockRejectedValue(mockError)

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.createTicket(mockCreateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Failed to create ticket')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        mockError,
        { title: 'Failed to Create Ticket' }
      )
    })
  })

  describe('updateSupportTicket Function', () => {
    it('should update ticket successfully', async () => {
      mockUpdateSupportTicket.mockResolvedValue({
        success: true,
        data: { ticketId: 1 },
        message: 'Ticket updated successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.updateSupportTicket('1', mockUpdateData)

      expect(success).toBe(true)
      expect(result.current.isUpdating).toBe(false)
      expect(result.current.updateError).toBe(null)
      expect(mockUpdateSupportTicket).toHaveBeenCalledWith('1', mockUpdateData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Ticket Updated Successfully',
        description: 'Ticket updated successfully'
      })
    })

    it('should set loading state during update', async () => {
      mockUpdateSupportTicket.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { ticketId: 1 },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 100))
      )

      const { result } = renderHook(() => useTicketOperations())

      const promise = result.current.updateSupportTicket('1', mockUpdateData)

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })
    })

    it('should handle update failure', async () => {
      mockUpdateSupportTicket.mockResolvedValue({
        success: false,
        message: 'Update failed',
        error: 'Validation error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.updateSupportTicket('1', mockUpdateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateError).toBe('Validation error')
      })
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Update Failed',
        description: 'Validation error'
      })
    })

    it('should handle network error during update', async () => {
      const mockError = new AxiosError('Network Error')
      mockUpdateSupportTicket.mockRejectedValue(mockError)

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.updateSupportTicket('1', mockUpdateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateError).toBe('Failed to update ticket')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        mockError,
        { title: 'Failed to Update Ticket' }
      )
    })
  })

  describe('deleteTicket Function', () => {
    it('should delete ticket successfully', async () => {
      mockDeleteSupportTicket.mockResolvedValue({
        success: true,
        data: { ticketId: 1 },
        message: 'Ticket deleted successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.deleteTicket('1')

      expect(success).toBe(true)
      expect(result.current.isDeleting).toBe(false)
      expect(result.current.deleteError).toBe(null)
      expect(mockDeleteSupportTicket).toHaveBeenCalledWith('1')
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Ticket Deleted Successfully',
        description: 'Ticket deleted successfully'
      })
    })

    it('should set loading state during deletion', async () => {
      mockDeleteSupportTicket.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { ticketId: 1 },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 100))
      )

      const { result } = renderHook(() => useTicketOperations())

      const promise = result.current.deleteTicket('1')

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })
    })

    it('should handle deletion failure', async () => {
      mockDeleteSupportTicket.mockResolvedValue({
        success: false,
        message: 'Deletion failed',
        error: 'Ticket has dependencies',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.deleteTicket('1')

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.deleteError).toBe('Ticket has dependencies')
      })
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Deletion Failed',
        description: 'Ticket has dependencies'
      })
    })

    it('should handle network error during deletion', async () => {
      const mockError = new AxiosError('Network Error')
      mockDeleteSupportTicket.mockRejectedValue(mockError)

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.deleteTicket('1')

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.deleteError).toBe('Failed to delete ticket')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        mockError,
        { title: 'Failed to Delete Ticket' }
      )
    })
  })

  describe('updateTicketStatus Function', () => {
    it('should update ticket status successfully', async () => {
      mockUpdateTicketStatus.mockResolvedValue({
        success: true,
        data: { ticket_id: 'TKT-2024-001', status: 'resolved' },
        message: 'Status updated successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.updateTicketStatus('1', mockStatusUpdateData)

      expect(success).toBe(true)
      expect(result.current.isUpdatingStatus).toBe(false)
      expect(result.current.updateStatusError).toBe(null)
      expect(mockUpdateTicketStatus).toHaveBeenCalledWith('1', mockStatusUpdateData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Status Updated Successfully',
        description: 'Status updated successfully'
      })
    })

    it('should set loading state during status update', async () => {
      mockUpdateTicketStatus.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { ticket_id: 'TKT-2024-001', status: 'resolved' },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 100))
      )

      const { result } = renderHook(() => useTicketOperations())

      const promise = result.current.updateTicketStatus('1', mockStatusUpdateData)

      await waitFor(() => {
        expect(result.current.isUpdatingStatus).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isUpdatingStatus).toBe(false)
      })
    })

    it('should handle status update failure', async () => {
      mockUpdateTicketStatus.mockResolvedValue({
        success: false,
        data: { ticket_id: '', status: '' },
        message: 'Update failed',
        error: 'Invalid status transition',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.updateTicketStatus('1', mockStatusUpdateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateStatusError).toBe('Invalid status transition')
      })
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Status Update Failed',
        description: 'Invalid status transition'
      })
    })

    it('should handle network error during status update', async () => {
      const mockError = new AxiosError('Network Error')
      mockUpdateTicketStatus.mockRejectedValue(mockError)

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.updateTicketStatus('1', mockStatusUpdateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateStatusError).toBe('Failed to update ticket status')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        mockError,
        { title: 'Failed to Update Ticket Status' }
      )
    })
  })

  describe('Error State Management', () => {
    it('should maintain separate error states for each operation', async () => {
      mockGetSupportTicketDetails.mockResolvedValue({
        success: false,
        message: 'Fetch error',
        error: 'Fetch error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      mockCreateSupportTicket.mockResolvedValue({
        success: false,
        message: 'Create error',
        error: 'Create error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      mockUpdateSupportTicket.mockResolvedValue({
        success: false,
        message: 'Update error',
        error: 'Update error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      mockDeleteSupportTicket.mockResolvedValue({
        success: false,
        message: 'Delete error',
        error: 'Delete error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      mockUpdateTicketStatus.mockResolvedValue({
        success: false,
        data: { ticket_id: '', status: '' },
        message: 'Status error',
        error: 'Status error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      await result.current.fetchTicketDetails('1')
      await result.current.createTicket(mockCreateData)
      await result.current.updateSupportTicket('1', mockUpdateData)
      await result.current.deleteTicket('1')
      await result.current.updateTicketStatus('1', mockStatusUpdateData)

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Fetch error')
        expect(result.current.createError).toBe('Create error')
        expect(result.current.updateError).toBe('Update error')
        expect(result.current.deleteError).toBe('Delete error')
        expect(result.current.updateStatusError).toBe('Status error')
      })
    })

    it('should clear errors on successful operations', async () => {
      /* First attempt - failure */
      mockCreateSupportTicket.mockResolvedValueOnce({
        success: false,
        message: 'Error',
        error: 'Creation failed',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      await result.current.createTicket(mockCreateData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Creation failed')
      })

      /* Second attempt - success */
      mockCreateSupportTicket.mockResolvedValueOnce({
        success: true,
        data: { ticketId: 1 },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.createTicket(mockCreateData)

      await waitFor(() => {
        expect(result.current.createError).toBe(null)
      })
    })
  })

  describe('Loading State Management', () => {
    it('should maintain separate loading states for each operation', async () => {
      mockGetSupportTicketDetails.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { ticket: mockTicketDetails },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 100))
      )

      mockCreateSupportTicket.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { ticketId: 1 },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 150))
      )

      const { result } = renderHook(() => useTicketOperations())

      const fetchPromise = result.current.fetchTicketDetails('1')
      const createPromise = result.current.createTicket(mockCreateData)

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
        expect(result.current.isCreating).toBe(true)
      })

      await Promise.all([fetchPromise, createPromise])

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isCreating).toBe(false)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing error message in response', async () => {
      mockCreateSupportTicket.mockResolvedValue({
        success: false,
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.createTicket(mockCreateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Failed to create ticket')
      })
    })

    it('should handle response without data property', async () => {
      mockGetSupportTicketDetails.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      const success = await result.current.fetchTicketDetails('1')

      await waitFor(() => {
        expect(success).toBe(false)
      })
    })

    it('should handle concurrent operations', async () => {
      mockCreateSupportTicket.mockResolvedValue({
        success: true,
        data: { ticketId: 1 },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useTicketOperations())

      /* Trigger multiple creates */
      const promises = [
        result.current.createTicket(mockCreateData),
        result.current.createTicket(mockCreateData),
        result.current.createTicket(mockCreateData)
      ]

      const results = await Promise.all(promises)

      expect(results.every(r => r === true)).toBe(true)
      expect(mockCreateSupportTicket).toHaveBeenCalledTimes(3)
    })
  })
})
