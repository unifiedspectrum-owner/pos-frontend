import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormSubmission } from '../use-form-submission';
import { planService } from '@plan-management/api';
import { clearStorageData, formatFormDataToApiData, createToastNotification } from '@plan-management/utils';
import { toaster } from '@/components/ui/toaster';
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config';
import { PLAN_FORM_MODES } from '@plan-management/config';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';

// Mock dependencies
vi.mock('@plan-management/api');
vi.mock('@plan-management/utils');
vi.mock('@/components/ui/toaster');
vi.mock('@shared/config', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    LOADING_DELAY: 1000,
    LOADING_DELAY_ENABLED: false
  };
});
vi.mock('@plan-management/config', () => ({
  PLAN_FORM_MODES: {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view'
  }
}));

const mockPlanService = vi.mocked(planService);
const mockClearStorageData = vi.mocked(clearStorageData);
const mockFormatFormDataToApiData = vi.mocked(formatFormDataToApiData);
const mockCreateToastNotification = vi.mocked(createToastNotification);
const mockToaster = vi.mocked(toaster);

describe('useFormSubmission', () => {
  const mockGetValues = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockFormData: CreatePlanFormData = {
    name: 'Test Plan',
    description: 'Test Description',
    base_price: 10,
    pricing_model: 'flat_rate',
    features: [1, 2],
    addons: [1],
    slas: [1],
    volume_discounts: []
  };
  const mockApiData = { name: 'Test Plan', description: 'Test Description' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetValues.mockReturnValue(mockFormData);
    // Mock getValues to return specific values when called with field names
    mockGetValues.mockImplementation((fieldName?: string) => {
      if (fieldName === 'name') return 'Test Plan';
      if (fieldName) return mockFormData[fieldName as keyof typeof mockFormData];
      return mockFormData;
    });
    
    mockFormatFormDataToApiData.mockReturnValue(mockApiData);
    mockCreateToastNotification.mockReturnValue({
      type: 'success',
      title: 'Success',
      description: 'Success message'
    });
    
    // Mock window.location for edit mode
    vi.stubGlobal('window', {
      location: {
        pathname: '/admin/plan-management/edit/123'
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CREATE mode', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.getSubmitButtonText()).toBe('Create Plan');
    });

    it('should handle successful form submission in CREATE mode', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Plan created successfully'
        }
      };
      mockPlanService.createSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(mockFormatFormDataToApiData).toHaveBeenCalledWith(mockFormData, false);
      expect(mockPlanService.createSubscriptionPlan).toHaveBeenCalledWith(mockApiData);
      expect(mockClearStorageData).toHaveBeenCalled();
      expect(mockGetValues).toHaveBeenCalledWith('name');
      expect(mockCreateToastNotification).toHaveBeenCalledWith(
        'success',
        'Plan Created Successfully',
        '"Test Plan" has been created and is ready to use.'
      );
      expect(mockToaster.create).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle API error response in CREATE mode', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Plan name already exists'
        }
      };
      mockPlanService.createSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(mockCreateToastNotification).toHaveBeenCalledWith(
        'error',
        'Failed to Create Plan',
        'Plan name already exists'
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle network/unexpected error in CREATE mode', async () => {
      const error = new Error('Network error');
      mockPlanService.createSubscriptionPlan.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(mockCreateToastNotification).toHaveBeenCalledWith(
        'error',
        'Failed to Create Plan',
        'An unexpected error occurred. Please try again.'
      );
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should show correct button text while submitting in CREATE mode', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockPlanService.createSubscriptionPlan.mockReturnValue(mockPromise);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      // Start submission and check state immediately
      let submitPromise: Promise<any>;
      act(() => {
        submitPromise = result.current.submitForm(mockFormData);
      });
      
      // Check state after act
      expect(result.current.isSubmitting).toBe(true);
      expect(result.current.getSubmitButtonText()).toBe('Creating...');
      
      // Resolve the promise to complete submission
      act(() => {
        resolvePromise!({ data: { success: true } });
      });
      
      await act(async () => {
        await submitPromise!;
      });
    });
  });

  describe('EDIT mode', () => {
    const planId = 123;

    it('should initialize with correct default state for EDIT mode', () => {
      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.EDIT, planId, mockGetValues, mockOnSuccess)
      );

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.getSubmitButtonText()).toBe('Update Plan');
    });

    it('should handle successful form submission in EDIT mode with planId', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Plan updated successfully'
        }
      };
      mockPlanService.updateSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.EDIT, planId, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(mockFormatFormDataToApiData).toHaveBeenCalledWith(mockFormData, true);
      expect(mockPlanService.updateSubscriptionPlan).toHaveBeenCalledWith(planId, mockApiData);
      expect(mockClearStorageData).not.toHaveBeenCalled();
      expect(mockCreateToastNotification).toHaveBeenCalledWith(
        'success',
        'Plan Updated Successfully',
        '"Test Plan" has been updated with the latest changes.'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should extract planId from URL when not provided in EDIT mode', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Plan updated successfully'
        }
      };
      mockPlanService.updateSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.EDIT, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(mockPlanService.updateSubscriptionPlan).toHaveBeenCalledWith(123, mockApiData);
    });

    it('should handle API error response in EDIT mode', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Plan not found'
        }
      };
      mockPlanService.updateSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.EDIT, planId, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(mockCreateToastNotification).toHaveBeenCalledWith(
        'error',
        'Failed to Update Plan',
        'Plan not found'
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should show correct button text while submitting in EDIT mode', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockPlanService.updateSubscriptionPlan.mockReturnValue(mockPromise);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.EDIT, planId, mockGetValues, mockOnSuccess)
      );

      // Start submission and check state immediately
      let submitPromise: Promise<any>;
      act(() => {
        submitPromise = result.current.submitForm(mockFormData);
      });
      
      // Check state after act
      expect(result.current.isSubmitting).toBe(true);
      expect(result.current.getSubmitButtonText()).toBe('Updating...');
      
      // Resolve the promise to complete submission
      act(() => {
        resolvePromise!({ data: { success: true } });
      });
      
      await act(async () => {
        await submitPromise!;
      });
    });
  });

  describe('loading delay functionality', () => {
    it('should handle loading delay configuration', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Success'
        }
      };
      mockPlanService.createSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      const startTime = Date.now();
      await result.current.submitForm(mockFormData);
      const endTime = Date.now();

      // Should complete successfully regardless of delay configuration
      expect(endTime - startTime).toBeGreaterThanOrEqual(0);
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe('error handling edge cases', () => {
    it('should handle missing error message in API response', async () => {
      const mockResponse = {
        data: {
          success: false
        }
      };
      mockPlanService.createSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(mockCreateToastNotification).toHaveBeenCalledWith(
        'error',
        'Failed to Create Plan',
        'An error occurred while creating the plan.'
      );
    });

    it('should handle missing success field in API response', async () => {
      const mockResponse = {
        data: {
          message: 'Some message'
        }
      };
      mockPlanService.createSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(mockCreateToastNotification).toHaveBeenCalledWith(
        'error',
        'Failed to Create Plan',
        'Some message'
      );
    });
  });

  describe('console logging', () => {
    it('should log success message on successful submission', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockResponse = {
        data: {
          success: true
        }
      };
      mockPlanService.createSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PlanFormSubmission] Plan created successfully'
      );

      consoleSpy.mockRestore();
    });

    it('should log error message on API error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockResponse = {
        data: {
          success: false,
          message: 'API Error'
        }
      };
      mockPlanService.createSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PlanFormSubmission] Failed to create plan:',
        'API Error'
      );

      consoleSpy.mockRestore();
    });

    it('should log error message on network error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network error');
      mockPlanService.createSubscriptionPlan.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues, mockOnSuccess)
      );

      await result.current.submitForm(mockFormData);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PlanFormSubmission] Error creating plan:',
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe('callback behavior', () => {
    it('should not call onSuccess callback when not provided', async () => {
      const mockResponse = {
        data: {
          success: true
        }
      };
      mockPlanService.createSubscriptionPlan.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useFormSubmission(PLAN_FORM_MODES.CREATE, undefined, mockGetValues)
      );

      await result.current.submitForm(mockFormData);

      // Should not throw error even without onSuccess callback
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});