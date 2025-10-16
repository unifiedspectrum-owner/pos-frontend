"use client"

/* React and Chakra UI component imports */
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Flex, Heading } from '@chakra-ui/react'

/* Shared module imports */
import { Breadcrumbs, ErrorMessageContainer, LoaderWrapper } from '@shared/components'

/* Plan management module imports */
import { CreatePlanFormData } from '@plan-management/schemas'
import { PlanFormTab } from '@plan-management/types'
import { DataRecoveryModal } from '@plan-management/components'
import PlanFormUI from '@plan-management/forms/form-ui'
import { clearStorageData, hasStorageData, loadDataFromStorage, saveFormDataToStorage, formatApiDataToFormData } from '@plan-management/utils'
import { useTabValidation, useTabNavigation, usePlanOperations } from '@plan-management/hooks'
import { AUTO_SAVE_DEBOUNCE_MS, PLAN_FORM_TITLES, STORAGE_KEYS, PLAN_FORM_MODES, PLAN_FORM_TAB } from '@plan-management/constants'
import { PLAN_FORM_DEFAULT_VALUES } from '@plan-management/constants'
import { usePlanFormMode } from '@plan-management/contexts'

/* Component props interface */
interface PlanFormContainerProps {
  onSubmit?: (data: CreatePlanFormData) => void /* Form submission handler */
  isSubmitting?: boolean /* Submission state from parent */
}

/* Main plan form container with state management and auto-save */

const PlanFormContainer: React.FC<PlanFormContainerProps> = ({ onSubmit, isSubmitting = false }) => {

  /* Get mode and planId from context */
  const { mode, planId } = usePlanFormMode()

  /* Plan operations hook */
  const { fetchPlanDetails, isFetching } = usePlanOperations()

  /* Get form context from FormProvider in parent */
  const { setValue, reset, getValues, control } = useFormContext<CreatePlanFormData>()

  /* Form container state variables */
  const [showDataRecoveryPopup, setShowDataRecoveryPopup] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState<PlanFormTab | null>(PLAN_FORM_TAB.BASIC)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  /* Watch all form field changes for auto-save */
  const watchedValues = useWatch({ control })

  /* Refs for auto-save performance optimization */
  const lastSavedDataRef = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /* Custom hooks for form logic and navigation */
  const validationState = useTabValidation(getValues)
  const tabNavigation = useTabNavigation(activeTab, setActiveTab, mode, validationState)

  /* Fetch plan details for edit and view modes */
  const loadPlanData = useCallback(async () => {
    if (!planId || mode === PLAN_FORM_MODES.CREATE) return

    setLoadError(null)

    /* Call plan operations hook to fetch plan details */
    const plan = await fetchPlanDetails(planId)

    if (plan) {
      reset(formatApiDataToFormData(plan))
    } else {
      setLoadError('Failed to load plan data')
    }

    setIsInitialized(true)
  }, [planId, mode, reset, fetchPlanDetails])

  /* Memoized default values for performance optimization */
  const DEFAULT_FORM_SERIALIZED = useMemo(() => 
    JSON.stringify(PLAN_FORM_DEFAULT_VALUES, Object.keys(PLAN_FORM_DEFAULT_VALUES).sort()),[])

  /* Perform auto-save with change detection */
  const performAutoSave = useCallback(() => {
    if (!isInitialized || mode !== PLAN_FORM_MODES.CREATE) return

    const currentValues = getValues()
    const currentSerialized = JSON.stringify(currentValues, Object.keys(currentValues).sort())

    /* Skip save if no changes or already saved */
    const hasData = currentSerialized !== DEFAULT_FORM_SERIALIZED
    if (!hasData || currentSerialized === lastSavedDataRef.current) return

    const saved = saveFormDataToStorage(PLAN_FORM_MODES.CREATE, currentValues, setShowSavedIndicator)
    if (saved) {
      lastSavedDataRef.current = currentSerialized
      if (activeTab) {
        try {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab)
        } catch (error) {
          console.error('[PlanFormContainer] Failed to save active tab:', error)
        }
      }
    }
  }, [isInitialized, mode, getValues, DEFAULT_FORM_SERIALIZED, activeTab])

  /* Debounced auto-save triggered by form value changes */
  useEffect(() => {
    if (mode !== PLAN_FORM_MODES.CREATE || !isInitialized) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      performAutoSave()
    }, AUTO_SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [watchedValues, performAutoSave, mode, isInitialized])

  /* Form initialization based on operation mode */
  useEffect(() => {
    if (mode === PLAN_FORM_MODES.CREATE) {
      const hasExistingData = hasStorageData(PLAN_FORM_MODES.CREATE)
      setShowDataRecoveryPopup(hasExistingData)
      if (!hasExistingData) setIsInitialized(true)
    } else {
      loadPlanData()
    }
  }, [mode, loadPlanData])

  /* Cleanup pending timeouts on unmount */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  /* Data recovery modal handlers */
  const handleRestoreData = useCallback(() => {
    setShowDataRecoveryPopup(false)
    loadDataFromStorage(PLAN_FORM_MODES.CREATE, setValue, setActiveTab)
    setIsInitialized(true)
  }, [setValue])

  const handleStartFresh = useCallback(() => {
    setShowDataRecoveryPopup(false)
    clearStorageData()
    setIsInitialized(true)
  }, [])

  /* Handle form submission with validation */
  const handleFormSubmit = useCallback((data: CreatePlanFormData) => {
    if (onSubmit) {
      onSubmit(data)
    }
  }, [onSubmit])

  /* Main form container render */
  return (
    <>
      <LoaderWrapper isLoading={isFetching && !isInitialized} loadingText="Loading plan data...">
        <Flex flexDir="column" flex={1} p={3} gap={10}>
          {/* Page title and breadcrumb navigation */}
          <Flex flexDir="column" gap={1}>
            <Heading as="h1" fontWeight="700" mb={0}>
              {PLAN_FORM_TITLES[mode]}
            </Heading>
            <Breadcrumbs />
          </Flex>

          {/* Error message with retry functionality */}
          {loadError && (
            <ErrorMessageContainer
              error={loadError}
              onRetry={loadPlanData}
              onDismiss={() => setLoadError(null)}
              isRetrying={isFetching}
              title="Failed to Load Plan Data"
            />
          )}

          {/* Main form interface with tab navigation */}
          <PlanFormUI
            activeTab={activeTab}
            showSavedIndicator={showSavedIndicator}
            isSubmitting={isSubmitting}
            tabUnlockState={tabNavigation.tabUnlockState}
            onTabChange={tabNavigation.handleTabChange}
            onNextTab={tabNavigation.handleNextTab}
            onPreviousTab={tabNavigation.handlePreviousTab}
            onSubmit={handleFormSubmit}
          />
        </Flex>
      </LoaderWrapper>

      {/* Draft data recovery modal for create mode */}
      {mode === PLAN_FORM_MODES.CREATE && (
        <DataRecoveryModal
          isOpen={showDataRecoveryPopup}
          onRestore={handleRestoreData}
          onStartFresh={handleStartFresh}
        />
      )}
    </>
  )
}

export default PlanFormContainer