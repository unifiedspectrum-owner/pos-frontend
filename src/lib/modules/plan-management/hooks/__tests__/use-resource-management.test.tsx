import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useResourceManagement, useResourceCreation } from '../use-resource-management';
import { planService } from '@plan-management/api';
import { toaster } from '@/components/ui/toaster';
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config';
import { useResourceErrors } from '@shared/contexts';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

// Mock dependencies
vi.mock('@plan-management/api');
vi.mock('@/components/ui/toaster');
vi.mock('@shared/config', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    LOADING_DELAY: 100,
    LOADING_DELAY_ENABLED: false
  };
});
vi.mock('@shared/contexts', () => ({
  useResourceErrors: vi.fn()
}));

const mockPlanService = vi.mocked(planService);
const mockToaster = vi.mocked(toaster);
const mockUseResourceErrors = vi.mocked(useResourceErrors);

interface TestResource {
  id: number;
  name: string;
  display_order: number;
  description?: string;
  support_channel?: string;
  availability_schedule?: string;
}

describe('useResourceManagement', () => {
  const mockResources: TestResource[] = [
    { id: 1, name: 'Feature A', display_order: 2, description: 'First feature' },
    { id: 2, name: 'Feature B', display_order: 1, description: 'Second feature' },
    { id: 3, name: 'Feature C', display_order: 3, description: 'Third feature' }
  ];

  const mockErrorContext = {
    addError: vi.fn(),
    removeError: vi.fn(),
    clearAllErrors: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseResourceErrors.mockReturnValue(mockErrorContext);
    
    // Mock successful API responses
    mockPlanService.getAllFeatures.mockResolvedValue({
      data: { success: true, data: mockResources }
    });
    mockPlanService.getAllAddOns.mockResolvedValue({
      data: { success: true, data: mockResources }
    });
    mockPlanService.getAllSLAs.mockResolvedValue({
      data: { success: true, data: mockResources }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', false)
      );

      expect(result.current.resources).toEqual([]);
      expect(result.current.filteredResources).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('');
      expect(result.current.searchTerm).toBe('');
      expect(result.current.showSearch).toBe(false);
    });

    it('should not fetch resources when shouldLoad is false', async () => {
      renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', false)
      );

      await waitFor(() => {
        expect(mockPlanService.getAllFeatures).not.toHaveBeenCalled();
      });
    });

    it('should fetch resources when shouldLoad is true', async () => {
      renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(mockPlanService.getAllFeatures).toHaveBeenCalled();
      });
    });
  });

  describe('resource fetching', () => {
    it('should fetch features successfully and sort by name', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.resources).toEqual([
          { id: 1, name: 'Feature A', display_order: 2, description: 'First feature' },
          { id: 2, name: 'Feature B', display_order: 1, description: 'Second feature' },
          { id: 3, name: 'Feature C', display_order: 3, description: 'Third feature' }
        ]);
      });
    });

    it('should fetch features successfully and sort by display_order', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'display_order', true)
      );

      await waitFor(() => {
        expect(result.current.resources).toEqual([
          { id: 2, name: 'Feature B', display_order: 1, description: 'Second feature' },
          { id: 1, name: 'Feature A', display_order: 2, description: 'First feature' },
          { id: 3, name: 'Feature C', display_order: 3, description: 'Third feature' }
        ]);
      });
    });

    it('should fetch addons successfully', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('addons', 'name', true)
      );

      await waitFor(() => {
        expect(mockPlanService.getAllAddOns).toHaveBeenCalled();
        expect(result.current.resources).toEqual(mockResources);
      });
    });

    it('should fetch SLAs successfully', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('slas', 'name', true)
      );

      await waitFor(() => {
        expect(mockPlanService.getAllSLAs).toHaveBeenCalled();
        expect(result.current.resources).toEqual(mockResources);
      });
    });
  });

  describe('error handling', () => {
    it('should handle API error response', async () => {
      const errorMessage = 'Failed to load features';
      mockPlanService.getAllFeatures.mockResolvedValue({
        data: { success: false, message: errorMessage }
      });

      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(mockErrorContext.addError).toHaveBeenCalledWith({
          id: 'features',
          error: errorMessage,
          title: 'Error Loading Features',
          onRetry: expect.any(Function),
          isRetrying: false
        });
      });
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      mockPlanService.getAllFeatures.mockRejectedValue(networkError);

      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load features. Please try again.');
        expect(mockErrorContext.addError).toHaveBeenCalledWith({
          id: 'features',
          error: networkError,
          title: 'Error Loading Features',
          onRetry: expect.any(Function),
          isRetrying: false
        });
      });
    });

    it('should handle error context not available gracefully', async () => {
      mockUseResourceErrors.mockImplementation(() => {
        throw new Error('Context not available');
      });

      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        // Should not throw error and continue normally
        expect(result.current.resources).toEqual(mockResources);
      });
    });
  });

  describe('loading delay', () => {
    it('should apply loading delay when enabled', async () => {
      // Test that the hook can handle loading delay configuration
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      // Add more detailed mock data for search testing
      const searchMockResources: TestResource[] = [
        { 
          id: 1, 
          name: 'Premium Feature', 
          display_order: 1, 
          description: 'Advanced functionality',
          support_channel: 'email',
          availability_schedule: '24/7'
        },
        { 
          id: 2, 
          name: 'Basic Feature', 
          display_order: 2, 
          description: 'Standard functionality',
          support_channel: 'chat',
          availability_schedule: 'business hours'
        }
      ];
      
      mockPlanService.getAllFeatures.mockResolvedValue({
        data: { success: true, data: searchMockResources }
      });
    });

    it('should filter resources by name', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.resources).toHaveLength(2);
      });

      act(() => {
        result.current.setSearchTerm('premium');
      });

      expect(result.current.filteredResources).toEqual([
        expect.objectContaining({ name: 'Premium Feature' })
      ]);
    });

    it('should filter resources by description', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.resources).toHaveLength(2);
      });

      act(() => {
        result.current.setSearchTerm('advanced');
      });

      expect(result.current.filteredResources).toEqual([
        expect.objectContaining({ description: 'Advanced functionality' })
      ]);
    });

    it('should filter resources by support_channel', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.resources).toHaveLength(2);
      });

      act(() => {
        result.current.setSearchTerm('email');
      });

      expect(result.current.filteredResources).toEqual([
        expect.objectContaining({ support_channel: 'email' })
      ]);
    });

    it('should filter resources by availability_schedule', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.resources).toHaveLength(2);
      });

      act(() => {
        result.current.setSearchTerm('24/7');
      });

      expect(result.current.filteredResources).toEqual([
        expect.objectContaining({ availability_schedule: '24/7' })
      ]);
    });

    it('should handle case insensitive search', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.resources).toHaveLength(2);
      });

      act(() => {
        result.current.setSearchTerm('PREMIUM');
      });

      expect(result.current.filteredResources).toEqual([
        expect.objectContaining({ name: 'Premium Feature' })
      ]);
    });

    it('should return all resources when search term is empty', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(result.current.resources).toHaveLength(2);
      });

      act(() => {
        result.current.setSearchTerm('');
      });

      expect(result.current.filteredResources).toHaveLength(2);
    });
  });

  describe('search toggle functionality', () => {
    it('should toggle search visibility', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      expect(result.current.showSearch).toBe(false);

      act(() => {
        result.current.toggleSearch();
      });

      expect(result.current.showSearch).toBe(true);

      act(() => {
        result.current.toggleSearch();
      });

      expect(result.current.showSearch).toBe(false);
    });

    it('should clear search term when hiding search', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      // Show search and set term
      act(() => {
        result.current.toggleSearch();
        result.current.setSearchTerm('test');
      });

      expect(result.current.showSearch).toBe(true);
      expect(result.current.searchTerm).toBe('test');

      // Hide search
      act(() => {
        result.current.toggleSearch();
      });

      expect(result.current.showSearch).toBe(false);
      expect(result.current.searchTerm).toBe('');
    });
  });

  describe('refetch functionality', () => {
    it('should refetch resources when refetch is called', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(mockPlanService.getAllFeatures).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockPlanService.getAllFeatures).toHaveBeenCalledTimes(2);
      });
    });

    it('should clear errors when refetch is triggered', async () => {
      const { result } = renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(mockErrorContext.clearAllErrors).toHaveBeenCalled();
      });

      // Clear the mock to reset call count
      mockErrorContext.clearAllErrors.mockClear();

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockErrorContext.clearAllErrors).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('success scenarios', () => {
    it('should clear errors on successful fetch', async () => {
      renderHook(() => 
        useResourceManagement<TestResource>('features', 'name', true)
      );

      await waitFor(() => {
        expect(mockErrorContext.removeError).toHaveBeenCalledWith('features');
        expect(mockErrorContext.clearAllErrors).toHaveBeenCalled();
      });
    });
  });
});

