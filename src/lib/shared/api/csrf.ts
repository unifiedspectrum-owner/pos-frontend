/* Shared module imports */
import { createApiClient } from './base-client'
import { CSRF_API_ROUTES } from '@shared/constants'

/* TypeScript interface for CSRF token API response */
interface CsrfTokenResponse {
  success: boolean;
  message: string;
  error?: string;
  data: {
    csrfToken: string
  };
  timestamp: string;
}

/* HTTP client configured for CSRF token API endpoint */
const csrfApiClient = createApiClient({
  basePath: CSRF_API_ROUTES.BASE_PATH,
  requiresAuth: false
})

/* Service object containing CSRF token API methods */
export const csrfApiService = {

  /* Retrieve CSRF token from the API */
  async getCsrfToken(): Promise<CsrfTokenResponse> {
    try {
      const response = await csrfApiClient.get<CsrfTokenResponse>(CSRF_API_ROUTES.GET_TOKEN)
      return response.data
    } catch (error) {
      throw error
    }
  },
}
