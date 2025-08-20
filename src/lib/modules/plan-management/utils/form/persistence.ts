import { UseFormSetValue } from 'react-hook-form';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import { PlanManagementTabs } from '@plan-management/types/plans';
import { Dispatch, SetStateAction } from 'react';
import { PlanFormMode } from '@plan-management/types/plans';
import { PLAN_FORM_MODES, STORAGE_KEYS } from '@plan-management/config';

/* Form data persistence utilities */

/* Check if any form data exists in localStorage */
export const hasStorageData = (mode: PlanFormMode): boolean => {
  if (mode !== PLAN_FORM_MODES.CREATE) return false; /* Only persist in create mode for now */

  try {
    const hasFormData = Boolean(localStorage.getItem(STORAGE_KEYS.DRAFT_PLAN_DATA));
    const hasTabState = Boolean(localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB));
    
    console.log('Storage check:', { hasFormData, hasTabState });
    return hasFormData || hasTabState;
  } catch (error) {
    console.warn('Storage check failed:', error);
    return false;
  }
};

/* Load saved form data from browser storage */

/* Restore form data from localStorage to React Hook Form */
export const loadDataFromStorage = (
  mode: PlanFormMode,
  setValue: UseFormSetValue<CreatePlanFormData>,
  setActiveTab: Dispatch<SetStateAction<PlanManagementTabs | null>>
): void => {
  if (mode !== PLAN_FORM_MODES.CREATE) return; /* Only restore in create mode for now */

  try {
    console.log('Restoring form data from localStorage');

    /* Load saved form fields into React Hook Form */
    const savedFormData = localStorage.getItem(STORAGE_KEYS.DRAFT_PLAN_DATA);
    if (savedFormData) {
      const formData = JSON.parse(savedFormData);
      console.log('Found saved form data:', Object.keys(formData));
      
      /* Set each saved field value in form state */
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        setValue(key as keyof CreatePlanFormData, value);
      });
    }

    /* Load saved active tab state */
    const savedActiveTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (savedActiveTab && isValidTab(savedActiveTab)) {
      console.log('Restoring active tab:', savedActiveTab);
      setActiveTab(savedActiveTab);
    }

    console.log('Data restoration completed');
  } catch (error) {
    console.error('Data restoration failed:', error);
  }
};

/* Validate tab name against allowed values */
const isValidTab = (tab: string): tab is PlanManagementTabs => {
  const validTabs: PlanManagementTabs[] = ['basic', 'pricing', 'features', 'addons', 'sla'];
  return validTabs.includes(tab as PlanManagementTabs);
};

/* Save current form state to browser storage */

/* Save current form data to localStorage */
export const saveFormDataToStorage = (
  mode: typeof PLAN_FORM_MODES.CREATE | typeof PLAN_FORM_MODES.EDIT,
  formData: CreatePlanFormData,
  setShowSavedIndicator: React.Dispatch<React.SetStateAction<boolean>>
): boolean => {
  if (mode !== PLAN_FORM_MODES.CREATE) return false; /* Only save in create mode for now */

  try {
    /* Store form data in localStorage */
    localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, JSON.stringify(formData));
    console.log('Form data saved to localStorage');
    
    /* Display temporary save confirmation */
    showSavedIndicator(setShowSavedIndicator);
    return true;
  } catch (error) {
    console.error('Form data save failed:', error);
    return false;
  }
};

/* Show temporary saved indicator */
const showSavedIndicator = (setShowSavedIndicator: React.Dispatch<React.SetStateAction<boolean>>) => {
  setShowSavedIndicator(prevState => {
    if (prevState) return prevState; /* Avoid duplicate timers */
    
    /* Auto-hide save indicator after delay */
    setTimeout(() => setShowSavedIndicator(false), 2000);
    return true;
  });
};

/* Clear all persisted form data */

/* Clear all form-related data from localStorage */
export const clearStorageData = (): void => {
  try {
    /* Remove all form-related localStorage entries */
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('All form storage data cleared');
  } catch (error) {
    console.warn('Storage cleanup failed:', error);
  }
};