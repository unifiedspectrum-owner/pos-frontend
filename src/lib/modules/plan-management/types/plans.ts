import { ValidationError } from "@shared/types";
import { IconType } from "react-icons";

/* Shared types and interfaces */

/* Form operation modes */
export type PlanFormMode = 'create' | 'edit' | 'view';

/* Multi-step form tab identifiers */
export type PlanManagementTabs = 'basic' | 'pricing' | 'features' | 'addons' | 'sla';

/* Tab validation result with errors */
export interface TabValidationResult {
  isValid: boolean; /* Overall validation status */
  errors: ValidationError[]; /* List of validation errors */
}

/* Dropdown/select option structure */
export interface SelectOption {
  value: string | number; /* Option value */
  label: string; /* Display text */
}

/* Base resource structure with common fields */
export interface BaseResource {
  id: number; /* Unique identifier */
  name: string; /* Display name */
  description?: string; /* Optional description */
  created_at?: string; /* Creation timestamp */
  updated_at?: string; /* Last modification timestamp */
}

/* API response structures and generic types */

/* Standard API response wrapper */
export interface ApiResponse<T> {
  data: T; /* Response payload */
  message?: string; /* Optional message */
  status: 'success' | 'error'; /* Response status */
}

/* Paginated API response structure */
export interface PaginatedResponse<T> {
  data: T[]; /* Array of items */
  total: number; /* Total item count */
  page: number; /* Current page number */
  per_page: number; /* Items per page */
  total_pages: number; /* Total pages available */
}

/* Base structure for all API responses */
interface BaseAPIResponse {
  success: boolean; /* Operation success status */
  error?: string; /* Error message if failed */
  message: string; /* Response message */
  timestamp: string; /* Response timestamp */
}

/* Base structure for list responses with count */
interface BaseListAPIResponse extends BaseAPIResponse {
  count: number; /* Total items count */
}

/* Standard creation response data */
interface CreationResponseData {
  id: number; /* Created item ID */
  name: string; /* Created item name */
  status: boolean; /* Creation status */
}

/* UI components and form-related interfaces */

/* Tab configuration with visual elements */
export interface PlanManagementTabData {
  id: PlanManagementTabs; /* Tab identifier */
  label: string; /* Display label */
  icon: IconType; /* Icon component */
}

/* Core business entity data models */

/* Basic plan information for list displays */
export interface Plan {
  id: number; /* Unique plan identifier */
  name: string; /* Plan display name */
  description: string; /* Plan display name */
  features: Feature[];
  is_featured: boolean;
  is_active: boolean; /* Database boolean: 0 = inactive, 1 = active */
  is_custom: boolean; /* Database boolean: 0 = standard, 1 = custom */
  display_order: number; /* Sort order for display */
  monthly_price: number; /* Monthly subscription cost */
  included_branches_count: number | null
  annual_discount_percentage: number; /* Monthly subscription cost */
  add_ons: Addon[];
}

/* Complete plan data with all relationships */
export interface PlanDetails {
  /* Core plan details */
  id: number; /* Unique plan identifier */
  name: string; /* Plan display name */
  description: string; /* Plan description */
  display_order: number; /* Sort order for display */
  trial_period_days: number; /* Free trial duration */
  is_active: number; /* Database boolean: 0 = inactive, 1 = active */
  is_custom: number; /* Database boolean: 0 = standard, 1 = custom */
  
  /* Monthly and discount pricing */
  monthly_price: number; /* Base monthly subscription cost */
  monthly_fee_our_gateway: number; /* Monthly fee using our payment gateway */
  monthly_fee_byo_processor: number; /* Monthly fee for bring-your-own processor */
  card_processing_fee_percentage: number; /* Percentage fee for card processing */
  card_processing_fee_fixed: number; /* Fixed fee per card transaction */
  additional_device_cost: number; /* Cost per additional device */
  annual_discount_percentage: number; /* Discount for annual billing */
  biennial_discount_percentage: number; /* Discount for 2-year billing */
  triennial_discount_percentage: number; /* Discount for 3-year billing */
  
  /* Device and user constraints */
  included_devices_count: number; /* Number of included devices */
  max_users_per_branch: number; /* Maximum users per branch */
  included_branches_count: number | null; /* Number of included branches (null = unlimited) */
  
  /* Related entities and configurations */
  features: Feature[]; /* Available features */
  add_ons: Addon[]; /* Available add-ons */
  support_sla: SupportSLA[]; /* Support SLA options */
  volume_discounts: VolumeDiscount[]; /* Volume discount tiers */
}

/* Plan resource and configuration models */

/* Feature available for plan selection */
export interface Feature {
  id: number; /* Unique feature identifier */
  name: string; /* Feature display name */
  description: string; /* Feature description */
  display_order: number; /* Sort order for display */
}

/* Add-on service with pricing configuration */
export interface Addon {
  id: number; /* Unique add-on identifier */
  name: string; /* Add-on display name */
  description: string; /* Add-on description */
  pricing_scope: "branch" | "organization"; /* Pricing model scope */
  addon_price: number; /* Base price for the add-on */
  default_quantity: number | null; /* Default quantity when selected */
  is_included: boolean; /* Database boolean: 0 = optional, 1 = included */
  feature_level: string | null;
  min_quantity: number | null; /* Minimum allowed quantity */
  max_quantity: number | null; /* Maximum allowed quantity (null = unlimited) */
  display_order: number; /* Sort order for display */
}

