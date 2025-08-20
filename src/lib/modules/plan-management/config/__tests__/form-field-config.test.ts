import { describe, it, expect } from 'vitest'
import {
  FormFieldConfig,
  BASIC_INFO_QUESTIONS,
  PRICING_INFO_QUESTIONS,
  ADDONS_INFO_QUESTIONS,
  FEATURE_CREATE_FORM_CONFIG,
  ADDON_CREATE_FORM_CONFIG,
  SLA_CREATE_FORM_CONFIG,
  VOLUME_DISCOUNT_FIELD_CONFIG
} from '../form-field-config'

describe('Form Field Configuration', () => {
  describe('FormFieldConfig Interface', () => {
    it('should define a proper interface structure', () => {
      // This test validates the interface by checking a sample implementation
      const sampleConfig: FormFieldConfig = {
        id: 1,
        type: 'INPUT',
        label: 'Test Field',
        schema_key: 'test_field',
        is_required: true,
        display_order: 1,
        grid: { col_span: 1 }
      }

      expect(sampleConfig.id).toBeDefined()
      expect(sampleConfig.type).toBeDefined()
      expect(sampleConfig.label).toBeDefined()
      expect(sampleConfig.schema_key).toBeDefined()
      expect(sampleConfig.is_required).toBeDefined()
      expect(sampleConfig.display_order).toBeDefined()
      expect(sampleConfig.grid).toBeDefined()
    })

    it('should support all required field types', () => {
      const validTypes: FormFieldConfig['type'][] = ['INPUT', 'TEXTAREA', 'TOGGLE', 'SELECT']
      
      validTypes.forEach(type => {
        const config: FormFieldConfig = {
          id: 1,
          type,
          label: 'Test',
          schema_key: 'test',
          is_required: true,
          display_order: 1,
          grid: { col_span: 1 }
        }
        
        expect(config.type).toBe(type)
      })
    })
  })

  describe('BASIC_INFO_QUESTIONS Configuration', () => {
    it('should be an array of FormFieldConfig objects', () => {
      expect(Array.isArray(BASIC_INFO_QUESTIONS)).toBe(true)
      expect(BASIC_INFO_QUESTIONS.length).toBeGreaterThan(0)
    })

    it('should have all required properties for each field', () => {
      BASIC_INFO_QUESTIONS.forEach((field, index) => {
        expect(field, `Field at index ${index} failed validation`).toHaveProperty('id')
        expect(field, `Field at index ${index} failed validation`).toHaveProperty('type')
        expect(field, `Field at index ${index} failed validation`).toHaveProperty('label')
        expect(field, `Field at index ${index} failed validation`).toHaveProperty('schema_key')
        expect(field, `Field at index ${index} failed validation`).toHaveProperty('is_required')
        expect(field, `Field at index ${index} failed validation`).toHaveProperty('display_order')
        expect(field, `Field at index ${index} failed validation`).toHaveProperty('grid')
        
        // Type checks
        expect(typeof field.id, `Field at index ${index} failed validation`).toBe('number')
        expect(['INPUT', 'TEXTAREA', 'TOGGLE', 'SELECT'], `Field at index ${index} failed validation`).toContain(field.type)
        expect(typeof field.label, `Field at index ${index} failed validation`).toBe('string')
        expect(typeof field.schema_key, `Field at index ${index} failed validation`).toBe('string')
        expect(typeof field.is_required, `Field at index ${index} failed validation`).toBe('boolean')
        expect(typeof field.display_order, `Field at index ${index} failed validation`).toBe('number')
        expect(typeof field.grid, `Field at index ${index} failed validation`).toBe('object')
        expect(typeof field.grid.col_span, `Field at index ${index} failed validation`).toBe('number')
      })
    })

    it('should have unique IDs and schema keys', () => {
      const ids = BASIC_INFO_QUESTIONS.map(field => field.id)
      const schemaKeys = BASIC_INFO_QUESTIONS.map(field => field.schema_key)
      
      expect(new Set(ids).size).toBe(ids.length)
      expect(new Set(schemaKeys).size).toBe(schemaKeys.length)
    })

    it('should have sequential display orders', () => {
      const displayOrders = BASIC_INFO_QUESTIONS.map(field => field.display_order).sort()
      
      for (let i = 0; i < displayOrders.length; i++) {
        expect(displayOrders[i]).toBe(i + 1)
      }
    })

    it('should have expected basic info fields', () => {
      const expectedFields = [
        'name', 'is_active', 'is_custom', 'description',
        'included_devices_count', 'max_users_per_branch', 'included_branches_count'
      ]

      const schemaKeys = BASIC_INFO_QUESTIONS.map(field => field.schema_key)
      
      expectedFields.forEach(expectedField => {
        expect(schemaKeys).toContain(expectedField)
      })
    })

    it('should have proper toggle configurations', () => {
      const toggleFields = BASIC_INFO_QUESTIONS.filter(field => field.type === 'TOGGLE')
      
      toggleFields.forEach(toggleField => {
        expect(toggleField.toggle_text).toBeDefined()
        expect(toggleField.toggle_text?.true).toBeDefined()
        expect(toggleField.toggle_text?.false).toBeDefined()
        expect(typeof toggleField.toggle_text?.true).toBe('string')
        expect(typeof toggleField.toggle_text?.false).toBe('string')
      })
    })
  })

  describe('PRICING_INFO_QUESTIONS Configuration', () => {
    it('should be an array of FormFieldConfig objects', () => {
      expect(Array.isArray(PRICING_INFO_QUESTIONS)).toBe(true)
      expect(PRICING_INFO_QUESTIONS.length).toBeGreaterThan(0)
    })

    it('should have all pricing-related fields', () => {
      const expectedPricingFields = [
        'monthly_price', 'additional_device_cost', 'annual_discount_percentage',
        'biennial_discount_percentage', 'triennial_discount_percentage',
        'monthly_fee_our_gateway', 'monthly_fee_byo_processor',
        'card_processing_fee_percentage', 'card_processing_fee_fixed'
      ]

      const schemaKeys = PRICING_INFO_QUESTIONS.map(field => field.schema_key)
      
      expectedPricingFields.forEach(expectedField => {
        expect(schemaKeys).toContain(expectedField)
      })
    })

    it('should have monetary fields with proper placeholders', () => {
      const monetaryFields = PRICING_INFO_QUESTIONS.filter(field => 
        field.schema_key.includes('price') || 
        field.schema_key.includes('cost') || 
        field.schema_key.includes('fee')
      )

      monetaryFields.forEach(field => {
        expect(field.placeholder).toMatch(/^\d+\.\d{2}$/) // Should match format like "0.00"
      })
    })

    it('should have percentage fields with proper placeholders', () => {
      const percentageFields = PRICING_INFO_QUESTIONS.filter(field => 
        field.schema_key.includes('percentage') || 
        field.schema_key.includes('discount')
      )

      percentageFields.forEach(field => {
        expect(field.placeholder).toMatch(/^\d+\.\d{2}$/) // Should match format like "0.00"
      })
    })
  })

  describe('ADDONS_INFO_QUESTIONS Configuration', () => {
    it('should be an array of FormFieldConfig objects', () => {
      expect(Array.isArray(ADDONS_INFO_QUESTIONS)).toBe(true)
      expect(ADDONS_INFO_QUESTIONS.length).toBeGreaterThan(0)
    })

    it('should have addon-specific fields', () => {
      const expectedAddonFields = [
        'addon_name', 'feature_level', 'is_included',
        'default_quantity', 'min_quantity', 'max_quantity'
      ]

      const schemaKeys = ADDONS_INFO_QUESTIONS.map(field => field.schema_key)
      
      expectedAddonFields.forEach(expectedField => {
        expect(schemaKeys).toContain(expectedField)
      })
    })

    it('should have disabled addon name field', () => {
      const addonNameField = ADDONS_INFO_QUESTIONS.find(field => field.schema_key === 'addon_name')
      expect(addonNameField).toBeDefined()
      expect(addonNameField?.disabled).toBe(true)
    })

    it('should have feature level select field with proper options', () => {
      const featureLevelField = ADDONS_INFO_QUESTIONS.find(field => field.schema_key === 'feature_level')
      
      expect(featureLevelField).toBeDefined()
      expect(featureLevelField?.type).toBe('SELECT')
      expect(featureLevelField?.values).toBeDefined()
      expect(Array.isArray(featureLevelField?.values)).toBe(true)
      expect(featureLevelField?.values?.length).toBe(2)
      
      const expectedOptions = [
        { label: 'Basic', value: 'basic' },
        { label: 'Custom', value: 'custom' }
      ]
      
      expectedOptions.forEach(expectedOption => {
        const option = featureLevelField?.values?.find(v => v.value === expectedOption.value)
        expect(option).toBeDefined()
        expect(option?.label).toBe(expectedOption.label)
      })
    })
  })

  describe('FEATURE_CREATE_FORM_CONFIG Configuration', () => {
    it('should have feature creation fields', () => {
      const expectedFields = ['name', 'description']
      const schemaKeys = FEATURE_CREATE_FORM_CONFIG.map(field => field.schema_key)
      
      expectedFields.forEach(expectedField => {
        expect(schemaKeys).toContain(expectedField)
      })
    })

    it('should have both fields as required', () => {
      FEATURE_CREATE_FORM_CONFIG.forEach(field => {
        expect(field.is_required).toBe(true)
      })
    })
  })

  describe('ADDON_CREATE_FORM_CONFIG Configuration', () => {
    it('should have addon creation fields', () => {
      const expectedFields = ['name', 'description', 'base_price', 'pricing_scope']
      const schemaKeys = ADDON_CREATE_FORM_CONFIG.map(field => field.schema_key)
      
      expectedFields.forEach(expectedField => {
        expect(schemaKeys).toContain(expectedField)
      })
    })

    it('should have pricing scope select field with proper options', () => {
      const pricingScopeField = ADDON_CREATE_FORM_CONFIG.find(field => field.schema_key === 'pricing_scope')
      
      expect(pricingScopeField).toBeDefined()
      expect(pricingScopeField?.type).toBe('SELECT')
      expect(pricingScopeField?.values).toBeDefined()
      
      const expectedOptions = [
        { value: 'branch', label: 'Branch' },
        { value: 'organization', label: 'Organization' }
      ]
      
      expectedOptions.forEach(expectedOption => {
        const option = pricingScopeField?.values?.find(v => v.value === expectedOption.value)
        expect(option).toBeDefined()
        expect(option?.label).toBe(expectedOption.label)
      })
    })
  })

  describe('SLA_CREATE_FORM_CONFIG Configuration', () => {
    it('should have SLA creation fields', () => {
      const expectedFields = [
        'name', 'support_channel', 'response_time_hours', 
        'availability_schedule', 'notes'
      ]
      const schemaKeys = SLA_CREATE_FORM_CONFIG.map(field => field.schema_key)
      
      expectedFields.forEach(expectedField => {
        expect(schemaKeys).toContain(expectedField)
      })
    })

    it('should have notes field as optional', () => {
      const notesField = SLA_CREATE_FORM_CONFIG.find(field => field.schema_key === 'notes')
      expect(notesField).toBeDefined()
      expect(notesField?.is_required).toBe(false)
    })

    it('should have other fields as required except notes', () => {
      const requiredFields = SLA_CREATE_FORM_CONFIG.filter(field => field.schema_key !== 'notes')
      
      requiredFields.forEach(field => {
        expect(field.is_required).toBe(true)
      })
    })
  })

  describe('VOLUME_DISCOUNT_FIELD_CONFIG Configuration', () => {
    it('should have volume discount fields', () => {
      const expectedFields = [
        'name', 'min_branches', 'max_branches', 'discount_percentage'
      ]
      const schemaKeys = VOLUME_DISCOUNT_FIELD_CONFIG.map(field => field.schema_key)
      
      expectedFields.forEach(expectedField => {
        expect(schemaKeys).toContain(expectedField)
      })
    })

    it('should have max_branches as optional', () => {
      const maxBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(field => field.schema_key === 'max_branches')
      expect(maxBranchesField).toBeDefined()
      expect(maxBranchesField?.is_required).toBe(false)
    })
  })

  describe('Cross-Configuration Validation', () => {
    const allConfigs = [
      { name: 'BASIC_INFO_QUESTIONS', config: BASIC_INFO_QUESTIONS },
      { name: 'PRICING_INFO_QUESTIONS', config: PRICING_INFO_QUESTIONS },
      { name: 'ADDONS_INFO_QUESTIONS', config: ADDONS_INFO_QUESTIONS },
      { name: 'FEATURE_CREATE_FORM_CONFIG', config: FEATURE_CREATE_FORM_CONFIG },
      { name: 'ADDON_CREATE_FORM_CONFIG', config: ADDON_CREATE_FORM_CONFIG },
      { name: 'SLA_CREATE_FORM_CONFIG', config: SLA_CREATE_FORM_CONFIG },
      { name: 'VOLUME_DISCOUNT_FIELD_CONFIG', config: VOLUME_DISCOUNT_FIELD_CONFIG }
    ]

    allConfigs.forEach(({ name, config }) => {
      describe(`${name} Validation`, () => {
        it('should have non-empty labels', () => {
          config.forEach((field, index) => {
            expect(field.label.trim().length, `Field at index ${index} in ${name} has empty label`).toBeGreaterThan(0)
          })
        })

        it('should have valid schema keys', () => {
          config.forEach((field, index) => {
            expect(field.schema_key, `Field at index ${index} in ${name} has invalid schema key`).toMatch(/^[a-z][a-z0-9_]*[a-z0-9]$/)
          })
        })

        it('should have positive grid col_span values', () => {
          config.forEach((field, index) => {
            expect(field.grid.col_span, `Field at index ${index} in ${name} has invalid col_span`).toBeGreaterThan(0)
          })
        })

        it('should have unique field IDs within the config', () => {
          const ids = config.map(field => field.id)
          const uniqueIds = new Set(ids)
          expect(uniqueIds.size).toBe(ids.length)
        })
      })
    })
  })
})