import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResourceConfirmation } from '../use-resource-confirmation';

interface TestResource {
  id: number;
  name: string;
}

describe('useResourceConfirmation', () => {
  const mockOnToggleSelection = vi.fn();
  const mockOnRemoveSelection = vi.fn();
  const mockGetResourceName = vi.fn((resource: TestResource) => resource.name);
  
  const testResources: TestResource[] = [
    { id: 1, name: 'Feature One' },
    { id: 2, name: 'Feature Two' },
    { id: 3, name: 'Feature Three' }
  ];

  const defaultProps = {
    resources: testResources,
    selectedIds: [1, 2],
    onToggleSelection: mockOnToggleSelection,
    onRemoveSelection: mockOnRemoveSelection,
    getResourceName: mockGetResourceName,
    resourceType: 'Feature'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with confirmation dialog hidden', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps));

      expect(result.current.confirmState).toEqual({
        show: false
      });
      expect(result.current.resourceType).toBe('Feature');
    });
  });

  describe('handleToggleWithConfirm', () => {
    it('should show confirmation dialog when deselecting a resource', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps));

      act(() => {
        result.current.handleToggleWithConfirm(1);
      });

      expect(result.current.confirmState).toEqual({
        show: true,
        resourceId: 1,
        resourceName: 'Feature One'
      });
      expect(mockOnToggleSelection).not.toHaveBeenCalled();
    });

    it('should directly call onToggleSelection when selecting a resource', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps));

      act(() => {
        result.current.handleToggleWithConfirm(3);
      });

      expect(result.current.confirmState.show).toBe(false);
      expect(mockOnToggleSelection).toHaveBeenCalledWith(3);
    });

    it('should handle unknown resource gracefully when deselecting', () => {
      // Set up props where 999 is selected so it will show confirmation dialog when deselected
      const propsWithUnknownSelected = {
        ...defaultProps,
        selectedIds: [1, 2, 999] // Include 999 in selected IDs
      };
      const { result } = renderHook(() => useResourceConfirmation(propsWithUnknownSelected));

      act(() => {
        result.current.handleToggleWithConfirm(999);
      });

      expect(result.current.confirmState).toEqual({
        show: true,
        resourceId: 999,
        resourceName: 'Unknown Feature'
      });
    });
  });

  describe('handleRemoveWithConfirm', () => {
    it('should show confirmation dialog with correct resource details', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps));

      act(() => {
        result.current.handleRemoveWithConfirm(2);
      });

      expect(result.current.confirmState).toEqual({
        show: true,
        resourceId: 2,
        resourceName: 'Feature Two'
      });
      expect(mockGetResourceName).toHaveBeenCalledWith(testResources[1]);
    });

    it('should handle unknown resource gracefully', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps));

      act(() => {
        result.current.handleRemoveWithConfirm(999);
      });

      expect(result.current.confirmState).toEqual({
        show: true,
        resourceId: 999,
        resourceName: 'Unknown Feature'
      });
    });
  });

  describe('handleConfirm', () => {
    it('should call onRemoveSelection and close dialog', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps));

      // First show the confirmation dialog
      act(() => {
        result.current.handleRemoveWithConfirm(1);
      });

      // Then confirm
      act(() => {
        result.current.handleConfirm();
      });

      expect(mockOnRemoveSelection).toHaveBeenCalledWith(1);
      expect(result.current.confirmState).toEqual({
        show: false
      });
    });

    it('should only close dialog when no resourceId is set', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps));

      act(() => {
        result.current.handleConfirm();
      });

      expect(mockOnRemoveSelection).not.toHaveBeenCalled();
      expect(result.current.confirmState).toEqual({
        show: false
      });
    });
  });

  describe('handleCancel', () => {
    it('should close confirmation dialog without calling onRemoveSelection', () => {
      const { result } = renderHook(() => useResourceConfirmation(defaultProps));

      // First show the confirmation dialog
      act(() => {
        result.current.handleRemoveWithConfirm(1);
      });

      // Then cancel
      act(() => {
        result.current.handleCancel();
      });

      expect(mockOnRemoveSelection).not.toHaveBeenCalled();
      expect(result.current.confirmState).toEqual({
        show: false
      });
    });
  });

  describe('resource type variations', () => {
    it('should work with different resource types', () => {
      const slaProps = {
        ...defaultProps,
        resourceType: 'SLA'
      };

      const { result } = renderHook(() => useResourceConfirmation(slaProps));

      act(() => {
        result.current.handleRemoveWithConfirm(999);
      });

      expect(result.current.confirmState.resourceName).toBe('Unknown SLA');
      expect(result.current.resourceType).toBe('SLA');
    });

    it('should work with addon resource type', () => {
      const addonProps = {
        ...defaultProps,
        selectedIds: [1, 2, 999], // Include 999 so it shows confirmation when deselected
        resourceType: 'Add-on'
      };

      const { result } = renderHook(() => useResourceConfirmation(addonProps));

      act(() => {
        result.current.handleToggleWithConfirm(999);
      });

      expect(result.current.confirmState.resourceName).toBe('Unknown Add-on');
    });
  });

  describe('selectedIds prop changes', () => {
    it('should handle selectedIds updates correctly', () => {
      const { result, rerender } = renderHook(
        ({ selectedIds }) => useResourceConfirmation({ ...defaultProps, selectedIds }),
        { initialProps: { selectedIds: [1, 2] } }
      );

      // Resource 3 should trigger direct selection
      act(() => {
        result.current.handleToggleWithConfirm(3);
      });
      expect(mockOnToggleSelection).toHaveBeenCalledWith(3);

      // Update selectedIds to include resource 3
      rerender({ selectedIds: [1, 2, 3] });

      vi.clearAllMocks();

      // Now resource 3 should trigger confirmation dialog
      act(() => {
        result.current.handleToggleWithConfirm(3);
      });
      expect(result.current.confirmState.show).toBe(true);
      expect(mockOnToggleSelection).not.toHaveBeenCalled();
    });
  });

  describe('getResourceName function variations', () => {
    it('should handle custom getResourceName function', () => {
      const customGetResourceName = vi.fn((resource: TestResource) => `Custom ${resource.name}`);
      const customProps = {
        ...defaultProps,
        getResourceName: customGetResourceName
      };

      const { result } = renderHook(() => useResourceConfirmation(customProps));

      act(() => {
        result.current.handleRemoveWithConfirm(1);
      });

      expect(customGetResourceName).toHaveBeenCalledWith(testResources[0]);
      expect(result.current.confirmState.resourceName).toBe('Custom Feature One');
    });
  });

  describe('edge cases', () => {
    it('should handle empty resources array', () => {
      const emptyProps = {
        ...defaultProps,
        resources: []
      };

      const { result } = renderHook(() => useResourceConfirmation(emptyProps));

      act(() => {
        result.current.handleRemoveWithConfirm(1);
      });

      expect(result.current.confirmState).toEqual({
        show: true,
        resourceId: 1,
        resourceName: 'Unknown Feature'
      });
    });

    it('should handle empty selectedIds array', () => {
      const emptySelectedProps = {
        ...defaultProps,
        selectedIds: []
      };

      const { result } = renderHook(() => useResourceConfirmation(emptySelectedProps));

      // All resources should trigger direct selection
      act(() => {
        result.current.handleToggleWithConfirm(1);
      });
      expect(mockOnToggleSelection).toHaveBeenCalledWith(1);

      act(() => {
        result.current.handleToggleWithConfirm(2);
      });
      expect(mockOnToggleSelection).toHaveBeenCalledWith(2);
    });

    it('should handle complex resource objects', () => {
      interface ComplexResource {
        id: number;
        name: string;
        description: string;
        category: string;
      }

      const complexResources: ComplexResource[] = [
        { id: 1, name: 'Complex Feature', description: 'A complex feature', category: 'Premium' }
      ];

      const complexProps = {
        resources: complexResources,
        selectedIds: [1],
        onToggleSelection: mockOnToggleSelection,
        onRemoveSelection: mockOnRemoveSelection,
        getResourceName: (resource: ComplexResource) => `${resource.category}: ${resource.name}`,
        resourceType: 'Complex Feature'
      };

      const { result } = renderHook(() => useResourceConfirmation(complexProps));

      act(() => {
        result.current.handleToggleWithConfirm(1);
      });

      expect(result.current.confirmState).toEqual({
        show: true,
        resourceId: 1,
        resourceName: 'Premium: Complex Feature'
      });
    });
  });

  describe('memoization and performance', () => {
    it('should not recreate handlers unnecessarily', () => {
      const { result, rerender } = renderHook(() => useResourceConfirmation(defaultProps));

      const initialHandlers = {
        handleToggleWithConfirm: result.current.handleToggleWithConfirm,
        handleRemoveWithConfirm: result.current.handleRemoveWithConfirm,
        handleConfirm: result.current.handleConfirm,
        handleCancel: result.current.handleCancel
      };

      // Rerender with same props
      rerender();

      expect(result.current.handleToggleWithConfirm).toBe(initialHandlers.handleToggleWithConfirm);
      expect(result.current.handleRemoveWithConfirm).toBe(initialHandlers.handleRemoveWithConfirm);
      expect(result.current.handleConfirm).toBe(initialHandlers.handleConfirm);
      expect(result.current.handleCancel).toBe(initialHandlers.handleCancel);
    });
  });
});