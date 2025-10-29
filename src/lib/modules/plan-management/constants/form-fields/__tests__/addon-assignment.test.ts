/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaPuzzlePiece, FaLayerGroup, FaToggleOn, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa'
import { MdNumbers } from 'react-icons/md'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan management module imports */
import { ADDONS_INFO_QUESTIONS } from '@plan-management/constants/form-fields/addon-assignment'

describe('Addon Assignment Form Fields Constants', () => {
  describe('ADDONS_INFO_QUESTIONS', () => {
    it('should be defined', () => {
      expect(ADDONS_INFO_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(ADDONS_INFO_QUESTIONS)).toBe(true)
    })

    it('should have 6 form fields', () => {
      expect(ADDONS_INFO_QUESTIONS).toHaveLength(6)
    })

    it('should have unique IDs', () => {
      const ids = ADDONS_INFO_QUESTIONS.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have sequential IDs starting from 1', () => {
      const ids = ADDONS_INFO_QUESTIONS.map(field => field.id).sort((a, b) => a - b)
      expect(ids[0]).toBe(1)
      expect(ids[ids.length - 1]).toBe(6)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = ADDONS_INFO_QUESTIONS.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('Field Structure', () => {
      it('should have consistent structure for all fields', () => {
        ADDONS_INFO_QUESTIONS.forEach(field => {
          expect(field).toHaveProperty('id')
          expect(field).toHaveProperty('type')
          expect(field).toHaveProperty('label')
          expect(field).toHaveProperty('schema_key')
          expect(field).toHaveProperty('placeholder')
          expect(field).toHaveProperty('left_icon')
          expect(field).toHaveProperty('is_required')
          expect(field).toHaveProperty('is_active')
          expect(field).toHaveProperty('display_order')
          expect(field).toHaveProperty('grid')
        })
      })

      it('should have valid field types', () => {
        const validTypes = Object.values(FORM_FIELD_TYPES)
        ADDONS_INFO_QUESTIONS.forEach(field => {
          expect(validTypes).toContain(field.type)
        })
      })

      it('should have grid configuration with col_span', () => {
        ADDONS_INFO_QUESTIONS.forEach(field => {
          expect(field.grid).toHaveProperty('col_span')
          expect(typeof field.grid.col_span).toBe('number')
          expect(field.grid.col_span).toBeGreaterThan(0)
        })
      })
    })

    describe('Add-on Name Field', () => {
      const addonNameField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'addon_name')

      it('should exist', () => {
        expect(addonNameField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(addonNameField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(addonNameField?.label).toBe('Add-on Name')
        expect(addonNameField?.schema_key).toBe('addon_name')
        expect(addonNameField?.left_icon).toBe(FaPuzzlePiece)
        expect(addonNameField?.is_required).toBe(false)
        expect(addonNameField?.is_active).toBe(true)
      })

      it('should be disabled', () => {
        expect(addonNameField).toHaveProperty('disabled')
        expect(addonNameField?.disabled).toBe(true)
      })
    })

    describe('Feature Level Field', () => {
      const featureLevelField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'feature_level')

      it('should exist', () => {
        expect(featureLevelField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(featureLevelField?.type).toBe(FORM_FIELD_TYPES.SELECT)
        expect(featureLevelField?.label).toBe('Feature Level')
        expect(featureLevelField?.schema_key).toBe('feature_level')
        expect(featureLevelField?.left_icon).toBe(FaLayerGroup)
        expect(featureLevelField?.is_required).toBe(true)
        expect(featureLevelField?.is_active).toBe(true)
      })

      it('should have predefined values', () => {
        expect(featureLevelField).toHaveProperty('values')
        expect(Array.isArray(featureLevelField?.values)).toBe(true)
        expect(featureLevelField?.values).toHaveLength(2)
      })

      it('should have basic and custom options', () => {
        const basicOption = featureLevelField?.values?.find((v: { value: string }) => v.value === 'basic')
        const customOption = featureLevelField?.values?.find((v: { value: string }) => v.value === 'custom')

        expect(basicOption).toBeDefined()
        expect(basicOption?.label).toBe('Basic')
        expect(customOption).toBeDefined()
        expect(customOption?.label).toBe('Custom')
      })
    })

    describe('Is Included Field', () => {
      const isIncludedField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'is_included')

      it('should exist', () => {
        expect(isIncludedField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(isIncludedField?.type).toBe(FORM_FIELD_TYPES.TOGGLE)
        expect(isIncludedField?.label).toBe('Is Included')
        expect(isIncludedField?.schema_key).toBe('is_included')
        expect(isIncludedField?.left_icon).toBe(FaToggleOn)
        expect(isIncludedField?.is_required).toBe(false)
        expect(isIncludedField?.is_active).toBe(true)
      })

      it('should have toggle text', () => {
        expect(isIncludedField).toHaveProperty('toggle_text')
        expect(isIncludedField?.toggle_text).toHaveProperty('true')
        expect(isIncludedField?.toggle_text).toHaveProperty('false')
        expect(isIncludedField?.toggle_text?.true).toBe('Included')
        expect(isIncludedField?.toggle_text?.false).toBe('Optional')
      })
    })

    describe('Quantity Fields', () => {
      it('should have default quantity field', () => {
        const field = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'default_quantity')
        expect(field).toBeDefined()
        expect(field?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(field?.label).toBe('Default Quantity')
        expect(field?.left_icon).toBe(MdNumbers)
        expect(field?.is_required).toBe(false)
        expect(field?.is_active).toBe(true)
      })

      it('should have min quantity field', () => {
        const field = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'min_quantity')
        expect(field).toBeDefined()
        expect(field?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(field?.label).toBe('Min Quantity')
        expect(field?.left_icon).toBe(FaSortNumericDown)
        expect(field?.is_required).toBe(false)
        expect(field?.is_active).toBe(true)
      })

      it('should have max quantity field', () => {
        const field = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'max_quantity')
        expect(field).toBeDefined()
        expect(field?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(field?.label).toBe('Max Quantity')
        expect(field?.left_icon).toBe(FaSortNumericUp)
        expect(field?.is_required).toBe(false)
        expect(field?.is_active).toBe(true)
      })

      it('should have appropriate placeholders', () => {
        const defaultQtyField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'default_quantity')
        const minQtyField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'min_quantity')
        const maxQtyField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'max_quantity')

        expect(defaultQtyField?.placeholder).toBe('0')
        expect(minQtyField?.placeholder).toBe('0')
        expect(maxQtyField?.placeholder).toBe('Unlimited')
      })
    })

    describe('Display Order', () => {
      it('should have sequential display orders', () => {
        const displayOrders = ADDONS_INFO_QUESTIONS.map(field => field.display_order)
        displayOrders.forEach((order, index) => {
          expect(order).toBe(index + 1)
        })
      })

      it('should be sortable by display_order', () => {
        const sorted = [...ADDONS_INFO_QUESTIONS].sort((a, b) => a.display_order - b.display_order)
        sorted.forEach((field, index) => {
          expect(field.display_order).toBe(index + 1)
        })
      })
    })

    describe('Required Fields', () => {
      it('should have only feature_level as required', () => {
        const requiredFields = ADDONS_INFO_QUESTIONS.filter(field => field.is_required)
        expect(requiredFields).toHaveLength(1)
        expect(requiredFields[0].schema_key).toBe('feature_level')
      })

      it('should have quantity fields as optional', () => {
        const defaultQtyField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'default_quantity')
        const minQtyField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'min_quantity')
        const maxQtyField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'max_quantity')

        expect(defaultQtyField?.is_required).toBe(false)
        expect(minQtyField?.is_required).toBe(false)
        expect(maxQtyField?.is_required).toBe(false)
      })
    })

    describe('Active Fields', () => {
      it('should have all fields active', () => {
        const activeFields = ADDONS_INFO_QUESTIONS.filter(field => field.is_active)
        expect(activeFields.length).toBe(ADDONS_INFO_QUESTIONS.length)
      })
    })

    describe('Field Types Distribution', () => {
      it('should have input fields', () => {
        const inputFields = ADDONS_INFO_QUESTIONS.filter(f => f.type === FORM_FIELD_TYPES.INPUT)
        expect(inputFields.length).toBe(4) /* addon_name, default_quantity, min_quantity, max_quantity */
      })

      it('should have select field', () => {
        const selectFields = ADDONS_INFO_QUESTIONS.filter(f => f.type === FORM_FIELD_TYPES.SELECT)
        expect(selectFields.length).toBe(1) /* feature_level */
      })

      it('should have toggle field', () => {
        const toggleFields = ADDONS_INFO_QUESTIONS.filter(f => f.type === FORM_FIELD_TYPES.TOGGLE)
        expect(toggleFields.length).toBe(1) /* is_included */
      })
    })

    describe('Icons', () => {
      it('should have icon for each field', () => {
        ADDONS_INFO_QUESTIONS.forEach(field => {
          expect(field.left_icon).toBeDefined()
          expect(typeof field.left_icon).toBe('function')
        })
      })

      it('should use appropriate icons for quantity fields', () => {
        const minQtyField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'min_quantity')
        const maxQtyField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'max_quantity')

        expect(minQtyField?.left_icon).toBe(FaSortNumericDown)
        expect(maxQtyField?.left_icon).toBe(FaSortNumericUp)
      })
    })

    describe('Placeholders', () => {
      it('should have placeholder for each field', () => {
        ADDONS_INFO_QUESTIONS.forEach(field => {
          expect(field.placeholder).toBeDefined()
          expect(typeof field.placeholder).toBe('string')
        })
      })

      it('should have meaningful placeholders', () => {
        ADDONS_INFO_QUESTIONS.forEach(field => {
          if (field.type !== FORM_FIELD_TYPES.TOGGLE) {
            expect(field.placeholder.length).toBeGreaterThan(0)
          }
        })
      })
    })

    describe('Grid Configuration', () => {
      it('should use single column layout', () => {
        ADDONS_INFO_QUESTIONS.forEach(field => {
          expect(field.grid.col_span).toBe(1)
        })
      })
    })

    describe('Disabled Fields', () => {
      it('should have addon_name field disabled', () => {
        const addonNameField = ADDONS_INFO_QUESTIONS.find(f => f.schema_key === 'addon_name')
        expect(addonNameField?.disabled).toBe(true)
      })

      it('should not have other fields disabled', () => {
        const otherFields = ADDONS_INFO_QUESTIONS.filter(f => f.schema_key !== 'addon_name')
        otherFields.forEach(field => {
          expect(field.disabled).toBeUndefined()
        })
      })
    })
  })
})
