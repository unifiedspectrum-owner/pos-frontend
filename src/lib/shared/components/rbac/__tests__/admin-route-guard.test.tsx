/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

/* RBAC module imports */
import { AdminRouteGuard } from '../admin-route-guard'

/* Mock next/navigation */
vi.mock('next/navigation', () => ({
  usePathname: vi.fn()
}))

/* Mock ClientRouteGuard */
vi.mock('../client-route-guard', () => ({
  ClientRouteGuard: vi.fn(({ children }) => <div data-testid="client-route-guard">{children}</div>)
}))

import { usePathname } from 'next/navigation'
import { ClientRouteGuard } from '../client-route-guard'

describe('AdminRouteGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Admin Routes Protection', () => {
    it('should wrap children with ClientRouteGuard for admin routes', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/dashboard')

      render(
        <AdminRouteGuard>
          <div data-testid="test-content">Test Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('should pass pathname to ClientRouteGuard', () => {
      const pathname = '/admin/users'
      vi.mocked(usePathname).mockReturnValue(pathname)

      render(
        <AdminRouteGuard>
          <div>Content</div>
        </AdminRouteGuard>
      )

      /* Check that ClientRouteGuard was called with correct props */
      const calls = vi.mocked(ClientRouteGuard).mock.calls
      expect(calls.length).toBeGreaterThan(0)
      expect(calls[0][0]).toMatchObject({
        pathname: pathname
      })
    })

    it('should protect /admin/dashboard route', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/dashboard')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })

    it('should protect /admin/users route', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })

    it('should protect /admin/settings route', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/settings')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })

    it('should protect nested admin routes', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users/edit/123')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })

    it('should protect deeply nested admin routes', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/module/sub-module/action')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })
  })

  describe('Non-Admin Routes', () => {
    it('should render children directly for root route', () => {
      vi.mocked(usePathname).mockReturnValue('/')

      render(
        <AdminRouteGuard>
          <div data-testid="test-content">Test Content</div>
        </AdminRouteGuard>
      )

      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('should render children directly for public routes', () => {
      vi.mocked(usePathname).mockReturnValue('/login')

      render(
        <AdminRouteGuard>
          <div data-testid="test-content">Test Content</div>
        </AdminRouteGuard>
      )

      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('should render children directly for auth routes', () => {
      vi.mocked(usePathname).mockReturnValue('/auth/login')

      render(
        <AdminRouteGuard>
          <div data-testid="test-content">Test Content</div>
        </AdminRouteGuard>
      )

      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('should render children directly for tenant routes', () => {
      vi.mocked(usePathname).mockReturnValue('/tenant/dashboard')

      render(
        <AdminRouteGuard>
          <div data-testid="test-content">Test Content</div>
        </AdminRouteGuard>
      )

      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('should not protect routes with admin in name but not path', () => {
      vi.mocked(usePathname).mockReturnValue('/administrator-guide')

      render(
        <AdminRouteGuard>
          <div data-testid="test-content">Test Content</div>
        </AdminRouteGuard>
      )

      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })
  })

  describe('Children Rendering', () => {
    it('should render single child component', () => {
      vi.mocked(usePathname).mockReturnValue('/public')

      render(
        <AdminRouteGuard>
          <div data-testid="child">Child Component</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      vi.mocked(usePathname).mockReturnValue('/public')

      render(
        <AdminRouteGuard>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })

    it('should render text content', () => {
      vi.mocked(usePathname).mockReturnValue('/public')

      render(
        <AdminRouteGuard>
          Plain text content
        </AdminRouteGuard>
      )

      expect(screen.getByText('Plain text content')).toBeInTheDocument()
    })

    it('should render complex component tree', () => {
      vi.mocked(usePathname).mockReturnValue('/public')

      render(
        <AdminRouteGuard>
          <div data-testid="parent">
            <div data-testid="child">
              <span data-testid="grandchild">Nested content</span>
            </div>
          </div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('parent')).toBeInTheDocument()
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByTestId('grandchild')).toBeInTheDocument()
    })
  })

  describe('Route Pattern Detection', () => {
    it('should detect admin route with trailing slash', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })

    it('should be case-sensitive for admin route detection', () => {
      vi.mocked(usePathname).mockReturnValue('/Admin/dashboard')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      /* Should not match because of capital A */
      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()
    })

    it('should detect admin in middle of path', () => {
      vi.mocked(usePathname).mockReturnValue('/en/admin/dashboard')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })

    it('should detect admin route with query parameters pattern', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users?page=1')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      vi.mocked(usePathname).mockReturnValue('/public')

      render(
        <AdminRouteGuard>
          {null}
        </AdminRouteGuard>
      )

      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()
    })

    it('should handle undefined pathname', () => {
      vi.mocked(usePathname).mockReturnValue(undefined as unknown as string)

      /* Component will crash when pathname is undefined since it calls .includes() on it */
      /* This test verifies the component doesn't handle undefined gracefully */
      expect(() => {
        render(
          <AdminRouteGuard>
            <div data-testid="content">Content</div>
          </AdminRouteGuard>
        )
      }).toThrow()
    })

    it('should handle empty string pathname', () => {
      vi.mocked(usePathname).mockReturnValue('')

      render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })

  describe('Integration Behavior', () => {
    it('should call usePathname hook on render', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/dashboard')

      render(
        <AdminRouteGuard>
          <div>Content</div>
        </AdminRouteGuard>
      )

      expect(usePathname).toHaveBeenCalled()
    })

    it('should re-check route when pathname changes', () => {
      /* Start with a public route */
      vi.mocked(usePathname).mockReturnValue('/public')

      const { rerender } = render(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.queryByTestId('client-route-guard')).not.toBeInTheDocument()

      /* Change to admin route */
      vi.mocked(usePathname).mockReturnValue('/admin/settings')
      rerender(
        <AdminRouteGuard>
          <div data-testid="content">Content</div>
        </AdminRouteGuard>
      )

      expect(screen.getByTestId('client-route-guard')).toBeInTheDocument()
    })

    it('should pass children through route guard wrapper', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/dashboard')

      render(
        <AdminRouteGuard>
          <div data-testid="test-content">Test Content</div>
        </AdminRouteGuard>
      )

      /* Check that ClientRouteGuard was called with children prop */
      const calls = vi.mocked(ClientRouteGuard).mock.calls
      expect(calls.length).toBeGreaterThan(0)
      expect(calls[0][0]).toHaveProperty('children')
    })
  })
})
