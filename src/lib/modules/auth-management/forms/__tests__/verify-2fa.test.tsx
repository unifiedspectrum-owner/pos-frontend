/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'

/* Auth module imports */
import Verify2FAForm from '@auth-management/forms/verify-2fa'
import * as useTwoFactorOperationsHook from '@auth-management/hooks/use-2fa-operations'
import { AUTH_STORAGE_KEYS, TWO_FA_TYPES } from '@auth-management/constants'

/* Type definitions for mock components */
interface MockChakraProps {
  children?: ReactNode
  [key: string]: unknown
}

interface PinInputFieldProps {
  value?: string[]
  onChange?: (value: string[]) => void
  errorMessage?: string
  isInValid?: boolean
  autoFocus?: boolean
}

interface TextInputFieldProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  errorMessage?: string
  isInValid?: boolean
  placeholder?: string
  autoFocus?: boolean
}

interface PrimaryButtonProps {
  buttonText?: string
  onClick?: () => void
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

interface SecondaryButtonProps {
  buttonText?: string
  onClick?: () => void
  size?: string
}

/* Mock next/navigation */
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    VStack: ({ children, ...props }: MockChakraProps) => <div data-testid="vstack" {...props}>{children}</div>,
    Heading: ({ children, ...props }: MockChakraProps) => <h1 data-testid="heading" {...props}>{children}</h1>,
    Text: ({ children, ...props }: MockChakraProps) => <p data-testid="text" {...props}>{children}</p>,
    Box: ({ children, ...props }: MockChakraProps) => <div data-testid="box" {...props}>{children}</div>,
    SimpleGrid: ({ children, ...props }: MockChakraProps) => <div data-testid="simple-grid" {...props}>{children}</div>,
    GridItem: ({ children, ...props }: MockChakraProps) => <div data-testid="grid-item" {...props}>{children}</div>,
    Flex: ({ children, ...props }: MockChakraProps) => <div data-testid="flex" {...props}>{children}</div>
  }
})

/* Mock form field components */
vi.mock('@shared/components/form-elements', () => ({
  PinInputField: vi.fn(({ value, onChange, errorMessage, isInValid, autoFocus }: PinInputFieldProps) => (
    <div data-testid="pin-input-field">
      <input
        data-testid="pin-input"
        value={value?.join('') || ''}
        onChange={(e) => onChange?.(e.target.value.split(''))}
        autoFocus={autoFocus}
      />
      {isInValid && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  )),
  TextInputField: vi.fn(({ value, onChange, errorMessage, isInValid, placeholder, autoFocus }: TextInputFieldProps) => (
    <div data-testid="text-input-field">
      <input
        data-testid="text-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {isInValid && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  )),
  PrimaryButton: vi.fn(({ buttonText, onClick, loading, type }: PrimaryButtonProps) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={loading}
      type={type}
    >
      {buttonText}
    </button>
  )),
  SecondaryButton: vi.fn(({ buttonText, onClick }: SecondaryButtonProps) => (
    <button
      data-testid={`secondary-button-${buttonText}`}
      onClick={onClick}
    >
      {buttonText}
    </button>
  ))
}))

/* Mock config */
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#562dc6',
  SECONDARY_COLOR: '#885CF7',
  BG_COLOR: '#FCFCFF',
  WHITE_COLOR: '#FFFFFF',
  DARK_COLOR: '#17171A',
  GRAY_COLOR: '#39393E',
  SUCCESS_GREEN_COLOR: '#00FF41',
  SUCCESS_GREEN_COLOR2: '#30cb57ff',
  WARNING_ORANGE_COLOR: '#f59e0b',
  ERROR_RED_COLOR: '#ef4444',
  BACKEND_BASE_URL: 'http://127.0.0.1:8787',
  LOADING_DELAY: 2000,
  LOADING_DELAY_ENABLED: false,
  COUNTRIES_CACHE_DURATION: 86400000,
  CURRENCY_SYMBOL: '$'
}))

