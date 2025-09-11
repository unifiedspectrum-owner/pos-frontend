/* TypeScript interfaces for subscription plan data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Plan module imports */
import { Addon, Feature, Plan } from "@plan-management/types";

/* Tenant module imports */
import { PlanBillingCycle, AddonAssignements, BranchAddonAssignments, SelectedAddon, BranchSelection } from '@tenant-management/types/subscription';

/* Request payload for assigning plan to tenant */
export interface AssignPlanToTenantApiRequest {
  tenant_id: string;
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
    features: Feature[]; // adjust type if features is an object
    add_ons: Addon[];   // assuming it's an array of add-ons
  };
  billingCycle: PlanBillingCycle ; // adjust enum if fixed
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