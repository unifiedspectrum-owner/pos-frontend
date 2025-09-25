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
import { TENANT_API_ROUTES } from "@tenant-management/constants/routes"

/* Service object containing account management API methods */
export const accountService = {

  /* Create new tenant account */
  async createTenantAccount(data: CreateAccountApiRequest): Promise<CreateAccountApiResponse> {
    try {
      const response = await tenantApiClient.post<CreateAccountApiResponse>(TENANT_API_ROUTES.ACCOUNT.CREATE, data)
      return response.data
    } catch (error) {
      console.error('[AccountService] Failed to create tenant account:', error)
      throw error
    }
  },

  /* Request OTP for account verification */
  async requestOTP(data: RequestOTPApiRequest): Promise<RequestOTPApiResponse> {
    try {
      const response = await tenantApiClient.post<RequestOTPApiResponse>(TENANT_API_ROUTES.ACCOUNT.REQUEST_OTP, data)
      return response.data
    } catch (error) {
      console.error('[AccountService] Failed to request OTP:', error)
      throw error
    }
  },

  /* Verify OTP for account confirmation */
  async verifyOTP(data: VerificationOTPApiRequest): Promise<VerificationOTPApiResponse> {
    try {
      const response = await tenantApiClient.post<VerificationOTPApiResponse>(TENANT_API_ROUTES.ACCOUNT.VERIFY_OTP, data)
      return response.data
    } catch (error) {
      console.error('[AccountService] Failed to verify OTP:', error)
      throw error
    }
  },

  /* Get tenant account status */
  async checkTenantAccountStatus(data: AccountStatusApiRequest): Promise<AccountStatusApiResponse> {
    try {
      const response = await tenantApiClient.post<AccountStatusApiResponse>(TENANT_API_ROUTES.ACCOUNT.STATUS, data)
      return response.data
    } catch (error) {
      console.error('[AccountService] Failed to check account status:', error)
      throw error
    }
  },
}