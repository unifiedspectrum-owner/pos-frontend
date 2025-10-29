/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

/* RBAC module imports */
import { ClientRouteGuard } from '../client-route-guard'

/* Mock dependencies */
vi.mock('@shared/contexts', () => ({
  usePermissions: vi.fn()
}))

vi.mock('@shared/components/common', () => ({
  FullPageLoader: vi.fn(() => <div data-testid="full-page-loader">Loading...</div>)
}))

vi.mock('@shared/config', () => ({
  getRoutePermission: vi.fn()
}))

vi.mock('@shared/layouts/admin', () => ({
  default: vi.fn(({ children }) => <div data-testid="admin-layout">{children}</div>)
}))

vi.mock('../forbidden-page', () => ({
  ForbiddenPage: vi.fn(({ module, permission }) => (
    <div data-testid="forbidden-page">
      <span data-testid="denied-module">{module}</span>
      <span data-testid="denied-permission">{permission}</span>
    </div>
  ))
}))

import { usePermissions } from '@shared/contexts'
import { getRoutePermission } from '@shared/config'

describe('ClientRouteGuard Component', () => {
  const mockHasModuleAccess = vi.fn()
  const mockHasSpecificPermission = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockHasModuleAccess.mockClear()
    mockHasSpecificPermission.mockClear()
  })

  describe('Loading State', () => {
    it('should show loader on initial load', () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: true,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      render(
        <ClientRouteGuard pathname="/admin/dashboard">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
    })

    it('should not show loader on subsequent navigation', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue(null)

      const { rerender } = render(
        <ClientRouteGuard pathname="/admin/dashboard">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      })

      /* Change pathname to simulate navigation */
      rerender(
        <ClientRouteGuard pathname="/admin/users">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      /* Should not show loader on subsequent navigation */
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    it('should not render children while loading initially', () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: true,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      render(
        <ClientRouteGuard pathname="/admin/dashboard">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show forbidden page on permission error', () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: 'Failed to fetch permissions',
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      render(
        <ClientRouteGuard pathname="/admin/dashboard">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
    })

    it('should wrap error page with admin layout for admin routes', () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: 'Network error',
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      render(
        <ClientRouteGuard pathname="/admin/users">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      expect(screen.getByTestId('admin-layout')).toBeInTheDocument()
      expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
    })

    it('should not wrap error page with admin layout for non-admin routes', () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: 'Network error',
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      render(
        <ClientRouteGuard pathname="/tenant/dashboard">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      expect(screen.queryByTestId('admin-layout')).not.toBeInTheDocument()
      expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
    })
  })

  describe('No Permission Required', () => {
    it('should render children when no permission required', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue(null)

      render(
        <ClientRouteGuard pathname="/admin/public-page">
          <div data-testid="content">Public Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    it('should not check permissions when route is public', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue(null)

      render(
        <ClientRouteGuard pathname="/public">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(mockHasModuleAccess).not.toHaveBeenCalled()
      expect(mockHasSpecificPermission).not.toHaveBeenCalled()
    })
  })

  describe('Module Access Denied', () => {
    it('should show forbidden page when module access denied', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(false)

      render(
        <ClientRouteGuard pathname="/admin/users">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
      })
    })

    it('should display denied module name', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'role-management',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(false)

      render(
        <ClientRouteGuard pathname="/admin/roles">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('denied-module')).toHaveTextContent('role-management')
      })
    })

    it('should not check specific permission when module access denied', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'UPDATE'
      })

      mockHasModuleAccess.mockReturnValue(false)

      render(
        <ClientRouteGuard pathname="/admin/users/edit/1">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
      })

      expect(mockHasSpecificPermission).not.toHaveBeenCalled()
    })
  })

  describe('Permission Denied', () => {
    it('should show forbidden page when specific permission denied', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'DELETE'
      })

      mockHasModuleAccess.mockReturnValue(true)
      mockHasSpecificPermission.mockReturnValue(false)

      render(
        <ClientRouteGuard pathname="/admin/users/delete/1">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
      })
    })

    it('should display denied permission', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'UPDATE'
      })

      mockHasModuleAccess.mockReturnValue(true)
      mockHasSpecificPermission.mockReturnValue(false)

      render(
        <ClientRouteGuard pathname="/admin/users/edit/1">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        /* Permission is displayed as uppercase PermissionTypes value */
        expect(screen.getByTestId('denied-permission')).toHaveTextContent('UPDATE')
      })
    })

    it('should call hasSpecificPermission with correct parameters', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'role-management',
        permission: 'CREATE'
      })

      mockHasModuleAccess.mockReturnValue(true)
      mockHasSpecificPermission.mockReturnValue(true)

      render(
        <ClientRouteGuard pathname="/admin/roles/create">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(mockHasSpecificPermission).toHaveBeenCalledWith('role-management', 'CREATE')
      })
    })
  })

  describe('Access Granted', () => {
    it('should render children when access granted', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(true)
      mockHasSpecificPermission.mockReturnValue(true)

      render(
        <ClientRouteGuard pathname="/admin/users">
          <div data-testid="content">Protected Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    it('should not show forbidden page when access granted', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(true)
      mockHasSpecificPermission.mockReturnValue(true)

      render(
        <ClientRouteGuard pathname="/admin/users">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('forbidden-page')).not.toBeInTheDocument()
      })
    })

    it('should check both module and permission', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'plan-management',
        permission: 'UPDATE'
      })

      mockHasModuleAccess.mockReturnValue(true)
      mockHasSpecificPermission.mockReturnValue(true)

      render(
        <ClientRouteGuard pathname="/admin/plans/edit/1">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(mockHasModuleAccess).toHaveBeenCalledWith('plan-management')
        expect(mockHasSpecificPermission).toHaveBeenCalledWith('plan-management', 'UPDATE')
      })
    })
  })

  describe('Admin Layout Wrapping', () => {
    it('should wrap forbidden page with admin layout for admin routes', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(false)

      render(
        <ClientRouteGuard pathname="/admin/users">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('admin-layout')).toBeInTheDocument()
      })
    })

    it('should not wrap for non-admin routes', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'tenant-dashboard',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(false)

      render(
        <ClientRouteGuard pathname="/tenant/dashboard">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('admin-layout')).not.toBeInTheDocument()
      })
    })
  })

  describe('Pathname Changes', () => {
    it('should re-check permissions on pathname change', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(true)
      mockHasSpecificPermission.mockReturnValue(true)

      const { rerender } = render(
        <ClientRouteGuard pathname="/admin/users">
          <div data-testid="content">Users</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'role-management',
        permission: 'READ'
      })

      rerender(
        <ClientRouteGuard pathname="/admin/roles">
          <div data-testid="content">Roles</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(mockHasModuleAccess).toHaveBeenCalledWith('role-management')
      })
    })

    it('should update access decision on pathname change', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'user-management',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(true)
      mockHasSpecificPermission.mockReturnValue(true)

      const { rerender } = render(
        <ClientRouteGuard pathname="/admin/users">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      vi.mocked(getRoutePermission).mockReturnValue({
        module: 'admin-only',
        permission: 'READ'
      })

      mockHasModuleAccess.mockReturnValue(false)

      rerender(
        <ClientRouteGuard pathname="/admin/restricted">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty pathname', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue(null)

      render(
        <ClientRouteGuard pathname="">
          <div data-testid="content">Content</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    it('should handle null children', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue(null)

      /* Component should render without crashing when children is null */
      expect(() => {
        render(
          <ClientRouteGuard pathname="/admin/dashboard">
            {null}
          </ClientRouteGuard>
        )
      }).not.toThrow()

      /* Wait a bit for any async operations */
      await waitFor(() => {
        expect(true).toBe(true)
      })
    })

    it('should handle multiple children', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        loading: false,
        error: null,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        refreshPermissions: vi.fn()
      })

      vi.mocked(getRoutePermission).mockReturnValue(null)

      render(
        <ClientRouteGuard pathname="/admin/dashboard">
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ClientRouteGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('child1')).toBeInTheDocument()
        expect(screen.getByTestId('child2')).toBeInTheDocument()
      })
    })
  })
})
