/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { TICKET_FORM_MODES, TICKET_FORM_TITLES, TICKET_FORM_DEFAULT_VALUES, REQUESTER_INFO_FORM_QUESTIONS, TICKET_INFO_FORM_QUESTIONS, MESSAGE_INFO_FORM_QUESTIONS, TICKET_CREATION_FORM_QUESTIONS } from '@support-ticket-management/constants'

describe('Support Ticket Creation Form Constants', () => {
  describe('TICKET_FORM_MODES', () => {
    it('should be defined', () => {
      expect(TICKET_FORM_MODES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_FORM_MODES).toBe('object')
    })

    it('should have CREATE property', () => {
      expect(TICKET_FORM_MODES).toHaveProperty('CREATE')
      expect(TICKET_FORM_MODES.CREATE).toBe('CREATE')
    })

    it('should have EDIT property', () => {
      expect(TICKET_FORM_MODES).toHaveProperty('EDIT')
      expect(TICKET_FORM_MODES.EDIT).toBe('EDIT')
    })

    it('should have VIEW property', () => {
      expect(TICKET_FORM_MODES).toHaveProperty('VIEW')
      expect(TICKET_FORM_MODES.VIEW).toBe('VIEW')
    })

    it('should have exactly 3 properties', () => {
      expect(Object.keys(TICKET_FORM_MODES)).toHaveLength(3)
    })

    it('should have all uppercase values', () => {
      Object.values(TICKET_FORM_MODES).forEach(value => {
        expect(value).toBe(value.toUpperCase())
      })
    })

    it('should have all string values', () => {
      Object.values(TICKET_FORM_MODES).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should have unique values', () => {
      const values = Object.values(TICKET_FORM_MODES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('TICKET_FORM_TITLES', () => {
    it('should be defined', () => {
      expect(TICKET_FORM_TITLES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_FORM_TITLES).toBe('object')
    })

    it('should have CREATE title', () => {
      expect(TICKET_FORM_TITLES).toHaveProperty('CREATE')
      expect(TICKET_FORM_TITLES.CREATE).toBe('Create New Ticket')
    })

    it('should have EDIT title', () => {
      expect(TICKET_FORM_TITLES).toHaveProperty('EDIT')
      expect(TICKET_FORM_TITLES.EDIT).toBe('Edit Ticket')
    })

    it('should have VIEW title', () => {
      expect(TICKET_FORM_TITLES).toHaveProperty('VIEW')
      expect(TICKET_FORM_TITLES.VIEW).toBe('View Ticket')
    })

    it('should have DEFAULT title', () => {
      expect(TICKET_FORM_TITLES).toHaveProperty('DEFAULT')
      expect(TICKET_FORM_TITLES.DEFAULT).toBe('Support Ticket Management')
    })

    it('should have exactly 4 properties', () => {
      expect(Object.keys(TICKET_FORM_TITLES)).toHaveLength(4)
    })

    it('should have all string values', () => {
      Object.values(TICKET_FORM_TITLES).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should have non-empty titles', () => {
      Object.values(TICKET_FORM_TITLES).forEach(title => {
        expect(title.length).toBeGreaterThan(0)
      })
    })

    it('should have descriptive titles', () => {
      expect(TICKET_FORM_TITLES.CREATE).toContain('Create')
      expect(TICKET_FORM_TITLES.EDIT).toContain('Edit')
      expect(TICKET_FORM_TITLES.VIEW).toContain('View')
      expect(TICKET_FORM_TITLES.DEFAULT).toContain('Support Ticket Management')
    })
  })

  describe('TICKET_FORM_DEFAULT_VALUES', () => {
    it('should be defined', () => {
      expect(TICKET_FORM_DEFAULT_VALUES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_FORM_DEFAULT_VALUES).toBe('object')
    })

    it('should have all required properties', () => {
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('tenant_id')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('requester_user_id')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('requester_email')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('requester_name')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('requester_phone')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('category_id')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('subject')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('message_content')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('resolution_due')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('internal_notes')
      expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty('attachments')
    })

    it('should have empty string defaults for required text fields', () => {
      expect(TICKET_FORM_DEFAULT_VALUES.tenant_id).toBe('')
      expect(TICKET_FORM_DEFAULT_VALUES.requester_user_id).toBe('')
      expect(TICKET_FORM_DEFAULT_VALUES.requester_email).toBe('')
      expect(TICKET_FORM_DEFAULT_VALUES.requester_name).toBe('')
      expect(TICKET_FORM_DEFAULT_VALUES.requester_phone).toBe('')
      expect(TICKET_FORM_DEFAULT_VALUES.category_id).toBe('')
      expect(TICKET_FORM_DEFAULT_VALUES.subject).toBe('')
      expect(TICKET_FORM_DEFAULT_VALUES.message_content).toBe('')
    })

    it('should have undefined for optional date field', () => {
      expect(TICKET_FORM_DEFAULT_VALUES.resolution_due).toBeUndefined()
    })

    it('should have null for optional internal_notes', () => {
      expect(TICKET_FORM_DEFAULT_VALUES.internal_notes).toBeNull()
    })

    it('should have empty array for attachments', () => {
      expect(Array.isArray(TICKET_FORM_DEFAULT_VALUES.attachments)).toBe(true)
      expect(TICKET_FORM_DEFAULT_VALUES.attachments).toHaveLength(0)
    })

    it('should have exactly 11 properties', () => {
      expect(Object.keys(TICKET_FORM_DEFAULT_VALUES)).toHaveLength(11)
    })
  })

  describe('REQUESTER_INFO_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(REQUESTER_INFO_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(REQUESTER_INFO_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 4 form questions', () => {
      expect(REQUESTER_INFO_FORM_QUESTIONS).toHaveLength(4)
    })

    it('should have consistent structure', () => {
      REQUESTER_INFO_FORM_QUESTIONS.forEach(question => {
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
      REQUESTER_INFO_FORM_QUESTIONS.forEach((question, index) => {
        expect(question.display_order).toBe(index + 1)
      })
    })

    it('should have all active questions', () => {
      REQUESTER_INFO_FORM_QUESTIONS.forEach(question => {
        expect(question.is_active).toBe(true)
      })
    })

    it('should have unique ids', () => {
      const ids = REQUESTER_INFO_FORM_QUESTIONS.map(q => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique schema keys', () => {
      const keys = REQUESTER_INFO_FORM_QUESTIONS.map(q => q.schema_key)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })

    it('should have grid configuration', () => {
      REQUESTER_INFO_FORM_QUESTIONS.forEach(question => {
        expect(question.grid).toHaveProperty('col_span')
        expect(typeof question.grid.col_span).toBe('number')
      })
    })

    it('should have non-empty labels', () => {
      REQUESTER_INFO_FORM_QUESTIONS.forEach(question => {
        expect(question.label.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty placeholders', () => {
      REQUESTER_INFO_FORM_QUESTIONS.forEach(question => {
        expect(question.placeholder.length).toBeGreaterThan(0)
      })
    })
  })

  describe('TICKET_INFO_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(TICKET_INFO_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TICKET_INFO_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 5 form questions', () => {
      expect(TICKET_INFO_FORM_QUESTIONS).toHaveLength(5)
    })

    it('should have consistent structure', () => {
      TICKET_INFO_FORM_QUESTIONS.forEach(question => {
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
      })
    })

    it('should have sequential display orders starting from 5', () => {
      TICKET_INFO_FORM_QUESTIONS.forEach((question, index) => {
        expect(question.display_order).toBe(index + 5)
      })
    })

    it('should have all active questions', () => {
      TICKET_INFO_FORM_QUESTIONS.forEach(question => {
        expect(question.is_active).toBe(true)
      })
    })

    it('should have unique ids', () => {
      const ids = TICKET_INFO_FORM_QUESTIONS.map(q => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have grid configuration', () => {
      TICKET_INFO_FORM_QUESTIONS.forEach(question => {
        expect(question.grid).toHaveProperty('col_span')
        expect(typeof question.grid.col_span).toBe('number')
      })
    })

    it('should have non-empty labels', () => {
      TICKET_INFO_FORM_QUESTIONS.forEach(question => {
        expect(question.label.length).toBeGreaterThan(0)
      })
    })
  })

  describe('MESSAGE_INFO_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(MESSAGE_INFO_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(MESSAGE_INFO_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 1 form question', () => {
      expect(MESSAGE_INFO_FORM_QUESTIONS).toHaveLength(1)
    })

    it('should have consistent structure', () => {
      MESSAGE_INFO_FORM_QUESTIONS.forEach(question => {
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
      })
    })

    it('should be for attachments', () => {
      const attachmentField = MESSAGE_INFO_FORM_QUESTIONS[0]
      expect(attachmentField.schema_key).toBe('attachments')
      expect(attachmentField.label).toBe('Attachments')
    })

    it('should be optional field', () => {
      const attachmentField = MESSAGE_INFO_FORM_QUESTIONS[0]
      expect(attachmentField.is_required).toBe(false)
    })

    it('should have large col_span for attachments', () => {
      const attachmentField = MESSAGE_INFO_FORM_QUESTIONS[0]
      expect(attachmentField.grid.col_span).toBeGreaterThanOrEqual(8)
    })
  })

  describe('TICKET_CREATION_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(TICKET_CREATION_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TICKET_CREATION_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 3 sections', () => {
      expect(TICKET_CREATION_FORM_QUESTIONS).toHaveLength(3)
    })

    it('should have consistent structure', () => {
      TICKET_CREATION_FORM_QUESTIONS.forEach(section => {
        expect(section).toHaveProperty('id')
        expect(section).toHaveProperty('icon')
        expect(section).toHaveProperty('heading')
        expect(section).toHaveProperty('questions')
        expect(typeof section.id).toBe('number')
        expect(typeof section.icon).toBe('function')
        expect(typeof section.heading).toBe('string')
        expect(Array.isArray(section.questions)).toBe(true)
      })
    })

    describe('Requester Information Section', () => {
      const requesterSection = TICKET_CREATION_FORM_QUESTIONS[0]

      it('should be the first section', () => {
        expect(requesterSection.id).toBe(1)
      })

      it('should have correct heading', () => {
        expect(requesterSection.heading).toBe('Requester Information')
      })

      it('should have REQUESTER_INFO_FORM_QUESTIONS', () => {
        expect(requesterSection.questions).toBe(REQUESTER_INFO_FORM_QUESTIONS)
      })

      it('should have icon function', () => {
        expect(typeof requesterSection.icon).toBe('function')
      })
    })

    describe('Ticket Information Section', () => {
      const ticketSection = TICKET_CREATION_FORM_QUESTIONS[1]

      it('should be the second section', () => {
        expect(ticketSection.id).toBe(2)
      })

      it('should have correct heading', () => {
        expect(ticketSection.heading).toBe('Ticket Information')
      })

      it('should have TICKET_INFO_FORM_QUESTIONS', () => {
        expect(ticketSection.questions).toBe(TICKET_INFO_FORM_QUESTIONS)
      })

      it('should have icon function', () => {
        expect(typeof ticketSection.icon).toBe('function')
      })
    })

    describe('Attachments Section', () => {
      const attachmentsSection = TICKET_CREATION_FORM_QUESTIONS[2]

      it('should be the third section', () => {
        expect(attachmentsSection.id).toBe(3)
      })

      it('should have correct heading', () => {
        expect(attachmentsSection.heading).toBe('Attachments')
      })

      it('should have MESSAGE_INFO_FORM_QUESTIONS', () => {
        expect(attachmentsSection.questions).toBe(MESSAGE_INFO_FORM_QUESTIONS)
      })

      it('should have icon function', () => {
        expect(typeof attachmentsSection.icon).toBe('function')
      })
    })

    it('should have unique section ids', () => {
      const ids = TICKET_CREATION_FORM_QUESTIONS.map(section => section.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have non-empty headings', () => {
      TICKET_CREATION_FORM_QUESTIONS.forEach(section => {
        expect(section.heading.length).toBeGreaterThan(0)
      })
    })

    it('should have sections reference correct question arrays', () => {
      expect(TICKET_CREATION_FORM_QUESTIONS[0].questions).toBe(REQUESTER_INFO_FORM_QUESTIONS)
      expect(TICKET_CREATION_FORM_QUESTIONS[1].questions).toBe(TICKET_INFO_FORM_QUESTIONS)
      expect(TICKET_CREATION_FORM_QUESTIONS[2].questions).toBe(MESSAGE_INFO_FORM_QUESTIONS)
    })
  })

  describe('Form Constants Integration', () => {
    it('should have matching form modes and titles', () => {
      expect(TICKET_FORM_TITLES).toHaveProperty(TICKET_FORM_MODES.CREATE)
      expect(TICKET_FORM_TITLES).toHaveProperty(TICKET_FORM_MODES.EDIT)
      expect(TICKET_FORM_TITLES).toHaveProperty(TICKET_FORM_MODES.VIEW)
    })

    it('should have default values matching form questions schema keys', () => {
      const allQuestions = [
        ...REQUESTER_INFO_FORM_QUESTIONS,
        ...TICKET_INFO_FORM_QUESTIONS,
        ...MESSAGE_INFO_FORM_QUESTIONS
      ]

      allQuestions.forEach(question => {
        expect(TICKET_FORM_DEFAULT_VALUES).toHaveProperty(question.schema_key)
      })
    })

    it('should have all questions marked as active', () => {
      const allQuestions = [
        ...REQUESTER_INFO_FORM_QUESTIONS,
        ...TICKET_INFO_FORM_QUESTIONS,
        ...MESSAGE_INFO_FORM_QUESTIONS
      ]

      allQuestions.forEach(question => {
        expect(question.is_active).toBe(true)
      })
    })

    it('should have sequential ids across all sections', () => {
      const allQuestions = [
        ...REQUESTER_INFO_FORM_QUESTIONS,
        ...TICKET_INFO_FORM_QUESTIONS,
        ...MESSAGE_INFO_FORM_QUESTIONS
      ]

      const ids = allQuestions.map(q => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should organize questions into logical sections', () => {
      expect(TICKET_CREATION_FORM_QUESTIONS).toHaveLength(3)
      expect(TICKET_CREATION_FORM_QUESTIONS[0].heading).toContain('Requester')
      expect(TICKET_CREATION_FORM_QUESTIONS[1].heading).toContain('Ticket')
      expect(TICKET_CREATION_FORM_QUESTIONS[2].heading).toContain('Attachments')
    })
  })
})
