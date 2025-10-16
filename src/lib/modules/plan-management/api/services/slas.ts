/* Plan management module imports */
import { CreateSlaApiRequest, CreateSlaApiResponse, SlaListApiResponse } from "@plan-management/types";
import { PLAN_API_ROUTES } from "@plan-management/constants/routes";
import { planApiClient } from "@plan-management/api";

/* Service object containing service level agreement operations */
export const slaService = {

  /* Retrieve all available service level agreements */
  async getAllSLAs(): Promise<SlaListApiResponse> {
    try {
      const response = await planApiClient.get<SlaListApiResponse>(PLAN_API_ROUTES.SLA.LIST); /* GET /subscription-plans/sla */
      return response.data;
    } catch (error) {
      console.error('[SLAService] Failed to fetch SLAs:', error);
      throw error; /* Re-throw for caller handling */
    }
  },

  /* Create a new service level agreement with provided data */
  async createSLA(slaData: CreateSlaApiRequest): Promise<CreateSlaApiResponse> {
    try {
      const response = await planApiClient.post<CreateSlaApiResponse>(PLAN_API_ROUTES.SLA.CREATE, slaData); /* POST /subscription-plans/sla */
      return response.data;
    } catch (error) {
      console.error('[SLAService] Failed to create SLA:', error);
      throw error; /* Re-throw for caller handling */
    }
  },
}
