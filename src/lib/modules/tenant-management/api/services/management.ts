/* Tenant module imports */
import { TenantListApiResponse } from "@tenant-management/types/account/list"
import { TenantDetailsApiResponse } from "@tenant-management/types/account/details"
import { AccountStatusApiRequest } from "@tenant-management/types/account"
import { tenantApiClient } from "@tenant-management/api/clients"

/* Service object containing tenant CRUD operations API methods */
export const tenantManagementService = {

  /* Get all tenants with pagination */
  async listAllTenants(page: number = 1, limit: number = 10): Promise<TenantListApiResponse> {
    try {
      const response = await tenantApiClient.get<TenantListApiResponse>('/list', {
        params: {
          page,
          limit
        }
      })
      return response.data
    } catch (error) {
      console.error('[TenantManagementService] Failed to list tenants:', error)
      throw error
    }
  },

  /* Get detailed information for a specific tenant */
  async getTenantDetails(data: AccountStatusApiRequest): Promise<TenantDetailsApiResponse> {
    try {
      const response = await tenantApiClient.post<TenantDetailsApiResponse>('/details', data)
      return response.data
    } catch (error) {
      console.error('[TenantManagementService] Failed to get tenant details:', error)
      throw error
    }
  },
}