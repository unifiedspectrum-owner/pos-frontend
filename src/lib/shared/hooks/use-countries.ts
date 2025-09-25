/* External library imports */
import { useState, useEffect, useCallback, useMemo } from 'react'

/* Shared module imports */
import { countryApiService } from '@shared/api'
import { CountryData, State } from '@shared/types'
import { handleApiError } from '@shared/utils'
import { COUNTRIES_CACHE_DURATION } from '@shared/config'
import { CACHE_STORAGE_KEYS } from '@shared/constants'
import { AxiosError } from 'axios'

/* Hook options interface */
export interface UseCountriesOptions {
  autoFetch?: boolean
  showErrorToast?: boolean
  cacheResults?: boolean
  selectedCountryName?: string
}

/* Hook return interface */
export interface UseCountriesReturn {
  countries: CountryData[]
  states: State[]
  selectedCountryName: string
  selectedCountry: CountryData | undefined
  isLoading: boolean
  error: string | null
  fetchCountries: () => Promise<void>
  refetch: () => Promise<void>
  setSelectedCountryName: (countryId: string) => void
  getCountryByName: (code: string) => CountryData | undefined
  getCountryByCode: (code: string) => CountryData | undefined
  getCountryIdByName: (name: string) => string
  getStateById: (id: number) => State | undefined
  getDialCodeById: (id: string) => string | undefined
  searchCountries: (query: string) => CountryData[]
  searchStates: (query: string) => State[]
  countryOptions: Array<{ id: string; value: string; label: string }>
  stateOptions: Array<{ id: string; value: string; label: string }>
  dialCodeOptions: Array<{ id: string; value: string; label: string }>
  totalCount: number
  statesCount: number
}

