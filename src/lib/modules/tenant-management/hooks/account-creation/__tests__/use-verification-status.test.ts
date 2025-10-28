/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import { useVerificationStatus } from '../use-verification-status'
import { onboardingService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { TenantInfoFormData } from '@tenant-management/schemas/account'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui'
import { handleApiError } from '@shared/utils/api'

/* Mock the API services */
vi.mock('@tenant-management/api', () => ({
  onboardingService: {
    createTenantAccount: vi.fn()
  }
}))

/* Mock shared utils */
vi.mock('@shared/utils/ui', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils', () => ({
  getCurrentISOString: vi.fn(() => '2024-01-15T10:30:00Z')
}))

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  cleanupAccountCreationStorage: vi.fn(),
  getTenantId: vi.fn(() => 'tenant-001'),
  transformFormDataToApiPayload: vi.fn((formData, verificationStatus, tenantId) => ({
    company_name: 'Test Company',
    email_verified: verificationStatus.email_verified,
    phone_verified: verificationStatus.phone_verified,
    tenant_id: tenantId
  }))
}))

describe('useVerificationStatus', () => {
  const mockFormControl = {
    _formValues: {
      company_name: 'Test Company',
      contact_person: 'John Doe',
      primary_email: 'test@example.com',
      primary_phone: ['+1', '5551234567'],
      address_line1: '123 Main St',
      address_line2: null,
      city: 'New York',
      state_province: 'NY',
      postal_code: '10001',
      country: 'US'
    }
  } as any

  const mockApiResponse = {
    success: true,
    message: 'Account updated successfully',
    timestamp: '2024-01-15T10:30:00Z',
    data: {
      tenant_id: 'tenant-001',
      company_name: 'Test Company',
      status: 'active'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: false,
        phoneVerified: false
      }))

      expect(result.current.isUpdatingAccount).toBe(false)
      expect(typeof result.current.saveVerificationStatus).toBe('function')
      expect(typeof result.current.loadVerificationStatus).toBe('function')
      expect(typeof result.current.updateAccountWithVerification).toBe('function')
    })

    it('loads verification status from localStorage on mount', async () => {
      const verificationData = {
        email_verified: true,
        phone_verified: false,
        email_verified_at: '2024-01-15T10:00:00Z',
        phone_verified_at: null
      }
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, JSON.stringify(verificationData))

      /* Hook should be initialized with the same verification state as localStorage to avoid overwriting */
      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: false
      }))

      await waitFor(() => {
        expect(result.current.isRestoringFromAPI).toBe(false)
      })

      const status = result.current.loadVerificationStatus()
      expect(status.emailVerified).toBe(true)
      expect(status.phoneVerified).toBe(false)
    })

    it('sets isRestoringFromAPI to true initially then false after delay', async () => {
      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: false,
        phoneVerified: false
      }))

      expect(result.current.isRestoringFromAPI).toBe(true)

      await waitFor(() => {
        expect(result.current.isRestoringFromAPI).toBe(false)
      }, { timeout: 200 })
    })
  })

  describe('saveVerificationStatus', () => {
    it('saves verification status to localStorage', () => {
      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: false
      }))

      result.current.saveVerificationStatus()

      const saved = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA)
      expect(saved).not.toBeNull()

      const parsed = JSON.parse(saved!)
      expect(parsed.email_verified).toBe(true)
      expect(parsed.phone_verified).toBe(false)
      expect(parsed.email_verified_at).toBe('2024-01-15T10:30:00Z')
      expect(parsed.phone_verified_at).toBeNull()
    })

    it('saves both email and phone verification status', () => {
      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: true
      }))

      result.current.saveVerificationStatus()

      const saved = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA)
      const parsed = JSON.parse(saved!)

      expect(parsed.email_verified).toBe(true)
      expect(parsed.phone_verified).toBe(true)
      expect(parsed.email_verified_at).toBe('2024-01-15T10:30:00Z')
      expect(parsed.phone_verified_at).toBe('2024-01-15T10:30:00Z')
    })
  })

  describe('loadVerificationStatus', () => {
    it('loads verification status from localStorage', () => {
      const verificationData = {
        email_verified: true,
        phone_verified: true,
        email_verified_at: '2024-01-15T10:00:00Z',
        phone_verified_at: '2024-01-15T10:05:00Z'
      }
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, JSON.stringify(verificationData))

      /* Hook should be initialized with the same verification state as localStorage to avoid overwriting */
      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: true
      }))

      const status = result.current.loadVerificationStatus()

      expect(status.emailVerified).toBe(true)
      expect(status.phoneVerified).toBe(true)
    })

    it('returns default values when no data exists', () => {
      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: false,
        phoneVerified: false
      }))

      const status = result.current.loadVerificationStatus()

      expect(status.emailVerified).toBe(false)
      expect(status.phoneVerified).toBe(false)
    })

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, 'invalid json {')

      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: false,
        phoneVerified: false
      }))

      const status = result.current.loadVerificationStatus()

      expect(status.emailVerified).toBe(false)
      expect(status.phoneVerified).toBe(false)
      expect(console.log).toHaveBeenCalledWith('Error loading verification status', expect.any(Error))
    })
  })

  describe('updateAccountWithVerification', () => {
    it('successfully updates account with verification status', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: false
      }))

      await waitFor(() => {
        expect(result.current.isRestoringFromAPI).toBe(false)
      })

      await act(async () => {
        await result.current.updateAccountWithVerification()
      })

      expect(onboardingService.createTenantAccount).toHaveBeenCalled()
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Account updated successfully',
        description: 'Your account has been updated with the latest verification status.'
      })
    })

    it('stores tenant ID from API response', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockResolvedValue(mockApiResponse)

      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: false
      }))

      await waitFor(() => {
        expect(result.current.isRestoringFromAPI).toBe(false)
      })

      await act(async () => {
        await result.current.updateAccountWithVerification()
      })

      const tenantId = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)
      expect(tenantId).toBe('tenant-001')
    })

    it('sets loading state during operation', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockApiResponse), 100))
      )

      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: false
      }))

      await waitFor(() => {
        expect(result.current.isRestoringFromAPI).toBe(false)
      })

      act(() => {
        result.current.updateAccountWithVerification()
      })

      expect(result.current.isUpdatingAccount).toBe(true)

      await waitFor(() => {
        expect(result.current.isUpdatingAccount).toBe(false)
      })
    })

    it('prevents multiple simultaneous calls', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockApiResponse), 100))
      )

      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: false
      }))

      await waitFor(() => {
        expect(result.current.isRestoringFromAPI).toBe(false)
      })

      act(() => {
        result.current.updateAccountWithVerification()
      })

      await act(async () => {
        await result.current.updateAccountWithVerification()
      })

      expect(onboardingService.createTenantAccount).toHaveBeenCalledTimes(1)
    })

    it('handles API errors', async () => {
      const { cleanupAccountCreationStorage } = await import('@tenant-management/utils')
      const error = new Error('API Error')
      vi.mocked(onboardingService.createTenantAccount).mockRejectedValue(error)

      const { result } = renderHook(() => useVerificationStatus({
        control: mockFormControl,
        emailVerified: true,
        phoneVerified: false
      }))

      await waitFor(() => {
        expect(result.current.isRestoringFromAPI).toBe(false)
      })

      await act(async () => {
        await result.current.updateAccountWithVerification()
      })

      expect(handleApiError).toHaveBeenCalled()
      expect(cleanupAccountCreationStorage).toHaveBeenCalled()
      expect(result.current.isUpdatingAccount).toBe(false)
    })
  })

  describe('Auto-save Verification Status', () => {
    it('auto-saves verification status on change', async () => {
      const { rerender } = renderHook(
        ({ emailVerified, phoneVerified }) => useVerificationStatus({
          control: mockFormControl,
          emailVerified,
          phoneVerified
        }),
        {
          initialProps: { emailVerified: false, phoneVerified: false }
        }
      )

      rerender({ emailVerified: true, phoneVerified: false })

      await waitFor(() => {
        const saved = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA)
        expect(saved).not.toBeNull()
        const parsed = JSON.parse(saved!)
        expect(parsed.email_verified).toBe(true)
      })
    })
  })

  describe('Auto-update Account on Verification Change', () => {
    it('auto-updates account when email is verified', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockResolvedValue(mockApiResponse)

      const { rerender } = renderHook(
        ({ emailVerified, phoneVerified }) => useVerificationStatus({
          control: mockFormControl,
          emailVerified,
          phoneVerified
        }),
        {
          initialProps: { emailVerified: false, phoneVerified: false }
        }
      )

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).not.toHaveBeenCalled()
      })

      rerender({ emailVerified: true, phoneVerified: false })

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('auto-updates account when phone is verified', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockResolvedValue(mockApiResponse)

      const { rerender } = renderHook(
        ({ emailVerified, phoneVerified }) => useVerificationStatus({
          control: mockFormControl,
          emailVerified,
          phoneVerified
        }),
        {
          initialProps: { emailVerified: false, phoneVerified: false }
        }
      )

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).not.toHaveBeenCalled()
      })

      rerender({ emailVerified: false, phoneVerified: true })

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('does not auto-update when verification state goes from true to false', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockResolvedValue(mockApiResponse)

      const { rerender } = renderHook(
        ({ emailVerified, phoneVerified }) => useVerificationStatus({
          control: mockFormControl,
          emailVerified,
          phoneVerified
        }),
        {
          initialProps: { emailVerified: true, phoneVerified: false }
        }
      )

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).not.toHaveBeenCalled()
      })

      vi.clearAllMocks()

      rerender({ emailVerified: false, phoneVerified: false })

      await new Promise(resolve => setTimeout(resolve, 700))

      expect(onboardingService.createTenantAccount).not.toHaveBeenCalled()
    })

    it('does not auto-update during restoration period', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockResolvedValue(mockApiResponse)

      const { rerender } = renderHook(
        ({ emailVerified, phoneVerified }) => useVerificationStatus({
          control: mockFormControl,
          emailVerified,
          phoneVerified
        }),
        {
          initialProps: { emailVerified: false, phoneVerified: false }
        }
      )

      /* Change state immediately */
      rerender({ emailVerified: true, phoneVerified: false })

      /* Wait less than restoration delay */
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(onboardingService.createTenantAccount).not.toHaveBeenCalled()
    })

    it('debounces auto-update calls', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockResolvedValue(mockApiResponse)

      const { rerender } = renderHook(
        ({ emailVerified, phoneVerified }) => useVerificationStatus({
          control: mockFormControl,
          emailVerified,
          phoneVerified
        }),
        {
          initialProps: { emailVerified: false, phoneVerified: false }
        }
      )

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).not.toHaveBeenCalled()
      })

      /* Rapid changes */
      rerender({ emailVerified: true, phoneVerified: false })
      await new Promise(resolve => setTimeout(resolve, 100))
      rerender({ emailVerified: true, phoneVerified: true })

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).toHaveBeenCalled()
      }, { timeout: 1000 })

      /* Should only be called once due to debouncing */
      expect(onboardingService.createTenantAccount).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles both verifications changing simultaneously', async () => {
      vi.mocked(onboardingService.createTenantAccount).mockResolvedValue(mockApiResponse)

      const { rerender } = renderHook(
        ({ emailVerified, phoneVerified }) => useVerificationStatus({
          control: mockFormControl,
          emailVerified,
          phoneVerified
        }),
        {
          initialProps: { emailVerified: false, phoneVerified: false }
        }
      )

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).not.toHaveBeenCalled()
      })

      rerender({ emailVerified: true, phoneVerified: true })

      await waitFor(() => {
        expect(onboardingService.createTenantAccount).toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('handles form control with undefined values', async () => {
      const controlWithUndefined = {
        _formValues: {}
      } as any

      const { result } = renderHook(() => useVerificationStatus({
        control: controlWithUndefined,
        emailVerified: true,
        phoneVerified: false
      }))

      await waitFor(() => {
        expect(result.current.isRestoringFromAPI).toBe(false)
      })

      await act(async () => {
        await result.current.updateAccountWithVerification()
      })

      expect(onboardingService.createTenantAccount).toHaveBeenCalled()
    })
  })
})
