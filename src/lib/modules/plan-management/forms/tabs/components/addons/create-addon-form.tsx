/* Dynamic form component for creating new add-ons with configurable fields */

/* Libraries imports */
import React from 'react'
import { Box, Flex, HStack, SimpleGrid, GridItem } from '@chakra-ui/react'
import { Controller, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form'
import { lighten } from 'polished'
import { FiSave } from 'react-icons/fi'

/* Shared module imports */
import { TextInputField, TextAreaField, SelectField, SwitchField, PrimaryButton } from '@shared/components'
import { GRAY_COLOR } from '@shared/config'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan module imports */
import { CreateAddonFormData } from '@plan-management/schemas'
import { ADDON_FORM_QUESTIONS } from '@plan-management/constants'

interface CreateAddonFormProps {
  showCreateAddon: boolean;
  createAddonForm: UseFormReturn<CreateAddonFormData, any, FieldValues>;
  createAddonSubmitting: boolean;
  handleCreateAddon: SubmitHandler<CreateAddonFormData>;
}

const CreateAddonForm: React.FC<CreateAddonFormProps> = ({
  showCreateAddon,
  createAddonForm,
  createAddonSubmitting,
  handleCreateAddon
}) => {
  if (!showCreateAddon) return null;

  return (
    <Box
      overflow="hidden"
      transition="all 0.3s ease-in-out"
      maxH={showCreateAddon ? "600px" : "0"}
      opacity={showCreateAddon ? 1 : 0}
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
            {ADDON_FORM_QUESTIONS
              .filter((field) => field.is_active) /* Only render active fields */
              .sort((a, b) => Number(a.display_order) - Number(b.display_order)) /* Sort by display order */
              .map((field) => {
                const schemaKey = field.schema_key as keyof CreateAddonFormData

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
                          control={createAddonForm.control}
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

                  case FORM_FIELD_TYPES.SELECT: /* Dropdown select fields */
                    return (
                      <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={createAddonForm.control}
                          render={({ field: controllerField, fieldState }) => (
                            <SelectField
                              {...commonProps}
                              value={controllerField.value || ''}
                              onChange={controllerField.onChange}
                              isInValid={!!fieldState.error}
                              errorMessage={fieldState.error?.message || ''}
                              options={field.values || []}
                              size="lg"
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
                          control={createAddonForm.control}
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

                  case FORM_FIELD_TYPES.TOGGLE: /* Switch/toggle fields for boolean values */
                    return (
                      <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={createAddonForm.control}
                          render={({ field: controllerField, fieldState }) => (
                            <SwitchField
                              {...commonProps}
                              value={Boolean(controllerField.value)}
                              onChange={controllerField.onChange}
                              isInValid={!!fieldState.error}
                              errorMessage={fieldState.error?.message || ''}
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
          
          {/* Submit button with loading state */}
          <HStack justify="flex-end" gap={3}>
            <PrimaryButton
              onClick={createAddonForm.handleSubmit(handleCreateAddon as SubmitHandler<FieldValues>)}
              leftIcon={createAddonSubmitting ? undefined : FiSave}
              loading={createAddonSubmitting}
              disabled={createAddonSubmitting}
            >
              {createAddonSubmitting ? 'Creating...' : 'Create'}
            </PrimaryButton>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default CreateAddonForm;