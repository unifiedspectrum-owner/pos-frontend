/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { Mock } from 'vitest'

/* Shared module imports */
import { useCountries, clearCountriesCache } from '@shared/hooks/use-countries'
import type { CountriesListAPIResponse, CountryData, State } from '@shared/types'
import { CACHE_STORAGE_KEYS } from '@shared/constants'

/* Mock data */
const mockStates: State[] = [
  { id: 1, name: 'California' },
  { id: 2, name: 'Texas' }
]

const mockCountries: CountryData[] = [
  {
    id: 1,
    name: 'United States',
    code: 'US',
    phone_code: '+1',
    currency: 'USD',
    currency_symbol: '$',
    states: mockStates
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
  },
  {
    id: 3,
    name: 'United Kingdom',
    code: 'GB',
    phone_code: '+44',
    currency: 'GBP',
    currency_symbol: '£',
    states: []
  }
]

/* Hoisted mock functions */
const { mockGetAllCountries, mockHandleApiError } = vi.hoisted(() => ({
  mockGetAllCountries: vi.fn(),
  mockHandleApiError: vi.fn()
}))

/* Mock country API service */
vi.mock('@shared/api', () => ({
  countryApiService: {
    getAllCountries: mockGetAllCountries
  }
}))

/* Mock API error handler */
vi.mock('@shared/utils', () => ({
  handleApiError: mockHandleApiError
}))

/* Mock cache config */
vi.mock('@shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/config')>()
  return {
    ...actual,
    COUNTRIES_CACHE_DURATION: 3600000
  }
})

