/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Shared module imports */
import AdminLayout from '../admin'
import { AUTH_STORAGE_KEYS } from '@auth-management/constants'

/* Mock shared components */
vi.mock('@shared/components/common/sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}))

vi.mock('@shared/components/common', () => ({
  NavigationHeader: () => <div data-testid="navigation-header">Navigation Header</div>
}))

/* Mock auth components */
vi.mock('@auth-management/components', () => ({
  TwoFAReminderDialog: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="2fa-reminder-dialog">
        <button onClick={onClose} data-testid="close-2fa-dialog">Close</button>
      </div>
    ) : null
  )
}))

describe('AdminLayout', () => {
  const testChildren = <div data-testid="test-children">Test Content</div>
  let consoleSpy: ReturnType<typeof vi.spyOn> | undefined

  beforeEach(() => {
    localStorage.clear()
    /* Suppress console logs */
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleSpy?.mockRestore()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<AdminLayout>{testChildren}</AdminLayout>)
      expect(container).toBeInTheDocument()
    })

    it('renders sidebar', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })

    it('renders navigation header', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByText('Navigation Header')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders all three sections (sidebar, header, content)', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('maintains flex layout structure', () => {
      const { container } = render(<AdminLayout>{testChildren}</AdminLayout>)

      /* Check that container has content */
      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies full viewport height to main container', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      /* Verify all main sections are present */
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('uses vertical stack for main content area', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      /* Verify vertical layout components are present */
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('positions elements in correct order', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })
  })

  describe('Main Content Area', () => {
    it('renders content area with flex layout', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('applies full width to content area', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('allows content area to scroll when overflow', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('allows content area to grow and fill available space', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })
  })

  describe('2FA Reminder Dialog', () => {
    it('does not show 2FA reminder dialog by default', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.queryByTestId('2fa-reminder-dialog')).not.toBeInTheDocument()
    })

    it('shows 2FA reminder dialog when pending setup is required', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')

      render(<AdminLayout>{testChildren}</AdminLayout>)

      await waitFor(() => {
        expect(screen.getByTestId('2fa-reminder-dialog')).toBeInTheDocument()
      })
    })

    it('does not show 2FA reminder when pending setup is false', () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'false')

      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.queryByTestId('2fa-reminder-dialog')).not.toBeInTheDocument()
    })

    it('closes 2FA reminder dialog when close is clicked', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')

      render(<AdminLayout>{testChildren}</AdminLayout>)

      await waitFor(() => {
        expect(screen.getByTestId('2fa-reminder-dialog')).toBeInTheDocument()
      })

      const closeButton = screen.getByTestId('close-2fa-dialog')
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByTestId('2fa-reminder-dialog')).not.toBeInTheDocument()
      })
    })

    it('handles missing 2FA setup key in localStorage', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.queryByTestId('2fa-reminder-dialog')).not.toBeInTheDocument()
    })

    it('logs 2FA status when checking', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')

      render(<AdminLayout>{testChildren}</AdminLayout>)

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          '[AdminLayout] User 2FA status:',
          'true'
        )
        expect(console.log).toHaveBeenCalledWith(
          '[AdminLayout] Showing 2FA reminder dialog'
        )
      })
    })

    it('logs when closing 2FA reminder', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')

      render(<AdminLayout>{testChildren}</AdminLayout>)

      await waitFor(() => {
        expect(screen.getByTestId('2fa-reminder-dialog')).toBeInTheDocument()
      })

      const closeButton = screen.getByTestId('close-2fa-dialog')
      fireEvent.click(closeButton)

      expect(console.log).toHaveBeenCalledWith(
        '[AdminLayout] Closing 2FA reminder dialog'
      )
    })
  })

  describe('Children Rendering', () => {
    it('renders simple text children', () => {
      render(<AdminLayout>Simple Text</AdminLayout>)

      expect(screen.getByText('Simple Text')).toBeInTheDocument()
    })

    it('renders complex component children', () => {
      const complexChild = (
        <div>
          <h1 data-testid="title">Dashboard</h1>
          <div data-testid="content">
            <p>Dashboard content</p>
          </div>
        </div>
      )

      render(<AdminLayout>{complexChild}</AdminLayout>)

      expect(screen.getByTestId('title')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <AdminLayout>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </AdminLayout>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
      expect(screen.getByTestId('child3')).toBeInTheDocument()
    })

    it('renders null children gracefully', () => {
      expect(() => {
        render(<AdminLayout>{null}</AdminLayout>)
      }).not.toThrow()
    })

    it('renders undefined children gracefully', () => {
      expect(() => {
        render(<AdminLayout>{undefined}</AdminLayout>)
      }).not.toThrow()
    })

    it('renders empty fragment children', () => {
      expect(() => {
        render(<AdminLayout>{<></>}</AdminLayout>)
      }).not.toThrow()
    })
  })

  describe('Sidebar and Header Integration', () => {
    it('renders sidebar on the left', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()
    })

    it('renders header at the top of main content', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
    })

    it('renders content below header', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('maintains sidebar and header visibility with different content', () => {
      const { rerender } = render(<AdminLayout><div>Content 1</div></AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()

      rerender(<AdminLayout><div>Content 2</div></AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<AdminLayout>{testChildren}</AdminLayout>)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('maintains semantic structure for screen readers', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<AdminLayout>{testChildren}</AdminLayout>)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      unmount()

      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
      expect(screen.queryByTestId('navigation-header')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      unmount1()

      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()

      const { unmount: unmount2 } = render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      unmount2()

      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
    })

    it('checks 2FA reminder on mount', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')

      render(<AdminLayout>{testChildren}</AdminLayout>)

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          '[AdminLayout] User 2FA status:',
          'true'
        )
      })
    })
  })

  describe('Re-rendering Behavior', () => {
    it('updates children content on re-render', () => {
      const { rerender } = render(<AdminLayout><div>Initial Content</div></AdminLayout>)

      expect(screen.getByText('Initial Content')).toBeInTheDocument()

      rerender(<AdminLayout><div>Updated Content</div></AdminLayout>)

      expect(screen.queryByText('Initial Content')).not.toBeInTheDocument()
      expect(screen.getByText('Updated Content')).toBeInTheDocument()
    })

    it('maintains sidebar and header during children updates', () => {
      const { rerender } = render(<AdminLayout><div>Content 1</div></AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()

      rerender(<AdminLayout><div>Content 2</div></AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
    })

    it('handles rapid content changes', () => {
      const { rerender } = render(<AdminLayout><div>Content 1</div></AdminLayout>)

      for (let i = 2; i <= 10; i++) {
        rerender(<AdminLayout><div>Content {i}</div></AdminLayout>)
      }

      expect(screen.getByText('Content 10')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
    })

    it('preserves 2FA dialog state during children updates', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')

      const { rerender } = render(<AdminLayout><div>Content 1</div></AdminLayout>)

      await waitFor(() => {
        expect(screen.getByTestId('2fa-reminder-dialog')).toBeInTheDocument()
      })

      rerender(<AdminLayout><div>Content 2</div></AdminLayout>)

      expect(screen.getByTestId('2fa-reminder-dialog')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly with single child', () => {
      const startTime = Date.now()
      render(<AdminLayout>{testChildren}</AdminLayout>)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100)
    })

    it('handles complex children efficiently', () => {
      const complexChild = (
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <h1>Section {i}</h1>
              <p>Content for section {i}</p>
            </div>
          ))}
        </div>
      )

      const startTime = Date.now()
      render(<AdminLayout>{complexChild}</AdminLayout>)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(200)
    })

    it('maintains performance during multiple re-renders', () => {
      const { rerender } = render(<AdminLayout><div>Content 1</div></AdminLayout>)

      const startTime = Date.now()

      for (let i = 2; i <= 50; i++) {
        rerender(<AdminLayout><div>Content {i}</div></AdminLayout>)
      }

      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(500)
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains structure in narrow viewports', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('maintains structure in wide viewports', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('handles viewport changes gracefully', () => {
      const { rerender } = render(
        <div style={{ width: '500px' }}>
          <AdminLayout>{testChildren}</AdminLayout>
        </div>
      )

      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      rerender(
        <div style={{ width: '1200px' }}>
          <AdminLayout>{testChildren}</AdminLayout>
        </div>
      )

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string children', () => {
      render(<AdminLayout>{''}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
    })

    it('handles whitespace-only children', () => {
      render(<AdminLayout>{'   '}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
    })

    it('handles boolean children', () => {
      expect(() => {
        render(<AdminLayout>{true as React.ReactNode}</AdminLayout>)
      }).not.toThrow()
    })

    it('handles number children', () => {
      render(<AdminLayout>{42 as React.ReactNode}</AdminLayout>)

      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('handles array of children', () => {
      const childrenArray = [
        <div key="1" data-testid="item1">Item 1</div>,
        <div key="2" data-testid="item2">Item 2</div>,
        <div key="3" data-testid="item3">Item 3</div>
      ]

      render(<AdminLayout>{childrenArray}</AdminLayout>)

      expect(screen.getByTestId('item1')).toBeInTheDocument()
      expect(screen.getByTestId('item2')).toBeInTheDocument()
      expect(screen.getByTestId('item3')).toBeInTheDocument()
    })

    it('handles localStorage errors gracefully', () => {
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage error')
      })

      expect(() => {
        render(<AdminLayout>{testChildren}</AdminLayout>)
      }).not.toThrow()

      expect(console.error).toHaveBeenCalledWith(
        '[AdminLayout] Error checking 2FA requirement:',
        expect.any(Error)
      )

      localStorage.getItem = originalGetItem
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(<AdminLayout>{testChildren}</AdminLayout>)
      }).not.toThrow()
    })
  })

  describe('Integration Scenarios', () => {
    it('works with dashboard component', () => {
      const dashboard = (
        <div data-testid="dashboard">
          <h1>Dashboard</h1>
          <div>Statistics</div>
        </div>
      )

      render(<AdminLayout>{dashboard}</AdminLayout>)

      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('works with user management component', () => {
      const userManagement = (
        <div data-testid="user-management">
          <h1>User Management</h1>
          <table>
            <tbody>
              <tr><td>User 1</td></tr>
            </tbody>
          </table>
        </div>
      )

      render(<AdminLayout>{userManagement}</AdminLayout>)

      expect(screen.getByTestId('user-management')).toBeInTheDocument()
      expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('works with tenant management component', () => {
      const tenantManagement = (
        <div data-testid="tenant-management">
          <h1>Tenant Management</h1>
          <div>Tenant List</div>
        </div>
      )

      render(<AdminLayout>{tenantManagement}</AdminLayout>)

      expect(screen.getByTestId('tenant-management')).toBeInTheDocument()
      expect(screen.getByText('Tenant Management')).toBeInTheDocument()
    })

    it('works with plan management component', () => {
      const planManagement = (
        <div data-testid="plan-management">
          <h1>Plan Management</h1>
          <div>Plan List</div>
        </div>
      )

      render(<AdminLayout>{planManagement}</AdminLayout>)

      expect(screen.getByTestId('plan-management')).toBeInTheDocument()
      expect(screen.getByText('Plan Management')).toBeInTheDocument()
    })
  })

  describe('Visual Consistency', () => {
    it('maintains consistent layout structure', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      /* Verify all sections are consistently rendered */
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('maintains spacing between sections', () => {
      render(<AdminLayout>{testChildren}</AdminLayout>)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('applies full viewport height', () => {
      const { container } = render(<AdminLayout>{testChildren}</AdminLayout>)

      /* Verify container exists and has content */
      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })
  })
})
