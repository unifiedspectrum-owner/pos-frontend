/* Role module imports */
import { CreateRoleFormData } from '@role-management/schemas'
import { RoleCreationApiRequest, RoleUpdationApiRequest } from '@role-management/types'

/* Build role creation API payload from form data */
export const buildCreateRolePayload = (formData: CreateRoleFormData): RoleCreationApiRequest => {
  return {
    name: formData.name.trim(),
    code: formData.code.trim().toUpperCase(),
    display_name: formData.display_name.trim(),
    description: formData.description.trim(),
    is_active: formData.is_active,
    module_assignments: formData.module_assignments
  }
}

/* Build payload for role updates with only changed fields */
export const buildUpdateRolePayload = (changedFields: Partial<CreateRoleFormData>): RoleUpdationApiRequest => {
  const payload: RoleUpdationApiRequest = {}

  /* Handle each field type properly */
  if (changedFields.name !== undefined) {
    payload.name = changedFields.name.trim()
  }

  if (changedFields.code !== undefined) {
    payload.code = changedFields.code.trim().toUpperCase()
  }

  if (changedFields.display_name !== undefined) {
    payload.display_name = changedFields.display_name.trim()
  }

  if (changedFields.description !== undefined) {
    payload.description = changedFields.description.trim()
  }

  if (changedFields.is_active !== undefined) {
    payload.is_active = changedFields.is_active
  }

  if (changedFields.module_assignments !== undefined) {
    payload.module_assignments = changedFields.module_assignments
  }

  return payload
}

/* Generic field value type for form data */
type FormFieldValue = string | number | boolean | any[] | undefined

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