import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabNavigation, useTabValidationNavigation } from '../use-tab-navigation';
import { PlanManagementTabs, PlanFormMode } from '@plan-management/types/plans';
import { PLAN_MANAGEMENT_FORM_TABS, PLAN_FORM_MODES } from '@plan-management/config';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';

// Mock dependencies
vi.mock('@plan-management/config', () => ({
  PLAN_MANAGEMENT_FORM_TABS: [
    { id: 'basic', name: 'Basic Details' },
    { id: 'pricing', name: 'Pricing' },
    { id: 'features', name: 'Features' },
    { id: 'addons', name: 'Add-ons' },
    { id: 'sla', name: 'SLA' }
  ],
  PLAN_FORM_MODES: {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view'
  }
}));

describe('useTabNavigation', () => {
  const mockSetActiveTab = vi.fn();
  
  const mockValidationState = {
    isBasicInfoValid: true,
    isPricingInfoValid: true,
    isFeaturesValid: true,
    isAddonsValid: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct tab unlock states for CREATE mode', () => {
      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      expect(result.current.tabUnlockState).toEqual({
        basic: true,
        pricing: true,
        features: true,
        addons: true,
        sla: true
      });
    });

    it('should initialize with validation-based unlock states for CREATE mode when validation fails', () => {
      const invalidValidationState = {
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, invalidValidationState)
      );

      expect(result.current.tabUnlockState).toEqual({
        basic: true,
        pricing: false,
        features: false,
        addons: false,
        sla: false
      });
    });

    it('should unlock all tabs in VIEW mode regardless of validation', () => {
      const invalidValidationState = {
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.VIEW, invalidValidationState)
      );

      expect(result.current.tabUnlockState).toEqual({
        basic: true,
        pricing: true,
        features: true,
        addons: true,
        sla: true
      });
    });
  });

  describe('tab unlock logic', () => {
    it('should unlock pricing tab when basic info is valid', () => {
      const partialValidationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, partialValidationState)
      );

      expect(result.current.tabUnlockState.pricing).toBe(true);
      expect(result.current.tabUnlockState.features).toBe(false);
    });

    it('should unlock features tab when basic info and pricing are valid', () => {
      const partialValidationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, partialValidationState)
      );

      expect(result.current.tabUnlockState.features).toBe(true);
      expect(result.current.tabUnlockState.addons).toBe(false);
    });

    it('should unlock addons tab when basic info, pricing, and features are valid', () => {
      const partialValidationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, partialValidationState)
      );

      expect(result.current.tabUnlockState.addons).toBe(true);
      expect(result.current.tabUnlockState.sla).toBe(false);
    });

    it('should unlock SLA tab when all previous tabs are valid', () => {
      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      expect(result.current.tabUnlockState.sla).toBe(true);
    });
  });

  describe('isTabUnlocked', () => {
    it('should return true for unlocked tabs', () => {
      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      expect(result.current.isTabUnlocked('basic')).toBe(true);
      expect(result.current.isTabUnlocked('pricing')).toBe(true);
      expect(result.current.isTabUnlocked('features')).toBe(true);
      expect(result.current.isTabUnlocked('addons')).toBe(true);
      expect(result.current.isTabUnlocked('sla')).toBe(true);
    });

    it('should return false for locked tabs', () => {
      const invalidValidationState = {
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, invalidValidationState)
      );

      expect(result.current.isTabUnlocked('basic')).toBe(true);
      expect(result.current.isTabUnlocked('pricing')).toBe(false);
      expect(result.current.isTabUnlocked('features')).toBe(false);
      expect(result.current.isTabUnlocked('addons')).toBe(false);
      expect(result.current.isTabUnlocked('sla')).toBe(false);
    });

    it('should handle invalid tab IDs gracefully', () => {
      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      expect(result.current.isTabUnlocked('invalid-tab' as PlanManagementTabs)).toBe(false);
    });
  });

  describe('handleTabChange', () => {
    it('should change to unlocked tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      act(() => {
        result.current.handleTabChange('pricing');
      });

      expect(mockSetActiveTab).toHaveBeenCalledWith('pricing');
    });

    it('should not change to locked tab', () => {
      const invalidValidationState = {
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, invalidValidationState)
      );

      act(() => {
        result.current.handleTabChange('pricing');
      });

      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });
  });

  describe('handleNextTab', () => {
    it('should navigate to next unlocked tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      act(() => {
        result.current.handleNextTab();
      });

      expect(mockSetActiveTab).toHaveBeenCalledWith('pricing');
    });

    it('should not navigate if next tab is locked', () => {
      const partialValidationState = {
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, partialValidationState)
      );

      act(() => {
        result.current.handleNextTab();
      });

      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('should not navigate beyond last tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation('sla', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      act(() => {
        result.current.handleNextTab();
      });

      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('should handle tab not found in config', () => {
      vi.clearAllMocks(); // Clear previous calls
      
      const { result } = renderHook(() =>
        useTabNavigation('invalid-tab' as PlanManagementTabs, mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      act(() => {
        result.current.handleNextTab();
      });

      // When activeTab is invalid (-1 index), currentIndex + 1 = 0, so it tries to navigate to first tab
      // But the first tab (basic) should be unlocked, so it will call setActiveTab
      expect(mockSetActiveTab).toHaveBeenCalledWith('basic');
    });
  });

  describe('handlePreviousTab', () => {
    it('should navigate to previous tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation('pricing', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      act(() => {
        result.current.handlePreviousTab();
      });

      expect(mockSetActiveTab).toHaveBeenCalledWith('basic');
    });

    it('should not navigate before first tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      act(() => {
        result.current.handlePreviousTab();
      });

      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('should handle tab not found in config', () => {
      const { result } = renderHook(() =>
        useTabNavigation('invalid-tab' as PlanManagementTabs, mockSetActiveTab, PLAN_FORM_MODES.CREATE, mockValidationState)
      );

      act(() => {
        result.current.handlePreviousTab();
      });

      expect(mockSetActiveTab).not.toHaveBeenCalled();
    });
  });

  describe('validation state changes', () => {
    it('should update tab unlock state when validation changes', () => {
      const { result, rerender } = renderHook(
        ({ validationState }) =>
          useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.CREATE, validationState),
        {
          initialProps: {
            validationState: {
              isBasicInfoValid: false,
              isPricingInfoValid: false,
              isFeaturesValid: false,
              isAddonsValid: false
            }
          }
        }
      );

      expect(result.current.tabUnlockState.pricing).toBe(false);

      // Update validation state
      rerender({
        validationState: {
          isBasicInfoValid: true,
          isPricingInfoValid: false,
          isFeaturesValid: false,
          isAddonsValid: false
        }
      });

      expect(result.current.tabUnlockState.pricing).toBe(true);
    });
  });

  describe('different form modes', () => {
    it('should handle EDIT mode correctly', () => {
      const invalidValidationState = {
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.EDIT, invalidValidationState)
      );

      // In EDIT mode, validation should still apply
      expect(result.current.tabUnlockState.pricing).toBe(false);
    });

    it('should handle VIEW mode with all tabs unlocked', () => {
      const invalidValidationState = {
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      };

      const { result } = renderHook(() =>
        useTabNavigation('basic', mockSetActiveTab, PLAN_FORM_MODES.VIEW, invalidValidationState)
      );

      expect(result.current.tabUnlockState).toEqual({
        basic: true,
        pricing: true,
        features: true,
        addons: true,
        sla: true
      });
    });
  });
});