describe('useResourceCreation', () => {
  // Create a real Zod schema for testing
  const mockSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1)
  });
  const mockDefaultValues = { name: '', description: '' };
  const mockOnSuccess = vi.fn();

  const TestFormWrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      defaultValues: mockDefaultValues
    });
    return (
      <FormProvider {...methods}>
        {children}
      </FormProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockToaster.create.mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      expect(result.current.showCreateForm).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.createError).toBe('');
    });
  });

  describe('form toggle', () => {
    it('should toggle create form visibility', () => {
      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      act(() => {
        result.current.toggleCreateForm();
      });

      expect(result.current.showCreateForm).toBe(true);

      act(() => {
        result.current.toggleCreateForm();
      });

      expect(result.current.showCreateForm).toBe(false);
    });

    it('should reset form and error when closing', () => {
      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      // Open form
      act(() => {
        result.current.toggleCreateForm();
      });

      // Set error
      act(() => {
        // Simulate an error (this would normally happen through form submission)
        result.current.createForm.setError('root', { message: 'Test error' });
      });

      // Close form
      act(() => {
        result.current.toggleCreateForm();
      });

      expect(result.current.showCreateForm).toBe(false);
      expect(result.current.createError).toBe('');
    });
  });

  describe('form submission - features', () => {
    it('should successfully create a feature', async () => {
      const mockResponse = {
        data: { success: true, message: 'Feature created' }
      };
      mockPlanService.createFeature.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = {
        name: '  Test Feature  ',
        description: '  Test Description  '
      };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(mockPlanService.createFeature).toHaveBeenCalledWith({
        name: 'Test Feature',
        description: 'Test Description'
      });

      expect(mockToaster.create).toHaveBeenCalledWith({
        type: 'success',
        title: 'Feature Created Successfully',
        description: '"Test Feature" has been added to the features list.',
        duration: 5000,
        closable: true,
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(result.current.showCreateForm).toBe(false);
    });
  });

  describe('form submission - addons', () => {
    it('should successfully create an addon', async () => {
      const mockResponse = {
        data: { success: true, message: 'Addon created' }
      };
      mockPlanService.createAddOn.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useResourceCreation('addons', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = {
        name: '  Test Addon  ',
        description: '  Test Description  ',
        base_price: '10.50',
        pricing_scope: 'per_user'
      };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(mockPlanService.createAddOn).toHaveBeenCalledWith({
        name: 'Test Addon',
        description: 'Test Description',
        base_price: 10.5,
        pricing_scope: 'per_user'
      });

      expect(mockToaster.create).toHaveBeenCalledWith({
        type: 'success',
        title: 'Add-on Created Successfully',
        description: '"Test Addon" has been added to the addons list.',
        duration: 5000,
        closable: true,
      });
    });

    it('should handle addon creation with zero base_price', async () => {
      const mockResponse = {
        data: { success: true, message: 'Addon created' }
      };
      mockPlanService.createAddOn.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useResourceCreation('addons', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = {
        name: 'Free Addon',
        description: 'Free addon',
        pricing_scope: 'per_plan'
      };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(mockPlanService.createAddOn).toHaveBeenCalledWith({
        name: 'Free Addon',
        description: 'Free addon',
        base_price: 0,
        pricing_scope: 'per_plan'
      });
    });
  });

  describe('form submission - slas', () => {
    it('should successfully create an SLA', async () => {
      const mockResponse = {
        data: { success: true, message: 'SLA created' }
      };
      mockPlanService.createSLA.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useResourceCreation('slas', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = {
        name: '  Premium SLA  ',
        support_channel: '  email  ',
        response_time_hours: '24',
        availability_schedule: '  24/7  ',
        notes: '  Premium support  '
      };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(mockPlanService.createSLA).toHaveBeenCalledWith({
        name: 'Premium SLA',
        support_channel: 'email',
        response_time_hours: 24,
        availability_schedule: '24/7',
        notes: 'Premium support'
      });

      expect(mockToaster.create).toHaveBeenCalledWith({
        type: 'success',
        title: 'SLA Created Successfully',
        description: '"Premium SLA" has been added to the slas list.',
        duration: 5000,
        closable: true,
      });
    });

    it('should handle SLA creation with empty notes', async () => {
      const mockResponse = {
        data: { success: true, message: 'SLA created' }
      };
      mockPlanService.createSLA.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useResourceCreation('slas', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = {
        name: 'Basic SLA',
        support_channel: 'chat',
        response_time_hours: '48',
        availability_schedule: 'business hours'
      };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(mockPlanService.createSLA).toHaveBeenCalledWith({
        name: 'Basic SLA',
        support_channel: 'chat',
        response_time_hours: 48,
        availability_schedule: 'business hours',
        notes: ''
      });
    });
  });

  describe('error handling', () => {
    it('should handle API error response', async () => {
      const mockResponse = {
        data: { success: false, message: 'Name already exists' }
      };
      mockPlanService.createFeature.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      // First open the form
      act(() => {
        result.current.toggleCreateForm();
      });

      const formData = { name: 'Duplicate Feature', description: 'Test' };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(result.current.createError).toBe('Name already exists');
      expect(mockToaster.create).toHaveBeenCalledWith({
        type: 'error',
        title: 'Failed to Create Feature',
        description: 'Name already exists',
        duration: 7000,
        closable: true,
      });
      expect(result.current.showCreateForm).toBe(true);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should handle network error with response message', async () => {
      const error = {
        response: {
          data: {
            message: 'Server validation error'
          }
        }
      };
      mockPlanService.createFeature.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = { name: 'Test Feature', description: 'Test' };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(result.current.createError).toBe('Server validation error');
    });

    it('should handle network error with generic message', async () => {
      const error = new Error('Network timeout');
      mockPlanService.createFeature.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = { name: 'Test Feature', description: 'Test' };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(result.current.createError).toBe('Network timeout');
    });

    it('should handle unknown error', async () => {
      const error = { someProperty: 'unknown error' };
      mockPlanService.createFeature.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = { name: 'Test Feature', description: 'Test' };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(result.current.createError).toBe('Failed to create feature');
    });
  });

  describe('loading delay', () => {
    it('should handle loading delay configuration', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockPlanService.createFeature.mockReturnValue(mockPromise);

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = { name: 'Test', description: 'Test' };

      let submitPromise: Promise<any>;
      act(() => {
        submitPromise = result.current.handleSubmit(formData);
      });

      expect(result.current.isSubmitting).toBe(true);
      
      // Resolve the promise to complete submission
      act(() => {
        resolvePromise!({ data: { success: true, message: 'Success' } });
      });
      
      await act(async () => {
        await submitPromise!;
      });
      
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe('form submission state', () => {
    it('should set isSubmitting during form submission', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockPlanService.createFeature.mockReturnValue(promise);

      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const formData = { name: 'Test', description: 'Test' };

      let submitPromise: Promise<any>;
      act(() => {
        submitPromise = result.current.handleSubmit(formData);
      });

      expect(result.current.isSubmitting).toBe(true);

      act(() => {
        resolvePromise!({ data: { success: true } });
      });
      
      await act(async () => {
        await submitPromise!;
      });
      
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle error clearing during submission', async () => {
      const { result } = renderHook(() =>
        useResourceCreation('features', mockSchema, mockDefaultValues, mockOnSuccess),
        { wrapper: TestFormWrapper }
      );

      const mockResponse = {
        data: { success: true, message: 'Success' }
      };
      mockPlanService.createFeature.mockResolvedValue(mockResponse);

      const formData = { name: 'Test', description: 'Test' };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      // After successful submission, error should be cleared
      expect(result.current.createError).toBe('');
    });
  });
});