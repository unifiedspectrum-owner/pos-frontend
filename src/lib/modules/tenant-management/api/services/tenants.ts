/* Tenant management API service methods for tenant entity CRUD and lifecycle operations */

/* Tenant module imports */
import { TenantBasicListResponse, TenantListApiResponse, TenantDetailsApiResponse, ActivateTenantApiRequest, ActivateTenantApiResponse, deleteTenantApiResponse, HoldTenantApiRequest, HoldTenantApiResponse, SuspendTenantApiRequest, SuspendTenantApiResponse } from "@tenant-management/types"
import { tenantApiClient } from "@tenant-management/api/client"
import { TENANT_API_ROUTES } from "@tenant-management/constants"

/* Service object containing all tenant entity operations */
export const tenantService = {

  /* Get all tenants with pagination */
  async listAllTenants(page: number = 1, limit: number = 10): Promise<TenantListApiResponse> {
    try {
      const response = await tenantApiClient.get<TenantListApiResponse>(TENANT_API_ROUTES.LIST, {
        params: {
          page,
          limit
        }
      })
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to list tenants:', error)
      throw error
    }
  },

  /* Get all tenants with base details */
  async listAllTenantsWithBaseDetails(): Promise<TenantBasicListResponse> {
    try {
      const response = await tenantApiClient.get<TenantBasicListResponse>(TENANT_API_ROUTES.LIST_WITH_BASIC_DETAILS)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to list tenants:', error)
      throw error
    }
  },

  /* Get detailed information for a specific tenant */
  async getTenantDetails(tenantId: string): Promise<TenantDetailsApiResponse> {
    try {
      const response = await tenantApiClient.get<TenantDetailsApiResponse>(TENANT_API_ROUTES.DETAILS.replace(':id', tenantId))
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to get tenant details:', error)
      throw error
    }
  },

  /* Suspend tenant account */
  async suspendTenant(data: SuspendTenantApiRequest, tenantId: string): Promise<SuspendTenantApiResponse> {
    try {
      const response = await tenantApiClient.put<SuspendTenantApiResponse>(TENANT_API_ROUTES.ACTIONS.SUSPEND.replace(':id', tenantId), data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to suspend tenant:', error)
      throw error
    }
  },

  /* Put tenant account on hold */
  async holdTenant(data: HoldTenantApiRequest, tenantId: string): Promise<HoldTenantApiResponse> {
    try {
      const response = await tenantApiClient.put<HoldTenantApiResponse>(TENANT_API_ROUTES.ACTIONS.HOLD.replace(':id', tenantId), data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to hold tenant:', error)
      throw error
    }
  },

  /* Activate tenant account */
  async activateTenant(data: ActivateTenantApiRequest, tenantId: string): Promise<ActivateTenantApiResponse> {
    try {
      const response = await tenantApiClient.put<ActivateTenantApiResponse>(TENANT_API_ROUTES.ACTIONS.ACTIVATE.replace(':id', tenantId), data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to activate tenant:', error)
      throw error
    }
  },

  /* Delete tenant account permanently */
  async deleteTenant(tenantId: string): Promise<deleteTenantApiResponse> {
    try {
      const response = await tenantApiClient.delete<deleteTenantApiResponse>(TENANT_API_ROUTES.ACTIONS.DELETE.replace(':id', tenantId))
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to delete tenant:', error)
      throw error
    }
  },
}
