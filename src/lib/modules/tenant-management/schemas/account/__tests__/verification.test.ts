/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod/v4'

/* Tenant management module imports */
import { requestOtpSchema, verifyTenantAccountSchema, emailOTPVerificationSchema, phoneOTPVerificationSchema, type EmailOTPVerificationData, type PhoneOTPVerificationData } from '../verification'

describe('Tenant Account Verification Schemas', () => {
  describe('requestOtpSchema', () => {
    const validRequestData = {
      tenant_id: 'tenant-123',
      otp_type: 'email_verification' as const
    }

    describe('Valid Data', () => {
      it('validates correct request data', () => {
        const result = requestOtpSchema.safeParse(validRequestData)
        expect(result.success).toBe(true)
      })

      it('validates with email_verification type', () => {
        const data = { tenant_id: 'tenant-123', otp_type: 'email_verification' }
        const result = requestOtpSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates with phone_verification type', () => {
        const data = { tenant_id: 'tenant-123', otp_type: 'phone_verification' }
        const result = requestOtpSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates with all type', () => {
        const data = { tenant_id: 'tenant-123', otp_type: 'all' }
        const result = requestOtpSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('applies default values when fields are missing', () => {
        const result = requestOtpSchema.safeParse({})
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.tenant_id).toBe('')
          expect(result.data.otp_type).toBe('all')
        }
      })
    })

    describe('tenant_id Field', () => {
      it('requires tenant_id', () => {
        const data = { tenant_id: '', otp_type: 'email_verification' }
        const result = requestOtpSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Tenant ID is required')
        }
      })

      it('accepts various tenant ID formats', () => {
        const validIds = [
          'tenant-123',
          'TENANT_456',
          '12345',
          'tenant-abc-def-123',
          'uuid-1234-5678-90ab'
        ]

        validIds.forEach(id => {
          const data = { tenant_id: id, otp_type: 'all' as const }
          const result = requestOtpSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      it('defaults to empty string', () => {
        const result = requestOtpSchema.safeParse({ otp_type: 'all' })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.tenant_id).toBe('')
        }
      })
    })

    describe('otp_type Field', () => {
      it('accepts email_verification', () => {
        const data = { ...validRequestData, otp_type: 'email_verification' as const }
        const result = requestOtpSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts phone_verification', () => {
        const data = { ...validRequestData, otp_type: 'phone_verification' as const }
        const result = requestOtpSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts all', () => {
        const data = { ...validRequestData, otp_type: 'all' as const }
        const result = requestOtpSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects invalid otp_type values', () => {
        const data = { tenant_id: 'tenant-123', otp_type: 'invalid_type' }
        const result = requestOtpSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('OTP type must be either email_verification, phone_verification, or all')
        }
      })

      it('defaults to all', () => {
        const result = requestOtpSchema.safeParse({ tenant_id: 'tenant-123' })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.otp_type).toBe('all')
        }
      })
    })
  })

  describe('verifyTenantAccountSchema', () => {
    const validVerifyData = {
      tenant_id: 'tenant-123',
      otp_type: 'email_verification' as const,
      otp_code: '123456'
    }

    describe('Valid Data', () => {
      it('validates correct verification data', () => {
        const result = verifyTenantAccountSchema.safeParse(validVerifyData)
        expect(result.success).toBe(true)
      })

      it('validates with phone_verification type', () => {
        const data = { ...validVerifyData, otp_type: 'phone_verification' as const }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('applies default values', () => {
        const result = verifyTenantAccountSchema.safeParse({})
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.tenant_id).toBe('')
          expect(result.data.otp_type).toBe('email_verification')
          expect(result.data.otp_code).toBe('')
        }
      })
    })

    describe('tenant_id Field', () => {
      it('requires tenant_id', () => {
        const data = { ...validVerifyData, tenant_id: '' }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Tenant ID is required')
        }
      })

      it('defaults to empty string', () => {
        const result = verifyTenantAccountSchema.safeParse({})
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.tenant_id).toBe('')
        }
      })
    })

    describe('otp_type Field', () => {
      it('accepts email_verification', () => {
        const data = { ...validVerifyData, otp_type: 'email_verification' as const }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts phone_verification', () => {
        const data = { ...validVerifyData, otp_type: 'phone_verification' as const }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects all type (not allowed in verify schema)', () => {
        const data = { ...validVerifyData, otp_type: 'all' }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('OTP type must be either email_verification, phone_verification')
        }
      })

      it('defaults to email_verification', () => {
        const result = verifyTenantAccountSchema.safeParse({ tenant_id: 'tenant-123', otp_code: '123456' })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.otp_type).toBe('email_verification')
        }
      })
    })

    describe('otp_code Field', () => {
      it('requires exactly 6 digits', () => {
        const data = { ...validVerifyData, otp_code: '123456' }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects OTP with less than 6 digits', () => {
        const data = { ...validVerifyData, otp_code: '12345' }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('OTP must be exactly 6 digits')
        }
      })

      it('rejects OTP with more than 6 digits', () => {
        const data = { ...validVerifyData, otp_code: '1234567' }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('OTP must be exactly 6 digits')
        }
      })

      it('rejects OTP with non-numeric characters', () => {
        const data = { ...validVerifyData, otp_code: '12345a' }
        const result = verifyTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('OTP must contain only numbers')
        }
      })

      it('rejects OTP with special characters', () => {
        const invalidCodes = ['123-456', '123 456', '123.456', '123,456']

        invalidCodes.forEach(code => {
          const data = { ...validVerifyData, otp_code: code }
          const result = verifyTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(false)
        })
      })

      it('defaults to empty string', () => {
        const result = verifyTenantAccountSchema.safeParse({ tenant_id: 'tenant-123' })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.otp_code).toBe('')
        }
      })
    })
  })

  describe('emailOTPVerificationSchema', () => {
    const validEmailOTPData = {
      email_otp: '123456'
    }

    describe('Valid Data', () => {
      it('validates correct email OTP', () => {
        const result = emailOTPVerificationSchema.safeParse(validEmailOTPData)
        expect(result.success).toBe(true)
      })

      it('accepts all numeric 6-digit codes', () => {
        const validCodes = ['000000', '123456', '999999', '543210']

        validCodes.forEach(code => {
          const result = emailOTPVerificationSchema.safeParse({ email_otp: code })
          expect(result.success).toBe(true)
        })
      })
    })

    describe('email_otp Field', () => {
      it('requires exactly 6 digits', () => {
        const result = emailOTPVerificationSchema.safeParse({ email_otp: '123456' })
        expect(result.success).toBe(true)
      })

      it('rejects OTP with less than 6 digits', () => {
        const result = emailOTPVerificationSchema.safeParse({ email_otp: '12345' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email OTP must be 6 digits long')
        }
      })

      it('rejects OTP with more than 6 digits', () => {
        const result = emailOTPVerificationSchema.safeParse({ email_otp: '1234567' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email OTP must be 6 digits long')
        }
      })

      it('rejects non-numeric characters', () => {
        const result = emailOTPVerificationSchema.safeParse({ email_otp: '12345a' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email OTP must contain only numbers')
        }
      })

      it('rejects empty string', () => {
        const result = emailOTPVerificationSchema.safeParse({ email_otp: '' })
        expect(result.success).toBe(false)
      })
    })

    describe('Type Inference', () => {
      it('infers correct TypeScript type', () => {
        const data: EmailOTPVerificationData = {
          email_otp: '123456'
        }
        expect(data).toBeDefined()
      })
    })
  })

  describe('phoneOTPVerificationSchema', () => {
    const validPhoneOTPData = {
      phone_otp: '654321'
    }

    describe('Valid Data', () => {
      it('validates correct phone OTP', () => {
        const result = phoneOTPVerificationSchema.safeParse(validPhoneOTPData)
        expect(result.success).toBe(true)
      })

      it('accepts all numeric 6-digit codes', () => {
        const validCodes = ['000000', '654321', '999999', '111111']

        validCodes.forEach(code => {
          const result = phoneOTPVerificationSchema.safeParse({ phone_otp: code })
          expect(result.success).toBe(true)
        })
      })
    })

    describe('phone_otp Field', () => {
      it('requires exactly 6 digits', () => {
        const result = phoneOTPVerificationSchema.safeParse({ phone_otp: '654321' })
        expect(result.success).toBe(true)
      })

      it('rejects OTP with less than 6 digits', () => {
        const result = phoneOTPVerificationSchema.safeParse({ phone_otp: '12345' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Phone OTP must be 6 digits long')
        }
      })

      it('rejects OTP with more than 6 digits', () => {
        const result = phoneOTPVerificationSchema.safeParse({ phone_otp: '1234567' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Phone OTP must be 6 digits long')
        }
      })

      it('rejects non-numeric characters', () => {
        const result = phoneOTPVerificationSchema.safeParse({ phone_otp: 'abcdef' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Phone OTP must contain only numbers')
        }
      })

      it('rejects spaces and hyphens', () => {
        const invalidCodes = ['123 456', '123-456']

        invalidCodes.forEach(code => {
          const result = phoneOTPVerificationSchema.safeParse({ phone_otp: code })
          expect(result.success).toBe(false)
        })
      })
    })

    describe('Type Inference', () => {
      it('infers correct TypeScript type', () => {
        const data: PhoneOTPVerificationData = {
          phone_otp: '654321'
        }
        expect(data).toBeDefined()
      })
    })
  })

  describe('Schema Comparison', () => {
    it('email and phone OTP schemas have identical validation rules', () => {
      const code = '123456'

      const emailResult = emailOTPVerificationSchema.safeParse({ email_otp: code })
      const phoneResult = phoneOTPVerificationSchema.safeParse({ phone_otp: code })

      expect(emailResult.success).toBe(true)
      expect(phoneResult.success).toBe(true)
    })

    it('both reject same invalid patterns', () => {
      const invalidCode = '12345a'

      const emailResult = emailOTPVerificationSchema.safeParse({ email_otp: invalidCode })
      const phoneResult = phoneOTPVerificationSchema.safeParse({ phone_otp: invalidCode })

      expect(emailResult.success).toBe(false)
      expect(phoneResult.success).toBe(false)
    })

    it('request and verify schemas have different otp_type constraints', () => {
      const requestResult = requestOtpSchema.safeParse({
        tenant_id: 'tenant-123',
        otp_type: 'all'
      })

      const verifyResult = verifyTenantAccountSchema.safeParse({
        tenant_id: 'tenant-123',
        otp_type: 'all',
        otp_code: '123456'
      })

      expect(requestResult.success).toBe(true)
      expect(verifyResult.success).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('throws ZodError when using parse method with invalid data', () => {
      expect(() => {
        emailOTPVerificationSchema.parse({ email_otp: '12345' })
      }).toThrow(ZodError)

      expect(() => {
        phoneOTPVerificationSchema.parse({ phone_otp: 'invalid' })
      }).toThrow(ZodError)
    })

    it('returns detailed error information', () => {
      const result = verifyTenantAccountSchema.safeParse({
        tenant_id: '',
        otp_code: '123'
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
        expect(result.error.issues.some(issue => issue.path.includes('tenant_id'))).toBe(true)
        expect(result.error.issues.some(issue => issue.path.includes('otp_code'))).toBe(true)
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles leading zeros in OTP', () => {
      const result = emailOTPVerificationSchema.safeParse({ email_otp: '000123' })
      expect(result.success).toBe(true)
    })

    it('handles all zeros OTP', () => {
      const result = phoneOTPVerificationSchema.safeParse({ phone_otp: '000000' })
      expect(result.success).toBe(true)
    })

    it('handles all nines OTP', () => {
      const result = emailOTPVerificationSchema.safeParse({ email_otp: '999999' })
      expect(result.success).toBe(true)
    })
  })
})
