import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTabValidation } from '../use-tab-validation';
import * as planSchemas from '@plan-management/schemas/validation/plans';

// Mock the schema validation functions
vi.mock('@plan-management/schemas/validation/plans', () => ({
  basicInfoSchema: {
    parse: vi.fn()
  },
  pricingInfoSchema: {
    parse: vi.fn()
  },
  featuresInfoSchema: {
    parse: vi.fn()
  },
  addonsInfoSchema: {
    parse: vi.fn()
  },
  slaInfoSchema: {
    parse: vi.fn()
  },
  BASIC_INFO_FIELD_KEYS: ['name', 'description'],
  PRICING_INFO_FIELD_KEYS: ['base_price', 'pricing_model', 'volume_discounts'],
  FEATURES_INFO_FIELD_KEYS: ['features'],
  ADDONS_INFO_FIELD_KEYS: ['addons'],
  SLA_INFO_FIELD_KEYS: ['slas']
}));

const mockSchemas = vi.mocked(planSchemas);

describe('useTabValidation', () => {
  const mockGetValues = vi.fn();
  
  const mockFormData = {
    name: 'Test Plan',
    description: 'Test Description',
    base_price: 10,
    pricing_model: 'flat_rate' as const,
    volume_discounts: [],
    features: [1, 2],
    addons: [1],
    slas: [1]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetValues.mockReturnValue(mockFormData);
    
    // Default all schemas to pass
    mockSchemas.basicInfoSchema.parse.mockReturnValue(true);
    mockSchemas.pricingInfoSchema.parse.mockReturnValue(true);
    mockSchemas.featuresInfoSchema.parse.mockReturnValue(true);
    mockSchemas.addonsInfoSchema.parse.mockReturnValue(true);
    mockSchemas.slaInfoSchema.parse.mockReturnValue(true);
  });

  describe('initialization', () => {
    it('should initialize and validate all tabs when all are valid', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.isBasicInfoValid).toBe(true);
      expect(result.current.isPricingInfoValid).toBe(true);
      expect(result.current.isFeaturesValid).toBe(true);
      expect(result.current.isAddonsValid).toBe(true);
      expect(result.current.isSlaValid).toBe(true);
      expect(result.current.isEntireFormValid).toBe(true);
    });

    it('should call getValues when validating', () => {
      renderHook(() => useTabValidation(mockGetValues));

      expect(mockGetValues).toHaveBeenCalledTimes(5); // Once for each tab
    });
  });

  describe('basic info validation', () => {
    it('should validate basic info successfully', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validateBasicInfo();

      expect(mockSchemas.basicInfoSchema.parse).toHaveBeenCalledWith({
        name: 'Test Plan',
        description: 'Test Description'
      });
      expect(isValid).toBe(true);
    });

    it('should return false when basic info validation fails', () => {
      mockSchemas.basicInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validateBasicInfo();
      
      expect(isValid).toBe(false);
      expect(result.current.isBasicInfoValid).toBe(false);
    });

    it('should extract only basic info fields for validation', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      result.current.validateBasicInfo();

      const expectedData = {
        name: 'Test Plan',
        description: 'Test Description'
      };
      
      expect(mockSchemas.basicInfoSchema.parse).toHaveBeenCalledWith(expectedData);
    });
  });

  describe('pricing info validation', () => {
    it('should validate pricing info successfully', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validatePricingInfo();

      expect(mockSchemas.pricingInfoSchema.parse).toHaveBeenCalledWith({
        base_price: 10,
        pricing_model: 'flat_rate',
        volume_discounts: []
      });
      expect(isValid).toBe(true);
    });

    it('should return false when pricing info validation fails', () => {
      mockSchemas.pricingInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validatePricingInfo();
      
      expect(isValid).toBe(false);
      expect(result.current.isPricingInfoValid).toBe(false);
    });
  });

  describe('features validation', () => {
    it('should validate features successfully', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validateFeatures();

      expect(mockSchemas.featuresInfoSchema.parse).toHaveBeenCalledWith({
        features: [1, 2]
      });
      expect(isValid).toBe(true);
    });

    it('should return false when features validation fails', () => {
      mockSchemas.featuresInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validateFeatures();
      
      expect(isValid).toBe(false);
      expect(result.current.isFeaturesValid).toBe(false);
    });
  });

  describe('addons validation', () => {
    it('should validate addons successfully', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validateAddons();

      expect(mockSchemas.addonsInfoSchema.parse).toHaveBeenCalledWith({
        addons: [1]
      });
      expect(isValid).toBe(true);
    });

    it('should return false when addons validation fails', () => {
      mockSchemas.addonsInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validateAddons();
      
      expect(isValid).toBe(false);
      expect(result.current.isAddonsValid).toBe(false);
    });
  });

  describe('SLA validation', () => {
    it('should validate SLAs successfully', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validateSla();

      expect(mockSchemas.slaInfoSchema.parse).toHaveBeenCalledWith({
        slas: [1]
      });
      expect(isValid).toBe(true);
    });

    it('should return false when SLA validation fails', () => {
      mockSchemas.slaInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const isValid = result.current.validateSla();
      
      expect(isValid).toBe(false);
      expect(result.current.isSlaValid).toBe(false);
    });
  });

  describe('getValidationState', () => {
    it('should return current validation state for all tabs', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const validationState = result.current.getValidationState();

      expect(validationState).toEqual({
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: true,
        isSlaValid: true,
        isEntireFormValid: true
      });
    });

    it('should return false for entire form when any tab is invalid', () => {
      mockSchemas.featuresInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      const validationState = result.current.getValidationState();

      expect(validationState.isFeaturesValid).toBe(false);
      expect(validationState.isEntireFormValid).toBe(false);
    });
  });

  describe('entire form validation', () => {
    it('should return true when all tabs are valid', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.isEntireFormValid).toBe(true);
    });

    it('should return false when basic info is invalid', () => {
      mockSchemas.basicInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.isEntireFormValid).toBe(false);
    });

    it('should return false when pricing info is invalid', () => {
      mockSchemas.pricingInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.isEntireFormValid).toBe(false);
    });

    it('should return false when features are invalid', () => {
      mockSchemas.featuresInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.isEntireFormValid).toBe(false);
    });

    it('should return false when addons are invalid', () => {
      mockSchemas.addonsInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.isEntireFormValid).toBe(false);
    });

    it('should return false when SLAs are invalid', () => {
      mockSchemas.slaInfoSchema.parse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.isEntireFormValid).toBe(false);
    });
  });

  describe('form data handling', () => {
    it('should handle empty arrays in form data', () => {
      const emptyFormData = {
        name: 'Test',
        description: 'Test',
        base_price: 0,
        pricing_model: 'flat_rate' as const,
        volume_discounts: [],
        features: [],
        addons: [],
        slas: []
      };
      
      mockGetValues.mockReturnValue(emptyFormData);

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      result.current.validateFeatures();
      result.current.validateAddons();
      result.current.validateSla();

      expect(mockSchemas.featuresInfoSchema.parse).toHaveBeenCalledWith({ features: [] });
      expect(mockSchemas.addonsInfoSchema.parse).toHaveBeenCalledWith({ addons: [] });
      expect(mockSchemas.slaInfoSchema.parse).toHaveBeenCalledWith({ slas: [] });
    });

    it('should handle null values in form data', () => {
      const formDataWithNulls = {
        name: null,
        description: null,
        base_price: null,
        pricing_model: null,
        volume_discounts: null,
        features: null,
        addons: null,
        slas: null
      };
      
      mockGetValues.mockReturnValue(formDataWithNulls);

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      // Should not throw errors
      result.current.validateBasicInfo();
      result.current.validatePricingInfo();
      result.current.validateFeatures();
      result.current.validateAddons();
      result.current.validateSla();

      expect(mockSchemas.basicInfoSchema.parse).toHaveBeenCalledWith({
        name: null,
        description: null
      });
    });

    it('should handle undefined values in form data', () => {
      const formDataWithUndefined = {
        name: 'Test',
        description: 'Test',
        base_price: undefined,
        pricing_model: undefined,
        volume_discounts: undefined,
        features: undefined,
        addons: undefined,
        slas: undefined
      };
      
      mockGetValues.mockReturnValue(formDataWithUndefined);

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      // Should not throw errors
      result.current.validatePricingInfo();
      result.current.validateFeatures();

      expect(mockSchemas.pricingInfoSchema.parse).toHaveBeenCalledWith({
        base_price: undefined,
        pricing_model: undefined,
        volume_discounts: undefined
      });
    });
  });

  describe('memoization', () => {
    it('should memoize validation functions', () => {
      const { result, rerender } = renderHook(() => useTabValidation(mockGetValues));

      const initialValidators = {
        validateBasicInfo: result.current.validateBasicInfo,
        validatePricingInfo: result.current.validatePricingInfo,
        validateFeatures: result.current.validateFeatures,
        validateAddons: result.current.validateAddons,
        validateSla: result.current.validateSla,
        getValidationState: result.current.getValidationState
      };

      // Rerender with same getValues function
      rerender();

      expect(result.current.validateBasicInfo).toBe(initialValidators.validateBasicInfo);
      expect(result.current.validatePricingInfo).toBe(initialValidators.validatePricingInfo);
      expect(result.current.validateFeatures).toBe(initialValidators.validateFeatures);
      expect(result.current.validateAddons).toBe(initialValidators.validateAddons);
      expect(result.current.validateSla).toBe(initialValidators.validateSla);
      expect(result.current.getValidationState).toBe(initialValidators.getValidationState);
    });

    it('should update validators when getValues changes', () => {
      const { result, rerender } = renderHook(
        ({ getValues }) => useTabValidation(getValues),
        { initialProps: { getValues: mockGetValues } }
      );

      const initialValidator = result.current.validateBasicInfo;

      const newGetValues = vi.fn().mockReturnValue(mockFormData);
      rerender({ getValues: newGetValues });

      expect(result.current.validateBasicInfo).not.toBe(initialValidator);
    });
  });

  describe('error resilience', () => {
    it('should handle schema parse throwing non-Error objects', () => {
      mockSchemas.basicInfoSchema.parse.mockImplementation(() => {
        throw 'String error';
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.validateBasicInfo()).toBe(false);
      expect(result.current.isBasicInfoValid).toBe(false);
    });

    it('should handle schema parse throwing null', () => {
      mockSchemas.pricingInfoSchema.parse.mockImplementation(() => {
        throw null;
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.validatePricingInfo()).toBe(false);
      expect(result.current.isPricingInfoValid).toBe(false);
    });

    it('should continue validation even if one schema fails', () => {
      mockSchemas.basicInfoSchema.parse.mockImplementation(() => {
        throw new Error('Basic info failed');
      });

      const { result } = renderHook(() => useTabValidation(mockGetValues));

      expect(result.current.isBasicInfoValid).toBe(false);
      expect(result.current.isPricingInfoValid).toBe(true);
      expect(result.current.isFeaturesValid).toBe(true);
      expect(result.current.isAddonsValid).toBe(true);
      expect(result.current.isSlaValid).toBe(true);
      expect(result.current.isEntireFormValid).toBe(false);
    });
  });

  describe('field key constants', () => {
    it('should use correct field keys for basic info', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      result.current.validateBasicInfo();

      // Should only extract the fields defined in BASIC_INFO_FIELD_KEYS
      expect(mockSchemas.basicInfoSchema.parse).toHaveBeenCalledWith({
        name: mockFormData.name,
        description: mockFormData.description
      });
    });

    it('should use correct field keys for pricing info', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      result.current.validatePricingInfo();

      expect(mockSchemas.pricingInfoSchema.parse).toHaveBeenCalledWith({
        base_price: mockFormData.base_price,
        pricing_model: mockFormData.pricing_model,
        volume_discounts: mockFormData.volume_discounts
      });
    });

    it('should use correct field keys for each resource type', () => {
      const { result } = renderHook(() => useTabValidation(mockGetValues));

      result.current.validateFeatures();
      result.current.validateAddons();
      result.current.validateSla();

      expect(mockSchemas.featuresInfoSchema.parse).toHaveBeenCalledWith({
        features: mockFormData.features
      });
      expect(mockSchemas.addonsInfoSchema.parse).toHaveBeenCalledWith({
        addons: mockFormData.addons
      });
      expect(mockSchemas.slaInfoSchema.parse).toHaveBeenCalledWith({
        slas: mockFormData.slas
      });
    });
  });
});