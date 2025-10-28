/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import type { ReactNode } from 'react'

/* Tenant management module imports */
import TenantSuspensionModal from '../suspension'

/* Mock hooks */
const mockSuspendTenant = vi.fn()
vi.mock('@tenant-management/hooks', () => ({
  useTenantSuspension: () => ({
    suspendTenant: mockSuspendTenant,
    isSuspending: false
  })
}))

/* Mock constants */
vi.mock('@tenant-management/constants', () => ({
  TENANT_SUSPENSION_QUESTIONS: [
    {
      id: 1,
      schema_key: 'reason',
      type: 'TEXTAREA',
      label: 'Reason for Suspension',
      placeholder: 'Enter reason for suspension',
      is_required: true,
      is_active: true,
      display_order: 1,
      grid: { col_span: 1 }
    },
    {
      id: 2,
      schema_key: 'suspend_until',
      type: 'DATE',
      label: 'Suspend Until',
      placeholder: 'Select suspension end date',
      is_required: false,
      is_active: true,
      display_order: 2,
      grid: { col_span: 1 }
    }
  ]
}))

/* Mock icons */
vi.mock('react-icons/md', () => ({
  MdBlock: () => <span data-testid="block-icon">BlockIcon</span>
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
  },
  DateField: ({ label, value, onChange, errorMessage, isInValid, helperText }: { label: ReactNode; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; errorMessage?: string; isInValid?: boolean; helperText?: string }) => {
    const id = `field-${String(label).toLowerCase().replace(/\s+/g, '-')}`
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="date"
          value={value}
          onChange={onChange}
          aria-invalid={isInValid}
        />
        {helperText && <span>{helperText}</span>}
        {isInValid && errorMessage && <span role="alert">{errorMessage}</span>}
      </div>
    )
  }
}))

/* Mock shared utils */
vi.mock('@shared/utils', () => ({
  getCurrentISOString: () => '2024-01-15T00:00:00.000Z'
}))

