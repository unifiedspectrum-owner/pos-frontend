/* User module imports */
import { RoleListApiResponse } from "@/lib/modules/user-management/types/roles"
import { roleApiClient } from "@user-management/api/clients"
import { ROLE_API_ROUTES } from "@user-management/constants"

/* Service object containing role CRUD operations API methods */
export const roleManagementService = {

  /* Get all roles with pagination and filtering */
  async listAllRoles(page?: number, limit?: number): Promise<RoleListApiResponse> {
    try {
      const response = await roleApiClient.get<RoleListApiResponse>(ROLE_API_ROUTES.LIST, {
        params: {
          page,
          limit
        }
      })
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to list roles:', error)
      throw error
    }
  },
}