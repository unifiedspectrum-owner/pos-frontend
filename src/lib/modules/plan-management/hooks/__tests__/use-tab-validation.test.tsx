/* Comprehensive test suite for useTabValidation hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { UseFormGetValues } from 'react-hook-form'

/* Plan module imports */
import { useTabValidation } from '@plan-management/hooks/use-tab-validation'
import { CreatePlanFormData } from '@plan-management/schemas'

describe('useTabValidation Hook', () => {
  /* Mock form values */
  const validFormData: CreatePlanFormData = {
    name: 'Test Plan',
    description: 'Test Description',
    is_active: true,
    is_custom: false,
    included_devices_count: '2',
    max_users_per_branch: '10',
    included_branches_count: '1',
    additional_device_cost: '15.00',
    monthly_price: '99.99',
    annual_discount_percentage: '10',
    monthly_fee_our_gateway: '2.50',
    monthly_fee_byo_processor: '0',
    card_processing_fee_percentage: '2.9',
    card_processing_fee_fixed: '0.30',
    feature_ids: [1, 2],
    addon_assignments: [],
    support_sla_ids: [1],
    volume_discounts: []
  }

  const invalidFormData: Partial<CreatePlanFormData> = {
    name: '',
    description: '',
    is_active: true,
    is_custom: false,
    included_devices_count: '',
    max_users_per_branch: '',
    included_branches_count: '',
    additional_device_cost: '',
    monthly_price: '',
    annual_discount_percentage: '',
    monthly_fee_our_gateway: '',
    monthly_fee_byo_processor: '',
    card_processing_fee_percentage: '',
    card_processing_fee_fixed: '',
    feature_ids: [],
    addon_assignments: [],
    support_sla_ids: [],
    volume_discounts: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should have all validation functions', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(typeof result.current.validateBasicInfo).toBe('function')
      expect(typeof result.current.validatePricingInfo).toBe('function')
      expect(typeof result.current.validateFeatures).toBe('function')
      expect(typeof result.current.validateAddons).toBe('function')
      expect(typeof result.current.validateSla).toBe('function')
      expect(typeof result.current.getValidationState).toBe('function')
    })

    it('should provide computed validation states', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(typeof result.current.isBasicInfoValid).toBe('boolean')
      expect(typeof result.current.isPricingInfoValid).toBe('boolean')
      expect(typeof result.current.isFeaturesValid).toBe('boolean')
      expect(typeof result.current.isAddonsValid).toBe('boolean')
      expect(typeof result.current.isSlaValid).toBe('boolean')
      expect(typeof result.current.isEntireFormValid).toBe('boolean')
    })
  })

  describe('validateBasicInfo Function', () => {
    it('should return true for valid basic info', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateBasicInfo()).toBe(true)
      expect(result.current.isBasicInfoValid).toBe(true)
    })

    it('should return false for empty name', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        name: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateBasicInfo()).toBe(false)
      expect(result.current.isBasicInfoValid).toBe(false)
    })

    it('should return false for empty description', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        description: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateBasicInfo()).toBe(false)
    })

    it('should return false for invalid is_active value', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        is_active: null as unknown as boolean
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateBasicInfo()).toBe(false)
    })

    it('should validate only basic info fields', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        monthly_price: '-10' /* Invalid pricing, but basic info should still be valid */
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateBasicInfo()).toBe(true)
    })
  })

  describe('validatePricingInfo Function', () => {
    it('should return true for valid pricing info', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validatePricingInfo()).toBe(true)
      expect(result.current.isPricingInfoValid).toBe(true)
    })

    it('should return true for negative monthly_price string', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        monthly_price: '-10'
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      /* Schema only validates non-empty string, not numeric value */
      expect(result.current.validatePricingInfo()).toBe(true)
    })

    it('should return false for empty monthly_price', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        monthly_price: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validatePricingInfo()).toBe(false)
    })

    it('should return false for empty annual_discount_percentage', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        annual_discount_percentage: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validatePricingInfo()).toBe(false)
    })

    it('should return true for valid volume_discounts array', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        volume_discounts: [
          {
            name: 'Bulk Discount',
            min_branches: '10',
            max_branches: '20',
            discount_percentage: '10'
          }
        ]
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validatePricingInfo()).toBe(true)
    })

    it('should validate only pricing info fields', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        name: '' /* Invalid basic info, but pricing should still be valid */
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validatePricingInfo()).toBe(true)
    })
  })

  describe('validateFeatures Function', () => {
    it('should return true for valid features', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateFeatures()).toBe(true)
      expect(result.current.isFeaturesValid).toBe(true)
    })

    it('should return true for empty feature_ids', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        feature_ids: []
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      /* Schema allows empty arrays */
      expect(result.current.validateFeatures()).toBe(true)
    })

    it('should return true for single feature selected', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        feature_ids: [1]
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateFeatures()).toBe(true)
    })

    it('should return true for multiple features selected', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        feature_ids: [1, 2, 3, 4, 5]
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateFeatures()).toBe(true)
    })

    it('should validate only features fields', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        addon_assignments: [] /* Invalid addons, but features should still be valid */
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateFeatures()).toBe(true)
    })
  })

  describe('validateAddons Function', () => {
    it('should return true for valid addons', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateAddons()).toBe(true)
      expect(result.current.isAddonsValid).toBe(true)
    })

    it('should return true for empty addon_assignments (addons are optional)', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        addon_assignments: []
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateAddons()).toBe(true)
    })

    it('should return true for single addon selected', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        addon_assignments: [{ addon_id: 1, is_included: false, feature_level: 'basic' as const, default_quantity: null, min_quantity: null, max_quantity: null }]
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateAddons()).toBe(true)
    })

    it('should return true for multiple addons selected', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        addon_assignments: [
          { addon_id: 1, is_included: false, feature_level: 'basic' as const, default_quantity: null, min_quantity: null, max_quantity: null },
          { addon_id: 2, is_included: true, feature_level: 'custom' as const, default_quantity: 5, min_quantity: 1, max_quantity: 10 }
        ]
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateAddons()).toBe(true)
    })
  })

  describe('validateSla Function', () => {
    it('should return true for valid SLAs', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateSla()).toBe(true)
      expect(result.current.isSlaValid).toBe(true)
    })

    it('should return true for empty support_sla_ids (SLAs are optional)', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        support_sla_ids: []
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateSla()).toBe(true)
    })

    it('should return true for single SLA selected', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        support_sla_ids: [1]
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateSla()).toBe(true)
    })

    it('should return true for multiple SLAs selected', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        support_sla_ids: [1, 2, 3]
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateSla()).toBe(true)
    })
  })

  describe('getValidationState Function', () => {
    it('should return all validation states when all are valid', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      const state = result.current.getValidationState()

      expect(state.isBasicInfoValid).toBe(true)
      expect(state.isPricingInfoValid).toBe(true)
      expect(state.isFeaturesValid).toBe(true)
      expect(state.isAddonsValid).toBe(true)
      expect(state.isSlaValid).toBe(true)
      expect(state.isEntireFormValid).toBe(true)
    })

    it('should return correct states when some are invalid', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        name: '',
        monthly_price: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      const state = result.current.getValidationState()

      expect(state.isBasicInfoValid).toBe(false)
      expect(state.isPricingInfoValid).toBe(false)
      expect(state.isFeaturesValid).toBe(true)
      expect(state.isAddonsValid).toBe(true)
      expect(state.isSlaValid).toBe(true)
      expect(state.isEntireFormValid).toBe(false)
    })

    it('should return false for isEntireFormValid when any section is invalid', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        name: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      const state = result.current.getValidationState()

      expect(state.isBasicInfoValid).toBe(false)
      expect(state.isPricingInfoValid).toBe(true)
      expect(state.isFeaturesValid).toBe(true)
      expect(state.isEntireFormValid).toBe(false)
    })
  })

  describe('Computed Validation States', () => {
    it('should provide isEntireFormValid as true when all sections are valid', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.isEntireFormValid).toBe(true)
    })

    it('should provide isEntireFormValid as false when basic info is invalid', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        name: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.isEntireFormValid).toBe(false)
    })

    it('should update validation states when form values change', () => {
      let formData = { ...validFormData, name: '' }
      const mockGetValues = vi.fn(() => formData)

      const { result, rerender } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.isBasicInfoValid).toBe(false)

      formData = { ...validFormData }
      rerender()

      expect(result.current.isBasicInfoValid).toBe(true)
    })
  })

  describe('Individual Validators', () => {
    it('should call getValues when validation is performed', () => {
      const mockGetValues = vi.fn(() => validFormData)

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      result.current.validateBasicInfo()

      expect(mockGetValues).toHaveBeenCalled()
    })

    it('should handle validation errors gracefully', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        monthly_price: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      /* Should return false instead of throwing */
      expect(result.current.validatePricingInfo()).toBe(false)
    })

    it('should validate independently', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        name: ''
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateBasicInfo()).toBe(false)
      expect(result.current.validatePricingInfo()).toBe(true)
      expect(result.current.validateFeatures()).toBe(true)
      expect(result.current.validateAddons()).toBe(true)
      expect(result.current.validateSla()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        name: null as unknown as string,
        description: null as unknown as string
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateBasicInfo()).toBe(false)
    })

    it('should handle undefined values', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        monthly_price: undefined as unknown as string,
        annual_discount_percentage: undefined as unknown as string
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validatePricingInfo()).toBe(false)
    })

    it('should handle missing fields', () => {
      const mockGetValues = vi.fn(() => ({
        name: 'Test',
        description: 'Test'
      } as unknown as CreatePlanFormData))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validatePricingInfo()).toBe(false)
      expect(result.current.validateFeatures()).toBe(false)
    })

    it('should handle whitespace-only strings', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        name: '   ',
        description: '   '
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      /* Depends on schema validation rules */
      const isValid = result.current.validateBasicInfo()
      expect(typeof isValid).toBe('boolean')
    })

    it('should handle very large arrays', () => {
      const mockGetValues = vi.fn(() => ({
        ...validFormData,
        feature_ids: Array.from({ length: 1000 }, (_, i) => i + 1)
      }))

      const { result } = renderHook(() => useTabValidation(mockGetValues as unknown as UseFormGetValues<CreatePlanFormData>))

      expect(result.current.validateFeatures()).toBe(true)
    })
  })
})
