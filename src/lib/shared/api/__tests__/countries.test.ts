/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Shared module imports */
import { COUNTRIES_API_ROUTES } from '@shared/constants'
import type { CountriesListAPIResponse, CountryData } from '@shared/types'

/* Helper to create mock axios config */
const createMockAxiosConfig = (): InternalAxiosRequestConfig => ({
  headers: {} as AxiosRequestHeaders,
  url: '',
  method: 'get'
})

/* Mock axios instance */
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  }
}

/* Mock createApiClient to return our mock instance */
vi.mock('@shared/api/base-client', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance)
}))

describe('countryApiService', () => {
  let countryApiService: typeof import('@shared/api/countries').countryApiService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@shared/api/countries')
    countryApiService = module.countryApiService
  })

  beforeEach(() => {
    /* Clear HTTP method mocks */
    mockAxiosInstance.get.mockClear()
    mockAxiosInstance.post.mockClear()
    mockAxiosInstance.put.mockClear()
    mockAxiosInstance.delete.mockClear()

    /* Mock localStorage */
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    /* Mock window.dispatchEvent */
    window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('API Client Configuration', () => {
    it('should have countryApiService with getAllCountries method', () => {
      expect(countryApiService).toBeDefined()
      expect(countryApiService.getAllCountries).toBeTypeOf('function')
    })

    it('should export getAllCountries as an async function', () => {
      expect(countryApiService.getAllCountries).toBeInstanceOf(Function)
      expect(countryApiService.getAllCountries.constructor.name).toBe('AsyncFunction')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions', () => {
      expect(COUNTRIES_API_ROUTES).toHaveProperty('BASE_PATH')
      expect(COUNTRIES_API_ROUTES).toHaveProperty('GET_ALL')
    })

    it('should use correct API path structure', () => {
      expect(COUNTRIES_API_ROUTES.BASE_PATH).toBe('/countries')
      expect(COUNTRIES_API_ROUTES.GET_ALL).toBe('')
    })
  })

  describe('getAllCountries', () => {
    it('should fetch all countries successfully', async () => {
      const mockCountries: CountryData[] = [
        {
          id: 1,
          name: 'United States',
          code: 'US',
          phone_code: '+1',
          currency: 'USD',
          currency_symbol: '$',
          states: [
            { id: 1, name: 'California' },
            { id: 2, name: 'New York' }
          ]
        },
        {
          id: 2,
          name: 'Canada',
          code: 'CA',
          phone_code: '+1',
          currency: 'CAD',
          currency_symbol: '$',
          states: [
            { id: 3, name: 'Ontario' },
            { id: 4, name: 'Quebec' }
          ]
        }
      ]

      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved successfully',
          data: mockCountries,
          total: 2
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(COUNTRIES_API_ROUTES.GET_ALL)
      expect(result).toEqual(mockResponse.data)
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should fetch empty countries list successfully', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'No countries found',
          data: [],
          total: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should fetch large list of countries successfully', async () => {
      const mockCountries: CountryData[] = Array.from({ length: 195 }, (_, i) => ({
        id: i + 1,
        name: `Country ${i + 1}`,
        code: `C${i + 1}`,
        phone_code: `+${i + 1}`,
        currency: `CUR${i + 1}`,
        currency_symbol: `$${i + 1}`,
        states: []
      }))

      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved successfully',
          data: mockCountries,
          total: 195
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result.data).toHaveLength(195)
      expect(result.total).toBe(195)
    })

    it('should return proper response structure with all required fields', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [
            {
              id: 1,
              name: 'India',
              code: 'IN',
              phone_code: '+91',
              currency: 'INR',
              currency_symbol: '₹',
              states: [
                { id: 1, name: 'Tamil Nadu' },
                { id: 2, name: 'Karnataka' }
              ]
            }
          ],
          total: 1
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
    })

    it('should return countries with complete data structure', async () => {
      const mockCountry: CountryData = {
        id: 1,
        name: 'United Kingdom',
        code: 'GB',
        phone_code: '+44',
        currency: 'GBP',
        currency_symbol: '£',
        states: [
          { id: 1, name: 'England' },
          { id: 2, name: 'Scotland' },
          { id: 3, name: 'Wales' },
          { id: 4, name: 'Northern Ireland' }
        ]
      }

      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Country retrieved',
          data: [mockCountry],
          total: 1
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      const country = result.data[0]
      expect(country).toHaveProperty('id')
      expect(country).toHaveProperty('name')
      expect(country).toHaveProperty('code')
      expect(country).toHaveProperty('phone_code')
      expect(country).toHaveProperty('currency')
      expect(country).toHaveProperty('currency_symbol')
      expect(country).toHaveProperty('states')
      expect(Array.isArray(country.states)).toBe(true)
    })

    it('should handle countries with empty states array', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [
            {
              id: 1,
              name: 'Singapore',
              code: 'SG',
              phone_code: '+65',
              currency: 'SGD',
              currency_symbol: '$',
              states: []
            }
          ],
          total: 1
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result.data[0].states).toEqual([])
      expect(Array.isArray(result.data[0].states)).toBe(true)
    })

    it('should handle countries with multiple states', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [
            {
              id: 1,
              name: 'Australia',
              code: 'AU',
              phone_code: '+61',
              currency: 'AUD',
              currency_symbol: '$',
              states: [
                { id: 1, name: 'New South Wales' },
                { id: 2, name: 'Victoria' },
                { id: 3, name: 'Queensland' },
                { id: 4, name: 'Western Australia' },
                { id: 5, name: 'South Australia' },
                { id: 6, name: 'Tasmania' }
              ]
            }
          ],
          total: 1
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result.data[0].states).toHaveLength(6)
      expect(result.data[0].states[0]).toHaveProperty('id')
      expect(result.data[0].states[0]).toHaveProperty('name')
    })

    it('should handle different currency symbols correctly', async () => {
      const currencyTestCases = [
        { currency: 'USD', symbol: '$' },
        { currency: 'EUR', symbol: '€' },
        { currency: 'GBP', symbol: '£' },
        { currency: 'JPY', symbol: '¥' },
        { currency: 'INR', symbol: '₹' },
        { currency: 'CNY', symbol: '¥' }
      ]

      for (const testCase of currencyTestCases) {
        const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
          data: {
            success: true,
            message: 'Country retrieved',
            data: [
              {
                id: 1,
                name: 'Test Country',
                code: 'TC',
                phone_code: '+1',
                currency: testCase.currency,
                currency_symbol: testCase.symbol,
                states: []
              }
            ],
            total: 1
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: createMockAxiosConfig()
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await countryApiService.getAllCountries()

        expect(result.data[0].currency).toBe(testCase.currency)
        expect(result.data[0].currency_symbol).toBe(testCase.symbol)
        mockAxiosInstance.get.mockClear()
      }
    })

    it('should handle errors when fetching countries', async () => {
      const mockError = new Error('Failed to fetch countries')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(countryApiService.getAllCountries()).rejects.toThrow('Failed to fetch countries')
    })

    it('should handle network errors', async () => {
      const mockError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(countryApiService.getAllCountries()).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      const mockError = new Error('Request timeout')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(countryApiService.getAllCountries()).rejects.toThrow('Request timeout')
    })

    it('should handle server errors (5xx)', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Internal server error'
          }
        },
        message: 'Internal server error'
      }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(countryApiService.getAllCountries()).rejects.toMatchObject(mockError)
    })

    it('should handle client errors (4xx)', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            success: false,
            message: 'Countries not found'
          }
        },
        message: 'Countries not found'
      }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(countryApiService.getAllCountries()).rejects.toMatchObject(mockError)
    })
  })

  describe('Response Data Structure', () => {
    it('should return response with success flag', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [],
          total: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result.success).toBe(true)
      expect(typeof result.success).toBe('boolean')
    })

    it('should return response with message', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'All countries fetched successfully',
          data: [],
          total: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result.message).toBe('All countries fetched successfully')
      expect(typeof result.message).toBe('string')
    })

    it('should return response with data array', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [
            {
              id: 1,
              name: 'Germany',
              code: 'DE',
              phone_code: '+49',
              currency: 'EUR',
              currency_symbol: '€',
              states: []
            }
          ],
          total: 1
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    it('should return response with total count', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [],
          total: 195
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result.total).toBe(195)
      expect(typeof result.total).toBe('number')
    })

    it('should match total count with data array length', async () => {
      const mockCountries: CountryData[] = [
        {
          id: 1,
          name: 'France',
          code: 'FR',
          phone_code: '+33',
          currency: 'EUR',
          currency_symbol: '€',
          states: []
        },
        {
          id: 2,
          name: 'Spain',
          code: 'ES',
          phone_code: '+34',
          currency: 'EUR',
          currency_symbol: '€',
          states: []
        },
        {
          id: 3,
          name: 'Italy',
          code: 'IT',
          phone_code: '+39',
          currency: 'EUR',
          currency_symbol: '€',
          states: []
        }
      ]

      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: mockCountries,
          total: 3
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      expect(result.data).toHaveLength(result.total)
    })
  })

  describe('Type Safety and Parameter Validation', () => {
    it('should return properly typed response', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [
            {
              id: 1,
              name: 'Brazil',
              code: 'BR',
              phone_code: '+55',
              currency: 'BRL',
              currency_symbol: 'R$',
              states: [{ id: 1, name: 'São Paulo' }]
            }
          ],
          total: 1
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()

      /* Type assertions to verify TypeScript types */
      expect(typeof result.success).toBe('boolean')
      expect(typeof result.message).toBe('string')
      expect(Array.isArray(result.data)).toBe(true)
      expect(typeof result.total).toBe('number')

      if (result.data.length > 0) {
        const country = result.data[0]
        expect(typeof country.id).toBe('number')
        expect(typeof country.name).toBe('string')
        expect(typeof country.code).toBe('string')
        expect(typeof country.phone_code).toBe('string')
        expect(typeof country.currency).toBe('string')
        expect(typeof country.currency_symbol).toBe('string')
        expect(Array.isArray(country.states)).toBe(true)
      }
    })

    it('should not require any parameters', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [],
          total: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      /* Should work without any parameters */
      const result = await countryApiService.getAllCountries()

      expect(result).toBeDefined()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(COUNTRIES_API_ROUTES.GET_ALL)
    })

    it('should validate country data structure', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [
            {
              id: 1,
              name: 'Mexico',
              code: 'MX',
              phone_code: '+52',
              currency: 'MXN',
              currency_symbol: '$',
              states: [
                { id: 1, name: 'State 1' },
                { id: 2, name: 'State 2' }
              ]
            }
          ],
          total: 1
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await countryApiService.getAllCountries()
      const country = result.data[0]

      /* Validate all required fields exist */
      expect(country.id).toBeDefined()
      expect(country.name).toBeDefined()
      expect(country.code).toBeDefined()
      expect(country.phone_code).toBeDefined()
      expect(country.currency).toBeDefined()
      expect(country.currency_symbol).toBeDefined()
      expect(country.states).toBeDefined()

      /* Validate state structure */
      if (country.states.length > 0) {
        const state = country.states[0]
        expect(state.id).toBeDefined()
        expect(state.name).toBeDefined()
      }
    })
  })

  describe('Integration with Base Client', () => {
    it('should use GET method for fetching countries', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [],
          total: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await countryApiService.getAllCountries()

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(COUNTRIES_API_ROUTES.GET_ALL)
    })

    it('should not use POST, PUT, or DELETE methods', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [],
          total: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await countryApiService.getAllCountries()

      expect(mockAxiosInstance.post).not.toHaveBeenCalled()
      expect(mockAxiosInstance.put).not.toHaveBeenCalled()
      expect(mockAxiosInstance.delete).not.toHaveBeenCalled()
    })

    it('should call correct endpoint path', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [],
          total: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await countryApiService.getAllCountries()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('')
    })

    it('should handle multiple consecutive calls', async () => {
      const mockResponse: AxiosResponse<CountriesListAPIResponse> = {
        data: {
          success: true,
          message: 'Countries retrieved',
          data: [],
          total: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await countryApiService.getAllCountries()
      await countryApiService.getAllCountries()
      await countryApiService.getAllCountries()

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3)
    })
  })
})
