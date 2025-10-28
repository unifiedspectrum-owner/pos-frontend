/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import ViewTenantPage from '@tenant-management/pages/view'
import { tenantService } from '@tenant-management/api'
import { TenantDetails, TenantSubscriptionDetails, TenantAssignedAddonDetails, TenantTransactionDetails, TenantTransactionSummary } from '@tenant-management/types'

/* Mock tenant API service */
vi.mock('@tenant-management/api', () => ({
  tenantService: {
    getTenantDetails: vi.fn()
  }
}))

/* Mock shared components */
vi.mock('@shared/components/common', () => ({
  FullPageLoader: () => <div data-testid="full-page-loader">Loading...</div>,
  ErrorMessageContainer: ({ error }: { error: string }) => (
    <div data-testid="error-container">{error}</div>
  ),
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>
}))

/* Mock shared utilities */
vi.mock('@/lib/shared', () => ({
  formatDate: vi.fn((date: string) => new Date(date).toLocaleDateString()),
  handleApiError: vi.fn()
}))

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  const React = await import('react')

  /* Context to share onValueChange handler with Trigger components */
  const TabsContext = React.createContext<{ value: string; onValueChange: (e: { value: string }) => void } | null>(null)

  return {
    ...actual,
    Tabs: {
      Root: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (e: { value: string }) => void }) => (
        <TabsContext.Provider value={{ value, onValueChange }}>
          <div data-testid="tabs-root" data-value={value}>
            {children}
          </div>
        </TabsContext.Provider>
      ),
      List: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
      Trigger: ({ children, value }: { children: React.ReactNode; value: string }) => {
        const context = React.useContext(TabsContext)
        return (
          <button
            data-testid={`tab-${value}`}
            onClick={() => context?.onValueChange({ value })}
          >
            {children}
          </button>
        )
      },
      ContentGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-content-group">{children}</div>,
      Content: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <div data-testid={`tab-content-${value}`}>{children}</div>
      )
    },
    Accordion: {
      Root: ({ children }: { children: React.ReactNode }) => <div data-testid="accordion-root">{children}</div>,
      Item: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <div data-testid={`accordion-item-${value}`}>{children}</div>
      ),
      ItemTrigger: ({ children }: { children: React.ReactNode }) => (
        <button data-testid="accordion-trigger">{children}</button>
      ),
      ItemContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="accordion-content">{children}</div>
      ),
      ItemIndicator: () => <div data-testid="accordion-indicator" />
    }
  }
})

