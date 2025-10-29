/* TypeScript interfaces for subscription plan data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Plan management module imports */
import { Feature } from './feature';
import { Addon, AddonAssignment } from './addon';
import { SupportSLA } from './sla';
import { VolumeDiscount } from './volume-discount';

/* Entity Interfaces */

/* Basic plan information for list displays */
export interface Plan {
  id: number;
  name: string;
  description: string;
  features: Feature[];
  is_featured: boolean;
  is_active: boolean;
  is_custom: boolean;
  display_order: number;
  monthly_price: number;
  included_branches_count: number | null;
  annual_discount_percentage: number;
  add_ons: Addon[];
}

/* Complete plan data with all relationships */
export interface PlanDetails {
  /* Core plan details */
  id: number;
  name: string;
  description: string;
  display_order: number;
  trial_period_days: number;
  is_active: number;
  is_custom: number;

  /* Monthly and discount pricing */
  monthly_price: number;
  monthly_fee_our_gateway: number;
  monthly_fee_byo_processor: number;
  card_processing_fee_percentage: number;
  card_processing_fee_fixed: number;
  additional_device_cost: number;
  annual_discount_percentage: number;
  biennial_discount_percentage: number;
  triennial_discount_percentage: number;

  /* Device and user constraints */
  included_devices_count: number;
  max_users_per_branch: number;
  included_branches_count: number | null;

  /* Related entities and configurations */
  features: Feature[];
  add_ons: Addon[];
  support_sla: SupportSLA[];
  volume_discounts: VolumeDiscount[];
}

/* API: Get Plans List */

/* Response for fetching all plans */
export interface PlansListApiResponse {
  success: boolean;
  error?: string;
  message: string;
  timestamp: string;
  count: number;
  data?: Plan[];
}

/* API: Get Plan Details */

/* Response for fetching single plan details */
export interface GetPlanDetailsApiResponse {
  success: boolean;
  error?: string;
  message: string;
  timestamp: string;
  count: number;
  data?: PlanDetails;
}

/* API: Create Plan */

/* Complete plan creation/update request payload */
export interface CreatePlanApiRequest {
  /* Core plan details */
  name: string;
  description: string;
  is_custom: boolean;
  is_active: boolean;

  /* Monthly and discount pricing */
  monthly_price: number;
  monthly_fee_our_gateway: number;
  monthly_fee_byo_processor: number;
  card_processing_fee_percentage: number;
  card_processing_fee_fixed: number;
  additional_device_cost: number;
  annual_discount_percentage: number;

  /* Device and user constraints */
  included_devices_count: number;
  max_users_per_branch: number;
  included_branches_count: number | null;

  /* Related entities and configurations */
  feature_ids?: number[];
  addon_assignments?: AddonAssignment[];
  support_sla_ids?: number[];
  volume_discounts?: VolumeDiscount[];
}

/* Response for plan creation/update operations */
export interface CreatePlanApiResponse {
  success: boolean;
  error?: string;
  message: string;
  timestamp: string;
  data?: {
    id: number;
    name: string;
    status: boolean;
  };
  validation_errors?: ValidationError[];
}
