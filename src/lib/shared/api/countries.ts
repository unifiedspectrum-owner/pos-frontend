/* External library imports */
import axios from "axios"

/* Shared module imports */
import { BACKEND_BASE_URL } from "@shared/config"
import { CountriesListAPIResponse } from "@shared/types"

/* HTTP client configured for countries API endpoints */
const countriesApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/countries`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* Service object containing all country-related API methods */
export const countryApiService = {
  
  /* Retrieve all countries from the API */
  async getAllCountries(): Promise<CountriesListAPIResponse> {
    try {
      const response = await countriesApiClient.get<CountriesListAPIResponse>('')
      return response.data
    } catch (error) {
      throw error
    }
  },
}