"use client"

/* React and Chakra UI component imports */
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Flex, Heading, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

/* Shared module imports */
import { Breadcrumbs, ErrorMessageContainer } from '@shared/components'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Plan module imports */
import { createPlanSchema, CreatePlanFormData } from '@plan-management/schemas/validation/plans'
import { PlanManagementTabs, PlanDetails, PlanFormMode } from '@plan-management/types/plans'
import { DataRecoveryModal } from '@plan-management/components'
import PlanFormUI from '@plan-management/forms/form-ui'
import { clearStorageData, hasStorageData, loadDataFromStorage, saveFormDataToStorage, formatApiDataToFormData } from '@plan-management/utils'
import { planService } from '@plan-management/api'
import { useTabValidation, useFormSubmission, useTabNavigation } from '@plan-management/hooks'
import { AUTO_SAVE_DEBOUNCE_MS, DEFAULT_PLAN_TAB, PLAN_FORM_TITLES, STORAGE_KEYS, ERROR_MESSAGES, PLAN_FORM_MODES } from '@plan-management/config'
import { PLAN_FORM_DEFAULT_VALUES } from '@plan-management/constants'

/* Component props interface */
interface PlanFormContainerProps {
  mode: PlanFormMode /* Form operation mode */
  planId?: number /* Plan ID for edit/view modes */
  title?: string /* Custom page title override */
}

/* Main plan form container with state management and auto-save */

const PlanFormContainer: React.FC<PlanFormContainerProps> = ({ mode, planId, title }) => {
  /* Next.js router for page navigation */
  const router = useRouter()
  
  /* Form container state variables */
  const [showDataRecoveryPopup, setShowDataRecoveryPopup] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState<PlanManagementTabs | null>(DEFAULT_PLAN_TAB)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [planData, setPlanData] = useState<PlanDetails | null>(null)
  
  /* Refs for auto-save performance optimization */
  const lastSavedDataRef = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  
  /* React Hook Form setup with Zod validation */
  const methods = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    mode: 'onChange',
    defaultValues: PLAN_FORM_DEFAULT_VALUES
  })
  const { setValue, reset, getValues, watch } = methods

  /* Form submission success handler */
  const handleSubmissionSuccess = useCallback(() => {
    if (mode === PLAN_FORM_MODES.CREATE) clearStorageData()
    router.push('/admin/plan-management')
  }, [mode, router])

  /* Custom hooks for form logic and navigation */
  const validationState = useTabValidation(getValues)
  const { submitForm, isSubmitting, getSubmitButtonText } = useFormSubmission(mode, planId, getValues, handleSubmissionSuccess)
  const tabNavigation = useTabNavigation(activeTab, setActiveTab, mode, validationState)

  /* Dynamic page title based on mode and plan data */
  const getTitle = useCallback(() => {
    if (title) return title
    const baseTitle = PLAN_FORM_TITLES[mode.toUpperCase() as keyof typeof PLAN_FORM_TITLES] || PLAN_FORM_TITLES.DEFAULT
    return mode !== PLAN_FORM_MODES.CREATE && planData ? `${baseTitle}: ${planData.name}` : baseTitle
  }, [mode, title, planData])

  /* Fetch plan details for edit and view modes */
  const loadPlanData = useCallback(async () => {
    if (!planId || mode === PLAN_FORM_MODES.CREATE) return

    setIsLoading(true)
    setLoadError(null)

    try {
      if (LOADING_DELAY_ENABLED) await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      
      const response = await planService.getSubscriptionPlanDetails(planId)
      
      if (response.data.success && response.data.data) {
        const plan = response.data.data
        setPlanData(plan)
        reset(formatApiDataToFormData(plan))
      } else {
        setLoadError(ERROR_MESSAGES.PLAN_LOAD_FAILED)
      }
    } catch (error) {
      console.error('[PlanFormContainer] Error loading plan data:', error)
      setLoadError(ERROR_MESSAGES.PLAN_LOAD_FAILED)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [planId, mode, reset])

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

  /* Watch all form values for auto-save trigger */
  const formValues = watch()

  /* Debounced auto-save with cleanup on unmount */
  useEffect(() => {
    if (mode !== PLAN_FORM_MODES.CREATE || !isInitialized) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        performAutoSave()
      }
    }, AUTO_SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
    }
  }, [formValues, performAutoSave, mode, isInitialized])

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

  /* Component cleanup on unmount */
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
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

  /* Navigation handlers for view mode */
  const handleEditNavigation = useCallback(() => {
    if (planId) router.push(`/admin/plan-management/edit/${planId}`)
  }, [planId, router])

  const handleBackToList = useCallback(() => {
    router.push('/admin/plan-management')
  }, [router])

  /* Handle form submission with validation */
  const handleFormSubmit = useCallback((data: CreatePlanFormData) => {
    submitForm(data)
  }, [submitForm])

  /* Main form container render */
  return (
    <FormProvider {...methods}>
        {/* Loading spinner for data fetching - takes full width when loading */}
        {isLoading ? (
          <Flex flexDir="column" flex={1} p={3} justify="center" w={'100%'} align="center" minH="400px">
            <Spinner size="xl" />
            <Heading as="h3" size="lg" mt={4}>
              Loading plan data...
            </Heading>
          </Flex>
        ) : (
          <Flex flexDir="column" flex={1} p={3} gap={10}>
            {/* Page title and breadcrumb navigation */}
            <Flex flexDir="column" gap={1}>
              <Heading as="h1" fontWeight="700" mb={0}>
                {getTitle()}
              </Heading>
              <Breadcrumbs />
            </Flex>

            {/* Error message with retry functionality */}
            {loadError && (
              <ErrorMessageContainer 
                error={loadError} 
                onRetry={loadPlanData}
                onDismiss={() => setLoadError(null)}
                isRetrying={isLoading}
                title="Failed to Load Plan Data"
              />
            )}

            {/* Main form interface with tab navigation */}
            <PlanFormUI 
              mode={mode}
              activeTab={activeTab}
              showSavedIndicator={showSavedIndicator}
              isSubmitting={isSubmitting}
              tabUnlockState={tabNavigation.tabUnlockState}
              onTabChange={tabNavigation.handleTabChange}
              onNextTab={tabNavigation.handleNextTab}
              onPreviousTab={tabNavigation.handlePreviousTab}
              onSubmit={handleFormSubmit}
              onEdit={mode === PLAN_FORM_MODES.VIEW ? handleEditNavigation : undefined}
              onBackToList={mode === PLAN_FORM_MODES.VIEW ? handleBackToList : undefined}
              submitButtonText={getSubmitButtonText()}
            />
          </Flex>
        )}

        {/* Draft data recovery modal for create mode */}
        {mode === PLAN_FORM_MODES.CREATE && (
          <DataRecoveryModal
            isOpen={showDataRecoveryPopup}
            onRestore={handleRestoreData}
            onStartFresh={handleStartFresh}
          />
        )}
    </FormProvider>
  )
}

export default PlanFormContainer