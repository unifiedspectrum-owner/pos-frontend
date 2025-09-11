/* Tenant with complete plan and subscription details */
export interface TenantWithPlanDetails {
  tenant_id: string;
  organization_name: string;
  tenant_status: string;
  tenant_created_at: string;
  
  plan_id?: number;
  plan_name?: string;
  subscription_status?: string;
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
}