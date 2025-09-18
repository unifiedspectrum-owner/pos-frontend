/* Libraries imports */
import React from 'react'
import { GridItem, SimpleGrid } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'

/* Shared module imports */
import { TextInputField, TextAreaField, SwitchField } from '@shared/components/form-elements'

/* Role module imports */
import { CreateRoleFormData } from '@role-management/schemas'
import { ROLE_CREATION_FORM_QUESTIONS } from '@role-management/constants'
import { useFormMode } from '@role-management/forms/create/components'

/* Dynamic role information form with field configuration */
const RoleInfoTab: React.FC = () => {
  const { control, formState: { errors }, clearErrors } = useFormContext<CreateRoleFormData>() /* Form validation context */
  const { isViewMode } = useFormMode() /* Form mode context */

  return (
    <SimpleGrid w={'100%'} columns={[1,6]} gap={6}>
      {ROLE_CREATION_FORM_QUESTIONS
        .filter((field) => field.is_active) /* Only render active fields */
        .sort((a, b) => Number(a.display_order) - Number(b.display_order)) /* Sort by display order */
        .map((field) => {
          const schemaKey = field.schema_key as keyof CreateRoleFormData
          const fieldError = errors[schemaKey]

          /* Shared field properties for all input types */
          const commonProps = {
            name: schemaKey,
            label: field.label,
            placeholder: field.placeholder,
            isInValid: !isViewMode && !!fieldError,
            required: field.is_required && !isViewMode,
            errorMessage: !isViewMode ? fieldError?.message : undefined,
            readOnly: field.disabled || isViewMode,
            disabled: field.disabled || isViewMode,
          }

          /* Render appropriate field type based on configuration */
          switch(field.type) {
            case 'INPUT': /* Text input fields (name, code, display_name) */
              return (
                <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                  <Controller
                    name={schemaKey}
                    control={control}
                    render={({ field: controllerField }) => (
                      <TextInputField
                        {...commonProps}
                        value={controllerField.value?.toString() || ''}
                        onChange={(value) => {
                          clearErrors(schemaKey)
                          controllerField.onChange(value)
                        }}
                        onBlur={controllerField.onBlur}
                      />
                    )}
                  />
                </GridItem>
              )

            case 'TEXTAREA': /* Description field */
              return (
                <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                  <Controller
                    name={schemaKey}
                    control={control}
                    render={({ field: controllerField }) => (
                      <TextAreaField
                        {...commonProps}
                        value={controllerField.value?.toString() || ''}
                        onChange={(value) => {
                          clearErrors(schemaKey)
                          controllerField.onChange(value)
                        }}
                        onBlur={controllerField.onBlur}
                        inputProps={{
                          rows: 4
                        }}
                      />
                    )}
                  />
                </GridItem>
              )

            case 'TOGGLE': /* Switch/toggle fields for boolean values */
              return (
                <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                  <Controller
                    name={schemaKey}
                    control={control}
                    render={({ field: controllerField }) => (
                      <SwitchField
                        {...commonProps}
                        value={Boolean(controllerField.value)}
                        onChange={controllerField.onChange}
                        activeText={field.toggle_text?.true}
                        inactiveText={field.toggle_text?.false}
                      />
                    )}
                  />
                </GridItem>
              )

            default:
              return null /* Unsupported field type */
          }
        })
      }
    </SimpleGrid>
  )
}

export default RoleInfoTab