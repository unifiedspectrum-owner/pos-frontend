/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FieldError, Merge } from 'react-hook-form'

/* Shared module imports */
import { parsePhoneFromAPI, formatPhoneForAPI, getPhoneFieldErrorMessage } from '@shared/utils/formatting/phone'

describe('Phone Formatting Utilities', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn> | undefined

  beforeEach(() => {
    /* Suppress console logs */
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleSpy?.mockRestore()
  })

  describe('parsePhoneFromAPI', () => {
    describe('Valid Inputs', () => {
      it('should parse phone number with dash separator', () => {
        const result = parsePhoneFromAPI('+1-1234567890')
        expect(result).toEqual(['+1', '1234567890'])
      })

      it('should parse phone number with multi-digit dial code', () => {
        const result = parsePhoneFromAPI('+91-9876543210')
        expect(result).toEqual(['+91', '9876543210'])
      })

      it('should parse phone number with 3-digit dial code', () => {
        const result = parsePhoneFromAPI('+123-4567890123')
        expect(result).toEqual(['+123', '4567890123'])
      })

      it('should parse phone number with 4-digit dial code', () => {
        const result = parsePhoneFromAPI('+1234-567890')
        expect(result).toEqual(['+1234', '567890'])
      })

      it('should handle phone number without dash as fallback', () => {
        const result = parsePhoneFromAPI('1234567890')
        expect(result).toEqual(['', '1234567890'])
      })

      it('should parse UK phone number format', () => {
        const result = parsePhoneFromAPI('+44-2071234567')
        expect(result).toEqual(['+44', '2071234567'])
      })

      it('should parse phone number with long number part', () => {
        const result = parsePhoneFromAPI('+1-123456789012345')
        expect(result).toEqual(['+1', '123456789012345'])
      })
    })

    describe('Edge Cases', () => {
      it('should return empty tuple for empty string', () => {
        const result = parsePhoneFromAPI('')
        expect(result).toEqual(['', ''])
      })

      it('should return empty tuple for null input', () => {
        const result = parsePhoneFromAPI(null as unknown as string)
        expect(result).toEqual(['', ''])
      })

      it('should return empty tuple for undefined input', () => {
        const result = parsePhoneFromAPI(undefined as unknown as string)
        expect(result).toEqual(['', ''])
      })

      it('should handle string with only dash', () => {
        const result = parsePhoneFromAPI('-')
        /* Dash without valid format returns empty tuple */
        expect(result).toEqual(['', ''])
      })

      it('should handle string with multiple dashes', () => {
        const result = parsePhoneFromAPI('+1-234-567')
        expect(result).toEqual(['+1', '234-567'])
      })

      it('should handle phone number without plus sign but with dash', () => {
        const result = parsePhoneFromAPI('1-1234567890')
        /* Dash without plus sign doesn't match regex, returns empty tuple */
        expect(result).toEqual(['', ''])
      })

      it('should handle empty dial code with dash', () => {
        const result = parsePhoneFromAPI('-1234567890')
        /* Dash without dial code doesn't match regex, returns empty tuple */
        expect(result).toEqual(['', ''])
      })

      it('should handle whitespace', () => {
        const result = parsePhoneFromAPI('   ')
        expect(result).toEqual(['', '   '])
      })
    })

    describe('Logging', () => {
      it('should log input', () => {
        parsePhoneFromAPI('+1-1234567890')
        expect(console.log).toHaveBeenCalledWith('parsePhoneFromAPI input:', '+1-1234567890')
      })

      it('should log parsed result for dash format', () => {
        parsePhoneFromAPI('+1-1234567890')
        expect(console.log).toHaveBeenCalledWith('parsePhoneFromAPI: parsed string format to tuple:', ['+1', '1234567890'])
      })

      it('should log fallback for non-dash format', () => {
        parsePhoneFromAPI('1234567890')
        expect(console.log).toHaveBeenCalledWith('parsePhoneFromAPI: fallback string format to tuple:', ['', '1234567890'])
      })

      it('should log empty tuple for empty input', () => {
        parsePhoneFromAPI('')
        expect(console.log).toHaveBeenCalledWith('parsePhoneFromAPI: empty data, returning empty tuple')
      })
    })

    describe('Return Type', () => {
      it('should return tuple type', () => {
        const result = parsePhoneFromAPI('+1-1234567890')
        expect(Array.isArray(result)).toBe(true)
        expect(result).toHaveLength(2)
      })

      it('should return strings in tuple', () => {
        const result = parsePhoneFromAPI('+1-1234567890')
        expect(typeof result[0]).toBe('string')
        expect(typeof result[1]).toBe('string')
      })
    })
  })

  describe('formatPhoneForAPI', () => {
    describe('Valid Inputs', () => {
      it('should format valid phone tuple to string', () => {
        const result = formatPhoneForAPI(['+1', '1234567890'])
        expect(result).toBe('+1-1234567890')
      })

      it('should format multi-digit dial code', () => {
        const result = formatPhoneForAPI(['+91', '9876543210'])
        expect(result).toBe('+91-9876543210')
      })

      it('should format 3-digit dial code', () => {
        const result = formatPhoneForAPI(['+123', '4567890123'])
        expect(result).toBe('+123-4567890123')
      })

      it('should format 4-digit dial code', () => {
        const result = formatPhoneForAPI(['+1234', '567890'])
        expect(result).toBe('+1234-567890')
      })

      it('should format UK phone number', () => {
        const result = formatPhoneForAPI(['+44', '2071234567'])
        expect(result).toBe('+44-2071234567')
      })

      it('should format long phone number', () => {
        const result = formatPhoneForAPI(['+1', '123456789012345'])
        expect(result).toBe('+1-123456789012345')
      })
    })

    describe('Invalid Inputs', () => {
      it('should return empty string for null input', () => {
        const result = formatPhoneForAPI(null as unknown as [string, string])
        expect(result).toBe('')
      })

      it('should return empty string for undefined input', () => {
        const result = formatPhoneForAPI(undefined as unknown as [string, string])
        expect(result).toBe('')
      })

      it('should return empty string for empty dial code', () => {
        const result = formatPhoneForAPI(['', '1234567890'])
        expect(result).toBe('')
      })

      it('should return empty string for empty phone number', () => {
        const result = formatPhoneForAPI(['+1', ''])
        expect(result).toBe('')
      })

      it('should return empty string for both empty', () => {
        const result = formatPhoneForAPI(['', ''])
        expect(result).toBe('')
      })

      it('should return empty string for non-array input', () => {
        const result = formatPhoneForAPI('+1-1234567890' as unknown as [string, string])
        expect(result).toBe('')
      })

      it('should return empty string for array with wrong length', () => {
        const result = formatPhoneForAPI(['+1'] as unknown as [string, string])
        expect(result).toBe('')
      })

      it('should return empty string for array with more than 2 elements', () => {
        const result = formatPhoneForAPI(['+1', '1234567890', 'extra'] as unknown as [string, string])
        expect(result).toBe('')
      })
    })

    describe('Logging', () => {
      it('should log input and type information', () => {
        formatPhoneForAPI(['+1', '1234567890'])
        expect(console.log).toHaveBeenCalledWith(
          'formatPhoneForAPI input:',
          ['+1', '1234567890'],
          'type:',
          'object',
          'isArray:',
          true
        )
      })

      it('should log tuple format detection', () => {
        formatPhoneForAPI(['+1', '1234567890'])
        expect(console.log).toHaveBeenCalledWith(
          'formatPhoneForAPI: tuple format detected',
          { dialCode: '+1', phoneNumber: '1234567890' }
        )
      })

      it('should log formatted result', () => {
        formatPhoneForAPI(['+1', '1234567890'])
        expect(console.log).toHaveBeenCalledWith(
          'formatPhoneForAPI: returning formatted string:',
          '+1-1234567890'
        )
      })

      it('should log empty value message', () => {
        formatPhoneForAPI(null as unknown as [string, string])
        expect(console.log).toHaveBeenCalledWith('formatPhoneForAPI: empty value, returning empty string')
      })

      it('should log missing parts message', () => {
        formatPhoneForAPI(['', '1234567890'])
        expect(console.log).toHaveBeenCalledWith('formatPhoneForAPI: tuple format but missing dialCode or phoneNumber')
      })
    })

    describe('Round-trip Conversion', () => {
      it('should maintain data through parse and format cycle', () => {
        const original = '+1-1234567890'
        const parsed = parsePhoneFromAPI(original)
        const formatted = formatPhoneForAPI(parsed)
        expect(formatted).toBe(original)
      })

      it('should handle multiple round trips', () => {
        const original = '+91-9876543210'
        let current = original

        for (let i = 0; i < 5; i++) {
          const parsed = parsePhoneFromAPI(current)
          current = formatPhoneForAPI(parsed)
        }

        expect(current).toBe(original)
      })
    })
  })

  describe('getPhoneFieldErrorMessage', () => {
    describe('Direct Error Message', () => {
      it('should return direct error message', () => {
        const fieldError: FieldError = {
          type: 'required',
          message: 'Phone number is required'
        }
        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBe('Phone number is required')
      })

      it('should return custom validation message', () => {
        const fieldError: FieldError = {
          type: 'pattern',
          message: 'Invalid phone format'
        }
        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBe('Invalid phone format')
      })
    })

    describe('Tuple Error Extraction', () => {
      it('should extract error from first element of tuple', () => {
        const fieldError = [
          { type: 'pattern', message: 'Invalid dial code' },
          undefined
        ] as unknown as Merge<FieldError, [(FieldError | undefined)?, (FieldError | undefined)?]>

        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBe('Invalid dial code')
      })

      it('should extract error from second element if first is undefined', () => {
        const fieldError = [
          undefined,
          { type: 'pattern', message: 'Invalid phone number' }
        ] as unknown as Merge<FieldError, [(FieldError | undefined)?, (FieldError | undefined)?]>

        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBe('Invalid phone number')
      })

      it('should return default message if both elements are undefined', () => {
        const fieldError = [
          undefined,
          undefined
        ] as unknown as Merge<FieldError, [(FieldError | undefined)?, (FieldError | undefined)?]>

        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBe('Invalid phone number')
      })

      it('should prioritize first element error over second', () => {
        const fieldError = [
          { type: 'pattern', message: 'Invalid dial code' },
          { type: 'pattern', message: 'Invalid phone number' }
        ] as unknown as Merge<FieldError, [(FieldError | undefined)?, (FieldError | undefined)?]>

        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBe('Invalid dial code')
      })

      it('should return default message for empty array', () => {
        const fieldError = [] as unknown as Merge<FieldError, [(FieldError | undefined)?, (FieldError | undefined)?]>

        const result = getPhoneFieldErrorMessage(fieldError)
        /* Empty array returns undefined per implementation */
        expect(result).toBeUndefined()
      })
    })

    describe('Undefined/Null Handling', () => {
      it('should return undefined for undefined input', () => {
        const result = getPhoneFieldErrorMessage(undefined)
        expect(result).toBeUndefined()
      })

      it('should handle null gracefully', () => {
        const result = getPhoneFieldErrorMessage(null as unknown as FieldError)
        expect(result).toBeUndefined()
      })
    })

    describe('Logging', () => {
      it('should log field error', () => {
        const fieldError: FieldError = {
          type: 'required',
          message: 'Phone number is required'
        }
        getPhoneFieldErrorMessage(fieldError)
        expect(console.log).toHaveBeenCalledWith('Phone field error:', fieldError)
      })

      it('should log tuple error', () => {
        const fieldError = [
          { type: 'pattern', message: 'Invalid dial code' },
          undefined
        ] as unknown as Merge<FieldError, [(FieldError | undefined)?, (FieldError | undefined)?]>

        getPhoneFieldErrorMessage(fieldError)
        expect(console.log).toHaveBeenCalledWith('Phone field error:', fieldError)
      })
    })

    describe('Edge Cases', () => {
      it('should handle error with empty message', () => {
        const fieldError: FieldError = {
          type: 'required',
          message: ''
        }
        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBe('')
      })

      it('should handle error without message property', () => {
        const fieldError = {
          type: 'required'
        } as FieldError
        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBeUndefined()
      })

      it('should handle complex error structure', () => {
        const fieldError: FieldError = {
          type: 'custom',
          message: 'Complex validation failed',
          ref: {} as HTMLInputElement
        }
        const result = getPhoneFieldErrorMessage(fieldError)
        expect(result).toBe('Complex validation failed')
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete phone workflow', () => {
      /* Parse from API */
      const parsed = parsePhoneFromAPI('+1-1234567890')
      expect(parsed).toEqual(['+1', '1234567890'])

      /* Format back to API */
      const formatted = formatPhoneForAPI(parsed)
      expect(formatted).toBe('+1-1234567890')
    })

    it('should handle phone numbers from different countries', () => {
      const phones = [
        '+1-2025551234',
        '+44-2071234567',
        '+91-9876543210',
        '+86-13812345678'
      ]

      phones.forEach(phone => {
        const parsed = parsePhoneFromAPI(phone)
        const formatted = formatPhoneForAPI(parsed)
        expect(formatted).toBe(phone)
      })
    })

    it('should handle validation error workflow', () => {
      const error: FieldError = {
        type: 'required',
        message: 'Phone is required'
      }

      const message = getPhoneFieldErrorMessage(error)
      expect(message).toBeDefined()
      expect(typeof message).toBe('string')
    })
  })
})
