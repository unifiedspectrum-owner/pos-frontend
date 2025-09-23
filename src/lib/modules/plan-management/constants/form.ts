export const CREATE_PLAN_FORM_DEFAULT_VALUES = {
  /* Basic Plan Information */
  name: "",
  description: "",
  is_active: true,
  is_custom: false,

  /* Device and User Limits */
  included_devices_count: "0",
  max_users_per_branch: "1",
  included_branches_count: "1",
  additional_device_cost: "0",

  /* Pricing Configuration */
  monthly_price: "0",
  annual_discount_percentage: "0",
  // biennial_discount_percentage: null,
  // triennial_discount_percentage: null,

  /* Payment Gateway Fees */
  monthly_fee_our_gateway: "0",
  monthly_fee_byo_processor: "0",
  card_processing_fee_percentage: "0",
  card_processing_fee_fixed: "0",

  /* Feature Selection */
  feature_ids: [],

  /* Add-on Configuration */
  addon_assignments: [],

  /* Support SLA Selection */
  support_sla_ids: [],

  /* Volume Discount Configuration */
  volume_discounts: [],
};
