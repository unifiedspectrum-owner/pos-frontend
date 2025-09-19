/* Shared module imports */
import { formatPhoneForAPI } from '@shared/utils/formatting'

/* User module imports */
import { CreateUserFormData, UpdateUserFormData } from '@user-management/schemas'
import { UserCreationApiRequest, UserUpdationApiRequest } from '@user-management/types'

/* Role module imports */
import { ModuleAssignments, RolePermission } from '@role-management/types'

/* User module imports */
import { UserPermissions } from '@user-management/types'

/* Merge role permissions and user permissions for form display, preserving custom user permissions */
export const mergeRoleAndUserPermissions = (
  userPermissions: UserPermissions[],
  rolePermissions: RolePermission[],
  selectedRoleId?: string,
  originalRoleId?: string
): ModuleAssignments[] => {
  /* Create a map to track all modules from both sources */
  const moduleMap = new Map<number, ModuleAssignments>()

  /* Get role permissions for the selected role */
  const currentRolePermissions = selectedRoleId && rolePermissions.length > 0
    ? rolePermissions.filter(permission => permission.role_id.toString() === selectedRoleId)
    : []

  /* Get original role permissions if role is being changed */
  const originalRolePermissions = originalRoleId && originalRoleId !== selectedRoleId && rolePermissions.length > 0
    ? rolePermissions.filter(permission => permission.role_id.toString() === originalRoleId)
    : []

  /* First, add current role permissions as the base */
  currentRolePermissions.forEach(permission => {
    moduleMap.set(permission.module_id, {
      module_id: permission.module_id.toString(),
      can_create: Boolean(permission.can_create),
      can_read: Boolean(permission.can_read),
      can_update: Boolean(permission.can_update),
      can_delete: Boolean(permission.can_delete),
    })
  })

  /* Then, preserve existing user custom permissions */
  userPermissions.forEach(permission => {
    const existingModule = moduleMap.get(permission.module_id)
    const originalRolePermission = originalRolePermissions.find(rp => rp.module_id === permission.module_id)

    if (existingModule && originalRolePermission) {
      /* If role is changing, preserve custom user permissions that exceed the original role */
      moduleMap.set(permission.module_id, {
        module_id: permission.module_id.toString(),
        can_create: Boolean(existingModule.can_create || (permission.can_create && !originalRolePermission.can_create)),
        can_read: Boolean(existingModule.can_read || (permission.can_read && !originalRolePermission.can_read)),
        can_update: Boolean(existingModule.can_update || (permission.can_update && !originalRolePermission.can_update)),
        can_delete: Boolean(existingModule.can_delete || (permission.can_delete && !originalRolePermission.can_delete)),
      })
    } else {
      /* No role change or no original role permission, use current permissions */
      moduleMap.set(permission.module_id, {
        module_id: permission.module_id.toString(),
        can_create: Boolean(permission.can_create),
        can_read: Boolean(permission.can_read),
        can_update: Boolean(permission.can_update),
        can_delete: Boolean(permission.can_delete),
      })
    }
  })

  return Array.from(moduleMap.values())
}

/* Convert UserPermissions to ModuleAssignments format for form population */
export const convertPermissionsToModuleAssignments = (
  permissions: UserPermissions[]
): ModuleAssignments[] => {
  /* Group permissions by module_id to get unique modules */
  const moduleMap = new Map<number, UserPermissions>()

  permissions.forEach(permission => {
    if (!moduleMap.has(permission.module_id)) {
      moduleMap.set(permission.module_id, permission)
    }
  })

  /* Convert to ModuleAssignments format */
  return Array.from(moduleMap.values()).map(permission => ({
    module_id: permission.module_id.toString(),
    can_create: Boolean(permission.can_create),
    can_read: Boolean(permission.can_read),
    can_update: Boolean(permission.can_update),
    can_delete: Boolean(permission.can_delete),
  }))
}