describe('use-countries', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn> | undefined

  beforeEach(() => {
    mockGetAllCountries.mockReset()
    mockHandleApiError.mockReset()
    localStorage.clear()

    /* Suppress console logs */
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleSpy?.mockRestore()
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with empty countries', () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      expect(result.current.countries).toEqual([])
      expect(result.current.states).toEqual([])
      expect(result.current.selectedCountryName).toBe('')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should initialize with provided selectedCountryName', () => {
      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, selectedCountryName: 'United States' })
      )

      expect(result.current.selectedCountryName).toBe('United States')
    })

    it('should auto-fetch countries when autoFetch is true', async () => {
      const mockResponse: CountriesListAPIResponse = {
        success: true,
        message: 'Countries fetched',
        data: mockCountries,
        total: mockCountries.length
      }
      mockGetAllCountries.mockResolvedValue(mockResponse)

      renderHook(() => useCountries({ autoFetch: true }))

      await waitFor(() => {
        expect(mockGetAllCountries).toHaveBeenCalled()
      })
    })

    it('should not auto-fetch when autoFetch is false', () => {
      renderHook(() => useCountries({ autoFetch: false }))

      expect(mockGetAllCountries).not.toHaveBeenCalled()
    })
  })

  describe('Return interface', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      expect(result.current).toHaveProperty('countries')
      expect(result.current).toHaveProperty('states')
      expect(result.current).toHaveProperty('selectedCountryName')
      expect(result.current).toHaveProperty('selectedCountry')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('fetchCountries')
      expect(result.current).toHaveProperty('refetch')
      expect(result.current).toHaveProperty('setSelectedCountryName')
      expect(result.current).toHaveProperty('getCountryByName')
      expect(result.current).toHaveProperty('getCountryByCode')
      expect(result.current).toHaveProperty('getCountryIdByName')
      expect(result.current).toHaveProperty('getStateById')
      expect(result.current).toHaveProperty('getDialCodeById')
      expect(result.current).toHaveProperty('searchCountries')
      expect(result.current).toHaveProperty('searchStates')
      expect(result.current).toHaveProperty('countryOptions')
      expect(result.current).toHaveProperty('stateOptions')
      expect(result.current).toHaveProperty('dialCodeOptions')
      expect(result.current).toHaveProperty('totalCount')
      expect(result.current).toHaveProperty('statesCount')
    })

    it('should have function types for methods', () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      expect(typeof result.current.fetchCountries).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
      expect(typeof result.current.setSelectedCountryName).toBe('function')
      expect(typeof result.current.getCountryByName).toBe('function')
      expect(typeof result.current.getCountryByCode).toBe('function')
      expect(typeof result.current.getCountryIdByName).toBe('function')
      expect(typeof result.current.getStateById).toBe('function')
      expect(typeof result.current.getDialCodeById).toBe('function')
      expect(typeof result.current.searchCountries).toBe('function')
      expect(typeof result.current.searchStates).toBe('function')
    })
  })

  describe('fetchCountries - Success', () => {
    const mockResponse: CountriesListAPIResponse = {
      success: true,
      message: 'Countries fetched',
      data: mockCountries,
      total: mockCountries.length
    }

    it('should fetch countries successfully', async () => {
      mockGetAllCountries.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.countries).toEqual(mockCountries)
      expect(result.current.error).toBeNull()
    })

    it('should set loading state during fetch', async () => {
      mockGetAllCountries.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )

      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      act(() => {
        result.current.fetchCountries()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should cache countries when cacheResults is true', async () => {
      mockGetAllCountries.mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, cacheResults: true })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(localStorage.getItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES)).toBeTruthy()
      expect(localStorage.getItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP)).toBeTruthy()
    })

    it('should not cache countries when cacheResults is false', async () => {
      mockGetAllCountries.mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, cacheResults: false })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(localStorage.getItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES)).toBeNull()
    })

    it('should load from cache when available and valid', async () => {
      /* Set cache */
      localStorage.setItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES, JSON.stringify(mockCountries))
      localStorage.setItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP, Date.now().toString())

      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, cacheResults: true })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.countries).toEqual(mockCountries)
      expect(mockGetAllCountries).not.toHaveBeenCalled()
    })

    it('should fetch from API when cache is expired', async () => {
      mockGetAllCountries.mockResolvedValue(mockResponse)

      /* Set expired cache */
      localStorage.setItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES, JSON.stringify(mockCountries))
      localStorage.setItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP, (Date.now() - 4000000).toString())

      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, cacheResults: true })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(mockGetAllCountries).toHaveBeenCalled()
    })
  })

  describe('fetchCountries - Failure', () => {
    it('should handle API response with success false', async () => {
      mockGetAllCountries.mockResolvedValue({
        success: false,
        message: 'Failed to fetch',
        data: [],
        total: 0
      })

      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.countries).toEqual([])
      expect(result.current.error).toBe('Failed to fetch')
    })

    it('should handle API error', async () => {
      mockGetAllCountries.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.error).toBe('Network error')
    })

    it('should call handleApiError when showErrorToast is true', async () => {
      const mockError = new Error('API Error')
      mockGetAllCountries.mockRejectedValue(mockError)

      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, showErrorToast: true })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
        title: 'Failed to Load Countries'
      })
    })

    it('should not call handleApiError when showErrorToast is false', async () => {
      mockGetAllCountries.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, showErrorToast: false })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(mockHandleApiError).not.toHaveBeenCalled()
    })
  })

  describe('refetch', () => {
    it('should refetch countries', async () => {
      mockGetAllCountries.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
        data: mockCountries
      })

      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.refetch()
      })

      expect(mockGetAllCountries).toHaveBeenCalled()
      expect(result.current.countries).toEqual(mockCountries)
    })
  })

  describe('setSelectedCountryName', () => {
    it('should update selected country name', () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      act(() => {
        result.current.setSelectedCountryName('Canada')
      })

      expect(result.current.selectedCountryName).toBe('Canada')
    })
  })

  describe('Country lookup functions', () => {
    beforeEach(async () => {
      mockGetAllCountries.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockCountries,
        total: mockCountries.length
      })
    })

    it('should get country by name', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const country = result.current.getCountryByName('United States')
      expect(country).toBeDefined()
      expect(country?.name).toBe('United States')
    })

    it('should get country by code', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const country = result.current.getCountryByCode('CA')
      expect(country).toBeDefined()
      expect(country?.code).toBe('CA')
    })

    it('should return undefined for non-existent country name', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const country = result.current.getCountryByName('Non-existent')
      expect(country).toBeUndefined()
    })

    it('should handle case-insensitive country name lookup', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const country = result.current.getCountryByName('united states')
      expect(country).toBeDefined()
      expect(country?.name).toBe('United States')
    })

    it('should get country ID by name', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const countryId = result.current.getCountryIdByName('Canada')
      expect(countryId).toBe('2')
    })

    it('should return empty string for non-existent country name in getCountryIdByName', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const countryId = result.current.getCountryIdByName('Non-existent')
      expect(countryId).toBe('')
    })

    it('should get dial code by country ID', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const dialCode = result.current.getDialCodeById('3')
      expect(dialCode).toBe('+44')
    })

    it('should return undefined for invalid country ID in getDialCodeById', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const dialCode = result.current.getDialCodeById('999')
      expect(dialCode).toBeUndefined()
    })
  })

  describe('State management', () => {
    beforeEach(async () => {
      mockGetAllCountries.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockCountries,
        total: mockCountries.length
      })
    })

    it('should return states for selected country', async () => {
      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, selectedCountryName: 'United States' })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.states).toEqual(mockStates)
    })

    it('should return empty states when no country is selected', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.states).toEqual([])
    })

    it('should get state by ID', async () => {
      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, selectedCountryName: 'United States' })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      const state = result.current.getStateById(1)
      expect(state).toBeDefined()
      expect(state?.name).toBe('California')
    })

    it('should return undefined for non-existent state ID', async () => {
      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, selectedCountryName: 'United States' })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      const state = result.current.getStateById(999)
      expect(state).toBeUndefined()
    })
  })

  describe('Search functions', () => {
    beforeEach(async () => {
      mockGetAllCountries.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockCountries,
        total: mockCountries.length
      })
    })

    it('should search countries by name', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const results = result.current.searchCountries('united')
      expect(results).toHaveLength(2)
      expect(results.map(c => c.name)).toContain('United States')
      expect(results.map(c => c.name)).toContain('United Kingdom')
    })

    it('should search countries by code', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const results = result.current.searchCountries('ca')
      expect(results).toHaveLength(1)
      expect(results[0].code).toBe('CA')
    })

    it('should return empty array for queries less than 2 characters', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      const results = result.current.searchCountries('u')
      expect(results).toEqual([])
    })

    it('should search states by name', async () => {
      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, selectedCountryName: 'United States' })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      const results = result.current.searchStates('cal')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('California')
    })

    it('should return empty array for state queries less than 2 characters', async () => {
      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, selectedCountryName: 'United States' })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      const results = result.current.searchStates('c')
      expect(results).toEqual([])
    })
  })

  describe('Options transformation', () => {
    beforeEach(async () => {
      mockGetAllCountries.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockCountries,
        total: mockCountries.length
      })
    })

    it('should transform countries to options', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.countryOptions).toHaveLength(3)
      expect(result.current.countryOptions[0]).toEqual({
        id: '1',
        value: 'United States',
        label: 'United States'
      })
    })

    it('should transform states to options', async () => {
      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, selectedCountryName: 'United States' })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.stateOptions).toHaveLength(2)
      expect(result.current.stateOptions[0]).toEqual({
        id: '1',
        value: 'California',
        label: 'California'
      })
    })

    it('should transform dial codes to options', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.dialCodeOptions).toHaveLength(3)
      expect(result.current.dialCodeOptions[0]).toEqual({
        id: '1',
        value: '+1',
        label: '+1'
      })
    })
  })

  describe('Counts', () => {
    beforeEach(async () => {
      mockGetAllCountries.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockCountries,
        total: mockCountries.length
      })
    })

    it('should return total countries count', async () => {
      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.totalCount).toBe(3)
    })

    it('should return states count for selected country', async () => {
      const { result } = renderHook(() =>
        useCountries({ autoFetch: false, selectedCountryName: 'United States' })
      )

      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.statesCount).toBe(2)
    })
  })

  describe('clearCountriesCache utility', () => {
    it('should clear cache from localStorage', () => {
      localStorage.setItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES, JSON.stringify(mockCountries))
      localStorage.setItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP, Date.now().toString())

      clearCountriesCache()

      expect(localStorage.getItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES)).toBeNull()
      expect(localStorage.getItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP)).toBeNull()
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete workflow', async () => {
      mockGetAllCountries.mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockCountries,
        total: mockCountries.length
      })

      const { result } = renderHook(() => useCountries({ autoFetch: false }))

      /* Fetch countries */
      await act(async () => {
        await result.current.fetchCountries()
      })

      expect(result.current.countries).toHaveLength(3)

      /* Select a country */
      act(() => {
        result.current.setSelectedCountryName('United States')
      })

      expect(result.current.selectedCountry?.name).toBe('United States')
      expect(result.current.states).toHaveLength(2)

      /* Search countries */
      const searchResults = result.current.searchCountries('united')
      expect(searchResults).toHaveLength(2)

      /* Get dial code */
      const dialCode = result.current.getDialCodeById('1')
      expect(dialCode).toBe('+1')
    })
  })
})
