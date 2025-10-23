/* TypeScript interfaces for subscription-related data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Plan module imports */
import { Addon, AddonPricingScope, Feature, Plan } from "@plan-management/types";

/* Tenant module imports */
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants';

/* ==================== Billing Types ==================== */

/* Billing cycle type derived from constant */
export type PlanBillingCycle = typeof PLAN_BILLING_CYCLE[keyof typeof PLAN_BILLING_CYCLE]

/* ==================== Addon Types ==================== */

/* Addon assignment configuration */
export interface AddonAssignements {
  addon_id: number;
  feature_level?: 'basic' | 'premium' | 'custom';
}

/* Branch-level addon assignments */
export interface BranchAddonAssignments {
  branch_id: number;
  addon_assignments: AddonAssignements[];
}

/* Complete branch information with name and selection state */
export interface BranchSelection {
  branchIndex: number
  branchName: string
  isSelected: boolean
}

/* Legacy type alias for backward compatibility in addons */
export type AddonBranchSelection = BranchSelection

/* Selected addon configuration with pricing and branch data */
export interface SelectedAddon {
  addon_id: number
  addon_name: string
  addon_price: number
  pricing_scope: AddonPricingScope
  branches: AddonBranchSelection[]
  is_included: boolean
}

/* Assigned addon details with assignment tracking */
export interface AssignedAddonDetails {
  assignment_id: number;
  tenant_id: string;
  branch_id: string | null;
  addon_id: number;
  addon_name: string;
  addon_description: string;
  addon_price: number;
  pricing_scope: AddonPricingScope;
  status: string;
  feature_level: 'basic' | 'premium' | 'custom';
  billing_cycle: PlanBillingCycle;
}

/* ==================== Plan Assignment Types ==================== */

/* Request payload for assigning plan to tenant */
export interface AssignPlanToTenantApiRequest {
  plan_id: number;
  billing_cycle: PlanBillingCycle;
  branches_count: number;
  organization_addon_assignments: AddonAssignements[];
  branch_addon_assignments: BranchAddonAssignments[];
}

/* API response for plan assignment operation */
export interface AssignPlanToTenantApiResponse {
  success: boolean,
  message: string,
  data?: {
    tenant_id: string,
    plan_id: number,
    subscription_status: string;
    billing_cycle: PlanBillingCycle
  },
  error?: string,
  validation_errors?: ValidationError[],
  timestamp: string
}

/* Plan selection state for tenant setup UI */
export interface PlanSelectionState {
  selectedPlan: Plan | null
  selectedAddons: SelectedAddon[]
  billingCycle: PlanBillingCycle
  branchCount: number
  totalCost: number
}

/* Assigned plan details retrieved from API */
export interface AssignedPlanDetails {
  plan: {
    id: number;
    name: string;
    description: string;
    display_order: number;
    is_active: boolean;
    is_custom: boolean;
    is_featured: boolean;
    monthly_price: number;
    included_branches_count: number | null;
    annual_discount_percentage: number;
    features: Feature[];
    add_ons: Addon[];
  };
  billingCycle: PlanBillingCycle;
  branchCount: number;
  branches: BranchSelection[];
  add_ons: SelectedAddon[];
}

/* API response for retrieving assigned plan and addon data */
export interface AssignedPlanApiResponse {
  success: boolean;
  message: string;
  data: AssignedPlanDetails;
  timestamp: string;
}

/* ==================== Cache Data Types ==================== */

/* localStorage plan data structure interface */
export interface CachedPlanData {
  selectedPlan: Plan | null
  billingCycle: PlanBillingCycle
  branchCount: number
  selectedAddons: SelectedAddon[];
  branches: BranchSelection[]
}

/* localStorage payment data structure interface */
export interface CachedPaymentStatusData {
  paymentSucceeded: boolean,
  completedAt?: string,
  paymentIntent?: string,
  statusMessage?: string;
  retrySuccessful?: boolean
}
