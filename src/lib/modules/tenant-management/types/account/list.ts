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
  | 'trial'                // Subscription is in trial period
  | 'incomplete'              // Subscription setup is incomplete
  | 'suspended'                 // Subscription is suspended
  | 'paused';                 // Subscription is paused

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

/* Paginated tenant listing response */
export interface TenantListApiResponse {
  success: boolean;
  message: string;
  tenants: TenantWithPlanDetails[];
  pagination: {
    current_page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  timestamp: string
}

/* Tenant basic details for listing */
export interface TenantBasicDetails {
  id: number;
  tenant_id: string;
  organization_name: string;
  primary_email: string;
  primary_phone: string;
}

/* Paginated tenant basic listing response */
export interface TenantBasicListResponse {
  success: boolean;
  message: string;
  data: {
    tenants: TenantBasicDetails[];
  };
  timestamp: string;
}