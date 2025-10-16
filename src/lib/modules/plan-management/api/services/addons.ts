/* Plan management module imports */
import { AddonsListApiResponse, CreateAddonApiResponse, CreateAddonApiRequest } from "@plan-management/types";
import { PLAN_API_ROUTES } from "@plan-management/constants/routes";
import { planApiClient } from "@plan-management/api";

/* Service object containing plan add-on operations */
export const addonService = {

  /* Retrieve all available plan add-ons */
  async getAllAddOns(): Promise<AddonsListApiResponse> {
    try {
      const response = await planApiClient.get<AddonsListApiResponse>(PLAN_API_ROUTES.ADD_ON.LIST); /* GET /subscription-plans/add-ons */
      return response.data;
    } catch (error) {
      console.error('[AddonService] Failed to fetch add-ons:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new plan add-on with provided data */
  async createAddOn(addOnData: CreateAddonApiRequest): Promise<CreateAddonApiResponse> {
    try {
      const response = await planApiClient.post<CreateAddonApiResponse>(PLAN_API_ROUTES.ADD_ON.CREATE, addOnData); /* POST /subscription-plans/add-ons */
      return response.data;
    } catch (error) {
      console.error('[AddonService] Failed to create add-on:', error);
      throw error; /* Re-throw for caller handling */
    }
  },
}
