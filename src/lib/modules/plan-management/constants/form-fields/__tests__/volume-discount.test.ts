/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaTag, FaCodeBranch, FaPercent } from 'react-icons/fa'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan management module imports */
import { VOLUME_DISCOUNT_FIELD_CONFIG } from '@plan-management/constants/form-fields/volume-discount'

describe('Volume Discount Form Fields Constants', () => {
  describe('VOLUME_DISCOUNT_FIELD_CONFIG', () => {
    it('should be defined', () => {
      expect(VOLUME_DISCOUNT_FIELD_CONFIG).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(VOLUME_DISCOUNT_FIELD_CONFIG)).toBe(true)
    })

    it('should have 4 form fields', () => {
      expect(VOLUME_DISCOUNT_FIELD_CONFIG).toHaveLength(4)
    })

    it('should have unique IDs', () => {
      const ids = VOLUME_DISCOUNT_FIELD_CONFIG.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have sequential IDs starting from 1', () => {
      const ids = VOLUME_DISCOUNT_FIELD_CONFIG.map(field => field.id).sort((a, b) => a - b)
      expect(ids[0]).toBe(1)
      expect(ids[ids.length - 1]).toBe(4)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = VOLUME_DISCOUNT_FIELD_CONFIG.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('Field Structure', () => {
      it('should have consistent structure for all fields', () => {
        VOLUME_DISCOUNT_FIELD_CONFIG.forEach(field => {
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
        VOLUME_DISCOUNT_FIELD_CONFIG.forEach(field => {
          expect(validTypes).toContain(field.type)
        })
      })

      it('should have grid configuration with col_span', () => {
        VOLUME_DISCOUNT_FIELD_CONFIG.forEach(field => {
          expect(field.grid).toHaveProperty('col_span')
          expect(typeof field.grid.col_span).toBe('number')
          expect(field.grid.col_span).toBeGreaterThan(0)
        })
      })
    })

    describe('Discount Name Field', () => {
      const nameField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'name')

      it('should exist', () => {
        expect(nameField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(nameField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(nameField?.label).toBe('Discount Name')
        expect(nameField?.schema_key).toBe('name')
        expect(nameField?.left_icon).toBe(FaTag)
        expect(nameField?.is_required).toBe(true)
        expect(nameField?.is_active).toBe(true)
      })

      it('should have wide grid configuration', () => {
        expect(nameField?.grid.col_span).toBe(4)
      })

      it('should have descriptive placeholder', () => {
        expect(nameField?.placeholder).toBe('Enter discount name')
      })
    })

    describe('Min Branches Field', () => {
      const minBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'min_branches')

      it('should exist', () => {
        expect(minBranchesField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(minBranchesField?.type).toBe(FORM_FIELD_TYPES.NUMBER)
        expect(minBranchesField?.label).toBe('Min Branches')
        expect(minBranchesField?.schema_key).toBe('min_branches')
        expect(minBranchesField?.left_icon).toBe(FaCodeBranch)
        expect(minBranchesField?.is_required).toBe(true)
        expect(minBranchesField?.is_active).toBe(true)
      })

      it('should have narrow grid configuration', () => {
        expect(minBranchesField?.grid.col_span).toBe(2)
      })

      it('should have numeric placeholder', () => {
        expect(minBranchesField?.placeholder).toBe('0')
      })
    })

    describe('Max Branches Field', () => {
      const maxBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'max_branches')

      it('should exist', () => {
        expect(maxBranchesField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(maxBranchesField?.type).toBe(FORM_FIELD_TYPES.NUMBER)
        expect(maxBranchesField?.label).toBe('Max Branches')
        expect(maxBranchesField?.schema_key).toBe('max_branches')
        expect(maxBranchesField?.left_icon).toBe(FaCodeBranch)
        expect(maxBranchesField?.is_required).toBe(false)
        expect(maxBranchesField?.is_active).toBe(true)
      })

      it('should have narrow grid configuration', () => {
        expect(maxBranchesField?.grid.col_span).toBe(2)
      })

      it('should have unlimited placeholder', () => {
        expect(maxBranchesField?.placeholder).toBe('Unlimited')
      })
    })

    describe('Discount Percentage Field', () => {
      const discountField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'discount_percentage')

      it('should exist', () => {
        expect(discountField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(discountField?.type).toBe(FORM_FIELD_TYPES.NUMBER)
        expect(discountField?.label).toBe('Discount (%)')
        expect(discountField?.schema_key).toBe('discount_percentage')
        expect(discountField?.left_icon).toBe(FaPercent)
        expect(discountField?.is_required).toBe(true)
        expect(discountField?.is_active).toBe(true)
      })

      it('should have narrow grid configuration', () => {
        expect(discountField?.grid.col_span).toBe(2)
      })

      it('should have numeric placeholder', () => {
        expect(discountField?.placeholder).toBe('0.00')
      })
    })

    describe('Display Order', () => {
      it('should have sequential display orders', () => {
        const displayOrders = VOLUME_DISCOUNT_FIELD_CONFIG.map(field => field.display_order)
        displayOrders.forEach((order, index) => {
          expect(order).toBe(index + 1)
        })
      })

      it('should be sortable by display_order', () => {
        const sorted = [...VOLUME_DISCOUNT_FIELD_CONFIG].sort((a, b) => a.display_order - b.display_order)
        sorted.forEach((field, index) => {
          expect(field.display_order).toBe(index + 1)
        })
      })
    })

    describe('Required Fields', () => {
      it('should have 3 required fields', () => {
        const requiredFields = VOLUME_DISCOUNT_FIELD_CONFIG.filter(field => field.is_required)
        expect(requiredFields).toHaveLength(3)
      })

      it('should mark name, min_branches, and discount_percentage as required', () => {
        const nameField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'name')
        const minBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'min_branches')
        const discountField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'discount_percentage')

        expect(nameField?.is_required).toBe(true)
        expect(minBranchesField?.is_required).toBe(true)
        expect(discountField?.is_required).toBe(true)
      })

      it('should mark max_branches as optional', () => {
        const maxBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'max_branches')
        expect(maxBranchesField?.is_required).toBe(false)
      })
    })

    describe('Active Fields', () => {
      it('should have all fields active', () => {
        const activeFields = VOLUME_DISCOUNT_FIELD_CONFIG.filter(field => field.is_active)
        expect(activeFields.length).toBe(VOLUME_DISCOUNT_FIELD_CONFIG.length)
      })
    })

    describe('Field Types Distribution', () => {
      it('should have input field', () => {
        const inputFields = VOLUME_DISCOUNT_FIELD_CONFIG.filter(f => f.type === FORM_FIELD_TYPES.INPUT)
        expect(inputFields.length).toBe(1) /* name */
      })

      it('should have number fields', () => {
        const numberFields = VOLUME_DISCOUNT_FIELD_CONFIG.filter(f => f.type === FORM_FIELD_TYPES.NUMBER)
        expect(numberFields.length).toBe(3) /* min_branches, max_branches, discount_percentage */
      })
    })

    describe('Icons', () => {
      it('should have icon for each field', () => {
        VOLUME_DISCOUNT_FIELD_CONFIG.forEach(field => {
          expect(field.left_icon).toBeDefined()
          expect(typeof field.left_icon).toBe('function')
        })
      })

      it('should use tag icon for discount name', () => {
        const nameField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'name')
        expect(nameField?.left_icon).toBe(FaTag)
      })

      it('should use code branch icon for branch fields', () => {
        const minBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'min_branches')
        const maxBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'max_branches')

        expect(minBranchesField?.left_icon).toBe(FaCodeBranch)
        expect(maxBranchesField?.left_icon).toBe(FaCodeBranch)
      })

      it('should use percent icon for discount field', () => {
        const discountField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'discount_percentage')
        expect(discountField?.left_icon).toBe(FaPercent)
      })
    })

    describe('Placeholders', () => {
      it('should have placeholder for each field', () => {
        VOLUME_DISCOUNT_FIELD_CONFIG.forEach(field => {
          expect(field.placeholder).toBeDefined()
          expect(typeof field.placeholder).toBe('string')
          expect(field.placeholder.length).toBeGreaterThan(0)
        })
      })

      it('should have meaningful placeholders', () => {
        const nameField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'name')
        const minBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'min_branches')
        const maxBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'max_branches')
        const discountField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'discount_percentage')

        expect(nameField?.placeholder).toBe('Enter discount name')
        expect(minBranchesField?.placeholder).toBe('0')
        expect(maxBranchesField?.placeholder).toBe('Unlimited')
        expect(discountField?.placeholder).toBe('0.00')
      })
    })

    describe('Grid Configuration', () => {
      it('should have appropriate column spans', () => {
        const nameField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'name')
        const minBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'min_branches')
        const maxBranchesField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'max_branches')
        const discountField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'discount_percentage')

        expect(nameField?.grid.col_span).toBe(4) /* Wide for name */
        expect(minBranchesField?.grid.col_span).toBe(2) /* Narrow for numbers */
        expect(maxBranchesField?.grid.col_span).toBe(2) /* Narrow for numbers */
        expect(discountField?.grid.col_span).toBe(2) /* Narrow for numbers */
      })

      it('should have total of 8 columns when combined', () => {
        const totalCols = VOLUME_DISCOUNT_FIELD_CONFIG.reduce((sum, field) => sum + field.grid.col_span, 0)
        expect(totalCols).toBe(10) /* 4 + 2 + 2 + 2 */
      })
    })

    describe('Label Formatting', () => {
      it('should include percentage symbol for discount field', () => {
        const discountField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'discount_percentage')
        expect(discountField?.label).toContain('%')
      })

      it('should have descriptive labels', () => {
        VOLUME_DISCOUNT_FIELD_CONFIG.forEach(field => {
          expect(field.label.length).toBeGreaterThan(3)
        })
      })
    })

    describe('Business Logic Support', () => {
      it('should support defining discount ranges', () => {
        /* Should have fields to define min and max branches */
        const minField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'min_branches')
        const maxField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'max_branches')

        expect(minField).toBeDefined()
        expect(maxField).toBeDefined()
      })

      it('should allow unlimited max branches', () => {
        const maxField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'max_branches')
        expect(maxField?.is_required).toBe(false)
        expect(maxField?.placeholder).toBe('Unlimited')
      })

      it('should require minimum branches to be set', () => {
        const minField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'min_branches')
        expect(minField?.is_required).toBe(true)
      })

      it('should require discount percentage', () => {
        const discountField = VOLUME_DISCOUNT_FIELD_CONFIG.find(f => f.schema_key === 'discount_percentage')
        expect(discountField?.is_required).toBe(true)
      })
    })
  })
})
