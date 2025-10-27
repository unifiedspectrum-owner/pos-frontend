/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { render } from '@shared/test-utils/render'

/* Auth module imports */
import UpdateProfilePage from '@auth-management/pages/update-profile'
import * as useUserOperationsHook from '@user-management/hooks/use-user-operations'
import { AUTH_STORAGE_KEYS, AUTH_PAGE_ROUTES } from '@auth-management/constants'

/* Mock next/navigation */
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

/* Mock react-hook-form */
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    ...actual,
    FormProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="form-provider">{children}</div>
  }
})

/* Mock LoaderWrapper component */
vi.mock('@shared/components/common', () => ({
  LoaderWrapper: vi.fn(({ isLoading, loadingText, children }) => (
    <div data-testid="loader-wrapper">
      {isLoading && <div data-testid="loading-text">{loadingText}</div>}
      {!isLoading && children}
    </div>
  )),
  ErrorMessageContainer: vi.fn(({ error, onRetry }) => (
    <div data-testid="error-container">
      <div data-testid="error-text">{error}</div>
      <button onClick={onRetry} data-testid="retry-button">Retry</button>
    </div>
  ))
}))

/* Mock UpdateProfileForm component */
vi.mock('@auth-management/forms', () => ({
  UpdateProfileForm: vi.fn(({ onSubmit, onCancel, isSubmitting }) => (
    <div data-testid="update-profile-form">
      <div data-testid="is-submitting">{isSubmitting ? 'true' : 'false'}</div>
      <button onClick={onSubmit} data-testid="submit-button">Update</button>
      <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
    </div>
  )),
  TwoFactorForm: vi.fn(({ isEnabled, userId }) => (
    <div data-testid="two-factor-form">
      <div data-testid="2fa-enabled">{isEnabled ? 'true' : 'false'}</div>
      <div data-testid="2fa-user-id">{userId || 'undefined'}</div>
    </div>
  ))
}))

/* Mock toast notifications */
vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

/* Mock phone formatting utilities */
vi.mock('@shared/utils/formatting', () => ({
  parsePhoneFromAPI: vi.fn((phone: string) => ['+1', phone.replace('+1', '')]),
  formatPhoneForAPI: vi.fn(([dialCode, number]: string[]) => `${dialCode}${number}`)
}))

