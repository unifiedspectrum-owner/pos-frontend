/* Comprehensive test suite for useResourceManagement hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { z } from 'zod'

/* Plan module imports */
import { useResourceManagement, useResourceCreation } from '@plan-management/hooks/use-resource-management'
import * as useFeatureOperationsModule from '@plan-management/hooks/use-feature-operations'
import * as useAddonOperationsModule from '@plan-management/hooks/use-addon-operations'
import * as useSlaOperationsModule from '@plan-management/hooks/use-sla-operations'
import { Feature, Addon, SupportSLA } from '@plan-management/types'

/* Mock dependencies */
vi.mock('@plan-management/hooks/use-feature-operations')
vi.mock('@plan-management/hooks/use-addon-operations')
vi.mock('@plan-management/hooks/use-sla-operations')

describe('useResourceManagement Hook', () => {
  /* Mock data */
  const mockFeatures: Feature[] = [
    { id: 1, name: 'Feature A', description: 'Description A', display_order: 2 },
    { id: 2, name: 'Feature B', description: 'Description B', display_order: 1 },
    { id: 3, name: 'Feature C', description: 'Description C', display_order: 3 }
  ]

  const mockAddons: Addon[] = [
    {
      id: 1,
      name: 'Addon A',
      description: 'Description A',
      pricing_scope: 'organization',
      addon_price: 10.00,
      default_quantity: null,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 1
    },
    {
      id: 2,
      name: 'Addon B',
      description: 'Description B',
      pricing_scope: 'branch',
      addon_price: 15.00,
      default_quantity: null,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 2
    }
  ]

  const mockSlas: SupportSLA[] = [
    {
      id: 1,
      name: 'SLA A',
      support_channel: 'Email',
      response_time_hours: 24,
      availability_schedule: '24/7',
      notes: 'Standard email support',
      display_order: 1
    },
    {
      id: 2,
      name: 'SLA B',
      support_channel: 'Phone',
      response_time_hours: 4,
      availability_schedule: 'Business hours',
      notes: 'Priority phone support',
      display_order: 2
    }
  ]

  /* Mock operations */
  const mockFetchFeatures = vi.fn()
  const mockFetchAddons = vi.fn()
  const mockFetchSlas = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    /* Mock feature operations */
    vi.spyOn(useFeatureOperationsModule, 'useFeatureOperations').mockReturnValue({
      fetchFeatures: mockFetchFeatures,
      isFetching: false,
      fetchError: null,
      createFeature: vi.fn(),
      isCreating: false,
      createError: null
    })

    /* Mock addon operations */
    vi.spyOn(useAddonOperationsModule, 'useAddonOperations').mockReturnValue({
      fetchAddons: mockFetchAddons,
      isFetching: false,
      fetchError: null,
      createAddon: vi.fn(),
      isCreating: false,
      createError: null
    })

    /* Mock SLA operations */
    vi.spyOn(useSlaOperationsModule, 'useSlaOperations').mockReturnValue({
      fetchSlas: mockFetchSlas,
      isFetching: false,
      fetchError: null,
      createSla: vi.fn(),
      isCreating: false,
      createError: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      mockFetchFeatures.mockResolvedValue([])

      const { result } = renderHook(() => useResourceManagement('features', 'name', false))

      expect(result.current.resources).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('')
      expect(result.current.searchTerm).toBe('')
      expect(result.current.showSearch).toBe(false)
    })

    it('should have all required functions', () => {
      mockFetchFeatures.mockResolvedValue([])

      const { result } = renderHook(() => useResourceManagement('features', 'name', false))

      expect(typeof result.current.setSearchTerm).toBe('function')
      expect(typeof result.current.toggleSearch).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })
  })

  describe('Features Resource Type', () => {
    it('should load features on mount when shouldLoad is true', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(mockFetchFeatures).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(result.current.resources.length).toBe(3)
      })
    })

    it('should not load features when shouldLoad is false', () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      renderHook(() => useResourceManagement('features', 'name', false))

      expect(mockFetchFeatures).not.toHaveBeenCalled()
    })

    it('should sort features by name', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.resources[0].name).toBe('Feature A')
        expect(result.current.resources[1].name).toBe('Feature B')
        expect(result.current.resources[2].name).toBe('Feature C')
      })
    })

    it('should sort features by display_order', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'display_order', true))

      await waitFor(() => {
        expect(result.current.resources[0].display_order).toBe(1)
        expect(result.current.resources[1].display_order).toBe(2)
        expect(result.current.resources[2].display_order).toBe(3)
      })
    })
  })

  describe('Addons Resource Type', () => {
    it('should load addons on mount when shouldLoad is true', async () => {
      mockFetchAddons.mockResolvedValue(mockAddons)

      const { result } = renderHook(() => useResourceManagement('addons', 'name', true))

      await waitFor(() => {
        expect(mockFetchAddons).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(result.current.resources.length).toBe(2)
      })
    })

    it('should sort addons by display_order', async () => {
      mockFetchAddons.mockResolvedValue(mockAddons)

      const { result } = renderHook(() => useResourceManagement('addons', 'display_order', true))

      await waitFor(() => {
        expect(result.current.resources[0].display_order).toBe(1)
        expect(result.current.resources[1].display_order).toBe(2)
      })
    })
  })

  describe('SLAs Resource Type', () => {
    it('should load SLAs on mount when shouldLoad is true', async () => {
      mockFetchSlas.mockResolvedValue(mockSlas)

      const { result } = renderHook(() => useResourceManagement('slas', 'name', true))

      await waitFor(() => {
        expect(mockFetchSlas).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(result.current.resources.length).toBe(2)
      })
    })

    it('should sort SLAs by name', async () => {
      mockFetchSlas.mockResolvedValue(mockSlas)

      const { result } = renderHook(() => useResourceManagement('slas', 'name', true))

      await waitFor(() => {
        expect(result.current.resources[0].name).toBe('SLA A')
        expect(result.current.resources[1].name).toBe('SLA B')
      })
    })
  })

  describe('Loading State', () => {
    it('should sync loading state from operations hook', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      vi.spyOn(useFeatureOperationsModule, 'useFeatureOperations').mockReturnValue({
        fetchFeatures: mockFetchFeatures,
        isFetching: true,
        fetchError: null,
        createFeature: vi.fn(),
        isCreating: false,
        createError: null
      })

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      expect(result.current.loading).toBe(true)
    })

    it('should update loading state when fetch completes', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('should sync error state from operations hook', async () => {
      mockFetchFeatures.mockResolvedValue(null)

      vi.spyOn(useFeatureOperationsModule, 'useFeatureOperations').mockReturnValue({
        fetchFeatures: mockFetchFeatures,
        isFetching: false,
        fetchError: 'Failed to load features',
        createFeature: vi.fn(),
        isCreating: false,
        createError: null
      })

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load features')
      })
    })

    it('should handle null response from fetch', async () => {
      mockFetchFeatures.mockResolvedValue(null)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(mockFetchFeatures).toHaveBeenCalled()
      })

      expect(result.current.resources).toEqual([])
    })
  })

  describe('Search Functionality', () => {
    it('should filter resources by name', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.resources.length).toBe(3)
      })

      act(() => {
        result.current.setSearchTerm('Feature A')
      })

      expect(result.current.filteredResources.length).toBe(1)
      expect(result.current.filteredResources[0].name).toBe('Feature A')
    })

    it('should filter resources by description', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.resources.length).toBe(3)
      })

      act(() => {
        result.current.setSearchTerm('Description B')
      })

      expect(result.current.filteredResources.length).toBe(1)
      expect((result.current.filteredResources[0] as Feature).description).toBe('Description B')
    })

    it('should filter resources case-insensitively', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.resources.length).toBe(3)
      })

      act(() => {
        result.current.setSearchTerm('feature a')
      })

      expect(result.current.filteredResources.length).toBe(1)
      expect(result.current.filteredResources[0].name).toBe('Feature A')
    })

    it('should return all resources when search term is empty', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.resources.length).toBe(3)
      })

      act(() => {
        result.current.setSearchTerm('')
      })

      expect(result.current.filteredResources.length).toBe(3)
    })

    it('should filter SLAs by support_channel', async () => {
      mockFetchSlas.mockResolvedValue(mockSlas)

      const { result } = renderHook(() => useResourceManagement('slas', 'name', true))

      await waitFor(() => {
        expect(result.current.resources.length).toBe(2)
      })

      act(() => {
        result.current.setSearchTerm('Phone')
      })

      expect(result.current.filteredResources.length).toBe(1)
      expect((result.current.filteredResources[0] as SupportSLA).support_channel).toBe('Phone')
    })

    it('should filter SLAs by availability_schedule', async () => {
      mockFetchSlas.mockResolvedValue(mockSlas)

      const { result } = renderHook(() => useResourceManagement('slas', 'name', true))

      await waitFor(() => {
        expect(result.current.resources.length).toBe(2)
      })

      act(() => {
        result.current.setSearchTerm('24/7')
      })

      expect(result.current.filteredResources.length).toBe(1)
      expect((result.current.filteredResources[0] as SupportSLA).availability_schedule).toBe('24/7')
    })
  })

  describe('toggleSearch Function', () => {
    it('should toggle search visibility', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.resources.length).toBe(3)
      })

      expect(result.current.showSearch).toBe(false)

      act(() => {
        result.current.toggleSearch()
      })

      expect(result.current.showSearch).toBe(true)

      act(() => {
        result.current.toggleSearch()
      })

      expect(result.current.showSearch).toBe(false)
    })

    it('should clear search term when hiding search', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.resources.length).toBe(3)
      })

      act(() => {
        result.current.toggleSearch()
        result.current.setSearchTerm('test')
      })

      expect(result.current.searchTerm).toBe('test')

      act(() => {
        result.current.toggleSearch()
      })

      expect(result.current.searchTerm).toBe('')
    })
  })

  describe('refetch Function', () => {
    it('should trigger data reload', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(mockFetchFeatures).toHaveBeenCalledTimes(1)
      })

      await act(async () => {
        await result.current.refetch()
      })

      await waitFor(() => {
        expect(mockFetchFeatures).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty resources array', async () => {
      mockFetchFeatures.mockResolvedValue([])

      const { result } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(result.current.resources).toEqual([])
        expect(result.current.filteredResources).toEqual([])
      })
    })

    it('should not reload data if already loaded', async () => {
      mockFetchFeatures.mockResolvedValue(mockFeatures)

      const { result, rerender } = renderHook(() => useResourceManagement('features', 'name', true))

      await waitFor(() => {
        expect(mockFetchFeatures).toHaveBeenCalledTimes(1)
      })

      rerender()

      expect(mockFetchFeatures).toHaveBeenCalledTimes(1)
    })
  })
})