/* Service Level Agreement configuration */
export interface SupportSLA {
  id: number; /* Unique SLA identifier */
  name: string; /* SLA display name */
  support_channel: string; /* Communication method: Email, Phone, Chat, etc. */
  response_time_hours: number; /* Maximum response time in hours */
  availability_schedule: string; /* Service hours: 24/7, Business Hours, etc. */
  notes: string; /* Additional SLA details */
  display_order: number; /* Sort order for display */
}

/* Add-on assignment configuration for plan creation */
export interface AddonAssignment {
  addon_id: number; /* Reference to addon */
  default_quantity: number | null; /* Default quantity for this plan */
  is_included: boolean; /* Whether included in base plan */
  feature_level: 'basic' | 'custom'; /* Feature complexity level */
  min_quantity: number | null; /* Minimum allowed quantity */
  max_quantity: number | null; /* Maximum allowed quantity (null = unlimited) */
}

/* Volume-based discount tier configuration */
export interface VolumeDiscount {
  id?: number | null; /* Optional for new records, required for updates */
  name: string; /* Descriptive name for discount tier */
  min_branches: number; /* Minimum branches to qualify */
  max_branches: number | null; /* Maximum branches (null = unlimited) */
  discount_percentage: number; /* Percentage reduction (0-100) */
}

/* API request payload structures */

/* Complete plan creation/update request payload */
export interface CreateSubscriptionPlanAPIPayloadRequest {
  /* Core plan details */
  name: string; /* Plan display name */
  description: string; /* Plan description */
  is_custom: boolean; /* Plan type: standard or custom */
  is_active: boolean; /* Availability status */
  
  /* Monthly and discount pricing */
  monthly_price: number; /* Base monthly subscription cost */
  monthly_fee_our_gateway: number; /* Monthly fee using our payment gateway */
  monthly_fee_byo_processor: number; /* Bring Your Own processor fee */
  card_processing_fee_percentage: number; /* Percentage fee for card processing */
  card_processing_fee_fixed: number; /* Fixed fee per card transaction */
  additional_device_cost: number; /* Cost per additional device */
  annual_discount_percentage: number; /* Discount for annual billing */
  // biennial_discount_percentage: number; /* 2-year commitment discount */
  // triennial_discount_percentage: number; /* 3-year commitment discount */
  
  /* Device and user constraints */
  included_devices_count: number; /* Number of included devices */
  max_users_per_branch: number; /* Maximum users per branch */
  included_branches_count: number | null; /* Number of included branches (null = unlimited) */
  
  /* Related entities and configurations */
  feature_ids?: number[]; /* Array of selected feature IDs */
  addon_assignments?: AddonAssignment[]; /* Add-on configurations with quantities */
  support_sla_ids?: number[]; /* Array of selected SLA IDs */
  volume_discounts?: VolumeDiscount[]; /* Volume-based discount tiers */
}

/* Feature creation request payload */
export interface CreatePlanFeaturePayloadRequest {
  name: string; /* Feature display name */
  description: string; /* Feature description */
}

/* Add-on creation request payload */
export interface CreatePlanAddOnPayloadRequest {
  name: string; /* Add-on display name */
  description: string; /* Add-on description */
  pricing_scope: 'branch' | 'organization'; /* Pricing model scope */
  base_price: number | null; /* Base price for the add-on */
}

/* SLA creation request payload */
export interface CreatePlanSLAPayloadRequest {
  name: string; /* SLA display name */
  support_channel: string; /* Communication method */
  response_time_hours: number; /* Maximum response time in hours */
  availability_schedule: string; /* Service hours */
  notes?: string | null; /* Additional SLA details */
}

/* API response data structures */

/* Response for fetching all plans */
export interface PlansListAPIResponse extends BaseListAPIResponse {
  data?: Plan[]; /* Array of plan summaries */
}

/* Response for fetching single plan details */
export interface GetPlanDetailsAPIResponse extends BaseListAPIResponse {
  data?: PlanDetails; /* Complete plan information */
}

/* Response for fetching all features */
export interface FeaturesListAPIResponse extends BaseListAPIResponse {
  data?: Feature[]; /* Array of available features */
}

/* Response for fetching all add-ons */
export interface AddOnsListAPIResponse extends BaseListAPIResponse {
  data?: Addon[]; /* Array of available add-ons */
}

/* Response for fetching all SLAs */
export interface SlaListAPIResponse extends BaseListAPIResponse {
  data?: SupportSLA[]; /* Array of available SLAs */
}

/* Response for plan creation/update operations */
export interface CreatePlanAPIResponse extends BaseAPIResponse {
  data?: CreationResponseData; /* Created plan information */
  validation_errors: ValidationError[]; /* Array of validation errors */
}

/* Response for feature creation operations */
export interface CreateFeatureAPIResponse extends BaseAPIResponse {
  data?: CreationResponseData; /* Created feature information */
  validation_errors: ValidationError; /* Validation error details */
}

/* Response for add-on creation operations */
export interface CreateAddonAPIResponse extends BaseAPIResponse {
  data?: CreationResponseData; /* Created add-on information */
  validation_errors: ValidationError; /* Validation error details */
}

/* Response for SLA creation operations */
export interface CreateSlaAPIResponse extends BaseAPIResponse {
  data?: CreationResponseData; /* Created SLA information */
  validation_errors: ValidationError; /* Validation error details */
}