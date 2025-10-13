/* Hook for managing field-to-field navigation on Enter key */

/* Libraries imports */
import { useCallback, useRef } from 'react'
import { FieldValues, UseFormTrigger, Path } from 'react-hook-form'

/* Hook parameters interface */
interface UseFieldNavigationParams<T extends FieldValues> {
  trigger: UseFormTrigger<T>
  onSubmit?: () => void
  fields: (keyof T)[]
}

/* Hook return type */
interface UseFieldNavigationReturn<T extends FieldValues> {
  getFieldProps: (fieldName: keyof T) => {
    ref: React.Ref<HTMLInputElement>
    inputProps: {
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => Promise<void>
    }
  }
}

/* Custom hook for handling Enter key navigation between form fields */
export const useFieldNavigation = <T extends FieldValues>({ trigger, onSubmit, fields }: UseFieldNavigationParams<T>): UseFieldNavigationReturn<T> => {
  /* Create refs for all fields using useRef */
  const fieldRefs = useRef<Map<keyof T, { current: HTMLInputElement | null }>>(new Map())

  /* Initialize refs for all fields */
  fields.forEach(field => {
    if (!fieldRefs.current.has(field)) {
      fieldRefs.current.set(field, { current: null })
    }
  })

  /* Get field props including ref and keydown handler */
  const getFieldProps = useCallback(
    (fieldName: keyof T) => {
      const fieldIndex = fields.indexOf(fieldName)
      const nextField = fieldIndex >= 0 && fieldIndex < fields.length - 1 ? fields[fieldIndex + 1] : null
      const nextFieldRef = nextField ? fieldRefs.current.get(nextField) : null

      return {
        ref: fieldRefs.current.get(fieldName)!,
        inputProps: {
          onKeyDown: async (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              const currentField = e.currentTarget

              /* Blur current field to flush any pending debounced values */
              currentField.blur()

              /* Small delay to allow blur event to process */
              await new Promise(resolve => setTimeout(resolve, 0))

              /* Validate current field */
              const isValid = await trigger(fieldName as Path<T>)

              if (isValid) {
                if (nextFieldRef?.current) {
                  /* Move to next field if available */
                  nextFieldRef.current.focus()
                } else if (onSubmit) {
                  /* Submit form if on last field */
                  onSubmit()
                }
              } else {
                /* Refocus current field if validation failed */
                currentField.focus()
              }
            }
          }
        }
      }
    },
    [trigger, onSubmit, fields]
  )

  return { getFieldProps }
}