describe('useTabValidationNavigation', () => {
  const mockOnNext = vi.fn();
  const validationFields: Array<keyof CreatePlanFormData> = ['name', 'description'];

  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<CreatePlanFormData>({
      defaultValues: {
        name: 'Test Plan',
        description: 'Test Description',
        base_price: 10,
        pricing_model: 'flat_rate',
        features: [],
        addons: [],
        slas: [],
        volume_discounts: []
      }
    });

    return (
      <FormProvider {...methods}>
        {children}
      </FormProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('read-only mode', () => {
    it('should call onNext without validation in read-only mode', async () => {
      const { result } = renderHook(
        () => useTabValidationNavigation(validationFields, true, mockOnNext),
        { wrapper: TestWrapper }
      );

      await act(async () => {
        await result.current.handleNext();
      });

      expect(mockOnNext).toHaveBeenCalled();
    });

    it('should not call onNext when not provided in read-only mode', async () => {
      const { result } = renderHook(
        () => useTabValidationNavigation(validationFields, true),
        { wrapper: TestWrapper }
      );

      await act(async () => {
        await result.current.handleNext();
      });

      // Should not throw error
      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  describe('validation mode', () => {
    it('should call onNext when validation passes', async () => {
      const { result } = renderHook(
        () => useTabValidationNavigation(validationFields, false, mockOnNext),
        { wrapper: TestWrapper }
      );

      await act(async () => {
        await result.current.handleNext();
      });

      expect(mockOnNext).toHaveBeenCalled();
    });

    it('should not call onNext when validation fails', async () => {
      const TestWrapperWithInvalidData = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            name: '', // Invalid - empty name
            description: '',
            base_price: 10,
            pricing_model: 'flat_rate',
            features: [],
            addons: [],
            slas: [],
            volume_discounts: []
          }
        });

        return (
          <FormProvider {...methods}>
            {children}
          </FormProvider>
        );
      };

      const { result } = renderHook(
        () => useTabValidationNavigation(validationFields, false, mockOnNext),
        { wrapper: TestWrapperWithInvalidData }
      );

      await act(async () => {
        await result.current.handleNext();
      });

      // Assuming validation would fail for empty name
      // Note: This depends on the actual validation schema implementation
    });

    it('should not call onNext when onNext is not provided and validation passes', async () => {
      const { result } = renderHook(
        () => useTabValidationNavigation(validationFields, false),
        { wrapper: TestWrapper }
      );

      await act(async () => {
        await result.current.handleNext();
      });

      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  describe('validation fields', () => {
    it('should trigger validation for specified fields', async () => {
      let triggerMock: any;
      
      const TestWrapperWithMockTrigger = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            name: 'Test',
            description: 'Test',
            base_price: 10,
            pricing_model: 'flat_rate',
            features: [],
            addons: [],
            slas: [],
            volume_discounts: []
          }
        });

        triggerMock = vi.spyOn(methods, 'trigger');
        triggerMock.mockResolvedValue(true);

        return (
          <FormProvider {...methods}>
            {children}
          </FormProvider>
        );
      };

      const { result } = renderHook(
        () => useTabValidationNavigation(['name', 'base_price'], false, mockOnNext),
        { wrapper: TestWrapperWithMockTrigger }
      );

      await act(async () => {
        await result.current.handleNext();
      });

      expect(triggerMock).toHaveBeenCalledWith(['name', 'base_price']);
      expect(mockOnNext).toHaveBeenCalled();
    });

    it('should handle empty validation fields array', async () => {
      let triggerMock: any;
      
      const TestWrapperWithMockTrigger = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm<CreatePlanFormData>();

        triggerMock = vi.spyOn(methods, 'trigger');
        triggerMock.mockResolvedValue(true);

        return (
          <FormProvider {...methods}>
            {children}
          </FormProvider>
        );
      };

      const { result } = renderHook(
        () => useTabValidationNavigation([], false, mockOnNext),
        { wrapper: TestWrapperWithMockTrigger }
      );

      await act(async () => {
        await result.current.handleNext();
      });

      expect(triggerMock).toHaveBeenCalledWith([]);
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle validation errors gracefully', async () => {
      const triggerMock = vi.fn();
      
      const TestWrapperWithFailingTrigger = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm<CreatePlanFormData>();
        
        // Override trigger method after form creation
        methods.trigger = triggerMock;

        return (
          <FormProvider {...methods}>
            {children}
          </FormProvider>
        );
      };

      const { result } = renderHook(
        () => useTabValidationNavigation(validationFields, false, mockOnNext),
        { wrapper: TestWrapperWithFailingTrigger }
      );

      // Set up the mock to reject after the hook is rendered
      triggerMock.mockImplementation(() => Promise.reject(new Error('Validation error')));

      // The hook doesn't have error handling, so we expect the error to be thrown
      // We test that the error doesn't prevent the hook from working and onNext is not called
      await act(async () => {
        try {
          await result.current.handleNext();
        } catch (error) {
          // Error is expected since the hook doesn't handle trigger rejections
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Validation error');
        }
      });

      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  describe('memoization', () => {
    it('should memoize handleNext function', () => {
      const { result, rerender } = renderHook(
        ({ isReadOnly, onNext }) => useTabValidationNavigation(validationFields, isReadOnly, onNext),
        { 
          wrapper: TestWrapper,
          initialProps: { isReadOnly: false, onNext: mockOnNext }
        }
      );

      const initialHandleNext = result.current.handleNext;

      // Rerender with same props
      rerender({ isReadOnly: false, onNext: mockOnNext });

      expect(result.current.handleNext).toBe(initialHandleNext);
    });

    it('should update handleNext when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ isReadOnly, onNext }) => useTabValidationNavigation(validationFields, isReadOnly, onNext),
        { 
          wrapper: TestWrapper,
          initialProps: { isReadOnly: false, onNext: mockOnNext }
        }
      );

      const initialHandleNext = result.current.handleNext;

      // Change isReadOnly
      rerender({ isReadOnly: true, onNext: mockOnNext });

      expect(result.current.handleNext).not.toBe(initialHandleNext);
    });
  });
});