describe('UpdateProfilePage', () => {
  const mockFetchUserDetails = vi.fn()
  const mockUpdateUser = vi.fn()

  const mockUserDetails = {
    id: 1,
    f_name: 'John',
    l_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+11234567890',
    profile_image_url: null,
    is_2fa_required: false,
    is_2fa_enabled: false,
    user_status: 'active' as const,
    email_verified: true,
    phone_verified: true,
    email_verified_at: '2024-01-01T00:00:00Z',
    phone_verified_at: '2024-01-01T00:00:00Z',
    last_password_change: null,
    account_locked_until: null,
    user_created_at: '2024-01-01T00:00:00Z',
    user_updated_at: '2024-01-01T00:00:00Z',
    is_active: true,
    role_details: null
  }

  const defaultHookReturn = {
    fetchUserDetails: mockFetchUserDetails,
    userDetails: mockUserDetails,
    isFetching: false,
    fetchError: null,
    updateUser: mockUpdateUser,
    isUpdating: false,
    fetchUserBasicDetails: vi.fn(),
    userStatistics: null,
    permissions: [],
    createUser: vi.fn(),
    isCreating: false,
    createError: null,
    isDeleting: false,
    deleteError: null,
    deleteUser: vi.fn(),
    updateError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue(defaultHookReturn)
    mockFetchUserDetails.mockResolvedValue(true)
    mockUpdateUser.mockResolvedValue(true)
    /* Set default user data in localStorage */
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify({ id: '1', email: 'john.doe@example.com' }))
  })

  describe('Rendering', () => {
    it('should render the update profile page', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByText('My Profile')).toBeInTheDocument()
      })
    })

    it('should render form provider', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('form-provider')).toBeInTheDocument()
      })
    })

    it('should render update profile form', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('update-profile-form')).toBeInTheDocument()
      })
    })

    it('should render two factor form', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('two-factor-form')).toBeInTheDocument()
      })
    })
  })

  describe('User Profile Loading', () => {
    it('should fetch user details on mount', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(mockFetchUserDetails).toHaveBeenCalledWith('1', true)
      })
    })

    it('should show loading state while fetching profile', () => {
      vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
        ...defaultHookReturn,
        isFetching: true
      })

      render(<UpdateProfilePage />)

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Loading profile...')
    })

    it('should redirect to login when no user data in localStorage', async () => {
      localStorage.clear()

      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      })
    })

    it('should redirect to login when user ID is missing', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify({ email: 'test@example.com' }))

      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      })
    })
  })

  describe('Form Submission', () => {
    it('should not show submitting state initially', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('is-submitting')).toHaveTextContent('false')
      })
    })

    it('should show submitting state when updating', async () => {
      vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
        ...defaultHookReturn,
        isUpdating: true
      })

      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('is-submitting')).toHaveTextContent('true')
      })
    })

    it('should call updateUser when form is submitted', async () => {
      const user = userEvent.setup()
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalled()
      })
    })
  })

  describe('Two Factor Authentication', () => {
    it('should pass 2FA enabled status to TwoFactorForm', async () => {
      vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
        ...defaultHookReturn,
        userDetails: { ...mockUserDetails, is_2fa_enabled: true }
      })

      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('2fa-enabled')).toHaveTextContent('true')
      })
    })

    it('should pass 2FA disabled status to TwoFactorForm', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('2fa-enabled')).toHaveTextContent('false')
      })
    })

    it('should pass user ID to TwoFactorForm', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('2fa-user-id')).toHaveTextContent('1')
      })
    })

    it('should handle null userDetails', async () => {
      vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
        ...defaultHookReturn,
        userDetails: null
      })

      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('2fa-enabled')).toHaveTextContent('false')
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error message when fetch fails', () => {
      vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
        ...defaultHookReturn,
        fetchError: 'Failed to load profile'
      })

      render(<UpdateProfilePage />)

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByTestId('error-text')).toHaveTextContent('Failed to load profile')
    })

    it('should allow retry when error occurs', async () => {
      const user = userEvent.setup()
      vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
        ...defaultHookReturn,
        fetchError: 'Failed to load profile'
      })

      render(<UpdateProfilePage />)

      const retryButton = screen.getByTestId('retry-button')
      await user.click(retryButton)

      expect(mockFetchUserDetails).toHaveBeenCalled()
    })

    it('should not show form when there is an error', () => {
      vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
        ...defaultHookReturn,
        fetchError: 'Failed to load profile'
      })

      render(<UpdateProfilePage />)

      expect(screen.queryByTestId('update-profile-form')).not.toBeInTheDocument()
    })
  })

  describe('Form Cancellation', () => {
    it('should handle cancel button click', async () => {
      const user = userEvent.setup()
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('cancel-button'))

      /* Cancel button should be clickable without errors */
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should use useUserOperations hook', () => {
      const spy = vi.spyOn(useUserOperationsHook, 'useUserOperations')

      render(<UpdateProfilePage />)

      expect(spy).toHaveBeenCalled()
    })

    it('should display user details when loaded', async () => {
      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('update-profile-form')).toBeInTheDocument()
      })
    })

    it('should reload profile after successful update', async () => {
      const user = userEvent.setup()
      mockUpdateUser.mockResolvedValue(true)

      render(<UpdateProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      })

      const initialCallCount = mockFetchUserDetails.mock.calls.length

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockFetchUserDetails).toHaveBeenCalledTimes(initialCallCount + 1)
      })
    })
  })
})
