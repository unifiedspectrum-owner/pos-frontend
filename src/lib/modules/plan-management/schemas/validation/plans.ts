import { z } from 'zod'

/* Plan management validation schemas for creation, editing, and resource management */

export const createPlanSchema = z.object({
  /* Basic Plan Information */
  name: z.string()
    .min(1, 'Name is required')
    .trim()
    .regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces are allowed')
    .default(''),
  description: z.string()
    .min(3, 'Description must be at least 3 characters')
    .default(''),
  is_active: z.boolean().default(true),
  is_custom: z.boolean().default(false),

  /* Device and User Limits */
  included_devices_count: z.string()
    .min(1, 'Included devices count is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && Number.isInteger(num);
    }, 'Included devices count must be a non-negative integer')
    .default(''),
  max_users_per_branch: z.string()
    .min(1, 'Max users per branch is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 && Number.isInteger(num);
    }, 'Max users per branch must be at least 1')
    .default(''),
  included_branches_count: z.string()
    .min(1, 'Included branches count is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 && Number.isInteger(num);
    }, 'Included branches count must be a non-negative integer')
    .nullable()
    .default(''),
  additional_device_cost: z.string()
    .min(1, 'Additional device cost is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Additional device cost must be a non-negative number')
    .default(''),

  /* Pricing Configuration */
  monthly_price: z.string()
    .min(1, 'Monthly price is required')
    .default(''),
  annual_discount_percentage: z.string()
    .min(1, 'Annual discount percentage is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, 'Annual discount must be between 0 and 100')
    .default(''),
  // biennial_discount_percentage: z.string()
  //   .min(1, 'Biennial discount percentage is required')
  //   .refine((val) => {
  //     if(val == null) return
  //     const num = Number(val);
  //     return !isNaN(num) && num >= 0 && num <= 100;
  //   }, 'Biennial discount must be between 0 and 100')
  //   .nullable()
  //   .default(null),
  // triennial_discount_percentage: z.string()
  //   .min(1, 'Triennial discount percentage is required')
  //   .refine((val) => {
  //     if(val == null) return
  //     const num = Number(val);
  //     return !isNaN(num) && num >= 0 && num <= 100;
  //   }, 'Triennial discount must be between 0 and 100')
  //   .nullable()
  //   .default(null),

  /* Payment Gateway Fees */
  monthly_fee_our_gateway: z.string()
    .min(1, 'Monthly fee (our gateway) is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Monthly fee must be a non-negative number')
    .default(''),
  monthly_fee_byo_processor: z.string()
    .min(1, 'Monthly fee (BYO processor) is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Monthly fee must be a non-negative number')
    .default(''),
  card_processing_fee_percentage: z.string()
    .min(1, 'Card processing fee percentage is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, 'Processing fee percentage must be between 0 and 100')
    .default(''),
  card_processing_fee_fixed: z.string()
    .min(1, 'Fixed processing fee is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Fixed processing fee must be a non-negative number')
    .default(''),

  /* Feature Selection */
  feature_ids: z.array(z.number()).default([]),

  /* Add-on Configuration */
  addon_assignments: z.array(z.object({
    addon_id: z.number(),
    is_included: z.boolean().default(false),
    feature_level: z.enum(['basic', 'custom']).default('basic'),
    default_quantity: z.number()
      .min(0, 'Default quantity must be non-negative')
      .nullable(),
    min_quantity: z.number()
      .min(0, 'Minimum quantity must be non-negative')
      .nullable(),
    max_quantity: z.number()
      .min(0, 'Maximum quantity must be non-negative')
      .nullable(),
  }).refine((data) => {
    /* Ensure max_quantity >= min_quantity when both are provided */
    if (data.min_quantity !== null && data.max_quantity !== null) {
      return data.max_quantity >= data.min_quantity;
    }
    return true;
  }, {
    message: 'Maximum quantity must be greater than or equal to minimum quantity',
    path: ['max_quantity']
  }).refine((data) => {
    /* Ensure default_quantity is within min/max range when provided */
    if (data.default_quantity !== null) {
      if (data.min_quantity !== null && data.default_quantity < data.min_quantity) {
        return false;
      }
      if (data.max_quantity !== null && data.default_quantity > data.max_quantity) {
        return false;
      }
    }
    return true;
  }, {
    message: 'Default quantity must be within the minimum and maximum quantity range',
    path: ['default_quantity']
  })).default([]),

  /* Support SLA Selection */
  support_sla_ids: z.array(z.number().positive('SLA ID must be positive')).default([]),


  /* Volume Discount Configuration */
  volume_discounts: z.array(z.object({
    id: z.number().nullable().optional(),
    name: z.string()
      .min(1, 'Discount name is required')
      .max(100, 'Name must be less than 100 characters'),
    min_branches: z.string()
      .min(1, 'Min branches is required')
      .refine((val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 1 && Number.isInteger(num);
      }, 'Min branches must be at least 1'),
    max_branches: z.string()
      .nullable()
      .refine((val) => {
        if (!val || val === '') return true;
        const num = Number(val);
        return !isNaN(num) && num >= 1 && Number.isInteger(num);
      }, 'Max branches must be at least 1')
      .nullable(),
    discount_percentage: z.string()
      .min(1, 'Discount percentage is required')
      .refine((val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0.01 && num <= 100;
      }, 'Discount percentage must be between 0.01 and 100'),
  }).refine((data) => {
    /* Ensure max_branches > min_branches when max_branches is provided */
    if (data.max_branches && data.max_branches !== '') {
      const maxNum = Number(data.max_branches);
      const minNum = Number(data.min_branches);
      return !isNaN(maxNum) && !isNaN(minNum) && maxNum > minNum;
    }
    return true;
  }, {
    message: 'Maximum branches must be greater than minimum branches',
    path: ['max_branches']
  })).default([]).superRefine((discounts, ctx) => {
    /* Prevent overlapping volume discount ranges */
    if (!discounts || discounts.length <= 1) return;
    
    for (let i = 0; i < discounts.length; i++) {
      for (let j = i + 1; j < discounts.length; j++) {
        const discount1 = discounts[i];
        const discount2 = discounts[j];
        
        if (!discount1.min_branches || !discount2.min_branches) continue;
        
        const min1 = Number(discount1.min_branches);
        const max1 = discount1.max_branches && discount1.max_branches !== '' 
          ? Number(discount1.max_branches) : Infinity;
        const min2 = Number(discount2.min_branches);
        const max2 = discount2.max_branches && discount2.max_branches !== '' 
          ? Number(discount2.max_branches) : Infinity;
        
        /* Check for range overlap */
        if ((min1 <= max2 && max1 >= min2)) {
          const errorMessage = 'Volume discount ranges cannot overlap';
          ctx.addIssue({
            code: 'custom',
            message: errorMessage,
            path: [i, 'min_branches']
          });
          ctx.addIssue({
            code: 'custom',
            message: errorMessage,
            path: [i, 'max_branches']
          });
          ctx.addIssue({
            code: 'custom',
            message: errorMessage,
            path: [j, 'min_branches']
          });
          ctx.addIssue({
            code: 'custom',
            message: errorMessage,
            path: [j, 'max_branches']
          });
        }
      }
    }
  }),
})

