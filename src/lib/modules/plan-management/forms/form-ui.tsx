/* React and Chakra UI component imports */
import React from 'react'
import { Flex, Tabs, Text, HStack, Box } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaLock, FaCheck } from 'react-icons/fa'
import { useFormContext } from 'react-hook-form'

/* Shared module imports */
import { GRAY_COLOR, PRIMARY_COLOR } from '@shared/config'
import { ErrorMessageContainer, ErrorBoundary } from '@shared/components'
import { useResourceErrors } from '@shared/contexts'

/* Plan module imports */
import { PlanManagementTabs, PlanFormMode } from '@plan-management/types/plans'
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans'
import { PLAN_MANAGEMENT_FORM_TABS, PLAN_FORM_MODES } from '@plan-management/config'
import { PlanBasicDetails, PlanPricingConfiguration, PlanFeatureSelection, PlanAddonConfiguration, PlanSlaConfiguration } from '@plan-management/forms/tabs'

/* Form UI component props interface */
interface PlanFormUIProps {
  mode: PlanFormMode /* Form operation mode */
  activeTab: PlanManagementTabs | null /* Currently active tab */
  showSavedIndicator: boolean /* Auto-save indicator visibility */
  isSubmitting: boolean /* Form submission state */
  submitButtonText: string /* Dynamic submit button text */
  tabUnlockState: Record<PlanManagementTabs, boolean> /* Tab accessibility state */
  onTabChange: (tabId: PlanManagementTabs) => void /* Tab navigation handler */
  onNextTab: () => void /* Next tab navigation */
  onPreviousTab: () => void /* Previous tab navigation */
  onSubmit: (data: CreatePlanFormData) => void /* Form submission handler */
  onEdit?: () => void /* Edit mode navigation */
  onBackToList?: () => void /* Return to list handler */
}

/* Main form UI component with tab navigation */
const PlanFormUI: React.FC<PlanFormUIProps> = ({
  mode, activeTab, showSavedIndicator, isSubmitting, submitButtonText,
  tabUnlockState, onTabChange, onNextTab, onPreviousTab, onSubmit, onEdit, onBackToList
}) => {
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only view mode */
  
  /* Get resource loading errors from context */
  const { error, removeError } = useResourceErrors()
  
  /* Get form context for submission handling */
  const { handleSubmit } = useFormContext<CreatePlanFormData>()

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[PlanFormUI] Error:', { error, errorInfo, activeTab, mode });
      }}
      maxRetries={2}
    >
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
          <Flex p={5} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
            <Tabs.Root w="100%" value={activeTab} variant="outline" size="md" 
              onValueChange={(e) => onTabChange(e.value as PlanManagementTabs)}>
              
              {/* Tab headers with unlock state and save indicator */}
              <HStack justify="space-between" align="center" mb={2}>
                <Tabs.List borderBottomWidth={1} gap={1} borderColor={lighten(0.3, GRAY_COLOR)} flex={1}>
                  {PLAN_MANAGEMENT_FORM_TABS.map((item) => {
                    const Icon = item.icon
                    const isUnlocked = tabUnlockState[item.id]
                    const isSelected = item.id === activeTab
                    
                    return (
                      <Tabs.Trigger key={item.id} alignItems="center" justifyContent="space-between" 
                        h="60px" borderWidth={1} borderBottomWidth={isSelected ? 0 : 1} 
                        borderColor={lighten(0.3, GRAY_COLOR)} borderTopRadius={10} w="15%" p={5} 
                        value={item.id} disabled={!isUnlocked} opacity={isUnlocked ? 1 : 0.8}
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

              {/* Individual tab content components */}
              <ErrorBoundary
                onError={(error, errorInfo) => {
                  console.error('[PlanFormUI] Tab Content Error:', { error, errorInfo, activeTab });
                }}
                maxRetries={1}
              >
                <Tabs.ContentGroup borderTopWidth={0}>
                  {
                    PLAN_MANAGEMENT_FORM_TABS.map(item => {
                      switch(item.id) {
                        case 'basic':
                          return (
                            <Tabs.Content key={item.id} borderTopWidth={0} value={item.id}>
                              <PlanBasicDetails 
                                mode={mode}
                                onNext={onNextTab}
                                onPrevious={onPreviousTab}
                                isFirstTab={activeTab === PLAN_MANAGEMENT_FORM_TABS[0].id} 
                              />
                            </Tabs.Content>
                          );
                        case 'pricing':
                          return (
                            <Tabs.Content key={item.id} borderTopWidth={0} value={item.id}>
                              <PlanPricingConfiguration 
                                mode={mode}
                                onNext={onNextTab}
                                onPrevious={onPreviousTab}
                              />
                            </Tabs.Content>
                          );
                        case 'features':
                          return (
                            <Tabs.Content key={item.id} borderTopWidth={0} value={item.id}>
                              <PlanFeatureSelection 
                                mode={mode}
                                onNext={onNextTab}
                                onPrevious={onPreviousTab}
                                isActive={activeTab === 'features'} 
                              />
                            </Tabs.Content>
                          );
                        case 'addons':
                          return (
                            <Tabs.Content key={item.id} borderTopWidth={0} value={item.id}>
                              <PlanAddonConfiguration 
                                mode={mode}
                                onNext={onNextTab}
                                onPrevious={onPreviousTab}
                                isActive={activeTab === 'addons'} 
                              />
                            </Tabs.Content>
                          );
                        case 'sla':
                          return (
                            <Tabs.Content key={item.id} borderTopWidth={0} value={item.id}>
                              <PlanSlaConfiguration 
                                mode={mode}
                                onNext={onNextTab}
                                onPrevious={onPreviousTab}
                                onSubmit={!isReadOnly ? onSubmit : undefined}
                                onEdit={onEdit}
                                onBackToList={onBackToList}
                                submitButtonText={submitButtonText}
                                isSubmitting={isSubmitting}
                                isActive={activeTab === 'sla'}
                              />
                            </Tabs.Content>
                          );
                        default:
                          return null;
                      }
                    })
                  }
                </Tabs.ContentGroup>
              </ErrorBoundary>
            </Tabs.Root>
          </Flex>
        </Flex>
      </form>
    </ErrorBoundary>
  )
}

export default PlanFormUI