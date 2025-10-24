/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Role management module imports */
import { getChangedFields } from '@role-management/utils'
import type { ModuleAssignment } from '@role-management/types'

describe('Role Management Data Utilities', () => {
  describe('getChangedFields', () => {
    const originalData = {
      name: 'Admin Role',
      description: 'Administrator role with full access',
      is_active: true,
      module_assignments: [
        {
          module_id: '1',
          can_create: true,
          can_read: true,
          can_update: false,
          can_delete: false
        }
      ] as ModuleAssignment[]
    }

    describe('Null and Empty Cases', () => {
      it('should return null when originalData is null', () => {
        const currentData = { name: 'New Role' }
        const result = getChangedFields(currentData, null)

        expect(result).toBeNull()
      })

      it('should return null when no changes detected', () => {
        const currentData = { ...originalData }

        const result = getChangedFields(currentData, originalData)

        expect(result).toBeNull()
      })

      it('should return null when data is identical', () => {
        const currentData = {
          name: 'Admin Role',
          description: 'Administrator role with full access',
          is_active: true
        }

        const result = getChangedFields(currentData, currentData)

        expect(result).toBeNull()
      })
    })

    describe('Simple Field Changes', () => {
      it('should detect name field change', () => {
        const currentData = {
          ...originalData,
          name: 'Updated Role Name'
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('name')
        expect(result?.name).toBe('Updated Role Name')
      })

      it('should detect description field change', () => {
        const currentData = {
          ...originalData,
          description: 'Updated description'
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('description')
        expect(result?.description).toBe('Updated description')
      })

      it('should detect is_active field change', () => {
        const currentData = {
          ...originalData,
          is_active: false
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('is_active')
        expect(result?.is_active).toBe(false)
      })

      it('should detect string value change', () => {
        const original = {
          name: 'Old Name',
          description: 'Old Description'
        }

        const current = {
          name: 'New Name',
          description: 'Old Description'
        }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result?.name).toBe('New Name')
        expect(result).not.toHaveProperty('description')
      })
    })

    describe('Multiple Field Changes', () => {
      it('should detect multiple field changes', () => {
        const currentData = {
          ...originalData,
          name: 'New Role',
          description: 'New description'
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('name')
        expect(result).toHaveProperty('description')
        expect(Object.keys(result || {}).length).toBe(2)
      })

      it('should detect all field changes when all changed', () => {
        const currentData = {
          name: 'New Role',
          description: 'New description',
          is_active: false,
          module_assignments: [] as ModuleAssignment[]
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(Object.keys(result || {}).length).toBe(4)
      })

      it('should return only changed fields, not unchanged ones', () => {
        const currentData = {
          ...originalData,
          name: 'Changed Name'
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).toHaveProperty('name')
        expect(result).not.toHaveProperty('description')
        expect(result).not.toHaveProperty('is_active')
      })

      it('should handle three field changes', () => {
        const currentData = {
          ...originalData,
          name: 'New Name',
          description: 'New Description',
          is_active: false
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(Object.keys(result || {}).length).toBe(3)
        expect(result?.name).toBe('New Name')
        expect(result?.description).toBe('New Description')
        expect(result?.is_active).toBe(false)
      })
    })

    describe('Boolean Field Changes', () => {
      it('should detect boolean change from true to false', () => {
        const currentData = {
          ...originalData,
          is_active: false
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result?.is_active).toBe(false)
      })

      it('should detect boolean change from false to true', () => {
        const originalWithFalse = {
          ...originalData,
          is_active: false
        }

        const currentWithTrue = {
          ...originalData,
          is_active: true
        }

        const result = getChangedFields(currentWithTrue, originalWithFalse)

        expect(result).not.toBeNull()
        expect(result?.is_active).toBe(true)
      })

      it('should not detect change when boolean remains same', () => {
        const currentData = {
          name: 'Admin Role',
          description: 'Administrator role with full access',
          is_active: true
        }

        const originalSimple = {
          name: 'Admin Role',
          description: 'Administrator role with full access',
          is_active: true
        }

        const result = getChangedFields(currentData, originalSimple)

        expect(result).toBeNull()
      })

      it('should correctly identify boolean type in result', () => {
        const currentData = {
          ...originalData,
          is_active: false
        }

        const result = getChangedFields(currentData, originalData)

        expect(typeof result?.is_active).toBe('boolean')
      })
    })

    describe('Array Field Changes', () => {
      it('should detect module_assignments array change', () => {
        const currentData = {
          ...originalData,
          module_assignments: [
            {
              module_id: '2',
              can_create: false,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ] as ModuleAssignment[]
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('module_assignments')
      })

      it('should detect changes in array element properties', () => {
        const currentData = {
          ...originalData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: true,
              can_delete: false
            }
          ] as ModuleAssignment[]
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('module_assignments')
      })

      it('should detect array length change', () => {
        const currentData = {
          ...originalData,
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
          ] as ModuleAssignment[]
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('module_assignments')
      })

      it('should not detect change when arrays are identical', () => {
        const currentData = {
          name: 'Admin Role',
          description: 'Administrator role with full access',
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ] as ModuleAssignment[]
        }

        const originalSame = {
          name: 'Admin Role',
          description: 'Administrator role with full access',
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ] as ModuleAssignment[]
        }

        const result = getChangedFields(currentData, originalSame)

        expect(result).toBeNull()
      })

      it('should detect change when array becomes empty', () => {
        const currentData = {
          ...originalData,
          module_assignments: [] as ModuleAssignment[]
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(result?.module_assignments).toEqual([])
      })

      it('should detect change when array goes from empty to populated', () => {
        const originalEmpty = {
          ...originalData,
          module_assignments: [] as ModuleAssignment[]
        }

        const currentPopulated = {
          ...originalData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ] as ModuleAssignment[]
        }

        const result = getChangedFields(currentPopulated, originalEmpty)

        expect(result).not.toBeNull()
        expect(result?.module_assignments).toHaveLength(1)
      })

      it('should use JSON.stringify for array comparison', () => {
        const currentData = {
          ...originalData,
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: true
            }
          ] as ModuleAssignment[]
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
      })
    })

    describe('Undefined Field Handling', () => {
      it('should detect change from undefined to value', () => {
        const originalWithUndefined = {
          name: 'Role',
          description: undefined as string | undefined,
          is_active: true
        }

        const currentWithValue = {
          name: 'Role',
          description: 'New description' as string | undefined,
          is_active: true
        }

        const result = getChangedFields(currentWithValue, originalWithUndefined)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('description')
        expect(result?.description).toBe('New description')
      })

      it('should detect change from value to undefined', () => {
        const originalWithValue = {
          name: 'Role',
          description: 'Some description' as string | undefined,
          is_active: true
        }

        const currentWithUndefined = {
          name: 'Role',
          description: undefined as string | undefined,
          is_active: true
        }

        const result = getChangedFields(currentWithUndefined, originalWithValue)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('description')
        expect(result?.description).toBeUndefined()
      })

      it('should not detect change when both are undefined', () => {
        const original = {
          name: 'Role',
          description: undefined as string | undefined
        }

        const current = {
          name: 'Role',
          description: undefined as string | undefined
        }

        const result = getChangedFields(current, original)

        expect(result).toBeNull()
      })
    })

    describe('Field Iteration', () => {
      it('should compare all fields in currentData', () => {
        const currentData = {
          name: 'Admin Role',
          description: 'Administrator role with full access',
          is_active: true,
          new_field: 'new value'
        }

        const originalWithoutNewField = {
          name: 'Admin Role',
          description: 'Administrator role with full access',
          is_active: true
        }

        const result = getChangedFields(currentData, originalWithoutNewField as typeof currentData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('new_field')
      })

      it('should iterate through all object keys', () => {
        const original = {
          field1: 'value1',
          field2: 'value2',
          field3: 'value3'
        }

        const current = {
          field1: 'value1',
          field2: 'changed',
          field3: 'value3'
        }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('field2')
        expect(Object.keys(result || {}).length).toBe(1)
      })

      it('should handle extra fields in currentData', () => {
        const current = {
          ...originalData,
          extra_field: 'extra value'
        }

        const result = getChangedFields(current, originalData)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('extra_field')
      })
    })

    describe('Return Type and Structure', () => {
      it('should return object with correct type', () => {
        const currentData = {
          ...originalData,
          name: 'Changed Name'
        }

        const result = getChangedFields(currentData, originalData)

        if (result) {
          expect(typeof result).toBe('object')
          expect(Array.isArray(result)).toBe(false)
        }
      })

      it('should return partial object', () => {
        const currentData = {
          ...originalData,
          name: 'New Name'
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
        expect(Object.keys(result || {}).length).toBeLessThan(Object.keys(currentData).length)
      })

      it('should return null as type, not undefined', () => {
        const result = getChangedFields(originalData, originalData)

        expect(result).toBeNull()
        expect(result).not.toBeUndefined()
      })

      it('should preserve field value types in result', () => {
        const currentData = {
          ...originalData,
          name: 'String Value',
          is_active: false
        }

        const result = getChangedFields(currentData, originalData)

        expect(typeof result?.name).toBe('string')
        expect(typeof result?.is_active).toBe('boolean')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty string changes', () => {
        const original = {
          name: 'Original Name'
        }

        const current = {
          name: ''
        }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result?.name).toBe('')
      })

      it('should handle whitespace changes', () => {
        const original = {
          name: 'Name'
        }

        const current = {
          name: '  Name  '
        }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result?.name).toBe('  Name  ')
      })

      it('should handle number values in generic data', () => {
        const original = {
          name: 'Role',
          priority: 1
        }

        const current = {
          name: 'Role',
          priority: 2
        }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result?.priority).toBe(2)
      })

      it('should handle complex nested objects in arrays', () => {
        const original = {
          name: 'Role',
          module_assignments: [
            {
              module_id: '1',
              can_create: true,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ] as ModuleAssignment[]
        }

        const current = {
          name: 'Role',
          module_assignments: [
            {
              module_id: '1',
              can_create: false,
              can_read: true,
              can_update: false,
              can_delete: false
            }
          ] as ModuleAssignment[]
        }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('module_assignments')
      })

      it('should handle single field object', () => {
        const original = { name: 'Old' }
        const current = { name: 'New' }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result?.name).toBe('New')
      })

      it('should handle originalData with missing fields', () => {
        const current = {
          name: 'Role',
          description: 'New field',
          is_active: true
        }

        const original = {
          name: 'Role'
        }

        const result = getChangedFields(current, original as typeof current)

        expect(result).not.toBeNull()
        expect(result).toHaveProperty('description')
        expect(result).toHaveProperty('is_active')
      })
    })

    describe('hasChanges Flag Logic', () => {
      it('should set hasChanges to true when changes exist', () => {
        const currentData = {
          ...originalData,
          name: 'Changed'
        }

        const result = getChangedFields(currentData, originalData)

        expect(result).not.toBeNull()
      })

      it('should keep hasChanges false when no changes', () => {
        const currentData = { ...originalData }

        const result = getChangedFields(currentData, originalData)

        expect(result).toBeNull()
      })

      it('should return null when hasChanges is false', () => {
        const result = getChangedFields(originalData, originalData)

        expect(result).toBeNull()
      })
    })

    describe('Type Safety', () => {
      it('should handle generic type correctly', () => {
        interface TestData {
          field1: string;
          field2: number;
          field3: boolean;
          [key: string]: string | number | boolean;
        }

        const original: TestData = {
          field1: 'test',
          field2: 123,
          field3: true
        }

        const current: TestData = {
          field1: 'test',
          field2: 456,
          field3: true
        }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result?.field2).toBe(456)
      })

      it('should work with Record type', () => {
        const original: Record<string, string> = {
          key1: 'value1',
          key2: 'value2'
        }

        const current: Record<string, string> = {
          key1: 'value1',
          key2: 'changed'
        }

        const result = getChangedFields(current, original)

        expect(result).not.toBeNull()
        expect(result?.key2).toBe('changed')
      })
    })
  })
})
