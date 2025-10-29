/* Comprehensive test suite for storage utilities */

/* Libraries imports */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

/* Plan management module imports */
import { hasStorageData, loadDataFromStorage, saveFormDataToStorage, clearStorageData } from '@plan-management/utils/storage'
import { STORAGE_KEYS, PLAN_FORM_MODES, PLAN_FORM_TAB } from '@plan-management/constants'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PlanFormMode, PlanFormTab } from '@plan-management/types'

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('hasStorageData', () => {
    it('should return false for non-CREATE mode', () => {
      const result = hasStorageData(PLAN_FORM_MODES.EDIT)
      expect(result).toBe(false)
    })

    it('should return false for VIEW mode', () => {
      const result = hasStorageData(PLAN_FORM_MODES.VIEW)
      expect(result).toBe(false)
    })

    it('should return false when no storage data exists in CREATE mode', () => {
      const result = hasStorageData(PLAN_FORM_MODES.CREATE)
      expect(result).toBe(false)
    })

    it('should return true when draft plan data exists', () => {
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, '{}')
      const result = hasStorageData(PLAN_FORM_MODES.CREATE)
      expect(result).toBe(true)
    })

    it('should return true when active tab exists', () => {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, PLAN_FORM_TAB.BASIC)
      const result = hasStorageData(PLAN_FORM_MODES.CREATE)
      expect(result).toBe(true)
    })

    it('should return true when both draft and tab exist', () => {
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, '{}')
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, PLAN_FORM_TAB.PRICING)
      const result = hasStorageData(PLAN_FORM_MODES.CREATE)
      expect(result).toBe(true)
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = hasStorageData(PLAN_FORM_MODES.CREATE)
      expect(result).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalledWith('Storage check failed:', expect.any(Error))

      consoleWarnSpy.mockRestore()
      getItemSpy.mockRestore()
    })

    it('should log storage check results', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, '{}')

      hasStorageData(PLAN_FORM_MODES.CREATE)

      expect(consoleLogSpy).toHaveBeenCalledWith('Storage check:', {
        hasFormData: true,
        hasTabState: false
      })

      consoleLogSpy.mockRestore()
    })
  })

  describe('loadDataFromStorage', () => {
    const mockSetValue = vi.fn()
    const mockSetActiveTab = vi.fn()

    beforeEach(() => {
      mockSetValue.mockClear()
      mockSetActiveTab.mockClear()
    })

    it('should do nothing for non-CREATE mode', () => {
      loadDataFromStorage(PLAN_FORM_MODES.EDIT, mockSetValue, mockSetActiveTab)
      expect(mockSetValue).not.toHaveBeenCalled()
      expect(mockSetActiveTab).not.toHaveBeenCalled()
    })

    it('should do nothing for VIEW mode', () => {
      loadDataFromStorage(PLAN_FORM_MODES.VIEW, mockSetValue, mockSetActiveTab)
      expect(mockSetValue).not.toHaveBeenCalled()
      expect(mockSetActiveTab).not.toHaveBeenCalled()
    })

    it('should load form data from storage', () => {
      const formData: Partial<CreatePlanFormData> = {
        name: 'Test Plan',
        description: 'Test Description',
        monthly_price: '99.99'
      }
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, JSON.stringify(formData))

      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)

      expect(mockSetValue).toHaveBeenCalledTimes(3)
      expect(mockSetValue).toHaveBeenCalledWith('name', 'Test Plan')
      expect(mockSetValue).toHaveBeenCalledWith('description', 'Test Description')
      expect(mockSetValue).toHaveBeenCalledWith('monthly_price', '99.99')
    })

    it('should load active tab from storage', () => {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, PLAN_FORM_TAB.PRICING)

      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)

      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.PRICING)
    })

    it('should not load invalid tab values', () => {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, 'invalid-tab')

      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)

      expect(mockSetActiveTab).not.toHaveBeenCalled()
    })

    it('should load all valid tabs', () => {
      const validTabs = [
        PLAN_FORM_TAB.BASIC,
        PLAN_FORM_TAB.PRICING,
        PLAN_FORM_TAB.FEATURES,
        PLAN_FORM_TAB.ADDONS,
        PLAN_FORM_TAB.SLA
      ]

      validTabs.forEach(tab => {
        mockSetActiveTab.mockClear()
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab)
        loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)
        expect(mockSetActiveTab).toHaveBeenCalledWith(tab)
      })
    })

    it('should handle missing storage data gracefully', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)

      expect(mockSetValue).not.toHaveBeenCalled()
      expect(mockSetActiveTab).not.toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith('Restoring form data from localStorage')

      consoleLogSpy.mockRestore()
    })

    it('should handle JSON parse errors', () => {
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, 'invalid-json')
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Data restoration failed:', expect.any(Error))
      consoleErrorSpy.mockRestore()
    })

    it('should log restoration process', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const formData = { name: 'Test Plan' }
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, JSON.stringify(formData))

      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)

      expect(consoleLogSpy).toHaveBeenCalledWith('Restoring form data from localStorage')
      expect(consoleLogSpy).toHaveBeenCalledWith('Found saved form data:', ['name'])
      expect(consoleLogSpy).toHaveBeenCalledWith('Data restoration completed')

      consoleLogSpy.mockRestore()
    })

    it('should load complex form data with arrays', () => {
      const formData: Partial<CreatePlanFormData> = {
        name: 'Enterprise Plan',
        feature_ids: [1, 2, 3],
        support_sla_ids: [10, 20]
      }
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, JSON.stringify(formData))

      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)

      expect(mockSetValue).toHaveBeenCalledWith('name', 'Enterprise Plan')
      expect(mockSetValue).toHaveBeenCalledWith('feature_ids', [1, 2, 3])
      expect(mockSetValue).toHaveBeenCalledWith('support_sla_ids', [10, 20])
    })
  })

  describe('saveFormDataToStorage', () => {
    const mockSetShowSavedIndicator = vi.fn()

    beforeEach(() => {
      mockSetShowSavedIndicator.mockClear()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return false for non-CREATE mode', () => {
      const formData: CreatePlanFormData = {} as CreatePlanFormData
      const result = saveFormDataToStorage(PLAN_FORM_MODES.EDIT, formData, mockSetShowSavedIndicator)
      expect(result).toBe(false)
    })

    it('should return false for VIEW mode', () => {
      const formData: CreatePlanFormData = {} as CreatePlanFormData
      const result = saveFormDataToStorage(PLAN_FORM_MODES.VIEW, formData, mockSetShowSavedIndicator)
      expect(result).toBe(false)
    })

    it('should save form data to localStorage', () => {
      const formData: Partial<CreatePlanFormData> = {
        name: 'Test Plan',
        description: 'Test Description'
      }

      const result = saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData as CreatePlanFormData, mockSetShowSavedIndicator)

      expect(result).toBe(true)
      const saved = localStorage.getItem(STORAGE_KEYS.DRAFT_PLAN_DATA)
      expect(saved).toBe(JSON.stringify(formData))
    })

    it('should show saved indicator', () => {
      const formData: CreatePlanFormData = {} as CreatePlanFormData

      saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData, mockSetShowSavedIndicator)

      expect(mockSetShowSavedIndicator).toHaveBeenCalled()
    })

    it('should hide saved indicator after 2 seconds', () => {
      const formData: CreatePlanFormData = {} as CreatePlanFormData

      /* Mock implementation that executes the callback to trigger setTimeout */
      mockSetShowSavedIndicator.mockImplementation((callback) => {
        if (typeof callback === 'function') {
          callback(false) /* Simulate prevState = false */
        }
      })

      saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData, mockSetShowSavedIndicator)

      /* Initial call to show indicator */
      expect(mockSetShowSavedIndicator).toHaveBeenCalledTimes(1)

      /* Advance timers by 2 seconds */
      vi.advanceTimersByTime(2000)

      /* Second call to hide indicator */
      expect(mockSetShowSavedIndicator).toHaveBeenCalledTimes(2)
      expect(mockSetShowSavedIndicator).toHaveBeenLastCalledWith(false)
    })

    it('should not show indicator if already shown', () => {
      const formData: CreatePlanFormData = {} as CreatePlanFormData
      mockSetShowSavedIndicator.mockImplementation((callback) => {
        /* Simulate prevState being true */
        const result = callback(true)
        expect(result).toBe(true)
      })

      saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData, mockSetShowSavedIndicator)

      /* Timer should not be set if indicator already shown */
      vi.advanceTimersByTime(2000)
    })

    it('should handle localStorage errors', () => {
      const formData: CreatePlanFormData = {} as CreatePlanFormData
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData, mockSetShowSavedIndicator)

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Form data save failed:', expect.any(Error))

      consoleErrorSpy.mockRestore()
      setItemSpy.mockRestore()
    })

    it('should log save success', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const formData: CreatePlanFormData = {} as CreatePlanFormData

      saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData, mockSetShowSavedIndicator)

      expect(consoleLogSpy).toHaveBeenCalledWith('Form data saved to localStorage')

      consoleLogSpy.mockRestore()
    })

    it('should save complex form data', () => {
      const formData: Partial<CreatePlanFormData> = {
        name: 'Enterprise Plan',
        monthly_price: '199.99',
        feature_ids: [1, 2, 3],
        addon_assignments: [
          { addon_id: 5, default_quantity: 2, is_included: true, feature_level: 'basic', min_quantity: 1, max_quantity: 10 }
        ],
        volume_discounts: [
          { name: 'Volume 1', min_branches: '5', max_branches: '10', discount_percentage: '10' }
        ]
      }

      saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData as CreatePlanFormData, mockSetShowSavedIndicator)

      const saved = localStorage.getItem(STORAGE_KEYS.DRAFT_PLAN_DATA)
      expect(JSON.parse(saved!)).toEqual(formData)
    })
  })

  describe('clearStorageData', () => {
    it('should remove all storage keys', () => {
      /* Set all storage keys */
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, '{}')
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, PLAN_FORM_TAB.BASIC)

      clearStorageData()

      /* Verify all keys are removed */
      expect(localStorage.getItem(STORAGE_KEYS.DRAFT_PLAN_DATA)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB)).toBeNull()
    })

    it('should handle empty storage', () => {
      expect(() => clearStorageData()).not.toThrow()
    })

    it('should log cleanup success', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      clearStorageData()

      expect(consoleLogSpy).toHaveBeenCalledWith('All form storage data cleared')

      consoleLogSpy.mockRestore()
    })

    it('should handle storage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      clearStorageData()

      expect(consoleWarnSpy).toHaveBeenCalledWith('Storage cleanup failed:', expect.any(Error))

      consoleWarnSpy.mockRestore()
      removeItemSpy.mockRestore()
    })

    it('should not affect other localStorage keys', () => {
      /* Set plan storage keys and other keys */
      localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, '{}')
      localStorage.setItem('other-key', 'other-value')

      clearStorageData()

      /* Plan keys should be removed */
      expect(localStorage.getItem(STORAGE_KEYS.DRAFT_PLAN_DATA)).toBeNull()
      /* Other keys should remain */
      expect(localStorage.getItem('other-key')).toBe('other-value')
    })
  })

  describe('Integration Tests', () => {
    const mockSetValue = vi.fn()
    const mockSetActiveTab = vi.fn()
    const mockSetShowSavedIndicator = vi.fn()

    beforeEach(() => {
      mockSetValue.mockClear()
      mockSetActiveTab.mockClear()
      mockSetShowSavedIndicator.mockClear()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should save and load form data correctly', () => {
      const formData: Partial<CreatePlanFormData> = {
        name: 'Test Plan',
        description: 'Test Description',
        monthly_price: '99.99'
      }

      /* Save data */
      saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData as CreatePlanFormData, mockSetShowSavedIndicator)

      /* Verify data exists */
      expect(hasStorageData(PLAN_FORM_MODES.CREATE)).toBe(true)

      /* Load data */
      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)

      /* Verify data was loaded */
      expect(mockSetValue).toHaveBeenCalledWith('name', 'Test Plan')
      expect(mockSetValue).toHaveBeenCalledWith('description', 'Test Description')
      expect(mockSetValue).toHaveBeenCalledWith('monthly_price', '99.99')
    })

    it('should clear all saved data', () => {
      const formData: CreatePlanFormData = {} as CreatePlanFormData

      /* Save data */
      saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData, mockSetShowSavedIndicator)
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, PLAN_FORM_TAB.PRICING)

      /* Verify data exists */
      expect(hasStorageData(PLAN_FORM_MODES.CREATE)).toBe(true)

      /* Clear data */
      clearStorageData()

      /* Verify data is cleared */
      expect(hasStorageData(PLAN_FORM_MODES.CREATE)).toBe(false)
    })

    it('should handle save, load, and clear cycle', () => {
      const formData: Partial<CreatePlanFormData> = {
        name: 'Cycle Test Plan'
      }

      /* Initial state - no data */
      expect(hasStorageData(PLAN_FORM_MODES.CREATE)).toBe(false)

      /* Save data */
      saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData as CreatePlanFormData, mockSetShowSavedIndicator)
      expect(hasStorageData(PLAN_FORM_MODES.CREATE)).toBe(true)

      /* Load data */
      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)
      expect(mockSetValue).toHaveBeenCalledWith('name', 'Cycle Test Plan')

      /* Clear data */
      clearStorageData()
      expect(hasStorageData(PLAN_FORM_MODES.CREATE)).toBe(false)

      /* Try to load - should not call setValue */
      mockSetValue.mockClear()
      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab)
      expect(mockSetValue).not.toHaveBeenCalled()
    })
  })
})
