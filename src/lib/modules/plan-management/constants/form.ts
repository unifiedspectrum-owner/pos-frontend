export const PLAN_FORM_DEFAULT_VALUES = {
  /* Basic Plan Information */
  name: "",
  description: "",
  is_active: true,
  is_custom: false,

  /* Device and User Limits */
  included_devices_count: "",
  max_users_per_branch: "",
  included_branches_count: "",
  additional_device_cost: "",

  /* Pricing Configuration */
  monthly_price: "",
  annual_discount_percentage: "",
  // biennial_discount_percentage: null,
  // triennial_discount_percentage: null,

  /* Payment Gateway Fees */
  monthly_fee_our_gateway: "",
  monthly_fee_byo_processor: "",
  card_processing_fee_percentage: "",
  card_processing_fee_fixed: "",

  /* Feature Selection */
  feature_ids: [],

  /* Add-on Configuration */
  addon_assignments: [],

  /* Support SLA Selection */
  support_sla_ids: [],

  /* Volume Discount Configuration */
  volume_discounts: [],
};
