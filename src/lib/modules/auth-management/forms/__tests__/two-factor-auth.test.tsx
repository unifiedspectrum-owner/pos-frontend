/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'

/* Auth module imports */
import TwoFactorSetup from '@auth-management/forms/two-factor-auth'
import * as useTwoFactorOperationsHook from '@auth-management/hooks/use-2fa-operations'

/* Type definitions for mock components */
interface MockChakraProps {
  children?: ReactNode
  [key: string]: unknown
}

interface DynamicDialogProps {
  isOpen?: boolean
  children?: ReactNode
  onClose?: () => void
  title?: string
}

interface ConfirmationDialogProps {
  isOpen?: boolean
  onCancel?: () => void
  onConfirm?: () => void
  title?: string
  message?: string
  isLoading?: boolean
  confirmationText?: string
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
  isLoading?: boolean
}

interface VerifyOTPStepProps {
  onSubmit?: (data: { code: string[] }) => void
  onBack?: () => void
  methods?: UseFormReturn<FieldValues>
  isLoading?: boolean
}

interface SuccessStepProps {
  onComplete?: () => void
}

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    Accordion: {
      Root: ({ children, ...props }: MockChakraProps) => <div data-testid="accordion-root" {...props}>{children}</div>,
      Item: ({ children, ...props }: MockChakraProps) => <div data-testid="accordion-item" {...props}>{children}</div>,
      ItemTrigger: ({ children, ...props }: MockChakraProps) => <div data-testid="accordion-trigger" {...props}>{children}</div>,
      ItemContent: ({ children, ...props }: MockChakraProps) => <div data-testid="accordion-content" {...props}>{children}</div>,
      ItemIndicator: () => <div data-testid="accordion-indicator" />
    },
    Box: ({ children, ...props }: MockChakraProps) => <div data-testid="box" {...props}>{children}</div>,
    Text: ({ children, ...props }: MockChakraProps) => <p data-testid="text" {...props}>{children}</p>,
    Flex: ({ children, ...props }: MockChakraProps) => <div data-testid="flex" {...props}>{children}</div>,
    Heading: ({ children, ...props }: MockChakraProps) => <h1 data-testid="heading" {...props}>{children}</h1>,
    Badge: ({ children, ...props }: MockChakraProps) => <span data-testid="badge" {...props}>{children}</span>,
    List: {
      Root: ({ children, ...props }: MockChakraProps) => <ul data-testid="list-root" {...props}>{children}</ul>,
      Item: ({ children, ...props }: MockChakraProps) => <li data-testid="list-item" {...props}>{children}</li>
    }
  }
})

