/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod/v4'

/* Shared module imports */
import { PhoneNumberSchema } from '@shared/schema'

describe('PhoneNumberSchema', () => {
  const validPhoneData: [string, string] = ['+1', '1234567890']

  describe('Schema Definition', () => {
    it('should be defined', () => {
      expect(PhoneNumberSchema).toBeDefined()
    })

    it('should be a Zod schema with parse method', () => {
      expect(PhoneNumberSchema.parse).toBeDefined()
      expect(PhoneNumberSchema.safeParse).toBeDefined()
      expect(typeof PhoneNumberSchema.parse).toBe('function')
      expect(typeof PhoneNumberSchema.safeParse).toBe('function')
    })

    it('should be a tuple schema', () => {
      const result = PhoneNumberSchema.safeParse(validPhoneData)
      expect(result.success).toBe(true)
    })

    it('should validate tuple with exactly 2 elements', () => {
      const result = PhoneNumberSchema.safeParse(validPhoneData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })
  })

  describe('Dial Code Validation (First Element)', () => {
    it('should accept valid dial code with plus prefix', () => {
      const data: [string, string] = ['+1', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept dial codes with 1 digit', () => {
      const data: [string, string] = ['+1', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept dial codes with 2 digits', () => {
      const data: [string, string] = ['+91', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept dial codes with 3 digits', () => {
      const data: [string, string] = ['+123', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept dial codes with 4 digits', () => {
      const data: [string, string] = ['+1234', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject dial code without plus prefix', () => {
      const data: [string, string] = ['91', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid dial code')
      }
    })

    it('should reject dial code with more than 4 digits', () => {
      const data: [string, string] = ['+12345', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid dial code')
      }
    })

    it('should reject dial code with letters', () => {
      const data: [string, string] = ['+1a', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid dial code')
      }
    })

    it('should reject empty dial code', () => {
      const data: [string, string] = ['', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid dial code')
      }
    })

    it('should reject dial code with only plus sign', () => {
      const data: [string, string] = ['+', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject dial code with spaces', () => {
      const data: [string, string] = ['+1 ', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject dial code with special characters', () => {
      const data: [string, string] = ['+1-2', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })
  })

  describe('Phone Number Validation (Second Element)', () => {
    it('should accept valid phone number with 10 digits', () => {
      const data: [string, string] = ['+1', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept phone number with minimum 4 digits', () => {
      const data: [string, string] = ['+1', '1234']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept phone number with maximum 15 digits', () => {
      const data: [string, string] = ['+1', '123456789012345']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept phone number with 7 digits', () => {
      const data: [string, string] = ['+1', '1234567']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept phone number with 12 digits', () => {
      const data: [string, string] = ['+1', '123456789012']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject phone number with less than 4 digits', () => {
      const data: [string, string] = ['+1', '123']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid phone number')
      }
    })

    it('should reject phone number with more than 15 digits', () => {
      const data: [string, string] = ['+1', '1234567890123456']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid phone number')
      }
    })

    it('should reject phone number with letters', () => {
      const data: [string, string] = ['+1', '12345a7890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid phone number')
      }
    })

    it('should reject empty phone number', () => {
      const data: [string, string] = ['+1', '']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid phone number')
      }
    })

    it('should reject phone number with special characters', () => {
      const data: [string, string] = ['+1', '1234-567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject phone number with spaces', () => {
      const data: [string, string] = ['+1', '1234 567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject phone number with plus sign', () => {
      const data: [string, string] = ['+1', '+1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject phone number with parentheses', () => {
      const data: [string, string] = ['+1', '(123)4567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject phone number with dots', () => {
      const data: [string, string] = ['+1', '123.456.7890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })
  })

  describe('Common Country Dial Codes', () => {
    it('should accept US dial code (+1)', () => {
      const data: [string, string] = ['+1', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept UK dial code (+44)', () => {
      const data: [string, string] = ['+44', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept India dial code (+91)', () => {
      const data: [string, string] = ['+91', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept China dial code (+86)', () => {
      const data: [string, string] = ['+86', '12345678901']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept Germany dial code (+49)', () => {
      const data: [string, string] = ['+49', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept Japan dial code (+81)', () => {
      const data: [string, string] = ['+81', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept Australia dial code (+61)', () => {
      const data: [string, string] = ['+61', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept France dial code (+33)', () => {
      const data: [string, string] = ['+33', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Tuple Structure Validation', () => {
    it('should reject tuple with only one element', () => {
      const data = ['+1'] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject tuple with more than two elements', () => {
      const data = ['+1', '1234567890', 'extra'] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject non-tuple data (object)', () => {
      const data = { dialCode: '+1', phoneNumber: '1234567890' } as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject non-tuple data (string)', () => {
      const data = '+11234567890' as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject null', () => {
      const data = null as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject undefined', () => {
      const data = undefined as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject empty array', () => {
      const data = [] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })
  })

  describe('Type Validation', () => {
    it('should reject number as dial code', () => {
      const data = [1, '1234567890'] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject number as phone number', () => {
      const data = ['+1', 1234567890] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject boolean as dial code', () => {
      const data = [true, '1234567890'] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject boolean as phone number', () => {
      const data = ['+1', false] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject null values in tuple', () => {
      const data = [null, null] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should reject undefined values in tuple', () => {
      const data = [undefined, undefined] as unknown as [string, string]
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })
  })

  describe('Parse Method', () => {
    it('should parse valid data without errors', () => {
      const data: [string, string] = ['+1', '1234567890']
      expect(() => PhoneNumberSchema.parse(data)).not.toThrow()
    })

    it('should throw ZodError for invalid dial code', () => {
      const data: [string, string] = ['91', '1234567890']
      expect(() => PhoneNumberSchema.parse(data)).toThrow(ZodError)
    })

    it('should throw ZodError for invalid phone number', () => {
      const data: [string, string] = ['+1', '123']
      expect(() => PhoneNumberSchema.parse(data)).toThrow(ZodError)
    })

    it('should return parsed data for valid input', () => {
      const data: [string, string] = ['+1', '1234567890']
      const parsed = PhoneNumberSchema.parse(data)
      expect(parsed).toEqual(data)
    })
  })

  describe('SafeParse Method', () => {
    it('should return success true for valid data', () => {
      const data: [string, string] = ['+1', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it('should return success false for invalid dial code', () => {
      const data: [string, string] = ['91', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should return success false for invalid phone number', () => {
      const data: [string, string] = ['+1', '123']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should include error details when validation fails', () => {
      const data: [string, string] = ['invalid', '123']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError)
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('should return data when validation succeeds', () => {
      const data: [string, string] = ['+1', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(data)
      }
    })
  })

  describe('Multiple Validation Errors', () => {
    it('should report both dial code and phone number errors', () => {
      const data: [string, string] = ['invalid', '12']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBe(2)
      }
    })

    it('should report error for first element when invalid', () => {
      const data: [string, string] = ['invalid', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain(0)
        expect(result.error.issues[0].message).toBe('Invalid dial code')
      }
    })

    it('should report error for second element when invalid', () => {
      const data: [string, string] = ['+1', 'invalid']
      const result = PhoneNumberSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain(1)
        expect(result.error.issues[0].message).toBe('Invalid phone number')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle dial code with leading zeros after plus', () => {
      const data: [string, string] = ['+001', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle phone number with all zeros', () => {
      const data: [string, string] = ['+1', '0000000000']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle phone number with all nines', () => {
      const data: [string, string] = ['+1', '9999999999']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject phone number with leading spaces', () => {
      const data: [string, string] = ['+1', ' 1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject phone number with trailing spaces', () => {
      const data: [string, string] = ['+1', '1234567890 ']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject dial code with spaces in middle', () => {
      const data: [string, string] = ['+1 2', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should handle maximum length phone number', () => {
      const data: [string, string] = ['+1', '123456789012345']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle minimum length phone number', () => {
      const data: [string, string] = ['+1', '1234']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Real-world Phone Numbers', () => {
    it('should accept US phone number', () => {
      const data: [string, string] = ['+1', '2025551234']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept UK phone number', () => {
      const data: [string, string] = ['+44', '2071234567']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept Indian mobile number', () => {
      const data: [string, string] = ['+91', '9876543210']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept short phone number', () => {
      const data: [string, string] = ['+1', '5551234']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept long international number', () => {
      const data: [string, string] = ['+123', '456789012345']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Schema Composition', () => {
    it('should allow reuse in other schemas', () => {
      expect(PhoneNumberSchema).toBeDefined()
      expect(typeof PhoneNumberSchema.parse).toBe('function')
    })

    it('should maintain validation rules when composed', () => {
      const data: [string, string] = ['+1', '1234567890']
      const result = PhoneNumberSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should validate quickly for valid data', () => {
      const data: [string, string] = ['+1', '1234567890']
      const startTime = Date.now()

      for (let i = 0; i < 1000; i++) {
        PhoneNumberSchema.safeParse(data)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should handle validation errors efficiently', () => {
      const data: [string, string] = ['invalid', 'invalid']
      const startTime = Date.now()

      for (let i = 0; i < 1000; i++) {
        PhoneNumberSchema.safeParse(data)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })
})
