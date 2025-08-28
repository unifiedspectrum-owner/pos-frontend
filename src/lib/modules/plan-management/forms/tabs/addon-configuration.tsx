import React from 'react'
import { Flex } from '@chakra-ui/react'
import { useFormContext, useFieldArray } from 'react-hook-form'

/* Types & Schemas */
import { CreatePlanFormData, createAddonSchema, CreateAddonFormData } from '@plan-management/schemas/validation/plans'
import { useTabValidation, useResourceManagement, useResourceCreation, useTabValidationNavigation, useResourceConfirmation } from '@plan-management/hooks'
import { Addon, AddonAssignment, PlanFormMode } from '@plan-management/types'
import { PLAN_FORM_MODES } from '@plan-management/config'
import { ConfirmationDialog } from '@shared/components'
import { TabNavigation, SearchHeader } from '@plan-management/components'

import CreateAddonForm from '@plan-management/forms/tabs/components/addons/create-addon-form'
import AddonsGrid from '@plan-management/forms/tabs/components/addons/addons-grid'
import SelectedAddonsConfiguration from '@plan-management/forms/tabs/components/addons/selected-addons-configuration'

/* Addon configuration tab component props */
interface PlanAddonConfigurationProps {
  mode: PlanFormMode /* Form operation mode */
  onNext?: () => void /* Next tab navigation handler */
  onPrevious?: () => void /* Previous tab navigation handler */
  isFirstTab?: boolean /* Is this the first tab in sequence */
  isActive?: boolean /* Is this tab currently active */
}

/* Addon configuration form tab component */
const PlanAddonConfiguration: React.FC<PlanAddonConfigurationProps> = ({ 
  mode,
  onNext, 
  onPrevious, 
  isFirstTab = false,
  isActive = true
}) => {
  /* Form context and validation hooks */
  const { control, formState: { errors }, getValues } = useFormContext<CreatePlanFormData>();
  const { isAddonsValid } = useTabValidation(getValues);
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only mode */;

  /* Addon assignments field array management */
  const { fields: addonAssignments, append, remove } = useFieldArray({
    control,
    name: 'addon_assignments'
  });

  /* Addon data management with search and loading states */
  const {
    resources: addons,
    filteredResources: filteredAddons,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    showSearch,
    toggleSearch,
    refetch: refetchAddons,
  } = useResourceManagement<Addon>('addons', 'display_order', isActive);

  /* Addon creation form management */
  const {
    showCreateForm: showCreateAddon,
    toggleCreateForm: toggleCreateAddon,
    createForm: createAddonForm,
    isSubmitting: createAddonSubmitting,
    createError: createAddonError,
    handleSubmit: handleCreateAddon,
  } = useResourceCreation<CreateAddonFormData>(
    'addons',
    createAddonSchema,
    { name: '', description: '', base_price: '', pricing_scope: 'branch' },
    refetchAddons
  );

  /* Tab navigation with validation */
  const { handleNext } = useTabValidationNavigation(['addon_assignments'], isReadOnly, onNext);

  /* Extract selected addon IDs for confirmation dialogs */
  const selectedAddonIds = addonAssignments.map((a) => a.addon_id);

  /* Addon removal confirmation dialogs */
  const {
    confirmState,
    handleToggleWithConfirm,
    handleRemoveWithConfirm,
    handleConfirm,
    handleCancel,
  } = useResourceConfirmation({
    resources: addons,
    selectedIds: selectedAddonIds,
    onToggleSelection: (addonId: number) => {
      const existingIndex = addonAssignments.findIndex((a) => a.addon_id === addonId);
      
      if (existingIndex >= 0) {
        /* Remove existing addon assignment */
        remove(existingIndex);
      } else {
        /* Add new addon assignment with defaults */
        const addon = addons.find(a => a.id === addonId);
        if (addon) {
          append({
            addon_id: addonId,
            feature_level: 'basic',
            is_included: false,
            default_quantity: addon.default_quantity || null,
            min_quantity: addon.min_quantity || null,
            max_quantity: null
          });
        }
      }
    },
    onRemoveSelection: (addonId: number) => {
      const existingIndex = addonAssignments.findIndex((a) => a.addon_id === addonId);
      if (existingIndex >= 0) {
        remove(existingIndex);
      }
    },
    getResourceName: (addon: Addon) => addon.name,
    resourceType: 'Add-on'
  });

  /* Handle addon removal from configuration cards */
  const handleRemoveAddonFromCard = (assignmentIndex: number) => {
    const assignment = addonAssignments[assignmentIndex];
    if (assignment) {
      handleRemoveWithConfirm(assignment.addon_id);
    }
  };


  /* Display logic based on mode and state */
  const displayAddons = isReadOnly 
    ? addons.filter(addon => addonAssignments.some((a) => a.addon_id === addon.id))
    : filteredAddons;

  /* Header title based on current context */
  const getTitle = () => {
    if (showCreateAddon) return "Create Add-on";
    if (isReadOnly) {
      const count = addonAssignments.length;
      return `Included Add-ons (${count})`;
    }
    return "Available Add-ons";
  };

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Search header with create addon toggle */}
      <SearchHeader
        title={getTitle()}
        showSearch={showSearch}
        searchTerm={searchTerm}
        onSearchToggle={toggleSearch}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search add-ons by name or description..."
        showCreateForm={showCreateAddon}
        onCreateToggle={toggleCreateAddon}
        createButtonText="Create New"
        isCreating={createAddonSubmitting}
        hideCreateButton={isReadOnly || loading}
        hideSearchButton={(isReadOnly && addonAssignments.length === 0) || loading}
      />

      {/* Create new addon form interface */}
      {!isReadOnly && (
        <CreateAddonForm
          showCreateAddon={showCreateAddon}
          createAddonForm={createAddonForm}
          createAddonSubmitting={createAddonSubmitting}
          createAddonError={createAddonError}
          handleCreateAddon={handleCreateAddon}
        />
      )}

      {/* Available addons grid with selection */}
      {!showCreateAddon && (
        <AddonsGrid
          loading={loading}
          displayAddons={displayAddons}
          addonAssignments={addonAssignments}
          isReadOnly={isReadOnly}
          control={control}
          handleToggleWithConfirm={handleToggleWithConfirm}
        />
      )}

      {/* Configuration settings for selected addons */}
      {!isReadOnly && (
        <SelectedAddonsConfiguration
          addonAssignments={addonAssignments}
          addons={addons}
          errors={errors}
          control={control}
          onRemoveAddon={handleRemoveAddonFromCard}
        />
      )}

      {/* Tab navigation with validation state */}
      <TabNavigation
        onNext={handleNext}
        onPrevious={onPrevious}
        readOnly={isReadOnly}
        isFormValid={isAddonsValid}
      />

      {/* Addon removal confirmation modal */}
      {!isReadOnly && (
        <ConfirmationDialog
          isOpen={confirmState.show}
          title="Remove Add-on"
          message={`Are you sure you want to remove "${confirmState.resourceName}" from this plan? This will delete all configuration settings for this add-on.`}
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

export default PlanAddonConfiguration;