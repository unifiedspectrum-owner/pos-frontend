/* TypeScript interfaces for geographic data structures */

/* Geographic state/province information */
export interface State {
  id: number;
  name: string;
}

/* Complete country data with geographic and currency information */
export interface CountryData {
  id: number;
  name: string;
  code: string;
  phone_code: string;
  currency: string;
  currency_symbol: string;
  states: State[];
}

/* API response for countries list endpoint */
export interface CountriesListAPIResponse {
  success: boolean
  message: string
  data: CountryData[]
  total: number
}