/* Tenant module imports */
import { 
  CreateAccountApiRequest,
  CreateAccountApiResponse,
  VerificationOTPApiRequest, 
  VerificationOTPApiResponse,
  RequestOTPApiRequest, 
  RequestOTPApiResponse,
  AccountStatusApiResponse,
  AccountStatusApiRequest,
} from "@tenant-management/types/account"
import { tenantApiClient } from "@tenant-management/api/clients"

/* Service object containing account management API methods */
export const accountService = {

  /* Create new tenant account */
  async createTenantAccount(data: CreateAccountApiRequest): Promise<CreateAccountApiResponse> {
    try {
      const response = await tenantApiClient.post<CreateAccountApiResponse>('/account/create', data)
      return response.data
    } catch (error) {
      console.error('[AccountService] Failed to create tenant account:', error)
      throw error
    }
  },

  /* Request OTP for account verification */
  async requestOTP(data: RequestOTPApiRequest): Promise<RequestOTPApiResponse> {
    try {
      const response = await tenantApiClient.post<RequestOTPApiResponse>('/account/request-otp', data)
      return response.data
    } catch (error) {
      console.error('[AccountService] Failed to request OTP:', error)
      throw error
    }
  },

  /* Verify OTP for account confirmation */
  async verifyOTP(data: VerificationOTPApiRequest): Promise<VerificationOTPApiResponse> {
    try {
      const response = await tenantApiClient.post<VerificationOTPApiResponse>('/account/verify-otp', data)
      return response.data
    } catch (error) {
      console.error('[AccountService] Failed to verify OTP:', error)
      throw error
    }
  },

  /* Get tenant account status */
  async checkTenantAccountStatus(data: AccountStatusApiRequest): Promise<AccountStatusApiResponse> {
    try {
      const response = await tenantApiClient.post<AccountStatusApiResponse>('/account/status', data)
      return response.data
    } catch (error) {
      console.error('[AccountService] Failed to check account status:', error)
      throw error
    }
  },
}