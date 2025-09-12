/* Tenant module imports */
import {
  InitiateSubscriptionPaymentApiRequest,
  InitiateSubscriptionPaymentApiResponse,
  PaymentStatusApiRequest,
  PaymentStatusApiResponse,
} from "@tenant-management/types/payment"
import { tenantApiClient } from "@tenant-management/api/clients"

/* Service object containing payment management API methods */
export const paymentService = {

  /* Initiate subscription payment process */
  async initiateTenantSubscriptionPayment(data: InitiateSubscriptionPaymentApiRequest): Promise<InitiateSubscriptionPaymentApiResponse> {
    try {
      const response = await tenantApiClient.post<InitiateSubscriptionPaymentApiResponse>('/account/payment/initiate', data)
      return response.data
    } catch (error) {
      console.error('[PaymentService] Failed to initiate payment:', error)
      throw error
    }
  },

  /* Get payment status for tenant subscription */
  async getPaymentStatusForTenant(data: PaymentStatusApiRequest): Promise<PaymentStatusApiResponse> {
    try {
      const response = await tenantApiClient.post<PaymentStatusApiResponse>('/account/payment/status', data)
      return response.data
    } catch (error) {
      console.error('[PaymentService] Failed to get payment status:', error)
      throw error
    }
  },
}