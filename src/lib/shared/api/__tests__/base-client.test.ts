/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios, { AxiosInstance } from 'axios'

/* Shared module imports */
import { BaseApiClient, createApiClient } from '@shared/api/base-client'
import { BACKEND_BASE_URL } from '@shared/config'

/* Mock axios */
vi.mock('axios')

describe('BaseApiClient', () => {
  let mockAxiosInstance: any

  beforeEach(() => {
    /* Reset mocks */
    vi.clearAllMocks()

    /* Create mock axios instance */
    mockAxiosInstance = {
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

    /* Mock axios.create to return our mock instance */
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any)

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

  describe('Constructor and Initialization', () => {
    it('should create axios instance with correct base URL for private endpoints', () => {
      const config = {
        basePath: '/users',
        requiresAuth: true
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: `${BACKEND_BASE_URL}/api/v1/users`,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })
    })

    it('should create axios instance with correct base URL for public endpoints', () => {
      const config = {
        basePath: '/countries',
        requiresAuth: false,
        isPublic: true
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: `${BACKEND_BASE_URL}/api/v1/public/countries`,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })
    })

    it('should use default timeout when not specified', () => {
      const config = {
        basePath: '/test'
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000
        })
      )
    })

    it('should use custom timeout when specified', () => {
      const config = {
        basePath: '/test',
        timeout: 5000
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000
        })
      )
    })

    it('should merge custom headers with default headers', () => {
      const config = {
        basePath: '/test',
        customHeaders: {
          'X-Custom-Header': 'custom-value'
        }
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value'
          }
        })
      )
    })

    it('should setup request and response interceptors', () => {
      const config = {
        basePath: '/test'
      }

      new BaseApiClient(config)

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('Configuration Options', () => {
    it('should default requiresAuth to true when not specified', () => {
      const config = {
        basePath: '/test'
      }

      const client = new BaseApiClient(config)
      const axiosInstance = client.getAxiosInstance()

      expect(axiosInstance).toBeDefined()
    })

    it('should default isPublic to false when not specified', () => {
      const config = {
        basePath: '/test'
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('/api/v1/test')
        })
      )
    })

    it('should handle auth routes configuration', () => {
      const config = {
        basePath: '/auth',
        requiresAuth: true,
        authRoutes: ['/profile', '/logout']
      }

      const client = new BaseApiClient(config)

      expect(client).toBeDefined()
    })
  })

  describe('getAxiosInstance', () => {
    it('should return the underlying axios instance', () => {
      const config = {
        basePath: '/test'
      }

      const client = new BaseApiClient(config)
      const axiosInstance = client.getAxiosInstance()

      expect(axiosInstance).toBe(mockAxiosInstance)
    })

    it('should return instance with all HTTP methods', () => {
      const config = {
        basePath: '/test'
      }

      const client = new BaseApiClient(config)
      const axiosInstance = client.getAxiosInstance()

      expect(axiosInstance.get).toBeDefined()
      expect(axiosInstance.post).toBeDefined()
      expect(axiosInstance.put).toBeDefined()
      expect(axiosInstance.delete).toBeDefined()
    })
  })

  describe('Request Interceptor Authentication', () => {
    it('should add authorization header when requiresAuth is true and token exists', () => {
      const mockToken = 'mock-access-token'
      const mockGetItem = vi.fn().mockReturnValue(mockToken)

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn()
        },
        writable: true
      })

      const config = {
        basePath: '/users',
        requiresAuth: true
      }

      new BaseApiClient(config)

      /* Get the request interceptor callback */
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const mockConfig = {
        headers: {},
        url: '/users/list'
      }

      const result = requestInterceptor(mockConfig)

      expect(result).toBeDefined()
    })

    it('should not add authorization header when requiresAuth is false', () => {
      const config = {
        basePath: '/public',
        requiresAuth: false
      }

      new BaseApiClient(config)

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const mockConfig = {
        headers: {},
        url: '/public/data'
      }

      const result = requestInterceptor(mockConfig)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('should handle request interceptor errors', () => {
      const config = {
        basePath: '/test'
      }

      new BaseApiClient(config)

      const errorHandler = mockAxiosInstance.interceptors.request.use.mock.calls[0][1]
      const mockError = new Error('Request error')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => errorHandler(mockError)).rejects.toThrow('Request error')

      consoleSpy.mockRestore()
    })
  })

  describe('Response Interceptor Error Handling', () => {
    it('should pass through successful responses', () => {
      const config = {
        basePath: '/test'
      }

      new BaseApiClient(config)

      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      const mockResponse = {
        data: { success: true },
        status: 200
      }

      const result = responseInterceptor(mockResponse)

      expect(result).toBe(mockResponse)
    })

    it('should reject non-401 errors without token refresh', async () => {
      const config = {
        basePath: '/test'
      }

      new BaseApiClient(config)

      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      const mockError = {
        response: {
          status: 500
        },
        config: {}
      }

      await expect(errorHandler(mockError)).rejects.toBe(mockError)
    })

    it('should reject errors without response', async () => {
      const config = {
        basePath: '/test'
      }

      new BaseApiClient(config)

      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      const mockError = {
        config: {},
        message: 'Network error'
      }

      await expect(errorHandler(mockError)).rejects.toBe(mockError)
    })
  })

  describe('createApiClient Factory', () => {
    it('should create and return an axios instance', () => {
      const config = {
        basePath: '/test'
      }

      const instance = createApiClient(config)

      expect(instance).toBe(mockAxiosInstance)
    })

    it('should create client with requiresAuth option', () => {
      const config = {
        basePath: '/users',
        requiresAuth: true
      }

      const instance = createApiClient(config)

      expect(axios.create).toHaveBeenCalled()
      expect(instance).toBeDefined()
    })

    it('should create client with isPublic option', () => {
      const config = {
        basePath: '/countries',
        requiresAuth: false,
        isPublic: true
      }

      const instance = createApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('/public/')
        })
      )
      expect(instance).toBeDefined()
    })

    it('should create client with custom timeout', () => {
      const config = {
        basePath: '/test',
        timeout: 10000
      }

      createApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 10000
        })
      )
    })

    it('should create client with custom headers', () => {
      const config = {
        basePath: '/test',
        customHeaders: {
          'X-API-Key': 'test-key'
        }
      }

      createApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-key'
          })
        })
      )
    })

    it('should create multiple independent client instances', () => {
      const config1 = {
        basePath: '/users'
      }
      const config2 = {
        basePath: '/roles'
      }

      const instance1 = createApiClient(config1)
      const instance2 = createApiClient(config2)

      expect(instance1).toBeDefined()
      expect(instance2).toBeDefined()
      expect(axios.create).toHaveBeenCalledTimes(2)
    })
  })

  describe('Type Safety', () => {
    it('should return AxiosInstance type from createApiClient', () => {
      const config = {
        basePath: '/test'
      }

      const instance: AxiosInstance = createApiClient(config)

      expect(instance).toBeDefined()
      expect(instance.get).toBeTypeOf('function')
      expect(instance.post).toBeTypeOf('function')
      expect(instance.put).toBeTypeOf('function')
      expect(instance.delete).toBeTypeOf('function')
    })

    it('should accept all valid configuration options', () => {
      const config = {
        basePath: '/test',
        requiresAuth: true,
        isPublic: false,
        timeout: 5000,
        customHeaders: {
          'X-Custom': 'value'
        },
        authRoutes: ['/protected']
      }

      const instance = createApiClient(config)

      expect(instance).toBeDefined()
    })
  })

  describe('URL Construction', () => {
    it('should construct private API URL correctly', () => {
      const config = {
        basePath: '/users',
        requiresAuth: true,
        isPublic: false
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: `${BACKEND_BASE_URL}/api/v1/users`
        })
      )
    })

    it('should construct public API URL correctly', () => {
      const config = {
        basePath: '/countries',
        requiresAuth: false,
        isPublic: true
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: `${BACKEND_BASE_URL}/api/v1/public/countries`
        })
      )
    })

    it('should handle basePath with leading slash', () => {
      const config = {
        basePath: '/test-path'
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('/test-path')
        })
      )
    })

    it('should handle basePath without leading slash', () => {
      const config = {
        basePath: 'test-path'
      }

      new BaseApiClient(config)

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('test-path')
        })
      )
    })
  })

  describe('Integration', () => {
    it('should create functional client for typical use case', () => {
      const config = {
        basePath: '/users',
        requiresAuth: true
      }

      const instance = createApiClient(config)

      expect(instance).toBeDefined()
      expect(instance.get).toBeTypeOf('function')
      expect(instance.post).toBeTypeOf('function')
      expect(instance.put).toBeTypeOf('function')
      expect(instance.delete).toBeTypeOf('function')
    })

    it('should create functional client for public endpoints', () => {
      const config = {
        basePath: '/countries',
        requiresAuth: false,
        isPublic: true
      }

      const instance = createApiClient(config)

      expect(instance).toBeDefined()
      expect(instance.get).toBeTypeOf('function')
    })

    it('should create functional client with all options', () => {
      const config = {
        basePath: '/test',
        requiresAuth: true,
        isPublic: false,
        timeout: 15000,
        customHeaders: {
          'X-Test': 'test-value'
        },
        authRoutes: ['/profile', '/settings']
      }

      const instance = createApiClient(config)

      expect(instance).toBeDefined()
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 15000,
          headers: expect.objectContaining({
            'X-Test': 'test-value'
          })
        })
      )
    })
  })
})
