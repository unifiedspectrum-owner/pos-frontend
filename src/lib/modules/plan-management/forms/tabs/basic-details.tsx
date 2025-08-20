import { Flex, GridItem, SimpleGrid } from '@chakra-ui/react'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { CreatePlanFormData, BASIC_INFO_FIELD_KEYS } from '@plan-management/schemas/validation/plans'
import { useTabValidation, useTabValidationNavigation } from '@plan-management/hooks'
import { PlanFormMode } from '@plan-management/types/plans'
import { BASIC_INFO_QUESTIONS, PLAN_FORM_MODES } from '@plan-management/config'
import { TextInputField, TextAreaField, SwitchField } from '@shared/components'
import { TabNavigation } from '@plan-management/components'

/* Basic details tab component props */
interface PlanBasicDetailsProps {
  mode: PlanFormMode /* Form operation mode */
  onNext?: () => void /* Next tab navigation handler */
  onPrevious?: () => void /* Previous tab navigation handler */
  isFirstTab?: boolean /* Is this the first tab in sequence */
}

/* Basic plan details form tab component */
const PlanBasicDetails: React.FC<PlanBasicDetailsProps> = ({ 
  mode,
  onNext, 
  onPrevious,
  isFirstTab = false
}) => {
  /* Form context and validation hooks */
  const { control, formState: { errors }, getValues } = useFormContext<CreatePlanFormData>()
  const { isBasicInfoValid } = useTabValidation(getValues)
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW /* Check if in read-only mode */

  /* Tab navigation with validation */
  const { handleNext } = useTabValidationNavigation(BASIC_INFO_FIELD_KEYS, isReadOnly, onNext);

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Dynamic form fields based on configuration */}
      <SimpleGrid columns={3} gap={4}>
        {
          BASIC_INFO_QUESTIONS.map((que) => {
            const fieldError = errors[que.schema_key as keyof CreatePlanFormData];
            
            switch(que.type) {
              case 'INPUT':
                return (
                  <GridItem key={que.id} colSpan={que.grid.col_span}>
                    <Controller
                      name={que.schema_key as keyof CreatePlanFormData}
                      control={control}
                      render={({ field: controllerField }) => (
                        <TextInputField
                          label={que.label}
                          value={controllerField.value?.toString() || ''}
                          placeholder={que.placeholder || ""}
                          onChange={controllerField.onChange}
                          onBlur={controllerField.onBlur}
                          name={controllerField.name}
                          isInValid={!!fieldError}
                          required={que.is_required}
                          errorMessage={fieldError?.message || ''}
                          disabled={que.disabled || isReadOnly}
                          readOnly={isReadOnly}
                        />
                      )}
                    />
                  </GridItem>
                );
              case 'TEXTAREA':
                return (
                  <GridItem key={que.id} colSpan={que.grid.col_span}>
                    <Controller
                      name={que.schema_key as keyof CreatePlanFormData}
                      control={control}
                      render={({ field: controllerField }) => (
                        <TextAreaField
                          label={que.label}
                          value={controllerField.value?.toString() || ''}
                          placeholder={que.placeholder || ""}
                          onChange={controllerField.onChange}
                          onBlur={controllerField.onBlur}
                          name={controllerField.name}
                          isInValid={!!fieldError}
                          required={que.is_required}
                          errorMessage={fieldError?.message || ''}
                          disabled={isReadOnly}
                          readOnly={isReadOnly}
                        />
                      )}
                    />
                  </GridItem>
                );
              case 'TOGGLE':
                return (
                  <GridItem key={que.id} colSpan={que.grid.col_span}>
                    <Controller
                      name={que.schema_key as keyof CreatePlanFormData}
                      control={control}
                      render={({ field: controllerField }) => (
                        <SwitchField
                          label={que.label}
                          value={Boolean(controllerField.value)}
                          onChange={controllerField.onChange}
                          name={controllerField.name}
                          isInValid={!!fieldError}
                          required={que.is_required}
                          errorMessage={fieldError?.message || ''}
                          activeText={que.toggle_text?.true}
                          inactiveText={que.toggle_text?.false}
                          disabled={isReadOnly}
                          readOnly={isReadOnly}
                        />
                      )}
                    />
                  </GridItem>
                );
              default:
                return null;
            }
          })
        }
      </SimpleGrid>

      {/* Tab navigation with validation state */}
      <TabNavigation
        onNext={handleNext}
        onPrevious={onPrevious}
        isFirstTab={isFirstTab}
        isFormValid={isBasicInfoValid}
        readOnly={isReadOnly}
      />
    </Flex>
  );
}

export default PlanBasicDetails