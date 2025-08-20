import { useFormContext } from 'react-hook-form';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';

/* Hook for managing resource selection (features, SLAs, addons) */
export function useResourceSelection<T extends { id: number }>(
  fieldName: keyof CreatePlanFormData,
  resources: T[]
) {
  const { watch, setValue, trigger } = useFormContext<CreatePlanFormData>();
  
  /* Get selected resource IDs */
  const selectedIds = (watch(fieldName) as number[]) || [];

  /* Toggle resource selection */
  const toggleSelection = (resourceId: number) => {
    const isSelected = selectedIds.includes(resourceId);
    
    let newIds;
    if (isSelected) {
      /* Remove resource from selection */
      newIds = selectedIds.filter(id => id !== resourceId);
    } else {
      /* Add resource to selection */
      newIds = [...selectedIds, resourceId];
    }
    
    setValue(fieldName, newIds, { shouldValidate: true, shouldDirty: true });
  };

  /* Remove resource from selection */
  const removeSelection = (resourceId: number) => {
    const newIds = selectedIds.filter(id => id !== resourceId);
    setValue(fieldName, newIds, { shouldValidate: true, shouldDirty: true });
  };

  /* Get selected resources */
  const selectedResources = resources.filter(resource => 
    selectedIds.includes(resource.id)
  );

  /* Check if resource is selected */
  const isSelected = (resourceId: number) => selectedIds.includes(resourceId);

  /* Validate selection */
  const validateSelection = async () => {
    return await trigger([fieldName]);
  };

  return {
    selectedIds,
    selectedResources,
    toggleSelection,
    removeSelection,
    isSelected,
    validateSelection,
  };
}