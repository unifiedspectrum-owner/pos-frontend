/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Support ticket management module imports */
import type { ListTicketCategoriesApiResponse } from '@support-ticket-management/types'
import { SUPPORT_TICKET_API_ROUTES } from '@support-ticket-management/constants'

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
vi.mock('@support-ticket-management/api/client', () => ({
  supportTicketApiClient: mockAxiosInstance
}))

describe('categoriesService', () => {
  let categoriesService: typeof import('@support-ticket-management/api/services/categories').categoriesService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@support-ticket-management/api/services/categories')
    categoriesService = module.categoriesService
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
    it('should have categoriesService with all required methods', () => {
      expect(categoriesService).toBeDefined()
      expect(categoriesService.listAllCategories).toBeTypeOf('function')
    })
  })

  describe('listAllCategories', () => {
    it('should fetch ticket categories successfully', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved successfully',
          data: {
            categories: [
              {
                id: 1,
                name: 'Technical',
                description: 'Technical support issues',
                is_active: true,
                display_order: 1
              },
              {
                id: 2,
                name: 'Billing',
                description: 'Billing and payment related issues',
                is_active: true,
                display_order: 2
              },
              {
                id: 3,
                name: 'General Inquiry',
                description: 'General questions and inquiries',
                is_active: true,
                display_order: 3
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await categoriesService.listAllCategories()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.CATEGORIES)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.categories).toHaveLength(3)
    })

    it('should fetch categories with active and inactive statuses', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved successfully',
          data: {
            categories: [
              {
                id: 1,
                name: 'Technical',
                description: 'Technical support issues',
                is_active: true,
                display_order: 1
              },
              {
                id: 2,
                name: 'Legacy Support',
                description: 'Old category no longer in use',
                is_active: false,
                display_order: 2
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await categoriesService.listAllCategories()

      expect(result.data.categories).toHaveLength(2)
      expect(result.data.categories[0].is_active).toBe(true)
      expect(result.data.categories[1].is_active).toBe(false)
    })

    it('should fetch empty categories list', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'No categories found',
          data: {
            categories: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await categoriesService.listAllCategories()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.CATEGORIES)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.categories).toHaveLength(0)
    })

    it('should fetch categories with various descriptions', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved successfully',
          data: {
            categories: [
              {
                id: 1,
                name: 'Account Issues',
                description: 'Login, password reset, and account access problems',
                is_active: true,
                display_order: 1
              },
              {
                id: 2,
                name: 'Feature Request',
                description: 'Suggestions for new features or improvements',
                is_active: true,
                display_order: 2
              },
              {
                id: 3,
                name: 'Bug Report',
                description: 'Report software bugs and technical errors',
                is_active: true,
                display_order: 3
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await categoriesService.listAllCategories()

      expect(result.data.categories).toHaveLength(3)
      expect(result.data.categories[0].description).toBeTruthy()
      expect(result.data.categories[1].description).toBeTruthy()
      expect(result.data.categories[2].description).toBeTruthy()
    })

    it('should handle errors when fetching categories', async () => {
      const mockError = new Error('Failed to fetch categories')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(categoriesService.listAllCategories()).rejects.toThrow('Failed to fetch categories')
      expect(consoleSpy).toHaveBeenCalledWith('[CategoriesService] Failed to list ticket categories:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(categoriesService.listAllCategories()).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[CategoriesService] Failed to list ticket categories:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(categoriesService.listAllCategories()).rejects.toThrow('Database connection failed')
      expect(consoleSpy).toHaveBeenCalledWith('[CategoriesService] Failed to list ticket categories:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for list categories', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved',
          data: {
            categories: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await categoriesService.listAllCategories()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('categories')
      expect(Array.isArray(result.data.categories)).toBe(true)
    })

    it('should return categories with all required fields', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved successfully',
          data: {
            categories: [
              {
                id: 1,
                name: 'Technical',
                description: 'Technical issues',
                is_active: true,
                display_order: 1
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await categoriesService.listAllCategories()

      const category = result.data.categories[0]
      expect(category).toHaveProperty('id')
      expect(category).toHaveProperty('name')
      expect(category).toHaveProperty('description')
      expect(category).toHaveProperty('is_active')
      expect(category).toHaveProperty('display_order')
    })
  })

  describe('Type Safety and Parameter Validation', () => {
    it('should not require any parameters', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved',
          data: {
            categories: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await expect(categoriesService.listAllCategories()).resolves.toBeDefined()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.CATEGORIES)
    })

    it('should return typed response', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved',
          data: {
            categories: [
              {
                id: 1,
                name: 'Test Category',
                description: 'Test description',
                is_active: true,
                display_order: 1
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await categoriesService.listAllCategories()

      expect(typeof result.success).toBe('boolean')
      expect(typeof result.message).toBe('string')
      expect(Array.isArray(result.data.categories)).toBe(true)
    })
  })

  describe('Integration Scenarios', () => {
    it('should be called when creating a new ticket to populate category dropdown', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved successfully',
          data: {
            categories: [
              {
                id: 1,
                name: 'Technical',
                description: 'Technical support',
                is_active: true,
                display_order: 1
              },
              {
                id: 2,
                name: 'Billing',
                description: 'Billing issues',
                is_active: true,
                display_order: 2
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await categoriesService.listAllCategories()

      expect(result.data.categories.length).toBeGreaterThan(0)
      expect(result.data.categories.every(cat => cat.is_active)).toBe(true)
    })

    it('should filter active categories for user-facing forms', async () => {
      const mockResponse: AxiosResponse<ListTicketCategoriesApiResponse> = {
        data: {
          success: true,
          message: 'Categories retrieved successfully',
          data: {
            categories: [
              {
                id: 1,
                name: 'Active Category',
                description: 'This is active',
                is_active: true,
                display_order: 1
              },
              {
                id: 2,
                name: 'Inactive Category',
                description: 'This is inactive',
                is_active: false,
                display_order: 2
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await categoriesService.listAllCategories()
      const activeCategories = result.data.categories.filter(cat => cat.is_active)

      expect(activeCategories).toHaveLength(1)
      expect(activeCategories[0].name).toBe('Active Category')
    })
  })
})
