/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* User management module imports */
import type { UserListApiResponse, UserCreationApiRequest, UserCreationApiResponse, UserDetailsApiResponse, UserBasicDetailsApiResponse, UserUpdationApiRequest, UserUpdationApiResponse, UserDeletionApiResponse, UserPermissionsSummaryApiResponse } from '@user-management/types'

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
vi.mock('@user-management/api/client', () => ({
  userApiClient: mockAxiosInstance
}))

describe('userManagementService', () => {
  let userManagementService: typeof import('@user-management/api/services').userManagementService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@user-management/api/services')
    userManagementService = module.userManagementService
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
    it('should have userManagementService with all required methods', () => {
      expect(userManagementService).toBeDefined()
      expect(userManagementService.listAllUsers).toBeTypeOf('function')
      expect(userManagementService.createUser).toBeTypeOf('function')
      expect(userManagementService.getUserDetails).toBeTypeOf('function')
      expect(userManagementService.getUserBasicDetails).toBeTypeOf('function')
      expect(userManagementService.updateUser).toBeTypeOf('function')
      expect(userManagementService.deleteUser).toBeTypeOf('function')
      expect(userManagementService.getUserPermissions).toBeTypeOf('function')
    })
  })

  describe('listAllUsers', () => {
    it('should fetch paginated user list successfully with default parameters', async () => {
      const mockResponse: AxiosResponse<UserListApiResponse> = {
        data: {
          success: true,
          message: 'Users retrieved successfully',
          data: {
            users: [
              {
                id: 1,
                f_name: 'John',
                l_name: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                profile_image_url: null,
                is_2fa_required: false,
                is_2fa_enabled: false,
                user_status: 'active',
                email_verified: true,
                phone_verified: false,
                email_verified_at: '2024-01-01T00:00:00Z',
                phone_verified_at: null,
                last_password_change: '2024-01-01T00:00:00Z',
                account_locked_until: null,
                user_created_at: '2024-01-01T00:00:00Z',
                user_updated_at: '2024-01-01T00:00:00Z',
                is_active: true,
                role_details: {
                  id: 1,
                  name: 'Admin',
                  description: 'Administrator role',
                  display_order: 1,
                  user_count: 5,
                  is_active: true,
                  created_at: '2024-01-01T00:00:00Z'
                }
              },
              {
                id: 2,
                f_name: 'Jane',
                l_name: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+1987654321',
                profile_image_url: null,
                is_2fa_required: false,
                is_2fa_enabled: false,
                user_status: 'active',
                email_verified: true,
                phone_verified: true,
                email_verified_at: '2024-01-01T00:00:00Z',
                phone_verified_at: '2024-01-01T00:00:00Z',
                last_password_change: '2024-01-01T00:00:00Z',
                account_locked_until: null,
                user_created_at: '2024-01-01T00:00:00Z',
                user_updated_at: '2024-01-01T00:00:00Z',
                is_active: true,
                role_details: {
                  id: 2,
                  name: 'User',
                  description: 'Standard user role',
                  display_order: 2,
                  user_count: 10,
                  is_active: true,
                  created_at: '2024-01-01T00:00:00Z'
                }
              }
            ]
          },
          pagination: {
            current_page: 1,
            limit: 10,
            total_count: 2,
            total_pages: 1,
            has_next_page: false,
            has_prev_page: false
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await userManagementService.listAllUsers()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/list', {
        params: { page: 1, limit: 10 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch paginated user list with custom page and limit', async () => {
      const mockResponse: AxiosResponse<UserListApiResponse> = {
        data: {
          success: true,
          message: 'Users retrieved successfully',
          data: {
            users: []
          },
          pagination: {
            current_page: 2,
            limit: 5,
            total_count: 15,
            total_pages: 3,
            has_next_page: true,
            has_prev_page: true
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await userManagementService.listAllUsers(2, 5)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/list', {
        params: { page: 2, limit: 5 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching user list', async () => {
      const mockError = new Error('Failed to fetch users')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(userManagementService.listAllUsers()).rejects.toThrow('Failed to fetch users')
      expect(consoleSpy).toHaveBeenCalledWith('[UserManagementService] Failed to list users:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const mockUserData: UserCreationApiRequest = {
        f_name: 'Alice',
        l_name: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1122334455',
        role_id: 2,
        is_active: true,
        is_2fa_required: false,
        is_2fa_enabled: false,
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: false
          }
        ]
      }

      const mockResponse: AxiosResponse<UserCreationApiResponse> = {
        data: {
          success: true,
          message: 'User created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            userId: '3'
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await userManagementService.createUser(mockUserData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('', mockUserData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle user creation errors', async () => {
      const mockUserData: UserCreationApiRequest = {
        f_name: 'Bob',
        l_name: 'Brown',
        email: 'bob.brown@example.com',
        phone: '+1555666777',
        role_id: 3,
        is_active: true,
        is_2fa_required: false,
        is_2fa_enabled: false,
        module_assignments: []
      }

      const mockError = new Error('Email already exists')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(userManagementService.createUser(mockUserData)).rejects.toThrow('Email already exists')
      expect(consoleSpy).toHaveBeenCalledWith('[UserManagementService] Failed to create user:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getUserDetails', () => {
    it('should fetch full user details successfully', async () => {
      const userId = '1'
      const mockResponse: AxiosResponse<UserDetailsApiResponse> = {
        data: {
          success: true,
          message: 'User details retrieved successfully',
          data: {
            user_details: {
              id: 1,
              f_name: 'John',
              l_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '+1234567890',
              profile_image_url: null,
              is_2fa_required: false,
              is_2fa_enabled: false,
              user_status: 'active',
              email_verified: true,
              phone_verified: false,
              email_verified_at: '2024-01-01T00:00:00Z',
              phone_verified_at: null,
              last_password_change: '2024-01-01T00:00:00Z',
              account_locked_until: null,
              user_created_at: '2024-01-01T00:00:00Z',
              user_updated_at: '2024-01-01T00:00:00Z',
              is_active: true,
              role_details: {
                id: 1,
                name: 'Admin',
                description: 'Administrator role',
                display_order: 1,
                user_count: 5,
                is_active: true,
                created_at: '2024-01-01T00:00:00Z'
              }
            },
            user_statistics: {
              total_logins: 50,
              successful_logins: 48,
              failed_logins: 2,
              consecutive_failed_attempts: 0,
              first_login_at: '2024-01-01T00:00:00Z',
              last_successful_login_at: '2024-12-01T00:00:00Z',
              last_failed_login_at: '2024-11-15T00:00:00Z',
              last_login_ip: '192.168.1.1',
              last_user_agent: 'Mozilla/5.0',
              last_device_fingerprint: 'device123',
              active_sessions: 1,
              max_concurrent_sessions: 3,
              password_changes_count: 2,
              account_lockouts_count: 0,
              last_lockout_at: null
            },
            permissions: [
              {
                module_id: 1,
                module_name: 'User Management',
                can_create: true,
                can_read: true,
                can_update: true,
                can_delete: false,
                permission_expires_at: null
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

      const result = await userManagementService.getUserDetails(userId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/${userId}`, {
        params: { full: true }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching user details', async () => {
      const userId = '999'
      const mockError = new Error('User not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(userManagementService.getUserDetails(userId)).rejects.toThrow('User not found')
      expect(consoleSpy).toHaveBeenCalledWith('[UserManagementService] Failed to get user details:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getUserBasicDetails', () => {
    it('should fetch basic user details successfully', async () => {
      const userId = '2'
      const mockResponse: AxiosResponse<UserBasicDetailsApiResponse> = {
        data: {
          success: true,
          message: 'User basic details retrieved successfully',
          data: {
            user_details: {
              id: 2,
              f_name: 'Jane',
              l_name: 'Smith',
              email: 'jane.smith@example.com',
              phone: '+1987654321',
              profile_image_url: null,
              is_2fa_required: false,
              is_2fa_enabled: false,
              user_status: 'active',
              email_verified: true,
              phone_verified: true,
              email_verified_at: '2024-01-01T00:00:00Z',
              phone_verified_at: '2024-01-01T00:00:00Z',
              last_password_change: '2024-01-01T00:00:00Z',
              account_locked_until: null,
              user_created_at: '2024-01-01T00:00:00Z',
              user_updated_at: '2024-01-01T00:00:00Z',
              is_active: true,
              role_details: {
                id: 2,
                name: 'User',
                description: 'Standard user role',
                display_order: 2,
                user_count: 10,
                is_active: true,
                created_at: '2024-01-01T00:00:00Z'
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await userManagementService.getUserBasicDetails(userId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/${userId}`)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching basic user details', async () => {
      const userId = '999'
      const mockError = new Error('User not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(userManagementService.getUserBasicDetails(userId)).rejects.toThrow('User not found')
      expect(consoleSpy).toHaveBeenCalledWith('[UserManagementService] Failed to get user basic details:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('updateUser', () => {
    it('should update user successfully with partial data', async () => {
      const userId = '1'
      const mockUpdateData: UserUpdationApiRequest = {
        f_name: 'John Updated',
        is_active: false
      }

      const mockResponse: AxiosResponse<UserUpdationApiResponse> = {
        data: {
          success: true,
          message: 'User updated successfully',
          data: {
            userId: 1
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await userManagementService.updateUser(userId, mockUpdateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/${userId}`, mockUpdateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should update user with complete data including module assignments', async () => {
      const userId = '2'
      const mockUpdateData: UserUpdationApiRequest = {
        f_name: 'Jane',
        l_name: 'Smith Updated',
        email: 'jane.updated@example.com',
        phone: '+1987654321',
        role_id: 3,
        is_active: true,
        is_2fa_required: true,
        is_2fa_enabled: true,
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true
          },
          {
            module_id: '2',
            can_create: false,
            can_read: true,
            can_update: false,
            can_delete: false
          }
        ]
      }

      const mockResponse: AxiosResponse<UserUpdationApiResponse> = {
        data: {
          success: true,
          message: 'User updated successfully',
          data: {
            userId: 2
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await userManagementService.updateUser(userId, mockUpdateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/${userId}`, mockUpdateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle update errors', async () => {
      const userId = '1'
      const mockUpdateData: UserUpdationApiRequest = {
        email: 'duplicate@example.com'
      }

      const mockError = new Error('Email already exists')
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(userManagementService.updateUser(userId, mockUpdateData)).rejects.toThrow('Email already exists')
      expect(consoleSpy).toHaveBeenCalledWith('[UserManagementService] Failed to update user details:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = '5'
      const mockResponse: AxiosResponse<UserDeletionApiResponse> = {
        data: {
          success: true,
          message: 'User deleted successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            deletedUserId: 5,
            deletedByUserId: 1,
            deletedAt: '2024-01-01T00:00:00Z',
            cleanupSummary: {
              userAccount: 'Deleted',
              sessions: '2 sessions terminated',
              permissions: '5 permissions removed',
              twoFactorAuth: 'Removed',
              resetTokens: '1 tokens revoked'
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.delete.mockResolvedValue(mockResponse)

      const result = await userManagementService.deleteUser(userId)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/${userId}`)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle deletion errors', async () => {
      const userId = '999'
      const mockError = new Error('User not found')
      mockAxiosInstance.delete.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(userManagementService.deleteUser(userId)).rejects.toThrow('User not found')
      expect(consoleSpy).toHaveBeenCalledWith('[UserManagementService] Failed to delete user:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getUserPermissions', () => {
    it('should fetch user permissions summary successfully', async () => {
      const mockResponse: AxiosResponse<UserPermissionsSummaryApiResponse> = {
        data: {
          success: true,
          message: 'User permissions retrieved successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            user_id: '1',
            name: 'John Doe',
            role_id: 1,
            role_name: 'Admin',
            permissions: [
              {
                module_id: '1',
                module_name: 'User Management',
                module_code: 'USER_MGMT',
                role_can_create: true,
                role_can_read: true,
                role_can_update: true,
                role_can_delete: false,
                user_can_create: true,
                user_can_read: true,
                user_can_update: true,
                user_can_delete: true
              },
              {
                module_id: '2',
                module_name: 'Plan Management',
                module_code: 'PLAN_MGMT',
                role_can_create: false,
                role_can_read: true,
                role_can_update: false,
                role_can_delete: false,
                user_can_create: false,
                user_can_read: true,
                user_can_update: false,
                user_can_delete: false
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

      const result = await userManagementService.getUserPermissions()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/permissions/summary')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching user permissions', async () => {
      const mockError = new Error('Failed to fetch permissions')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(userManagementService.getUserPermissions()).rejects.toThrow('Failed to fetch permissions')
      expect(consoleSpy).toHaveBeenCalledWith('[UserManagementService] Failed to get users permissions summary:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling and Console Logging', () => {
    it('should log appropriate error messages for each method', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Generic API Error')

      const testCases = [
        {
          method: () => userManagementService.listAllUsers(),
          expectedMessage: '[UserManagementService] Failed to list users:'
        },
        {
          method: () => userManagementService.createUser({} as UserCreationApiRequest),
          expectedMessage: '[UserManagementService] Failed to create user:'
        },
        {
          method: () => userManagementService.getUserDetails('1'),
          expectedMessage: '[UserManagementService] Failed to get user details:'
        },
        {
          method: () => userManagementService.getUserBasicDetails('1'),
          expectedMessage: '[UserManagementService] Failed to get user basic details:'
        },
        {
          method: () => userManagementService.updateUser('1', {} as UserUpdationApiRequest),
          expectedMessage: '[UserManagementService] Failed to update user details:'
        },
        {
          method: () => userManagementService.deleteUser('1'),
          expectedMessage: '[UserManagementService] Failed to delete user:'
        },
        {
          method: () => userManagementService.getUserPermissions(),
          expectedMessage: '[UserManagementService] Failed to get users permissions summary:'
        }
      ]

      for (const testCase of testCases) {
        /* Reset mocks for each test case */
        mockAxiosInstance.get.mockRejectedValueOnce(mockError)
        mockAxiosInstance.post.mockRejectedValueOnce(mockError)
        mockAxiosInstance.put.mockRejectedValueOnce(mockError)
        mockAxiosInstance.delete.mockRejectedValueOnce(mockError)

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
    it('should accept correct parameter types for user creation', async () => {
      const validUserData: UserCreationApiRequest = {
        f_name: 'Test',
        l_name: 'User',
        email: 'test@example.com',
        phone: '+1234567890',
        role_id: 1,
        is_active: true,
        is_2fa_required: false,
        is_2fa_enabled: false,
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: true,
            can_update: false,
            can_delete: false
          }
        ]
      }

      const mockResponse: AxiosResponse<UserCreationApiResponse> = {
        data: {
          success: true,
          message: 'User created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            userId: '1'
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      await expect(userManagementService.createUser(validUserData)).resolves.toBeDefined()
    })

    it('should accept correct parameter types for user update', async () => {
      const validUpdateData: UserUpdationApiRequest = {
        f_name: 'Updated',
        email: 'updated@example.com'
      }

      const mockResponse: AxiosResponse<UserUpdationApiResponse> = {
        data: {
          success: true,
          message: 'User updated successfully',
          data: {
            userId: 1
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      await expect(userManagementService.updateUser('1', validUpdateData)).resolves.toBeDefined()
    })

    it('should accept string user IDs', async () => {
      const mockDetailsResponse: AxiosResponse<UserDetailsApiResponse> = {
        data: {
          success: true,
          message: 'User details retrieved successfully',
          data: {
            user_details: {
              id: 1,
              f_name: 'Test',
              l_name: 'User',
              email: 'test@example.com',
              phone: '+1234567890',
              profile_image_url: null,
              is_2fa_required: false,
              is_2fa_enabled: false,
              user_status: 'active',
              email_verified: true,
              phone_verified: true,
              email_verified_at: '2024-01-01T00:00:00Z',
              phone_verified_at: '2024-01-01T00:00:00Z',
              last_password_change: '2024-01-01T00:00:00Z',
              account_locked_until: null,
              user_created_at: '2024-01-01T00:00:00Z',
              user_updated_at: '2024-01-01T00:00:00Z',
              is_active: true,
              role_details: null
            },
            user_statistics: {
              total_logins: 10,
              successful_logins: 9,
              failed_logins: 1,
              consecutive_failed_attempts: 0,
              first_login_at: '2024-01-01T00:00:00Z',
              last_successful_login_at: '2024-01-02T00:00:00Z',
              last_failed_login_at: null,
              last_login_ip: '192.168.1.1',
              last_user_agent: 'Mozilla/5.0',
              last_device_fingerprint: null,
              active_sessions: 1,
              max_concurrent_sessions: 2,
              password_changes_count: 0,
              account_lockouts_count: 0,
              last_lockout_at: null
            },
            permissions: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      const mockBasicDetailsResponse: AxiosResponse<UserBasicDetailsApiResponse> = {
        data: {
          success: true,
          message: 'User basic details retrieved successfully',
          data: {
            user_details: {
              id: 1,
              f_name: 'Test',
              l_name: 'User',
              email: 'test@example.com',
              phone: '+1234567890',
              profile_image_url: null,
              is_2fa_required: false,
              is_2fa_enabled: false,
              user_status: 'active',
              email_verified: true,
              phone_verified: true,
              email_verified_at: '2024-01-01T00:00:00Z',
              phone_verified_at: '2024-01-01T00:00:00Z',
              last_password_change: '2024-01-01T00:00:00Z',
              account_locked_until: null,
              user_created_at: '2024-01-01T00:00:00Z',
              user_updated_at: '2024-01-01T00:00:00Z',
              is_active: true,
              role_details: null
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      const mockUpdateResponse: AxiosResponse<UserUpdationApiResponse> = {
        data: {
          success: true,
          message: 'User updated successfully',
          data: {
            userId: 1
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      const mockDeleteResponse: AxiosResponse<UserDeletionApiResponse> = {
        data: {
          success: true,
          message: 'User deleted successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            deletedUserId: 1,
            deletedByUserId: 1,
            deletedAt: '2024-01-01T00:00:00Z',
            cleanupSummary: {
              userAccount: 'Deleted',
              sessions: '2 sessions cleared',
              permissions: '5 permissions removed',
              twoFactorAuth: 'Disabled',
              resetTokens: '1 token cleared'
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockDetailsResponse)
      mockAxiosInstance.get.mockResolvedValueOnce(mockBasicDetailsResponse)
      mockAxiosInstance.put.mockResolvedValueOnce(mockUpdateResponse)
      mockAxiosInstance.delete.mockResolvedValueOnce(mockDeleteResponse)

      await expect(userManagementService.getUserDetails('123')).resolves.toBeDefined()
      await expect(userManagementService.getUserBasicDetails('456')).resolves.toBeDefined()
      await expect(userManagementService.updateUser('789', {} as UserUpdationApiRequest)).resolves.toBeDefined()
      await expect(userManagementService.deleteUser('999')).resolves.toBeDefined()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for list users', async () => {
      const mockResponse: AxiosResponse<UserListApiResponse> = {
        data: {
          success: true,
          message: 'Users retrieved successfully',
          data: {
            users: []
          },
          pagination: {
            current_page: 1,
            limit: 10,
            total_count: 1,
            total_pages: 1,
            has_next_page: false,
            has_prev_page: false
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await userManagementService.listAllUsers()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('users')
      expect(result).toHaveProperty('pagination')
      expect(result.pagination).toHaveProperty('current_page')
      expect(result.pagination).toHaveProperty('total_count')
    })

    it('should return proper response structure for create user', async () => {
      const mockResponse: AxiosResponse<UserCreationApiResponse> = {
        data: {
          success: true,
          message: 'User created successfully',
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            userId: '1'
          },
          validation_errors: []
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await userManagementService.createUser({} as UserCreationApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('userId')
    })

    it('should return proper response structure for user details', async () => {
      const mockResponse: AxiosResponse<UserDetailsApiResponse> = {
        data: {
          success: true,
          message: 'User details retrieved successfully',
          data: {
            user_details: {
              id: 1,
              f_name: 'Test',
              l_name: 'User',
              email: 'test@example.com',
              phone: '+1234567890',
              profile_image_url: null,
              is_2fa_required: false,
              is_2fa_enabled: false,
              user_status: 'active',
              email_verified: true,
              phone_verified: true,
              email_verified_at: '2024-01-01T00:00:00Z',
              phone_verified_at: '2024-01-01T00:00:00Z',
              last_password_change: '2024-01-01T00:00:00Z',
              account_locked_until: null,
              user_created_at: '2024-01-01T00:00:00Z',
              user_updated_at: '2024-01-01T00:00:00Z',
              is_active: true,
              role_details: null
            },
            user_statistics: {
              total_logins: 10,
              successful_logins: 9,
              failed_logins: 1,
              consecutive_failed_attempts: 0,
              first_login_at: '2024-01-01T00:00:00Z',
              last_successful_login_at: '2024-01-02T00:00:00Z',
              last_failed_login_at: null,
              last_login_ip: '192.168.1.1',
              last_user_agent: 'Mozilla/5.0',
              last_device_fingerprint: null,
              active_sessions: 1,
              max_concurrent_sessions: 2,
              password_changes_count: 0,
              account_lockouts_count: 0,
              last_lockout_at: null
            },
            permissions: []
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await userManagementService.getUserDetails('1')

      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('user_details')
      expect(result.data).toHaveProperty('user_statistics')
      expect(result.data).toHaveProperty('permissions')
    })
  })
})
