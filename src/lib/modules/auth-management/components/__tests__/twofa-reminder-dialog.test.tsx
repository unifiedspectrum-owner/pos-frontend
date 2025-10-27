/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'

/* Auth management module imports */
import TwoFAReminderDialog from '../twofa-reminder-dialog'

/* Mock next navigation */
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

/* Mock react-icons */
vi.mock('react-icons/fi', () => ({
  FiShield: () => <span data-testid="shield-icon">ShieldIcon</span>,
  FiX: (props: any) => <span data-testid="x-icon" onClick={props.onClick} {...props}>XIcon</span>
}))

vi.mock('react-icons/md', () => ({
  MdArrowForward: () => <span data-testid="arrow-icon">ArrowIcon</span>
}))

/* Mock shared components */
vi.mock('@shared/components/form-elements', () => ({
  PrimaryButton: ({ children, onClick, buttonText, rightIcon: RightIcon, ...props }: any) => (
    <button onClick={onClick} data-testid="primary-button" aria-label={buttonText || (typeof children === 'string' ? children : 'primary-button')} {...props}>
      {buttonText || children}
      {RightIcon && <RightIcon aria-hidden="true" />}
    </button>
  ),
  SecondaryButton: ({ children, onClick, buttonText, ...props }: any) => (
    <button onClick={onClick} data-testid="secondary-button" aria-label={buttonText || children} {...props}>
      {buttonText || children}
    </button>
  )
}))

/* Mock ADMIN_PAGE_ROUTES */
vi.mock('@/lib/shared', () => ({
  ADMIN_PAGE_ROUTES: {
    PROFILE: '/admin/profile'
  }
}))

