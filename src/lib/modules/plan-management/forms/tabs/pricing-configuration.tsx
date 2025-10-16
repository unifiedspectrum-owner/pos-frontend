/* Libraries imports */
import React from 'react'
import { SimpleGrid, GridItem } from '@chakra-ui/react'
import { useFormContext, Controller } from 'react-hook-form'

/* Shared module imports */
import { TextInputField } from '@shared/components/form-elements'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan module imports */
import { CreatePlanFormData } from '@plan-management/schemas'
import { PRICING_INFO_QUESTIONS, PLAN_FORM_MODES } from '@plan-management/constants'
import { VolumeDiscounts } from '@plan-management/forms/tabs/components/volume-discounts'
import { usePlanFormMode } from '@plan-management/contexts'

/* Pricing configuration tab component - no props needed */
const PlanPricingConfiguration: React.FC = () => {
  /* Get mode from context */
  const { mode } = usePlanFormMode()

  /* Form context */
  const { control, formState: { errors }, clearErrors } = useFormContext<CreatePlanFormData>()
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW

  return (
    <>
      {/* Dynamic pricing fields based on configuration */}
      <SimpleGrid columns={4} gap={4} p={4}>
        {PRICING_INFO_QUESTIONS
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
              case FORM_FIELD_TYPES.INPUT: /* Text input fields for pricing values */
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

              default:
                return null /* Unsupported field type */
            }
          })
        }
      </SimpleGrid>

      {/* Volume discounts section */}
      <VolumeDiscounts />
    </>
  )
}

export default PlanPricingConfiguration;