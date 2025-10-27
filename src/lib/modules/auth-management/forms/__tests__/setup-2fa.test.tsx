/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'

/* Auth module imports */
import Setup2FAForm from '@auth-management/forms/setup-2fa'
import * as useTwoFactorOperationsHook from '@auth-management/hooks/use-2fa-operations'
import { AUTH_STORAGE_KEYS } from '@auth-management/constants'

/* Type definitions for mock components */
interface MockChakraProps {
  children?: ReactNode
  [key: string]: unknown
}

interface PrimaryButtonProps {
  onClick?: () => void
  buttonText?: string
  isLoading?: boolean
  disabled?: boolean
}

interface QRCodeStepProps {
  qrCodeData?: string
  backupCodes?: string[]
  onNext?: () => void
  onCancel?: () => void
}

interface VerifyOTPStepProps {
  onSubmit?: (data: { code: string[] }) => void
  onBack?: () => void
  methods?: UseFormReturn<FieldValues>
}

interface SuccessStepProps {
  onComplete?: () => void
  buttonText?: string
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
    Flex: ({ children, ...props }: MockChakraProps) => <div data-testid="flex" {...props}>{children}</div>,
    List: {
      Root: ({ children, ...props }: MockChakraProps) => <ul data-testid="list-root" {...props}>{children}</ul>,
      Item: ({ children, ...props }: MockChakraProps) => <li data-testid="list-item" {...props}>{children}</li>
    }
  }
})

