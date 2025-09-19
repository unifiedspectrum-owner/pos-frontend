/* Libraries imports */
import React from 'react'
import { HStack, Text } from '@chakra-ui/react'
import { Control, useController, FieldValues, Path } from 'react-hook-form'
import { lighten } from 'polished'

/* Shared module imports */
import { Checkbox } from '@/components/ui/checkbox'
import { GRAY_COLOR } from '@shared/config'

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
  disabled?: boolean
  readOnly?: boolean
  control: Control<T>
  moduleIndex: number
  helpText?: string;
  isLastRow?: boolean
  protectedPermissions?: string[]
}

/* Checkbox group field component for module permissions */
const ModuleAssignmentsTable = <T extends FieldValues = FieldValues>({
  label,
  options,
  disabled = false,
  readOnly = false,
  control,
  moduleIndex,
  helpText,
  isLastRow,
  protectedPermissions = []
}: CheckboxGroupFieldProps<T>) => {
  /* Controller for module assignment object */
  const { field: moduleField } = useController<T>({
    control,
    name: `module_assignments.${moduleIndex}` as Path<T>
  })

  /* Update individual permission within module assignment */
  const handlePermissionChange = (permissionKey: string, isChecked: string | boolean) => {
    console.log(`[ModuleAssignmentsTable] Permission change attempt for ${permissionKey}:`, {
      permissionKey,
      isChecked,
      protectedPermissions,
      isProtected: protectedPermissions.includes(permissionKey)
    })

    /* Block changes to protected permissions */
    if (protectedPermissions.includes(permissionKey)) {
      console.log(`[ModuleAssignmentsTable] Blocking change to protected permission: ${permissionKey}`)
      return
    }

    const { checked, ...cleanValue } = moduleField.value;
    console.log("checked from checkbox group", checked)
    const updatedValue = {
      ...cleanValue,
      [permissionKey]: Boolean(isChecked)
    }
    console.log(updatedValue)
    moduleField.onChange(updatedValue)
  }

  /* Handle select all functionality for a module */
  const handleSelectAll = (isChecked: string | boolean) => {
    const { checked, ...cleanValue } = moduleField.value;
    console.log("checked from checkbox group", checked)

    const updatedValue = {
      ...cleanValue,
      can_create: protectedPermissions.includes('can_create') ? cleanValue.can_create : Boolean(isChecked),
      can_read: protectedPermissions.includes('can_read') ? cleanValue.can_read : Boolean(isChecked),
      can_update: protectedPermissions.includes('can_update') ? cleanValue.can_update : Boolean(isChecked),
      can_delete: protectedPermissions.includes('can_delete') ? cleanValue.can_delete : Boolean(isChecked)
    }
    console.log('Select All updated value:', updatedValue)
    moduleField.onChange(updatedValue)
  }

  /* Check if all permissions are selected */
  const areAllPermissionsSelected = () => {
    return options.every(option => moduleField.value?.[option.value] === true)
  }

  return (
    <HStack borderBottomRadius={isLastRow ? 'md' : undefined} borderWidth={1} borderColor={lighten(0.3, GRAY_COLOR)}  color={GRAY_COLOR}>
      <Text w="40%" fontWeight="medium" p={3} title={helpText} borderColor={lighten(0.3, GRAY_COLOR)} borderRightWidth={1}>{label}</Text>

      {/* Select All checkbox */}
      <Text p={3} w="12%" textAlign="center">
        <Checkbox
          checked={areAllPermissionsSelected()}
          borderWidth={1}
          borderRadius={'md'}
          onCheckedChange={(details) => {
            console.log('Select All callback details:', details)
            handleSelectAll(details.checked)
          }}
          disabled={disabled || readOnly || options.every(option => protectedPermissions.includes(option.value))}
        />
      </Text>

      {options.map((option) => {
        /* Get current permission state */
        const isChecked = moduleField.value?.[option.value] || false

        return (
          <Text p={3} key={`${moduleIndex}-${option.value}`} w="12%" textAlign="center">
            <Checkbox
              checked={isChecked}
              borderWidth={1}
              borderRadius={'md'}
              onCheckedChange={(details) => {
                console.log('Checkbox callback details:', details)
                handlePermissionChange(option.value, details.checked)
              }}
              readOnly={disabled || readOnly || option.disabled}
              disabled={disabled || readOnly || option.disabled || protectedPermissions.includes(option.value)}
            />
          </Text>
        )
      })}
    </HStack>
  )
}

export default ModuleAssignmentsTable;