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

/* Complete tenant information response */
export interface TenantDetailsApiResponse {
  success: boolean,
  message: string;
  error?: string;
  data?: {
    tenant_details: TenantDetails;
    subscription_details: {
      plan_details: TenantSubscriptionDetails | null;
      addon_details: TenantAssignedAddonDetails[]
    }
    transaction_details: {
      transactions: TenantTransactionDetails[];
      transaction_summary: TenantTransactionSummary;
    };
    
  }
  timestamp: string;
}