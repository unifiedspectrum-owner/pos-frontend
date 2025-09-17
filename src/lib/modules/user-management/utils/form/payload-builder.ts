/* Shared module imports */
import { formatPhoneForAPI } from '@shared/utils/formatting'

/* User module imports */
import { CreateUserFormData, UpdateUserFormData } from '@user-management/schemas'
import { UserCreationApiRequest, UserUpdationApiRequest } from '@user-management/types'

/* Build payload for user creation */
export const buildCreateUserPayload = (data: CreateUserFormData): UserCreationApiRequest => {
  return {
    f_name: data.f_name,
    l_name: data.l_name,
    email: data.email,
    phone: formatPhoneForAPI(data.phone),
    role_id: Number(data.role_id),
    is_active: Boolean(data.is_active)
  }
}

/* Build payload for user updates with only changed fields */
export const buildUpdateUserPayload = (changedFields: Partial<UpdateUserFormData>): UserUpdationApiRequest => {
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

  if (changedFields.is_active !== undefined) {
    payload.is_active = changedFields.is_active
  }

  return payload
}

/* Generic field value type for form data */
type FormFieldValue = string | number | boolean | [string, string] | undefined

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