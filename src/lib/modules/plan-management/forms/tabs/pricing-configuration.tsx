import { Flex, SimpleGrid, GridItem } from '@chakra-ui/react'
import React, { useMemo } from 'react'
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

  /* Memoized grouping and sorting by column count for responsive grids */
  const sortedGroupedQuestions = useMemo(() => {
    const grouped = PRICING_INFO_QUESTIONS.reduce((acc, que) => {
      const columns = que.grid.columns!;
      if (!acc[columns]) {
        acc[columns] = [];
      }
      acc[columns].push(que);
      return acc;
    }, {} as Record<number, typeof PRICING_INFO_QUESTIONS>);

    /* Pre-sort entries by minimum display_order to avoid runtime sorting */
    return Object.entries(grouped).sort(([, questionsA], [, questionsB]) => {
      const minOrderA = Math.min(...questionsA.map(que => que.display_order));
      const minOrderB = Math.min(...questionsB.map(que => que.display_order));
      return minOrderA - minOrderB;
    });
  }, []);

  return (
    <Flex flexDir="column" gap={6} p={4}>
      {/* Dynamic pricing fields grouped by column layout */}
      {
        sortedGroupedQuestions.map(([columns, questions]) => (
          <SimpleGrid key={columns} columns={Number(columns)} gap={4}>
            {
              questions.map((que) => {
                const fieldError = errors[que.schema_key as keyof CreatePlanFormData];
                const fieldName = que.schema_key as keyof CreatePlanFormData;
                switch(que.type) {
                  case 'INPUT':
                    return (
                      <GridItem key={que.id} colSpan={que.grid.col_span}>
                        <Controller
                          name={fieldName}
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
        ))
      }

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