/* Tenant module imports */
import { 
  ActivateTenantApiRequest, 
  ActivateTenantApiResponse, 
  deleteTenantApiResponse, 
  HoldTenantApiRequest, 
  HoldTenantApiResponse, 
  SuspendTenantApiRequest, 
  SuspendTenantApiResponse 
} from "@tenant-management/types/account/suspension"
import { tenantApiClient } from "@tenant-management/api/clients"
import { TENANT_API_ROUTES } from "@tenant-management/constants/routes"

/* Service object containing tenant action API methods */
export const tenantActionsService = {

  /* Suspend tenant account */
  async suspendTenant(data: SuspendTenantApiRequest): Promise<SuspendTenantApiResponse> {
    try {
      const response = await tenantApiClient.put<SuspendTenantApiResponse>(TENANT_API_ROUTES.ACTIONS.SUSPEND, data)
      return response.data
    } catch (error) {
      console.error('[TenantActionsService] Failed to suspend tenant:', error)
      throw error
    }
  },

  /* Put tenant account on hold */
  async holdTenant(data: HoldTenantApiRequest): Promise<HoldTenantApiResponse> {
    try {
      const response = await tenantApiClient.put<HoldTenantApiResponse>(TENANT_API_ROUTES.ACTIONS.HOLD, data)
      return response.data
    } catch (error) {
      console.error('[TenantActionsService] Failed to hold tenant:', error)
      throw error
    }
  },

  /* Activate tenant account */
  async activateTenant(data: ActivateTenantApiRequest): Promise<ActivateTenantApiResponse> {
    try {
      const response = await tenantApiClient.put<ActivateTenantApiResponse>(TENANT_API_ROUTES.ACTIONS.ACTIVATE, data)
      return response.data
    } catch (error) {
      console.error('[TenantActionsService] Failed to activate tenant:', error)
      throw error
    }
  },

  /* Delete tenant account permanently */
  async deleteTenant(tenantId: string): Promise<deleteTenantApiResponse> {
    try {
      const response = await tenantApiClient.delete<deleteTenantApiResponse>(TENANT_API_ROUTES.ACTIONS.DELETE.replace(':id', tenantId))
      return response.data
    } catch (error) {
      console.error('[TenantActionsService] Failed to delete tenant:', error)
      throw error
    }
  },
}