/* Tab-specific validation schemas for individual form sections */

/* Basic information tab fields */
export const basicInfoSchema = createPlanSchema.pick({
  name: true,
  description: true,
  included_devices_count: true,
  max_users_per_branch: true,
  included_branches_count: true,
  is_active: true,
  is_custom: true
})

/* Schema-derived field keys for validation */
export const BASIC_INFO_FIELD_KEYS = Object.keys(basicInfoSchema.shape) as Array<keyof typeof basicInfoSchema.shape>

/* Pricing configuration tab fields */
export const pricingInfoSchema = createPlanSchema.pick({
  monthly_price: true,
  annual_discount_percentage: true,
  additional_device_cost: true,
  monthly_fee_our_gateway: true,
  monthly_fee_byo_processor: true,
  card_processing_fee_percentage: true,
  card_processing_fee_fixed: true,
  volume_discounts: true
})

/* Schema-derived field keys for pricing validation (including volume_discounts) */
export const PRICING_INFO_FIELD_KEYS = Object.keys(pricingInfoSchema.shape) as Array<keyof typeof pricingInfoSchema.shape>

/* Feature selection tab fields */
export const featuresInfoSchema = createPlanSchema.pick({
  feature_ids: true
})
export const FEATURES_INFO_FIELD_KEYS = Object.keys(featuresInfoSchema.shape) as Array<keyof typeof featuresInfoSchema.shape>

