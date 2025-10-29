/* Comprehensive test suite for useSlaOperations hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'
import * as sharedConfig from '@shared/config'

/* Plan module imports */
import { useSlaOperations } from '@plan-management/hooks/use-sla-operations'
import { slaService } from '@plan-management/api'
import { CreateSlaApiRequest, SupportSLA } from '@plan-management/types'

/* Mock dependencies */
vi.mock('@plan-management/api', () => ({
  slaService: {
    getAllSLAs: vi.fn(),
    createSLA: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/config', async () => {
  const actual = await vi.importActual('@shared/config')
  return {
    ...actual,
    LOADING_DELAY_ENABLED: false,
    LOADING_DELAY: 0
  }
})

describe('useSlaOperations Hook', () => {
  /* Mock data */
  const mockSlas: SupportSLA[] = [
    {
      id: 1,
      name: 'Standard Support',
      support_channel: 'Email',
      response_time_hours: 24,
      availability_schedule: 'Business hours',
      notes: 'Standard business support',
      display_order: 1
    },
    {
      id: 2,
      name: 'Premium Support',
      support_channel: 'Phone, Email',
      response_time_hours: 4,
      availability_schedule: '24/7',
      notes: 'Round the clock support',
      display_order: 2
    }
  ]

  const mockSlaData: CreateSlaApiRequest = {
    name: 'Enterprise Support',
    support_channel: 'Phone, Email, Chat',
    response_time_hours: 1,
    availability_schedule: '24/7',
    notes: 'Enterprise level support'
  }

  /* Mock service functions */
  const mockGetAllSlas = vi.mocked(slaService.getAllSLAs)
  const mockCreateSla = vi.mocked(slaService.createSLA)
  const mockHandleApiError = vi.mocked(sharedUtils.handleApiError)
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
      const { result } = renderHook(() => useSlaOperations())

      expect(result.current.isFetching).toBe(false)
      expect(result.current.fetchError).toBe(null)
      expect(result.current.isCreating).toBe(false)
      expect(result.current.createError).toBe(null)
    })

    it('should have all required functions', () => {
      const { result } = renderHook(() => useSlaOperations())

      expect(typeof result.current.fetchSlas).toBe('function')
      expect(typeof result.current.createSla).toBe('function')
    })
  })

  describe('fetchSlas Function', () => {
    it('should fetch SLAs successfully', async () => {
      mockGetAllSlas.mockResolvedValue({
        success: true,
        data: mockSlas,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockSlas.length
      })

      const { result } = renderHook(() => useSlaOperations())

      const slas = await result.current.fetchSlas()

      await waitFor(() => {
        expect(slas).toEqual(mockSlas)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.fetchError).toBe(null)
      })

      expect(mockGetAllSlas).toHaveBeenCalledTimes(1)
    })

    it('should set loading state during fetch', async () => {
      mockGetAllSlas.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockSlas,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z',
          count: mockSlas.length
        }), 50))
      )

      const { result } = renderHook(() => useSlaOperations())

      const promise = result.current.fetchSlas()

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
    })

    it('should handle fetch API error', async () => {
      mockGetAllSlas.mockResolvedValue({
        success: false,
        message: 'Failed to load SLAs',
        error: 'Database error',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useSlaOperations())

      const slas = await result.current.fetchSlas()

      await waitFor(() => {
        expect(slas).toBe(null)
        expect(result.current.fetchError).toBe('Database error')
      })
    })

    it('should handle fetch network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetAllSlas.mockRejectedValue(mockError)

      const { result } = renderHook(() => useSlaOperations())

      const slas = await result.current.fetchSlas()

      await waitFor(() => {
        expect(slas).toBe(null)
        expect(result.current.fetchError).toBe('Failed to fetch SLAs')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Fetch SLAs'
        })
      })
    })

    it('should clear previous fetch errors on new fetch', async () => {
      mockGetAllSlas.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useSlaOperations())

      await result.current.fetchSlas()

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Error 1')
      })

      mockGetAllSlas.mockResolvedValue({
        success: true,
        data: mockSlas,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockSlas.length
      })

      await result.current.fetchSlas()

      await waitFor(() => {
        expect(result.current.fetchError).toBe(null)
      })
    })

    it('should handle missing data in response', async () => {
      mockGetAllSlas.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useSlaOperations())

      const slas = await result.current.fetchSlas()

      await waitFor(() => {
        expect(slas).toBe(null)
      })
    })

    it('should handle empty SLAs array', async () => {
      mockGetAllSlas.mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useSlaOperations())

      const slas = await result.current.fetchSlas()

      await waitFor(() => {
        expect(slas).toEqual([])
      })
    })

    it('should handle missing error in failure response', async () => {
      mockGetAllSlas.mockResolvedValue({
        success: false,
        message: 'Failed to fetch',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useSlaOperations())

      await result.current.fetchSlas()

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Failed to fetch')
      })
    })
  })

  describe('createSla Function', () => {
    it('should create SLA successfully', async () => {
      mockCreateSla.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'Enterprise Support', status: true },
        message: 'SLA created successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useSlaOperations())

      const success = await result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isCreating).toBe(false)
        expect(result.current.createError).toBe(null)
      })

      expect(mockCreateSla).toHaveBeenCalledWith(mockSlaData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'SLA Created Successfully',
        description: 'SLA created successfully'
      })
    })

    it('should set loading state during creation', async () => {
      mockCreateSla.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { id: 3, name: 'Enterprise Support', status: true },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useSlaOperations())

      const promise = result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })

    it('should handle create API error', async () => {
      mockCreateSla.mockResolvedValue({
        success: false,
        message: 'SLA name already exists',
        error: 'Duplicate SLA name',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useSlaOperations())

      const success = await result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Duplicate SLA name')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Creation Failed',
        description: 'Duplicate SLA name'
      })
    })

    it('should handle create network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockCreateSla.mockRejectedValue(mockError)

      const { result } = renderHook(() => useSlaOperations())

      const success = await result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Failed to create SLA')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Create SLA'
        })
      })
    })

    it('should clear previous create errors on new creation', async () => {
      mockCreateSla.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z',
      })

      const { result } = renderHook(() => useSlaOperations())

      await result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Error 1')
      })

      mockCreateSla.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'Enterprise Support', status: true },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(result.current.createError).toBe(null)
      })
    })

    it('should handle missing message in success response', async () => {
      mockCreateSla.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'Enterprise Support', status: true },
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useSlaOperations())

      await result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'SLA Created Successfully',
          description: 'The SLA has been successfully created.'
        })
      })
    })

    it('should handle missing error in failure response', async () => {
      mockCreateSla.mockResolvedValue({
        success: false,
        message: 'Failed to create',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useSlaOperations())

      await result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Failed to create')
      })
    })
  })

  describe('State Independence', () => {
    it('should maintain independent state for fetch and create operations', async () => {
      mockGetAllSlas.mockResolvedValue({
        success: false,
        message: 'Fetch error',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })
      mockCreateSla.mockResolvedValue({
        success: false,
        message: 'Create error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useSlaOperations())

      await result.current.fetchSlas()
      await result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Fetch error')
        expect(result.current.createError).toBe('Create error')
      })
    })

    it('should not interfere with other operations when one is in progress', async () => {
      mockCreateSla.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { id: 3, name: 'Enterprise Support', status: true },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 200))
      )

      mockGetAllSlas.mockResolvedValue({
        success: true,
        data: mockSlas,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockSlas.length
      })

      const { result } = renderHook(() => useSlaOperations())

      const createPromise = result.current.createSla(mockSlaData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await result.current.fetchSlas()

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })

      /* Create should still be in progress */
      expect(result.current.isCreating).toBe(true)

      await createPromise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })
  })
})
