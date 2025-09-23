import axios, { AxiosResponse } from "axios";
import { BACKEND_BASE_URL } from "@shared/config";
import { 
  AddOnsListAPIResponse, 
  CreateAddonAPIResponse, 
  CreateFeatureAPIResponse, 
  CreatePlanAddOnPayloadRequest, 
  CreatePlanAPIResponse, 
  CreatePlanFeaturePayloadRequest, 
  CreatePlanSLAPayloadRequest, 
  CreateSlaAPIResponse, 
  CreateSubscriptionPlanAPIPayloadRequest, 
  FeaturesListAPIResponse, 
  GetPlanDetailsAPIResponse, 
  PlansListAPIResponse, 
  SlaListAPIResponse 
} from "@plan-management/types/plans";

/* HTTP client for subscription plan API endpoints */
const apiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/plans`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* Request interceptor for automatic token attachment */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); /* Get auth token from storage */
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; /* Attach token to request headers */
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); /* Forward request errors */
  }
);

/* Response interceptor for authentication error handling */
apiClient.interceptors.response.use(
  (response) => {
    return response; /* Pass through successful responses */
  },
  (error) => {
    if (error.response?.status === 401) {
      /* Clear auth data and trigger logout on 401 */
      localStorage.removeItem('accessToken');
      localStorage.removeItem('loggedIn');
      window.dispatchEvent(new Event('authStateChanged'));
    }
    return Promise.reject(error); /* Forward error to caller */
  }
);

/* Service object containing all plan-related API methods */
export const planService = {
  
  /* Retrieve all subscription plans from the API */
  async getAllSubscriptionPlans(): Promise<AxiosResponse<PlansListAPIResponse>> {
    try {
      const response = await apiClient.get(''); /* GET /subscription-plans */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch subscription plans:', error);
      throw error; /* Re-throw for caller handling */
    }
  },
  /* Create a new subscription plan with provided data */
  async createSubscriptionPlan(planData: CreateSubscriptionPlanAPIPayloadRequest): Promise<AxiosResponse<CreatePlanAPIResponse>> {
    try {
      const response = await apiClient.post('', planData); /* POST /subscription-plans */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to create subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Get detailed information for a specific subscription plan */
  async getSubscriptionPlanDetails(planId: number): Promise<AxiosResponse<GetPlanDetailsAPIResponse>> {
    try {
      const response = await apiClient.get(`/${planId}`); /* GET /subscription-plans/:id */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch subscription plan details:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Update an existing subscription plan with new data */
  async updateSubscriptionPlan(planId: number, planData: CreateSubscriptionPlanAPIPayloadRequest): Promise<AxiosResponse<CreatePlanAPIResponse>> {
    try {
      const response = await apiClient.put(`/${planId}`, planData); /* PUT /subscription-plans/:id */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to update subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Remove a subscription plan permanently */
  async deleteSubscriptionPlan(planId: number): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.delete(`/${planId}`); /* DELETE /subscription-plans/:id */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to delete subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Retrieve all available plan features */
  async getAllFeatures(): Promise<AxiosResponse<FeaturesListAPIResponse>> {
    try {
      const response = await apiClient.get('/features'); /* GET /subscription-plans/features */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch features:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Retrieve all available plan add-ons */
  async getAllAddOns(): Promise<AxiosResponse<AddOnsListAPIResponse>> {
    try {
      const response = await apiClient.get('/add-ons'); /* GET /subscription-plans/add-ons */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch add-ons:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Retrieve all available service level agreements */
  async getAllSLAs(): Promise<AxiosResponse<SlaListAPIResponse>> {
    try {
      const response = await apiClient.get('/sla'); /* GET /subscription-plans/sla */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch SLAs:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new plan feature with provided data */
  async createFeature(featureData: CreatePlanFeaturePayloadRequest): Promise<AxiosResponse<CreateFeatureAPIResponse>> {
    try {
      const response = await apiClient.post('/features', featureData); /* POST /subscription-plans/features */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to create feature:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new plan add-on with provided data */
  async createAddOn(addOnData: CreatePlanAddOnPayloadRequest): Promise<AxiosResponse<CreateAddonAPIResponse>> {
    try {
      const response = await apiClient.post('/add-ons', addOnData); /* POST /subscription-plans/add-ons */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to create add-on:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new service level agreement with provided data */
  async createSLA(slaData: CreatePlanSLAPayloadRequest): Promise<AxiosResponse<CreateSlaAPIResponse>> {
    try {
      const response = await apiClient.post('/sla', slaData); /* POST /subscription-plans/sla */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to create SLA:', error);
      throw error; /* Re-throw for caller handling */
    }
  },
}