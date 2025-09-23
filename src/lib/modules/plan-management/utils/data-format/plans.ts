import { PlanDetails, CreateSubscriptionPlanAPIPayloadRequest } from '@plan-management/types/plans';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';

/* Transform API plan data to form validation schema format */
export const formatApiDataToFormData = (apiPlanData: PlanDetails): CreatePlanFormData => {
  return {
    /* Core plan details */
    name: apiPlanData.name,
    description: apiPlanData.description,
    is_active: Boolean(apiPlanData.is_active),
    is_custom: Boolean(apiPlanData.is_custom),
    
    /* Monthly and discount pricing */
    monthly_fee_our_gateway: apiPlanData.monthly_fee_our_gateway.toString(),
    monthly_fee_byo_processor: apiPlanData.monthly_fee_byo_processor.toString(),
    card_processing_fee_percentage: apiPlanData.card_processing_fee_percentage.toString(),
    card_processing_fee_fixed: apiPlanData.card_processing_fee_fixed.toString(),
    monthly_price: apiPlanData.monthly_price.toString(),
    annual_discount_percentage: apiPlanData.annual_discount_percentage.toString(),
    // biennial_discount_percentage: apiPlanData.biennial_discount_percentage.toString(),
    // triennial_discount_percentage: apiPlanData.triennial_discount_percentage.toString(),
    
    /* Device and user constraints */
    included_devices_count: apiPlanData.included_devices_count.toString(),
    max_users_per_branch: apiPlanData.max_users_per_branch.toString(),
    additional_device_cost: apiPlanData.additional_device_cost.toString(),
    included_branches_count: apiPlanData.included_branches_count?.toString() || '',
    
    /* Related entities and configurations */
    feature_ids: apiPlanData.features.map(feature => feature.id),
    addon_assignments: apiPlanData.add_ons.map(addon => ({
      addon_id: addon.id,
      default_quantity: addon.default_quantity,
      is_included: Boolean(addon.is_included),
      feature_level: 'basic' as const,
      min_quantity: addon.min_quantity,
      max_quantity: addon.max_quantity
    })),
    support_sla_ids: apiPlanData.support_sla.map(sla => sla.id),
    volume_discounts: apiPlanData.volume_discounts.map(discount => ({
      id: discount.id,
      name: discount.name,
      min_branches: discount.min_branches.toString(),
      max_branches: discount.max_branches?.toString() || '',
      discount_percentage: discount.discount_percentage.toString()
    }))
  };
};

/* Transform form data to API submission format */
export const formatFormDataToApiData = (
  formData: CreatePlanFormData, 
): CreateSubscriptionPlanAPIPayloadRequest => {
  return {
    /* Core plan details */
    name: formData.name,
    description: formData.description,
    is_active: Boolean(formData.is_active),
    is_custom: Boolean(formData.is_custom),
    
    /* Monthly and discount pricing */
    monthly_fee_our_gateway: parseFloat(formData.monthly_fee_our_gateway) || 0,
    monthly_fee_byo_processor: parseFloat(formData.monthly_fee_byo_processor) || 0,
    card_processing_fee_percentage: parseFloat(formData.card_processing_fee_percentage) || 0,
    card_processing_fee_fixed: parseFloat(formData.card_processing_fee_fixed) || 0,
    monthly_price: parseFloat(formData.monthly_price) || 0,
    annual_discount_percentage: parseFloat(formData.annual_discount_percentage) || 0,
    // biennial_discount_percentage: parseFloat(formData.biennial_discount_percentage) || 0,
    // triennial_discount_percentage: parseFloat(formData.triennial_discount_percentage) || 0,
    
    /* Device and user constraints */
    included_devices_count: parseInt(formData.included_devices_count) || 0,
    max_users_per_branch: parseInt(formData.max_users_per_branch) || 0,
    additional_device_cost: parseFloat(formData.additional_device_cost) || 0,
    included_branches_count: formData.included_branches_count ? parseInt(formData.included_branches_count) : null,
    
    /* Related entities and configurations */
    feature_ids: formData.feature_ids || [],
    addon_assignments: formData.addon_assignments || [],
    support_sla_ids: formData.support_sla_ids || [],
    volume_discounts: formData.volume_discounts.map(discount => ({
      id: discount.id ? discount.id : undefined,
      name: discount.name,
      min_branches: parseInt(discount.min_branches) || 0,
      max_branches: discount.max_branches ? (isNaN(parseInt(discount.max_branches)) ? null : parseInt(discount.max_branches)) : null,
      discount_percentage: parseFloat(discount.discount_percentage) || 0
    }))
  };
};