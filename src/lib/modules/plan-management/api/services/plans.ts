/* Plan management module imports */
import { CreatePlanApiResponse, CreatePlanApiRequest, GetPlanDetailsApiResponse, PlansListApiResponse } from "@plan-management/types";
import { PLAN_API_ROUTES } from "@plan-management/constants/routes";
import { planApiClient } from "@plan-management/api";

/* Service object containing subscription plan CRUD operations */
export const planService = {

  /* Retrieve all subscription plans from the API */
  async getAllSubscriptionPlans(): Promise<PlansListApiResponse> {
    try {
      const response = await planApiClient.get<PlansListApiResponse>(PLAN_API_ROUTES.PLAN.LIST); /* GET /subscription-plans */
      return response.data;
    } catch (error) {
      console.error('[PlanService] Failed to fetch subscription plans:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new subscription plan with provided data */
  async createSubscriptionPlan(planData: CreatePlanApiRequest): Promise<CreatePlanApiResponse> {
    try {
      const response = await planApiClient.post<CreatePlanApiResponse>(PLAN_API_ROUTES.PLAN.CREATE, planData); /* POST /subscription-plans */
      return response.data;
    } catch (error) {
      console.error('[PlanService] Failed to create subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Get detailed information for a specific subscription plan */
  async getSubscriptionPlanDetails(planId: number): Promise<GetPlanDetailsApiResponse> {
    try {
      const response = await planApiClient.get<GetPlanDetailsApiResponse>(PLAN_API_ROUTES.PLAN.DETAILS.replace(':id', planId.toString())); /* GET /subscription-plans/:id */
      return response.data;
    } catch (error) {
      console.error('[PlanService] Failed to fetch subscription plan details:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Update an existing subscription plan with new data */
  async updateSubscriptionPlan(planId: number, planData: CreatePlanApiRequest): Promise<CreatePlanApiResponse> {
    try {
      const response = await planApiClient.put<CreatePlanApiResponse>(PLAN_API_ROUTES.PLAN.UPDATE.replace(':id', planId.toString()), planData); /* PUT /subscription-plans/:id */
      return response.data;
    } catch (error) {
      console.error('[PlanService] Failed to update subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Remove a subscription plan permanently */
  async deleteSubscriptionPlan(planId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await planApiClient.delete<{ success: boolean; message: string }>(PLAN_API_ROUTES.PLAN.DELETE.replace(':id', planId.toString())); /* DELETE /subscription-plans/:id */
      return response.data;
    } catch (error) {
      console.error('[PlanService] Failed to delete subscription plan:', error);
      throw error; /* Re-throw for caller handling */
    }
  },
}
