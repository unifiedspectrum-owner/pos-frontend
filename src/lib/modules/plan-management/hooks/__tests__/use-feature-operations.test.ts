/* Comprehensive test suite for useFeatureOperations hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'
import * as sharedConfig from '@shared/config'

/* Plan module imports */
import { useFeatureOperations } from '@plan-management/hooks/use-feature-operations'
import { featureService } from '@plan-management/api'
import { CreateFeatureApiRequest, Feature } from '@plan-management/types'

/* Mock dependencies */
vi.mock('@plan-management/api', () => ({
  featureService: {
    getAllFeatures: vi.fn(),
    createFeature: vi.fn()
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

describe('useFeatureOperations Hook', () => {
  /* Mock data */
  const mockFeatures: Feature[] = [
    {
      id: 1,
      name: 'Multi-user Access',
      description: 'Support for multiple users',
      display_order: 1
    },
    {
      id: 2,
      name: 'Advanced Reporting',
      description: 'Advanced analytics and reporting',
      display_order: 2
    }
  ]

  const mockFeatureData: CreateFeatureApiRequest = {
    name: 'API Access',
    description: 'RESTful API access'
  }

  /* Mock service functions */
  const mockGetAllFeatures = vi.mocked(featureService.getAllFeatures)
  const mockCreateFeature = vi.mocked(featureService.createFeature)
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
      const { result } = renderHook(() => useFeatureOperations())

      expect(result.current.isFetching).toBe(false)
      expect(result.current.fetchError).toBe(null)
      expect(result.current.isCreating).toBe(false)
      expect(result.current.createError).toBe(null)
    })

    it('should have all required functions', () => {
      const { result } = renderHook(() => useFeatureOperations())

      expect(typeof result.current.fetchFeatures).toBe('function')
      expect(typeof result.current.createFeature).toBe('function')
    })
  })

  describe('fetchFeatures Function', () => {
    it('should fetch features successfully', async () => {
      mockGetAllFeatures.mockResolvedValue({
        success: true,
        data: mockFeatures,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockFeatures.length
      })

      const { result } = renderHook(() => useFeatureOperations())

      const features = await result.current.fetchFeatures()

      await waitFor(() => {
        expect(features).toEqual(mockFeatures)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.fetchError).toBe(null)
      })

      expect(mockGetAllFeatures).toHaveBeenCalledTimes(1)
    })

    it('should set loading state during fetch', async () => {
      mockGetAllFeatures.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockFeatures,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z',
          count: mockFeatures.length
        }), 50))
      )

      const { result } = renderHook(() => useFeatureOperations())

      const promise = result.current.fetchFeatures()

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
    })

    it('should handle fetch API error', async () => {
      mockGetAllFeatures.mockResolvedValue({
        success: false,
        message: 'Failed to load features',
        error: 'Database error',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useFeatureOperations())

      const features = await result.current.fetchFeatures()

      await waitFor(() => {
        expect(features).toBe(null)
        expect(result.current.fetchError).toBe('Database error')
      })
    })

    it('should handle fetch network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetAllFeatures.mockRejectedValue(mockError)

      const { result } = renderHook(() => useFeatureOperations())

      const features = await result.current.fetchFeatures()

      await waitFor(() => {
        expect(features).toBe(null)
        expect(result.current.fetchError).toBe('Failed to fetch features')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Fetch Features'
        })
      })
    })

    it('should clear previous fetch errors on new fetch', async () => {
      mockGetAllFeatures.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useFeatureOperations())

      await result.current.fetchFeatures()

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Error 1')
      })

      mockGetAllFeatures.mockResolvedValue({
        success: true,
        data: mockFeatures,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockFeatures.length
      })

      await result.current.fetchFeatures()

      await waitFor(() => {
        expect(result.current.fetchError).toBe(null)
      })
    })

    it('should handle missing data in response', async () => {
      mockGetAllFeatures.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useFeatureOperations())

      const features = await result.current.fetchFeatures()

      await waitFor(() => {
        expect(features).toBe(null)
      })
    })

    it('should handle empty features array', async () => {
      mockGetAllFeatures.mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useFeatureOperations())

      const features = await result.current.fetchFeatures()

      await waitFor(() => {
        expect(features).toEqual([])
      })
    })

    it('should handle missing error in failure response', async () => {
      mockGetAllFeatures.mockResolvedValue({
        success: false,
        message: 'Failed to fetch',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useFeatureOperations())

      await result.current.fetchFeatures()

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Failed to fetch')
      })
    })
  })

  describe('createFeature Function', () => {
    it('should create feature successfully', async () => {
      mockCreateFeature.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'API Access', status: true },
        message: 'Feature created successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useFeatureOperations())

      const success = await result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isCreating).toBe(false)
        expect(result.current.createError).toBe(null)
      })

      expect(mockCreateFeature).toHaveBeenCalledWith(mockFeatureData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Feature Created Successfully',
        description: 'Feature created successfully'
      })
    })

    it('should set loading state during creation', async () => {
      mockCreateFeature.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { id: 3, name: 'API Access', status: true },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useFeatureOperations())

      const promise = result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })

    it('should handle create API error', async () => {
      mockCreateFeature.mockResolvedValue({
        success: false,
        message: 'Feature name already exists',
        error: 'Duplicate feature name',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useFeatureOperations())

      const success = await result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Duplicate feature name')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Creation Failed',
        description: 'Duplicate feature name'
      })
    })

    it('should handle create network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockCreateFeature.mockRejectedValue(mockError)

      const { result } = renderHook(() => useFeatureOperations())

      const success = await result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Failed to create feature')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Create Feature'
        })
      })
    })

    it('should clear previous create errors on new creation', async () => {
      mockCreateFeature.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z',
      })

      const { result } = renderHook(() => useFeatureOperations())

      await result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Error 1')
      })

      mockCreateFeature.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'API Access', status: true },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(result.current.createError).toBe(null)
      })
    })

    it('should handle missing message in success response', async () => {
      mockCreateFeature.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'API Access', status: true },
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useFeatureOperations())

      await result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Feature Created Successfully',
          description: 'The feature has been successfully created.'
        })
      })
    })

    it('should handle missing error in failure response', async () => {
      mockCreateFeature.mockResolvedValue({
        success: false,
        message: 'Failed to create',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useFeatureOperations())

      await result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Failed to create')
      })
    })
  })

  describe('State Independence', () => {
    it('should maintain independent state for fetch and create operations', async () => {
      mockGetAllFeatures.mockResolvedValue({
        success: false,
        message: 'Fetch error',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })
      mockCreateFeature.mockResolvedValue({
        success: false,
        message: 'Create error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useFeatureOperations())

      await result.current.fetchFeatures()
      await result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Fetch error')
        expect(result.current.createError).toBe('Create error')
      })
    })

    it('should not interfere with other operations when one is in progress', async () => {
      mockCreateFeature.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { id: 3, name: 'API Access', status: true },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 200))
      )

      mockGetAllFeatures.mockResolvedValue({
        success: true,
        data: mockFeatures,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockFeatures.length
      })

      const { result } = renderHook(() => useFeatureOperations())

      const createPromise = result.current.createFeature(mockFeatureData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await result.current.fetchFeatures()

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
