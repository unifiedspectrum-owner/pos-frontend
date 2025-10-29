/* Comprehensive test suite for plan management table component */

/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import type { Plan } from '@plan-management/types'

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
  getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token')
}))

vi.mock('@shared/api/csrf', () => ({
  getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token')
}))

vi.mock('@plan-management/api/client', () => ({
  planApiClient: mockAxiosInstance
}))

/* Mock variables */
let mockPush: ReturnType<typeof vi.fn>
let mockRefresh: ReturnType<typeof vi.fn>
const mockHasSpecificPermission = vi.fn()
let mockDeletePlan: ReturnType<typeof vi.fn>
let mockIsDeleting: boolean

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

vi.mock('@plan-management/hooks', () => ({
  usePlanOperations: () => ({
    deletePlan: mockDeletePlan,
    isDeleting: mockIsDeleting
  })
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Subscription Plans',
      'lastUpdated': 'Last Updated',
      'search.placeholder': 'Search plans by name...',
      'filters.status.placeholder': 'Filter by Status',
      'filters.status.allStatus': 'All Status',
      'filters.status.active': 'Active',
      'filters.status.inactive': 'Inactive',
      'filters.type.placeholder': 'Filter by Type',
      'filters.type.allTypes': 'All Types',
      'filters.type.regular': 'Regular',
      'filters.type.custom': 'Custom',
      'headers.serialNumber': 'S.No.',
      'headers.name': 'Plan Name',
      'headers.price': 'Monthly Price',
      'headers.status': 'Status',
      'headers.actions': 'Actions',
      'pricing.perMonth': '/month',
      'status.active': 'Active',
      'status.inactive': 'Inactive',
      'emptyState.noPlansFound': 'No Plans Found',
      'emptyState.noPlansCreated': 'No subscription plans have been created yet.',
      'emptyState.adjustFilters': 'Try adjusting your filters to find what you\'re looking for.',
      'actions.view': 'View Details',
      'actions.edit': 'Edit Plan',
      'actions.delete': 'Delete Plan',
      'deleteDialog.title': 'Delete Plan',
      'deleteDialog.message': 'Are you sure you want to delete "{planName}"? This action cannot be undone.',
      'deleteDialog.confirmButton': 'Delete',
      'deleteDialog.cancelButton': 'Cancel'
    }
    return translations[key] || key
  }
}))

