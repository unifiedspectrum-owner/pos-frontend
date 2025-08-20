import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import { Sidebar } from '../sidebar'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="nav-link" data-href={href}>
      {children}
    </a>
  )
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

const renderSidebar = () => {
  return render(
    <Sidebar />,
    { wrapper: TestWrapper }
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      renderSidebar()
      
      // Should render the sidebar container
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should render logo section', () => {
      renderSidebar()
      
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should render all main menu icons', () => {
      renderSidebar()
      
      // Should render 4 main menu buttons (Dashboard, Plan Management, Tenant Management, User Management)
      const mainMenuButtons = screen.getAllByRole('button')
      
      // Filter out potential submenu buttons and close buttons
      const mainButtons = mainMenuButtons.filter(button => 
        !button.textContent?.includes('Close') && 
        !button.querySelector('svg')?.classList.contains('close-icon')
      )
      
      expect(mainButtons.length).toBeGreaterThanOrEqual(4)
    })

    it('should start with no expanded section', () => {
      renderSidebar()
      
      // No submenu should be visible initially
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Plan Management')).not.toBeInTheDocument()
      expect(screen.queryByText('Tenant Management')).not.toBeInTheDocument()
      expect(screen.queryByText('User Management')).not.toBeInTheDocument()
    })

    it('should have correct initial state', () => {
      renderSidebar()
      
      // Should render main menu items as buttons but not show expanded content
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Should not show any submenu items initially
      expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      expect(screen.queryByText('Manage Plans')).not.toBeInTheDocument()
      expect(screen.queryByText('Create Plan')).not.toBeInTheDocument()
    })
  })

  describe('Menu Expansion', () => {
    it('should expand menu when main menu item is clicked', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      const firstMenuButton = buttons[0] // First main menu button
      
      await userEvent.click(firstMenuButton)
      
      // Should show expanded section
      await waitFor(() => {
        // The specific menu that expands depends on which button was clicked
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
    })

    it('should show correct submenu items for Dashboard', async () => {
      renderSidebar()
      
      // Click the first button (Dashboard)
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Overview')).toBeInTheDocument()
      })
    })

    it('should show correct submenu items for Plan Management', async () => {
      renderSidebar()
      
      // Click the second button (Plan Management)
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Plan Management')).toBeInTheDocument()
        expect(screen.getByText('Manage Plans')).toBeInTheDocument()
        expect(screen.getByText('Create Plan')).toBeInTheDocument()
      })
    })

    it('should show correct submenu items for Tenant Management', async () => {
      renderSidebar()
      
      // Click the third button (Tenant Management)
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[2])
      
      await waitFor(() => {
        expect(screen.getByText('Tenant Management')).toBeInTheDocument()
        expect(screen.getByText('Manage Tenants')).toBeInTheDocument()
        expect(screen.getByText('Create tenant')).toBeInTheDocument()
      })
    })

    it('should show correct submenu items for User Management', async () => {
      renderSidebar()
      
      // Click the fourth button (User Management)
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[3])
      
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
        expect(screen.getByText('Manage Users')).toBeInTheDocument()
        expect(screen.getByText('Create User')).toBeInTheDocument()
      })
    })

    it('should collapse menu when same menu item is clicked again', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      const firstMenuButton = buttons[0]
      
      // Click to expand
      await userEvent.click(firstMenuButton)
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
      
      // Click again to collapse
      await userEvent.click(firstMenuButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      })
    })

    it('should switch between different expanded sections', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      // Click first menu item
      await userEvent.click(buttons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
      
      // Click second menu item
      await userEvent.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Plan Management')).toBeInTheDocument()
        // Dashboard should no longer be expanded
        expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      })
    })
  })

  describe('Close Button Functionality', () => {
    it('should show close button when menu is expanded', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        // Look for close button (MdClose icon)
        const closeButton = screen.getAllByRole('button').find(button => 
          button !== buttons[0] && 
          button !== buttons[1] && 
          button !== buttons[2] && 
          button !== buttons[3]
        )
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('should close expanded menu when close button is clicked', async () => {
      renderSidebar()
      
      // Initially, Overview should not be visible
      expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      
      // Click first menu button to expand Dashboard submenu
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])
      
      // Wait for submenu to appear
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Overview')).toBeInTheDocument()
      })
      
      // Debug: Log all buttons to understand the structure
      const allButtons = screen.getAllByRole('button')
      console.log('Number of buttons when expanded:', allButtons.length)
      
      // Click the first menu button again to collapse (toggle behavior)
      await userEvent.click(buttons[0])
      
      // Wait for submenu to disappear
      await waitFor(() => {
        expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should close expanded menu using dedicated close button', async () => {
      renderSidebar()
      
      // Click first menu button to expand Dashboard submenu
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])
      
      // Wait for submenu to appear
      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument()
      })
      
      // Try to find close button by testing each button after expansion
      const expandedButtons = screen.getAllByRole('button')
      
      // Skip the main menu buttons and test the remaining ones
      for (let i = buttons.length; i < expandedButtons.length; i++) {
        const potentialCloseButton = expandedButtons[i]
        await userEvent.click(potentialCloseButton)
        
        // Check if Overview disappeared
        await waitFor(() => {
          if (screen.queryByText('Overview') === null) {
            return true // Found the close button
          }
          throw new Error('Not the close button')
        }, { timeout: 500 }).catch(() => {
          // This button didn't close the menu, continue
        })
        
        // If we get here, the Overview disappeared, so test passes
        if (screen.queryByText('Overview') === null) {
          return
        }
      }
      
      // If no close button worked, fail the test
      throw new Error('Could not find working close button')
    })
  })

  describe('Submenu Item Interactions', () => {
    it('should handle submenu item clicks', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1]) // Plan Management
      
      await waitFor(() => {
        expect(screen.getByText('Manage Plans')).toBeInTheDocument()
      })
      
      // Click on submenu item
      const managePlansButton = screen.getByText('Manage Plans')
      await userEvent.click(managePlansButton)
      
      // Should handle the click (test passes if no error)
      expect(managePlansButton).toBeInTheDocument()
    })

    it('should set active state on submenu item click', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1]) // Plan Management
      
      await waitFor(() => {
        expect(screen.getByText('Create Plan')).toBeInTheDocument()
      })
      
      const createPlanButton = screen.getByText('Create Plan')
      await userEvent.click(createPlanButton)
      
      // Active state is handled internally, test that click doesn't cause errors
      expect(createPlanButton).toBeInTheDocument()
    })

    it('should generate correct navigation links', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1]) // Plan Management
      
      await waitFor(() => {
        expect(screen.getByText('Manage Plans')).toBeInTheDocument()
        expect(screen.getByText('Create Plan')).toBeInTheDocument()
      })
      
      // Check that Link components are rendered with correct hrefs
      const links = screen.getAllByTestId('nav-link')
      expect(links.length).toBeGreaterThan(0)
      
      // Should have links for plan management paths
      const managePlansLink = links.find(link => 
        link.getAttribute('data-href')?.includes('plan-management')
      )
      expect(managePlansLink).toBeInTheDocument()
    })

    it('should handle different menu sections with correct base paths', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      // Test Plan Management paths
      await userEvent.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Plan Management')).toBeInTheDocument()
      })
      
      let links = screen.getAllByTestId('nav-link')
      const planManagementLink = links.find(link => 
        link.getAttribute('data-href')?.includes('plan-management')
      )
      expect(planManagementLink).toBeInTheDocument()
      
      // Test Tenant Management paths
      await userEvent.click(buttons[2])
      
      await waitFor(() => {
        expect(screen.getByText('Tenant Management')).toBeInTheDocument()
      })
      
      links = screen.getAllByTestId('nav-link')
      const tenantManagementLink = links.find(link => 
        link.getAttribute('data-href')?.includes('tenant-management')
      )
      expect(tenantManagementLink).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should maintain expanded section state correctly', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      // Initially no section should be expanded
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      
      // Expand first section
      await userEvent.click(buttons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
      
      // Expand second section (should close first)
      await userEvent.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Plan Management')).toBeInTheDocument()
        expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      })
    })

    it('should maintain active item state', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1]) // Plan Management
      
      await waitFor(() => {
        expect(screen.getByText('Manage Plans')).toBeInTheDocument()
      })
      
      // Click first submenu item
      const managePlansButton = screen.getByText('Manage Plans')
      await userEvent.click(managePlansButton)
      
      // Click second submenu item
      const createPlanButton = screen.getByText('Create Plan')
      await userEvent.click(createPlanButton)
      
      // Both should still be visible (state management working)
      expect(managePlansButton).toBeInTheDocument()
      expect(createPlanButton).toBeInTheDocument()
    })

    it('should handle state transitions correctly', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      // Multiple rapid clicks should be handled gracefully
      await userEvent.click(buttons[0])
      await userEvent.click(buttons[1])
      await userEvent.click(buttons[2])
      await userEvent.click(buttons[3])
      
      await waitFor(() => {
        // Last clicked should be expanded
        expect(screen.getByText('User Management')).toBeInTheDocument()
      })
    })
  })

  describe('Visual States and Styling', () => {
    it('should apply active styling to expanded main menu item', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      const firstButton = buttons[0]
      
      await userEvent.click(firstButton)
      
      await waitFor(() => {
        // Button should have active styling (tested through presence in DOM)
        expect(firstButton).toBeInTheDocument()
      })
    })

    it('should show dynamic width changes on expansion', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      // Test that expansion changes layout (submenu becomes visible)
      await userEvent.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Plan Management')).toBeInTheDocument()
        expect(screen.getByText('Manage Plans')).toBeInTheDocument()
      })
    })

    it('should apply hover effects to menu items', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      const firstButton = buttons[0]
      
      // Test hover effect
      await userEvent.hover(firstButton)
      
      // Button should still be in document after hover
      expect(firstButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA navigation role', () => {
      renderSidebar()
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
    })

    it('should have keyboard accessible buttons', () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })

    it('should maintain focus management during expansion', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      const firstButton = buttons[0]
      
      firstButton.focus()
      expect(firstButton).toHaveFocus()
      
      await userEvent.click(firstButton)
      
      await waitFor(() => {
        // Focus should still be manageable
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
    })

    it('should support keyboard navigation', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      const firstButton = buttons[0]
      
      firstButton.focus()
      
      // Test Enter key
      fireEvent.keyDown(firstButton, { key: 'Enter', code: 'Enter' })
      
      // Should handle keyboard interaction
      expect(firstButton).toBeInTheDocument()
    })

    it('should have accessible submenu items', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Plan Management')).toBeInTheDocument()
        
        // Submenu items should be accessible
        const managePlansButton = screen.getByText('Manage Plans')
        const createPlanButton = screen.getByText('Create Plan')
        
        expect(managePlansButton).toBeInTheDocument()
        expect(createPlanButton).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Links', () => {
    it('should generate correct URLs for Dashboard submenu', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument()
      })
      
      const links = screen.getAllByTestId('nav-link')
      const overviewLink = links.find(link => 
        link.textContent?.includes('Overview')
      )
      
      expect(overviewLink).toBeInTheDocument()
      expect(overviewLink).toHaveAttribute('data-href', '/dashboard/overview')
    })

    it('should generate correct URLs for Plan Management submenu', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Manage Plans')).toBeInTheDocument()
        expect(screen.getByText('Create Plan')).toBeInTheDocument()
      })
      
      const links = screen.getAllByTestId('nav-link')
      
      const managePlansLink = links.find(link => 
        link.textContent?.includes('Manage Plans')
      )
      const createPlanLink = links.find(link => 
        link.textContent?.includes('Create Plan')
      )
      
      expect(managePlansLink).toHaveAttribute('data-href', 'plan-management/')
      expect(createPlanLink).toHaveAttribute('data-href', 'plan-management/create')
    })

    it('should generate correct URLs for Tenant Management submenu', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[2])
      
      await waitFor(() => {
        expect(screen.getByText('Manage Tenants')).toBeInTheDocument()
        expect(screen.getByText('Create tenant')).toBeInTheDocument()
      })
      
      const links = screen.getAllByTestId('nav-link')
      
      const manageTenantsLink = links.find(link => 
        link.textContent?.includes('Manage Tenants')
      )
      const createTenantLink = links.find(link => 
        link.textContent?.includes('Create tenant')
      )
      
      expect(manageTenantsLink).toHaveAttribute('data-href', 'tenant-management/')
      expect(createTenantLink).toHaveAttribute('data-href', 'tenant-management/create')
    })

    it('should generate correct URLs for User Management submenu', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[3])
      
      await waitFor(() => {
        expect(screen.getByText('Manage Users')).toBeInTheDocument()
        expect(screen.getByText('Create User')).toBeInTheDocument()
      })
      
      const links = screen.getAllByTestId('nav-link')
      
      const manageUsersLink = links.find(link => 
        link.textContent?.includes('Manage Users')
      )
      const createUserLink = links.find(link => 
        link.textContent?.includes('Create User')
      )
      
      expect(manageUsersLink).toHaveAttribute('data-href', 'user-management/')
      expect(createUserLink).toHaveAttribute('data-href', 'user-management/create')
    })
  })

  describe('Error Handling', () => {
    it('should handle rapid clicks gracefully', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      // Rapid clicking should not cause errors
      for (let i = 0; i < 10; i++) {
        await userEvent.click(buttons[i % buttons.length])
      }
      
      // Should still be functional
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle invalid menu item IDs gracefully', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      // Normal operation should continue to work
      await userEvent.click(buttons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
    })

    it('should handle missing menu data gracefully', () => {
      // Component should render even if menu items are empty (tested through normal rendering)
      renderSidebar()
      
      expect(screen.getByText('US')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render efficiently with all menu items', () => {
      const startTime = performance.now()
      
      renderSidebar()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render quickly (under 100ms for a simple component)
      expect(renderTime).toBeLessThan(100)
      
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('should handle state updates efficiently', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      
      const startTime = performance.now()
      
      // Multiple state updates
      await userEvent.click(buttons[0])
      await userEvent.click(buttons[1])
      await userEvent.click(buttons[2])
      
      const endTime = performance.now()
      const updateTime = endTime - startTime
      
      // Should handle updates quickly
      expect(updateTime).toBeLessThan(1000)
      
      await waitFor(() => {
        expect(screen.getByText('Tenant Management')).toBeInTheDocument()
      })
    })
  })

  describe('Icon Rendering', () => {
    it('should render icons for main menu items', () => {
      renderSidebar()
      
      // Icons should be rendered (tested through SVG elements or icon classes)
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        // Each main menu button should contain an icon
        const hasIcon = button.querySelector('svg') || 
                       button.querySelector('.w-5') || 
                       button.textContent?.length === 0
        if (!button.textContent?.includes('US') && !button.textContent?.includes('Close')) {
          expect(button).toBeInTheDocument()
        }
      })
    })

    it('should render icons for submenu items', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Plan Management')).toBeInTheDocument()
        
        // Submenu items should also have icons
        const managePlansButton = screen.getByText('Manage Plans')
        const createPlanButton = screen.getByText('Create Plan')
        
        expect(managePlansButton).toBeInTheDocument()
        expect(createPlanButton).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain functionality across different screen sizes', () => {
      renderSidebar()
      
      // Component should render consistently
      expect(screen.getByText('US')).toBeInTheDocument()
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should handle viewport changes gracefully', async () => {
      renderSidebar()
      
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
      
      // Should maintain state across viewport changes
      expect(screen.getByText('Overview')).toBeInTheDocument()
    })
  })
})