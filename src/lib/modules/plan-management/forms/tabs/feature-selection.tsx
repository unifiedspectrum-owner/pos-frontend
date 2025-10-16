/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'

/* Shared module imports */
import { ConfirmationDialog } from '@shared/components'

/* Plan module imports */
import { createFeatureSchema, CreateFeatureFormData } from '@plan-management/schemas'
import { useResourceManagement, useResourceCreation, useResourceSelection, useResourceConfirmation } from '@plan-management/hooks'
import { Feature } from '@plan-management/types'
import { PLAN_FORM_MODES, FEATURE_SECTION_TITLES } from '@plan-management/constants'
import { ResourceSearchHeader } from '@plan-management/components'
import { usePlanFormMode } from '@plan-management/contexts'
import CreateFeatureForm from '@plan-management/forms/tabs/components/features/create-feature-form'
import FeaturesGrid from '@plan-management/forms/tabs/components/features/features-grid'
import SelectedFeaturesSummary from '@plan-management/forms/tabs/components/features/selected-features-summary'

/* Feature selection tab component props */
interface PlanFeatureSelectionProps {
  isActive?: boolean /* Is this tab currently active */
}

/* Feature selection form tab component */
const PlanFeatureSelection: React.FC<PlanFeatureSelectionProps> = ({
  isActive = true
}) => {
  /* Get mode from context */
  const { mode } = usePlanFormMode()
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only mode */

  /* Feature data management with search and loading states */
  const {
    resources: features, 
    filteredResources: filteredFeatures,
    loading, 
    searchTerm, 
    setSearchTerm,
    showSearch, 
    toggleSearch, 
    refetch: refetchFeatures,
  } = useResourceManagement<Feature>('features', 'display_order', isActive);

  /* Feature selection state and toggle handlers */
  const {
    selectedIds: selectedFeatureIds, 
    selectedResources: selectedFeatures,
    toggleSelection: handleFeatureToggle, 
    removeSelection: handleRemoveFeature,
  } = useResourceSelection('feature_ids', features);

  /* Feature creation form management */
  const {
    showCreateForm: showCreateFeature, 
    toggleCreateForm: toggleCreateFeature,
    createForm: createFeatureForm, 
    isSubmitting: createFeatureSubmitting,
    handleSubmit: handleCreateFeature,
  } = useResourceCreation<CreateFeatureFormData>(
    'features', 
    createFeatureSchema, 
    { name: '', description: '' }, 
    refetchFeatures
  );

  /* Feature removal confirmation dialogs */
  const {
    confirmState,
    handleToggleWithConfirm,
    handleRemoveWithConfirm,
    handleConfirm,
    handleCancel,
  } = useResourceConfirmation({
    resources: features,
    selectedIds: selectedFeatureIds,
    onToggleSelection: handleFeatureToggle,
    onRemoveSelection: handleRemoveFeature,
    getResourceName: (feature: Feature) => feature.name,
    resourceType: 'Feature'
  });

  /* Display logic based on mode and state */
  const displayResources = isReadOnly 
    ? features.filter(feature => selectedFeatureIds.includes(feature.id))
    : filteredFeatures;

  /* Header title based on current context */
  const getTitle = () => {
    if (showCreateFeature) return FEATURE_SECTION_TITLES.CREATE;
    if (isReadOnly) {
      const count = selectedFeatures.length;
      return `${FEATURE_SECTION_TITLES.INCLUDED} (${count})`;
    }
    return FEATURE_SECTION_TITLES.AVAILABLE;
  };

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Search header with create feature toggle */}
      <ResourceSearchHeader
        title={getTitle()}
        showSearch={showSearch}
        searchTerm={searchTerm}
        onSearchToggle={toggleSearch}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search features by name or description..."
        showCreateForm={showCreateFeature}
        onCreateToggle={toggleCreateFeature}
        createButtonText="Create New"
        isCreating={createFeatureSubmitting}
        hideCreateButton={isReadOnly || loading}
        hideSearchButton={(isReadOnly && selectedFeatures.length === 0) || loading}
      />

      {/* Create new feature form interface */}
      {!isReadOnly && (
        <CreateFeatureForm
          showCreateFeature={showCreateFeature}
          createFeatureForm={createFeatureForm}
          createFeatureSubmitting={createFeatureSubmitting}
          handleCreateFeature={handleCreateFeature}
        />
      )}

      {/* Available features grid with selection */}
      {!showCreateFeature && (
        <FeaturesGrid
          loading={loading}
          displayResources={displayResources}
          selectedFeatureIds={selectedFeatureIds}
          isReadOnly={isReadOnly}
          handleToggleWithConfirm={handleToggleWithConfirm}
        />
      )}

      {/* Summary of currently selected features */}
      {!isReadOnly && (
        <SelectedFeaturesSummary
          selectedFeatures={selectedFeatures}
          onRemove={handleRemoveWithConfirm}
          readOnly={isReadOnly}
        />
      )}

      {/* Feature removal confirmation modal */}
      {!isReadOnly && (
        <ConfirmationDialog
          isOpen={confirmState.show}
          title="Remove Feature"
          message={`Are you sure you want to remove "${confirmState.resourceName}" from this plan?`}
          confirmText="Remove"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </Flex>
  );
};

export default PlanFeatureSelection;