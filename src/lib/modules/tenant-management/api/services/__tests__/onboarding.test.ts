/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Tenant management module imports */
import type { CreateAccountApiRequest, CreateAccountApiResponse, RequestOTPApiRequest, RequestOTPApiResponse, VerificationOTPApiRequest, VerificationOTPApiResponse, AccountStatusApiResponse } from '@tenant-management/types'
import { TENANT_API_ROUTES } from '@tenant-management/constants'

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
vi.mock('@tenant-management/api/client', () => ({
  tenantApiClient: mockAxiosInstance
}))

describe('onboardingService', () => {
  let onboardingService: typeof import('@tenant-management/api/services/onboarding').onboardingService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@tenant-management/api/services/onboarding')
    onboardingService = module.onboardingService
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
    it('should have onboardingService with all required methods', () => {
      expect(onboardingService).toBeDefined()
      expect(onboardingService.createTenantAccount).toBeTypeOf('function')
      expect(onboardingService.requestOTP).toBeTypeOf('function')
      expect(onboardingService.verifyOTP).toBeTypeOf('function')
      expect(onboardingService.checkTenantAccountStatus).toBeTypeOf('function')
    })
  })

  describe('createTenantAccount', () => {
    it('should create a new tenant account successfully', async () => {
      const accountData: CreateAccountApiRequest = {
        tenant_id: 'tenant-new-1',
        company_name: 'New Company Inc',
        contact_person: 'John Doe',
        primary_email: 'john@newcompany.com',
        primary_phone: '+1234567890',
        address_line1: '123 Business Ave',
        address_line2: 'Suite 200',
        city: 'New York',
        state_province: 'NY',
        postal_code: '10001',
        country: 'USA',
        email_verified: false,
        phone_verified: false,
        email_verified_at: null,
        phone_verified_at: null
      }

      const mockResponse: AxiosResponse<CreateAccountApiResponse> = {
        data: {
          success: true,
          message: 'Tenant account created successfully',
          data: {
            tenant_id: 'tenant-new-1',
            company_name: 'New Company Inc',
            status: 'pending'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await onboardingService.createTenantAccount(accountData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.CREATE, accountData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.tenant_id).toBe('tenant-new-1')
      expect(result.data?.status).toBe('pending')
    })

    it('should handle validation errors when creating account', async () => {
      const accountData: CreateAccountApiRequest = {
        company_name: '',
        contact_person: 'Jane Doe',
        primary_email: 'invalid-email',
        primary_phone: '+1234567890',
        address_line1: '456 Test St',
        city: 'Test City',
        state_province: 'TS',
        postal_code: '12345',
        country: 'USA',
        email_verified: false,
        phone_verified: false,
        email_verified_at: null,
        phone_verified_at: null
      }

      const mockError = new Error('Validation failed')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(onboardingService.createTenantAccount(accountData)).rejects.toThrow('Validation failed')
      expect(consoleSpy).toHaveBeenCalledWith('[OnboardingService] Failed to create tenant account:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle account creation errors', async () => {
      const accountData: CreateAccountApiRequest = {
        company_name: 'Duplicate Company',
        contact_person: 'Test User',
        primary_email: 'existing@company.com',
        primary_phone: '+1987654321',
        address_line1: '789 Main St',
        city: 'City',
        state_province: 'ST',
        postal_code: '54321',
        country: 'USA',
        email_verified: false,
        phone_verified: false,
        email_verified_at: null,
        phone_verified_at: null
      }

      const mockError = new Error('Email already exists')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(onboardingService.createTenantAccount(accountData)).rejects.toThrow('Email already exists')
      expect(consoleSpy).toHaveBeenCalledWith('[OnboardingService] Failed to create tenant account:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('requestOTP', () => {
    it('should request OTP for email verification successfully', async () => {
      const otpRequest: RequestOTPApiRequest = {
        otp_type: 'email_verification',
        email: 'john@example.com'
      }

      const mockResponse: AxiosResponse<RequestOTPApiResponse> = {
        data: {
          success: true,
          message: 'OTP sent successfully',
          data: {
            contact: 'john@example.com',
            verification_type: 'email_verification',
            otp_code: 123456
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await onboardingService.requestOTP(otpRequest)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.REQUEST_OTP, otpRequest)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.verification_type).toBe('email_verification')
    })

    it('should request OTP for phone verification successfully', async () => {
      const otpRequest: RequestOTPApiRequest = {
        otp_type: 'phone_verification',
        phone: '+1234567890'
      }

      const mockResponse: AxiosResponse<RequestOTPApiResponse> = {
        data: {
          success: true,
          message: 'OTP sent successfully',
          data: {
            contact: '+1234567890',
            verification_type: 'phone_verification',
            otp_code: 654321
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await onboardingService.requestOTP(otpRequest)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.REQUEST_OTP, otpRequest)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.verification_type).toBe('phone_verification')
    })

    it('should handle OTP request errors', async () => {
      const otpRequest: RequestOTPApiRequest = {
        otp_type: 'email_verification',
        email: 'invalid@example.com'
      }

      const mockError = new Error('Failed to send OTP')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(onboardingService.requestOTP(otpRequest)).rejects.toThrow('Failed to send OTP')
      expect(consoleSpy).toHaveBeenCalledWith('[OnboardingService] Failed to request OTP:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('verifyOTP', () => {
    it('should verify email OTP successfully', async () => {
      const otpVerification: VerificationOTPApiRequest = {
        otp_type: 'email_verification',
        otp_code: 123456
      }

      const mockResponse: AxiosResponse<VerificationOTPApiResponse> = {
        data: {
          success: true,
          message: 'Email verified successfully',
          data: {
            tenant_id: 'tenant-1',
            verification_type: 'email',
            verified: true,
            verified_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await onboardingService.verifyOTP(otpVerification)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.VERIFY_OTP, otpVerification)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.verified).toBe(true)
      expect(result.data?.verification_type).toBe('email')
    })

    it('should verify phone OTP successfully', async () => {
      const otpVerification: VerificationOTPApiRequest = {
        otp_type: 'phone_verification',
        otp_code: 654321
      }

      const mockResponse: AxiosResponse<VerificationOTPApiResponse> = {
        data: {
          success: true,
          message: 'Phone verified successfully',
          data: {
            tenant_id: 'tenant-1',
            verification_type: 'phone',
            verified: true,
            verified_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await onboardingService.verifyOTP(otpVerification)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.VERIFY_OTP, otpVerification)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.verified).toBe(true)
      expect(result.data?.verification_type).toBe('phone')
    })

    it('should handle invalid OTP verification', async () => {
      const otpVerification: VerificationOTPApiRequest = {
        otp_type: 'email_verification',
        otp_code: 999999
      }

      const mockError = new Error('Invalid OTP code')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(onboardingService.verifyOTP(otpVerification)).rejects.toThrow('Invalid OTP code')
      expect(consoleSpy).toHaveBeenCalledWith('[OnboardingService] Failed to verify OTP:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle expired OTP verification', async () => {
      const otpVerification: VerificationOTPApiRequest = {
        otp_type: 'phone_verification',
        otp_code: 111111
      }

      const mockError = new Error('OTP has expired')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(onboardingService.verifyOTP(otpVerification)).rejects.toThrow('OTP has expired')
      expect(consoleSpy).toHaveBeenCalledWith('[OnboardingService] Failed to verify OTP:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('checkTenantAccountStatus', () => {
    it('should fetch tenant account status successfully', async () => {
      const tenantId = 'tenant-1'
      const mockResponse: AxiosResponse<AccountStatusApiResponse> = {
        data: {
          success: true,
          message: 'Account status retrieved successfully',
          data: {
            tenant_id: 'tenant-1',
            tenant_info: {
              company_name: 'Acme Corp',
              contact_person: 'John Doe',
              primary_email: 'john@acme.com',
              primary_phone: '+1234567890',
              address_line1: '123 Main St',
              address_line2: null,
              city: 'New York',
              state_province: 'NY',
              postal_code: '10001',
              country: 'USA'
            },
            basic_info_status: {
              is_complete: true,
              validation_errors: [],
              validation_message: 'Complete'
            },
            verification_status: {
              email_verified: true,
              phone_verified: true,
              both_verified: true,
              email_verified_at: '2024-01-01T00:00:00Z',
              phone_verified_at: '2024-01-01T00:00:00Z'
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await onboardingService.checkTenantAccountStatus(tenantId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.STATUS.replace(':id', tenantId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data.verification_status.both_verified).toBe(true)
    })

    it('should fetch pending account status successfully', async () => {
      const tenantId = 'tenant-2'
      const mockResponse: AxiosResponse<AccountStatusApiResponse> = {
        data: {
          success: true,
          message: 'Account status retrieved successfully',
          data: {
            tenant_id: 'tenant-2',
            tenant_info: {
              company_name: 'New Startup',
              contact_person: 'Jane Smith',
              primary_email: 'jane@startup.com',
              primary_phone: '+1987654321',
              address_line1: '456 Startup Ave',
              address_line2: null,
              city: 'San Francisco',
              state_province: 'CA',
              postal_code: '94102',
              country: 'USA'
            },
            basic_info_status: {
              is_complete: true,
              validation_errors: [],
              validation_message: 'Complete'
            },
            verification_status: {
              email_verified: true,
              phone_verified: false,
              both_verified: false,
              email_verified_at: '2024-01-02T00:00:00Z',
              phone_verified_at: null
            }
          },
          timestamp: '2024-01-02T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await onboardingService.checkTenantAccountStatus(tenantId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(TENANT_API_ROUTES.ACCOUNT.STATUS.replace(':id', tenantId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data.verification_status.email_verified).toBe(true)
      expect(result.data.verification_status.phone_verified).toBe(false)
      expect(result.data.verification_status.both_verified).toBe(false)
    })

    it('should handle errors when checking account status', async () => {
      const tenantId = 'tenant-999'
      const mockError = new Error('Tenant not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(onboardingService.checkTenantAccountStatus(tenantId)).rejects.toThrow('Tenant not found')
      expect(consoleSpy).toHaveBeenCalledWith('[OnboardingService] Failed to check account status:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for create account', async () => {
      const mockResponse: AxiosResponse<CreateAccountApiResponse> = {
        data: {
          success: true,
          message: 'Account created',
          data: {
            tenant_id: 'tenant-1',
            company_name: 'Test Company',
            status: 'pending'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await onboardingService.createTenantAccount({} as CreateAccountApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('tenant_id')
      expect(result.data).toHaveProperty('company_name')
      expect(result.data).toHaveProperty('status')
      expect(result).toHaveProperty('timestamp')
    })

    it('should return proper response structure for OTP request', async () => {
      const mockResponse: AxiosResponse<RequestOTPApiResponse> = {
        data: {
          success: true,
          message: 'OTP sent',
          data: {
            contact: 'test@example.com',
            verification_type: 'email_verification',
            otp_code: 123456
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await onboardingService.requestOTP({} as RequestOTPApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('contact')
      expect(result.data).toHaveProperty('verification_type')
    })

    it('should return proper response structure for OTP verification', async () => {
      const mockResponse: AxiosResponse<VerificationOTPApiResponse> = {
        data: {
          success: true,
          message: 'Verified',
          data: {
            tenant_id: 'tenant-1',
            verification_type: 'email',
            verified: true,
            verified_at: '2024-01-01T00:00:00Z'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await onboardingService.verifyOTP({} as VerificationOTPApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('tenant_id')
      expect(result.data).toHaveProperty('verification_type')
      expect(result.data).toHaveProperty('verified')
      expect(result.data).toHaveProperty('verified_at')
    })
  })
})
