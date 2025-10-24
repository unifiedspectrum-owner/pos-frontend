/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES, TICKET_ASSIGNMENT_FORM_QUESTIONS } from '@support-ticket-management/constants'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

describe('Support Ticket Assignment Form Constants', () => {
  describe('TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES', () => {
    it('should be defined', () => {
      expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES).toBe('object')
    })

    it('should have all required properties', () => {
      expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES).toHaveProperty('user_id')
      expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES).toHaveProperty('reason')
    })

    it('should have empty string for user_id', () => {
      expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES.user_id).toBe('')
    })

    it('should have empty string for reason', () => {
      expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES.reason).toBe('')
    })

    it('should have exactly 2 properties', () => {
      expect(Object.keys(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES)).toHaveLength(2)
    })

    it('should have correct types for properties', () => {
      expect(typeof TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES.user_id).toBe('string')
      expect(typeof TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES.reason).toBe('string')
    })

    it('should not be null', () => {
      expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES).not.toBeNull()
    })
  })

  describe('TICKET_ASSIGNMENT_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TICKET_ASSIGNMENT_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 2 form questions', () => {
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS).toHaveLength(2)
    })

    it('should have consistent structure', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('label')
        expect(question).toHaveProperty('schema_key')
        expect(question).toHaveProperty('placeholder')
        expect(question).toHaveProperty('left_icon')
        expect(question).toHaveProperty('is_required')
        expect(question).toHaveProperty('is_active')
        expect(question).toHaveProperty('display_order')
        expect(question).toHaveProperty('grid')
        expect(typeof question.id).toBe('number')
        expect(typeof question.type).toBe('string')
        expect(typeof question.label).toBe('string')
        expect(typeof question.schema_key).toBe('string')
        expect(typeof question.placeholder).toBe('string')
        expect(typeof question.left_icon).toBe('function')
        expect(typeof question.is_required).toBe('boolean')
        expect(typeof question.is_active).toBe('boolean')
        expect(typeof question.display_order).toBe('number')
        expect(typeof question.grid).toBe('object')
      })
    })

    it('should have sequential display orders', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach((question, index) => {
        expect(question.display_order).toBe(index + 1)
      })
    })

    it('should have all active questions', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.is_active).toBe(true)
      })
    })

    it('should have unique ids', () => {
      const ids = TICKET_ASSIGNMENT_FORM_QUESTIONS.map(q => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique schema keys', () => {
      const keys = TICKET_ASSIGNMENT_FORM_QUESTIONS.map(q => q.schema_key)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })

    it('should have grid configuration', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.grid).toHaveProperty('col_span')
        expect(typeof question.grid.col_span).toBe('number')
      })
    })

    it('should have non-empty labels', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.label.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty placeholders', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.placeholder.length).toBeGreaterThan(0)
      })
    })

    describe('User Assignment Field', () => {
      const userField = TICKET_ASSIGNMENT_FORM_QUESTIONS[0]

      it('should be the first field', () => {
        expect(userField.display_order).toBe(1)
      })

      it('should have correct schema key', () => {
        expect(userField.schema_key).toBe('user_id')
      })

      it('should have correct label', () => {
        expect(userField.label).toBe('Assign To User')
      })

      it('should be optional', () => {
        expect(userField.is_required).toBe(false)
      })

      it('should use SELECT type', () => {
        expect(userField.type).toBe(FORM_FIELD_TYPES.SELECT)
      })

      it('should have icon function', () => {
        expect(typeof userField.left_icon).toBe('function')
      })

      it('should have descriptive placeholder', () => {
        expect(userField.placeholder.toLowerCase()).toContain('select')
        expect(userField.placeholder.toLowerCase()).toContain('user')
      })

      it('should have col_span of 2', () => {
        expect(userField.grid.col_span).toBe(2)
      })
    })

    describe('Assignment Reason Field', () => {
      const reasonField = TICKET_ASSIGNMENT_FORM_QUESTIONS[1]

      it('should be the second field', () => {
        expect(reasonField.display_order).toBe(2)
      })

      it('should have correct schema key', () => {
        expect(reasonField.schema_key).toBe('reason')
      })

      it('should have correct label', () => {
        expect(reasonField.label).toBe('Assignment Reason')
      })

      it('should be optional', () => {
        expect(reasonField.is_required).toBe(false)
      })

      it('should use TEXTAREA type', () => {
        expect(reasonField.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
      })

      it('should have icon function', () => {
        expect(typeof reasonField.left_icon).toBe('function')
      })

      it('should have placeholder with optional indicator', () => {
        expect(reasonField.placeholder.toLowerCase()).toContain('optional')
      })

      it('should have placeholder with character requirement', () => {
        expect(reasonField.placeholder).toMatch(/\d+/)
        expect(reasonField.placeholder.toLowerCase()).toContain('character')
      })

      it('should have col_span of 4', () => {
        expect(reasonField.grid.col_span).toBe(4)
      })
    })
  })

  describe('Form Constants Integration', () => {
    it('should have default values matching form questions schema keys', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES).toHaveProperty(question.schema_key)
      })
    })

    it('should have consistent field types', () => {
      const validTypes = Object.values(FORM_FIELD_TYPES)
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(validTypes).toContain(question.type)
      })
    })

    it('should have all optional fields', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.is_required).toBe(false)
      })
    })

    it('should have logical field ordering', () => {
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS[0].schema_key).toBe('user_id')
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS[1].schema_key).toBe('reason')
    })

    it('should support user selection', () => {
      const userField = TICKET_ASSIGNMENT_FORM_QUESTIONS.find(q => q.schema_key === 'user_id')
      expect(userField).toBeDefined()
      expect(userField?.type).toBe(FORM_FIELD_TYPES.SELECT)
      expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES.user_id).toBe('')
    })

    it('should support assignment reason', () => {
      const reasonField = TICKET_ASSIGNMENT_FORM_QUESTIONS.find(q => q.schema_key === 'reason')
      expect(reasonField).toBeDefined()
      expect(reasonField?.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
      expect(TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES.reason).toBe('')
    })

    it('should have responsive grid layout', () => {
      const userField = TICKET_ASSIGNMENT_FORM_QUESTIONS[0]
      const reasonField = TICKET_ASSIGNMENT_FORM_QUESTIONS[1]

      /* User field takes 2 columns */
      expect(userField.grid.col_span).toBe(2)
      /* Reason field takes full width */
      expect(reasonField.grid.col_span).toBe(4)
    })
  })

  describe('Validation Configuration', () => {
    it('should indicate both fields are optional', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.is_required).toBe(false)
      })
    })

    it('should have character requirement in reason field', () => {
      const reasonField = TICKET_ASSIGNMENT_FORM_QUESTIONS[1]
      expect(reasonField.placeholder).toMatch(/\d+/)
      expect(reasonField.placeholder.toLowerCase()).toContain('character')
    })

    it('should provide clear assignment context', () => {
      const userField = TICKET_ASSIGNMENT_FORM_QUESTIONS[0]
      expect(userField.label.toLowerCase()).toContain('assign')
      expect(userField.placeholder.toLowerCase()).toContain('user')
    })

    it('should encourage providing reason', () => {
      const reasonField = TICKET_ASSIGNMENT_FORM_QUESTIONS[1]
      expect(reasonField.label.toLowerCase()).toContain('reason')
    })
  })

  describe('Field Properties', () => {
    it('should have proper field ids starting from 1', () => {
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS[0].id).toBe(1)
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS[1].id).toBe(2)
    })

    it('should have all fields marked as active', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.is_active).toBe(true)
      })
    })

    it('should have icon functions for all fields', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(typeof question.left_icon).toBe('function')
      })
    })

    it('should have grid configuration for all fields', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.grid).toHaveProperty('col_span')
        expect(question.grid.col_span).toBeGreaterThan(0)
      })
    })

    it('should use appropriate field types', () => {
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS[0].type).toBe(FORM_FIELD_TYPES.SELECT)
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS[1].type).toBe(FORM_FIELD_TYPES.TEXTAREA)
    })
  })

  describe('Form Usability', () => {
    it('should provide clear labels', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.label.length).toBeGreaterThan(0)
        expect(question.label).not.toMatch(/^\s*$/)
      })
    })

    it('should provide helpful placeholders', () => {
      TICKET_ASSIGNMENT_FORM_QUESTIONS.forEach(question => {
        expect(question.placeholder.length).toBeGreaterThan(0)
        expect(question.placeholder).not.toMatch(/^\s*$/)
      })
    })

    it('should support assignment workflow', () => {
      /* Select user first, then provide reason */
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS[0].schema_key).toBe('user_id')
      expect(TICKET_ASSIGNMENT_FORM_QUESTIONS[1].schema_key).toBe('reason')
    })

    it('should allow flexible assignment', () => {
      /* Both fields optional for flexibility */
      const allOptional = TICKET_ASSIGNMENT_FORM_QUESTIONS.every(q => !q.is_required)
      expect(allOptional).toBe(true)
    })
  })
})
