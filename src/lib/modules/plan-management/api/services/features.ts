/* Plan management module imports */
import { CreateFeatureApiResponse, CreateFeatureApiRequest, FeaturesListApiResponse } from "@plan-management/types";
import { PLAN_API_ROUTES } from "@plan-management/constants/routes";
import { planApiClient } from "@plan-management/api";

/* Service object containing plan feature operations */
export const featureService = {

  /* Retrieve all available plan features */
  async getAllFeatures(): Promise<FeaturesListApiResponse> {
    try {
      const response = await planApiClient.get<FeaturesListApiResponse>(PLAN_API_ROUTES.FEATURE.LIST); /* GET /subscription-plans/features */
      return response.data;
    } catch (error) {
      console.error('[FeatureService] Failed to fetch features:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new plan feature with provided data */
  async createFeature(featureData: CreateFeatureApiRequest): Promise<CreateFeatureApiResponse> {
    try {
      const response = await planApiClient.post<CreateFeatureApiResponse>(PLAN_API_ROUTES.FEATURE.CREATE, featureData); /* POST /subscription-plans/features */
      return response.data;
    } catch (error) {
      console.error('[FeatureService] Failed to create feature:', error);
      throw error; /* Re-throw for caller handling */
    }
  },
}
