/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'

/* Auth module imports */
import QRCodeStep from '@auth-management/forms/two-factor-steps/qr-code'

/* Type definitions for mock components */
interface MockChakraProps {
  children?: ReactNode
  [key: string]: unknown
}

interface ButtonProps {
  children?: ReactNode
  onClick?: () => void
  disabled?: boolean
  [key: string]: unknown
}

interface ClipboardTriggerProps {
  children?: ReactNode
  asChild?: boolean
  [key: string]: unknown
}

interface QrCodeProps {
  value: string
  [key: string]: unknown
}

interface PrimaryButtonProps {
  onClick?: () => void
  buttonText?: string
  disabled?: boolean
  isLoading?: boolean
}

interface SecondaryButtonProps {
  onClick?: () => void
  buttonText?: string
  disabled?: boolean
}

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    VStack: ({ children, ...props }: MockChakraProps) => <div data-testid="vstack" {...props}>{children}</div>,
    HStack: ({ children, ...props }: MockChakraProps) => <div data-testid="hstack" {...props}>{children}</div>,
    Box: ({ children, ...props }: MockChakraProps) => <div data-testid="box" {...props}>{children}</div>,
    Flex: ({ children, ...props }: MockChakraProps) => <div data-testid="flex" {...props}>{children}</div>,
    Heading: ({ children, ...props }: MockChakraProps) => <h1 data-testid="heading" {...props}>{children}</h1>,
    Text: ({ children, ...props }: MockChakraProps) => <p data-testid="text" {...props}>{children}</p>,
    Code: ({ children, ...props }: MockChakraProps) => <code data-testid="code" {...props}>{children}</code>,
    SimpleGrid: ({ children, ...props }: MockChakraProps) => <div data-testid="simple-grid" {...props}>{children}</div>,
    Button: ({ children, onClick, disabled, ...props }: ButtonProps) => (
      <button data-testid="button" onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Spinner: ({ ...props }: Record<string, unknown>) => <div data-testid="spinner" {...props}>Loading...</div>,
    Skeleton: ({ ...props }: Record<string, unknown>) => <div data-testid="skeleton" {...props}></div>,
    Clipboard: {
      Root: ({ children, ...props }: MockChakraProps) => <div data-testid="clipboard-root" {...props}>{children}</div>,
      Trigger: ({ children, ...props }: ClipboardTriggerProps) => <div data-testid="clipboard-trigger" {...props}>{children}</div>,
      Indicator: ({ ...props }: Record<string, unknown>) => <span data-testid="clipboard-indicator" {...props}></span>,
      CopyText: ({ ...props }: Record<string, unknown>) => <span data-testid="clipboard-copy-text" {...props}>Copy</span>
    }
  }
})

/* Mock QR Code component */
vi.mock('@/components/ui/qr-code', () => ({
  QrCode: ({ value, ...props }: QrCodeProps) => (
    <div data-testid="qr-code" data-value={value} {...props}>
      QR Code: {value}
    </div>
  )
}))

