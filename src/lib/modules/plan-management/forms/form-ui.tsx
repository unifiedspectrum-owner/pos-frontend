/* React and Chakra UI component imports */
import React, { useMemo } from 'react'
import { Flex, Tabs, Text, HStack, Box } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaLock, FaCheck } from 'react-icons/fa'
import { useFormContext } from 'react-hook-form'
import { useRouter } from 'next/navigation'

/* Shared module imports */
import { GRAY_COLOR, PRIMARY_COLOR } from '@shared/config'
import { ErrorMessageContainer } from '@shared/components'
import { useResourceErrors } from '@shared/contexts'

/* Plan module imports */
import { PlanFormTab } from '@plan-management/types'
import { CreatePlanFormData, BASIC_INFO_FIELD_KEYS, PRICING_INFO_FIELD_KEYS, FEATURES_INFO_FIELD_KEYS, ADDONS_INFO_FIELD_KEYS, SLA_INFO_FIELD_KEYS } from '@plan-management/schemas'
import { PLAN_MANAGEMENT_FORM_TABS, PLAN_FORM_MODES, PLAN_PAGE_ROUTES, PLAN_FORM_TAB } from '@plan-management/constants'
import { PlanBasicDetails, PlanPricingConfiguration, PlanFeatureSelection, PlanAddonConfiguration, PlanSlaConfiguration } from '@plan-management/forms/tabs'
import { usePlanFormMode } from '@plan-management/contexts'
import { TabNavigation } from '@plan-management/components'
import { useTabValidation } from '@plan-management/hooks'

/* Form UI component props interface */
interface PlanFormUIProps {
  activeTab: PlanFormTab | null /* Currently active tab */
  showSavedIndicator: boolean /* Auto-save indicator visibility */
  isSubmitting: boolean /* Form submission state */
  tabUnlockState: Record<PlanFormTab, boolean> /* Tab accessibility state */
  onTabChange: (tabId: PlanFormTab) => void /* Tab navigation handler */
  onNextTab: () => void /* Next tab navigation */
  onPreviousTab: () => void /* Previous tab navigation */
  onSubmit: (data: CreatePlanFormData) => void /* Form submission handler */
}

