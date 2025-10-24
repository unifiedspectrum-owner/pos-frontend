/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { TICKET_VIEW_FIELD_TYPES, TICKET_DETAILS_TAB, TICKET_DETAILS_TABS, TicketInfoFields, RequesterInfoFields, AssignmentInfoFields, SatisfactionRatingFields, TICKET_DETAILS_SECTIONS } from '@support-ticket-management/constants'

describe('Support Ticket View Configuration Constants', () => {
  describe('TICKET_VIEW_FIELD_TYPES', () => {
    it('should be defined', () => {
      expect(TICKET_VIEW_FIELD_TYPES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_VIEW_FIELD_TYPES).toBe('object')
    })

    it('should have TEXT property', () => {
      expect(TICKET_VIEW_FIELD_TYPES).toHaveProperty('TEXT')
      expect(TICKET_VIEW_FIELD_TYPES.TEXT).toBe('TEXT')
    })

    it('should have BADGE property', () => {
      expect(TICKET_VIEW_FIELD_TYPES).toHaveProperty('BADGE')
      expect(TICKET_VIEW_FIELD_TYPES.BADGE).toBe('BADGE')
    })

    it('should have DATE property', () => {
      expect(TICKET_VIEW_FIELD_TYPES).toHaveProperty('DATE')
      expect(TICKET_VIEW_FIELD_TYPES.DATE).toBe('DATE')
    })

    it('should have STATUS_BADGE property', () => {
      expect(TICKET_VIEW_FIELD_TYPES).toHaveProperty('STATUS_BADGE')
      expect(TICKET_VIEW_FIELD_TYPES.STATUS_BADGE).toBe('STATUS_BADGE')
    })

    it('should have OVERDUE_BADGE property', () => {
      expect(TICKET_VIEW_FIELD_TYPES).toHaveProperty('OVERDUE_BADGE')
      expect(TICKET_VIEW_FIELD_TYPES.OVERDUE_BADGE).toBe('OVERDUE_BADGE')
    })

    it('should have STAR_RATING property', () => {
      expect(TICKET_VIEW_FIELD_TYPES).toHaveProperty('STAR_RATING')
      expect(TICKET_VIEW_FIELD_TYPES.STAR_RATING).toBe('STAR_RATING')
    })

    it('should have CUSTOM property', () => {
      expect(TICKET_VIEW_FIELD_TYPES).toHaveProperty('CUSTOM')
      expect(TICKET_VIEW_FIELD_TYPES.CUSTOM).toBe('CUSTOM')
    })

    it('should have exactly 7 properties', () => {
      expect(Object.keys(TICKET_VIEW_FIELD_TYPES)).toHaveLength(7)
    })

    it('should have all uppercase values', () => {
      Object.values(TICKET_VIEW_FIELD_TYPES).forEach(value => {
        expect(value).toBe(value.toUpperCase())
      })
    })

    it('should have all string values', () => {
      Object.values(TICKET_VIEW_FIELD_TYPES).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should have unique values', () => {
      const values = Object.values(TICKET_VIEW_FIELD_TYPES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('TICKET_DETAILS_TAB', () => {
    it('should be defined', () => {
      expect(TICKET_DETAILS_TAB).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_DETAILS_TAB).toBe('object')
    })

    it('should have OVERVIEW property', () => {
      expect(TICKET_DETAILS_TAB).toHaveProperty('OVERVIEW')
      expect(TICKET_DETAILS_TAB.OVERVIEW).toBe('overview')
    })

    it('should have COMMUNICATIONS property', () => {
      expect(TICKET_DETAILS_TAB).toHaveProperty('COMMUNICATIONS')
      expect(TICKET_DETAILS_TAB.COMMUNICATIONS).toBe('communications')
    })

    it('should have exactly 2 properties', () => {
      expect(Object.keys(TICKET_DETAILS_TAB)).toHaveLength(2)
    })

    it('should use lowercase values', () => {
      Object.values(TICKET_DETAILS_TAB).forEach(value => {
        expect(value).toBe(value.toLowerCase())
      })
    })

    it('should have all string values', () => {
      Object.values(TICKET_DETAILS_TAB).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should have unique values', () => {
      const values = Object.values(TICKET_DETAILS_TAB)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('TICKET_DETAILS_TABS', () => {
    it('should be defined', () => {
      expect(TICKET_DETAILS_TABS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TICKET_DETAILS_TABS)).toBe(true)
    })

    it('should have 2 tabs', () => {
      expect(TICKET_DETAILS_TABS).toHaveLength(2)
    })

    it('should have consistent structure', () => {
      TICKET_DETAILS_TABS.forEach(tab => {
        expect(tab).toHaveProperty('id')
        expect(tab).toHaveProperty('label')
        expect(tab).toHaveProperty('icon')
        expect(typeof tab.id).toBe('string')
        expect(typeof tab.label).toBe('string')
        expect(typeof tab.icon).toBe('function')
      })
    })

    describe('Overview Tab', () => {
      const overviewTab = TICKET_DETAILS_TABS[0]

      it('should be the first tab', () => {
        expect(overviewTab.id).toBe(TICKET_DETAILS_TAB.OVERVIEW)
      })

      it('should have correct label', () => {
        expect(overviewTab.label).toBe('Overview')
      })

      it('should have correct id', () => {
        expect(overviewTab.id).toBe('overview')
      })

      it('should have icon function', () => {
        expect(typeof overviewTab.icon).toBe('function')
      })
    })

    describe('Communications Tab', () => {
      const communicationsTab = TICKET_DETAILS_TABS[1]

      it('should be the second tab', () => {
        expect(communicationsTab.id).toBe(TICKET_DETAILS_TAB.COMMUNICATIONS)
      })

      it('should have correct label', () => {
        expect(communicationsTab.label).toBe('Communications')
      })

      it('should have correct id', () => {
        expect(communicationsTab.id).toBe('communications')
      })

      it('should have icon function', () => {
        expect(typeof communicationsTab.icon).toBe('function')
      })
    })

    it('should have unique tab ids', () => {
      const ids = TICKET_DETAILS_TABS.map(tab => tab.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique tab labels', () => {
      const labels = TICKET_DETAILS_TABS.map(tab => tab.label)
      const uniqueLabels = new Set(labels)
      expect(uniqueLabels.size).toBe(labels.length)
    })
  })

  describe('TicketInfoFields', () => {
    it('should be defined', () => {
      expect(TicketInfoFields).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TicketInfoFields)).toBe(true)
    })

    it('should have 8 fields', () => {
      expect(TicketInfoFields).toHaveLength(8)
    })

    it('should have consistent structure', () => {
      TicketInfoFields.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('display_order')
        expect(field).toHaveProperty('is_active')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('icon_name')
        expect(field).toHaveProperty('data_key')
        expect(field).toHaveProperty('type')
        expect(typeof field.id).toBe('number')
        expect(typeof field.display_order).toBe('number')
        expect(typeof field.is_active).toBe('boolean')
        expect(typeof field.label).toBe('string')
        expect(typeof field.icon_name).toBe('function')
        expect(typeof field.data_key).toBe('string')
        expect(typeof field.type).toBe('string')
      })
    })

    it('should have sequential display orders', () => {
      TicketInfoFields.forEach((field, index) => {
        expect(field.display_order).toBe(index + 1)
      })
    })

    it('should have all active fields', () => {
      TicketInfoFields.forEach(field => {
        expect(field.is_active).toBe(true)
      })
    })

    it('should have unique ids', () => {
      const ids = TicketInfoFields.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique data keys', () => {
      const dataKeys = TicketInfoFields.map(field => field.data_key)
      const uniqueDataKeys = new Set(dataKeys)
      expect(uniqueDataKeys.size).toBe(dataKeys.length)
    })

    it('should use valid field types', () => {
      const validTypes = Object.values(TICKET_VIEW_FIELD_TYPES)
      TicketInfoFields.forEach(field => {
        expect(validTypes).toContain(field.type)
      })
    })

    it('should have non-empty labels', () => {
      TicketInfoFields.forEach(field => {
        expect(field.label.length).toBeGreaterThan(0)
      })
    })
  })

  describe('RequesterInfoFields', () => {
    it('should be defined', () => {
      expect(RequesterInfoFields).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(RequesterInfoFields)).toBe(true)
    })

    it('should have 4 fields', () => {
      expect(RequesterInfoFields).toHaveLength(4)
    })

    it('should have consistent structure', () => {
      RequesterInfoFields.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('display_order')
        expect(field).toHaveProperty('is_active')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('icon_name')
        expect(field).toHaveProperty('data_key')
        expect(field).toHaveProperty('type')
        expect(typeof field.id).toBe('number')
        expect(typeof field.display_order).toBe('number')
        expect(typeof field.is_active).toBe('boolean')
        expect(typeof field.label).toBe('string')
        expect(typeof field.icon_name).toBe('function')
        expect(typeof field.data_key).toBe('string')
        expect(typeof field.type).toBe('string')
      })
    })

    it('should have sequential display orders', () => {
      RequesterInfoFields.forEach((field, index) => {
        expect(field.display_order).toBe(index + 1)
      })
    })

    it('should have all active fields', () => {
      RequesterInfoFields.forEach(field => {
        expect(field.is_active).toBe(true)
      })
    })

    it('should have unique ids', () => {
      const ids = RequesterInfoFields.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should use TEXT field type', () => {
      RequesterInfoFields.forEach(field => {
        expect(field.type).toBe(TICKET_VIEW_FIELD_TYPES.TEXT)
      })
    })

    it('should have non-empty labels', () => {
      RequesterInfoFields.forEach(field => {
        expect(field.label.length).toBeGreaterThan(0)
      })
    })
  })

  describe('AssignmentInfoFields', () => {
    it('should be defined', () => {
      expect(AssignmentInfoFields).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(AssignmentInfoFields)).toBe(true)
    })

    it('should have 3 fields', () => {
      expect(AssignmentInfoFields).toHaveLength(3)
    })

    it('should have consistent structure', () => {
      AssignmentInfoFields.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('display_order')
        expect(field).toHaveProperty('is_active')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('icon_name')
        expect(field).toHaveProperty('data_key')
        expect(field).toHaveProperty('type')
      })
    })

    it('should have sequential display orders', () => {
      AssignmentInfoFields.forEach((field, index) => {
        expect(field.display_order).toBe(index + 1)
      })
    })

    it('should have all active fields', () => {
      AssignmentInfoFields.forEach(field => {
        expect(field.is_active).toBe(true)
      })
    })

    it('should have unique ids', () => {
      const ids = AssignmentInfoFields.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should use valid field types', () => {
      const validTypes = Object.values(TICKET_VIEW_FIELD_TYPES)
      AssignmentInfoFields.forEach(field => {
        expect(validTypes).toContain(field.type)
      })
    })

    it('should have nested data keys for assignment details', () => {
      AssignmentInfoFields.forEach(field => {
        if (field.data_key.includes('.')) {
          expect(field.data_key).toContain('assignment_details')
        }
      })
    })
  })

  describe('SatisfactionRatingFields', () => {
    it('should be defined', () => {
      expect(SatisfactionRatingFields).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(SatisfactionRatingFields)).toBe(true)
    })

    it('should have 2 fields', () => {
      expect(SatisfactionRatingFields).toHaveLength(2)
    })

    it('should have consistent structure', () => {
      SatisfactionRatingFields.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('display_order')
        expect(field).toHaveProperty('is_active')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('icon_name')
        expect(field).toHaveProperty('data_key')
        expect(field).toHaveProperty('type')
      })
    })

    it('should have sequential display orders', () => {
      SatisfactionRatingFields.forEach((field, index) => {
        expect(field.display_order).toBe(index + 1)
      })
    })

    it('should have all active fields', () => {
      SatisfactionRatingFields.forEach(field => {
        expect(field.is_active).toBe(true)
      })
    })

    it('should have rating field with STAR_RATING type', () => {
      const ratingField = SatisfactionRatingFields[0]
      expect(ratingField.type).toBe(TICKET_VIEW_FIELD_TYPES.STAR_RATING)
    })

    it('should have date field with DATE type', () => {
      const dateField = SatisfactionRatingFields[1]
      expect(dateField.type).toBe(TICKET_VIEW_FIELD_TYPES.DATE)
    })
  })

  describe('TICKET_DETAILS_SECTIONS', () => {
    it('should be defined', () => {
      expect(TICKET_DETAILS_SECTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TICKET_DETAILS_SECTIONS)).toBe(true)
    })

    it('should have 5 sections', () => {
      expect(TICKET_DETAILS_SECTIONS).toHaveLength(5)
    })

    it('should have consistent structure', () => {
      TICKET_DETAILS_SECTIONS.forEach(section => {
        expect(section).toHaveProperty('id')
        expect(section).toHaveProperty('section_heading')
        expect(section).toHaveProperty('section_values')
        expect(typeof section.id).toBe('string')
        expect(typeof section.section_heading).toBe('string')
        expect(Array.isArray(section.section_values)).toBe(true)
      })
    })

    describe('Ticket Info Section', () => {
      const ticketInfoSection = TICKET_DETAILS_SECTIONS[0]

      it('should have correct id', () => {
        expect(ticketInfoSection.id).toBe('ticket_info')
      })

      it('should have correct heading', () => {
        expect(ticketInfoSection.section_heading).toBe('Ticket Information')
      })

      it('should have TicketInfoFields', () => {
        expect(ticketInfoSection.section_values).toBe(TicketInfoFields)
      })

      it('should have columns property', () => {
        expect(ticketInfoSection.columns).toBe(4)
      })
    })

    describe('Requester Info Section', () => {
      const requesterInfoSection = TICKET_DETAILS_SECTIONS[1]

      it('should have correct id', () => {
        expect(requesterInfoSection.id).toBe('requester_info')
      })

      it('should have correct heading', () => {
        expect(requesterInfoSection.section_heading).toBe('Requester Information')
      })

      it('should have RequesterInfoFields', () => {
        expect(requesterInfoSection.section_values).toBe(RequesterInfoFields)
      })

      it('should have columns property', () => {
        expect(requesterInfoSection.columns).toBe(4)
      })
    })

    describe('Assignment Info Section', () => {
      const assignmentInfoSection = TICKET_DETAILS_SECTIONS[2]

      it('should have correct id', () => {
        expect(assignmentInfoSection.id).toBe('assignment_info')
      })

      it('should have correct heading', () => {
        expect(assignmentInfoSection.section_heading).toBe('Assignment Information')
      })

      it('should have AssignmentInfoFields', () => {
        expect(assignmentInfoSection.section_values).toBe(AssignmentInfoFields)
      })

      it('should have columns property', () => {
        expect(assignmentInfoSection.columns).toBe(4)
      })

      it('should have show_condition', () => {
        expect(assignmentInfoSection.show_condition).toBe('assignment_details')
      })

      it('should have empty_state_message', () => {
        expect(assignmentInfoSection.empty_state_message).toBe('Not yet assigned')
      })
    })

    describe('Internal Notes Section', () => {
      const internalNotesSection = TICKET_DETAILS_SECTIONS[3]

      it('should have correct id', () => {
        expect(internalNotesSection.id).toBe('internal_notes')
      })

      it('should have correct heading', () => {
        expect(internalNotesSection.section_heading).toBe('Internal Notes')
      })

      it('should have empty section_values', () => {
        expect(internalNotesSection.section_values).toHaveLength(0)
      })

      it('should have show_condition', () => {
        expect(internalNotesSection.show_condition).toBe('internal_notes')
      })
    })

    describe('Satisfaction Rating Section', () => {
      const satisfactionSection = TICKET_DETAILS_SECTIONS[4]

      it('should have correct id', () => {
        expect(satisfactionSection.id).toBe('satisfaction_rating')
      })

      it('should have correct heading', () => {
        expect(satisfactionSection.section_heading).toBe('Customer Satisfaction')
      })

      it('should have SatisfactionRatingFields', () => {
        expect(satisfactionSection.section_values).toBe(SatisfactionRatingFields)
      })

      it('should have columns property', () => {
        expect(satisfactionSection.columns).toBe(3)
      })

      it('should have show_condition', () => {
        expect(satisfactionSection.show_condition).toBe('satisfaction_rating')
      })
    })

    it('should have unique section ids', () => {
      const ids = TICKET_DETAILS_SECTIONS.map(section => section.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have non-empty headings', () => {
      TICKET_DETAILS_SECTIONS.forEach(section => {
        expect(section.section_heading.length).toBeGreaterThan(0)
      })
    })

    it('should have conditional sections with show_condition', () => {
      const conditionalSections = TICKET_DETAILS_SECTIONS.filter(section => section.show_condition)
      expect(conditionalSections.length).toBeGreaterThan(0)
    })
  })

  describe('View Configuration Integration', () => {
    it('should use consistent field types across all field arrays', () => {
      const validTypes = Object.values(TICKET_VIEW_FIELD_TYPES)
      const allFields = [
        ...TicketInfoFields,
        ...RequesterInfoFields,
        ...AssignmentInfoFields,
        ...SatisfactionRatingFields
      ]

      allFields.forEach(field => {
        expect(validTypes).toContain(field.type)
      })
    })

    it('should have sections reference correct field arrays', () => {
      expect(TICKET_DETAILS_SECTIONS[0].section_values).toBe(TicketInfoFields)
      expect(TICKET_DETAILS_SECTIONS[1].section_values).toBe(RequesterInfoFields)
      expect(TICKET_DETAILS_SECTIONS[2].section_values).toBe(AssignmentInfoFields)
      expect(TICKET_DETAILS_SECTIONS[4].section_values).toBe(SatisfactionRatingFields)
    })

    it('should have tabs match tab constants', () => {
      const tabIds = TICKET_DETAILS_TABS.map(tab => tab.id)
      expect(tabIds).toContain(TICKET_DETAILS_TAB.OVERVIEW)
      expect(tabIds).toContain(TICKET_DETAILS_TAB.COMMUNICATIONS)
    })

    it('should support conditional rendering', () => {
      const sectionsWithConditions = TICKET_DETAILS_SECTIONS.filter(s => s.show_condition)
      expect(sectionsWithConditions.length).toBe(3)
    })
  })
})
