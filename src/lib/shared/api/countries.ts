/* Shared module imports */
import { createApiClient } from '@shared/api/base-client'
import { COUNTRIES_API_ROUTES } from '@shared/constants'
import { CountriesListAPIResponse } from '@shared/types'

/* HTTP client configured for countries API endpoints */
const countriesApiClient = createApiClient({
  basePath: COUNTRIES_API_ROUTES.BASE_PATH,
  requiresAuth: false,
  isPublic: true
})

/* Service object containing all country-related API methods */
export const countryApiService = {

  /* Retrieve all countries from the API */
  async getAllCountries(): Promise<CountriesListAPIResponse> {
    try {
      const response = await countriesApiClient.get<CountriesListAPIResponse>(COUNTRIES_API_ROUTES.GET_ALL)
      return response.data
    } catch (error) {
      throw error
    }
  },
}