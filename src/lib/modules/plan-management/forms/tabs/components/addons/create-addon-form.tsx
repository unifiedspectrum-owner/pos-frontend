/* Dynamic form component for creating new add-ons with configurable fields */
import React from 'react'
import { Box, Flex, HStack, SimpleGrid, GridItem } from '@chakra-ui/react'
import { Controller, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form'
import { lighten } from 'polished'
import { FiSave } from 'react-icons/fi'

/* Types */
import { CreateAddonFormData } from '@plan-management/schemas/validation/plans'

/* Constants */
import { GRAY_COLOR } from '@shared/config'
import { ADDON_CREATE_FORM_CONFIG } from '@plan-management/config'

/* Components */
import { TextInputField, TextAreaField, SelectField, SwitchField, PrimaryButton } from '@shared/components'

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
            {ADDON_CREATE_FORM_CONFIG.filter(field => field.is_active).sort((a, b) => a.display_order - b.display_order).map((field) => {
              const colSpan =  field.grid.col_span;
              const name = field.schema_key as keyof CreateAddonFormData;

              switch (field.type) {
                case 'INPUT':
                  return (
                    <GridItem key={field.id} colSpan={colSpan}>
                      <Controller
                        name={name}
                        control={createAddonForm.control}
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

                case 'SELECT':
                  return (
                    <GridItem key={field.id} colSpan={colSpan}>
                      <Controller
                        name={name}
                        control={createAddonForm.control}
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

                case 'TEXTAREA':
                  return (
                    <GridItem key={field.id} colSpan={colSpan}>
                      <Controller
                        name={name}
                        control={createAddonForm.control}
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

                case 'TOGGLE':
                  return (
                    <GridItem key={field.id} colSpan={colSpan}>
                      <Controller
                        name={name}
                        control={createAddonForm.control}
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