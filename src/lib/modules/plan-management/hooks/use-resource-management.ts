import { useState, useEffect, useCallback } from 'react';
import { useForm, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { planService } from '@plan-management/api';
import { toaster } from '@/components/ui/toaster';
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config';
import { useResourceErrors } from '@shared/contexts';

/* Generic hook for managing resource data (features, addons, SLAs) */
export function useResourceManagement<T extends { id: number; name: string; display_order: number }>(
  resourceKey: 'features' | 'addons' | 'slas',
  sortBy: 'display_order' | 'name' = 'name',
  shouldLoad: boolean = true
) {
  /* Resource data state */
  const [resources, setResources] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  /* Search functionality state */
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);

  /* Resource error context (optional) */
  let addError: any, removeError: any, clearAllErrors: any;
  try {
    const context = useResourceErrors();
    addError = context.addError;
    removeError = context.removeError;
    clearAllErrors = context.clearAllErrors;
  } catch {
    /* Context not available, use no-ops */
    addError = () => {};
    removeError = () => {};
    clearAllErrors = () => {};
  }

  /* API fetch function */
  const fetchResources = useCallback(() => async () => {
    try {
      setLoading(true);
      setError('');
      clearAllErrors(); /* Clear error message immediately when retry is triggered */

      /* Add loading delay if requested */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
      }
      
      let response;
      switch (resourceKey) {
        case 'features':
          response = await planService.getAllFeatures();
          break;
        case 'addons':
          response = await planService.getAllAddOns();
          break;
        case 'slas':
          response = await planService.getAllSLAs();
          break;
      }
      
      if (response.data.success && response.data.data) {
        /* Sort resources based on specified criteria */
        const sortedResources = (response.data.data as unknown as T[]).sort((a: T, b: T) => {
          if (sortBy === 'display_order') {
            return a.display_order - b.display_order;
          }
          return a.name.localeCompare(b.name);
        });
        setResources(sortedResources);
        setHasLoaded(true);
        setError('');
        removeError(resourceKey); /* Clear any existing error for this resource */
        clearAllErrors(); /* Clear any global error since a resource loaded successfully */
      } else {
        const errorMessage = response.data.message || `Failed to fetch ${resourceKey}`;
        setError(errorMessage);
        addError({
          id: resourceKey,
          error: errorMessage,
          title: `Error Loading ${resourceKey.charAt(0).toUpperCase() + resourceKey.slice(1)}`,
          onRetry: fetchResources,
          isRetrying: loading
        });
      }
    } catch (err: any) {
      console.error(`[ResourceManagement] Error fetching ${resourceKey}:`, err);
      const errorMessage = `Failed to load ${resourceKey}. Please try again.`;
      setError(errorMessage);
      addError({
        id: resourceKey,
        error: err,
        title: `Error Loading ${resourceKey.charAt(0).toUpperCase() + resourceKey.slice(1)}`,
        onRetry: fetchResources,
        isRetrying: loading
      });
    } finally {
      setLoading(false);
    }
  }, [addError, clearAllErrors, loading, removeError, resourceKey, sortBy]);

  /* Load resources when shouldLoad is true and data hasn't been loaded yet */
  useEffect(() => {
    if (shouldLoad && !hasLoaded && !loading) {
      const loadData = fetchResources();
      loadData();
    }
  }, [shouldLoad, hasLoaded, loading, fetchResources]);

  /* Search functionality */
  const filteredResources = resources.filter((resource: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resource.name.toLowerCase().includes(searchLower) ||
      resource.description?.toLowerCase().includes(searchLower) ||
      resource.support_channel?.toLowerCase().includes(searchLower) ||
      resource.availability_schedule?.toLowerCase().includes(searchLower)
    );
  });

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm(''); /* Clear search term when hiding search */
    }
  };

  return {
    resources,
    filteredResources,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    showSearch,
    toggleSearch,
    refetch: fetchResources,
  };
}

