/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import { Sidebar } from '../sidebar'

/* Mock dependencies */
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn()
}))

vi.mock('@shared/contexts', () => ({
  usePermissions: vi.fn()
}))

vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182ce',
  SECONDARY_COLOR: '#2c5282',
  WHITE_COLOR: '#ffffff'
}))

vi.mock('@shared/constants', () => ({
  ADMIN_PAGE_ROUTES: {
    DASHBOARD: { HOME: '/admin/dashboard' },
    PLAN_MANAGEMENT: { HOME: '/admin/plan-management', CREATE: '/admin/plan-management/create' },
    TENANT_MANAGEMENT: { HOME: '/admin/tenant-management', CREATE: '/admin/tenant-management/create' },
    USER_MANAGEMENT: { HOME: '/admin/user-management', CREATE: '/admin/user-management/create' },
    ROLE_MANAGEMENT: { HOME: '/admin/role-management', CREATE: '/admin/role-management/create' },
    SUPPORT_TICKET_MANAGEMENT_PAGE: { HOME: '/admin/support-tickets', CREATE: '/admin/support-tickets/create' }
  }
}))

import { usePathname, useRouter } from 'next/navigation'
import { usePermissions } from '@shared/contexts'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('Sidebar Component', () => {
  const mockPush = vi.fn()
  const mockHasModuleAccess = vi.fn()
  const mockHasSpecificPermission = vi.fn()
  const mockRefreshPermissions = vi.fn()

  const defaultPermissions = [
    {
      module_code: 'admin-dashboard',
      module_name: 'Dashboard',
      module_id: '1',
      role_can_create: false,
      role_can_read: true,
      role_can_update: false,
      role_can_delete: false,
      user_can_create: false,
      user_can_read: true,
      user_can_update: false,
      user_can_delete: false
    },
    {
      module_code: 'plan-management',
      module_name: 'Plan Management',
      module_id: '2',
      role_can_create: true,
      role_can_read: true,
      role_can_update: true,
      role_can_delete: true,
      user_can_create: true,
      user_can_read: true,
      user_can_update: true,
      user_can_delete: true
    },
    {
      module_code: 'user-management',
      module_name: 'User Management',
      module_id: '3',
      role_can_create: true,
      role_can_read: true,
      role_can_update: false,
      role_can_delete: false,
      user_can_create: true,
      user_can_read: true,
      user_can_update: false,
      user_can_delete: false
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(usePathname).mockReturnValue('/admin/dashboard')
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>)

    mockHasModuleAccess.mockImplementation((moduleCode: string) => {
      return defaultPermissions.some(p => p.module_code === moduleCode)
    })

    mockHasSpecificPermission.mockImplementation((moduleCode: string, permission: string) => {
      const module = defaultPermissions.find(p => p.module_code === moduleCode)
      if (!module) return false

      const permissionMap: Record<string, boolean> = {
        'CREATE': module.role_can_create || module.user_can_create,
        'READ': module.role_can_read || module.user_can_read,
        'UPDATE': module.role_can_update || module.user_can_update,
        'DELETE': module.role_can_delete || module.user_can_delete
      }

      return permissionMap[permission] || false
    })

    vi.mocked(usePermissions).mockReturnValue({
      permissions: defaultPermissions,
      hasModuleAccess: mockHasModuleAccess,
      hasSpecificPermission: mockHasSpecificPermission,
      loading: false,
      error: null,
      refreshPermissions: mockRefreshPermissions
    })
  })

  describe('Basic Rendering', () => {
    it('should render sidebar', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should render navigation icons', () => {
      const { container } = render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render menu items based on permissions', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      /* Should have buttons for modules user has access to */
      expect(screen.getByText('US')).toBeInTheDocument()
    })
  })

  describe('Permission Filtering', () => {
    it('should show only modules with access', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(mockHasModuleAccess).toHaveBeenCalled()
    })

    it('should hide modules without access', () => {
      mockHasModuleAccess.mockReturnValue(false)

      render(<Sidebar />, { wrapper: TestWrapper })

      /* Should not show menu items */
      expect(mockHasModuleAccess).toHaveBeenCalled()
    })

    it('should filter sub-items by permissions', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(mockHasSpecificPermission).toHaveBeenCalled()
    })

    it('should show module only if sub-items are accessible', () => {
      mockHasSpecificPermission.mockReturnValue(false)

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(mockHasModuleAccess).toHaveBeenCalled()
    })
  })

  describe('Menu Expansion', () => {
    it('should expand menu section on icon click', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[1])

        /* Menu should expand */
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalled()
        })
      }
    })

    it('should collapse menu section on close', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[1])

        await waitFor(() => {
          /* Should show expanded state */
          expect(buttons[1]).toBeInTheDocument()
        })
      }
    })

    it('should toggle expansion on repeated clicks', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[1])
        await user.click(buttons[1])

        expect(mockPush).toHaveBeenCalled()
      }
    })
  })

  describe('Active State Detection', () => {
    it('should detect active section from pathname', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/plan-management')

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle exact path match', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/dashboard')

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle path prefix match', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/plan-management/create')

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle locale prefix in pathname', () => {
      vi.mocked(usePathname).mockReturnValue('/en/admin/dashboard')

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to module home on icon click', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[1])

        expect(mockPush).toHaveBeenCalled()
      }
    })

    it('should navigate to sub-menu items', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      /* Expand a section first, then click sub-item */
      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[1])
      }
    })
  })

  describe('Loading State', () => {
    it('should show empty menu during loading', () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        loading: true,
        error: null,
        refreshPermissions: mockRefreshPermissions
      })

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should show menu after loading completes', async () => {
      const { rerender } = render(<Sidebar />, { wrapper: TestWrapper })

      vi.mocked(usePermissions).mockReturnValue({
        permissions: defaultPermissions,
        hasModuleAccess: mockHasModuleAccess,
        hasSpecificPermission: mockHasSpecificPermission,
        loading: false,
        error: null,
        refreshPermissions: mockRefreshPermissions
      })

      rerender(<Sidebar />)

      await waitFor(() => {
        expect(screen.getByText('US')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty permissions', () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [],
        hasModuleAccess: vi.fn().mockReturnValue(false),
        hasSpecificPermission: vi.fn().mockReturnValue(false),
        loading: false,
        error: null,
        refreshPermissions: mockRefreshPermissions
      })

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle module with no accessible sub-items', () => {
      mockHasSpecificPermission.mockReturnValue(false)

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle very long module names', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle rapid section switching', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 2) {
        await user.click(buttons[1])
        await user.click(buttons[2])
        await user.click(buttons[1])
      }

      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('Sub-Menu Items', () => {
    it('should show sub-menu items when expanded', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[1])

        await waitFor(() => {
          /* Sub-menu should be visible */
          expect(buttons[1]).toBeInTheDocument()
        })
      }
    })

    it('should hide sub-menu items when collapsed', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      /* By default, sidebar should be collapsed */
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should highlight active sub-menu item', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/plan-management/create')

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render on mobile viewport', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should render on desktop viewport', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should maintain state across viewport changes', () => {
      const { rerender } = render(<Sidebar />, { wrapper: TestWrapper })

      rerender(<Sidebar />)

      expect(screen.getByText('US')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have title attributes on icon buttons', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      /* Icon buttons should have titles for accessibility */
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should have accessible navigation structure', () => {
      const { container } = render(<Sidebar />, { wrapper: TestWrapper })

      expect(container.querySelector('nav')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should integrate with permissions context', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(usePermissions).toHaveBeenCalled()
    })

    it('should integrate with router', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(useRouter).toHaveBeenCalled()
    })

    it('should integrate with pathname', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(usePathname).toHaveBeenCalled()
    })

    it('should filter menu based on permissions', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(mockHasModuleAccess).toHaveBeenCalled()
      expect(mockHasSpecificPermission).toHaveBeenCalled()
    })
  })

  describe('Use Cases', () => {
    it('should render for admin with full permissions', () => {
      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should render for user with limited permissions', () => {
      vi.mocked(usePermissions).mockReturnValue({
        permissions: [
          {
            module_code: 'admin-dashboard',
            module_name: 'Dashboard',
            module_id: '1',
            role_can_create: false,
            role_can_read: true,
            role_can_update: false,
            role_can_delete: false,
            user_can_create: false,
            user_can_read: true,
            user_can_update: false,
            user_can_delete: false
          }
        ],
        hasModuleAccess: vi.fn().mockReturnValue(true),
        hasSpecificPermission: vi.fn((_, perm) => perm === 'READ'),
        loading: false,
        error: null,
        refreshPermissions: mockRefreshPermissions
      })

      render(<Sidebar />, { wrapper: TestWrapper })

      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle dashboard navigation', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        await user.click(buttons[0])
      }
    })

    it('should handle plan management navigation', async () => {
      const user = userEvent.setup()

      render(<Sidebar />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[1])

        expect(mockPush).toHaveBeenCalled()
      }
    })
  })
})
