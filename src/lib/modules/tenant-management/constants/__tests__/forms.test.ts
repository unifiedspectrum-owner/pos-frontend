/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Tenant management module imports */
import { TENANT_FORM_SECTIONS, TENANT_BASIC_INFO_QUESTIONS, CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES, TENANT_SUSPENSION_QUESTIONS, TENANT_HOLD_QUESTIONS, TENANT_ACTIVATION_QUESTIONS, VERIFICATION_CONFIGS } from '../forms'

describe('Forms Constants', () => {
  describe('TENANT_FORM_SECTIONS', () => {
    it('has BASIC_INFO section', () => {
      expect(TENANT_FORM_SECTIONS.BASIC_INFO).toBe('Contact Information')
    })

    it('has ADDRESS_INFO section', () => {
      expect(TENANT_FORM_SECTIONS.ADDRESS_INFO).toBe('Business Address')
    })

    it('has exactly 2 sections', () => {
      const keys = Object.keys(TENANT_FORM_SECTIONS)
      expect(keys).toHaveLength(2)
    })
  })

  describe('TENANT_BASIC_INFO_QUESTIONS', () => {
    it('has 2 sections', () => {
      expect(TENANT_BASIC_INFO_QUESTIONS).toHaveLength(2)
    })

    it('first section is Contact Information', () => {
      expect(TENANT_BASIC_INFO_QUESTIONS[0].section_heading).toBe('Contact Information')
    })

    it('second section is Business Address', () => {
      expect(TENANT_BASIC_INFO_QUESTIONS[1].section_heading).toBe('Business Address')
    })

    it('Contact Information section has 7 fields', () => {
      expect(TENANT_BASIC_INFO_QUESTIONS[0].section_values).toHaveLength(7)
    })

    it('Business Address section has 5 fields', () => {
      expect(TENANT_BASIC_INFO_QUESTIONS[1].section_values).toHaveLength(5)
    })

    it('total of 12 form fields', () => {
      const totalFields = TENANT_BASIC_INFO_QUESTIONS.reduce((sum, section) => sum + section.section_values.length, 0)
      expect(totalFields).toBe(12)
    })

    describe('Contact Information Fields', () => {
      const contactFields = TENANT_BASIC_INFO_QUESTIONS[0].section_values

      it('has company_name field', () => {
        const field = contactFields.find(f => f.schema_key === 'company_name')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Company Name')
        expect(field?.is_required).toBe(true)
        expect(field?.is_active).toBe(true)
      })

      it('has contact_person field', () => {
        const field = contactFields.find(f => f.schema_key === 'contact_person')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Contact Person')
        expect(field?.is_required).toBe(true)
        expect(field?.is_active).toBe(true)
      })

      it('has country field', () => {
        const field = contactFields.find(f => f.schema_key === 'country')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Country')
        expect(field?.type).toBe('COMBOBOX')
        expect(field?.is_required).toBe(true)
      })

      it('has primary_email field', () => {
        const field = contactFields.find(f => f.schema_key === 'primary_email')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Email Address')
        expect(field?.type).toBe('INPUT_WITH_BUTTON')
        expect(field?.is_required).toBe(true)
      })

      it('has secondary_email field', () => {
        const field = contactFields.find(f => f.schema_key === 'secondary_email')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Secondary Email Address')
        expect(field?.is_required).toBe(false)
        expect(field?.is_active).toBe(false)
      })

      it('has primary_phone field', () => {
        const field = contactFields.find(f => f.schema_key === 'primary_phone')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Phone Number')
        expect(field?.type).toBe('PHONE_NUMBER')
        expect(field?.is_required).toBe(true)
      })

      it('has secondary_phone field', () => {
        const field = contactFields.find(f => f.schema_key === 'secondary_phone')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Secondary Phone Number')
        expect(field?.is_required).toBe(false)
        expect(field?.is_active).toBe(false)
      })

      it('all fields have required properties', () => {
        contactFields.forEach(field => {
          expect(field).toHaveProperty('id')
          expect(field).toHaveProperty('type')
          expect(field).toHaveProperty('label')
          expect(field).toHaveProperty('schema_key')
          expect(field).toHaveProperty('placeholder')
          expect(field).toHaveProperty('is_required')
          expect(field).toHaveProperty('is_active')
          expect(field).toHaveProperty('display_order')
          expect(field).toHaveProperty('grid')
        })
      })

      it('fields are ordered by display_order', () => {
        for (let i = 1; i < contactFields.length; i++) {
          expect(contactFields[i].display_order).toBeGreaterThan(contactFields[i - 1].display_order)
        }
      })
    })

    describe('Business Address Fields', () => {
      const addressFields = TENANT_BASIC_INFO_QUESTIONS[1].section_values

      it('has address_line1 field', () => {
        const field = addressFields.find(f => f.schema_key === 'address_line1')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Address Line 1')
        expect(field?.type).toBe('TEXTAREA')
        expect(field?.is_required).toBe(true)
      })

      it('has address_line2 field', () => {
        const field = addressFields.find(f => f.schema_key === 'address_line2')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Address Line 2')
        expect(field?.is_required).toBe(false)
      })

      it('has city field', () => {
        const field = addressFields.find(f => f.schema_key === 'city')
        expect(field).toBeDefined()
        expect(field?.label).toBe('City')
        expect(field?.is_required).toBe(true)
      })

      it('has state_province field', () => {
        const field = addressFields.find(f => f.schema_key === 'state_province')
        expect(field).toBeDefined()
        expect(field?.label).toBe('State/Province')
        expect(field?.type).toBe('COMBOBOX')
        expect(field?.is_required).toBe(true)
      })

      it('has postal_code field', () => {
        const field = addressFields.find(f => f.schema_key === 'postal_code')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Postal Code')
        expect(field?.is_required).toBe(true)
      })

      it('all fields have required properties', () => {
        addressFields.forEach(field => {
          expect(field).toHaveProperty('id')
          expect(field).toHaveProperty('type')
          expect(field).toHaveProperty('label')
          expect(field).toHaveProperty('schema_key')
          expect(field).toHaveProperty('is_required')
          expect(field).toHaveProperty('is_active')
          expect(field).toHaveProperty('display_order')
          expect(field).toHaveProperty('grid')
        })
      })

      it('fields are ordered by display_order', () => {
        for (let i = 1; i < addressFields.length; i++) {
          expect(addressFields[i].display_order).toBeGreaterThan(addressFields[i - 1].display_order)
        }
      })
    })
  })

  describe('CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES', () => {
    it('has company_name as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.company_name).toBe('')
    })

    it('has contact_person as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.contact_person).toBe('')
    })

    it('has primary_email as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.primary_email).toBe('')
    })

    it('has primary_phone as array with two empty strings', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.primary_phone).toEqual(['', ''])
    })

    it('has address_line1 as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.address_line1).toBe('')
    })

    it('has address_line2 as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.address_line2).toBe('')
    })

    it('has city as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.city).toBe('')
    })

    it('has state_province as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.state_province).toBe('')
    })

    it('has postal_code as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.postal_code).toBe('')
    })

    it('has country as empty string', () => {
      expect(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES.country).toBe('')
    })

    it('has all 10 required fields', () => {
      const keys = Object.keys(CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES)
      expect(keys).toHaveLength(10)
    })
  })

  describe('TENANT_SUSPENSION_QUESTIONS', () => {
    it('has 2 fields', () => {
      expect(TENANT_SUSPENSION_QUESTIONS).toHaveLength(2)
    })

    it('has reason field', () => {
      const field = TENANT_SUSPENSION_QUESTIONS.find(f => f.schema_key === 'reason')
      expect(field).toBeDefined()
      expect(field?.label).toBe('Suspension Reason')
      expect(field?.type).toBe('TEXTAREA')
      expect(field?.is_required).toBe(true)
    })

    it('has suspend_until field', () => {
      const field = TENANT_SUSPENSION_QUESTIONS.find(f => f.schema_key === 'suspend_until')
      expect(field).toBeDefined()
      expect(field?.label).toBe('Suspend Until (Optional)')
      expect(field?.type).toBe('DATE')
      expect(field?.is_required).toBe(false)
    })

    it('all fields have required properties', () => {
      TENANT_SUSPENSION_QUESTIONS.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('type')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('schema_key')
        expect(field).toHaveProperty('is_required')
        expect(field).toHaveProperty('is_active')
        expect(field).toHaveProperty('display_order')
        expect(field).toHaveProperty('grid')
      })
    })
  })

  describe('TENANT_HOLD_QUESTIONS', () => {
    it('has 2 fields', () => {
      expect(TENANT_HOLD_QUESTIONS).toHaveLength(2)
    })

    it('has reason field', () => {
      const field = TENANT_HOLD_QUESTIONS.find(f => f.schema_key === 'reason')
      expect(field).toBeDefined()
      expect(field?.label).toBe('Hold Reason')
      expect(field?.type).toBe('TEXTAREA')
      expect(field?.is_required).toBe(true)
    })

    it('has hold_until field', () => {
      const field = TENANT_HOLD_QUESTIONS.find(f => f.schema_key === 'hold_until')
      expect(field).toBeDefined()
      expect(field?.label).toBe('Hold Until (Optional)')
      expect(field?.type).toBe('DATE')
      expect(field?.is_required).toBe(false)
    })

    it('all fields have required properties', () => {
      TENANT_HOLD_QUESTIONS.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('type')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('schema_key')
        expect(field).toHaveProperty('is_required')
        expect(field).toHaveProperty('is_active')
        expect(field).toHaveProperty('display_order')
        expect(field).toHaveProperty('grid')
      })
    })
  })

  describe('TENANT_ACTIVATION_QUESTIONS', () => {
    it('has 1 field', () => {
      expect(TENANT_ACTIVATION_QUESTIONS).toHaveLength(1)
    })

    it('has reason field', () => {
      const field = TENANT_ACTIVATION_QUESTIONS[0]
      expect(field.schema_key).toBe('reason')
      expect(field.label).toBe('Activation Reason')
      expect(field.type).toBe('TEXTAREA')
      expect(field.is_required).toBe(true)
      expect(field.is_active).toBe(true)
    })

    it('reason field has all required properties', () => {
      const field = TENANT_ACTIVATION_QUESTIONS[0]
      expect(field).toHaveProperty('id')
      expect(field).toHaveProperty('type')
      expect(field).toHaveProperty('label')
      expect(field).toHaveProperty('schema_key')
      expect(field).toHaveProperty('is_required')
      expect(field).toHaveProperty('is_active')
      expect(field).toHaveProperty('display_order')
      expect(field).toHaveProperty('grid')
    })
  })

  describe('VERIFICATION_CONFIGS', () => {
    it('has email configuration', () => {
      expect(VERIFICATION_CONFIGS).toHaveProperty('email')
    })

    it('has phone configuration', () => {
      expect(VERIFICATION_CONFIGS).toHaveProperty('phone')
    })

    it('has exactly 2 verification types', () => {
      const keys = Object.keys(VERIFICATION_CONFIGS)
      expect(keys).toHaveLength(2)
    })

    describe('Email Configuration', () => {
      const emailConfig = VERIFICATION_CONFIGS.email

      it('has correct type', () => {
        expect(emailConfig.type).toBe('email_verification')
      })

      it('has correct stepType', () => {
        expect(emailConfig.stepType).toBe('EMAIL_VERIFICATION')
      })

      it('has correct verifyButtonText', () => {
        expect(emailConfig.verifyButtonText).toBe('Verify Email OTP')
      })

      it('has correct resendDescriptionText', () => {
        expect(emailConfig.resendDescriptionText).toBe('A new OTP has been sent to your email address.')
      })

      it('has correct successMessage', () => {
        expect(emailConfig.successMessage).toBe('Email')
      })

      it('has correct verificationKey', () => {
        expect(emailConfig.verificationKey).toBe('email_otp')
      })
    })

    describe('Phone Configuration', () => {
      const phoneConfig = VERIFICATION_CONFIGS.phone

      it('has correct type', () => {
        expect(phoneConfig.type).toBe('phone_verification')
      })

      it('has correct stepType', () => {
        expect(phoneConfig.stepType).toBe('PHONE_VERIFICATION')
      })

      it('has correct verifyButtonText', () => {
        expect(phoneConfig.verifyButtonText).toBe('Verify Phone OTP')
      })

      it('has correct resendDescriptionText', () => {
        expect(phoneConfig.resendDescriptionText).toBe('A new OTP has been sent to your phone number.')
      })

      it('has correct successMessage', () => {
        expect(phoneConfig.successMessage).toBe('Phone')
      })

      it('has correct verificationKey', () => {
        expect(phoneConfig.verificationKey).toBe('phone_otp')
      })
    })
  })
})
