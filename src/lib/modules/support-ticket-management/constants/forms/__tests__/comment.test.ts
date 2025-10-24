/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { TICKET_COMMUNICATION_FORM_DEFAULT_VALUES, TICKET_COMMUNICATION_FORM_QUESTIONS } from '@support-ticket-management/constants'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

describe('Support Ticket Communication Form Constants', () => {
  describe('TICKET_COMMUNICATION_FORM_DEFAULT_VALUES', () => {
    it('should be defined', () => {
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_COMMUNICATION_FORM_DEFAULT_VALUES).toBe('object')
    })

    it('should have all required properties', () => {
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES).toHaveProperty('message_content')
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES).toHaveProperty('is_internal')
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES).toHaveProperty('attachments')
    })

    it('should have empty string for message_content', () => {
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.message_content).toBe('')
    })

    it('should have false for is_internal', () => {
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.is_internal).toBe(false)
    })

    it('should have empty array for attachments', () => {
      expect(Array.isArray(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.attachments)).toBe(true)
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.attachments).toHaveLength(0)
    })

    it('should have exactly 3 properties', () => {
      expect(Object.keys(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES)).toHaveLength(3)
    })

    it('should have correct types for properties', () => {
      expect(typeof TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.message_content).toBe('string')
      expect(typeof TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.is_internal).toBe('boolean')
      expect(Array.isArray(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.attachments)).toBe(true)
    })

    it('should default to public message', () => {
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.is_internal).toBe(false)
    })
  })

  describe('TICKET_COMMUNICATION_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(TICKET_COMMUNICATION_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TICKET_COMMUNICATION_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 3 form questions', () => {
      expect(TICKET_COMMUNICATION_FORM_QUESTIONS).toHaveLength(3)
    })

    it('should have consistent structure', () => {
      TICKET_COMMUNICATION_FORM_QUESTIONS.forEach(question => {
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
      TICKET_COMMUNICATION_FORM_QUESTIONS.forEach((question, index) => {
        expect(question.display_order).toBe(index + 1)
      })
    })

    it('should have all active questions', () => {
      TICKET_COMMUNICATION_FORM_QUESTIONS.forEach(question => {
        expect(question.is_active).toBe(true)
      })
    })

    it('should have unique ids', () => {
      const ids = TICKET_COMMUNICATION_FORM_QUESTIONS.map(q => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique schema keys', () => {
      const keys = TICKET_COMMUNICATION_FORM_QUESTIONS.map(q => q.schema_key)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })

    it('should have grid configuration', () => {
      TICKET_COMMUNICATION_FORM_QUESTIONS.forEach(question => {
        expect(question.grid).toHaveProperty('col_span')
        expect(typeof question.grid.col_span).toBe('number')
      })
    })

    it('should have non-empty labels', () => {
      TICKET_COMMUNICATION_FORM_QUESTIONS.forEach(question => {
        expect(question.label.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty placeholders', () => {
      TICKET_COMMUNICATION_FORM_QUESTIONS.forEach(question => {
        expect(question.placeholder.length).toBeGreaterThan(0)
      })
    })

    describe('Message Content Field', () => {
      const messageField = TICKET_COMMUNICATION_FORM_QUESTIONS[0]

      it('should be the first field', () => {
        expect(messageField.display_order).toBe(1)
      })

      it('should have correct schema key', () => {
        expect(messageField.schema_key).toBe('message_content')
      })

      it('should have correct label', () => {
        expect(messageField.label).toBe('Message')
      })

      it('should be required', () => {
        expect(messageField.is_required).toBe(true)
      })

      it('should use WYSIWYG_EDITOR type', () => {
        expect(messageField.type).toBe(FORM_FIELD_TYPES.WYSIWYG_EDITOR)
      })

      it('should have icon function', () => {
        expect(typeof messageField.left_icon).toBe('function')
      })

      it('should have placeholder with character limits', () => {
        expect(messageField.placeholder).toContain('minimum')
        expect(messageField.placeholder).toContain('maximum')
      })
    })

    describe('Attachments Field', () => {
      const attachmentsField = TICKET_COMMUNICATION_FORM_QUESTIONS[1]

      it('should be the second field', () => {
        expect(attachmentsField.display_order).toBe(2)
      })

      it('should have correct schema key', () => {
        expect(attachmentsField.schema_key).toBe('attachments')
      })

      it('should have correct label', () => {
        expect(attachmentsField.label).toBe('Attachments')
      })

      it('should be optional', () => {
        expect(attachmentsField.is_required).toBe(false)
      })

      it('should use FILE type', () => {
        expect(attachmentsField.type).toBe(FORM_FIELD_TYPES.FILE)
      })

      it('should have icon function', () => {
        expect(typeof attachmentsField.left_icon).toBe('function')
      })

      it('should have placeholder with file limits', () => {
        expect(attachmentsField.placeholder).toContain('max')
        expect(attachmentsField.placeholder).toContain('files')
        expect(attachmentsField.placeholder).toContain('MB')
      })
    })

    describe('Internal Note Field', () => {
      const internalField = TICKET_COMMUNICATION_FORM_QUESTIONS[2]

      it('should be the third field', () => {
        expect(internalField.display_order).toBe(3)
      })

      it('should have correct schema key', () => {
        expect(internalField.schema_key).toBe('is_internal')
      })

      it('should have correct label', () => {
        expect(internalField.label).toBe('Internal Note')
      })

      it('should be optional', () => {
        expect(internalField.is_required).toBe(false)
      })

      it('should use TOGGLE type', () => {
        expect(internalField.type).toBe(FORM_FIELD_TYPES.TOGGLE)
      })

      it('should have icon function', () => {
        expect(typeof internalField.left_icon).toBe('function')
      })

      it('should have toggle_text property', () => {
        expect(internalField).toHaveProperty('toggle_text')
        expect(typeof internalField.toggle_text).toBe('object')
      })

      it('should have toggle_text for true and false', () => {
        expect(internalField.toggle_text).toHaveProperty('true')
        expect(internalField.toggle_text).toHaveProperty('false')
        expect(internalField.toggle_text.true).toContain('Internal')
        expect(internalField.toggle_text.false).toContain('Public')
      })

      it('should describe visibility in toggle text', () => {
        expect(internalField.toggle_text.true).toContain('Agents Only')
        expect(internalField.toggle_text.false).toContain('Visible to Customer')
      })
    })
  })

  describe('Form Constants Integration', () => {
    it('should have default values matching form questions schema keys', () => {
      TICKET_COMMUNICATION_FORM_QUESTIONS.forEach(question => {
        expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES).toHaveProperty(question.schema_key)
      })
    })

    it('should have consistent field types', () => {
      const validTypes = Object.values(FORM_FIELD_TYPES)
      TICKET_COMMUNICATION_FORM_QUESTIONS.forEach(question => {
        expect(validTypes).toContain(question.type)
      })
    })

    it('should have only one required field', () => {
      const requiredFields = TICKET_COMMUNICATION_FORM_QUESTIONS.filter(q => q.is_required)
      expect(requiredFields).toHaveLength(1)
      expect(requiredFields[0].schema_key).toBe('message_content')
    })

    it('should have logical field ordering', () => {
      expect(TICKET_COMMUNICATION_FORM_QUESTIONS[0].schema_key).toBe('message_content')
      expect(TICKET_COMMUNICATION_FORM_QUESTIONS[1].schema_key).toBe('attachments')
      expect(TICKET_COMMUNICATION_FORM_QUESTIONS[2].schema_key).toBe('is_internal')
    })

    it('should support both internal and public messages', () => {
      const internalField = TICKET_COMMUNICATION_FORM_QUESTIONS.find(q => q.schema_key === 'is_internal')
      expect(internalField).toBeDefined()
      expect(internalField?.type).toBe(FORM_FIELD_TYPES.TOGGLE)
      expect(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.is_internal).toBe(false)
    })

    it('should support attachments', () => {
      const attachmentField = TICKET_COMMUNICATION_FORM_QUESTIONS.find(q => q.schema_key === 'attachments')
      expect(attachmentField).toBeDefined()
      expect(attachmentField?.type).toBe(FORM_FIELD_TYPES.FILE)
      expect(Array.isArray(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES.attachments)).toBe(true)
    })

    it('should have rich text editor for messages', () => {
      const messageField = TICKET_COMMUNICATION_FORM_QUESTIONS.find(q => q.schema_key === 'message_content')
      expect(messageField).toBeDefined()
      expect(messageField?.type).toBe(FORM_FIELD_TYPES.WYSIWYG_EDITOR)
    })
  })

  describe('Validation Configuration', () => {
    it('should have character limits in message placeholder', () => {
      const messageField = TICKET_COMMUNICATION_FORM_QUESTIONS[0]
      expect(messageField.placeholder).toMatch(/\d+/)
      expect(messageField.placeholder.toLowerCase()).toContain('character')
    })

    it('should have file size limits in attachments placeholder', () => {
      const attachmentField = TICKET_COMMUNICATION_FORM_QUESTIONS[1]
      expect(attachmentField.placeholder).toMatch(/\d+/)
      expect(attachmentField.placeholder).toContain('MB')
    })

    it('should have file count limits in attachments placeholder', () => {
      const attachmentField = TICKET_COMMUNICATION_FORM_QUESTIONS[1]
      expect(attachmentField.placeholder).toMatch(/\d+/)
      expect(attachmentField.placeholder.toLowerCase()).toContain('files')
    })

    it('should provide clear visibility context for internal toggle', () => {
      const internalField = TICKET_COMMUNICATION_FORM_QUESTIONS[2]
      expect(internalField.placeholder.toLowerCase()).toContain('internal')
      expect(internalField.placeholder.toLowerCase()).toContain('agent')
    })
  })
})