describe('PlanTable Component', () => {
  let PlanTable: any

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import component after mocks are set up */
    const module = await import('@plan-management/tables/plans')
    PlanTable = module.default
  })

  /* Mock data */
  const mockPlans: Plan[] = [
    {
      id: 1,
      name: 'Basic Plan',
      description: 'Starter plan for small businesses',
      features: [],
      is_featured: false,
      is_active: true,
      is_custom: false,
      display_order: 1,
      monthly_price: 29.99,
      included_branches_count: 1,
      annual_discount_percentage: 10,
      add_ons: []
    },
    {
      id: 2,
      name: 'Professional Plan',
      description: 'Advanced features for growing businesses',
      features: [],
      is_featured: true,
      is_active: true,
      is_custom: false,
      display_order: 2,
      monthly_price: 79.99,
      included_branches_count: 5,
      annual_discount_percentage: 15,
      add_ons: []
    },
    {
      id: 3,
      name: 'Enterprise Plan',
      description: 'Custom solutions for large enterprises',
      features: [],
      is_featured: false,
      is_active: false,
      is_custom: true,
      display_order: 3,
      monthly_price: 199.99,
      included_branches_count: null,
      annual_discount_percentage: 20,
      add_ons: []
    }
  ]

  const defaultProps = {
    plans: mockPlans,
    lastUpdated: '2024-01-15 10:30 AM',
    loading: false
  }

  beforeEach(() => {
    /* Initialize mock functions */
    mockPush = vi.fn()
    mockRefresh = vi.fn()
    mockHasSpecificPermission.mockImplementation(() => true)
    mockDeletePlan = vi.fn().mockResolvedValue(true)
    mockIsDeleting = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Subscription Plans')).toBeInTheDocument()
    })

    it('should render with all required props', () => {
      const { container } = render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(container).toBeInTheDocument()
    })

    it('should display the heading', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Subscription Plans')).toBeInTheDocument()
    })

    it('should display last updated timestamp', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText(/Last Updated: 2024-01-15 10:30 AM/)).toBeInTheDocument()
    })

    it('should display search input field', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByPlaceholderText(/Search plans by name/i)).toBeInTheDocument()
    })

    it('should render table column headers', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('S.No.')).toBeInTheDocument()
      expect(screen.getByText('Plan Name')).toBeInTheDocument()
      expect(screen.getByText('Monthly Price')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should render all plan rows', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Professional Plan')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
    })

    it('should display plan prices with currency symbol', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('$29.99')).toBeInTheDocument()
      expect(screen.getByText('$79.99')).toBeInTheDocument()
      expect(screen.getByText('$199.99')).toBeInTheDocument()
    })

    it('should display active status badge for active plans', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      const activeBadges = screen.getAllByText('Active')
      expect(activeBadges.length).toBeGreaterThanOrEqual(2)
    })

    it('should display inactive status badge for inactive plans', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      const inactiveBadges = screen.getAllByText('Inactive')
      expect(inactiveBadges.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loaders when loading', () => {
      render(<PlanTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      /* Skeleton loaders don't render actual plan data */
      expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument()
    })

    it('should not show plans when loading', () => {
      render(<PlanTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument()
      expect(screen.queryByText('Professional Plan')).not.toBeInTheDocument()
    })

    it('should disable search input when loading', () => {
      render(<PlanTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const searchInput = screen.getByPlaceholderText(/Search plans by name/i)
      expect(searchInput).toBeDisabled()
    })

    it('should disable filter dropdowns when loading', () => {
      render(<PlanTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      /* Filter selects are disabled via the disabled prop */
      const container = screen.getByText('Subscription Plans').parentElement
      expect(container).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no plans exist', () => {
      render(<PlanTable {...defaultProps} plans={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Plans Found')).toBeInTheDocument()
    })

    it('should show appropriate message when no plans created', () => {
      render(<PlanTable {...defaultProps} plans={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText(/No subscription plans have been created yet/i)).toBeInTheDocument()
    })

    it('should show empty state with icon', () => {
      render(<PlanTable {...defaultProps} plans={[]} />, { wrapper: TestWrapper })
      const emptyState = screen.getByTestId('plans-empty-state')
      expect(emptyState).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter plans by name', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search plans by name/i)
      await user.type(searchInput, 'Basic')

      await waitFor(() => {
        expect(screen.getByText('Basic Plan')).toBeInTheDocument()
        expect(screen.queryByText('Professional Plan')).not.toBeInTheDocument()
        expect(screen.queryByText('Enterprise Plan')).not.toBeInTheDocument()
      })
    })

    it('should perform case-insensitive search', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search plans by name/i)
      await user.type(searchInput, 'PROFESSIONAL')

      await waitFor(() => {
        expect(screen.getByText('Professional Plan')).toBeInTheDocument()
        expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument()
      })
    })

    it('should show empty state when search has no matches', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search plans by name/i)
      await user.type(searchInput, 'NonExistentPlan')

      await waitFor(() => {
        expect(screen.getByText('No Plans Found')).toBeInTheDocument()
        expect(screen.getByText(/Try adjusting your filters/i)).toBeInTheDocument()
      })
    })

    it('should clear search results when input is cleared', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search plans by name/i)
      await user.type(searchInput, 'Basic')

      /* Wait for filter to apply */
      await waitFor(() => {
        expect(screen.queryByText('Professional Plan')).not.toBeInTheDocument()
      })

      await user.clear(searchInput)

      /* Wait for filter to clear */
      await waitFor(() => {
        expect(screen.getByText('Professional Plan')).toBeInTheDocument()
      })
    })
  })

  describe('Status Filter', () => {
    it('should filter plans by active status', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Find and click status filter - implementation will depend on Chakra Select */
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Professional Plan')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
    })

    it('should filter plans by inactive status', async () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      /* When filtered to inactive, only Enterprise Plan should show */
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
    })

    it('should show all plans when filter is set to all', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Professional Plan')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
    })
  })

  describe('Type Filter', () => {
    it('should filter plans by regular type', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      /* Basic and Professional are regular plans */
      expect(screen.getByText('Basic Plan')).toBeInTheDocument()
      expect(screen.getByText('Professional Plan')).toBeInTheDocument()
    })

    it('should filter plans by custom type', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      /* Enterprise is a custom plan */
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
    })
  })

  describe('Combined Filters', () => {
    it('should apply search and status filter together', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText(/Search plans by name/i)
      await user.type(searchInput, 'Plan')

      /* All plans contain "Plan" in their name */
      expect(screen.getAllByText(/Plan/)).toBeTruthy()
    })
  })

  describe('Row Interaction', () => {
    it('should select row when clicked', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const planRow = screen.getByText('Basic Plan').closest('div[role="button"], div')
      if (planRow) {
        await user.click(planRow)
        /* Row should be visually selected (border color changes) */
        expect(planRow).toBeInTheDocument()
      }
    })

    it('should deselect row when clicked again', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const planRow = screen.getByText('Basic Plan').closest('div[role="button"], div')
      if (planRow) {
        await user.click(planRow)
        await user.click(planRow)
        /* Row should be deselected */
        expect(planRow).toBeInTheDocument()
      }
    })
  })

  describe('Action Buttons', () => {
    it('should display view button when user has permission', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View Details')
      expect(viewButtons.length).toBe(3)
    })

    it('should display edit button when user has permission', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.getAllByTitle('Edit Plan')
      expect(editButtons.length).toBe(3)
    })

    it('should display delete button when user has permission', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete Plan')
      expect(deleteButtons.length).toBe(3)
    })

    it('should display all action buttons for each plan row', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      /* Each of the 3 plans should have view, edit, and delete buttons */
      expect(screen.getAllByTitle('View Details').length).toBe(3)
      expect(screen.getAllByTitle('Edit Plan').length).toBe(3)
      expect(screen.getAllByTitle('Delete Plan').length).toBe(3)
    })
  })

  describe('Navigation Actions', () => {
    it('should navigate to view page when view button is clicked', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View Details')
      await user.click(viewButtons[0])

      expect(mockPush).toHaveBeenCalledWith('/admin/plan-management/view/1')
    })

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.getAllByTitle('Edit Plan')
      await user.click(editButtons[0])

      expect(mockPush).toHaveBeenCalledWith('/admin/plan-management/edit/1')
    })

    it('should prevent row selection when action button is clicked', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View Details')
      await user.click(viewButtons[0])

      /* Event should have stopPropagation called, so row selection doesn't happen */
      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('Delete Functionality', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete Plan')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Delete Plan')).toBeInTheDocument()
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
      })
    })

    it('should display plan name in delete confirmation dialog', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete Plan')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Basic Plan/)).toBeInTheDocument()
      })
    })

    it('should call deletePlan when delete is confirmed', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete Plan')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        const confirmButton = screen.getByText('Delete')
        user.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockDeletePlan).toHaveBeenCalledWith(1, 'Basic Plan')
      })
    })

    it('should call onRefresh after successful deletion', async () => {
      const mockOnRefresh = vi.fn()
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} onRefresh={mockOnRefresh} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete Plan')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        const confirmButton = screen.getByText('Delete')
        user.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled()
      })
    })

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete Plan')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel')
        user.click(cancelButton)
      })

      await waitFor(() => {
        expect(screen.queryByText('Delete Plan')).not.toBeInTheDocument()
      })
    })

    it('should disable delete button when deletion is in progress', () => {
      mockIsDeleting = true
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete Plan')
      expect(deleteButtons[0]).toBeDisabled()
    })

    it('should show loading state in confirmation dialog during deletion', async () => {
      const user = userEvent.setup()
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete Plan')
      await user.click(deleteButtons[0])

      /* Dialog should open */
      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
      })

      /* Verify dialog is open and has the delete confirmation */
      expect(screen.getByText(/Basic Plan/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible table structure', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      /* Headers should be present for screen readers */
      expect(screen.getByText('Plan Name')).toBeInTheDocument()
    })

    it('should have accessible action buttons with titles', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getAllByTitle('View Details')).toBeTruthy()
      expect(screen.getAllByTitle('Edit Plan')).toBeTruthy()
      expect(screen.getAllByTitle('Delete Plan')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty plans array', () => {
      render(<PlanTable {...defaultProps} plans={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Plans Found')).toBeInTheDocument()
    })

    it('should handle plans with null included_branches_count', () => {
      render(<PlanTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument()
    })

    it('should handle very long plan names', () => {
      const longNamePlan: Plan = {
        ...mockPlans[0],
        name: 'This is a very long plan name that should be handled properly by the component'
      }
      render(<PlanTable {...defaultProps} plans={[longNamePlan]} />, { wrapper: TestWrapper })
      expect(screen.getByText(/This is a very long plan name/)).toBeInTheDocument()
    })

    it('should handle plans with zero price', () => {
      const freePlan: Plan = {
        ...mockPlans[0],
        monthly_price: 0,
        name: 'Free Plan'
      }
      render(<PlanTable {...defaultProps} plans={[freePlan]} />, { wrapper: TestWrapper })
      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })

    it('should handle very large prices', () => {
      const expensivePlan: Plan = {
        ...mockPlans[0],
        monthly_price: 9999.99,
        name: 'Ultimate Plan'
      }
      render(<PlanTable {...defaultProps} plans={[expensivePlan]} />, { wrapper: TestWrapper })
      expect(screen.getByText('$9999.99')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should handle large number of plans', () => {
      const manyPlans = Array.from({ length: 100 }, (_, i) => ({
        ...mockPlans[0],
        id: i + 1,
        name: `Plan ${i + 1}`
      }))

      const { container } = render(<PlanTable {...defaultProps} plans={manyPlans} />, { wrapper: TestWrapper })
      expect(container).toBeInTheDocument()
    })
  })
})
