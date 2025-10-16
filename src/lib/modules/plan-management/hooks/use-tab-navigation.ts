import { useCallback, useMemo } from 'react'
import { PlanFormTab, PlanFormMode } from '@plan-management/types'
import { PLAN_MANAGEMENT_FORM_TABS, PLAN_FORM_MODES, PLAN_FORM_TAB } from '@plan-management/constants'
import { useFormContext } from 'react-hook-form'
import { CreatePlanFormData } from '@plan-management/schemas';

/* Custom hook for tab navigation and unlock logic */
export const useTabNavigation = (
  activeTab: PlanFormTab | null,
  setActiveTab: (tab: PlanFormTab) => void,
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
    [PLAN_FORM_TAB.BASIC]: true,
    [PLAN_FORM_TAB.PRICING]: isReadOnly || validationState.isBasicInfoValid,
    [PLAN_FORM_TAB.FEATURES]: isReadOnly || (validationState.isBasicInfoValid && validationState.isPricingInfoValid),
    [PLAN_FORM_TAB.ADDONS]: isReadOnly || (validationState.isBasicInfoValid && validationState.isPricingInfoValid && validationState.isFeaturesValid),
    [PLAN_FORM_TAB.SLA]: isReadOnly || (validationState.isBasicInfoValid && validationState.isPricingInfoValid && validationState.isFeaturesValid && validationState.isAddonsValid)
  }), [isReadOnly, validationState])

  /* Check if specific tab is unlocked */
  const isTabUnlocked = useCallback((tabId: PlanFormTab): boolean => {
    return tabUnlockState[tabId] || false
  }, [tabUnlockState])

  /* Handle tab change with validation check */
  const handleTabChange = useCallback((tabId: PlanFormTab) => {
    if (isTabUnlocked(tabId)) setActiveTab(tabId)
  }, [isTabUnlocked, setActiveTab])

  /* Navigate to next available tab */
  const handleNextTab = useCallback(() => {
    const currentIndex = PLAN_MANAGEMENT_FORM_TABS.findIndex(tab => tab.label === activeTab)
    const nextTab = PLAN_MANAGEMENT_FORM_TABS[currentIndex + 1]
    if (nextTab && isTabUnlocked(nextTab.label)) setActiveTab(nextTab.label)
  }, [activeTab, isTabUnlocked, setActiveTab])

  /* Navigate to previous tab (always allowed) */
  const handlePreviousTab = useCallback(() => {
    const currentIndex = PLAN_MANAGEMENT_FORM_TABS.findIndex(tab => tab.label === activeTab)
    const previousTab = PLAN_MANAGEMENT_FORM_TABS[currentIndex - 1]
    if (previousTab) setActiveTab(previousTab.label)
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