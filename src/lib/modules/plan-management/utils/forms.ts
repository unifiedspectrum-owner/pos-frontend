/* Form data transformation utilities for plan management */

/* Plan management module imports */
import { PlanDetails, CreatePlanApiRequest } from '@plan-management/types';
import { CreatePlanFormData } from '@plan-management/schemas';
import { ADDON_FEATURE_LEVELS } from '@plan-management/constants';

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
      feature_level: ADDON_FEATURE_LEVELS.BASIC,
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
export const formatFormDataToApiData = (data: CreatePlanFormData): CreatePlanApiRequest => {
  return {
    /* Core plan details */
    name: data.name,
    description: data.description,
    is_active: Boolean(data.is_active),
    is_custom: Boolean(data.is_custom),

    /* Monthly and discount pricing */
    monthly_fee_our_gateway: parseFloat(data.monthly_fee_our_gateway) || 0,
    monthly_fee_byo_processor: parseFloat(data.monthly_fee_byo_processor) || 0,
    card_processing_fee_percentage: parseFloat(data.card_processing_fee_percentage) || 0,
    card_processing_fee_fixed: parseFloat(data.card_processing_fee_fixed) || 0,
    monthly_price: parseFloat(data.monthly_price) || 0,
    annual_discount_percentage: parseFloat(data.annual_discount_percentage) || 0,

    /* Device and user constraints */
    included_devices_count: parseInt(data.included_devices_count) || 0,
    max_users_per_branch: parseInt(data.max_users_per_branch) || 0,
    additional_device_cost: parseFloat(data.additional_device_cost) || 0,
    included_branches_count: data.included_branches_count ? parseInt(data.included_branches_count) : null,

    /* Related entities and configurations */
    feature_ids: data.feature_ids || [],
    addon_assignments: data.addon_assignments || [],
    support_sla_ids: data.support_sla_ids || [],
    volume_discounts: data.volume_discounts.map(discount => ({
      id: discount.id ? discount.id : undefined,
      name: discount.name,
      min_branches: parseInt(discount.min_branches) || 0,
      max_branches: discount.max_branches ? (isNaN(parseInt(discount.max_branches)) ? null : parseInt(discount.max_branches)) : null,
      discount_percentage: parseFloat(discount.discount_percentage) || 0
    }))
  };
};

/* Build plan creation API payload from form data */
export const buildCreatePlanPayload = (formData: CreatePlanFormData): CreatePlanApiRequest => {
  return formatFormDataToApiData(formData);
};

/* Build payload for plan updates with only changed fields */
export const buildUpdatePlanPayload = (changedFields: Partial<CreatePlanFormData>): Partial<CreatePlanApiRequest> => {
  const payload: Partial<CreatePlanApiRequest> = {};

  /* Handle string fields that need trimming */
  if (changedFields.name !== undefined) {
    payload.name = changedFields.name.trim();
  }

  if (changedFields.description !== undefined) {
    payload.description = changedFields.description.trim();
  }

  /* Handle boolean fields */
  if (changedFields.is_active !== undefined) {
    payload.is_active = Boolean(changedFields.is_active);
  }

  if (changedFields.is_custom !== undefined) {
    payload.is_custom = Boolean(changedFields.is_custom);
  }

  /* Handle numeric string fields */
  if (changedFields.monthly_fee_our_gateway !== undefined) {
    payload.monthly_fee_our_gateway = parseFloat(changedFields.monthly_fee_our_gateway) || 0;
  }

  if (changedFields.monthly_fee_byo_processor !== undefined) {
    payload.monthly_fee_byo_processor = parseFloat(changedFields.monthly_fee_byo_processor) || 0;
  }

  if (changedFields.card_processing_fee_percentage !== undefined) {
    payload.card_processing_fee_percentage = parseFloat(changedFields.card_processing_fee_percentage) || 0;
  }

  if (changedFields.card_processing_fee_fixed !== undefined) {
    payload.card_processing_fee_fixed = parseFloat(changedFields.card_processing_fee_fixed) || 0;
  }

  if (changedFields.monthly_price !== undefined) {
    payload.monthly_price = parseFloat(changedFields.monthly_price) || 0;
  }

  if (changedFields.annual_discount_percentage !== undefined) {
    payload.annual_discount_percentage = parseFloat(changedFields.annual_discount_percentage) || 0;
  }

  if (changedFields.included_devices_count !== undefined) {
    payload.included_devices_count = parseInt(changedFields.included_devices_count) || 0;
  }

  if (changedFields.max_users_per_branch !== undefined) {
    payload.max_users_per_branch = parseInt(changedFields.max_users_per_branch) || 0;
  }

  if (changedFields.additional_device_cost !== undefined) {
    payload.additional_device_cost = parseFloat(changedFields.additional_device_cost) || 0;
  }

  if (changedFields.included_branches_count !== undefined) {
    payload.included_branches_count = changedFields.included_branches_count ? parseInt(changedFields.included_branches_count) : null;
  }

  /* Handle array fields */
  if (changedFields.feature_ids !== undefined) {
    payload.feature_ids = changedFields.feature_ids || [];
  }

  if (changedFields.addon_assignments !== undefined) {
    payload.addon_assignments = changedFields.addon_assignments || [];
  }

  if (changedFields.support_sla_ids !== undefined) {
    payload.support_sla_ids = changedFields.support_sla_ids || [];
  }

  if (changedFields.volume_discounts !== undefined) {
    payload.volume_discounts = changedFields.volume_discounts.map(discount => ({
      id: discount.id ? discount.id : undefined,
      name: discount.name,
      min_branches: parseInt(discount.min_branches) || 0,
      max_branches: discount.max_branches ? (isNaN(parseInt(discount.max_branches)) ? null : parseInt(discount.max_branches)) : null,
      discount_percentage: parseFloat(discount.discount_percentage) || 0
    }));
  }

  return payload;
};
