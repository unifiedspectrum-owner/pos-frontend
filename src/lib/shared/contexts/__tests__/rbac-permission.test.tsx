/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import type { Mock } from 'vitest'

/* Shared module imports */
import { PermissionProvider, usePermissions } from '@shared/contexts/rbac-permission'

/* User management module imports */
import type { UserPermissionsSummaryApiResponse, UsersFullPermissions } from '@user-management/types'

/* Helper function to create mock permission response */
const createMockPermissionResponse = (permissions: UsersFullPermissions[] = []): UserPermissionsSummaryApiResponse => ({
  success: true,
  message: 'Permissions retrieved successfully',
  timestamp: new Date().toISOString(),
  data: {
    user_id: '1',
    name: 'Test User',
    role_id: 1,
    role_name: 'Admin',
    permissions
  }
})

/* Hoisted mock functions */
const { mockGetUserPermissions, mockUsePathname } = vi.hoisted(() => ({
  mockGetUserPermissions: vi.fn(),
  mockUsePathname: vi.fn(() => '/admin/dashboard')
}))

/* Mock user management service */
vi.mock('@user-management/api', () => ({
  userManagementService: {
    getUserPermissions: mockGetUserPermissions
  }
}))

/* Mock next/navigation */
vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname
}))

/* Mock API error handler */
vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

