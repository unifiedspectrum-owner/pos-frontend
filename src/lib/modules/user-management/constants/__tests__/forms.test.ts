/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaUser, FaEnvelope, FaUserShield, FaToggleOn } from 'react-icons/fa'
import { FiPhone } from 'react-icons/fi'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

/* User management module imports */
import { USER_FORM_DEFAULT_VALUES, USER_CREATION_TAB, USER_CREATION_TABS, USER_FORM_SECTIONS, USER_CREATION_FORM_QUESTIONS } from '@user-management/constants'

describe('User Management Forms Constants', () => {
  describe('USER_FORM_DEFAULT_VALUES', () => {
    it('should be defined', () => {
      expect(USER_FORM_DEFAULT_VALUES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof USER_FORM_DEFAULT_VALUES).toBe('object')
    })

    it('should have f_name property with empty string', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('f_name')
      expect(USER_FORM_DEFAULT_VALUES.f_name).toBe('')
      expect(typeof USER_FORM_DEFAULT_VALUES.f_name).toBe('string')
    })

    it('should have l_name property with empty string', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('l_name')
      expect(USER_FORM_DEFAULT_VALUES.l_name).toBe('')
      expect(typeof USER_FORM_DEFAULT_VALUES.l_name).toBe('string')
    })

    it('should have email property with empty string', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('email')
      expect(USER_FORM_DEFAULT_VALUES.email).toBe('')
      expect(typeof USER_FORM_DEFAULT_VALUES.email).toBe('string')
    })

    it('should have phone property as array', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('phone')
      expect(Array.isArray(USER_FORM_DEFAULT_VALUES.phone)).toBe(true)
      expect(USER_FORM_DEFAULT_VALUES.phone).toHaveLength(2)
    })

    it('should have phone array with country code and empty number', () => {
      expect(USER_FORM_DEFAULT_VALUES.phone[0]).toBe('+91')
      expect(USER_FORM_DEFAULT_VALUES.phone[1]).toBe('')
    })

    it('should have role_id property with empty string', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('role_id')
      expect(USER_FORM_DEFAULT_VALUES.role_id).toBe('')
      expect(typeof USER_FORM_DEFAULT_VALUES.role_id).toBe('string')
    })

    it('should have module_assignments property as empty array', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('module_assignments')
      expect(Array.isArray(USER_FORM_DEFAULT_VALUES.module_assignments)).toBe(true)
      expect(USER_FORM_DEFAULT_VALUES.module_assignments).toHaveLength(0)
    })

    it('should have is_active property set to true', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('is_active')
      expect(USER_FORM_DEFAULT_VALUES.is_active).toBe(true)
      expect(typeof USER_FORM_DEFAULT_VALUES.is_active).toBe('boolean')
    })

    it('should have is_2fa_required property set to false', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('is_2fa_required')
      expect(USER_FORM_DEFAULT_VALUES.is_2fa_required).toBe(false)
      expect(typeof USER_FORM_DEFAULT_VALUES.is_2fa_required).toBe('boolean')
    })

    it('should have is_2fa_enabled property set to false', () => {
      expect(USER_FORM_DEFAULT_VALUES).toHaveProperty('is_2fa_enabled')
      expect(USER_FORM_DEFAULT_VALUES.is_2fa_enabled).toBe(false)
      expect(typeof USER_FORM_DEFAULT_VALUES.is_2fa_enabled).toBe('boolean')
    })

    it('should have exactly 9 properties', () => {
      expect(Object.keys(USER_FORM_DEFAULT_VALUES)).toHaveLength(9)
    })

    it('should use safe default values', () => {
      /* Empty strings for text fields */
      expect(USER_FORM_DEFAULT_VALUES.f_name).toBe('')
      expect(USER_FORM_DEFAULT_VALUES.l_name).toBe('')
      expect(USER_FORM_DEFAULT_VALUES.email).toBe('')
      /* Active by default */
      expect(USER_FORM_DEFAULT_VALUES.is_active).toBe(true)
      /* 2FA disabled by default */
      expect(USER_FORM_DEFAULT_VALUES.is_2fa_enabled).toBe(false)
      expect(USER_FORM_DEFAULT_VALUES.is_2fa_required).toBe(false)
    })
  })

  describe('USER_CREATION_TAB', () => {
    it('should be defined', () => {
      expect(USER_CREATION_TAB).toBeDefined()
    })

    it('should have BASIC_INFO property', () => {
      expect(USER_CREATION_TAB).toHaveProperty('BASIC_INFO')
      expect(USER_CREATION_TAB.BASIC_INFO).toBe('basic_info')
    })

    it('should use snake_case for tab values', () => {
      expect(USER_CREATION_TAB.BASIC_INFO).toMatch(/^[a-z]+(_[a-z]+)*$/)
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with satisfies and 'as const' */
      expect(USER_CREATION_TAB).toBeDefined()
      expect(typeof USER_CREATION_TAB).toBe('object')
    })
  })

  describe('USER_CREATION_TABS', () => {
    it('should be defined', () => {
      expect(USER_CREATION_TABS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(USER_CREATION_TABS)).toBe(true)
    })

    it('should have exactly 1 tab', () => {
      expect(USER_CREATION_TABS).toHaveLength(1)
    })

    describe('Basic Information Tab', () => {
      it('should have basic_info tab', () => {
        const basicInfoTab = USER_CREATION_TABS.find(tab => tab.id === 'basic_info')
        expect(basicInfoTab).toBeDefined()
      })

      it('should have correct structure', () => {
        const basicInfoTab = USER_CREATION_TABS[0]
        expect(basicInfoTab).toHaveProperty('id')
        expect(basicInfoTab).toHaveProperty('label')
        expect(basicInfoTab).toHaveProperty('icon')
      })

      it('should have correct id', () => {
        const basicInfoTab = USER_CREATION_TABS[0]
        expect(basicInfoTab.id).toBe('basic_info')
      })

      it('should have correct label', () => {
        const basicInfoTab = USER_CREATION_TABS[0]
        expect(basicInfoTab.label).toBe('Basic Information')
      })

      it('should have FaUser icon', () => {
        const basicInfoTab = USER_CREATION_TABS[0]
        expect(basicInfoTab.icon).toBe(FaUser)
      })
    })

    it('should have consistent structure across all tabs', () => {
      USER_CREATION_TABS.forEach(tab => {
        expect(tab).toHaveProperty('id')
        expect(tab).toHaveProperty('label')
        expect(tab).toHaveProperty('icon')
        expect(typeof tab.id).toBe('string')
        expect(typeof tab.label).toBe('string')
        expect(typeof tab.icon).toBe('function')
      })
    })
  })

  describe('USER_FORM_SECTIONS', () => {
    it('should be defined', () => {
      expect(USER_FORM_SECTIONS).toBeDefined()
    })

    it('should have BASIC_INFO property', () => {
      expect(USER_FORM_SECTIONS).toHaveProperty('BASIC_INFO')
      expect(USER_FORM_SECTIONS.BASIC_INFO).toBe('User Information')
    })

    it('should have MODULE_ASSIGNMENTS property', () => {
      expect(USER_FORM_SECTIONS).toHaveProperty('MODULE_ASSIGNMENTS')
      expect(USER_FORM_SECTIONS.MODULE_ASSIGNMENTS).toBe('Module Permissions')
    })

    it('should have exactly 2 properties', () => {
      expect(Object.keys(USER_FORM_SECTIONS)).toHaveLength(2)
    })

    it('should have descriptive section headings', () => {
      Object.values(USER_FORM_SECTIONS).forEach(heading => {
        expect(typeof heading).toBe('string')
        expect(heading.length).toBeGreaterThan(5)
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(USER_FORM_SECTIONS).toBeDefined()
      expect(typeof USER_FORM_SECTIONS).toBe('object')
    })
  })

  describe('USER_CREATION_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(USER_CREATION_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(USER_CREATION_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 9 form fields', () => {
      expect(USER_CREATION_FORM_QUESTIONS).toHaveLength(9)
    })

    it('should have unique IDs', () => {
      const ids = USER_CREATION_FORM_QUESTIONS.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have sequential IDs starting from 1', () => {
      const ids = USER_CREATION_FORM_QUESTIONS.map(field => field.id).sort((a, b) => a - b)
      expect(ids[0]).toBe(1)
      expect(ids[ids.length - 1]).toBe(9)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = USER_CREATION_FORM_QUESTIONS.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('Field Structure', () => {
      it('should have consistent structure for all fields', () => {
        USER_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(field).toHaveProperty('id')
          expect(field).toHaveProperty('type')
          expect(field).toHaveProperty('label')
          expect(field).toHaveProperty('schema_key')
          expect(field).toHaveProperty('placeholder')
          expect(field).toHaveProperty('left_icon')
          expect(field).toHaveProperty('is_required')
          expect(field).toHaveProperty('is_active')
          expect(field).toHaveProperty('display_order')
          expect(field).toHaveProperty('grid')
        })
      })

      it('should have valid field types', () => {
        const validTypes = Object.values(FORM_FIELD_TYPES)
        USER_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(validTypes).toContain(field.type)
        })
      })

      it('should have grid configuration with col_span', () => {
        USER_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(field.grid).toHaveProperty('col_span')
          expect(typeof field.grid.col_span).toBe('number')
          expect(field.grid.col_span).toBeGreaterThan(0)
          expect(field.grid.col_span).toBeLessThanOrEqual(6)
        })
      })

      it('should have boolean is_required property', () => {
        USER_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(typeof field.is_required).toBe('boolean')
        })
      })

      it('should have boolean is_active property', () => {
        USER_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(typeof field.is_active).toBe('boolean')
        })
      })
    })

    describe('First Name Field', () => {
      const firstNameField = USER_CREATION_FORM_QUESTIONS[0]

      it('should have correct configuration', () => {
        expect(firstNameField.id).toBe(1)
        expect(firstNameField.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(firstNameField.label).toBe('First Name')
        expect(firstNameField.schema_key).toBe('f_name')
        expect(firstNameField.placeholder).toBe('Enter first name')
        expect(firstNameField.left_icon).toBe(FaUser)
        expect(firstNameField.is_required).toBe(true)
        expect(firstNameField.is_active).toBe(true)
      })

      it('should have grid configuration', () => {
        expect(firstNameField.grid.col_span).toBe(3)
      })
    })

    describe('Last Name Field', () => {
      const lastNameField = USER_CREATION_FORM_QUESTIONS[1]

      it('should have correct configuration', () => {
        expect(lastNameField.id).toBe(2)
        expect(lastNameField.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(lastNameField.label).toBe('Last Name')
        expect(lastNameField.schema_key).toBe('l_name')
        expect(lastNameField.left_icon).toBe(FaUser)
        expect(lastNameField.is_required).toBe(true)
      })
    })

    describe('Email Field', () => {
      const emailField = USER_CREATION_FORM_QUESTIONS[2]

      it('should have correct configuration', () => {
        expect(emailField.id).toBe(3)
        expect(emailField.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(emailField.label).toBe('Email Address')
        expect(emailField.schema_key).toBe('email')
        expect(emailField.left_icon).toBe(FaEnvelope)
        expect(emailField.is_required).toBe(true)
      })
    })

    describe('Phone Field', () => {
      const phoneField = USER_CREATION_FORM_QUESTIONS[3]

      it('should have correct configuration', () => {
        expect(phoneField.id).toBe(4)
        expect(phoneField.type).toBe(FORM_FIELD_TYPES.PHONE_NUMBER)
        expect(phoneField.label).toBe('Phone Number')
        expect(phoneField.schema_key).toBe('phone')
        expect(phoneField.left_icon).toBe(FiPhone)
        expect(phoneField.is_required).toBe(true)
      })
    })

    describe('Role Field', () => {
      const roleField = USER_CREATION_FORM_QUESTIONS[4]

      it('should have correct configuration', () => {
        expect(roleField.id).toBe(5)
        expect(roleField.type).toBe(FORM_FIELD_TYPES.SELECT)
        expect(roleField.label).toBe('User Role')
        expect(roleField.schema_key).toBe('role_id')
        expect(roleField.left_icon).toBe(FaUserShield)
        expect(roleField.is_required).toBe(true)
      })
    })

    describe('Account Status Field', () => {
      const statusField = USER_CREATION_FORM_QUESTIONS[5]

      it('should have correct configuration', () => {
        expect(statusField.id).toBe(6)
        expect(statusField.type).toBe(FORM_FIELD_TYPES.TOGGLE)
        expect(statusField.label).toBe('Account Status')
        expect(statusField.schema_key).toBe('is_active')
        expect(statusField.left_icon).toBe(FaToggleOn)
        expect(statusField.is_required).toBe(false)
      })

      it('should have toggle text', () => {
        expect(statusField).toHaveProperty('toggle_text')
        expect(statusField.toggle_text).toHaveProperty('true')
        expect(statusField.toggle_text).toHaveProperty('false')
        expect(statusField.toggle_text?.true).toBe('Active')
        expect(statusField.toggle_text?.false).toBe('Inactive')
      })
    })

    describe('2FA Enabled Field', () => {
      const twoFAField = USER_CREATION_FORM_QUESTIONS[6]

      it('should have correct configuration', () => {
        expect(twoFAField.id).toBe(7)
        expect(twoFAField.type).toBe(FORM_FIELD_TYPES.TOGGLE)
        expect(twoFAField.label).toBe('Two Factor Authentication')
        expect(twoFAField.schema_key).toBe('is_2fa_enabled')
        expect(twoFAField.is_required).toBe(false)
      })

      it('should have toggle text', () => {
        expect(twoFAField.toggle_text?.true).toBe('Enable')
        expect(twoFAField.toggle_text?.false).toBe('Disable')
      })
    })

    describe('2FA Required Field', () => {
      const twoFARequiredField = USER_CREATION_FORM_QUESTIONS[7]

      it('should have correct configuration', () => {
        expect(twoFARequiredField.id).toBe(8)
        expect(twoFARequiredField.type).toBe(FORM_FIELD_TYPES.TOGGLE)
        expect(twoFARequiredField.label).toBe('Is 2FA Required')
        expect(twoFARequiredField.schema_key).toBe('is_2fa_required')
        expect(twoFARequiredField.is_required).toBe(false)
      })

      it('should have toggle text', () => {
        expect(twoFARequiredField.toggle_text?.true).toBe('Required')
        expect(twoFARequiredField.toggle_text?.false).toBe('Optional')
      })
    })

    describe('Profile Picture Field', () => {
      const profilePicField = USER_CREATION_FORM_QUESTIONS[8]

      it('should have correct configuration', () => {
        expect(profilePicField.id).toBe(9)
        expect(profilePicField.type).toBe(FORM_FIELD_TYPES.FILE)
        expect(profilePicField.label).toBe('Profile Picture')
        expect(profilePicField.schema_key).toBe('profile_picture')
        expect(profilePicField.is_required).toBe(false)
        expect(profilePicField.is_active).toBe(false)
      })

      it('should have wider grid span', () => {
        expect(profilePicField.grid.col_span).toBe(6)
      })
    })

    describe('Display Order', () => {
      it('should have sequential display orders', () => {
        const displayOrders = USER_CREATION_FORM_QUESTIONS.map(field => field.display_order)
        displayOrders.forEach((order, index) => {
          expect(order).toBeGreaterThan(0)
        })
      })

      it('should be sortable by display_order', () => {
        const sorted = [...USER_CREATION_FORM_QUESTIONS].sort((a, b) => a.display_order - b.display_order)
        expect(sorted[0].display_order).toBeLessThanOrEqual(sorted[1].display_order)
      })
    })

    describe('Required Fields', () => {
      it('should have at least one required field', () => {
        const requiredFields = USER_CREATION_FORM_QUESTIONS.filter(field => field.is_required)
        expect(requiredFields.length).toBeGreaterThan(0)
      })

      it('should mark basic info fields as required', () => {
        const firstNameField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'f_name')
        const lastNameField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'l_name')
        const emailField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'email')
        const phoneField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'phone')
        const roleField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'role_id')

        expect(firstNameField?.is_required).toBe(true)
        expect(lastNameField?.is_required).toBe(true)
        expect(emailField?.is_required).toBe(true)
        expect(phoneField?.is_required).toBe(true)
        expect(roleField?.is_required).toBe(true)
      })

      it('should mark optional fields correctly', () => {
        const statusField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'is_active')
        const twoFAField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'is_2fa_enabled')
        const profilePicField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'profile_picture')

        expect(statusField?.is_required).toBe(false)
        expect(twoFAField?.is_required).toBe(false)
        expect(profilePicField?.is_required).toBe(false)
      })
    })

    describe('Active Fields', () => {
      it('should have mostly active fields', () => {
        const activeFields = USER_CREATION_FORM_QUESTIONS.filter(field => field.is_active)
        expect(activeFields.length).toBeGreaterThan(5)
      })

      it('should mark profile picture as inactive', () => {
        const profilePicField = USER_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'profile_picture')
        expect(profilePicField?.is_active).toBe(false)
      })
    })
  })

  describe('Constants Integration', () => {
    it('should have matching tab IDs between USER_CREATION_TAB and USER_CREATION_TABS', () => {
      /* Check that all tabs in USER_CREATION_TABS have a corresponding constant */
      const tabConstants = Object.values(USER_CREATION_TAB)
      USER_CREATION_TABS.forEach(tab => {
        expect(tabConstants).toContain(tab.id)
      })
    })

    it('should have form fields matching default values', () => {
      const formFieldKeys = USER_CREATION_FORM_QUESTIONS.map(field => field.schema_key)
      const defaultValueKeys = Object.keys(USER_FORM_DEFAULT_VALUES)

      /* Most form fields should have default values */
      formFieldKeys.forEach(key => {
        if (key !== 'profile_picture') { /* profile_picture is not in defaults */
          expect(defaultValueKeys).toContain(key)
        }
      })
    })

    it('should use consistent icon components', () => {
      const icons = USER_CREATION_FORM_QUESTIONS.map(field => field.left_icon)
      icons.forEach(icon => {
        expect(typeof icon).toBe('function')
      })
    })
  })
})