/* Mock shared components */
vi.mock('@shared/components', () => ({
  PrimaryButton: vi.fn(({ onClick, buttonText, disabled, isLoading }: PrimaryButtonProps) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {buttonText}
    </button>
  )),
  SecondaryButton: vi.fn(({ onClick, buttonText, disabled }: SecondaryButtonProps) => (
    <button
      data-testid="secondary-button"
      onClick={onClick}
      disabled={disabled}
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

describe('QRCodeStep', () => {
  const mockOnNext = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    qrCodeData: 'otpauth://totp/test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TestApp',
    backupCodes: ['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456', 'QRST-7890', 'UVWX-1234', 'YZAB-5678', 'CDEF-9012', 'GHIJ-3456', 'KLMN-7890'],
    isLoading: false,
    onNext: mockOnNext,
    onCancel: mockOnCancel
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render QR code step', () => {
      render(<QRCodeStep {...defaultProps} />)

      expect(screen.getByText('Scan QR Code')).toBeInTheDocument()
      expect(screen.getByText(/Scan this QR code with your authenticator app/)).toBeInTheDocument()
    })

    it('should render QR code when data is provided', () => {
      render(<QRCodeStep {...defaultProps} />)

      const qrCode = screen.getByTestId('qr-code')
      expect(qrCode).toBeInTheDocument()
      expect(qrCode).toHaveAttribute('data-value', defaultProps.qrCodeData)
    })

    it('should render backup codes section', () => {
      render(<QRCodeStep {...defaultProps} />)

      expect(screen.getByText('Backup Recovery Codes')).toBeInTheDocument()
      expect(screen.getByText(/Save these codes in a secure location/)).toBeInTheDocument()
    })

    it('should render all backup codes', () => {
      render(<QRCodeStep {...defaultProps} />)

      const codes = screen.getAllByTestId('code')
      expect(codes).toHaveLength(10)
      expect(codes[0]).toHaveTextContent('ABCD-1234')
      expect(codes[9]).toHaveTextContent('KLMN-7890')
    })

    it('should render next button', () => {
      render(<QRCodeStep {...defaultProps} />)

      const nextButton = screen.getByTestId('primary-button')
      expect(nextButton).toBeInTheDocument()
      expect(nextButton).toHaveTextContent('Next: Verify Code')
    })

    it('should render cancel button', () => {
      render(<QRCodeStep {...defaultProps} />)

      const cancelButton = screen.getByTestId('secondary-button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveTextContent('Cancel')
    })

    it('should render important warning message', () => {
      render(<QRCodeStep {...defaultProps} />)

      expect(screen.getByText(/Store these backup codes securely/)).toBeInTheDocument()
    })

    it('should render copy button when backup codes exist', () => {
      render(<QRCodeStep {...defaultProps} />)

      expect(screen.getByTestId('clipboard-root')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show spinner when qrCodeData is empty', () => {
      render(<QRCodeStep {...defaultProps} qrCodeData="" />)

      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument()
    })

    it('should show skeleton placeholders when backup codes are empty', () => {
      render(<QRCodeStep {...defaultProps} backupCodes={[]} />)

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons).toHaveLength(10)
    })

    it('should disable next button when loading', () => {
      render(<QRCodeStep {...defaultProps} isLoading={true} />)

      const nextButton = screen.getByTestId('primary-button')
      expect(nextButton).toBeDisabled()
    })

    it('should disable next button when qrCodeData is empty', () => {
      render(<QRCodeStep {...defaultProps} qrCodeData="" />)

      const nextButton = screen.getByTestId('primary-button')
      expect(nextButton).toBeDisabled()
    })

    it('should disable next button when backup codes are empty', () => {
      render(<QRCodeStep {...defaultProps} backupCodes={[]} />)

      const nextButton = screen.getByTestId('primary-button')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('User Interactions', () => {
    it('should call onNext when next button is clicked', async () => {
      render(<QRCodeStep {...defaultProps} />)

      const nextButton = screen.getByTestId('primary-button')
      await userEvent.click(nextButton)

      expect(mockOnNext).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when cancel button is clicked', async () => {
      render(<QRCodeStep {...defaultProps} />)

      const cancelButton = screen.getByTestId('secondary-button')
      await userEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not call onNext when button is disabled', async () => {
      render(<QRCodeStep {...defaultProps} isLoading={true} />)

      const nextButton = screen.getByTestId('primary-button')
      await userEvent.click(nextButton)

      expect(mockOnNext).not.toHaveBeenCalled()
    })
  })

  describe('Backup Codes Display', () => {
    it('should display correct number of backup codes', () => {
      const customCodes = ['CODE1', 'CODE2', 'CODE3']
      render(<QRCodeStep {...defaultProps} backupCodes={customCodes} />)

      const codes = screen.getAllByTestId('code')
      expect(codes).toHaveLength(3)
    })

    it('should display backup codes in correct format', () => {
      render(<QRCodeStep {...defaultProps} />)

      const firstCode = screen.getAllByTestId('code')[0]
      expect(firstCode).toHaveTextContent('ABCD-1234')
    })
  })

  describe('QR Code Display', () => {
    it('should display QR code with correct data', () => {
      const customQRData = 'otpauth://totp/custom@test.com?secret=CUSTOMSECRET'
      render(<QRCodeStep {...defaultProps} qrCodeData={customQRData} />)

      const qrCode = screen.getByTestId('qr-code')
      expect(qrCode).toHaveAttribute('data-value', customQRData)
    })

    it('should not display QR code when data is empty', () => {
      render(<QRCodeStep {...defaultProps} qrCodeData="" />)

      expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument()
    })
  })

  describe('Button States', () => {
    it('should enable next button when all data is ready', () => {
      render(<QRCodeStep {...defaultProps} />)

      const nextButton = screen.getByTestId('primary-button')
      expect(nextButton).not.toBeDisabled()
    })

    it('should disable next button during loading', () => {
      render(<QRCodeStep {...defaultProps} isLoading={true} />)

      const nextButton = screen.getByTestId('primary-button')
      expect(nextButton).toBeDisabled()
    })

    it('should disable next button when qrCodeData is missing', () => {
      render(<QRCodeStep {...defaultProps} qrCodeData="" />)

      const nextButton = screen.getByTestId('primary-button')
      expect(nextButton).toBeDisabled()
    })

    it('should disable next button when backup codes are missing', () => {
      render(<QRCodeStep {...defaultProps} backupCodes={[]} />)

      const nextButton = screen.getByTestId('primary-button')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty backup codes array', () => {
      render(<QRCodeStep {...defaultProps} backupCodes={[]} />)

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons).toHaveLength(10)
    })

    it('should handle missing QR code data', () => {
      render(<QRCodeStep {...defaultProps} qrCodeData="" />)

      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('should handle single backup code', () => {
      render(<QRCodeStep {...defaultProps} backupCodes={['SINGLE-CODE']} />)

      const codes = screen.getAllByTestId('code')
      expect(codes).toHaveLength(1)
      expect(codes[0]).toHaveTextContent('SINGLE-CODE')
    })

    it('should handle very long QR code data', () => {
      const longQRData = 'otpauth://totp/test@example.com?secret=' + 'A'.repeat(1000)
      render(<QRCodeStep {...defaultProps} qrCodeData={longQRData} />)

      const qrCode = screen.getByTestId('qr-code')
      expect(qrCode).toHaveAttribute('data-value', longQRData)
    })
  })

  describe('Component Integration', () => {
    it('should render all sections together', () => {
      render(<QRCodeStep {...defaultProps} />)

      expect(screen.getByText('Scan QR Code')).toBeInTheDocument()
      expect(screen.getByText('Backup Recovery Codes')).toBeInTheDocument()
      expect(screen.getByTestId('qr-code')).toBeInTheDocument()
      expect(screen.getAllByTestId('code')).toHaveLength(10)
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
    })
  })
})