/* Custom hook for fetching and managing country and state data */
export const useCountries = (options: UseCountriesOptions = {}): UseCountriesReturn => {
  const {
    autoFetch = true,
    showErrorToast = true,
    cacheResults = true,
    selectedCountryName: initialSelectedCountryName = ''
  } = options

  /* State management */
  const [countries, setCountries] = useState<CountryData[]>([])
  const [selectedCountryName, setSelectedCountryName] = useState<string>(initialSelectedCountryName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Fetch countries function */
  const fetchCountries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      /* Check cache first if enabled */
      if (cacheResults) {
        const cachedCountries = localStorage.getItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES)
        const cacheTimestamp = localStorage.getItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP)

        if (cachedCountries && cacheTimestamp) {
          const isValidCache = Date.now() - parseInt(cacheTimestamp) < COUNTRIES_CACHE_DURATION
          if (isValidCache) {
            const parsed = JSON.parse(cachedCountries)
            setCountries(parsed)
            console.log('Countries loaded from cache:', parsed.length, 'countries')
            return
          }
        }
      }

      /* Fetch from API */
      const response = await countryApiService.getAllCountries()
      
      if (response.success && response.data) {
        const fetchedCountries = response.data
        setCountries(fetchedCountries)
        
        /* Cache results if enabled */
        if (cacheResults) {
          localStorage.setItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES, JSON.stringify(fetchedCountries))
          localStorage.setItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP, Date.now().toString())
        }
        
        console.log('Countries fetched successfully:', fetchedCountries.length, 'countries')
      } else {
        const errorMsg = response.message || 'Failed to fetch countries'
        setError(errorMsg)
        console.warn('Failed to fetch countries:', errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error fetching countries'
      setError(errorMsg)
      console.error('Error fetching countries:', error)
      const err = error as AxiosError;
      if (showErrorToast) {
        handleApiError(err, {
          title: 'Failed to Load Countries'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [cacheResults, showErrorToast])

  /* Refetch function (alias for fetchCountries) */
  const refetch = useCallback(() => {
    return fetchCountries()
  }, [fetchCountries])

  /* Get country by ID */
  const getCountryByName = useCallback((name: string): CountryData | undefined => {
    console.log("country Name", name, "countries loaded:", countries.length)
    if (!name) return undefined
    const country = countries.find(country => 
      country.name.toLowerCase() === name.toLowerCase()
    )
    console.log("found country by Name:", country)
    return country
  }, [countries])

  /* Get country by code (kept for backwards compatibility) */
  const getCountryByCode = useCallback((code: string): CountryData | undefined => {
    console.log("country code", code, "countries loaded:", countries.length)
    if (!code) return undefined
    const country = countries.find(country => 
      country.code.toLowerCase() === code.toLowerCase()
    )
    console.log("found country by code:", country)
    return country
  }, [countries])

  /* Get country ID by name for form population */
  const getCountryIdByName = useCallback((countryName: string): string => {
    if (!countryName || countries.length === 0) return ''
    const country = countries.find(c => c.name === countryName)
    console.log(`Looking for country name: "${countryName}", found:`, country)
    return country ? country.id.toString() : ''
  }, [countries])

  /* Get dial code by country ID */
  const getDialCodeById = useCallback((id: string): string | undefined => {
    console.log("getting dial code for country ID:", id, "countries loaded:", countries.length)
    if (!id) return undefined
    const country = countries.find(country => 
      country.id.toString() === id
    )
    console.log("found country for dial code:", country)
    return country?.phone_code
  }, [countries])

  /* Search countries by name */
  const searchCountries = useCallback((query: string): CountryData[] => {
    if (!query || query.length < 2) return []
    
    const searchTerm = query.toLowerCase()
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm)
    )
  }, [countries])

  /* Get selected country object */
  const selectedCountry = useMemo(() => {
    if (!selectedCountryName || countries.length === 0) return undefined
    return getCountryByName(selectedCountryName)
  }, [selectedCountryName, countries.length, getCountryByName])

  /* Get states for selected country */
  const states = useMemo(() => {
    if (!selectedCountry) return []
    console.log('Selected country states:', selectedCountry.name, selectedCountry.states?.length || 0)
    return selectedCountry.states || []
  }, [selectedCountry])

  /* Get state by ID */
  const getStateById = useCallback((id: number): State | undefined => {
    if (!id) return undefined
    return states.find(state => state.id === id)
  }, [states])

  /* Search states by name */
  const searchStates = useCallback((query: string): State[] => {
    if (!query || query.length < 2) return []
    
    const searchTerm = query.toLowerCase()
    return states.filter(state =>
      state.name.toLowerCase().includes(searchTerm)
    )
  }, [states])

  /* Transform countries to select options */
  const countryOptions = useMemo(() => {
    return countries.map(country => ({
      id: country.id.toString(),
      value: country.name,           // Keep for backwards compatibility 
      label: country.name            // Display country name in UI
    }))
  }, [countries])

  /* Transform states to select options */
  const stateOptions = useMemo(() => {
    return states.map(state => ({
      id: state.id.toString(),
      value: state.name,
      label: state.name
    }))
  }, [states])

  /* Transform countries to dial code options for phone number fields */
  const dialCodeOptions = useMemo(() => {
    return countries.map(country => ({
      id: country.id.toString(),
      value: country.phone_code.toString(),
      label: country.phone_code
    }))
  }, [countries])

  /* Total count */
  const totalCount = useMemo(() => countries.length, [countries])

  /* States count */
  const statesCount = useMemo(() => states.length, [states])

  /* Auto-fetch on mount if enabled */
  useEffect(() => {
    if (autoFetch) {
      fetchCountries()
    }
  }, [autoFetch, fetchCountries])

  return {
    countries,
    states,
    selectedCountryName,
    selectedCountry,
    isLoading,
    error,
    fetchCountries,
    refetch,
    setSelectedCountryName,
    getCountryByName,
    getCountryByCode,
    getCountryIdByName,
    getStateById,
    getDialCodeById,
    searchCountries,
    searchStates,
    countryOptions,
    stateOptions,
    dialCodeOptions,
    totalCount,
    statesCount
  }
}

/* Clear cached countries */
export const clearCountriesCache = () => {
  localStorage.removeItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES)
  localStorage.removeItem(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP)
  console.log('Countries cache cleared')
}

export default useCountries