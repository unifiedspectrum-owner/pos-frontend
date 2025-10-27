/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Auth management module imports */
import { PASSWORD_REGEX, BACKUP_CODE_REGEX, TOTP_CODE_REGEX } from '@auth-management/constants'

describe('Auth Management Regex Constants', () => {
  describe('PASSWORD_REGEX', () => {
    it('should be defined', () => {
      expect(PASSWORD_REGEX).toBeDefined()
    })

    it('should be a RegExp instance', () => {
      expect(PASSWORD_REGEX).toBeInstanceOf(RegExp)
    })

    describe('Valid Passwords', () => {
      it('should match password with all required components', () => {
        expect(PASSWORD_REGEX.test('Abcd1234!')).toBe(true)
      })

      it('should match password with lowercase letters', () => {
        expect(PASSWORD_REGEX.test('Abcdefg1!')).toBe(true)
      })

      it('should match password with uppercase letters', () => {
        expect(PASSWORD_REGEX.test('ABCDE1fg!')).toBe(true)
      })

      it('should match password with numbers', () => {
        expect(PASSWORD_REGEX.test('Abc12345!')).toBe(true)
      })

      it('should match password with special characters', () => {
        expect(PASSWORD_REGEX.test('Abcd1234@#$%')).toBe(true)
      })

      it('should match complex password', () => {
        expect(PASSWORD_REGEX.test('MyP@ssw0rd!')).toBe(true)
      })

      it('should match very strong password', () => {
        expect(PASSWORD_REGEX.test('C0mpl3x!P@ssw0rd')).toBe(true)
      })
    })

    describe('Invalid Passwords', () => {
      it('should not match password without lowercase', () => {
        expect(PASSWORD_REGEX.test('ABCD1234!')).toBe(false)
      })

      it('should not match password without uppercase', () => {
        expect(PASSWORD_REGEX.test('abcd1234!')).toBe(false)
      })

      it('should not match password without numbers', () => {
        expect(PASSWORD_REGEX.test('Abcdefgh!')).toBe(false)
      })

      it('should not match password without special characters', () => {
        expect(PASSWORD_REGEX.test('Abcd1234')).toBe(false)
      })

      it('should not match empty string', () => {
        expect(PASSWORD_REGEX.test('')).toBe(false)
      })

      it('should not match only lowercase letters', () => {
        expect(PASSWORD_REGEX.test('abcdefgh')).toBe(false)
      })

      it('should not match only uppercase letters', () => {
        expect(PASSWORD_REGEX.test('ABCDEFGH')).toBe(false)
      })

      it('should not match only numbers', () => {
        expect(PASSWORD_REGEX.test('12345678')).toBe(false)
      })

      it('should not match only special characters', () => {
        expect(PASSWORD_REGEX.test('!@#$%^&*')).toBe(false)
      })

      it('should not match whitespace only', () => {
        expect(PASSWORD_REGEX.test('        ')).toBe(false)
      })
    })

    describe('Edge Cases', () => {
      it('should handle very long passwords', () => {
        const longPassword = 'A' + 'a'.repeat(100) + '1!'.repeat(50)
        expect(PASSWORD_REGEX.test(longPassword)).toBe(true)
      })

      it('should handle password with multiple special characters', () => {
        expect(PASSWORD_REGEX.test('Abcd1234!@#$%^&*()')).toBe(true)
      })

      it('should handle password with spaces if all requirements met', () => {
        expect(PASSWORD_REGEX.test('Abcd 1234!')).toBe(true)
      })
    })
  })

  describe('BACKUP_CODE_REGEX', () => {
    it('should be defined', () => {
      expect(BACKUP_CODE_REGEX).toBeDefined()
    })

    it('should be a RegExp instance', () => {
      expect(BACKUP_CODE_REGEX).toBeInstanceOf(RegExp)
    })

    describe('Valid Backup Codes', () => {
      it('should match code with 4 chars, hyphen, 4 chars pattern', () => {
        expect(BACKUP_CODE_REGEX.test('ABCD-1234')).toBe(true)
      })

      it('should match all uppercase letters', () => {
        expect(BACKUP_CODE_REGEX.test('ABCD-EFGH')).toBe(true)
      })

      it('should match all lowercase letters', () => {
        expect(BACKUP_CODE_REGEX.test('abcd-efgh')).toBe(true)
      })

      it('should match all numbers', () => {
        expect(BACKUP_CODE_REGEX.test('1234-5678')).toBe(true)
      })

      it('should match mixed alphanumeric', () => {
        expect(BACKUP_CODE_REGEX.test('A1B2-C3D4')).toBe(true)
      })

      it('should match lowercase and numbers', () => {
        expect(BACKUP_CODE_REGEX.test('abc1-def2')).toBe(true)
      })

      it('should match uppercase and numbers', () => {
        expect(BACKUP_CODE_REGEX.test('ABC1-DEF2')).toBe(true)
      })
    })

    describe('Invalid Backup Codes', () => {
      it('should not match code without hyphen', () => {
        expect(BACKUP_CODE_REGEX.test('ABCD1234')).toBe(false)
      })

      it('should not match code with too few characters before hyphen', () => {
        expect(BACKUP_CODE_REGEX.test('ABC-1234')).toBe(false)
      })

      it('should not match code with too many characters before hyphen', () => {
        expect(BACKUP_CODE_REGEX.test('ABCDE-1234')).toBe(false)
      })

      it('should not match code with too few characters after hyphen', () => {
        expect(BACKUP_CODE_REGEX.test('ABCD-123')).toBe(false)
      })

      it('should not match code with too many characters after hyphen', () => {
        expect(BACKUP_CODE_REGEX.test('ABCD-12345')).toBe(false)
      })

      it('should not match code with special characters', () => {
        expect(BACKUP_CODE_REGEX.test('ABC!-1234')).toBe(false)
      })

      it('should not match code with spaces', () => {
        expect(BACKUP_CODE_REGEX.test('ABCD -1234')).toBe(false)
      })

      it('should not match empty string', () => {
        expect(BACKUP_CODE_REGEX.test('')).toBe(false)
      })

      it('should not match only hyphen', () => {
        expect(BACKUP_CODE_REGEX.test('-')).toBe(false)
      })

      it('should not match multiple hyphens', () => {
        expect(BACKUP_CODE_REGEX.test('AB-CD-1234')).toBe(false)
      })
    })

    describe('Edge Cases', () => {
      it('should not match code with leading spaces', () => {
        expect(BACKUP_CODE_REGEX.test(' ABCD-1234')).toBe(false)
      })

      it('should not match code with trailing spaces', () => {
        expect(BACKUP_CODE_REGEX.test('ABCD-1234 ')).toBe(false)
      })

      it('should not match code with underscore instead of hyphen', () => {
        expect(BACKUP_CODE_REGEX.test('ABCD_1234')).toBe(false)
      })
    })
  })

  describe('TOTP_CODE_REGEX', () => {
    it('should be defined', () => {
      expect(TOTP_CODE_REGEX).toBeDefined()
    })

    it('should be a RegExp instance', () => {
      expect(TOTP_CODE_REGEX).toBeInstanceOf(RegExp)
    })

    describe('Valid TOTP Codes', () => {
      it('should match 6-digit code', () => {
        expect(TOTP_CODE_REGEX.test('123456')).toBe(true)
      })

      it('should match code starting with zeros', () => {
        expect(TOTP_CODE_REGEX.test('000123')).toBe(true)
      })

      it('should match all zeros', () => {
        expect(TOTP_CODE_REGEX.test('000000')).toBe(true)
      })

      it('should match all nines', () => {
        expect(TOTP_CODE_REGEX.test('999999')).toBe(true)
      })

      it('should match random 6-digit combinations', () => {
        expect(TOTP_CODE_REGEX.test('123789')).toBe(true)
        expect(TOTP_CODE_REGEX.test('456012')).toBe(true)
        expect(TOTP_CODE_REGEX.test('789345')).toBe(true)
      })
    })

    describe('Invalid TOTP Codes', () => {
      it('should not match less than 6 digits', () => {
        expect(TOTP_CODE_REGEX.test('12345')).toBe(false)
      })

      it('should not match more than 6 digits', () => {
        expect(TOTP_CODE_REGEX.test('1234567')).toBe(false)
      })

      it('should not match code with letters', () => {
        expect(TOTP_CODE_REGEX.test('12345A')).toBe(false)
      })

      it('should not match code with special characters', () => {
        expect(TOTP_CODE_REGEX.test('12345!')).toBe(false)
      })

      it('should not match code with spaces', () => {
        expect(TOTP_CODE_REGEX.test('123 456')).toBe(false)
      })

      it('should not match code with hyphens', () => {
        expect(TOTP_CODE_REGEX.test('123-456')).toBe(false)
      })

      it('should not match empty string', () => {
        expect(TOTP_CODE_REGEX.test('')).toBe(false)
      })

      it('should not match only spaces', () => {
        expect(TOTP_CODE_REGEX.test('      ')).toBe(false)
      })

      it('should not match non-numeric characters', () => {
        expect(TOTP_CODE_REGEX.test('abcdef')).toBe(false)
      })
    })

    describe('Edge Cases', () => {
      it('should not match code with leading spaces', () => {
        expect(TOTP_CODE_REGEX.test(' 123456')).toBe(false)
      })

      it('should not match code with trailing spaces', () => {
        expect(TOTP_CODE_REGEX.test('123456 ')).toBe(false)
      })

      it('should not match floating point numbers', () => {
        expect(TOTP_CODE_REGEX.test('123.456')).toBe(false)
      })

      it('should not match negative numbers', () => {
        expect(TOTP_CODE_REGEX.test('-123456')).toBe(false)
      })
    })
  })

  describe('Regex Integration', () => {
    it('should have distinct patterns for different validation purposes', () => {
      /* PASSWORD_REGEX validates complexity */
      expect(PASSWORD_REGEX.test('Abc123!')).toBe(true)
      expect(PASSWORD_REGEX.test('123456')).toBe(false)

      /* BACKUP_CODE_REGEX validates format */
      expect(BACKUP_CODE_REGEX.test('ABC1-DEF2')).toBe(true)
      expect(BACKUP_CODE_REGEX.test('Abc123!')).toBe(false)

      /* TOTP_CODE_REGEX validates numeric codes */
      expect(TOTP_CODE_REGEX.test('123456')).toBe(true)
      expect(TOTP_CODE_REGEX.test('ABC1-DEF2')).toBe(false)
    })

    it('should all be regular expressions', () => {
      expect(PASSWORD_REGEX).toBeInstanceOf(RegExp)
      expect(BACKUP_CODE_REGEX).toBeInstanceOf(RegExp)
      expect(TOTP_CODE_REGEX).toBeInstanceOf(RegExp)
    })

    it('should handle test method properly', () => {
      /* All should have test method */
      expect(typeof PASSWORD_REGEX.test).toBe('function')
      expect(typeof BACKUP_CODE_REGEX.test).toBe('function')
      expect(typeof TOTP_CODE_REGEX.test).toBe('function')
    })
  })

  describe('Common Validation Scenarios', () => {
    it('should reject common weak passwords', () => {
      const weakPasswords = [
        'password',
        'Password',
        'password123',
        'Password123',
        '12345678',
        'abcdefgh',
        'ABCDEFGH'
      ]

      weakPasswords.forEach(password => {
        expect(PASSWORD_REGEX.test(password)).toBe(false)
      })
    })

    it('should accept strong passwords', () => {
      const strongPasswords = [
        'MyP@ssw0rd!',
        'Str0ng!Pass',
        'C0mpl3x@2024',
        'S3cur3!Password',
        'V3ry$tr0ngP@ss'
      ]

      strongPasswords.forEach(password => {
        expect(PASSWORD_REGEX.test(password)).toBe(true)
      })
    })

    it('should validate typical backup code formats', () => {
      const validBackupCodes = [
        'A1B2-C3D4',
        'ABCD-1234',
        'abcd-efgh',
        '1234-5678',
        'XyZ9-qWe1'
      ]

      validBackupCodes.forEach(code => {
        expect(BACKUP_CODE_REGEX.test(code)).toBe(true)
      })
    })

    it('should validate typical TOTP codes', () => {
      const validTOTPCodes = [
        '123456',
        '000000',
        '999999',
        '012345',
        '543210'
      ]

      validTOTPCodes.forEach(code => {
        expect(TOTP_CODE_REGEX.test(code)).toBe(true)
      })
    })
  })
})
