/* TypeScript interfaces for payment-related data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Tenant module imports */
import { PlanBillingCycle } from './subscription';

/* ==================== Payment Initiation ==================== */

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

/* API response for payment completion operation */
export interface CompleteSubscriptionPaymentApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant: {
      tenant_id: string,
      organization_name: string,
      status: 'active'
    },
  };
  timestamp: string;
}

/* ==================== Payment Status ==================== */

/* Request payload for retrieving payment status */
export interface PaymentStatusApiRequest {
  payment_intent: string
}

/* Payment amount details */
interface PaymentAmount {
  total: number;
  currency: string;
  formatted: string;
}

/* Payment error information */
interface PaymentError {
  code: string | null;
  message: string;
  type: string;
  decline_code?: string;
}

/* Credit card details */
interface CardDetails {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  funding: string;
  country: string;
}

/* Payment method information */
interface PaymentMethodDetails {
  type: string;
  card: CardDetails | null;
}

/* Customer billing address details */
interface BillingDetails {
  address: {
    city: string | null;
    country: string | null;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  };
  email: string | null;
  name: string | null;
  phone: string | null;
}

/* Charge processing outcome */
interface ChargeOutcome {
  network_status: string;
  reason: string | null;
  risk_level: string;
  risk_score: number;
  seller_message: string;
  type: string;
}

/* Detailed charge information */
interface ChargeDetails {
  charge_id: string;
  amount_captured: number;
  paid: boolean;
  created: string;
  payment_method_details: PaymentMethodDetails;
  receipt_url: string | null;
  billing_details: BillingDetails;
  outcome: ChargeOutcome | null;
}

/* Complete payment transaction details */
interface PaymentDetails {
  payment_intent_id: string;
  status: string;
  amount: PaymentAmount;
  created: string;
  customer_id: string | null;
  description: string | null;
  metadata: Record<string, string>;
  payment_method_types: string[];
  receipt_email: string | null;
  client_secret: string | null;
  next_action: any;
  last_payment_error: PaymentError | null;
}

/* Payment status indicators */
interface StatusInfo {
  is_successful: boolean;
  is_pending: boolean;
  is_failed: boolean;
  requires_action: boolean;
  can_retry: boolean;
  status_message: string;
  raw_status: string;
}

/* Tenant identification for payment */
interface TenantInfo {
  tenant_id: string;
  plan_id: string | null;
}

/* Complete payment status response data */
interface PaymentStatusData {
  payment_details: PaymentDetails;
  charge_details: ChargeDetails | null;
  status_info: StatusInfo;
  tenant_info: TenantInfo | null;
}

/* API response for payment status query */
export interface PaymentStatusApiResponse {
  success: boolean;
  data?: PaymentStatusData;
  error?: string;
  validation_errors?: ValidationError[];
  message: string;
  timestamp: string;
}