/* Mock DynamicDialog and ConfirmationDialog */
vi.mock('@shared/components/common', () => ({
  DynamicDialog: vi.fn(({ isOpen, children, onClose, title }: DynamicDialogProps) =>
    isOpen ? (
      <div data-testid="dynamic-dialog">
        <div data-testid="dialog-title">{title}</div>
        <button data-testid="dialog-close" onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null
  ),
  ConfirmationDialog: vi.fn(({ isOpen, onCancel, onConfirm, title, message, isLoading, confirmationText }: ConfirmationDialogProps) =>
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <div data-testid="confirm-title">{title}</div>
        <div data-testid="confirm-message">{message}</div>
        {confirmationText && <div data-testid="confirmation-text-required">{confirmationText}</div>}
        <button data-testid="confirm-cancel" onClick={onCancel}>Cancel</button>
        <button data-testid="confirm-button" onClick={onConfirm} disabled={isLoading}>
          Confirm
        </button>
      </div>
    ) : null
  )
}))

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
  QRCodeStep: vi.fn(({ qrCodeData, backupCodes, onNext, onCancel, isLoading }: QRCodeStepProps) => (
    <div data-testid="qr-code-step">
      <div data-testid="qr-code-data">{qrCodeData}</div>
      <div data-testid="backup-codes">{backupCodes?.join(',')}</div>
      <div data-testid="qr-loading">{isLoading ? 'Loading...' : 'Ready'}</div>
      <button data-testid="qr-next-button" onClick={onNext}>Next</button>
      <button data-testid="qr-cancel-button" onClick={onCancel}>Cancel</button>
    </div>
  )),
  VerifyOTPStep: vi.fn(({ onSubmit, onBack, isLoading }: VerifyOTPStepProps) => (
    <div data-testid="verify-otp-step">
      <div data-testid="verify-loading">{isLoading ? 'Loading...' : 'Ready'}</div>
      <button data-testid="verify-submit-button" onClick={() => onSubmit?.({ code: ['1', '2', '3', '4', '5', '6'] })}>
        Submit
      </button>
      <button data-testid="verify-back-button" onClick={onBack}>Back</button>
    </div>
  )),
  SuccessStep: vi.fn(({ onComplete }: SuccessStepProps) => (
    <div data-testid="success-step">
      <button data-testid="success-complete-button" onClick={onComplete}>
        Complete
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

describe('TwoFactorSetup', () => {
  const mockGenerate2FA = vi.fn()
  const mockEnable2FA = vi.fn()
  const mockDisable2FA = vi.fn()
  const mockOnRefresh = vi.fn()

  const defaultHookReturn = {
    generate2FA: mockGenerate2FA,
    isGenerating2FA: false,
    generate2FAError: null,
    enable2FA: mockEnable2FA,
    isEnabling2FA: false,
    enable2FAError: null,
    disable2FA: mockDisable2FA,
    isDisabling2FA: false,
    disable2FAError: null,
    verify2FA: vi.fn(),
    isVerifying2FA: false,
    verify2FAError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering - 2FA Disabled', () => {
    it('should render two-factor authentication section', () => {
      render(<TwoFactorSetup isEnabled={false} />)

      expect(screen.getByText('Security Settings')).toBeInTheDocument()
      expect(screen.getByText('Two-Factor Authentication (2FA)')).toBeInTheDocument()
    })

    it('should show disabled message when 2FA is not enabled', () => {
      render(<TwoFactorSetup isEnabled={false} />)

      expect(screen.getByText('Add an extra layer of security to your account')).toBeInTheDocument()
    })

    it('should not show enabled badge when 2FA is disabled', () => {
      render(<TwoFactorSetup isEnabled={false} />)

      expect(screen.queryByText('Enabled')).not.toBeInTheDocument()
    })

    it('should render setup instructions when 2FA is disabled', () => {
      render(<TwoFactorSetup isEnabled={false} />)

      expect(screen.getByText('Step-by-Step Setup Instructions')).toBeInTheDocument()
    })

    it('should render view QR code button when 2FA is disabled', () => {
      render(<TwoFactorSetup isEnabled={false} />)

      expect(screen.getByTestId('button-View QR Code & Backup Codes')).toBeInTheDocument()
    })
  })

  describe('Rendering - 2FA Enabled', () => {
    it('should show enabled message when 2FA is active', () => {
      render(<TwoFactorSetup isEnabled={true} />)

      expect(screen.getByText('Currently enabled')).toBeInTheDocument()
    })

    it('should show enabled badge when 2FA is active', () => {
      render(<TwoFactorSetup isEnabled={true} />)

      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('should render manage instructions when 2FA is enabled', () => {
      render(<TwoFactorSetup isEnabled={true} />)

      expect(screen.getByText('Manage Your 2FA Settings')).toBeInTheDocument()
    })

    it('should render deactivate button when 2FA is enabled', () => {
      render(<TwoFactorSetup isEnabled={true} />)

      expect(screen.getByTestId('button-Deactivate 2FA')).toBeInTheDocument()
    })
  })

  describe('QR Code Generation - Enable Flow', () => {
    it('should call generate2FA when view QR code button is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(mockGenerate2FA).toHaveBeenCalled()
      })
    })

    it('should open modal when generate QR is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('dynamic-dialog')).toBeInTheDocument()
      })
    })

    it('should display QR code data in modal', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-data')).toHaveTextContent('otpauth://totp/test')
      })
    })

    it('should display backup codes in modal', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2', 'CODE3']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('backup-codes')).toHaveTextContent('CODE1,CODE2,CODE3')
      })
    })

    it('should not open modal when generation fails', async () => {
      mockGenerate2FA.mockResolvedValue(null)

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(mockGenerate2FA).toHaveBeenCalled()
      })

      expect(screen.queryByTestId('dynamic-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Setup Flow Navigation', () => {
    it('should proceed to verify step when next is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      expect(screen.getByTestId('verify-otp-step')).toBeInTheDocument()
    })

    it('should go back to QR step when back is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      const backButton = screen.getByTestId('verify-back-button')
      await userEvent.click(backButton)

      expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
    })
  })

  describe('Enable 2FA', () => {
    it('should call enable2FA when verify button is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<TwoFactorSetup isEnabled={false} onRefresh={mockOnRefresh} />)

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

    it('should call onRefresh after successful enablement', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<TwoFactorSetup isEnabled={false} onRefresh={mockOnRefresh} />)

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
        expect(mockOnRefresh).toHaveBeenCalled()
      })
    })

    it('should show success step after successful enablement', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<TwoFactorSetup isEnabled={false} />)

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

    it('should not call onRefresh when not provided', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<TwoFactorSetup isEnabled={false} />)

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

      expect(mockOnRefresh).not.toHaveBeenCalled()
    })
  })

  describe('Complete Setup', () => {
    it('should close modal when complete button is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })
      mockEnable2FA.mockResolvedValue(true)

      render(<TwoFactorSetup isEnabled={false} />)

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

      expect(screen.queryByTestId('dynamic-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Disable 2FA', () => {
    it('should show confirmation dialog when deactivate button is clicked', async () => {
      render(<TwoFactorSetup isEnabled={true} />)

      const deactivateButton = screen.getByTestId('button-Deactivate 2FA')
      await userEvent.click(deactivateButton)

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      expect(screen.getByText('Disable Two-Factor Authentication')).toBeInTheDocument()
    })

    it('should call disable2FA when confirmed', async () => {
      mockDisable2FA.mockResolvedValue(true)

      render(<TwoFactorSetup isEnabled={true} onRefresh={mockOnRefresh} />)

      const deactivateButton = screen.getByTestId('button-Deactivate 2FA')
      await userEvent.click(deactivateButton)

      const confirmButton = screen.getByTestId('confirm-button')
      await userEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockDisable2FA).toHaveBeenCalled()
      })
    })

    it('should call onRefresh after successful disable', async () => {
      mockDisable2FA.mockResolvedValue(true)

      render(<TwoFactorSetup isEnabled={true} onRefresh={mockOnRefresh} />)

      const deactivateButton = screen.getByTestId('button-Deactivate 2FA')
      await userEvent.click(deactivateButton)

      const confirmButton = screen.getByTestId('confirm-button')
      await userEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled()
      })
    })

    it('should close confirmation dialog after successful disable', async () => {
      mockDisable2FA.mockResolvedValue(true)

      render(<TwoFactorSetup isEnabled={true} />)

      const deactivateButton = screen.getByTestId('button-Deactivate 2FA')
      await userEvent.click(deactivateButton)

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()

      const confirmButton = screen.getByTestId('confirm-button')
      await userEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
      })
    })

    it('should close confirmation dialog when cancel is clicked', async () => {
      render(<TwoFactorSetup isEnabled={true} />)

      const deactivateButton = screen.getByTestId('button-Deactivate 2FA')
      await userEvent.click(deactivateButton)

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()

      const cancelButton = screen.getByTestId('confirm-cancel')
      await userEvent.click(cancelButton)

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })

    it('should require userId confirmation when provided', async () => {
      render(<TwoFactorSetup isEnabled={true} userId="user-123" />)

      const deactivateButton = screen.getByTestId('button-Deactivate 2FA')
      await userEvent.click(deactivateButton)

      expect(screen.getByTestId('confirmation-text-required')).toHaveTextContent('user-123')
    })
  })

  describe('Modal Close', () => {
    it('should close modal when close button is clicked', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('dynamic-dialog')).toBeInTheDocument()
      })

      const closeButton = screen.getByTestId('dialog-close')
      await userEvent.click(closeButton)

      expect(screen.queryByTestId('dynamic-dialog')).not.toBeInTheDocument()
    })

    it('should close modal when cancel button is clicked from QR step', async () => {
      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const cancelButton = screen.getByTestId('qr-cancel-button')
      await userEvent.click(cancelButton)

      expect(screen.queryByTestId('dynamic-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should disable view QR button when generating', () => {
      vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue({
        ...defaultHookReturn,
        isGenerating2FA: true
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      expect(viewQRButton).toBeDisabled()
    })

    it('should disable deactivate button when disabling', () => {
      vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue({
        ...defaultHookReturn,
        isDisabling2FA: true
      })

      render(<TwoFactorSetup isEnabled={true} />)

      const deactivateButton = screen.getByTestId('button-Deactivate 2FA')
      expect(deactivateButton).toBeDisabled()
    })

    it('should pass loading state to QR step', async () => {
      mockGenerate2FA.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              qrCodeData: 'otpauth://totp/test',
              backupCodes: ['CODE1', 'CODE2']
            })
          }, 100)
        })
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-data')).toHaveTextContent('otpauth://totp/test')
      })
    })

    it('should pass loading state to verify step', async () => {
      vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations').mockReturnValue({
        ...defaultHookReturn,
        isEnabling2FA: true
      })

      mockGenerate2FA.mockResolvedValue({
        qrCodeData: 'otpauth://totp/test',
        backupCodes: ['CODE1', 'CODE2']
      })

      render(<TwoFactorSetup isEnabled={false} />)

      const viewQRButton = screen.getByTestId('button-View QR Code & Backup Codes')
      await userEvent.click(viewQRButton)

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-step')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('qr-next-button')
      await userEvent.click(nextButton)

      expect(screen.getByTestId('verify-loading')).toHaveTextContent('Loading...')
    })
  })

  describe('Component Integration', () => {
    it('should use useTwoFactorOperations hook', () => {
      const spy = vi.spyOn(useTwoFactorOperationsHook, 'useTwoFactorOperations')

      render(<TwoFactorSetup isEnabled={false} />)

      expect(spy).toHaveBeenCalled()
    })
  })
})