/* Mock PrimaryButton component */
vi.mock('@shared/components', () => ({
  PrimaryButton: vi.fn(({ onClick, buttonText, isLoading, disabled }: PrimaryButtonProps) => (
    <button
      data-testid={`button-${buttonText}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {buttonText}
    </button>
  ))
}))

/* Mock two-factor-steps components */
vi.mock('@auth-management/forms/two-factor-steps', () => ({
  QRCodeStep: vi.fn(({ qrCodeData, backupCodes, onNext, onCancel }: QRCodeStepProps) => (
    <div data-testid="qr-code-step">
      <div data-testid="qr-code-data">{qrCodeData}</div>
      <div data-testid="backup-codes">{backupCodes?.join(',')}</div>
      <button data-testid="qr-next-button" onClick={onNext}>Next</button>
      <button data-testid="qr-cancel-button" onClick={onCancel}>Cancel</button>
    </div>
  )),
  VerifyOTPStep: vi.fn(({ onSubmit, onBack }: VerifyOTPStepProps) => (
    <div data-testid="verify-otp-step">
      <button data-testid="verify-submit-button" onClick={() => onSubmit?.({ code: ['1', '2', '3', '4', '5', '6'] })}>
        Submit
      </button>
      <button data-testid="verify-back-button" onClick={onBack}>Back</button>
    </div>
  )),
  SuccessStep: vi.fn(({ onComplete, buttonText }: SuccessStepProps) => (
    <div data-testid="success-step">
      <button data-testid="success-complete-button" onClick={onComplete}>
        {buttonText}
      </button>
    </div>
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

describe('Setup2FAForm', () => {
  const mockGenerate2FA = vi.fn()
  const mockEnable2FA = vi.fn()
  const mockDispatchEvent = vi.fn()

  const defaultHookReturn = {
    generate2FA: mockGenerate2FA,
    isGenerating2FA: false,
    generate2FAError: null,
    enable2FA: mockEnable2FA,
    isEnabling2FA: false,
    enable2FAError: null,
    disable2FA: vi.fn(),
    isDisabling2FA: false,
    disable2FAError: null,
    verify2FA: vi.fn(),
    isVerifying2FA: false,
    verify2FAError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockPush.mockClear()
    mockDispatchEvent.mockReturnValue(true)
    vi.spyOn(window, 'dispatchEvent').mockImplementation(mockDispatchEvent)
    vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue(defaultHookReturn)

    /* Set up required localStorage flag */
    localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')
  })

  describe('Rendering - Instructions Step', () => {
    it('should render setup 2fa form with instructions', () => {
      render(<Setup2FAForm />)

      expect(screen.getByText('Two-Factor Authentication Setup')).toBeInTheDocument()
      expect(screen.getByText('Your account requires 2FA. Please complete the setup to continue.')).toBeInTheDocument()
    })

    it('should render 2FA information section', () => {
      render(<Setup2FAForm />)

      expect(screen.getByText('Understanding Two-Factor Authentication (2FA)')).toBeInTheDocument()
    })

    it('should render setup instructions', () => {
      render(<Setup2FAForm />)

      expect(screen.getByText('Step-by-Step Setup Instructions')).toBeInTheDocument()
    })

    it('should render view QR code button', () => {
      render(<Setup2FAForm />)

      expect(screen.getByTestId('button-View QR Code & Backup Codes')).toBeInTheDocument()
    })

    it('should render cancel and logout button', () => {
      render(<Setup2FAForm />)

      expect(screen.getByTestId('button-Cancel and Logout')).toBeInTheDocument()
    })

    it('should render note about mandatory 2FA setup', () => {
      render(<Setup2FAForm />)

      expect(screen.getByText(/You must complete 2FA setup to access your account/)).toBeInTheDocument()
    })
  })

  describe('Setup Required Verification', () => {
    it('should redirect to login when setup is not required', () => {
      localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED)

      render(<Setup2FAForm />)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    it('should redirect to login when setup required flag is false', () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'false')

      render(<Setup2FAForm />)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    it('should not redirect when setup is required', () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')

      render(<Setup2FAForm />)

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('QR Code Generation', () => {
    it('should call generate2FA when view QR code button is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<Setup2FAForm />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(mockGenerate2FA).toHaveBeenCalled()
      })
    })

    it('should display QR code step after successful generation', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<Setup2FAForm />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })
    })

    it('should display QR code data in QR step', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<Setup2FAForm />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-data')).toHaveTextContent('otpauth://totp/test')
      })
    })

    it('should display backup codes in QR step', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2', 'CODE3']
      })

      render(<Setup2FAForm />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('backup-codes')).toHaveTextContent('CODE1,CODE2,CODE3')
      })
    })

    it('should stay on instructions step when generation fails', async () => {
      mockGenerate2FA.mockResolvedValue(null)

      render(<Setup2FAForm />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.queryByTestId('qr-code-step')).not.toBeInTheDocument()
      })

      expect(screen.getByText('Two-Factor Authentication Setup')).toBeInTheDocument()
    })
  })

  describe('Navigation Between Steps', () => {
    it('should proceed to verify step when next is clicked from QR step', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<Setup2FAForm />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      expect(screen.getByTestId('verify-otp-step')).toBeInTheDocument()
    })

    it('should go back to QR step when back is clicked from verify step', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<Setup2FAForm />)

      /* Navigate to QR step */
      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      /* Navigate to verify step */
      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      expect(screen.getByTestId('verify-otp-step')).toBeInTheDocument()

      /* Go back to QR step */
      const backButton = screen.getByTestId('verify-back-button')
      await userEvent.click(backButton)

      expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
    })
  })

  describe('OTP Verification and Enabling', () => {
    it('should call enable2FA when verify button is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<Setup2FAForm />)

      /* Navigate to verify step */
      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      const submitButton = screen.getByTestId('verify-submit-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockEnable2FA).toHaveBeenCalledWith({ code: '123456' })
      })
    })

    it('should display success step after successful enablement', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<Setup2FAForm />)

      /* Navigate to verify step */
      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      const submitButton = screen.getByTestId('verify-submit-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('success-step')).toBeInTheDocument()
      })
    })

    it('should clear localStorage flags after successful enablement', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<Setup2FAForm />)

      /* Navigate to verify step and submit */
      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      const submitButton = screen.getByTestId('verify-submit-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED)).toBeNull()
      })
    })

    it('should set logged in flag after successful enablement', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<Setup2FAForm />)

      /* Navigate to verify step and submit */
      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      const submitButton = screen.getByTestId('verify-submit-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.LOGGED_IN)).toBe('true')
      })
    })

    it('should dispatch auth state changed event after successful enablement', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<Setup2FAForm />)

      /* Navigate to verify step and submit */
      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      const submitButton = screen.getByTestId('verify-submit-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event))
      })

      const eventCall = mockDispatchEvent.mock.calls[0][0]
      expect(eventCall.type).toBe('authStateChanged')
    })

    it('should stay on verify step when enablement fails', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(false)

      render(<Setup2FAForm />)

      /* Navigate to verify step and submit */
      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      const submitButton = screen.getByTestId('verify-submit-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockEnable2FA).toHaveBeenCalled()
      })

      expect(screen.queryByTestId('success-step')).not.toBeInTheDocument()
      expect(screen.getByTestId('verify-otp-step')).toBeInTheDocument()
    })
  })

  describe('Completion Flow', () => {
    it('should redirect to admin home when complete button is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<Setup2FAForm />)

      /* Navigate through all steps to success */
      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      const submitButton = screen.getByTestId('verify-submit-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('success-step')).toBeInTheDocument()
      })

      const completeButton = screen.getByTestId('success-complete-button')
      await userEvent.click(completeButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/support-ticket-management')
    })
  })

  describe('Cancel and Logout', () => {
    it('should clear all auth data when cancel is clicked from instructions', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'token')
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, 'refresh')
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify({ id: 1 }))
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      render(<Setup2FAForm />)

      const cancelButton = screen.getByTestId('button-Cancel and Logout')
      await userEvent.click(cancelButton)

      expect(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.USER)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.LOGGED_IN)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED)).toBeNull()
    })

    it('should redirect to login when cancel is clicked from instructions', async () => {
      render(<Setup2FAForm />)

      const cancelButton = screen.getByTestId('button-Cancel and Logout')
      await userEvent.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    it('should clear all auth data when cancel is clicked from QR step', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'token')
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, 'refresh')

      render(<Setup2FAForm />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const cancelButton = screen.getByTestId('qr-cancel-button')
      await userEvent.click(cancelButton)

      expect(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
    })
  })

  describe('Component Integration', () => {
    it('should use useTwoFactorOperations hook', () => {
      const spy = vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations')

      render(<Setup2FAForm />)

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should disable view QR button when generating', () => {
      vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue({
        ...defaultHookReturn,
        isGenerating2FA: true
      })

      render(<Setup2FAForm />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      expect(viewQRButton).toBeDisabled()
    })
  })
})
