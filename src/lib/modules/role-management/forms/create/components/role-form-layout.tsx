/* Libraries imports */
import React, { useState, useEffect } from 'react'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { Flex, Heading, Tabs, Text, HStack } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaLock } from 'react-icons/fa'

/* Shared module imports */
import { GRAY_COLOR, PRIMARY_COLOR } from '@shared/config'
import { Breadcrumbs, FullPageLoader, ErrorMessageContainer } from '@shared/components/common'

/* Role module imports */
import { CreateRoleFormData, MODULE_ASSIGNMENTS_FIELD_KEYS, ROLE_INFO_FIELD_KEYS } from '@role-management/schemas'
import { ROLE_FORM_TABS, RoleFormTabType, ROLE_TAB_IDS, ROLE_FORM_MODES, ROLE_FORM_TITLES, RoleFormMode } from '@role-management/constants'
import { RoleInfoTab, ModuleAssignmentsTab } from '@role-management/forms/create/tabs'
import { useTabValidation, useModules } from '@role-management/hooks'
import { RoleFormActions } from '@role-management/forms/create/components'
import { FormModeProvider } from './form-mode-context'

/* Component props interface */
interface RoleFormLayoutProps {
  mode: RoleFormMode
  isLoading?: boolean
  error?: string | null
  methods: UseFormReturn<CreateRoleFormData>
  onSubmit: (data: CreateRoleFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
  onRetry?: () => void
  isRetrying?: boolean
}

/* Shared layout component for role forms with tab navigation */
const RoleFormLayout: React.FC<RoleFormLayoutProps> = ({
  mode,
  isLoading = false,
  error = null,
  onRetry,
  methods,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [activeTab, setActiveTab] = useState<RoleFormTabType>(ROLE_TAB_IDS.ROLE_INFO)
  const [tabUnlockState, setTabUnlockState] = useState<Record<RoleFormTabType, boolean>>({
    [ROLE_TAB_IDS.ROLE_INFO]: true,
    [ROLE_TAB_IDS.MODULE_ASSIGNMENTS]: mode === ROLE_FORM_MODES.VIEW ? true : false
  })

  /* Get form methods for validation */
  const { getValues, trigger } = methods
  const { validateRoleInfo, validateModuleAssignments } = useTabValidation(getValues)

  /* Modules data management hook with caching */
  const { modules, isLoading: modulesLoading, error: modulesError, fetchModules } = useModules()

  /* Fetch modules when switching to module assignments tab */
  useEffect(() => {
    if (activeTab === ROLE_TAB_IDS.MODULE_ASSIGNMENTS) {
      fetchModules();
    }
  }, [activeTab, fetchModules])

  /* Helper function to lock all tabs after a given index */
  const lockTabsAfterIndex = (fromIndex: number) => {
    const newTabUnlockState = { ...tabUnlockState }
    ROLE_FORM_TABS.forEach((tab, index) => {
      if (index > fromIndex) {
        newTabUnlockState[tab.id] = false
      }
    })
    setTabUnlockState(newTabUnlockState)
  }

  const validateCurrentTab = () => {
    /* Skip validation for view mode */
    if (mode === ROLE_FORM_MODES.VIEW) {
      return true
    }

    /* Validate current tab before moving to next */
    let isCurrentTabValid = true

    switch (activeTab) {
      case ROLE_TAB_IDS.ROLE_INFO:
        isCurrentTabValid = validateRoleInfo();
        if (!isCurrentTabValid) {
          trigger(ROLE_INFO_FIELD_KEYS)
        }
        break
      case ROLE_TAB_IDS.MODULE_ASSIGNMENTS:
        isCurrentTabValid = validateModuleAssignments();
        if (!isCurrentTabValid) {
          trigger(MODULE_ASSIGNMENTS_FIELD_KEYS)
        }
        break
    }

    console.log(`Tab ${activeTab} validation ${isCurrentTabValid ? 'success' : "failed"}`)
    return isCurrentTabValid;
  }

  /* Handle tab changes with validation */
  const handleTabChange = (tabId: RoleFormTabType) => {
    const isCurrentTabValid = validateCurrentTab()

    if (!isCurrentTabValid) {
      /* Lock all subsequent tabs when current tab validation fails */
      const currentIndex = ROLE_FORM_TABS.findIndex(tab => tab.id === activeTab)
      lockTabsAfterIndex(currentIndex)
      return;
    }

    if (tabUnlockState[tabId]) {
      setActiveTab(tabId)
    }
  }

  /* Move to next tab with validation */
  const handleNextTab = async () => {
    const currentIndex = ROLE_FORM_TABS.findIndex(tab => tab.id === activeTab)

    /* Trigger form validation to populate errors object */
    const isFormValid = await methods.trigger()
    console.log("Form validation result:", isFormValid)
    console.log("Form errors after trigger:", methods.formState.errors)

    /* Check if current tab fields are valid */
    let hasCurrentTabError = false
    if (activeTab === ROLE_TAB_IDS.ROLE_INFO) {
      hasCurrentTabError = ROLE_INFO_FIELD_KEYS.some(key => !!methods.formState.errors[key])
    } else if (activeTab === ROLE_TAB_IDS.MODULE_ASSIGNMENTS) {
      hasCurrentTabError = !!methods.formState.errors.module_assignments
    }

    if (hasCurrentTabError) {
      /* Lock all subsequent tabs when current tab validation fails */
      lockTabsAfterIndex(currentIndex)
      return;
    }

    if (currentIndex < ROLE_FORM_TABS.length - 1) {
      const nextTab = ROLE_FORM_TABS[currentIndex + 1]
      setTabUnlockState(prev => ({ ...prev, [nextTab.id]: true }))
      setActiveTab(nextTab.id);
    }

    if (activeTab === ROLE_FORM_TABS[ROLE_FORM_TABS.length - 1].id && isFormValid) {
      console.log("Coming to submit", methods.formState.errors)
      methods.handleSubmit(onSubmit)()
    }
  }

  /* Move to previous tab */
  const handlePreviousTab = () => {
    const currentIndex = ROLE_FORM_TABS.findIndex(tab => tab.id === activeTab)
    if (currentIndex > 0) {
      const previousTab = ROLE_FORM_TABS[currentIndex - 1]
      setActiveTab(previousTab.id)
    }
  }

  /* Loading state display */
  if (isLoading) {
    return <FullPageLoader />
  }

  /* Error state display */
  if (error) {
    return (
      <ErrorMessageContainer
        error={error}
        onRetry={onRetry}
      />
    )
  }

  return (
    <FormProvider {...methods}>
      <FormModeProvider mode={mode}>
        <Flex w="100%" flexDir="column">
          {/* Responsive main container */}
          <Flex flexDir="column" p={6} maxW="1400px" mx="auto" w="full" gap={4}>
            {/* Page header section */}
            <Flex flexDir="column" gap={1}>
              <Heading as="h1" fontWeight="700" mb={0}>
                {ROLE_FORM_TITLES[mode]}
              </Heading>
              <Breadcrumbs />
            </Flex>

            {/* Form content container with tabs */}
            <Flex flexDir={'column'} gap={4} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
              <Tabs.Root w="100%" value={activeTab} variant="outline" size="md"
                onValueChange={(e) => handleTabChange(e.value as RoleFormTabType)}>

                {/* Tab headers with unlock state */}
                <HStack justify="space-between" align="center" mb={2}>
                  <Tabs.List px={5} pt={5} borderBottomWidth={1} gap={1} borderColor={lighten(0.3, GRAY_COLOR)} flex={1}>
                    {ROLE_FORM_TABS.map((item) => {
                      const Icon = item.icon
                      const isUnlocked = tabUnlockState[item.id]
                      const isSelected = item.id === activeTab

                      return (
                        <Tabs.Trigger key={item.id} alignItems="center" justifyContent="space-between"
                          h="60px" borderWidth={1} borderBottomWidth={isSelected ? 0 : 1}
                          borderColor={lighten(0.3, GRAY_COLOR)} borderTopRadius={10} w="50%" p={5}
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
                </HStack>

                {/* Individual tab content components */}
                <Tabs.ContentGroup px={5} pb={5} borderTopWidth={0}>
                  <Tabs.Content value={ROLE_TAB_IDS.ROLE_INFO} borderTopWidth={0}>
                    <RoleInfoTab/>
                  </Tabs.Content>

                  <Tabs.Content value={ROLE_TAB_IDS.MODULE_ASSIGNMENTS} borderTopWidth={0}>
                    <ModuleAssignmentsTab
                      modules={modules}
                      isLoading={modulesLoading}
                      error={modulesError}
                      onRetry={fetchModules}
                    />
                  </Tabs.Content>
                </Tabs.ContentGroup>
              </Tabs.Root>
            </Flex>

            {/* Action buttons section for all modes */}
            <RoleFormActions
              onCancel={onCancel}
              onNext={handleNextTab}
              onPrevious={handlePreviousTab}
              currentTab={activeTab}
              loading={isSubmitting}
            />
          </Flex>
        </Flex>
      </FormModeProvider>
    </FormProvider>
  )
}

export default RoleFormLayout