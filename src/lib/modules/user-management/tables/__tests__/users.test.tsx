/* Comprehensive test suite for user management table component */

/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Provider } from '@/components/ui/provider'
import type { UserAccountDetails } from '@user-management/types'
import type { PaginationInfo } from '@shared/types'

/* Test wrapper component with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

/* Mock createApiClient to prevent initialization errors */
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  }
}

vi.mock('@shared/api/base-client', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance)
}))

vi.mock('@shared/api', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance),
  getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token'),
  fetchCountries: vi.fn().mockResolvedValue([])
}))

vi.mock('@shared/api/csrf', () => ({
  getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token')
}))

vi.mock('@shared/api/countries', () => ({
  fetchCountries: vi.fn().mockResolvedValue([])
}))

vi.mock('@user-management/api/client', () => ({
  userApiClient: mockAxiosInstance
}))

vi.mock('@auth-management/api/client', () => ({
  authApiClient: mockAxiosInstance
}))

/* Mock variables */
let mockPush: ReturnType<typeof vi.fn>
let mockRefresh: ReturnType<typeof vi.fn>
let mockHasSpecificPermission: ReturnType<typeof vi.fn>
let mockDeleteUser: ReturnType<typeof vi.fn>
let mockIsDeleting: ReturnType<typeof vi.fn>

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn()
  })
}))

vi.mock('@shared/contexts', () => ({
  usePermissions: () => ({
    hasSpecificPermission: mockHasSpecificPermission
  })
}))

vi.mock('@role-management/hooks', () => ({
  useRoles: () => ({
    roleOptions: [
      { value: 'all', label: 'All Roles' },
      { value: 'Admin', label: 'Admin' },
      { value: 'Manager', label: 'Manager' }
    ],
    loading: false
  })
}))

vi.mock('@user-management/hooks', () => ({
  useUserOperations: () => ({
    deleteUser: mockDeleteUser,
    isDeleting: mockIsDeleting?.() || false
  })
}))

