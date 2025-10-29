/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaStar, FaFileAlt, FaPuzzlePiece, FaDollarSign, FaHandshake, FaHeadset, FaClock, FaCalendarAlt, FaStickyNote } from 'react-icons/fa'
import { MdCategory } from 'react-icons/md'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan management module imports */
import { FEATURE_FORM_QUESTIONS, ADDON_FORM_QUESTIONS, SLA_FORM_QUESTIONS } from '@plan-management/constants/form-fields/resource-creation'

describe('Resource Creation Form Fields Constants', () => {
  describe('FEATURE_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(FEATURE_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(FEATURE_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 2 form fields', () => {
      expect(FEATURE_FORM_QUESTIONS).toHaveLength(2)
    })

    it('should have unique IDs', () => {
      const ids = FEATURE_FORM_QUESTIONS.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = FEATURE_FORM_QUESTIONS.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('Feature Name Field', () => {
      const nameField = FEATURE_FORM_QUESTIONS.find(f => f.schema_key === 'name')

      it('should exist', () => {
        expect(nameField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(nameField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(nameField?.label).toBe('Feature Name')
        expect(nameField?.schema_key).toBe('name')
        expect(nameField?.left_icon).toBe(FaStar)
        expect(nameField?.is_required).toBe(true)
        expect(nameField?.is_active).toBe(true)
      })

      it('should have grid configuration', () => {
        expect(nameField?.grid.col_span).toBe(8)
      })
    })

    describe('Feature Description Field', () => {
      const descriptionField = FEATURE_FORM_QUESTIONS.find(f => f.schema_key === 'description')

      it('should exist', () => {
        expect(descriptionField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(descriptionField?.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
        expect(descriptionField?.label).toBe('Description')
        expect(descriptionField?.schema_key).toBe('description')
        expect(descriptionField?.left_icon).toBe(FaFileAlt)
        expect(descriptionField?.is_required).toBe(true)
        expect(descriptionField?.is_active).toBe(true)
      })

      it('should have grid configuration', () => {
        expect(descriptionField?.grid.col_span).toBe(8)
      })
    })

    it('should have all fields required', () => {
      const requiredFields = FEATURE_FORM_QUESTIONS.filter(field => field.is_required)
      expect(requiredFields.length).toBe(FEATURE_FORM_QUESTIONS.length)
    })

    it('should have all fields active', () => {
      const activeFields = FEATURE_FORM_QUESTIONS.filter(field => field.is_active)
      expect(activeFields.length).toBe(FEATURE_FORM_QUESTIONS.length)
    })
  })

  describe('ADDON_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(ADDON_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(ADDON_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 4 form fields', () => {
      expect(ADDON_FORM_QUESTIONS).toHaveLength(4)
    })

    it('should have unique IDs', () => {
      const ids = ADDON_FORM_QUESTIONS.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = ADDON_FORM_QUESTIONS.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('Add-on Name Field', () => {
      const nameField = ADDON_FORM_QUESTIONS.find(f => f.schema_key === 'name')

      it('should exist', () => {
        expect(nameField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(nameField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(nameField?.label).toBe('Add-on Name')
        expect(nameField?.schema_key).toBe('name')
        expect(nameField?.left_icon).toBe(FaPuzzlePiece)
        expect(nameField?.is_required).toBe(true)
        expect(nameField?.is_active).toBe(true)
      })

      it('should have wide grid configuration', () => {
        expect(nameField?.grid.col_span).toBe(8)
      })
    })

    describe('Add-on Description Field', () => {
      const descriptionField = ADDON_FORM_QUESTIONS.find(f => f.schema_key === 'description')

      it('should exist', () => {
        expect(descriptionField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(descriptionField?.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
        expect(descriptionField?.label).toBe('Description')
        expect(descriptionField?.schema_key).toBe('description')
        expect(descriptionField?.left_icon).toBe(FaFileAlt)
        expect(descriptionField?.is_required).toBe(true)
        expect(descriptionField?.is_active).toBe(true)
      })

      it('should have wide grid configuration', () => {
        expect(descriptionField?.grid.col_span).toBe(8)
      })
    })

    describe('Base Price Field', () => {
      const basePriceField = ADDON_FORM_QUESTIONS.find(f => f.schema_key === 'base_price')

      it('should exist', () => {
        expect(basePriceField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(basePriceField?.type).toBe(FORM_FIELD_TYPES.NUMBER)
        expect(basePriceField?.label).toBe('Base Price ($)')
        expect(basePriceField?.schema_key).toBe('base_price')
        expect(basePriceField?.left_icon).toBe(FaDollarSign)
        expect(basePriceField?.is_required).toBe(false)
        expect(basePriceField?.is_active).toBe(true)
      })

      it('should have half-width grid configuration', () => {
        expect(basePriceField?.grid.col_span).toBe(4)
      })

      it('should have numeric placeholder', () => {
        expect(basePriceField?.placeholder).toBe('0.00')
      })
    })

    describe('Pricing Scope Field', () => {
      const pricingScopeField = ADDON_FORM_QUESTIONS.find(f => f.schema_key === 'pricing_scope')

      it('should exist', () => {
        expect(pricingScopeField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(pricingScopeField?.type).toBe(FORM_FIELD_TYPES.SELECT)
        expect(pricingScopeField?.label).toBe('Pricing Scope')
        expect(pricingScopeField?.schema_key).toBe('pricing_scope')
        expect(pricingScopeField?.left_icon).toBe(MdCategory)
        expect(pricingScopeField?.is_required).toBe(true)
        expect(pricingScopeField?.is_active).toBe(true)
      })

      it('should have predefined values', () => {
        expect(pricingScopeField).toHaveProperty('values')
        expect(Array.isArray(pricingScopeField?.values)).toBe(true)
        expect(pricingScopeField?.values).toHaveLength(2)
      })

      it('should have branch and organization options', () => {
        const branchOption = pricingScopeField?.values?.find((v: { value: string }) => v.value === 'branch')
        const orgOption = pricingScopeField?.values?.find((v: { value: string }) => v.value === 'organization')

        expect(branchOption).toBeDefined()
        expect(branchOption?.label).toBe('Branch')
        expect(orgOption).toBeDefined()
        expect(orgOption?.label).toBe('Organization')
      })

      it('should have half-width grid configuration', () => {
        expect(pricingScopeField?.grid.col_span).toBe(4)
      })
    })

    describe('Required Fields', () => {
      it('should have name, description, and pricing_scope as required', () => {
        const requiredFields = ADDON_FORM_QUESTIONS.filter(field => field.is_required)
        expect(requiredFields).toHaveLength(3)

        const requiredKeys = requiredFields.map(f => f.schema_key)
        expect(requiredKeys).toContain('name')
        expect(requiredKeys).toContain('description')
        expect(requiredKeys).toContain('pricing_scope')
      })

      it('should have base_price as optional', () => {
        const basePriceField = ADDON_FORM_QUESTIONS.find(f => f.schema_key === 'base_price')
        expect(basePriceField?.is_required).toBe(false)
      })
    })

    it('should have all fields active', () => {
      const activeFields = ADDON_FORM_QUESTIONS.filter(field => field.is_active)
      expect(activeFields.length).toBe(ADDON_FORM_QUESTIONS.length)
    })
  })

  describe('SLA_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(SLA_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(SLA_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 5 form fields', () => {
      expect(SLA_FORM_QUESTIONS).toHaveLength(5)
    })

    it('should have unique IDs', () => {
      const ids = SLA_FORM_QUESTIONS.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = SLA_FORM_QUESTIONS.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('SLA Name Field', () => {
      const nameField = SLA_FORM_QUESTIONS.find(f => f.schema_key === 'name')

      it('should exist', () => {
        expect(nameField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(nameField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(nameField?.label).toBe('SLA Name')
        expect(nameField?.schema_key).toBe('name')
        expect(nameField?.left_icon).toBe(FaHandshake)
        expect(nameField?.is_required).toBe(true)
        expect(nameField?.is_active).toBe(true)
      })

      it('should have grid configuration', () => {
        expect(nameField?.grid.col_span).toBe(4)
      })
    })

    describe('Support Channel Field', () => {
      const supportChannelField = SLA_FORM_QUESTIONS.find(f => f.schema_key === 'support_channel')

      it('should exist', () => {
        expect(supportChannelField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(supportChannelField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(supportChannelField?.label).toBe('Support Channel')
        expect(supportChannelField?.schema_key).toBe('support_channel')
        expect(supportChannelField?.left_icon).toBe(FaHeadset)
        expect(supportChannelField?.is_required).toBe(true)
        expect(supportChannelField?.is_active).toBe(true)
      })

      it('should have descriptive placeholder', () => {
        expect(supportChannelField?.placeholder).toBe('e.g., Email, Phone, Chat')
      })
    })

    describe('Response Time Field', () => {
      const responseTimeField = SLA_FORM_QUESTIONS.find(f => f.schema_key === 'response_time_hours')

      it('should exist', () => {
        expect(responseTimeField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(responseTimeField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(responseTimeField?.label).toBe('Response Time (hours)')
        expect(responseTimeField?.schema_key).toBe('response_time_hours')
        expect(responseTimeField?.left_icon).toBe(FaClock)
        expect(responseTimeField?.is_required).toBe(true)
        expect(responseTimeField?.is_active).toBe(true)
      })

      it('should have numeric placeholder', () => {
        expect(responseTimeField?.placeholder).toBe('e.g., 24')
      })
    })

    describe('Availability Schedule Field', () => {
      const availabilityField = SLA_FORM_QUESTIONS.find(f => f.schema_key === 'availability_schedule')

      it('should exist', () => {
        expect(availabilityField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(availabilityField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(availabilityField?.label).toBe('Availability Schedule')
        expect(availabilityField?.schema_key).toBe('availability_schedule')
        expect(availabilityField?.left_icon).toBe(FaCalendarAlt)
        expect(availabilityField?.is_required).toBe(true)
        expect(availabilityField?.is_active).toBe(true)
      })

      it('should have descriptive placeholder', () => {
        expect(availabilityField?.placeholder).toBe('e.g., 24/7, Business Hours')
      })
    })

    describe('Notes Field', () => {
      const notesField = SLA_FORM_QUESTIONS.find(f => f.schema_key === 'notes')

      it('should exist', () => {
        expect(notesField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(notesField?.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
        expect(notesField?.label).toBe('Notes (Optional)')
        expect(notesField?.schema_key).toBe('notes')
        expect(notesField?.left_icon).toBe(FaStickyNote)
        expect(notesField?.is_required).toBe(false)
        expect(notesField?.is_active).toBe(true)
      })

      it('should have wide grid configuration', () => {
        expect(notesField?.grid.col_span).toBe(8)
      })
    })

    describe('Required Fields', () => {
      it('should have 4 required fields', () => {
        const requiredFields = SLA_FORM_QUESTIONS.filter(field => field.is_required)
        expect(requiredFields).toHaveLength(4)
      })

      it('should have notes as optional', () => {
        const notesField = SLA_FORM_QUESTIONS.find(f => f.schema_key === 'notes')
        expect(notesField?.is_required).toBe(false)
      })
    })

    it('should have all fields active', () => {
      const activeFields = SLA_FORM_QUESTIONS.filter(field => field.is_active)
      expect(activeFields.length).toBe(SLA_FORM_QUESTIONS.length)
    })
  })

  describe('Common Structure Across Forms', () => {
    const allForms = [
      { name: 'FEATURE', fields: FEATURE_FORM_QUESTIONS },
      { name: 'ADDON', fields: ADDON_FORM_QUESTIONS },
      { name: 'SLA', fields: SLA_FORM_QUESTIONS }
    ]

    allForms.forEach(({ name, fields }) => {
      describe(`${name}_FORM_QUESTIONS`, () => {
        it('should have consistent structure for all fields', () => {
          fields.forEach((field: any) => {
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

        it('should have name field', () => {
          const nameField = fields.find((f: any) => f.schema_key === 'name')
          expect(nameField).toBeDefined()
          expect(nameField?.is_required).toBe(true)
        })

        it('should have description field', () => {
          const descField = fields.find((f: any) => f.schema_key === 'description' || f.schema_key === 'notes')
          expect(descField).toBeDefined()
        })

        it('should have valid field types', () => {
          const validTypes = Object.values(FORM_FIELD_TYPES)
          fields.forEach((field: any) => {
            expect(validTypes).toContain(field.type)
          })
        })

        it('should have icons for all fields', () => {
          fields.forEach((field: any) => {
            expect(field.left_icon).toBeDefined()
            expect(typeof field.left_icon).toBe('function')
          })
        })

        it('should have sequential display orders', () => {
          const displayOrders = fields.map((field: any) => field.display_order)
          displayOrders.forEach((order: number, index: number) => {
            expect(order).toBe(index + 1)
          })
        })
      })
    })
  })
})
