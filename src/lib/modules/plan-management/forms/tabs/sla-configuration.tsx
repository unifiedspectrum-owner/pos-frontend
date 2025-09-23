import { Flex } from '@chakra-ui/react'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { CreatePlanFormData, createSlaSchema, CreateSlaFormData } from '@plan-management/schemas/validation/plans'
import { useTabValidation, useResourceManagement, useResourceCreation, useResourceSelection, useResourceConfirmation, useTabValidationNavigation } from '@plan-management/hooks'
import { SupportSLA, PlanFormMode } from '@plan-management/types'
import { PLAN_FORM_MODES } from '@plan-management/config'
import { ConfirmationDialog } from '@shared/components'
import { TabNavigation, SearchHeader } from '@plan-management/components'
import CreateSLAForm from '@plan-management/forms/tabs/components/slas/create-sla-form'
import SLAsGrid from '@plan-management/forms/tabs/components/slas/slas-grid'
import SelectedSLAsSummary from '@plan-management/forms/tabs/components/slas/selected-slas-summary'

/* SLA configuration tab component props */
interface PlanSlaConfigurationProps {
  mode: PlanFormMode /* Form operation mode */
  onNext?: () => void /* Next tab navigation handler */
  onPrevious?: () => void /* Previous tab navigation handler */
  isFirstTab?: boolean /* Is this the first tab in sequence */
  onSubmit?: (data: CreatePlanFormData) => void /* Form submission handler */
  onEdit?: () => void /* Edit mode handler */
  onBackToList?: () => void /* Return to list handler */
  submitButtonText?: string /* Custom submit button text */
  isSubmitting?: boolean /* Is form currently submitting */
  isActive?: boolean /* Is this tab currently active */
}

/* SLA configuration form tab component */
const PlanSlaConfiguration: React.FC<PlanSlaConfigurationProps> = ({ 
  mode,
  onNext, 
  onPrevious,
  isFirstTab = false,
  onSubmit,
  onEdit,
  onBackToList,
  submitButtonText = "Create Plan",
  isSubmitting = false,
  isActive = true
}) => {
  /* Form context and validation hooks */
  const { getValues } = useFormContext<CreatePlanFormData>();
  const { isEntireFormValid: isFormValid } = useTabValidation(getValues);
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only mode */;

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

  /* Tab navigation with validation for final tab */
  const { handleNext: handleNextNavigation } = useTabValidationNavigation(['support_sla_ids'], isReadOnly, () => {
    /* Custom navigation logic for final SLA tab */
    if (isFormValid && onSubmit) {
      onSubmit(getValues());
    } else if (onNext) {
      onNext();
    }
  });

  /* Wrapper function for form submission without parameters */
  const handleFormSubmit = () => {
    if (onSubmit) {
      onSubmit(getValues());
    }
  };

  /* Enhanced next handler with form submission logic */
  const handleNext = async () => {
    /* In read-only mode handle submission directly */
    if (isReadOnly) {
      if (isFormValid && onSubmit) {
        onSubmit(getValues());
      } else if (onNext) {
        onNext();
      }
      return;
    }

    /* Use navigation hook for validation and proceed */
    await handleNextNavigation();
  };


  /* Display logic based on mode and state */
  const displaySlas = isReadOnly 
    ? slas.filter(sla => selectedSlaIds.includes(sla.id))
    : filteredSlas;

  /* Header title based on current context */
  const getTitle = () => {
    if (showCreateSla) return "Create SLA";
    if (isReadOnly) {
      const count = selectedSlas.length;
      return `Included SLAs (${count})`;
    }
    return "Available SLAs";
  };

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Search header with create SLA toggle */}
      <SearchHeader
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

      {/* Tab navigation with form submission controls */}
      <TabNavigation
        onNext={handleNext}
        onPrevious={onPrevious}
        onSubmit={handleFormSubmit}
        onEdit={onEdit}
        onBackToList={onBackToList}
        isFirstTab={isFirstTab}
        isLastTab={true}
        isSubmitting={isSubmitting}
        isFormValid={isFormValid}
        submitButtonText={submitButtonText}
        readOnly={isReadOnly}
      />

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