/* Add-on configuration tab fields */
export const addonsInfoSchema = createPlanSchema.pick({
  addon_assignments: true
})
export const ADDONS_INFO_FIELD_KEYS = Object.keys(addonsInfoSchema.shape) as Array<keyof typeof addonsInfoSchema.shape>

/* SLA configuration tab fields */
export const slaInfoSchema = createPlanSchema.pick({
  support_sla_ids: true
})
export const SLA_INFO_FIELD_KEYS = Object.keys(slaInfoSchema.shape) as Array<keyof typeof slaInfoSchema.shape>

/* Resource creation schemas for features, addons, and SLAs */

/* Feature creation validation */
export const createFeatureSchema = z.object({
  name: z.string()
    .min(1, 'Feature name is required')
    .max(100, 'Feature name must be less than 100 characters')
    .default(''),
  description: z.string()
    .min(1, 'Feature description is required')
    .max(500, 'Feature description must be less than 500 characters')
    .default('')
})

/* Add-on creation validation */
export const createAddonSchema = z.object({
  name: z.string()
    .min(1, 'Add-on name is required')
    .max(100, 'Add-on name must be less than 100 characters')
    .default(''),
  description: z.string()
    .min(1, 'Add-on description is required')
    .max(500, 'Add-on description must be less than 500 characters')
    .default(''),
  base_price: z.string()
    .refine((val) => {
      if (!val || val === '') return true; /* Optional field */
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Base price must be a non-negative number')
    .default(''),
  pricing_scope: z.enum(['branch', 'organization']).refine(val => val !== undefined, {
    message: 'Pricing scope is required',
  }).default('branch')
})

/* SLA creation validation */
export const createSlaSchema = z.object({
  name: z.string()
    .min(1, 'SLA name is required')
    .max(100, 'SLA name must be less than 100 characters')
    .default(''),
  support_channel: z.string()
    .min(1, 'Support channel is required')
    .max(50, 'Support channel must be less than 50 characters')
    .default(''),
  response_time_hours: z.string()
    .min(1, 'Response time is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }, 'Response time must be a positive integer')
    .default(''),
  availability_schedule: z.string()
    .min(1, 'Availability schedule is required')
    .max(100, 'Availability schedule must be less than 100 characters')
    .default(''),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .nullable()
    .default('')
})

/* TypeScript type definitions inferred from validation schemas */

/* Main form data type */
export type CreatePlanFormData = z.infer<typeof createPlanSchema>

/* Tab-specific form data types */
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
export type PricingInfoFormData = z.infer<typeof pricingInfoSchema>
export type FeaturesInfoFormData = z.infer<typeof featuresInfoSchema>
export type AddonsInfoFormData = z.infer<typeof addonsInfoSchema>
export type SlaInfoFormData = z.infer<typeof slaInfoSchema>

/* Resource creation form data types */
export type CreateFeatureFormData = z.infer<typeof createFeatureSchema>
export type CreateAddonFormData = z.infer<typeof createAddonSchema>
export type CreateSlaFormData = z.infer<typeof createSlaSchema>