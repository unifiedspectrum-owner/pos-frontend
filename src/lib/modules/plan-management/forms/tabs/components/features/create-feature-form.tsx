/* Libraries imports */
import React from 'react'
import { Box, Flex, HStack, SimpleGrid, GridItem } from '@chakra-ui/react'
import { Controller, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form'
import { lighten } from 'polished'

/* Shared module imports */
import { TextInputField, TextAreaField, PrimaryButton } from '@shared/components'
import { GRAY_COLOR } from '@shared/config'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan module imports */
import { CreateFeatureFormData } from '@plan-management/schemas'
import { FEATURE_FORM_QUESTIONS } from '@plan-management/constants'

/* Create feature form component props */
interface CreateFeatureFormProps {
  showCreateFeature: boolean /* Show/hide form state */
  createFeatureForm: UseFormReturn<CreateFeatureFormData, any, FieldValues> /* React Hook Form instance */
  createFeatureSubmitting: boolean /* Is form currently submitting */
  handleCreateFeature: SubmitHandler<CreateFeatureFormData> /* Form submission handler */
}

/* Feature creation form component */
const CreateFeatureForm: React.FC<CreateFeatureFormProps> = ({
  showCreateFeature,
  createFeatureForm,
  createFeatureSubmitting,
  handleCreateFeature
}) => {
  if (!showCreateFeature) return null /* Don't render if form is hidden */;

  return (
    <Box overflow="hidden" transition="all 0.3s ease-in-out" maxH={"400px"}>
      <Box
        p={4} borderWidth={1} borderColor={lighten(0.3, GRAY_COLOR)}
        borderRadius="lg" bg={lighten(0.74, GRAY_COLOR)} mt={2}
      >
        <Flex flexDir="column" gap={4}>
          {/* Dynamic form fields based on configuration */}
          <SimpleGrid columns={1} gap={4}>
            {FEATURE_FORM_QUESTIONS
              .filter((field) => field.is_active) /* Only render active fields */
              .sort((a, b) => Number(a.display_order) - Number(b.display_order)) /* Sort by display order */
              .map((field) => {
                const schemaKey = field.schema_key as keyof CreateFeatureFormData

                /* Shared field properties for all input types */
                const commonProps = {
                  name: schemaKey,
                  label: field.label,
                  placeholder: field.placeholder,
                  required: field.is_required,
                }

                /* Render appropriate field type based on configuration */
                switch (field.type) {
                  case FORM_FIELD_TYPES.INPUT: /* Text input fields */
                    return (
                      <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={createFeatureForm.control}
                          render={({ field: controllerField, fieldState }) => (
                            <TextInputField
                              {...commonProps}
                              value={controllerField.value || ''}
                              onChange={controllerField.onChange}
                              onBlur={controllerField.onBlur}
                              isInValid={!!fieldState.error}
                              errorMessage={fieldState.error?.message || ''}
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
                          control={createFeatureForm.control}
                          render={({ field: controllerField, fieldState }) => (
                            <TextAreaField
                              {...commonProps}
                              value={controllerField.value || ''}
                              onChange={controllerField.onChange}
                              onBlur={controllerField.onBlur}
                              isInValid={!!fieldState.error}
                              errorMessage={fieldState.error?.message || ''}
                              inputProps={{
                                rows: 4
                              }}
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
          
          {/* Submit button with loading indicator */}
          <HStack justify="flex-end" gap={3}>
            <PrimaryButton
              onClick={createFeatureForm.handleSubmit(handleCreateFeature as SubmitHandler<FieldValues>)}
              loading={createFeatureSubmitting}
              disabled={createFeatureSubmitting}
            >
              {createFeatureSubmitting ? 'Creating...' : 'Create'}
            </PrimaryButton>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default CreateFeatureForm;