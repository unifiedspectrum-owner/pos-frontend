import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { useResourceSelection } from '../use-resource-selection';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import React from 'react';

interface TestResource {
  id: number;
  name: string;
}

const TestWrapper = ({ children, defaultValues }: { 
  children: React.ReactNode, 
  defaultValues?: Partial<CreatePlanFormData> 
}) => {
  const methods = useForm<CreatePlanFormData>({
    defaultValues: {
      name: '',
      description: '',
      base_price: 0,
      pricing_model: 'flat_rate',
      features: [],
      addons: [],
      slas: [],
      volume_discounts: [],
      ...defaultValues
    }
  });

  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
};

describe('useResourceSelection', () => {
  const testResources: TestResource[] = [
    { id: 1, name: 'Feature One' },
    { id: 2, name: 'Feature Two' },
    { id: 3, name: 'Feature Three' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty selection when no default values', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      );

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.selectedResources).toEqual([]);
    });

    it('should initialize with default selected values', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ features: [1, 3] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      expect(result.current.selectedIds).toEqual([1, 3]);
      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Feature One' },
        { id: 3, name: 'Feature Three' }
      ]);
    });
  });

  describe('toggleSelection', () => {
    it('should add resource to selection when not selected', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      );

      act(() => {
        result.current.toggleSelection(1);
      });

      expect(result.current.selectedIds).toEqual([1]);
      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Feature One' }
      ]);
    });

    it('should remove resource from selection when already selected', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ features: [1, 2, 3] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      act(() => {
        result.current.toggleSelection(2);
      });

      expect(result.current.selectedIds).toEqual([1, 3]);
      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Feature One' },
        { id: 3, name: 'Feature Three' }
      ]);
    });

    it('should handle multiple selections correctly', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      );

      act(() => {
        result.current.toggleSelection(1);
      });

      act(() => {
        result.current.toggleSelection(3);
      });

      act(() => {
        result.current.toggleSelection(2);
      });

      expect(result.current.selectedIds).toEqual([1, 3, 2]);
      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Feature One' },
        { id: 2, name: 'Feature Two' },
        { id: 3, name: 'Feature Three' }
      ]);
    });
  });

  describe('removeSelection', () => {
    it('should remove specific resource from selection', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ features: [1, 2, 3] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      act(() => {
        result.current.removeSelection(2);
      });

      expect(result.current.selectedIds).toEqual([1, 3]);
      expect(result.current.selectedResources).toEqual([
        { id: 1, name: 'Feature One' },
        { id: 3, name: 'Feature Three' }
      ]);
    });

    it('should handle removing non-selected resource gracefully', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ features: [1, 2] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      act(() => {
        result.current.removeSelection(3);
      });

      expect(result.current.selectedIds).toEqual([1, 2]);
    });

    it('should handle removing from empty selection', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      );

      act(() => {
        result.current.removeSelection(1);
      });

      expect(result.current.selectedIds).toEqual([]);
    });
  });

  describe('isSelected', () => {
    it('should return true for selected resources', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ features: [1, 3] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.isSelected(3)).toBe(true);
      expect(result.current.isSelected(2)).toBe(false);
    });

    it('should return false for unselected resources', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      );

      expect(result.current.isSelected(1)).toBe(false);
      expect(result.current.isSelected(2)).toBe(false);
      expect(result.current.isSelected(3)).toBe(false);
    });
  });

  describe('validateSelection', () => {
    it('should call trigger with correct field name', async () => {
      const triggerMock = vi.fn().mockResolvedValue(true);
      
      const TestWrapperWithMockTrigger = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            name: '',
            description: '',
            base_price: 0,
            pricing_model: 'flat_rate',
            features: [],
            addons: [],
            slas: [],
            volume_discounts: []
          }
        });

        // Override the trigger method
        methods.trigger = triggerMock;

        return (
          <FormProvider {...methods}>
            {children}
          </FormProvider>
        );
      };

      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: TestWrapperWithMockTrigger }
      );

      const validationResult = await result.current.validateSelection();

      expect(triggerMock).toHaveBeenCalledWith(['features']);
      expect(validationResult).toBe(true);
    });
  });

  describe('different field types', () => {
    it('should work with addons field', () => {
      const { result } = renderHook(
        () => useResourceSelection('addons', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ addons: [2] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      expect(result.current.selectedIds).toEqual([2]);
      expect(result.current.selectedResources).toEqual([
        { id: 2, name: 'Feature Two' }
      ]);
    });

    it('should work with slas field', () => {
      const { result } = renderHook(
        () => useResourceSelection('slas', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ slas: [1, 2, 3] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      expect(result.current.selectedIds).toEqual([1, 2, 3]);
      expect(result.current.selectedResources).toEqual(testResources);
    });
  });

  describe('edge cases', () => {
    it('should handle empty resources array', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', []),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ features: [1, 2] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      expect(result.current.selectedIds).toEqual([1, 2]);
      expect(result.current.selectedResources).toEqual([]);
    });

    it('should handle resources with no matching selected IDs', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ features: [99, 100] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      expect(result.current.selectedIds).toEqual([99, 100]);
      expect(result.current.selectedResources).toEqual([]);
    });

    it('should handle null/undefined selectedIds from form', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      );

      // The hook should handle undefined/null gracefully and default to empty array
      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.selectedResources).toEqual([]);
    });
  });

  describe('form integration', () => {
    it('should trigger form validation and mark field as dirty when toggling', () => {
      const setValueMock = vi.fn();
      
      const TestWrapperWithMockSetValue = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            name: '',
            description: '',
            base_price: 0,
            pricing_model: 'flat_rate',
            features: [],
            addons: [],
            slas: [],
            volume_discounts: []
          }
        });

        // Override the setValue method
        methods.setValue = setValueMock;

        return (
          <FormProvider {...methods}>
            {children}
          </FormProvider>
        );
      };

      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: TestWrapperWithMockSetValue }
      );

      act(() => {
        result.current.toggleSelection(1);
      });

      expect(setValueMock).toHaveBeenCalledWith(
        'features', 
        [1], 
        { shouldValidate: true, shouldDirty: true }
      );
    });
  });

  describe('resource selection order preservation', () => {
    it('should preserve selection order in selectedIds but resources follow original array order', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper> }
      );

      act(() => {
        result.current.toggleSelection(3);
      });

      act(() => {
        result.current.toggleSelection(1);
      });

      act(() => {
        result.current.toggleSelection(2);
      });

      // selectedIds preserves selection order
      expect(result.current.selectedIds).toEqual([3, 1, 2]);
      // selectedResources follows the original resources array order (1, 2, 3)
      expect(result.current.selectedResources.map(r => r.id)).toEqual([1, 2, 3]);
    });

    it('should maintain resource object references', () => {
      const { result } = renderHook(
        () => useResourceSelection('features', testResources),
        { 
          wrapper: ({ children }) => (
            <TestWrapper defaultValues={{ features: [1, 2] }}>
              {children}
            </TestWrapper>
          )
        }
      );

      expect(result.current.selectedResources[0]).toBe(testResources[0]);
      expect(result.current.selectedResources[1]).toBe(testResources[1]);
    });
  });
});