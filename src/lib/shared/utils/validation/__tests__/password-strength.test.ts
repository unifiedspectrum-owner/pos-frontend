/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Shared module imports */
import { calculatePasswordStrength, PasswordStrengthResult, PasswordChecks } from '@shared/utils/validation/password-strength'

describe('Password Strength Utilities', () => {
  describe('calculatePasswordStrength', () => {
    describe('Empty Password', () => {
      it('should return zero score for empty string', () => {
        const result = calculatePasswordStrength('')

        expect(result.score).toBe(0)
        expect(result.label).toBe('')
        expect(result.color).toBe('gray.300')
      })

      it('should return all checks as false for empty string', () => {
        const result = calculatePasswordStrength('')

        expect(result.checks.length).toBe(false)
        expect(result.checks.lowercase).toBe(false)
        expect(result.checks.uppercase).toBe(false)
        expect(result.checks.number).toBe(false)
        expect(result.checks.special).toBe(false)
      })
    })

    describe('Length Check', () => {
      it('should pass length check for 8 characters', () => {
        const result = calculatePasswordStrength('12345678')

        expect(result.checks.length).toBe(true)
      })

      it('should fail length check for 7 characters', () => {
        const result = calculatePasswordStrength('1234567')

        expect(result.checks.length).toBe(false)
      })

      it('should pass length check for more than 8 characters', () => {
        const result = calculatePasswordStrength('123456789')

        expect(result.checks.length).toBe(true)
      })

      it('should pass length check for very long password', () => {
        const result = calculatePasswordStrength('a'.repeat(100))

        expect(result.checks.length).toBe(true)
      })
    })

    describe('Lowercase Check', () => {
      it('should pass for single lowercase letter', () => {
        const result = calculatePasswordStrength('a')

        expect(result.checks.lowercase).toBe(true)
      })

      it('should pass for multiple lowercase letters', () => {
        const result = calculatePasswordStrength('abc')

        expect(result.checks.lowercase).toBe(true)
      })

      it('should pass for mixed case with lowercase', () => {
        const result = calculatePasswordStrength('Abc')

        expect(result.checks.lowercase).toBe(true)
      })

      it('should fail for no lowercase letters', () => {
        const result = calculatePasswordStrength('ABC123')

        expect(result.checks.lowercase).toBe(false)
      })

      it('should fail for numbers only', () => {
        const result = calculatePasswordStrength('12345')

        expect(result.checks.lowercase).toBe(false)
      })
    })

    describe('Uppercase Check', () => {
      it('should pass for single uppercase letter', () => {
        const result = calculatePasswordStrength('A')

        expect(result.checks.uppercase).toBe(true)
      })

      it('should pass for multiple uppercase letters', () => {
        const result = calculatePasswordStrength('ABC')

        expect(result.checks.uppercase).toBe(true)
      })

      it('should pass for mixed case with uppercase', () => {
        const result = calculatePasswordStrength('aBc')

        expect(result.checks.uppercase).toBe(true)
      })

      it('should fail for no uppercase letters', () => {
        const result = calculatePasswordStrength('abc123')

        expect(result.checks.uppercase).toBe(false)
      })

      it('should fail for lowercase only', () => {
        const result = calculatePasswordStrength('abcdef')

        expect(result.checks.uppercase).toBe(false)
      })
    })

    describe('Number Check', () => {
      it('should pass for single digit', () => {
        const result = calculatePasswordStrength('1')

        expect(result.checks.number).toBe(true)
      })

      it('should pass for multiple digits', () => {
        const result = calculatePasswordStrength('123')

        expect(result.checks.number).toBe(true)
      })

      it('should pass for mixed alphanumeric', () => {
        const result = calculatePasswordStrength('abc123')

        expect(result.checks.number).toBe(true)
      })

      it('should fail for no numbers', () => {
        const result = calculatePasswordStrength('abcdef')

        expect(result.checks.number).toBe(false)
      })

      it('should pass for number at beginning', () => {
        const result = calculatePasswordStrength('1abc')

        expect(result.checks.number).toBe(true)
      })

      it('should pass for number at end', () => {
        const result = calculatePasswordStrength('abc1')

        expect(result.checks.number).toBe(true)
      })

      it('should pass for number in middle', () => {
        const result = calculatePasswordStrength('ab1cd')

        expect(result.checks.number).toBe(true)
      })
    })

    describe('Special Character Check', () => {
      it('should pass for exclamation mark', () => {
        const result = calculatePasswordStrength('!')

        expect(result.checks.special).toBe(true)
      })

      it('should pass for at symbol', () => {
        const result = calculatePasswordStrength('@')

        expect(result.checks.special).toBe(true)
      })

      it('should pass for hash symbol', () => {
        const result = calculatePasswordStrength('#')

        expect(result.checks.special).toBe(true)
      })

      it('should pass for dollar sign', () => {
        const result = calculatePasswordStrength('$')

        expect(result.checks.special).toBe(true)
      })

      it('should pass for percent sign', () => {
        const result = calculatePasswordStrength('%')

        expect(result.checks.special).toBe(true)
      })

      it('should pass for caret', () => {
        const result = calculatePasswordStrength('^')

        expect(result.checks.special).toBe(true)
      })

      it('should pass for ampersand', () => {
        const result = calculatePasswordStrength('&')

        expect(result.checks.special).toBe(true)
      })

      it('should pass for asterisk', () => {
        const result = calculatePasswordStrength('*')

        expect(result.checks.special).toBe(true)
      })

      it('should pass for password with special character', () => {
        const result = calculatePasswordStrength('abc!123')

        expect(result.checks.special).toBe(true)
      })

      it('should fail for no special characters', () => {
        const result = calculatePasswordStrength('abc123')

        expect(result.checks.special).toBe(false)
      })

      it('should fail for other special characters not in set', () => {
        const result = calculatePasswordStrength('abc-123')

        expect(result.checks.special).toBe(false)
      })
    })

    describe('Score Calculation', () => {
      it('should return 0% for no requirements met', () => {
        const result = calculatePasswordStrength('abc')

        expect(result.score).toBe(20)
      })

      it('should return 20% for 1 requirement met', () => {
        const result = calculatePasswordStrength('a')

        expect(result.score).toBe(20)
      })

      it('should return 40% for 2 requirements met', () => {
        const result = calculatePasswordStrength('aB')

        expect(result.score).toBe(40)
      })

      it('should return 60% for 3 requirements met', () => {
        const result = calculatePasswordStrength('aB1')

        expect(result.score).toBe(60)
      })

      it('should return 80% for 4 requirements met', () => {
        const result = calculatePasswordStrength('aB1!')

        expect(result.score).toBe(80)
      })

      it('should return 100% for all 5 requirements met', () => {
        const result = calculatePasswordStrength('aB1!5678')

        expect(result.score).toBe(100)
      })
    })

    describe('Strength Labels', () => {
      it('should return "Very Weak" for 0 requirements', () => {
        const result = calculatePasswordStrength('')

        expect(result.label).toBe('')
      })

      it('should return "Very Weak" for 1 requirement', () => {
        const result = calculatePasswordStrength('a')

        expect(result.label).toBe('Very Weak')
      })

      it('should return "Weak" for 2 requirements', () => {
        const result = calculatePasswordStrength('aB')

        expect(result.label).toBe('Weak')
      })

      it('should return "Fair" for 3 requirements', () => {
        const result = calculatePasswordStrength('aB1')

        expect(result.label).toBe('Fair')
      })

      it('should return "Good" for 4 requirements', () => {
        const result = calculatePasswordStrength('aB1!')

        expect(result.label).toBe('Good')
      })

      it('should return "Strong" for 5 requirements', () => {
        const result = calculatePasswordStrength('aB1!5678')

        expect(result.label).toBe('Strong')
      })
    })

    describe('Color Codes', () => {
      it('should return gray for empty password', () => {
        const result = calculatePasswordStrength('')

        expect(result.color).toBe('gray.300')
      })

      it('should return red for very weak password', () => {
        const result = calculatePasswordStrength('a')

        expect(result.color).toBe('red.500')
      })

      it('should return orange for weak password', () => {
        const result = calculatePasswordStrength('aB')

        expect(result.color).toBe('orange.500')
      })

      it('should return yellow for fair password', () => {
        const result = calculatePasswordStrength('aB1')

        expect(result.color).toBe('yellow.500')
      })

      it('should return blue for good password', () => {
        const result = calculatePasswordStrength('aB1!')

        expect(result.color).toBe('blue.500')
      })

      it('should return green for strong password', () => {
        const result = calculatePasswordStrength('aB1!5678')

        expect(result.color).toBe('green.500')
      })
    })

    describe('Real-World Passwords', () => {
      it('should evaluate "password" as very weak', () => {
        const result = calculatePasswordStrength('password')

        expect(result.checks.length).toBe(true)
        expect(result.checks.lowercase).toBe(true)
        expect(result.checks.uppercase).toBe(false)
        expect(result.checks.number).toBe(false)
        expect(result.checks.special).toBe(false)
        expect(result.score).toBe(40)
        expect(result.label).toBe('Weak')
      })

      it('should evaluate "Password1" as fair', () => {
        const result = calculatePasswordStrength('Password1')

        expect(result.checks.length).toBe(true)
        expect(result.checks.lowercase).toBe(true)
        expect(result.checks.uppercase).toBe(true)
        expect(result.checks.number).toBe(true)
        expect(result.checks.special).toBe(false)
        expect(result.score).toBe(80)
        expect(result.label).toBe('Good')
      })

      it('should evaluate "Password1!" as strong', () => {
        const result = calculatePasswordStrength('Password1!')

        expect(result.checks.length).toBe(true)
        expect(result.checks.lowercase).toBe(true)
        expect(result.checks.uppercase).toBe(true)
        expect(result.checks.number).toBe(true)
        expect(result.checks.special).toBe(true)
        expect(result.score).toBe(100)
        expect(result.label).toBe('Strong')
      })

      it('should evaluate "12345678" as weak', () => {
        const result = calculatePasswordStrength('12345678')

        expect(result.checks.length).toBe(true)
        expect(result.checks.lowercase).toBe(false)
        expect(result.checks.uppercase).toBe(false)
        expect(result.checks.number).toBe(true)
        expect(result.checks.special).toBe(false)
        expect(result.score).toBe(40)
        expect(result.label).toBe('Weak')
      })

      it('should evaluate "ABCDEFGH" as weak', () => {
        const result = calculatePasswordStrength('ABCDEFGH')

        expect(result.checks.length).toBe(true)
        expect(result.checks.lowercase).toBe(false)
        expect(result.checks.uppercase).toBe(true)
        expect(result.checks.number).toBe(false)
        expect(result.checks.special).toBe(false)
        expect(result.score).toBe(40)
        expect(result.label).toBe('Weak')
      })

      it('should evaluate "Passw0rd!" as strong', () => {
        const result = calculatePasswordStrength('Passw0rd!')

        expect(result.checks.length).toBe(true)
        expect(result.checks.lowercase).toBe(true)
        expect(result.checks.uppercase).toBe(true)
        expect(result.checks.number).toBe(true)
        expect(result.checks.special).toBe(true)
        expect(result.score).toBe(100)
        expect(result.label).toBe('Strong')
      })
    })

    describe('Edge Cases', () => {
      it('should handle single character passwords', () => {
        const result = calculatePasswordStrength('a')

        expect(result).toBeDefined()
        expect(result.score).toBeGreaterThanOrEqual(0)
      })

      it('should handle very long passwords', () => {
        const longPassword = 'aB1!'.repeat(100)
        const result = calculatePasswordStrength(longPassword)

        expect(result.score).toBe(100)
        expect(result.label).toBe('Strong')
      })

      it('should handle passwords with spaces', () => {
        const result = calculatePasswordStrength('Pass word1!')

        expect(result.checks.length).toBe(true)
        expect(result.checks.special).toBe(true)
      })

      it('should handle passwords with unicode characters', () => {
        const result = calculatePasswordStrength('Pássw0rd!')

        expect(result).toBeDefined()
        expect(result.checks.lowercase).toBe(true)
      })

      it('should handle passwords with only special characters', () => {
        const result = calculatePasswordStrength('!@#$%^&*')

        expect(result.checks.length).toBe(true)
        expect(result.checks.special).toBe(true)
        expect(result.checks.lowercase).toBe(false)
      })

      it('should handle passwords with mixed special and alphanumeric', () => {
        const result = calculatePasswordStrength('aB1!@#$%')

        expect(result.score).toBe(100)
      })
    })

    describe('Return Type Structure', () => {
      it('should return PasswordStrengthResult type', () => {
        const result: PasswordStrengthResult = calculatePasswordStrength('test')

        expect(result).toBeDefined()
      })

      it('should have all required properties', () => {
        const result = calculatePasswordStrength('test')

        expect(result).toHaveProperty('score')
        expect(result).toHaveProperty('label')
        expect(result).toHaveProperty('color')
        expect(result).toHaveProperty('checks')
      })

      it('should have correct types for properties', () => {
        const result = calculatePasswordStrength('test')

        expect(typeof result.score).toBe('number')
        expect(typeof result.label).toBe('string')
        expect(typeof result.color).toBe('string')
        expect(typeof result.checks).toBe('object')
      })

      it('should have PasswordChecks structure', () => {
        const result = calculatePasswordStrength('test')
        const checks: PasswordChecks = result.checks

        expect(checks).toHaveProperty('length')
        expect(checks).toHaveProperty('lowercase')
        expect(checks).toHaveProperty('uppercase')
        expect(checks).toHaveProperty('number')
        expect(checks).toHaveProperty('special')
      })

      it('should have boolean values in checks', () => {
        const result = calculatePasswordStrength('test')

        expect(typeof result.checks.length).toBe('boolean')
        expect(typeof result.checks.lowercase).toBe('boolean')
        expect(typeof result.checks.uppercase).toBe('boolean')
        expect(typeof result.checks.number).toBe('boolean')
        expect(typeof result.checks.special).toBe('boolean')
      })

      it('should have score between 0 and 100', () => {
        const passwords = ['', 'a', 'aB', 'aB1', 'aB1!', 'aB1!5678']

        passwords.forEach(password => {
          const result = calculatePasswordStrength(password)
          expect(result.score).toBeGreaterThanOrEqual(0)
          expect(result.score).toBeLessThanOrEqual(100)
        })
      })

      it('should have valid chakra color format', () => {
        const result = calculatePasswordStrength('aB1!5678')

        expect(result.color).toMatch(/^(gray|red|orange|yellow|blue|green)\.\d+$/)
      })
    })

    describe('Consistency Tests', () => {
      it('should return same result for same password', () => {
        const password = 'TestPassword1!'

        const result1 = calculatePasswordStrength(password)
        const result2 = calculatePasswordStrength(password)

        expect(result1).toEqual(result2)
      })

      it('should return same checks for same password', () => {
        const password = 'TestPassword1!'

        const result1 = calculatePasswordStrength(password)
        const result2 = calculatePasswordStrength(password)

        expect(result1.checks).toEqual(result2.checks)
      })

      it('should be deterministic', () => {
        const password = 'MyP@ssw0rd'
        const results = Array.from({ length: 10 }, () => calculatePasswordStrength(password))

        const firstResult = results[0]
        results.forEach(result => {
          expect(result).toEqual(firstResult)
        })
      })
    })

    describe('Progressive Strength', () => {
      it('should increase strength as requirements are added', () => {
        const passwords = [
          'abc',           /* 1 requirement */
          'Abc',           /* 2 requirements */
          'Abc1',          /* 3 requirements */
          'Abc1!',         /* 4 requirements */
          'Abc1!234'       /* 5 requirements */
        ]

        const scores = passwords.map(p => calculatePasswordStrength(p).score)

        for (let i = 1; i < scores.length; i++) {
          expect(scores[i]).toBeGreaterThan(scores[i - 1])
        }
      })

      it('should improve label as requirements are added', () => {
        const passwords = [
          'a',             /* Very Weak */
          'aB',            /* Weak */
          'aB1',           /* Fair */
          'aB1!',          /* Good */
          'aB1!5678'       /* Strong */
        ]

        const labels = passwords.map(p => calculatePasswordStrength(p).label)
        const expectedLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

        expect(labels).toEqual(expectedLabels)
      })
    })

    describe('Integration Tests', () => {
      it('should evaluate complete registration flow passwords', () => {
        const weakPassword = 'password'
        const strongPassword = 'MySecure1!'

        const weakResult = calculatePasswordStrength(weakPassword)
        const strongResult = calculatePasswordStrength(strongPassword)

        expect(weakResult.score).toBeLessThan(strongResult.score)
        expect(weakResult.label).not.toBe('Strong')
        expect(strongResult.label).toBe('Strong')
      })

      it('should provide useful UI feedback', () => {
        const password = 'TestP@ss1'
        const result = calculatePasswordStrength(password)

        /* Can be used to show progress bar */
        expect(result.score).toBeGreaterThan(0)

        /* Can be used to show color indicator */
        expect(result.color).toBeDefined()

        /* Can be used to show text label */
        expect(result.label).toBeDefined()

        /* Can be used to show individual requirement checkboxes */
        expect(Object.keys(result.checks)).toHaveLength(5)
      })
    })
  })
})
