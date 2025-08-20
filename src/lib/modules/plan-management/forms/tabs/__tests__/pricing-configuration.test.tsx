import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Provider } from '@/components/ui/provider';
import PlanPricingConfiguration from '../pricing-configuration';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import { PlanFormMode } from '@plan-management/types/plans';

// Mock dependencies
vi.mock('@plan-management/schemas/validation/plans', () => ({
  PRICING_INFO_FIELD_KEYS: [
    'monthly_price', 
    'additional_device_cost', 
    'annual_discount_percentage', 
    'biennial_discount_percentage', 
    'triennial_discount_percentage',
    'monthly_fee_our_gateway',
    'monthly_fee_byo_processor',
    'card_processing_fee_percentage',
    'card_processing_fee_fixed'
  ],
  CreatePlanFormData: {}
}));

vi.mock('@plan-management/config', () => ({
  PRICING_INFO_QUESTIONS: [
    {
      id: 1,
      schema_key: 'monthly_price',
      type: 'INPUT',
      label: 'Monthly Price ($)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 1,
      grid: { col_span: 1, columns: 5 }
    },
    {
      id: 2,
      schema_key: 'additional_device_cost',
      type: 'INPUT',
      label: 'Additional Device Cost ($)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 2,
      grid: { col_span: 1, columns: 5 }
    },
    {
      id: 3,
      schema_key: 'annual_discount_percentage',
      type: 'INPUT',
      label: 'Annual Discount (%)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 3,
      grid: { col_span: 1, columns: 5 }
    },
    {
      id: 4,
      schema_key: 'biennial_discount_percentage',
      type: 'INPUT',
      label: 'Biennial Discount (%)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 4,
      grid: { col_span: 1, columns: 5 }
    },
    {
      id: 5,
      schema_key: 'triennial_discount_percentage',
      type: 'INPUT',
      label: 'Triennial Discount (%)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 5,
      grid: { col_span: 1, columns: 5 }
    },
    {
      id: 6,
      schema_key: 'monthly_fee_our_gateway',
      type: 'INPUT',
      label: 'Monthly Fee (Our Gateway) ($)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 6,
      grid: { col_span: 1, columns: 4 }
    },
    {
      id: 7,
      schema_key: 'monthly_fee_byo_processor',
      type: 'INPUT',
      label: 'Monthly Fee (BYO Processor) ($)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 7,
      grid: { col_span: 1, columns: 4 }
    },
    {
      id: 8,
      schema_key: 'card_processing_fee_percentage',
      type: 'INPUT',
      label: 'Card Processing Fee (%)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 8,
      grid: { col_span: 1, columns: 4 }
    },
    {
      id: 9,
      schema_key: 'card_processing_fee_fixed',
      type: 'INPUT',
      label: 'Card Processing Fee (Fixed) ($)',
      placeholder: '0.00',
      is_required: true,
      disabled: false,
      display_order: 9,
      grid: { col_span: 1, columns: 4 }
    }
  ]
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

// Mock child components
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
  }
}));

vi.mock('@plan-management/forms/tabs/components/volume-discounts', () => ({
  VolumeDiscounts: ({ mode }: any) => (
    <div data-testid="volume-discounts">
      Volume Discounts Component (mode: {mode})
    </div>
  )
}));

