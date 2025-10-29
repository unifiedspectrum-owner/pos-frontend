/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'

/* RBAC module imports */
import { ForbiddenPage } from '../forbidden-page'

/* Test wrapper component */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

/* Mock dependencies */
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

vi.mock('@shared/components/common', () => ({
  HeaderSection: vi.fn(({ translation, handleRefresh }) => (
    <div data-testid="header-section">
      <span data-testid="header-title">{translation}</span>
      <button data-testid="refresh-button" onClick={handleRefresh}>
        Refresh
      </button>
    </div>
  ))
}))

vi.mock('@shared/components/form-elements/buttons', () => ({
  PrimaryButton: vi.fn(({ children, onClick, leftIcon }) => (
    <button data-testid="primary-button" onClick={onClick}>
      {leftIcon && <span data-testid="primary-icon">{leftIcon.name}</span>}
      {children}
    </button>
  )),
  SecondaryButton: vi.fn(({ children, onClick, leftIcon }) => (
    <button data-testid="secondary-button" onClick={onClick}>
      {leftIcon && <span data-testid="secondary-icon">{leftIcon.name}</span>}
      {children}
    </button>
  ))
}))

vi.mock('@shared/contexts', () => ({
  usePermissions: vi.fn()
}))

import { useRouter } from 'next/navigation'
import { usePermissions } from '@shared/contexts'

