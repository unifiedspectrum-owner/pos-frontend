/* Role module imports */
import { RoleCreationApiRequest, RoleCreationApiResponse, RoleDeletionApiResponse, RoleListApiResponse, RoleUpdationApiRequest, RoleUpdationApiResponse, RoleDetailsApiResponse, ModulesListApiResponse } from "@role-management/types"
import { roleApiClient } from "@role-management/api/clients"
import { MODULE_API_ROUTES, ROLE_API_ROUTES } from "@role-management/constants"

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

   /* Get all roles with pagination and filtering */
  async listAllModules(page?: number, limit?: number): Promise<ModulesListApiResponse> {
    try {
      const response = await roleApiClient.get<ModulesListApiResponse>(MODULE_API_ROUTES.LIST, {
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

  /* Get role details by ID */
  async getRoleDetails(roleId: string): Promise<RoleDetailsApiResponse> {
    try {
      const response = await roleApiClient.get<RoleDetailsApiResponse>(ROLE_API_ROUTES.DETAILS.replace(':id', roleId))
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to get role details:', error)
      throw error
    }
  },

  /* Update existing role with provided data */
  async updateRole(roleId: string, data: RoleUpdationApiRequest): Promise<RoleUpdationApiResponse> {
    try {
      const response = await roleApiClient.put<RoleUpdationApiResponse>(ROLE_API_ROUTES.UPDATE.replace(':id', roleId), data)
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to update role:', error)
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