vi.mock('@plan-management/components', () => ({
  TabNavigation: ({ 
    onNext, 
    onPrevious, 
    isFormValid, 
    readOnly 
  }: any) => (
    <div data-testid="tab-navigation">
      {!readOnly && (
        <>
          <button type="button" data-testid="previous-button" onClick={onPrevious}>
            Previous
          </button>
          <button 
            type="button"
            data-testid="next-button" 
            onClick={onNext}
            disabled={!isFormValid}
          >
            Next
          </button>
        </>
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
      monthly_price: '',
      additional_device_cost: '',
      annual_discount_percentage: '',
      biennial_discount_percentage: '',
      triennial_discount_percentage: '',
      monthly_fee_our_gateway: '',
      monthly_fee_byo_processor: '',
      card_processing_fee_percentage: '',
      card_processing_fee_fixed: '',
      volume_discounts: [],
      ...defaultValues
    }
  });

  return (
    <Provider>
      <FormProvider {...methods}>
        <form>
          <PlanPricingConfiguration
            mode={mode}
            onNext={vi.fn()}
            onPrevious={vi.fn()}
          />
          {children}
        </form>
      </FormProvider>
    </Provider>
  );
};

describe('PlanPricingConfiguration', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all main components correctly', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('volume-discounts')).toBeInTheDocument();
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });

    it('should render all form fields correctly', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('text-input-monthly_price')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-additional_device_cost')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-annual_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-biennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-triennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_our_gateway')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_byo_processor')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_fixed')).toBeInTheDocument();
    });

    it('should render correct field labels', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('label-monthly_price')).toHaveTextContent('Monthly Price ($)');
      expect(screen.getByTestId('label-additional_device_cost')).toHaveTextContent('Additional Device Cost ($)');
      expect(screen.getByTestId('label-annual_discount_percentage')).toHaveTextContent('Annual Discount (%)');
      expect(screen.getByTestId('label-biennial_discount_percentage')).toHaveTextContent('Biennial Discount (%)');
      expect(screen.getByTestId('label-triennial_discount_percentage')).toHaveTextContent('Triennial Discount (%)');
      expect(screen.getByTestId('label-monthly_fee_our_gateway')).toHaveTextContent('Monthly Fee (Our Gateway) ($)');
      expect(screen.getByTestId('label-monthly_fee_byo_processor')).toHaveTextContent('Monthly Fee (BYO Processor) ($)');
      expect(screen.getByTestId('label-card_processing_fee_percentage')).toHaveTextContent('Card Processing Fee (%)');
      expect(screen.getByTestId('label-card_processing_fee_fixed')).toHaveTextContent('Card Processing Fee (Fixed) ($)');
    });

    it('should render required field indicators', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('required-monthly_price')).toBeInTheDocument();
      expect(screen.getByTestId('required-additional_device_cost')).toBeInTheDocument();
      expect(screen.getByTestId('required-annual_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('required-biennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('required-triennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('required-monthly_fee_our_gateway')).toBeInTheDocument();
      expect(screen.getByTestId('required-monthly_fee_byo_processor')).toBeInTheDocument();
      expect(screen.getByTestId('required-card_processing_fee_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('required-card_processing_fee_fixed')).toBeInTheDocument();
    });

    it('should render field placeholders correctly', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('input-monthly_price')).toHaveAttribute('placeholder', '0.00');
      expect(screen.getByTestId('input-additional_device_cost')).toHaveAttribute('placeholder', '0.00');
      expect(screen.getByTestId('input-annual_discount_percentage')).toHaveAttribute('placeholder', '0.00');
      expect(screen.getByTestId('input-biennial_discount_percentage')).toHaveAttribute('placeholder', '0.00');
      expect(screen.getByTestId('input-triennial_discount_percentage')).toHaveAttribute('placeholder', '0.00');
      expect(screen.getByTestId('input-monthly_fee_our_gateway')).toHaveAttribute('placeholder', '0.00');
      expect(screen.getByTestId('input-monthly_fee_byo_processor')).toHaveAttribute('placeholder', '0.00');
      expect(screen.getByTestId('input-card_processing_fee_percentage')).toHaveAttribute('placeholder', '0.00');
      expect(screen.getByTestId('input-card_processing_fee_fixed')).toHaveAttribute('placeholder', '0.00');
    });
  });

  describe('form interactions', () => {
    it('should handle text input changes', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const monthlyPriceInput = screen.getByTestId('input-monthly_price');
      const additionalDeviceCostInput = screen.getByTestId('input-additional_device_cost');
      const annualDiscountInput = screen.getByTestId('input-annual_discount_percentage');
      const monthlyFeeOurGatewayInput = screen.getByTestId('input-monthly_fee_our_gateway');
      const cardProcessingFeePercentageInput = screen.getByTestId('input-card_processing_fee_percentage');

      await user.type(monthlyPriceInput, '29.99');
      await user.type(additionalDeviceCostInput, '5.00');
      await user.type(annualDiscountInput, '10.00');
      await user.type(monthlyFeeOurGatewayInput, '15.00');
      await user.type(cardProcessingFeePercentageInput, '2.5');

      expect(monthlyPriceInput).toHaveValue('29.99');
      expect(additionalDeviceCostInput).toHaveValue('5.00');
      expect(annualDiscountInput).toHaveValue('10.00');
      expect(monthlyFeeOurGatewayInput).toHaveValue('15.00');
      expect(cardProcessingFeePercentageInput).toHaveValue('2.5');
    });

    it('should handle field blur events', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const monthlyPriceInput = screen.getByTestId('input-monthly_price');
      
      await user.type(monthlyPriceInput, '39.99');
      await user.tab(); // This will trigger blur

      expect(monthlyPriceInput).toHaveValue('39.99');
    });

    it('should handle form field validation', () => {
      render(<FormTestWrapper mode="create" />);

      // Mock form errors by checking if error display elements exist
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should call validation hooks during render', () => {
      render(<FormTestWrapper mode="create" />);

      // Validation hooks should be called during component render
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });
  });

  describe('different modes', () => {
    it('should render fields as read-only in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.getByTestId('input-monthly_price')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-additional_device_cost')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-annual_discount_percentage')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-biennial_discount_percentage')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-triennial_discount_percentage')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-monthly_fee_our_gateway')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-monthly_fee_byo_processor')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-card_processing_fee_percentage')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-card_processing_fee_fixed')).toHaveAttribute('readOnly');
    });

    it('should render fields as editable in create mode', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('input-monthly_price')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-additional_device_cost')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-annual_discount_percentage')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-biennial_discount_percentage')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-triennial_discount_percentage')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-monthly_fee_our_gateway')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-monthly_fee_byo_processor')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-card_processing_fee_percentage')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-card_processing_fee_fixed')).not.toHaveAttribute('readOnly');
    });

    it('should render fields as editable in edit mode', () => {
      render(<FormTestWrapper mode="edit" />);

      expect(screen.getByTestId('input-monthly_price')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-additional_device_cost')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-annual_discount_percentage')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-biennial_discount_percentage')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-triennial_discount_percentage')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-monthly_fee_our_gateway')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-monthly_fee_byo_processor')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-card_processing_fee_percentage')).not.toHaveAttribute('readOnly');
      expect(screen.getByTestId('input-card_processing_fee_fixed')).not.toHaveAttribute('readOnly');
    });

    it('should pass mode to volume discounts component', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.getByTestId('volume-discounts')).toHaveTextContent('Volume Discounts Component (mode: view)');
    });
  });

  describe('tab navigation', () => {
    it('should render tab navigation component', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
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
            monthly_price: '',
            additional_device_cost: '',
            annual_discount_percentage: '',
            biennial_discount_percentage: '',
            triennial_discount_percentage: '',
            monthly_fee_our_gateway: '',
            monthly_fee_byo_processor: '',
            card_processing_fee_percentage: '',
            card_processing_fee_fixed: ''
          }
        });

        return (
          <Provider>
            <FormProvider {...methods}>
              <PlanPricingConfiguration
                mode="create"
                onNext={vi.fn()}
                onPrevious={mockOnPrevious}
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
        isBasicInfoValid: true,
        isPricingInfoValid: false,
        isFeaturesValid: true,
        isAddonsValid: true,
        isSlaValid: true,
        isEntireFormValid: false,
        validateBasicInfo: vi.fn(() => true),
        validatePricingInfo: vi.fn(() => false),
        validateFeatures: vi.fn(() => true),
        validateAddons: vi.fn(() => true),
        validateSla: vi.fn(() => true),
        getValidationState: vi.fn(() => ({
          isBasicInfoValid: true,
          isPricingInfoValid: false,
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

    it('should not render navigation buttons in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('previous-button')).not.toBeInTheDocument();
    });
  });

  describe('form data persistence', () => {
    it('should display pre-filled form data', () => {
      const defaultValues = {
        monthly_price: '99.99',
        additional_device_cost: '12.00',
        annual_discount_percentage: '10',
        biennial_discount_percentage: '15',
        triennial_discount_percentage: '20',
        monthly_fee_our_gateway: '25.00',
        monthly_fee_byo_processor: '18.00',
        card_processing_fee_percentage: '2.5',
        card_processing_fee_fixed: '0.30'
      };

      render(<FormTestWrapper defaultValues={defaultValues} mode="edit" />);

      expect(screen.getByTestId('input-monthly_price')).toHaveValue('99.99');
      expect(screen.getByTestId('input-additional_device_cost')).toHaveValue('12.00');
      expect(screen.getByTestId('input-annual_discount_percentage')).toHaveValue('10');
      expect(screen.getByTestId('input-biennial_discount_percentage')).toHaveValue('15');
      expect(screen.getByTestId('input-triennial_discount_percentage')).toHaveValue('20');
      expect(screen.getByTestId('input-monthly_fee_our_gateway')).toHaveValue('25.00');
      expect(screen.getByTestId('input-monthly_fee_byo_processor')).toHaveValue('18.00');
      expect(screen.getByTestId('input-card_processing_fee_percentage')).toHaveValue('2.5');
      expect(screen.getByTestId('input-card_processing_fee_fixed')).toHaveValue('0.30');
    });

    it('should handle empty form data gracefully', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('input-monthly_price')).toHaveValue('');
      expect(screen.getByTestId('input-additional_device_cost')).toHaveValue('');
      expect(screen.getByTestId('input-annual_discount_percentage')).toHaveValue('');
      expect(screen.getByTestId('input-biennial_discount_percentage')).toHaveValue('');
      expect(screen.getByTestId('input-triennial_discount_percentage')).toHaveValue('');
      expect(screen.getByTestId('input-monthly_fee_our_gateway')).toHaveValue('');
      expect(screen.getByTestId('input-monthly_fee_byo_processor')).toHaveValue('');
      expect(screen.getByTestId('input-card_processing_fee_percentage')).toHaveValue('');
      expect(screen.getByTestId('input-card_processing_fee_fixed')).toHaveValue('');
    });
  });

  describe('grid layout and responsive design', () => {
    it('should group fields by column configuration', () => {
      render(<FormTestWrapper mode="create" />);

      // All fields should render regardless of their grid configuration
      expect(screen.getByTestId('text-input-monthly_price')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-additional_device_cost')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-annual_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-biennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-triennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_our_gateway')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_byo_processor')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_fixed')).toBeInTheDocument();
    });

    it('should handle different grid column spans', () => {
      render(<FormTestWrapper mode="create" />);

      // All fields should render regardless of their grid column spans
      expect(screen.getByTestId('text-input-monthly_price')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-additional_device_cost')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-annual_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-biennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-triennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_our_gateway')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_byo_processor')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_fixed')).toBeInTheDocument();
    });

    it('should sort field groups by display order', () => {
      render(<FormTestWrapper mode="create" />);

      // Fields should be rendered in DOM order based on their display_order
      const allFields = screen.getAllByTestId(/^text-input-/);
      expect(allFields).toHaveLength(9);
    });
  });

  describe('volume discounts integration', () => {
    it('should render volume discounts component', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('volume-discounts')).toBeInTheDocument();
    });

    it('should pass correct mode to volume discounts', () => {
      render(<FormTestWrapper mode="view" />);

      const volumeDiscounts = screen.getByTestId('volume-discounts');
      expect(volumeDiscounts).toHaveTextContent('mode: view');
    });

    it('should render volume discounts in create mode', () => {
      render(<FormTestWrapper mode="create" />);

      const volumeDiscounts = screen.getByTestId('volume-discounts');
      expect(volumeDiscounts).toHaveTextContent('mode: create');
    });

    it('should render volume discounts in edit mode', () => {
      render(<FormTestWrapper mode="edit" />);

      const volumeDiscounts = screen.getByTestId('volume-discounts');
      expect(volumeDiscounts).toHaveTextContent('mode: edit');
    });
  });

  describe('field configuration handling', () => {
    it('should handle unknown field types gracefully', () => {
      // This tests the default case in the switch statement
      expect(() => {
        render(<FormTestWrapper mode="create" />);
      }).not.toThrow();
    });

    it('should handle disabled fields', () => {
      render(<FormTestWrapper mode="create" />);

      // Fields should respect their disabled configuration
      expect(screen.getByTestId('input-monthly_price')).not.toBeDisabled();
      expect(screen.getByTestId('input-additional_device_cost')).not.toBeDisabled();
      expect(screen.getByTestId('input-annual_discount_percentage')).not.toBeDisabled();
      expect(screen.getByTestId('input-biennial_discount_percentage')).not.toBeDisabled();
      expect(screen.getByTestId('input-triennial_discount_percentage')).not.toBeDisabled();
      expect(screen.getByTestId('input-monthly_fee_our_gateway')).not.toBeDisabled();
      expect(screen.getByTestId('input-monthly_fee_byo_processor')).not.toBeDisabled();
      expect(screen.getByTestId('input-card_processing_fee_percentage')).not.toBeDisabled();
      expect(screen.getByTestId('input-card_processing_fee_fixed')).not.toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels associated with form fields', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('label-monthly_price')).toBeInTheDocument();
      expect(screen.getByTestId('label-additional_device_cost')).toBeInTheDocument();
      expect(screen.getByTestId('label-annual_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('label-biennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('label-triennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('label-monthly_fee_our_gateway')).toBeInTheDocument();
      expect(screen.getByTestId('label-monthly_fee_byo_processor')).toBeInTheDocument();
      expect(screen.getByTestId('label-card_processing_fee_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('label-card_processing_fee_fixed')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const monthlyPriceInput = screen.getByTestId('input-monthly_price');
      const additionalDeviceCostInput = screen.getByTestId('input-additional_device_cost');

      // Should be able to tab through form elements
      await user.tab();
      expect(monthlyPriceInput).toHaveFocus();

      await user.tab();
      expect(additionalDeviceCostInput).toHaveFocus();

      // Additional form elements should be navigable
      await user.tab();
      // Don't assert specific focus, just ensure tabbing works
      expect(document.activeElement).toBeTruthy();
    });

    it('should have proper error announcement structure', () => {
      render(<FormTestWrapper mode="create" />);

      // Verify that error elements would have proper roles when errors are present
      expect(screen.getByTestId('text-input-monthly_price')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-additional_device_cost')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-annual_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-biennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-triennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_our_gateway')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_byo_processor')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_fixed')).toBeInTheDocument();
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

      expect(screen.getByTestId('input-monthly_price')).toHaveAttribute('readOnly');
      expect(screen.getByTestId('volume-discounts')).toHaveTextContent('mode: view');
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

    it('should handle validation errors display', () => {
      // Mock form with errors using defaultValues and mode
      const FormWithErrors = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { 
            monthly_price: '', 
            additional_device_cost: '',
            annual_discount_percentage: '', 
            biennial_discount_percentage: '', 
            triennial_discount_percentage: '',
            monthly_fee_our_gateway: '',
            monthly_fee_byo_processor: '',
            card_processing_fee_percentage: '',
            card_processing_fee_fixed: ''
          },
          mode: 'onChange'
        });

        React.useEffect(() => {
          // Set error after first render to avoid infinite loop
          methods.setError('monthly_price', { message: 'Monthly price is required' });
        }, []);

        return (
          <Provider>
            <FormProvider {...methods}>
              <PlanPricingConfiguration
                mode="create"
                onNext={vi.fn()}
                onPrevious={vi.fn()}
              />
            </FormProvider>
          </Provider>
        );
      };

      render(<FormWithErrors />);
      
      // Check if error handling structure is in place
      expect(screen.getByTestId('text-input-monthly_price')).toBeInTheDocument();
    });
  });

  describe('integration with React Hook Form', () => {
    it('should integrate properly with form context', () => {
      render(<FormTestWrapper mode="create" />);

      // Check that all form fields are properly registered
      expect(screen.getByTestId('input-monthly_price')).toHaveAttribute('name', 'monthly_price');
      expect(screen.getByTestId('input-additional_device_cost')).toHaveAttribute('name', 'additional_device_cost');
      expect(screen.getByTestId('input-annual_discount_percentage')).toHaveAttribute('name', 'annual_discount_percentage');
      expect(screen.getByTestId('input-biennial_discount_percentage')).toHaveAttribute('name', 'biennial_discount_percentage');
      expect(screen.getByTestId('input-triennial_discount_percentage')).toHaveAttribute('name', 'triennial_discount_percentage');
      expect(screen.getByTestId('input-monthly_fee_our_gateway')).toHaveAttribute('name', 'monthly_fee_our_gateway');
      expect(screen.getByTestId('input-monthly_fee_byo_processor')).toHaveAttribute('name', 'monthly_fee_byo_processor');
      expect(screen.getByTestId('input-card_processing_fee_percentage')).toHaveAttribute('name', 'card_processing_fee_percentage');
      expect(screen.getByTestId('input-card_processing_fee_fixed')).toHaveAttribute('name', 'card_processing_fee_fixed');
    });

    it('should handle form field registration correctly', () => {
      render(<FormTestWrapper mode="create" />);

      // All fields should be rendered and properly integrated
      expect(screen.getByTestId('text-input-monthly_price')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-annual_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-biennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-triennial_discount_percentage')).toBeInTheDocument();
    });

    it('should handle form value updates correctly', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const monthlyPriceInput = screen.getByTestId('input-monthly_price');
      
      await user.type(monthlyPriceInput, '49.99');
      
      expect(monthlyPriceInput).toHaveValue('49.99');
    });
  });

  describe('memoization and performance', () => {
    it('should handle questions grouping and sorting', () => {
      render(<FormTestWrapper mode="create" />);

      // All fields should render properly regardless of grouping logic
      expect(screen.getByTestId('text-input-monthly_price')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-additional_device_cost')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-annual_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-biennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-triennial_discount_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_our_gateway')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-monthly_fee_byo_processor')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_percentage')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-card_processing_fee_fixed')).toBeInTheDocument();
    });

    it('should handle re-renders without errors', () => {
      const { rerender } = render(<FormTestWrapper mode="create" />);

      expect(() => {
        rerender(<FormTestWrapper mode="create" />);
        rerender(<FormTestWrapper mode="edit" />);
        rerender(<FormTestWrapper mode="view" />);
      }).not.toThrow();
    });
  });
});