/* Comprehensive test suite for plan validation schemas */

/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Plan management module imports */
import { createPlanSchema, basicInfoSchema, pricingInfoSchema, featuresInfoSchema, addonsInfoSchema, slaInfoSchema, BASIC_INFO_FIELD_KEYS, PRICING_INFO_FIELD_KEYS, type CreatePlanFormData } from '@plan-management/schemas/plan'

describe('Plan Schema', () => {
  describe('createPlanSchema', () => {
    const validPlanData: CreatePlanFormData = {
      /* Basic Info */
      name: 'Professional Plan',
      description: 'Perfect for growing businesses',
      is_active: true,
      is_custom: false,

      /* Device and User Limits */
      included_devices_count: '5',
      max_users_per_branch: '10',
      included_branches_count: '2',
      additional_device_cost: '15.00',

      /* Pricing */
      monthly_price: '99.99',
      annual_discount_percentage: '15',

      /* Gateway Fees */
      monthly_fee_our_gateway: '10.00',
      monthly_fee_byo_processor: '5.00',
      card_processing_fee_percentage: '2.5',
      card_processing_fee_fixed: '0.30',

      /* Relations */
      feature_ids: [1, 2, 3],
      addon_assignments: [],
      support_sla_ids: [1],
      volume_discounts: []
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(createPlanSchema).toBeDefined()
      })

      it('should validate complete valid data', () => {
        const result = createPlanSchema.safeParse(validPlanData)
        expect(result.success).toBe(true)
      })
    })

    describe('name Field Validation', () => {
      it('should accept valid plan name', () => {
        const result = createPlanSchema.safeParse(validPlanData)
        expect(result.success).toBe(true)
      })

      it('should reject empty name', () => {
        const data = { ...validPlanData, name: '' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Name is required')
        }
      })

      it('should trim whitespace from name', () => {
        const data = { ...validPlanData, name: '  Test Plan  ' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.name).toBe('Test Plan')
        }
      })

      it('should accept name with letters and spaces', () => {
        const data = { ...validPlanData, name: 'Enterprise Business Plan' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with apostrophes', () => {
        const data = { ...validPlanData, name: "Retailer's Premium Plan" }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with hyphens', () => {
        const data = { ...validPlanData, name: 'Small-to-Medium Business Plan' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('description Field Validation', () => {
      it('should accept valid description', () => {
        const result = createPlanSchema.safeParse(validPlanData)
        expect(result.success).toBe(true)
      })

      it('should reject description less than 3 characters', () => {
        const data = { ...validPlanData, description: 'ab' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Description must be at least 3 characters')
        }
      })

      it('should accept description with exactly 3 characters', () => {
        const data = { ...validPlanData, description: 'abc' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Boolean Fields Validation', () => {
      it('should accept is_active as true', () => {
        const data = { ...validPlanData, is_active: true }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.is_active).toBe(true)
        }
      })

      it('should accept is_active as false', () => {
        const data = { ...validPlanData, is_active: false }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.is_active).toBe(false)
        }
      })

      it('should accept is_custom as true', () => {
        const data = { ...validPlanData, is_custom: true }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept is_custom as false', () => {
        const data = { ...validPlanData, is_custom: false }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Device Count Validation', () => {
      it('should accept zero devices', () => {
        const data = { ...validPlanData, included_devices_count: '0' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept positive integer devices', () => {
        const data = { ...validPlanData, included_devices_count: '10' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject negative devices', () => {
        const data = { ...validPlanData, included_devices_count: '-5' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Included devices count must be a non-negative integer')
        }
      })

      it('should reject decimal devices', () => {
        const data = { ...validPlanData, included_devices_count: '5.5' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('User Count Validation', () => {
      it('should accept at least 1 user', () => {
        const data = { ...validPlanData, max_users_per_branch: '1' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject zero users', () => {
        const data = { ...validPlanData, max_users_per_branch: '0' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Max users per branch must be at least 1')
        }
      })

      it('should reject negative users', () => {
        const data = { ...validPlanData, max_users_per_branch: '-10' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Branch Count Validation', () => {
      it('should accept at least 1 branch', () => {
        const data = { ...validPlanData, included_branches_count: '1' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject zero branches', () => {
        const data = { ...validPlanData, included_branches_count: '0' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept nullable branch count', () => {
        const data = { ...validPlanData, included_branches_count: null }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Price Validations', () => {
      it('should accept valid monthly price', () => {
        const data = { ...validPlanData, monthly_price: '49.99' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject empty monthly price', () => {
        const data = { ...validPlanData, monthly_price: '' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept zero device cost', () => {
        const data = { ...validPlanData, additional_device_cost: '0' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject negative device cost', () => {
        const data = { ...validPlanData, additional_device_cost: '-10' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Discount Percentage Validation', () => {
      it('should accept discount between 0 and 100', () => {
        const data = { ...validPlanData, annual_discount_percentage: '25' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept zero discount', () => {
        const data = { ...validPlanData, annual_discount_percentage: '0' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept 100% discount', () => {
        const data = { ...validPlanData, annual_discount_percentage: '100' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject discount above 100', () => {
        const data = { ...validPlanData, annual_discount_percentage: '101' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Annual discount must be between 0 and 100')
        }
      })

      it('should reject negative discount', () => {
        const data = { ...validPlanData, annual_discount_percentage: '-5' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Gateway Fee Validations', () => {
      it('should accept valid gateway fees', () => {
        const result = createPlanSchema.safeParse(validPlanData)
        expect(result.success).toBe(true)
      })

      it('should reject negative gateway fee', () => {
        const data = { ...validPlanData, monthly_fee_our_gateway: '-5' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept zero gateway fee', () => {
        const data = { ...validPlanData, monthly_fee_our_gateway: '0' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Card Processing Fee Validations', () => {
      it('should accept valid processing fee percentage', () => {
        const data = { ...validPlanData, card_processing_fee_percentage: '2.9' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject processing percentage above 100', () => {
        const data = { ...validPlanData, card_processing_fee_percentage: '150' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept valid fixed processing fee', () => {
        const data = { ...validPlanData, card_processing_fee_fixed: '0.30' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject negative fixed fee', () => {
        const data = { ...validPlanData, card_processing_fee_fixed: '-0.30' }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Feature IDs Validation', () => {
      it('should accept array of feature IDs', () => {
        const data = { ...validPlanData, feature_ids: [1, 2, 3, 4, 5] }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept empty feature array', () => {
        const data = { ...validPlanData, feature_ids: [] }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Addon Assignments Validation', () => {
      const validAddonAssignment = {
        addon_id: 1,
        is_included: true,
        feature_level: 'basic' as const,
        default_quantity: 5,
        min_quantity: 1,
        max_quantity: 10
      }

      it('should accept valid addon assignments', () => {
        const data = {
          ...validPlanData,
          addon_assignments: [validAddonAssignment]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept empty addon assignments', () => {
        const data = { ...validPlanData, addon_assignments: [] }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject when max_quantity < min_quantity', () => {
        const data = {
          ...validPlanData,
          addon_assignments: [{
            ...validAddonAssignment,
            min_quantity: 10,
            max_quantity: 5
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Maximum quantity must be greater than or equal to minimum quantity')
        }
      })

      it('should accept when max_quantity = min_quantity', () => {
        const data = {
          ...validPlanData,
          addon_assignments: [{
            ...validAddonAssignment,
            min_quantity: 5,
            max_quantity: 5
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject when default_quantity < min_quantity', () => {
        const data = {
          ...validPlanData,
          addon_assignments: [{
            ...validAddonAssignment,
            default_quantity: 1,
            min_quantity: 5,
            max_quantity: 10
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Default quantity must be within the minimum and maximum quantity range')
        }
      })

      it('should reject when default_quantity > max_quantity', () => {
        const data = {
          ...validPlanData,
          addon_assignments: [{
            ...validAddonAssignment,
            default_quantity: 15,
            min_quantity: 5,
            max_quantity: 10
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept null quantities', () => {
        const data = {
          ...validPlanData,
          addon_assignments: [{
            ...validAddonAssignment,
            default_quantity: null,
            min_quantity: null,
            max_quantity: null
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept basic feature level', () => {
        const data = {
          ...validPlanData,
          addon_assignments: [{
            ...validAddonAssignment,
            feature_level: 'basic' as const
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept custom feature level', () => {
        const data = {
          ...validPlanData,
          addon_assignments: [{
            ...validAddonAssignment,
            feature_level: 'custom' as const
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('SLA IDs Validation', () => {
      it('should accept array of positive SLA IDs', () => {
        const data = { ...validPlanData, support_sla_ids: [1, 2, 3] }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept empty SLA array', () => {
        const data = { ...validPlanData, support_sla_ids: [] }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject zero SLA ID', () => {
        const data = { ...validPlanData, support_sla_ids: [0] }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject negative SLA ID', () => {
        const data = { ...validPlanData, support_sla_ids: [-1] }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Volume Discounts Validation', () => {
      const validVolumeDiscount = {
        id: null,
        name: 'Small Business Discount',
        min_branches: '5',
        max_branches: '10',
        discount_percentage: '10'
      }

      it('should accept valid volume discounts', () => {
        const data = {
          ...validPlanData,
          volume_discounts: [validVolumeDiscount]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept empty volume discounts', () => {
        const data = { ...validPlanData, volume_discounts: [] }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject when max_branches <= min_branches', () => {
        const data = {
          ...validPlanData,
          volume_discounts: [{
            ...validVolumeDiscount,
            min_branches: '10',
            max_branches: '5'
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Maximum branches must be greater than minimum branches')
        }
      })

      it('should accept null max_branches for unlimited', () => {
        const data = {
          ...validPlanData,
          volume_discounts: [{
            ...validVolumeDiscount,
            max_branches: null
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject overlapping discount ranges', () => {
        const data = {
          ...validPlanData,
          volume_discounts: [
            {
              ...validVolumeDiscount,
              name: 'Discount 1',
              min_branches: '5',
              max_branches: '15',
              discount_percentage: '10'
            },
            {
              ...validVolumeDiscount,
              name: 'Discount 2',
              min_branches: '10',
              max_branches: '20',
              discount_percentage: '15'
            }
          ]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => issue.message === 'Volume discount ranges cannot overlap')).toBe(true)
        }
      })

      it('should accept non-overlapping discount ranges', () => {
        const data = {
          ...validPlanData,
          volume_discounts: [
            {
              ...validVolumeDiscount,
              name: 'Discount 1',
              min_branches: '5',
              max_branches: '9',
              discount_percentage: '10'
            },
            {
              ...validVolumeDiscount,
              name: 'Discount 2',
              min_branches: '10',
              max_branches: '20',
              discount_percentage: '15'
            }
          ]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject discount percentage above 100', () => {
        const data = {
          ...validPlanData,
          volume_discounts: [{
            ...validVolumeDiscount,
            discount_percentage: '150'
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject discount percentage below 0.01', () => {
        const data = {
          ...validPlanData,
          volume_discounts: [{
            ...validVolumeDiscount,
            discount_percentage: '0'
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept minimum valid discount 0.01%', () => {
        const data = {
          ...validPlanData,
          volume_discounts: [{
            ...validVolumeDiscount,
            discount_percentage: '0.01'
          }]
        }
        const result = createPlanSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Tab-Specific Schemas', () => {
      it('should validate basic info schema', () => {
        const basicInfo = {
          name: 'Test Plan',
          description: 'Test Description',
          included_devices_count: '5',
          max_users_per_branch: '10',
          included_branches_count: '1',
          is_active: true,
          is_custom: false
        }
        const result = basicInfoSchema.safeParse(basicInfo)

        expect(result.success).toBe(true)
      })

      it('should validate pricing info schema', () => {
        const pricingInfo = {
          monthly_price: '99.99',
          annual_discount_percentage: '15',
          additional_device_cost: '10',
          monthly_fee_our_gateway: '5',
          monthly_fee_byo_processor: '3',
          card_processing_fee_percentage: '2.5',
          card_processing_fee_fixed: '0.30',
          volume_discounts: []
        }
        const result = pricingInfoSchema.safeParse(pricingInfo)

        expect(result.success).toBe(true)
      })

      it('should validate features info schema', () => {
        const featuresInfo = { feature_ids: [1, 2, 3] }
        const result = featuresInfoSchema.safeParse(featuresInfo)

        expect(result.success).toBe(true)
      })

      it('should validate addons info schema', () => {
        const addonsInfo = { addon_assignments: [] }
        const result = addonsInfoSchema.safeParse(addonsInfo)

        expect(result.success).toBe(true)
      })

      it('should validate SLA info schema', () => {
        const slaInfo = { support_sla_ids: [1] }
        const result = slaInfoSchema.safeParse(slaInfo)

        expect(result.success).toBe(true)
      })
    })

    describe('Field Keys Constants', () => {
      it('should have basic info field keys', () => {
        expect(BASIC_INFO_FIELD_KEYS).toBeDefined()
        expect(Array.isArray(BASIC_INFO_FIELD_KEYS)).toBe(true)
        expect(BASIC_INFO_FIELD_KEYS).toContain('name')
        expect(BASIC_INFO_FIELD_KEYS).toContain('description')
      })

      it('should have pricing info field keys', () => {
        expect(PRICING_INFO_FIELD_KEYS).toBeDefined()
        expect(Array.isArray(PRICING_INFO_FIELD_KEYS)).toBe(true)
        expect(PRICING_INFO_FIELD_KEYS).toContain('monthly_price')
        expect(PRICING_INFO_FIELD_KEYS).toContain('volume_discounts')
      })
    })
  })
})
