/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Auth management module imports */
import type { LoginApiRequest, LoginApiResponse, LogoutApiResponse, RefreshTokenApiRequest, RefreshTokenApiResponse, ForgotPasswordApiRequest, ForgotPasswordApiResponse, ResetPasswordApiRequest, ResetPasswordApiResponse, ValidateResetTokenApiResponse, Verify2FAApiRequest, Enable2FAApiResponse, Disable2FAApiResponse, Generate2FAApiResponse, Enable2FAApiRequest } from '@auth-management/types'
import { AUTH_API_ROUTES } from '@auth-management/constants'

/* Helper to create mock axios config */
const createMockAxiosConfig = (): InternalAxiosRequestConfig => ({
  headers: {} as AxiosRequestHeaders,
  url: '',
  method: 'get'
})

/* Mock axios instance */
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  }
}

/* Mock createApiClient to return our mock instance */
vi.mock('@shared/api/base-client', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance)
}))

/* Mock the client module to use our mock instance */
vi.mock('@auth-management/api/client', () => ({
  authApiClient: mockAxiosInstance
}))

describe('authManagementService', () => {
  let authManagementService: typeof import('@auth-management/api/services').authManagementService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@auth-management/api/services')
    authManagementService = module.authManagementService
  })

  beforeEach(() => {
    /* Clear HTTP method mocks */
    mockAxiosInstance.get.mockClear()
    mockAxiosInstance.post.mockClear()
    mockAxiosInstance.put.mockClear()
    mockAxiosInstance.delete.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('API Client Configuration', () => {
    it('should have authManagementService with all required methods', () => {
      expect(authManagementService).toBeDefined()
      expect(authManagementService.loginUser).toBeTypeOf('function')
      expect(authManagementService.verify2fa).toBeTypeOf('function')
      expect(authManagementService.refreshToken).toBeTypeOf('function')
      expect(authManagementService.generate2FA).toBeTypeOf('function')
      expect(authManagementService.enable2FA).toBeTypeOf('function')
      expect(authManagementService.disable2FA).toBeTypeOf('function')
      expect(authManagementService.logoutUser).toBeTypeOf('function')
      expect(authManagementService.forgotPassword).toBeTypeOf('function')
      expect(authManagementService.resetPassword).toBeTypeOf('function')
      expect(authManagementService.validateResetToken).toBeTypeOf('function')
    })
  })

  describe('loginUser', () => {
    it('should login user successfully without 2FA', async () => {
      const credentials: LoginApiRequest = {
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
        remember_me: true
      }

      const mockResponse: AxiosResponse<LoginApiResponse> = {
        data: {
          success: true,
          message: 'Login successful',
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            session_id: 'session-123',
            requires_2fa: false,
            is_2fa_authenticated: false,
            user: {
              id: '1',
              email: 'john.doe@example.com',
              name: 'John Doe',
              role: 'Admin',
              is_2fa_required: false
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.loginUser(credentials)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.LOGIN, credentials)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.accessToken).toBe('mock-access-token')
      expect(result.data?.requires_2fa).toBe(false)
    })

    it('should login user successfully with 2FA required', async () => {
      const credentials: LoginApiRequest = {
        email: 'jane.smith@example.com',
        password: 'SecurePassword456!',
        remember_me: false
      }

      const mockResponse: AxiosResponse<LoginApiResponse> = {
        data: {
          success: true,
          message: '2FA verification required',
          data: {
            requires_2fa: true,
            is_2fa_authenticated: false,
            user: {
              id: '2',
              email: 'jane.smith@example.com',
              name: 'Jane Smith',
              role: 'User',
              is_2fa_required: true
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.loginUser(credentials)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.LOGIN, credentials)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.requires_2fa).toBe(true)
      expect(result.data?.accessToken).toBeUndefined()
    })

    it('should handle login errors', async () => {
      const credentials: LoginApiRequest = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
        remember_me: false
      }

      const mockError = new Error('Invalid credentials')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.loginUser(credentials)).rejects.toThrow('Invalid credentials')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to login user:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle validation errors in login response', async () => {
      const credentials: LoginApiRequest = {
        email: 'test@example.com',
        password: 'weak',
        remember_me: false
      }

      const mockResponse: AxiosResponse<LoginApiResponse> = {
        data: {
          success: false,
          message: 'Validation failed',
          validation_errors: [
            { field: 'password', message: 'Password must be at least 8 characters' }
          ],
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.loginUser(credentials)

      expect(result.success).toBe(false)
      expect(result.validation_errors).toHaveLength(1)
    })
  })

  describe('verify2fa', () => {
    it('should verify 2FA code successfully', async () => {
      const credentials: Verify2FAApiRequest = {
        user_id: '1',
        type: 'totp',
        code: '123456'
      }

      const mockResponse: AxiosResponse<LoginApiResponse> = {
        data: {
          success: true,
          message: '2FA verification successful',
          data: {
            accessToken: 'mock-access-token-after-2fa',
            refreshToken: 'mock-refresh-token-after-2fa',
            session_id: 'session-456',
            requires_2fa: false,
            is_2fa_authenticated: true,
            user: {
              id: '1',
              email: 'john.doe@example.com',
              name: 'John Doe',
              role: 'Admin',
              is_2fa_required: true
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.verify2fa(credentials)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.VERIFY_2FA, credentials)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.is_2fa_authenticated).toBe(true)
      expect(result.data?.accessToken).toBe('mock-access-token-after-2fa')
    })

    it('should handle invalid 2FA code', async () => {
      const credentials: Verify2FAApiRequest = {
        user_id: '1',
        type: 'totp',
        code: '000000'
      }

      const mockError = new Error('Invalid 2FA code')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.verify2fa(credentials)).rejects.toThrow('Invalid 2FA code')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to login user:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('refreshToken', () => {
    it('should refresh authentication token successfully', async () => {
      const refreshData: RefreshTokenApiRequest = {
        email: 'john.doe@example.com'
      }

      const mockResponse: AxiosResponse<RefreshTokenApiResponse> = {
        data: {
          success: true,
          message: 'Token refreshed successfully',
          data: {
            accessToken: 'new-access-token'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.refreshToken(refreshData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.REFRESH, refreshData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.accessToken).toBe('new-access-token')
    })

    it('should handle token refresh errors', async () => {
      const refreshData: RefreshTokenApiRequest = {
        email: 'john.doe@example.com'
      }

      const mockError = new Error('Refresh token expired')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.refreshToken(refreshData)).rejects.toThrow('Refresh token expired')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to refresh token:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('generate2FA', () => {
    it('should generate 2FA QR code successfully', async () => {
      const mockResponse: AxiosResponse<Generate2FAApiResponse> = {
        data: {
          success: true,
          message: '2FA generated successfully',
          data: {
            qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...',
            backup_codes: 'CODE1,CODE2,CODE3,CODE4,CODE5'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.generate2FA()

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.GENERATE_2FA)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.qr_code_url).toBeDefined()
      expect(result.data?.backup_codes).toBeDefined()
    })

    it('should handle 2FA generation errors', async () => {
      const mockError = new Error('Failed to generate 2FA')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.generate2FA()).rejects.toThrow('Failed to generate 2FA')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to generate 2FA:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('enable2FA', () => {
    it('should enable 2FA successfully', async () => {
      const enableData: Enable2FAApiRequest = {
        code: '123456'
      }

      const mockResponse: AxiosResponse<Enable2FAApiResponse> = {
        data: {
          success: true,
          message: '2FA enabled successfully',
          data: {
            user_id: '1',
            enabled_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.enable2FA(enableData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.ENABLE_2FA, enableData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.user_id).toBe('1')
      expect(result.data?.enabled_at).toBeDefined()
    })

    it('should handle 2FA enable errors', async () => {
      const enableData: Enable2FAApiRequest = {
        code: '000000'
      }

      const mockError = new Error('Invalid verification code')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.enable2FA(enableData)).rejects.toThrow('Invalid verification code')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to enable 2FA:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('disable2FA', () => {
    it('should disable 2FA successfully', async () => {
      const mockResponse: AxiosResponse<Disable2FAApiResponse> = {
        data: {
          success: true,
          message: '2FA disabled successfully',
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.disable2FA()

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.DISABLE_2FA)
      expect(result).toEqual(mockResponse.data)
      expect(result.success).toBe(true)
    })

    it('should handle 2FA disable errors', async () => {
      const mockError = new Error('Failed to disable 2FA')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.disable2FA()).rejects.toThrow('Failed to disable 2FA')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to disable 2FA:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      const mockResponse: AxiosResponse<LogoutApiResponse> = {
        data: {
          success: true,
          message: 'Logout successful',
          data: {
            logged_out_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.logoutUser()

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.LOGOUT)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.logged_out_at).toBeDefined()
    })

    it('should handle logout errors', async () => {
      const mockError = new Error('Session not found')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.logoutUser()).rejects.toThrow('Session not found')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to logout user:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('forgotPassword', () => {
    it('should request password reset successfully', async () => {
      const forgotPasswordData: ForgotPasswordApiRequest = {
        email: 'john.doe@example.com'
      }

      const mockResponse: AxiosResponse<ForgotPasswordApiResponse> = {
        data: {
          success: true,
          message: 'Password reset email sent successfully',
          data: 'Reset token sent to your email',
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.forgotPassword(forgotPasswordData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.FORGOT_PASSWORD, forgotPasswordData)
      expect(result).toEqual(mockResponse.data)
      expect(result.success).toBe(true)
    })

    it('should handle forgot password errors', async () => {
      const forgotPasswordData: ForgotPasswordApiRequest = {
        email: 'nonexistent@example.com'
      }

      const mockError = new Error('Email not found')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.forgotPassword(forgotPasswordData)).rejects.toThrow('Email not found')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to request password reset:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle validation errors in forgot password', async () => {
      const forgotPasswordData: ForgotPasswordApiRequest = {
        email: 'invalid-email'
      }

      const mockResponse: AxiosResponse<ForgotPasswordApiResponse> = {
        data: {
          success: false,
          message: 'Validation failed',
          validation_errors: [
            { field: 'email', message: 'Invalid email format' }
          ],
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.forgotPassword(forgotPasswordData)

      expect(result.success).toBe(false)
      expect(result.validation_errors).toHaveLength(1)
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordData: ResetPasswordApiRequest = {
        token: 'valid-reset-token',
        new_password: 'NewSecurePassword123!',
        confirm_password: 'NewSecurePassword123!'
      }

      const mockResponse: AxiosResponse<ResetPasswordApiResponse> = {
        data: {
          success: true,
          message: 'Password reset successfully',
          data: {
            user_id: '1',
            reset_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.resetPassword(resetPasswordData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(AUTH_API_ROUTES.RESET_PASSWORD, resetPasswordData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.user_id).toBe('1')
      expect(result.data?.reset_at).toBeDefined()
    })

    it('should handle reset password errors', async () => {
      const resetPasswordData: ResetPasswordApiRequest = {
        token: 'expired-token',
        new_password: 'NewPassword123!',
        confirm_password: 'NewPassword123!'
      }

      const mockError = new Error('Reset token expired')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.resetPassword(resetPasswordData)).rejects.toThrow('Reset token expired')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to reset password:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle validation errors in reset password', async () => {
      const resetPasswordData: ResetPasswordApiRequest = {
        token: 'valid-token',
        new_password: 'weak',
        confirm_password: 'weak'
      }

      const mockResponse: AxiosResponse<ResetPasswordApiResponse> = {
        data: {
          success: false,
          message: 'Validation failed',
          validation_errors: [
            { field: 'new_password', message: 'Password must be at least 8 characters' }
          ],
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.resetPassword(resetPasswordData)

      expect(result.success).toBe(false)
      expect(result.validation_errors).toHaveLength(1)
    })
  })

  describe('validateResetToken', () => {
    it('should validate reset token successfully', async () => {
      const token = 'valid-reset-token-abc123'

      const mockResponse: AxiosResponse<ValidateResetTokenApiResponse> = {
        data: {
          success: true,
          message: 'Token is valid',
          data: {
            token_valid: true,
            user_id: '1',
            expires_at: '2024-01-02T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await authManagementService.validateResetToken(token)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`${AUTH_API_ROUTES.VALIDATE_TOKEN}?token=${token}`)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.token_valid).toBe(true)
      expect(result.data?.user_id).toBe('1')
    })

    it('should handle invalid reset token', async () => {
      const token = 'invalid-token'

      const mockResponse: AxiosResponse<ValidateResetTokenApiResponse> = {
        data: {
          success: false,
          message: 'Token is invalid or expired',
          data: {
            token_valid: false,
            user_id: '',
            expires_at: '',
            created_at: ''
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await authManagementService.validateResetToken(token)

      expect(result.success).toBe(false)
      expect(result.data?.token_valid).toBe(false)
    })

    it('should handle validate token errors', async () => {
      const token = 'malformed-token'

      const mockError = new Error('Invalid token format')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(authManagementService.validateResetToken(token)).rejects.toThrow('Invalid token format')
      expect(consoleSpy).toHaveBeenCalledWith('[AuthManagementService] Failed to validate reset token:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling and Console Logging', () => {
    it('should log appropriate error messages for each method', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Generic API Error')

      const testCases = [
        {
          method: () => authManagementService.loginUser({} as LoginApiRequest),
          expectedMessage: '[AuthManagementService] Failed to login user:'
        },
        {
          method: () => authManagementService.verify2fa({} as Verify2FAApiRequest),
          expectedMessage: '[AuthManagementService] Failed to login user:'
        },
        {
          method: () => authManagementService.refreshToken({} as RefreshTokenApiRequest),
          expectedMessage: '[AuthManagementService] Failed to refresh token:'
        },
        {
          method: () => authManagementService.generate2FA(),
          expectedMessage: '[AuthManagementService] Failed to generate 2FA:'
        },
        {
          method: () => authManagementService.enable2FA({} as Enable2FAApiRequest),
          expectedMessage: '[AuthManagementService] Failed to enable 2FA:'
        },
        {
          method: () => authManagementService.disable2FA(),
          expectedMessage: '[AuthManagementService] Failed to disable 2FA:'
        },
        {
          method: () => authManagementService.logoutUser(),
          expectedMessage: '[AuthManagementService] Failed to logout user:'
        },
        {
          method: () => authManagementService.forgotPassword({} as ForgotPasswordApiRequest),
          expectedMessage: '[AuthManagementService] Failed to request password reset:'
        },
        {
          method: () => authManagementService.resetPassword({} as ResetPasswordApiRequest),
          expectedMessage: '[AuthManagementService] Failed to reset password:'
        },
        {
          method: () => authManagementService.validateResetToken('token'),
          expectedMessage: '[AuthManagementService] Failed to validate reset token:'
        }
      ]

      for (const testCase of testCases) {
        /* Reset mocks for each test case */
        mockAxiosInstance.get.mockRejectedValueOnce(mockError)
        mockAxiosInstance.post.mockRejectedValueOnce(mockError)

        try {
          await testCase.method()
        } catch (error) {
          expect(error).toBe(mockError)
        }

        expect(consoleSpy).toHaveBeenCalledWith(testCase.expectedMessage, mockError)
        consoleSpy.mockClear()
      }

      consoleSpy.mockRestore()
    })
  })

  describe('Type Safety and Parameter Validation', () => {
    it('should accept correct parameter types for login', async () => {
      const validLoginData: LoginApiRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        remember_me: true
      }

      const mockResponse: AxiosResponse<LoginApiResponse> = {
        data: {
          success: true,
          message: 'Login successful',
          data: {
            accessToken: 'token',
            refreshToken: 'refresh',
            session_id: 'session',
            requires_2fa: false,
            is_2fa_authenticated: false,
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: 'User'
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      await expect(authManagementService.loginUser(validLoginData)).resolves.toBeDefined()
    })

    it('should accept correct parameter types for password reset', async () => {
      const validResetData: ResetPasswordApiRequest = {
        token: 'valid-token',
        new_password: 'NewPassword123!',
        confirm_password: 'NewPassword123!'
      }

      const mockResponse: AxiosResponse<ResetPasswordApiResponse> = {
        data: {
          success: true,
          message: 'Password reset successfully',
          data: {
            user_id: '1',
            reset_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      await expect(authManagementService.resetPassword(validResetData)).resolves.toBeDefined()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for login', async () => {
      const mockResponse: AxiosResponse<LoginApiResponse> = {
        data: {
          success: true,
          message: 'Login successful',
          data: {
            accessToken: 'token',
            refreshToken: 'refresh',
            session_id: 'session',
            requires_2fa: false,
            is_2fa_authenticated: false,
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: 'User'
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.loginUser({} as LoginApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('user')
      expect(result.data?.user).toHaveProperty('id')
      expect(result.data?.user).toHaveProperty('email')
    })

    it('should return proper response structure for 2FA generation', async () => {
      const mockResponse: AxiosResponse<Generate2FAApiResponse> = {
        data: {
          success: true,
          message: '2FA generated successfully',
          data: {
            qr_code_url: 'data:image/png;base64,...',
            backup_codes: 'CODE1,CODE2,CODE3'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authManagementService.generate2FA()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('qr_code_url')
      expect(result.data).toHaveProperty('backup_codes')
    })

    it('should return proper response structure for token validation', async () => {
      const mockResponse: AxiosResponse<ValidateResetTokenApiResponse> = {
        data: {
          success: true,
          message: 'Token is valid',
          data: {
            token_valid: true,
            user_id: '1',
            expires_at: '2024-01-02T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await authManagementService.validateResetToken('token')

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('token_valid')
      expect(result.data).toHaveProperty('user_id')
      expect(result.data).toHaveProperty('expires_at')
    })
  })
})
