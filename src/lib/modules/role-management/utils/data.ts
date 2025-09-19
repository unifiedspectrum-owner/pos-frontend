/* Data transformation and comparison utilities */

/* Role management module imports */
import { ModuleAssignment } from '@role-management/types'

/* Generic field value type for form data */
type FormFieldValue = string | number | boolean | ModuleAssignment[] | undefined

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