/* API client dependencies and type imports */
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
} from "@tenant-management/types";

/* HTTP client for tenants API endpoints */
const apiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/tenants`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* Request interceptor for automatic token attachment */
apiClient.interceptors.request.use(
  (config) => {
    /* Get auth token from storage */
    const token = localStorage.getItem('accessToken'); 
    if (token) {
      /* Attach token to request headers */
      config.headers.Authorization = `Bearer ${token}`;
    }
    /* Return modified config */
    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* Response interceptor for authentication error handling */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      /* Clear auth data and trigger logout on 401 */
      localStorage.removeItem('accessToken');
      localStorage.removeItem('loggedIn');
      window.dispatchEvent(new Event('authStateChanged'));
    }
    return Promise.reject(error);
  }
);

/* Service object containing all tenant-related API methods */
export const tenantApiService = {
  
  /* Create new tenant account via API */
  async createTenantAccount(data: TenantAccountCreationAPIRequest): Promise<AxiosResponse<TenantAccountCreationAPIResponse>> {
    try {
      const response = await apiClient.post<TenantAccountCreationAPIResponse>('/account/create', data);
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to create tenant account:', error);
      throw error;
    }
  },

  /* Request OTP for tenant account verification */
  async requestTenantAccountVerificationOTP(data: RequestTenantAccountVerificationOTPAPIRequest): Promise<AxiosResponse<RequestTenantAccountVerificationOTPAPIResponse>> {
    try {
      const response = await apiClient.post<RequestTenantAccountVerificationOTPAPIResponse>('/account/request-otp', data); /* POST /tenants/account/request-otp */
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to request OTP:', error);
      throw error;
    }
  },

  /* Verify OTP for tenant account confirmation */
  async verifyTenantAccountVerificationOTP(data: VerifyTenantAccountVerificationOTPAPIRequest): Promise<AxiosResponse<VerifyTenantAccountVerificationOTPAPIResponse>> {
    try {
      const response = await apiClient.post<VerifyTenantAccountVerificationOTPAPIResponse>('/account/verify-otp', data); /* POST /tenants/account/verify-otp */
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to verify OTP:', error);
      throw error;
    }
  },

  /* Check status of tenant account */
  async checkTenantAccountStatus(data: TenantStatusApiRquest): Promise<AxiosResponse<TenantStatusApiResponse>> {
    try {
      const response = await apiClient.post<TenantStatusApiResponse>('/account/status', data); /* POST /tenants/account/verify-otp */
      return response;
    } catch (error) {
      console.error('[TenantService] Failed to verify OTP:', error);
      throw error;
    }
  },
}