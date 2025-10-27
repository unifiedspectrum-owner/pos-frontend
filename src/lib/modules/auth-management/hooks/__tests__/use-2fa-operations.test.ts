/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY_ENABLED } from '@shared/config'
import { addMinutesToCurrentTime } from '@shared/utils/formatting'

/* Auth module imports */
import { useTwoFactorOperations } from '@auth-management/hooks/use-2fa-operations'
import { authManagementService } from '@auth-management/api'
import { AUTH_STORAGE_KEYS, SESSION_TIMEOUT } from '@auth-management/constants'
import { Generate2FAApiResponse, Enable2FAApiRequest, Enable2FAApiResponse, Disable2FAApiResponse, Verify2FAApiRequest, LoginApiResponse } from '@auth-management/types'

/* Mock dependencies */
vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/config')>()
  return {
    ...actual,
    LOADING_DELAY: 100,
    LOADING_DELAY_ENABLED: false
  }
})

vi.mock('@shared/utils/formatting', () => ({
  addMinutesToCurrentTime: vi.fn()
}))

vi.mock('@auth-management/api', () => ({
  authManagementService: {
    generate2FA: vi.fn(),
    enable2FA: vi.fn(),
    disable2FA: vi.fn(),
    verify2fa: vi.fn()
  }
}))

