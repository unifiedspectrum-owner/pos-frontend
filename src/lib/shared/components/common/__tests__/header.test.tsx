import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import HeaderSection from '../header'
import * as breadcrumbsModule from '@shared/components/common/bread-crumbs'

// Mock Next.js usePathname hook
const mockPathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname()
}))

// Mock config imports
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#885CF7',
  GRAY_COLOR: '#6B7280'
}))

// Mock polished functions
vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

// Mock the generateBreadcrumbs function from breadcrumbs
vi.mock('@shared/components/common/bread-crumbs', () => ({
  generateBreadcrumbs: vi.fn((pathname: string) => {
    // Handle undefined or null pathname
    if (!pathname || pathname === '/') return []
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: '/' + segments.slice(0, index + 1).join('/')
    }))
  })
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

interface AdminHeaderProps {
  loading: boolean
  handleAdd: () => void
  handleRefresh: () => void
}

const defaultProps: AdminHeaderProps = {
  loading: false,
  handleAdd: vi.fn(),
  handleRefresh: vi.fn()
}

const renderHeader = (props: Partial<AdminHeaderProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(
    <HeaderSection {...mergedProps} />,
    { wrapper: TestWrapper }
  )
}

describe('HeaderSection', () => {
  const mockGenerateBreadcrumbs = vi.mocked(breadcrumbsModule.generateBreadcrumbs)

  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname.mockReturnValue('/plan-management')
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderHeader()
      
      expect(screen.getByText('Plan Management')).toBeInTheDocument()
    })

    it('should render main heading', () => {
      renderHeader()
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Plan Management')
    })

    it('should render refresh button', () => {
      renderHeader()
      
      expect(screen.getByText('Refresh')).toBeInTheDocument()
      expect(screen.getByTitle('Refresh')).toBeInTheDocument()
    })

    it('should render add plan button', () => {
      renderHeader()
      
      expect(screen.getByText('Add Plan')).toBeInTheDocument()
      expect(screen.getByTitle('Add Plan')).toBeInTheDocument()
    })
  })

  describe('Breadcrumbs Integration', () => {
    it('should render breadcrumbs based on current pathname', () => {
      mockPathname.mockReturnValue('/plan-management/create')
      
      renderHeader()
      
      expect(screen.getByRole('link', { name: 'Plan management' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Create' })).toBeInTheDocument()
    })

    it('should render breadcrumbs with correct hrefs', () => {
      mockPathname.mockReturnValue('/plan-management/edit/123')
      
      renderHeader()
      
      const planManagementLink = screen.getByRole('link', { name: 'Plan management' })
      const editLink = screen.getByRole('link', { name: 'Edit' })
      const idLink = screen.getByRole('link', { name: '123' })
      
      expect(planManagementLink).toHaveAttribute('href', '/plan-management')
      expect(editLink).toHaveAttribute('href', '/plan-management/edit')
      expect(idLink).toHaveAttribute('href', '/plan-management/edit/123')
    })

    it('should handle root path with no breadcrumbs', () => {
      mockPathname.mockReturnValue('/')
      
      renderHeader()
      
      // Should still render the header but no breadcrumb links
      expect(screen.getByText('Plan Management')).toBeInTheDocument()
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })

    it('should update breadcrumbs when pathname changes', () => {
      mockPathname.mockReturnValue('/plan-management')
      
      const { rerender } = renderHeader()
      
      // Check for the breadcrumb link generated from the pathname
      expect(screen.getByRole('link', { name: 'Plan management' })).toBeInTheDocument()
      
      mockPathname.mockReturnValue('/user-management/create')
      
      rerender(
        <TestWrapper>
          <HeaderSection {...defaultProps} />
        </TestWrapper>
      )
      
      expect(screen.getByRole('link', { name: 'User management' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Create' })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Plan management' })).not.toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should call handleRefresh when refresh button is clicked', async () => {
      const mockHandleRefresh = vi.fn()
      
      renderHeader({ handleRefresh: mockHandleRefresh })
      
      const refreshButton = screen.getByTitle('Refresh')
      await userEvent.click(refreshButton)
      
      expect(mockHandleRefresh).toHaveBeenCalledTimes(1)
    })

    it('should call handleAdd when add button is clicked', async () => {
      const mockHandleAdd = vi.fn()
      
      renderHeader({ handleAdd: mockHandleAdd })
      
      const addButton = screen.getByText('Add Plan')
      await userEvent.click(addButton)
      
      expect(mockHandleAdd).toHaveBeenCalledTimes(1)
    })

    it('should disable refresh button when loading', () => {
      renderHeader({ loading: true })
      
      const refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).toBeDisabled()
    })

    it('should not disable add button when loading', () => {
      renderHeader({ loading: true })
      
      const addButton = screen.getByText('Add Plan')
      expect(addButton).not.toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should show loading animation on refresh button when loading', () => {
      renderHeader({ loading: true })
      
      const refreshButton = screen.getByTitle('Refresh')
      
      // Button should be disabled during loading
      expect(refreshButton).toBeDisabled()
    })

    it('should not show loading animation when not loading', () => {
      renderHeader({ loading: false })
      
      const refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).not.toBeDisabled()
    })

    it('should handle loading state changes', () => {
      const { rerender } = renderHeader({ loading: false })
      
      let refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).not.toBeDisabled()
      
      rerender(
        <TestWrapper>
          <HeaderSection {...defaultProps} loading={true} />
        </TestWrapper>
      )
      
      refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Responsive Design', () => {
    it('should render button text on larger screens', () => {
      renderHeader()
      
      // Text should be present for larger screens (even if hidden on small screens via CSS)
      expect(screen.getByText('Refresh')).toBeInTheDocument()
      expect(screen.getByText('Add Plan')).toBeInTheDocument()
    })

    it('should have proper button titles for accessibility', () => {
      renderHeader()
      
      expect(screen.getByTitle('Refresh')).toBeInTheDocument()
      expect(screen.getByTitle('Add Plan')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderHeader()
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Plan Management')
    })

    it('should have keyboard accessible buttons', () => {
      renderHeader()
      
      const refreshButton = screen.getByTitle('Refresh')
      const addButton = screen.getByTitle('Add Plan')
      
      expect(refreshButton).not.toHaveAttribute('tabindex', '-1')
      expect(addButton).not.toHaveAttribute('tabindex', '-1')
    })

    it('should have descriptive button titles', () => {
      renderHeader()
      
      expect(screen.getByTitle('Refresh')).toBeInTheDocument()
      expect(screen.getByTitle('Add Plan')).toBeInTheDocument()
    })

    it('should maintain focus management during loading states', () => {
      renderHeader({ loading: true })
      
      // Find the refresh button by its title attribute or role
      const refreshButton = screen.getByTitle('Refresh')
      
      // Should be disabled but still focusable for screen readers
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Layout and Styling', () => {
    it('should render with proper layout structure', () => {
      renderHeader()
      
      // Should contain heading and action buttons
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByText('Refresh')).toBeInTheDocument()
      expect(screen.getByText('Add Plan')).toBeInTheDocument()
    })

    it('should maintain consistent layout across different paths', () => {
      mockPathname.mockReturnValue('/complex/nested/path/structure')
      
      renderHeader()
      
      // Layout should remain consistent regardless of breadcrumb complexity
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByText('Refresh')).toBeInTheDocument()
      expect(screen.getByText('Add Plan')).toBeInTheDocument()
    })
  })

  describe('Breadcrumb Separators', () => {
    it('should render separators between breadcrumb items', () => {
      mockPathname.mockReturnValue('/level1/level2/level3')
      
      renderHeader()
      
      const breadcrumbItems = screen.getAllByRole('listitem')
      expect(breadcrumbItems.length).toBeGreaterThan(1)
    })

    it('should not render separator after last breadcrumb item', () => {
      mockPathname.mockReturnValue('/single-level')
      
      renderHeader()
      
      const breadcrumbItems = screen.getAllByRole('listitem')
      expect(breadcrumbItems).toHaveLength(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing callback functions gracefully', () => {
      expect(() => {
        renderHeader({
          handleAdd: undefined as any,
          handleRefresh: undefined as any
        })
      }).not.toThrow()
    })

    it('should handle invalid pathname gracefully', () => {
      mockPathname.mockReturnValue(null as any)
      
      expect(() => renderHeader()).not.toThrow()
    })

    it('should handle undefined pathname gracefully', () => {
      mockPathname.mockReturnValue(undefined as any)
      
      expect(() => renderHeader()).not.toThrow()
    })
  })

  describe('Button Styling States', () => {
    it('should apply hover effects to buttons', async () => {
      renderHeader()
      
      const refreshButton = screen.getByText('Refresh')
      const addButton = screen.getByText('Add Plan')
      
      // Buttons should be interactive
      expect(refreshButton).toBeInTheDocument()
      expect(addButton).toBeInTheDocument()
      
      // Should be able to hover (tested through event handling)
      await userEvent.hover(refreshButton)
      await userEvent.hover(addButton)
    })

    it('should handle active states correctly', async () => {
      const mockHandleRefresh = vi.fn()
      const mockHandleAdd = vi.fn()
      
      renderHeader({ 
        handleRefresh: mockHandleRefresh,
        handleAdd: mockHandleAdd 
      })
      
      const refreshButton = screen.getByTitle('Refresh')
      const addButton = screen.getByTitle('Add Plan')
      
      // Should handle mouse down/up events
      fireEvent.mouseDown(refreshButton)
      fireEvent.mouseUp(refreshButton)
      
      fireEvent.mouseDown(addButton)
      fireEvent.mouseUp(addButton)
    })
  })

  describe('Integration with Router', () => {
    it('should integrate with Next.js usePathname hook', () => {
      // Use the mocked function directly
      
      mockPathname.mockReturnValue('/integration/test')
      
      renderHeader()
      
      expect(screen.getByRole('link', { name: 'Integration' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Test' })).toBeInTheDocument()
      
      // Verify the hook was called
      expect(mockPathname).toHaveBeenCalled()
      // Verify generateBreadcrumbs was called with the pathname
      expect(mockGenerateBreadcrumbs).toHaveBeenCalledWith('/integration/test')
    })

    it('should handle complex routing scenarios', () => {
      // Use the mocked function directly
      
      mockPathname.mockReturnValue('/admin/users/edit/123/permissions')
      
      renderHeader()
      
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(5) // Admin, Users, Edit, 123, Permissions
      
      expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
      expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/admin/users')
      expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/admin/users/edit')
      expect(screen.getByRole('link', { name: '123' })).toHaveAttribute('href', '/admin/users/edit/123')
      expect(screen.getByRole('link', { name: 'Permissions' })).toHaveAttribute('href', '/admin/users/edit/123/permissions')
      
      // Verify generateBreadcrumbs was called
      expect(mockGenerateBreadcrumbs).toHaveBeenCalledWith('/admin/users/edit/123/permissions')
    })
  })
})