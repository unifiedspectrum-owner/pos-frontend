/* Tenant onboarding API service methods for account creation and verification workflow */

/* Tenant module imports */
import { CreateAccountApiRequest, CreateAccountApiResponse, VerificationOTPApiRequest, VerificationOTPApiResponse, RequestOTPApiRequest, RequestOTPApiResponse, AccountStatusApiResponse } from "@tenant-management/types"
import { tenantApiClient } from "@tenant-management/api/client"
import { TENANT_API_ROUTES } from "@tenant-management/constants"

/* Service object containing tenant onboarding and verification operations */
export const onboardingService = {

  /* Create new tenant account */
  async createTenantAccount(data: CreateAccountApiRequest): Promise<CreateAccountApiResponse> {
    try {
      const response = await tenantApiClient.post<CreateAccountApiResponse>(TENANT_API_ROUTES.ACCOUNT.CREATE, data)
      return response.data
    } catch (error) {
      console.error('[OnboardingService] Failed to create tenant account:', error)
      throw error
    }
  },

  /* Request OTP for account verification */
  async requestOTP(data: RequestOTPApiRequest): Promise<RequestOTPApiResponse> {
    try {
      const response = await tenantApiClient.post<RequestOTPApiResponse>(TENANT_API_ROUTES.ACCOUNT.REQUEST_OTP, data)
      return response.data
    } catch (error) {
      console.error('[OnboardingService] Failed to request OTP:', error)
      throw error
    }
  },

  /* Verify OTP for account confirmation */
  async verifyOTP(data: VerificationOTPApiRequest): Promise<VerificationOTPApiResponse> {
    try {
      const response = await tenantApiClient.post<VerificationOTPApiResponse>(TENANT_API_ROUTES.ACCOUNT.VERIFY_OTP, data)
      return response.data
    } catch (error) {
      console.error('[OnboardingService] Failed to verify OTP:', error)
      throw error
    }
  },

  /* Get tenant account status */
  async checkTenantAccountStatus(tenantId: string): Promise<AccountStatusApiResponse> {
    try {
      const response = await tenantApiClient.get<AccountStatusApiResponse>(TENANT_API_ROUTES.ACCOUNT.STATUS.replace(':id', tenantId))
      return response.data
    } catch (error) {
      console.error('[OnboardingService] Failed to check account status:', error)
      throw error
    }
  },
}
