import { Flex, SimpleGrid, GridItem } from '@chakra-ui/react'
import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'

/* Types & Schemas */
import { CreatePlanFormData, PRICING_INFO_FIELD_KEYS } from '@/lib/modules/plan-management/schemas/validation/plans'
import { useTabValidation, useTabValidationNavigation } from '@/lib/modules/plan-management/hooks'
import { PlanFormMode } from '@/lib/modules/plan-management/types/plans'

/* Constants */
import { PRICING_INFO_QUESTIONS } from '@/lib/modules/plan-management/config'

/* Components */
import { TextInputField } from '@/lib/shared/components'
import { VolumeDiscounts } from '@plan-management/forms/tabs/components/volume-discounts'
import { TabNavigation } from '@plan-management/components'

interface PlanPricingConfigurationProps {
  mode: PlanFormMode;
  onNext?: () => void;
  onPrevious?: () => void;
}

const PlanPricingConfiguration: React.FC<PlanPricingConfigurationProps> = ({ 
  mode,
  onNext, 
  onPrevious
}) => {
  /* Form context and validation state */
  const { control, formState: { errors }, getValues } = useFormContext<CreatePlanFormData>()
  const { isPricingInfoValid } = useTabValidation(getValues)
  const isReadOnly = mode === 'view'

  /* Shared navigation logic */
  const { handleNext } = useTabValidationNavigation(PRICING_INFO_FIELD_KEYS, isReadOnly, onNext);

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Dynamic pricing fields based on configuration */}
      <SimpleGrid columns={4} gap={4}>
        {
          PRICING_INFO_QUESTIONS.filter(que => que.is_active).map((que) => {
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
              default:
                return null;
            }
          })
        }
      </SimpleGrid>

      {/* Volume discounts section */}
      <VolumeDiscounts mode={mode} />

      {/* Navigation controls */}
      <TabNavigation
        onNext={handleNext}
        onPrevious={onPrevious}
        isFormValid={isPricingInfoValid}
        readOnly={isReadOnly}
      />
      
    </Flex>
  )
}

export default PlanPricingConfiguration;