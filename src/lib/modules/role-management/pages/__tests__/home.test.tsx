/* Comprehensive test suite for RoleManagement home page */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Role module imports */
import RoleManagement from '@role-management/pages/home'
import * as useRolesHook from '@role-management/hooks/use-roles'
import { Role } from '@role-management/types'
import { PaginationInfo } from '@shared/types'

/* Mock dependencies */
vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }))
}))

vi.mock('@shared/contexts', () => ({
  usePermissions: vi.fn(() => ({
    hasSpecificPermission: vi.fn(() => true)
  }))
}))

vi.mock('@shared/components', () => ({
  HeaderSection: ({ loading, handleAdd, handleRefresh }: any) => (
    <div data-testid="header-section">
      <button onClick={handleAdd} disabled={loading}>Add Role</button>
      <button onClick={handleRefresh} disabled={loading} role="button" aria-label="refresh">Refresh</button>
    </div>
  ),
  ErrorMessageContainer: ({ error, title, onRetry, isRetrying }: any) => (
    <div data-testid="role-management-error">
      <div>{title}</div>
      <div>{error}</div>
      <button onClick={onRetry} disabled={isRetrying}>Retry</button>
    </div>
  )
}))

vi.mock('@role-management/tables', () => ({
  RoleTable: vi.fn(({ roles, loading }) => (
    <div data-testid="role-table">
      {loading ? 'Loading...' : `${roles.length} roles`}
    </div>
  ))
}))

describe('RoleManagement Home Page', () => {
  const mockRoles: Role[] = [
    {
      id: 1,
      name: 'Admin',
      description: 'Administrator role',
      display_order: 1,
      user_count: 5,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Manager role',
      display_order: 2,
      user_count: 3,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z'
    }
  ]

  const mockPagination: PaginationInfo = {
    current_page: 1,
    total_pages: 1,
    limit: 10,
    total_count: 2,
    has_next_page: false,
    has_prev_page: false
  }

  const defaultHookReturn = {
    roles: mockRoles,
    roleOptions: [],
    roleSelectOptions: [],
    rolePermissions: [],
    loading: false,
    permissionsLoading: false,
    error: null,
    permissionsError: null,
    lastUpdated: '2024-01-01T00:00:00Z',
    pagination: mockPagination,
    fetchRoles: vi.fn(),
    fetchRolePermissions: vi.fn(),
    refetch: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useRolesHook, 'useRoles').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering', () => {
    it('should render the page with header and role table', () => {
      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByTestId('header-section')).toBeInTheDocument()
      expect(screen.getByTestId('role-table')).toBeInTheDocument()
    })

    it('should display roles in the table', () => {
      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByText('2 roles')).toBeInTheDocument()
    })

    it('should show loading state when fetching roles', () => {
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        loading: true
      })

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should display error message when fetch fails', () => {
      const errorMessage = 'Failed to fetch roles'
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        error: errorMessage
      })

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByTestId('role-management-error')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText('Error Loading Roles')).toBeInTheDocument()
    })

    it('should render empty state when no roles', () => {
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        roles: []
      })

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByText('0 roles')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call router.push when add button is clicked', async () => {
      const mockPush = vi.fn()
      const { useRouter } = await import('@/i18n/navigation')
      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn()
      } as any)

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      const addButton = screen.getByText('Add Role')
      await userEvent.click(addButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/role-management/create')
    })

    it('should call refetch when refresh button is clicked', async () => {
      const mockRefetch = vi.fn()
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        refetch: mockRefetch
      })

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await userEvent.click(refreshButton)

      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('should call fetchRoles when retry is clicked on error', async () => {
      const mockFetchRoles = vi.fn()
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        error: 'Network error',
        fetchRoles: mockFetchRoles
      })

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      const retryButton = screen.getByText('Retry')
      await userEvent.click(retryButton)

      expect(mockFetchRoles).toHaveBeenCalledTimes(1)
    })

    it('should disable add button when loading', () => {
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        loading: true
      })

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      const addButton = screen.getByText('Add Role')
      expect(addButton).toBeDisabled()
    })

    it('should disable refresh button when loading', () => {
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        loading: true
      })

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Permissions', () => {
    it('should show add button when user has create permission', () => {
      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByText('Add Role')).toBeInTheDocument()
    })
  })

  describe('Data Updates', () => {
    it('should update when roles data changes', async () => {
      const { rerender } = render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByText('2 roles')).toBeInTheDocument()

      /* Update mock to return different data */
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        roles: [mockRoles[0]]
      })

      rerender(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('1 roles')).toBeInTheDocument()
      })
    })

    it('should handle transition from error to success state', async () => {
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        error: 'Network error'
      })

      const { rerender } = render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByTestId('role-management-error')).toBeInTheDocument()

      /* Clear error */
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultHookReturn,
        error: null
      })

      rerender(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('role-management-error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Integration with RoleTable', () => {
    it('should render RoleTable component', () => {
      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      expect(screen.getByTestId('role-table')).toBeInTheDocument()
      expect(screen.getByText('2 roles')).toBeInTheDocument()
    })
  })

  describe('Console Logging', () => {
    it('should log refresh message when handleRefresh is called', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      render(
        <Provider>
          <RoleManagement />
        </Provider>
      )

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await userEvent.click(refreshButton)

      expect(consoleSpy).toHaveBeenCalledWith('[RoleManagement] Role data refreshed successfully')

      consoleSpy.mockRestore()
    })
  })
})