/* Main form UI component with tab navigation */
const PlanFormUI: React.FC<PlanFormUIProps> = ({
  activeTab, showSavedIndicator, isSubmitting,
  tabUnlockState, onTabChange, onNextTab, onPreviousTab, onSubmit
}) => {
  /* Get mode and planId from context */
  const { mode, planId } = usePlanFormMode()
  const router = useRouter()

  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only view mode */

  /* Get resource loading errors from context */
  const { error, removeError } = useResourceErrors()

  /* Get form context for submission handling */
  const { handleSubmit, getValues, trigger } = useFormContext<CreatePlanFormData>()

  /* Calculate form validation state for current tab */
  const {
    isBasicInfoValid,
    isPricingInfoValid,
    isFeaturesValid,
    isAddonsValid,
    isEntireFormValid
  } = useTabValidation(getValues)

  /* Navigation handlers for view mode */
  const handleEditNavigation = () => {
    if (planId) router.push(PLAN_PAGE_ROUTES.EDIT.replace(':id', planId.toString()))
  }

  const handleBackToList = () => {
    router.push(PLAN_PAGE_ROUTES.HOME)
  }

  /* Determine current tab validation state */
  const getCurrentTabValidation = () => {
    switch(activeTab) {
      case PLAN_FORM_TAB.BASIC:
        return isBasicInfoValid
      case PLAN_FORM_TAB.PRICING:
        return isPricingInfoValid
      case PLAN_FORM_TAB.FEATURES:
        return isFeaturesValid
      case PLAN_FORM_TAB.ADDONS:
        return isAddonsValid
      case PLAN_FORM_TAB.SLA:
        return isEntireFormValid
      default:
        return false
    }
  }

  /* Compute submit button text based on mode and submitting state */
  const submitButtonText = useMemo(() => {
    if (isSubmitting) {
      return mode === PLAN_FORM_MODES.CREATE ? 'Creating...' : 'Updating...'
    }
    return mode === PLAN_FORM_MODES.CREATE ? 'Create Plan' : 'Update Plan'
  }, [mode, isSubmitting])

  /* Handle next tab navigation with validation */
  const handleNextTabWithValidation = async () => {
    /* Skip validation in read-only mode */
    if (isReadOnly) {
      onNextTab()
      return
    }

    /* Get validation fields for current tab */
    let fieldsToValidate: Array<keyof CreatePlanFormData> = []

    switch(activeTab) {
      case PLAN_FORM_TAB.BASIC:
        fieldsToValidate = BASIC_INFO_FIELD_KEYS
        break
      case PLAN_FORM_TAB.PRICING:
        fieldsToValidate = PRICING_INFO_FIELD_KEYS
        break
      case PLAN_FORM_TAB.FEATURES:
        fieldsToValidate = FEATURES_INFO_FIELD_KEYS
        break
      case PLAN_FORM_TAB.ADDONS:
        fieldsToValidate = ADDONS_INFO_FIELD_KEYS
        break
      case PLAN_FORM_TAB.SLA:
        fieldsToValidate = SLA_INFO_FIELD_KEYS
        break
      default:
        break
    }

    /* Validate current tab fields before proceeding */
    const isValid = await trigger(fieldsToValidate)

    if (isValid) {
      onNextTab()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex flexDir="column" gap={4}>
        {/* Display resource loading error messages */}
        {error && (
          <ErrorMessageContainer
            error={error.error}
            title={error.title}
            onRetry={error.onRetry}
            onDismiss={() => removeError(error.id)}
            isRetrying={error.isRetrying}
            testId={`${error.id}-error`}
          />
        )}
        
        {/* Main tab container with navigation */}
        <Flex flexDir={'column'} p={5} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
          <Tabs.Root w="100%" value={activeTab} variant="outline" size="md" 
            onValueChange={(e) => onTabChange(e.value as PlanFormTab)}>
            
            {/* Tab headers with unlock state and save indicator */}
            <HStack justify="space-between" align="center" mb={2}>
              <Tabs.List borderBottomWidth={1} gap={1} borderColor={lighten(0.3, GRAY_COLOR)} flex={1}>
                {PLAN_MANAGEMENT_FORM_TABS.map((item) => {
                  const Icon = item.icon
                  const isUnlocked = tabUnlockState[item.label]
                  const isSelected = item.label === activeTab

                  return (
                    <Tabs.Trigger key={item.label} alignItems="center" justifyContent="space-between"
                      h="60px" borderWidth={1} borderBottomWidth={isSelected ? 0 : 1}
                      borderColor={lighten(0.3, GRAY_COLOR)} borderTopRadius={10} w="15%" p={5}
                      value={item.label} disabled={!isUnlocked} opacity={isUnlocked ? 1 : 0.8}
                      cursor={isUnlocked ? 'pointer' : 'not-allowed'}
                      _hover={isUnlocked ? { bg: lighten(0.47, PRIMARY_COLOR) } : {}}>

                      {/* Tab icon and label display */}
                      <Flex align="center" justify="center" gap="5px">
                        <Text fontSize="lg">
                          <Icon color={isUnlocked ? PRIMARY_COLOR : lighten(0.3, GRAY_COLOR)} />
                        </Text>
                        <Text color={isUnlocked ? 'inherit' : lighten(0.3, GRAY_COLOR)}>
                          {item.label}
                        </Text>
                      </Flex>

                      {/* Lock icon for inaccessible tabs */}
                      {!isUnlocked && <Text fontSize="md" color={GRAY_COLOR}><FaLock/></Text>}
                    </Tabs.Trigger>
                  )
                })}
              </Tabs.List>
              
              {/* Auto-save indicator for create mode only */}
              {mode === PLAN_FORM_MODES.CREATE && (
                <Box
                  opacity={showSavedIndicator ? 1 : 0}
                  transform={showSavedIndicator ? 'translateX(0)' : 'translateX(10px)'}
                  transition="all 0.3s ease-in-out"
                  ml={4}
                >
                  <HStack gap={2} bg="green.50" color="green.600" px={3} py={1} borderRadius="full" 
                    fontSize="sm" fontWeight="medium" border="1px solid" borderColor="green.200">
                    <FaCheck size={12} />
                    <Text>Saved</Text>
                  </HStack>
                </Box>
              )}
            </HStack>
            <Tabs.ContentGroup borderTopWidth={0}>
              {
                PLAN_MANAGEMENT_FORM_TABS.map(item => {
                  switch(item.label) {
                    case PLAN_FORM_TAB.BASIC:
                      return (
                        <Tabs.Content key={item.label} borderTopWidth={0} value={item.label}>
                          <PlanBasicDetails />
                        </Tabs.Content>
                      );
                    case PLAN_FORM_TAB.PRICING:
                      return (
                        <Tabs.Content key={item.label} borderTopWidth={0} value={item.label}>
                          <PlanPricingConfiguration />
                        </Tabs.Content>
                      );
                    case PLAN_FORM_TAB.FEATURES:
                      return (
                        <Tabs.Content key={item.label} borderTopWidth={0} value={item.label}>
                          <PlanFeatureSelection isActive={activeTab === PLAN_FORM_TAB.FEATURES} />
                        </Tabs.Content>
                      );
                    case PLAN_FORM_TAB.ADDONS:
                      return (
                        <Tabs.Content key={item.label} borderTopWidth={0} value={item.label}>
                          <PlanAddonConfiguration isActive={activeTab === PLAN_FORM_TAB.ADDONS} />
                        </Tabs.Content>
                      );
                    case PLAN_FORM_TAB.SLA:
                      return (
                        <Tabs.Content key={item.label} borderTopWidth={0} value={item.label}>
                          <PlanSlaConfiguration isActive={activeTab === PLAN_FORM_TAB.SLA} />
                        </Tabs.Content>
                      );
                    default:
                      return null;
                  }
                })
              }
            </Tabs.ContentGroup>
          </Tabs.Root>

          {/* Centralized tab navigation with validation state */}
          <TabNavigation
            onNext={handleNextTabWithValidation}
            onPrevious={onPreviousTab}
            onSubmit={!isReadOnly ? handleSubmit(onSubmit) : undefined}
            onEdit={handleEditNavigation}
            onBackToList={handleBackToList}
            isFirstTab={activeTab === PLAN_FORM_TAB.BASIC}
            isLastTab={activeTab === PLAN_FORM_TAB.SLA}
            isSubmitting={isSubmitting}
            isFormValid={getCurrentTabValidation()}
            submitButtonText={submitButtonText}
            readOnly={isReadOnly}
          />
        </Flex>
      </Flex>
    </form>
  )
}

export default PlanFormUI