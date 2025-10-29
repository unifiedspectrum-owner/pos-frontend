/* Comprehensive test suite for useAddonOperations hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'
import * as sharedConfig from '@shared/config'

/* Plan module imports */
import { useAddonOperations } from '@plan-management/hooks/use-addon-operations'
import { addonService } from '@plan-management/api'
import { CreateAddonApiRequest, Addon } from '@plan-management/types'

/* Mock dependencies */
vi.mock('@plan-management/api', () => ({
  addonService: {
    getAllAddOns: vi.fn(),
    createAddOn: vi.fn()
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

describe('useAddonOperations Hook', () => {
  /* Mock data */
  const mockAddons: Addon[] = [
    {
      id: 1,
      name: 'Extra Storage',
      description: '100GB additional storage',
      addon_price: 10.00,
      pricing_scope: 'organization',
      default_quantity: null,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 1
    },
    {
      id: 2,
      name: 'Priority Support',
      description: '24/7 priority support',
      addon_price: 50.00,
      pricing_scope: 'branch',
      default_quantity: null,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 2
    }
  ]

  const mockAddonData: CreateAddonApiRequest = {
    name: 'Advanced Analytics',
    description: 'Advanced analytics dashboard',
    base_price: 25.00,
    pricing_scope: 'organization'
  }

  /* Mock service functions */
  const mockGetAllAddons = vi.mocked(addonService.getAllAddOns)
  const mockCreateAddon = vi.mocked(addonService.createAddOn)
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
      const { result } = renderHook(() => useAddonOperations())

      expect(result.current.isFetching).toBe(false)
      expect(result.current.fetchError).toBe(null)
      expect(result.current.isCreating).toBe(false)
      expect(result.current.createError).toBe(null)
    })

    it('should have all required functions', () => {
      const { result } = renderHook(() => useAddonOperations())

      expect(typeof result.current.fetchAddons).toBe('function')
      expect(typeof result.current.createAddon).toBe('function')
    })
  })

  describe('fetchAddons Function', () => {
    it('should fetch addons successfully', async () => {
      mockGetAllAddons.mockResolvedValue({
        success: true,
        data: mockAddons,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockAddons.length
      })

      const { result } = renderHook(() => useAddonOperations())

      const addons = await result.current.fetchAddons()

      await waitFor(() => {
        expect(addons).toEqual(mockAddons)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.fetchError).toBe(null)
      })

      expect(mockGetAllAddons).toHaveBeenCalledTimes(1)
    })

    it('should set loading state during fetch', async () => {
      mockGetAllAddons.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockAddons,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z',
          count: mockAddons.length
        }), 50))
      )

      const { result } = renderHook(() => useAddonOperations())

      const promise = result.current.fetchAddons()

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
    })

    it('should handle fetch API error', async () => {
      mockGetAllAddons.mockResolvedValue({
        success: false,
        message: 'Failed to load addons',
        error: 'Database error',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useAddonOperations())

      const addons = await result.current.fetchAddons()

      await waitFor(() => {
        expect(addons).toBe(null)
        expect(result.current.fetchError).toBe('Database error')
      })
    })

    it('should handle fetch network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetAllAddons.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAddonOperations())

      const addons = await result.current.fetchAddons()

      await waitFor(() => {
        expect(addons).toBe(null)
        expect(result.current.fetchError).toBe('Failed to fetch add-ons')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Fetch Add-ons'
        })
      })
    })

    it('should clear previous fetch errors on new fetch', async () => {
      mockGetAllAddons.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useAddonOperations())

      await result.current.fetchAddons()

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Error 1')
      })

      mockGetAllAddons.mockResolvedValue({
        success: true,
        data: mockAddons,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockAddons.length
      })

      await result.current.fetchAddons()

      await waitFor(() => {
        expect(result.current.fetchError).toBe(null)
      })
    })

    it('should handle missing data in response', async () => {
      mockGetAllAddons.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useAddonOperations())

      const addons = await result.current.fetchAddons()

      await waitFor(() => {
        expect(addons).toBe(null)
      })
    })

    it('should handle empty addons array', async () => {
      mockGetAllAddons.mockResolvedValue({
        success: true,
        data: [],
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useAddonOperations())

      const addons = await result.current.fetchAddons()

      await waitFor(() => {
        expect(addons).toEqual([])
      })
    })

    it('should handle missing error in failure response', async () => {
      mockGetAllAddons.mockResolvedValue({
        success: false,
        message: 'Failed to fetch',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })

      const { result } = renderHook(() => useAddonOperations())

      await result.current.fetchAddons()

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Failed to fetch')
      })
    })
  })

  describe('createAddon Function', () => {
    it('should create addon successfully', async () => {
      mockCreateAddon.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'Advanced Analytics', status: true },
        message: 'Add-on created successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useAddonOperations())

      const success = await result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isCreating).toBe(false)
        expect(result.current.createError).toBe(null)
      })

      expect(mockCreateAddon).toHaveBeenCalledWith(mockAddonData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Add-on Created Successfully',
        description: 'Add-on created successfully'
      })
    })

    it('should set loading state during creation', async () => {
      mockCreateAddon.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { id: 3, name: 'Advanced Analytics', status: true },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useAddonOperations())

      const promise = result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })

    it('should handle create API error', async () => {
      mockCreateAddon.mockResolvedValue({
        success: false,
        message: 'Addon name already exists',
        error: 'Duplicate addon name',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useAddonOperations())

      const success = await result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Duplicate addon name')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Creation Failed',
        description: 'Duplicate addon name'
      })
    })

    it('should handle create network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockCreateAddon.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAddonOperations())

      const success = await result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Failed to create add-on')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Create Add-on'
        })
      })
    })

    it('should clear previous create errors on new creation', async () => {
      mockCreateAddon.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useAddonOperations())

      await result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Error 1')
      })

      mockCreateAddon.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'Advanced Analytics', status: true },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(result.current.createError).toBe(null)
      })
    })

    it('should handle missing message in success response', async () => {
      mockCreateAddon.mockResolvedValue({
        success: true,
        data: { id: 3, name: 'Advanced Analytics', status: true },
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useAddonOperations())

      await result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Add-on Created Successfully',
          description: 'The add-on has been successfully created.'
        })
      })
    })

    it('should handle missing error in failure response', async () => {
      mockCreateAddon.mockResolvedValue({
        success: false,
        message: 'Failed to create',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useAddonOperations())

      await result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Failed to create')
      })
    })
  })

  describe('State Independence', () => {
    it('should maintain independent state for fetch and create operations', async () => {
      mockGetAllAddons.mockResolvedValue({
        success: false,
        message: 'Fetch error',
        timestamp: '2024-01-01T00:00:00Z',
        count: 0
      })
      mockCreateAddon.mockResolvedValue({
        success: false,
        message: 'Create error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useAddonOperations())

      await result.current.fetchAddons()
      await result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Fetch error')
        expect(result.current.createError).toBe('Create error')
      })
    })

    it('should not interfere with other operations when one is in progress', async () => {
      mockCreateAddon.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { id: 3, name: 'Advanced Analytics', status: true },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 200))
      )

      mockGetAllAddons.mockResolvedValue({
        success: true,
        data: mockAddons,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z',
        count: mockAddons.length
      })

      const { result } = renderHook(() => useAddonOperations())

      const createPromise = result.current.createAddon(mockAddonData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await result.current.fetchAddons()

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
