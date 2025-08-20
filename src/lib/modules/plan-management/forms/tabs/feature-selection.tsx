import { Flex } from '@chakra-ui/react'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { CreatePlanFormData, createFeatureSchema, CreateFeatureFormData } from '@plan-management/schemas/validation/plans'
import { useTabValidation } from '@plan-management/hooks/use-tab-validation'
import { Feature } from '@plan-management/types'
import { PlanFormMode } from '@plan-management/types'
import { useResourceManagement, useResourceCreation, useResourceSelection, useResourceConfirmation, useTabValidationNavigation } from '@plan-management/hooks'
import { ConfirmationDialog } from '@shared/components'
import { TabNavigation, SearchHeader } from '@plan-management/components'
import { PLAN_FORM_MODES } from '@plan-management/config'
import CreateFeatureForm from './components/features/create-feature-form'
import FeaturesGrid from './components/features/features-grid'
import SelectedFeaturesSummary from './components/features/selected-features-summary'

/* Feature selection tab component props */
interface PlanFeatureSelectionProps {
  mode: PlanFormMode /* Form operation mode */
  onNext?: () => void /* Next tab navigation handler */
  onPrevious?: () => void /* Previous tab navigation handler */
  isActive?: boolean /* Is this tab currently active */
}

/* Feature selection form tab component */
const PlanFeatureSelection: React.FC<PlanFeatureSelectionProps> = ({ 
  mode,
  onNext, 
  onPrevious, 
  isActive = true
}) => {
  /* Form context and validation hooks */
  const { getValues } = useFormContext<CreatePlanFormData>();
  const { isFeaturesValid } = useTabValidation(getValues);
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only mode */;

  /* Feature data management with search and loading states */
  const {
    resources: features, 
    filteredResources: filteredFeatures,
    loading, 
    error, 
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
    createError: createFeatureError, 
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

  /* Tab navigation with validation */
  const { handleNext } = useTabValidationNavigation(['feature_ids'], isReadOnly, onNext);

  /* Display logic based on mode and state */
  const displayResources = isReadOnly 
    ? features.filter(feature => selectedFeatureIds.includes(feature.id))
    : filteredFeatures;

  /* Header title based on current context */
  const getTitle = () => {
    if (showCreateFeature) return "Create Feature";
    if (isReadOnly) {
      const count = selectedFeatures.length;
      return `Included Features (${count})`;
    }
    return "Available Features";
  };

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Search header with create feature toggle */}
      <SearchHeader
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

      {/* Tab navigation with validation state */}
      <TabNavigation
        onNext={handleNext}
        onPrevious={onPrevious}
        isFormValid={isFeaturesValid}
        readOnly={isReadOnly}
      />

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