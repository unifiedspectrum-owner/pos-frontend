/* Authentication API service methods */

/* Auth management module imports */
import { LoginApiRequest, LoginApiResponse, LogoutApiResponse, RefreshTokenApiRequest, RefreshTokenApiResponse, ForgotPasswordApiRequest, ForgotPasswordApiResponse, ResetPasswordApiRequest, ResetPasswordApiResponse, ValidateResetTokenApiResponse, Verify2FAApiRequest } from "@auth-management/types"
import { authApiClient } from "@auth-management/api"
import { AUTH_API_ROUTES } from "@auth-management/constants"

/* Service object containing authentication operations API methods */
export const authManagementService = {

  /* User login authentication */
  async loginUser(credentials: LoginApiRequest): Promise<LoginApiResponse> {
    try {
      const response = await authApiClient.post<LoginApiResponse>(AUTH_API_ROUTES.LOGIN, credentials)
      return response.data
    } catch (error) {
      console.error('[AuthManagementService] Failed to login user:', error)
      throw error
    }
  },

  async verify2fa(credentials: Verify2FAApiRequest): Promise<LoginApiResponse> {
    try {
      const response = await authApiClient.post<LoginApiResponse>(AUTH_API_ROUTES.VERIFY_2FA, credentials)
      return response.data
    } catch (error) {
      console.error('[AuthManagementService] Failed to login user:', error)
      throw error
    }
  },


  /* Refresh authentication token */
  async refreshToken(data: RefreshTokenApiRequest): Promise<RefreshTokenApiResponse> {
    try {
      const response = await authApiClient.post<RefreshTokenApiResponse>(AUTH_API_ROUTES.REFRESH, data)
      return response.data
    } catch (error) {
      console.error('[AuthManagementService] Failed to refresh token:', error)
      throw error
    }
  },

  /* User logout */
  async logoutUser(): Promise<LogoutApiResponse> {
    try {
      const response = await authApiClient.post<LogoutApiResponse>(AUTH_API_ROUTES.LOGOUT)
      return response.data
    } catch (error) {
      console.error('[AuthManagementService] Failed to logout user:', error)
      throw error
    }
  },

  /* Request password reset */
  async forgotPassword(data: ForgotPasswordApiRequest): Promise<ForgotPasswordApiResponse> {
    try {
      const response = await authApiClient.post<ForgotPasswordApiResponse>(AUTH_API_ROUTES.FORGOT_PASSWORD, data)
      return response.data
    } catch (error) {
      console.error('[AuthManagementService] Failed to request password reset:', error)
      throw error
    }
  },

  /* Reset password with token */
  async resetPassword(data: ResetPasswordApiRequest): Promise<ResetPasswordApiResponse> {
    try {
      const response = await authApiClient.post<ResetPasswordApiResponse>(AUTH_API_ROUTES.RESET_PASSWORD, data)
      return response.data
    } catch (error) {
      console.error('[AuthManagementService] Failed to reset password:', error)
      throw error
    }
  },

  /* Validate reset token */
  async validateResetToken(token: string): Promise<ValidateResetTokenApiResponse> {
    try {
      const response = await authApiClient.get<ValidateResetTokenApiResponse>(`${AUTH_API_ROUTES.VALIDATE_TOKEN}?token=${token}`)
      return response.data
    } catch (error) {
      console.error('[AuthManagementService] Failed to validate reset token:', error)
      throw error
    }
  },
}