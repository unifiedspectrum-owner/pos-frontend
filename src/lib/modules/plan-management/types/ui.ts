/* TypeScript interfaces for UI-specific types and configurations */

/* Libraries imports */
import { IconType } from "react-icons";

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Plan management module imports */
import { PLAN_FORM_MODES, PLAN_FORM_TAB } from '@plan-management/constants';

/* Multi-step form tab identifiers */
export type PlanFormTab = typeof PLAN_FORM_TAB[keyof typeof PLAN_FORM_TAB];;

/* Tab configuration with visual elements */
export interface PlanFormTabData {
  label: PlanFormTab;
  icon: IconType;
}

/* Plan form mode type */
export type PlanFormMode = typeof PLAN_FORM_MODES[keyof typeof PLAN_FORM_MODES];

/* Tab validation result with errors */
export interface TabValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/* Dropdown/select option structure */
export interface SelectOption {
  value: string;
  label: string;
}
