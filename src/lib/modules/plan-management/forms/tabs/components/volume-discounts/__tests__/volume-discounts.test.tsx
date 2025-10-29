/* Comprehensive test suite for VolumeDiscounts component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import VolumeDiscounts from '@plan-management/forms/tabs/components/volume-discounts/volume-discounts'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PLAN_FORM_MODES } from '@plan-management/constants'
import * as planFormModeContext from '@plan-management/contexts'
import * as useResourceConfirmationHook from '@plan-management/hooks/use-resource-confirmation'

/* Mock dependencies */
vi.mock('@shared/components', () => ({
  TextInputField: ({ label, value, onChange, readOnly, errorMessage, required, name, onBlur }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    errorMessage?: string;
    required?: boolean;
    name?: string;
    onBlur?: () => void;
  }) => (
    <div data-testid={`text-input-${label}`}>
      <label>{label}{required && ' *'}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        readOnly={readOnly}
        name={name}
        data-testid={`input-${label}`}
      />
      {errorMessage && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  PrimaryButton: ({ onClick, children, leftIcon }: { onClick: () => void; children: React.ReactNode; leftIcon?: React.ReactNode }) => (
    <button onClick={onClick} data-testid="add-volume-discount-button">
      {leftIcon && <span data-testid="button-icon">{leftIcon}</span>}
      {children}
    </button>
  ),
  EmptyStateContainer: ({ icon, title, description, testId }: { icon: React.ReactNode; title: string; description: string; testId: string }) => (
    <div data-testid={testId}>
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
  ConfirmationDialog: ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText: string;
    cancelText: string;
  }) => (
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm} data-testid="confirm-button">{confirmText}</button>
        <button onClick={onCancel} data-testid="cancel-button">{cancelText}</button>
      </div>
    ) : null
  )
}))

