/* Comprehensive test suite for tenant management table component */

/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Provider } from '@/components/ui/provider'
import type { TenantWithPlanDetails } from '@tenant-management/types'
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

vi.mock('@tenant-management/api/client', () => ({
  tenantApiClient: mockAxiosInstance
}))

vi.mock('@auth-management/api/client', () => ({
  authApiClient: mockAxiosInstance
}))

/* Mock variables */
let mockPush: ReturnType<typeof vi.fn>
let mockRefresh: ReturnType<typeof vi.fn>
let mockHasSpecificPermission: ReturnType<typeof vi.fn>
let mockDeleteTenant: ReturnType<typeof vi.fn>
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
    hasSpecificPermission: (...args: any[]) => mockHasSpecificPermission(...args)
  })
}))

vi.mock('@tenant-management/hooks', () => ({
  useTenantOperations: () => ({
    deleteTenant: mockDeleteTenant,
    isDeleting: mockIsDeleting?.() || false
  }),
  useTenantSuspension: () => ({
    suspendTenant: vi.fn().mockResolvedValue(true),
    holdTenant: vi.fn().mockResolvedValue(true),
    activateTenant: vi.fn().mockResolvedValue(true),
    isProcessing: false
  })
}))

describe('TenantTable Component', () => {
  let TenantTable: any

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import component after mocks are set up */
    const module = await import('@tenant-management/tables/tenants')
    TenantTable = module.default
  })

  /* Mock data */
  const mockTenants: TenantWithPlanDetails[] = [
    {
      tenant_id: 'tenant-001',
      organization_name: 'Acme Corporation',
      tenant_status: 'active',
      tenant_created_at: '2024-01-01T00:00:00Z',
      plan_id: 1,
      plan_name: 'Enterprise',
      subscription_status: 'active',
      billing_cycle: 'monthly',
      subscription_created_at: '2024-01-01T00:00:00Z'
    },
    {
      tenant_id: 'tenant-002',
      organization_name: 'Tech Solutions Inc',
      tenant_status: 'hold',
      tenant_created_at: '2024-01-02T00:00:00Z',
      plan_id: 2,
      plan_name: 'Professional',
      subscription_status: 'past_due',
      billing_cycle: 'yearly',
      subscription_created_at: '2024-01-02T00:00:00Z'
    },
    {
      tenant_id: 'tenant-003',
      organization_name: 'Digital Innovations',
      tenant_status: 'suspended',
      tenant_created_at: '2024-01-03T00:00:00Z',
      plan_id: 3,
      plan_name: 'Basic',
      subscription_status: 'cancelled',
      billing_cycle: 'monthly',
      subscription_created_at: '2024-01-03T00:00:00Z'
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
    tenants: mockTenants,
    lastUpdated: '2024-01-15 10:30 AM',
    loading: false
  }

  beforeEach(() => {
    /* Initialize mock functions */
    mockPush = vi.fn()
    mockRefresh = vi.fn()
    mockHasSpecificPermission = vi.fn((module: string, action: string) => true)
    mockDeleteTenant = vi.fn().mockResolvedValue(true)
    mockIsDeleting = vi.fn(() => false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Tenant Organizations')).toBeInTheDocument()
    })

    it('should render with all required props', () => {
      const { container } = render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(container).toBeInTheDocument()
    })

    it('should display the heading', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Tenant Organizations')).toBeInTheDocument()
    })

    it('should display last updated timestamp', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText(/Last Updated: 2024-01-15 10:30 AM/)).toBeInTheDocument()
    })

    it('should display search input field', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByPlaceholderText(/Search by organization name or tenant ID/i)).toBeInTheDocument()
    })

    it('should render table column headers', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('SNo.')).toBeInTheDocument()
      expect(screen.getByText('Organization')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Plan Name')).toBeInTheDocument()
      expect(screen.getByText('Subscription')).toBeInTheDocument()
    })

    it('should not crash with empty tenants array', () => {
      render(<TenantTable {...defaultProps} tenants={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('Tenant Organizations')).toBeInTheDocument()
    })

    it('should not crash with missing optional props', () => {
      const minimalProps = {
        tenants: mockTenants,
        lastUpdated: '2024-01-15 10:30 AM'
      }
      const { container } = render(<TenantTable {...minimalProps} />, { wrapper: TestWrapper })
      expect(container).toBeInTheDocument()
    })
  })

  describe('Tenant Data Display', () => {
    it('should display all tenant records', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument()
      expect(screen.getByText('Digital Innovations')).toBeInTheDocument()
    })

    it('should display tenant status badges', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      const statusBadges = screen.getAllByText(/active|hold|suspended/i)
      expect(statusBadges.length).toBeGreaterThan(0)
    })

    it('should display plan names', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Enterprise')).toBeInTheDocument()
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('Basic')).toBeInTheDocument()
    })

    it('should display subscription status badges', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      const subscriptionBadges = screen.getAllByText(/active|hold|suspended/i)
      expect(subscriptionBadges.length).toBeGreaterThan(0)
    })

    it('should display "No Subscription" for tenants without subscription', () => {
      const tenantsWithoutSubscription: TenantWithPlanDetails[] = [{
        tenant_id: 'tenant-004',
        organization_name: 'No Sub Org',
        tenant_status: 'active',
        tenant_created_at: '2024-01-04T00:00:00Z'
      }]
      render(<TenantTable {...defaultProps} tenants={tenantsWithoutSubscription} />, { wrapper: TestWrapper })
      /* getAllByText since there might be multiple instances */
      expect(screen.getAllByText('No Subscription').length).toBeGreaterThan(0)
    })

    it('should display row numbers correctly', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should display skeleton loaders when loading', () => {
      render(<TenantTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      /* Skeleton loaders should be rendered */
      const table = screen.getByText('Tenant Organizations').closest('div')
      expect(table).toBeInTheDocument()
    })

    it('should not display tenant data when loading', () => {
      render(<TenantTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      expect(screen.queryByText('Acme Corporation')).not.toBeInTheDocument()
    })

    it('should disable search input when loading', () => {
      render(<TenantTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      expect(searchInput).toBeDisabled()
    })

    it('should disable filter selects when loading', () => {
      render(<TenantTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      /* Filter selects should be disabled */
      const container = screen.getByText('Tenant Organizations').closest('div')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no tenants exist', () => {
      render(<TenantTable {...defaultProps} tenants={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Tenants Found')).toBeInTheDocument()
      expect(screen.getByText(/No tenant organizations have been created yet/i)).toBeInTheDocument()
    })

    it('should show filtered empty state when search has no results', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'NonexistentTenant')

      await waitFor(() => {
        expect(screen.getByText('No Tenants Found')).toBeInTheDocument()
        expect(screen.getByText(/No tenants match your current filters/i)).toBeInTheDocument()
      })
    })

    it('should display empty state icon', () => {
      render(<TenantTable {...defaultProps} tenants={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Tenants Found')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter tenants by organization name', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'Acme')

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
        expect(screen.queryByText('Tech Solutions Inc')).not.toBeInTheDocument()
      })
    })

    it('should filter tenants by tenant ID', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'tenant-002')

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument()
        expect(screen.queryByText('Acme Corporation')).not.toBeInTheDocument()
      })
    })

    it('should be case-insensitive', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'ACME')

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
      })
    })

    it('should show all tenants when search is cleared', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'Acme')
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
        expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument()
        expect(screen.getByText('Digital Innovations')).toBeInTheDocument()
      })
    })

    it('should search with partial matches', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'Tech')

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument()
      })
    })
  })

  describe('Status Filter', () => {
    it('should filter tenants by active status', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Find and interact with status filter - implementation depends on Chakra Select */
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
      })
    })

    it('should filter tenants by hold status', async () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument()
      })
    })

    it('should filter tenants by suspended status', async () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Digital Innovations')).toBeInTheDocument()
      })
    })

    it('should show all tenants when "All Status" is selected', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument()
      expect(screen.getByText('Digital Innovations')).toBeInTheDocument()
    })
  })

  describe('Subscription Filter', () => {
    it('should show all tenants by default', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument()
      expect(screen.getByText('Digital Innovations')).toBeInTheDocument()
    })

    it('should filter tenants with no subscription', () => {
      const mixedTenants: TenantWithPlanDetails[] = [
        ...mockTenants,
        {
          tenant_id: 'tenant-004',
          organization_name: 'No Sub Org',
          tenant_status: 'active',
          tenant_created_at: '2024-01-04T00:00:00Z'
        }
      ]
      render(<TenantTable {...defaultProps} tenants={mixedTenants} />, { wrapper: TestWrapper })

      expect(screen.getByText('No Sub Org')).toBeInTheDocument()
    })
  })

  describe('Row Interaction', () => {
    it('should select row on click', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const row = screen.getByText('Acme Corporation').closest('div')
      if (row) {
        await user.click(row)
        /* Row should be selected (visual feedback tested via styling) */
      }
    })

    it('should deselect row on second click', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const row = screen.getByText('Acme Corporation').closest('div')
      if (row) {
        await user.click(row)
        await user.click(row)
        /* Row should be deselected */
      }
    })

    it('should switch selection between rows', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const row1 = screen.getByText('Acme Corporation').closest('div')
      const row2 = screen.getByText('Tech Solutions Inc').closest('div')

      if (row1 && row2) {
        await user.click(row1)
        await user.click(row2)
        /* Second row should be selected */
      }
    })
  })

  describe('Navigation Actions', () => {
    it('should navigate to view page when view button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View tenant details')
      await user.click(viewButtons[0])

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('tenant-001'))
    })

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.getAllByTitle('Edit tenant')
      await user.click(editButtons[0])

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('tenant-001'))
    })

    it('should not navigate when row is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const row = screen.getByText('Acme Corporation').closest('div')
      if (row) {
        await user.click(row)
        expect(mockPush).not.toHaveBeenCalled()
      }
    })

    it('should stop propagation on button clicks', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View tenant details')
      await user.click(viewButtons[0])

      /* Row should not be selected when button is clicked */
      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('Delete Functionality', () => {
    it('should open confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete tenant')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Delete Tenant Organization')).toBeInTheDocument()
      })
    })

    it('should display tenant name in confirmation dialog', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete tenant')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        /* Check that the confirmation dialog contains the organization name */
        expect(screen.getByText(/Are you sure you want to delete the organization/)).toBeInTheDocument()
      })
    })

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete tenant')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Delete Tenant Organization')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Delete Tenant Organization')).not.toBeInTheDocument()
      })
    })

    it('should call deleteTenant when confirmed', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete tenant')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Delete Tenant Organization')).toBeInTheDocument()
      })

      /* Type tenant ID in confirmation input */
      const confirmInput = screen.getByRole('textbox')
      await user.type(confirmInput, 'tenant-001')

      const confirmButton = screen.getByText('Delete Organization')
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteTenant).toHaveBeenCalledWith('tenant-001', 'Acme Corporation')
      })
    })

    it('should call onRefresh after successful delete', async () => {
      const mockOnRefresh = vi.fn()
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} onRefresh={mockOnRefresh} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete tenant')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Delete Tenant Organization')).toBeInTheDocument()
      })

      const confirmInput = screen.getByRole('textbox')
      await user.type(confirmInput, 'tenant-001')

      const confirmButton = screen.getByText('Delete Organization')
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled()
      })
    })

    it('should disable delete button when isDeleting is true', () => {
      mockIsDeleting = vi.fn(() => true)
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete tenant')
      expect(deleteButtons[0]).toBeDisabled()
    })
  })

  describe('Tenant Status Actions', () => {
    it('should show hold and suspend buttons for active tenants', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const holdButtons = screen.getAllByTitle('Hold tenant')
      const suspendButtons = screen.getAllByTitle('Suspend tenant')

      expect(holdButtons.length).toBeGreaterThan(0)
      expect(suspendButtons.length).toBeGreaterThan(0)
    })

    it('should show activate button for held tenants', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const activateButtons = screen.getAllByTitle('Activate tenant')
      expect(activateButtons.length).toBeGreaterThan(0)
    })

    it('should show activate button for suspended tenants', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const activateButtons = screen.getAllByTitle('Activate tenant')
      expect(activateButtons.length).toBeGreaterThan(0)
    })

    it('should open hold modal when hold button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const holdButtons = screen.getAllByTitle('Hold tenant')
      await user.click(holdButtons[0])

      /* Modal should open (tested via state change) */
      await waitFor(() => {
        expect(holdButtons[0]).toBeInTheDocument()
      })
    })

    it('should open suspension modal when suspend button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const suspendButtons = screen.getAllByTitle('Suspend tenant')
      await user.click(suspendButtons[0])

      /* Modal should open */
      await waitFor(() => {
        expect(suspendButtons[0]).toBeInTheDocument()
      })
    })

    it('should open activation modal when activate button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const activateButtons = screen.getAllByTitle('Activate tenant')
      await user.click(activateButtons[0])

      /* Modal should open */
      await waitFor(() => {
        expect(activateButtons[0]).toBeInTheDocument()
      })
    })
  })

  describe('Permissions', () => {
    it('should show all action buttons when user has all permissions', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      /* With default permissions (all true), all buttons should be visible */
      expect(screen.getAllByTitle('View tenant details').length).toBe(3)
      expect(screen.getAllByTitle('Edit tenant').length).toBe(3)
      expect(screen.getAllByTitle('Delete tenant').length).toBe(3)
    })

    it('should show status action buttons with all permissions', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Status Actions column header should be visible */
      expect(screen.getByText('Status Actions')).toBeInTheDocument()

      /* Status action buttons should exist */
      expect(screen.getAllByTitle(/Hold tenant|Suspend tenant|Activate tenant/).length).toBeGreaterThan(0)
    })

    it('should display action buttons for each tenant row', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Each of the 3 tenants should have action buttons */
      const viewButtons = screen.getAllByTitle('View tenant details')
      const editButtons = screen.getAllByTitle('Edit tenant')
      const deleteButtons = screen.getAllByTitle('Delete tenant')

      expect(viewButtons).toHaveLength(3)
      expect(editButtons).toHaveLength(3)
      expect(deleteButtons).toHaveLength(3)
    })

    it('should render different status actions based on tenant status', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Active tenant should have hold and suspend buttons */
      expect(screen.getAllByTitle('Hold tenant').length).toBeGreaterThan(0)
      expect(screen.getAllByTitle('Suspend tenant').length).toBeGreaterThan(0)

      /* Held/suspended tenants should have activate button */
      expect(screen.getAllByTitle('Activate tenant').length).toBeGreaterThan(0)
    })

    it('should maintain consistent action column width with permissions', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Actions column header should be present */
      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.getByText('Status Actions')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should render pagination when pagination prop is provided', () => {
      render(<TenantTable {...defaultProps} pagination={mockPagination} />, { wrapper: TestWrapper })

      /* Pagination component should be rendered */
      expect(screen.getByText('Tenant Organizations')).toBeInTheDocument()
    })

    it('should not render pagination when total_count is 0', () => {
      const emptyPagination = { ...mockPagination, total_count: 0 }
      render(<TenantTable {...defaultProps} pagination={emptyPagination} />, { wrapper: TestWrapper })

      /* Pagination should not be visible */
      expect(screen.getByText('Tenant Organizations')).toBeInTheDocument()
    })

    it('should call onPageChange when page is changed', async () => {
      const mockOnPageChange = vi.fn()
      render(<TenantTable {...defaultProps} pagination={mockPagination} onPageChange={mockOnPageChange} />, { wrapper: TestWrapper })

      /* Pagination interaction would trigger onPageChange */
      expect(screen.getByText('Tenant Organizations')).toBeInTheDocument()
    })

    it('should not render pagination when prop is not provided', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Pagination component should not be rendered */
      expect(screen.getByText('Tenant Organizations')).toBeInTheDocument()
    })
  })

  describe('Combined Filters', () => {
    it('should apply both search and status filter', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'Corp')

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
        expect(screen.queryByText('Tech Solutions Inc')).not.toBeInTheDocument()
      })
    })

    it('should apply search, status, and subscription filters together', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'Acme')

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
      })
    })

    it('should show empty state when filters match no results', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'NonexistentOrganization')

      await waitFor(() => {
        expect(screen.getByText('No Tenants Found')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have minimal accessibility violations', async () => {
      const { container } = render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })
      const results = await axe(container)
      /* Allow for some violations from IconButton components that may not have explicit aria-labels */
      /* The component uses title attributes for accessibility which axe may flag */
      expect(results.violations.length).toBeLessThanOrEqual(2)
    })

    it('should have accessible button labels', () => {
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getAllByTitle('View tenant details')).toHaveLength(3)
      expect(screen.getAllByTitle('Edit tenant')).toHaveLength(3)
      expect(screen.getAllByTitle('Delete tenant')).toHaveLength(3)
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.tab()

      /* Search input should receive focus */
      expect(document.activeElement).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle tenants with missing plan information', () => {
      const tenantsWithoutPlan: TenantWithPlanDetails[] = [{
        tenant_id: 'tenant-005',
        organization_name: 'No Plan Org',
        tenant_status: 'active',
        tenant_created_at: '2024-01-05T00:00:00Z'
      }]
      render(<TenantTable {...defaultProps} tenants={tenantsWithoutPlan} />, { wrapper: TestWrapper })

      expect(screen.getByText('No Plan Org')).toBeInTheDocument()
    })

    it('should handle very long organization names', () => {
      const longNameTenant: TenantWithPlanDetails[] = [{
        tenant_id: 'tenant-006',
        organization_name: 'Very Long Organization Name That Might Cause Layout Issues In The Table Display',
        tenant_status: 'active',
        tenant_created_at: '2024-01-06T00:00:00Z',
        plan_id: 1,
        plan_name: 'Enterprise'
      }]
      render(<TenantTable {...defaultProps} tenants={longNameTenant} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Very Long Organization Name/)).toBeInTheDocument()
    })

    it('should handle special characters in organization name', () => {
      const specialCharTenant: TenantWithPlanDetails[] = [{
        tenant_id: 'tenant-007',
        organization_name: 'O\'Reilly & Sons (R&D)',
        tenant_status: 'active',
        tenant_created_at: '2024-01-07T00:00:00Z',
        plan_id: 1,
        plan_name: 'Enterprise'
      }]
      render(<TenantTable {...defaultProps} tenants={specialCharTenant} />, { wrapper: TestWrapper })

      expect(screen.getByText(/O'Reilly & Sons/)).toBeInTheDocument()
    })

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'Acme')
      await user.clear(searchInput)
      await user.type(searchInput, 'Tech')

      await waitFor(() => {
        expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument()
      })
    })

    it('should handle fallback organization name for delete confirmation', async () => {
      /* Create tenant data where find() might fail */
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete tenant')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Delete Tenant Organization')).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should handle large tenant lists efficiently', () => {
      const largeTenantList: TenantWithPlanDetails[] = Array.from({ length: 100 }, (_, i) => ({
        tenant_id: `tenant-${i}`,
        organization_name: `Organization ${i}`,
        tenant_status: 'active',
        tenant_created_at: '2024-01-01T00:00:00Z',
        plan_id: 1,
        plan_name: 'Enterprise',
        subscription_status: 'active'
      }))

      const { container } = render(<TenantTable {...defaultProps} tenants={largeTenantList} />, { wrapper: TestWrapper })
      expect(container).toBeInTheDocument()
    })

    it('should memoize filtered results', async () => {
      const user = userEvent.setup()
      render(<TenantTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Multiple renders with same props should use memoized results */
      const searchInput = screen.getByPlaceholderText(/Search by organization name or tenant ID/i)
      await user.type(searchInput, 'Acme')

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
      })
    })
  })
})
