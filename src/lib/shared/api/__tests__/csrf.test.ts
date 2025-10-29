/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Shared module imports */
import { CSRF_API_ROUTES } from '@shared/constants'

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

describe('csrfApiService', () => {
  let csrfApiService: typeof import('@shared/api/csrf').csrfApiService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@shared/api/csrf')
    csrfApiService = module.csrfApiService
  })

  beforeEach(() => {
    /* Clear HTTP method mocks */
    mockAxiosInstance.get.mockClear()
    mockAxiosInstance.post.mockClear()
    mockAxiosInstance.put.mockClear()
    mockAxiosInstance.delete.mockClear()

    /* Mock localStorage */
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    /* Mock window.dispatchEvent */
    window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('API Client Configuration', () => {
    it('should have csrfApiService with getCsrfToken method', () => {
      expect(csrfApiService).toBeDefined()
      expect(csrfApiService.getCsrfToken).toBeTypeOf('function')
    })

    it('should export getCsrfToken as an async function', () => {
      expect(csrfApiService.getCsrfToken).toBeInstanceOf(Function)
      expect(csrfApiService.getCsrfToken.constructor.name).toBe('AsyncFunction')
    })
  })

  describe('API Routes Configuration', () => {
    it('should have correct route definitions', () => {
      expect(CSRF_API_ROUTES).toHaveProperty('BASE_PATH')
      expect(CSRF_API_ROUTES).toHaveProperty('GET_TOKEN')
    })

    it('should use correct API path structure', () => {
      expect(CSRF_API_ROUTES.BASE_PATH).toBe('/csrf')
      expect(CSRF_API_ROUTES.GET_TOKEN).toBe('/token')
    })
  })

  describe('getCsrfToken', () => {
    it('should fetch CSRF token successfully', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'CSRF token generated successfully',
          data: {
            csrfToken: 'test-csrf-token-12345'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await csrfApiService.getCsrfToken()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(CSRF_API_ROUTES.GET_TOKEN)
      expect(result).toEqual(mockResponse.data)
      expect(result.success).toBe(true)
      expect(result.data.csrfToken).toBe('test-csrf-token-12345')
    })

    it('should return proper response structure with all required fields', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'CSRF token retrieved',
          data: {
            csrfToken: 'csrf-token-abc123'
          },
          timestamp: '2024-01-01T12:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await csrfApiService.getCsrfToken()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('timestamp')
      expect(result.data).toHaveProperty('csrfToken')
    })

    it('should handle different CSRF token formats', async () => {
      const testTokens = [
        'simple-token',
        'token-with-numbers-123',
        'UPPERCASE-TOKEN',
        'mixed-Case-TOKEN-456',
        'token_with_underscores',
        'token.with.dots',
        'very-long-token-string-with-many-characters-12345678901234567890'
      ]

      for (const token of testTokens) {
        const mockResponse: AxiosResponse<{
          success: boolean
          message: string
          data: {
            csrfToken: string
          }
          timestamp: string
        }> = {
          data: {
            success: true,
            message: 'CSRF token generated',
            data: {
              csrfToken: token
            },
            timestamp: '2024-01-01T00:00:00Z'
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: createMockAxiosConfig()
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await csrfApiService.getCsrfToken()

        expect(result.data.csrfToken).toBe(token)
        mockAxiosInstance.get.mockClear()
      }
    })

    it('should handle errors when fetching CSRF token', async () => {
      const mockError = new Error('Failed to generate CSRF token')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(csrfApiService.getCsrfToken()).rejects.toThrow('Failed to generate CSRF token')
    })

    it('should handle network errors', async () => {
      const mockError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(csrfApiService.getCsrfToken()).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      const mockError = new Error('Request timeout')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(csrfApiService.getCsrfToken()).rejects.toThrow('Request timeout')
    })

    it('should handle server errors (5xx)', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Internal server error'
          }
        },
        message: 'Internal server error'
      }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(csrfApiService.getCsrfToken()).rejects.toMatchObject(mockError)
    })

    it('should handle client errors (4xx)', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Bad request'
          }
        },
        message: 'Bad request'
      }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(csrfApiService.getCsrfToken()).rejects.toMatchObject(mockError)
    })
  })

  describe('Response Data Structure', () => {
    it('should return response with success flag', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'Token generated',
          data: {
            csrfToken: 'test-token'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await csrfApiService.getCsrfToken()

      expect(result.success).toBe(true)
      expect(typeof result.success).toBe('boolean')
    })

    it('should return response with message', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'CSRF token created successfully',
          data: {
            csrfToken: 'test-token'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await csrfApiService.getCsrfToken()

      expect(result.message).toBe('CSRF token created successfully')
      expect(typeof result.message).toBe('string')
    })

    it('should return response with timestamp', async () => {
      const mockTimestamp = '2024-01-15T10:30:00Z'
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'Token generated',
          data: {
            csrfToken: 'test-token'
          },
          timestamp: mockTimestamp
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await csrfApiService.getCsrfToken()

      expect(result.timestamp).toBe(mockTimestamp)
      expect(typeof result.timestamp).toBe('string')
    })

    it('should return nested data object with csrfToken', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'Token generated',
          data: {
            csrfToken: 'nested-token-value'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await csrfApiService.getCsrfToken()

      expect(result.data).toHaveProperty('csrfToken')
      expect(result.data.csrfToken).toBe('nested-token-value')
    })

    it('should handle optional error field in response', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        error?: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: false,
          message: 'Failed to generate token',
          error: 'Rate limit exceeded',
          data: {
            csrfToken: ''
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await csrfApiService.getCsrfToken()

      expect(result.error).toBe('Rate limit exceeded')
    })
  })

  describe('Type Safety and Parameter Validation', () => {
    it('should return properly typed response', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'Token generated',
          data: {
            csrfToken: 'typed-token'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await csrfApiService.getCsrfToken()

      /* Type assertions to verify TypeScript types */
      expect(typeof result.success).toBe('boolean')
      expect(typeof result.message).toBe('string')
      expect(typeof result.data.csrfToken).toBe('string')
      expect(typeof result.timestamp).toBe('string')
    })

    it('should not require any parameters', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'Token generated',
          data: {
            csrfToken: 'no-param-token'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      /* Should work without any parameters */
      const result = await csrfApiService.getCsrfToken()

      expect(result).toBeDefined()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(CSRF_API_ROUTES.GET_TOKEN)
    })
  })

  describe('Integration with Base Client', () => {
    it('should use GET method for fetching CSRF token', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'Token generated',
          data: {
            csrfToken: 'test-token'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await csrfApiService.getCsrfToken()

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(CSRF_API_ROUTES.GET_TOKEN)
    })

    it('should not use POST, PUT, or DELETE methods', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'Token generated',
          data: {
            csrfToken: 'test-token'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await csrfApiService.getCsrfToken()

      expect(mockAxiosInstance.post).not.toHaveBeenCalled()
      expect(mockAxiosInstance.put).not.toHaveBeenCalled()
      expect(mockAxiosInstance.delete).not.toHaveBeenCalled()
    })

    it('should call correct endpoint path', async () => {
      const mockResponse: AxiosResponse<{
        success: boolean
        message: string
        data: {
          csrfToken: string
        }
        timestamp: string
      }> = {
        data: {
          success: true,
          message: 'Token generated',
          data: {
            csrfToken: 'test-token'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await csrfApiService.getCsrfToken()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/token')
    })
  })
})
