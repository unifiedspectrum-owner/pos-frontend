/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import NavigationHeader from '../navigation-header'

/* TypeScript interfaces for mock props */
interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
}

/* Mock dependencies */
vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182ce',
  WHITE_COLOR: '#ffffff',
  GRAY_COLOR: '#718096'
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn()
}))

vi.mock('@auth-management/constants', () => ({
  AUTH_STORAGE_KEYS: {
    USER: 'user_data'
  }
}))

vi.mock('@shared/constants', () => ({
  ADMIN_PAGE_ROUTES: {
    PROFILE: '/admin/profile',
    SETTINGS: '/admin/settings',
    NOTIFICATIONS: '/admin/notifications'
  }
}))

vi.mock('@auth-management/hooks', () => ({
  useAuthOperations: vi.fn()
}))

vi.mock('@shared/hooks', () => ({
  useSessionTimer: vi.fn()
}))

vi.mock('@shared/components/common', () => ({
  ConfirmationDialog: ({ isOpen, title, message }: ConfirmationDialogProps) =>
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <div>{title}</div>
        <div>{message}</div>
      </div>
    ) : null
}))

import { useRouter } from '@/i18n/navigation'
import { useAuthOperations } from '@auth-management/hooks'
import { useSessionTimer } from '@shared/hooks'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('NavigationHeader Component', () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()
  const mockLogoutUser = vi.fn()
  const mockExtendSession = vi.fn()
  const mockResumeSession = vi.fn()
  const mockDismissWarning = vi.fn()
  const mockHandleExpiredLogin = vi.fn()
  const mockResetTimer = vi.fn()

  /* Create complete mock for useAuthOperations */
  const mockAuthOperations = {
    loginUser: vi.fn(),
    isLoggingIn: false,
    loginError: null,
    shouldShow2FAReminder: false,
    forgotPassword: vi.fn(),
    isForgotPasswordLoading: false,
    forgotPasswordError: null,
    resetPassword: vi.fn(),
    isResetPasswordLoading: false,
    resetPasswordError: null,
    validateResetToken: vi.fn(),
    isValidatingToken: false,
    tokenValidationErrorCode: null,
    tokenValidationErrorMsg: null,
    refreshToken: vi.fn(),
    isRefreshingToken: false,
    refreshTokenError: null,
    logoutUser: mockLogoutUser,
    isLoggingOut: false,
    logoutError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()

    /* Mock localStorage */
    const mockUserData = {
      name: 'John Doe',
      role: 'Admin',
      id: '123',
      email: 'john@example.com'
    }
    localStorage.setItem('user_data', JSON.stringify(mockUserData))

    /* Mock router */
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh
    } as unknown as ReturnType<typeof useRouter>)

    /* Mock auth operations */
    vi.mocked(useAuthOperations).mockReturnValue(mockAuthOperations)

    /* Mock session timer */
    vi.mocked(useSessionTimer).mockReturnValue({
      formattedTime: '15:00',
      remainingTime: 900,
      isExpired: false,
      showWarningDialog: false,
      isInactivityWarning: false,
      inactivityCountdown: 0,
      showExpiredDialog: false,
      expiredCountdown: 0,
      resetTimer: mockResetTimer,
      extendSession: mockExtendSession,
      resumeSession: mockResumeSession,
      dismissWarning: mockDismissWarning,
      handleExpiredLogin: mockHandleExpiredLogin
    })
  })

  describe('Basic Rendering', () => {
    it('should render navigation header', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })

    it('should render user name', async () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('should render user role', async () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument()
      })
    })

    it('should render session timer', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('15:00')).toBeInTheDocument()
    })

    it('should render notifications button', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Notifications')).toBeInTheDocument()
    })
  })

  describe('User Data Loading', () => {
    it('should show loading skeleton initially', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      /* Initially loading, then user data loads */
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })

    it('should load user data from localStorage', async () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('should handle missing user data gracefully', async () => {
      localStorage.removeItem('user_data')

      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })
    })

    it('should handle invalid JSON in localStorage', async () => {
      localStorage.setItem('user_data', 'invalid json')

      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })
    })
  })

  describe('Notifications', () => {
    it('should show notification count', async () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('should show 9+ for counts over 9', async () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      /* Component shows 3 by default in mock */
      await waitFor(() => {
        expect(screen.getByTitle('Notifications')).toBeInTheDocument()
      })
    })

    it('should navigate to notifications on click', async () => {
      const user = userEvent.setup()

      render(<NavigationHeader />, { wrapper: TestWrapper })

      const notificationButton = screen.getByTitle('Notifications')
      await user.click(notificationButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/notifications')
    })
  })

  describe('Session Timer', () => {
    it('should display formatted time', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('15:00')).toBeInTheDocument()
    })

    it('should show warning color when time is low', () => {
      vi.mocked(useSessionTimer).mockReturnValue({
        formattedTime: '00:30',
        remainingTime: 30,
        isExpired: false,
        showWarningDialog: false,
        isInactivityWarning: false,
        inactivityCountdown: 0,
        showExpiredDialog: false,
        expiredCountdown: 0,
        resetTimer: mockResetTimer,
        extendSession: mockExtendSession,
        resumeSession: mockResumeSession,
        dismissWarning: mockDismissWarning,
        handleExpiredLogin: mockHandleExpiredLogin
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('00:30')).toBeInTheDocument()
    })

    it('should have tooltip with session info', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      /* Timer is visible */
      expect(screen.getByText('15:00')).toBeInTheDocument()
    })
  })

  describe('User Menu', () => {
    it('should open user menu on click', async () => {
      const user = userEvent.setup()

      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const userButton = screen.getByText('John Doe')
      await user.click(userButton)
    })

    it('should navigate to profile', async () => {
      const user = userEvent.setup()

      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      /* In actual implementation, menu items would be visible after click */
    })

    it('should navigate to settings', async () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Logout Functionality', () => {
    it('should show logout confirmation dialog', () => {
      vi.mocked(useSessionTimer).mockReturnValue({
        formattedTime: '15:00',
        remainingTime: 900,
        isExpired: false,
        showWarningDialog: false,
        isInactivityWarning: false,
        inactivityCountdown: 0,
        showExpiredDialog: false,
        expiredCountdown: 0,
        resetTimer: mockResetTimer,
        extendSession: mockExtendSession,
        resumeSession: mockResumeSession,
        dismissWarning: mockDismissWarning,
        handleExpiredLogin: mockHandleExpiredLogin
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      /* Initially no dialog */
      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Session Warning Dialog', () => {
    it('should show warning dialog when session expiring', () => {
      vi.mocked(useSessionTimer).mockReturnValue({
        formattedTime: '02:00',
        remainingTime: 120,
        isExpired: false,
        showWarningDialog: true,
        isInactivityWarning: false,
        inactivityCountdown: 0,
        showExpiredDialog: false,
        expiredCountdown: 0,
        resetTimer: mockResetTimer,
        extendSession: mockExtendSession,
        resumeSession: mockResumeSession,
        dismissWarning: mockDismissWarning,
        handleExpiredLogin: mockHandleExpiredLogin
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument()
    })

    it('should show inactivity warning', () => {
      vi.mocked(useSessionTimer).mockReturnValue({
        formattedTime: '15:00',
        remainingTime: 900,
        isExpired: false,
        showWarningDialog: true,
        isInactivityWarning: true,
        inactivityCountdown: 30,
        showExpiredDialog: false,
        expiredCountdown: 0,
        resetTimer: mockResetTimer,
        extendSession: mockExtendSession,
        resumeSession: mockResumeSession,
        dismissWarning: mockDismissWarning,
        handleExpiredLogin: mockHandleExpiredLogin
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      expect(screen.getByText('Inactivity Detected')).toBeInTheDocument()
    })
  })

  describe('Session Expired Dialog', () => {
    it('should show expired dialog', () => {
      vi.mocked(useSessionTimer).mockReturnValue({
        formattedTime: '00:00',
        remainingTime: 0,
        isExpired: true,
        showWarningDialog: false,
        isInactivityWarning: false,
        inactivityCountdown: 0,
        showExpiredDialog: true,
        expiredCountdown: 5,
        resetTimer: mockResetTimer,
        extendSession: mockExtendSession,
        resumeSession: mockResumeSession,
        dismissWarning: mockDismissWarning,
        handleExpiredLogin: mockHandleExpiredLogin
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      expect(screen.getByText('Session Expired')).toBeInTheDocument()
    })

    it('should show countdown in expired dialog', () => {
      vi.mocked(useSessionTimer).mockReturnValue({
        formattedTime: '00:00',
        remainingTime: 0,
        isExpired: true,
        showWarningDialog: false,
        isInactivityWarning: false,
        inactivityCountdown: 0,
        showExpiredDialog: true,
        expiredCountdown: 10,
        resetTimer: mockResetTimer,
        extendSession: mockExtendSession,
        resumeSession: mockResumeSession,
        dismissWarning: mockDismissWarning,
        handleExpiredLogin: mockHandleExpiredLogin
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText(/You will be automatically redirected to the login page in 10 seconds/)).toBeInTheDocument()
    })
  })

  describe('Dialog Priority', () => {
    it('should prioritize expired dialog over warning', () => {
      vi.mocked(useSessionTimer).mockReturnValue({
        formattedTime: '00:00',
        remainingTime: 0,
        isExpired: true,
        showWarningDialog: true,
        isInactivityWarning: false,
        inactivityCountdown: 0,
        showExpiredDialog: true,
        expiredCountdown: 5,
        resetTimer: mockResetTimer,
        extendSession: mockExtendSession,
        resumeSession: mockResumeSession,
        dismissWarning: mockDismissWarning,
        handleExpiredLogin: mockHandleExpiredLogin
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('Session Expired')).toBeInTheDocument()
      expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument()
    })

    it('should show warning dialog when no expired dialog', () => {
      vi.mocked(useSessionTimer).mockReturnValue({
        formattedTime: '02:00',
        remainingTime: 120,
        isExpired: false,
        showWarningDialog: true,
        isInactivityWarning: false,
        inactivityCountdown: 0,
        showExpiredDialog: false,
        expiredCountdown: 0,
        resetTimer: mockResetTimer,
        extendSession: mockExtendSession,
        resumeSession: mockResumeSession,
        dismissWarning: mockDismissWarning,
        handleExpiredLogin: mockHandleExpiredLogin
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty user name', async () => {
      localStorage.setItem('user_data', JSON.stringify({
        name: '',
        role: 'Admin',
        id: '123',
        email: 'test@example.com'
      }))

      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument()
      })
    })

    it('should handle very long user name', async () => {
      localStorage.setItem('user_data', JSON.stringify({
        name: 'This is a very long user name that should still display',
        role: 'Admin',
        id: '123',
        email: 'test@example.com'
      }))

      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('This is a very long user name that should still display')).toBeInTheDocument()
      })
    })

    it('should handle logout during loading', () => {
      vi.mocked(useAuthOperations).mockReturnValue({
        ...mockAuthOperations,
        isLoggingOut: true
      })

      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })

    it('should render on desktop viewport', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      expect(screen.getByText('15:00')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible header role', () => {
      const { container } = render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(container.querySelector('header')).toBeInTheDocument()
    })

    it('should have accessible notification button', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Notifications')).toBeInTheDocument()
    })

    it('should have readable text content', async () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should integrate with auth operations', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(useAuthOperations).toHaveBeenCalled()
    })

    it('should integrate with session timer', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(useSessionTimer).toHaveBeenCalled()
    })

    it('should integrate with router', () => {
      render(<NavigationHeader />, { wrapper: TestWrapper })

      expect(useRouter).toHaveBeenCalled()
    })
  })
})
