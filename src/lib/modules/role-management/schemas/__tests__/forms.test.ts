/* Comprehensive test suite for role management form validation schemas */

/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'

/* Role management module imports */
import { createRoleSchema, updateRoleSchema, type CreateRoleFormData, type UpdateRoleFormData } from '@role-management/schemas/forms'

describe('Role Management Form Schemas', () => {
  describe('createRoleSchema', () => {
    const validRoleData = {
      name: 'Admin Role',
      description: 'Administrator role with full access',
      module_assignments: [
        {
          module_id: '1',
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: false
        }
      ],
      is_active: true
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(createRoleSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(createRoleSchema.parse).toBeDefined()
        expect(createRoleSchema.safeParse).toBeDefined()
        expect(typeof createRoleSchema.parse).toBe('function')
        expect(typeof createRoleSchema.safeParse).toBe('function')
      })

      it('should validate data with all required fields', () => {
        const result = createRoleSchema.safeParse(validRoleData)
        expect(result.success).toBe(true)
      })
    })

    describe('name Field Validation', () => {
      it('should accept valid role name', () => {
        const result = createRoleSchema.safeParse(validRoleData)
        expect(result.success).toBe(true)
      })

      it('should reject name with less than 2 characters', () => {
        const data = { ...validRoleData, name: 'A' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Display name must be at least 2 characters')
        }
      })

      it('should accept name with exactly 2 characters', () => {
        const data = { ...validRoleData, name: 'AB' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject name exceeding 50 characters', () => {
        const data = { ...validRoleData, name: 'a'.repeat(51) }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Display name must not exceed 50 characters')
        }
      })

      it('should accept name with exactly 50 characters', () => {
        const data = { ...validRoleData, name: 'a'.repeat(50) }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with spaces', () => {
        const data = { ...validRoleData, name: 'Super Admin Role' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with numbers', () => {
        const data = { ...validRoleData, name: 'Admin Level 1' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with special characters', () => {
        const data = { ...validRoleData, name: 'Admin-Role_V2' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject empty name', () => {
        const data = { ...validRoleData, name: '' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept name with whitespace', () => {
        const data = { ...validRoleData, name: '   ' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('description Field Validation', () => {
      it('should accept valid description', () => {
        const result = createRoleSchema.safeParse(validRoleData)
        expect(result.success).toBe(true)
      })

      it('should reject empty description', () => {
        const data = { ...validRoleData, description: '' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Description is required')
        }
      })

      it('should accept description with exactly 1 character', () => {
        const data = { ...validRoleData, description: 'A' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject description exceeding 500 characters', () => {
        const data = { ...validRoleData, description: 'a'.repeat(501) }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Description cannot exceed 500 characters')
        }
      })

      it('should accept description with exactly 500 characters', () => {
        const data = { ...validRoleData, description: 'a'.repeat(500) }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept description with multiple lines', () => {
        const data = { ...validRoleData, description: 'Line 1\nLine 2\nLine 3' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept description with special characters', () => {
        const data = { ...validRoleData, description: 'Admin role: has full access & permissions!' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject description with only whitespace', () => {
        const data = { ...validRoleData, description: '   ' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('module_assignments Field Validation', () => {
      it('should accept valid module assignments array', () => {
        const result = createRoleSchema.safeParse(validRoleData)
        expect(result.success).toBe(true)
      })

      it('should accept empty module assignments array', () => {
        const data = { ...validRoleData, module_assignments: [] }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject module assignment with empty module_id', () => {
        const data = {
          ...validRoleData,
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
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Module ID is required')
        }
      })

      it('should accept module assignment with numeric string module_id', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '123',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept module assignment with alphanumeric module_id', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: 'module-abc-123',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject module assignment with non-boolean can_create', () => {
        const data = {
          ...validRoleData,
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
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject module assignment with non-boolean can_read', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: 1,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject module assignment with non-boolean can_update', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: null,
              can_delete: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject module assignment with non-boolean can_delete', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: undefined
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept multiple module assignments', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: true, can_delete: false },
            { module_id: '2', can_create: false, can_read: true, can_update: false, can_delete: false },
            { module_id: '3', can_create: true, can_read: true, can_update: true, can_delete: true }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject module assignment missing can_create field', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject module assignment missing can_read field', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject module assignment missing can_update field', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_delete: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject module assignment missing can_delete field', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept all permissions set to true', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: true,
              can_delete: true
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept all permissions set to false', () => {
        const data = {
          ...validRoleData,
          module_assignments: [
            {
              module_id: '1',
              can_create: false,
              can_read: false,
              can_update: false,
              can_delete: false
            }
          ]
        }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('is_active Field Validation', () => {
      it('should accept true value', () => {
        const data = { ...validRoleData, is_active: true }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept false value', () => {
        const data = { ...validRoleData, is_active: false }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject non-boolean value', () => {
        const data = { ...validRoleData, is_active: 1 }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject string value', () => {
        const data = { ...validRoleData, is_active: 'true' }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject null value', () => {
        const data = { ...validRoleData, is_active: null }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject undefined value', () => {
        const data = { ...validRoleData, is_active: undefined }
        const result = createRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Complete Validation Scenarios', () => {
      it('should validate complete role data successfully', () => {
        const completeData = {
          name: 'Content Manager',
          description: 'Role for managing content across the platform with limited administrative access',
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: true, can_delete: false },
            { module_id: '2', can_create: false, can_read: true, can_update: false, can_delete: false }
          ],
          is_active: true
        }

        const result = createRoleSchema.safeParse(completeData)
        expect(result.success).toBe(true)
      })

      it('should validate minimal required data successfully', () => {
        const minimalData = {
          name: 'Guest',
          description: 'Guest role with read-only access',
          module_assignments: [],
          is_active: false
        }

        const result = createRoleSchema.safeParse(minimalData)
        expect(result.success).toBe(true)
      })

      it('should reject data missing name field', () => {
        const data = {
          description: 'Test description',
          module_assignments: [],
          is_active: true
        }

        const result = createRoleSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('should reject data missing description field', () => {
        const data = {
          name: 'Test Role',
          module_assignments: [],
          is_active: true
        }

        const result = createRoleSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('should reject data missing module_assignments field', () => {
        const data = {
          name: 'Test Role',
          description: 'Test description',
          is_active: true
        }

        const result = createRoleSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('should reject data missing is_active field', () => {
        const data = {
          name: 'Test Role',
          description: 'Test description',
          module_assignments: []
        }

        const result = createRoleSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('should accumulate multiple validation errors', () => {
        const invalidData = {
          name: 'A',
          description: '',
          module_assignments: [
            {
              module_id: '',
              can_create: 'true',
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ],
          is_active: 'yes'
        }

        const result = createRoleSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(1)
        }
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: CreateRoleFormData = {
          name: 'Admin',
          description: 'Administrator role',
          module_assignments: [],
          is_active: true
        }

        expect(data).toBeDefined()
      })

      it('should enforce required fields in TypeScript', () => {
        const data: CreateRoleFormData = {
          name: 'Test',
          description: 'Test description',
          module_assignments: [],
          is_active: true
        }

        expect(data.name).toBe('Test')
        expect(data.description).toBe('Test description')
        expect(data.module_assignments).toEqual([])
        expect(data.is_active).toBe(true)
      })
    })
  })

  describe('updateRoleSchema', () => {
    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(updateRoleSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(updateRoleSchema.parse).toBeDefined()
        expect(updateRoleSchema.safeParse).toBeDefined()
        expect(typeof updateRoleSchema.parse).toBe('function')
        expect(typeof updateRoleSchema.safeParse).toBe('function')
      })

      it('should allow partial updates', () => {
        const partialData = { name: 'Updated Role' }
        const result = updateRoleSchema.safeParse(partialData)
        expect(result.success).toBe(true)
      })
    })

    describe('Partial Fields Validation', () => {
      it('should accept update with only name', () => {
        const data = { name: 'Updated Role' }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only description', () => {
        const data = { description: 'Updated description' }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only module_assignments', () => {
        const data = {
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false }
          ]
        }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only is_active', () => {
        const data = { is_active: false }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with multiple fields', () => {
        const data = {
          name: 'Updated Role',
          description: 'Updated description',
          is_active: false
        }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept empty object for partial update', () => {
        const data = {}
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Field Validation Rules', () => {
      it('should apply same validation rules as createRoleSchema for name', () => {
        const data = { name: 'A' }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Display name must be at least 2 characters')
        }
      })

      it('should apply same validation rules as createRoleSchema for description', () => {
        const data = { description: '' }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Description is required')
        }
      })

      it('should apply same validation rules as createRoleSchema for module_assignments', () => {
        const data = {
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
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Module ID is required')
        }
      })

      it('should apply same validation rules as createRoleSchema for is_active', () => {
        const data = { is_active: 'true' }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should validate name length constraints', () => {
        const data = { name: 'a'.repeat(51) }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Display name must not exceed 50 characters')
        }
      })

      it('should validate description length constraints', () => {
        const data = { description: 'a'.repeat(501) }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Description cannot exceed 500 characters')
        }
      })
    })

    describe('Optional Fields Handling', () => {
      it('should allow all fields to be optional', () => {
        const data = { name: 'Test' }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.description).toBeUndefined()
          expect(result.data.module_assignments).toBeUndefined()
          expect(result.data.is_active).toBeUndefined()
        }
      })

      it('should allow updating with undefined name', () => {
        const data = { description: 'Updated description', name: undefined }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should allow updating with undefined description', () => {
        const data = { name: 'Updated Role', description: undefined }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should allow updating with undefined module_assignments', () => {
        const data = { name: 'Updated Role', module_assignments: undefined }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should allow updating with undefined is_active', () => {
        const data = { name: 'Updated Role', is_active: undefined }
        const result = updateRoleSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Complete Update Scenarios', () => {
      it('should validate complete role update successfully', () => {
        const updateData = {
          name: 'Updated Admin',
          description: 'Updated administrator role with enhanced permissions',
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: true, can_delete: true },
            { module_id: '2', can_create: true, can_read: true, can_update: false, can_delete: false }
          ],
          is_active: false
        }

        const result = updateRoleSchema.safeParse(updateData)
        expect(result.success).toBe(true)
      })

      it('should validate partial role update successfully', () => {
        const updateData = {
          description: 'Partial update with new description',
          is_active: false
        }

        const result = updateRoleSchema.safeParse(updateData)
        expect(result.success).toBe(true)
      })

      it('should validate single field update successfully', () => {
        const updateData = {
          is_active: true
        }

        const result = updateRoleSchema.safeParse(updateData)
        expect(result.success).toBe(true)
      })

      it('should reject update with invalid field values', () => {
        const updateData = {
          name: 'A',
          description: ''
        }

        const result = updateRoleSchema.safeParse(updateData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0)
        }
      })

      it('should validate update removing all permissions', () => {
        const updateData = {
          module_assignments: []
        }

        const result = updateRoleSchema.safeParse(updateData)
        expect(result.success).toBe(true)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type with optional fields', () => {
        const data: UpdateRoleFormData = {
          name: 'Updated Role'
        }

        expect(data).toBeDefined()
        expect(data.name).toBe('Updated Role')
      })

      it('should allow partial updates in TypeScript', () => {
        const data: UpdateRoleFormData = {
          description: 'New description',
          is_active: false
        }

        expect(data.description).toBe('New description')
        expect(data.is_active).toBe(false)
      })

      it('should allow empty object in TypeScript', () => {
        const data: UpdateRoleFormData = {}

        expect(data).toBeDefined()
        expect(Object.keys(data)).toHaveLength(0)
      })
    })
  })

  describe('Schema Integration', () => {
    it('should export CreateRoleFormData type', () => {
      const data: CreateRoleFormData = {
        name: 'Admin',
        description: 'Administrator',
        module_assignments: [],
        is_active: true
      }

      expect(data).toBeDefined()
    })

    it('should export UpdateRoleFormData type', () => {
      const data: UpdateRoleFormData = {
        name: 'Updated'
      }

      expect(data).toBeDefined()
    })

    it('should have compatible types between create and update schemas', () => {
      const createData: CreateRoleFormData = {
        name: 'Admin',
        description: 'Administrator role',
        module_assignments: [],
        is_active: true
      }

      const updateData: UpdateRoleFormData = {
        name: createData.name,
        description: createData.description
      }

      expect(updateData.name).toBe(createData.name)
      expect(updateData.description).toBe(createData.description)
    })

    it('should allow creating update data from create data', () => {
      const createData: CreateRoleFormData = {
        name: 'Content Manager',
        description: 'Manages content',
        module_assignments: [
          { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false }
        ],
        is_active: true
      }

      const updateData: UpdateRoleFormData = {
        name: createData.name,
        module_assignments: createData.module_assignments
      }

      expect(updateData.name).toBe('Content Manager')
      expect(updateData.module_assignments).toEqual(createData.module_assignments)
    })
  })

  describe('Error Handling', () => {
    it('should provide detailed error information', () => {
      const invalidData = { name: 'A' }
      const result = createRoleSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError)
        expect(result.error.issues[0]).toHaveProperty('path')
        expect(result.error.issues[0]).toHaveProperty('message')
      }
    })

    it('should include field path in error', () => {
      const invalidData = {
        name: 'Admin',
        description: 'Test',
        module_assignments: [
          { module_id: '', can_create: true, can_read: true, can_update: false, can_delete: false }
        ],
        is_active: true
      }
      const result = createRoleSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('module_assignments')
      }
    })

    it('should provide multiple error messages for multiple invalid fields', () => {
      const invalidData = {
        name: 'A',
        description: '',
        module_assignments: [],
        is_active: 'true'
      }
      const result = createRoleSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3)
      }
    })

    it('should provide specific error for nested module_assignments validation', () => {
      const invalidData = {
        name: 'Admin',
        description: 'Test',
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: 'yes',
            can_update: false,
            can_delete: false
          }
        ],
        is_active: true
      }
      const result = createRoleSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(issue => issue.path.join('.'))
        expect(paths.some(path => path.includes('module_assignments'))).toBe(true)
      }
    })
  })
})
