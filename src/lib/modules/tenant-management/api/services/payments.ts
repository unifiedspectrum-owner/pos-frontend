/* Tenant module imports */
import {
  CompleteSubscriptionPaymentApiResponse,
  InitiateSubscriptionPaymentApiRequest,
  InitiateSubscriptionPaymentApiResponse,
  PaymentStatusApiRequest,
  PaymentStatusApiResponse,
} from "@tenant-management/types/payment"
import { tenantApiClient } from "@tenant-management/api/clients"
import { TENANT_API_ROUTES } from "@tenant-management/constants/routes"
import { completeTenantSubscriptionPayment } from "@tenant-management/schemas"

/* Service object containing payment management API methods */
export const paymentService = {

  /* Initiate subscription payment process */
  async initiateTenantSubscriptionPayment(data: InitiateSubscriptionPaymentApiRequest): Promise<InitiateSubscriptionPaymentApiResponse> {
    try {
      const response = await tenantApiClient.post<InitiateSubscriptionPaymentApiResponse>(TENANT_API_ROUTES.PAYMENT.INITIATE, data)
      return response.data
    } catch (error) {
      console.error('[PaymentService] Failed to initiate payment:', error)
      throw error
    }
  },

  /* Get payment status for tenant subscription */
  async getPaymentStatusForTenant(data: PaymentStatusApiRequest): Promise<PaymentStatusApiResponse> {
    try {
      const response = await tenantApiClient.post<PaymentStatusApiResponse>(TENANT_API_ROUTES.PAYMENT.STATUS, data)
      return response.data
    } catch (error) {
      console.error('[PaymentService] Failed to get payment status:', error)
      throw error
    }
  },

  /* Complete subscription payment process */
  async completeTenantSubscriptionPayment(data: completeTenantSubscriptionPayment): Promise<CompleteSubscriptionPaymentApiResponse> {
    try {
      const response = await tenantApiClient.post<CompleteSubscriptionPaymentApiResponse>(TENANT_API_ROUTES.PAYMENT.COMPLETE, data)
      return response.data
    } catch (error) {
      console.error('[PaymentService] Failed to initiate payment:', error)
      throw error
    }
  },
}