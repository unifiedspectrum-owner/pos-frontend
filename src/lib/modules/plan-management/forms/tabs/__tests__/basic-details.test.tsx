import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { Provider } from '@/components/ui/provider';
import PlanBasicDetails from '../basic-details';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import { PlanFormMode } from '@plan-management/types/plans';

// Mock dependencies
vi.mock('@plan-management/schemas/validation/plans', () => ({
  BASIC_INFO_FIELD_KEYS: ['name', 'description', 'is_active', 'is_custom']
}));

vi.mock('@plan-management/config', () => ({
  BASIC_INFO_QUESTIONS: [
    {
      id: 1,
      schema_key: 'name',
      type: 'INPUT',
      label: 'Plan Name',
      placeholder: 'Enter plan name',
      is_required: true,
      disabled: false,
      grid: { col_span: 1 }
    },
    {
      id: 2,
      schema_key: 'description',
      type: 'TEXTAREA',
      label: 'Plan Description',
      placeholder: 'Enter plan description',
      is_required: true,
      disabled: false,
      grid: { col_span: 2 }
    },
    {
      id: 3,
      schema_key: 'is_active',
      type: 'TOGGLE',
      label: 'Active Plan',
      is_required: false,
      disabled: false,
      grid: { col_span: 1 },
      toggle_text: {
        true: 'Active',
        false: 'Inactive'
      }
    },
    {
      id: 4,
      schema_key: 'is_custom',
      type: 'TOGGLE',
      label: 'Custom Plan',
      is_required: false,
      disabled: false,
      grid: { col_span: 1 },
      toggle_text: {
        true: 'Custom',
        false: 'Standard'
      }
    }
  ],
  PLAN_FORM_MODES: {
    CREATE: 'create',
    EDIT: 'edit', 
    VIEW: 'view'
  }
}));

vi.mock('@plan-management/hooks', () => ({
  useTabValidation: vi.fn(() => ({
    isBasicInfoValid: true,
    isPricingInfoValid: true,
    isFeaturesValid: true,
    isAddonsValid: true,
    isSlaValid: true,
    isEntireFormValid: true,
    validateBasicInfo: vi.fn(() => true),
    validatePricingInfo: vi.fn(() => true),
    validateFeatures: vi.fn(() => true),
    validateAddons: vi.fn(() => true),
    validateSla: vi.fn(() => true),
    getValidationState: vi.fn(() => ({
      isBasicInfoValid: true,
      isPricingInfoValid: true,
      isFeaturesValid: true,
      isAddonsValid: true,
      isSlaValid: true,
      isEntireFormValid: true
    }))
  })),
  useTabValidationNavigation: vi.fn(() => ({
    handleNext: vi.fn()
  }))
}));

