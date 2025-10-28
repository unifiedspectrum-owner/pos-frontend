/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Tenant management module imports */
import { TENANT_ACCOUNT_CREATION_LS_KEYS, PLANS_CACHE_CONFIG } from '../storage'

describe('Storage Constants', () => {
  describe('TENANT_ACCOUNT_CREATION_LS_KEYS', () => {
    it('has TENANT_ID key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID).toBe('tenant_id')
    })

    it('has TENANT_FORM_DATA key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA).toBe('tenant_form_data')
    })

    it('has TENANT_VERIFICATION_DATA key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA).toBe('tenant_verification_data')
    })

    it('has SELECTED_PLAN_DATA key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA).toBe('selected_plan_data')
    })

    it('has PLAN_SUMMARY_COMPLETED key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PLAN_SUMMARY_COMPLETED).toBe('plan_summary_completed')
    })

    it('has PAYMENT_DATA key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_DATA).toBe('payment_data')
    })

    it('has PAYMENT_ACKNOWLEDGED key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_ACKNOWLEDGED).toBe('payment_acknowledged')
    })

    it('has FAILED_PAYMENT_INTENT key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT).toBe('failed_payment_intent')
    })

    it('has OTP_STATE key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE).toBe('otp_state')
    })

    it('has COMPLETED_STEPS key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.COMPLETED_STEPS).toBe('completed_steps')
    })

    it('has PENDING_STATE_RESTORE key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PENDING_STATE_RESTORE).toBe('pending_state_restore')
    })

    it('has PAYMENT_RETRY_ATTEMPTS key', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_RETRY_ATTEMPTS).toBe('payment_retry_attempts')
    })

    it('has exactly 12 localStorage keys', () => {
      const keys = Object.keys(TENANT_ACCOUNT_CREATION_LS_KEYS)
      expect(keys).toHaveLength(12)
    })

    it('all keys follow snake_case convention', () => {
      Object.values(TENANT_ACCOUNT_CREATION_LS_KEYS).forEach(key => {
        expect(key).toMatch(/^[a-z]+(_[a-z]+)*$/)
      })
    })

    it('all keys are non-empty strings', () => {
      Object.values(TENANT_ACCOUNT_CREATION_LS_KEYS).forEach(key => {
        expect(key).toBeTruthy()
        expect(typeof key).toBe('string')
      })
    })

    it('all keys are unique', () => {
      const values = Object.values(TENANT_ACCOUNT_CREATION_LS_KEYS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('PLANS_CACHE_CONFIG', () => {
    it('has KEY property', () => {
      expect(PLANS_CACHE_CONFIG.KEY).toBe('cached_subscription_plans')
    })

    it('has TIMESTAMP_KEY property', () => {
      expect(PLANS_CACHE_CONFIG.TIMESTAMP_KEY).toBe('cached_subscription_plans_timestamp')
    })

    it('has DURATION property', () => {
      expect(PLANS_CACHE_CONFIG.DURATION).toBe(5 * 60 * 1000)
    })

    it('DURATION is 5 minutes in milliseconds', () => {
      const fiveMinutesInMs = 5 * 60 * 1000
      expect(PLANS_CACHE_CONFIG.DURATION).toBe(fiveMinutesInMs)
      expect(PLANS_CACHE_CONFIG.DURATION).toBe(300000)
    })

    it('has exactly 3 cache configuration properties', () => {
      const keys = Object.keys(PLANS_CACHE_CONFIG)
      expect(keys).toHaveLength(3)
    })

    it('KEY and TIMESTAMP_KEY are strings', () => {
      expect(typeof PLANS_CACHE_CONFIG.KEY).toBe('string')
      expect(typeof PLANS_CACHE_CONFIG.TIMESTAMP_KEY).toBe('string')
    })

    it('DURATION is a number', () => {
      expect(typeof PLANS_CACHE_CONFIG.DURATION).toBe('number')
    })

    it('DURATION is a positive number', () => {
      expect(PLANS_CACHE_CONFIG.DURATION).toBeGreaterThan(0)
    })

    it('TIMESTAMP_KEY relates to KEY', () => {
      expect(PLANS_CACHE_CONFIG.TIMESTAMP_KEY).toContain('cached_subscription_plans')
      expect(PLANS_CACHE_CONFIG.TIMESTAMP_KEY.endsWith('_timestamp')).toBe(true)
    })
  })

  describe('Storage Key Naming Conventions', () => {
    it('localStorage keys use snake_case', () => {
      Object.values(TENANT_ACCOUNT_CREATION_LS_KEYS).forEach(key => {
        expect(key).toMatch(/^[a-z_]+$/)
      })
    })

    it('cache keys use snake_case', () => {
      expect(PLANS_CACHE_CONFIG.KEY).toMatch(/^[a-z_]+$/)
      expect(PLANS_CACHE_CONFIG.TIMESTAMP_KEY).toMatch(/^[a-z_]+$/)
    })

    it('no keys contain uppercase letters', () => {
      const allKeys = [
        ...Object.values(TENANT_ACCOUNT_CREATION_LS_KEYS),
        PLANS_CACHE_CONFIG.KEY,
        PLANS_CACHE_CONFIG.TIMESTAMP_KEY
      ]

      allKeys.forEach(key => {
        expect(key).toBe(key.toLowerCase())
      })
    })

    it('no keys contain spaces', () => {
      const allKeys = [
        ...Object.values(TENANT_ACCOUNT_CREATION_LS_KEYS),
        PLANS_CACHE_CONFIG.KEY,
        PLANS_CACHE_CONFIG.TIMESTAMP_KEY
      ]

      allKeys.forEach(key => {
        expect(key).not.toContain(' ')
      })
    })
  })

  describe('Storage Key Uniqueness', () => {
    it('all storage keys are unique across all storage constants', () => {
      const allKeys = [
        ...Object.values(TENANT_ACCOUNT_CREATION_LS_KEYS),
        PLANS_CACHE_CONFIG.KEY,
        PLANS_CACHE_CONFIG.TIMESTAMP_KEY
      ]

      const uniqueKeys = new Set(allKeys)
      expect(uniqueKeys.size).toBe(allKeys.length)
    })

    it('no overlap between localStorage keys and cache keys', () => {
      const lsKeys = Object.values(TENANT_ACCOUNT_CREATION_LS_KEYS)
      const cacheKeys = [PLANS_CACHE_CONFIG.KEY, PLANS_CACHE_CONFIG.TIMESTAMP_KEY]

      cacheKeys.forEach(cacheKey => {
        expect(lsKeys).not.toContain(cacheKey)
      })
    })
  })

  describe('Cache Duration Configuration', () => {
    it('duration is reasonable for caching (between 1 minute and 1 hour)', () => {
      const oneMinute = 60 * 1000
      const oneHour = 60 * 60 * 1000

      expect(PLANS_CACHE_CONFIG.DURATION).toBeGreaterThanOrEqual(oneMinute)
      expect(PLANS_CACHE_CONFIG.DURATION).toBeLessThanOrEqual(oneHour)
    })

    it('duration is divisible by 1000 (whole seconds)', () => {
      expect(PLANS_CACHE_CONFIG.DURATION % 1000).toBe(0)
    })

    it('duration converts to whole minutes', () => {
      const durationInMinutes = PLANS_CACHE_CONFIG.DURATION / (60 * 1000)
      expect(durationInMinutes).toBe(Math.floor(durationInMinutes))
    })
  })

  describe('Key Purpose Validation', () => {
    it('has keys for tenant data storage', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID).toBeDefined()
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA).toBeDefined()
    })

    it('has keys for verification process', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA).toBeDefined()
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE).toBeDefined()
    })

    it('has keys for plan selection', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA).toBeDefined()
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PLAN_SUMMARY_COMPLETED).toBeDefined()
    })

    it('has keys for payment process', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_DATA).toBeDefined()
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_ACKNOWLEDGED).toBeDefined()
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT).toBeDefined()
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_RETRY_ATTEMPTS).toBeDefined()
    })

    it('has keys for workflow management', () => {
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.COMPLETED_STEPS).toBeDefined()
      expect(TENANT_ACCOUNT_CREATION_LS_KEYS.PENDING_STATE_RESTORE).toBeDefined()
    })
  })
})
