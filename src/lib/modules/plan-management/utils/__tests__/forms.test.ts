/* Comprehensive test suite for form transformation utilities */

/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Plan management module imports */
import { formatApiDataToFormData, formatFormDataToApiData, buildCreatePlanPayload, buildUpdatePlanPayload } from '@plan-management/utils/forms'
import { PlanDetails, CreatePlanApiRequest } from '@plan-management/types'
import { CreatePlanFormData } from '@plan-management/schemas'
import { ADDON_FEATURE_LEVELS } from '@plan-management/constants'

describe('Forms Utilities', () => {
  const mockApiPlanData: PlanDetails = {
    id: 1,
    name: 'Enterprise Plan',
    description: 'Full-featured enterprise solution',
    display_order: 1,
    trial_period_days: 30,
    is_active: 1,
    is_custom: 0,
    monthly_fee_our_gateway: 199.99,
    monthly_fee_byo_processor: 149.99,
    card_processing_fee_percentage: 2.5,
    card_processing_fee_fixed: 0.30,
    monthly_price: 199.99,
    annual_discount_percentage: 10,
    biennial_discount_percentage: 15,
    triennial_discount_percentage: 20,
    included_devices_count: 5,
    max_users_per_branch: 20,
    additional_device_cost: 25.00,
    included_branches_count: 3,
    features: [
      { id: 1, name: 'Inventory Management', description: 'Track inventory', display_order: 1 },
      { id: 2, name: 'Reporting', description: 'Advanced reports', display_order: 2 }
    ],
    add_ons: [
      {
        id: 10,
        name: 'Mobile App',
        description: 'Mobile POS app',
        pricing_scope: 'branch',
        addon_price: 15.99,
        default_quantity: 1,
        is_included: true,
        feature_level: null,
        min_quantity: 0,
        max_quantity: 10,
        display_order: 1
      }
    ],
    support_sla: [
      {
        id: 100,
        name: 'Premium Support',
        support_channel: 'Phone, Email',
        response_time_hours: 2,
        availability_schedule: '24/7',
        notes: 'Priority support',
        display_order: 1
      }
    ],
    volume_discounts: [
      {
        id: 1000,
        name: 'Volume Tier 1',
        min_branches: 5,
        max_branches: 10,
        discount_percentage: 10
      }
    ]
  }

  const mockFormData: CreatePlanFormData = {
    name: 'Enterprise Plan',
    description: 'Full-featured enterprise solution',
    is_active: true,
    is_custom: false,
    monthly_fee_our_gateway: '199.99',
    monthly_fee_byo_processor: '149.99',
    card_processing_fee_percentage: '2.5',
    card_processing_fee_fixed: '0.30',
    monthly_price: '199.99',
    annual_discount_percentage: '10',
    included_devices_count: '5',
    max_users_per_branch: '20',
    additional_device_cost: '25.00',
    included_branches_count: '3',
    feature_ids: [1, 2],
    addon_assignments: [
      {
        addon_id: 10,
        default_quantity: 1,
        is_included: true,
        feature_level: 'basic',
        min_quantity: 0,
        max_quantity: 10
      }
    ],
    support_sla_ids: [100],
    volume_discounts: [
      {
        id: 1000,
        name: 'Volume Tier 1',
        min_branches: '5',
        max_branches: '10',
        discount_percentage: '10'
      }
    ]
  }

  describe('formatApiDataToFormData', () => {
    it('should transform API plan data to form format', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('monthly_price')
      expect(result).toHaveProperty('feature_ids')
      expect(result).toHaveProperty('addon_assignments')
      expect(result).toHaveProperty('support_sla_ids')
      expect(result).toHaveProperty('volume_discounts')
    })

    it('should preserve string fields', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result.name).toBe('Enterprise Plan')
      expect(result.description).toBe('Full-featured enterprise solution')
    })

    it('should convert boolean fields correctly', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result.is_active).toBe(true)
      expect(result.is_custom).toBe(false)
    })

    it('should convert numeric fields to strings', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result.monthly_fee_our_gateway).toBe('199.99')
      expect(result.monthly_fee_byo_processor).toBe('149.99')
      expect(result.card_processing_fee_percentage).toBe('2.5')
      expect(result.card_processing_fee_fixed).toBe('0.3')
      expect(result.monthly_price).toBe('199.99')
      expect(result.annual_discount_percentage).toBe('10')
    })

    it('should convert integer fields to strings', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result.included_devices_count).toBe('5')
      expect(result.max_users_per_branch).toBe('20')
      expect(result.additional_device_cost).toBe('25')
      expect(result.included_branches_count).toBe('3')
    })

    it('should handle null included_branches_count', () => {
      const dataWithNullBranches = { ...mockApiPlanData, included_branches_count: null }
      const result = formatApiDataToFormData(dataWithNullBranches)

      expect(result.included_branches_count).toBe('')
    })

    it('should extract feature IDs from features array', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result.feature_ids).toEqual([1, 2])
      expect(result.feature_ids).toHaveLength(2)
    })

    it('should transform addon assignments', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result.addon_assignments).toHaveLength(1)
      expect(result.addon_assignments[0]).toEqual({
        addon_id: 10,
        default_quantity: 1,
        is_included: true,
        feature_level: ADDON_FEATURE_LEVELS.BASIC,
        min_quantity: 0,
        max_quantity: 10
      })
    })

    it('should extract SLA IDs from support_sla array', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result.support_sla_ids).toEqual([100])
      expect(result.support_sla_ids).toHaveLength(1)
    })

    it('should transform volume discounts', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(result.volume_discounts).toHaveLength(1)
      expect(result.volume_discounts[0]).toEqual({
        id: 1000,
        name: 'Volume Tier 1',
        min_branches: '5',
        max_branches: '10',
        discount_percentage: '10'
      })
    })

    it('should handle volume discount with null max_branches', () => {
      const dataWithNullMaxBranches = {
        ...mockApiPlanData,
        volume_discounts: [
          {
            ...mockApiPlanData.volume_discounts[0],
            max_branches: null
          }
        ]
      }
      const result = formatApiDataToFormData(dataWithNullMaxBranches)

      expect(result.volume_discounts[0].max_branches).toBe('')
    })

    it('should handle empty arrays', () => {
      const dataWithEmptyArrays = {
        ...mockApiPlanData,
        features: [],
        add_ons: [],
        support_sla: [],
        volume_discounts: []
      }
      const result = formatApiDataToFormData(dataWithEmptyArrays)

      expect(result.feature_ids).toEqual([])
      expect(result.addon_assignments).toEqual([])
      expect(result.support_sla_ids).toEqual([])
      expect(result.volume_discounts).toEqual([])
    })

    it('should handle multiple features', () => {
      const dataWithManyFeatures = {
        ...mockApiPlanData,
        features: [
          { id: 1, name: 'F1', description: 'D1', display_order: 1 },
          { id: 2, name: 'F2', description: 'D2', display_order: 2 },
          { id: 3, name: 'F3', description: 'D3', display_order: 3 }
        ]
      }
      const result = formatApiDataToFormData(dataWithManyFeatures)

      expect(result.feature_ids).toEqual([1, 2, 3])
    })

    it('should preserve is_included as boolean in addon assignments', () => {
      const result = formatApiDataToFormData(mockApiPlanData)

      expect(typeof result.addon_assignments[0].is_included).toBe('boolean')
      expect(result.addon_assignments[0].is_included).toBe(true)
    })

    it('should handle zero values correctly', () => {
      const dataWithZeros = {
        ...mockApiPlanData,
        monthly_price: 0,
        annual_discount_percentage: 0,
        included_devices_count: 0
      }
      const result = formatApiDataToFormData(dataWithZeros)

      expect(result.monthly_price).toBe('0')
      expect(result.annual_discount_percentage).toBe('0')
      expect(result.included_devices_count).toBe('0')
    })
  })

  describe('formatFormDataToApiData', () => {
    it('should transform form data to API format', () => {
      const result = formatFormDataToApiData(mockFormData)

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('monthly_price')
      expect(result).toHaveProperty('feature_ids')
      expect(result).toHaveProperty('addon_assignments')
      expect(result).toHaveProperty('support_sla_ids')
      expect(result).toHaveProperty('volume_discounts')
    })

    it('should preserve string fields', () => {
      const result = formatFormDataToApiData(mockFormData)

      expect(result.name).toBe('Enterprise Plan')
      expect(result.description).toBe('Full-featured enterprise solution')
    })

    it('should convert boolean fields correctly', () => {
      const result = formatFormDataToApiData(mockFormData)

      expect(result.is_active).toBe(true)
      expect(result.is_custom).toBe(false)
    })

    it('should convert string fields to numbers', () => {
      const result = formatFormDataToApiData(mockFormData)

      expect(result.monthly_fee_our_gateway).toBe(199.99)
      expect(result.monthly_fee_byo_processor).toBe(149.99)
      expect(result.card_processing_fee_percentage).toBe(2.5)
      expect(result.card_processing_fee_fixed).toBe(0.30)
      expect(result.monthly_price).toBe(199.99)
      expect(result.annual_discount_percentage).toBe(10)
    })

    it('should convert string counts to integers', () => {
      const result = formatFormDataToApiData(mockFormData)

      expect(result.included_devices_count).toBe(5)
      expect(result.max_users_per_branch).toBe(20)
      expect(result.additional_device_cost).toBe(25.00)
      expect(result.included_branches_count).toBe(3)
    })

    it('should handle empty string as 0 for numeric fields', () => {
      const formDataWithEmpty = {
        ...mockFormData,
        monthly_price: '',
        included_devices_count: ''
      }
      const result = formatFormDataToApiData(formDataWithEmpty)

      expect(result.monthly_price).toBe(0)
      expect(result.included_devices_count).toBe(0)
    })

    it('should handle empty string as null for included_branches_count', () => {
      const formDataWithEmpty = {
        ...mockFormData,
        included_branches_count: ''
      }
      const result = formatFormDataToApiData(formDataWithEmpty)

      expect(result.included_branches_count).toBeNull()
    })

    it('should preserve arrays', () => {
      const result = formatFormDataToApiData(mockFormData)

      expect(result.feature_ids).toEqual([1, 2])
      expect(result.addon_assignments).toEqual(mockFormData.addon_assignments)
      expect(result.support_sla_ids).toEqual([100])
    })

    it('should handle undefined arrays', () => {
      const formDataWithoutArrays = {
        ...mockFormData,
        feature_ids: undefined,
        addon_assignments: undefined,
        support_sla_ids: undefined
      } as any

      const result = formatFormDataToApiData(formDataWithoutArrays)

      expect(result.feature_ids).toEqual([])
      expect(result.addon_assignments).toEqual([])
      expect(result.support_sla_ids).toEqual([])
    })

    it('should transform volume discounts', () => {
      const result = formatFormDataToApiData(mockFormData)

      expect(result.volume_discounts).toHaveLength(1)
      expect(result.volume_discounts![0]).toEqual({
        id: 1000,
        name: 'Volume Tier 1',
        min_branches: 5,
        max_branches: 10,
        discount_percentage: 10
      })
    })

    it('should handle volume discount without id', () => {
      const formDataWithoutId = {
        ...mockFormData,
        volume_discounts: [
          {
            name: 'New Discount',
            min_branches: '3',
            max_branches: '5',
            discount_percentage: '15'
          }
        ]
      }
      const result = formatFormDataToApiData(formDataWithoutId)

      expect(result.volume_discounts![0].id).toBeUndefined()
      expect(result.volume_discounts![0].name).toBe('New Discount')
    })

    it('should handle volume discount with empty max_branches', () => {
      const formDataWithEmptyMax = {
        ...mockFormData,
        volume_discounts: [
          {
            id: 1000,
            name: 'Unlimited Tier',
            min_branches: '10',
            max_branches: '',
            discount_percentage: '20'
          }
        ]
      }
      const result = formatFormDataToApiData(formDataWithEmptyMax)

      expect(result.volume_discounts![0].max_branches).toBeNull()
    })

    it('should handle volume discount with NaN max_branches', () => {
      const formDataWithNaN = {
        ...mockFormData,
        volume_discounts: [
          {
            id: 1000,
            name: 'Test',
            min_branches: '5',
            max_branches: 'invalid',
            discount_percentage: '10'
          }
        ]
      }
      const result = formatFormDataToApiData(formDataWithNaN)

      expect(result.volume_discounts![0].max_branches).toBeNull()
    })

    it('should handle falsy boolean values', () => {
      const formDataWithFalse = {
        ...mockFormData,
        is_active: false,
        is_custom: false
      }
      const result = formatFormDataToApiData(formDataWithFalse)

      expect(result.is_active).toBe(false)
      expect(result.is_custom).toBe(false)
    })

    it('should handle invalid numeric strings', () => {
      const formDataWithInvalid = {
        ...mockFormData,
        monthly_price: 'invalid',
        included_devices_count: 'abc'
      }
      const result = formatFormDataToApiData(formDataWithInvalid)

      expect(result.monthly_price).toBe(0)
      expect(result.included_devices_count).toBe(0)
    })
  })

  describe('buildCreatePlanPayload', () => {
    it('should build create plan payload', () => {
      const result = buildCreatePlanPayload(mockFormData)

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('monthly_price')
      expect(result.name).toBe('Enterprise Plan')
    })

    it('should be equivalent to formatFormDataToApiData', () => {
      const result1 = buildCreatePlanPayload(mockFormData)
      const result2 = formatFormDataToApiData(mockFormData)

      expect(result1).toEqual(result2)
    })

    it('should handle all form fields', () => {
      const result = buildCreatePlanPayload(mockFormData)

      expect(result.monthly_fee_our_gateway).toBe(199.99)
      expect(result.feature_ids).toEqual([1, 2])
      expect(result.addon_assignments).toHaveLength(1)
      expect(result.volume_discounts).toHaveLength(1)
    })
  })

  describe('buildUpdatePlanPayload', () => {
    it('should build payload with only changed fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        name: 'Updated Plan Name'
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result).toHaveProperty('name')
      expect(result.name).toBe('Updated Plan Name')
      expect(Object.keys(result)).toHaveLength(1)
    })

    it('should trim string fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        name: '  Updated Plan  ',
        description: '  Test Description  '
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.name).toBe('Updated Plan')
      expect(result.description).toBe('Test Description')
    })

    it('should handle boolean fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        is_active: false,
        is_custom: true
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.is_active).toBe(false)
      expect(result.is_custom).toBe(true)
    })

    it('should convert numeric string fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        monthly_fee_our_gateway: '249.99',
        monthly_price: '299.99'
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.monthly_fee_our_gateway).toBe(249.99)
      expect(result.monthly_price).toBe(299.99)
    })

    it('should handle all pricing fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        monthly_fee_our_gateway: '199.99',
        monthly_fee_byo_processor: '149.99',
        card_processing_fee_percentage: '2.5',
        card_processing_fee_fixed: '0.30',
        monthly_price: '199.99',
        annual_discount_percentage: '10'
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.monthly_fee_our_gateway).toBe(199.99)
      expect(result.monthly_fee_byo_processor).toBe(149.99)
      expect(result.card_processing_fee_percentage).toBe(2.5)
      expect(result.card_processing_fee_fixed).toBe(0.30)
      expect(result.monthly_price).toBe(199.99)
      expect(result.annual_discount_percentage).toBe(10)
    })

    it('should convert integer fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        included_devices_count: '10',
        max_users_per_branch: '50',
        additional_device_cost: '30.00'
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.included_devices_count).toBe(10)
      expect(result.max_users_per_branch).toBe(50)
      expect(result.additional_device_cost).toBe(30.00)
    })

    it('should handle included_branches_count with value', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        included_branches_count: '5'
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.included_branches_count).toBe(5)
    })

    it('should handle included_branches_count as empty string', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        included_branches_count: ''
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.included_branches_count).toBeNull()
    })

    it('should handle array fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        feature_ids: [1, 2, 3],
        support_sla_ids: [100, 200]
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.feature_ids).toEqual([1, 2, 3])
      expect(result.support_sla_ids).toEqual([100, 200])
    })

    it('should not include undefined array fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        feature_ids: undefined,
        addon_assignments: undefined
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result).not.toHaveProperty('feature_ids')
      expect(result).not.toHaveProperty('addon_assignments')
    })

    it('should handle addon assignments', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        addon_assignments: [
          {
            addon_id: 20,
            default_quantity: 2,
            is_included: false,
            feature_level: 'custom',
            min_quantity: 1,
            max_quantity: 5
          }
        ]
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.addon_assignments).toHaveLength(1)
      expect(result.addon_assignments![0].addon_id).toBe(20)
    })

    it('should transform volume discounts', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        volume_discounts: [
          {
            id: 2000,
            name: 'New Tier',
            min_branches: '3',
            max_branches: '8',
            discount_percentage: '15'
          }
        ]
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.volume_discounts).toHaveLength(1)
      expect(result.volume_discounts![0].id).toBe(2000)
      expect(result.volume_discounts![0].min_branches).toBe(3)
      expect(result.volume_discounts![0].max_branches).toBe(8)
      expect(result.volume_discounts![0].discount_percentage).toBe(15)
    })

    it('should handle volume discount without id', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        volume_discounts: [
          {
            name: 'New Tier',
            min_branches: '3',
            max_branches: '8',
            discount_percentage: '15'
          }
        ]
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.volume_discounts![0].id).toBeUndefined()
    })

    it('should handle empty changed fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {}

      const result = buildUpdatePlanPayload(changedFields)

      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should handle empty string values as 0 for numbers', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        monthly_price: '',
        included_devices_count: ''
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.monthly_price).toBe(0)
      expect(result.included_devices_count).toBe(0)
    })

    it('should not include undefined fields', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        name: 'Updated',
        description: undefined
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result).toHaveProperty('name')
      expect(result).not.toHaveProperty('description')
    })

    it('should handle multiple field updates', () => {
      const changedFields: Partial<CreatePlanFormData> = {
        name: 'New Name',
        monthly_price: '299.99',
        is_active: false,
        feature_ids: [5, 6, 7]
      }

      const result = buildUpdatePlanPayload(changedFields)

      expect(result.name).toBe('New Name')
      expect(result.monthly_price).toBe(299.99)
      expect(result.is_active).toBe(false)
      expect(result.feature_ids).toEqual([5, 6, 7])
      expect(Object.keys(result)).toHaveLength(4)
    })
  })

  describe('Integration Tests', () => {
    it('should convert from API to form and back to API', () => {
      const formData = formatApiDataToFormData(mockApiPlanData)
      const apiData = formatFormDataToApiData(formData)

      /* Core fields should match */
      expect(apiData.name).toBe(mockApiPlanData.name)
      expect(apiData.description).toBe(mockApiPlanData.description)
      expect(apiData.monthly_price).toBe(mockApiPlanData.monthly_price)
      expect(apiData.included_devices_count).toBe(mockApiPlanData.included_devices_count)
    })

    it('should handle round-trip conversion with arrays', () => {
      const formData = formatApiDataToFormData(mockApiPlanData)
      const apiData = formatFormDataToApiData(formData)

      expect(apiData.feature_ids).toEqual(mockApiPlanData.features.map(f => f.id))
      expect(apiData.support_sla_ids).toEqual(mockApiPlanData.support_sla.map(s => s.id))
    })

    it('should handle create and update payload building', () => {
      const createPayload = buildCreatePlanPayload(mockFormData)
      const updatePayload = buildUpdatePlanPayload({ name: 'Updated Name' })

      expect(createPayload).toHaveProperty('name')
      expect(createPayload).toHaveProperty('monthly_price')
      expect(updatePayload).toHaveProperty('name')
      expect(updatePayload.name).toBe('Updated Name')
    })
  })
})
