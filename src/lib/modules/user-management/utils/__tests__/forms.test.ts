/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'

/* User management module imports */
import { mergeRoleAndUserPermissions, convertPermissionsToModuleAssignments, filterCustomPermissions, buildCreateUserPayload, buildUpdateUserPayload, getChangedFields } from '@user-management/utils'
import type { UserPermissions } from '@user-management/types'

/* Role management module imports */
import type { RolePermission, ModuleAssignment } from '@role-management/types'

/* Mock the shared formatPhoneForAPI function */
vi.mock('@shared/utils/formatting', () => ({
  formatPhoneForAPI: vi.fn((phone: [string, string]) => `${phone[0]}${phone[1]}`)
}))

describe('User Management Forms Utilities', () => {
  describe('mergeRoleAndUserPermissions', () => {
    const mockUserPermissions: UserPermissions[] = [
      {
        module_id: 1,
        module_name: 'User Management',
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
        permission_expires_at: null
      },
      {
        module_id: 2,
        module_name: 'Role Management',
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
        permission_expires_at: null
      }
    ]

    const mockRolePermissions: RolePermission[] = [
      {
        id: 1,
        role_id: 1,
        module_id: 1,
        can_create: true,
        can_read: true,
        can_update: false,
        can_delete: false,
        display_order: 1
      },
      {
        id: 2,
        role_id: 1,
        module_id: 2,
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
        display_order: 2
      },
      {
        id: 3,
        role_id: 2,
        module_id: 1,
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
        display_order: 1
      }
    ]

    it('should return empty array when no permissions provided', () => {
      const result = mergeRoleAndUserPermissions([], [])
      expect(result).toEqual([])
    })

    it('should merge user and role permissions correctly', () => {
      const result = mergeRoleAndUserPermissions(mockUserPermissions, mockRolePermissions, '1')

      expect(result).toHaveLength(2)
      expect(result[0].module_id).toBe('1')
      expect(result[1].module_id).toBe('2')
    })

    it('should use role permissions as base when selectedRoleId is provided', () => {
      const result = mergeRoleAndUserPermissions([], mockRolePermissions, '1')

      expect(result).toHaveLength(2)
      const module1 = result.find(m => m.module_id === '1')
      expect(module1).toBeDefined()
      expect(module1?.can_create).toBe(true)
      expect(module1?.can_read).toBe(true)
    })

    it('should preserve custom user permissions when role changes', () => {
      const result = mergeRoleAndUserPermissions(
        mockUserPermissions,
        mockRolePermissions,
        '2',
        '1'
      )

      expect(result).toHaveLength(2)
      const module1 = result.find(m => m.module_id === '1')
      /* User had update permission but original role didn't, so it should be preserved */
      expect(module1?.can_update).toBe(true)
    })

    it('should convert module_id to string', () => {
      const result = mergeRoleAndUserPermissions(mockUserPermissions, mockRolePermissions, '1')

      result.forEach(module => {
        expect(typeof module.module_id).toBe('string')
      })
    })

    it('should convert permissions to boolean values', () => {
      const result = mergeRoleAndUserPermissions(mockUserPermissions, mockRolePermissions, '1')

      result.forEach(module => {
        expect(typeof module.can_create).toBe('boolean')
        expect(typeof module.can_read).toBe('boolean')
        expect(typeof module.can_update).toBe('boolean')
        expect(typeof module.can_delete).toBe('boolean')
      })
    })

    it('should include all modules when allModuleIds is provided', () => {
      const allModuleIds = [1, 2, 3, 4, 5]
      const result = mergeRoleAndUserPermissions(
        mockUserPermissions,
        mockRolePermissions,
        '1',
        undefined,
        allModuleIds
      )

      expect(result).toHaveLength(5)
      expect(result.map(m => m.module_id)).toEqual(['1', '2', '3', '4', '5'])
    })

    it('should set default permissions to false for new modules', () => {
      const allModuleIds = [1, 2, 3]
      const result = mergeRoleAndUserPermissions([], [], undefined, undefined, allModuleIds)

      const module3 = result.find(m => m.module_id === '3')
      expect(module3).toBeDefined()
      expect(module3?.can_create).toBe(false)
      expect(module3?.can_read).toBe(false)
      expect(module3?.can_update).toBe(false)
      expect(module3?.can_delete).toBe(false)
    })

    it('should handle empty role permissions', () => {
      const result = mergeRoleAndUserPermissions(mockUserPermissions, [], '1')

      expect(result).toHaveLength(2)
      expect(result[0].can_create).toBe(true)
    })

    it('should handle role change without originalRoleId', () => {
      const result = mergeRoleAndUserPermissions(mockUserPermissions, mockRolePermissions, '2')

      expect(result).toHaveLength(2)
      expect(result).toBeDefined()
    })

    it('should not modify original arrays', () => {
      const userPermissionsCopy = [...mockUserPermissions]
      const rolePermissionsCopy = [...mockRolePermissions]

      mergeRoleAndUserPermissions(mockUserPermissions, mockRolePermissions, '1')

      expect(mockUserPermissions).toEqual(userPermissionsCopy)
      expect(mockRolePermissions).toEqual(rolePermissionsCopy)
    })
  })

  describe('convertPermissionsToModuleAssignments', () => {
    const mockPermissions: UserPermissions[] = [
      {
        module_id: 1,
        module_name: 'User Management',
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
        permission_expires_at: null
      },
      {
        module_id: 2,
        module_name: 'Role Management',
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
        permission_expires_at: null
      }
    ]

    it('should convert permissions to module assignments', () => {
      const result = convertPermissionsToModuleAssignments(mockPermissions)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('module_id')
      expect(result[0]).toHaveProperty('can_create')
      expect(result[0]).toHaveProperty('can_read')
      expect(result[0]).toHaveProperty('can_update')
      expect(result[0]).toHaveProperty('can_delete')
    })

    it('should convert module_id to string', () => {
      const result = convertPermissionsToModuleAssignments(mockPermissions)

      result.forEach(assignment => {
        expect(typeof assignment.module_id).toBe('string')
      })
    })

    it('should convert permission values to boolean', () => {
      const result = convertPermissionsToModuleAssignments(mockPermissions)

      result.forEach(assignment => {
        expect(typeof assignment.can_create).toBe('boolean')
        expect(typeof assignment.can_read).toBe('boolean')
        expect(typeof assignment.can_update).toBe('boolean')
        expect(typeof assignment.can_delete).toBe('boolean')
      })
    })

    it('should handle empty permissions array', () => {
      const result = convertPermissionsToModuleAssignments([])
      expect(result).toEqual([])
    })

    it('should handle duplicate module IDs by keeping first occurrence', () => {
      const duplicatePermissions: UserPermissions[] = [
        { ...mockPermissions[0] },
        { ...mockPermissions[0], can_create: false }
      ]

      const result = convertPermissionsToModuleAssignments(duplicatePermissions)

      expect(result).toHaveLength(1)
      expect(result[0].can_create).toBe(true)
    })

    it('should preserve permission values accurately', () => {
      const result = convertPermissionsToModuleAssignments(mockPermissions)

      const module1 = result.find(m => m.module_id === '1')
      expect(module1?.can_create).toBe(true)
      expect(module1?.can_read).toBe(true)
      expect(module1?.can_update).toBe(true)
      expect(module1?.can_delete).toBe(false)
    })

    it('should not include module_name in result', () => {
      const result = convertPermissionsToModuleAssignments(mockPermissions)

      result.forEach(assignment => {
        expect(assignment).not.toHaveProperty('module_name')
      })
    })

    it('should not include permission_expires_at in result', () => {
      const result = convertPermissionsToModuleAssignments(mockPermissions)

      result.forEach(assignment => {
        expect(assignment).not.toHaveProperty('permission_expires_at')
      })
    })
  })

  describe('filterCustomPermissions', () => {
    const mockModuleAssignments: ModuleAssignment[] = [
      {
        module_id: '1',
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false
      },
      {
        module_id: '2',
        can_create: true,
        can_read: true,
        can_update: false,
        can_delete: false
      }
    ]

    const mockRolePermissions: RolePermission[] = [
      {
        id: 1,
        role_id: 1,
        module_id: 1,
        can_create: true,
        can_read: true,
        can_update: false,
        can_delete: false,
        display_order: 1
      },
      {
        id: 2,
        role_id: 1,
        module_id: 2,
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
        display_order: 2
      }
    ]

    it('should filter out role-based permissions', () => {
      const result = filterCustomPermissions(mockModuleAssignments, mockRolePermissions, '1')

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return only custom permissions not granted by role', () => {
      const result = filterCustomPermissions(mockModuleAssignments, mockRolePermissions, '1')

      const module1 = result.find(m => m.module_id === '1')
      if (module1) {
        /* Role already grants create and read, so they should be false */
        expect(module1.can_create).toBe(false)
        expect(module1.can_read).toBe(false)
        /* Role doesn't grant update, so user's custom permission should remain */
        expect(module1.can_update).toBe(true)
      }
    })

    it('should include all permissions when no role permissions exist', () => {
      const result = filterCustomPermissions(mockModuleAssignments, mockRolePermissions, '999')

      expect(result).toHaveLength(2)
      expect(result[0].can_create).toBe(true)
    })

    it('should return all assignments when selectedRoleId is empty', () => {
      const result = filterCustomPermissions(mockModuleAssignments, mockRolePermissions, '')

      expect(result).toEqual(mockModuleAssignments)
    })

    it('should return all assignments when rolePermissions is empty', () => {
      const result = filterCustomPermissions(mockModuleAssignments, [], '1')

      expect(result).toEqual(mockModuleAssignments)
    })

    it('should filter out modules with no custom permissions', () => {
      const assignments: ModuleAssignment[] = [
        {
          module_id: '1',
          can_create: true,
          can_read: true,
          can_update: false,
          can_delete: false
        }
      ]

      const rolePerms: RolePermission[] = [
        {
          id: 1,
          role_id: 1,
          module_id: 1,
          can_create: true,
          can_read: true,
          can_update: false,
          can_delete: false,
          display_order: 1
        }
      ]

      const result = filterCustomPermissions(assignments, rolePerms, '1')

      /* All permissions match role, so no custom permissions */
      expect(result).toHaveLength(0)
    })

    it('should handle module_id as both string and number', () => {
      const result = filterCustomPermissions(mockModuleAssignments, mockRolePermissions, '1')

      expect(result).toBeDefined()
      result.forEach(assignment => {
        expect(typeof assignment.module_id).toBe('string')
      })
    })

    it('should preserve module_id format', () => {
      const result = filterCustomPermissions(mockModuleAssignments, mockRolePermissions, '1')

      result.forEach(assignment => {
        const originalAssignment = mockModuleAssignments.find(a => a.module_id === assignment.module_id)
        expect(originalAssignment).toBeDefined()
      })
    })
  })

  describe('buildCreateUserPayload', () => {
    const mockFormData = {
      f_name: 'John',
      l_name: 'Doe',
      email: 'john.doe@example.com',
      phone: ['+1', '1234567890'] as [string, string],
      role_id: '2',
      module_assignments: [
        {
          module_id: '1',
          can_create: true,
          can_read: true,
          can_update: false,
          can_delete: false
        }
      ],
      is_active: true,
      is_2fa_required: false,
      is_2fa_enabled: false
    }

    it('should build correct payload structure', () => {
      const result = buildCreateUserPayload(mockFormData)

      expect(result).toHaveProperty('f_name')
      expect(result).toHaveProperty('l_name')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('phone')
      expect(result).toHaveProperty('role_id')
      expect(result).toHaveProperty('module_assignments')
      expect(result).toHaveProperty('is_2fa_required')
      expect(result).toHaveProperty('is_active')
    })

    it('should not include is_2fa_enabled in payload', () => {
      const result = buildCreateUserPayload(mockFormData)

      expect(result).not.toHaveProperty('is_2fa_enabled')
    })

    it('should convert role_id to number', () => {
      const result = buildCreateUserPayload(mockFormData)

      expect(typeof result.role_id).toBe('number')
      expect(result.role_id).toBe(2)
    })

    it('should format phone correctly', () => {
      const result = buildCreateUserPayload(mockFormData)

      expect(result.phone).toBe('+11234567890')
    })

    it('should convert boolean values', () => {
      const result = buildCreateUserPayload(mockFormData)

      expect(typeof result.is_active).toBe('boolean')
      expect(typeof result.is_2fa_required).toBe('boolean')
    })

    it('should filter custom permissions when rolePermissions provided', () => {
      const rolePermissions: RolePermission[] = [
        {
          id: 1,
          role_id: 2,
          module_id: 1,
          can_create: true,
          can_read: true,
          can_update: false,
          can_delete: false,
          display_order: 1
        }
      ]

      const result = buildCreateUserPayload(mockFormData, rolePermissions)

      /* Can_create and can_read are already in role, so they should be filtered out */
      expect(result.module_assignments).toEqual([])
    })

    it('should include module_assignments when no rolePermissions provided', () => {
      const result = buildCreateUserPayload(mockFormData)

      expect(result.module_assignments).toHaveLength(1)
    })

    it('should handle empty module_assignments', () => {
      const dataWithoutAssignments = {
        ...mockFormData,
        module_assignments: []
      }

      const result = buildCreateUserPayload(dataWithoutAssignments)

      expect(result.module_assignments).toEqual([])
    })

    it('should handle undefined module_assignments', () => {
      const dataWithoutAssignments = {
        ...mockFormData,
        module_assignments: undefined
      }

      const result = buildCreateUserPayload(dataWithoutAssignments)

      expect(result.module_assignments).toBeUndefined()
    })
  })

  describe('buildUpdateUserPayload', () => {
    it('should build payload with only changed fields', () => {
      const changes = {
        f_name: 'Jane',
        email: 'jane@example.com'
      }

      const result = buildUpdateUserPayload(changes)

      expect(result).toHaveProperty('f_name')
      expect(result).toHaveProperty('email')
      expect(result).not.toHaveProperty('l_name')
      expect(result).not.toHaveProperty('phone')
    })

    it('should handle first name change', () => {
      const result = buildUpdateUserPayload({ f_name: 'NewName' })

      expect(result.f_name).toBe('NewName')
    })

    it('should handle last name change', () => {
      const result = buildUpdateUserPayload({ l_name: 'NewLastName' })

      expect(result.l_name).toBe('NewLastName')
    })

    it('should handle email change', () => {
      const result = buildUpdateUserPayload({ email: 'new@example.com' })

      expect(result.email).toBe('new@example.com')
    })

    it('should handle phone change and format it', () => {
      const result = buildUpdateUserPayload({ phone: ['+1', '9876543210'] })

      expect(result.phone).toBe('+19876543210')
    })

    it('should convert role_id to number', () => {
      const result = buildUpdateUserPayload({ role_id: '3' })

      expect(typeof result.role_id).toBe('number')
      expect(result.role_id).toBe(3)
    })

    it('should handle module_assignments change', () => {
      const assignments: ModuleAssignment[] = [
        {
          module_id: '1',
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: false
        }
      ]

      const result = buildUpdateUserPayload({ module_assignments: assignments })

      expect(result.module_assignments).toEqual(assignments)
    })

    it('should filter custom permissions when rolePermissions provided', () => {
      const assignments: ModuleAssignment[] = [
        {
          module_id: '1',
          can_create: true,
          can_read: true,
          can_update: false,
          can_delete: false
        }
      ]

      const rolePermissions: RolePermission[] = [
        {
          id: 1,
          role_id: 2,
          module_id: 1,
          can_create: true,
          can_read: true,
          can_update: false,
          can_delete: false,
          display_order: 1
        }
      ]

      const result = buildUpdateUserPayload(
        { module_assignments: assignments, role_id: '2' },
        rolePermissions
      )

      expect(result.module_assignments).toEqual([])
    })

    it('should use currentRoleId when role_id not in changes', () => {
      const assignments: ModuleAssignment[] = [
        {
          module_id: '1',
          can_create: false,
          can_read: false,
          can_update: true,
          can_delete: false
        }
      ]

      const rolePermissions: RolePermission[] = [
        {
          id: 1,
          role_id: 1,
          module_id: 1,
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
          display_order: 1
        }
      ]

      const result = buildUpdateUserPayload(
        { module_assignments: assignments },
        rolePermissions,
        '1'
      )

      expect(result.module_assignments).toHaveLength(1)
      expect(result.module_assignments?.[0].can_update).toBe(true)
    })

    it('should handle is_active change', () => {
      const result = buildUpdateUserPayload({ is_active: false })

      expect(result.is_active).toBe(false)
    })

    it('should handle is_2fa_required change', () => {
      const result = buildUpdateUserPayload({ is_2fa_required: true })

      expect(result.is_2fa_required).toBe(true)
    })

    it('should handle is_2fa_enabled change', () => {
      const result = buildUpdateUserPayload({ is_2fa_enabled: true })

      expect(result.is_2fa_enabled).toBe(true)
    })

    it('should return empty object when no changes provided', () => {
      const result = buildUpdateUserPayload({})

      expect(result).toEqual({})
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should handle multiple field changes', () => {
      const changes = {
        f_name: 'Jane',
        l_name: 'Smith',
        email: 'jane.smith@example.com',
        is_active: false
      }

      const result = buildUpdateUserPayload(changes)

      expect(result).toHaveProperty('f_name')
      expect(result).toHaveProperty('l_name')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('is_active')
      expect(Object.keys(result)).toHaveLength(4)
    })
  })

  describe('getChangedFields', () => {
    const originalData = {
      f_name: 'John',
      l_name: 'Doe',
      email: 'john@example.com',
      role_id: '1',
      is_active: true
    }

    it('should return null when originalData is null', () => {
      const currentData = { f_name: 'Jane' }
      const result = getChangedFields(currentData, null)

      expect(result).toBeNull()
    })

    it('should detect simple field changes', () => {
      const currentData = {
        ...originalData,
        f_name: 'Jane'
      }

      const result = getChangedFields(currentData, originalData)

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('f_name')
      expect(result?.f_name).toBe('Jane')
    })

    it('should detect multiple field changes', () => {
      const currentData = {
        ...originalData,
        f_name: 'Jane',
        l_name: 'Smith'
      }

      const result = getChangedFields(currentData, originalData)

      expect(result).toHaveProperty('f_name')
      expect(result).toHaveProperty('l_name')
      expect(Object.keys(result || {}).length).toBe(2)
    })

    it('should return null when no changes detected', () => {
      const currentData = { ...originalData }

      const result = getChangedFields(currentData, originalData)

      expect(result).toBeNull()
    })

    it('should detect boolean changes', () => {
      const currentData = {
        ...originalData,
        is_active: false
      }

      const result = getChangedFields(currentData, originalData)

      expect(result).not.toBeNull()
      expect(result?.is_active).toBe(false)
    })

    it('should detect array changes using JSON comparison', () => {
      const originalWithArray = {
        ...originalData,
        phone: ['+1', '1234567890'] as [string, string]
      }

      const currentWithArray = {
        ...originalData,
        phone: ['+1', '9876543210'] as [string, string]
      }

      const result = getChangedFields(currentWithArray, originalWithArray)

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('phone')
    })

    it('should not detect changes when arrays are identical', () => {
      const originalWithArray = {
        ...originalData,
        phone: ['+1', '1234567890'] as [string, string]
      }

      const currentWithArray = {
        ...originalData,
        phone: ['+1', '1234567890'] as [string, string]
      }

      const result = getChangedFields(currentWithArray, originalWithArray)

      expect(result).toBeNull()
    })

    it('should detect changes in nested arrays', () => {
      const originalWithModules = {
        ...originalData,
        module_assignments: [
          { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false }
        ]
      }

      const currentWithModules = {
        ...originalData,
        module_assignments: [
          { module_id: '1', can_create: true, can_read: true, can_update: true, can_delete: false }
        ]
      }

      const result = getChangedFields(currentWithModules, originalWithModules)

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('module_assignments')
    })

    it('should handle undefined values', () => {
      const originalWithUndefined = {
        ...originalData,
        middle_name: undefined as string | undefined
      }

      const currentWithValue = {
        ...originalData,
        middle_name: 'Middle' as string | undefined
      }

      const result = getChangedFields(currentWithValue, originalWithUndefined)

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('middle_name')
    })

    it('should handle changes from value to undefined', () => {
      const originalWithValue = {
        ...originalData,
        middle_name: 'Middle' as string | undefined
      }

      const currentWithUndefined = {
        ...originalData,
        middle_name: undefined as string | undefined
      }

      const result = getChangedFields(currentWithUndefined, originalWithValue)

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('middle_name')
      expect(result?.middle_name).toBeUndefined()
    })

    it('should compare all fields in currentData', () => {
      const currentData = {
        f_name: 'John',
        l_name: 'Doe',
        email: 'john@example.com',
        role_id: '1',
        is_active: true,
        new_field: 'new value'
      }

      const result = getChangedFields(currentData, originalData)

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('new_field')
    })

    it('should handle number changes', () => {
      const originalWithNumber = {
        ...originalData,
        age: 25
      }

      const currentWithNumber = {
        ...originalData,
        age: 26
      }

      const result = getChangedFields(currentWithNumber, originalWithNumber)

      expect(result).not.toBeNull()
      expect(result?.age).toBe(26)
    })

    it('should handle string to number changes', () => {
      const currentData = {
        ...originalData,
        role_id: '2'
      }

      const result = getChangedFields(currentData, originalData)

      expect(result).not.toBeNull()
      expect(result?.role_id).toBe('2')
    })

    it('should return changes object with correct type', () => {
      const currentData = {
        ...originalData,
        f_name: 'Jane'
      }

      const result = getChangedFields(currentData, originalData)

      if (result) {
        expect(typeof result).toBe('object')
        expect(Array.isArray(result)).toBe(false)
      }
    })
  })
})
