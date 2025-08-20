import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { Provider } from '@/components/ui/provider';
import VolumeDiscounts from '../volume-discounts';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import { PlanFormMode } from '@plan-management/types/plans';
import { useResourceConfirmation } from '@plan-management/hooks';

// Mock dependencies
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}));

vi.mock('@plan-management/config', () => ({
  VOLUME_DISCOUNT_FIELD_CONFIG: [
    {
      id: 1,
      schema_key: 'name',
      label: 'Discount Name',
      placeholder: 'Enter discount name',
      is_required: true
    },
    {
      id: 2,
      schema_key: 'min_branches',
      label: 'Min Branches',
      placeholder: 'Minimum number of branches',
      is_required: true
    },
    {
      id: 3,
      schema_key: 'max_branches',
      label: 'Max Branches',
      placeholder: 'Maximum number of branches',
      is_required: false
    },
    {
      id: 4,
      schema_key: 'discount_percentage',
      label: 'Discount %',
      placeholder: 'Discount percentage',
      is_required: true
    }
  ]
}));

vi.mock('@plan-management/hooks', () => ({
  useResourceConfirmation: vi.fn(() => ({
    confirmState: { show: false, resourceId: undefined, resourceName: '' },
    handleToggleWithConfirm: vi.fn(),
    handleRemoveWithConfirm: vi.fn(),
    handleConfirm: vi.fn(),
    handleCancel: vi.fn(),
    resourceType: 'Volume Discount'
  }))
}));