describe('useResourceCreation Hook', () => {
  /* Mock schema */
  const mockSchema = z.object({
    name: z.string(),
    description: z.string()
  })

  const mockDefaultValues = {
    name: '',
    description: ''
  }

  /* Mock operations */
  const mockCreateFeature = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(useFeatureOperationsModule, 'useFeatureOperations').mockReturnValue({
      fetchFeatures: vi.fn(),
      isFetching: false,
      fetchError: null,
      createFeature: mockCreateFeature,
      isCreating: false,
      createError: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with form closed', () => {
      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues)
      )

      expect(result.current.showCreateForm).toBe(false)
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.createError).toBe(null)
    })

    it('should have all required functions', () => {
      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues)
      )

      expect(typeof result.current.toggleCreateForm).toBe('function')
      expect(typeof result.current.handleSubmit).toBe('function')
      expect(result.current.createForm).toBeDefined()
    })
  })

  describe('toggleCreateForm Function', () => {
    it('should toggle form visibility', () => {
      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues)
      )

      expect(result.current.showCreateForm).toBe(false)

      act(() => {
        result.current.toggleCreateForm()
      })

      expect(result.current.showCreateForm).toBe(true)

      act(() => {
        result.current.toggleCreateForm()
      })

      expect(result.current.showCreateForm).toBe(false)
    })
  })

  describe('handleSubmit Function - Features', () => {
    it('should submit feature creation successfully', async () => {
      mockCreateFeature.mockResolvedValue(true)

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess)
      )

      const submitData = {
        name: 'New Feature',
        description: 'New Description'
      }

      await act(async () => {
        await result.current.handleSubmit(submitData)
      })

      expect(mockCreateFeature).toHaveBeenCalledWith({
        name: 'New Feature',
        description: 'New Description'
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('should trim whitespace from submitted data', async () => {
      mockCreateFeature.mockResolvedValue(true)

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues)
      )

      const submitData = {
        name: '  New Feature  ',
        description: '  New Description  '
      }

      await act(async () => {
        await result.current.handleSubmit(submitData)
      })

      expect(mockCreateFeature).toHaveBeenCalledWith({
        name: 'New Feature',
        description: 'New Description'
      })
    })
  })

  describe('handleSubmit Function - Addons', () => {
    it('should submit addon creation with pricing info', async () => {
      const mockCreateAddon = vi.fn().mockResolvedValue(true)

      vi.spyOn(useAddonOperationsModule, 'useAddonOperations').mockReturnValue({
        fetchAddons: vi.fn(),
        isFetching: false,
        fetchError: null,
        createAddon: mockCreateAddon,
        isCreating: false,
        createError: null
      })

      const { result } = renderHook(() =>
        useResourceCreation('addons', mockSchema, mockDefaultValues)
      )

      const submitData = {
        name: 'New Addon',
        description: 'Addon Description',
        base_price: '25.00',
        pricing_scope: 'organization'
      }

      await act(async () => {
        await result.current.handleSubmit(submitData)
      })

      expect(mockCreateAddon).toHaveBeenCalledWith({
        name: 'New Addon',
        description: 'Addon Description',
        base_price: 25.00,
        pricing_scope: 'organization'
      })
    })

    it('should handle zero base_price for addons', async () => {
      const mockCreateAddon = vi.fn().mockResolvedValue(true)

      vi.spyOn(useAddonOperationsModule, 'useAddonOperations').mockReturnValue({
        fetchAddons: vi.fn(),
        isFetching: false,
        fetchError: null,
        createAddon: mockCreateAddon,
        isCreating: false,
        createError: null
      })

      const { result } = renderHook(() =>
        useResourceCreation('addons', mockSchema, mockDefaultValues)
      )

      const submitData = {
        name: 'Free Addon',
        description: 'Free Description',
        base_price: null,
        pricing_scope: 'branch'
      }

      await act(async () => {
        await result.current.handleSubmit(submitData)
      })

      expect(mockCreateAddon).toHaveBeenCalledWith(
        expect.objectContaining({
          base_price: 0
        })
      )
    })
  })

  describe('handleSubmit Function - SLAs', () => {
    it('should submit SLA creation with all fields', async () => {
      const mockCreateSla = vi.fn().mockResolvedValue(true)

      vi.spyOn(useSlaOperationsModule, 'useSlaOperations').mockReturnValue({
        fetchSlas: vi.fn(),
        isFetching: false,
        fetchError: null,
        createSla: mockCreateSla,
        isCreating: false,
        createError: null
      })

      const { result } = renderHook(() =>
        useResourceCreation('slas', mockSchema, mockDefaultValues)
      )

      const submitData = {
        name: 'Premium SLA',
        support_channel: 'Phone, Email',
        response_time_hours: '4',
        availability_schedule: '24/7',
        notes: 'Premium support notes'
      }

      await act(async () => {
        await result.current.handleSubmit(submitData)
      })

      expect(mockCreateSla).toHaveBeenCalledWith({
        name: 'Premium SLA',
        support_channel: 'Phone, Email',
        response_time_hours: 4,
        availability_schedule: '24/7',
        notes: 'Premium support notes'
      })
    })

    it('should handle empty notes for SLAs', async () => {
      const mockCreateSla = vi.fn().mockResolvedValue(true)

      vi.spyOn(useSlaOperationsModule, 'useSlaOperations').mockReturnValue({
        fetchSlas: vi.fn(),
        isFetching: false,
        fetchError: null,
        createSla: mockCreateSla,
        isCreating: false,
        createError: null
      })

      const { result } = renderHook(() =>
        useResourceCreation('slas', mockSchema, mockDefaultValues)
      )

      const submitData = {
        name: 'Basic SLA',
        support_channel: 'Email',
        response_time_hours: '24',
        availability_schedule: 'Business hours',
        notes: null
      }

      await act(async () => {
        await result.current.handleSubmit(submitData)
      })

      expect(mockCreateSla).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: ''
        })
      )
    })
  })
})