describe('Verify2FAForm', () => {
  const mockVerify2FA = vi.fn()

  const defaultHookReturn = {
    generate2FA: vi.fn(),
    isGenerating2FA: false,
    generate2FAError: null,
    enable2FA: vi.fn(),
    isEnabling2FA: false,
    enable2FAError: null,
    disable2FA: vi.fn(),
    isDisabling2FA: false,
    disable2FAError: null,
    verify2FA: mockVerify2FA,
    isVerifying2FA: false,
    verify2FAError: null
  }

  const defaultProps = {
    userEmail: 'test@example.com',
    userId: 'user-123'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockPush.mockClear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering - TOTP Mode', () => {
    it('should render verify 2FA form with TOTP heading', () => {
      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
    })

    it('should render TOTP instruction text', () => {
      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByText('Enter the 6-digit code from your authenticator app')).toBeInTheDocument()
    })

    it('should render user email', () => {
      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByText('Account: test@example.com')).toBeInTheDocument()
    })

    it('should render PIN input field for TOTP', () => {
      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByTestId('pin-input-field')).toBeInTheDocument()
      expect(screen.getByTestId('pin-input')).toBeInTheDocument()
    })

    it('should render try another way button', () => {
      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByTestId('secondary-button-Try Another Way')).toBeInTheDocument()
    })

    it('should render verify code button', () => {
      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByText('Verify Code')).toBeInTheDocument()
    })

    it('should render back to login button', () => {
      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByTestId('secondary-button-Back to Login')).toBeInTheDocument()
    })
  })

  describe('Rendering - Backup Code Mode', () => {
    it('should toggle to backup code mode', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      expect(screen.getByText('Backup Code Verification')).toBeInTheDocument()
    })

    it('should render backup code instruction text', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      expect(screen.getByText('Enter your backup recovery code to access your account')).toBeInTheDocument()
    })

    it('should render text input field for backup code', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      expect(screen.getByTestId('text-input-field')).toBeInTheDocument()
      expect(screen.getByTestId('text-input')).toBeInTheDocument()
    })

    it('should render use authenticator code button', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      expect(screen.getByTestId('secondary-button-Use Authenticator Code')).toBeInTheDocument()
    })

    it('should render verify backup code button', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      expect(screen.getByText('Verify Backup Code')).toBeInTheDocument()
    })
  })

  describe('Toggle Between Modes', () => {
    it('should toggle from TOTP to backup code mode', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
      expect(screen.queryByText('Backup Code Verification')).not.toBeInTheDocument()

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      expect(screen.getByText('Backup Code Verification')).toBeInTheDocument()
      expect(screen.queryByText('Two-Factor Authentication')).not.toBeInTheDocument()
    })

    it('should toggle back from backup code to TOTP mode', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      expect(screen.getByText('Backup Code Verification')).toBeInTheDocument()

      const toggleBackButton = screen.getByTestId('secondary-button-Use Authenticator Code')
      await userEvent.click(toggleBackButton)

      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
    })

    it('should clear form values when toggling modes', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const pinInput = screen.getByTestId('pin-input')
      await userEvent.type(pinInput, '123456')

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      const textInput = screen.getByTestId('text-input')
      expect(textInput).toHaveValue('')
    })
  })

  describe('Form Submission - TOTP Mode', () => {
    it('should call verify2FA with TOTP code on submission', async () => {
      mockVerify2FA.mockResolvedValue(true)

      render(<Verify2FAForm {...defaultProps} />)

      const pinInput = screen.getByTestId('pin-input')
      await userEvent.type(pinInput, '123456')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).toHaveBeenCalledWith({
          user_id: 'user-123',
          type: TWO_FA_TYPES.TOTP,
          code: '123456'
        })
      })
    })

    it('should redirect to dashboard on successful verification', async () => {
      mockVerify2FA.mockResolvedValue(true)

      render(<Verify2FAForm {...defaultProps} />)

      const pinInput = screen.getByTestId('pin-input')
      await userEvent.type(pinInput, '123456')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')
      })
    })

    it('should not redirect when verification fails', async () => {
      mockVerify2FA.mockResolvedValue(false)

      render(<Verify2FAForm {...defaultProps} />)

      const pinInput = screen.getByTestId('pin-input')
      await userEvent.type(pinInput, '123456')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission - Backup Code Mode', () => {
    it('should call verify2FA with backup code on submission', async () => {
      mockVerify2FA.mockResolvedValue(true)

      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      const textInput = screen.getByTestId('text-input')
      await userEvent.type(textInput, 'ABCD-1234')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).toHaveBeenCalledWith({
          user_id: 'user-123',
          type: TWO_FA_TYPES.BACKUP,
          code: 'ABCD-1234'
        })
      })
    })

    it('should redirect to dashboard on successful backup code verification', async () => {
      mockVerify2FA.mockResolvedValue(true)

      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      const textInput = screen.getByTestId('text-input')
      await userEvent.type(textInput, 'ABCD-1234')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')
      })
    })
  })

  describe('Loading State', () => {
    it('should disable primary button when verifying', () => {
      vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue({
        ...defaultHookReturn,
        isVerifying2FA: true
      })

      render(<Verify2FAForm {...defaultProps} />)

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).toBeDisabled()
    })

    it('should show verifying text when loading', () => {
      vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue({
        ...defaultHookReturn,
        isVerifying2FA: true
      })

      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByText('Verifying...')).toBeInTheDocument()
    })

    it('should disable PIN input when verifying', () => {
      vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue({
        ...defaultHookReturn,
        isVerifying2FA: true
      })

      render(<Verify2FAForm {...defaultProps} />)

      expect(screen.getByTestId('pin-input')).toBeInTheDocument()
    })
  })

  describe('Back to Login', () => {
    it('should clear pending 2FA data from localStorage', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID, 'user-123')
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL, 'test@example.com')

      render(<Verify2FAForm {...defaultProps} />)

      const backButton = screen.getByTestId('secondary-button-Back to Login')
      await userEvent.click(backButton)

      expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)).toBeNull()
    })

    it('should redirect to login page', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const backButton = screen.getByTestId('secondary-button-Back to Login')
      await userEvent.click(backButton)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  describe('User Email Display', () => {
    it('should display user email when provided', () => {
      render(<Verify2FAForm userEmail="user@example.com" userId="user-123" />)

      expect(screen.getByText('Account: user@example.com')).toBeInTheDocument()
    })

    it('should not display account text when email is empty', () => {
      render(<Verify2FAForm userEmail="" userId="user-123" />)

      expect(screen.queryByText(/Account:/)).not.toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should use useTwoFactorOperations hook', () => {
      const spy = vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations')

      render(<Verify2FAForm {...defaultProps} />)

      expect(spy).toHaveBeenCalled()
    })

    it('should render form with noValidate attribute', () => {
      const { container } = render(<Verify2FAForm {...defaultProps} />)

      const form = container.querySelector('form')
      expect(form).toHaveAttribute('noValidate')
    })
  })

  describe('Auto Focus', () => {
    it('should render PIN input with autoFocus prop in TOTP mode', () => {
      render(<Verify2FAForm {...defaultProps} />)

      const pinInput = screen.getByTestId('pin-input')
      expect(pinInput).toBeInTheDocument()
    })

    it('should render text input with autoFocus prop in backup code mode', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      const textInput = screen.getByTestId('text-input')
      expect(textInput).toBeInTheDocument()
    })
  })

  describe('Form Values', () => {
    it('should set user_id in form values', async () => {
      mockVerify2FA.mockResolvedValue(true)

      render(<Verify2FAForm userEmail="test@example.com" userId="test-user-456" />)

      const pinInput = screen.getByTestId('pin-input')
      await userEvent.type(pinInput, '123456')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: 'test-user-456'
          })
        )
      })
    })

    it('should set correct type in form values for TOTP', async () => {
      mockVerify2FA.mockResolvedValue(true)

      render(<Verify2FAForm {...defaultProps} />)

      const pinInput = screen.getByTestId('pin-input')
      await userEvent.type(pinInput, '123456')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).toHaveBeenCalledWith(
          expect.objectContaining({
            type: TWO_FA_TYPES.TOTP
          })
        )
      })
    })

    it('should set correct type in form values for backup code', async () => {
      mockVerify2FA.mockResolvedValue(true)

      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      const textInput = screen.getByTestId('text-input')
      await userEvent.type(textInput, 'ABCD-1234')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).toHaveBeenCalledWith(
          expect.objectContaining({
            type: TWO_FA_TYPES.BACKUP
          })
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty PIN input submission', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).not.toHaveBeenCalled()
      })
    })

    it('should handle empty backup code submission', async () => {
      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).not.toHaveBeenCalled()
      })
    })

    it('should handle special characters in backup code', async () => {
      mockVerify2FA.mockResolvedValue(true)

      render(<Verify2FAForm {...defaultProps} />)

      const toggleButton = screen.getByTestId('secondary-button-Try Another Way')
      await userEvent.click(toggleButton)

      const textInput = screen.getByTestId('text-input')
      await userEvent.type(textInput, 'AB12-CD34')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockVerify2FA).toHaveBeenCalledWith({
          user_id: 'user-123',
          type: TWO_FA_TYPES.BACKUP,
          code: 'AB12-CD34'
        })
      })
    })
  })
})
