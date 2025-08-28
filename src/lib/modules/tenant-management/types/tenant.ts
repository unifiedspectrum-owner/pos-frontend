import { Plan } from "@plan-management/types";

/* Field validation error structure */
export interface ValidationError {
  field: string;
  message: string;
}

/* Billing cycle options for subscription plans */
export type PlanBillingCycle = 'monthly' | 'yearly'

/* ================================ */
/* TENANT ACCOUNT CREATION */
/* ================================ */

/* Request payload for creating new tenant account */
export interface TenantAccountCreationAPIRequest {
  company_name: string;
  primary_email: string;
  primary_phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

/* API response for tenant account creation */
export interface TenantAccountCreationAPIResponse {
  success: boolean,
  message: string,
  data?: {
    tenant_id: string,
    company_name: string,
    status: string
  },
  error?: string,
  validation_errors?: ValidationError[],
  timestamp: string
}

/* ================================ */
/* OTP VERIFICATION SYSTEM */
/* ================================ */

/* Request payload for generating OTP codes */
export interface RequestTenantAccountVerificationOTPAPIRequest {
  tenant_id: string;
  otp_type: "email_verification" | "phone_verification" | "all";
}

/* API response for OTP generation request */
export interface RequestTenantAccountVerificationOTPAPIResponse {
  success: boolean,
  message: string,
  data?: {
    tenant_id: string,
    verification_type: 'email_verification' | 'phone_verification' | 'all',
    otp_code?: number /* Single OTP for specific type */
    otps?: { /* Multiple OTPs for 'all' type */
      type: string;
      destination: string;
      otp_code: number;
    }[]
  },
  error?: string,
  validation_errors?: ValidationError[],
  timestamp: string
}

/* Request payload for verifying OTP code */
export interface VerifyTenantAccountVerificationOTPAPIRequest {
  tenant_id: string;
  otp_type: "email_verification" | "phone_verification";
  otp_code: number;
}

/* API response for OTP verification */
export interface VerifyTenantAccountVerificationOTPAPIResponse {
  success: boolean,
  message: string,
  data?: {
    tenant_id: string,
    verification_type: 'email' | 'phone',
    verified: boolean
    verified_at: string
  },
  error?: string,
  validation_errors?: ValidationError[],
  timestamp: string
}

/* Workflow steps for tenant account creation process */
export type TenantAccountCreationStepType = 'tenant-info' | 'verification' | 'plan-selection' | 'plan-summary'

/* ================================ */
/* TENANT DATA STRUCTURES */
/* ================================ */

/* Complete tenant organization information */
export interface TenantInfo {
  organization_name: string;
  primary_email: string;
  primary_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

/* Account verification status tracking */
export interface TenantVerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  both_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* Complete tenant data structure */
export interface TenantAccountInfo {
  tenant_id: string;
  tenant_info: TenantInfo;
  verification_status: TenantVerificationStatus;
}

/* Request payload for tenant status check */
export interface TenantStatusApiRquest {
  tenant_id: string
}

/* API response for tenant status queries */
export interface TenantStatusApiResponse {
  success: boolean;
  data: TenantAccountInfo;
  message: string;
  timestamp: string;
}


/* Addon Assignments */
export interface AddonAssignements {
  addon_id: number;
  feature_level?: 'basic' | 'premium' | 'custom'; // optional with default "basic"
}

/* Branch-level Addon Assignments */
export interface BranchAddonAssignments {
  branch_id: number;
  addon_assignments: AddonAssignements[];
}

/* Request payload for assignplan for tenant */
export interface AssignPlanToTenantApiRequest {
  tenant_id: string;
  plan_id: number;
  billing_cycle: PlanBillingCycle;
  branches_count: number;
  organization_addon_assignments: AddonAssignements[];
  branch_addon_assignments: BranchAddonAssignments[];
}

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

/* ================================ */
/* PLAN SELECTION UI TYPES */
/* ================================ */

/* Branch selection state for individual addons */
export interface AddonBranchSelection {
  branchIndex: number
  isSelected: boolean
}

/* Selected addon configuration with pricing and branch data */
export interface SelectedAddon {
  addonId: number
  addonName: string
  addonPrice: number
  pricingScope: 'branch' | 'organization'
  branches: AddonBranchSelection[]
  isIncluded: boolean
}

/* Plan selection state for tenant setup UI */
export interface PlanSelectionState {
  selectedPlan: Plan | null
  selectedAddons: SelectedAddon[]
  billingCycle: PlanBillingCycle
  branchCount: number
  totalCost: number
}

/* ================================ */
/* ASSIGNED PLAN DATA */
/* ================================ */

/* Assigned plan details retrieved from API */
export interface AssignedPlanDetails {
  tenant_id: string;
  plan_id: number;
  plan_name: string;
  plan_description: string | null;
  monthly_price: number;
  annual_discount_percentage: number;
  subscription_status: string;
  billing_cycle: string;
  max_branches_count: number;
  current_branches_count: number;
}

/* Assigned addon details with assignment tracking */
export interface AssignedAddonDetails {
  assignment_id: number;
  tenant_id: string;
  branch_id: string | null; /* Null for organization-scoped addons */
  addon_id: number;
  addon_name: string;
  addon_description: string;
  addon_price: number;
  pricing_scope: 'organization' | 'branch';
  status: string;
  feature_level: 'basic' | 'premium' | 'custom';
  billing_cycle: PlanBillingCycle;
}

/* API response for retrieving assigned plan and addon data */
export interface AssignedPlanApiResponse {
  success: boolean;
  message: string;
  data: {
    plan_details: AssignedPlanDetails;
    addon_details: {
      organization_addons: AssignedAddonDetails[];
      branch_addons: AssignedAddonDetails[];
    };
  };
  timestamp: string;
}
