import { FaPlus } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { FiInfo } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { LiaHandshake } from "react-icons/lia";
import { PlanManagementTabs, PlanManagementTabData, PlanFormMode } from "@plan-management/types/plans";

/* Tab configuration for plan management form */
export const PLAN_MANAGEMENT_FORM_TABS: PlanManagementTabData[] = [
  { id: 'basic', label: 'Basic Info', icon: FiInfo }, /* Basic plan information tab */
  { id: 'pricing', label: 'Pricing', icon: FaSackDollar }, /* Pricing configuration tab */
  { id: 'features', label: 'Features', icon: HiSparkles }, /* Feature selection tab */
  { id: 'addons', label: 'Add-ons', icon: FaPlus }, /* Addon configuration tab */
  { id: 'sla', label: 'SLA', icon: LiaHandshake }, /* SLA configuration tab */
];

/* Debounce delay for auto-saving form data */
export const AUTO_SAVE_DEBOUNCE_MS = 1000;

/* Default active tab when form loads */
export const DEFAULT_PLAN_TAB: PlanManagementTabs = 'basic';

/* Debounce delay for form validation */
export const FORM_VALIDATION_DEBOUNCE_MS = 300;

/* Local storage keys for persisting plan data */
export const STORAGE_KEYS = {
  DRAFT_PLAN_DATA: 'draft_plan_data', /* Draft form data storage key */
  ACTIVE_TAB: 'plan_active_tab', /* Current active tab storage key */
  AUTO_SAVE_TIMESTAMP: 'plan_auto_save_timestamp', /* Last save timestamp key */
} as const;

/* Available modes for plan forms */
export const PLAN_FORM_MODES = {
  CREATE: 'create', /* Creating new plan mode */
  EDIT: 'edit', /* Editing existing plan mode */
  VIEW: 'view', /* Read-only view mode */
} as { CREATE: PlanFormMode, EDIT: PlanFormMode, VIEW: PlanFormMode };

/* Page titles for different plan form modes */
export const PLAN_FORM_TITLES = {
  CREATE: 'Create Plan', /* Title for create mode */
  EDIT: 'Edit Plan', /* Title for edit mode */
  VIEW: 'View Plan', /* Title for view mode */
  DEFAULT: 'Plan Management', /* Default title */
} as const;

/* Error notification messages */
export const ERROR_MESSAGES = {
  PLAN_CREATE_FAILED: 'Failed to create plan. Please try again.', /* Plan creation error */
  PLAN_UPDATE_FAILED: 'Failed to update plan. Please try again.', /* Plan update error */
  PLAN_DELETE_FAILED: 'Failed to delete plan. Please try again.', /* Plan deletion error */
  PLAN_LOAD_FAILED: 'Failed to load plan data. Please try again.', /* Plan loading error */
  VALIDATION_FAILED: 'Please fix the validation errors before continuing.', /* Validation error */
  AUTO_SAVE_FAILED: 'Failed to save draft automatically.', /* Auto-save error */
} as const;