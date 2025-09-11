/* TypeScript interfaces for payment status data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

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
    next_action: any; // Stripe's NextAction type
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
interface TenantInfo1 {
    tenant_id: string;
    plan_id: string | null;
  }

/* Complete payment status response data */
interface PaymentStatusData {
    payment_details: PaymentDetails;
    charge_details: ChargeDetails | null;
    status_info: StatusInfo;
    tenant_info: TenantInfo1 | null;
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