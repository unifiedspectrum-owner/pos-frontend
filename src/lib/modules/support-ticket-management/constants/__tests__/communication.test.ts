/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { SENDER_TYPES, type SenderType } from '@support-ticket-management/constants'

describe('Support Ticket Communication Constants', () => {
  describe('SENDER_TYPES', () => {
    it('should be defined', () => {
      expect(SENDER_TYPES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof SENDER_TYPES).toBe('object')
    })

    it('should have CUSTOMER property', () => {
      expect(SENDER_TYPES).toHaveProperty('CUSTOMER')
      expect(SENDER_TYPES.CUSTOMER).toBe('customer')
    })

    it('should have AGENT property', () => {
      expect(SENDER_TYPES).toHaveProperty('AGENT')
      expect(SENDER_TYPES.AGENT).toBe('agent')
    })

    it('should have SYSTEM property', () => {
      expect(SENDER_TYPES).toHaveProperty('SYSTEM')
      expect(SENDER_TYPES.SYSTEM).toBe('system')
    })

    it('should have exactly 3 properties', () => {
      expect(Object.keys(SENDER_TYPES)).toHaveLength(3)
    })

    it('should use lowercase values', () => {
      Object.values(SENDER_TYPES).forEach(value => {
        expect(value).toBe(value.toLowerCase())
      })
    })

    it('should have all string values', () => {
      Object.values(SENDER_TYPES).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(SENDER_TYPES).toBeDefined()
      expect(typeof SENDER_TYPES).toBe('object')
    })

    it('should have unique values', () => {
      const values = Object.values(SENDER_TYPES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should use simple sender type names', () => {
      Object.values(SENDER_TYPES).forEach(value => {
        expect(value).toMatch(/^[a-z]+$/)
      })
    })

    it('should not be null', () => {
      expect(SENDER_TYPES).not.toBeNull()
    })

    it('should have non-empty values', () => {
      Object.values(SENDER_TYPES).forEach(value => {
        expect(value.length).toBeGreaterThan(0)
      })
    })

    describe('Value Validation', () => {
      it('should have correct CUSTOMER value', () => {
        expect(SENDER_TYPES.CUSTOMER).toBe('customer')
      })

      it('should have correct AGENT value', () => {
        expect(SENDER_TYPES.AGENT).toBe('agent')
      })

      it('should have correct SYSTEM value', () => {
        expect(SENDER_TYPES.SYSTEM).toBe('system')
      })

      it('should not have undefined values', () => {
        Object.values(SENDER_TYPES).forEach(value => {
          expect(value).not.toBeUndefined()
        })
      })

      it('should not have null values', () => {
        Object.values(SENDER_TYPES).forEach(value => {
          expect(value).not.toBeNull()
        })
      })
    })

    describe('Usage Scenarios', () => {
      it('should be usable for message sender identification', () => {
        const customerMessage = { sender_type: SENDER_TYPES.CUSTOMER }
        const agentMessage = { sender_type: SENDER_TYPES.AGENT }
        const systemMessage = { sender_type: SENDER_TYPES.SYSTEM }

        expect(customerMessage.sender_type).toBe('customer')
        expect(agentMessage.sender_type).toBe('agent')
        expect(systemMessage.sender_type).toBe('system')
      })

      it('should be usable in switch statements', () => {
        const getSenderLabel = (type: string) => {
          switch (type) {
            case SENDER_TYPES.CUSTOMER:
              return 'Customer'
            case SENDER_TYPES.AGENT:
              return 'Agent'
            case SENDER_TYPES.SYSTEM:
              return 'System'
            default:
              return 'Unknown'
          }
        }

        expect(getSenderLabel(SENDER_TYPES.CUSTOMER)).toBe('Customer')
        expect(getSenderLabel(SENDER_TYPES.AGENT)).toBe('Agent')
        expect(getSenderLabel(SENDER_TYPES.SYSTEM)).toBe('System')
      })

      it('should be usable for filtering messages', () => {
        const messages = [
          { id: 1, sender: SENDER_TYPES.CUSTOMER },
          { id: 2, sender: SENDER_TYPES.AGENT },
          { id: 3, sender: SENDER_TYPES.SYSTEM },
          { id: 4, sender: SENDER_TYPES.CUSTOMER }
        ]

        const customerMessages = messages.filter(m => m.sender === SENDER_TYPES.CUSTOMER)
        expect(customerMessages).toHaveLength(2)
      })
    })
  })

  describe('SenderType Type', () => {
    it('should be compatible with SENDER_TYPES values', () => {
      /* TypeScript type checking - this will compile if type is correct */
      const customerType: SenderType = SENDER_TYPES.CUSTOMER
      const agentType: SenderType = SENDER_TYPES.AGENT
      const systemType: SenderType = SENDER_TYPES.SYSTEM

      expect(customerType).toBe('customer')
      expect(agentType).toBe('agent')
      expect(systemType).toBe('system')
    })

    it('should accept valid sender type strings', () => {
      const testCustomer: SenderType = 'customer'
      const testAgent: SenderType = 'agent'
      const testSystem: SenderType = 'system'

      expect(testCustomer).toBe(SENDER_TYPES.CUSTOMER)
      expect(testAgent).toBe(SENDER_TYPES.AGENT)
      expect(testSystem).toBe(SENDER_TYPES.SYSTEM)
    })

    it('should provide type safety', () => {
      const validateSenderType = (type: SenderType): boolean => {
        return Object.values(SENDER_TYPES).includes(type)
      }

      expect(validateSenderType(SENDER_TYPES.CUSTOMER)).toBe(true)
      expect(validateSenderType(SENDER_TYPES.AGENT)).toBe(true)
      expect(validateSenderType(SENDER_TYPES.SYSTEM)).toBe(true)
    })
  })

  describe('Constants Integration', () => {
    it('should work with type guards', () => {
      const isSenderType = (value: string): value is SenderType => {
        return Object.values(SENDER_TYPES).includes(value as SenderType)
      }

      expect(isSenderType('customer')).toBe(true)
      expect(isSenderType('agent')).toBe(true)
      expect(isSenderType('system')).toBe(true)
      expect(isSenderType('invalid')).toBe(false)
    })

    it('should maintain consistency across usage', () => {
      const senderTypes = Object.values(SENDER_TYPES)
      expect(senderTypes).toContain('customer')
      expect(senderTypes).toContain('agent')
      expect(senderTypes).toContain('system')
    })

    it('should have consistent naming convention', () => {
      /* Keys should be UPPERCASE */
      Object.keys(SENDER_TYPES).forEach(key => {
        expect(key).toBe(key.toUpperCase())
      })

      /* Values should be lowercase */
      Object.values(SENDER_TYPES).forEach(value => {
        expect(value).toBe(value.toLowerCase())
      })
    })
  })
})
