/* TypeScript interfaces for plan addon data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Plan management module imports */
import { ADDON_PRICING_SCOPES, ADDON_FEATURE_LEVELS } from '@plan-management/constants';

/* Type Definitions */

/* Add-on pricing scope type */
export type AddonPricingScope = typeof ADDON_PRICING_SCOPES[keyof typeof ADDON_PRICING_SCOPES];

/* Add-on feature level type */
export type AddonFeatureLevel = typeof ADDON_FEATURE_LEVELS[keyof typeof ADDON_FEATURE_LEVELS];

/* Entity Interfaces */

/* Add-on service with pricing configuration */
export interface Addon {
  id: number;
  name: string;
  description: string;
  pricing_scope: AddonPricingScope;
  addon_price: number;
  default_quantity: number | null;
  is_included: boolean;
  feature_level: AddonFeatureLevel | null;
  min_quantity: number | null;
  max_quantity: number | null;
  display_order: number;
}

/* Add-on assignment configuration for plan creation */
export interface AddonAssignment {
  addon_id: number;
  default_quantity: number | null;
  is_included: boolean;
  feature_level: AddonFeatureLevel;
  min_quantity: number | null;
  max_quantity: number | null;
}

/* API: Get Addons List */

/* Response for fetching all add-ons */
export interface AddonsListApiResponse {
  success: boolean;
  error?: string;
  message: string;
  timestamp: string;
  count: number;
  data?: Addon[];
}

/* API: Create Addon */

/* Add-on creation request payload */
export interface CreateAddonApiRequest {
  name: string;
  description: string;
  pricing_scope: AddonPricingScope;
  base_price: number | null;
}

/* Response for add-on creation operations */
export interface CreateAddonApiResponse {
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
