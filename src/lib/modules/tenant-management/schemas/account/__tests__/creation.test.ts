/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod/v4'

/* Tenant management module imports */
import { createTenantAccountSchema, type TenantInfoFormData } from '../creation'

describe('Tenant Account Creation Schema', () => {
  describe('createTenantAccountSchema', () => {
    const validData = {
      company_name: 'Test Company',
      contact_person: 'John Doe',
      primary_email: 'test@example.com',
      primary_phone: ['+1', '1234567890'],
      address_line1: '123 Main St',
      address_line2: null,
      city: 'New York',
      state_province: 'NY',
      postal_code: '10001',
      country: 'United States'
    }

    describe('Valid Data', () => {
      it('validates correct tenant account data', () => {
        const result = createTenantAccountSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('validates data with optional OTPs', () => {
        const dataWithOtps = {
          ...validData,
          email_otp: '123456',
          phone_otp: '654321'
        }
        const result = createTenantAccountSchema.safeParse(dataWithOtps)
        expect(result.success).toBe(true)
      })

      it('validates data without address_line2', () => {
        const result = createTenantAccountSchema.safeParse(validData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.address_line2).toBeNull()
        }
      })

      it('validates data with address_line2', () => {
        const dataWithAddress2 = {
          ...validData,
          address_line2: 'Apartment 4B'
        }
        const result = createTenantAccountSchema.safeParse(dataWithAddress2)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.address_line2).toBe('Apartment 4B')
        }
      })
    })

    describe('company_name Field', () => {
      it('requires company name', () => {
        const data = { ...validData, company_name: '' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Company name is required')
        }
      })

      it('rejects company name exceeding 200 characters', () => {
        const data = { ...validData, company_name: 'a'.repeat(201) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts company name at max length', () => {
        const data = { ...validData, company_name: 'a'.repeat(200) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('contact_person Field', () => {
      it('requires contact person name', () => {
        const data = { ...validData, contact_person: '' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Contact Person name is required')
        }
      })

      it('rejects contact person name exceeding 200 characters', () => {
        const data = { ...validData, contact_person: 'a'.repeat(201) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts contact person name at max length', () => {
        const data = { ...validData, contact_person: 'a'.repeat(200) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('primary_email Field', () => {
      it('requires valid email format', () => {
        const data = { ...validData, primary_email: 'invalid-email' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Valid email address is required')
        }
      })

      it('accepts valid email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'test+tag@example.com',
          'test_user@example-domain.com'
        ]

        validEmails.forEach(email => {
          const data = { ...validData, primary_email: email }
          const result = createTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      it('rejects invalid email formats', () => {
        const invalidEmails = [
          'plaintext',
          '@example.com',
          'user@',
          'user @example.com',
          'user@domain',
          ''
        ]

        invalidEmails.forEach(email => {
          const data = { ...validData, primary_email: email }
          const result = createTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(false)
        })
      })
    })

    describe('email_otp Field', () => {
      it('accepts valid 6-digit email OTP', () => {
        const data = { ...validData, email_otp: '123456' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('is optional and can be omitted', () => {
        const result = createTenantAccountSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('rejects email OTP with less than 6 digits', () => {
        const data = { ...validData, email_otp: '12345' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email OTP must be 6 digits long')
        }
      })

      it('rejects email OTP with more than 6 digits', () => {
        const data = { ...validData, email_otp: '1234567' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email OTP must be 6 digits long')
        }
      })

      it('rejects email OTP with non-numeric characters', () => {
        const data = { ...validData, email_otp: '12345a' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email OTP must contain only numbers')
        }
      })

      it('rejects email OTP with special characters', () => {
        const data = { ...validData, email_otp: '123-45' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    describe('phone_otp Field', () => {
      it('accepts valid 6-digit phone OTP', () => {
        const data = { ...validData, phone_otp: '654321' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('is optional and can be omitted', () => {
        const result = createTenantAccountSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('rejects phone OTP with less than 6 digits', () => {
        const data = { ...validData, phone_otp: '12345' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Phone OTP must be 6 digits long')
        }
      })

      it('rejects phone OTP with more than 6 digits', () => {
        const data = { ...validData, phone_otp: '1234567' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Phone OTP must be 6 digits long')
        }
      })

      it('rejects phone OTP with non-numeric characters', () => {
        const data = { ...validData, phone_otp: '12345b' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Phone OTP must contain only numbers')
        }
      })
    })

    describe('address_line1 Field', () => {
      it('requires address line 1', () => {
        const data = { ...validData, address_line1: '' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Address line 1 is required')
        }
      })

      it('rejects address exceeding 200 characters', () => {
        const data = { ...validData, address_line1: 'a'.repeat(201) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts address at max length', () => {
        const data = { ...validData, address_line1: 'a'.repeat(200) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('address_line2 Field', () => {
      it('accepts null value', () => {
        const data = { ...validData, address_line2: null }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts empty string', () => {
        const data = { ...validData, address_line2: '' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects address exceeding 200 characters', () => {
        const data = { ...validData, address_line2: 'a'.repeat(201) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts address at max length', () => {
        const data = { ...validData, address_line2: 'a'.repeat(200) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('city Field', () => {
      it('requires city', () => {
        const data = { ...validData, city: '' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('City is required')
        }
      })

      it('rejects city exceeding 100 characters', () => {
        const data = { ...validData, city: 'a'.repeat(101) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts city at max length', () => {
        const data = { ...validData, city: 'a'.repeat(100) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('state_province Field', () => {
      it('requires state/province', () => {
        const data = { ...validData, state_province: '' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('State/Province is required')
        }
      })

      it('rejects state exceeding 100 characters', () => {
        const data = { ...validData, state_province: 'a'.repeat(101) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts state at max length', () => {
        const data = { ...validData, state_province: 'a'.repeat(100) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('postal_code Field', () => {
      it('requires postal code', () => {
        const data = { ...validData, postal_code: '' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Postal code is required')
        }
      })

      it('rejects postal code exceeding 20 characters', () => {
        const data = { ...validData, postal_code: 'a'.repeat(21) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts postal code at max length', () => {
        const data = { ...validData, postal_code: 'a'.repeat(20) }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts various postal code formats', () => {
        const validCodes = ['10001', 'SW1A 1AA', 'K1A 0B1', '12345-6789']

        validCodes.forEach(code => {
          const data = { ...validData, postal_code: code }
          const result = createTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('country Field', () => {
      it('requires country', () => {
        const data = { ...validData, country: '' }
        const result = createTenantAccountSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Country is required')
        }
      })

      it('accepts country names', () => {
        const countries = ['United States', 'Canada', 'United Kingdom', 'Australia']

        countries.forEach(country => {
          const data = { ...validData, country }
          const result = createTenantAccountSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('Type Inference', () => {
      it('infers correct TypeScript type', () => {
        const data: TenantInfoFormData = {
          company_name: 'Test',
          contact_person: 'John',
          primary_email: 'test@test.com',
          primary_phone: ['+1', '1234567890'],
          address_line1: '123 Main',
          address_line2: null,
          city: 'NYC',
          state_province: 'NY',
          postal_code: '10001',
          country: 'US'
        }

        expect(data).toBeDefined()
      })
    })

    describe('Error Handling', () => {
      it('returns multiple errors for invalid data', () => {
        const invalidData = {
          company_name: '',
          contact_person: '',
          primary_email: 'invalid',
          primary_phone: ['+1', '123'],
          address_line1: '',
          city: '',
          state_province: '',
          postal_code: '',
          country: ''
        }

        const result = createTenantAccountSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(1)
        }
      })

      it('throws ZodError when using parse method with invalid data', () => {
        const invalidData = { ...validData, primary_email: 'invalid' }

        expect(() => {
          createTenantAccountSchema.parse(invalidData)
        }).toThrow(ZodError)
      })
    })
  })
})
