/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

/* Auth module imports */
import LoginPage from '@auth-management/pages/login'
import * as useAuthGuardHook from '@auth-management/hooks/use-auth-guard'

/* Mock LoaderWrapper component */
vi.mock('@shared/components/common', () => ({
  LoaderWrapper: vi.fn(({ isLoading, loadingText, children }) => (
    <div data-testid="loader-wrapper">
      {isLoading && <div data-testid="loading-text">{loadingText}</div>}
      {children}
    </div>
  ))
}))

/* Mock LoginForm component */
vi.mock('@auth-management/forms', () => ({
  LoginForm: vi.fn(() => <div data-testid="login-form">Login Form</div>)
}))

/* Mock AuthLayout component */
vi.mock('@auth-management/components', () => ({
  AuthLayout: vi.fn(({ children }) => (
    <div data-testid="auth-layout">{children}</div>
  ))
}))

describe('LoginPage', () => {
  const mockRequireGuest = vi.fn()

  const defaultHookReturn = {
    isAuthenticated: false,
    isCheckingAuth: false,
    requireAuth: vi.fn(),
    requireGuest: mockRequireGuest
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering States', () => {
    it('should render auth layout', () => {
      render(<LoginPage />)

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    })

    it('should show loader while checking authentication', () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isCheckingAuth: true
      })

      render(<LoginPage />)

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Checking authentication...')
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
    })

    it('should show redirecting loader when user is authenticated', () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isAuthenticated: true,
        isCheckingAuth: false
      })

      render(<LoginPage />)

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Redirecting...')
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
    })

    it('should render login form for unauthenticated users', () => {
      render(<LoginPage />)

      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.queryByTestId('loading-text')).not.toBeInTheDocument()
    })
  })

  describe('Authentication Guard', () => {
    it('should call requireGuest when not checking auth', async () => {
      render(<LoginPage />)

      await waitFor(() => {
        expect(mockRequireGuest).toHaveBeenCalled()
      })
    })

    it('should not call requireGuest while checking auth', () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isCheckingAuth: true
      })

      render(<LoginPage />)

      expect(mockRequireGuest).not.toHaveBeenCalled()
    })

    it('should redirect authenticated users', () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isAuthenticated: true,
        isCheckingAuth: false
      })

      render(<LoginPage />)

      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Redirecting...')
    })
  })

  describe('Component Integration', () => {
    it('should use useAuthGuard hook', () => {
      const spy = vi.spyOn(useAuthGuardHook, 'useAuthGuard')

      render(<LoginPage />)

      expect(spy).toHaveBeenCalled()
    })

    it('should handle auth check completion', async () => {
      const { rerender } = render(<LoginPage />)

      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isCheckingAuth: false
      })

      rerender(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument()
      })
    })
  })
})
