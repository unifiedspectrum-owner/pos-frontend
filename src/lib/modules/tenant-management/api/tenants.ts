/* External library imports */
import axios from "axios"

/* Shared module imports */
import { BACKEND_BASE_URL } from "@shared/config"

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
import {
  AssignPlanToTenantApiRequest,
  AssignPlanToTenantApiResponse,
  AssignedPlanApiResponse,
} from "@tenant-management/types/subscription"
import {
  InitiateSubscriptionPaymentApiRequest,
  InitiateSubscriptionPaymentApiResponse,
  PaymentStatusApiRequest,
  PaymentStatusApiResponse,
} from "@tenant-management/types/payment"
import { TenantListApiResponse } from "../types/account/list"

/* HTTP client configured for tenant management API endpoints */
const tenantApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/tenants`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* Attach auth token to requests */
tenantApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/* Handle auth errors and token cleanup */
tenantApiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('loggedIn')
      window.dispatchEvent(new Event('authStateChanged'))
    }
    return Promise.reject(error)
  }
)

/* Service object containing all tenant management API methods */
export const tenantApiService = {

  /* Create new tenant account */
  async createTenantAccount(data: CreateAccountApiRequest): Promise<CreateAccountApiResponse> {
    try {
      const response = await tenantApiClient.post<CreateAccountApiResponse>('/account/create', data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to create tenant account:', error)
      throw error
    }
  },

  /* Request OTP for account verification */
  async requestOTP(data: RequestOTPApiRequest): Promise<RequestOTPApiResponse> {
    try {
      const response = await tenantApiClient.post<RequestOTPApiResponse>('/account/request-otp', data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to request OTP:', error)
      throw error
    }
  },

  /* Verify OTP for account confirmation */
  async verifyOTP(data: VerificationOTPApiRequest): Promise<VerificationOTPApiResponse> {
    try {
      const response = await tenantApiClient.post<VerificationOTPApiResponse>('/account/verify-otp', data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to verify OTP:', error)
      throw error
    }
  },

  /* Get tenant account status */
  async checkTenantAccountStatus(data: AccountStatusApiRequest): Promise<AccountStatusApiResponse> {
    try {
      const response = await tenantApiClient.post<AccountStatusApiResponse>('/account/status', data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to check account status:', error)
      throw error
    }
  },

  /* Assign subscription plan to tenant */
  async assignPlanToTenant(data: AssignPlanToTenantApiRequest): Promise<AssignPlanToTenantApiResponse> {
    try {
      const response = await tenantApiClient.post<AssignPlanToTenantApiResponse>('/account/assign-plan', data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to assign plan:', error)
      throw error
    }
  },

  /* Get assigned plan details for tenant */
  async getAssignedPlanForTenant(data: AccountStatusApiRequest): Promise<AssignedPlanApiResponse> {
    try {
      const response = await tenantApiClient.post<AssignedPlanApiResponse>('/account/get-assigned-plan', data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to get assigned plan:', error)
      throw error
    }
  },

  /* Initiate subscription payment process */
  async initiateTenantSubscriptionPayment(data: InitiateSubscriptionPaymentApiRequest): Promise<InitiateSubscriptionPaymentApiResponse> {
    try {
      const response = await tenantApiClient.post<InitiateSubscriptionPaymentApiResponse>('/account/payment/initiate', data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to initiate payment:', error)
      throw error
    }
  },

  /* Get payment status for tenant subscription */
  async getPaymentStatusForTenant(data: PaymentStatusApiRequest): Promise<PaymentStatusApiResponse> {
    try {
      const response = await tenantApiClient.post<PaymentStatusApiResponse>('/account/payment/status', data)
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to get payment status:', error)
      throw error
    }
  },

  /* Get payment status for tenant subscription */
  async listAllTenants(): Promise<TenantListApiResponse> {
    try {
      const response = await tenantApiClient.get<TenantListApiResponse>('/list')
      return response.data
    } catch (error) {
      console.error('[TenantService] Failed to get payment status:', error)
      throw error
    }
  },
}