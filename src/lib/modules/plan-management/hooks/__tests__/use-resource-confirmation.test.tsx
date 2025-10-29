/* Comprehensive test suite for useResourceConfirmation hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

/* Plan module imports */
import { useResourceConfirmation } from '@plan-management/hooks/use-resource-confirmation'

describe('useResourceConfirmation Hook', () => {
  /* Mock data */
  interface MockResource {
    id: number
    name: string
  }

  const mockResources: MockResource[] = [
    { id: 1, name: 'Feature A' },
    { id: 2, name: 'Feature B' },
    { id: 3, name: 'Feature C' }
  ]

  const mockSelectedIds = [1, 2]

  /* Mock functions */
  const mockOnToggleSelection = vi.fn()
  const mockOnRemoveSelection = vi.fn()
  const mockGetResourceName = vi.fn((resource: MockResource) => resource.name)

  const defaultProps = {
    resources: mockResources,
    selectedIds: mockSelectedIds,
    onToggleSelection: mockOnToggleSelection,
    onRemoveSelection: mockOnRemoveSelection,
    getResourceName: mockGetResourceName,
    resourceType: 'feature'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      expect(result.current.confirmState.show).toBe(false)
      expect(result.current.confirmState.resourceId).toBeUndefined()
      expect(result.current.confirmState.resourceName).toBeUndefined()
      expect(result.current.resourceType).toBe('feature')
    })

    it('should have all required functions', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      expect(typeof result.current.handleToggleWithConfirm).toBe('function')
      expect(typeof result.current.handleRemoveWithConfirm).toBe('function')
      expect(typeof result.current.handleConfirm).toBe('function')
      expect(typeof result.current.handleCancel).toBe('function')
    })
  })

  describe('handleToggleWithConfirm Function', () => {
    it('should show confirmation dialog when deselecting a resource', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      act(() => {
        result.current.handleToggleWithConfirm(1)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.resourceId).toBe(1)
      expect(result.current.confirmState.resourceName).toBe('Feature A')
      expect(mockOnToggleSelection).not.toHaveBeenCalled()
    })

    it('should directly toggle selection when selecting a resource', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      act(() => {
        result.current.handleToggleWithConfirm(3)
      })

      expect(result.current.confirmState.show).toBe(false)
      expect(mockOnToggleSelection).toHaveBeenCalledWith(3)
    })

    it('should handle unknown resource gracefully', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      act(() => {
        result.current.handleToggleWithConfirm(999)
      })

      /* Unknown resource is not selected, so toggle directly without confirmation */
      expect(result.current.confirmState.show).toBe(false)
      expect(mockOnToggleSelection).toHaveBeenCalledWith(999)
    })

    it('should update when selectedIds change', () => {
      const { result, rerender } = renderHook(
        (props) => useResourceConfirmation(props),
        { initialProps: defaultProps }
      )

      /* Resource 3 is not selected initially, so it should toggle directly */
      act(() => {
        result.current.handleToggleWithConfirm(3)
      })

      expect(mockOnToggleSelection).toHaveBeenCalledWith(3)
      expect(result.current.confirmState.show).toBe(false)

      /* Update props to include resource 3 in selected IDs */
      const updatedProps = {
        ...defaultProps,
        selectedIds: [1, 2, 3]
      }

      rerender(updatedProps)

      /* Now resource 3 is selected, should show confirmation */
      act(() => {
        result.current.handleToggleWithConfirm(3)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.resourceId).toBe(3)
    })
  })

  describe('handleRemoveWithConfirm Function', () => {
    it('should show confirmation dialog when removing a resource', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.resourceId).toBe(1)
      expect(result.current.confirmState.resourceName).toBe('Feature A')
      expect(mockOnRemoveSelection).not.toHaveBeenCalled()
    })

    it('should handle unknown resource gracefully', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      act(() => {
        result.current.handleRemoveWithConfirm(999)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.resourceId).toBe(999)
      expect(result.current.confirmState.resourceName).toBe('Unknown feature')
    })

    it('should work with different resource types', () => {
      const addonProps = {
        ...defaultProps,
        resourceType: 'addon'
      }

      const { result } = renderHook(() => useResourceConfirmation(addonProps))

      act(() => {
        result.current.handleRemoveWithConfirm(999)
      })

      expect(result.current.confirmState.resourceName).toBe('Unknown addon')
    })
  })

  describe('handleConfirm Function', () => {
    it('should call onRemoveSelection and close dialog', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      /* First show the confirmation dialog */
      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })

      expect(result.current.confirmState.show).toBe(true)

      /* Then confirm the removal */
      act(() => {
        result.current.handleConfirm()
      })

      expect(mockOnRemoveSelection).toHaveBeenCalledWith(1)
      expect(result.current.confirmState.show).toBe(false)
    })

    it('should not call onRemoveSelection if resourceId is undefined', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      /* Confirm without showing dialog first */
      act(() => {
        result.current.handleConfirm()
      })

      expect(mockOnRemoveSelection).not.toHaveBeenCalled()
      expect(result.current.confirmState.show).toBe(false)
    })

    it('should handle confirm after toggle with confirmation', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      /* Toggle a selected resource (should show confirmation) */
      act(() => {
        result.current.handleToggleWithConfirm(2)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.resourceId).toBe(2)

      /* Confirm the deselection */
      act(() => {
        result.current.handleConfirm()
      })

      expect(mockOnRemoveSelection).toHaveBeenCalledWith(2)
      expect(result.current.confirmState.show).toBe(false)
    })
  })

  describe('handleCancel Function', () => {
    it('should close dialog without calling onRemoveSelection', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      /* Show the confirmation dialog */
      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })

      expect(result.current.confirmState.show).toBe(true)

      /* Cancel the removal */
      act(() => {
        result.current.handleCancel()
      })

      expect(mockOnRemoveSelection).not.toHaveBeenCalled()
      expect(result.current.confirmState.show).toBe(false)
    })

    it('should reset confirmation state', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      /* Show the confirmation dialog */
      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })

      expect(result.current.confirmState.resourceId).toBe(1)
      expect(result.current.confirmState.resourceName).toBe('Feature A')

      /* Cancel */
      act(() => {
        result.current.handleCancel()
      })

      expect(result.current.confirmState.show).toBe(false)
    })
  })

  describe('Resource Name Extraction', () => {
    it('should use custom getResourceName function', () => {
      const customGetName = vi.fn((resource: MockResource) => `Custom: ${resource.name}`)

      const customProps = {
        ...defaultProps,
        getResourceName: customGetName
      }

      const { result } = renderHook(() => useResourceConfirmation(customProps))

      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })

      expect(customGetName).toHaveBeenCalledWith({ id: 1, name: 'Feature A' })
      expect(result.current.confirmState.resourceName).toBe('Custom: Feature A')
    })

    it('should handle resources with different name properties', () => {
      interface CustomResource {
        id: number
        title: string
      }

      const customResources: CustomResource[] = [
        { id: 1, title: 'Resource 1' },
        { id: 2, title: 'Resource 2' }
      ]

      const customGetName = (resource: CustomResource) => resource.title

      const customProps = {
        resources: customResources,
        selectedIds: [1],
        onToggleSelection: mockOnToggleSelection,
        onRemoveSelection: mockOnRemoveSelection,
        getResourceName: customGetName,
        resourceType: 'custom'
      }

      const { result } = renderHook(() => useResourceConfirmation(customProps))

      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })

      expect(result.current.confirmState.resourceName).toBe('Resource 1')
    })
  })

  describe('Multiple Interactions', () => {
    it('should handle multiple confirm/cancel cycles', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      /* First cycle - remove resource 1 and confirm */
      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })
      expect(result.current.confirmState.resourceId).toBe(1)

      act(() => {
        result.current.handleConfirm()
      })
      expect(mockOnRemoveSelection).toHaveBeenCalledWith(1)
      expect(result.current.confirmState.show).toBe(false)

      /* Second cycle - remove resource 2 and cancel */
      act(() => {
        result.current.handleRemoveWithConfirm(2)
      })
      expect(result.current.confirmState.resourceId).toBe(2)

      act(() => {
        result.current.handleCancel()
      })
      expect(mockOnRemoveSelection).toHaveBeenCalledTimes(1)
      expect(result.current.confirmState.show).toBe(false)

      /* Third cycle - remove resource 3 and confirm */
      const updatedProps = {
        ...defaultProps,
        selectedIds: [1, 2, 3]
      }

      const { result: result2 } = renderHook(() => useResourceConfirmation(updatedProps))

      act(() => {
        result2.current.handleToggleWithConfirm(3)
      })

      act(() => {
        result2.current.handleConfirm()
      })
      expect(mockOnRemoveSelection).toHaveBeenCalledWith(3)
    })

    it('should handle overlapping operations correctly', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps))

      /* Start removal of resource 1 */
      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })
      expect(result.current.confirmState.resourceId).toBe(1)

      /* Start removal of resource 2 before confirming resource 1 */
      act(() => {
        result.current.handleRemoveWithConfirm(2)
      })

      /* Resource 2 should override resource 1 */
      expect(result.current.confirmState.resourceId).toBe(2)
      expect(result.current.confirmState.resourceName).toBe('Feature B')

      /* Confirm should remove resource 2, not resource 1 */
      act(() => {
        result.current.handleConfirm()
      })
      expect(mockOnRemoveSelection).toHaveBeenCalledWith(2)
      expect(mockOnRemoveSelection).not.toHaveBeenCalledWith(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty resources array', () => {
      const emptyProps = {
        ...defaultProps,
        resources: []
      }

      const { result } = renderHook(() => useResourceConfirmation(emptyProps))

      act(() => {
        result.current.handleRemoveWithConfirm(1)
      })

      expect(result.current.confirmState.resourceName).toBe('Unknown feature')
    })

    it('should handle empty selectedIds array', () => {
      const emptySelectedProps = {
        ...defaultProps,
        selectedIds: []
      }

      const { result } = renderHook(() => useResourceConfirmation(emptySelectedProps))

      /* All resources should be unselected, so toggle should work directly */
      act(() => {
        result.current.handleToggleWithConfirm(1)
      })

      expect(mockOnToggleSelection).toHaveBeenCalledWith(1)
      expect(result.current.confirmState.show).toBe(false)
    })

    it('should handle resource with id of 0', () => {
      const zeroIdResources = [{ id: 0, name: 'Zero Resource' }]
      const zeroIdProps = {
        ...defaultProps,
        resources: zeroIdResources,
        selectedIds: [0]
      }

      const { result } = renderHook(() => useResourceConfirmation(zeroIdProps))

      act(() => {
        result.current.handleToggleWithConfirm(0)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.resourceId).toBe(0)
      expect(result.current.confirmState.resourceName).toBe('Zero Resource')
    })
  })
})
