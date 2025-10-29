/* Comprehensive test suite for PlanManagement home page */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

/* Plan module imports */
import PlanManagement from '@plan-management/pages/home'
import * as usePlansHook from '@plan-management/hooks/use-plans'
import * as permissionsContext from '@shared/contexts'
import { PLAN_PAGE_ROUTES } from '@plan-management/constants'
import { Plan } from '@plan-management/types'

/* Mock next-intl */
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key)
}))

/* Mock navigation */
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush
  }))
}))

/* Mock permissions context */
vi.mock('@shared/contexts', () => ({
  usePermissions: vi.fn(() => ({
    hasSpecificPermission: vi.fn(() => true)
  }))
}))

/* Mock HeaderSection component */
vi.mock('@shared/components', () => ({
  HeaderSection: vi.fn(({ loading, handleAdd, handleRefresh, showAddButton }) => (
    <div data-testid="header-section">
      {showAddButton && (
        <button data-testid="add-button" onClick={handleAdd}>
          Add Plan
        </button>
      )}
      <button data-testid="refresh-button" onClick={handleRefresh} disabled={loading}>
        Refresh
      </button>
    </div>
  )),
  ErrorMessageContainer: vi.fn(({ error, title, onRetry, isRetrying, testId }) => (
    <div data-testid={testId}>
      <div data-testid="error-title">{title}</div>
      <div data-testid="error-message">{error}</div>
      <button data-testid="retry-button" onClick={onRetry} disabled={isRetrying}>
        Retry
      </button>
    </div>
  ))
}))

/* Mock PlanTable component */
vi.mock('@plan-management/tables/plans', () => ({
  default: vi.fn(({ plans, lastUpdated, onRefresh, loading }) => (
    <div data-testid="plan-table">
      <div data-testid="plans-count">{plans.length}</div>
      <div data-testid="last-updated">{lastUpdated}</div>
      <button data-testid="table-refresh" onClick={onRefresh} disabled={loading}>
        Table Refresh
      </button>
    </div>
  ))
}))

/* Helper function to render with ChakraProvider */
const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>)
}

