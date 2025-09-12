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
import { AccountStatusApiRequest } from "@tenant-management/types/account"
import { tenantApiClient } from "@tenant-management/api/clients"

/* Service object containing tenant action API methods */
export const tenantActionsService = {

  /* Suspend tenant account */
  async suspendTenant(data: SuspendTenantApiRequest): Promise<SuspendTenantApiResponse> {
    try {
      const response = await tenantApiClient.post<SuspendTenantApiResponse>('/suspend', data)
      return response.data
    } catch (error) {
      console.error('[TenantActionsService] Failed to suspend tenant:', error)
      throw error
    }
  },

  /* Put tenant account on hold */
  async holdTenant(data: HoldTenantApiRequest): Promise<HoldTenantApiResponse> {
    try {
      const response = await tenantApiClient.post<HoldTenantApiResponse>('/hold', data)
      return response.data
    } catch (error) {
      console.error('[TenantActionsService] Failed to hold tenant:', error)
      throw error
    }
  },

  /* Activate tenant account */
  async activateTenant(data: ActivateTenantApiRequest): Promise<ActivateTenantApiResponse> {
    try {
      const response = await tenantApiClient.post<ActivateTenantApiResponse>('/activate', data)
      return response.data
    } catch (error) {
      console.error('[TenantActionsService] Failed to activate tenant:', error)
      throw error
    }
  },

  /* Delete tenant account permanently */
  async deleteTenant(data: AccountStatusApiRequest): Promise<deleteTenantApiResponse> {
    try {
      const response = await tenantApiClient.post<deleteTenantApiResponse>('/delete', data)
      return response.data
    } catch (error) {
      console.error('[TenantActionsService] Failed to delete tenant:', error)
      throw error
    }
  },
}