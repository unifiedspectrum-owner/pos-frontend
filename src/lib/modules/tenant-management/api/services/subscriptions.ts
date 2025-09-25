/* Tenant module imports */
import {
  AssignPlanToTenantApiRequest,
  AssignPlanToTenantApiResponse,
  AssignedPlanApiResponse,
} from "@tenant-management/types/subscription"
import { AccountStatusApiRequest } from "@tenant-management/types/account"
import { tenantApiClient } from "@tenant-management/api/clients"
import { TENANT_API_ROUTES } from "@tenant-management/constants/routes"

/* Service object containing subscription management API methods */
export const subscriptionService = {

  /* Assign subscription plan to tenant */
  async assignPlanToTenant(data: AssignPlanToTenantApiRequest): Promise<AssignPlanToTenantApiResponse> {
    try {
      const response = await tenantApiClient.post<AssignPlanToTenantApiResponse>(TENANT_API_ROUTES.ACCOUNT.ASSIGN_PLAN, data)
      return response.data
    } catch (error) {
      console.error('[SubscriptionService] Failed to assign plan:', error)
      throw error
    }
  },

  /* Get assigned plan details for tenant */
  async getAssignedPlanForTenant(data: AccountStatusApiRequest): Promise<AssignedPlanApiResponse> {
    try {
      const response = await tenantApiClient.post<AssignedPlanApiResponse>(TENANT_API_ROUTES.ACCOUNT.GET_ASSIGNED_PLAN, data)
      return response.data
    } catch (error) {
      console.error('[SubscriptionService] Failed to get assigned plan:', error)
      throw error
    }
  },
}