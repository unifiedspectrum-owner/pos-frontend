/* Libraries imports */
import React from 'react'
import { SimpleGrid, GridItem, Fieldset, FieldsetRoot, FieldsetLegend } from '@chakra-ui/react'
import { Control, useController, FieldValues, Path } from 'react-hook-form'

/* Shared module imports */
import { Checkbox } from '@/components/ui/checkbox'

/* Checkbox option interface for permission selection */
export interface CheckboxOption {
  label: string
  value: string
  disabled?: boolean
}

/* Props interface for checkbox group field component */
interface CheckboxGroupFieldProps<T extends FieldValues = FieldValues> {
  label: string
  options: CheckboxOption[]
  isInValid: boolean
  required: boolean
  errorMessage?: string
  disabled?: boolean
  readOnly?: boolean
  control: Control<T>
  moduleIndex: number
  columns?: number | number[]
  helpText?: string
}

/* Checkbox group field component for module permissions */
const CheckboxGroupField = <T extends FieldValues = FieldValues>({
  label,
  options,
  isInValid,
  disabled = false,
  readOnly = false,
  control,
  moduleIndex,
  columns = 1,
  helpText
}: CheckboxGroupFieldProps<T>) => {
  /* Controller for module assignment object */
  const { field: moduleField, fieldState } = useController<T>({
    control,
    name: `module_assignments.${moduleIndex}` as Path<T>
  })

  /* Update individual permission within module assignment */
  const handlePermissionChange = (permissionKey: string, isChecked: string | boolean) => {
    const { checked, ...cleanValue } = moduleField.value;
    console.log("checked from checkbox group", checked)
    const updatedValue = {
      ...cleanValue,
      [permissionKey]: Boolean(isChecked)
    }
    console.log(updatedValue)
    moduleField.onChange(updatedValue)
  }

  return (
    <FieldsetRoot invalid={isInValid}>
      <FieldsetLegend fontWeight={'bold'}>{label}</FieldsetLegend>
      <Fieldset.Content>
        <SimpleGrid columns={columns} gap={2}>
          {options.map((option) => {
            /* Get current permission state */
            const isChecked = moduleField.value?.[option.value] || false

            return (
              <GridItem key={`${moduleIndex}-${option.value}`}>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(details) => {
                    console.log('Checkbox callback details:', details)
                    handlePermissionChange(option.value, details.checked)
                  }}
                  disabled={disabled || readOnly || option.disabled}
                >
                  {option.label}
                </Checkbox>
              </GridItem>
            )
          })}
        </SimpleGrid>
      </Fieldset.Content>
      {/* Error message display */}
      {fieldState.error && (
        <Fieldset.ErrorText>{fieldState.error.message}</Fieldset.ErrorText>
      )}
      {/* Help text display */}
      {helpText && (
        <Fieldset.HelperText>{helpText}</Fieldset.HelperText>
      )}
    </FieldsetRoot>
  )
}

export default CheckboxGroupField;