describe('rbac-permission context', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn> | undefined

  beforeEach(() => {
    /* Suppress console logs */
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    /* Reset mocks */
    mockGetUserPermissions.mockReset()
    mockUsePathname.mockReturnValue('/admin/dashboard')
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleSpy?.mockRestore()
  })

  describe('PermissionProvider', () => {
    it('should render children', () => {
      render(
        <PermissionProvider>
          <div data-testid="test-child">Test Child</div>
        </PermissionProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide context value to children', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([]))

      const TestComponent = () => {
        const context = usePermissions()
        return <div data-testid="context-check">{context ? 'Context Available' : 'No Context'}</div>
      }

      render(
        <PermissionProvider>
          <TestComponent />
        </PermissionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Context Available')).toBeInTheDocument()
      })
    })

    it('should initialize with loading state', () => {
      mockGetUserPermissions.mockImplementation(() => new Promise(() => {}))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      expect(result.current.loading).toBe(true)
      expect(result.current.permissions).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should fetch permissions on mount', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: true,
          role_can_read: true,
          role_can_update: true,
          role_can_delete: false,
          user_can_create: true,
          user_can_read: true,
          user_can_update: true,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockGetUserPermissions).toHaveBeenCalled()
      expect(result.current.permissions).toHaveLength(1)
    })
  })

  describe('usePermissions hook', () => {
    it('should throw error when used outside provider', () => {
      /* Suppress console.error for this test */
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => usePermissions())
      }).toThrow('usePermissions must be used within a PermissionProvider')

      errorSpy.mockRestore()
    })

    it('should return context when used inside provider', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current).toBeDefined()
      expect(result.current.permissions).toEqual([])
      expect(result.current.hasModuleAccess).toBeTypeOf('function')
      expect(result.current.hasSpecificPermission).toBeTypeOf('function')
      expect(result.current.refreshPermissions).toBeTypeOf('function')
    })
  })

  describe('Permission fetching', () => {
    it('should set permissions on successful fetch', async () => {
      const mockPermissions = [
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: true,
          role_can_read: true,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: true,
          user_can_update: false,
          user_can_delete: false
        }
      ]

      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse(mockPermissions))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.permissions).toEqual(mockPermissions)
      expect(result.current.error).toBeNull()
    })

    it('should handle empty permissions response', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.permissions).toEqual([])
    })

    it('should handle missing permissions in response', async () => {
      mockGetUserPermissions.mockResolvedValue({
        ...createMockPermissionResponse([]),
        data: {
          user_id: '1',
          name: 'Test User',
          role_id: 1,
          role_name: 'Admin',
          permissions: undefined as unknown as UsersFullPermissions[]
        }
      })

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.permissions).toEqual([])
    })

    it('should handle null response', async () => {
      mockGetUserPermissions.mockResolvedValue(null as unknown as UserPermissionsSummaryApiResponse)

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.permissions).toEqual([])
    })

    it('should handle error during fetch', async () => {
      const mockError = new Error('Failed to fetch permissions')
      mockGetUserPermissions.mockRejectedValue(mockError)

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch permissions')
      expect(result.current.permissions).toEqual([])
    })

    it('should refetch permissions on pathname change', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([]))

      const { rerender } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(mockGetUserPermissions).toHaveBeenCalledTimes(1)
      })

      /* Change pathname */
      mockUsePathname.mockReturnValue('/admin/users')

      rerender()

      await waitFor(() => {
        expect(mockGetUserPermissions).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('hasModuleAccess function', () => {
    it('should return true when user has read permission', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: false,
          role_can_read: true,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasModuleAccess('user-management')).toBe(true)
    })

    it('should return true when user has any permission', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: false,
          role_can_read: false,
          role_can_update: false,
          role_can_delete: true,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasModuleAccess('user-management')).toBe(true)
    })

    it('should return false when module not found', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasModuleAccess('non-existent-module')).toBe(false)
    })

    it('should return false when user has no permissions', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: false,
          role_can_read: false,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasModuleAccess('user-management')).toBe(false)
    })
  })

  describe('hasSpecificPermission function', () => {
    it('should return true for CREATE permission when role has it', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: true,
          role_can_read: false,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasSpecificPermission('user-management', 'CREATE')).toBe(true)
    })

    it('should return true for CREATE permission when user has it', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: false,
          role_can_read: false,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: true,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasSpecificPermission('user-management', 'CREATE')).toBe(true)
    })

    it('should return true for READ permission', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: false,
          role_can_read: true,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasSpecificPermission('user-management', 'READ')).toBe(true)
    })

    it('should return true for UPDATE permission', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: false,
          role_can_read: false,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: true,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasSpecificPermission('user-management', 'UPDATE')).toBe(true)
    })

    it('should return true for DELETE permission', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: false,
          role_can_read: false,
          role_can_update: false,
          role_can_delete: true,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasSpecificPermission('user-management', 'DELETE')).toBe(true)
    })

    it('should return false when module not found', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasSpecificPermission('non-existent', 'CREATE')).toBe(false)
    })

    it('should return false when permission not granted', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: false,
          role_can_read: true,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasSpecificPermission('user-management', 'CREATE')).toBe(false)
    })
  })

  describe('refreshPermissions function', () => {
    it('should manually refresh permissions', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockGetUserPermissions).toHaveBeenCalledTimes(1)

      await act(async () => {
        await result.current.refreshPermissions()
      })

      expect(mockGetUserPermissions).toHaveBeenCalledTimes(2)
    })

    it('should update permissions after refresh', async () => {
      mockGetUserPermissions.mockResolvedValueOnce(createMockPermissionResponse([]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.permissions).toHaveLength(0)

      const newPermissions = [
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: true,
          role_can_read: true,
          role_can_update: true,
          role_can_delete: true,
          user_can_create: true,
          user_can_read: true,
          user_can_update: true,
          user_can_delete: true
        }
      ]

      mockGetUserPermissions.mockResolvedValueOnce(createMockPermissionResponse(newPermissions))

      await act(async () => {
        await result.current.refreshPermissions()
      })

      await waitFor(() => {
        expect(result.current.permissions).toHaveLength(1)
      })
    })

    it('should set loading state during refresh', async () => {
      /* First allow initial mount to complete */
      mockGetUserPermissions.mockResolvedValueOnce(createMockPermissionResponse([]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      /* Now set up a never-resolving promise for the refresh */
      mockGetUserPermissions.mockImplementation(() => new Promise(() => {}))

      act(() => {
        result.current.refreshPermissions()
      })

      expect(result.current.loading).toBe(true)
    })
  })

  describe('Multiple modules', () => {
    it('should handle permissions for multiple modules', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: true,
          role_can_read: true,
          role_can_update: false,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        },
        {
          module_id: '2',
          module_name: 'Role Management',
          module_code: 'role-management',
          role_can_create: false,
          role_can_read: true,
          role_can_update: true,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.hasModuleAccess('user-management')).toBe(true)
      expect(result.current.hasModuleAccess('role-management')).toBe(true)
      expect(result.current.hasSpecificPermission('user-management', 'CREATE')).toBe(true)
      expect(result.current.hasSpecificPermission('role-management', 'UPDATE')).toBe(true)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete permission workflow', async () => {
      mockGetUserPermissions.mockResolvedValue(createMockPermissionResponse([
        {
          module_id: '1',
          module_name: 'User Management',
          module_code: 'user-management',
          role_can_create: true,
          role_can_read: true,
          role_can_update: true,
          role_can_delete: false,
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: true
        }
      ]))

      const { result } = renderHook(() => usePermissions(), {
        wrapper: PermissionProvider
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      /* Check module access */
      expect(result.current.hasModuleAccess('user-management')).toBe(true)

      /* Check specific permissions */
      expect(result.current.hasSpecificPermission('user-management', 'CREATE')).toBe(true)
      expect(result.current.hasSpecificPermission('user-management', 'READ')).toBe(true)
      expect(result.current.hasSpecificPermission('user-management', 'UPDATE')).toBe(true)
      expect(result.current.hasSpecificPermission('user-management', 'DELETE')).toBe(true)
    })
  })
})
