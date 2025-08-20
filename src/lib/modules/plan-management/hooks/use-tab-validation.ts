import { useCallback } from 'react';
import { UseFormGetValues } from 'react-hook-form';
import { 
  CreatePlanFormData, 
  basicInfoSchema, 
  pricingInfoSchema, 
  featuresInfoSchema, 
  addonsInfoSchema, 
  slaInfoSchema,
  BASIC_INFO_FIELD_KEYS,
  PRICING_INFO_FIELD_KEYS,
  FEATURES_INFO_FIELD_KEYS,
  ADDONS_INFO_FIELD_KEYS,
  SLA_INFO_FIELD_KEYS,
  BasicInfoFormData,
  PricingInfoFormData,
  FeaturesInfoFormData,
  AddonsInfoFormData,
  SlaInfoFormData
} from '@plan-management/schemas/validation/plans';

/* Hook for on-demand tab validation using getValues() - no reactive watching */
export const useTabValidation = (
  getValues: UseFormGetValues<CreatePlanFormData>
) => {

  /* On-demand validation functions - only called when needed */
  const validateBasicInfo = useCallback((): boolean => {
    try {
      const currentValues = getValues()
      
      /* Create a new object containing only the basic info fields */
      const basicData = BASIC_INFO_FIELD_KEYS.reduce((acc, key) => {
        acc[key] = currentValues[key];
        return acc;
      }, {} as Record<keyof BasicInfoFormData, string | boolean | number | null>);
      
      basicInfoSchema.parse(basicData);
      return true
    } catch {
      return false
    }
  }, [getValues])

  const validatePricingInfo = useCallback((): boolean => {
    try {
      const currentValues = getValues()
      
      /* Create a new object containing only the pricing info fields */
      const pricingData = PRICING_INFO_FIELD_KEYS.reduce((acc, key) => {
        acc[key] = currentValues[key];
        return acc;
      }, {} as Record<keyof PricingInfoFormData, unknown>);
      
      pricingInfoSchema.parse(pricingData)
      return true
    } catch {
      return false
    }
  }, [getValues])

  const validateFeatures = useCallback((): boolean => {
    try {
      const currentValues = getValues()
      
      /* Create a new object containing only the features info fields */
      const featuresData = FEATURES_INFO_FIELD_KEYS.reduce((acc, key) => {
        acc[key] = currentValues[key];
        return acc;
      }, {} as Record<keyof FeaturesInfoFormData, number[]>);
      
      featuresInfoSchema.parse(featuresData)
      return true
    } catch {
      return false
    }
  }, [getValues])

  const validateAddons = useCallback((): boolean => {
    try {
      const currentValues = getValues()
      
      /* Create a new object containing only the addons info fields */
      const addonsData = ADDONS_INFO_FIELD_KEYS.reduce((acc, key) => {
        acc[key] = currentValues[key];
        return acc;
      }, {} as Record<keyof AddonsInfoFormData, unknown>);
      
      addonsInfoSchema.parse(addonsData)
      return true
    } catch {
      return false
    }
  }, [getValues])

  const validateSla = useCallback((): boolean => {
    try {
      const currentValues = getValues()
      
      /* Create a new object containing only the SLA info fields */
      const slaData = SLA_INFO_FIELD_KEYS.reduce((acc, key) => {
        acc[key] = currentValues[key];
        return acc;
      }, {} as Record<keyof SlaInfoFormData,  number[]>);
      
      slaInfoSchema.parse(slaData)
      return true
    } catch {
      return false
    }
  }, [getValues])

  /* Lazy validation state - only computed when accessed */
  const getValidationState = useCallback(() => {
    const isBasicInfoValid = validateBasicInfo()
    const isPricingInfoValid = validatePricingInfo()
    const isFeaturesValid = validateFeatures()
    const isAddonsValid = validateAddons()
    const isSlaValid = validateSla()
    
    return {
      isBasicInfoValid,
      isPricingInfoValid,
      isFeaturesValid,
      isAddonsValid,
      isSlaValid,
      isEntireFormValid: isBasicInfoValid && isPricingInfoValid && isFeaturesValid && isAddonsValid && isSlaValid
    }
  }, [validateBasicInfo, validatePricingInfo, validateFeatures, validateAddons, validateSla])

  /* For backwards compatibility - compute validation state immediately when accessed */
  const isBasicInfoValid = validateBasicInfo()
  const isPricingInfoValid = validatePricingInfo()
  const isFeaturesValid = validateFeatures()
  const isAddonsValid = validateAddons()
  const isSlaValid = validateSla()
  const isEntireFormValid = isBasicInfoValid && isPricingInfoValid && isFeaturesValid && isAddonsValid && isSlaValid

  return {
    isBasicInfoValid,
    isPricingInfoValid,
    isFeaturesValid,
    isAddonsValid,
    isSlaValid,
    isEntireFormValid,
    /* Individual validators for granular validation */
    validateBasicInfo,
    validatePricingInfo,
    validateFeatures,
    validateAddons,
    validateSla,
    getValidationState,
  }
};