/* Form data persistence utilities for plan management */

/* Libraries imports */
import { UseFormSetValue } from 'react-hook-form';
import { Dispatch, SetStateAction } from 'react';

/* Plan management module imports */
import { CreatePlanFormData } from '@plan-management/schemas';
import { PlanFormMode, PlanFormTab } from '@plan-management/types';
import { PLAN_FORM_MODES, STORAGE_KEYS, PLAN_FORM_TAB } from '@plan-management/constants';

/* Check if any form data exists in localStorage */
export const hasStorageData = (mode: PlanFormMode): boolean => {
  if (mode !== PLAN_FORM_MODES.CREATE) return false;

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

/* Restore form data from localStorage to React Hook Form */
export const loadDataFromStorage = (
  mode: PlanFormMode,
  setValue: UseFormSetValue<CreatePlanFormData>,
  setActiveTab: Dispatch<SetStateAction<PlanFormTab | null>>
): void => {
  if (mode !== PLAN_FORM_MODES.CREATE) return;

  try {
    console.log('Restoring form data from localStorage');

    /* Load saved form fields into React Hook Form */
    const savedFormData = localStorage.getItem(STORAGE_KEYS.DRAFT_PLAN_DATA);
    if (savedFormData) {
      const formData: CreatePlanFormData = JSON.parse(savedFormData);
      console.log('Found saved form data:', Object.keys(formData));

      /* Set each saved field value in form state */
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof CreatePlanFormData];
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
const isValidTab = (tab: string): tab is PlanFormTab => {
  const validTabs: PlanFormTab[] = [
    PLAN_FORM_TAB.BASIC,
    PLAN_FORM_TAB.PRICING,
    PLAN_FORM_TAB.FEATURES,
    PLAN_FORM_TAB.ADDONS,
    PLAN_FORM_TAB.SLA
  ];
  return validTabs.includes(tab as PlanFormTab);
};

/* Save current form data to localStorage */
export const saveFormDataToStorage = (
  mode: PlanFormMode,
  formData: CreatePlanFormData,
  setShowSavedIndicator: React.Dispatch<React.SetStateAction<boolean>>
): boolean => {
  if (mode !== PLAN_FORM_MODES.CREATE) return false;

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
    if (prevState) return prevState;

    /* Auto-hide save indicator after delay */
    setTimeout(() => setShowSavedIndicator(false), 2000);
    return true;
  });
};

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