describe('PlanManagement Page', () => {
  /* Mock data */
  const mockPlans: Plan[] = [
    {
      id: 1,
      name: 'Basic Plan',
      description: 'Basic subscription',
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
      name: 'Premium Plan',
      description: 'Premium subscription',
      features: [],
      is_featured: true,
      is_active: true,
      is_custom: false,
      display_order: 2,
      monthly_price: 99.99,
      included_branches_count: 3,
      annual_discount_percentage: 15,
      add_ons: []
    }
  ]

  const mockRefetch = vi.fn()

  const defaultHookReturn = {
    plans: mockPlans,
    loading: false,
    error: null,
    lastUpdated: '2024-01-01T12:00:00Z',
    refetch: mockRefetch,
    fetchPlans: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(usePlansHook, 'usePlans').mockReturnValue(defaultHookReturn)
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('Rendering States', () => {
    it('should render header section', () => {
      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('header-section')).toBeInTheDocument()
    })

    it('should render plan table when no errors', () => {
      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('plan-table')).toBeInTheDocument()
      expect(screen.getByTestId('plans-count')).toHaveTextContent('2')
      expect(screen.queryByTestId('plan-management-error')).not.toBeInTheDocument()
    })

    it('should render error message when error exists', () => {
      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        error: 'Failed to load plans',
        plans: []
      })

      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('plan-management-error')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load plans')
      expect(screen.queryByTestId('plan-table')).not.toBeInTheDocument()
    })

    it('should show loading state in header', () => {
      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        loading: true
      })

      renderWithChakra(<PlanManagement />)

      const refreshButton = screen.getByTestId('refresh-button')
      expect(refreshButton).toBeDisabled()
    })

    it('should display last updated timestamp', () => {
      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('last-updated')).toHaveTextContent('2024-01-01T12:00:00Z')
    })
  })

  describe('User Interactions', () => {
    it('should handle add plan button click', async () => {
      const user = userEvent.setup()
      renderWithChakra(<PlanManagement />)

      const addButton = screen.getByTestId('add-button')
      await user.click(addButton)

      expect(mockPush).toHaveBeenCalledWith(PLAN_PAGE_ROUTES.CREATE)
    })

    it('should handle refresh button click', async () => {
      const user = userEvent.setup()
      renderWithChakra(<PlanManagement />)

      const refreshButton = screen.getByTestId('refresh-button')
      await user.click(refreshButton)

      expect(mockRefetch).toHaveBeenCalled()
    })

    it('should handle retry button click on error', async () => {
      const user = userEvent.setup()
      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        error: 'Network error',
        plans: []
      })

      renderWithChakra(<PlanManagement />)

      const retryButton = screen.getByTestId('retry-button')
      await user.click(retryButton)

      expect(mockRefetch).toHaveBeenCalled()
    })

    it('should log message on refresh', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'log')

      renderWithChakra(<PlanManagement />)

      const refreshButton = screen.getByTestId('refresh-button')
      await user.click(refreshButton)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PlanManagement]')
      )
    })
  })

  describe('Permission Handling', () => {
    it('should show add button when user has create permission', () => {
      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('add-button')).toBeInTheDocument()
    })

    it('should hide add button when user lacks create permission', () => {
      const mockHasPermission = vi.fn(() => false)
      vi.spyOn(permissionsContext, 'usePermissions').mockReturnValue({
        hasSpecificPermission: mockHasPermission
      })

      renderWithChakra(<PlanManagement />)

      expect(screen.queryByTestId('add-button')).not.toBeInTheDocument()
    })
  })

  describe('Data Loading', () => {
    it('should display empty table when no plans', () => {
      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        plans: []
      })

      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('plans-count')).toHaveTextContent('0')
    })

    it('should pass correct props to plan table', () => {
      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('plan-table')).toBeInTheDocument()
      expect(screen.getByTestId('plans-count')).toHaveTextContent('2')
      expect(screen.getByTestId('last-updated')).toHaveTextContent('2024-01-01T12:00:00Z')
    })

    it('should handle loading state correctly', () => {
      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        loading: true
      })

      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('refresh-button')).toBeDisabled()
      expect(screen.getByTestId('table-refresh')).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should display error with retry option', () => {
      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        error: 'Database connection failed',
        plans: []
      })

      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('error-message')).toHaveTextContent('Database connection failed')
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })

    it('should disable retry button while loading', () => {
      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        error: 'Network error',
        loading: true,
        plans: []
      })

      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('retry-button')).toBeDisabled()
    })

    it('should show error title from translations', () => {
      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        error: 'API error',
        plans: []
      })

      renderWithChakra(<PlanManagement />)

      expect(screen.getByTestId('error-title')).toHaveTextContent('errors.loadingPlans')
    })
  })

  describe('Hook Integration', () => {
    it('should call usePlans hook on mount', () => {
      const spy = vi.spyOn(usePlansHook, 'usePlans')

      renderWithChakra(<PlanManagement />)

      expect(spy).toHaveBeenCalled()
    })

    it('should handle hook state updates', async () => {
      const { rerender } = renderWithChakra(<PlanManagement />)

      vi.spyOn(usePlansHook, 'usePlans').mockReturnValue({
        ...defaultHookReturn,
        plans: [...mockPlans, {
          id: 3,
          name: 'Enterprise Plan',
          description: 'Enterprise subscription',
          features: [],
          is_featured: false,
          is_active: true,
          is_custom: false,
          display_order: 3,
          monthly_price: 199.99,
          included_branches_count: 10,
          annual_discount_percentage: 20,
          add_ons: []
        }]
      })

      rerender(<ChakraProvider value={defaultSystem}><PlanManagement /></ChakraProvider>)

      await waitFor(() => {
        expect(screen.getByTestId('plans-count')).toHaveTextContent('3')
      })
    })
  })
})
