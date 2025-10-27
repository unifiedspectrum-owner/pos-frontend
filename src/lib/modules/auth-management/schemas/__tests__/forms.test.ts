/* Comprehensive test suite for auth management form validation schemas */

/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod/v4'

/* Auth management module imports */
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, emailVerificationSchema, twoFactorValidationSchema, updateProfileSchema, enable2FASchema, type LoginFormData, type ForgotPasswordFormData, type ResetPasswordFormData, type EmailVerificationFormData, type TwoFactorValidationFormData, type UpdateProfileFormData, type Enable2FAFormData } from '@auth-management/schemas'
import { TWO_FA_TYPES } from '@auth-management/constants'

describe('Auth Management Form Schemas', () => {
  describe('loginSchema', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'TestPass123!',
      remember_me: false
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(loginSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(loginSchema.parse).toBeDefined()
        expect(loginSchema.safeParse).toBeDefined()
        expect(typeof loginSchema.parse).toBe('function')
        expect(typeof loginSchema.safeParse).toBe('function')
      })

      it('should validate data with all required fields', () => {
        const result = loginSchema.safeParse(validLoginData)
        expect(result.success).toBe(true)
      })
    })

    describe('email Field Validation', () => {
      it('should accept valid email', () => {
        const result = loginSchema.safeParse(validLoginData)
        expect(result.success).toBe(true)
      })

      it('should reject empty email', () => {
        const data = { ...validLoginData, email: '' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid email address')
        }
      })

      it('should reject invalid email format', () => {
        const data = { ...validLoginData, email: 'invalid-email' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid email address')
        }
      })

      it('should reject email without @ symbol', () => {
        const data = { ...validLoginData, email: 'testexample.com' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject email without domain', () => {
        const data = { ...validLoginData, email: 'test@' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept email with subdomain', () => {
        const data = { ...validLoginData, email: 'test@mail.example.com' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept email with plus sign', () => {
        const data = { ...validLoginData, email: 'test+tag@example.com' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('password Field Validation', () => {
      it('should accept valid password', () => {
        const result = loginSchema.safeParse(validLoginData)
        expect(result.success).toBe(true)
      })

      it('should reject empty password', () => {
        const data = { ...validLoginData, password: '' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Password is required')
        }
      })

      it('should reject password shorter than 8 characters', () => {
        const data = { ...validLoginData, password: 'Test12!' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Password must be at least 8 characters')
        }
      })

      it('should accept password with exactly 8 characters', () => {
        const data = { ...validLoginData, password: 'Test123!' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept long passwords', () => {
        const data = { ...validLoginData, password: 'A'.repeat(50) + 'a1!' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('remember_me Field Validation', () => {
      it('should accept true value', () => {
        const data = { ...validLoginData, remember_me: true }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept false value', () => {
        const data = { ...validLoginData, remember_me: false }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject non-boolean value', () => {
        const data = { ...validLoginData, remember_me: 'true' }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject null value', () => {
        const data = { ...validLoginData, remember_me: null }
        const result = loginSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Complete Validation Scenarios', () => {
      it('should validate complete login data successfully', () => {
        const result = loginSchema.safeParse(validLoginData)
        expect(result.success).toBe(true)
      })

      it('should reject data missing required fields', () => {
        const incompleteData = { email: 'test@example.com' }
        const result = loginSchema.safeParse(incompleteData)

        expect(result.success).toBe(false)
      })

      it('should accumulate multiple validation errors', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'short',
          remember_me: 'yes'
        }

        const result = loginSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(1)
        }
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: LoginFormData = {
          email: 'test@example.com',
          password: 'TestPass123!',
          remember_me: false
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('forgotPasswordSchema', () => {
    const validForgotPasswordData = {
      email: 'test@example.com'
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(forgotPasswordSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(forgotPasswordSchema.parse).toBeDefined()
        expect(forgotPasswordSchema.safeParse).toBeDefined()
      })

      it('should validate data with required field', () => {
        const result = forgotPasswordSchema.safeParse(validForgotPasswordData)
        expect(result.success).toBe(true)
      })
    })

    describe('email Field Validation', () => {
      it('should accept valid email', () => {
        const result = forgotPasswordSchema.safeParse(validForgotPasswordData)
        expect(result.success).toBe(true)
      })

      it('should reject empty email', () => {
        const data = { email: '' }
        const result = forgotPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid email address')
        }
      })

      it('should reject invalid email format', () => {
        const data = { email: 'invalid-email' }
        const result = forgotPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid email address')
        }
      })

      it('should accept email with various valid formats', () => {
        const validEmails = [
          'test@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'test_user@sub.example.com'
        ]

        validEmails.forEach(email => {
          const result = forgotPasswordSchema.safeParse({ email })
          expect(result.success).toBe(true)
        })
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: ForgotPasswordFormData = {
          email: 'test@example.com'
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('resetPasswordSchema', () => {
    const validResetPasswordData = {
      token: 'valid-reset-token-123',
      new_password: 'NewPass123!',
      confirm_password: 'NewPass123!'
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(resetPasswordSchema).toBeDefined()
      })

      it('should validate data with all required fields', () => {
        const result = resetPasswordSchema.safeParse(validResetPasswordData)
        expect(result.success).toBe(true)
      })
    })

    describe('token Field Validation', () => {
      it('should accept valid token', () => {
        const result = resetPasswordSchema.safeParse(validResetPasswordData)
        expect(result.success).toBe(true)
      })

      it('should reject empty token', () => {
        const data = { ...validResetPasswordData, token: '' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Reset token is required')
        }
      })
    })

    describe('new_password Field Validation', () => {
      it('should accept valid password', () => {
        const result = resetPasswordSchema.safeParse(validResetPasswordData)
        expect(result.success).toBe(true)
      })

      it('should reject empty password', () => {
        const data = { ...validResetPasswordData, new_password: '', confirm_password: '' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('New password is required')
        }
      })

      it('should reject password shorter than 8 characters', () => {
        const data = { ...validResetPasswordData, new_password: 'Test12!', confirm_password: 'Test12!' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Password must be at least 8 characters')
        }
      })

      it('should reject password without uppercase letter', () => {
        const data = { ...validResetPasswordData, new_password: 'testpass123!', confirm_password: 'testpass123!' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('uppercase')
        }
      })

      it('should reject password without lowercase letter', () => {
        const data = { ...validResetPasswordData, new_password: 'TESTPASS123!', confirm_password: 'TESTPASS123!' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('lowercase')
        }
      })

      it('should reject password without number', () => {
        const data = { ...validResetPasswordData, new_password: 'TestPassword!', confirm_password: 'TestPassword!' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('number')
        }
      })

      it('should reject password without special character', () => {
        const data = { ...validResetPasswordData, new_password: 'TestPass123', confirm_password: 'TestPass123' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('special character')
        }
      })

      it('should accept password with all requirements', () => {
        const validPasswords = [
          'TestPass123!',
          'MyP@ssw0rd',
          'Str0ng!Pass',
          'C0mpl3x@2024'
        ]

        validPasswords.forEach(password => {
          const data = { ...validResetPasswordData, new_password: password, confirm_password: password }
          const result = resetPasswordSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('confirm_password Field Validation', () => {
      it('should accept matching passwords', () => {
        const result = resetPasswordSchema.safeParse(validResetPasswordData)
        expect(result.success).toBe(true)
      })

      it('should reject empty confirm password', () => {
        const data = { ...validResetPasswordData, confirm_password: '' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Password confirmation is required')
        }
      })

      it('should reject non-matching passwords', () => {
        const data = { ...validResetPasswordData, confirm_password: 'DifferentPass123!' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          const matchError = result.error.issues.find(issue => issue.message === "Passwords don't match")
          expect(matchError).toBeDefined()
        }
      })

      it('should have error path pointing to confirm_password field', () => {
        const data = { ...validResetPasswordData, confirm_password: 'DifferentPass123!' }
        const result = resetPasswordSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          const matchError = result.error.issues.find(issue => issue.message === "Passwords don't match")
          expect(matchError?.path).toContain('confirm_password')
        }
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: ResetPasswordFormData = {
          token: 'valid-token',
          new_password: 'NewPass123!',
          confirm_password: 'NewPass123!'
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('emailVerificationSchema', () => {
    const validEmailVerificationData = {
      token: 'verification-token-123',
      email: 'test@example.com'
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(emailVerificationSchema).toBeDefined()
      })

      it('should validate data with all required fields', () => {
        const result = emailVerificationSchema.safeParse(validEmailVerificationData)
        expect(result.success).toBe(true)
      })
    })

    describe('token Field Validation', () => {
      it('should accept valid token', () => {
        const result = emailVerificationSchema.safeParse(validEmailVerificationData)
        expect(result.success).toBe(true)
      })

      it('should reject empty token', () => {
        const data = { ...validEmailVerificationData, token: '' }
        const result = emailVerificationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Verification token is required')
        }
      })
    })

    describe('email Field Validation', () => {
      it('should accept valid email', () => {
        const result = emailVerificationSchema.safeParse(validEmailVerificationData)
        expect(result.success).toBe(true)
      })

      it('should reject empty email', () => {
        const data = { ...validEmailVerificationData, email: '' }
        const result = emailVerificationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email is required')
        }
      })

      it('should reject invalid email format', () => {
        const data = { ...validEmailVerificationData, email: 'invalid-email' }
        const result = emailVerificationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid email address')
        }
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: EmailVerificationFormData = {
          token: 'token-123',
          email: 'test@example.com'
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('twoFactorValidationSchema', () => {
    const validTOTPData = {
      user_id: 'user-123',
      type: TWO_FA_TYPES.TOTP as const,
      totp_code: ['1', '2', '3', '4', '5', '6']
    }

    const validBackupCodeData = {
      user_id: 'user-123',
      type: TWO_FA_TYPES.BACKUP as const,
      b_code: 'ABCD-1234'
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(twoFactorValidationSchema).toBeDefined()
      })

      it('should validate TOTP data', () => {
        const result = twoFactorValidationSchema.safeParse(validTOTPData)
        expect(result.success).toBe(true)
      })

      it('should validate backup code data', () => {
        const result = twoFactorValidationSchema.safeParse(validBackupCodeData)
        expect(result.success).toBe(true)
      })
    })

    describe('user_id Field Validation', () => {
      it('should accept valid user_id', () => {
        const result = twoFactorValidationSchema.safeParse(validTOTPData)
        expect(result.success).toBe(true)
      })

      it('should reject empty user_id', () => {
        const data = { ...validTOTPData, user_id: '' }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('user ID is required')
        }
      })
    })

    describe('type Field Validation', () => {
      it('should accept TOTP type', () => {
        const result = twoFactorValidationSchema.safeParse(validTOTPData)
        expect(result.success).toBe(true)
      })

      it('should accept BACKUP type', () => {
        const result = twoFactorValidationSchema.safeParse(validBackupCodeData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid type', () => {
        const data = { ...validTOTPData, type: 'invalid' }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('TOTP Code Validation', () => {
      it('should accept valid 6-digit TOTP code', () => {
        const result = twoFactorValidationSchema.safeParse(validTOTPData)
        expect(result.success).toBe(true)
      })

      it('should reject TOTP code with less than 6 digits', () => {
        const data = { ...validTOTPData, totp_code: ['1', '2', '3', '4', '5'] }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Code must be 6 digits long')
        }
      })

      it('should reject TOTP code with more than 6 digits', () => {
        const data = { ...validTOTPData, totp_code: ['1', '2', '3', '4', '5', '6', '7'] }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject TOTP code with empty digits', () => {
        const data = { ...validTOTPData, totp_code: ['1', '2', '', '4', '5', '6'] }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('All 6 digits are required')
        }
      })

      it('should reject TOTP code with all empty digits', () => {
        const data = { ...validTOTPData, totp_code: ['', '', '', '', '', ''] }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject missing TOTP code when type is TOTP', () => {
        const data = { user_id: 'user-123', type: TWO_FA_TYPES.TOTP }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Backup Code Validation', () => {
      it('should accept valid backup code', () => {
        const result = twoFactorValidationSchema.safeParse(validBackupCodeData)
        expect(result.success).toBe(true)
      })

      it('should reject empty backup code', () => {
        const data = { ...validBackupCodeData, b_code: '' }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Backup code is required')
        }
      })

      it('should reject backup code with incorrect length', () => {
        const data = { ...validBackupCodeData, b_code: 'AB-12' }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('exactly 9 characters')
        }
      })

      it('should reject backup code with invalid format', () => {
        const data = { ...validBackupCodeData, b_code: 'ABCD1234!' }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid backup code format')
        }
      })

      it('should accept various valid backup code formats', () => {
        const validCodes = [
          'ABCD-1234',
          'abcd-efgh',
          '1234-5678',
          'A1B2-C3D4'
        ]

        validCodes.forEach(code => {
          const data = { ...validBackupCodeData, b_code: code }
          const result = twoFactorValidationSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      it('should reject missing backup code when type is BACKUP', () => {
        const data = { user_id: 'user-123', type: TWO_FA_TYPES.BACKUP }
        const result = twoFactorValidationSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type for TOTP', () => {
        const data: TwoFactorValidationFormData = {
          user_id: 'user-123',
          type: 'totp',
          totp_code: ['1', '2', '3', '4', '5', '6']
        }

        expect(data).toBeDefined()
      })

      it('should infer correct TypeScript type for backup code', () => {
        const data: TwoFactorValidationFormData = {
          user_id: 'user-123',
          type: 'backup',
          b_code: 'ABCD-1234'
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('updateProfileSchema', () => {
    const validProfileData = {
      f_name: 'John',
      l_name: 'Doe',
      email: 'john.doe@example.com',
      phone: ['+1', '1234567890'] as [string, string]
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(updateProfileSchema).toBeDefined()
      })

      it('should validate data with all required fields', () => {
        const result = updateProfileSchema.safeParse(validProfileData)
        expect(result.success).toBe(true)
      })
    })

    describe('f_name Field Validation', () => {
      it('should accept valid first name', () => {
        const result = updateProfileSchema.safeParse(validProfileData)
        expect(result.success).toBe(true)
      })

      it('should reject empty first name', () => {
        const data = { ...validProfileData, f_name: '' }
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('First name is required')
        }
      })

      it('should reject first name exceeding 100 characters', () => {
        const data = { ...validProfileData, f_name: 'a'.repeat(101) }
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('First name cannot exceed 100 characters')
        }
      })

      it('should accept first name with exactly 100 characters', () => {
        const data = { ...validProfileData, f_name: 'a'.repeat(100) }
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('l_name Field Validation', () => {
      it('should accept valid last name', () => {
        const result = updateProfileSchema.safeParse(validProfileData)
        expect(result.success).toBe(true)
      })

      it('should reject empty last name', () => {
        const data = { ...validProfileData, l_name: '' }
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Last name is required')
        }
      })

      it('should reject last name exceeding 100 characters', () => {
        const data = { ...validProfileData, l_name: 'a'.repeat(101) }
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Last name cannot exceed 100 characters')
        }
      })
    })

    describe('email Field Validation', () => {
      it('should accept valid email', () => {
        const result = updateProfileSchema.safeParse(validProfileData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid email format', () => {
        const data = { ...validProfileData, email: 'invalid-email' }
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid email format')
        }
      })

      it('should reject email exceeding 255 characters', () => {
        const longEmail = 'a'.repeat(250) + '@test.com'
        const data = { ...validProfileData, email: longEmail }
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email cannot exceed 255 characters')
        }
      })

      it('should convert email to lowercase', () => {
        const data = { ...validProfileData, email: 'JOHN.DOE@EXAMPLE.COM' }
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.email).toBe('john.doe@example.com')
        }
      })
    })

    describe('phone Field Validation', () => {
      it('should accept valid phone number tuple', () => {
        const result = updateProfileSchema.safeParse(validProfileData)
        expect(result.success).toBe(true)
      })

      it('should accept undefined phone (optional field)', () => {
        const data = { ...validProfileData }
        delete (data as Record<string, unknown>).phone
        const result = updateProfileSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept data without phone field', () => {
        const dataWithoutPhone = {
          f_name: 'John',
          l_name: 'Doe',
          email: 'john@example.com'
        }
        const result = updateProfileSchema.safeParse(dataWithoutPhone)
        expect(result.success).toBe(true)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: UpdateProfileFormData = {
          f_name: 'John',
          l_name: 'Doe',
          email: 'john@example.com',
          phone: ['+1', '1234567890']
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('enable2FASchema', () => {
    const validEnable2FAData = {
      code: ['1', '2', '3', '4', '5', '6']
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(enable2FASchema).toBeDefined()
      })

      it('should validate data with valid code', () => {
        const result = enable2FASchema.safeParse(validEnable2FAData)
        expect(result.success).toBe(true)
      })
    })

    describe('code Field Validation', () => {
      it('should accept valid 6-digit code', () => {
        const result = enable2FASchema.safeParse(validEnable2FAData)
        expect(result.success).toBe(true)
      })

      it('should reject code with less than 6 digits', () => {
        const data = { code: ['1', '2', '3', '4', '5'] }
        const result = enable2FASchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Code must be 6 digits long')
        }
      })

      it('should reject code with more than 6 digits', () => {
        const data = { code: ['1', '2', '3', '4', '5', '6', '7'] }
        const result = enable2FASchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject code with empty digits', () => {
        const data = { code: ['1', '2', '', '4', '5', '6'] }
        const result = enable2FASchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('All 6 digits are required')
        }
      })

      it('should reject code with whitespace digits', () => {
        const data = { code: ['1', '2', ' ', '4', '5', '6'] }
        const result = enable2FASchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject missing code', () => {
        const data = {}
        const result = enable2FASchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: Enable2FAFormData = {
          code: ['1', '2', '3', '4', '5', '6']
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('Schema Integration', () => {
    it('should export all schema types', () => {
      const loginData: LoginFormData = { email: 'test@example.com', password: 'TestPass123!', remember_me: false }
      const forgotPasswordData: ForgotPasswordFormData = { email: 'test@example.com' }
      const resetPasswordData: ResetPasswordFormData = { token: 'token', new_password: 'NewPass123!', confirm_password: 'NewPass123!' }
      const emailVerificationData: EmailVerificationFormData = { token: 'token', email: 'test@example.com' }
      const twoFactorData: TwoFactorValidationFormData = { user_id: 'user-123', type: 'totp', totp_code: ['1', '2', '3', '4', '5', '6'] }
      const profileData: UpdateProfileFormData = { f_name: 'John', l_name: 'Doe', email: 'john@example.com' }
      const enable2FAData: Enable2FAFormData = { code: ['1', '2', '3', '4', '5', '6'] }

      expect(loginData).toBeDefined()
      expect(forgotPasswordData).toBeDefined()
      expect(resetPasswordData).toBeDefined()
      expect(emailVerificationData).toBeDefined()
      expect(twoFactorData).toBeDefined()
      expect(profileData).toBeDefined()
      expect(enable2FAData).toBeDefined()
    })

    it('should have all schemas as Zod schemas', () => {
      expect(loginSchema).toHaveProperty('parse')
      expect(forgotPasswordSchema).toHaveProperty('parse')
      expect(resetPasswordSchema).toHaveProperty('parse')
      expect(emailVerificationSchema).toHaveProperty('parse')
      expect(twoFactorValidationSchema).toHaveProperty('parse')
      expect(updateProfileSchema).toHaveProperty('parse')
      expect(enable2FASchema).toHaveProperty('parse')
    })
  })

  describe('Error Handling', () => {
    it('should provide detailed error information', () => {
      const invalidData = { email: 'invalid', password: 'short', remember_me: false }
      const result = loginSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError)
        expect(result.error.issues[0]).toHaveProperty('path')
        expect(result.error.issues[0]).toHaveProperty('message')
      }
    })

    it('should include field path in error', () => {
      const invalidData = { token: 'token', new_password: 'weak', confirm_password: 'weak' }
      const result = resetPasswordSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('new_password')
      }
    })

    it('should accumulate multiple errors', () => {
      const invalidData = {
        email: '',
        password: 'short',
        remember_me: 'yes'
      }
      const result = loginSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
      }
    })
  })
})
