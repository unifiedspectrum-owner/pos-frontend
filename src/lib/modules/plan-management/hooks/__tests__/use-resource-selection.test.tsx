/* Comprehensive test suite for useResourceSelection hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormContext, FormState, FieldValues, UseFormReturn } from 'react-hook-form'

/* Plan module imports */
import { useResourceSelection } from '@plan-management/hooks/use-resource-selection'

/* Mock react-hook-form */
vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn()
}))

describe('useResourceSelection Hook', () => {
  /* Mock data */
  interface MockResource {
    id: number
    name: string
  }

  const mockResources: MockResource[] = [
    { id: 1, name: 'Resource A' },
    { id: 2, name: 'Resource B' },
    { id: 3, name: 'Resource C' },
    { id: 4, name: 'Resource D' }
  ]

  /* Mock form context functions */
  const mockWatch = vi.fn()
  const mockSetValue = vi.fn()
  const mockTrigger = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    /* Default mock implementation */
    vi.mocked(useFormContext).mockReturnValue({
      watch: mockWatch,
      setValue: mockSetValue,
      trigger: mockTrigger,
      getValues: vi.fn(),
      formState: {
        errors: {},
        isDirty: false,
        isValid: false,
        isSubmitted: false,
        isSubmitting: false,
        isValidating: false,
        isLoading: false,
        isSubmitSuccessful: false,
        submitCount: 0,
        touchedFields: {},
        dirtyFields: {},
        validatingFields: {},
        defaultValues: undefined,
        disabled: false,
        isReady: true
      },
      control: {} as UseFormReturn<FieldValues>['control'],
      register: vi.fn(),
      handleSubmit: vi.fn(),
      reset: vi.fn(),
      clearErrors: vi.fn(),
      setError: vi.fn(),
      unregister: vi.fn(),
      resetField: vi.fn(),
      setFocus: vi.fn(),
      getFieldState: vi.fn(),
      subscribe: vi.fn()
    } as UseFormReturn<FieldValues>)
  })

  describe('Initialization', () => {
    it('should initialize with empty selection when no IDs are selected', () => {
      mockWatch.mockReturnValue([])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.selectedIds).toEqual([])
      expect(result.current.selectedResources).toEqual([])
    })

    it('should initialize with selected IDs from form', () => {
      mockWatch.mockReturnValue([1, 2])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.selectedIds).toEqual([1, 2])
      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Resource A' },
        { id: 2, name: 'Resource B' }
      ])
    })

    it('should have all required functions', () => {
      mockWatch.mockReturnValue([])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(typeof result.current.toggleSelection).toBe('function')
      expect(typeof result.current.removeSelection).toBe('function')
      expect(typeof result.current.isSelected).toBe('function')
      expect(typeof result.current.validateSelection).toBe('function')
    })
  })

  describe('toggleSelection Function', () => {
    it('should add resource to selection when not selected', () => {
      mockWatch.mockReturnValue([1, 2])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.toggleSelection(3)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        [1, 2, 3],
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    })

    it('should remove resource from selection when already selected', () => {
      mockWatch.mockReturnValue([1, 2, 3])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.toggleSelection(2)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        [1, 3],
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    })

    it('should handle toggling first resource', () => {
      mockWatch.mockReturnValue([])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.toggleSelection(1)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        [1],
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    })

    it('should handle toggling last selected resource', () => {
      mockWatch.mockReturnValue([1])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.toggleSelection(1)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        [],
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    })

    it('should call setValue with validation options', () => {
      mockWatch.mockReturnValue([1])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.toggleSelection(2)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        expect.any(Array),
        expect.objectContaining({
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
      )
    })
  })

  describe('removeSelection Function', () => {
    it('should remove resource from selection', () => {
      mockWatch.mockReturnValue([1, 2, 3])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.removeSelection(2)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        [1, 3],
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    })

    it('should handle removing resource that is not selected', () => {
      mockWatch.mockReturnValue([1, 2])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.removeSelection(3)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        [1, 2],
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    })

    it('should handle removing from empty selection', () => {
      mockWatch.mockReturnValue([])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.removeSelection(1)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        [],
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    })

    it('should remove only the specified resource', () => {
      mockWatch.mockReturnValue([1, 2, 2, 3]) /* Duplicate IDs edge case */

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      act(() => {
        result.current.removeSelection(2)
      })

      /* Should filter out all instances of 2 */
      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        [1, 3],
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    })
  })

  describe('isSelected Function', () => {
    it('should return true for selected resources', () => {
      mockWatch.mockReturnValue([1, 2, 3])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.isSelected(1)).toBe(true)
      expect(result.current.isSelected(2)).toBe(true)
      expect(result.current.isSelected(3)).toBe(true)
    })

    it('should return false for unselected resources', () => {
      mockWatch.mockReturnValue([1, 2])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.isSelected(3)).toBe(false)
      expect(result.current.isSelected(4)).toBe(false)
    })

    it('should return false when selection is empty', () => {
      mockWatch.mockReturnValue([])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.isSelected(1)).toBe(false)
      expect(result.current.isSelected(2)).toBe(false)
    })

    it('should handle checking resource id of 0', () => {
      mockWatch.mockReturnValue([0, 1, 2])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.isSelected(0)).toBe(true)
    })
  })

  describe('selectedResources Computed Property', () => {
    it('should return selected resources from available resources', () => {
      mockWatch.mockReturnValue([1, 3])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Resource A' },
        { id: 3, name: 'Resource C' }
      ])
    })

    it('should return empty array when nothing is selected', () => {
      mockWatch.mockReturnValue([])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.selectedResources).toEqual([])
    })

    it('should filter out IDs that do not exist in resources', () => {
      mockWatch.mockReturnValue([1, 99, 2, 100])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Resource A' },
        { id: 2, name: 'Resource B' }
      ])
    })

    it('should return resources in ID order', () => {
      mockWatch.mockReturnValue([3, 1, 2])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      /* Resources are sorted by ID order in the resources array */
      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Resource A' },
        { id: 2, name: 'Resource B' },
        { id: 3, name: 'Resource C' }
      ])
    })
  })

  describe('validateSelection Function', () => {
    it('should call trigger with field name', async () => {
      mockWatch.mockReturnValue([1, 2])
      mockTrigger.mockResolvedValue(true)

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      await act(async () => {
        const isValid = await result.current.validateSelection()
        expect(isValid).toBe(true)
      })

      expect(mockTrigger).toHaveBeenCalledWith(['feature_ids'])
    })

    it('should return validation result', async () => {
      mockWatch.mockReturnValue([])
      mockTrigger.mockResolvedValue(false)

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      await act(async () => {
        const isValid = await result.current.validateSelection()
        expect(isValid).toBe(false)
      })
    })

    it('should validate different field names', async () => {
      mockWatch.mockReturnValue([1])
      mockTrigger.mockResolvedValue(true)

      const { result } = renderHook(() =>
        useResourceSelection('addon_assignments', mockResources)
      )

      await act(async () => {
        await result.current.validateSelection()
      })

      expect(mockTrigger).toHaveBeenCalledWith(['addon_assignments'])
    })
  })

  describe('Multiple Field Support', () => {
    it('should support feature_ids field', () => {
      mockWatch.mockReturnValue([1, 2])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.selectedIds).toEqual([1, 2])

      act(() => {
        result.current.toggleSelection(3)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'feature_ids',
        expect.any(Array),
        expect.any(Object)
      )
    })

    it('should support addon_assignments field', () => {
      mockWatch.mockReturnValue([1])

      const { result } = renderHook(() =>
        useResourceSelection('addon_assignments', mockResources)
      )

      expect(result.current.selectedIds).toEqual([1])

      act(() => {
        result.current.toggleSelection(2)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'addon_assignments',
        expect.any(Array),
        expect.any(Object)
      )
    })

    it('should support support_sla_ids field', () => {
      mockWatch.mockReturnValue([1, 2, 3])

      const { result } = renderHook(() =>
        useResourceSelection('support_sla_ids', mockResources)
      )

      expect(result.current.selectedIds).toEqual([1, 2, 3])

      act(() => {
        result.current.removeSelection(2)
      })

      expect(mockSetValue).toHaveBeenCalledWith(
        'support_sla_ids',
        [1, 3],
        expect.any(Object)
      )
    })
  })

  describe('Dynamic Updates', () => {
    it('should update selectedResources when form values change', () => {
      mockWatch.mockReturnValue([1])

      const { result, rerender } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.selectedResources.length).toBe(1)

      mockWatch.mockReturnValue([1, 2, 3])
      rerender()

      expect(result.current.selectedResources.length).toBe(3)
    })

    it('should update selectedResources when resources change', () => {
      mockWatch.mockReturnValue([1, 2])

      const { result, rerender } = renderHook(
        ({ resources }) => useResourceSelection('feature_ids', resources),
        { initialProps: { resources: mockResources } }
      )

      expect(result.current.selectedResources.length).toBe(2)

      const updatedResources = [
        { id: 1, name: 'Updated Resource A' },
        { id: 2, name: 'Updated Resource B' },
        { id: 5, name: 'Resource E' }
      ]

      rerender({ resources: updatedResources })

      expect(result.current.selectedResources[0].name).toBe('Updated Resource A')
    })

    it('should handle resources being removed', () => {
      mockWatch.mockReturnValue([1, 2, 3])

      const { result, rerender } = renderHook(
        ({ resources }) => useResourceSelection('feature_ids', resources),
        { initialProps: { resources: mockResources } }
      )

      expect(result.current.selectedResources.length).toBe(3)

      const reducedResources = [
        { id: 1, name: 'Resource A' }
      ]

      rerender({ resources: reducedResources })

      expect(result.current.selectedResources.length).toBe(1)
      expect(result.current.selectedResources[0].id).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null or undefined selectedIds from form', () => {
      mockWatch.mockReturnValue(null)

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      expect(result.current.selectedIds).toEqual([])
      expect(result.current.selectedResources).toEqual([])
    })

    it('should handle empty resources array', () => {
      mockWatch.mockReturnValue([1, 2, 3])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', [])
      )

      expect(result.current.selectedResources).toEqual([])
    })

    it('should handle very large selections', () => {
      const largeSelection = Array.from({ length: 1000 }, (_, i) => i + 1)
      mockWatch.mockReturnValue(largeSelection)

      const largeResources = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Resource ${i + 1}`
      }))

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', largeResources)
      )

      expect(result.current.selectedResources.length).toBe(1000)
    })

    it('should handle duplicate IDs in selectedIds', () => {
      mockWatch.mockReturnValue([1, 1, 2, 2, 3])

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', mockResources)
      )

      /* Hook deduplicates IDs */
      expect(result.current.selectedResources.length).toBe(3)
      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Resource A' },
        { id: 2, name: 'Resource B' },
        { id: 3, name: 'Resource C' }
      ])
    })

    it('should handle negative IDs', () => {
      mockWatch.mockReturnValue([-1, 0, 1])
      const resourcesWithNegativeIds = [
        { id: -1, name: 'Negative Resource' },
        { id: 0, name: 'Zero Resource' },
        { id: 1, name: 'Positive Resource' }
      ]

      const { result } = renderHook(() =>
        useResourceSelection('feature_ids', resourcesWithNegativeIds)
      )

      expect(result.current.selectedResources.length).toBe(3)
      expect(result.current.isSelected(-1)).toBe(true)
      expect(result.current.isSelected(0)).toBe(true)
    })
  })
})