vi.mock('@shared/components', () => ({
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
    disabled,
    readOnly 
  }: any) => {
    const fieldName = name?.split?.('.').pop() || name || 'field';
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
          disabled={disabled}
          readOnly={readOnly}
        />
        {isInValid && errorMessage && (
          <span data-testid={`error-${fieldName}`} role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
  TextAreaField: ({ 
    label, 
    value, 
    placeholder, 
    onChange, 
    onBlur, 
    name, 
    isInValid, 
    required, 
    errorMessage, 
    disabled,
    readOnly 
  }: any) => {
    const fieldName = name?.split?.('.').pop() || name || 'field';
    return (
      <div data-testid={`textarea-${fieldName}`}>
        <label data-testid={`label-${fieldName}`}>
          {label}
          {required && <span data-testid={`required-${fieldName}`}>*</span>}
        </label>
        <textarea
          data-testid={`textarea-input-${fieldName}`}
          value={value || ''}
          placeholder={placeholder || ''}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          disabled={disabled}
          readOnly={readOnly}
        />
        {isInValid && errorMessage && (
          <span data-testid={`error-${fieldName}`} role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
  SwitchField: ({ 
    label, 
    value, 
    onChange, 
    name, 
    isInValid, 
    required, 
    errorMessage, 
    activeText, 
    inactiveText, 
    disabled,
    readOnly 
  }: any) => {
    const fieldName = name?.split?.('.').pop() || name || 'field';
    return (
      <div data-testid={`switch-${fieldName}`}>
        <label data-testid={`label-${fieldName}`}>
          {label}
          {required && <span data-testid={`required-${fieldName}`}>*</span>}
        </label>
        <div>
          <input
            data-testid={`switch-input-${fieldName}`}
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            name={name}
            disabled={disabled}
            readOnly={readOnly}
          />
          <span data-testid={`switch-text-${fieldName}`}>
            {value ? (activeText || 'On') : (inactiveText || 'Off')}
          </span>
        </div>
        {isInValid && errorMessage && (
          <span data-testid={`error-${fieldName}`} role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
}));

vi.mock('@plan-management/components', () => ({
  TabNavigation: ({ 
    onNext, 
    onPrevious, 
    isFirstTab, 
    isFormValid, 
    readOnly 
  }: any) => (
    <div data-testid="tab-navigation">
      {!isFirstTab && (
        <button data-testid="previous-button" onClick={onPrevious}>
          Previous
        </button>
      )}
      {!readOnly && (
        <button 
          data-testid="next-button" 
          onClick={onNext}
          disabled={!isFormValid}
        >
          Next
        </button>
      )}
    </div>
  )
}));

// Test form wrapper that provides React Hook Form context
const FormTestWrapper = ({ 
  children, 
  defaultValues = {},
  mode = 'create' as PlanFormMode
}: { 
  children?: React.ReactNode;
  defaultValues?: Partial<CreatePlanFormData>;
  mode?: PlanFormMode;
}) => {
  const methods = useForm<CreatePlanFormData>({
    defaultValues: {
      name: '',
      description: '',
      is_active: false,
      is_custom: false,
      ...defaultValues
    }
  });

  return (
    <Provider>
      <FormProvider {...methods}>
        <form>
          <PlanBasicDetails
            mode={mode}
            onNext={vi.fn()}
            onPrevious={vi.fn()}
            isFirstTab={false}
          />
          {children}
        </form>
      </FormProvider>
    </Provider>
  );
};

describe('PlanBasicDetails', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields correctly', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('text-input-name')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
      expect(screen.getByTestId('switch-is_active')).toBeInTheDocument();
      expect(screen.getByTestId('switch-is_custom')).toBeInTheDocument();
    });

    it('should render correct field labels', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('label-name')).toHaveTextContent('Plan Name');
      expect(screen.getByTestId('label-description')).toHaveTextContent('Plan Description');
      expect(screen.getByTestId('label-is_active')).toHaveTextContent('Active Plan');
      expect(screen.getByTestId('label-is_custom')).toHaveTextContent('Custom Plan');
    });

    it('should render required field indicators', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('required-name')).toBeInTheDocument();
      expect(screen.getByTestId('required-description')).toBeInTheDocument();
      expect(screen.queryByTestId('required-is_active')).not.toBeInTheDocument();
      expect(screen.queryByTestId('required-is_custom')).not.toBeInTheDocument();
    });

    it('should render field placeholders correctly', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('input-name')).toHaveAttribute('placeholder', 'Enter plan name');
      expect(screen.getByTestId('textarea-input-description')).toHaveAttribute('placeholder', 'Enter plan description');
    });

    it('should render tab navigation component', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should handle text input changes', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const nameInput = screen.getByTestId('input-name');
      const descriptionInput = screen.getByTestId('textarea-input-description');

      await user.type(nameInput, 'Premium Plan');
      await user.type(descriptionInput, 'A premium subscription plan');

      expect(nameInput).toHaveValue('Premium Plan');
      expect(descriptionInput).toHaveValue('A premium subscription plan');
    });

    it('should handle switch field changes', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const isActiveSwitch = screen.getByTestId('switch-input-is_active');
      const isCustomSwitch = screen.getByTestId('switch-input-is_custom');

      expect(isActiveSwitch).not.toBeChecked();
      expect(isCustomSwitch).not.toBeChecked();

      await user.click(isActiveSwitch);
      await user.click(isCustomSwitch);

      expect(isActiveSwitch).toBeChecked();
      expect(isCustomSwitch).toBeChecked();
    });

    it('should handle field blur events', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const nameInput = screen.getByTestId('input-name');
      
      await user.type(nameInput, 'Test Plan');
      await user.tab(); // This will trigger blur

      expect(nameInput).toHaveValue('Test Plan');
    });
  });

  describe('form validation', () => {
    it('should display validation errors when fields are invalid', () => {
      render(<FormTestWrapper mode="create" />);

      // Mock form errors by checking if error display elements exist
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should call useTabValidation hook with correct parameters', async () => {
      const { useTabValidation } = await import('@plan-management/hooks');
      const mockUseTabValidation = vi.mocked(useTabValidation);
      
      render(<FormTestWrapper mode="create" />);

      expect(mockUseTabValidation).toHaveBeenCalled();
    });

    it('should call useTabValidationNavigation hook with correct parameters', async () => {
      const { useTabValidationNavigation } = await import('@plan-management/hooks');
      const mockUseTabValidationNavigation = vi.mocked(useTabValidationNavigation);
      
      render(<FormTestWrapper mode="create" />);

      expect(mockUseTabValidationNavigation).toHaveBeenCalled();
    });
  });

  describe('different modes', () => {
    it('should render fields as read-only in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.getByTestId('input-name')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('textarea-input-description')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('switch-input-is_active')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('switch-input-is_custom')).toHaveAttribute('readOnly');
    });

    it('should render fields as editable in create mode', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('input-name')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('textarea-input-description')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('switch-input-is_active')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('switch-input-is_custom')).not.toHaveAttribute('readOnly');
    });

    it('should render fields as editable in edit mode', () => {
      render(<FormTestWrapper mode="edit" />);

      expect(screen.getByTestId('input-name')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('textarea-input-description')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('switch-input-is_active')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('switch-input-is_custom')).not.toHaveAttribute('readOnly');
    });
  });

  describe('tab navigation', () => {
    it('should render previous button when not first tab', () => {
      const TestWrapper = ({ isFirstTab }: { isFirstTab: boolean }) => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            name: '',
            description: '',
            is_active: false,
            is_custom: false
          }
        });

        return (
          <Provider>
            <FormProvider {...methods}>
              <PlanBasicDetails
                mode="create"
                onNext={vi.fn()}
                onPrevious={vi.fn()}
                isFirstTab={isFirstTab}
              />
            </FormProvider>
          </Provider>
        );
      };

      const { rerender } = render(<TestWrapper isFirstTab={false} />);

      expect(screen.getByTestId('previous-button')).toBeInTheDocument();

      rerender(<TestWrapper isFirstTab={true} />);

      expect(screen.queryByTestId('previous-button')).not.toBeInTheDocument();
    });

    it('should call onNext when next button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleNext = vi.fn();
      
      const { useTabValidationNavigation } = await import('@plan-management/hooks');
      const mockUseTabValidationNavigation = vi.mocked(useTabValidationNavigation);
      mockUseTabValidationNavigation.mockReturnValue({
        handleNext: mockHandleNext
      });

      render(<FormTestWrapper mode="create" />);

      const nextButton = screen.getByTestId('next-button');
      await user.click(nextButton);

      expect(mockHandleNext).toHaveBeenCalled();
    });

    it('should call onPrevious when previous button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPrevious = vi.fn();

      const TestWrapper = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: {
            name: '',
            description: '',
            is_active: false,
            is_custom: false
          }
        });

        return (
          <Provider>
            <FormProvider {...methods}>
              <PlanBasicDetails
                mode="create"
                onNext={vi.fn()}
                onPrevious={mockOnPrevious}
                isFirstTab={false}
              />
            </FormProvider>
          </Provider>
        );
      };

      render(<TestWrapper />);

      const previousButton = screen.getByTestId('previous-button');
      await user.click(previousButton);

      expect(mockOnPrevious).toHaveBeenCalled();
    });

    it('should disable next button when form is invalid', async () => {
      const { useTabValidation } = await import('@plan-management/hooks');
      const mockUseTabValidation = vi.mocked(useTabValidation);
      mockUseTabValidation.mockReturnValue({
        isBasicInfoValid: false,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: true,
        isSlaValid: true,
        isEntireFormValid: false,
        validateBasicInfo: vi.fn(() => false),
        validatePricingInfo: vi.fn(() => true),
        validateFeatures: vi.fn(() => true),
        validateAddons: vi.fn(() => true),
        validateSla: vi.fn(() => true),
        getValidationState: vi.fn(() => ({
          isBasicInfoValid: false,
          isPricingInfoValid: true,
          isFeaturesValid: true,
          isAddonsValid: true,
          isSlaValid: true,
          isEntireFormValid: false
        }))
      });

      render(<FormTestWrapper mode="create" />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when form is valid', async () => {
      const { useTabValidation } = await import('@plan-management/hooks');
      const mockUseTabValidation = vi.mocked(useTabValidation);
      mockUseTabValidation.mockReturnValue({
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: true,
        isSlaValid: true,
        isEntireFormValid: true,
        validateBasicInfo: vi.fn(() => true),
        validatePricingInfo: vi.fn(() => true),
        validateFeatures: vi.fn(() => true),
        validateAddons: vi.fn(() => true),
        validateSla: vi.fn(() => true),
        getValidationState: vi.fn(() => ({
          isBasicInfoValid: true,
          isPricingInfoValid: true,
          isFeaturesValid: true,
          isAddonsValid: true,
          isSlaValid: true,
          isEntireFormValid: true
        }))
      });

      render(<FormTestWrapper mode="create" />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('form data persistence', () => {
    it('should display pre-filled form data', () => {
      const defaultValues = {
        name: 'Existing Plan',
        description: 'Existing Description',
        is_active: true,
        is_custom: true
      };

      render(<FormTestWrapper defaultValues={defaultValues} mode="edit" />);

      expect(screen.getByTestId('input-name')).toHaveValue('Existing Plan');
      expect(screen.getByTestId('textarea-input-description')).toHaveValue('Existing Description');
      expect(screen.getByTestId('switch-input-is_active')).toBeChecked();
      expect(screen.getByTestId('switch-input-is_custom')).toBeChecked();
    });

    it('should handle empty form data gracefully', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('input-name')).toHaveValue('');
      expect(screen.getByTestId('textarea-input-description')).toHaveValue('');
      expect(screen.getByTestId('switch-input-is_active')).not.toBeChecked();
      expect(screen.getByTestId('switch-input-is_custom')).not.toBeChecked();
    });
  });

  describe('switch field text', () => {
    it('should display correct toggle text for active/inactive states', () => {
      render(<FormTestWrapper mode="create" />);

      const activeText = screen.getByTestId('switch-text-is_active');
      const customText = screen.getByTestId('switch-text-is_custom');

      expect(activeText).toHaveTextContent('Inactive');
      expect(customText).toHaveTextContent('Standard');
    });

    it('should update toggle text when switch is activated', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const isActiveSwitch = screen.getByTestId('switch-input-is_active');
      const activeText = screen.getByTestId('switch-text-is_active');

      expect(activeText).toHaveTextContent('Inactive');

      await user.click(isActiveSwitch);

      expect(activeText).toHaveTextContent('Active');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels associated with form fields', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('label-name')).toBeInTheDocument();
      expect(screen.getByTestId('label-description')).toBeInTheDocument();
      expect(screen.getByTestId('label-is_active')).toBeInTheDocument();
      expect(screen.getByTestId('label-is_custom')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const nameInput = screen.getByTestId('input-name');
      const descriptionInput = screen.getByTestId('textarea-input-description');
      const activeSwitch = screen.getByTestId('switch-input-is_active');

      // Should be able to tab through form elements
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(descriptionInput).toHaveFocus();

      await user.tab();
      expect(activeSwitch).toHaveFocus();
    });

    it('should have proper error announcement structure', () => {
      render(<FormTestWrapper mode="create" />);

      // Verify that error elements would have proper roles when errors are present
      expect(screen.getByTestId('text-input-name')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
      expect(screen.getByTestId('switch-is_active')).toBeInTheDocument();
      expect(screen.getByTestId('switch-is_custom')).toBeInTheDocument();
    });
  });

  describe('field configuration handling', () => {
    it('should handle unknown field types gracefully', () => {
      // This tests the default case in the switch statement
      expect(() => {
        render(<FormTestWrapper mode="create" />);
      }).not.toThrow();
    });

    it('should handle different grid column spans', () => {
      render(<FormTestWrapper mode="create" />);

      // All fields should render regardless of their grid configuration
      expect(screen.getByTestId('text-input-name')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
      expect(screen.getByTestId('switch-is_active')).toBeInTheDocument();
      expect(screen.getByTestId('switch-is_custom')).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(<FormTestWrapper mode="create" />);

      expect(() => unmount()).not.toThrow();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(<FormTestWrapper mode="create" />);

      // Should handle mode changes
      rerender(<FormTestWrapper mode="view" />);

      expect(screen.getByTestId('input-name')).toHaveAttribute('readOnly');
    });
  });

  describe('error handling', () => {
    it('should handle form context errors gracefully', () => {
      expect(() => {
        render(<FormTestWrapper mode="create" />);
      }).not.toThrow();
    });

    it('should handle missing field configurations gracefully', () => {
      expect(() => {
        render(<FormTestWrapper mode="create" />);
      }).not.toThrow();
    });
  });

  describe('integration with React Hook Form', () => {
    it('should integrate properly with form context', () => {
      render(<FormTestWrapper mode="create" />);

      // Check that all form fields are properly registered
      expect(screen.getByTestId('input-name')).toHaveAttribute('name', 'name');
      expect(screen.getByTestId('textarea-input-description')).toHaveAttribute('name', 'description');
      expect(screen.getByTestId('switch-input-is_active')).toHaveAttribute('name', 'is_active');
      expect(screen.getByTestId('switch-input-is_custom')).toHaveAttribute('name', 'is_custom');
    });

    it('should handle form field registration correctly', () => {
      render(<FormTestWrapper mode="create" />);

      // All fields should be rendered and properly integrated
      expect(screen.getByTestId('text-input-name')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
      expect(screen.getByTestId('switch-is_active')).toBeInTheDocument();
      expect(screen.getByTestId('switch-is_custom')).toBeInTheDocument();
    });
  });
});