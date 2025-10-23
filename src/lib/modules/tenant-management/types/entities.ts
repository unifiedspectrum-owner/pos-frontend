/* TypeScript interfaces for tenant domain entities */

/* Tenant account status type matching database schema */
export type TenantStatus =
  | 'active'                  // Tenant account is active and operational
  | 'hold'                    // Tenant account is on temporary hold
  | 'suspended'               // Tenant account is suspended due to payment/policy issues
  | 'cancelled'               // Tenant account has been cancelled
  | 'trial'                   // Tenant is in trial period
  | 'setup'                   // Tenant is in initial setup phase
  | 'pending_verification'    // Tenant is pending verification
  | 'inactive';               // Tenant account is inactive

/* Tenant subscription status type */
export type TenantSubscriptionStatus =
  | 'setup'                   // Subscription is being set up
  | 'active'                  // Subscription is active and current
  | 'past_due'                // Payment is past due
  | 'cancelled'               // Subscription has been cancelled
  | 'trial'                   // Subscription is in trial period
  | 'incomplete'              // Subscription setup is incomplete
  | 'suspended'               // Subscription is suspended
  | 'paused';                 // Subscription is paused

/* Complete tenant organization information */
export interface TenantInfo {
  company_name: string;
  contact_person: string;
  primary_email: string;
  primary_phone: string,
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

/* Account verification status tracking */
export interface TenantVerificationInfo {
  email_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* Account verification status with completion flag */
export interface TenantVerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  both_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* Tenant basic details for listing */
export interface TenantBasicDetails {
  id: number;
  tenant_id: string;
  organization_name: string;
  primary_email: string;
  primary_phone: string;
}

/* Tenant with complete plan and subscription details */
export interface TenantWithPlanDetails {
  tenant_id: string;
  organization_name: string;
  tenant_status: TenantStatus;
  tenant_created_at: string;

  plan_id?: number;
  plan_name?: string;
  subscription_status?: TenantSubscriptionStatus;
  billing_cycle?: string;
  subscription_created_at?: string;
}

/* Extended tenant profile with complete account information */
export interface TenantDetails {
  tenant_id: string;
  organization_name: string;
  contact_person: string;
  primary_email: string;
  primary_phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  email_verified: boolean;
  phone_verified: boolean;
  deployment_type: string,
  last_deployment_status: string,
  last_deployed_at: string,
  max_branches_count: number | null,
  current_branches_count: number,
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/* Tenant subscription plan details */
export interface TenantSubscriptionDetails {
  plan_id: number;
  plan_name: string;
  plan_description: string;
  billing_cycle: 'monthly' | 'yearly',
  billing_period_start: string,
  billing_period_end: string,
  next_billing_date: string,
  last_billing_date: string,
  subscription_status: string;
}

/* Tenant assigned addon information */
export interface TenantAssignedAddonDetails {
  assignment_id: number;
  tenant_id: string;
  branch_id: string | null;
  addon_id: number;
  addon_name: string;
  addon_description: string;
  pricing_scope: string;
  billing_cycle: 'monthly' | 'yearly',
  billing_period_start: string,
  billing_period_end: string,
  next_billing_date: string,
  last_billing_date: string,
  subscription_status: string;
  feature_level: string;
}

/* Transaction history entry */
export interface TenantTransactionDetails {
  id: number;
  tenant_id: string;
  invoice_id?: string;
  transaction_status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  transaction_type: 'subscription' | 'upgrade' | 'downgrade' | 'addon';
  total_plan_amount: number;
  total_addon_amount: number;
  tax: number;
  discount: number;
  net_amount: number;
  payment_method_type?: 'card' | 'bank' | 'paypal' | 'invoice' | 'manual';
  payment_processor?: 'stripe' | 'paypal' | 'manual' | 'wire';
  due_date: string;
  invoice_date?: string;
  last_failed_payment_date?: string;
  created_at: string;
  updated_at: string;
}

/* Transaction summary statistics */
export interface TenantTransactionSummary {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_paid_amount: number;
  total_pending_amount: number;
  last_successful_payment_date?: string;
  last_failed_payment_date?: string;
}
