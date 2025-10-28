/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import TenantManagementHome from '@tenant-management/pages/home'
import * as useTenantsHook from '@tenant-management/hooks/data-management/use-tenants'
import { TenantWithPlanDetails } from '@tenant-management/types'
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
      <button onClick={handleAdd} disabled={loading}>Add Tenant</button>
      <button onClick={handleRefresh} disabled={loading} role="button" aria-label="refresh">Refresh</button>
    </div>
  ),
  ErrorMessageContainer: ({ error, title, onRetry, isRetrying }: any) => (
    <div data-testid="tenant-management-error">
      <div>{title}</div>
      <div>{error}</div>
      <button onClick={onRetry} disabled={isRetrying}>Retry</button>
    </div>
  )
}))

vi.mock('@tenant-management/tables/tenants', () => ({
  default: vi.fn(({ tenants, loading }) => (
    <div data-testid="tenant-table">
      {loading ? 'Loading...' : `${tenants.length} tenants`}
    </div>
  ))
}))

describe('TenantManagement Home Page', () => {
  const mockTenants: TenantWithPlanDetails[] = [
    {
      tenant_id: 'tenant-001',
      organization_name: 'Test Corp',
      tenant_status: 'active',
      tenant_created_at: '2024-01-01T00:00:00Z',
      plan_id: 1,
      plan_name: 'Premium Plan',
      subscription_status: 'active',
      billing_cycle: 'monthly',
      subscription_created_at: '2024-01-01T00:00:00Z'
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
    tenants: mockTenants,
    baseDetailsTenants: [],
    tenantSelectOptions: [],
    loading: false,
    baseDetailsLoading: false,
    error: null,
    baseDetailsError: null,
    lastUpdated: '2024-01-01T00:00:00Z',
    pagination: mockPagination,
    fetchTenants: vi.fn(),
    fetchTenantsWithBaseDetails: vi.fn(),
    refetch: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue(defaultHookReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  it('should render the tenant management page', () => {
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.getByTestId('tenant-table')).toBeInTheDocument()
  })

  it('should display tenant table with tenants', () => {
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.getByText('1 tenants')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
      ...defaultHookReturn,
      loading: true
    })

    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when error occurs', () => {
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
      ...defaultHookReturn,
      error: 'Failed to load tenants'
    })

    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.getByText('Error Loading Tenants')).toBeInTheDocument()
    expect(screen.getByText('Failed to load tenants')).toBeInTheDocument()
  })

  it('should call refetch when refresh is triggered', async () => {
    const mockRefetch = vi.fn()
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
      ...defaultHookReturn,
      refetch: mockRefetch
    })

    const user = userEvent.setup()
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should call handleAdd when add button is clicked', async () => {
    const { useRouter } = await import('@/i18n/navigation')
    const mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn()
    } as any)

    const user = userEvent.setup()
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    const addButton = screen.getByText('Add Tenant')
    await user.click(addButton)

    expect(mockPush).toHaveBeenCalled()
  })

  it('should display header section', () => {
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.getByTestId('header-section')).toBeInTheDocument()
  })

  it('should render error container when error exists', () => {
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
      ...defaultHookReturn,
      error: 'Server error'
    })

    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.getByTestId('tenant-management-error')).toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', async () => {
    const mockRefetch = vi.fn()
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
      ...defaultHookReturn,
      error: 'Server error',
      refetch: mockRefetch
    })

    const user = userEvent.setup()
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    const retryButton = screen.getByText('Retry')
    await user.click(retryButton)

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should pass correct props to HeaderSection', () => {
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    const headerSection = screen.getByTestId('header-section')
    expect(headerSection).toBeInTheDocument()
  })

  it('should pass correct props to TenantTable', () => {
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    const table = screen.getByTestId('tenant-table')
    expect(table).toBeInTheDocument()
    expect(screen.getByText('1 tenants')).toBeInTheDocument()
  })

  it('should not render error container when no error', () => {
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.queryByTestId('tenant-management-error')).not.toBeInTheDocument()
  })

  it('should handle empty tenants array', () => {
    vi.spyOn(useTenantsHook, 'useTenants').mockReturnValue({
      ...defaultHookReturn,
      tenants: []
    })

    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.getByText('0 tenants')).toBeInTheDocument()
  })

  it('should render header section regardless of permissions', () => {
    render(<TenantManagementHome />, { wrapper: TestWrapper })

    expect(screen.getByTestId('header-section')).toBeInTheDocument()
  })
})