describe('ForbiddenPage Component', () => {
  const mockPush = vi.fn()
  const mockBack = vi.fn()
  const mockRefreshPermissions = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: mockBack,
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn()
    } as any)

    vi.mocked(usePermissions).mockReturnValue({
      permissions: [],
      refreshPermissions: mockRefreshPermissions,
      loading: false,
      error: null,
      hasModuleAccess: vi.fn(),
      hasSpecificPermission: vi.fn()
    })
  })

  describe('Basic Rendering', () => {
    it('should render forbidden page', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    })

    it('should render header section', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByTestId('header-section')).toBeInTheDocument()
      expect(screen.getByTestId('header-title')).toHaveTextContent('AccessForbidden')
    })

    it('should render action buttons', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('should render lock icon', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    })
  })

  describe('Default Message', () => {
    it('should show default message when no props provided', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText("You don't have permission to view this page.")).toBeInTheDocument()
    })

    it('should show contact administrator message', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText('Contact your administrator for access or return to the dashboard.')).toBeInTheDocument()
    })
  })

  describe('Module Access Denied', () => {
    it('should show module-specific message', () => {
      render(<ForbiddenPage module="user-management" />, { wrapper: TestWrapper })

      expect(screen.getByText("You don't have access to the user-management module.")).toBeInTheDocument()
    })

    it('should display module name in access details', () => {
      render(<ForbiddenPage module="role-management" />, { wrapper: TestWrapper })

      expect(screen.getByText('Module:')).toBeInTheDocument()
      expect(screen.getByText('role management')).toBeInTheDocument()
    })

    it('should replace dashes with spaces in module name', () => {
      render(<ForbiddenPage module="plan-management" />, { wrapper: TestWrapper })

      expect(screen.getByText('plan management')).toBeInTheDocument()
    })

    it('should capitalize module name', () => {
      render(<ForbiddenPage module="tenant-management" />, { wrapper: TestWrapper })

      expect(screen.getByText('tenant management')).toBeInTheDocument()
    })

    it('should show required access section', () => {
      render(<ForbiddenPage module="user-management" />, { wrapper: TestWrapper })

      expect(screen.getByText('Required Access:')).toBeInTheDocument()
    })
  })

  describe('Permission Denied', () => {
    it('should show permission-specific message', () => {
      render(<ForbiddenPage module="user-management" permission="delete" />, { wrapper: TestWrapper })

      expect(screen.getByText(/You need delete permission to access the user management module\./)).toBeInTheDocument()
    })

    it('should display permission in access details', () => {
      render(<ForbiddenPage module="user-management" permission="edit" />, { wrapper: TestWrapper })

      expect(screen.getByText('Permission:')).toBeInTheDocument()
      expect(screen.getByText('edit')).toBeInTheDocument()
    })

    it('should show both module and permission', () => {
      render(<ForbiddenPage module="role-management" permission="create" />, { wrapper: TestWrapper })

      expect(screen.getByText('Module:')).toBeInTheDocument()
      expect(screen.getByText('role management')).toBeInTheDocument()
      expect(screen.getByText('Permission:')).toBeInTheDocument()
      expect(screen.getByText('create')).toBeInTheDocument()
    })

    it('should format permission message correctly', () => {
      render(<ForbiddenPage module="plan-management" permission="view" />, { wrapper: TestWrapper })

      expect(screen.getByText(/You need view permission to access the plan management module\./)).toBeInTheDocument()
    })
  })

  describe('Custom Message', () => {
    it('should display custom message when provided', () => {
      render(<ForbiddenPage customMessage="Custom error message" />, { wrapper: TestWrapper })

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('should override default message with custom message', () => {
      render(<ForbiddenPage module="user-management" customMessage="Custom error" />, { wrapper: TestWrapper })

      expect(screen.getByText('Custom error')).toBeInTheDocument()
      expect(screen.queryByText(/don't have access/)).not.toBeInTheDocument()
    })

    it('should override permission message with custom message', () => {
      render(<ForbiddenPage module="user-management" permission="edit" customMessage="Not allowed" />, { wrapper: TestWrapper })

      expect(screen.getByText('Not allowed')).toBeInTheDocument()
      expect(screen.queryByText(/need edit permission/)).not.toBeInTheDocument()
    })

    it('should still show access details with custom message', () => {
      render(<ForbiddenPage module="user-management" permission="delete" customMessage="Custom error" />, { wrapper: TestWrapper })

      expect(screen.getByText('Custom error')).toBeInTheDocument()
      expect(screen.getByText('Module:')).toBeInTheDocument()
      expect(screen.getByText('Permission:')).toBeInTheDocument()
    })
  })

  describe('Navigation Actions', () => {
    it('should navigate back on Go Back button click', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      const goBackButton = screen.getByTestId('secondary-button')
      fireEvent.click(goBackButton)

      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('should navigate to dashboard on Go to Dashboard button click', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      const dashboardButton = screen.getByTestId('primary-button')
      fireEvent.click(dashboardButton)

      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith(expect.any(String))
    })

    it('should show Go Back button text', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('should show Go to Dashboard button text', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    })
  })

  describe('Refresh Functionality', () => {
    it('should call refreshPermissions on refresh button click', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTestId('refresh-button')
      fireEvent.click(refreshButton)

      expect(mockRefreshPermissions).toHaveBeenCalledTimes(1)
    })

    it('should handle async refresh', async () => {
      mockRefreshPermissions.mockResolvedValue(undefined)

      render(<ForbiddenPage />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTestId('refresh-button')
      fireEvent.click(refreshButton)

      expect(mockRefreshPermissions).toHaveBeenCalled()
    })
  })

  describe('Access Details Display', () => {
    it('should show access details box when module provided', () => {
      render(<ForbiddenPage module="user-management" />, { wrapper: TestWrapper })

      expect(screen.getByText('Required Access:')).toBeInTheDocument()
    })

    it('should show access details box when permission provided', () => {
      render(<ForbiddenPage permission="edit" />, { wrapper: TestWrapper })

      expect(screen.getByText('Required Access:')).toBeInTheDocument()
    })

    it('should not show access details when no module or permission', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.queryByText('Required Access:')).not.toBeInTheDocument()
    })

    it('should show both module and permission in details', () => {
      render(<ForbiddenPage module="role-management" permission="delete" />, { wrapper: TestWrapper })

      const detailsSection = screen.getByText('Required Access:').closest('div')
      expect(detailsSection).toBeInTheDocument()
      expect(screen.getByText('Module:')).toBeInTheDocument()
      expect(screen.getByText('Permission:')).toBeInTheDocument()
    })
  })

  describe('Module Name Formatting', () => {
    it('should handle single-word module names', () => {
      render(<ForbiddenPage module="admin" />, { wrapper: TestWrapper })

      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    it('should handle multi-word module names with dashes', () => {
      render(<ForbiddenPage module="support-ticket-management" />, { wrapper: TestWrapper })

      /* Only first dash is replaced by implementation */
      expect(screen.getByText('support ticket-management')).toBeInTheDocument()
    })

    it('should handle module names without dashes', () => {
      render(<ForbiddenPage module="dashboard" />, { wrapper: TestWrapper })

      expect(screen.getByText('dashboard')).toBeInTheDocument()
    })

    it('should preserve case in permission names', () => {
      render(<ForbiddenPage module="user-management" permission="VIEW" />, { wrapper: TestWrapper })

      expect(screen.getByText('VIEW')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty module string', () => {
      render(<ForbiddenPage module="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    })

    it('should handle empty permission string', () => {
      render(<ForbiddenPage permission="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    })

    it('should handle empty custom message', () => {
      render(<ForbiddenPage customMessage="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    })

    it('should handle very long module names', () => {
      const longModuleName = 'very-long-module-name-with-many-dashes'
      render(<ForbiddenPage module={longModuleName} />, { wrapper: TestWrapper })

      /* Only first dash is replaced by implementation */
      expect(screen.getByText(longModuleName.replace('-', ' '))).toBeInTheDocument()
    })

    it('should handle very long custom messages', () => {
      const longMessage = 'This is a very long custom error message that explains in detail why access is restricted'
      render(<ForbiddenPage customMessage={longMessage} />, { wrapper: TestWrapper })

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle special characters in module name', () => {
      render(<ForbiddenPage module="user-management_v2" />, { wrapper: TestWrapper })

      expect(screen.getByText('user management_v2')).toBeInTheDocument()
    })
  })

  describe('UI Elements', () => {
    it('should render main heading', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    })

    it('should render description text', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText('Contact your administrator for access or return to the dashboard.')).toBeInTheDocument()
    })

    it('should render two action buttons', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(screen.getByText('Go Back')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('should not render permission when only module provided', () => {
      render(<ForbiddenPage module="user-management" />, { wrapper: TestWrapper })

      expect(screen.queryByText('Permission:')).not.toBeInTheDocument()
    })

    it('should render permission when both module and permission provided', () => {
      render(<ForbiddenPage module="user-management" permission="edit" />, { wrapper: TestWrapper })

      expect(screen.getByText('Permission:')).toBeInTheDocument()
    })

    it('should show proper message for module only', () => {
      render(<ForbiddenPage module="role-management" />, { wrapper: TestWrapper })

      expect(screen.getByText("You don't have access to the role-management module.")).toBeInTheDocument()
    })

    it('should show proper message for module and permission', () => {
      render(<ForbiddenPage module="role-management" permission="create" />, { wrapper: TestWrapper })

      expect(screen.getByText(/You need create permission/)).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete user flow', () => {
      render(<ForbiddenPage module="user-management" permission="delete" />, { wrapper: TestWrapper })

      /* Check message */
      expect(screen.getByText(/You need delete permission/)).toBeInTheDocument()

      /* Check details */
      expect(screen.getByText('Module:')).toBeInTheDocument()
      expect(screen.getByText('Permission:')).toBeInTheDocument()

      /* Test navigation */
      fireEvent.click(screen.getByTestId('secondary-button'))
      expect(mockBack).toHaveBeenCalled()

      fireEvent.click(screen.getByTestId('primary-button'))
      expect(mockPush).toHaveBeenCalled()

      /* Test refresh */
      fireEvent.click(screen.getByTestId('refresh-button'))
      expect(mockRefreshPermissions).toHaveBeenCalled()
    })

    it('should work with useRouter and usePermissions hooks', () => {
      render(<ForbiddenPage />, { wrapper: TestWrapper })

      expect(useRouter).toHaveBeenCalled()
      expect(usePermissions).toHaveBeenCalled()
    })
  })
})
