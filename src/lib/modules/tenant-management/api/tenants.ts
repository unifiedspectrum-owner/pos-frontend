import axios, { AxiosResponse } from "axios";
import { BACKEND_BASE_URL } from "@shared/config";
import { 
  VerifyTenantAccountVerificationOTPAPIRequest, 
  VerifyTenantAccountVerificationOTPAPIResponse,
  TenantAccountCreationAPIResponse, 
  RequestTenantAccountVerificationOTPAPIRequest, 
  RequestTenantAccountVerificationOTPAPIResponse, 
  TenantAccountCreationAPIRequest,
  TenantStatusApiResponse,
  TenantStatusApiRquest,
  AssignPlanToTenantApiRequest,
  AssignPlanToTenantApiResponse,
  AssignedPlanApiResponse, 
} from "@tenant-management/types";

// =============================================================================
// API CLIENT CONFIGURATION
// =============================================================================

/* HTTP client configured for tenant management endpoints */
const apiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/tenants`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* Request interceptor to attach authentication token */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* Response interceptor to handle authentication errors */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('loggedIn');
      window.dispatchEvent(new Event('authStateChanged'));
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// TENANT API SERVICE
// =============================================================================

/* Service containing all tenant management API operations */
export const tenantApiService = {

  /* Creates new tenant account */
  async createTenantAccount(data: TenantAccountCreationAPIRequest): Promise<AxiosResponse<TenantAccountCreationAPIResponse>> {
    try {
      const response = await apiClient.post<TenantAccountCreationAPIResponse>('/account/create', data);
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to create tenant account:', error);
      throw error;
    }
  },

  /* Requests OTP for tenant account verification */
  async requestTenantAccountVerificationOTP(data: RequestTenantAccountVerificationOTPAPIRequest): Promise<AxiosResponse<RequestTenantAccountVerificationOTPAPIResponse>> {
    try {
      const response = await apiClient.post<RequestTenantAccountVerificationOTPAPIResponse>('/account/request-otp', data);
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to request OTP:', error);
      throw error;
    }
  },

  /* Verifies OTP for tenant account confirmation */
  async verifyTenantAccountVerificationOTP(data: VerifyTenantAccountVerificationOTPAPIRequest): Promise<AxiosResponse<VerifyTenantAccountVerificationOTPAPIResponse>> {
    try {
      const response = await apiClient.post<VerifyTenantAccountVerificationOTPAPIResponse>('/account/verify-otp', data);
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to verify OTP:', error);
      throw error;
    }
  },

  /* Retrieves current status of tenant account */
  async checkTenantAccountStatus(data: TenantStatusApiRquest): Promise<AxiosResponse<TenantStatusApiResponse>> {
    try {
      const response = await apiClient.post<TenantStatusApiResponse>('/account/status', data);
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to check account status:', error);
      throw error;
    }
  },

  /* Assigns subscription plan to tenant */
  async assignPlanToTenant(data: AssignPlanToTenantApiRequest): Promise<AxiosResponse<AssignPlanToTenantApiResponse>> {
    try {
      const response = await apiClient.post<AssignPlanToTenantApiResponse>('/account/assign-plan', data);
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to assign plan:', error);
      throw error;
    }
  },

  /* Retrieves assigned plan details for tenant */
  async getAssignedPlanForTenant(data: TenantStatusApiRquest): Promise<AxiosResponse<AssignedPlanApiResponse>> {
    try {
      const response = await apiClient.post<AssignedPlanApiResponse>('/account/get-assigned-plan', data);
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to get assigned plan:', error);
      throw error;
    }
  },
}