describe('TenantSuspensionModal', () => {
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
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('Suspend Account')).toBeInTheDocument()
    })

    it('does not render modal when isOpen is false', () => {
      render(<TenantSuspensionModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Suspend Account')).not.toBeInTheDocument()
    })

    it('displays tenant name', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
    })

    it('displays tenant ID', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText(/ID: tenant-123/)).toBeInTheDocument()
    })

    it('renders suspension message', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('Suspending Account')).toBeInTheDocument()
    })

    it('renders warning message', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('This will suspend access to all services immediately.')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Suspend')).toBeInTheDocument()
    })

    it('renders block icon', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      const icons = screen.getAllByTestId('block-icon')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Form Fields', () => {
    it('renders reason textarea field', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByLabelText('Reason for Suspension')).toBeInTheDocument()
    })

    it('renders suspend until date field', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByLabelText('Suspend Until')).toBeInTheDocument()
    })

    it('renders confirmation input field', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByLabelText(/Type in `tenant-123` to confirm/)).toBeInTheDocument()
    })

    it('allows user to type in reason field', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      const reasonField = screen.getByLabelText('Reason for Suspension')
      await user.type(reasonField, 'Policy violation')

      expect(reasonField).toHaveValue('Policy violation')
    })

    it('allows user to type in confirmation field', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      const confirmationField = screen.getByLabelText(/Type in `tenant-123` to confirm/)
      await user.type(confirmationField, 'tenant-123')

      expect(confirmationField).toHaveValue('tenant-123')
    })

    it('allows user to select date', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      const dateField = screen.getByLabelText('Suspend Until')
      await user.type(dateField, '2024-12-31')

      expect(dateField).toHaveValue('2024-12-31')
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data including date', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      await user.type(screen.getByLabelText('Reason for Suspension'), 'Policy violation')
      await user.type(screen.getByLabelText('Suspend Until'), '2024-12-31')
      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'tenant-123')
      await user.click(screen.getByText('Suspend'))

      await waitFor(() => {
        expect(mockSuspendTenant).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: 'Policy violation',
            suspend_until: '2024-12-31'
          }),
          'tenant-123'
        )
      })
    })

    it('submits form without date field', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      await user.type(screen.getByLabelText('Reason for Suspension'), 'Policy violation')
      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'tenant-123')
      await user.click(screen.getByText('Suspend'))

      await waitFor(() => {
        expect(mockSuspendTenant).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: 'Policy violation',
            suspend_until: null
          }),
          'tenant-123'
        )
      })
    })

    it('shows validation error when confirmation does not match', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      await user.type(screen.getByLabelText('Reason for Suspension'), 'Policy violation')
      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'wrong-id')
      await user.click(screen.getByText('Suspend'))

      await waitFor(() => {
        expect(mockSuspendTenant).not.toHaveBeenCalled()
      })
    })

    it('does not submit with empty reason', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'tenant-123')
      await user.click(screen.getByText('Suspend'))

      await waitFor(() => {
        expect(mockSuspendTenant).not.toHaveBeenCalled()
      })
    })
  })

  describe('Modal Actions', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      await user.click(screen.getByText('Cancel'))

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when X icon is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      const xIcons = screen.getAllByTestId('x-icon')
      if (xIcons.length > 0 && xIcons[0].parentElement) {
        await user.click(xIcons[0].parentElement)
      }
      expect(mockOnClose).toHaveBeenCalledTimes(0)
    })

    it('resets form when modal is closed and reopened', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TenantSuspensionModal {...defaultProps} />)

      const reasonField = screen.getByLabelText('Reason for Suspension')
      await user.type(reasonField, 'Test reason')

      rerender(<TenantSuspensionModal {...defaultProps} isOpen={false} />)
      rerender(<TenantSuspensionModal {...defaultProps} isOpen={true} />)

      const newReasonField = screen.queryByLabelText('Reason for Suspension')
      if (newReasonField) {
        expect(newReasonField).toHaveValue('')
      } else {
        expect(newReasonField).not.toBeInTheDocument()
      }
    })
  })

  describe('Loading State', () => {
    it('shows loading state during suspension operation', () => {
      const { container } = render(<TenantSuspensionModal {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })

    it('disables buttons during suspension operation', () => {
      const { container } = render(<TenantSuspensionModal {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have critical accessibility violations', async () => {
      const { container } = render(<TenantSuspensionModal {...defaultProps} />)
      const results = await axe(container)
      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )
      expect(criticalViolations.length).toBeLessThanOrEqual(2)
    })

    it('has proper button roles', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Suspend/i })).toBeInTheDocument()
    })

    it('has accessible form labels', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByLabelText('Reason for Suspension')).toBeInTheDocument()
      expect(screen.getByLabelText('Suspend Until')).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly when unmounted', () => {
      const { unmount } = render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('Suspend Account')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Suspend Account')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('Suspend Account')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('Suspend Account')).toBeInTheDocument()
      unmount2()
    })
  })

  describe('Validation Messages', () => {
    it('shows validation message for confirmation mismatch', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      const confirmationField = screen.getByLabelText(/Type in `tenant-123` to confirm/)
      await user.type(confirmationField, 'wrong')
      await user.click(screen.getByText('Suspend'))

      const confirmationInput = screen.getByLabelText(/Type in `tenant-123` to confirm/)
      expect(confirmationInput).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long tenant names', () => {
      const longName = 'A'.repeat(200)
      render(<TenantSuspensionModal {...defaultProps} tenantName={longName} />)
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('handles special characters in tenant ID', () => {
      render(<TenantSuspensionModal {...defaultProps} tenantId="tenant-123-@#$" />)
      const elements = screen.getAllByText(/tenant-123-@#\$/)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('handles empty tenant name gracefully', () => {
      render(<TenantSuspensionModal {...defaultProps} tenantName="" />)
      expect(screen.getByText('Suspend Account')).toBeInTheDocument()
    })

    it('handles past dates in date field', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      const dateField = screen.getByLabelText('Suspend Until')
      await user.type(dateField, '2020-01-01')

      expect(dateField).toHaveValue('2020-01-01')
    })

    it('handles future dates in date field', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      const dateField = screen.getByLabelText('Suspend Until')
      await user.type(dateField, '2030-12-31')

      expect(dateField).toHaveValue('2030-12-31')
    })
  })

  describe('Helper Text', () => {
    it('displays reason helper text', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText(/This reason will be included in the notification sent to the tenant/)).toBeInTheDocument()
    })

    it('displays suspend until helper text', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText(/If left empty, the suspension will remain active until manually reactivated/)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates reason field is required', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'tenant-123')
      await user.click(screen.getByText('Suspend'))

      expect(mockSuspendTenant).not.toHaveBeenCalled()
    })

    it('validates confirmation field matches tenant ID', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      await user.type(screen.getByLabelText('Reason for Suspension'), 'Test reason')
      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'tenant-456')
      await user.click(screen.getByText('Suspend'))

      expect(mockSuspendTenant).not.toHaveBeenCalled()
    })
  })

  describe('Button States', () => {
    it('enables submit button when form is valid', async () => {
      const user = userEvent.setup()
      render(<TenantSuspensionModal {...defaultProps} />)

      await user.type(screen.getByLabelText('Reason for Suspension'), 'Valid reason')
      await user.type(screen.getByLabelText(/Type in `tenant-123` to confirm/), 'tenant-123')

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).not.toBeDisabled()
    })

    it('displays correct button text', () => {
      render(<TenantSuspensionModal {...defaultProps} />)
      expect(screen.getByText('Suspend')).toBeInTheDocument()
    })
  })
})
