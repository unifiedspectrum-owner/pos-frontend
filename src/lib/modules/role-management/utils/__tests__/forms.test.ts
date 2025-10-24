/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Role management module imports */
import { buildCreateRolePayload, buildUpdateRolePayload } from '@role-management/utils'
import type { CreateRoleFormData } from '@role-management/schemas'
import type { ModuleAssignment } from '@role-management/types'

describe('Role Management Forms Utilities', () => {
  describe('buildCreateRolePayload', () => {
    const mockFormData: CreateRoleFormData = {
      name: '  Admin Role  ',
      description: '  Administrator role with full access  ',
      is_active: true,
      module_assignments: [
        {
          module_id: '1',
          can_create: true,
          can_read: true,
          can_update: false,
          can_delete: false
        },
        {
          module_id: '2',
          can_create: false,
          can_read: true,
          can_update: false,
          can_delete: false
        }
      ]
    }

    describe('Payload Structure', () => {
      it('should build correct payload structure', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result).toHaveProperty('name')
        expect(result).toHaveProperty('description')
        expect(result).toHaveProperty('is_active')
        expect(result).toHaveProperty('module_assignments')
      })

      it('should have exactly 4 properties', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(Object.keys(result)).toHaveLength(4)
      })

      it('should return object type', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(typeof result).toBe('object')
        expect(Array.isArray(result)).toBe(false)
      })

      it('should not include extra properties', () => {
        const formDataWithExtra = {
          ...mockFormData,
          extra_field: 'should not be included'
        } as CreateRoleFormData & { extra_field: string }

        const result = buildCreateRolePayload(formDataWithExtra)

        expect(result).not.toHaveProperty('extra_field')
      })
    })

    describe('Name Field Processing', () => {
      it('should trim name field', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result.name).toBe('Admin Role')
        expect(result.name).not.toContain('  ')
      })

      it('should trim leading whitespace from name', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          name: '   Leading Spaces'
        }

        const result = buildCreateRolePayload(formData)

        expect(result.name).toBe('Leading Spaces')
      })

      it('should trim trailing whitespace from name', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          name: 'Trailing Spaces   '
        }

        const result = buildCreateRolePayload(formData)

        expect(result.name).toBe('Trailing Spaces')
      })

      it('should trim both leading and trailing whitespace', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          name: '   Both Sides   '
        }

        const result = buildCreateRolePayload(formData)

        expect(result.name).toBe('Both Sides')
      })

      it('should preserve internal spaces in name', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          name: '  Role  With  Multiple  Spaces  '
        }

        const result = buildCreateRolePayload(formData)

        expect(result.name).toBe('Role  With  Multiple  Spaces')
      })

      it('should handle name without whitespace', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          name: 'NoWhitespace'
        }

        const result = buildCreateRolePayload(formData)

        expect(result.name).toBe('NoWhitespace')
      })

      it('should handle empty string name after trim', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          name: '   '
        }

        const result = buildCreateRolePayload(formData)

        expect(result.name).toBe('')
      })
    })

    describe('Description Field Processing', () => {
      it('should trim description field', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result.description).toBe('Administrator role with full access')
        expect(result.description).not.toMatch(/^\s/)
        expect(result.description).not.toMatch(/\s$/)
      })

      it('should trim leading whitespace from description', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          description: '   Leading description'
        }

        const result = buildCreateRolePayload(formData)

        expect(result.description).toBe('Leading description')
      })

      it('should trim trailing whitespace from description', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          description: 'Trailing description   '
        }

        const result = buildCreateRolePayload(formData)

        expect(result.description).toBe('Trailing description')
      })

      it('should preserve internal spaces in description', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          description: '  Description  with  spaces  '
        }

        const result = buildCreateRolePayload(formData)

        expect(result.description).toBe('Description  with  spaces')
      })

      it('should handle multiline description with trimming', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          description: '  Line 1\nLine 2\nLine 3  '
        }

        const result = buildCreateRolePayload(formData)

        expect(result.description).toBe('Line 1\nLine 2\nLine 3')
      })
    })

    describe('Boolean Field Processing', () => {
      it('should preserve is_active as true', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result.is_active).toBe(true)
        expect(typeof result.is_active).toBe('boolean')
      })

      it('should preserve is_active as false', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          is_active: false
        }

        const result = buildCreateRolePayload(formData)

        expect(result.is_active).toBe(false)
        expect(typeof result.is_active).toBe('boolean')
      })

      it('should not convert is_active to string', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(typeof result.is_active).not.toBe('string')
      })
    })

    describe('Module Assignments Processing', () => {
      it('should preserve module_assignments array', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(Array.isArray(result.module_assignments)).toBe(true)
        expect(result.module_assignments).toHaveLength(2)
      })

      it('should preserve module assignment structure', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result.module_assignments).toBeDefined()
        const firstAssignment = result.module_assignments?.[0]
        expect(firstAssignment).toHaveProperty('module_id')
        expect(firstAssignment).toHaveProperty('can_create')
        expect(firstAssignment).toHaveProperty('can_read')
        expect(firstAssignment).toHaveProperty('can_update')
        expect(firstAssignment).toHaveProperty('can_delete')
      })

      it('should preserve module assignment values', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result.module_assignments).toBeDefined()
        expect(result.module_assignments?.[0].module_id).toBe('1')
        expect(result.module_assignments?.[0].can_create).toBe(true)
        expect(result.module_assignments?.[0].can_read).toBe(true)
        expect(result.module_assignments?.[0].can_update).toBe(false)
        expect(result.module_assignments?.[0].can_delete).toBe(false)
      })

      it('should preserve all module assignments', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result.module_assignments).toBeDefined()
        expect(result.module_assignments?.[1].module_id).toBe('2')
        expect(result.module_assignments?.[1].can_create).toBe(false)
      })

      it('should handle empty module_assignments array', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          module_assignments: []
        }

        const result = buildCreateRolePayload(formData)

        expect(result.module_assignments).toEqual([])
        expect(Array.isArray(result.module_assignments)).toBe(true)
      })

      it('should handle single module assignment', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
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

        const result = buildCreateRolePayload(formData)

        expect(result.module_assignments).toHaveLength(1)
      })

      it('should handle multiple module assignments', () => {
        const formData: CreateRoleFormData = {
          ...mockFormData,
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false },
            { module_id: '2', can_create: false, can_read: true, can_update: false, can_delete: false },
            { module_id: '3', can_create: false, can_read: false, can_update: true, can_delete: false }
          ]
        }

        const result = buildCreateRolePayload(formData)

        expect(result.module_assignments).toHaveLength(3)
      })

      it('should preserve boolean types in module assignments', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result.module_assignments).toBeDefined()
        const assignment = result.module_assignments?.[0]
        expect(typeof assignment?.can_create).toBe('boolean')
        expect(typeof assignment?.can_read).toBe('boolean')
        expect(typeof assignment?.can_update).toBe('boolean')
        expect(typeof assignment?.can_delete).toBe('boolean')
      })
    })

    describe('Complete Payload Validation', () => {
      it('should create valid payload with all fields', () => {
        const result = buildCreateRolePayload(mockFormData)

        expect(result.name).toBe('Admin Role')
        expect(result.description).toBe('Administrator role with full access')
        expect(result.is_active).toBe(true)
        expect(result.module_assignments).toHaveLength(2)
      })

      it('should handle minimal form data', () => {
        const minimalFormData: CreateRoleFormData = {
          name: 'Simple Role',
          description: 'Simple description',
          is_active: false,
          module_assignments: []
        }

        const result = buildCreateRolePayload(minimalFormData)

        expect(result.name).toBe('Simple Role')
        expect(result.description).toBe('Simple description')
        expect(result.is_active).toBe(false)
        expect(result.module_assignments).toEqual([])
      })

      it('should handle maximum form data', () => {
        const maxFormData: CreateRoleFormData = {
          name: '  Super Admin Role  ',
          description: '  Role with all possible permissions and access  ',
          is_active: true,
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: true, can_delete: true },
            { module_id: '2', can_create: true, can_read: true, can_update: true, can_delete: true },
            { module_id: '3', can_create: true, can_read: true, can_update: true, can_delete: true }
          ]
        }

        const result = buildCreateRolePayload(maxFormData)

        expect(result.name).toBe('Super Admin Role')
        expect(result.module_assignments).toHaveLength(3)
      })
    })
  })

  describe('buildUpdateRolePayload', () => {
    describe('Empty Changes', () => {
      it('should return empty object when no changes provided', () => {
        const result = buildUpdateRolePayload({})

        expect(result).toEqual({})
        expect(Object.keys(result)).toHaveLength(0)
      })

      it('should return object type even when empty', () => {
        const result = buildUpdateRolePayload({})

        expect(typeof result).toBe('object')
        expect(Array.isArray(result)).toBe(false)
      })
    })

    describe('Name Field Updates', () => {
      it('should handle name update', () => {
        const changes = { name: '  Updated Role Name  ' }

        const result = buildUpdateRolePayload(changes)

        expect(result).toHaveProperty('name')
        expect(result.name).toBe('Updated Role Name')
      })

      it('should trim name field', () => {
        const changes = { name: '   Spaces   ' }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).toBe('Spaces')
        expect(result.name).not.toMatch(/^\s/)
        expect(result.name).not.toMatch(/\s$/)
      })

      it('should not include name if undefined', () => {
        const changes = { description: 'Only description changed' }

        const result = buildUpdateRolePayload(changes)

        expect(result).not.toHaveProperty('name')
      })

      it('should handle empty string name', () => {
        const changes = { name: '' }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).toBe('')
      })

      it('should handle name with only whitespace', () => {
        const changes = { name: '   ' }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).toBe('')
      })
    })

    describe('Description Field Updates', () => {
      it('should handle description update', () => {
        const changes = { description: '  Updated description  ' }

        const result = buildUpdateRolePayload(changes)

        expect(result).toHaveProperty('description')
        expect(result.description).toBe('Updated description')
      })

      it('should trim description field', () => {
        const changes = { description: '   Description with spaces   ' }

        const result = buildUpdateRolePayload(changes)

        expect(result.description).toBe('Description with spaces')
      })

      it('should not include description if undefined', () => {
        const changes = { name: 'Only name changed' }

        const result = buildUpdateRolePayload(changes)

        expect(result).not.toHaveProperty('description')
      })

      it('should handle empty string description', () => {
        const changes = { description: '' }

        const result = buildUpdateRolePayload(changes)

        expect(result.description).toBe('')
      })

      it('should preserve multiline description', () => {
        const changes = { description: '  Line 1\nLine 2  ' }

        const result = buildUpdateRolePayload(changes)

        expect(result.description).toBe('Line 1\nLine 2')
      })
    })

    describe('Boolean Field Updates', () => {
      it('should handle is_active update to true', () => {
        const changes = { is_active: true }

        const result = buildUpdateRolePayload(changes)

        expect(result).toHaveProperty('is_active')
        expect(result.is_active).toBe(true)
      })

      it('should handle is_active update to false', () => {
        const changes = { is_active: false }

        const result = buildUpdateRolePayload(changes)

        expect(result).toHaveProperty('is_active')
        expect(result.is_active).toBe(false)
      })

      it('should not include is_active if undefined', () => {
        const changes = { name: 'Name change only' }

        const result = buildUpdateRolePayload(changes)

        expect(result).not.toHaveProperty('is_active')
      })

      it('should preserve boolean type', () => {
        const changes = { is_active: false }

        const result = buildUpdateRolePayload(changes)

        expect(typeof result.is_active).toBe('boolean')
      })
    })

    describe('Module Assignments Updates', () => {
      const moduleAssignments: ModuleAssignment[] = [
        {
          module_id: '1',
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: false
        }
      ]

      it('should handle module_assignments update', () => {
        const changes = { module_assignments: moduleAssignments }

        const result = buildUpdateRolePayload(changes)

        expect(result).toHaveProperty('module_assignments')
        expect(result.module_assignments).toEqual(moduleAssignments)
      })

      it('should preserve module_assignments array', () => {
        const changes = { module_assignments: moduleAssignments }

        const result = buildUpdateRolePayload(changes)

        expect(Array.isArray(result.module_assignments)).toBe(true)
        expect(result.module_assignments).toHaveLength(1)
      })

      it('should not include module_assignments if undefined', () => {
        const changes = { name: 'Name only' }

        const result = buildUpdateRolePayload(changes)

        expect(result).not.toHaveProperty('module_assignments')
      })

      it('should handle empty module_assignments array', () => {
        const changes = { module_assignments: [] }

        const result = buildUpdateRolePayload(changes)

        expect(result.module_assignments).toEqual([])
      })

      it('should preserve module assignment structure', () => {
        const changes = { module_assignments: moduleAssignments }

        const result = buildUpdateRolePayload(changes)

        const assignment = result.module_assignments?.[0]
        expect(assignment).toHaveProperty('module_id')
        expect(assignment).toHaveProperty('can_create')
        expect(assignment).toHaveProperty('can_read')
        expect(assignment).toHaveProperty('can_update')
        expect(assignment).toHaveProperty('can_delete')
      })

      it('should handle multiple module assignments', () => {
        const multipleAssignments: ModuleAssignment[] = [
          { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false },
          { module_id: '2', can_create: false, can_read: true, can_update: true, can_delete: false }
        ]

        const changes = { module_assignments: multipleAssignments }

        const result = buildUpdateRolePayload(changes)

        expect(result.module_assignments).toHaveLength(2)
      })
    })

    describe('Multiple Field Updates', () => {
      it('should handle name and description updates', () => {
        const changes = {
          name: '  New Name  ',
          description: '  New Description  '
        }

        const result = buildUpdateRolePayload(changes)

        expect(result).toHaveProperty('name')
        expect(result).toHaveProperty('description')
        expect(Object.keys(result)).toHaveLength(2)
      })

      it('should handle all fields update', () => {
        const changes = {
          name: '  Updated  ',
          description: '  Updated Desc  ',
          is_active: false,
          module_assignments: [
            { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false }
          ]
        }

        const result = buildUpdateRolePayload(changes)

        expect(Object.keys(result)).toHaveLength(4)
        expect(result.name).toBe('Updated')
        expect(result.description).toBe('Updated Desc')
        expect(result.is_active).toBe(false)
        expect(result.module_assignments).toHaveLength(1)
      })

      it('should handle name and is_active updates', () => {
        const changes = {
          name: 'New Name',
          is_active: true
        }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).toBe('New Name')
        expect(result.is_active).toBe(true)
        expect(Object.keys(result)).toHaveLength(2)
      })

      it('should handle description and module_assignments updates', () => {
        const changes = {
          description: 'New Description',
          module_assignments: []
        }

        const result = buildUpdateRolePayload(changes)

        expect(result.description).toBe('New Description')
        expect(result.module_assignments).toEqual([])
        expect(Object.keys(result)).toHaveLength(2)
      })
    })

    describe('Payload Structure Validation', () => {
      it('should only include changed fields', () => {
        const changes = { name: 'Only Name' }

        const result = buildUpdateRolePayload(changes)

        expect(Object.keys(result)).toHaveLength(1)
        expect(result).toHaveProperty('name')
        expect(result).not.toHaveProperty('description')
        expect(result).not.toHaveProperty('is_active')
        expect(result).not.toHaveProperty('module_assignments')
      })

      it('should return object with correct structure', () => {
        const changes = {
          name: 'Name',
          description: 'Description'
        }

        const result = buildUpdateRolePayload(changes)

        expect(typeof result).toBe('object')
        expect(result).not.toBeNull()
        expect(Array.isArray(result)).toBe(false)
      })

      it('should not include undefined fields', () => {
        const changes = {
          name: 'Name',
          description: undefined,
          is_active: undefined
        }

        const result = buildUpdateRolePayload(changes)

        expect(Object.keys(result)).toHaveLength(1)
        expect(result).toHaveProperty('name')
      })
    })

    describe('Edge Cases', () => {
      it('should handle partial updates with one field', () => {
        const changes = { is_active: false }

        const result = buildUpdateRolePayload(changes)

        expect(Object.keys(result)).toHaveLength(1)
      })

      it('should handle partial updates with two fields', () => {
        const changes = {
          name: 'Name',
          is_active: true
        }

        const result = buildUpdateRolePayload(changes)

        expect(Object.keys(result)).toHaveLength(2)
      })

      it('should handle partial updates with three fields', () => {
        const changes = {
          name: 'Name',
          description: 'Desc',
          is_active: true
        }

        const result = buildUpdateRolePayload(changes)

        expect(Object.keys(result)).toHaveLength(3)
      })

      it('should trim all string fields', () => {
        const changes = {
          name: '  Name  ',
          description: '  Description  '
        }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).not.toMatch(/^\s|\s$/)
        expect(result.description).not.toMatch(/^\s|\s$/)
      })

      it('should handle very long strings', () => {
        const longString = 'A'.repeat(500)
        const changes = {
          name: `  ${longString}  `,
          description: `  ${longString}  `
        }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).toBe(longString)
        expect(result.description).toBe(longString)
      })

      it('should handle special characters in strings', () => {
        const changes = {
          name: '  Role™®©  ',
          description: '  Special chars: !@#$%^&*()  '
        }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).toBe('Role™®©')
        expect(result.description).toBe('Special chars: !@#$%^&*()')
      })

      it('should handle unicode characters', () => {
        const changes = {
          name: '  角色名称  ',
          description: '  角色描述  '
        }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).toBe('角色名称')
        expect(result.description).toBe('角色描述')
      })
    })

    describe('Type Safety', () => {
      it('should accept Partial<CreateRoleFormData> type', () => {
        const changes: Partial<CreateRoleFormData> = {
          name: 'Test'
        }

        const result = buildUpdateRolePayload(changes)

        expect(result.name).toBe('Test')
      })

      it('should return RoleUpdateRequest type', () => {
        const changes = { name: 'Test' }

        const result = buildUpdateRolePayload(changes)

        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
      })
    })
  })
})
