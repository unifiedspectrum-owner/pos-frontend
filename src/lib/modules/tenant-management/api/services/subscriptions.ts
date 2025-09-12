/* Tenant module imports */
import {
  AssignPlanToTenantApiRequest,
  AssignPlanToTenantApiResponse,
  AssignedPlanApiResponse,
} from "@tenant-management/types/subscription"
import { AccountStatusApiRequest } from "@tenant-management/types/account"
import { tenantApiClient } from "@tenant-management/api/clients"

/* Service object containing subscription management API methods */
export const subscriptionService = {

  /* Assign subscription plan to tenant */
  async assignPlanToTenant(data: AssignPlanToTenantApiRequest): Promise<AssignPlanToTenantApiResponse> {
    try {
      const response = await tenantApiClient.post<AssignPlanToTenantApiResponse>('/account/assign-plan', data)
      return response.data
    } catch (error) {
      console.error('[SubscriptionService] Failed to assign plan:', error)
      throw error
    }
  },

  /* Get assigned plan details for tenant */
  async getAssignedPlanForTenant(data: AccountStatusApiRequest): Promise<AssignedPlanApiResponse> {
    try {
      const response = await tenantApiClient.post<AssignedPlanApiResponse>('/account/get-assigned-plan', data)
      return response.data
    } catch (error) {
      console.error('[SubscriptionService] Failed to get assigned plan:', error)
      throw error
    }
  },
}