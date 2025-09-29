/* Libraries imports */
import { AxiosResponse } from "axios";

/* Plan management module imports */
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
import { PLAN_API_ROUTES } from "@plan-management/constants/routes";
import { planApiClient } from "@plan-management/api";

/* Service object containing all plan-related API methods */
export const planService = {

  /* Retrieve all subscription plans from the API */
  async getAllSubscriptionPlans(): Promise<AxiosResponse<PlansListAPIResponse>> {
    try {
      const response = await planApiClient.get(PLAN_API_ROUTES.LIST); /* GET /subscription-plans */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch subscription plans:', error);
      throw error; /* Re-throw for caller handling */
    }
  },
  /* Create a new subscription plan with provided data */
  async createSubscriptionPlan(planData: CreateSubscriptionPlanAPIPayloadRequest): Promise<AxiosResponse<CreatePlanAPIResponse>> {
    try {
      const response = await planApiClient.post(PLAN_API_ROUTES.CREATE, planData); /* POST /subscription-plans */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to create subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Get detailed information for a specific subscription plan */
  async getSubscriptionPlanDetails(planId: number): Promise<AxiosResponse<GetPlanDetailsAPIResponse>> {
    try {
      const response = await planApiClient.get(PLAN_API_ROUTES.DETAILS.replace(':id', planId.toString())); /* GET /subscription-plans/:id */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch subscription plan details:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Update an existing subscription plan with new data */
  async updateSubscriptionPlan(planId: number, planData: CreateSubscriptionPlanAPIPayloadRequest): Promise<AxiosResponse<CreatePlanAPIResponse>> {
    try {
      const response = await planApiClient.put(PLAN_API_ROUTES.UPDATE.replace(':id', planId.toString()), planData); /* PUT /subscription-plans/:id */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to update subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Remove a subscription plan permanently */
  async deleteSubscriptionPlan(planId: number): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    try {
      const response = await planApiClient.delete(PLAN_API_ROUTES.DELETE.replace(':id', planId.toString())); /* DELETE /subscription-plans/:id */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to delete subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Retrieve all available plan features */
  async getAllFeatures(): Promise<AxiosResponse<FeaturesListAPIResponse>> {
    try {
      const response = await planApiClient.get(PLAN_API_ROUTES.FEATURES); /* GET /subscription-plans/features */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch features:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Retrieve all available plan add-ons */
  async getAllAddOns(): Promise<AxiosResponse<AddOnsListAPIResponse>> {
    try {
      const response = await planApiClient.get(PLAN_API_ROUTES.ADD_ONS); /* GET /subscription-plans/add-ons */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch add-ons:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Retrieve all available service level agreements */
  async getAllSLAs(): Promise<AxiosResponse<SlaListAPIResponse>> {
    try {
      const response = await planApiClient.get(PLAN_API_ROUTES.SLA); /* GET /subscription-plans/sla */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to fetch SLAs:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new plan feature with provided data */
  async createFeature(featureData: CreatePlanFeaturePayloadRequest): Promise<AxiosResponse<CreateFeatureAPIResponse>> {
    try {
      const response = await planApiClient.post(PLAN_API_ROUTES.FEATURES, featureData); /* POST /subscription-plans/features */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to create feature:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new plan add-on with provided data */
  async createAddOn(addOnData: CreatePlanAddOnPayloadRequest): Promise<AxiosResponse<CreateAddonAPIResponse>> {
    try {
      const response = await planApiClient.post(PLAN_API_ROUTES.ADD_ONS, addOnData); /* POST /subscription-plans/add-ons */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to create add-on:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new service level agreement with provided data */
  async createSLA(slaData: CreatePlanSLAPayloadRequest): Promise<AxiosResponse<CreateSlaAPIResponse>> {
    try {
      const response = await planApiClient.post(PLAN_API_ROUTES.SLA, slaData); /* POST /subscription-plans/sla */
      return response;
    } catch (error) {
      console.error('[PlanService] Failed to create SLA:', error);
      throw error; /* Re-throw for caller handling */
    }
  },
}