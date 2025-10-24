/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { TICKET_STATUS, TICKET_STATUS_LABELS, TICKET_STATUS_OPTIONS } from '@support-ticket-management/constants'

describe('Support Ticket Status Constants', () => {
  describe('TICKET_STATUS', () => {
    it('should be defined', () => {
      expect(TICKET_STATUS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_STATUS).toBe('object')
    })

    it('should have ALL property', () => {
      expect(TICKET_STATUS).toHaveProperty('ALL')
      expect(TICKET_STATUS.ALL).toBe('all')
    })

    it('should have NEW property', () => {
      expect(TICKET_STATUS).toHaveProperty('NEW')
      expect(TICKET_STATUS.NEW).toBe('new')
    })

    it('should have OPEN property', () => {
      expect(TICKET_STATUS).toHaveProperty('OPEN')
      expect(TICKET_STATUS.OPEN).toBe('open')
    })

    it('should have IN_PROGRESS property', () => {
      expect(TICKET_STATUS).toHaveProperty('IN_PROGRESS')
      expect(TICKET_STATUS.IN_PROGRESS).toBe('in_progress')
    })

    it('should have PENDING_CUSTOMER property', () => {
      expect(TICKET_STATUS).toHaveProperty('PENDING_CUSTOMER')
      expect(TICKET_STATUS.PENDING_CUSTOMER).toBe('pending_customer')
    })

    it('should have PENDING_INTERNAL property', () => {
      expect(TICKET_STATUS).toHaveProperty('PENDING_INTERNAL')
      expect(TICKET_STATUS.PENDING_INTERNAL).toBe('pending_internal')
    })

    it('should have ESCALATED property', () => {
      expect(TICKET_STATUS).toHaveProperty('ESCALATED')
      expect(TICKET_STATUS.ESCALATED).toBe('escalated')
    })

    it('should have RESOLVED property', () => {
      expect(TICKET_STATUS).toHaveProperty('RESOLVED')
      expect(TICKET_STATUS.RESOLVED).toBe('resolved')
    })

    it('should have CLOSED property', () => {
      expect(TICKET_STATUS).toHaveProperty('CLOSED')
      expect(TICKET_STATUS.CLOSED).toBe('closed')
    })

    it('should have CANCELLED property', () => {
      expect(TICKET_STATUS).toHaveProperty('CANCELLED')
      expect(TICKET_STATUS.CANCELLED).toBe('cancelled')
    })

    it('should have PENDING property', () => {
      expect(TICKET_STATUS).toHaveProperty('PENDING')
      expect(TICKET_STATUS.PENDING).toBe('pending')
    })

    it('should have exactly 11 properties', () => {
      expect(Object.keys(TICKET_STATUS)).toHaveLength(11)
    })

    it('should use lowercase or snake_case values', () => {
      Object.values(TICKET_STATUS).forEach(value => {
        expect(value).toBe(value.toLowerCase())
        expect(value).toMatch(/^[a-z_]+$/)
      })
    })

    it('should have all string values', () => {
      Object.values(TICKET_STATUS).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(TICKET_STATUS).toBeDefined()
      expect(typeof TICKET_STATUS).toBe('object')
    })

    it('should have unique values', () => {
      const values = Object.values(TICKET_STATUS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should not be null', () => {
      expect(TICKET_STATUS).not.toBeNull()
    })

    it('should have non-empty values', () => {
      Object.values(TICKET_STATUS).forEach(value => {
        expect(value.length).toBeGreaterThan(0)
      })
    })
  })

  describe('TICKET_STATUS_LABELS', () => {
    it('should be defined', () => {
      expect(TICKET_STATUS_LABELS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof TICKET_STATUS_LABELS).toBe('object')
    })

    it('should have label for ALL status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.ALL]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.ALL]).toBe('All Status')
    })

    it('should have label for NEW status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.NEW]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.NEW]).toBe('New')
    })

    it('should have label for OPEN status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.OPEN]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.OPEN]).toBe('Open')
    })

    it('should have label for IN_PROGRESS status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.IN_PROGRESS]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.IN_PROGRESS]).toBe('In Progress')
    })

    it('should have label for PENDING_CUSTOMER status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.PENDING_CUSTOMER]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.PENDING_CUSTOMER]).toBe('Pending Customer')
    })

    it('should have label for PENDING_INTERNAL status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.PENDING_INTERNAL]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.PENDING_INTERNAL]).toBe('Pending Internal')
    })

    it('should have label for ESCALATED status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.ESCALATED]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.ESCALATED]).toBe('Escalated')
    })

    it('should have label for RESOLVED status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.RESOLVED]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.RESOLVED]).toBe('Resolved')
    })

    it('should have label for CLOSED status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.CLOSED]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.CLOSED]).toBe('Closed')
    })

    it('should have label for CANCELLED status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.CANCELLED]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.CANCELLED]).toBe('Cancelled')
    })

    it('should have label for PENDING status', () => {
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.PENDING]).toBeDefined()
      expect(TICKET_STATUS_LABELS[TICKET_STATUS.PENDING]).toBe('Pending')
    })

    it('should have exactly 11 properties', () => {
      expect(Object.keys(TICKET_STATUS_LABELS)).toHaveLength(11)
    })

    it('should have all string values', () => {
      Object.values(TICKET_STATUS_LABELS).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should use proper case for display labels', () => {
      Object.values(TICKET_STATUS_LABELS).forEach(label => {
        /* First character should be uppercase */
        expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase())
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(TICKET_STATUS_LABELS).toBeDefined()
      expect(typeof TICKET_STATUS_LABELS).toBe('object')
    })

    it('should have labels for all status values', () => {
      Object.values(TICKET_STATUS).forEach(status => {
        expect(TICKET_STATUS_LABELS[status]).toBeDefined()
      })
    })

    it('should have non-empty labels', () => {
      Object.values(TICKET_STATUS_LABELS).forEach(label => {
        expect(label.length).toBeGreaterThan(0)
      })
    })
  })

  describe('TICKET_STATUS_OPTIONS', () => {
    it('should be defined', () => {
      expect(TICKET_STATUS_OPTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(TICKET_STATUS_OPTIONS)).toBe(true)
    })

    it('should have 9 status options', () => {
      /* All statuses except ALL and PENDING */
      expect(TICKET_STATUS_OPTIONS).toHaveLength(9)
    })

    it('should have consistent structure', () => {
      TICKET_STATUS_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')
        expect(typeof option.value).toBe('string')
      })
    })

    describe('NEW Status Option', () => {
      const newOption = TICKET_STATUS_OPTIONS[0]

      it('should be the first option', () => {
        expect(newOption.value).toBe(TICKET_STATUS.NEW)
      })

      it('should have correct label', () => {
        expect(newOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.NEW])
        expect(newOption.label).toBe('New')
      })

      it('should have correct value', () => {
        expect(newOption.value).toBe('new')
      })
    })

    describe('OPEN Status Option', () => {
      const openOption = TICKET_STATUS_OPTIONS[1]

      it('should be the second option', () => {
        expect(openOption.value).toBe(TICKET_STATUS.OPEN)
      })

      it('should have correct label', () => {
        expect(openOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.OPEN])
        expect(openOption.label).toBe('Open')
      })

      it('should have correct value', () => {
        expect(openOption.value).toBe('open')
      })
    })

    describe('IN_PROGRESS Status Option', () => {
      const inProgressOption = TICKET_STATUS_OPTIONS[2]

      it('should be the third option', () => {
        expect(inProgressOption.value).toBe(TICKET_STATUS.IN_PROGRESS)
      })

      it('should have correct label', () => {
        expect(inProgressOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.IN_PROGRESS])
        expect(inProgressOption.label).toBe('In Progress')
      })

      it('should have correct value', () => {
        expect(inProgressOption.value).toBe('in_progress')
      })
    })

    describe('PENDING_CUSTOMER Status Option', () => {
      const pendingCustomerOption = TICKET_STATUS_OPTIONS[3]

      it('should be the fourth option', () => {
        expect(pendingCustomerOption.value).toBe(TICKET_STATUS.PENDING_CUSTOMER)
      })

      it('should have correct label', () => {
        expect(pendingCustomerOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.PENDING_CUSTOMER])
        expect(pendingCustomerOption.label).toBe('Pending Customer')
      })

      it('should have correct value', () => {
        expect(pendingCustomerOption.value).toBe('pending_customer')
      })
    })

    describe('PENDING_INTERNAL Status Option', () => {
      const pendingInternalOption = TICKET_STATUS_OPTIONS[4]

      it('should be the fifth option', () => {
        expect(pendingInternalOption.value).toBe(TICKET_STATUS.PENDING_INTERNAL)
      })

      it('should have correct label', () => {
        expect(pendingInternalOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.PENDING_INTERNAL])
        expect(pendingInternalOption.label).toBe('Pending Internal')
      })

      it('should have correct value', () => {
        expect(pendingInternalOption.value).toBe('pending_internal')
      })
    })

    describe('ESCALATED Status Option', () => {
      const escalatedOption = TICKET_STATUS_OPTIONS[5]

      it('should be the sixth option', () => {
        expect(escalatedOption.value).toBe(TICKET_STATUS.ESCALATED)
      })

      it('should have correct label', () => {
        expect(escalatedOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.ESCALATED])
        expect(escalatedOption.label).toBe('Escalated')
      })

      it('should have correct value', () => {
        expect(escalatedOption.value).toBe('escalated')
      })
    })

    describe('RESOLVED Status Option', () => {
      const resolvedOption = TICKET_STATUS_OPTIONS[6]

      it('should be the seventh option', () => {
        expect(resolvedOption.value).toBe(TICKET_STATUS.RESOLVED)
      })

      it('should have correct label', () => {
        expect(resolvedOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.RESOLVED])
        expect(resolvedOption.label).toBe('Resolved')
      })

      it('should have correct value', () => {
        expect(resolvedOption.value).toBe('resolved')
      })
    })

    describe('CLOSED Status Option', () => {
      const closedOption = TICKET_STATUS_OPTIONS[7]

      it('should be the eighth option', () => {
        expect(closedOption.value).toBe(TICKET_STATUS.CLOSED)
      })

      it('should have correct label', () => {
        expect(closedOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.CLOSED])
        expect(closedOption.label).toBe('Closed')
      })

      it('should have correct value', () => {
        expect(closedOption.value).toBe('closed')
      })
    })

    describe('CANCELLED Status Option', () => {
      const cancelledOption = TICKET_STATUS_OPTIONS[8]

      it('should be the ninth option', () => {
        expect(cancelledOption.value).toBe(TICKET_STATUS.CANCELLED)
      })

      it('should have correct label', () => {
        expect(cancelledOption.label).toBe(TICKET_STATUS_LABELS[TICKET_STATUS.CANCELLED])
        expect(cancelledOption.label).toBe('Cancelled')
      })

      it('should have correct value', () => {
        expect(cancelledOption.value).toBe('cancelled')
      })
    })

    it('should have unique values', () => {
      const values = TICKET_STATUS_OPTIONS.map(opt => opt.value)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should have unique labels', () => {
      const labels = TICKET_STATUS_OPTIONS.map(opt => opt.label)
      const uniqueLabels = new Set(labels)
      expect(uniqueLabels.size).toBe(labels.length)
    })

    it('should use status values from TICKET_STATUS constant', () => {
      const statusValues = Object.values(TICKET_STATUS)
      TICKET_STATUS_OPTIONS.forEach(option => {
        expect(statusValues).toContain(option.value)
      })
    })

    it('should not include ALL status', () => {
      const allOption = TICKET_STATUS_OPTIONS.find(opt => opt.value === TICKET_STATUS.ALL)
      expect(allOption).toBeUndefined()
    })

    it('should not include PENDING status', () => {
      const pendingOption = TICKET_STATUS_OPTIONS.find(opt => opt.value === TICKET_STATUS.PENDING)
      expect(pendingOption).toBeUndefined()
    })

    it('should be a const array', () => {
      /* TypeScript enforces readonly at compile time */
      expect(TICKET_STATUS_OPTIONS).toBeDefined()
      expect(Array.isArray(TICKET_STATUS_OPTIONS)).toBe(true)
    })

    it('should have non-empty labels', () => {
      TICKET_STATUS_OPTIONS.forEach(option => {
        expect(option.label.length).toBeGreaterThan(0)
      })
    })

    it('should use lowercase or snake_case values', () => {
      TICKET_STATUS_OPTIONS.forEach(option => {
        expect(option.value).toBe(option.value.toLowerCase())
        expect(option.value).toMatch(/^[a-z_]+$/)
      })
    })

    it('should be suitable for dropdown use', () => {
      /* Should have specific status options for updates */
      expect(TICKET_STATUS_OPTIONS.every(opt => opt.value !== 'all')).toBe(true)
      expect(TICKET_STATUS_OPTIONS.every(opt => opt.value !== 'pending')).toBe(true)
    })
  })

  describe('Status Constants Integration', () => {
    it('should use TICKET_STATUS values in TICKET_STATUS_OPTIONS', () => {
      const statusValues = Object.values(TICKET_STATUS)
      TICKET_STATUS_OPTIONS.forEach(option => {
        expect(statusValues).toContain(option.value)
      })
    })

    it('should use TICKET_STATUS_LABELS in TICKET_STATUS_OPTIONS', () => {
      TICKET_STATUS_OPTIONS.forEach(option => {
        expect(option.label).toBe(TICKET_STATUS_LABELS[option.value])
      })
    })

    it('should have consistent naming convention', () => {
      /* TICKET_STATUS uses lowercase/snake_case values */
      Object.values(TICKET_STATUS).forEach(value => {
        expect(value).toBe(value.toLowerCase())
        expect(value).toMatch(/^[a-z_]+$/)
      })

      /* TICKET_STATUS_LABELS uses proper case */
      Object.values(TICKET_STATUS_LABELS).forEach(label => {
        expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase())
      })
    })

    it('should cover all updatable statuses', () => {
      /* Options array should not include ALL (filter only) and PENDING (generic) */
      const optionValues = TICKET_STATUS_OPTIONS.map(opt => opt.value)
      expect(optionValues).not.toContain(TICKET_STATUS.ALL)
      expect(optionValues).not.toContain(TICKET_STATUS.PENDING)
    })

    it('should have labels for all status values', () => {
      Object.values(TICKET_STATUS).forEach(status => {
        expect(TICKET_STATUS_LABELS[status]).toBeDefined()
        expect(TICKET_STATUS_LABELS[status].length).toBeGreaterThan(0)
      })
    })
  })

  describe('Status Workflow', () => {
    it('should support ticket lifecycle', () => {
      /* Typical ticket workflow */
      const workflow = [
        TICKET_STATUS.NEW,
        TICKET_STATUS.OPEN,
        TICKET_STATUS.IN_PROGRESS,
        TICKET_STATUS.RESOLVED,
        TICKET_STATUS.CLOSED
      ]

      workflow.forEach(status => {
        expect(TICKET_STATUS_OPTIONS.find(opt => opt.value === status)).toBeDefined()
      })
    })

    it('should support pending states', () => {
      /* Pending states for waiting scenarios */
      expect(TICKET_STATUS.PENDING_CUSTOMER).toBe('pending_customer')
      expect(TICKET_STATUS.PENDING_INTERNAL).toBe('pending_internal')
      expect(TICKET_STATUS.PENDING).toBe('pending')
    })

    it('should support escalation', () => {
      expect(TICKET_STATUS.ESCALATED).toBe('escalated')
      const escalatedOption = TICKET_STATUS_OPTIONS.find(opt => opt.value === TICKET_STATUS.ESCALATED)
      expect(escalatedOption).toBeDefined()
    })

    it('should support cancellation', () => {
      expect(TICKET_STATUS.CANCELLED).toBe('cancelled')
      const cancelledOption = TICKET_STATUS_OPTIONS.find(opt => opt.value === TICKET_STATUS.CANCELLED)
      expect(cancelledOption).toBeDefined()
    })
  })
})