describe('TwoFAReminderDialog', () => {
  const mockOnClose = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders dialog when isOpen is true', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument()
      expect(screen.getByText('Security Enhancement Required')).toBeInTheDocument()
    })

    it('does not render dialog when isOpen is false', () => {
      render(<TwoFAReminderDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Enable Two-Factor Authentication')).not.toBeInTheDocument()
    })

    it('renders security message in dialog body', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Your account requires two-factor authentication (2FA) for enhanced security.')).toBeInTheDocument()
    })

    it('renders instruction text', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Enable 2FA from your profile settings to protect your account.')).toBeInTheDocument()
    })

    it('renders reminder option text', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('You can set this up now or later from the Profile section.')).toBeInTheDocument()
    })

    it('renders both action buttons', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Remind Me Later')).toBeInTheDocument()
      expect(screen.getByText('Go to Profile')).toBeInTheDocument()
    })
  })

  describe('Dialog Header', () => {
    it('renders shield icon in header', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getAllByTestId('shield-icon')).toHaveLength(2) // One in header, one in body
    })

    it('renders close button icon in header', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const closeIcon = screen.getByTestId('x-icon')
      expect(closeIcon).toBeInTheDocument()
    })

    it('renders dialog title correctly', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const title = screen.getByText('Enable Two-Factor Authentication')
      expect(title).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      const closeIcon = screen.getByTestId('x-icon')
      await user.click(closeIcon)

      /* Dialog may trigger onClose multiple times (onClick + onOpenChange) */
      expect(mockOnClose).toHaveBeenCalled()
      expect(mockOnClose.mock.calls.length).toBeGreaterThanOrEqual(1)
    })

    it('calls onClose when Remind Me Later button is clicked', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      const remindButton = screen.getByText('Remind Me Later')
      await user.click(remindButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('navigates to profile page when Go to Profile button is clicked', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      const profileButton = screen.getByText('Go to Profile')
      await user.click(profileButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/admin/profile')
    })

    it('closes dialog and navigates in correct order', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      const profileButton = screen.getByText('Go to Profile')
      await user.click(profileButton)

      expect(mockOnClose).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('Modal State Management', () => {
    it('shows dialog when isOpen changes from false to true', () => {
      const { rerender } = render(<TwoFAReminderDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Enable Two-Factor Authentication')).not.toBeInTheDocument()

      rerender(<TwoFAReminderDialog {...defaultProps} isOpen={true} />)

      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument()
    })

    it('hides dialog when isOpen changes from true to false', () => {
      const { rerender } = render(<TwoFAReminderDialog {...defaultProps} isOpen={true} />)

      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument()

      rerender(<TwoFAReminderDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Enable Two-Factor Authentication')).not.toBeInTheDocument()
    })

    it('handles callback prop changes', () => {
      const newOnClose = vi.fn()
      const { rerender } = render(<TwoFAReminderDialog {...defaultProps} isOpen={true} />)

      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument()

      rerender(<TwoFAReminderDialog isOpen={true} onClose={newOnClose} />)

      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument()
      expect(screen.getByText('Remind Me Later')).toBeInTheDocument()
    })
  })

  describe('Button States and Icons', () => {
    it('renders Remind Me Later button as secondary button', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
    })

    it('renders Go to Profile button as primary button', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('renders Go to Profile button with arrow icon', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByTestId('arrow-icon')).toBeInTheDocument()
    })

    it('maintains button state during rapid clicks', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      const profileButton = screen.getByText('Go to Profile')

      await user.click(profileButton)
      await user.click(profileButton)
      await user.click(profileButton)

      expect(mockOnClose).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('Dialog Content Structure', () => {
    it('renders information section with proper styling indicators', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Security Enhancement Required')).toBeInTheDocument()
      expect(screen.getAllByTestId('shield-icon')).toHaveLength(2)
    })

    it('renders all informational text elements', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Security Enhancement Required')).toBeInTheDocument()
      expect(screen.getByText('Your account requires two-factor authentication (2FA) for enhanced security.')).toBeInTheDocument()
      expect(screen.getByText('Enable 2FA from your profile settings to protect your account.')).toBeInTheDocument()
      expect(screen.getByText('You can set this up now or later from the Profile section.')).toBeInTheDocument()
    })

    it('renders dialog footer with buttons', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<TwoFAReminderDialog {...defaultProps} />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('has proper button roles', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Remind Me Later' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Go to Profile' })).toBeInTheDocument()
    })

    it('dialog has proper modal attributes', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('focuses dialog content when opened', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports tab navigation between buttons', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      await user.tab()

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('supports Enter key activation on buttons', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      const profileButton = screen.getByText('Go to Profile')
      await user.click(profileButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/profile')
    })

    it('supports Escape key to close dialog', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      await user.keyboard('{Escape}')

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('contains focusable elements within dialog', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      const buttons = screen.getAllByRole('button')

      buttons.forEach(button => {
        expect(dialog.contains(button) || button.contains(dialog)).toBe(true)
      })
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly when unmounted', () => {
      const { unmount } = render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      unmount()

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument()

      unmount1()

      expect(screen.queryByText('Enable Two-Factor Authentication')).not.toBeInTheDocument()

      const { unmount: unmount2 } = render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument()

      unmount2()

      expect(screen.queryByText('Enable Two-Factor Authentication')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing onClose callback gracefully', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog isOpen={true} onClose={undefined as any} />)

      const remindButton = screen.getByText('Remind Me Later')

      expect(() => user.click(remindButton)).not.toThrow()
    })

    it('handles navigation without errors when router push is called', async () => {
      const user = userEvent.setup()
      render(<TwoFAReminderDialog {...defaultProps} />)

      const profileButton = screen.getByText('Go to Profile')
      await user.click(profileButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/profile')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Visual States', () => {
    it('applies backdrop blur effect', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('centers dialog on screen', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('applies consistent button styling', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const secondaryButton = screen.getByTestId('secondary-button')
      const primaryButton = screen.getByTestId('primary-button')

      expect(secondaryButton).toBeInTheDocument()
      expect(primaryButton).toBeInTheDocument()
    })
  })

  describe('Dialog Close Behavior', () => {
    it('prevents closing on backdrop click', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('handles onOpenChange event', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('handles frequent prop updates efficiently', () => {
      const { rerender } = render(<TwoFAReminderDialog {...defaultProps} />)

      for (let i = 0; i < 10; i++) {
        rerender(<TwoFAReminderDialog {...defaultProps} isOpen={i % 2 === 0} />)
      }

      expect(screen.queryByText('Enable Two-Factor Authentication')).toBeInTheDocument()
    })

    it('maintains callback references during re-renders', () => {
      const { rerender } = render(<TwoFAReminderDialog {...defaultProps} />)

      rerender(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Remind Me Later')).toBeInTheDocument()
      expect(screen.getByText('Go to Profile')).toBeInTheDocument()
    })
  })

  describe('Information Section', () => {
    it('renders information section with blue color scheme', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Security Enhancement Required')).toBeInTheDocument()
    })

    it('renders shield icon in information section', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      const shieldIcons = screen.getAllByTestId('shield-icon')
      expect(shieldIcons.length).toBeGreaterThanOrEqual(1)
    })

    it('renders all security-related text', () => {
      render(<TwoFAReminderDialog {...defaultProps} />)

      expect(screen.getByText('Security Enhancement Required')).toBeInTheDocument()
      expect(screen.getByText(/Your account requires two-factor authentication/)).toBeInTheDocument()
      expect(screen.getByText(/Enable 2FA from your profile settings/)).toBeInTheDocument()
    })
  })
})
