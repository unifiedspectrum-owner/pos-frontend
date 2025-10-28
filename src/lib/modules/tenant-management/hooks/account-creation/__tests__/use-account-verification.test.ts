/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import { useOTPVerification, VerificationConfig } from '../use-account-verification'
import { onboardingService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui'
import { handleApiError } from '@shared/utils/api'

/* Mock the API services */
vi.mock('@tenant-management/api', () => ({
  onboardingService: {
    verifyOTP: vi.fn(),
    requestOTP: vi.fn()
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
  getCachedVerificationStatus: vi.fn(() => ({
    email_verified: false,
    phone_verified: false,
    email_verified_at: null,
    phone_verified_at: null
  })),
  StepTracker: {
    markStepCompleted: vi.fn()
  },
  clearOTPState: vi.fn()
}))

describe('useOTPVerification', () => {
  const emailConfig: VerificationConfig = {
    type: 'email_verification',
    stepType: 'EMAIL_VERIFICATION',
    verifyButtonText: 'Verify Email',
    resendDescriptionText: 'Email OTP has been resent',
    successMessage: 'Email',
    verificationKey: 'email_otp'
  }

  const phoneConfig: VerificationConfig = {
    type: 'phone_verification',
    stepType: 'PHONE_VERIFICATION',
    verifyButtonText: 'Verify Phone',
    resendDescriptionText: 'Phone OTP has been resent',
    successMessage: 'Phone',
    verificationKey: 'phone_otp'
  }

  const mockVerifyOTPResponse = {
    success: true,
    message: 'OTP verified successfully',
    timestamp: '2024-01-15T10:30:00Z',
    data: {
      tenant_id: 'tenant-001',
      verification_type: 'email' as const,
      verified: true,
      verified_at: '2024-01-15T10:30:00Z'
    }
  }

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

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useOTPVerification(emailConfig))

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isVerified).toBe(false)
      expect(result.current.resendTimer).toBe(0)
      expect(result.current.isResending).toBe(false)
      expect(typeof result.current.verifyOTP).toBe('function')
      expect(typeof result.current.resendOTP).toBe('function')
    })

    it('loads email verification status from localStorage', () => {
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, JSON.stringify({
        email_verified: true,
        phone_verified: false,
        email_verified_at: '2024-01-15T10:00:00Z',
        phone_verified_at: null
      }))

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      expect(result.current.isVerified).toBe(true)
    })

    it('loads phone verification status from localStorage', () => {
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, JSON.stringify({
        email_verified: false,
        phone_verified: true,
        email_verified_at: null,
        phone_verified_at: '2024-01-15T10:00:00Z'
      }))

      const { result } = renderHook(() => useOTPVerification(phoneConfig))

      expect(result.current.isVerified).toBe(true)
    })

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, 'invalid json {')

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      expect(result.current.isVerified).toBe(false)
      expect(console.log).toHaveBeenCalledWith('Error loading verification status:', expect.any(Error))
    })
  })

  describe('validateOTP', () => {
    it('rejects empty OTP', async () => {
      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('')
      })

      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'OTP Required',
        description: 'Please enter the OTP code to verify.',
        type: 'error'
      })
      expect(onboardingService.verifyOTP).not.toHaveBeenCalled()
    })

    it('rejects OTP with less than 6 digits', async () => {
      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('12345')
      })

      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Invalid OTP',
        description: 'Please enter a complete 6-digit OTP code.',
        type: 'error'
      })
      expect(onboardingService.verifyOTP).not.toHaveBeenCalled()
    })

    it('rejects OTP with more than 6 digits', async () => {
      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('1234567')
      })

      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Invalid OTP',
        description: 'Please enter a complete 6-digit OTP code.',
        type: 'error'
      })
      expect(onboardingService.verifyOTP).not.toHaveBeenCalled()
    })

    it('rejects non-numeric OTP', async () => {
      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('abcdef')
      })

      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Invalid OTP',
        description: 'Please enter a valid numeric OTP code.',
        type: 'error'
      })
      expect(onboardingService.verifyOTP).not.toHaveBeenCalled()
    })

    it('accepts valid 6-digit OTP', async () => {
      vi.mocked(onboardingService.verifyOTP).mockResolvedValue(mockVerifyOTPResponse)

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('123456')
      })

      expect(onboardingService.verifyOTP).toHaveBeenCalledWith({
        otp_type: 'email_verification',
        otp_code: 123456
      })
    })
  })

  describe('verifyOTP Operation', () => {
    it('successfully verifies email OTP', async () => {
      vi.mocked(onboardingService.verifyOTP).mockResolvedValue(mockVerifyOTPResponse)

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('123456')
      })

      expect(result.current.isVerified).toBe(true)
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Email Verification Successful',
        description: 'Email has been verified successfully.'
      })
    })

    it('successfully verifies phone OTP', async () => {
      vi.mocked(onboardingService.verifyOTP).mockResolvedValue(mockVerifyOTPResponse)

      const { result } = renderHook(() => useOTPVerification(phoneConfig))

      await act(async () => {
        await result.current.verifyOTP('654321')
      })

      expect(result.current.isVerified).toBe(true)
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'Phone Verification Successful',
        description: 'Phone has been verified successfully.'
      })
    })

    it('sets loading state during verification', async () => {
      vi.mocked(onboardingService.verifyOTP).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockVerifyOTPResponse), 100))
      )

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      act(() => {
        result.current.verifyOTP('123456')
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('updates localStorage after successful verification', async () => {
      vi.mocked(onboardingService.verifyOTP).mockResolvedValue(mockVerifyOTPResponse)

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('123456')
      })

      const verificationData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA)
      expect(verificationData).not.toBeNull()

      const parsed = JSON.parse(verificationData!)
      expect(parsed.email_verified).toBe(true)
      expect(parsed.email_verified_at).toBe('2024-01-15T10:30:00Z')
    })

    it('handles API errors during verification', async () => {
      const error = new Error('Verification failed')
      vi.mocked(onboardingService.verifyOTP).mockRejectedValue(error)

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('123456')
      })

      expect(result.current.isVerified).toBe(false)
      expect(handleApiError).toHaveBeenCalled()
    })

    it('handles unsuccessful verification response', async () => {
      vi.mocked(onboardingService.verifyOTP).mockResolvedValue({
        ...mockVerifyOTPResponse,
        data: {
          tenant_id: 'tenant-001',
          verification_type: 'email' as const,
          verified: false,
          verified_at: '2024-01-15T10:30:00Z'
        }
      })

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('123456')
      })

      expect(result.current.isVerified).toBe(false)
    })
  })

  describe('resendOTP Operation', () => {
    it('successfully resends email OTP', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.resendOTP('test@example.com')
      })

      expect(onboardingService.requestOTP).toHaveBeenCalledWith({
        otp_type: 'email_verification',
        email: 'test@example.com'
      })
      expect(result.current.resendTimer).toBe(300)
      expect(createToastNotification).toHaveBeenCalledWith({
        title: 'OTP Sent Successfully',
        description: 'Email OTP has been resent'
      })
    })

    it('successfully resends phone OTP', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPVerification(phoneConfig))

      await act(async () => {
        await result.current.resendOTP(undefined, '+1-5551234567')
      })

      expect(onboardingService.requestOTP).toHaveBeenCalledWith({
        otp_type: 'phone_verification',
        phone: '+1-5551234567'
      })
    })

    it('prevents resend when timer is active', async () => {
      vi.mocked(onboardingService.requestOTP).mockResolvedValue(mockRequestOTPResponse)

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.resendOTP('test@example.com')
      })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.resendOTP('test@example.com')
      })

      expect(onboardingService.requestOTP).not.toHaveBeenCalled()
    })

    it('prevents resend when already resending', async () => {
      vi.mocked(onboardingService.requestOTP).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRequestOTPResponse), 100))
      )

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      act(() => {
        result.current.resendOTP('test@example.com')
      })

      expect(result.current.isResending).toBe(true)

      await act(async () => {
        await result.current.resendOTP('test@example.com')
      })

      expect(onboardingService.requestOTP).toHaveBeenCalledTimes(1)
    })

    it('sets resending state during operation', async () => {
      vi.mocked(onboardingService.requestOTP).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRequestOTPResponse), 100))
      )

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      act(() => {
        result.current.resendOTP('test@example.com')
      })

      expect(result.current.isResending).toBe(true)

      await waitFor(() => {
        expect(result.current.isResending).toBe(false)
      })
    })

    it('handles API errors during resend', async () => {
      const error = new Error('Resend failed')
      vi.mocked(onboardingService.requestOTP).mockRejectedValue(error)

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.resendOTP('test@example.com')
      })

      expect(handleApiError).toHaveBeenCalled()
      expect(result.current.resendTimer).toBe(0)
    })
  })

  describe('Setter Functions', () => {
    it('allows manual verification state update', () => {
      const { result } = renderHook(() => useOTPVerification(emailConfig))

      act(() => {
        result.current.setIsVerified(true)
      })

      expect(result.current.isVerified).toBe(true)
    })

    it('allows manual timer update', () => {
      const { result } = renderHook(() => useOTPVerification(emailConfig))

      act(() => {
        result.current.setResendTimer(120)
      })

      expect(result.current.resendTimer).toBe(120)
    })
  })

  describe('Cross-verification Scenarios', () => {
    it('clears OTP state when both email and phone are verified', async () => {
      const { clearOTPState, getCachedVerificationStatus } = await import('@tenant-management/utils')

      /* Mock getCachedVerificationStatus to return phone as already verified */
      const getCachedMock = vi.mocked(getCachedVerificationStatus)
      getCachedMock.mockReturnValue({
        email_verified: false,
        phone_verified: true,
        email_verified_at: null,
        phone_verified_at: '2024-01-15T10:00:00Z'
      })

      const clearOTPStateMock = vi.mocked(clearOTPState)

      vi.mocked(onboardingService.verifyOTP).mockResolvedValue(mockVerifyOTPResponse)

      /* Set up localStorage with phone already verified */
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, JSON.stringify({
        email_verified: false,
        phone_verified: true,
        email_verified_at: null,
        phone_verified_at: '2024-01-15T10:00:00Z'
      }))

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('123456')
      })

      expect(clearOTPStateMock).toHaveBeenCalled()
    })

    it('does not clear OTP state when only one verification is complete', async () => {
      const { clearOTPState } = await import('@tenant-management/utils')
      const clearOTPStateMock = vi.mocked(clearOTPState)

      vi.mocked(onboardingService.verifyOTP).mockResolvedValue(mockVerifyOTPResponse)

      const { result } = renderHook(() => useOTPVerification(emailConfig))

      await act(async () => {
        await result.current.verifyOTP('123456')
      })

      expect(clearOTPStateMock).not.toHaveBeenCalled()
    })
  })
})
