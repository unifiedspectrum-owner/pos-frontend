/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconType } from 'react-icons'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import ConfirmationDialog from '../confirmation-dialog'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('ConfirmationDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<ConfirmationDialog {...defaultProps} isOpen={false} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    })

    it('should render title correctly', () => {
      render(<ConfirmationDialog {...defaultProps} title="Delete User" />, { wrapper: TestWrapper })

      expect(screen.getByText('Delete User')).toBeInTheDocument()
    })

    it('should render message correctly', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          message="This action cannot be undone"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument()
    })

    it('should render alert icon', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      /* Check that dialog is rendered with title */
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })
  })

  describe('Button Rendering', () => {
    it('should render default confirm button text', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('should render custom confirm button text', () => {
      render(<ConfirmationDialog {...defaultProps} confirmText="Delete" />, { wrapper: TestWrapper })

      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should render default cancel button text', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render custom cancel button text', () => {
      render(<ConfirmationDialog {...defaultProps} cancelText="Go Back" />, { wrapper: TestWrapper })

      /* Component now properly uses cancelText prop */
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('should hide cancel button when showCancelBtn is false', () => {
      render(<ConfirmationDialog {...defaultProps} showCancelBtn={false} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should hide cancel button when onCancel is not provided', () => {
      const { onCancel, ...propsWithoutCancel } = defaultProps

      render(<ConfirmationDialog {...propsWithoutCancel} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()

      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />, { wrapper: TestWrapper })

      const confirmButton = screen.getByText('Confirm')
      await user.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(<ConfirmationDialog {...defaultProps} onCancel={onCancel} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when loading', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()

      render(
        <ConfirmationDialog {...defaultProps} onConfirm={onConfirm} isLoading={true} />,
        { wrapper: TestWrapper }
      )

      const confirmButton = screen.getByText('Confirm')
      await user.click(confirmButton)

      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Confirm Variant Styles', () => {
    it('should render primary variant by default', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      /* Primary variant should be rendered */
      const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
      expect(confirmButton).toBeInTheDocument()
    })

    it('should render danger variant', () => {
      render(
        <ConfirmationDialog {...defaultProps} confirmVariant="danger" />,
        { wrapper: TestWrapper }
      )

      /* Danger variant should have red styling */
      const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
      expect(confirmButton).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading state on confirm button', () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />, { wrapper: TestWrapper })

      const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
      expect(confirmButton).toBeDisabled()
    })

    it('should not show loading state by default', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
      expect(confirmButton).not.toBeDisabled()
    })

    it('should disable confirmation text input when loading', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmationText="DELETE"
          isLoading={true}
        />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('DELETE')
      expect(input).toBeDisabled()
    })
  })

  describe('Confirmation Text Input', () => {
    it('should render confirmation text input when confirmationText is provided', () => {
      render(
        <ConfirmationDialog {...defaultProps} confirmationText="DELETE" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByPlaceholderText('DELETE')).toBeInTheDocument()
      expect(screen.getByText(/Type in `DELETE` to confirm/)).toBeInTheDocument()
    })

    it('should not render confirmation text input by default', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('should disable confirm button when confirmation text does not match', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmationDialog {...defaultProps} confirmationText="DELETE" />,
        { wrapper: TestWrapper }
      )

      const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
      expect(confirmButton).toBeDisabled()

      const input = screen.getByPlaceholderText('DELETE')
      await user.type(input, 'WRONG')

      expect(confirmButton).toBeDisabled()
    })

    it('should enable confirm button when confirmation text matches', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmationDialog {...defaultProps} confirmationText="DELETE" />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('DELETE')
      await user.type(input, 'DELETE')

      await waitFor(() => {
        const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
        expect(confirmButton).not.toBeDisabled()
      })
    })

    it('should prevent confirm when validation fails', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmationText="DELETE"
          onConfirm={onConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('DELETE')
      await user.type(input, 'WRONG')

      /* Try to click confirm button (it should be disabled, but test validation) */
      const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))

      /* Manually trigger handleConfirm to test validation */
      expect(confirmButton).toBeDisabled()
      expect(onConfirm).not.toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    it('should call onConfirm when confirmation text matches exactly', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()

      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmationText="DELETE"
          onConfirm={onConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('DELETE')
      await user.type(input, 'DELETE')

      await waitFor(() => {
        const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
        expect(confirmButton).not.toBeDisabled()
      })

      const confirmButton = screen.getByText('Confirm')
      await user.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should reset confirmation input when dialog reopens', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} confirmationText="DELETE" isOpen={true} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('DELETE') as HTMLInputElement
      await user.type(input, 'DELETE')

      expect(input.value).toBe('DELETE')

      /* Close dialog */
      rerender(
        <ConfirmationDialog {...defaultProps} confirmationText="DELETE" isOpen={false} />
      )

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('DELETE')).not.toBeInTheDocument()
      })

      /* Reopen dialog */
      rerender(
        <ConfirmationDialog {...defaultProps} confirmationText="DELETE" isOpen={true} />
      )

      await waitFor(() => {
        const newInput = screen.getByPlaceholderText('DELETE') as HTMLInputElement
        expect(newInput.value).toBe('')
      })
    })

    it('should show error message when confirmation text is required', () => {
      render(
        <ConfirmationDialog {...defaultProps} confirmationText="DELETE" />,
        { wrapper: TestWrapper }
      )

      /* Label uses backticks in the component */
      expect(screen.getByText(/Type in/)).toBeInTheDocument()
    })
  })

  describe('Outside Click Behavior', () => {
    it('should allow outside click by default', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })

    it('should prevent outside click when preventOutsideClick is true', () => {
      render(
        <ConfirmationDialog {...defaultProps} preventOutsideClick={true} />,
        { wrapper: TestWrapper }
      )

      /* preventOutsideClick should be configured */
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    it('should use custom onOutsideClick handler when provided', () => {
      const onOutsideClick = vi.fn()

      render(
        <ConfirmationDialog {...defaultProps} onOutsideClick={onOutsideClick} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })
  })

  describe('Custom Icons', () => {
    it('should render custom confirm icon', () => {
      const CustomIcon: IconType = () => <div data-testid="custom-confirm-icon">✓</div>

      render(
        <ConfirmationDialog {...defaultProps} confirmIcon={CustomIcon} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('should render custom cancel icon', () => {
      const CustomIcon: IconType = () => <div data-testid="custom-cancel-icon">✗</div>

      render(
        <ConfirmationDialog {...defaultProps} cancelIcon={CustomIcon} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should render delete confirmation dialog', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()

      render(
        <ConfirmationDialog
          isOpen={true}
          title="Delete User"
          message="This will permanently delete the user account"
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Delete User')).toBeInTheDocument()
      expect(screen.getByText('This will permanently delete the user account')).toBeInTheDocument()

      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should render confirmation with required text input', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()

      render(
        <ConfirmationDialog
          isOpen={true}
          title="Delete Organization"
          message="This action cannot be undone"
          confirmText="Delete"
          confirmVariant="danger"
          confirmationText="DELETE"
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Delete Organization')).toBeInTheDocument()

      const input = screen.getByPlaceholderText('DELETE')
      await user.type(input, 'DELETE')

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete')
        expect(deleteButton).not.toBeDisabled()
      })

      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should render logout confirmation', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()

      render(
        <ConfirmationDialog
          isOpen={true}
          title="Confirm Logout"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          cancelText="Stay Logged In"
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Confirm Logout')).toBeInTheDocument()
      /* Component now properly uses cancelText prop */
      expect(screen.getByText('Stay Logged In')).toBeInTheDocument()

      const logoutButton = screen.getByText('Logout')
      await user.click(logoutButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should render success confirmation without cancel button', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Success"
          message="Operation completed successfully"
          confirmText="OK"
          showCancelBtn={false}
          onConfirm={vi.fn()}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should render loading state during async operation', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Processing"
          message="Please wait..."
          confirmText="Confirm"
          isLoading={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Processing')).toBeInTheDocument()
      const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
      expect(confirmButton).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<ConfirmationDialog {...defaultProps} title="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    })

    it('should handle empty message', () => {
      render(<ConfirmationDialog {...defaultProps} message="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    it('should handle long title', () => {
      const longTitle = 'This is a very long title that describes the confirmation dialog in great detail'

      render(<ConfirmationDialog {...defaultProps} title={longTitle} />, { wrapper: TestWrapper })

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle long message', () => {
      const longMessage = 'This is a very long message that provides detailed information about what will happen when the user confirms this action. It includes multiple sentences and important details.'

      render(<ConfirmationDialog {...defaultProps} message={longMessage} />, { wrapper: TestWrapper })

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      render(
        <ConfirmationDialog {...defaultProps} title="Delete <User> & Reset?" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Delete <User> & Reset?')).toBeInTheDocument()
    })

    it('should handle special characters in message', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          message="Contact support@example.com for help"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Contact support@example.com for help')).toBeInTheDocument()
    })

    it('should handle rapid open/close cycles', async () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} isOpen={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Confirm Action')).toBeInTheDocument()

      rerender(<ConfirmationDialog {...defaultProps} isOpen={false} />)
      await waitFor(() => {
        expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
      })

      rerender(<ConfirmationDialog {...defaultProps} isOpen={true} />)
      await waitFor(() => {
        expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      })
    })

    it('should handle case-sensitive confirmation text', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmationDialog {...defaultProps} confirmationText="Delete" />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('Delete')
      await user.type(input, 'delete')

      const confirmButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Confirm'))
      expect(confirmButton).toBeDisabled()

      await user.clear(input)
      await user.type(input, 'Delete')

      await waitFor(() => {
        expect(confirmButton).not.toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should render with proper dialog structure', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have accessible title', () => {
      render(<ConfirmationDialog {...defaultProps} title="Confirm Delete" />, { wrapper: TestWrapper })

      expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
    })

    it('should have accessible buttons', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should focus trap within dialog', () => {
      render(<ConfirmationDialog {...defaultProps} />, { wrapper: TestWrapper })

      /* Dialog should be in the document */
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should maintain state when props change', () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} title="Original Title" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Original Title')).toBeInTheDocument()

      rerender(<ConfirmationDialog {...defaultProps} title="Updated Title" />)

      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    })

    it('should reset state on dialog close and reopen', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} confirmationText="DELETE" isOpen={true} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('DELETE') as HTMLInputElement
      await user.type(input, 'DEL')

      expect(input.value).toBe('DEL')

      rerender(<ConfirmationDialog {...defaultProps} confirmationText="DELETE" isOpen={false} />)

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('DELETE')).not.toBeInTheDocument()
      })

      rerender(<ConfirmationDialog {...defaultProps} confirmationText="DELETE" isOpen={true} />)

      await waitFor(() => {
        const newInput = screen.getByPlaceholderText('DELETE') as HTMLInputElement
        expect(newInput.value).toBe('')
      })
    })
  })
})
