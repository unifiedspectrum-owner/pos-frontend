/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

/* Auth module imports */
import Verify2FAPage from '@auth-management/pages/verify-2fa'
import * as useAuthGuardHook from '@auth-management/hooks/use-auth-guard'
import { AUTH_STORAGE_KEYS, AUTH_PAGE_ROUTES } from '@auth-management/constants'
import { ADMIN_PAGE_ROUTES } from '@shared/constants'

/* Mock next/navigation */
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

/* Mock LoaderWrapper component */
vi.mock('@shared/components/common', () => ({
  LoaderWrapper: vi.fn(({ isLoading, loadingText, children }) => (
    <div data-testid="loader-wrapper">
      {isLoading && <div data-testid="loading-text">{loadingText}</div>}
      {children}
    </div>
  ))
}))

/* Mock Verify2FAForm component */
vi.mock('@auth-management/forms', () => ({
  Verify2FAForm: vi.fn(({ userEmail, userId }) => (
    <div data-testid="verify-2fa-form">
      <div data-testid="form-email">{userEmail}</div>
      <div data-testid="form-user-id">{userId}</div>
    </div>
  ))
}))

/* Mock AuthLayout component */
vi.mock('@auth-management/components', () => ({
  AuthLayout: vi.fn(({ children }) => (
    <div data-testid="auth-layout">{children}</div>
  ))
}))

describe('Verify2FAPage', () => {
  const defaultHookReturn = {
    isAuthenticated: false,
    isCheckingAuth: false,
    requireAuth: vi.fn(),
    requireGuest: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue(defaultHookReturn)
    /* Set up default pending 2FA data */
    localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL, 'test@example.com')
    localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID, 'user-123')
  })

  describe('Rendering States', () => {
    it('should render auth layout', () => {
      render(<Verify2FAPage />)

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    })

    it('should show loader while checking authentication', () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isCheckingAuth: true
      })

      render(<Verify2FAPage />)

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Checking authentication...')
      expect(screen.queryByTestId('verify-2fa-form')).not.toBeInTheDocument()
    })

    it('should show redirecting loader when user is authenticated', () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isAuthenticated: true,
        isCheckingAuth: false
      })

      render(<Verify2FAPage />)

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Redirecting...')
      expect(screen.queryByTestId('verify-2fa-form')).not.toBeInTheDocument()
    })

    it('should show loading verification data when no email or user ID', () => {
      localStorage.clear()

      render(<Verify2FAPage />)

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Loading verification data...')
      expect(screen.queryByTestId('verify-2fa-form')).not.toBeInTheDocument()
    })

    it('should render verify 2FA form when data is available and not authenticated', async () => {
      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(screen.getByTestId('verify-2fa-form')).toBeInTheDocument()
      })
    })
  })

  describe('Data Loading', () => {
    it('should load user email from localStorage', async () => {
      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(screen.getByTestId('form-email')).toHaveTextContent('test@example.com')
      })
    })

    it('should load user ID from localStorage', async () => {
      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(screen.getByTestId('form-user-id')).toHaveTextContent('user-123')
      })
    })

    it('should redirect to login when no email in localStorage', async () => {
      localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)

      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      })
    })

    it('should redirect to login when no user ID in localStorage', async () => {
      localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)

      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      })
    })

    it('should redirect to login when both email and user ID are missing', async () => {
      localStorage.clear()

      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      })
    })
  })

  describe('Authentication Guard', () => {
    it('should redirect to dashboard when authenticated', async () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isAuthenticated: true,
        isCheckingAuth: false
      })

      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(ADMIN_PAGE_ROUTES.DASHBOARD.HOME)
      })
    })

    it('should not redirect when checking auth', () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isCheckingAuth: true
      })

      render(<Verify2FAPage />)

      expect(mockPush).not.toHaveBeenCalledWith(ADMIN_PAGE_ROUTES.DASHBOARD.HOME)
    })

    it('should not show form when authenticated', () => {
      vi.spyOn(useAuthGuardHook, 'useAuthGuard').mockReturnValue({
        ...defaultHookReturn,
        isAuthenticated: true,
        isCheckingAuth: false
      })

      render(<Verify2FAPage />)

      expect(screen.queryByTestId('verify-2fa-form')).not.toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should use useAuthGuard hook', () => {
      const spy = vi.spyOn(useAuthGuardHook, 'useAuthGuard')

      render(<Verify2FAPage />)

      expect(spy).toHaveBeenCalled()
    })

    it('should pass correct props to Verify2FAForm', async () => {
      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(screen.getByTestId('form-email')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('form-user-id')).toHaveTextContent('user-123')
      })
    })

    it('should not render form until data is loaded', () => {
      localStorage.clear()

      render(<Verify2FAPage />)

      expect(screen.queryByTestId('verify-2fa-form')).not.toBeInTheDocument()
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Loading verification data...')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty email string', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL, '')

      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      })
    })

    it('should handle empty user ID string', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID, '')

      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      })
    })

    it('should handle valid data with special characters in email', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL, 'test+user@example.com')

      render(<Verify2FAPage />)

      await waitFor(() => {
        expect(screen.getByTestId('form-email')).toHaveTextContent('test+user@example.com')
      })
    })
  })
})
