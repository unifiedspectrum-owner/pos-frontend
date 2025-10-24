/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* User module imports */
import UserManagement from '@user-management/pages/home'
import * as useUsersHook from '@user-management/hooks/use-users'
import { UserAccountDetails } from '@user-management/types'
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
      <button onClick={handleAdd} disabled={loading}>Add User</button>
      <button onClick={handleRefresh} disabled={loading} role="button" aria-label="refresh">Refresh</button>
    </div>
  ),
  ErrorMessageContainer: ({ error, title, onRetry, isRetrying }: any) => (
    <div data-testid="user-management-error">
      <div>{title}</div>
      <div>{error}</div>
      <button onClick={onRetry} disabled={isRetrying}>Retry</button>
    </div>
  )
}))

vi.mock('@user-management/tables/users', () => ({
  default: vi.fn(({ users, loading }) => (
    <div data-testid="user-table">
      {loading ? 'Loading...' : `${users.length} users`}
    </div>
  ))
}))

describe('UserManagement Home Page', () => {
  const mockUsers: UserAccountDetails[] = [
    {
      id: 1,
      f_name: 'John',
      l_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      profile_image_url: null,
      user_status: 'active',
      is_2fa_required: false,
      is_2fa_enabled: false,
      is_active: true,
      email_verified: true,
      phone_verified: true,
      email_verified_at: '2024-01-01T00:00:00Z',
      phone_verified_at: '2024-01-01T00:00:00Z',
      last_password_change: null,
      account_locked_until: null,
      user_created_at: '2024-01-01T00:00:00Z',
      user_updated_at: '2024-01-01T00:00:00Z',
      role_details: {
        id: 1,
        name: 'Admin',
        description: 'Administrator',
        display_order: 1,
        user_count: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    }
  ]

  const mockPagination: PaginationInfo = {
    current_page: 1,
    total_pages: 1,
    limit: 10,
    total_count: 1,
    has_next_page: false,
    has_prev_page: false
  }

  const defaultHookReturn = {
    users: mockUsers,
    userSelectOptions: [],
    loading: false,
    error: null,
    lastUpdated: '2024-01-01T00:00:00Z',
    pagination: mockPagination,
    fetchUsers: vi.fn(),
    refetch: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useUsersHook, 'useUsers').mockReturnValue(defaultHookReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  it('should render the user management page', () => {
    render(<UserManagement />, { wrapper: TestWrapper })

    expect(screen.getByTestId('user-table')).toBeInTheDocument()
  })

  it('should display user table with users', () => {
    render(<UserManagement />, { wrapper: TestWrapper })

    expect(screen.getByText('1 users')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    vi.spyOn(useUsersHook, 'useUsers').mockReturnValue({
      ...defaultHookReturn,
      loading: true
    })

    render(<UserManagement />, { wrapper: TestWrapper })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when error occurs', () => {
    vi.spyOn(useUsersHook, 'useUsers').mockReturnValue({
      ...defaultHookReturn,
      error: 'Failed to load users'
    })

    render(<UserManagement />, { wrapper: TestWrapper })

    expect(screen.getByText('Error Loading Users')).toBeInTheDocument()
  })

  it('should call refetch when refresh is triggered', async () => {
    const mockRefetch = vi.fn()
    vi.spyOn(useUsersHook, 'useUsers').mockReturnValue({
      ...defaultHookReturn,
      refetch: mockRefetch
    })

    render(<UserManagement />, { wrapper: TestWrapper })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await userEvent.click(refreshButton)

    expect(mockRefetch).toHaveBeenCalled()
  })
})
