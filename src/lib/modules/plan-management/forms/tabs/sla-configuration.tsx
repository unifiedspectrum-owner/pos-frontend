/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'

/* Shared module imports */
import { ConfirmationDialog } from '@shared/components'

/* Plan module imports */
import { createSlaSchema, CreateSlaFormData } from '@plan-management/schemas'
import { useResourceManagement, useResourceCreation, useResourceSelection, useResourceConfirmation } from '@plan-management/hooks'
import { SupportSLA } from '@plan-management/types'
import { PLAN_FORM_MODES, SLA_SECTION_TITLES } from '@plan-management/constants'
import { ResourceSearchHeader } from '@plan-management/components'
import { usePlanFormMode } from '@plan-management/contexts'
import CreateSLAForm from '@plan-management/forms/tabs/components/slas/create-sla-form'
import SLAsGrid from '@plan-management/forms/tabs/components/slas/slas-grid'
import SelectedSLAsSummary from '@plan-management/forms/tabs/components/slas/selected-slas-summary'

/* SLA configuration tab component props */
interface PlanSlaConfigurationProps {
  isActive?: boolean /* Is this tab currently active */
}

/* SLA configuration form tab component */
const PlanSlaConfiguration: React.FC<PlanSlaConfigurationProps> = ({
  isActive = true
}) => {
  /* Get mode from context */
  const { mode } = usePlanFormMode()
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only mode */

  /* SLA data management with search and loading states */
  const {
    resources: slas,
    filteredResources: filteredSlas,
    loading,
    searchTerm,
    setSearchTerm,
    showSearch,
    toggleSearch,
    refetch: refetchSlas,
  } = useResourceManagement<SupportSLA>('slas', 'name', isActive);

  /* SLA selection state and toggle handlers */
  const {
    selectedIds: selectedSlaIds,
    selectedResources: selectedSlas,
    toggleSelection: handleSlaToggle,
    removeSelection: handleRemoveSla,
  } = useResourceSelection('support_sla_ids', slas);

  /* SLA creation form management */
  const {
    showCreateForm: showCreateSla,
    toggleCreateForm: toggleCreateSla,
    createForm: createSlaForm,
    isSubmitting: createSlaSubmitting,
    handleSubmit: handleCreateSla,
  } = useResourceCreation<CreateSlaFormData>(
    'slas',
    createSlaSchema,
    { name: '', support_channel: '', response_time_hours: '', availability_schedule: '', notes: '' },
    refetchSlas
  );

  /* SLA removal confirmation dialogs */
  const {
    confirmState,
    handleToggleWithConfirm,
    handleRemoveWithConfirm,
    handleConfirm,
    handleCancel,
  } = useResourceConfirmation({
    resources: slas,
    selectedIds: selectedSlaIds,
    onToggleSelection: handleSlaToggle,
    onRemoveSelection: handleRemoveSla,
    getResourceName: (sla: SupportSLA) => sla.name,
    resourceType: 'SLA'
  });

  /* Display logic based on mode and state */
  const displaySlas = isReadOnly 
    ? slas.filter(sla => selectedSlaIds.includes(sla.id))
    : filteredSlas;

  /* Header title based on current context */
  const getTitle = () => {
    if (showCreateSla) return SLA_SECTION_TITLES.CREATE;
    if (isReadOnly) {
      const count = selectedSlas.length;
      return `${SLA_SECTION_TITLES.INCLUDED} (${count})`;
    }
    return SLA_SECTION_TITLES.AVAILABLE;
  };

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Search header with create SLA toggle */}
      <ResourceSearchHeader
        title={getTitle()}
        showSearch={showSearch}
        searchTerm={searchTerm}
        onSearchToggle={toggleSearch}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search SLAs by name, channel, or schedule..."
        showCreateForm={showCreateSla}
        onCreateToggle={toggleCreateSla}
        createButtonText="Create New"
        isCreating={createSlaSubmitting}
        hideCreateButton={isReadOnly || loading}
        hideSearchButton={(isReadOnly && selectedSlas.length === 0) || loading}
      />

      {/* Create new SLA form interface */}
      {!isReadOnly && (
        <CreateSLAForm
          showCreateSla={showCreateSla}
          createSlaForm={createSlaForm}
          createSlaSubmitting={createSlaSubmitting}
          handleCreateSla={handleCreateSla}
        />
      )}

      {/* Available SLAs grid with selection */}
      {!showCreateSla && (
        <SLAsGrid
          loading={loading}
          displaySlas={displaySlas}
          selectedSlaIds={selectedSlaIds}
          isReadOnly={isReadOnly}
          handleToggleWithConfirm={handleToggleWithConfirm}
        />
      )}

      {/* Summary of currently selected SLAs */}
      {!isReadOnly && (
        <SelectedSLAsSummary
          selectedSlas={selectedSlas}
          onRemove={handleRemoveWithConfirm}
          readOnly={isReadOnly}
        />
      )}

      {/* SLA removal confirmation modal */}
      {!isReadOnly && (
        <ConfirmationDialog
        isOpen={confirmState.show}
        title="Remove SLA"
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

export default PlanSlaConfiguration;