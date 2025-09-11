/* TypeScript interfaces for payment initiation data structures */

/* Tenant module imports */
import { PlanBillingCycle } from '@tenant-management/types/subscription';

/* Request payload for initiating subscription payment */
export interface InitiateSubscriptionPaymentApiRequest {
  tenant_id: string;
  plan_id: number;
  billing_cycle: PlanBillingCycle;
  plan_tot_amt: number;
  branch_addon_tot_amt: number;
  org_addon_tot_amt: number;
  tot_amt: number;
}

/* API response for payment initiation operation */
export interface InitiateSubscriptionPaymentApiResponse {
  success: boolean;
  message: string;
  data: {
    customer_id: string,
    type: 'setup' | string,
    clientSecret: string | null,
  };
  timestamp: string;
}