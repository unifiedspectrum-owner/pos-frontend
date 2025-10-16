/* Form configuration constants for plan management module */

/* Libraries imports */
import { FaPlus } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { FiInfo } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { LiaHandshake } from "react-icons/lia";

/* Plan management module imports */
import { PlanFormTabData } from "@plan-management/types";

/* Add-on pricing scope options */
export const ADDON_PRICING_SCOPES = {
  BRANCH: 'branch',
  ORGANIZATION: 'organization'
} as const;

/* Add-on feature level options */
export const ADDON_FEATURE_LEVELS = {
  BASIC: 'basic',
  CUSTOM: 'custom'
} as const;

/* Tab labels for plan management form tabs */
export const PLAN_FORM_TAB = {
  BASIC: 'Basic Info', /* Basic plan information label */
  PRICING: 'Pricing', /* Pricing configuration label */
  FEATURES: 'Features', /* Feature selection label */
  ADDONS: 'Add-ons', /* Addon configuration label */
  SLA: 'SLA', /* SLA configuration label */
} as const;

/* Tab configuration for plan management form */
export const PLAN_MANAGEMENT_FORM_TABS: PlanFormTabData[] = [
  { label: PLAN_FORM_TAB.BASIC, icon: FiInfo }, /* Basic plan information tab */
  { label: PLAN_FORM_TAB.PRICING, icon: FaSackDollar }, /* Pricing configuration tab */
  { label: PLAN_FORM_TAB.FEATURES, icon: HiSparkles }, /* Feature selection tab */
  { label: PLAN_FORM_TAB.ADDONS, icon: FaPlus }, /* Addon configuration tab */
  { label: PLAN_FORM_TAB.SLA, icon: LiaHandshake }, /* SLA configuration tab */
];

/* Available modes for plan forms */
export const PLAN_FORM_MODES = {
  CREATE: 'CREATE', /* Creating new plan mode */
  EDIT: 'EDIT', /* Editing existing plan mode */
  VIEW: 'VIEW', /* Read-only view mode */
} as const;

/* Page titles for different plan form modes */
export const PLAN_FORM_TITLES = {
  CREATE: 'Create Plan', /* Title for create mode */
  EDIT: 'Edit Plan', /* Title for edit mode */
  VIEW: 'View Plan', /* Title for view mode */
  DEFAULT: 'Plan Management', /* Default title */
} as const;

/* Resource section titles for feature selection */
export const FEATURE_SECTION_TITLES = {
  CREATE: 'Create Feature', /* Title when creating new feature */
  AVAILABLE: 'Available Features', /* Title for available features list */
  INCLUDED: 'Included Features', /* Title for included features in view mode */
} as const;

/* Resource section titles for addon configuration */
export const ADDON_SECTION_TITLES = {
  CREATE: 'Create Add-on', /* Title when creating new addon */
  AVAILABLE: 'Available Add-ons', /* Title for available addons list */
  INCLUDED: 'Included Add-ons', /* Title for included addons in view mode */
} as const;

/* Resource section titles for SLA configuration */
export const SLA_SECTION_TITLES = {
  CREATE: 'Create SLA', /* Title when creating new SLA */
  AVAILABLE: 'Available SLAs', /* Title for available SLAs list */
  INCLUDED: 'Included SLAs', /* Title for included SLAs in view mode */
} as const;

/* Default form values for plan creation */
export const PLAN_FORM_DEFAULT_VALUES = {
  /* Basic Plan Information */
  name: "",
  description: "",
  is_active: true,
  is_custom: false,

  /* Device and User Limits */
  included_devices_count: "",
  max_users_per_branch: "",
  included_branches_count: "",
  additional_device_cost: "",

  /* Pricing Configuration */
  monthly_price: "",
  annual_discount_percentage: "",
  // biennial_discount_percentage: null,
  // triennial_discount_percentage: null,

  /* Payment Gateway Fees */
  monthly_fee_our_gateway: "",
  monthly_fee_byo_processor: "",
  card_processing_fee_percentage: "",
  card_processing_fee_fixed: "",

  /* Feature Selection */
  feature_ids: [],

  /* Add-on Configuration */
  addon_assignments: [],

  /* Support SLA Selection */
  support_sla_ids: [],

  /* Volume Discount Configuration */
  volume_discounts: [],
};
