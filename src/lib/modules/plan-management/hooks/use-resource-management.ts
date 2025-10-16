import { useState, useEffect } from 'react';
import { useForm, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFeatureOperations } from './use-feature-operations';
import { useAddonOperations } from './use-addon-operations';
import { useSlaOperations } from './use-sla-operations';

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

  /* Use the appropriate operations hook based on resource type */
  const featureOps = useFeatureOperations();
  const addonOps = useAddonOperations();
  const slaOps = useSlaOperations();

  /* Select the appropriate operations based on resourceKey */
  const { fetchFn, isFetchingState, fetchErrorState } = (() => {
    switch (resourceKey) {
      case 'features':
        return {
          fetchFn: featureOps.fetchFeatures,
          isFetchingState: featureOps.isFetching,
          fetchErrorState: featureOps.fetchError
        };
      case 'addons':
        return {
          fetchFn: addonOps.fetchAddons,
          isFetchingState: addonOps.isFetching,
          fetchErrorState: addonOps.fetchError
        };
      case 'slas':
        return {
          fetchFn: slaOps.fetchSlas,
          isFetchingState: slaOps.isFetching,
          fetchErrorState: slaOps.fetchError
        };
    }
  })();

  /* Load resources when shouldLoad is true and data hasn't been loaded yet */
  useEffect(() => {
    if (shouldLoad && !hasLoaded) {
      const loadData = async () => {
        const data = await fetchFn();
        if (data) {
          /* Sort resources based on specified criteria */
          const sortedResources = (data as unknown as T[]).sort((a: T, b: T) => {
            if (sortBy === 'display_order') {
              return a.display_order - b.display_order;
            }
            return a.name.localeCompare(b.name);
          });
          setResources(sortedResources);
          setHasLoaded(true);
        }
      };
      loadData();
    }
  }, [shouldLoad, hasLoaded, fetchFn, sortBy]);

  /* Sync loading and error state from the operations hooks */
  useEffect(() => {
    setLoading(isFetchingState);
  }, [isFetchingState]);

  useEffect(() => {
    if (fetchErrorState) {
      setError(fetchErrorState);
    }
  }, [fetchErrorState]);

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

  /* Refetch function */
  const refetch = async () => {
    setHasLoaded(false);
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
    refetch,
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

  /* Use the appropriate operations hook based on resource type */
  const featureOps = useFeatureOperations();
  const addonOps = useAddonOperations();
  const slaOps = useSlaOperations();

  /* Select the appropriate create function based on resourceKey */
  const { createFn, isCreatingState } = (() => {
    switch (resourceKey) {
      case 'features':
        return {
          createFn: featureOps.createFeature,
          isCreatingState: featureOps.isCreating
        };
      case 'addons':
        return {
          createFn: addonOps.createAddon,
          isCreatingState: addonOps.isCreating
        };
      case 'slas':
        return {
          createFn: slaOps.createSla,
          isCreatingState: slaOps.isCreating
        };
    }
  })();

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
    } else {
      /* Show create form */
      setShowCreateForm(true);
    }
  };

  /* Handle form submission */
  const handleSubmit = async (data: any) => {
    let requestData: any;

    /* Prepare request data based on resource type */
    switch (resourceKey) {
      case 'features':
        requestData = {
          name: data.name.trim(),
          description: data.description.trim()
        };
        break;
      case 'addons':
        requestData = {
          name: data.name.trim(),
          description: data.description.trim(),
          base_price: data.base_price ? parseFloat(data.base_price) : 0,
          pricing_scope: data.pricing_scope
        };
        break;
      case 'slas':
        requestData = {
          name: data.name.trim(),
          support_channel: data.support_channel.trim(),
          response_time_hours: parseInt(data.response_time_hours),
          availability_schedule: data.availability_schedule.trim(),
          notes: data.notes?.trim() || ''
        };
        break;
    }

    /* Call the appropriate create function */
    const success = await createFn(requestData);

    if (success) {
      /* Reset and close form */
      createForm.reset();
      setShowCreateForm(false);
      onSuccess?.();
    }
  };

  return {
    showCreateForm,
    toggleCreateForm,
    createForm,
    isSubmitting: isCreatingState,
    createError: null,
    handleSubmit,
  };
}