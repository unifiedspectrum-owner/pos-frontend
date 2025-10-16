/* Configuration panel for selected add-ons with quantity and settings management */

/* Libraries imports */
import React from 'react'
import { Box, Text, Flex, Button, SimpleGrid, GridItem, Alert } from '@chakra-ui/react'
import { Controller, Control, FieldErrors, Path, FieldArrayWithId } from 'react-hook-form'
import { lighten } from 'polished'
import { FiTrash2 } from 'react-icons/fi'

/* Shared module imports */
import { SwitchField, TextInputField, SelectField } from '@shared/components'
import { GRAY_COLOR } from '@shared/config'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan module imports */
import { Addon } from '@plan-management/types'
import { CreatePlanFormData } from '@plan-management/schemas'
import { ADDONS_INFO_QUESTIONS } from '@plan-management/constants'

type AddonAssignmentFieldArray = FieldArrayWithId<CreatePlanFormData, "addon_assignments", "id">;

interface SelectedAddonsConfigurationProps {
  addonAssignments: AddonAssignmentFieldArray[]
  addons: Addon[]
  errors: FieldErrors<CreatePlanFormData>
  control: Control<CreatePlanFormData>
  onRemoveAddon: (assignmentIndex: number) => void
}

const SelectedAddonsConfiguration: React.FC<SelectedAddonsConfigurationProps> = ({
  addonAssignments,
  addons,
  errors,
  control,
  onRemoveAddon
}) => {
  if (addonAssignments.length === 0) return null

  return (
    <Box>
      <Text fontSize="md" fontWeight="semibold" color={GRAY_COLOR} mb={4}>
        Selected Add-ons Configuration ({addonAssignments.length})
      </Text>
      
      {/* Global addon assignments validation error */}
      {errors.addon_assignments && typeof errors.addon_assignments.message === 'string' && (
        <Alert.Root status="error" borderRadius="lg" mb={4}>
          <Alert.Indicator />
          <Alert.Title>{errors.addon_assignments.message}</Alert.Title>
        </Alert.Root>
      )}

      {/* Individual addon configuration cards */}
      {addonAssignments.map((assignment, assignmentIndex) => {
        const addon = addons.find(a => a.id === assignment.addon_id);
        const sortedQuestions = ADDONS_INFO_QUESTIONS.filter(que => que.is_active).sort((a, b) => a.display_order - b.display_order);
        
        return (
          <Box 
            key={assignment.addon_id || `addon-${assignmentIndex}`} 
            p={4} 
            borderWidth={1} 
            borderColor={lighten(0.3, GRAY_COLOR)} 
            borderRadius="lg" 
            mb={4} 
            bg={lighten(0.74, GRAY_COLOR)}
          >
            {/* Addon configuration header with remove button */}
            <Flex align="center" justify="space-between" mb={3}>
              <Text fontSize="sm" fontWeight="medium" color={GRAY_COLOR}>
                {addon?.name || `Add-on #${assignment.addon_id}`}
              </Text>
              <Button
                onClick={() => onRemoveAddon(assignmentIndex)}
                size="sm"
                variant="ghost"
                color="red.500"
              >
                <FiTrash2 size={16} />
              </Button>
            </Flex>
            
            {/* Addon configuration fields grid */}
            <SimpleGrid columns={3} gap={4} mb={4}>
              {sortedQuestions.map((field) => {
                const fieldPath = `addon_assignments.${assignmentIndex}.${field.schema_key}`;
                const addon = addons.find(a => a.id === assignment.addon_id);

                /* Render appropriate field type based on configuration */
                switch(field.type) {
                  case FORM_FIELD_TYPES.INPUT: /* Text input fields */
                    if (field.schema_key === "addon_name") {
                      /* Special case for addon name - show as disabled */
                      return (
                        <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                          <TextInputField
                            label={field.label}
                            value={addon?.name || `Add-on #${assignment.addon_id}`}
                            placeholder={field.placeholder ?? ''}
                            onChange={() => {}} /* No-op since it's disabled */
                            name="addon_name"
                            isInValid={false}
                            required={field.is_required}
                            errorMessage=""
                            disabled={field.disabled || false}
                            isDebounced={false}
                          />
                        </GridItem>
                      )
                    } else {
                      /* Regular number inputs */
                      return (
                        <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                          <Controller
                            name={fieldPath as Path<CreatePlanFormData>}
                            control={control}
                            render={({ field: controllerField, fieldState }) => (
                              <TextInputField
                                label={field.label}
                                value={controllerField.value?.toString() || ''}
                                placeholder={field.placeholder ?? ''}
                                onChange={(e) => controllerField.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                onBlur={controllerField.onBlur}
                                name={controllerField.name}
                                isInValid={!!fieldState.error}
                                required={field.is_required}
                                errorMessage={fieldState.error?.message || ""}
                                isDebounced={true}
                                debounceMs={300}
                              />
                            )}
                          />
                        </GridItem>
                      )
                    }

                  case FORM_FIELD_TYPES.SELECT: /* Dropdown select fields */
                    return (
                      <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={fieldPath as Path<CreatePlanFormData>}
                          control={control}
                          render={({ field: controllerField, fieldState }) => (
                            <SelectField
                              label={field.label}
                              value={String(controllerField.value || field.values?.[0]?.value || 'basic')}
                              placeholder={field.placeholder}
                              isInValid={!!fieldState.error}
                              required={false}
                              errorMessage={fieldState.error?.message || ''}
                              options={field.values || []}
                              onChange={controllerField.onChange}
                              name={fieldPath}
                              size="lg"
                            />
                          )}
                        />
                      </GridItem>
                    )

                  case FORM_FIELD_TYPES.TOGGLE: /* Switch/toggle fields for boolean values */
                    return (
                      <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={fieldPath as Path<CreatePlanFormData>}
                          control={control}
                          render={({ field: controllerField, fieldState }) => (
                            <SwitchField
                              label={field.label}
                              value={Boolean(controllerField.value)}
                              onChange={controllerField.onChange}
                              name={controllerField.name}
                              isInValid={!!fieldState.error}
                              required={field.is_required}
                              errorMessage={fieldState.error?.message || ""}
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
              })}
            </SimpleGrid>
          </Box>
        );
      })}
    </Box>
  )
}

export default SelectedAddonsConfiguration