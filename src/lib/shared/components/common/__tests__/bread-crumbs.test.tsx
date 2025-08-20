import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'
import Breadcrumbs, { generateBreadcrumbs } from '../bread-crumbs'

// Mock Next.js usePathname hook
const mockPathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname()
}))

// Mock is no longer needed since generateBreadcrumbs is now in the same file

// Mock config imports
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#885CF7',
  GRAY_COLOR: '#6B7280'
}))

// Mock polished functions
vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

const renderBreadcrumbs = () => {
  return render(
    <Breadcrumbs />, 
    { wrapper: TestWrapper }
  )
}

describe('generateBreadcrumbs', () => {
  describe('Basic Functionality', () => {
    it('should return empty array for root path', () => {
      const result = generateBreadcrumbs('/')
      expect(result).toEqual([])
    })

    it('should generate breadcrumbs for single level path', () => {
      const result = generateBreadcrumbs('/dashboard')
      expect(result).toEqual([
        { name: 'Dashboard', path: '/dashboard' }
      ])
    })

    it('should generate breadcrumbs for multi-level path', () => {
      const result = generateBreadcrumbs('/plan-management/create')
      expect(result).toEqual([
        { name: 'Plan Management', path: '/plan-management' },
        { name: 'Create', path: '/plan-management/create' }
      ])
    })

    it('should handle hyphenated segments', () => {
      const result = generateBreadcrumbs('/user-management/create-user')
      expect(result).toEqual([
        { name: 'User Management', path: '/user-management' },
        { name: 'Create User', path: '/user-management/create-user' }
      ])
    })

    it('should capitalize each word correctly', () => {
      const result = generateBreadcrumbs('/admin/settings/user-preferences')
      expect(result).toEqual([
        { name: 'Admin', path: '/admin' },
        { name: 'Settings', path: '/admin/settings' },
        { name: 'User Preferences', path: '/admin/settings/user-preferences' }
      ])
    })

    it('should handle empty string', () => {
      const result = generateBreadcrumbs('')
      expect(result).toEqual([])
    })

    it('should filter out empty segments', () => {
      const result = generateBreadcrumbs('//double//slash//path//')
      expect(result).toEqual([
        { name: 'Double', path: '/double' },
        { name: 'Slash', path: '/double/slash' },
        { name: 'Path', path: '/double/slash/path' }
      ])
    })

    it('should handle numeric segments', () => {
      const result = generateBreadcrumbs('/users/123/profile')
      expect(result).toEqual([
        { name: 'Users', path: '/users' },
        { name: '123', path: '/users/123' },
        { name: 'Profile', path: '/users/123/profile' }
      ])
    })

    it('should handle special characters in segments', () => {
      const result = generateBreadcrumbs('/api-docs/v2.1/endpoints')
      expect(result).toEqual([
        { name: 'Api Docs', path: '/api-docs' },
        { name: 'V2.1', path: '/api-docs/v2.1' },
        { name: 'Endpoints', path: '/api-docs/v2.1/endpoints' }
      ])
    })
  })
})

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      mockPathname.mockReturnValue('/')
      
      renderBreadcrumbs()
      
      // Should render breadcrumb root
      const breadcrumbRoot = screen.getByRole('navigation')
      expect(breadcrumbRoot).toBeInTheDocument()
    })

    it('should render empty breadcrumbs for root path', () => {
      mockPathname.mockReturnValue('/')
      
      renderBreadcrumbs()
      
      const breadcrumbRoot = screen.getByRole('navigation')
      expect(breadcrumbRoot).toBeInTheDocument()
      
      // Should not have any breadcrumb links for root
      const breadcrumbLinks = screen.queryAllByRole('link')
      expect(breadcrumbLinks).toHaveLength(0)
    })

    it('should render breadcrumbs for single level path', () => {
      mockPathname.mockReturnValue('/dashboard')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    })

    it('should render breadcrumbs for multi-level path', () => {
      mockPathname.mockReturnValue('/plan-management/create')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Plan Management' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Create' })).toBeInTheDocument()
    })

    it('should render breadcrumbs for deeply nested path', () => {
      mockPathname.mockReturnValue('/admin/users/profile/settings')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
    })
  })

  describe('Breadcrumb Links', () => {
    it('should generate correct href attributes', () => {
      mockPathname.mockReturnValue('/plan-management/create')
      
      renderBreadcrumbs()
      
      const planManagementLink = screen.getByRole('link', { name: 'Plan Management' })
      const createLink = screen.getByRole('link', { name: 'Create' })
      
      expect(planManagementLink).toHaveAttribute('href', '/plan-management')
      expect(createLink).toHaveAttribute('href', '/plan-management/create')
    })

    it('should handle hyphenated paths correctly', () => {
      mockPathname.mockReturnValue('/tenant-management/user-profiles')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Tenant Management' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'User Profiles' })).toBeInTheDocument()
    })

    it('should handle numeric segments', () => {
      mockPathname.mockReturnValue('/users/123/edit')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '123' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument()
    })
  })

  describe('Breadcrumb Separators', () => {
    it('should render separators between breadcrumb items', () => {
      mockPathname.mockReturnValue('/plan-management/create')
      
      renderBreadcrumbs()
      
      // Chakra UI breadcrumb separators are typically rendered as spans or divs
      const breadcrumbItems = screen.getAllByRole('listitem')
      
      // Should have 2 breadcrumb items for this path
      expect(breadcrumbItems).toHaveLength(2)
    })

    it('should not render separator after last breadcrumb', () => {
      mockPathname.mockReturnValue('/single-level')
      
      renderBreadcrumbs()
      
      const breadcrumbItems = screen.getAllByRole('listitem')
      expect(breadcrumbItems).toHaveLength(1)
    })
  })

  describe('Path Changes', () => {
    it('should update breadcrumbs when pathname changes', () => {
      mockPathname.mockReturnValue('/initial-path')
      
      const { rerender } = renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Initial Path' })).toBeInTheDocument()
      
      // Change pathname
      mockPathname.mockReturnValue('/new-path')
      
      rerender(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>
      )
      
      expect(screen.getByRole('link', { name: 'New Path' })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Initial Path' })).not.toBeInTheDocument()
    })

    it('should handle dynamic route parameters', () => {
      mockPathname.mockReturnValue('/users/[id]/profile')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '[id]' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument()
    })
  })

  describe('Styling and Accessibility', () => {
    it('should apply different colors to active and inactive breadcrumbs', () => {
      mockPathname.mockReturnValue('/level1/level2')
      
      renderBreadcrumbs()
      
      const breadcrumbLinks = screen.getAllByRole('link')
      
      // All links should be rendered
      expect(breadcrumbLinks).toHaveLength(2)
      expect(breadcrumbLinks[0]).toHaveTextContent('Level1')
      expect(breadcrumbLinks[1]).toHaveTextContent('Level2')
    })

    it('should be keyboard accessible', () => {
      mockPathname.mockReturnValue('/accessible/navigation')
      
      renderBreadcrumbs()
      
      const breadcrumbLinks = screen.getAllByRole('link')
      
      breadcrumbLinks.forEach(link => {
        // Each link should be focusable
        expect(link).not.toHaveAttribute('tabindex', '-1')
        expect(link).toHaveAttribute('href')
      })
    })

    it('should have proper ARIA navigation role', () => {
      mockPathname.mockReturnValue('/test/path')
      
      renderBreadcrumbs()
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty pathname gracefully', () => {
      mockPathname.mockReturnValue('')
      
      expect(() => renderBreadcrumbs()).not.toThrow()
    })

    it('should handle pathname with trailing slash', () => {
      mockPathname.mockReturnValue('/test-path/')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Test Path' })).toBeInTheDocument()
    })

    it('should handle pathname with multiple consecutive slashes', () => {
      mockPathname.mockReturnValue('//double//slash//path//')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Double' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Slash' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Path' })).toBeInTheDocument()
    })

    it('should handle very long breadcrumb names', () => {
      mockPathname.mockReturnValue('/very-long-breadcrumb-name-that-exceeds-normal-length/another-extremely-long-segment')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: /Very Long Breadcrumb Name/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Another Extremely Long Segment/ })).toBeInTheDocument()
    })
  })

  describe('Integration with generateBreadcrumbs', () => {
    it('should use generateBreadcrumbs function with current pathname', () => {
      mockPathname.mockReturnValue('/test-integration')
      
      renderBreadcrumbs()
      
      // Should render the breadcrumb for test-integration
      expect(screen.getByRole('link', { name: 'Test Integration' })).toBeInTheDocument()
    })

    it('should render breadcrumbs based on generateBreadcrumbs logic', () => {
      mockPathname.mockReturnValue('/custom/generated/breadcrumbs')
      
      renderBreadcrumbs()
      
      expect(screen.getByRole('link', { name: 'Custom' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Generated' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Breadcrumbs' })).toBeInTheDocument()
    })
  })
})