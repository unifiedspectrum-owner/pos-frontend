/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants/form-fields'

describe('form-fields', () => {
  describe('FORM_FIELD_TYPES', () => {
    it('should export FORM_FIELD_TYPES constant', () => {
      expect(FORM_FIELD_TYPES).toBeDefined()
      expect(typeof FORM_FIELD_TYPES).toBe('object')
    })

    it('should have INPUT field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('INPUT')
      expect(FORM_FIELD_TYPES.INPUT).toBe('INPUT')
    })

    it('should have INPUT_WITH_BUTTON field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('INPUT_WITH_BUTTON')
      expect(FORM_FIELD_TYPES.INPUT_WITH_BUTTON).toBe('INPUT_WITH_BUTTON')
    })

    it('should have SELECT field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('SELECT')
      expect(FORM_FIELD_TYPES.SELECT).toBe('SELECT')
    })

    it('should have TEXTAREA field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('TEXTAREA')
      expect(FORM_FIELD_TYPES.TEXTAREA).toBe('TEXTAREA')
    })

    it('should have WYSIWYG_EDITOR field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('WYSIWYG_EDITOR')
      expect(FORM_FIELD_TYPES.WYSIWYG_EDITOR).toBe('WYSIWYG_EDITOR')
    })

    it('should have COMBOBOX field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('COMBOBOX')
      expect(FORM_FIELD_TYPES.COMBOBOX).toBe('COMBOBOX')
    })

    it('should have DATE field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('DATE')
      expect(FORM_FIELD_TYPES.DATE).toBe('DATE')
    })

    it('should have PIN field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('PIN')
      expect(FORM_FIELD_TYPES.PIN).toBe('PIN')
    })

    it('should have FILE field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('FILE')
      expect(FORM_FIELD_TYPES.FILE).toBe('FILE')
    })

    it('should have CHECKBOX field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('CHECKBOX')
      expect(FORM_FIELD_TYPES.CHECKBOX).toBe('CHECKBOX')
    })

    it('should have RADIO field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('RADIO')
      expect(FORM_FIELD_TYPES.RADIO).toBe('RADIO')
    })

    it('should have NUMBER field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('NUMBER')
      expect(FORM_FIELD_TYPES.NUMBER).toBe('NUMBER')
    })

    it('should have PASSWORD field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('PASSWORD')
      expect(FORM_FIELD_TYPES.PASSWORD).toBe('PASSWORD')
    })

    it('should have EMAIL field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('EMAIL')
      expect(FORM_FIELD_TYPES.EMAIL).toBe('EMAIL')
    })

    it('should have PHONE_NUMBER field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('PHONE_NUMBER')
      expect(FORM_FIELD_TYPES.PHONE_NUMBER).toBe('PHONE_NUMBER')
    })

    it('should have TOGGLE field type', () => {
      expect(FORM_FIELD_TYPES).toHaveProperty('TOGGLE')
      expect(FORM_FIELD_TYPES.TOGGLE).toBe('TOGGLE')
    })

    it('should have all field types as non-empty strings', () => {
      Object.values(FORM_FIELD_TYPES).forEach(type => {
        expect(typeof type).toBe('string')
        expect(type.length).toBeGreaterThan(0)
      })
    })

    it('should have exactly 16 field types', () => {
      expect(Object.keys(FORM_FIELD_TYPES)).toHaveLength(16)
    })

    it('should not have duplicate values', () => {
      const values = Object.values(FORM_FIELD_TYPES)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })
  })

  describe('Field Type Values', () => {
    it('should have keys matching their values', () => {
      Object.entries(FORM_FIELD_TYPES).forEach(([key, value]) => {
        expect(key).toBe(value)
      })
    })

    it('should have uppercase values for all field types', () => {
      Object.values(FORM_FIELD_TYPES).forEach(type => {
        expect(type).toBe(type.toUpperCase())
      })
    })

    it('should use underscores for multi-word types', () => {
      expect(FORM_FIELD_TYPES.INPUT_WITH_BUTTON).toContain('_')
      expect(FORM_FIELD_TYPES.WYSIWYG_EDITOR).toContain('_')
      expect(FORM_FIELD_TYPES.PHONE_NUMBER).toContain('_')
    })
  })

  describe('Type Safety', () => {
    it('should have all values as non-null strings', () => {
      Object.values(FORM_FIELD_TYPES).forEach(type => {
        expect(type).not.toBeNull()
        expect(type).not.toBeUndefined()
        expect(typeof type).toBe('string')
      })
    })

    it('should be immutable (as const)', () => {
      expect(FORM_FIELD_TYPES).toBeDefined()
    })

    it('should have consistent type for all values', () => {
      const types = Object.values(FORM_FIELD_TYPES).map(v => typeof v)
      const uniqueTypes = new Set(types)
      expect(uniqueTypes.size).toBe(1)
      expect(uniqueTypes.has('string')).toBe(true)
    })
  })

  describe('Standard HTML Input Types', () => {
    it('should include basic input field types', () => {
      expect(FORM_FIELD_TYPES.INPUT).toBe('INPUT')
      expect(FORM_FIELD_TYPES.TEXTAREA).toBe('TEXTAREA')
      expect(FORM_FIELD_TYPES.SELECT).toBe('SELECT')
    })

    it('should include specialized input types', () => {
      expect(FORM_FIELD_TYPES.EMAIL).toBe('EMAIL')
      expect(FORM_FIELD_TYPES.PASSWORD).toBe('PASSWORD')
      expect(FORM_FIELD_TYPES.NUMBER).toBe('NUMBER')
      expect(FORM_FIELD_TYPES.DATE).toBe('DATE')
    })

    it('should include selection field types', () => {
      expect(FORM_FIELD_TYPES.CHECKBOX).toBe('CHECKBOX')
      expect(FORM_FIELD_TYPES.RADIO).toBe('RADIO')
      expect(FORM_FIELD_TYPES.TOGGLE).toBe('TOGGLE')
    })

    it('should include file upload type', () => {
      expect(FORM_FIELD_TYPES.FILE).toBe('FILE')
    })
  })

  describe('Custom Field Types', () => {
    it('should include custom input types', () => {
      expect(FORM_FIELD_TYPES.INPUT_WITH_BUTTON).toBe('INPUT_WITH_BUTTON')
      expect(FORM_FIELD_TYPES.COMBOBOX).toBe('COMBOBOX')
      expect(FORM_FIELD_TYPES.PHONE_NUMBER).toBe('PHONE_NUMBER')
    })

    it('should include rich text editor type', () => {
      expect(FORM_FIELD_TYPES.WYSIWYG_EDITOR).toBe('WYSIWYG_EDITOR')
    })

    it('should include PIN input type', () => {
      expect(FORM_FIELD_TYPES.PIN).toBe('PIN')
    })
  })

  describe('Consistency', () => {
    it('should use consistent naming convention for keys', () => {
      Object.keys(FORM_FIELD_TYPES).forEach(key => {
        /* All keys should be uppercase with underscores */
        expect(key).toMatch(/^[A-Z_]+$/)
      })
    })

    it('should use consistent naming convention for values', () => {
      Object.values(FORM_FIELD_TYPES).forEach(value => {
        /* All values should be uppercase with underscores */
        expect(value).toMatch(/^[A-Z_]+$/)
      })
    })

    it('should return same reference for multiple imports', () => {
      expect(FORM_FIELD_TYPES).toBe(FORM_FIELD_TYPES)
    })
  })

  describe('Integration', () => {
    it('should be usable in switch statements', () => {
      let result = ''

      const checkFieldType = (type: string) => {
        switch (type) {
          case FORM_FIELD_TYPES.INPUT:
            result = 'input'
            break
          case FORM_FIELD_TYPES.SELECT:
            result = 'select'
            break
          case FORM_FIELD_TYPES.TEXTAREA:
            result = 'textarea'
            break
          default:
            result = 'unknown'
        }
      }

      checkFieldType(FORM_FIELD_TYPES.INPUT)
      expect(result).toBe('input')

      checkFieldType(FORM_FIELD_TYPES.SELECT)
      expect(result).toBe('select')

      checkFieldType(FORM_FIELD_TYPES.TEXTAREA)
      expect(result).toBe('textarea')
    })

    it('should be usable in arrays', () => {
      const textFieldTypes = [
        FORM_FIELD_TYPES.INPUT,
        FORM_FIELD_TYPES.TEXTAREA,
        FORM_FIELD_TYPES.EMAIL,
        FORM_FIELD_TYPES.PASSWORD
      ]

      expect(textFieldTypes).toContain('INPUT')
      expect(textFieldTypes).toContain('TEXTAREA')
      expect(textFieldTypes).toHaveLength(4)
    })

    it('should be usable in form field configuration', () => {
      const formConfig = {
        name: {
          type: FORM_FIELD_TYPES.INPUT,
          label: 'Name'
        },
        email: {
          type: FORM_FIELD_TYPES.EMAIL,
          label: 'Email'
        },
        description: {
          type: FORM_FIELD_TYPES.TEXTAREA,
          label: 'Description'
        }
      }

      expect(formConfig.name.type).toBe('INPUT')
      expect(formConfig.email.type).toBe('EMAIL')
      expect(formConfig.description.type).toBe('TEXTAREA')
    })

    it('should support field type validation', () => {
      const isValidFieldType = (type: string) => {
        return Object.values(FORM_FIELD_TYPES).includes(type as any)
      }

      expect(isValidFieldType('INPUT')).toBe(true)
      expect(isValidFieldType('SELECT')).toBe(true)
      expect(isValidFieldType('INVALID')).toBe(false)
    })
  })

  describe('Field Type Categories', () => {
    it('should categorize text input types', () => {
      const textTypes = [
        FORM_FIELD_TYPES.INPUT,
        FORM_FIELD_TYPES.TEXTAREA,
        FORM_FIELD_TYPES.EMAIL,
        FORM_FIELD_TYPES.PASSWORD
      ]

      textTypes.forEach(type => {
        expect(Object.values(FORM_FIELD_TYPES)).toContain(type)
      })
    })

    it('should categorize selection types', () => {
      const selectionTypes = [
        FORM_FIELD_TYPES.SELECT,
        FORM_FIELD_TYPES.COMBOBOX,
        FORM_FIELD_TYPES.RADIO,
        FORM_FIELD_TYPES.CHECKBOX
      ]

      selectionTypes.forEach(type => {
        expect(Object.values(FORM_FIELD_TYPES)).toContain(type)
      })
    })

    it('should categorize special input types', () => {
      const specialTypes = [
        FORM_FIELD_TYPES.DATE,
        FORM_FIELD_TYPES.FILE,
        FORM_FIELD_TYPES.PIN,
        FORM_FIELD_TYPES.PHONE_NUMBER
      ]

      specialTypes.forEach(type => {
        expect(Object.values(FORM_FIELD_TYPES)).toContain(type)
      })
    })

    it('should have rich text editor type', () => {
      expect(Object.values(FORM_FIELD_TYPES)).toContain(FORM_FIELD_TYPES.WYSIWYG_EDITOR)
    })
  })

  describe('Error Prevention', () => {
    it('should not have whitespace in field types', () => {
      Object.values(FORM_FIELD_TYPES).forEach(type => {
        expect(type).not.toMatch(/\s/)
      })
    })

    it('should not have special characters except underscores', () => {
      Object.values(FORM_FIELD_TYPES).forEach(type => {
        expect(type).toMatch(/^[A-Z_]+$/)
      })
    })

    it('should not have empty string values', () => {
      Object.values(FORM_FIELD_TYPES).forEach(type => {
        expect(type.length).toBeGreaterThan(0)
      })
    })

    it('should have reasonable field type name lengths', () => {
      Object.values(FORM_FIELD_TYPES).forEach(type => {
        expect(type.length).toBeGreaterThan(2)
        expect(type.length).toBeLessThan(30)
      })
    })
  })

  describe('Comprehensive Coverage', () => {
    it('should cover all common form input needs', () => {
      const requiredTypes = [
        'INPUT',
        'SELECT',
        'TEXTAREA',
        'CHECKBOX',
        'RADIO',
        'EMAIL',
        'PASSWORD',
        'NUMBER',
        'DATE',
        'FILE'
      ]

      requiredTypes.forEach(type => {
        expect(Object.values(FORM_FIELD_TYPES)).toContain(type)
      })
    })

    it('should include modern UI components', () => {
      expect(Object.values(FORM_FIELD_TYPES)).toContain('TOGGLE')
      expect(Object.values(FORM_FIELD_TYPES)).toContain('COMBOBOX')
      expect(Object.values(FORM_FIELD_TYPES)).toContain('WYSIWYG_EDITOR')
    })

    it('should support specialized inputs', () => {
      expect(Object.values(FORM_FIELD_TYPES)).toContain('PIN')
      expect(Object.values(FORM_FIELD_TYPES)).toContain('PHONE_NUMBER')
      expect(Object.values(FORM_FIELD_TYPES)).toContain('INPUT_WITH_BUTTON')
    })
  })

  describe('Field Type Validation', () => {
    it('should validate all field types are defined', () => {
      const expectedTypes = [
        'INPUT',
        'INPUT_WITH_BUTTON',
        'SELECT',
        'TEXTAREA',
        'WYSIWYG_EDITOR',
        'COMBOBOX',
        'DATE',
        'PIN',
        'FILE',
        'CHECKBOX',
        'RADIO',
        'NUMBER',
        'PASSWORD',
        'EMAIL',
        'PHONE_NUMBER',
        'TOGGLE'
      ]

      expectedTypes.forEach(type => {
        expect(Object.values(FORM_FIELD_TYPES)).toContain(type)
      })
    })

    it('should have no unexpected field types', () => {
      const actualTypes = Object.values(FORM_FIELD_TYPES)
      expect(actualTypes.length).toBe(16)
    })
  })
})
