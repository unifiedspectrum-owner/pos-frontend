import { useState, useCallback } from 'react';

/* Hook props for resource confirmation dialog */
interface UseResourceConfirmationProps<T> {
  resources: T[]; /* Available resources array */
  selectedIds: number[]; /* Currently selected resource IDs */
  onToggleSelection: (id: number) => void; /* Handler for selection toggle */
  onRemoveSelection: (id: number) => void; /* Handler for resource removal */
  getResourceName: (resource: T) => string; /* Function to extract resource name */
  resourceType: string; /* Resource type label for UI display */
}

/* Custom hook for resource deselection confirmation dialogs */
export const useResourceConfirmation = <T extends { id: number }>({
  resources,
  selectedIds,
  onToggleSelection,
  onRemoveSelection,
  getResourceName,
  resourceType
}: UseResourceConfirmationProps<T>) => {
  /* State for confirmation dialog */
  const [confirmState, setConfirmState] = useState<{
    show: boolean; /* Dialog visibility state */
    resourceId?: number; /* ID of resource to be removed */
    resourceName?: string; /* Display name of resource */
  }>({ show: false });

  /* Handle resource toggle with deselection confirmation */
  const handleToggleWithConfirm = useCallback((resourceId: number) => {
    const isCurrentlySelected = selectedIds.includes(resourceId);
    
    if (isCurrentlySelected) {
      /* Show confirmation dialog for deselection */
      const resource = resources.find(r => r.id === resourceId);
      setConfirmState({
        show: true,
        resourceId,
        resourceName: resource ? getResourceName(resource) : `Unknown ${resourceType}`
      });
    } else {
      /* Direct selection without confirmation */
      onToggleSelection(resourceId);
    }
  }, [selectedIds, resources, getResourceName, resourceType, onToggleSelection]);

  /* Handle resource removal with confirmation dialog */
  const handleRemoveWithConfirm = useCallback((resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    setConfirmState({
      show: true,
      resourceId,
      resourceName: resource ? getResourceName(resource) : `Unknown ${resourceType}`
    });
  }, [resources, getResourceName, resourceType]);

  /* Confirm resource removal and close dialog */
  const handleConfirm = useCallback(() => {
    if (confirmState.resourceId) {
      onRemoveSelection(confirmState.resourceId);
    }
    setConfirmState({ show: false });
  }, [confirmState.resourceId, onRemoveSelection]);

  /* Cancel resource removal and close dialog */
  const handleCancel = useCallback(() => {
    setConfirmState({ show: false });
  }, []);

  return {
    confirmState,
    handleToggleWithConfirm,
    handleRemoveWithConfirm,
    handleConfirm,
    handleCancel,
    resourceType
  };
};