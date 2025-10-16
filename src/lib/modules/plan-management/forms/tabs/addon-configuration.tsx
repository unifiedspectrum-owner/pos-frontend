/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'
import { useFormContext, useFieldArray } from 'react-hook-form'

/* Shared module imports */
import { ConfirmationDialog } from '@shared/components'

/* Plan module imports */
import { CreatePlanFormData, createAddonSchema, CreateAddonFormData } from '@plan-management/schemas'
import { useResourceManagement, useResourceCreation, useResourceConfirmation } from '@plan-management/hooks'
import { Addon } from '@plan-management/types'
import { PLAN_FORM_MODES, ADDON_SECTION_TITLES, ADDON_FEATURE_LEVELS, ADDON_PRICING_SCOPES } from '@plan-management/constants'
import { ResourceSearchHeader } from '@plan-management/components'
import { usePlanFormMode } from '@plan-management/contexts'
import CreateAddonForm from '@plan-management/forms/tabs/components/addons/create-addon-form'
import AddonsGrid from '@plan-management/forms/tabs/components/addons/addons-grid'
import SelectedAddonsConfiguration from '@plan-management/forms/tabs/components/addons/selected-addons-configuration'

/* Addon configuration tab component props */
interface PlanAddonConfigurationProps {
  isActive?: boolean /* Is this tab currently active */
}

/* Addon configuration form tab component */
const PlanAddonConfiguration: React.FC<PlanAddonConfigurationProps> = ({
  isActive = true
}) => {
  /* Get mode from context */
  const { mode } = usePlanFormMode()

  /* Form context */
  const { control, formState: { errors } } = useFormContext<CreatePlanFormData>();
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
    handleSubmit: handleCreateAddon,
  } = useResourceCreation<CreateAddonFormData>(
    'addons',
    createAddonSchema,
    { name: '', description: '', base_price: '', pricing_scope: ADDON_PRICING_SCOPES.BRANCH },
    refetchAddons
  );

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
            feature_level: ADDON_FEATURE_LEVELS.BASIC,
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
    if (showCreateAddon) return ADDON_SECTION_TITLES.CREATE;
    if (isReadOnly) {
      const count = addonAssignments.length;
      return `${ADDON_SECTION_TITLES.INCLUDED} (${count})`;
    }
    return ADDON_SECTION_TITLES.AVAILABLE;
  };

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Search header with create addon toggle */}
      <ResourceSearchHeader
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