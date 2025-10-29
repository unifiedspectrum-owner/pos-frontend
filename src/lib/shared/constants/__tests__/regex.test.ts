/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Shared module imports */
import { DIAL_CODE_REGEX, PHONE_NUMBER_REGEX, DEFAULT_DIAL_CODE, DATE_FORMAT_REGEX, OTP_REGEX, NAME_REGEX } from '@shared/constants/regex'

describe('regex', () => {
  describe('DIAL_CODE_REGEX', () => {
    it('should export DIAL_CODE_REGEX constant', () => {
      expect(DIAL_CODE_REGEX).toBeDefined()
      expect(DIAL_CODE_REGEX).toBeInstanceOf(RegExp)
    })

    it('should match valid dial codes with + prefix', () => {
      const validDialCodes = ['+1', '+44', '+91', '+86', '+33', '+81', '+82']

      validDialCodes.forEach(code => {
        expect(DIAL_CODE_REGEX.test(code)).toBe(true)
      })
    })

    it('should match dial codes with 1-4 digits', () => {
      expect(DIAL_CODE_REGEX.test('+1')).toBe(true)
      expect(DIAL_CODE_REGEX.test('+12')).toBe(true)
      expect(DIAL_CODE_REGEX.test('+123')).toBe(true)
      expect(DIAL_CODE_REGEX.test('+1234')).toBe(true)
    })

    it('should not match dial codes without + prefix', () => {
      expect(DIAL_CODE_REGEX.test('91')).toBe(false)
      expect(DIAL_CODE_REGEX.test('1')).toBe(false)
    })

    it('should not match dial codes with more than 4 digits', () => {
      expect(DIAL_CODE_REGEX.test('+12345')).toBe(false)
    })

    it('should not match dial codes with letters', () => {
      expect(DIAL_CODE_REGEX.test('+1a')).toBe(false)
      expect(DIAL_CODE_REGEX.test('+abc')).toBe(false)
    })

    it('should not match empty strings', () => {
      expect(DIAL_CODE_REGEX.test('')).toBe(false)
    })
  })

  describe('PHONE_NUMBER_REGEX', () => {
    it('should export PHONE_NUMBER_REGEX constant', () => {
      expect(PHONE_NUMBER_REGEX).toBeDefined()
      expect(PHONE_NUMBER_REGEX).toBeInstanceOf(RegExp)
    })

    it('should match valid phone numbers with 4-15 digits', () => {
      const validNumbers = ['1234', '12345', '123456789', '1234567890', '123456789012345']

      validNumbers.forEach(number => {
        expect(PHONE_NUMBER_REGEX.test(number)).toBe(true)
      })
    })

    it('should not match phone numbers with less than 4 digits', () => {
      expect(PHONE_NUMBER_REGEX.test('123')).toBe(false)
      expect(PHONE_NUMBER_REGEX.test('12')).toBe(false)
      expect(PHONE_NUMBER_REGEX.test('1')).toBe(false)
    })

    it('should not match phone numbers with more than 15 digits', () => {
      expect(PHONE_NUMBER_REGEX.test('1234567890123456')).toBe(false)
    })

    it('should not match phone numbers with letters', () => {
      expect(PHONE_NUMBER_REGEX.test('12345a')).toBe(false)
      expect(PHONE_NUMBER_REGEX.test('abcd1234')).toBe(false)
    })

    it('should not match phone numbers with special characters', () => {
      expect(PHONE_NUMBER_REGEX.test('1234-5678')).toBe(false)
      expect(PHONE_NUMBER_REGEX.test('1234 5678')).toBe(false)
      expect(PHONE_NUMBER_REGEX.test('+1234567890')).toBe(false)
    })

    it('should not match empty strings', () => {
      expect(PHONE_NUMBER_REGEX.test('')).toBe(false)
    })
  })

  describe('DEFAULT_DIAL_CODE', () => {
    it('should export DEFAULT_DIAL_CODE constant', () => {
      expect(DEFAULT_DIAL_CODE).toBeDefined()
      expect(typeof DEFAULT_DIAL_CODE).toBe('string')
    })

    it('should have +91 as default dial code', () => {
      expect(DEFAULT_DIAL_CODE).toBe('+91')
    })

    it('should be a valid dial code format', () => {
      expect(DIAL_CODE_REGEX.test(DEFAULT_DIAL_CODE)).toBe(true)
    })

    it('should start with + symbol', () => {
      expect(DEFAULT_DIAL_CODE).toMatch(/^\+/)
    })

    it('should not be empty', () => {
      expect(DEFAULT_DIAL_CODE.length).toBeGreaterThan(0)
    })
  })

  describe('DATE_FORMAT_REGEX', () => {
    it('should export DATE_FORMAT_REGEX constant', () => {
      expect(DATE_FORMAT_REGEX).toBeDefined()
      expect(DATE_FORMAT_REGEX).toBeInstanceOf(RegExp)
    })

    it('should match valid YYYY-MM-DD format dates', () => {
      const validDates = ['2024-01-01', '2024-12-31', '2023-06-15', '2025-03-20']

      validDates.forEach(date => {
        expect(DATE_FORMAT_REGEX.test(date)).toBe(true)
      })
    })

    it('should not match dates in other formats', () => {
      expect(DATE_FORMAT_REGEX.test('01-01-2024')).toBe(false)
      expect(DATE_FORMAT_REGEX.test('2024/01/01')).toBe(false)
      expect(DATE_FORMAT_REGEX.test('01/01/2024')).toBe(false)
    })

    it('should not match dates without leading zeros', () => {
      expect(DATE_FORMAT_REGEX.test('2024-1-1')).toBe(false)
      expect(DATE_FORMAT_REGEX.test('2024-01-1')).toBe(false)
      expect(DATE_FORMAT_REGEX.test('2024-1-01')).toBe(false)
    })

    it('should not match dates with invalid separators', () => {
      expect(DATE_FORMAT_REGEX.test('2024.01.01')).toBe(false)
      expect(DATE_FORMAT_REGEX.test('2024 01 01')).toBe(false)
    })

    it('should not match invalid date formats', () => {
      expect(DATE_FORMAT_REGEX.test('24-01-01')).toBe(false)
      expect(DATE_FORMAT_REGEX.test('2024-1-01')).toBe(false)
    })

    it('should not match empty strings', () => {
      expect(DATE_FORMAT_REGEX.test('')).toBe(false)
    })
  })

  describe('OTP_REGEX', () => {
    it('should export OTP_REGEX constant', () => {
      expect(OTP_REGEX).toBeDefined()
      expect(OTP_REGEX).toBeInstanceOf(RegExp)
    })

    it('should match valid 6-digit OTP', () => {
      const validOTPs = ['123456', '000000', '999999', '654321']

      validOTPs.forEach(otp => {
        expect(OTP_REGEX.test(otp)).toBe(true)
      })
    })

    it('should not match OTP with less than 6 digits', () => {
      expect(OTP_REGEX.test('12345')).toBe(false)
      expect(OTP_REGEX.test('1234')).toBe(false)
    })

    it('should not match OTP with more than 6 digits', () => {
      expect(OTP_REGEX.test('1234567')).toBe(false)
    })

    it('should not match OTP with letters', () => {
      expect(OTP_REGEX.test('12345a')).toBe(false)
      expect(OTP_REGEX.test('abc123')).toBe(false)
    })

    it('should not match OTP with special characters', () => {
      expect(OTP_REGEX.test('123-456')).toBe(false)
      expect(OTP_REGEX.test('123 456')).toBe(false)
    })

    it('should not match empty strings', () => {
      expect(OTP_REGEX.test('')).toBe(false)
    })
  })

  describe('NAME_REGEX', () => {
    it('should export NAME_REGEX constant', () => {
      expect(NAME_REGEX).toBeDefined()
      expect(NAME_REGEX).toBeInstanceOf(RegExp)
    })

    it('should match valid names with letters', () => {
      const validNames = ['John', 'Mary', 'Alice', 'Bob']

      validNames.forEach(name => {
        expect(NAME_REGEX.test(name)).toBe(true)
      })
    })

    it('should match names with spaces', () => {
      const validNames = ['John Doe', 'Mary Jane', 'Alice In Wonderland']

      validNames.forEach(name => {
        expect(NAME_REGEX.test(name)).toBe(true)
      })
    })

    it('should match names with apostrophes', () => {
      const validNames = ["O'Brien", "D'Angelo", "O'Neill"]

      validNames.forEach(name => {
        expect(NAME_REGEX.test(name)).toBe(true)
      })
    })

    it('should match names with hyphens', () => {
      const validNames = ['Mary-Jane', 'Anne-Marie', 'Jean-Paul']

      validNames.forEach(name => {
        expect(NAME_REGEX.test(name)).toBe(true)
      })
    })

    it('should match names with mixed special characters', () => {
      expect(NAME_REGEX.test("Mary-Jane O'Brien")).toBe(true)
      expect(NAME_REGEX.test("Jean-Paul D'Angelo")).toBe(true)
    })

    it('should not match names with numbers', () => {
      expect(NAME_REGEX.test('John123')).toBe(false)
      expect(NAME_REGEX.test('Mary1')).toBe(false)
    })

    it('should not match names with special characters other than apostrophe and hyphen', () => {
      expect(NAME_REGEX.test('John@Doe')).toBe(false)
      expect(NAME_REGEX.test('Mary#Jane')).toBe(false)
      expect(NAME_REGEX.test('Alice$Bob')).toBe(false)
    })

    it('should not match empty strings', () => {
      expect(NAME_REGEX.test('')).toBe(false)
    })
  })

  describe('Regex Consistency', () => {
    it('should have all regex patterns as RegExp instances', () => {
      const regexPatterns = [
        DIAL_CODE_REGEX,
        PHONE_NUMBER_REGEX,
        DATE_FORMAT_REGEX,
        OTP_REGEX,
        NAME_REGEX
      ]

      regexPatterns.forEach(regex => {
        expect(regex).toBeInstanceOf(RegExp)
      })
    })

    it('should not have null or undefined regex patterns', () => {
      expect(DIAL_CODE_REGEX).not.toBeNull()
      expect(PHONE_NUMBER_REGEX).not.toBeNull()
      expect(DATE_FORMAT_REGEX).not.toBeNull()
      expect(OTP_REGEX).not.toBeNull()
      expect(NAME_REGEX).not.toBeNull()
    })

    it('should have functional test methods', () => {
      const regexPatterns = [
        DIAL_CODE_REGEX,
        PHONE_NUMBER_REGEX,
        DATE_FORMAT_REGEX,
        OTP_REGEX,
        NAME_REGEX
      ]

      regexPatterns.forEach(regex => {
        expect(typeof regex.test).toBe('function')
      })
    })
  })

  describe('Integration Tests', () => {
    it('should validate complete phone number with dial code', () => {
      const dialCode = '+91'
      const phoneNumber = '9876543210'

      expect(DIAL_CODE_REGEX.test(dialCode)).toBe(true)
      expect(PHONE_NUMBER_REGEX.test(phoneNumber)).toBe(true)
    })

    it('should work with default dial code', () => {
      expect(DIAL_CODE_REGEX.test(DEFAULT_DIAL_CODE)).toBe(true)
    })

    it('should validate various input combinations', () => {
      const testCases = [
        { regex: DIAL_CODE_REGEX, valid: ['+1', '+44', '+91'], invalid: ['1', '91', '+12345'] },
        { regex: PHONE_NUMBER_REGEX, valid: ['1234567890', '9876543210'], invalid: ['123', '12345678901234567'] },
        { regex: DATE_FORMAT_REGEX, valid: ['2024-01-01', '2025-12-31'], invalid: ['2024/01/01', '01-01-2024'] },
        { regex: OTP_REGEX, valid: ['123456', '654321'], invalid: ['12345', '1234567', '12a456'] },
        { regex: NAME_REGEX, valid: ['John Doe', "O'Brien"], invalid: ['John123', 'Mary@Jane'] }
      ]

      testCases.forEach(({ regex, valid, invalid }) => {
        valid.forEach(value => {
          expect(regex.test(value)).toBe(true)
        })
        invalid.forEach(value => {
          expect(regex.test(value)).toBe(false)
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle boundary values for phone numbers', () => {
      expect(PHONE_NUMBER_REGEX.test('1234')).toBe(true)
      expect(PHONE_NUMBER_REGEX.test('123456789012345')).toBe(true)
      expect(PHONE_NUMBER_REGEX.test('123')).toBe(false)
      expect(PHONE_NUMBER_REGEX.test('1234567890123456')).toBe(false)
    })

    it('should handle boundary values for dial codes', () => {
      expect(DIAL_CODE_REGEX.test('+1')).toBe(true)
      expect(DIAL_CODE_REGEX.test('+1234')).toBe(true)
      expect(DIAL_CODE_REGEX.test('+12345')).toBe(false)
    })

    it('should handle whitespace correctly', () => {
      expect(PHONE_NUMBER_REGEX.test(' 1234567890')).toBe(false)
      expect(PHONE_NUMBER_REGEX.test('1234567890 ')).toBe(false)
      expect(DATE_FORMAT_REGEX.test(' 2024-01-01')).toBe(false)
      expect(OTP_REGEX.test('123 456')).toBe(false)
    })

    it('should handle case sensitivity for names', () => {
      expect(NAME_REGEX.test('john')).toBe(true)
      expect(NAME_REGEX.test('JOHN')).toBe(true)
      expect(NAME_REGEX.test('JoHn')).toBe(true)
    })
  })

  describe('Security and Validation', () => {
    it('should prevent SQL injection patterns in names', () => {
      expect(NAME_REGEX.test("'; DROP TABLE users--")).toBe(false)
      expect(NAME_REGEX.test('1=1')).toBe(false)
    })

    it('should prevent XSS patterns in names', () => {
      expect(NAME_REGEX.test('<script>alert(1)</script>')).toBe(false)
      expect(NAME_REGEX.test('javascript:alert(1)')).toBe(false)
    })

    it('should validate only numeric OTP', () => {
      expect(OTP_REGEX.test('abcdef')).toBe(false)
      expect(OTP_REGEX.test('123abc')).toBe(false)
    })

    it('should validate proper date format to prevent invalid dates', () => {
      /* These pass regex but would need additional validation for actual date validity */
      expect(DATE_FORMAT_REGEX.test('2024-13-01')).toBe(true)
      expect(DATE_FORMAT_REGEX.test('2024-01-32')).toBe(true)
    })
  })
})
