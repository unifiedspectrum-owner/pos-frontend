/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Tenant management module imports */
import { PLAN_BILLING_CYCLE, PLAN_BILLING_CYCLES, ADDON_PRICING_SCOPE, MAX_BRANCH_COUNT, TENANT_STATUS, SUBSCRIPTION_STATUS, TENANT_STATUS_FILTER_OPTIONS, TENANT_SUBSCRIPTION_FILTER_OPTIONS } from '../business'

describe('Business Constants', () => {
  describe('PLAN_BILLING_CYCLE', () => {
    it('has MONTHLY constant', () => {
      expect(PLAN_BILLING_CYCLE.MONTHLY).toBe('monthly')
    })

    it('has YEARLY constant', () => {
      expect(PLAN_BILLING_CYCLE.YEARLY).toBe('yearly')
    })

    it('has exactly 2 billing cycle types', () => {
      const keys = Object.keys(PLAN_BILLING_CYCLE)
      expect(keys).toHaveLength(2)
    })
  })

  describe('PLAN_BILLING_CYCLES', () => {
    it('contains monthly billing cycle', () => {
      expect(PLAN_BILLING_CYCLES).toContain('monthly')
    })

    it('contains yearly billing cycle', () => {
      expect(PLAN_BILLING_CYCLES).toContain('yearly')
    })

    it('has exactly 2 billing cycles', () => {
      expect(PLAN_BILLING_CYCLES).toHaveLength(2)
    })

    it('is an array', () => {
      expect(Array.isArray(PLAN_BILLING_CYCLES)).toBe(true)
    })
  })

  describe('ADDON_PRICING_SCOPE', () => {
    it('has ORGANIZATION constant', () => {
      expect(ADDON_PRICING_SCOPE.ORGANIZATION).toBe('organization')
    })

    it('has BRANCH constant', () => {
      expect(ADDON_PRICING_SCOPE.BRANCH).toBe('branch')
    })

    it('has exactly 2 pricing scopes', () => {
      const keys = Object.keys(ADDON_PRICING_SCOPE)
      expect(keys).toHaveLength(2)
    })
  })

  describe('MAX_BRANCH_COUNT', () => {
    it('is set to 100', () => {
      expect(MAX_BRANCH_COUNT).toBe(100)
    })

    it('is a number', () => {
      expect(typeof MAX_BRANCH_COUNT).toBe('number')
    })

    it('is a positive number', () => {
      expect(MAX_BRANCH_COUNT).toBeGreaterThan(0)
    })
  })

  describe('TENANT_STATUS', () => {
    it('has ALL status', () => {
      expect(TENANT_STATUS.ALL).toBe('all')
    })

    it('has ACTIVE status', () => {
      expect(TENANT_STATUS.ACTIVE).toBe('active')
    })

    it('has HOLD status', () => {
      expect(TENANT_STATUS.HOLD).toBe('hold')
    })

    it('has SUSPENDED status', () => {
      expect(TENANT_STATUS.SUSPENDED).toBe('suspended')
    })

    it('has CANCELLED status', () => {
      expect(TENANT_STATUS.CANCELLED).toBe('cancelled')
    })

    it('has TRIAL status', () => {
      expect(TENANT_STATUS.TRIAL).toBe('trial')
    })

    it('has SETUP status', () => {
      expect(TENANT_STATUS.SETUP).toBe('setup')
    })

    it('has PENDING_VERIFICATION status', () => {
      expect(TENANT_STATUS.PENDING_VERIFICATION).toBe('pending_verification')
    })

    it('has INACTIVE status', () => {
      expect(TENANT_STATUS.INACTIVE).toBe('inactive')
    })

    it('has exactly 9 tenant statuses', () => {
      const keys = Object.keys(TENANT_STATUS)
      expect(keys).toHaveLength(9)
    })
  })

  describe('SUBSCRIPTION_STATUS', () => {
    it('has ALL status', () => {
      expect(SUBSCRIPTION_STATUS.ALL).toBe('all')
    })

    it('has SETUP status', () => {
      expect(SUBSCRIPTION_STATUS.SETUP).toBe('setup')
    })

    it('has ACTIVE status', () => {
      expect(SUBSCRIPTION_STATUS.ACTIVE).toBe('active')
    })

    it('has PAST_DUE status', () => {
      expect(SUBSCRIPTION_STATUS.PAST_DUE).toBe('past_due')
    })

    it('has CANCELLED status', () => {
      expect(SUBSCRIPTION_STATUS.CANCELLED).toBe('cancelled')
    })

    it('has TRIAL status', () => {
      expect(SUBSCRIPTION_STATUS.TRIAL).toBe('trial')
    })

    it('has INCOMPLETE status', () => {
      expect(SUBSCRIPTION_STATUS.INCOMPLETE).toBe('incomplete')
    })

    it('has SUSPENDED status', () => {
      expect(SUBSCRIPTION_STATUS.SUSPENDED).toBe('suspended')
    })

    it('has PAUSED status', () => {
      expect(SUBSCRIPTION_STATUS.PAUSED).toBe('paused')
    })

    it('has NONE status', () => {
      expect(SUBSCRIPTION_STATUS.NONE).toBe('none')
    })

    it('has exactly 10 subscription statuses', () => {
      const keys = Object.keys(SUBSCRIPTION_STATUS)
      expect(keys).toHaveLength(10)
    })
  })

  describe('TENANT_STATUS_FILTER_OPTIONS', () => {
    it('has 9 filter options', () => {
      expect(TENANT_STATUS_FILTER_OPTIONS).toHaveLength(9)
    })

    it('includes All Status option', () => {
      const allOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'all')
      expect(allOption).toBeDefined()
      expect(allOption?.label).toBe('All Status')
    })

    it('includes Active option', () => {
      const activeOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'active')
      expect(activeOption).toBeDefined()
      expect(activeOption?.label).toBe('Active')
    })

    it('includes Hold option', () => {
      const holdOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'hold')
      expect(holdOption).toBeDefined()
      expect(holdOption?.label).toBe('Hold')
    })

    it('includes Suspended option', () => {
      const suspendedOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'suspended')
      expect(suspendedOption).toBeDefined()
      expect(suspendedOption?.label).toBe('Suspended')
    })

    it('includes Cancelled option', () => {
      const cancelledOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'cancelled')
      expect(cancelledOption).toBeDefined()
      expect(cancelledOption?.label).toBe('Cancelled')
    })

    it('includes Trial option', () => {
      const trialOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'trial')
      expect(trialOption).toBeDefined()
      expect(trialOption?.label).toBe('Trial')
    })

    it('includes Setup option', () => {
      const setupOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'setup')
      expect(setupOption).toBeDefined()
      expect(setupOption?.label).toBe('Setup')
    })

    it('includes Pending Verification option', () => {
      const pendingOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'pending_verification')
      expect(pendingOption).toBeDefined()
      expect(pendingOption?.label).toBe('Pending Verification')
    })

    it('includes Inactive option', () => {
      const inactiveOption = TENANT_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'inactive')
      expect(inactiveOption).toBeDefined()
      expect(inactiveOption?.label).toBe('Inactive')
    })

    it('all options have label and value properties', () => {
      TENANT_STATUS_FILTER_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')
        expect(typeof option.value).toBe('string')
      })
    })
  })

  describe('TENANT_SUBSCRIPTION_FILTER_OPTIONS', () => {
    it('has 10 filter options', () => {
      expect(TENANT_SUBSCRIPTION_FILTER_OPTIONS).toHaveLength(10)
    })

    it('includes All Subscriptions option', () => {
      const allOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'all')
      expect(allOption).toBeDefined()
      expect(allOption?.label).toBe('All Subscriptions')
    })

    it('includes Setup option', () => {
      const setupOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'setup')
      expect(setupOption).toBeDefined()
      expect(setupOption?.label).toBe('Setup')
    })

    it('includes Active option', () => {
      const activeOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'active')
      expect(activeOption).toBeDefined()
      expect(activeOption?.label).toBe('Active')
    })

    it('includes Past Due option', () => {
      const pastDueOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'past_due')
      expect(pastDueOption).toBeDefined()
      expect(pastDueOption?.label).toBe('Past Due')
    })

    it('includes Cancelled option', () => {
      const cancelledOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'cancelled')
      expect(cancelledOption).toBeDefined()
      expect(cancelledOption?.label).toBe('Cancelled')
    })

    it('includes Trial option', () => {
      const trialOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'trial')
      expect(trialOption).toBeDefined()
      expect(trialOption?.label).toBe('Trial')
    })

    it('includes Incomplete option', () => {
      const incompleteOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'incomplete')
      expect(incompleteOption).toBeDefined()
      expect(incompleteOption?.label).toBe('Incomplete')
    })

    it('includes Suspended option', () => {
      const suspendedOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'suspended')
      expect(suspendedOption).toBeDefined()
      expect(suspendedOption?.label).toBe('Suspended')
    })

    it('includes Paused option', () => {
      const pausedOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'paused')
      expect(pausedOption).toBeDefined()
      expect(pausedOption?.label).toBe('Paused')
    })

    it('includes No Subscription option', () => {
      const noneOption = TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'none')
      expect(noneOption).toBeDefined()
      expect(noneOption?.label).toBe('No Subscription')
    })

    it('all options have label and value properties', () => {
      TENANT_SUBSCRIPTION_FILTER_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')
        expect(typeof option.value).toBe('string')
      })
    })
  })

  describe('Constants Integration', () => {
    it('TENANT_STATUS values match TENANT_STATUS_FILTER_OPTIONS values', () => {
      const statusValues = Object.values(TENANT_STATUS)
      const filterValues = TENANT_STATUS_FILTER_OPTIONS.map(opt => opt.value)

      statusValues.forEach(status => {
        expect(filterValues).toContain(status)
      })
    })

    it('SUBSCRIPTION_STATUS values match TENANT_SUBSCRIPTION_FILTER_OPTIONS values', () => {
      const statusValues = Object.values(SUBSCRIPTION_STATUS)
      const filterValues = TENANT_SUBSCRIPTION_FILTER_OPTIONS.map(opt => opt.value)

      statusValues.forEach(status => {
        expect(filterValues).toContain(status)
      })
    })

    it('PLAN_BILLING_CYCLES contains values from PLAN_BILLING_CYCLE', () => {
      const billingCycleValues = Object.values(PLAN_BILLING_CYCLE)

      PLAN_BILLING_CYCLES.forEach(cycle => {
        expect(billingCycleValues).toContain(cycle)
      })
    })
  })
})
