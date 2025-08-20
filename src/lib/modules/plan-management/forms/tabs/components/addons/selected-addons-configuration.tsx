/* Configuration panel for selected add-ons with quantity and settings management */
import React from 'react'
import { Box, Text, Flex, Button, SimpleGrid, GridItem, Alert } from '@chakra-ui/react'
import { Controller, Control, FieldErrors } from 'react-hook-form'
import { lighten } from 'polished'
import { FiTrash2 } from 'react-icons/fi'

/* Types */
import { Addon } from '@plan-management/types'
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans'
import { Path, FieldArrayWithId } from 'react-hook-form'

/* Constants */
import { GRAY_COLOR } from '@shared/config'
import { ADDONS_INFO_QUESTIONS } from '@plan-management/config'

/* Components */
import { SwitchField, TextInputField, SelectField } from '@shared/components'

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
        const sortedQuestions = ADDONS_INFO_QUESTIONS.sort((a, b) => a.display_order - b.display_order);
        
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
              {sortedQuestions.map((que) => {
                const fieldPath = `addon_assignments.${assignmentIndex}.${que.schema_key}`;
                const addon = addons.find(a => a.id === assignment.addon_id);
                
                switch(que.type) {
                  case "INPUT":
                    if (que.schema_key === "addon_name") {
                      /* Special case for addon name - show as disabled */
                      return (
                        <GridItem key={que.id} colSpan={que.grid.col_span}>
                          <TextInputField
                            label={que.label}
                            value={addon?.name || `Add-on #${assignment.addon_id}`}
                            placeholder={que.placeholder ?? ''}
                            onChange={() => {}} /* No-op since it's disabled */
                            isInValid={false}
                            required={que.is_required}
                            errorMessage=""
                            disabled={que.disabled || false}
                            isDebounced={false}
                          />
                        </GridItem>
                      );
                    } else {
                      /* Regular number inputs */
                      return (
                        <GridItem key={que.id} colSpan={que.grid.col_span}>
                          <Controller
                            name={fieldPath as Path<CreatePlanFormData>}
                            control={control}
                            render={({ field: { onChange, onBlur, value, name }, fieldState: { error } }) => (
                              <TextInputField
                                label={que.label}
                                value={value?.toString() || ''}
                                placeholder={que.placeholder ?? ''}
                                onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                                onBlur={onBlur}
                                name={name}
                                isInValid={!!error}
                                required={que.is_required}
                                errorMessage={error?.message || ""}
                                isDebounced={true}
                                debounceMs={300}
                              />
                            )}
                          />
                        </GridItem>
                      );
                    }

                  case "SELECT":
                    return (
                      <GridItem key={que.id} colSpan={que.grid.col_span}>
                        <Controller
                          name={fieldPath as Path<CreatePlanFormData>}
                          control={control}
                          render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <SelectField
                              label={que.label}
                              value={String(value || que.values?.[0]?.value || 'basic')}
                              placeholder={que.placeholder}
                              isInValid={!!error}
                              required={false}
                              errorMessage={error?.message || ''}
                              options={que.values || []}
                              onChange={onChange}
                              name={fieldPath}
                              size="lg"
                            />
                          )}
                        />
                      </GridItem>
                    );

                  case "TOGGLE":
                    return (
                      <GridItem key={que.id} colSpan={que.grid.col_span}>
                        <Controller
                          name={fieldPath as Path<CreatePlanFormData>}
                          control={control}
                          render={({ field: { onChange, value, name }, fieldState: { error } }) => (
                            <SwitchField
                              label={que.label}
                              value={Boolean(value) || false}
                              onChange={onChange}
                              name={name}
                              isInValid={!!error}
                              required={que.is_required}
                              errorMessage={error?.message || ""}
                              activeText={que.toggle_text?.true}
                              inactiveText={que.toggle_text?.false}
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
          </Box>
        );
      })}
    </Box>
  )
}

export default SelectedAddonsConfiguration