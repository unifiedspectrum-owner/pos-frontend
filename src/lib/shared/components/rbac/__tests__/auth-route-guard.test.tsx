/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

/* RBAC module imports */
import AuthRouteGuard from '../auth-route-guard'

/* Mock dependencies */
vi.mock('@shared/components/common', () => ({
  LoaderWrapper: vi.fn(({ children, loadingText }) => (
    <div data-testid="loader-wrapper">
      <div data-testid="loading-text">{loadingText}</div>
      {children}
    </div>
  ))
}))

vi.mock('@auth-management/hooks', () => ({
  useAuthGuard: vi.fn()
}))

import { useAuthGuard } from '@auth-management/hooks'

describe('AuthRouteGuard Component', () => {
  const mockRequireAuth = vi.fn()
  const mockRequireGuest = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAuth.mockClear()
    mockRequireGuest.mockClear()
  })

  describe('Authenticated State', () => {
    it('should render children when authenticated', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.queryByTestId('loader-wrapper')).not.toBeInTheDocument()
    })

    it('should not call requireAuth when already authenticated', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(mockRequireAuth).not.toHaveBeenCalled()
    })

    it('should render multiple children when authenticated', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })

  describe('Checking Authentication State', () => {
    it('should show loader while checking auth with default message', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Checking authentication...')
      /* Content should NOT be in the DOM - only empty fragment is passed to LoaderWrapper */
      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })

    it('should show loader with custom message', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard loadingMessage="Verifying your credentials...">
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Verifying your credentials...')
    })

    it('should not show loader when showLoader is false', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      const { container } = render(
        <AuthRouteGuard showLoader={false}>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(screen.queryByTestId('loader-wrapper')).not.toBeInTheDocument()
      expect(container.firstChild).toBeNull()
    })

    it('should not render children while checking auth', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard showLoader={false}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthRouteGuard>
      )

      /* Content should not be visible when showLoader is false */
      const { container } = render(
        <AuthRouteGuard showLoader={false}>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Not Authenticated State', () => {
    it('should call requireAuth when not authenticated', async () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      await waitFor(() => {
        expect(mockRequireAuth).toHaveBeenCalledTimes(1)
      })
    })

    it('should show redirecting loader when not authenticated', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Redirecting to login...')
    })

    it('should not show loader when not authenticated and showLoader is false', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      const { container } = render(
        <AuthRouteGuard showLoader={false}>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(screen.queryByTestId('loader-wrapper')).not.toBeInTheDocument()
      expect(container.firstChild).toBeNull()
    })

    it('should not render children when not authenticated', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard showLoader={false}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthRouteGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })

  describe('Props Configuration', () => {
    it('should use default showLoader value of true', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
    })

    it('should use default loadingMessage', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Checking authentication...')
    })

    it('should accept custom loadingMessage', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard loadingMessage="Loading user session...">
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Loading user session...')
    })

    it('should accept showLoader as false', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      const { container } = render(
        <AuthRouteGuard showLoader={false}>
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(container.firstChild).toBeNull()
    })

    it('should accept showLoader as true explicitly', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard showLoader={true}>
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
    })
  })

  describe('UseEffect Dependencies', () => {
    it('should call requireAuth when authentication check completes', async () => {
      /* Start with checking state */
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      const { rerender } = render(
        <AuthRouteGuard>
          <div>Content</div>
        </AuthRouteGuard>
      )

      /* Change to not checking and not authenticated */
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      rerender(
        <AuthRouteGuard>
          <div>Content</div>
        </AuthRouteGuard>
      )

      await waitFor(() => {
        expect(mockRequireAuth).toHaveBeenCalled()
      })
    })

    it('should not call requireAuth while still checking', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(mockRequireAuth).not.toHaveBeenCalled()
    })

    it('should not call requireAuth when authenticated', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(mockRequireAuth).not.toHaveBeenCalled()
    })
  })

  describe('State Transitions', () => {
    it('should transition from checking to authenticated', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      const { rerender } = render(
        <AuthRouteGuard>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()

      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      rerender(
        <AuthRouteGuard>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(screen.queryByTestId('loader-wrapper')).not.toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('should transition from checking to not authenticated', async () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      const { rerender } = render(
        <AuthRouteGuard>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Checking authentication...')

      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      rerender(
        <AuthRouteGuard>
          <div data-testid="content">Content</div>
        </AuthRouteGuard>
      )

      await waitFor(() => {
        expect(mockRequireAuth).toHaveBeenCalled()
      })
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Redirecting to login...')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      const { container } = render(
        <AuthRouteGuard>
          {null}
        </AuthRouteGuard>
      )

      /* When children is null and authenticated, component renders empty fragment with null */
      /* This results in no DOM elements */
      expect(container.firstChild).toBeNull()
    })

    it('should handle empty children', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      const { container } = render(
        <AuthRouteGuard>
          {undefined}
        </AuthRouteGuard>
      )

      /* When children is undefined and authenticated, component renders empty fragment with undefined */
      /* This results in no DOM elements */
      expect(container.firstChild).toBeNull()
    })

    it('should handle text children', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          Plain text content
        </AuthRouteGuard>
      )

      expect(screen.getByText('Plain text content')).toBeInTheDocument()
    })

    it('should handle empty string loadingMessage', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: true,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard loadingMessage="">
          <div>Content</div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('loading-text')).toHaveTextContent('')
    })
  })

  describe('Integration Tests', () => {
    it('should work with complex component tree', () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: true,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div data-testid="parent">
            <div data-testid="child1">
              <span data-testid="grandchild">Nested</span>
            </div>
            <div data-testid="child2">Sibling</div>
          </div>
        </AuthRouteGuard>
      )

      expect(screen.getByTestId('parent')).toBeInTheDocument()
      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
      expect(screen.getByTestId('grandchild')).toBeInTheDocument()
    })

    it('should call requireAuth only once per render cycle', async () => {
      vi.mocked(useAuthGuard).mockReturnValue({
        isAuthenticated: false,
        isCheckingAuth: false,
        requireAuth: mockRequireAuth,
        requireGuest: mockRequireGuest
      })

      render(
        <AuthRouteGuard>
          <div>Content</div>
        </AuthRouteGuard>
      )

      await waitFor(() => {
        expect(mockRequireAuth).toHaveBeenCalledTimes(1)
      })
    })
  })
})
