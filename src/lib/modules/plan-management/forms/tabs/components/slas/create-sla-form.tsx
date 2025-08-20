/* Dynamic form component for creating new SLAs with configurable fields and validation */
import React from 'react'
import { Box, Flex, HStack, SimpleGrid, GridItem, Alert } from '@chakra-ui/react'
import { Controller, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form'
import { lighten } from 'polished'
import { FiSave } from 'react-icons/fi'

/* Types */
import { CreateSlaFormData } from '@plan-management/schemas/validation/plans'

/* Constants */
import { GRAY_COLOR } from '@shared/config'
import { SLA_CREATE_FORM_CONFIG } from '@plan-management/config'

/* Components */
import { TextInputField, TextAreaField, SelectField, SwitchField, PrimaryButton } from '@shared/components'

interface CreateSLAFormProps {
  showCreateSla: boolean;
  createSlaForm: UseFormReturn<CreateSlaFormData, any, FieldValues>;
  createSlaSubmitting: boolean;
  handleCreateSla: SubmitHandler<CreateSlaFormData>;
}

const CreateSLAForm: React.FC<CreateSLAFormProps> = ({
  showCreateSla,
  createSlaForm,
  createSlaSubmitting,
  handleCreateSla
}) => {
  if (!showCreateSla) return null;

  return (
    <Box
      overflow="hidden"
      transition="all 0.3s ease-in-out"
      maxH={showCreateSla ? "700px" : "0"}
      opacity={showCreateSla ? 1 : 0}
    >
      <Box
        p={4}
        borderWidth={1}
        borderColor={lighten(0.3, GRAY_COLOR)}
        borderRadius="lg"
        bg={lighten(0.74, GRAY_COLOR)}
        mt={2}
      >

        <Flex flexDir="column" gap={4}>
          {/* Dynamic form fields rendered from configuration */}
          <SimpleGrid columns={2} gap={4}>
            {SLA_CREATE_FORM_CONFIG.sort((a, b) => a.display_order - b.display_order).map((field) => {
              const name = field.schema_key as keyof CreateSlaFormData;

              switch (field.type) {
                case 'INPUT':
                  return (
                    <GridItem key={field.id} colSpan={field.grid.col_span}>
                      <Controller
                        name={name}
                        control={createSlaForm.control}
                        render={({ field: controllerField, fieldState }) => (
                          <TextInputField
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

                case 'TEXTAREA':
                  return (
                    <GridItem key={field.id} colSpan={field.grid.col_span}>
                      <Controller
                        name={name}
                        control={createSlaForm.control}
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
                            isDebounced={false}
                          />
                        )}
                      />
                    </GridItem>
                  );

                case 'SELECT':
                  return (
                    <GridItem key={field.id} colSpan={field.grid.col_span}>
                      <Controller
                        name={name}
                        control={createSlaForm.control}
                        render={({ field: controllerField, fieldState }) => (
                          <SelectField
                            label={field.label}
                            value={controllerField.value || ''}
                            placeholder={field.placeholder || ''}
                            isInValid={!!fieldState.error}
                            required={field.is_required}
                            errorMessage={fieldState.error?.message || ''}
                            options={field.values || []}
                            onChange={controllerField.onChange}
                            name={controllerField.name}
                            size="lg"
                          />
                        )}
                      />
                    </GridItem>
                  );

                case 'TOGGLE':
                  return (
                    <GridItem key={field.id} colSpan={field.grid.col_span}>
                      <Controller
                        name={name}
                        control={createSlaForm.control}
                        render={({ field: controllerField, fieldState }) => (
                          <SwitchField
                            label={field.label}
                            value={Boolean(controllerField.value) || false}
                            onChange={controllerField.onChange}
                            name={controllerField.name}
                            isInValid={!!fieldState.error}
                            required={field.is_required}
                            errorMessage={fieldState.error?.message || ''}
                            activeText={field.toggle_text?.true}
                            inactiveText={field.toggle_text?.false}
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
          
          {/* Submit button with loading state */}
          <HStack justify="flex-end" gap={3}>
            <PrimaryButton
              onClick={createSlaForm.handleSubmit(handleCreateSla as SubmitHandler<FieldValues>)}
              leftIcon={createSlaSubmitting ? undefined : FiSave}
              loading={createSlaSubmitting}
              disabled={createSlaSubmitting}
            >
              {createSlaSubmitting ? 'Creating...' : 'Create'}
            </PrimaryButton>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default CreateSLAForm;