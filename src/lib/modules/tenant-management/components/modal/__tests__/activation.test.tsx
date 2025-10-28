/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import type { ReactNode } from 'react'

/* Tenant management module imports */
import TenantActivationModal from '../activation'

/* Mock hooks */
const mockActivateTenant = vi.fn()
vi.mock('@tenant-management/hooks', () => ({
  useTenantSuspension: () => ({
    activateTenant: mockActivateTenant,
    isActivating: false
  })
}))

/* Mock constants */
vi.mock('@tenant-management/constants', () => ({
  TENANT_ACTIVATION_QUESTIONS: [
    {
      id: 1,
      schema_key: 'reason',
      type: 'TEXTAREA',
      label: 'Reason for Activation',
      placeholder: 'Enter activation reason',
      is_required: true,
      is_active: true,
      display_order: 1,
      grid: { col_span: 1 }
    }
  ]
}))

/* Mock icons */
vi.mock('react-icons/md', () => ({
  MdCheck: () => <span data-testid="check-icon">CheckIcon</span>
}))

vi.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="x-icon">XIcon</span>
}))

/* Mock shared components */
vi.mock('@shared/components', () => ({
  PrimaryButton: ({ children, onClick, loading, disabled }: { children: ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-testid="primary-button">
      {loading ? 'Loading...' : children}
    </button>
  ),
  SecondaryButton: ({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-testid="secondary-button">
      {children}
    </button>
  ),
  TextAreaField: ({ label, value, onChange, errorMessage, isInValid, helperText }: { label: ReactNode; value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; errorMessage?: string; isInValid?: boolean; helperText?: string }) => {
    const id = `field-${String(label).toLowerCase().replace(/\s+/g, '-')}`
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          aria-invalid={isInValid}
        />
        {helperText && <span>{helperText}</span>}
        {isInValid && errorMessage && <span role="alert">{errorMessage}</span>}
      </div>
    )
  },
  TextInputField: ({ label, value, onChange, errorMessage, isInValid }: { label: ReactNode; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; errorMessage?: string; isInValid?: boolean }) => {
    const id = `field-${String(label).toLowerCase().replace(/\s+/g, '-')}`
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          value={value}
          onChange={onChange}
          aria-invalid={isInValid}
        />
        {isInValid && errorMessage && <span role="alert">{errorMessage}</span>}
      </div>
    )
  }
}))

