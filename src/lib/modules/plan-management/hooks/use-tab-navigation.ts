import { useCallback, useMemo } from 'react'
import { PlanManagementTabs, PlanFormMode } from '@plan-management/types/plans'
import { PLAN_MANAGEMENT_FORM_TABS, PLAN_FORM_MODES } from '@plan-management/config'
import { useFormContext } from 'react-hook-form'
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';

/* Custom hook for tab navigation and unlock logic */
export const useTabNavigation = (
  activeTab: PlanManagementTabs | null,
  setActiveTab: (tab: PlanManagementTabs) => void,
  mode: PlanFormMode,
  validationState: {
    isBasicInfoValid: boolean
    isPricingInfoValid: boolean
    isFeaturesValid: boolean
    isAddonsValid: boolean
  }
) => {
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW

  /* Calculate which tabs should be unlocked based on validation */
  const tabUnlockState = useMemo(() => ({
    basic: true,
    pricing: isReadOnly || validationState.isBasicInfoValid,
    features: isReadOnly || (validationState.isBasicInfoValid && validationState.isPricingInfoValid),
    addons: isReadOnly || (validationState.isBasicInfoValid && validationState.isPricingInfoValid && validationState.isFeaturesValid),
    sla: isReadOnly || (validationState.isBasicInfoValid && validationState.isPricingInfoValid && validationState.isFeaturesValid && validationState.isAddonsValid)
  }), [isReadOnly, validationState])

  /* Check if specific tab is unlocked */
  const isTabUnlocked = useCallback((tabId: PlanManagementTabs): boolean => {
    return tabUnlockState[tabId] || false
  }, [tabUnlockState])

  /* Handle tab change with validation check */
  const handleTabChange = useCallback((tabId: PlanManagementTabs) => {
    if (isTabUnlocked(tabId)) setActiveTab(tabId)
  }, [isTabUnlocked, setActiveTab])

  /* Navigate to next available tab */
  const handleNextTab = useCallback(() => {
    const currentIndex = PLAN_MANAGEMENT_FORM_TABS.findIndex(tab => tab.id === activeTab)
    const nextTab = PLAN_MANAGEMENT_FORM_TABS[currentIndex + 1]
    if (nextTab && isTabUnlocked(nextTab.id)) setActiveTab(nextTab.id)
  }, [activeTab, isTabUnlocked, setActiveTab])

  /* Navigate to previous tab (always allowed) */
  const handlePreviousTab = useCallback(() => {
    const currentIndex = PLAN_MANAGEMENT_FORM_TABS.findIndex(tab => tab.id === activeTab)
    const previousTab = PLAN_MANAGEMENT_FORM_TABS[currentIndex - 1]
    if (previousTab) setActiveTab(previousTab.id)
  }, [activeTab, setActiveTab])

  return {
    tabUnlockState,
    isTabUnlocked,
    handleTabChange,
    handleNextTab,
    handlePreviousTab
  }
}

/* Shared hook for tab validation and next navigation */
export const useTabValidationNavigation = (
  validationFields: Array<keyof CreatePlanFormData>,
  isReadOnly: boolean,
  onNext?: () => void
) => {
  const { trigger } = useFormContext<CreatePlanFormData>();

  const handleNext = useCallback(async () => {
    /* Skip validation in read-only view mode */
    if (isReadOnly) {
      if (onNext) {
        onNext();
      }
      return;
    }

    /* Validate specified form fields before navigation */
    const isValid = await trigger(validationFields);
    
    if (isValid) {
      if (onNext) {
        onNext();
      }
    }
  }, [isReadOnly, onNext, validationFields, trigger]);

  return { handleNext };
};