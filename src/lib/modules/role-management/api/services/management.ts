/* Role module imports */
import { RoleCreationApiRequest, RoleCreationApiResponse, RoleDeletionApiResponse, RoleListApiResponse } from "@role-management/types"
import { roleApiClient } from "@role-management/api/clients"
import { ROLE_API_ROUTES } from "@role-management/constants"

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

  /* Create new role with provided data */
  async createRole(data: RoleCreationApiRequest): Promise<RoleCreationApiResponse> {
    try {
      const response = await roleApiClient.post<RoleCreationApiResponse>(ROLE_API_ROUTES.CREATE, data)
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to create role:', error)
      throw error
    }
  },

   /* Remove role permanently by ID */
  async deleteRole(roleId: string): Promise<RoleDeletionApiResponse> {
    try {
      const response = await roleApiClient.delete<RoleDeletionApiResponse>(ROLE_API_ROUTES.DELETE.replace(':id', roleId))
      return response.data
    } catch (error) {
      console.error('[roleManagementService] Failed to delete role:', error)
      throw error
    }
  },
}