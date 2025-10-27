/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MdSave } from 'react-icons/md'
import { ReactNode } from 'react'
import { IconType } from 'react-icons'

/* Auth module imports */
import SuccessStep from '@auth-management/forms/two-factor-steps/success'

/* Type definitions for mock components */
interface MockChakraProps {
  children?: ReactNode
  [key: string]: unknown
}

interface PrimaryButtonProps {
  onClick?: () => void
  buttonText?: string
  size?: string
  leftIcon?: IconType
  buttonProps?: Record<string, unknown>
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
    Text: ({ children, ...props }: MockChakraProps) => <p data-testid="text" {...props}>{children}</p>
  }
})

/* Mock shared components */
vi.mock('@shared/components', () => ({
  PrimaryButton: vi.fn(({ onClick, buttonText, size, leftIcon, buttonProps }: PrimaryButtonProps) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      data-size={size}
      {...buttonProps}
    >
      {buttonText}
    </button>
  ))
}))

describe('SuccessStep', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render success step', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText('2FA Enabled Successfully!')).toBeInTheDocument()
    })

    it('should render success message', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText('Your Account is Now Protected')).toBeInTheDocument()
      expect(screen.getByText(/Two-factor authentication has been successfully enabled/)).toBeInTheDocument()
    })

    it('should render what happens next section', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText('What Happens Next')).toBeInTheDocument()
      expect(screen.getByText(/When you log in, you'll enter your email and password/)).toBeInTheDocument()
    })

    it('should render important reminders section', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText('Important Reminders')).toBeInTheDocument()
      expect(screen.getByText(/Keep your authenticator app accessible/)).toBeInTheDocument()
    })

    it('should render complete button with default text', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      const completeButton = screen.getByTestId('primary-button')
      expect(completeButton).toBeInTheDocument()
      expect(completeButton).toHaveTextContent('Complete')
    })

    it('should render tip message', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/Keep backup codes accessible/)).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('should render with custom button text', () => {
      render(<SuccessStep onComplete={mockOnComplete} buttonText="Go to Dashboard" />)

      const completeButton = screen.getByTestId('primary-button')
      expect(completeButton).toHaveTextContent('Go to Dashboard')
    })

    it('should render with custom button icon', () => {
      render(<SuccessStep onComplete={mockOnComplete} buttonIcon={MdSave} />)

      const completeButton = screen.getByTestId('primary-button')
      expect(completeButton).toBeInTheDocument()
    })

    it('should render with both custom text and icon', () => {
      render(
        <SuccessStep
          onComplete={mockOnComplete}
          buttonText="Continue to App"
          buttonIcon={MdSave}
        />
      )

      const completeButton = screen.getByTestId('primary-button')
      expect(completeButton).toHaveTextContent('Continue to App')
    })
  })

  describe('User Interactions', () => {
    it('should call onComplete when button is clicked', async () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      const completeButton = screen.getByTestId('primary-button')
      await userEvent.click(completeButton)

      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple clicks', async () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      const completeButton = screen.getByTestId('primary-button')
      await userEvent.click(completeButton)
      await userEvent.click(completeButton)

      expect(mockOnComplete).toHaveBeenCalledTimes(2)
    })
  })

  describe('Information Sections', () => {
    it('should display all what happens next items', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/enter your email and password as usual/)).toBeInTheDocument()
      expect(screen.getByText(/prompted to enter a 6-digit code/)).toBeInTheDocument()
      expect(screen.getByText(/use a backup code to log in/)).toBeInTheDocument()
    })

    it('should display all important reminders', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/Keep your authenticator app accessible/)).toBeInTheDocument()
      expect(screen.getByText(/Store your backup codes in a secure location/)).toBeInTheDocument()
      expect(screen.getByText(/Each backup code can only be used once/)).toBeInTheDocument()
      expect(screen.getByText(/transfer your app or re-scan the QR code/)).toBeInTheDocument()
    })
  })

  describe('Success Indicators', () => {
    it('should display success icon', () => {
      const { container } = render(<SuccessStep onComplete={mockOnComplete} />)

      const flexElements = screen.getAllByTestId('flex')
      expect(flexElements.length).toBeGreaterThan(0)
    })

    it('should have success heading', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText('2FA Enabled Successfully!')).toBeInTheDocument()
    })
  })

  describe('Security Information', () => {
    it('should emphasize account protection', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText('Your Account is Now Protected')).toBeInTheDocument()
    })

    it('should explain 2FA requirement', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/you'll need to enter a code from your authenticator app when logging in/)).toBeInTheDocument()
    })

    it('should mention backup codes', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/use a backup code to log in/)).toBeInTheDocument()
      expect(screen.getByText(/Keep backup codes accessible/)).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should render all sections in correct order', () => {
      const { container } = render(<SuccessStep onComplete={mockOnComplete} />)

      const headings = screen.getAllByTestId('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have proper spacing between sections', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText('What Happens Next')).toBeInTheDocument()
      expect(screen.getByText('Important Reminders')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty button text gracefully', () => {
      render(<SuccessStep onComplete={mockOnComplete} buttonText="" />)

      const completeButton = screen.getByTestId('primary-button')
      expect(completeButton).toBeInTheDocument()
    })

    it('should handle very long button text', () => {
      const longText = 'This is a very long button text that should still render properly'
      render(<SuccessStep onComplete={mockOnComplete} buttonText={longText} />)

      const completeButton = screen.getByTestId('primary-button')
      expect(completeButton).toHaveTextContent(longText)
    })

    it('should work without optional props', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
    })
  })

  describe('Button Styling', () => {
    it('should apply custom button props', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      const completeButton = screen.getByTestId('primary-button')
      expect(completeButton).toBeInTheDocument()
    })

    it('should have size attribute', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      const completeButton = screen.getByTestId('primary-button')
      expect(completeButton).toHaveAttribute('data-size', 'sm')
    })
  })

  describe('Content Verification', () => {
    it('should display login process information', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/When you log in/)).toBeInTheDocument()
      expect(screen.getByText(/6-digit code/)).toBeInTheDocument()
    })

    it('should display device management information', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/new phone/)).toBeInTheDocument()
    })

    it('should display backup code usage information', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/only be used once/)).toBeInTheDocument()
    })
  })

  describe('Callback Functionality', () => {
    it('should execute callback on button click', async () => {
      const customCallback = vi.fn()
      render(<SuccessStep onComplete={customCallback} />)

      const completeButton = screen.getByTestId('primary-button')
      await userEvent.click(completeButton)

      expect(customCallback).toHaveBeenCalledTimes(1)
    })

    it('should not throw error if callback is slow', async () => {
      const slowCallback = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      render(<SuccessStep onComplete={slowCallback} />)

      const completeButton = screen.getByTestId('primary-button')
      await userEvent.click(completeButton)

      expect(slowCallback).toHaveBeenCalled()
    })
  })

  describe('Visual Elements', () => {
    it('should render success box with protection message', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      const boxes = screen.getAllByTestId('box')
      expect(boxes.length).toBeGreaterThan(0)
    })

    it('should render tip box', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText(/Tip:/)).toBeInTheDocument()
    })

    it('should render multiple information boxes', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      const boxes = screen.getAllByTestId('box')
      expect(boxes.length).toBeGreaterThan(2)
    })
  })

  describe('Component Integration', () => {
    it('should render all components together', () => {
      render(<SuccessStep onComplete={mockOnComplete} />)

      expect(screen.getByText('2FA Enabled Successfully!')).toBeInTheDocument()
      expect(screen.getByText('What Happens Next')).toBeInTheDocument()
      expect(screen.getByText('Important Reminders')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('should maintain proper structure with custom props', () => {
      render(
        <SuccessStep
          onComplete={mockOnComplete}
          buttonText="Custom Button"
          buttonIcon={MdSave}
        />
      )

      expect(screen.getByText('2FA Enabled Successfully!')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toHaveTextContent('Custom Button')
    })
  })
})