describe('VolumeDiscounts', () => {
  const mockHandleRemoveWithConfirm = vi.fn()
  const mockHandleConfirm = vi.fn()
  const mockHandleCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
      mode: PLAN_FORM_MODES.CREATE,
      planId: undefined
    })

    vi.spyOn(useResourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
      confirmState: { show: false },
      handleToggleWithConfirm: vi.fn(),
      handleRemoveWithConfirm: mockHandleRemoveWithConfirm,
      handleConfirm: mockHandleConfirm,
      handleCancel: mockHandleCancel,
      resourceType: 'Volume Discount'
    })
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = ({ defaultValues }: { defaultValues?: Partial<CreatePlanFormData> }) => {
    const methods = useForm<CreatePlanFormData>({
      defaultValues: {
        volume_discounts: defaultValues?.volume_discounts || [],
        ...defaultValues
      }
    })

    return (
      <FormProvider {...methods}>
        <VolumeDiscounts />
      </FormProvider>
    )
  }

  describe('Initial Rendering', () => {
    it('should render volume discounts section header', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Volume Discounts')).toBeInTheDocument()
    })

    it('should render add button in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('add-volume-discount-button')).toBeInTheDocument()
      expect(screen.getByText('Add Volume Discount')).toBeInTheDocument()
    })

    it('should render empty state when no volume discounts exist', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('volume-discounts-empty-state')).toBeInTheDocument()
      expect(screen.getByText('No volume discounts added yet')).toBeInTheDocument()
      expect(screen.getByText('Click "Add Volume Discount" to create tiered pricing based on branch count')).toBeInTheDocument()
    })
  })

  describe('Adding Volume Discounts', () => {
    it('should add a new volume discount when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const addButton = screen.getByTestId('add-volume-discount-button')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument()
      })
    })

    it('should add multiple volume discounts', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const addButton = screen.getByTestId('add-volume-discount-button')

      await user.click(addButton)
      await user.click(addButton)
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument()
        expect(screen.getByText('Volume Discount #2')).toBeInTheDocument()
        expect(screen.getByText('Volume Discount #3')).toBeInTheDocument()
      })
    })

    it('should render all form fields for new volume discount', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByTestId('text-input-Discount Name')).toBeInTheDocument()
        expect(screen.getByTestId('text-input-Min Branches')).toBeInTheDocument()
        expect(screen.getByTestId('text-input-Max Branches')).toBeInTheDocument()
        expect(screen.getByTestId('text-input-Discount (%)')).toBeInTheDocument()
      })
    })

    it('should hide empty state after adding volume discount', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('volume-discounts-empty-state')).toBeInTheDocument()

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.queryByTestId('volume-discounts-empty-state')).not.toBeInTheDocument()
      })
    })
  })

  describe('Volume Discount Fields', () => {
    it('should allow input in discount name field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        const nameInput = screen.getByTestId('input-Discount Name')
        expect(nameInput).toBeInTheDocument()
      })

      const nameInput = screen.getByTestId('input-Discount Name')
      await user.type(nameInput, 'Small Business Discount')

      expect(nameInput).toHaveValue('Small Business Discount')
    })

    it('should allow input in min branches field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        const minInput = screen.getByTestId('input-Min Branches')
        expect(minInput).toBeInTheDocument()
      })

      const minInput = screen.getByTestId('input-Min Branches')
      await user.type(minInput, '5')

      expect(minInput).toHaveValue('5')
    })

    it('should allow input in max branches field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        const maxInput = screen.getByTestId('input-Max Branches')
        expect(maxInput).toBeInTheDocument()
      })

      const maxInput = screen.getByTestId('input-Max Branches')
      await user.type(maxInput, '10')

      expect(maxInput).toHaveValue('10')
    })

    it('should allow input in discount percentage field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        const discountInput = screen.getByTestId('input-Discount (%)')
        expect(discountInput).toBeInTheDocument()
      })

      const discountInput = screen.getByTestId('input-Discount (%)')
      await user.type(discountInput, '15')

      expect(discountInput).toHaveValue('15')
    })

    it('should show required indicators for required fields', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        const nameLabel = screen.getByText(/Discount Name/)
        expect(nameLabel.textContent).toContain('*')

        const minLabel = screen.getByText(/Min Branches/)
        expect(minLabel.textContent).toContain('*')

        const discountLabel = screen.getByText(/Discount \(%\)/)
        expect(discountLabel.textContent).toContain('*')
      })
    })
  })

  describe('Removing Volume Discounts', () => {
    it('should render delete button for each volume discount', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument()
      })

      /* Find delete button by looking for button with trash icon */
      const allButtons = screen.getAllByRole('button')
      const deleteButton = allButtons.find(btn => btn.querySelector('svg'))
      expect(deleteButton).toBeDefined()
    })

    it('should call confirmation hook when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument()
      })

      /* Find delete button by looking for button with trash icon */
      const allButtons = screen.getAllByRole('button')
      const deleteButton = allButtons.find(btn => btn.querySelector('svg'))

      if (deleteButton) {
        await user.click(deleteButton)
        expect(mockHandleRemoveWithConfirm).toHaveBeenCalledWith(0)
      }
    })

    it('should show confirmation dialog when deleting volume discount', async () => {
      const user = userEvent.setup()

      vi.spyOn(useResourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        confirmState: {
          show: true,
          resourceId: 0,
          resourceName: 'Volume Discount #1'
        },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: mockHandleRemoveWithConfirm,
        handleConfirm: mockHandleConfirm,
        handleCancel: mockHandleCancel,
        resourceType: 'Volume Discount'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
        expect(screen.getByText('Remove Volume Discount')).toBeInTheDocument()
      })
    })

    it('should call handleConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup()

      vi.spyOn(useResourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        confirmState: {
          show: true,
          resourceId: 0,
          resourceName: 'Test Discount'
        },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: mockHandleRemoveWithConfirm,
        handleConfirm: mockHandleConfirm,
        handleCancel: mockHandleCancel,
        resourceType: 'Volume Discount'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('confirm-button'))
      expect(mockHandleConfirm).toHaveBeenCalled()
    })

    it('should call handleCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()

      vi.spyOn(useResourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        confirmState: {
          show: true,
          resourceId: 0,
          resourceName: 'Test Discount'
        },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: mockHandleRemoveWithConfirm,
        handleConfirm: mockHandleConfirm,
        handleCancel: mockHandleCancel,
        resourceType: 'Volume Discount'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('cancel-button'))
      expect(mockHandleCancel).toHaveBeenCalled()
    })
  })

  describe('VIEW Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })
    })

    it('should not render add button in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('add-volume-discount-button')).not.toBeInTheDocument()
    })

    it('should display count in header in VIEW mode', () => {
      const defaultValues = {
        volume_discounts: [
          { name: 'Discount 1', min_branches: '5', max_branches: '10', discount_percentage: '10' },
          { name: 'Discount 2', min_branches: '11', max_branches: '20', discount_percentage: '15' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      expect(screen.getByText('Volume Discounts (2)')).toBeInTheDocument()
    })

    it('should render fields as read-only in VIEW mode', () => {
      const defaultValues = {
        volume_discounts: [
          { name: 'Test Discount', min_branches: '5', max_branches: '10', discount_percentage: '10' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Discount Name')
      expect(nameInput).toHaveAttribute('readOnly')
    })

    it('should not render delete buttons in VIEW mode', () => {
      const defaultValues = {
        volume_discounts: [
          { name: 'Test Discount', min_branches: '5', max_branches: '10', discount_percentage: '10' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      /* In VIEW mode, only add-volume-discount-button should not exist, but we check no delete buttons by counting */
      const allButtons = screen.queryAllByRole('button')
      const deleteButtons = allButtons.filter(btn => btn.querySelector('svg'))
      expect(deleteButtons.length).toBe(0)
    })

    it('should show appropriate empty state in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('volume-discounts-empty-state')).toBeInTheDocument()
      expect(screen.getByText('No volume discounts included')).toBeInTheDocument()
      expect(screen.getByText('This plan does not include any volume discounts')).toBeInTheDocument()
    })

    it('should not render confirmation dialog in VIEW mode', () => {
      const defaultValues = {
        volume_discounts: [
          { name: 'Test Discount', min_branches: '5', max_branches: '10', discount_percentage: '10' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })

    it('should not show required indicators in VIEW mode', () => {
      const defaultValues = {
        volume_discounts: [
          { name: 'Test Discount', min_branches: '5', max_branches: '10', discount_percentage: '10' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      const nameLabel = screen.getByText('Discount Name')
      expect(nameLabel.textContent).not.toContain('*')
    })
  })

  describe('EDIT Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })
    })

    it('should render add button in EDIT mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('add-volume-discount-button')).toBeInTheDocument()
    })

    it('should allow editing fields in EDIT mode', () => {
      const defaultValues = {
        volume_discounts: [
          { name: 'Test Discount', min_branches: '5', max_branches: '10', discount_percentage: '10' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Discount Name')
      expect(nameInput).not.toHaveAttribute('readOnly')
    })

    it('should render delete buttons in EDIT mode', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument()
      })

      /* Find delete button by looking for button with trash icon */
      const allButtons = screen.getAllByRole('button')
      const deleteButton = allButtons.find(btn => btn.querySelector('svg'))
      expect(deleteButton).toBeDefined()
    })
  })

  describe('Existing Volume Discounts', () => {
    it('should render existing volume discounts', () => {
      const defaultValues = {
        volume_discounts: [
          { name: 'Small Business', min_branches: '1', max_branches: '5', discount_percentage: '5' },
          { name: 'Medium Business', min_branches: '6', max_branches: '15', discount_percentage: '10' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      expect(screen.getByText('Volume Discount #1')).toBeInTheDocument()
      expect(screen.getByText('Volume Discount #2')).toBeInTheDocument()
    })

    it('should display existing volume discount values', () => {
      const defaultValues = {
        volume_discounts: [
          { name: 'Small Business', min_branches: '1', max_branches: '5', discount_percentage: '5' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('input-Discount Name')).toHaveValue('Small Business')
      expect(screen.getByTestId('input-Min Branches')).toHaveValue('1')
      expect(screen.getByTestId('input-Max Branches')).toHaveValue('5')
      expect(screen.getByTestId('input-Discount (%)')).toHaveValue('5')
    })

    it('should allow editing existing volume discount values', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        volume_discounts: [
          { name: 'Small Business', min_branches: '1', max_branches: '5', discount_percentage: '5' }
        ]
      }

      render(<TestComponent defaultValues={defaultValues} />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Discount Name')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Discount')

      expect(nameInput).toHaveValue('Updated Discount')
    })
  })

  describe('Validation', () => {
    it('should display validation errors', () => {
      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            volume_discounts: [
              { name: '', min_branches: '', max_branches: '', discount_percentage: '' }
            ]
          }
        })

        React.useEffect(() => {
          methods.setError('volume_discounts.0.name', { message: 'Discount name is required' })
        }, [methods])

        return (
          <FormProvider {...methods}>
            <VolumeDiscounts />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-Discount Name')).toHaveTextContent('Discount name is required')
    })

    it('should not show validation errors in VIEW mode', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })

      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            volume_discounts: [
              { name: '', min_branches: '', max_branches: '', discount_percentage: '' }
            ]
          }
        })

        React.useEffect(() => {
          methods.setError('volume_discounts.0.name', { message: 'Discount name is required' })
        }, [methods])

        return (
          <FormProvider {...methods}>
            <VolumeDiscounts />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('error-Discount Name')).not.toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete volume discount creation workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Add volume discount */
      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument()
      })

      /* Fill in fields */
      await user.type(screen.getByTestId('input-Discount Name'), 'Enterprise Discount')
      await user.type(screen.getByTestId('input-Min Branches'), '20')
      await user.type(screen.getByTestId('input-Max Branches'), '50')
      await user.type(screen.getByTestId('input-Discount (%)'), '25')

      /* Verify values */
      expect(screen.getByTestId('input-Discount Name')).toHaveValue('Enterprise Discount')
      expect(screen.getByTestId('input-Min Branches')).toHaveValue('20')
      expect(screen.getByTestId('input-Max Branches')).toHaveValue('50')
      expect(screen.getByTestId('input-Discount (%)')).toHaveValue('25')
    })

    it('should handle multiple volume discounts workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Add first discount */
      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument()
      })

      /* Add second discount */
      await user.click(screen.getByTestId('add-volume-discount-button'))

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #2')).toBeInTheDocument()
      })

      /* Verify both discounts exist */
      const discountHeaders = screen.getAllByText(/Volume Discount #\d+/)
      expect(discountHeaders).toHaveLength(2)
    })
  })

  describe('Error Clearing', () => {
    it('should clear errors when field value changes', async () => {
      const user = userEvent.setup()

      const TestComponentWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            volume_discounts: [
              { name: '', min_branches: '', max_branches: '', discount_percentage: '' }
            ]
          }
        })

        React.useEffect(() => {
          methods.setError('volume_discounts.0.name', { message: 'Discount name is required' })
        }, [methods])

        return (
          <FormProvider {...methods}>
            <VolumeDiscounts />
          </FormProvider>
        )
      }

      render(<TestComponentWithErrors />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Discount Name')
      await user.type(nameInput, 'New Discount')

      /* Error should be cleared after typing */
      await waitFor(() => {
        expect(screen.queryByTestId('error-Discount Name')).not.toBeInTheDocument()
      })
    })
  })
})
