/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import Breadcrumbs, { generateBreadcrumbs } from '../bread-crumbs'

/* Mock dependencies */
vi.mock('next/navigation', () => ({
  usePathname: vi.fn()
}))

vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182ce',
  GRAY_COLOR: '#718096'
}))

import { usePathname } from 'next/navigation'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('generateBreadcrumbs', () => {
  describe('Basic Functionality', () => {
    it('should generate breadcrumbs from simple path', () => {
      const result = generateBreadcrumbs('/admin/users')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'Admin', path: '/admin' })
      expect(result[1]).toEqual({ name: 'Users', path: '/admin/users' })
    })

    it('should handle root path', () => {
      const result = generateBreadcrumbs('/')

      expect(result).toHaveLength(0)
    })

    it('should handle single segment path', () => {
      const result = generateBreadcrumbs('/dashboard')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ name: 'Dashboard', path: '/dashboard' })
    })

    it('should handle deep nested paths', () => {
      const result = generateBreadcrumbs('/admin/users/edit/123')

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({ name: 'Admin', path: '/admin' })
      expect(result[1]).toEqual({ name: 'Users', path: '/admin/users' })
      expect(result[2]).toEqual({ name: 'Edit', path: '/admin/users/edit' })
      expect(result[3]).toEqual({ name: '123', path: '/admin/users/edit/123' })
    })
  })

  describe('Path Formatting', () => {
    it('should capitalize first letter of each word', () => {
      const result = generateBreadcrumbs('/admin/user-management')

      expect(result[1].name).toBe('User Management')
    })

    it('should convert dashes to spaces', () => {
      const result = generateBreadcrumbs('/admin/role-management')

      expect(result[1].name).toBe('Role Management')
    })

    it('should handle multiple dashes', () => {
      const result = generateBreadcrumbs('/admin/support-ticket-management')

      expect(result[1].name).toBe('Support Ticket Management')
    })

    it('should capitalize each word after dash', () => {
      const result = generateBreadcrumbs('/admin/plan-management/create')

      expect(result[1].name).toBe('Plan Management')
      expect(result[2].name).toBe('Create')
    })

    it('should handle numeric segments', () => {
      const result = generateBreadcrumbs('/admin/users/123')

      expect(result[2].name).toBe('123')
    })

    it('should handle mixed case segments', () => {
      const result = generateBreadcrumbs('/admin/userManagement')

      /* No dashes means treated as single word - capitalizes first letter, preserves rest */
      expect(result[1].name).toBe('UserManagement')
    })
  })

  describe('Edge Cases', () => {
    it('should handle trailing slash', () => {
      const result = generateBreadcrumbs('/admin/users/')

      expect(result).toHaveLength(2)
      expect(result[1]).toEqual({ name: 'Users', path: '/admin/users' })
    })

    it('should handle multiple slashes', () => {
      const result = generateBreadcrumbs('//admin//users')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'Admin', path: '/admin' })
      expect(result[1]).toEqual({ name: 'Users', path: '/admin/users' })
    })

    it('should handle empty string', () => {
      const result = generateBreadcrumbs('')

      expect(result).toHaveLength(0)
    })

    it('should handle path with special characters', () => {
      const result = generateBreadcrumbs('/admin/users_list')

      /* Underscores are not replaced, only dashes */
      expect(result[1].name).toBe('Users_list')
    })

    it('should handle very long paths', () => {
      const result = generateBreadcrumbs('/a/b/c/d/e/f/g/h/i/j')

      expect(result).toHaveLength(10)
      expect(result[0]).toEqual({ name: 'A', path: '/a' })
      expect(result[9]).toEqual({ name: 'J', path: '/a/b/c/d/e/f/g/h/i/j' })
    })

    it('should handle single character segments', () => {
      const result = generateBreadcrumbs('/a/b/c')

      expect(result[0]).toEqual({ name: 'A', path: '/a' })
      expect(result[1]).toEqual({ name: 'B', path: '/a/b' })
      expect(result[2]).toEqual({ name: 'C', path: '/a/b/c' })
    })
  })

  describe('Path Building', () => {
    it('should build cumulative paths correctly', () => {
      const result = generateBreadcrumbs('/admin/users/edit')

      expect(result[0].path).toBe('/admin')
      expect(result[1].path).toBe('/admin/users')
      expect(result[2].path).toBe('/admin/users/edit')
    })

    it('should maintain path structure for nested routes', () => {
      const result = generateBreadcrumbs('/admin/tenant-management/view/123')

      expect(result[0].path).toBe('/admin')
      expect(result[1].path).toBe('/admin/tenant-management')
      expect(result[2].path).toBe('/admin/tenant-management/view')
      expect(result[3].path).toBe('/admin/tenant-management/view/123')
    })
  })
})

describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render breadcrumbs for simple path', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('should render breadcrumbs with proper links', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users/create')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      const adminLink = screen.getByText('Admin').closest('a')
      const usersLink = screen.getByText('Users').closest('a')
      const createLink = screen.getByText('Create').closest('a')

      expect(adminLink).toHaveAttribute('href', '/admin')
      expect(usersLink).toHaveAttribute('href', '/admin/users')
      expect(createLink).toHaveAttribute('href', '/admin/users/create')
    })

    it('should render nothing for root path', () => {
      vi.mocked(usePathname).mockReturnValue('/')

      const { container } = render(<Breadcrumbs />, { wrapper: TestWrapper })

      /* Should render breadcrumb structure but with no items */
      expect(container.querySelector('nav')).toBeInTheDocument()
    })

    it('should render single breadcrumb for single segment', () => {
      vi.mocked(usePathname).mockReturnValue('/dashboard')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should render multiple breadcrumbs for nested path', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users/edit/123')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('123')).toBeInTheDocument()
    })
  })

  describe('Formatting', () => {
    it('should format path segments with dashes', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/user-management')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('should format path segments with multiple dashes', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/support-ticket-management')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('Support Ticket Management')).toBeInTheDocument()
    })

    it('should capitalize all words', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/plan-management/create')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('Plan Management')).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
    })
  })

  describe('Navigation Structure', () => {
    it('should use pathname from usePathname hook', () => {
      const mockPathname = '/admin/settings'
      vi.mocked(usePathname).mockReturnValue(mockPathname)

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(usePathname).toHaveBeenCalled()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should update when pathname changes', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users')

      const { rerender } = render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('Users')).toBeInTheDocument()

      vi.mocked(usePathname).mockReturnValue('/admin/roles')

      rerender(<Breadcrumbs />)

      expect(screen.getByText('Roles')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long paths', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/tenant-management/view/123/details/subscription')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('Tenant Management')).toBeInTheDocument()
      expect(screen.getByText('View')).toBeInTheDocument()
      expect(screen.getByText('123')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
      expect(screen.getByText('Subscription')).toBeInTheDocument()
    })

    it('should handle numeric segments', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users/123')

      render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(screen.getByText('123')).toBeInTheDocument()
    })

    it('should handle empty pathname', () => {
      vi.mocked(usePathname).mockReturnValue('')

      const { container } = render(<Breadcrumbs />, { wrapper: TestWrapper })

      expect(container.querySelector('nav')).toBeInTheDocument()
    })
  })
})
