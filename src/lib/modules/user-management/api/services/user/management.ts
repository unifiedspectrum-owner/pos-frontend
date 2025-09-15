/* User module imports */
import { UserListApiResponse } from "@/lib/modules/user-management/types/users/management"
import { userApiClient } from "@user-management/api/clients"
import { USER_API_ROUTES } from "@user-management/constants"

/* Service object containing user CRUD operations API methods */
export const userManagementService = {

  /* Get all users with pagination and filtering */
  async listAllUsers(page: number = 1, limit: number = 10): Promise<UserListApiResponse> {
    try {
      const response = await userApiClient.get<UserListApiResponse>(USER_API_ROUTES.LIST, {
        params: {
          page,
          limit
        }
      })
      return response.data
    } catch (error) {
      console.error('[UserManagementService] Failed to list users:', error)
      throw error
    }
  },

  /* Delete user by ID */
  async deleteUser(userId: string): Promise<void> {
    try {
      await userApiClient.delete(USER_API_ROUTES.DELETE.replace(':id', userId))
      console.log('[UserManagementService] Successfully deleted user:', userId)
    } catch (error) {
      console.error('[UserManagementService] Failed to delete user:', error)
      throw error
    }
  },
}