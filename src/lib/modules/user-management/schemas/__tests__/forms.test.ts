/* Comprehensive test suite for user management form validation schemas */

/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod/v4'

/* User management module imports */
import { createUserSchema, updateUserSchema, type CreateUserFormData, type UpdateUserFormData } from '@user-management/schemas/forms'

describe('User Management Form Schemas', () => {
  describe('createUserSchema', () => {
    const validUserData = {
      f_name: 'John',
      l_name: 'Doe',
      email: 'john.doe@example.com',
      phone: ['+1', '1234567890'] as [string, string],
      role_id: '1',
      is_2fa_required: false,
      is_active: true
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(createUserSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(createUserSchema.parse).toBeDefined()
        expect(createUserSchema.safeParse).toBeDefined()
        expect(typeof createUserSchema.parse).toBe('function')
        expect(typeof createUserSchema.safeParse).toBe('function')
      })

      it('should validate data with all required fields', () => {
        const result = createUserSchema.safeParse(validUserData)
        expect(result.success).toBe(true)
      })
    })

    describe('f_name Field Validation', () => {
      it('should accept valid first name', () => {
        const result = createUserSchema.safeParse(validUserData)
        expect(result.success).toBe(true)
      })

      it('should reject empty first name', () => {
        const data = { ...validUserData, f_name: '' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('First name is required')
        }
      })

      it('should reject first name exceeding 100 characters', () => {
        const data = { ...validUserData, f_name: 'a'.repeat(101) }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('First name cannot exceed 100 characters')
        }
      })

      it('should accept first name with exactly 100 characters', () => {
        const data = { ...validUserData, f_name: 'a'.repeat(100) }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject first name with invalid characters', () => {
        const data = { ...validUserData, f_name: 'John123' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('First name contains invalid characters')
        }
      })

      it('should accept first name with spaces', () => {
        const data = { ...validUserData, f_name: 'John Paul' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept first name with hyphens', () => {
        const data = { ...validUserData, f_name: 'Mary-Jane' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject first name with special characters', () => {
        const data = { ...validUserData, f_name: 'John@Doe' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('l_name Field Validation', () => {
      it('should accept valid last name', () => {
        const result = createUserSchema.safeParse(validUserData)
        expect(result.success).toBe(true)
      })

      it('should reject empty last name', () => {
        const data = { ...validUserData, l_name: '' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Last name is required')
        }
      })

      it('should reject last name exceeding 100 characters', () => {
        const data = { ...validUserData, l_name: 'a'.repeat(101) }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Last name cannot exceed 100 characters')
        }
      })

      it('should accept last name with exactly 100 characters', () => {
        const data = { ...validUserData, l_name: 'a'.repeat(100) }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject last name with invalid characters', () => {
        const data = { ...validUserData, l_name: 'Doe123' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Last name contains invalid characters')
        }
      })

      it('should accept last name with spaces', () => {
        const data = { ...validUserData, l_name: 'Van Der Berg' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept last name with apostrophes', () => {
        const data = { ...validUserData, l_name: "O'Brien" }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('email Field Validation', () => {
      it('should accept valid email', () => {
        const result = createUserSchema.safeParse(validUserData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid email format', () => {
        const data = { ...validUserData, email: 'invalid-email' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid email format')
        }
      })

      it('should reject email without @ symbol', () => {
        const data = { ...validUserData, email: 'johndoe.com' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject email without domain', () => {
        const data = { ...validUserData, email: 'john@' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject email exceeding 255 characters', () => {
        const longEmail = 'a'.repeat(250) + '@test.com'
        const data = { ...validUserData, email: longEmail }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email cannot exceed 255 characters')
        }
      })

      it('should convert email to lowercase', () => {
        const data = { ...validUserData, email: 'JOHN.DOE@EXAMPLE.COM' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.email).toBe('john.doe@example.com')
        }
      })

      it('should accept email with subdomain', () => {
        const data = { ...validUserData, email: 'john@mail.example.com' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept email with plus sign', () => {
        const data = { ...validUserData, email: 'john+test@example.com' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept email with dots', () => {
        const data = { ...validUserData, email: 'john.doe.smith@example.com' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('phone Field Validation', () => {
      it('should accept valid phone number tuple', () => {
        const result = createUserSchema.safeParse(validUserData)
        expect(result.success).toBe(true)
      })

      it('should validate phone number using PhoneNumberSchema', () => {
        const data = { ...validUserData, phone: ['+1', '1234567890'] as [string, string] }
        const result = createUserSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('role_id Field Validation', () => {
      it('should accept valid role_id', () => {
        const result = createUserSchema.safeParse(validUserData)
        expect(result.success).toBe(true)
      })

      it('should reject empty role_id', () => {
        const data = { ...validUserData, role_id: '' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Role selection is required')
        }
      })

      it('should accept numeric string role_id', () => {
        const data = { ...validUserData, role_id: '123' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept alphanumeric role_id', () => {
        const data = { ...validUserData, role_id: 'role-abc-123' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('is_2fa_required Field Validation', () => {
      it('should accept true value', () => {
        const data = { ...validUserData, is_2fa_required: true }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept false value', () => {
        const data = { ...validUserData, is_2fa_required: false }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject non-boolean value', () => {
        const data = { ...validUserData, is_2fa_required: 'true' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject null value', () => {
        const data = { ...validUserData, is_2fa_required: null }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('is_2fa_enabled Field Validation', () => {
      it('should accept true value', () => {
        const data = { ...validUserData, is_2fa_enabled: true }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept false value', () => {
        const data = { ...validUserData, is_2fa_enabled: false }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined value (optional field)', () => {
        const data = { ...validUserData }
        delete (data as Record<string, unknown>).is_2fa_enabled
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should allow omitting is_2fa_enabled field', () => {
        const dataWithoutField = {
          f_name: 'John',
          l_name: 'Doe',
          email: 'john@example.com',
          phone: ['+1', '1234567890'] as [string, string],
          role_id: '1',
          is_2fa_required: false,
          is_active: true
        }
        const result = createUserSchema.safeParse(dataWithoutField)
        expect(result.success).toBe(true)
      })
    })

    describe('module_assignments Field Validation', () => {
      it('should accept valid module assignments array', () => {
        const data = {
          ...validUserData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept empty module assignments array', () => {
        const data = { ...validUserData, module_assignments: [] }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined module assignments (optional field)', () => {
        const data = { ...validUserData }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject module assignment with empty module_id', () => {
        const data = {
          ...validUserData,
          module_assignments: [
            {
              module_id: '',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Module ID is required')
        }
      })

      it('should reject module assignment with non-boolean permissions', () => {
        const data = {
          ...validUserData,
          module_assignments: [
            {
              module_id: '1',
              can_create: 'true',
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept multiple module assignments', () => {
        const data = {
          ...validUserData,
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false },
            { module_id: '2', can_create: false, can_read: true, can_update: true, can_delete: false }
          ]
        }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject module assignment missing required fields', () => {
        const data = {
          ...validUserData,
          module_assignments: [
            { module_id: '1', can_create: true }
          ]
        }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should allow omitting module_assignments field', () => {
        const dataWithoutField = {
          f_name: 'John',
          l_name: 'Doe',
          email: 'john@example.com',
          phone: ['+1', '1234567890'] as [string, string],
          role_id: '1',
          is_2fa_required: false,
          is_active: true
        }
        const result = createUserSchema.safeParse(dataWithoutField)
        expect(result.success).toBe(true)
      })
    })

    describe('is_active Field Validation', () => {
      it('should accept true value', () => {
        const data = { ...validUserData, is_active: true }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept false value', () => {
        const data = { ...validUserData, is_active: false }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject non-boolean value', () => {
        const data = { ...validUserData, is_active: 1 }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject string value', () => {
        const data = { ...validUserData, is_active: 'true' }
        const result = createUserSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Complete Validation Scenarios', () => {
      it('should validate complete user data successfully', () => {
        const completeData = {
          f_name: 'Jane',
          l_name: 'Smith',
          email: 'jane.smith@company.com',
          phone: ['+44', '7700900000'] as [string, string],
          role_id: '2',
          is_2fa_required: true,
          is_2fa_enabled: false,
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: true, can_delete: false }
          ],
          is_active: true
        }

        const result = createUserSchema.safeParse(completeData)
        expect(result.success).toBe(true)
      })

      it('should validate minimal required data successfully', () => {
        const minimalData = {
          f_name: 'John',
          l_name: 'Doe',
          email: 'john@example.com',
          phone: ['+1', '1234567890'] as [string, string],
          role_id: '1',
          is_2fa_required: false,
          is_active: true
        }

        const result = createUserSchema.safeParse(minimalData)
        expect(result.success).toBe(true)
      })

      it('should reject data missing required fields', () => {
        const incompleteData = {
          f_name: 'John',
          email: 'john@example.com'
        }

        const result = createUserSchema.safeParse(incompleteData)
        expect(result.success).toBe(false)
      })

      it('should accumulate multiple validation errors', () => {
        const invalidData = {
          f_name: '',
          l_name: 'a'.repeat(101),
          email: 'invalid-email',
          phone: ['+1', '123'],
          role_id: '',
          is_2fa_required: 'false',
          is_active: 'yes'
        }

        const result = createUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(1)
        }
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: CreateUserFormData = {
          f_name: 'John',
          l_name: 'Doe',
          email: 'john@example.com',
          phone: ['+1', '1234567890'],
          role_id: '1',
          is_2fa_required: false,
          is_active: true
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('updateUserSchema', () => {
    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(updateUserSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(updateUserSchema.parse).toBeDefined()
        expect(updateUserSchema.safeParse).toBeDefined()
        expect(typeof updateUserSchema.parse).toBe('function')
        expect(typeof updateUserSchema.safeParse).toBe('function')
      })

      it('should allow partial updates', () => {
        const partialData = { f_name: 'Jane' }
        const result = updateUserSchema.safeParse(partialData)
        expect(result.success).toBe(true)
      })
    })

    describe('Partial Fields Validation', () => {
      it('should accept update with only f_name', () => {
        const data = { f_name: 'Jane' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only l_name', () => {
        const data = { l_name: 'Smith' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only email', () => {
        const data = { email: 'newemail@example.com' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only phone', () => {
        const data = { phone: ['+1', '9876543210'] as [string, string] }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only role_id', () => {
        const data = { role_id: '3' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only is_2fa_required', () => {
        const data = { is_2fa_required: true }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only is_active', () => {
        const data = { is_active: false }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only module_assignments', () => {
        const data = {
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false }
          ]
        }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with multiple fields', () => {
        const data = {
          f_name: 'Jane',
          l_name: 'Smith',
          email: 'jane.smith@example.com'
        }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Empty Object Validation', () => {
      it('should reject empty update object', () => {
        const data = {}
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('At least one field must be provided for update')
        }
      })
    })

    describe('Field Validation Rules', () => {
      it('should apply same validation rules as createUserSchema for f_name', () => {
        const data = { f_name: '' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('First name is required')
        }
      })

      it('should apply same validation rules as createUserSchema for email', () => {
        const data = { email: 'invalid-email' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid email format')
        }
      })

      it('should apply same validation rules as createUserSchema for role_id', () => {
        const data = { role_id: '' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Role selection is required')
        }
      })

      it('should convert email to lowercase', () => {
        const data = { email: 'UPDATED@EXAMPLE.COM' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.email).toBe('updated@example.com')
        }
      })
    })

    describe('Optional Fields Handling', () => {
      it('should allow all fields to be optional', () => {
        const data = { f_name: 'John' }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.l_name).toBeUndefined()
          expect(result.data.email).toBeUndefined()
        }
      })

      it('should allow updating with undefined is_2fa_enabled', () => {
        const data = { f_name: 'John', is_2fa_enabled: undefined }
        const result = updateUserSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Complete Update Scenarios', () => {
      it('should validate complete user update successfully', () => {
        const updateData = {
          f_name: 'Updated',
          l_name: 'Name',
          email: 'updated@example.com',
          phone: ['+44', '7700900000'] as [string, string],
          role_id: '2',
          is_2fa_required: true,
          is_active: false
        }

        const result = updateUserSchema.safeParse(updateData)
        expect(result.success).toBe(true)
      })

      it('should validate partial user update successfully', () => {
        const updateData = {
          email: 'partial.update@example.com',
          is_active: false
        }

        const result = updateUserSchema.safeParse(updateData)
        expect(result.success).toBe(true)
      })

      it('should reject update with invalid field values', () => {
        const updateData = {
          f_name: '',
          email: 'invalid'
        }

        const result = updateUserSchema.safeParse(updateData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0)
        }
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type with optional fields', () => {
        const data: UpdateUserFormData = {
          f_name: 'John'
        }

        expect(data).toBeDefined()
        expect(data.f_name).toBe('John')
      })

      it('should allow partial updates in TypeScript', () => {
        const data: UpdateUserFormData = {
          email: 'test@example.com',
          is_active: true
        }

        expect(data.email).toBe('test@example.com')
        expect(data.is_active).toBe(true)
      })
    })
  })

  describe('Schema Integration', () => {
    it('should export CreateUserFormData type', () => {
      const data: CreateUserFormData = {
        f_name: 'John',
        l_name: 'Doe',
        email: 'john@example.com',
        phone: ['+1', '1234567890'],
        role_id: '1',
        is_2fa_required: false,
        is_active: true
      }

      expect(data).toBeDefined()
    })

    it('should export UpdateUserFormData type', () => {
      const data: UpdateUserFormData = {
        f_name: 'Jane'
      }

      expect(data).toBeDefined()
    })

    it('should have compatible types between create and update schemas', () => {
      const createData: CreateUserFormData = {
        f_name: 'John',
        l_name: 'Doe',
        email: 'john@example.com',
        phone: ['+1', '1234567890'],
        role_id: '1',
        is_2fa_required: false,
        is_active: true
      }

      const updateData: UpdateUserFormData = {
        f_name: createData.f_name,
        email: createData.email
      }

      expect(updateData.f_name).toBe(createData.f_name)
      expect(updateData.email).toBe(createData.email)
    })
  })

  describe('Error Handling', () => {
    it('should provide detailed error information', () => {
      const invalidData = { f_name: '' }
      const result = createUserSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError)
        expect(result.error.issues[0]).toHaveProperty('path')
        expect(result.error.issues[0]).toHaveProperty('message')
      }
    })

    it('should include field path in error', () => {
      const invalidData = {
        f_name: 'John',
        l_name: 'Doe',
        email: 'john@example.com',
        phone: ['+1', '1234567890'] as [string, string],
        role_id: '1',
        is_2fa_required: false,
        is_active: true,
        module_assignments: [
          { module_id: '', can_create: true, can_read: true, can_update: false, can_delete: false }
        ]
      }
      const result = createUserSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('module_assignments')
      }
    })
  })
})