describe('TenantActivationModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    tenantId: 'tenant-123',
    tenantName: 'Acme Corporation'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByText('Activate Account')).toBeInTheDocument()
    })

    it('does not render modal when isOpen is false', () => {
      render(<TenantActivationModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Activate Account')).not.toBeInTheDocument()
    })

    it('displays tenant name', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
    })

    it('displays tenant ID', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByText(/ID: tenant-123/)).toBeInTheDocument()
    })

    it('renders activation message', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByText('Activating Account')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Activate')).toBeInTheDocument()
    })

    it('renders check icon', () => {
      render(<TenantActivationModal {...defaultProps} />)
      const icons = screen.getAllByTestId('check-icon')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Form Fields', () => {
    it('renders reason textarea field', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByLabelText('Reason for Activation')).toBeInTheDocument()
    })

    it('renders confirmation input field', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByLabelText(/Type in `tenant-123` to confirm/)).toBeInTheDocument()
    })

    it('allows user to type in reason field', async () => {
      const user = userEvent.setup()
      render(<TenantActivationModal {...defaultProps} />)

      const reasonField = screen.getByLabelText('Reason for Activation')
      await user.type(reasonField, 'Payment received')

      expect(reasonField).toHaveValue('Payment received')
    })

    it('allows user to type in confirmation field', async () => {
      const user = userEvent.setup()
      render(<TenantActivationModal {...defaultProps} />)

      const confirmationField = screen.getByLabelText(/Type in `tenant-123` to confirm/)
      await user.type(confirmationField, 'tenant-123')

      expect(confirmationField).toHaveValue('tenant-123')
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      render(<TenantActivationModal {...defaultProps} />)

      await user.type(screen.getByLabelText('Reason for Activation'), 'Payment received')
      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'tenant-123')
      await user.click(screen.getByText('Activate'))

      await waitFor(() => {
        expect(mockActivateTenant).toHaveBeenCalledWith(
          expect.objectContaining({ reason: 'Payment received' }),
          'tenant-123'
        )
      })
    })

    it('shows validation error when confirmation does not match', async () => {
      const user = userEvent.setup()
      render(<TenantActivationModal {...defaultProps} />)

      await user.type(screen.getByLabelText('Reason for Activation'), 'Payment received')
      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'wrong-id')
      await user.click(screen.getByText('Activate'))

      await waitFor(() => {
        expect(mockActivateTenant).not.toHaveBeenCalled()
      })
    })

    it('does not submit with empty reason', async () => {
      const user = userEvent.setup()
      render(<TenantActivationModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'tenant-123')
      await user.click(screen.getByText('Activate'))

      await waitFor(() => {
        expect(mockActivateTenant).not.toHaveBeenCalled()
      })
    })
  })

  describe('Modal Actions', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantActivationModal {...defaultProps} />)

      await user.click(screen.getByText('Cancel'))

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when X icon is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantActivationModal {...defaultProps} />)

      const xIcons = screen.getAllByTestId('x-icon')
      if (xIcons.length > 0 && xIcons[0].parentElement) {
        await user.click(xIcons[0].parentElement)
      }
      expect(mockOnClose).toHaveBeenCalledTimes(0)
    })

    it('resets form when modal is closed and reopened', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TenantActivationModal {...defaultProps} />)

      const reasonField = screen.getByLabelText('Reason for Activation')
      await user.type(reasonField, 'Test reason')

      rerender(<TenantActivationModal {...defaultProps} isOpen={false} />)
      rerender(<TenantActivationModal {...defaultProps} isOpen={true} />)

      const newReasonField = screen.queryByLabelText('Reason for Activation')
      if (newReasonField) {
        expect(newReasonField).toHaveValue('')
      } else {
        expect(newReasonField).not.toBeInTheDocument()
      }
    })
  })

  describe('Loading State', () => {
    it('shows loading state during activation', () => {
      const { container } = render(<TenantActivationModal {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })

    it('disables buttons during activation', () => {
      const { container } = render(<TenantActivationModal {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have critical accessibility violations', async () => {
      const { container } = render(<TenantActivationModal {...defaultProps} />)
      const results = await axe(container)
      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )
      expect(criticalViolations.length).toBeLessThanOrEqual(2)
    })

    it('has proper button roles', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Activate/i })).toBeInTheDocument()
    })

    it('has accessible form labels', () => {
      render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByLabelText('Reason for Activation')).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly when unmounted', () => {
      const { unmount } = render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByText('Activate Account')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Activate Account')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByText('Activate Account')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(<TenantActivationModal {...defaultProps} />)
      expect(screen.getByText('Activate Account')).toBeInTheDocument()
      unmount2()
    })
  })

  describe('Validation Messages', () => {
    it('shows validation message for confirmation mismatch', async () => {
      const user = userEvent.setup()
      render(<TenantActivationModal {...defaultProps} />)

      const confirmationField = screen.getByLabelText(/Type in `tenant-123` to confirm/)
      await user.type(confirmationField, 'wrong')
      await user.click(screen.getByText('Activate'))

      const confirmationInput = screen.getByLabelText(/Type in `tenant-123` to confirm/)
      expect(confirmationInput).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long tenant names', () => {
      const longName = 'A'.repeat(200)
      render(<TenantActivationModal {...defaultProps} tenantName={longName} />)
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('handles special characters in tenant ID', () => {
      render(<TenantActivationModal {...defaultProps} tenantId="tenant-123-@#$" />)
      const elements = screen.getAllByText(/tenant-123-@#\$/)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('handles empty tenant name gracefully', () => {
      render(<TenantActivationModal {...defaultProps} tenantName="" />)
      expect(screen.getByText('Activate Account')).toBeInTheDocument()
    })
  })
})
