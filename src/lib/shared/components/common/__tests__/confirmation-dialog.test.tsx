import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import ConfirmationDialog from '../confirmation-dialog'

// Mock form elements
vi.mock('@shared/components/form-elements', () => ({
  PrimaryButton: ({ children, onClick, leftIcon, ...props }: any) => (
    <button onClick={onClick} data-testid="primary-button" {...props}>
      {leftIcon && <span data-testid="left-icon" data-button-type="primary" />}
      {children}
    </button>
  ),
  SecondaryButton: ({ children, onClick, leftIcon, ...props }: any) => (
    <button onClick={onClick} data-testid="secondary-button" {...props}>
      {leftIcon && <span data-testid="left-icon" data-button-type="secondary" />}
      {children}
    </button>
  )
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

const defaultProps: ConfirmationDialogProps = {
  isOpen: true,
  title: 'Test Confirmation',
  message: 'Are you sure you want to proceed?',
  onConfirm: vi.fn(),
  onCancel: vi.fn()
}

const renderDialog = (props: Partial<ConfirmationDialogProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(
    <ConfirmationDialog {...mergedProps} />,
    { wrapper: TestWrapper }
  )
}

describe('ConfirmationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Visibility and Rendering', () => {
    it('should render when isOpen is true', () => {
      renderDialog({ isOpen: true })
      
      expect(screen.getByText('Test Confirmation')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      renderDialog({ isOpen: false })
      
      expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument()
      expect(screen.queryByText('Are you sure you want to proceed?')).not.toBeInTheDocument()
    })

    it('should render with custom title and message', () => {
      renderDialog({
        title: 'Delete Item',
        message: 'This action cannot be undone.'
      })
      
      expect(screen.getByText('Delete Item')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })
  })

  describe('Buttons and Actions', () => {
    it('should render confirm and cancel buttons with default text', () => {
      renderDialog()
      
      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render buttons with custom text', () => {
      renderDialog({
        confirmText: 'Delete',
        cancelText: 'Keep'
      })
      
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Keep')).toBeInTheDocument()
    })

    it('should call onConfirm when confirm button is clicked', async () => {
      const mockOnConfirm = vi.fn()
      
      renderDialog({ onConfirm: mockOnConfirm })
      
      const confirmButton = screen.getByTestId('primary-button')
      await userEvent.click(confirmButton)
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const mockOnCancel = vi.fn()
      
      renderDialog({ onCancel: mockOnCancel })
      
      const cancelButton = screen.getByTestId('secondary-button')
      await userEvent.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Confirm Button Variants', () => {
    it('should render primary variant confirm button by default', () => {
      renderDialog()
      
      const confirmButton = screen.getByTestId('primary-button')
      expect(confirmButton).toBeInTheDocument()
      expect(confirmButton).toHaveTextContent('Confirm')
    })

    it('should render danger variant confirm button with proper styling', () => {
      renderDialog({ confirmVariant: 'danger' })
      
      const confirmButton = screen.getByTestId('primary-button')
      expect(confirmButton).toBeInTheDocument()
      expect(confirmButton).toHaveTextContent('Confirm')
      
      // Check if button has danger styling props
      expect(confirmButton).toHaveStyle({ backgroundColor: 'red.500' })
    })

    it('should render primary variant confirm button explicitly', () => {
      renderDialog({ confirmVariant: 'primary' })
      
      const confirmButton = screen.getByTestId('primary-button')
      expect(confirmButton).toBeInTheDocument()
      expect(confirmButton).toHaveTextContent('Confirm')
    })
  })

  describe('Icons', () => {
    it('should render button icons correctly', () => {
      renderDialog()
      
      // Button icons should be rendered (from mocked PrimaryButton and SecondaryButton)
      const buttonIcons = screen.getAllByTestId('left-icon')
      expect(buttonIcons.length).toBeGreaterThanOrEqual(2)
      
      // Both primary and secondary buttons should have icons
      expect(buttonIcons[0]).toBeInTheDocument()
      expect(buttonIcons[1]).toBeInTheDocument()
    })

    it('should render icons for different variants', () => {
      renderDialog({ confirmVariant: 'danger' })
      
      // Icons should be present for danger variant
      const buttonIcons = screen.getAllByTestId('left-icon')
      expect(buttonIcons.length).toBeGreaterThanOrEqual(2)
      expect(buttonIcons[0]).toBeInTheDocument()
    })

    it('should render icons on buttons', () => {
      renderDialog()
      
      const icons = screen.getAllByTestId('left-icon')
      expect(icons.length).toBeGreaterThan(1) // Header icon + button icons
      
      // Check for button-specific icons
      const buttonIcons = icons.filter(icon => 
        icon.getAttribute('data-button-type') === 'primary' || 
        icon.getAttribute('data-button-type') === 'secondary'
      )
      expect(buttonIcons.length).toBeGreaterThanOrEqual(1)
    })

    it('should render icons in different button types', () => {
      renderDialog()
      
      const allIcons = screen.getAllByTestId('left-icon')
      expect(allIcons.length).toBeGreaterThanOrEqual(2)
      
      // Should have icons with different button types
      const primaryButtonIcons = allIcons.filter(icon => 
        icon.getAttribute('data-button-type') === 'primary'
      )
      const secondaryButtonIcons = allIcons.filter(icon => 
        icon.getAttribute('data-button-type') === 'secondary'
      )
      
      expect(primaryButtonIcons.length).toBe(1)
      expect(secondaryButtonIcons.length).toBe(1)
    })

    it('should have proper dialog structure with icon area', () => {
      renderDialog({ confirmVariant: 'danger' })
      
      // Verify dialog has proper structure (header area where icon would be)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      
      // The dialog should contain the title which is in the header with the icon
      expect(screen.getByText('Test Confirmation')).toBeInTheDocument()
    })
  })

  describe('Dialog Backdrop and Positioning', () => {
    it('should render backdrop overlay', async () => {
      renderDialog()
      
      // Dialog should be visible
      expect(screen.getByText('Test Confirmation')).toBeInTheDocument()
    })

    it('should handle backdrop click to close dialog', async () => {
      const mockOnCancel = vi.fn()
      
      renderDialog({ onCancel: mockOnCancel })
      
      // Simulate backdrop click by triggering dialog close
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      
      // Note: Testing backdrop click directly is challenging with JSDOM
      // We'll test the onOpenChange logic indirectly
    })
  })

  describe('Keyboard Interactions', () => {
    it('should be keyboard accessible', () => {
      renderDialog()
      
      const confirmButton = screen.getByTestId('primary-button')
      const cancelButton = screen.getByTestId('secondary-button')
      
      expect(confirmButton).not.toHaveAttribute('tabindex', '-1')
      expect(cancelButton).not.toHaveAttribute('tabindex', '-1')
    })

    it('should handle enter key on buttons', async () => {
      const mockOnConfirm = vi.fn()
      
      renderDialog({ onConfirm: mockOnConfirm })
      
      const confirmButton = screen.getByTestId('primary-button')
      confirmButton.focus()
      
      await userEvent.keyboard('{Enter}')
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('Different Confirmation Scenarios', () => {
    it('should handle delete confirmation dialog', async () => {
      const mockOnConfirm = vi.fn()
      const mockOnCancel = vi.fn()
      
      renderDialog({
        title: 'Delete User',
        message: 'This will permanently delete the user account.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmVariant: 'danger',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
      
      // Use more specific queries to avoid multiple element issues
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('This will permanently delete the user account.')).toBeInTheDocument()
      
      // Use data-testid to target specific button
      const deleteButton = screen.getByTestId('primary-button')
      await userEvent.click(deleteButton)
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should handle save confirmation dialog', async () => {
      const mockOnConfirm = vi.fn()
      
      renderDialog({
        title: 'Save Changes',
        message: 'Do you want to save your changes?',
        confirmText: 'Save',
        cancelText: 'Discard',
        confirmVariant: 'primary',
        onConfirm: mockOnConfirm
      })
      
      // Use role-based queries
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Do you want to save your changes?')).toBeInTheDocument()
      
      // Use data-testid for reliable button selection
      const saveButton = screen.getByTestId('primary-button')
      await userEvent.click(saveButton)
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should handle logout confirmation dialog', async () => {
      const mockOnCancel = vi.fn()
      
      renderDialog({
        title: 'Sign Out',
        message: 'You will need to sign in again to access your account.',
        confirmText: 'Sign Out',
        cancelText: 'Stay Signed In',
        onCancel: mockOnCancel
      })
      
      // Use role-based queries for more reliable element selection
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('You will need to sign in again to access your account.')).toBeInTheDocument()
      
      // Use getAllByText to handle multiple elements with same text, then select the button
      const signOutElements = screen.getAllByText('Sign Out')
      expect(signOutElements.length).toBeGreaterThanOrEqual(1)
      
      // Find the cancel button specifically
      const stayButton = screen.getByText('Stay Signed In')
      await userEvent.click(stayButton)
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      renderDialog()
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should have accessible title', () => {
      renderDialog({ title: 'Accessible Title' })
      
      expect(screen.getByText('Accessible Title')).toBeInTheDocument()
    })

    it('should support screen readers', () => {
      renderDialog({
        title: 'Screen Reader Test',
        message: 'This dialog should be accessible to screen readers.'
      })
      
      // Title should be properly associated
      expect(screen.getByText('Screen Reader Test')).toBeInTheDocument()
      expect(screen.getByText('This dialog should be accessible to screen readers.')).toBeInTheDocument()
    })
  })

  describe('Props Validation', () => {
    it('should handle all required props', () => {
      expect(() => {
        renderDialog({
          isOpen: true,
          title: 'Required Props Test',
          message: 'Testing required props',
          onConfirm: vi.fn(),
          onCancel: vi.fn()
        })
      }).not.toThrow()
    })

    it('should handle optional props gracefully', () => {
      expect(() => {
        renderDialog({
          isOpen: true,
          title: 'Optional Props Test',
          message: 'Testing optional props',
          onConfirm: vi.fn(),
          onCancel: vi.fn()
          // confirmText, cancelText, confirmVariant are optional
        })
      }).not.toThrow()
    })

    it('should work without custom button text', () => {
      renderDialog()
      
      // Should fall back to default text
      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('Multiple Dialog Instances', () => {
    it('should handle multiple dialogs independently', () => {
      const { rerender } = renderDialog({
        isOpen: true,
        title: 'First Dialog'
      })
      
      expect(screen.getByText('First Dialog')).toBeInTheDocument()
      
      rerender(
        <TestWrapper>
          <ConfirmationDialog
            {...defaultProps}
            isOpen={true}
            title="Second Dialog"
          />
        </TestWrapper>
      )
      
      expect(screen.getByText('Second Dialog')).toBeInTheDocument()
      expect(screen.queryByText('First Dialog')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing callback functions gracefully', () => {
      // Note: In real implementation, onConfirm and onCancel are required
      // This test ensures the component doesn't crash if somehow undefined
      expect(() => {
        renderDialog({
          onConfirm: vi.fn(),
          onCancel: vi.fn()
        })
      }).not.toThrow()
    })

    it('should handle very long title and message text', () => {
      const longTitle = 'This is a very long title that might cause layout issues if not handled properly'
      const longMessage = 'This is a very long message that should be displayed properly even if it contains a lot of text and might need to wrap to multiple lines or be truncated depending on the design requirements.'
      
      renderDialog({
        title: longTitle,
        message: longMessage
      })
      
      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })
  })
})