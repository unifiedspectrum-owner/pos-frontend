/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaInfoCircle, FaFileAlt, FaToggleOn, FaLayerGroup, FaUsers, FaCodeBranch } from 'react-icons/fa'
import { MdDevices } from 'react-icons/md'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan management module imports */
import { BASIC_INFO_QUESTIONS } from '@plan-management/constants/form-fields/basic-info'

describe('Basic Info Form Fields Constants', () => {
  describe('BASIC_INFO_QUESTIONS', () => {
    it('should be defined', () => {
      expect(BASIC_INFO_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(BASIC_INFO_QUESTIONS)).toBe(true)
    })

    it('should have 7 form fields', () => {
      expect(BASIC_INFO_QUESTIONS).toHaveLength(7)
    })

    it('should have unique IDs', () => {
      const ids = BASIC_INFO_QUESTIONS.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have sequential IDs starting from 1', () => {
      const ids = BASIC_INFO_QUESTIONS.map(field => field.id).sort((a, b) => a - b)
      expect(ids[0]).toBe(1)
      expect(ids[ids.length - 1]).toBe(7)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = BASIC_INFO_QUESTIONS.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('Field Structure', () => {
      it('should have consistent structure for all fields', () => {
        BASIC_INFO_QUESTIONS.forEach(field => {
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
        BASIC_INFO_QUESTIONS.forEach(field => {
          expect(validTypes).toContain(field.type)
        })
      })

      it('should have grid configuration with col_span', () => {
        BASIC_INFO_QUESTIONS.forEach(field => {
          expect(field.grid).toHaveProperty('col_span')
          expect(typeof field.grid.col_span).toBe('number')
          expect(field.grid.col_span).toBeGreaterThan(0)
        })
      })

      it('should have boolean is_required property', () => {
        BASIC_INFO_QUESTIONS.forEach(field => {
          expect(typeof field.is_required).toBe('boolean')
        })
      })

      it('should have boolean is_active property', () => {
        BASIC_INFO_QUESTIONS.forEach(field => {
          expect(typeof field.is_active).toBe('boolean')
        })
      })
    })

    describe('Plan Name Field', () => {
      const nameField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'name')

      it('should exist', () => {
        expect(nameField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(nameField?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(nameField?.label).toBe('Plan Name')
        expect(nameField?.schema_key).toBe('name')
        expect(nameField?.left_icon).toBe(FaInfoCircle)
        expect(nameField?.is_required).toBe(true)
        expect(nameField?.is_active).toBe(true)
      })

      it('should have grid configuration', () => {
        expect(nameField?.grid.col_span).toBe(1)
      })
    })

    describe('Status Field', () => {
      const statusField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'is_active')

      it('should exist', () => {
        expect(statusField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(statusField?.type).toBe(FORM_FIELD_TYPES.TOGGLE)
        expect(statusField?.label).toBe('Status')
        expect(statusField?.schema_key).toBe('is_active')
        expect(statusField?.left_icon).toBe(FaToggleOn)
        expect(statusField?.is_required).toBe(false)
        expect(statusField?.is_active).toBe(true)
      })

      it('should have toggle text', () => {
        expect(statusField).toHaveProperty('toggle_text')
        expect(statusField?.toggle_text).toHaveProperty('true')
        expect(statusField?.toggle_text).toHaveProperty('false')
        expect(statusField?.toggle_text?.true).toBe('Active')
        expect(statusField?.toggle_text?.false).toBe('Inactive')
      })

      it('should have grid configuration', () => {
        expect(statusField?.grid.col_span).toBe(1)
      })
    })

    describe('Plan Type Field', () => {
      const planTypeField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'is_custom')

      it('should exist', () => {
        expect(planTypeField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(planTypeField?.type).toBe(FORM_FIELD_TYPES.TOGGLE)
        expect(planTypeField?.label).toBe('Plan Type')
        expect(planTypeField?.schema_key).toBe('is_custom')
        expect(planTypeField?.left_icon).toBe(FaLayerGroup)
        expect(planTypeField?.is_required).toBe(false)
        expect(planTypeField?.is_active).toBe(true)
      })

      it('should have toggle text', () => {
        expect(planTypeField).toHaveProperty('toggle_text')
        expect(planTypeField?.toggle_text?.true).toBe('Custom Plan')
        expect(planTypeField?.toggle_text?.false).toBe('Regular Plan')
      })
    })

    describe('Description Field', () => {
      const descriptionField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'description')

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

      it('should have wider grid configuration', () => {
        expect(descriptionField?.grid.col_span).toBe(3)
      })
    })

    describe('Device and User Limit Fields', () => {
      it('should have included devices count field', () => {
        const field = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'included_devices_count')
        expect(field).toBeDefined()
        expect(field?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(field?.label).toBe('Included Devices Count')
        expect(field?.left_icon).toBe(MdDevices)
        expect(field?.is_required).toBe(true)
      })

      it('should have max users per branch field', () => {
        const field = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'max_users_per_branch')
        expect(field).toBeDefined()
        expect(field?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(field?.label).toBe('Max Users Per Branch')
        expect(field?.left_icon).toBe(FaUsers)
        expect(field?.is_required).toBe(true)
      })

      it('should have included branches count field', () => {
        const field = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'included_branches_count')
        expect(field).toBeDefined()
        expect(field?.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(field?.label).toBe('Included Branches Count')
        expect(field?.left_icon).toBe(FaCodeBranch)
        expect(field?.is_required).toBe(true)
      })
    })

    describe('Display Order', () => {
      it('should have sequential display orders', () => {
        const displayOrders = BASIC_INFO_QUESTIONS.map(field => field.display_order)
        displayOrders.forEach((order, index) => {
          expect(order).toBe(index + 1)
        })
      })

      it('should be sortable by display_order', () => {
        const sorted = [...BASIC_INFO_QUESTIONS].sort((a, b) => a.display_order - b.display_order)
        sorted.forEach((field, index) => {
          expect(field.display_order).toBe(index + 1)
        })
      })
    })

    describe('Required Fields', () => {
      it('should have at least one required field', () => {
        const requiredFields = BASIC_INFO_QUESTIONS.filter(field => field.is_required)
        expect(requiredFields.length).toBeGreaterThan(0)
      })

      it('should mark core fields as required', () => {
        const nameField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'name')
        const descriptionField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'description')

        expect(nameField?.is_required).toBe(true)
        expect(descriptionField?.is_required).toBe(true)
      })

      it('should mark toggle fields as optional', () => {
        const statusField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'is_active')
        const planTypeField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'is_custom')

        expect(statusField?.is_required).toBe(false)
        expect(planTypeField?.is_required).toBe(false)
      })
    })

    describe('Active Fields', () => {
      it('should have all fields active', () => {
        const activeFields = BASIC_INFO_QUESTIONS.filter(field => field.is_active)
        expect(activeFields.length).toBe(BASIC_INFO_QUESTIONS.length)
      })
    })

    describe('Field Types Distribution', () => {
      it('should have input fields', () => {
        const inputFields = BASIC_INFO_QUESTIONS.filter(f => f.type === FORM_FIELD_TYPES.INPUT)
        expect(inputFields.length).toBeGreaterThan(0)
      })

      it('should have toggle fields', () => {
        const toggleFields = BASIC_INFO_QUESTIONS.filter(f => f.type === FORM_FIELD_TYPES.TOGGLE)
        expect(toggleFields.length).toBe(2) /* Status and Plan Type */
      })

      it('should have textarea field', () => {
        const textareaFields = BASIC_INFO_QUESTIONS.filter(f => f.type === FORM_FIELD_TYPES.TEXTAREA)
        expect(textareaFields.length).toBe(1) /* Description */
      })
    })

    describe('Icons', () => {
      it('should have icon for each field', () => {
        BASIC_INFO_QUESTIONS.forEach(field => {
          expect(field.left_icon).toBeDefined()
          expect(typeof field.left_icon).toBe('function')
        })
      })

      it('should use appropriate icons', () => {
        const nameField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'name')
        const devicesField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'included_devices_count')
        const usersField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'max_users_per_branch')
        const branchesField = BASIC_INFO_QUESTIONS.find(f => f.schema_key === 'included_branches_count')

        expect(nameField?.left_icon).toBe(FaInfoCircle)
        expect(devicesField?.left_icon).toBe(MdDevices)
        expect(usersField?.left_icon).toBe(FaUsers)
        expect(branchesField?.left_icon).toBe(FaCodeBranch)
      })
    })

    describe('Placeholders', () => {
      it('should have placeholder for each field', () => {
        BASIC_INFO_QUESTIONS.forEach(field => {
          expect(field.placeholder).toBeDefined()
          expect(typeof field.placeholder).toBe('string')
        })
      })

      it('should have meaningful placeholders', () => {
        BASIC_INFO_QUESTIONS.forEach(field => {
          if (field.type !== FORM_FIELD_TYPES.TOGGLE) {
            expect(field.placeholder.length).toBeGreaterThan(0)
          }
        })
      })
    })
  })
})
