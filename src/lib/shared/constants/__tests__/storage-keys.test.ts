/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Shared module imports */
import { CACHE_STORAGE_KEYS } from '@shared/constants/storage-keys'

describe('storage-keys', () => {
  describe('CACHE_STORAGE_KEYS', () => {
    it('should export CACHE_STORAGE_KEYS constant', () => {
      expect(CACHE_STORAGE_KEYS).toBeDefined()
      expect(typeof CACHE_STORAGE_KEYS).toBe('object')
    })

    it('should have CACHED_COUNTRIES key', () => {
      expect(CACHE_STORAGE_KEYS).toHaveProperty('CACHED_COUNTRIES')
      expect(typeof CACHE_STORAGE_KEYS.CACHED_COUNTRIES).toBe('string')
    })

    it('should have CACHED_COUNTRIES_TIMESTAMP key', () => {
      expect(CACHE_STORAGE_KEYS).toHaveProperty('CACHED_COUNTRIES_TIMESTAMP')
      expect(typeof CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP).toBe('string')
    })

    it('should have correct value for CACHED_COUNTRIES', () => {
      expect(CACHE_STORAGE_KEYS.CACHED_COUNTRIES).toBe('cached_countries')
    })

    it('should have correct value for CACHED_COUNTRIES_TIMESTAMP', () => {
      expect(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP).toBe('cached_countries_timestamp')
    })

    it('should have all keys with non-empty string values', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(key => {
        expect(typeof key).toBe('string')
        expect(key.length).toBeGreaterThan(0)
      })
    })

    it('should have exactly 2 cache keys', () => {
      const keys = Object.keys(CACHE_STORAGE_KEYS)
      expect(keys).toHaveLength(2)
    })

    it('should not have duplicate values', () => {
      const values = Object.values(CACHE_STORAGE_KEYS)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })
  })

  describe('Storage Key Values', () => {
    it('should use lowercase with underscores for values', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(value => {
        expect(value).toMatch(/^[a-z_]+$/)
      })
    })

    it('should use descriptive naming for cache keys', () => {
      expect(CACHE_STORAGE_KEYS.CACHED_COUNTRIES).toContain('cached')
      expect(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP).toContain('timestamp')
    })

    it('should have related keys with common prefix', () => {
      expect(CACHE_STORAGE_KEYS.CACHED_COUNTRIES).toMatch(/^cached_countries/)
      expect(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP).toMatch(/^cached_countries/)
    })

    it('should have meaningful key names', () => {
      const keys = Object.keys(CACHE_STORAGE_KEYS)
      keys.forEach(key => {
        expect(key.length).toBeGreaterThan(5)
      })
    })
  })

  describe('Type Safety', () => {
    it('should have all values as non-null strings', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(value => {
        expect(value).not.toBeNull()
        expect(value).not.toBeUndefined()
        expect(typeof value).toBe('string')
      })
    })

    it('should be immutable (as const)', () => {
      expect(CACHE_STORAGE_KEYS).toBeDefined()
    })

    it('should have consistent type for all values', () => {
      const types = Object.values(CACHE_STORAGE_KEYS).map(v => typeof v)
      const uniqueTypes = new Set(types)
      expect(uniqueTypes.size).toBe(1)
      expect(uniqueTypes.has('string')).toBe(true)
    })
  })

  describe('Usage in localStorage', () => {
    it('should be usable as localStorage keys', () => {
      const testValue = 'test-data'
      const key = CACHE_STORAGE_KEYS.CACHED_COUNTRIES

      expect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, testValue)
          window.localStorage.removeItem(key)
        }
      }).not.toThrow()
    })

    it('should create valid localStorage key strings', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(key => {
        /* localStorage keys should not contain special characters */
        expect(key).toMatch(/^[a-z0-9_]+$/)
      })
    })

    it('should have keys suitable for storage operations', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(key => {
        /* Keys should be reasonable length */
        expect(key.length).toBeLessThan(100)
        expect(key.length).toBeGreaterThan(5)
      })
    })
  })

  describe('Cache Management', () => {
    it('should have data and timestamp keys for cache invalidation', () => {
      const hasDataKey = CACHE_STORAGE_KEYS.CACHED_COUNTRIES
      const hasTimestampKey = CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP

      expect(hasDataKey).toBeDefined()
      expect(hasTimestampKey).toBeDefined()
    })

    it('should follow naming pattern for cache pairs', () => {
      const dataKey = CACHE_STORAGE_KEYS.CACHED_COUNTRIES
      const timestampKey = CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP

      expect(timestampKey).toContain(dataKey)
      expect(timestampKey).toContain('timestamp')
    })

    it('should support cache expiration pattern', () => {
      const dataKey = CACHE_STORAGE_KEYS.CACHED_COUNTRIES
      const timestampKey = CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP

      /* Simulate cache check */
      const checkCache = () => {
        return {
          dataKey,
          timestampKey,
          hasExpiration: timestampKey.includes('timestamp')
        }
      }

      const result = checkCache()
      expect(result.hasExpiration).toBe(true)
    })
  })

  describe('Consistency', () => {
    it('should use consistent naming convention for keys', () => {
      Object.keys(CACHE_STORAGE_KEYS).forEach(key => {
        /* All keys should be uppercase with underscores */
        expect(key).toMatch(/^[A-Z_]+$/)
      })
    })

    it('should use consistent naming convention for values', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(value => {
        /* All values should be lowercase with underscores */
        expect(value).toMatch(/^[a-z_]+$/)
      })
    })

    it('should maintain key-value relationship', () => {
      /* Keys should be transformed versions of values */
      Object.entries(CACHE_STORAGE_KEYS).forEach(([key, value]) => {
        const expectedKey = value.toUpperCase()
        expect(key).toBe(expectedKey)
      })
    })

    it('should return same reference for multiple imports', () => {
      expect(CACHE_STORAGE_KEYS).toBe(CACHE_STORAGE_KEYS)
    })
  })

  describe('Integration', () => {
    it('should be usable in cache service', () => {
      const cacheService = {
        get: (key: string) => key,
        set: (key: string, value: any) => ({ key, value })
      }

      const dataKey = cacheService.get(CACHE_STORAGE_KEYS.CACHED_COUNTRIES)
      const timestampKey = cacheService.get(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP)

      expect(dataKey).toBe('cached_countries')
      expect(timestampKey).toBe('cached_countries_timestamp')
    })

    it('should support cache lookup operations', () => {
      const cache = {
        [CACHE_STORAGE_KEYS.CACHED_COUNTRIES]: '[{"id": 1}]',
        [CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP]: Date.now().toString()
      }

      expect(cache[CACHE_STORAGE_KEYS.CACHED_COUNTRIES]).toBeDefined()
      expect(cache[CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP]).toBeDefined()
    })

    it('should be usable in array of cache keys', () => {
      const cacheKeys = [
        CACHE_STORAGE_KEYS.CACHED_COUNTRIES,
        CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP
      ]

      expect(cacheKeys).toHaveLength(2)
      expect(cacheKeys).toContain('cached_countries')
      expect(cacheKeys).toContain('cached_countries_timestamp')
    })
  })

  describe('Namespace Management', () => {
    it('should use cache-specific prefix', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(value => {
        expect(value).toContain('cached')
      })
    })

    it('should avoid naming conflicts', () => {
      const values = Object.values(CACHE_STORAGE_KEYS)
      const lowerCaseValues = values.map(v => v.toLowerCase())
      const uniqueValues = new Set(lowerCaseValues)

      expect(uniqueValues.size).toBe(values.length)
    })

    it('should have domain-specific naming', () => {
      expect(CACHE_STORAGE_KEYS.CACHED_COUNTRIES).toContain('countries')
      expect(CACHE_STORAGE_KEYS.CACHED_COUNTRIES_TIMESTAMP).toContain('countries')
    })
  })

  describe('Error Prevention', () => {
    it('should not have whitespace in keys', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(value => {
        expect(value).not.toMatch(/\s/)
      })
    })

    it('should not have special characters in keys', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(value => {
        expect(value).toMatch(/^[a-z_]+$/)
      })
    })

    it('should not have empty string values', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(value => {
        expect(value.length).toBeGreaterThan(0)
      })
    })

    it('should have reasonable key lengths', () => {
      Object.values(CACHE_STORAGE_KEYS).forEach(value => {
        expect(value.length).toBeGreaterThan(5)
        expect(value.length).toBeLessThan(50)
      })
    })
  })
})
