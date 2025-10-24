/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES, TICKET_STATUS_UPDATE_FORM_QUESTIONS } from '@support-ticket-management/constants'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

describe('Support Ticket Status Update Form Constants', () => {
  describe('TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES', () => {
    it('should be defined', () => {
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES).toBe('object')
    })

    it('should have all required properties', () => {
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES).toHaveProperty('status')
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES).toHaveProperty('status_reason')
    })

    it('should have default status of open', () => {
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status).toBe('open')
    })

    it('should have empty string for status_reason', () => {
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status_reason).toBe('')
    })

    it('should have exactly 2 properties', () => {
      expect(Object.keys(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES)).toHaveLength(2)
    })

    it('should have correct types for properties', () => {
      expect(typeof TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status).toBe('string')
      expect(typeof TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status_reason).toBe('string')
    })

    it('should not be null', () => {
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES).not.toBeNull()
    })

    it('should have non-empty default status', () => {
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status.length).toBeGreaterThan(0)
    })
  })

  describe('TICKET_STATUS_UPDATE_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TICKET_STATUS_UPDATE_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 2 form questions', () => {
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS).toHaveLength(2)
    })

    it('should have consistent structure', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
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
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach((question, index) => {
        expect(question.display_order).toBe(index + 1)
      })
    })

    it('should have all active questions', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.is_active).toBe(true)
      })
    })

    it('should have unique ids', () => {
      const ids = TICKET_STATUS_UPDATE_FORM_QUESTIONS.map(q => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique schema keys', () => {
      const keys = TICKET_STATUS_UPDATE_FORM_QUESTIONS.map(q => q.schema_key)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })

    it('should have grid configuration', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.grid).toHaveProperty('col_span')
        expect(typeof question.grid.col_span).toBe('number')
      })
    })

    it('should have non-empty labels', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.label.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty placeholders', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.placeholder.length).toBeGreaterThan(0)
      })
    })

    describe('Status Field', () => {
      const statusField = TICKET_STATUS_UPDATE_FORM_QUESTIONS[0]

      it('should be the first field', () => {
        expect(statusField.display_order).toBe(1)
      })

      it('should have correct schema key', () => {
        expect(statusField.schema_key).toBe('status')
      })

      it('should have correct label', () => {
        expect(statusField.label).toBe('New Status')
      })

      it('should be required', () => {
        expect(statusField.is_required).toBe(true)
      })

      it('should use SELECT type', () => {
        expect(statusField.type).toBe(FORM_FIELD_TYPES.SELECT)
      })

      it('should have icon function', () => {
        expect(typeof statusField.left_icon).toBe('function')
      })

      it('should have descriptive placeholder', () => {
        expect(statusField.placeholder.toLowerCase()).toContain('select')
        expect(statusField.placeholder.toLowerCase()).toContain('status')
      })

      it('should have col_span of 4', () => {
        expect(statusField.grid.col_span).toBe(4)
      })
    })

    describe('Status Reason Field', () => {
      const reasonField = TICKET_STATUS_UPDATE_FORM_QUESTIONS[1]

      it('should be the second field', () => {
        expect(reasonField.display_order).toBe(2)
      })

      it('should have correct schema key', () => {
        expect(reasonField.schema_key).toBe('status_reason')
      })

      it('should have correct label', () => {
        expect(reasonField.label).toBe('Status Change Reason')
      })

      it('should be required', () => {
        expect(reasonField.is_required).toBe(true)
      })

      it('should use TEXTAREA type', () => {
        expect(reasonField.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
      })

      it('should have icon function', () => {
        expect(typeof reasonField.left_icon).toBe('function')
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
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES).toHaveProperty(question.schema_key)
      })
    })

    it('should have consistent field types', () => {
      const validTypes = Object.values(FORM_FIELD_TYPES)
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(validTypes).toContain(question.type)
      })
    })

    it('should have all required fields', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.is_required).toBe(true)
      })
    })

    it('should have logical field ordering', () => {
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS[0].schema_key).toBe('status')
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS[1].schema_key).toBe('status_reason')
    })

    it('should support status selection', () => {
      const statusField = TICKET_STATUS_UPDATE_FORM_QUESTIONS.find(q => q.schema_key === 'status')
      expect(statusField).toBeDefined()
      expect(statusField?.type).toBe(FORM_FIELD_TYPES.SELECT)
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status).toBe('open')
    })

    it('should require status change reason', () => {
      const reasonField = TICKET_STATUS_UPDATE_FORM_QUESTIONS.find(q => q.schema_key === 'status_reason')
      expect(reasonField).toBeDefined()
      expect(reasonField?.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
      expect(reasonField?.is_required).toBe(true)
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status_reason).toBe('')
    })

    it('should have full width layout for both fields', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.grid.col_span).toBe(4)
      })
    })
  })

  describe('Validation Configuration', () => {
    it('should require both status and reason', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.is_required).toBe(true)
      })
    })

    it('should have character requirement in reason field', () => {
      const reasonField = TICKET_STATUS_UPDATE_FORM_QUESTIONS[1]
      expect(reasonField.placeholder).toMatch(/\d+/)
      expect(reasonField.placeholder.toLowerCase()).toContain('character')
    })

    it('should enforce minimum characters for reason', () => {
      const reasonField = TICKET_STATUS_UPDATE_FORM_QUESTIONS[1]
      expect(reasonField.placeholder).toContain('minimum')
    })

    it('should provide clear status selection context', () => {
      const statusField = TICKET_STATUS_UPDATE_FORM_QUESTIONS[0]
      expect(statusField.label).toContain('New')
      expect(statusField.label).toContain('Status')
    })
  })

  describe('Field Properties', () => {
    it('should have proper field ids starting from 1', () => {
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS[0].id).toBe(1)
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS[1].id).toBe(2)
    })

    it('should have all fields marked as active', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.is_active).toBe(true)
      })
    })

    it('should have icon functions for all fields', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(typeof question.left_icon).toBe('function')
      })
    })

    it('should have grid configuration for all fields', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.grid).toHaveProperty('col_span')
        expect(question.grid.col_span).toBeGreaterThan(0)
      })
    })

    it('should use appropriate field types', () => {
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS[0].type).toBe(FORM_FIELD_TYPES.SELECT)
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS[1].type).toBe(FORM_FIELD_TYPES.TEXTAREA)
    })
  })

  describe('Form Usability', () => {
    it('should provide clear labels', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.label.length).toBeGreaterThan(0)
        expect(question.label).not.toMatch(/^\s*$/)
      })
    })

    it('should provide helpful placeholders', () => {
      TICKET_STATUS_UPDATE_FORM_QUESTIONS.forEach(question => {
        expect(question.placeholder.length).toBeGreaterThan(0)
        expect(question.placeholder).not.toMatch(/^\s*$/)
      })
    })

    it('should support status update workflow', () => {
      /* Select status first, then provide reason */
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS[0].schema_key).toBe('status')
      expect(TICKET_STATUS_UPDATE_FORM_QUESTIONS[1].schema_key).toBe('status_reason')
    })

    it('should enforce accountability with required reason', () => {
      const reasonField = TICKET_STATUS_UPDATE_FORM_QUESTIONS.find(q => q.schema_key === 'status_reason')
      expect(reasonField?.is_required).toBe(true)
    })

    it('should have meaningful default status', () => {
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status).toBe('open')
      expect(TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status.length).toBeGreaterThan(0)
    })
  })

  describe('Form Requirements', () => {
    it('should require explicit status selection', () => {
      const statusField = TICKET_STATUS_UPDATE_FORM_QUESTIONS[0]
      expect(statusField.is_required).toBe(true)
      expect(statusField.type).toBe(FORM_FIELD_TYPES.SELECT)
    })

    it('should require reason for audit trail', () => {
      const reasonField = TICKET_STATUS_UPDATE_FORM_QUESTIONS[1]
      expect(reasonField.is_required).toBe(true)
      expect(reasonField.schema_key).toBe('status_reason')
    })

    it('should support change tracking', () => {
      /* Both fields required for complete audit trail */
      const allRequired = TICKET_STATUS_UPDATE_FORM_QUESTIONS.every(q => q.is_required)
      expect(allRequired).toBe(true)
    })

    it('should provide sufficient space for reason', () => {
      const reasonField = TICKET_STATUS_UPDATE_FORM_QUESTIONS[1]
      expect(reasonField.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
      expect(reasonField.grid.col_span).toBe(4)
    })
  })
})
