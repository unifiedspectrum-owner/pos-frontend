/* User management API service methods */

/* User module imports */
import { UserBasicDetailsApiResponse, UserCreationApiRequest, UserCreationApiResponse, UserDeletionApiResponse, UserDetailsApiResponse, UserListApiResponse, UserUpdationApiResponse, UserUpdationApiRequest } from "@user-management/types"
import { userApiClient } from "@user-management/api/client"
import { USER_API_ROUTES } from "@user-management/constants"

/* User management service with CRUD operations */
export const userManagementService = {

  /* Fetch paginated user list with optional filtering */
  async listAllUsers(page: number = 1, limit: number = 10): Promise<UserListApiResponse> {
    try {
      const response = await userApiClient.get<UserListApiResponse>(USER_API_ROUTES.LIST, {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.error('[UserManagementService] Failed to list users:', error)
      throw error
    }
  },

  /* Create new user account with provided data */
  async createUser(data: UserCreationApiRequest): Promise<UserCreationApiResponse> {
    try {
      const response = await userApiClient.post<UserCreationApiResponse>(USER_API_ROUTES.CREATE, data)
      return response.data
    } catch (error) {
      console.error('[UserManagementService] Failed to create user:', error)
      throw error
    }
  },

  /*
   * Get user details by ID
   * Default: Returns basic user info only
   * Query param ?full=true: Returns full details including statistics and permissions
   */
  async getUserDetails(userId: string): Promise<UserDetailsApiResponse> {
    try {
      const response = await userApiClient.get<UserDetailsApiResponse>(USER_API_ROUTES.DETAILS.replace(':id', userId), {
        params: { full: true }
      })
      return response.data
    } catch (error) {
      console.error('[UserManagementService] Failed to get user details:', error)
      throw error
    }
  },

  async getUserBasicDetails(userId: string): Promise<UserBasicDetailsApiResponse> {
    try {
      const response = await userApiClient.get<UserBasicDetailsApiResponse>(USER_API_ROUTES.DETAILS.replace(':id', userId))
      return response.data
    } catch (error) {
      console.error('[UserManagementService] Failed to get user basic details:', error)
      throw error
    }
  },

  /* Update user account by ID with provided data */
  async updateUser(userId: string, data: UserUpdationApiRequest): Promise<UserUpdationApiResponse> {
    try {
      const response = await userApiClient.put<UserUpdationApiResponse>(USER_API_ROUTES.UPDATE.replace(':id', userId), data)
      return response.data
    } catch (error) {
      console.error('[UserManagementService] Failed to update user details:', error)
      throw error
    }
  },

  /* Remove user account permanently by ID */
  async deleteUser(userId: string): Promise<UserDeletionApiResponse> {
    try {
      const response = await userApiClient.delete<UserDeletionApiResponse>(USER_API_ROUTES.DELETE.replace(':id', userId))
      return response.data
    } catch (error) {
      console.error('[UserManagementService] Failed to delete user:', error)
      throw error
    }
  },
}