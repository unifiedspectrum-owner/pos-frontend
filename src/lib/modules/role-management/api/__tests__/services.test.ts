/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Role management module imports */
import type { RoleCreationRequest, RoleCreationResponse, RoleUpdateRequest, RoleUpdateResponse, RoleDeletionResponse, RoleListResponse, RoleDetailsResponse, ModulesListResponse, RolePermissionsListResponse } from '@role-management/types'
import { ROLE_API_ROUTES, MODULE_API_ROUTES } from '@role-management/constants'

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
vi.mock('@role-management/api/client', () => ({
  roleApiClient: mockAxiosInstance
}))

describe('roleManagementService', () => {
  let roleManagementService: typeof import('@role-management/api/services').roleManagementService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@role-management/api/services')
    roleManagementService = module.roleManagementService
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
    it('should have roleManagementService with all required methods', () => {
      expect(roleManagementService).toBeDefined()
      expect(roleManagementService.listAllRoles).toBeTypeOf('function')
      expect(roleManagementService.listAllModules).toBeTypeOf('function')
      expect(roleManagementService.listAllRolePermissions).toBeTypeOf('function')
      expect(roleManagementService.createRole).toBeTypeOf('function')
      expect(roleManagementService.getRoleDetails).toBeTypeOf('function')
      expect(roleManagementService.updateRole).toBeTypeOf('function')
      expect(roleManagementService.deleteRole).toBeTypeOf('function')
    })
  })

  describe('listAllRoles', () => {
    it('should fetch roles successfully with pagination', async () => {
      const mockResponse: AxiosResponse<RoleListResponse> = {
        data: {
          success: true,
          message: 'Roles retrieved successfully',
          data: {
            roles: [
              {
                id: 1,
                name: 'Admin',
                description: 'Administrator role',
                display_order: 1,
                user_count: 5,
                is_active: true,
                created_at: '2024-01-01T00:00:00Z'
              }
            ]
          },
          pagination: {
            current_page: 1,
            total_pages: 1,
            limit: 10,
            total_count: 1,
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

      const result = await roleManagementService.listAllRoles(1, 10)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ROLE_API_ROUTES.LIST, {
        params: { page: 1, limit: 10 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch roles without pagination parameters', async () => {
      const mockResponse: AxiosResponse<RoleListResponse> = {
        data: {
          success: true,
          message: 'Roles retrieved successfully',
          data: { roles: [] },
          pagination: {
            current_page: 1,
            total_pages: 1,
            limit: 10,
            total_count: 0,
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

      const result = await roleManagementService.listAllRoles()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ROLE_API_ROUTES.LIST, {
        params: { page: undefined, limit: undefined }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching roles fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(roleManagementService.listAllRoles(1, 10)).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[RoleManagementService] Failed to list roles:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('listAllModules', () => {
    it('should fetch modules successfully with pagination', async () => {
      const mockResponse: AxiosResponse<ModulesListResponse> = {
        data: {
          success: true,
          message: 'Modules retrieved successfully',
          data: {
            modules: [
              {
                id: 1,
                name: 'Users',
                description: 'User Management',
                display_order: 1,
                is_active: true
              }
            ]
          },
          pagination: {
            current_page: 1,
            total_pages: 1,
            limit: 10,
            total_count: 1,
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

      const result = await roleManagementService.listAllModules(1, 10)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(MODULE_API_ROUTES.LIST, {
        params: { page: 1, limit: 10 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching modules fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(roleManagementService.listAllModules(1, 10)).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[RoleManagementService] Failed to list modules:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('listAllRolePermissions', () => {
    it('should fetch role permissions successfully', async () => {
      const mockResponse: AxiosResponse<RolePermissionsListResponse> = {
        data: {
          success: true,
          message: 'Role permissions retrieved successfully',
          data: {
            permissions: [
              {
                id: 1,
                role_id: 1,
                module_id: 1,
                can_create: 1,
                can_read: 1,
                can_update: 1,
                can_delete: 1,
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

      const result = await roleManagementService.listAllRolePermissions()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ROLE_API_ROUTES.PERMISSIONS)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching role permissions fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(roleManagementService.listAllRolePermissions()).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[RoleManagementService] Failed to list role permissions:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('createRole', () => {
    it('should create role successfully', async () => {
      const roleData: RoleCreationRequest = {
        name: 'New Role',
        description: 'New role description',
        is_active: true,
        module_assignments: [
          { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false }
        ]
      }

      const mockResponse: AxiosResponse<RoleCreationResponse> = {
        data: {
          success: true,
          message: 'Role created successfully',
          data: { roleId: '3' },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await roleManagementService.createRole(roleData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(ROLE_API_ROUTES.CREATE, roleData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when creating role fails', async () => {
      const roleData: RoleCreationRequest = {
        name: 'New Role',
        description: 'New role description',
        is_active: true
      }

      const mockError = new Error('Network error')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(roleManagementService.createRole(roleData)).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[RoleManagementService] Failed to create role:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getRoleDetails', () => {
    it('should fetch role details successfully', async () => {
      const mockResponse: AxiosResponse<RoleDetailsResponse> = {
        data: {
          success: true,
          message: 'Role details retrieved successfully',
          data: {
            role: {
              id: 1,
              name: 'Admin',
              description: 'Administrator role',
              display_order: 1,
              user_count: 5,
              is_active: true,
              created_at: '2024-01-01T00:00:00Z'
            },
            permissions: []
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await roleManagementService.getRoleDetails('1')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ROLE_API_ROUTES.DETAILS.replace(':id', '1'))
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching role details fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(roleManagementService.getRoleDetails('1')).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[RoleManagementService] Failed to get role details:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      const updateData: RoleUpdateRequest = {
        name: 'Updated Role',
        description: 'Updated description',
        is_active: false
      }

      const mockResponse: AxiosResponse<RoleUpdateResponse> = {
        data: {
          success: true,
          message: 'Role updated successfully',
          data: { roleId: '1' },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      const result = await roleManagementService.updateRole('1', updateData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(ROLE_API_ROUTES.UPDATE.replace(':id', '1'), updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when updating role fails', async () => {
      const updateData: RoleUpdateRequest = {
        name: 'Updated Role'
      }

      const mockError = new Error('Network error')
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(roleManagementService.updateRole('1', updateData)).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[RoleManagementService] Failed to update role:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      const mockResponse: AxiosResponse<RoleDeletionResponse> = {
        data: {
          success: true,
          message: 'Role deleted successfully',
          data: { userId: '1' },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.delete.mockResolvedValue(mockResponse)

      const result = await roleManagementService.deleteRole('1')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(ROLE_API_ROUTES.DELETE.replace(':id', '1'))
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when deleting role fails', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.delete.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(roleManagementService.deleteRole('1')).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[RoleManagementService] Failed to delete role:', mockError)

      consoleSpy.mockRestore()
    })
  })
})
