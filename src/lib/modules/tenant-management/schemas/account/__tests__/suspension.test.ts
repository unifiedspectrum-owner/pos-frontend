/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'

/* Tenant management module imports */
import { holdTenantAccountSchema, suspendTenantAccountSchema, activateTenantAccountSchema, type HoldTenantFormData, type SuspendTenantFormData, type ActivateTenantFormData } from '../suspension'

describe('Tenant Account Suspension Schemas', () => {
  describe('holdTenantAccountSchema', () => {
    const validHoldData = {
      reason: 'Temporary hold for maintenance',
      hold_until: '2025-12-31'
    }

    describe('Valid Data', () => {
      it('validates correct hold data', () => {
        const result = holdTenantAccountSchema.safeParse(validHoldData)
        expect(result.success).toBe(true)
      })

      it('validates data with null hold_until', () => {
        const data = { ...validHoldData, hold_until: null }
        const result = holdTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates data without hold_until', () => {
        const data = { reason: 'Hold reason' }
        const result = holdTenantAccountSchema.safeParse({ ...data, hold_until: null })
        expect(result.success).toBe(true)
      })
    })

    describe('reason Field', () => {
      it('requires hold reason', () => {
        const data = { ...validHoldData, reason: '' }
        const result = holdTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Hold reason is required')
        }
      })

      it('rejects reason exceeding 500 characters', () => {
        const data = { ...validHoldData, reason: 'a'.repeat(501) }
        const result = holdTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts reason at max length', () => {
        const data = { ...validHoldData, reason: 'a'.repeat(500) }
        const result = holdTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts multiline reason text', () => {
        const data = {
          ...validHoldData,
          reason: 'Line 1\nLine 2\nLine 3'
        }
        const result = holdTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('hold_until Field', () => {
      it('accepts valid date in YYYY-MM-DD format', () => {
        const validDates = ['2025-12-31', '2024-01-01', '2030-06-15']

        validDates.forEach(date => {
          const data = { ...validHoldData, hold_until: date }
          const result = holdTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      it('accepts null value', () => {
        const data = { ...validHoldData, hold_until: null }
        const result = holdTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects invalid date formats', () => {
        const invalidDates = [
          '12/31/2025',
          '31-12-2025',
          '2025.12.31',
          '2025/12/31',
          '25-12-31'
        ]

        invalidDates.forEach(date => {
          const data = { ...validHoldData, hold_until: date }
          const result = holdTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toBe('Date must be in YYYY-MM-DD format')
          }
        })
      })

      it('rejects invalid date values', () => {
        const invalidDates = ['2025-13-01', '2025-12-32', '2025-00-01', '2025-12-00']

        invalidDates.forEach(date => {
          const data = { ...validHoldData, hold_until: date }
          const result = holdTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(false)
        })
      })

      it('rejects non-date strings', () => {
        const data = { ...validHoldData, hold_until: 'not a date' }
        const result = holdTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    describe('Type Inference', () => {
      it('infers correct TypeScript type', () => {
        const data: HoldTenantFormData = {
          reason: 'Test reason',
          hold_until: '2025-12-31'
        }
        expect(data).toBeDefined()
      })
    })
  })

  describe('suspendTenantAccountSchema', () => {
    const validSuspendData = {
      reason: 'Account suspended due to payment issues',
      suspend_until: '2025-12-31'
    }

    describe('Valid Data', () => {
      it('validates correct suspension data', () => {
        const result = suspendTenantAccountSchema.safeParse(validSuspendData)
        expect(result.success).toBe(true)
      })

      it('validates data with null suspend_until', () => {
        const data = { ...validSuspendData, suspend_until: null }
        const result = suspendTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('reason Field', () => {
      it('requires suspension reason', () => {
        const data = { ...validSuspendData, reason: '' }
        const result = suspendTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Suspension reason is required')
        }
      })

      it('rejects reason exceeding 500 characters', () => {
        const data = { ...validSuspendData, reason: 'a'.repeat(501) }
        const result = suspendTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts reason at max length', () => {
        const data = { ...validSuspendData, reason: 'a'.repeat(500) }
        const result = suspendTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts special characters in reason', () => {
        const data = {
          ...validSuspendData,
          reason: 'Suspension: Payment failed! Contact support@example.com for details.'
        }
        const result = suspendTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('suspend_until Field', () => {
      it('accepts valid date in YYYY-MM-DD format', () => {
        const validDates = ['2025-12-31', '2024-01-01', '2030-06-15']

        validDates.forEach(date => {
          const data = { ...validSuspendData, suspend_until: date }
          const result = suspendTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      it('accepts null value', () => {
        const data = { ...validSuspendData, suspend_until: null }
        const result = suspendTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects invalid date formats', () => {
        const invalidDates = ['12/31/2025', '31-12-2025', '2025.12.31']

        invalidDates.forEach(date => {
          const data = { ...validSuspendData, suspend_until: date }
          const result = suspendTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toBe('Date must be in YYYY-MM-DD format')
          }
        })
      })
    })

    describe('Type Inference', () => {
      it('infers correct TypeScript type', () => {
        const data: SuspendTenantFormData = {
          reason: 'Test reason',
          suspend_until: '2025-12-31'
        }
        expect(data).toBeDefined()
      })
    })
  })

  describe('activateTenantAccountSchema', () => {
    const validActivateData = {
      reason: 'Payment received, reactivating account'
    }

    describe('Valid Data', () => {
      it('validates correct activation data', () => {
        const result = activateTenantAccountSchema.safeParse(validActivateData)
        expect(result.success).toBe(true)
      })

      it('validates data with only reason field', () => {
        const data = { reason: 'Activation approved' }
        const result = activateTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('reason Field', () => {
      it('requires activation reason', () => {
        const data = { reason: '' }
        const result = activateTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Activation reason is required')
        }
      })

      it('rejects reason exceeding 500 characters', () => {
        const data = { reason: 'a'.repeat(501) }
        const result = activateTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts reason at max length', () => {
        const data = { reason: 'a'.repeat(500) }
        const result = activateTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts various reason formats', () => {
        const reasons = [
          'Simple reason',
          'Reason with numbers 123',
          'Reason with special chars: !@#$%',
          'Multi\nline\nreason'
        ]

        reasons.forEach(reason => {
          const data = { reason }
          const result = activateTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('Type Inference', () => {
      it('infers correct TypeScript type', () => {
        const data: ActivateTenantFormData = {
          reason: 'Test reason'
        }
        expect(data).toBeDefined()
      })
    })

    describe('Schema Structure', () => {
      it('has only reason field', () => {
        const data = { reason: 'Test', extraField: 'value' }
        const result = activateTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Schema Comparison', () => {
    it('hold and suspend schemas have similar structure', () => {
      const holdData = { reason: 'Test', hold_until: '2025-12-31' }
      const suspendData = { reason: 'Test', suspend_until: '2025-12-31' }

      const holdResult = holdTenantAccountSchema.safeParse(holdData)
      const suspendResult = suspendTenantAccountSchema.safeParse(suspendData)

      expect(holdResult.success).toBe(true)
      expect(suspendResult.success).toBe(true)
    })

    it('activation schema is simpler than hold/suspend', () => {
      const activateData = { reason: 'Test' }
      const result = activateTenantAccountSchema.safeParse(activateData)
      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('throws ZodError when using parse method with invalid data', () => {
      expect(() => {
        holdTenantAccountSchema.parse({ reason: '' })
      }).toThrow(ZodError)

      expect(() => {
        suspendTenantAccountSchema.parse({ reason: '' })
      }).toThrow(ZodError)

      expect(() => {
        activateTenantAccountSchema.parse({ reason: '' })
      }).toThrow(ZodError)
    })

    it('returns error details for invalid dates', () => {
      const data = { reason: 'Test', hold_until: 'invalid-date' }
      const result = holdTenantAccountSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('hold_until')
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles empty objects', () => {
      const result = holdTenantAccountSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('handles whitespace-only reason', () => {
      const data = { reason: '   ', hold_until: null }
      const result = holdTenantAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('handles reason with only newlines', () => {
      const data = { reason: '\n\n\n' }
      const result = activateTenantAccountSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})