/* Hook for managing resource creation forms */
export function useResourceCreation<T extends FieldValues>(
  resourceKey: 'features' | 'addons' | 'slas',
  schema: any,
  defaultValues: DefaultValues<T>,
  onSuccess?: () => void
) {
  /* Create form state */
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<any>(null);

  /* Resource error context (optional) */
  let addError: any, removeError: any;
  try {
    const context = useResourceErrors();
    addError = context.addError;
    removeError = context.removeError;
  } catch {
    /* Context not available, use no-ops */
    addError = () => {};
    removeError = () => {};
  }

  /* Create form setup */
  const createForm = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues
  });

  /* Toggle create form */
  const toggleCreateForm = () => {
    if (showCreateForm) {
      /* Reset form and error state when closing */
      setShowCreateForm(false);
      createForm.reset();
      setCreateError(null);
      removeError(`create-${resourceKey}`);
    } else {
      /* Show create form */
      setShowCreateForm(true);
      setCreateError(null);
      removeError(`create-${resourceKey}`);
    }
  };

  /* Handle form submission */
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setCreateError(null);
    removeError(`create-${resourceKey}`);

    try {
      /* Add loading delay if requested */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
      }

      let response;
      switch (resourceKey) {
        case 'features':
          response = await planService.createFeature({
            name: data.name.trim(),
            description: data.description.trim()
          });
          break;
        case 'addons':
          response = await planService.createAddOn({
            name: data.name.trim(),
            description: data.description.trim(),
            base_price: data.base_price ? parseFloat(data.base_price) : 0,
            pricing_scope: data.pricing_scope
          });
          break;
        case 'slas':
          response = await planService.createSLA({
            name: data.name.trim(),
            support_channel: data.support_channel.trim(),
            response_time_hours: parseInt(data.response_time_hours),
            availability_schedule: data.availability_schedule.trim(),
            notes: data.notes?.trim() || ''
          });
          break;
      }

      if (response.data.success) {
        /* Show success toast */
        const resourceName = data.name.trim();
        const resourceTypeMap = {
          features: 'Feature',
          addons: 'Add-on', 
          slas: 'SLA'
        };
        const resourceType = resourceTypeMap[resourceKey];
        
        toaster.create({
          type: 'success',
          title: `${resourceType} Created Successfully`,
          description: `"${resourceName}" has been added to the ${resourceKey} list.`,
          duration: 5000,
          closable: true,
        });
        
        /* Reset and close form */
        createForm.reset();
        setShowCreateForm(false);
        setCreateError(null);
        removeError(`create-${resourceKey}`);
        onSuccess?.();
      } else {
        const errorMessage = response.data.message || `Failed to create ${resourceKey.slice(0, -1)}`;
        const resourceTypeMap = {
          features: 'Feature',
          addons: 'Add-on', 
          slas: 'SLA'
        };
        const resourceType = resourceTypeMap[resourceKey];
        
        const errorObj = {
          id: `create-${resourceKey}`,
          error: errorMessage,
          title: `Failed to Create ${resourceType}`,
          onRetry: () => handleSubmit(data),
          isRetrying: isSubmitting
        };
        
        setCreateError(errorObj);
        addError(errorObj);
      }
    } catch (error: any) {
      console.error(`[ResourceCreation] Error creating ${resourceKey.slice(0, -1)}:`, error);
      
      let errorMessage = '';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Failed to create ${resourceKey.slice(0, -1)}`;
      }
      
      const resourceTypeMap = {
        features: 'Feature',
        addons: 'Add-on', 
        slas: 'SLA'
      };
      const resourceType = resourceTypeMap[resourceKey];
      
      const errorObj = {
        id: `create-${resourceKey}`,
        error: errorMessage,
        title: `Failed to Create ${resourceType}`,
        onRetry: () => handleSubmit(data),
        isRetrying: isSubmitting
      };
      
      setCreateError(errorObj);
      addError(errorObj);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showCreateForm,
    toggleCreateForm,
    createForm,
    isSubmitting,
    createError,
    handleSubmit,
  };
}