describe('ViewTenantPage', () => {
  const mockTenantDetails: TenantDetails = {
    tenant_id: 'tenant-001',
    organization_name: 'Test Corp',
    contact_person: 'John Doe',
    primary_email: 'test@example.com',
    primary_phone: '+1234567890',
    email_verified: true,
    phone_verified: true,
    address_line1: '123 Main St',
    address_line2: 'Suite 100',
    city: 'New York',
    state_province: 'NY',
    postal_code: '10001',
    country: 'US',
    deployment_type: 'cloud',
    current_branches_count: 5,
    max_branches_count: 10,
    is_active: true,
    last_deployment_status: 'success',
    last_deployed_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockSubscriptionDetails: TenantSubscriptionDetails = {
    plan_id: 1,
    plan_name: 'Premium Plan',
    plan_description: 'Premium subscription plan',
    billing_cycle: 'monthly',
    subscription_status: 'active',
    billing_period_start: '2024-01-01T00:00:00Z',
    billing_period_end: '2024-02-01T00:00:00Z',
    next_billing_date: '2024-02-01T00:00:00Z',
    last_billing_date: '2024-01-01T00:00:00Z'
  }

  const mockAssignedAddons: TenantAssignedAddonDetails[] = [
    {
      assignment_id: 1,
      tenant_id: 'tenant-001',
      branch_id: null,
      addon_id: 1,
      addon_name: 'Advanced Analytics',
      addon_description: 'Advanced reporting and analytics',
      pricing_scope: 'organization',
      feature_level: 'Premium',
      billing_cycle: 'monthly',
      subscription_status: 'active',
      billing_period_start: '2024-01-01T00:00:00Z',
      billing_period_end: '2024-02-01T00:00:00Z',
      next_billing_date: '2024-02-01T00:00:00Z',
      last_billing_date: '2024-01-01T00:00:00Z'
    }
  ]

  const mockTransactionDetails: TenantTransactionDetails[] = [
    {
      id: 1,
      tenant_id: 'tenant-001',
      invoice_id: 'INV-001',
      transaction_status: 'paid',
      transaction_type: 'subscription',
      net_amount: 99.99,
      total_plan_amount: 89.99,
      total_addon_amount: 10.00,
      tax: 5.00,
      discount: 0,
      payment_method_type: 'card',
      payment_processor: 'stripe',
      due_date: '2024-01-15T00:00:00Z',
      invoice_date: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  const mockTransactionSummary: TenantTransactionSummary = {
    total_transactions: 10,
    successful_transactions: 9,
    failed_transactions: 1,
    pending_transactions: 0,
    total_paid_amount: 999.90,
    total_pending_amount: 0,
    last_successful_payment_date: '2024-01-01T00:00:00Z'
  }

  const mockSuccessResponse = {
    success: true,
    message: 'Tenant details fetched successfully',
    timestamp: '2024-01-01T00:00:00Z',
    data: {
      tenant_details: mockTenantDetails,
      subscription_details: {
        plan_details: mockSubscriptionDetails,
        addon_details: mockAssignedAddons
      },
      transaction_details: {
        transactions: mockTransactionDetails,
        transaction_summary: mockTransactionSummary
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(tenantService.getTenantDetails).mockResolvedValue(mockSuccessResponse)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  it('should show loading state initially', () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
  })

  it('should fetch and display tenant details', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(tenantService.getTenantDetails).toHaveBeenCalledWith('1')
    })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Test Corp - Tenant Details')).toBeInTheDocument()
  })

  it('should display error when fetch fails', async () => {
    vi.mocked(tenantService.getTenantDetails).mockResolvedValue({
      success: false,
      message: 'Error',
      error: 'Failed to fetch tenant details',
      timestamp: '2024-01-01T00:00:00Z'
    } as any)

    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.getByTestId('error-container')).toBeInTheDocument()
    })

    expect(screen.getByText('Failed to fetch tenant details')).toBeInTheDocument()
  })

  it('should display error when API throws exception', async () => {
    vi.mocked(tenantService.getTenantDetails).mockRejectedValue(new Error('Network error'))

    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.getByTestId('error-container')).toBeInTheDocument()
    })

    expect(screen.getByText('Error fetching tenant details:')).toBeInTheDocument()
  })

  it('should display error when tenant details not found', async () => {
    vi.mocked(tenantService.getTenantDetails).mockResolvedValue({
      success: true,
      message: 'Success',
      timestamp: '2024-01-01T00:00:00Z',
      data: {
        tenant_details: null,
        subscription_details: { plan_details: null, addon_details: [] },
        transaction_details: { transactions: [], transaction_summary: null }
      }
    } as any)

    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.getByTestId('error-container')).toBeInTheDocument()
    })

    expect(screen.getByText('Tenant details not found')).toBeInTheDocument()
  })

  it('should render breadcrumbs', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
  })

  it('should render all tab triggers', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('tab-business')).toBeInTheDocument()
    expect(screen.getByTestId('tab-system')).toBeInTheDocument()
    expect(screen.getByTestId('tab-subscription')).toBeInTheDocument()
    expect(screen.getByTestId('tab-transactions')).toBeInTheDocument()
  })

  it('should render business information tab content', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('tab-content-business')).toBeInTheDocument()
  })

  it('should render system information tab content', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('tab-content-system')).toBeInTheDocument()
  })

  it('should render subscription tab content', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('tab-content-subscription')).toBeInTheDocument()
  })

  it('should render transactions tab content', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('tab-content-transactions')).toBeInTheDocument()
  })

  it('should display tenant business information', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Test Corp')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should display subscription details when plan is assigned', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Premium Plan')).toBeInTheDocument()
  })

  it('should display "No Plan Assigned" message when no subscription', async () => {
    vi.mocked(tenantService.getTenantDetails).mockResolvedValue({
      success: true,
      message: 'Success',
      timestamp: '2024-01-01T00:00:00Z',
      data: {
        tenant_details: mockTenantDetails,
        subscription_details: {
          plan_details: null,
          addon_details: []
        },
        transaction_details: {
          transactions: mockTransactionDetails,
          transaction_summary: mockTransactionSummary
        }
      }
    } as any)

    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('No Plan Assigned')).toBeInTheDocument()
    expect(screen.getByText('This tenant currently has no subscription plan assigned.')).toBeInTheDocument()
  })

  it('should display addons in accordion', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
    expect(screen.getAllByTestId('accordion-root').length).toBeGreaterThan(0)
  })

  it('should display "No Active Addons" message when no addons', async () => {
    vi.mocked(tenantService.getTenantDetails).mockResolvedValue({
      success: true,
      message: 'Success',
      timestamp: '2024-01-01T00:00:00Z',
      data: {
        tenant_details: mockTenantDetails,
        subscription_details: {
          plan_details: mockSubscriptionDetails,
          addon_details: []
        },
        transaction_details: {
          transactions: mockTransactionDetails,
          transaction_summary: mockTransactionSummary
        }
      }
    } as any)

    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('No Active Addons')).toBeInTheDocument()
    expect(screen.getByText('This tenant currently has no active addon subscriptions.')).toBeInTheDocument()
  })

  it('should display transaction summary', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Transaction Summary')).toBeInTheDocument()
  })

  it('should display transactions in accordion', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('INV-001')).toBeInTheDocument()
  })

  it('should display "No Transaction History" message when no transactions', async () => {
    vi.mocked(tenantService.getTenantDetails).mockResolvedValue({
      success: true,
      message: 'Success',
      timestamp: '2024-01-01T00:00:00Z',
      data: {
        tenant_details: mockTenantDetails,
        subscription_details: {
          plan_details: mockSubscriptionDetails,
          addon_details: mockAssignedAddons
        },
        transaction_details: {
          transactions: [],
          transaction_summary: mockTransactionSummary
        }
      }
    } as any)

    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('No Transaction History')).toBeInTheDocument()
    expect(screen.getByText('This tenant currently has no transaction records.')).toBeInTheDocument()
  })

  it('should display active status badge for active tenant', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should display inactive status badge for inactive tenant', async () => {
    vi.mocked(tenantService.getTenantDetails).mockResolvedValue({
      success: true,
      message: 'Success',
      timestamp: '2024-01-01T00:00:00Z',
      data: {
        tenant_details: { ...mockTenantDetails, is_active: false },
        subscription_details: {
          plan_details: mockSubscriptionDetails,
          addon_details: mockAssignedAddons
        },
        transaction_details: {
          transactions: mockTransactionDetails,
          transaction_summary: mockTransactionSummary
        }
      }
    } as any)

    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('should display branch usage information', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('50.0% Used')).toBeInTheDocument()
  })

  it('should handle null max_branches_count for branch usage', async () => {
    vi.mocked(tenantService.getTenantDetails).mockResolvedValue({
      success: true,
      message: 'Success',
      timestamp: '2024-01-01T00:00:00Z',
      data: {
        tenant_details: { ...mockTenantDetails, max_branches_count: null },
        subscription_details: {
          plan_details: mockSubscriptionDetails,
          addon_details: mockAssignedAddons
        },
        transaction_details: {
          transactions: mockTransactionDetails,
          transaction_summary: mockTransactionSummary
        }
      }
    } as any)

    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    // The "No Restriction" text is rendered in the system tab content
    expect(screen.getByTestId('tab-content-system')).toBeInTheDocument()
  })

  it('should not fetch details when tenantId is empty', () => {
    render(<ViewTenantPage tenantId="" />, { wrapper: TestWrapper })

    expect(tenantService.getTenantDetails).not.toHaveBeenCalled()
  })

  it('should display deployment type badge', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('cloud')).toBeInTheDocument()
  })

  it('should display addon count', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Active Addons (1)')).toBeInTheDocument()
  })

  it('should display transaction count', async () => {
    render(<ViewTenantPage tenantId="1" />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Recent Transactions (1)')).toBeInTheDocument()
  })
})
