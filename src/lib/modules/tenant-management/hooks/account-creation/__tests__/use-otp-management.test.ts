/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import { useOTPManagement } from '../use-otp-management'
import { onboardingService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui'
import { handleApiError } from '@shared/utils/api'

/* Mock the API services */
vi.mock('@tenant-management/api', () => ({
  onboardingService: {
    requestOTP: vi.fn(),
    verifyOTP: vi.fn()
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

/* Mock shared hooks */
vi.mock('@shared/hooks/use-countdown-timer', () => ({
  useCountdownTimer: vi.fn()
}))

/* Mock tenant utils */
vi.mock('@tenant-management/utils', () => ({
  getCachedVerificationStatus: vi.fn(() => ({
    email_verified: false,
    phone_verified: false,
    email_verified_at: null,
    phone_verified_at: null
  })),
  StepTracker: {
    markStepCompleted: vi.fn()
  },
  clearOTPState: vi.fn(),
  cleanupAccountCreationStorage: vi.fn()
}))

describe('useOTPManagement', () => {
  const mockRequestOTPResponse = {
    success: true,
    message: 'OTP sent successfully',
    timestamp: '2024-01-15T10:30:00Z',
    data: {
      contact: 'test@example.com',
      verification_type: 'email_verification' as const,
      otp_code: 123456
    }
  }

  const mockTrigger = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockTrigger.mockResolvedValue(true)
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useOTPManagement())

      expect(result.current.isSendingEmailOTP).toBe(false)
      expect(result.current.emailOTPSent).toBe(false)
      expect(result.current.isSendingPhoneOTP).toBe(false)
      expect(result.current.phoneOTPSent).toBe(false)
      expect(result.current.emailVerification).toBeDefined()
      expect(result.current.phoneVerification).toBeDefined()
    })

    it('accepts options with callbacks', () => {
      const { result } = renderHook(() => useOTPManagement({ onSuccess: mockOnSuccess, trigger: mockTrigger }))

      expect(result.current.emailVerification).toBeDefined()
      expect(result.current.phoneVerification).toBeDefined()
    })

    it('loads OTP states from localStorage on mount', () => {
      const otpState = {
        emailOTPSent: true,
        phoneOTPSent: false,
        emailResendTimer: 120,
        phoneResendTimer: 0,
        lastUpdated: new Date(Date.now() - 10000).toISOString()
      }

      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE, JSON.stringify(otpState))

      const { result } = renderHook(() => useOTPManagement())

      expect(result.current.emailOTPSent).toBe(true)
      expect(result.current.phoneOTPSent).toBe(false)
    })

    it('handles expired OTP states from localStorage', () => {
      const otpState = {
        emailOTPSent: true,
        phoneOTPSent: false,
        emailResendTimer: 120,
        phoneResendTimer: 0,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }

      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE, JSON.stringify(otpState))

      const { result } = renderHook(() => useOTPManagement())

      expect(result.current.emailOTPSent).toBe(false)
      expect(result.current.phoneOTPSent).toBe(false)
    })

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE, 'invalid json {')

      const { result } = renderHook(() => useOTPManagement())

      expect(result.current.emailOTPSent).toBe(false)
      expect(result.current.phoneOTPSent).toBe(false)
      expect(console.log).toHaveBeenCalledWith('Error loading OTP states:', expect.any(Error))
    })
  })

  describe('handleSendEmailOTP Operation', () => {
    it('successfully sends email OTP', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendEmailOTP('test@example.com')
      })

      expect(onboardingService.requestOTP).toHaveBeenCalledWith({
        otp_type: 'email_verification',
        email: 'test@example.com'
      })
      expect(result.current.emailOTPSent).toBe(true)
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'OTP Sent',
        description: 'Email OTP has been sent to your email address.'
      })
    })

    it('validates email field when trigger is provided', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement({ trigger: mockTrigger }))

      await act(async () => {
        await result.current.handleSendEmailOTP('test@example.com')
      })

      expect(mockTrigger).toHaveBeenCalledWith('primary_email')
    })

    it('does not send OTP when validation fails', async () => {
      mockTrigger.mockResolvedValue(false)

      const { result } = renderHook(() => useOTPManagement({ trigger: mockTrigger }))

      await act(async () => {
        await result.current.handleSendEmailOTP('invalid-email')
      })

      expect(onboardingService.requestOTP).not.toHaveBeenCalled()
    })

    it('calls onSuccess callback before sending OTP', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement({ onSuccess: mockOnSuccess }))

      await act(async () => {
        await result.current.handleSendEmailOTP('test@example.com')
      })

      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('sets loading state during operation', async () => {
      vi.mocked(onboardingService.requestOTP).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRequestOTPResponse), 100))
      )

      const { result } = renderHook(() => useOTPManagement())

      act(() => {
        result.current.handleSendEmailOTP('test@example.com')
      })

      expect(result.current.isSendingEmailOTP).toBe(true)

      await waitFor(() => {
        expect(result.current.isSendingEmailOTP).toBe(false)
      })
    })

    it('prevents sending when timer is active', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendEmailOTP('test@example.com')
      })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.handleSendEmailOTP('test@example.com')
      })

      expect(onboardingService.requestOTP).not.toHaveBeenCalled()
    })

    it('prevents sending when already sending', async () => {
      vi.mocked(onboardingService.requestOTP).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRequestOTPResponse), 100))
      )

      const { result } = renderHook(() => useOTPManagement())

      act(() => {
        result.current.handleSendEmailOTP('test@example.com')
      })

      await act(async () => {
        await result.current.handleSendEmailOTP('test@example.com')
      })

      expect(onboardingService.requestOTP).toHaveBeenCalledTimes(1)
    })

    it('saves OTP state to localStorage after sending', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendEmailOTP('test@example.com')
      })

      await waitFor(() => {
        const otpState = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE)
        expect(otpState).not.toBeNull()
      })

      const otpState = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE)
      const parsed = JSON.parse(otpState!)
      expect(parsed.emailOTPSent).toBe(true)
      expect(parsed.emailResendTimer).toBe(300)
    })

    it('handles API errors', async () => {
      const { cleanupAccountCreationStorage } = await import('@tenant-management/utils')
      const error = new Error('Failed to send OTP')
      vi.mocked(onboardingService.requestOTP).mockRejectedValue(error)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendEmailOTP('test@example.com')
      })

      expect(result.current.emailOTPSent).toBe(false)
      expect(handleApiError).toHaveBeenCalled()
      expect(cleanupAccountCreationStorage).toHaveBeenCalled()
    })
  })

  describe('handleSendPhoneOTP Operation', () => {
    it('successfully sends phone OTP', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendPhoneOTP(['+1', '5551234567'])
      })

      expect(onboardingService.requestOTP).toHaveBeenCalledWith({
        otp_type: 'phone_verification',
        phone: '+1-5551234567'
      })
      expect(result.current.phoneOTPSent).toBe(true)
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'OTP Sent',
        description: 'Phone OTP has been sent to your phone number.'
      })
    })

    it('validates phone field when trigger is provided', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement({ trigger: mockTrigger }))

      await act(async () => {
        await result.current.handleSendPhoneOTP(['+1', '5551234567'])
      })

      expect(mockTrigger).toHaveBeenCalledWith('primary_phone')
    })

    it('does not send OTP when validation fails', async () => {
      mockTrigger.mockResolvedValue(false)

      const { result } = renderHook(() => useOTPManagement({ trigger: mockTrigger }))

      await act(async () => {
        await result.current.handleSendPhoneOTP(['+1', '5551234567'])
      })

      expect(onboardingService.requestOTP).not.toHaveBeenCalled()
    })

    it('sets loading state during operation', async () => {
      vi.mocked(onboardingService.requestOTP).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRequestOTPResponse), 100))
      )

      const { result } = renderHook(() => useOTPManagement())

      act(() => {
        result.current.handleSendPhoneOTP(['+1', '5551234567'])
      })

      expect(result.current.isSendingPhoneOTP).toBe(true)

      await waitFor(() => {
        expect(result.current.isSendingPhoneOTP).toBe(false)
      })
    })

    it('prevents sending when timer is active', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendPhoneOTP(['+1', '5551234567'])
      })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.handleSendPhoneOTP(['+1', '5551234567'])
      })

      expect(onboardingService.requestOTP).not.toHaveBeenCalled()
    })

    it('saves OTP state to localStorage after sending', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendPhoneOTP(['+1', '5551234567'])
      })

      await waitFor(() => {
        const otpState = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE)
        expect(otpState).not.toBeNull()
      })

      const otpState = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE)
      const parsed = JSON.parse(otpState!)
      expect(parsed.phoneOTPSent).toBe(true)
      expect(parsed.phoneResendTimer).toBe(300)
    })

    it('handles API errors', async () => {
      const { cleanupAccountCreationStorage } = await import('@tenant-management/utils')
      const error = new Error('Failed to send OTP')
      vi.mocked(onboardingService.requestOTP).mockRejectedValue(error)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendPhoneOTP(['+1', '5551234567'])
      })

      expect(result.current.phoneOTPSent).toBe(false)
      expect(handleApiError).toHaveBeenCalled()
      expect(cleanupAccountCreationStorage).toHaveBeenCalled()
    })
  })

  describe('Timer Restoration', () => {
    it('calculates remaining time correctly when restoring state', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      const otpState = {
        emailOTPSent: true,
        phoneOTPSent: true,
        emailResendTimer: 300,
        phoneResendTimer: 300,
        lastUpdated: new Date(fiveMinutesAgo).toISOString()
      }

      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE, JSON.stringify(otpState))

      const { result } = renderHook(() => useOTPManagement())

      /* Timers should be 0 since 5 minutes have passed (300 seconds) */
      expect(result.current.emailVerification.resendTimer).toBe(0)
      expect(result.current.phoneVerification.resendTimer).toBe(0)
    })

    it('restores partial timer correctly', () => {
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000
      const otpState = {
        emailOTPSent: true,
        phoneOTPSent: false,
        emailResendTimer: 300,
        phoneResendTimer: 0,
        lastUpdated: new Date(twoMinutesAgo).toISOString()
      }

      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE, JSON.stringify(otpState))

      const { result } = renderHook(() => useOTPManagement())

      /* Email timer should have 180 seconds remaining (300 - 120) */
      expect(result.current.emailVerification.resendTimer).toBeGreaterThan(0)
      expect(result.current.emailVerification.resendTimer).toBeLessThanOrEqual(180)
    })
  })

  describe('Verification Hooks Integration', () => {
    it('provides access to email verification methods', () => {
      const { result } = renderHook(() => useOTPManagement())

      expect(result.current.emailVerification.verifyOTP).toBeDefined()
      expect(result.current.emailVerification.resendOTP).toBeDefined()
      expect(result.current.emailVerification.isLoading).toBe(false)
      expect(result.current.emailVerification.isVerified).toBe(false)
    })

    it('provides access to phone verification methods', () => {
      const { result } = renderHook(() => useOTPManagement())

      expect(result.current.phoneVerification.verifyOTP).toBeDefined()
      expect(result.current.phoneVerification.resendOTP).toBeDefined()
      expect(result.current.phoneVerification.isLoading).toBe(false)
      expect(result.current.phoneVerification.isVerified).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('sends OTP even with empty email when trigger not provided', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendEmailOTP('')
      })

      /* Without trigger, the hook doesn't validate and sends request */
      expect(onboardingService.requestOTP).toHaveBeenCalledWith({
        otp_type: 'email_verification',
        email: ''
      })
    })

    it('sends OTP even with empty phone when trigger not provided', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await result.current.handleSendPhoneOTP(['', ''] as [string, string])
      })

      /* Without trigger, the hook doesn't validate and sends request */
      expect(onboardingService.requestOTP).toHaveBeenCalledWith({
        otp_type: 'phone_verification',
        phone: '-'
      })
    })

    it('handles concurrent email and phone OTP sends', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPManagement())

      await act(async () => {
        await Promise.all([
          result.current.handleSendEmailOTP('test@example.com'),
          result.current.handleSendPhoneOTP(['+1', '5551234567'])
        ])
      })

      expect(result.current.emailOTPSent).toBe(true)
      expect(result.current.phoneOTPSent).toBe(true)
      expect(onboardingService.requestOTP).toHaveBeenCalledTimes(2)
    })
  })
})