/* Filter out role-based permissions to send only custom permissions */
export const filterCustomPermissions = (
  moduleAssignments: ModuleAssignments[],
  rolePermissions: RolePermission[],
  selectedRoleId: string
): ModuleAssignments[] => {
  if (!selectedRoleId || !rolePermissions.length) {
    return moduleAssignments
  }

  /* Get role permissions for the selected role */
  const selectedRolePermissions = rolePermissions.filter(
    permission => permission.role_id.toString() === selectedRoleId.toString()
  )

  /* Filter module assignments to only include custom permissions */
  return moduleAssignments.map(assignment => {
    const rolePermission = selectedRolePermissions.find(
      permission => permission.module_id.toString() === assignment.module_id.toString()
    )

    if (!rolePermission) {
      /* No role permission for this module, include all user selections */
      return assignment
    }

    /* Only include permissions that are NOT granted by the role OR are additional user permissions */
    return {
      module_id: assignment.module_id,
      can_create: rolePermission.can_create ? false : assignment.can_create,
      can_read: rolePermission.can_read ? false : assignment.can_read,
      can_update: rolePermission.can_update ? false : assignment.can_update,
      can_delete: rolePermission.can_delete ? false : assignment.can_delete,
    }
  }).filter(assignment =>
    /* Only include modules that have at least one custom permission */
    assignment.can_create || assignment.can_read || assignment.can_update || assignment.can_delete
  )
}

/* Build payload for user creation */
export const buildCreateUserPayload = (
  data: CreateUserFormData,
  rolePermissions?: RolePermission[]
): UserCreationApiRequest => {
  const customModuleAssignments = rolePermissions
    ? filterCustomPermissions(data.module_assignments || [], rolePermissions, data.role_id)
    : data.module_assignments

  return {
    f_name: data.f_name,
    l_name: data.l_name,
    email: data.email,
    phone: formatPhoneForAPI(data.phone),
    role_id: Number(data.role_id),
    module_assignments: customModuleAssignments,
    is_active: Boolean(data.is_active)
  }
}

/* Build payload for user updates with only changed fields */
export const buildUpdateUserPayload = (
  changedFields: Partial<UpdateUserFormData>,
  rolePermissions?: RolePermission[],
  currentRoleId?: string
): UserUpdationApiRequest => {
  const payload: UserUpdationApiRequest = {}

  /* Handle each field type properly */
  if (changedFields.f_name !== undefined) {
    payload.f_name = changedFields.f_name
  }

  if (changedFields.l_name !== undefined) {
    payload.l_name = changedFields.l_name
  }

  if (changedFields.email !== undefined) {
    payload.email = changedFields.email
  }

  if (changedFields.phone !== undefined) {
    payload.phone = formatPhoneForAPI(changedFields.phone)
  }

  if (changedFields.role_id !== undefined) {
    payload.role_id = Number(changedFields.role_id)
  }

  if (changedFields.module_assignments !== undefined) {
    /* Determine the role ID to use for filtering */
    const roleIdForFiltering = changedFields.role_id || currentRoleId

    /* Filter custom permissions if role permissions are provided */
    const customModuleAssignments = rolePermissions && roleIdForFiltering
      ? filterCustomPermissions(changedFields.module_assignments, rolePermissions, roleIdForFiltering)
      : changedFields.module_assignments

    payload.module_assignments = customModuleAssignments
  }

  if (changedFields.is_active !== undefined) {
    payload.is_active = changedFields.is_active
  }

  return payload
}

/* Generic field value type for form data */
type FormFieldValue = string | number | boolean | [string, string] | ModuleAssignments[] | undefined

/* Record type for form data with string keys and form field values */
type FormDataRecord = Record<string, FormFieldValue>

/* Deep comparison utility for detecting changes */
export const getChangedFields = <T extends FormDataRecord>(
  currentData: T,
  originalData: T | null
): Partial<T> | null => {
  if (!originalData) return null

  const changes: Partial<T> = {}
  let hasChanges = false

  /* Automatically compare all fields */
  Object.keys(currentData).forEach((key) => {
    const fieldKey = key as keyof T
    const currentValue = currentData[fieldKey]
    const originalValue = originalData[fieldKey]

    /* Deep comparison for arrays and objects */
    const isEqual = Array.isArray(currentValue) && Array.isArray(originalValue)
      ? JSON.stringify(currentValue) === JSON.stringify(originalValue)
      : currentValue === originalValue

    if (!isEqual) {
      changes[fieldKey] = currentValue
      hasChanges = true
    }
  })

  return hasChanges ? changes : null
}