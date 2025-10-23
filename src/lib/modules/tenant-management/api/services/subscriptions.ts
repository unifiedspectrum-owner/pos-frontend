/* Tenant module imports */
import { AssignPlanToTenantApiRequest, AssignPlanToTenantApiResponse, AssignedPlanApiResponse, StartResourceProvisioningApiResponse } from "@tenant-management/types"
import { tenantApiClient } from "@tenant-management/api/client"
import { TENANT_API_ROUTES } from "@tenant-management/constants"

/* Service object containing subscription management API methods */
export const subscriptionService = {

  /* Assign subscription plan to tenant */
  async assignPlanToTenant(data: AssignPlanToTenantApiRequest, tenantId: string): Promise<AssignPlanToTenantApiResponse> {
    try {
      const response = await tenantApiClient.post<AssignPlanToTenantApiResponse>(TENANT_API_ROUTES.ACCOUNT.ASSIGN_PLAN.replace(':id', tenantId), data)
      return response.data
    } catch (error) {
      console.error('[SubscriptionService] Failed to assign plan:', error)
      throw error
    }
  },

  /* Get assigned plan details for tenant */
  async getAssignedPlanForTenant(tenantId: string): Promise<AssignedPlanApiResponse> {
    try {
      const response = await tenantApiClient.get<AssignedPlanApiResponse>(TENANT_API_ROUTES.ACCOUNT.GET_ASSIGNED_PLAN.replace(':id', tenantId))
      return response.data
    } catch (error) {
      console.error('[SubscriptionService] Failed to get assigned plan:', error)
      throw error
    }
  },

  /* Start tenant resource provisioning */
  async startTenantResourceProvisioning(tenantId: string): Promise<StartResourceProvisioningApiResponse> {
    try {
      const response = await tenantApiClient.post<StartResourceProvisioningApiResponse>(TENANT_API_ROUTES.PROVISION.START.replace(':id', tenantId))
      return response.data
    } catch (error) {
      console.error('[SubscriptionService] Failed to start resource provisioning:', error)
      throw error
    }
  },
}