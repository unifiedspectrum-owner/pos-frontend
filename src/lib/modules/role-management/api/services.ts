/* Role management API service methods */

/* Role management module imports */
import { RoleCreationRequest, RoleCreationResponse, RoleDeletionResponse, RoleListResponse, RoleUpdateRequest, RoleUpdateResponse, RoleDetailsResponse, ModulesListResponse, RolePermissionsListResponse } from "@role-management/types"
import { roleApiClient } from "@role-management/api"
import { MODULE_API_ROUTES, ROLE_API_ROUTES } from "@role-management/constants"

/* Service object containing role CRUD operations API methods */
export const roleManagementService = {

  /* Get all roles with pagination and filtering */
  async listAllRoles(page?: number, limit?: number): Promise<RoleListResponse> {
    try {
      const response = await roleApiClient.get<RoleListResponse>(ROLE_API_ROUTES.LIST, {
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

  /* Get all modules with pagination and filtering */
  async listAllModules(page?: number, limit?: number): Promise<ModulesListResponse> {
    try {
      const response = await roleApiClient.get<ModulesListResponse>(MODULE_API_ROUTES.LIST, {
        params: {
          page,
          limit
        }
      })
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to list modules:', error)
      throw error
    }
  },

  /* Get all role permissions without pagination */
  async listAllRolePermissions(): Promise<RolePermissionsListResponse> {
    try {
      const response = await roleApiClient.get<RolePermissionsListResponse>(ROLE_API_ROUTES.PERMISSIONS)
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to list role permissions:', error)
      throw error
    }
  },

  /* Create new role with provided data */
  async createRole(data: RoleCreationRequest): Promise<RoleCreationResponse> {
    try {
      const response = await roleApiClient.post<RoleCreationResponse>(ROLE_API_ROUTES.CREATE, data)
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to create role:', error)
      throw error
    }
  },

  /* Get role details by ID */
  async getRoleDetails(roleId: string): Promise<RoleDetailsResponse> {
    try {
      const response = await roleApiClient.get<RoleDetailsResponse>(ROLE_API_ROUTES.DETAILS.replace(':id', roleId))
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to get role details:', error)
      throw error
    }
  },

  /* Update existing role with provided data */
  async updateRole(roleId: string, data: RoleUpdateRequest): Promise<RoleUpdateResponse> {
    try {
      const response = await roleApiClient.put<RoleUpdateResponse>(ROLE_API_ROUTES.UPDATE.replace(':id', roleId), data)
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to update role:', error)
      throw error
    }
  },

  /* Remove role permanently by ID */
  async deleteRole(roleId: string): Promise<RoleDeletionResponse> {
    try {
      const response = await roleApiClient.delete<RoleDeletionResponse>(ROLE_API_ROUTES.DELETE.replace(':id', roleId))
      return response.data
    } catch (error) {
      console.error('[RoleManagementService] Failed to delete role:', error)
      throw error
    }
  },
}