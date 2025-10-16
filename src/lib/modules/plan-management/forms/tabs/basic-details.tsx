/* React and Chakra UI component imports */
import React from 'react'
import { SimpleGrid, GridItem } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'

/* Shared module imports */
import { TextInputField, TextAreaField, SwitchField } from '@shared/components'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan module imports */
import { CreatePlanFormData } from '@plan-management/schemas'
import { BASIC_INFO_QUESTIONS, PLAN_FORM_MODES } from '@plan-management/constants'
import { usePlanFormMode } from '@plan-management/contexts'

/* Basic details tab component - no props needed */
const PlanBasicDetails: React.FC = () => {
  /* Get mode from context */
  const { mode } = usePlanFormMode()

  /* Form context */
  const { control, formState: { errors }, clearErrors } = useFormContext<CreatePlanFormData>()
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only mode */

  return (
    /* Dynamic form fields based on configuration */
    <SimpleGrid columns={3} gap={4} p={4}>
        {BASIC_INFO_QUESTIONS
          .filter((field) => field.is_active) /* Only render active fields */
          .sort((a, b) => Number(a.display_order) - Number(b.display_order)) /* Sort by display order */
          .map((field) => {
            const schemaKey = field.schema_key as keyof CreatePlanFormData
            const fieldError = errors[schemaKey]

            /* Shared field properties for all input types */
            const commonProps = {
              name: schemaKey,
              label: field.label,
              placeholder: field.placeholder,
              isInValid: !isReadOnly && !!fieldError,
              required: field.is_required && !isReadOnly,
              errorMessage: !isReadOnly ? fieldError?.message : undefined,
              readOnly: field.disabled || isReadOnly,
              disabled: field.disabled || isReadOnly,
            }

            /* Render appropriate field type based on configuration */
            switch(field.type) {
              case FORM_FIELD_TYPES.INPUT: /* Text input fields */
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

              case FORM_FIELD_TYPES.TEXTAREA: /* Description field */
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
                        />
                      )}
                    />
                  </GridItem>
                )

              case FORM_FIELD_TYPES.TOGGLE: /* Switch/toggle fields for boolean values */
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
  );
}

export default PlanBasicDetails