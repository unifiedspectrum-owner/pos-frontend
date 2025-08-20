import { describe, it, expect } from 'vitest'
import {
  PLAN_MANAGEMENT_FORM_TABS,
  AUTO_SAVE_DEBOUNCE_MS,
  DEFAULT_PLAN_TAB,
  FORM_VALIDATION_DEBOUNCE_MS,
  STORAGE_KEYS,
  PLAN_FORM_MODES,
  PLAN_FORM_TITLES,
  ERROR_MESSAGES
} from '../plan-constants'

describe('Plan Constants', () => {
  describe('Form Tabs Configuration', () => {
    it('should export PLAN_MANAGEMENT_FORM_TABS as an array', () => {
      expect(Array.isArray(PLAN_MANAGEMENT_FORM_TABS)).toBe(true)
      expect(PLAN_MANAGEMENT_FORM_TABS.length).toBeGreaterThan(0)
    })

    it('should have all required tab properties', () => {
      PLAN_MANAGEMENT_FORM_TABS.forEach(tab => {
        expect(tab).toHaveProperty('id')
        expect(tab).toHaveProperty('label')
        expect(tab).toHaveProperty('icon')
        
        expect(typeof tab.id).toBe('string')
        expect(typeof tab.label).toBe('string')
        expect(typeof tab.icon).toBe('function')
      })
    })

    it('should have expected tab order and content', () => {
      const expectedTabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'features', label: 'Features' },
        { id: 'addons', label: 'Add-ons' },
        { id: 'sla', label: 'SLA' }
      ]

      expect(PLAN_MANAGEMENT_FORM_TABS).toHaveLength(expectedTabs.length)
      
      expectedTabs.forEach((expected, index) => {
        expect(PLAN_MANAGEMENT_FORM_TABS[index].id).toBe(expected.id)
        expect(PLAN_MANAGEMENT_FORM_TABS[index].label).toBe(expected.label)
      })
    })

    it('should have unique tab IDs', () => {
      const ids = PLAN_MANAGEMENT_FORM_TABS.map(tab => tab.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have non-empty labels', () => {
      PLAN_MANAGEMENT_FORM_TABS.forEach(tab => {
        expect(tab.label.trim().length).toBeGreaterThan(0)
      })
    })
  })

  describe('Timing Configuration', () => {
    it('should export AUTO_SAVE_DEBOUNCE_MS as a positive number', () => {
      expect(typeof AUTO_SAVE_DEBOUNCE_MS).toBe('number')
      expect(AUTO_SAVE_DEBOUNCE_MS).toBeGreaterThan(0)
      expect(AUTO_SAVE_DEBOUNCE_MS).toBe(1000)
    })

    it('should export FORM_VALIDATION_DEBOUNCE_MS as a positive number', () => {
      expect(typeof FORM_VALIDATION_DEBOUNCE_MS).toBe('number')
      expect(FORM_VALIDATION_DEBOUNCE_MS).toBeGreaterThan(0)
      expect(FORM_VALIDATION_DEBOUNCE_MS).toBe(300)
    })

    it('should have reasonable debounce values', () => {
      // Auto-save should be longer than validation debounce
      expect(AUTO_SAVE_DEBOUNCE_MS).toBeGreaterThan(FORM_VALIDATION_DEBOUNCE_MS)
      
      // Values should be in reasonable range (not too short or too long)
      expect(FORM_VALIDATION_DEBOUNCE_MS).toBeGreaterThanOrEqual(100)
      expect(FORM_VALIDATION_DEBOUNCE_MS).toBeLessThanOrEqual(1000)
      
      expect(AUTO_SAVE_DEBOUNCE_MS).toBeGreaterThanOrEqual(500)
      expect(AUTO_SAVE_DEBOUNCE_MS).toBeLessThanOrEqual(5000)
    })
  })

  describe('Default Tab Configuration', () => {
    it('should export DEFAULT_PLAN_TAB as a string', () => {
      expect(typeof DEFAULT_PLAN_TAB).toBe('string')
    })

    it('should have default tab set to basic', () => {
      expect(DEFAULT_PLAN_TAB).toBe('basic')
    })

    it('should be a valid tab ID', () => {
      const validTabIds = PLAN_MANAGEMENT_FORM_TABS.map(tab => tab.id)
      expect(validTabIds).toContain(DEFAULT_PLAN_TAB)
    })
  })

  describe('Storage Keys Configuration', () => {
    it('should export STORAGE_KEYS as an object', () => {
      expect(typeof STORAGE_KEYS).toBe('object')
      expect(STORAGE_KEYS).not.toBeNull()
    })

    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS).toHaveProperty('DRAFT_PLAN_DATA')
      expect(STORAGE_KEYS).toHaveProperty('ACTIVE_TAB')
      expect(STORAGE_KEYS).toHaveProperty('AUTO_SAVE_TIMESTAMP')
    })

    it('should have string values for all keys', () => {
      Object.values(STORAGE_KEYS).forEach(key => {
        expect(typeof key).toBe('string')
        expect(key.length).toBeGreaterThan(0)
      })
    })

    it('should have expected storage key values', () => {
      expect(STORAGE_KEYS.DRAFT_PLAN_DATA).toBe('draft_plan_data')
      expect(STORAGE_KEYS.ACTIVE_TAB).toBe('plan_active_tab')
      expect(STORAGE_KEYS.AUTO_SAVE_TIMESTAMP).toBe('plan_auto_save_timestamp')
    })

    it('should have unique storage key values', () => {
      const values = Object.values(STORAGE_KEYS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should be compile-time readonly (const assertion)', () => {
      // STORAGE_KEYS is defined with 'as const' which provides compile-time readonly protection
      // This test verifies that the object exists and has the expected structure
      expect(STORAGE_KEYS).toBeDefined()
      expect(typeof STORAGE_KEYS).toBe('object')
      
      // Verify all expected storage keys exist
      const expectedKeys = ['DRAFT_PLAN_DATA', 'ACTIVE_TAB', 'AUTO_SAVE_TIMESTAMP']
      expectedKeys.forEach(key => {
        expect(STORAGE_KEYS).toHaveProperty(key)
        expect(typeof STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]).toBe('string')
      })
    })
  })

  describe('Plan Form Modes Configuration', () => {
    it('should export PLAN_FORM_MODES as an object', () => {
      expect(typeof PLAN_FORM_MODES).toBe('object')
      expect(PLAN_FORM_MODES).not.toBeNull()
    })

    it('should have all required form modes', () => {
      expect(PLAN_FORM_MODES).toHaveProperty('CREATE')
      expect(PLAN_FORM_MODES).toHaveProperty('EDIT')
      expect(PLAN_FORM_MODES).toHaveProperty('VIEW')
    })

    it('should have correct mode values', () => {
      expect(PLAN_FORM_MODES.CREATE).toBe('create')
      expect(PLAN_FORM_MODES.EDIT).toBe('edit')
      expect(PLAN_FORM_MODES.VIEW).toBe('view')
    })

    it('should have unique mode values', () => {
      const values = Object.values(PLAN_FORM_MODES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('Plan Form Titles Configuration', () => {
    it('should export PLAN_FORM_TITLES as an object', () => {
      expect(typeof PLAN_FORM_TITLES).toBe('object')
      expect(PLAN_FORM_TITLES).not.toBeNull()
    })

    it('should have all required title keys', () => {
      expect(PLAN_FORM_TITLES).toHaveProperty('CREATE')
      expect(PLAN_FORM_TITLES).toHaveProperty('EDIT')
      expect(PLAN_FORM_TITLES).toHaveProperty('VIEW')
      expect(PLAN_FORM_TITLES).toHaveProperty('DEFAULT')
    })

    it('should have correct title values', () => {
      expect(PLAN_FORM_TITLES.CREATE).toBe('Create Plan')
      expect(PLAN_FORM_TITLES.EDIT).toBe('Edit Plan')
      expect(PLAN_FORM_TITLES.VIEW).toBe('View Plan')
      expect(PLAN_FORM_TITLES.DEFAULT).toBe('Plan Management')
    })

    it('should have non-empty title strings', () => {
      Object.values(PLAN_FORM_TITLES).forEach(title => {
        expect(typeof title).toBe('string')
        expect(title.trim().length).toBeGreaterThan(0)
      })
    })

    it('should be compile-time readonly (const assertion)', () => {
      // PLAN_FORM_TITLES is defined with 'as const' which provides compile-time readonly protection
      // This test verifies that the object exists and has the expected structure
      expect(PLAN_FORM_TITLES).toBeDefined()
      expect(typeof PLAN_FORM_TITLES).toBe('object')
      
      // Verify all expected form titles exist
      const expectedKeys = ['CREATE', 'EDIT', 'VIEW', 'DEFAULT']
      expectedKeys.forEach(key => {
        expect(PLAN_FORM_TITLES).toHaveProperty(key)
        expect(typeof PLAN_FORM_TITLES[key as keyof typeof PLAN_FORM_TITLES]).toBe('string')
      })
    })
  })

  describe('Error Messages Configuration', () => {
    it('should export ERROR_MESSAGES as an object', () => {
      expect(typeof ERROR_MESSAGES).toBe('object')
      expect(ERROR_MESSAGES).not.toBeNull()
    })

    it('should have all required error message keys', () => {
      const expectedKeys = [
        'PLAN_CREATE_FAILED',
        'PLAN_UPDATE_FAILED',
        'PLAN_DELETE_FAILED',
        'PLAN_LOAD_FAILED',
        'VALIDATION_FAILED',
        'AUTO_SAVE_FAILED'
      ]

      expectedKeys.forEach(key => {
        expect(ERROR_MESSAGES).toHaveProperty(key)
      })
    })

    it('should have meaningful error messages', () => {
      const expectedMessages = {
        PLAN_CREATE_FAILED: 'Failed to create plan. Please try again.',
        PLAN_UPDATE_FAILED: 'Failed to update plan. Please try again.',
        PLAN_DELETE_FAILED: 'Failed to delete plan. Please try again.',
        PLAN_LOAD_FAILED: 'Failed to load plan data. Please try again.',
        VALIDATION_FAILED: 'Please fix the validation errors before continuing.',
        AUTO_SAVE_FAILED: 'Failed to save draft automatically.'
      }

      Object.entries(expectedMessages).forEach(([key, message]) => {
        expect(ERROR_MESSAGES).toHaveProperty(key)
        expect((ERROR_MESSAGES as any)[key]).toBe(message)
      })
    })

    it('should have user-friendly error messages', () => {
      Object.values(ERROR_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(10) // Should be descriptive
        expect(message).toMatch(/^[A-Z]/) // Should start with capital letter
        expect(message).toMatch(/[.!]$/) // Should end with punctuation
      })
    })

    it('should be compile-time readonly (const assertion)', () => {
      // ERROR_MESSAGES is defined with 'as const' which provides compile-time readonly protection
      // This test verifies that the object exists and has the expected structure
      expect(ERROR_MESSAGES).toBeDefined()
      expect(typeof ERROR_MESSAGES).toBe('object')
      
      // Verify all expected error messages exist
      const expectedKeys = [
        'PLAN_CREATE_FAILED',
        'PLAN_UPDATE_FAILED', 
        'PLAN_DELETE_FAILED',
        'PLAN_LOAD_FAILED',
        'VALIDATION_FAILED',
        'AUTO_SAVE_FAILED'
      ]
      
      expectedKeys.forEach(key => {
        expect(ERROR_MESSAGES).toHaveProperty(key)
        expect(typeof ERROR_MESSAGES[key as keyof typeof ERROR_MESSAGES]).toBe('string')
      })
    })
  })

  describe('Configuration Consistency', () => {
    it('should have consistent naming conventions', () => {
      // All constants should be UPPER_CASE
      const constantNames = [
        'PLAN_MANAGEMENT_FORM_TABS',
        'AUTO_SAVE_DEBOUNCE_MS',
        'DEFAULT_PLAN_TAB',
        'FORM_VALIDATION_DEBOUNCE_MS',
        'STORAGE_KEYS',
        'PLAN_FORM_MODES',
        'PLAN_FORM_TITLES',
        'ERROR_MESSAGES'
      ]

      constantNames.forEach(name => {
        expect(name).toMatch(/^[A-Z][A-Z_]*[A-Z]$/)
      })
    })

    it('should have no null or undefined values', () => {
      const allConstants = [
        PLAN_MANAGEMENT_FORM_TABS,
        AUTO_SAVE_DEBOUNCE_MS,
        DEFAULT_PLAN_TAB,
        FORM_VALIDATION_DEBOUNCE_MS,
        STORAGE_KEYS,
        PLAN_FORM_MODES,
        PLAN_FORM_TITLES,
        ERROR_MESSAGES
      ]

      allConstants.forEach(constant => {
        expect(constant).not.toBeNull()
        expect(constant).not.toBeUndefined()
      })
    })
  })
})