describe('useTwoFactorOperations Hook', () => {
  /* Mock window.dispatchEvent */
  const mockDispatchEvent = vi.fn()

  /* Mock functions */
  const mockGenerate2FA = authManagementService.generate2FA as ReturnType<typeof vi.fn>
  const mockEnable2FA = authManagementService.enable2FA as ReturnType<typeof vi.fn>
  const mockDisable2FA = authManagementService.disable2FA as ReturnType<typeof vi.fn>
  const mockVerify2FA = authManagementService.verify2fa as ReturnType<typeof vi.fn>
  const mockHandleApiError = handleApiError as ReturnType<typeof vi.fn>
  const mockCreateToast = createToastNotification as ReturnType<typeof vi.fn>
  const mockAddMinutes = addMinutesToCurrentTime as ReturnType<typeof vi.fn>

  /* Mock data */
  const mockQRCodeData = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg=='
  const mockBackupCodes = ['CODE1-1234', 'CODE2-5678', 'CODE3-9012']

  const mockGenerate2FAResponse: Generate2FAApiResponse = {
    success: true,
    message: '2FA generated successfully',
    data: {
      qr_code_url: mockQRCodeData,
      backup_codes: JSON.stringify(mockBackupCodes)
    },
    timestamp: new Date().toISOString()
  }

  const mockEnableRequest: Enable2FAApiRequest = {
    code: '123456'
  }

  const mockEnable2FAResponse: Enable2FAApiResponse = {
    success: true,
    message: '2FA enabled successfully',
    data: {
      user_id: 'user-123',
      enabled_at: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }

  const mockDisable2FAResponse: Disable2FAApiResponse = {
    success: true,
    message: '2FA disabled successfully',
    timestamp: new Date().toISOString()
  }

  const mockVerifyRequest: Verify2FAApiRequest = {
    user_id: 'user-123',
    type: 'totp',
    code: '123456'
  }

  const mockUserData = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    is_2fa_required: true
  }

  const mockVerify2FAResponse: LoginApiResponse = {
    success: true,
    message: '2FA verified successfully',
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: mockUserData,
      is_2fa_authenticated: true,
      requires_2fa: false
    },
    timestamp: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    /* Set up window.dispatchEvent spy that allows the event to fire */
    mockDispatchEvent.mockReturnValue(true)
    vi.spyOn(window, 'dispatchEvent').mockImplementation(mockDispatchEvent)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with default state values', () => {
      const { result } = renderHook(() => useTwoFactorOperations())

      expect(result.current.isGenerating2FA).toBe(false)
      expect(result.current.generate2FAError).toBe(null)
      expect(result.current.isEnabling2FA).toBe(false)
      expect(result.current.enable2FAError).toBe(null)
      expect(result.current.isDisabling2FA).toBe(false)
      expect(result.current.disable2FAError).toBe(null)
      expect(result.current.isVerifying2FA).toBe(false)
      expect(result.current.verify2FAError).toBe(null)
    })

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useTwoFactorOperations())

      expect(typeof result.current.generate2FA).toBe('function')
      expect(typeof result.current.enable2FA).toBe('function')
      expect(typeof result.current.disable2FA).toBe('function')
      expect(typeof result.current.verify2FA).toBe('function')
    })
  })

  describe('generate2FA Function', () => {
    it('should successfully generate 2FA data', async () => {
      mockGenerate2FA.mockResolvedValue(mockGenerate2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const data = await result.current.generate2FA()

      await waitFor(() => {
        expect(data).toEqual({
          qrCodeData: mockQRCodeData,
          backupCodes: mockBackupCodes
        })
        expect(result.current.isGenerating2FA).toBe(false)
        expect(result.current.generate2FAError).toBe(null)
        expect(mockGenerate2FA).toHaveBeenCalledOnce()
      })
    })

    it('should set loading state during generation', async () => {
      mockGenerate2FA.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockGenerate2FAResponse), 100)))

      const { result } = renderHook(() => useTwoFactorOperations())

      const promise = result.current.generate2FA()

      await waitFor(() => {
        expect(result.current.isGenerating2FA).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isGenerating2FA).toBe(false)
      })
    })

    it('should clear previous errors when starting new generation', async () => {
      mockGenerate2FA.mockResolvedValue({ success: false, message: 'Error', error: 'Failed', timestamp: new Date().toISOString() })

      const { result } = renderHook(() => useTwoFactorOperations())

      await result.current.generate2FA()

      await waitFor(() => {
        expect(result.current.generate2FAError).toBe('Failed')
      })

      mockGenerate2FA.mockResolvedValue(mockGenerate2FAResponse)
      await result.current.generate2FA()

      await waitFor(() => {
        expect(result.current.generate2FAError).toBe(null)
      })
    })

    it('should handle API success=false response', async () => {
      const errorResponse = {
        success: false,
        message: 'Generation failed',
        error: 'Invalid user session',
        timestamp: new Date().toISOString()
      }

      mockGenerate2FA.mockResolvedValue(errorResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const data = await result.current.generate2FA()

      await waitFor(() => {
        expect(data).toBe(null)
        expect(result.current.generate2FAError).toBe('Invalid user session')
        expect(mockCreateToast).toHaveBeenCalledWith({
          type: 'error',
          title: '2FA Generation Failed',
          description: 'Invalid user session'
        })
      })
    })

    it('should handle missing error message in API response', async () => {
      const errorResponse = {
        success: false,
        message: '',
        timestamp: new Date().toISOString()
      }

      mockGenerate2FA.mockResolvedValue(errorResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const data = await result.current.generate2FA()

      await waitFor(() => {
        expect(data).toBe(null)
        expect(result.current.generate2FAError).toBe('Failed to generate 2FA data')
      })
    })

    it('should handle missing backup codes', async () => {
      const responseWithoutCodes = {
        ...mockGenerate2FAResponse,
        data: {
          qr_code_url: mockQRCodeData,
          backup_codes: ''
        }
      }

      mockGenerate2FA.mockResolvedValue(responseWithoutCodes)

      const { result } = renderHook(() => useTwoFactorOperations())

      const data = await result.current.generate2FA()

      await waitFor(() => {
        expect(data).toEqual({
          qrCodeData: mockQRCodeData,
          backupCodes: []
        })
      })
    })

    it('should handle missing QR code URL', async () => {
      const responseWithoutQR = {
        ...mockGenerate2FAResponse,
        data: {
          qr_code_url: '',
          backup_codes: JSON.stringify(mockBackupCodes)
        }
      }

      mockGenerate2FA.mockResolvedValue(responseWithoutQR)

      const { result } = renderHook(() => useTwoFactorOperations())

      const data = await result.current.generate2FA()

      await waitFor(() => {
        expect(data).toEqual({
          qrCodeData: '',
          backupCodes: mockBackupCodes
        })
      })
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockGenerate2FA.mockRejectedValue(networkError)

      const { result } = renderHook(() => useTwoFactorOperations())

      const data = await result.current.generate2FA()

      await waitFor(() => {
        expect(data).toBe(null)
        expect(result.current.generate2FAError).toBe('Failed to generate 2FA data. Please try again.')
        expect(mockHandleApiError).toHaveBeenCalledWith(networkError, {
          title: '2FA Generation Failed'
        })
      })
    })
  })

  describe('enable2FA Function', () => {
    it('should successfully enable 2FA', async () => {
      mockEnable2FA.mockResolvedValue(mockEnable2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.enable2FA(mockEnableRequest)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isEnabling2FA).toBe(false)
        expect(result.current.enable2FAError).toBe(null)
        expect(mockEnable2FA).toHaveBeenCalledWith(mockEnableRequest)
        expect(mockCreateToast).toHaveBeenCalledWith({
          type: 'success',
          title: '2FA Enabled Successfully',
          description: 'Two-factor authentication has been enabled for your account.'
        })
      })
    })

    it('should set loading state during enabling', async () => {
      mockEnable2FA.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockEnable2FAResponse), 100)))

      const { result } = renderHook(() => useTwoFactorOperations())

      const promise = result.current.enable2FA(mockEnableRequest)

      await waitFor(() => {
        expect(result.current.isEnabling2FA).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isEnabling2FA).toBe(false)
      })
    })

    it('should clear previous errors when starting new enable operation', async () => {
      mockEnable2FA.mockResolvedValue({ success: false, message: 'Error', error: 'Failed', timestamp: new Date().toISOString() })

      const { result } = renderHook(() => useTwoFactorOperations())

      await result.current.enable2FA(mockEnableRequest)

      await waitFor(() => {
        expect(result.current.enable2FAError).toBe('Failed')
      })

      mockEnable2FA.mockResolvedValue(mockEnable2FAResponse)
      await result.current.enable2FA(mockEnableRequest)

      await waitFor(() => {
        expect(result.current.enable2FAError).toBe(null)
      })
    })

    it('should handle API success=false response', async () => {
      const errorResponse = {
        success: false,
        message: 'Enable failed',
        error: 'Invalid TOTP code',
        timestamp: new Date().toISOString()
      }

      mockEnable2FA.mockResolvedValue(errorResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.enable2FA(mockEnableRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.enable2FAError).toBe('Invalid TOTP code')
        expect(mockCreateToast).toHaveBeenCalledWith({
          type: 'error',
          title: '2FA Enable Failed',
          description: 'Invalid TOTP code'
        })
      })
    })

    it('should handle missing error message in API response', async () => {
      const errorResponse = {
        success: false,
        message: '',
        timestamp: new Date().toISOString()
      }

      mockEnable2FA.mockResolvedValue(errorResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.enable2FA(mockEnableRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.enable2FAError).toBe('Failed to enable 2FA')
      })
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockEnable2FA.mockRejectedValue(networkError)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.enable2FA(mockEnableRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.enable2FAError).toBe('Failed to enable 2FA. Please try again.')
        expect(mockHandleApiError).toHaveBeenCalledWith(networkError, {
          title: '2FA Enable Failed'
        })
      })
    })
  })

  describe('disable2FA Function', () => {
    it('should successfully disable 2FA', async () => {
      mockDisable2FA.mockResolvedValue(mockDisable2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.disable2FA()

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isDisabling2FA).toBe(false)
        expect(result.current.disable2FAError).toBe(null)
        expect(mockDisable2FA).toHaveBeenCalledOnce()
        expect(mockCreateToast).toHaveBeenCalledWith({
          type: 'success',
          title: '2FA Disabled Successfully',
          description: 'Two-factor authentication has been disabled for your account.'
        })
      })
    })

    it('should set loading state during disabling', async () => {
      mockDisable2FA.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockDisable2FAResponse), 100)))

      const { result } = renderHook(() => useTwoFactorOperations())

      const promise = result.current.disable2FA()

      await waitFor(() => {
        expect(result.current.isDisabling2FA).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isDisabling2FA).toBe(false)
      })
    })

    it('should clear previous errors when starting new disable operation', async () => {
      mockDisable2FA.mockResolvedValue({ success: false, message: 'Error', error: 'Failed', timestamp: new Date().toISOString() })

      const { result } = renderHook(() => useTwoFactorOperations())

      await result.current.disable2FA()

      await waitFor(() => {
        expect(result.current.disable2FAError).toBe('Failed')
      })

      mockDisable2FA.mockResolvedValue(mockDisable2FAResponse)
      await result.current.disable2FA()

      await waitFor(() => {
        expect(result.current.disable2FAError).toBe(null)
      })
    })

    it('should handle API success=false response', async () => {
      const errorResponse = {
        success: false,
        message: 'Disable failed',
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      }

      mockDisable2FA.mockResolvedValue(errorResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.disable2FA()

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.disable2FAError).toBe('Authentication required')
        expect(mockCreateToast).toHaveBeenCalledWith({
          type: 'error',
          title: '2FA Disable Failed',
          description: 'Authentication required'
        })
      })
    })

    it('should handle missing error message in API response', async () => {
      const errorResponse = {
        success: false,
        message: '',
        timestamp: new Date().toISOString()
      }

      mockDisable2FA.mockResolvedValue(errorResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.disable2FA()

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.disable2FAError).toBe('Failed to disable 2FA')
      })
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockDisable2FA.mockRejectedValue(networkError)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.disable2FA()

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.disable2FAError).toBe('Failed to disable 2FA. Please try again.')
        expect(mockHandleApiError).toHaveBeenCalledWith(networkError, {
          title: '2FA Disable Failed'
        })
      })
    })
  })

  describe('verify2FA Function', () => {
    beforeEach(() => {
      mockAddMinutes.mockReturnValue(Date.now() + SESSION_TIMEOUT * 60000)
    })

    it('should successfully verify 2FA and complete login', async () => {
      mockVerify2FA.mockResolvedValue(mockVerify2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isVerifying2FA).toBe(false)
        expect(result.current.verify2FAError).toBe(null)
        expect(mockVerify2FA).toHaveBeenCalledWith(mockVerifyRequest)

        /* Verify token storage */
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBe('mock-access-token')
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)).toBe('mock-refresh-token')
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.USER)).toBe(JSON.stringify(mockUserData))
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.LOGGED_IN)).toBe('true')

        /* Verify pending 2FA data cleared */
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)).toBe(null)
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)).toBe(null)

        /* Verify auth state change event */
        expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event))

        /* Verify success toast */
        expect(mockCreateToast).toHaveBeenCalledWith({
          type: 'success',
          title: '2FA Verification Successful',
          description: 'Welcome, John Doe! You are now logged in.'
        })
      })
    })

    it('should set loading state during verification', async () => {
      mockVerify2FA.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockVerify2FAResponse), 100)))

      const { result } = renderHook(() => useTwoFactorOperations())

      const promise = result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(result.current.isVerifying2FA).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isVerifying2FA).toBe(false)
      })
    })

    it('should clear previous errors when starting new verification', async () => {
      mockVerify2FA.mockResolvedValue({ success: false, message: 'Error', error: 'Failed', timestamp: new Date().toISOString() })

      const { result } = renderHook(() => useTwoFactorOperations())

      await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(result.current.verify2FAError).toBe('Failed')
      })

      mockVerify2FA.mockResolvedValue(mockVerify2FAResponse)
      await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(result.current.verify2FAError).toBe(null)
      })
    })

    it('should clear pending 2FA data from localStorage', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID, 'user-123')
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL, 'john@example.com')

      mockVerify2FA.mockResolvedValue(mockVerify2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)).toBe(null)
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)).toBe(null)
      })
    })

    it('should set session expiry time', async () => {
      const mockExpiryTime = Date.now() + SESSION_TIMEOUT * 60000
      mockAddMinutes.mockReturnValue(mockExpiryTime)

      mockVerify2FA.mockResolvedValue(mockVerify2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(mockAddMinutes).toHaveBeenCalledWith(SESSION_TIMEOUT)
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME)).toBe(mockExpiryTime.toString())
      })
    })

    it('should handle incomplete verification response - missing accessToken', async () => {
      const incompleteResponse = {
        ...mockVerify2FAResponse,
        data: {
          ...mockVerify2FAResponse.data,
          accessToken: '',
          is_2fa_authenticated: true
        }
      }

      mockVerify2FA.mockResolvedValue(incompleteResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.verify2FAError).toBe('2FA verification incomplete - missing authentication tokens')
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBe(null)
      })
    })

    it('should handle incomplete verification response - missing refreshToken', async () => {
      const incompleteResponse = {
        ...mockVerify2FAResponse,
        data: {
          ...mockVerify2FAResponse.data,
          refreshToken: '',
          is_2fa_authenticated: true
        }
      }

      mockVerify2FA.mockResolvedValue(incompleteResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.verify2FAError).toBe('2FA verification incomplete - missing authentication tokens')
      })
    })

    it('should handle incomplete verification response - not authenticated', async () => {
      const incompleteResponse = {
        ...mockVerify2FAResponse,
        data: {
          ...mockVerify2FAResponse.data,
          is_2fa_authenticated: false
        }
      }

      mockVerify2FA.mockResolvedValue(incompleteResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.verify2FAError).toBe('2FA verification incomplete - missing authentication tokens')
      })
    })

    it('should handle API success=false response', async () => {
      const errorResponse = {
        success: false,
        message: 'Verification failed',
        error: 'Invalid TOTP code',
        timestamp: new Date().toISOString()
      }

      mockVerify2FA.mockResolvedValue(errorResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.verify2FAError).toBe('Invalid TOTP code')
        expect(mockCreateToast).toHaveBeenCalledWith({
          type: 'error',
          title: '2FA Verification Failed',
          description: 'Invalid TOTP code'
        })
      })
    })

    it('should handle missing error message in API response', async () => {
      const errorResponse = {
        success: false,
        message: '',
        timestamp: new Date().toISOString()
      }

      mockVerify2FA.mockResolvedValue(errorResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.verify2FAError).toBe('2FA verification failed')
      })
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockVerify2FA.mockRejectedValue(networkError)

      const { result } = renderHook(() => useTwoFactorOperations())

      const success = await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.verify2FAError).toBe('Failed to verify 2FA code. Please try again.')
        expect(mockHandleApiError).toHaveBeenCalledWith(networkError, {
          title: '2FA Verification Failed'
        })
      })
    })

    it('should dispatch authStateChanged event on successful verification', async () => {
      mockVerify2FA.mockResolvedValue(mockVerify2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        const dispatchedEvent = mockDispatchEvent.mock.calls[0][0]
        expect(dispatchedEvent.type).toBe('authStateChanged')
      })
    })
  })

  describe('State Management', () => {
    it('should maintain independent error states for each operation', async () => {
      mockGenerate2FA.mockResolvedValue({ success: false, message: 'Generate error', error: 'Gen failed' })
      mockEnable2FA.mockResolvedValue({ success: false, message: 'Enable error', error: 'Enable failed' })
      mockDisable2FA.mockResolvedValue({ success: false, message: 'Disable error', error: 'Disable failed' })
      mockVerify2FA.mockResolvedValue({ success: false, message: 'Verify error', error: 'Verify failed' })

      const { result } = renderHook(() => useTwoFactorOperations())

      await result.current.generate2FA()
      await result.current.enable2FA(mockEnableRequest)
      await result.current.disable2FA()
      await result.current.verify2FA(mockVerifyRequest)

      await waitFor(() => {
        expect(result.current.generate2FAError).toBe('Gen failed')
        expect(result.current.enable2FAError).toBe('Enable failed')
        expect(result.current.disable2FAError).toBe('Disable failed')
        expect(result.current.verify2FAError).toBe('Verify failed')
      })
    })

    it('should maintain independent loading states for each operation', async () => {
      mockGenerate2FA.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockGenerate2FAResponse), 200)))
      mockEnable2FA.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockEnable2FAResponse), 200)))
      mockDisable2FA.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockDisable2FAResponse), 200)))
      mockVerify2FA.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockVerify2FAResponse), 200)))

      const { result } = renderHook(() => useTwoFactorOperations())

      const promises = [
        result.current.generate2FA(),
        result.current.enable2FA(mockEnableRequest),
        result.current.disable2FA(),
        result.current.verify2FA(mockVerifyRequest)
      ]

      await waitFor(() => {
        expect(result.current.isGenerating2FA).toBe(true)
        expect(result.current.isEnabling2FA).toBe(true)
        expect(result.current.isDisabling2FA).toBe(true)
        expect(result.current.isVerifying2FA).toBe(true)
      })

      await Promise.all(promises)

      await waitFor(() => {
        expect(result.current.isGenerating2FA).toBe(false)
        expect(result.current.isEnabling2FA).toBe(false)
        expect(result.current.isDisabling2FA).toBe(false)
        expect(result.current.isVerifying2FA).toBe(false)
      })
    })
  })

  describe('Loading Delay Configuration', () => {
    it('should respect LOADING_DELAY_ENABLED configuration for generate2FA', async () => {
      mockGenerate2FA.mockResolvedValue(mockGenerate2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const startTime = Date.now()
      await result.current.generate2FA()
      const endTime = Date.now()

      /* LOADING_DELAY_ENABLED is mocked to false at module level, so operations should be fast */
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should respect LOADING_DELAY_ENABLED configuration for enable2FA', async () => {
      mockEnable2FA.mockResolvedValue(mockEnable2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const startTime = Date.now()
      await result.current.enable2FA(mockEnableRequest)
      const endTime = Date.now()

      /* LOADING_DELAY_ENABLED is mocked to false at module level, so operations should be fast */
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should respect LOADING_DELAY_ENABLED configuration for disable2FA', async () => {
      mockDisable2FA.mockResolvedValue(mockDisable2FAResponse)

      const { result } = renderHook(() => useTwoFactorOperations())

      const startTime = Date.now()
      await result.current.disable2FA()
      const endTime = Date.now()

      /* LOADING_DELAY_ENABLED is mocked to false at module level, so operations should be fast */
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})