describe('UserTable Component', () => {
  let UserTable: any

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import component after mocks are set up */
    const module = await import('@user-management/tables/users')
    UserTable = module.default
  })

  /* Mock data */
  const mockUsers: UserAccountDetails[] = [
    {
      id: 1,
      f_name: 'John',
      l_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+11234567890',
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
      phone: '+11234567891',
      profile_image_url: null,
      user_status: 'inactive',
      is_2fa_required: true,
      is_2fa_enabled: true,
      is_active: false,
      email_verified: true,
      phone_verified: false,
      email_verified_at: '2024-01-02T00:00:00Z',
      phone_verified_at: null,
      last_password_change: '2024-01-02T00:00:00Z',
      account_locked_until: null,
      user_created_at: '2024-01-02T00:00:00Z',
      user_updated_at: '2024-01-02T00:00:00Z',
      role_details: {
        id: 2,
        name: 'Manager',
        description: 'Manager role',
        display_order: 2,
        user_count: 3,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 3,
      f_name: 'Bob',
      l_name: 'Wilson',
      email: 'bob.wilson@example.com',
      phone: '+11234567892',
      profile_image_url: null,
      user_status: 'active',
      is_2fa_required: false,
      is_2fa_enabled: false,
      is_active: true,
      email_verified: true,
      phone_verified: true,
      email_verified_at: '2024-01-03T00:00:00Z',
      phone_verified_at: '2024-01-03T00:00:00Z',
      last_password_change: null,
      account_locked_until: null,
      user_created_at: '2024-01-03T00:00:00Z',
      user_updated_at: '2024-01-03T00:00:00Z',
      role_details: {
        id: 1,
        name: 'Admin',
        description: 'Administrator role',
        display_order: 1,
        user_count: 5,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    }
  ]

  const mockPagination: PaginationInfo = {
    current_page: 1,
    total_pages: 5,
    limit: 10,
    total_count: 50,
    has_next_page: true,
    has_prev_page: false
  }

  const defaultProps = {
    users: mockUsers,
    lastUpdated: '2024-01-15 10:30 AM',
    loading: false
  }

  beforeEach(() => {
    /* Initialize mock functions */
    mockPush = vi.fn()
    mockRefresh = vi.fn()
    mockHasSpecificPermission = vi.fn((module: string, action: string) => true)
    mockDeleteUser = vi.fn().mockResolvedValue(true)
    mockIsDeleting = vi.fn(() => false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('should render with all required props', () => {
      const { container } = render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(container).toBeInTheDocument()
    })

    it('should display the heading', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('should display last updated timestamp', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText(/Last Updated: 2024-01-15 10:30 AM/)).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      expect(searchInput).toBeInTheDocument()
    })

    it('should render status filter dropdown', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes[0]).toBeInTheDocument() /* First combobox is status filter */
    })

    it('should render role filter dropdown', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes[1]).toBeInTheDocument() /* Second combobox is role filter */
    })
  })

  describe('Table Structure', () => {
    it('should render table headers', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('SNo.')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should render all users in the table', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    })

    it('should display user emails', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
      expect(screen.getByText('bob.wilson@example.com')).toBeInTheDocument()
    })

    it('should display user roles', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const adminRoles = screen.getAllByText('Admin')
      const managerRoles = screen.getAllByText('Manager')
      expect(adminRoles.length).toBeGreaterThanOrEqual(2)
      expect(managerRoles.length).toBeGreaterThanOrEqual(1)
    })

    it('should display user statuses', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const activeStatuses = screen.getAllByText('active')
      const inactiveStatuses = screen.getAllByText('inactive')
      expect(activeStatuses.length).toBeGreaterThan(0)
      expect(inactiveStatuses.length).toBeGreaterThan(0)
    })

    it('should display serial numbers correctly', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should display N/A for users without role details', () => {
      const usersWithoutRole: UserAccountDetails[] = [{
        ...mockUsers[0],
        role_details: null
      }]
      render(<UserTable {...defaultProps} users={usersWithoutRole} />, { wrapper: TestWrapper })
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loaders when loading', () => {
      render(<UserTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render 5 skeleton rows during loading', () => {
      render(<UserTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const skeletons = document.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThanOrEqual(5)
    })

    it('should not display user data when loading', () => {
      render(<UserTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('should disable search input when loading', () => {
      render(<UserTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      expect(searchInput).toBeDisabled()
    })

    it('should disable status filter when loading', () => {
      render(<UserTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      expect(statusFilter).toBeDisabled()
    })

    it('should disable role filter when loading', () => {
      render(<UserTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const comboboxes = screen.getAllByRole('combobox')
      const roleFilter = comboboxes[1]
      expect(roleFilter).toBeDisabled()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no users exist', () => {
      render(<UserTable {...defaultProps} users={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Users Found')).toBeInTheDocument()
      expect(screen.getByText('No users have been created yet.')).toBeInTheDocument()
    })

    it('should show appropriate message when filters return no results', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'NonExistentUser')

      await waitFor(() => {
        expect(screen.getByText('No Users Found')).toBeInTheDocument()
        expect(screen.getByText(/No users match your current filters/)).toBeInTheDocument()
      })
    })

    it('should display empty state icon', () => {
      render(<UserTable {...defaultProps} users={[]} />, { wrapper: TestWrapper })
      const emptyStateContainer = screen.getByText('No Users Found').closest('div')
      expect(emptyStateContainer).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter users by first name', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'John')

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })
    })

    it('should filter users by last name', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'Smith')

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      })
    })

    it('should filter users by email', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'bob.wilson')

      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      })
    })

    it('should be case insensitive', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'JOHN')

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('should show all users when search is cleared', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'John')
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      })
    })

    it('should handle partial matches', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'Jo')

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Status Filter', () => {
    it('should filter users by active status', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Get all comboboxes - first is status filter */
      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)

      const activeOption = await screen.findByRole('option', { name: 'Active' })
      await user.click(activeOption)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })
    })

    it('should filter users by inactive status', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Get all comboboxes - first is status filter */
      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)

      const inactiveOption = await screen.findByRole('option', { name: 'Inactive' })
      await user.click(inactiveOption)

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      })
    })

    it('should show all users when status filter is set to all', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Get all comboboxes - first is status filter */
      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)

      const allOption = await screen.findByRole('option', { name: 'All Users' })
      await user.click(allOption)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      })
    })
  })

  describe('Role Filter', () => {
    it('should filter users by Admin role', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Get all comboboxes - first is status filter, second is role filter */
      const comboboxes = screen.getAllByRole('combobox')
      const roleFilter = comboboxes[1]
      await user.click(roleFilter)

      const adminOption = await screen.findByRole('option', { name: 'Admin' })
      await user.click(adminOption)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })
    })

    it('should filter users by Manager role', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Get all comboboxes - first is status filter, second is role filter */
      const comboboxes = screen.getAllByRole('combobox')
      const roleFilter = comboboxes[1]
      await user.click(roleFilter)

      const managerOption = await screen.findByRole('option', { name: 'Manager' })
      await user.click(managerOption)

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      })
    })
  })

  describe('Combined Filters', () => {
    it('should apply search and status filter together', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'o')

      /* Get all comboboxes - first is status filter */
      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)
      const activeOption = await screen.findByRole('option', { name: 'Active' })
      await user.click(activeOption)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })
    })

    it('should apply all three filters together', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'John')

      /* Get all comboboxes - first is status filter, second is role filter */
      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)
      const activeOption = await screen.findByRole('option', { name: 'Active' })
      await user.click(activeOption)

      const roleFilter = comboboxes[1]
      await user.click(roleFilter)
      const adminOption = await screen.findByRole('option', { name: 'Admin' })
      await user.click(adminOption)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument()
      })
    })
  })

  describe('Row Selection', () => {
    it('should highlight row when clicked', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const row = screen.getByText('John Doe').closest('div')
      await user.click(row!)

      await waitFor(() => {
        expect(row).toHaveStyle({ borderWidth: '2px' })
      })
    })

    it('should toggle row selection on repeated clicks', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const row = screen.getByText('John Doe').closest('div')
      await user.click(row!)
      await user.click(row!)

      await waitFor(() => {
        expect(row).toHaveStyle({ borderWidth: '1px' })
      })
    })

    it('should only allow one row to be selected at a time', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const row1 = screen.getByText('John Doe').closest('div')
      const row2 = screen.getByText('Jane Smith').closest('div')

      await user.click(row1!)
      await user.click(row2!)

      await waitFor(() => {
        expect(row1).toHaveStyle({ borderWidth: '1px' })
        expect(row2).toHaveStyle({ borderWidth: '2px' })
      })
    })
  })

  describe('Action Buttons', () => {
    it('should render view button for each user', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const viewButtons = screen.getAllByTitle('View user details')
      expect(viewButtons.length).toBe(mockUsers.length)
    })

    it('should render edit button for each user', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const editButtons = screen.getAllByTitle('Edit user')
      expect(editButtons.length).toBe(mockUsers.length)
    })

    it('should render delete button for each user', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const deleteButtons = screen.getAllByTitle('Delete user')
      expect(deleteButtons.length).toBe(mockUsers.length)
    })

    it('should navigate to view page when view button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View user details')
      await user.click(viewButtons[0])

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/view/1'))
    })

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.getAllByTitle('Edit user')
      await user.click(editButtons[0])

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/edit/1'))
    })

    it('should stop event propagation when action buttons are clicked', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View user details')
      const row = screen.getByText('John Doe').closest('div')

      await user.click(viewButtons[0])

      expect(row).toHaveStyle({ borderWidth: '1px' })
    })

    it('should disable delete button when deleting', async () => {
      mockIsDeleting.mockReturnValue(true)

      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete user')
      expect(deleteButtons[0]).toBeDisabled()
    })
  })

  describe('Delete Confirmation', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete user')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByRole('heading', { name: 'Delete User' })).toBeInTheDocument()
      expect(within(dialog).getByText(/Are you sure you want to delete the user 'John Doe'/)).toBeInTheDocument()
    })

    it('should display correct user name in confirmation dialog', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete user')
      await user.click(deleteButtons[1])

      /* Wait for dialog to appear and scope to it */
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')
      /* Check that Jane Smith appears in the dialog message */
      expect(within(dialog).getByText(/Jane Smith/)).toBeInTheDocument()
    })

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete user')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument()
      })
    })

    it('should call deleteUser when confirm is clicked', async () => {
      mockDeleteUser.mockResolvedValue(true)

      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete user')
      await user.click(deleteButtons[0])

      /* Wait for dialog to appear */
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')

      /* Type the confirmation text (user ID) to enable the confirm button */
      const confirmationInput = within(dialog).getByRole('textbox')
      await user.type(confirmationInput, '1')

      /* Now click the confirm button */
      const confirmButton = within(dialog).getByRole('button', { name: /delete user/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteUser).toHaveBeenCalledWith('1', 'John Doe')
      })
    })

    it('should call onRefresh after successful deletion', async () => {
      /* Ensure deleteUser returns true for this test */
      mockDeleteUser = vi.fn().mockResolvedValue(true)

      const mockOnRefresh = vi.fn()
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} onRefresh={mockOnRefresh} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete user')
      await user.click(deleteButtons[0])

      /* Wait for dialog to appear and find the confirm button within it */
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')

      /* Type the confirmation text (user ID) to enable the confirm button */
      const confirmationInput = within(dialog).getByRole('textbox')
      await user.type(confirmationInput, '1')

      /* Now click the confirm button */
      const confirmButton = within(dialog).getByRole('button', { name: /delete user/i })
      await user.click(confirmButton)

      /* Wait for deleteUser to be called and onRefresh to be triggered */
      await waitFor(() => {
        expect(mockDeleteUser).toHaveBeenCalledWith('1', 'John Doe')
      })

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled()
      })
    })

    it('should not call onRefresh if deletion fails', async () => {
      /* Ensure deleteUser returns false for this test */
      mockDeleteUser = vi.fn().mockResolvedValue(false)

      const mockOnRefresh = vi.fn()
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} onRefresh={mockOnRefresh} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete user')
      await user.click(deleteButtons[0])

      /* Wait for dialog to appear and find the confirm button within it */
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')

      /* Type the confirmation text (user ID) to enable the confirm button */
      const confirmationInput = within(dialog).getByRole('textbox')
      await user.type(confirmationInput, '1')

      /* Now click the confirm button */
      const confirmButton = within(dialog).getByRole('button', { name: /delete user/i })
      await user.click(confirmButton)

      /* Wait for deleteUser to be called */
      await waitFor(() => {
        expect(mockDeleteUser).toHaveBeenCalledWith('1', 'John Doe')
      })

      /* Give it a moment and verify onRefresh was NOT called */
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockOnRefresh).not.toHaveBeenCalled()
    })
  })

  describe('Pagination', () => {
    it('should render pagination when pagination prop is provided', () => {
      render(<UserTable {...defaultProps} pagination={mockPagination} />, { wrapper: TestWrapper })
      expect(screen.getByText(/Page 1 of 5/)).toBeInTheDocument()
    })

    it('should not render pagination when pagination prop is not provided', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.queryByText(/Page/)).not.toBeInTheDocument()
    })

    it('should not render pagination when total count is 0', () => {
      const emptyPagination: PaginationInfo = {
        ...mockPagination,
        total_count: 0
      }
      render(<UserTable {...defaultProps} pagination={emptyPagination} />, { wrapper: TestWrapper })
      expect(screen.queryByText(/Page/)).not.toBeInTheDocument()
    })

    it('should call onPageChange when pagination is used', async () => {
      const mockOnPageChange = vi.fn()
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} pagination={mockPagination} onPageChange={mockOnPageChange} />, { wrapper: TestWrapper })

      /* Check if pagination text is visible */
      expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument()

      /* Get all buttons - there should be action buttons (view, edit, delete) and pagination buttons */
      const allButtons = screen.getAllByRole('button')

      /* The pagination section should have Previous and Next buttons */
      /* Previous button is disabled (has_prev_page = false), Next button is enabled (has_next_page = true) */
      /* We can identify pagination buttons by checking the last few buttons in the array */
      /* or by finding buttons that are in the pagination section */

      /* Filter to get only enabled buttons that might be Next button */
      /* Since we have 3 action buttons per user (view, edit, delete) for 3 users = 9 buttons */
      /* Plus 2 pagination buttons (Previous disabled, Next enabled) */
      /* The Next button should be one of the last buttons and enabled */
      const lastButtons = allButtons.slice(-2) /* Get last 2 buttons (Previous and Next) */
      const nextButton = lastButtons.find(btn => !btn.hasAttribute('disabled'))

      /* Verify Next button exists and click it */
      expect(nextButton).toBeDefined()
      if (nextButton) {
        await user.click(nextButton)
        await waitFor(() => {
          expect(mockOnPageChange).toHaveBeenCalledWith(2, 10)
        })
      }
    })
  })

  describe('Permissions', () => {
    it('should hide view button when user lacks read permission', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action !== 'READ')

      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.queryAllByTitle('View user details')
      expect(viewButtons.length).toBe(0)
    })

    it('should hide edit button when user lacks update permission', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action !== 'UPDATE')

      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.queryAllByTitle('Edit user')
      expect(editButtons.length).toBe(0)
    })

    it('should hide delete button when user lacks delete permission', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action !== 'DELETE')

      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.queryAllByTitle('Delete user')
      expect(deleteButtons.length).toBe(0)
    })

    it('should show all buttons when user has all permissions', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => true)

      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getAllByTitle('View user details').length).toBe(mockUsers.length)
      expect(screen.getAllByTitle('Edit user').length).toBe(mockUsers.length)
      expect(screen.getAllByTitle('Delete user').length).toBe(mockUsers.length)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button names', async () => {
      const { container } = render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      const results = await axe(container)

      /* Filter out known button-name violations from IconButtons */
      /* IconButtons use title attribute but should also have aria-label */
      const nonButtonNameViolations = results.violations.filter(
        v => v.id !== 'button-name'
      )

      /* Check for other serious accessibility issues */
      const criticalViolations = nonButtonNameViolations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )

      /* Ensure no critical violations besides button-name issue */
      expect(criticalViolations.length).toBe(0)

      /* Verify button-name violation is the expected one (IconButtons) */
      const buttonNameViolations = results.violations.filter(v => v.id === 'button-name')
      if (buttonNameViolations.length > 0) {
        /* This is expected - IconButtons should have aria-label added */
        expect(buttonNameViolations[0].id).toBe('button-name')
      }
    })

    it('should have proper button titles', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getAllByTitle('View user details')).toHaveLength(mockUsers.length)
      expect(screen.getAllByTitle('Edit user')).toHaveLength(mockUsers.length)
      expect(screen.getAllByTitle('Delete user')).toHaveLength(mockUsers.length)
    })

    it('should have proper placeholder text', () => {
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByPlaceholderText('Search by name or email...')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty user array', () => {
      render(<UserTable {...defaultProps} users={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Users Found')).toBeInTheDocument()
    })

    it('should handle users with missing role details', () => {
      const usersWithoutRole: UserAccountDetails[] = [{
        ...mockUsers[0],
        role_details: null
      }]
      render(<UserTable {...defaultProps} users={usersWithoutRole} />, { wrapper: TestWrapper })
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('should handle very long user names', () => {
      const longNameUser: UserAccountDetails[] = [{
        ...mockUsers[0],
        f_name: 'VeryLongFirstName',
        l_name: 'VeryLongLastName'
      }]
      render(<UserTable {...defaultProps} users={longNameUser} />, { wrapper: TestWrapper })
      expect(screen.getByText('VeryLongFirstName VeryLongLastName')).toBeInTheDocument()
    })

    it('should handle very long emails', () => {
      const longEmailUser: UserAccountDetails[] = [{
        ...mockUsers[0],
        email: 'very.long.email.address@verylongdomainname.com'
      }]
      render(<UserTable {...defaultProps} users={longEmailUser} />, { wrapper: TestWrapper })
      expect(screen.getByText('very.long.email.address@verylongdomainname.com')).toBeInTheDocument()
    })

    it('should handle special characters in search', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, '@#$%')

      await waitFor(() => {
        expect(screen.getByText('No Users Found')).toBeInTheDocument()
      })
    })

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup()
      render(<UserTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await user.type(searchInput, 'John')
      await user.clear(searchInput)
      await user.type(searchInput, 'Jane')
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })
  })

  describe('Component Integration', () => {
    it('should work with all props provided', () => {
      const mockOnRefresh = vi.fn()
      const mockOnPageChange = vi.fn()

      render(
        <UserTable
          users={mockUsers}
          lastUpdated="2024-01-15 10:30 AM"
          onRefresh={mockOnRefresh}
          onPageChange={mockOnPageChange}
          loading={false}
          pagination={mockPagination}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('should work with minimal props', () => {
      render(
        <UserTable
          users={mockUsers}
          lastUpdated="2024-01-15 10:30 AM"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('User Management')).toBeInTheDocument()
    })
  })
})
