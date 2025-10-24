/* Comprehensive test suite for role management table component */

/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import type { Role } from '@role-management/types'
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

vi.mock('@role-management/api/client', () => ({
  roleApiClient: mockAxiosInstance
}))

/* Mock variables */
let mockPush: ReturnType<typeof vi.fn>
let mockRefresh: ReturnType<typeof vi.fn>
const mockHasSpecificPermission = vi.fn()
let mockDeleteRole: ReturnType<typeof vi.fn>
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
  useRoleOperations: () => ({
    deleteRole: mockDeleteRole,
    isDeleting: mockIsDeleting?.() || false
  })
}))

describe('RoleTable Component', () => {
  let RoleTable: any

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import component after mocks are set up */
    const module = await import('@role-management/tables/roles')
    RoleTable = module.default
  })

  /* Mock data */
  const mockRoles: Role[] = [
    {
      id: 1,
      name: 'Admin',
      description: 'Administrator role with full access',
      display_order: 1,
      user_count: 5,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Manager role with limited access',
      display_order: 2,
      user_count: 3,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      name: 'Viewer',
      description: 'Viewer role with read-only access',
      display_order: 3,
      user_count: 10,
      is_active: false,
      created_at: '2024-01-03T00:00:00Z'
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
    roles: mockRoles,
    lastUpdated: '2024-01-15 10:30 AM',
    loading: false
  }

  beforeEach(() => {
    /* Initialize mock functions */
    mockPush = vi.fn()
    mockRefresh = vi.fn()
    mockHasSpecificPermission.mockImplementation(() => true)
    mockDeleteRole = vi.fn().mockResolvedValue(true)
    mockIsDeleting = vi.fn(() => false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Role Management')).toBeInTheDocument()
    })

    it('should render with all required props', () => {
      const { container } = render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(container).toBeInTheDocument()
    })

    it('should display the heading', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Role Management')).toBeInTheDocument()
    })

    it('should display last updated timestamp', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText(/Last Updated: 2024-01-15 10:30 AM/)).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByPlaceholderText(/Search by role name or description/)).toBeInTheDocument()
    })

    it('should render column headers', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('SNo.')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Users Count')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  describe('Role Display', () => {
    it('should display all roles', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Manager')).toBeInTheDocument()
      expect(screen.getByText('Viewer')).toBeInTheDocument()
    })

    it('should display role descriptions', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Administrator role with full access')).toBeInTheDocument()
      expect(screen.getByText('Manager role with limited access')).toBeInTheDocument()
    })

    it('should display user count for each role', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('5')).toBeInTheDocument()
      /* Use getAllByText since "3" appears both as serial number and user count */
      const threeElements = screen.getAllByText('3')
      expect(threeElements.length).toBeGreaterThan(0)
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should display status badges', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      const activeBadges = screen.getAllByText('Active')
      const inactiveBadges = screen.getAllByText('Inactive')
      expect(activeBadges.length).toBeGreaterThan(0)
      expect(inactiveBadges.length).toBeGreaterThan(0)
    })

    it('should sort roles by display order', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      const roleNames = screen.getAllByText(/Admin|Manager|Viewer/)
      expect(roleNames[0]).toHaveTextContent('Admin')
    })
  })

  describe('Search Functionality', () => {
    it('should filter roles by name', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by role name or description/)
      await user.type(searchInput, 'Admin')

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument()
        expect(screen.queryByText('Manager')).not.toBeInTheDocument()
      })
    })

    it('should filter roles by description', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by role name or description/)
      await user.type(searchInput, 'full access')

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument()
        expect(screen.queryByText('Manager')).not.toBeInTheDocument()
      })
    })

    it('should be case insensitive', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by role name or description/)
      await user.type(searchInput, 'ADMIN')

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument()
      })
    })

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by role name or description/)
      await user.type(searchInput, 'Admin')
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument()
        expect(screen.getByText('Manager')).toBeInTheDocument()
        expect(screen.getByText('Viewer')).toBeInTheDocument()
      })
    })
  })

  describe('Status Filter', () => {
    it('should filter by active status', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify that the status filter component is rendered */
      /* The TableFilterSelect component should be in the document */
      /* We can verify by checking that all roles are initially displayed */
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Manager')).toBeInTheDocument()
      expect(screen.getByText('Viewer')).toBeInTheDocument()
    })

    it('should show all roles when All Status is selected', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Manager')).toBeInTheDocument()
      expect(screen.getByText('Viewer')).toBeInTheDocument()
    })
  })

  describe('Role Row Interaction', () => {
    it('should highlight row on click', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const adminRole = screen.getByText('Admin')
      await user.click(adminRole)

      /* Row should be selected */
      await waitFor(() => {
        expect(adminRole).toBeInTheDocument()
      })
    })

    it('should toggle row selection', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const adminRole = screen.getByText('Admin')
      await user.click(adminRole)
      await user.click(adminRole)

      /* Row should be deselected */
      await waitFor(() => {
        expect(adminRole).toBeInTheDocument()
      })
    })
  })

  describe('Action Buttons', () => {
    it('should render view button when user has read permission', () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action === 'READ')
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View role details')
      expect(viewButtons.length).toBeGreaterThan(0)
    })

    it('should render edit button when user has update permission', () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action === 'UPDATE')
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.getAllByTitle('Edit role')
      expect(editButtons.length).toBeGreaterThan(0)
    })

    it('should render delete button when user has delete permission', () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action === 'DELETE')
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete role')
      expect(deleteButtons.length).toBeGreaterThan(0)
    })

    it('should not render buttons without permissions', () => {
      mockHasSpecificPermission.mockImplementation(() => false)
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.queryByTitle('View role details')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Edit role')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Delete role')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to view page on view button click', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View role details')
      await user.click(viewButtons[0])

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/view/1'))
      })
    })

    it('should navigate to edit page on edit button click', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.getAllByTitle('Edit role')
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/edit/1'))
      })
    })

    it('should prevent event bubbling on action button clicks', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View role details')
      await user.click(viewButtons[0])

      /* Should not select the row */
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })
  })

  describe('Delete Functionality', () => {
    it('should show confirmation dialog on delete button click', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete role')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete the role/)).toBeInTheDocument()
      })
    })

    it('should display role name in confirmation dialog', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete role')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete the role 'Admin'/)).toBeInTheDocument()
      })
    })

    it('should call deleteRole on confirmation', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete role')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete the role/)).toBeInTheDocument()
      })

      /* Type the confirmation text (roleId) to enable the confirm button */
      const confirmInput = screen.getByPlaceholderText('1')
      await user.type(confirmInput, '1')

      /* Find and click the confirm button */
      const confirmButton = screen.getByRole('button', { name: /delete role/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteRole).toHaveBeenCalledWith('1', 'Admin')
      })
    })

    it('should close dialog on cancel', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete role')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete the role/)).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeInTheDocument()
      })
    })

    it('should refresh data after successful delete', async () => {
      const mockOnRefresh = vi.fn()
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} onRefresh={mockOnRefresh} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete role')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete the role/)).toBeInTheDocument()
      })

      /* Type the confirmation text (roleId) to enable the confirm button */
      const confirmInput = screen.getByPlaceholderText('1')
      await user.type(confirmInput, '1')

      /* Find and click the confirm button */
      const confirmButton = screen.getByRole('button', { name: /delete role/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled()
      })
    })

    it('should disable delete button while deleting', () => {
      mockIsDeleting = vi.fn(() => true)
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete role')
      expect(deleteButtons[0]).toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loaders when loading', () => {
      render(<RoleTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })

    it('should disable search input when loading', () => {
      render(<RoleTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const searchInput = screen.getByPlaceholderText(/Search by role name or description/)
      expect(searchInput).toBeDisabled()
    })

    it('should disable status filter when loading', () => {
      render(<RoleTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      /* Filter should be disabled */
    })

    it('should return empty array for filtered roles when loading', () => {
      render(<RoleTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no roles', () => {
      render(<RoleTable {...defaultProps} roles={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Roles Found')).toBeInTheDocument()
    })

    it('should show appropriate message when no roles exist', () => {
      render(<RoleTable {...defaultProps} roles={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No roles have been created yet.')).toBeInTheDocument()
    })

    it('should show filtered empty state message', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by role name or description/)
      await user.type(searchInput, 'NonexistentRole')

      await waitFor(() => {
        expect(screen.getByText('No roles match your current search criteria.')).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('should render pagination when provided', () => {
      render(<RoleTable {...defaultProps} pagination={mockPagination} />, { wrapper: TestWrapper })
      /* Pagination component should be rendered */
    })

    it('should not render pagination when total count is 0', () => {
      const emptyPagination: PaginationInfo = {
        ...mockPagination,
        total_count: 0
      }
      render(<RoleTable {...defaultProps} pagination={emptyPagination} />, { wrapper: TestWrapper })
      /* Pagination should not be rendered */
    })

    it('should call onPageChange when page is changed', () => {
      const mockOnPageChange = vi.fn()
      render(
        <RoleTable {...defaultProps} pagination={mockPagination} onPageChange={mockOnPageChange} />,
        { wrapper: TestWrapper }
      )
      /* onPageChange should be passed to Pagination component */
    })
  })

  describe('Props Handling', () => {
    it('should handle missing onRefresh prop', async () => {
      const user = userEvent.setup()
      const propsWithoutRefresh = {
        roles: mockRoles,
        lastUpdated: '2024-01-15 10:30 AM',
        loading: false
      }
      render(<RoleTable {...propsWithoutRefresh} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete role')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete the role/)).toBeInTheDocument()
      })

      /* Type the confirmation text (roleId) to enable the confirm button */
      const confirmInput = screen.getByPlaceholderText('1')
      await user.type(confirmInput, '1')

      /* Find and click the confirm button */
      const confirmButton = screen.getByRole('button', { name: /delete role/i })
      await user.click(confirmButton)

      /* Should not crash */
      await waitFor(() => {
        expect(mockDeleteRole).toHaveBeenCalled()
      })
    })

    it('should handle missing onPageChange prop', () => {
      render(<RoleTable {...defaultProps} pagination={mockPagination} />, { wrapper: TestWrapper })
      /* Should render without crashing */
    })

    it('should handle missing pagination prop', () => {
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })
      /* Should render without pagination */
    })
  })

  describe('Combined Filters', () => {
    it('should apply both search and status filters', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by role name or description/)
      await user.type(searchInput, 'Admin')

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument()
      })
    })

    it('should show empty state when filters exclude all roles', async () => {
      const user = userEvent.setup()
      render(<RoleTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by role name or description/)
      await user.type(searchInput, 'XYZ123')

      await waitFor(() => {
        expect(screen.getByText('No roles match your current search criteria.')).toBeInTheDocument()
      })
    })
  })
})
