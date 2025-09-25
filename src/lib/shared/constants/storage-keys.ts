/* Shared localStorage and sessionStorage key constants */

/* Country data cache keys */
export const CACHE_STORAGE_KEYS = {
  CACHED_COUNTRIES: 'cached_countries',
  CACHED_COUNTRIES_TIMESTAMP: 'cached_countries_timestamp'
} as const

/* Cache storage key type */
export type CacheStorageKey = typeof CACHE_STORAGE_KEYS[keyof typeof CACHE_STORAGE_KEYS]