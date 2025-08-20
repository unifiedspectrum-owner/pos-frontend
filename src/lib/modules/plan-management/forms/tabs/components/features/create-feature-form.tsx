import React from 'react'
import { Box, Flex, HStack, SimpleGrid, GridItem } from '@chakra-ui/react'
import { Controller, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form'
import { lighten } from 'polished'
import { CreateFeatureFormData } from '@plan-management/schemas/validation/plans'
import { FEATURE_CREATE_FORM_CONFIG } from '@plan-management/config'
import { GRAY_COLOR } from '@shared/config'
import { TextInputField, TextAreaField, PrimaryButton } from '@shared/components'

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
            {FEATURE_CREATE_FORM_CONFIG.sort((a, b) => a.display_order - b.display_order).map((field) => {
              const name = field.schema_key as keyof CreateFeatureFormData /* Field name for form control */
              const colSpan = field.grid.col_span /* Grid column span */;
              
              switch (field.type) {
                case 'INPUT':
                  return (
                    <GridItem key={field.id} colSpan={colSpan}>
                      <Controller
                        name={name}
                        control={createFeatureForm.control}
                        render={({ field: controllerField, fieldState }) => (
                          <TextInputField
                            label={field.label}
                            value={controllerField.value}
                            placeholder={field.placeholder || ''}
                            onChange={controllerField.onChange}
                            onBlur={controllerField.onBlur}
                            name={controllerField.name}
                            isInValid={!!fieldState.error}
                            required={field.is_required}
                            errorMessage={fieldState.error?.message || ''}
                          />
                        )}
                      />
                    </GridItem>
                  );

                case 'TEXTAREA':
                  return (
                    <GridItem key={field.id} colSpan={colSpan}>
                      <Controller
                        name={name}
                        control={createFeatureForm.control}
                        render={({ field: controllerField, fieldState }) => (
                          <TextAreaField
                            label={field.label}
                            value={controllerField.value || ''}
                            placeholder={field.placeholder || ''}
                            onChange={controllerField.onChange}
                            onBlur={controllerField.onBlur}
                            name={controllerField.name}
                            isInValid={!!fieldState.error}
                            required={field.is_required}
                            errorMessage={fieldState.error?.message || ''}
                          />
                        )}
                      />
                    </GridItem>
                  );

                default:
                  return null;
              }
            })}
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