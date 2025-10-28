/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Control } from 'react-hook-form'

/* Tenant module imports */
import { useFormPersistence } from '../use-form-persistence'
import { TenantInfoFormData } from '@tenant-management/schemas/account'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import * as tenantUtils from '@tenant-management/utils'

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  hasFormDataChanged: vi.fn(),
  transformFormDataToTenantCacheData: vi.fn()
}))

describe('useFormPersistence', () => {
  const mockFormData: TenantInfoFormData = {
    company_name: 'Acme Corp',
    contact_person: 'John Doe',
    primary_email: 'admin@acme.com',
    primary_phone: ['+1', '5551234567'],
    address_line1: '123 Main St',
    address_line2: null,
    city: 'New York',
    state_province: 'NY',
    postal_code: '10001',
    country: 'US'
  }

  const mockTransformedData = {
    organization_name: 'Acme Corp',
    email: 'admin@acme.com',
    primary_phone: '+1-5551234567',
    secondary_phone: null,
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country_code: 'US'
  }

  const mockControl = {
    _formValues: mockFormData
  } as unknown as Control<TenantInfoFormData>

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Hook Initialization', () => {
    it('provides all expected functions', () => {
      const { result } = renderHook(() => useFormPersistence(mockControl))

      expect(typeof result.current.saveCurrentFormData).toBe('function')
      expect(typeof result.current.loadFormData).toBe('function')
      expect(typeof result.current.clearFormData).toBe('function')
      expect(typeof result.current.checkFormDataChanged).toBe('function')
    })
  })

  describe('saveCurrentFormData', () => {
    it('saves transformed form data to localStorage', () => {
      vi.mocked(tenantUtils.transformFormDataToTenantCacheData).mockReturnValue(
        mockTransformedData as any
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      result.current.saveCurrentFormData()

      expect(tenantUtils.transformFormDataToTenantCacheData).toHaveBeenCalledWith(mockFormData)

      const stored = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(mockTransformedData)
    })

    it('handles empty form values', () => {
      const emptyControl = { _formValues: undefined } as unknown as Control<TenantInfoFormData>
      const { result } = renderHook(() => useFormPersistence(emptyControl))

      result.current.saveCurrentFormData()

      expect(tenantUtils.transformFormDataToTenantCacheData).not.toHaveBeenCalled()
      expect(localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)).toBeNull()
    })

    it('handles localStorage errors gracefully', () => {
      vi.mocked(tenantUtils.transformFormDataToTenantCacheData).mockReturnValue(
        mockTransformedData as any
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        throw new Error('QuotaExceededError')
      })

      result.current.saveCurrentFormData()

      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to save form data to localStorage:',
        expect.any(Error)
      )

      setItemSpy.mockRestore()
      warnSpy.mockRestore()
    })

    it('overwrites existing saved data', () => {
      vi.mocked(tenantUtils.transformFormDataToTenantCacheData).mockReturnValue(
        mockTransformedData as any
      )

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA,
        JSON.stringify({ old: 'data' })
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      result.current.saveCurrentFormData()

      const stored = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)
      expect(JSON.parse(stored!)).toEqual(mockTransformedData)
    })
  })

  describe('loadFormData', () => {
    it('loads form data from localStorage', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA,
        JSON.stringify(mockTransformedData)
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      const loaded = result.current.loadFormData()
      expect(loaded).toEqual(mockTransformedData)
    })

    it('returns null when no data exists', () => {
      const { result } = renderHook(() => useFormPersistence(mockControl))

      const loaded = result.current.loadFormData()
      expect(loaded).toBeNull()
    })

    it('handles invalid JSON gracefully', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA,
        'invalid json {'
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      const loaded = result.current.loadFormData()
      expect(loaded).toBeNull()
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to load form data from localStorage:',
        expect.any(Error)
      )

      warnSpy.mockRestore()
    })

    it('handles localStorage access errors', () => {
      const { result } = renderHook(() => useFormPersistence(mockControl))

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('SecurityError')
      })

      const loaded = result.current.loadFormData()
      expect(loaded).toBeNull()
      expect(warnSpy).toHaveBeenCalled()

      getItemSpy.mockRestore()
      warnSpy.mockRestore()
    })
  })

  describe('clearFormData', () => {
    it('removes form data from localStorage', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA,
        JSON.stringify(mockTransformedData)
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      result.current.clearFormData()

      expect(localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)).toBeNull()
    })

    it('handles case when no data exists', () => {
      const { result } = renderHook(() => useFormPersistence(mockControl))

      result.current.clearFormData()

      expect(localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)).toBeNull()
    })

    it('handles localStorage errors gracefully', () => {
      const { result } = renderHook(() => useFormPersistence(mockControl))

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementationOnce(() => {
        throw new Error('SecurityError')
      })

      result.current.clearFormData()

      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to clear form data from localStorage:',
        expect.any(Error)
      )

      removeItemSpy.mockRestore()
      warnSpy.mockRestore()
    })
  })

  describe('checkFormDataChanged', () => {
    it('returns true when form data has changed', () => {
      vi.mocked(tenantUtils.hasFormDataChanged).mockReturnValue(true)

      const { result } = renderHook(() => useFormPersistence(mockControl))

      const hasChanged = result.current.checkFormDataChanged()
      expect(hasChanged).toBe(true)
      expect(tenantUtils.hasFormDataChanged).toHaveBeenCalledWith(mockFormData)
    })

    it('returns false when form data has not changed', () => {
      vi.mocked(tenantUtils.hasFormDataChanged).mockReturnValue(false)

      const { result } = renderHook(() => useFormPersistence(mockControl))

      const hasChanged = result.current.checkFormDataChanged()
      expect(hasChanged).toBe(false)
    })

    it('returns true when form values are undefined', () => {
      const emptyControl = { _formValues: undefined } as unknown as Control<TenantInfoFormData>
      const { result } = renderHook(() => useFormPersistence(emptyControl))

      const hasChanged = result.current.checkFormDataChanged()
      expect(hasChanged).toBe(true)
      expect(tenantUtils.hasFormDataChanged).not.toHaveBeenCalled()
    })
  })

  describe('Callback Stability', () => {
    it('maintains stable function references', () => {
      const { result, rerender } = renderHook(() => useFormPersistence(mockControl))

      const {
        saveCurrentFormData: fn1,
        loadFormData: fn2,
        clearFormData: fn3,
        checkFormDataChanged: fn4
      } = result.current

      rerender()

      expect(result.current.saveCurrentFormData).toBe(fn1)
      expect(result.current.loadFormData).toBe(fn2)
      expect(result.current.clearFormData).toBe(fn3)
      expect(result.current.checkFormDataChanged).toBe(fn4)
    })
  })

  describe('Workflow Integration', () => {
    it('completes save-load cycle successfully', () => {
      vi.mocked(tenantUtils.transformFormDataToTenantCacheData).mockReturnValue(
        mockTransformedData as any
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      /* Save data */
      result.current.saveCurrentFormData()

      /* Load data */
      const loaded = result.current.loadFormData()
      expect(loaded).toEqual(mockTransformedData)
    })

    it('completes save-clear cycle successfully', () => {
      vi.mocked(tenantUtils.transformFormDataToTenantCacheData).mockReturnValue(
        mockTransformedData as any
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      /* Save data */
      result.current.saveCurrentFormData()
      expect(localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)).not.toBeNull()

      /* Clear data */
      result.current.clearFormData()
      expect(localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)).toBeNull()
    })

    it('handles multiple save operations', () => {
      vi.mocked(tenantUtils.transformFormDataToTenantCacheData).mockReturnValue(
        mockTransformedData as any
      )

      const { result } = renderHook(() => useFormPersistence(mockControl))

      result.current.saveCurrentFormData()
      result.current.saveCurrentFormData()
      result.current.saveCurrentFormData()

      const loaded = result.current.loadFormData()
      expect(loaded).toEqual(mockTransformedData)
    })
  })
})