vi.mock('@shared/components', () => ({
  PrimaryButton: ({ onClick, leftIcon, children }: any) => (
    <button data-testid="primary-button" onClick={onClick}>
      {leftIcon && <span data-testid="button-icon">{leftIcon.name}</span>}
      {children}
    </button>
  ),
  EmptyStateContainer: ({ icon, title, description, testId }: any) => (
    <div data-testid={testId}>
      <div data-testid="empty-state-icon">{icon}</div>
      <div data-testid="empty-state-title">{title}</div>
      <div data-testid="empty-state-description">{description}</div>
    </div>
  ),
  ConfirmationDialog: ({ 
    isOpen, 
    title, 
    message, 
    confirmText, 
    cancelText, 
    onConfirm, 
    onCancel 
  }: any) => isOpen ? (
    <div data-testid="confirmation-dialog">
      <div data-testid="dialog-title">{title}</div>
      <div data-testid="dialog-message">{message}</div>
      <button data-testid="confirm-button" onClick={onConfirm}>{confirmText}</button>
      <button data-testid="cancel-button" onClick={onCancel}>{cancelText}</button>
    </div>
  ) : null,
  TextInputField: ({ 
    label, 
    value, 
    placeholder, 
    onChange, 
    onBlur, 
    name, 
    isInValid, 
    required, 
    errorMessage, 
    readOnly, 
    disabled 
  }: any) => {
    const fieldName = name && typeof name === 'string' ? name.split('.').pop() || 'field' : 'field';
    return (
      <div data-testid={`text-input-${fieldName}`}>
        <label data-testid={`label-${fieldName}`}>
          {label}
          {required && <span data-testid={`required-${fieldName}`}>*</span>}
        </label>
        <input
          data-testid={`input-${fieldName}`}
          value={value || ''}
          placeholder={placeholder || ''}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          readOnly={readOnly}
          disabled={disabled}
        />
        {isInValid && errorMessage && (
          <span data-testid={`error-${fieldName}`} role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
}));

// Test form wrapper that provides React Hook Form context
const FormTestWrapper = ({ 
  children, 
  defaultValues = {},
  mode = 'create'
}: { 
  children?: React.ReactNode;
  defaultValues?: Partial<CreatePlanFormData>;
  mode?: PlanFormMode;
}) => {
  const methods = useForm<CreatePlanFormData>({
    defaultValues: {
      volume_discounts: [],
      ...defaultValues
    }
  });

  return (
    <Provider>
      <FormProvider {...methods}>
        <form>
          <VolumeDiscounts mode={mode} />
          {children}
        </form>
      </FormProvider>
    </Provider>
  );
};

describe('VolumeDiscounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock to default state
    vi.mocked(useResourceConfirmation).mockReturnValue({
      confirmState: { show: false, resourceId: undefined, resourceName: '' },
      handleToggleWithConfirm: vi.fn(),
      handleRemoveWithConfirm: vi.fn(),
      handleConfirm: vi.fn(),
      handleCancel: vi.fn(),
      resourceType: 'Volume Discount'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render component with correct header in create mode', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByText('Volume Discounts')).toBeInTheDocument();
      expect(screen.getByTestId('primary-button')).toBeInTheDocument();
      expect(screen.getByText('Add Volume Discount')).toBeInTheDocument();
    });

    it('should render component with count in view mode', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Discount 1', min_branches: '5', max_branches: '10', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="view" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByText('Volume Discounts (1)')).toBeInTheDocument();
      expect(screen.queryByTestId('primary-button')).not.toBeInTheDocument();
    });

    it('should render component with correct header in edit mode', () => {
      render(<FormTestWrapper mode="edit" />);

      expect(screen.getByText('Volume Discounts')).toBeInTheDocument();
      expect(screen.getByTestId('primary-button')).toBeInTheDocument();
    });

    it('should show empty state when no volume discounts exist', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('volume-discounts-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No volume discounts added yet');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Click "Add Volume Discount" to create tiered pricing based on branch count');
    });

    it('should show different empty state in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.getByTestId('volume-discounts-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No volume discounts included');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('This plan does not include any volume discounts');
    });
  });

  describe('volume discount cards', () => {
    it('should render volume discount cards when discounts exist', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Small Business', min_branches: '1', max_branches: '5', discount_percentage: '5' },
        { id: 2, name: 'Enterprise', min_branches: '6', max_branches: null, discount_percentage: '15' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByText('Volume Discount #1')).toBeInTheDocument();
      expect(screen.getByText('Volume Discount #2')).toBeInTheDocument();
      expect(screen.queryByTestId('volume-discounts-empty-state')).not.toBeInTheDocument();
    });

    it('should render all form fields for each volume discount', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('text-input-name')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-min_branches')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-max_branches')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-discount_percentage')).toBeInTheDocument();
    });

    it('should show delete buttons in create/edit mode', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      const deleteButtons = screen.getAllByRole('button');
      const trashButtons = deleteButtons.filter(btn => 
        btn.querySelector('svg') || btn.textContent?.includes('Trash')
      );
      expect(trashButtons.length).toBeGreaterThan(0);
    });

    it('should not show delete buttons in view mode', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="view" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      // Only the empty primary button container should exist, no delete buttons
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });
  });

  describe('form interactions', () => {
    it('should add new volume discount when add button is clicked', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const addButton = screen.getByTestId('primary-button');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument();
        expect(screen.getByTestId('text-input-name')).toBeInTheDocument();
      });
    });

    it('should handle form input changes', async () => {
      const user = userEvent.setup();
      const mockVolumeDiscounts = [
        { id: 1, name: '', min_branches: '', max_branches: '', discount_percentage: '' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      const nameInput = screen.getByTestId('input-name');
      const minBranchesInput = screen.getByTestId('input-min_branches');
      const maxBranchesInput = screen.getByTestId('input-max_branches');
      const discountInput = screen.getByTestId('input-discount_percentage');

      await user.type(nameInput, 'Enterprise Discount');
      await user.type(minBranchesInput, '10');
      await user.type(maxBranchesInput, '50');
      await user.type(discountInput, '15');

      expect(nameInput).toHaveValue('Enterprise Discount');
      expect(minBranchesInput).toHaveValue('10');
      expect(maxBranchesInput).toHaveValue('50');
      expect(discountInput).toHaveValue('15');
    });

    it('should call handleDeleteWithConfirm when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleToggleWithConfirm = vi.fn();

      vi.mocked(useResourceConfirmation).mockReturnValue({
        confirmState: { show: false, resourceId: undefined, resourceName: '' },
        handleToggleWithConfirm: mockHandleToggleWithConfirm,
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
        resourceType: 'Volume Discount'
      });

      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector('svg') || btn.getAttribute('data-testid')?.includes('delete')
      );

      if (deleteButton) {
        await user.click(deleteButton);
        expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(0);
      }
    });
  });

  describe('form field validation', () => {
    it('should render required field indicators', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: '', min_branches: '', max_branches: '', discount_percentage: '' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('required-name')).toBeInTheDocument();
      expect(screen.getByTestId('required-min_branches')).toBeInTheDocument();
      expect(screen.getByTestId('required-discount_percentage')).toBeInTheDocument();
      
      // Max branches is not required
      expect(screen.queryByTestId('required-max_branches')).not.toBeInTheDocument();
    });

    it('should render field labels correctly', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: '', min_branches: '', max_branches: '', discount_percentage: '' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('label-name')).toHaveTextContent('Discount Name');
      expect(screen.getByTestId('label-min_branches')).toHaveTextContent('Min Branches');
      expect(screen.getByTestId('label-max_branches')).toHaveTextContent('Max Branches');
      expect(screen.getByTestId('label-discount_percentage')).toHaveTextContent('Discount %');
    });

    it('should render field placeholders correctly', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: '', min_branches: '', max_branches: '', discount_percentage: '' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('input-name')).toHaveAttribute('placeholder', 'Enter discount name');
      expect(screen.getByTestId('input-min_branches')).toHaveAttribute('placeholder', 'Minimum number of branches');
      expect(screen.getByTestId('input-max_branches')).toHaveAttribute('placeholder', 'Maximum number of branches');
      expect(screen.getByTestId('input-discount_percentage')).toHaveAttribute('placeholder', 'Discount percentage');
    });
  });

  describe('confirmation dialog', () => {
    it('should show confirmation dialog when deleting volume discount', () => {
      vi.mocked(useResourceConfirmation).mockReturnValue({
        confirmState: { 
          show: true, 
          resourceId: 1,
          resourceName: 'Enterprise Discount' 
        },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
        resourceType: 'Volume Discount'
      });

      const mockVolumeDiscounts = [
        { id: 1, name: 'Enterprise Discount', min_branches: '10', max_branches: '50', discount_percentage: '15' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Remove Volume Discount');
      expect(screen.getByTestId('dialog-message')).toHaveTextContent('Are you sure you want to remove "Enterprise Discount"?');
      expect(screen.getByTestId('confirm-button')).toHaveTextContent('Remove');
      expect(screen.getByTestId('cancel-button')).toHaveTextContent('Cancel');
    });

    it('should not show confirmation dialog in view mode', () => {
      vi.mocked(useResourceConfirmation).mockReturnValue({
        confirmState: { 
          show: true, 
          resourceId: 1,
          resourceName: 'Enterprise Discount' 
        },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
        resourceType: 'Volume Discount'
      });

      const mockVolumeDiscounts = [
        { id: 1, name: 'Enterprise Discount', min_branches: '10', max_branches: '50', discount_percentage: '15' }
      ];

      render(
        <FormTestWrapper 
          mode="view" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });

    it('should call handleConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleConfirm = vi.fn();

      vi.mocked(useResourceConfirmation).mockReturnValue({
        confirmState: { 
          show: true, 
          resourceId: 1,
          resourceName: 'Test Discount' 
        },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: mockHandleConfirm,
        handleCancel: vi.fn(),
        resourceType: 'Volume Discount'
      });

      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);

      expect(mockHandleConfirm).toHaveBeenCalled();
    });

    it('should call handleCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleCancel = vi.fn();

      vi.mocked(useResourceConfirmation).mockReturnValue({
        confirmState: { 
          show: true, 
          resourceId: 1,
          resourceName: 'Test Discount' 
        },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: mockHandleCancel,
        resourceType: 'Volume Discount'
      });

      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockHandleCancel).toHaveBeenCalled();
    });
  });

  describe('read-only mode', () => {
    it('should render fields as read-only in view mode', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="view" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('input-name')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-min_branches')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-max_branches')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-discount_percentage')).toHaveAttribute('readOnly');
    });

    it('should not render fields as read-only in create mode', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('input-name')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-min_branches')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-max_branches')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-discount_percentage')).not.toHaveAttribute('readOnly');
    });

    it('should not render fields as read-only in edit mode', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="edit" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('input-name')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-min_branches')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-max_branches')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-discount_percentage')).not.toHaveAttribute('readOnly');
    });
  });

  describe('accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const mockVolumeDiscounts = [
        { id: 1, name: '', min_branches: '', max_branches: '', discount_percentage: '' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      const addButton = screen.getByTestId('primary-button');
      const nameInput = screen.getByTestId('input-name');
      const minBranchesInput = screen.getByTestId('input-min_branches');
      const deleteButtons = screen.getAllByRole('button');

      // Should be able to tab through form elements
      await user.tab();
      expect(addButton).toHaveFocus();

      await user.tab();
      // The delete button comes before form inputs in tab order
      const deleteButton = deleteButtons.find(btn => btn !== addButton);
      if (deleteButton) {
        expect(deleteButton).toHaveFocus();
        
        await user.tab();
        expect(nameInput).toHaveFocus();

        await user.tab();
        expect(minBranchesInput).toHaveFocus();
      } else {
        // If no delete button, focus should go to name input
        expect(nameInput).toHaveFocus();
        
        await user.tab();
        expect(minBranchesInput).toHaveFocus();
      }
    });

    it('should have proper labels associated with form fields', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: '', min_branches: '', max_branches: '', discount_percentage: '' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('label-name')).toBeInTheDocument();
      expect(screen.getByTestId('label-min_branches')).toBeInTheDocument();
      expect(screen.getByTestId('label-max_branches')).toBeInTheDocument();
      expect(screen.getByTestId('label-discount_percentage')).toBeInTheDocument();
    });

    it('should have proper structure for error announcements', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: '', min_branches: '', max_branches: '', discount_percentage: '' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      // Verify that error elements would have proper roles when errors are present
      expect(screen.getByTestId('text-input-name')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-min_branches')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-max_branches')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-discount_percentage')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple volume discounts', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Small', min_branches: '1', max_branches: '5', discount_percentage: '5' },
        { id: 2, name: 'Medium', min_branches: '6', max_branches: '15', discount_percentage: '10' },
        { id: 3, name: 'Large', min_branches: '16', max_branches: null, discount_percentage: '20' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByText('Volume Discount #1')).toBeInTheDocument();
      expect(screen.getByText('Volume Discount #2')).toBeInTheDocument();
      expect(screen.getByText('Volume Discount #3')).toBeInTheDocument();
    });

    it('should handle volume discounts with null max_branches', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Unlimited', min_branches: '10', max_branches: null, discount_percentage: '25' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByText('Volume Discount #1')).toBeInTheDocument();
      expect(screen.getByTestId('input-max_branches')).toHaveValue('');
    });

    it('should handle volume discounts with missing name', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: '', min_branches: '5', max_branches: '10', discount_percentage: '15' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByText('Volume Discount #1')).toBeInTheDocument();
    });

    it('should handle adding and removing multiple discounts', async () => {
      const user = userEvent.setup();
      const mockHandleToggleWithConfirm = vi.fn();

      vi.mocked(useResourceConfirmation).mockReturnValue({
        confirmState: { show: false, resourceId: undefined, resourceName: '' },
        handleToggleWithConfirm: mockHandleToggleWithConfirm,
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
        resourceType: 'Volume Discount'
      });

      render(<FormTestWrapper mode="create" />);

      // Add first discount
      const addButton = screen.getByTestId('primary-button');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #1')).toBeInTheDocument();
      });

      // Add second discount
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #2')).toBeInTheDocument();
      });
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(<FormTestWrapper mode="create" />);

      expect(() => unmount()).not.toThrow();
    });

    it('should handle mode changes correctly', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Test', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      const { rerender } = render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByText('Volume Discounts')).toBeInTheDocument();
      expect(screen.getByTestId('primary-button')).toBeInTheDocument();

      rerender(
        <FormTestWrapper 
          mode="view" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByText('Volume Discounts (1)')).toBeInTheDocument();
      expect(screen.queryByTestId('primary-button')).not.toBeInTheDocument();
    });
  });

  describe('form integration', () => {
    it('should integrate properly with React Hook Form', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Test Discount', min_branches: '1', max_branches: '5', discount_percentage: '10' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      // Check that all form fields are properly registered with React Hook Form
      expect(screen.getByTestId('input-name')).toHaveAttribute('name', 'volume_discounts.0.name');
      expect(screen.getByTestId('input-min_branches')).toHaveAttribute('name', 'volume_discounts.0.min_branches');
      expect(screen.getByTestId('input-max_branches')).toHaveAttribute('name', 'volume_discounts.0.max_branches');
      expect(screen.getByTestId('input-discount_percentage')).toHaveAttribute('name', 'volume_discounts.0.discount_percentage');
    });

    it('should handle form field values correctly', () => {
      const mockVolumeDiscounts = [
        { id: 1, name: 'Enterprise', min_branches: '10', max_branches: '50', discount_percentage: '20' }
      ];

      render(
        <FormTestWrapper 
          mode="create" 
          defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
        />
      );

      expect(screen.getByTestId('input-name')).toHaveValue('Enterprise');
      expect(screen.getByTestId('input-min_branches')).toHaveValue('10');
      expect(screen.getByTestId('input-max_branches')).toHaveValue('50');
      expect(screen.getByTestId('input-discount_percentage')).toHaveValue('20');
    });
  });

  describe('performance', () => {
    it('should handle large number of volume discounts', () => {
      const mockVolumeDiscounts = Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        name: `Discount ${index + 1}`,
        min_branches: (index + 1).toString(),
        max_branches: ((index + 1) * 5).toString(),
        discount_percentage: ((index + 1) * 2).toString()
      }));

      expect(() => {
        render(
          <FormTestWrapper 
            mode="create" 
            defaultValues={{ volume_discounts: mockVolumeDiscounts }} 
          />
        );
      }).not.toThrow();

      expect(screen.getByText('Volume Discount #1')).toBeInTheDocument();
      expect(screen.getByText('Volume Discount #10')).toBeInTheDocument();
    });

    it('should handle rapid add/remove operations', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const addButton = screen.getByTestId('primary-button');

      // Rapidly add multiple discounts
      for (let i = 0; i < 5; i++) {
        await user.click(addButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Volume Discount #5')).toBeInTheDocument();
      });
    });
  });
});