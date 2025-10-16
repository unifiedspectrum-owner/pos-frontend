/* Component for managing tiered volume discounts with dynamic form fields and confirmation dialogs */
import { Flex, SimpleGrid, GridItem, Text, Box, Button } from '@chakra-ui/react'
import React, { useCallback } from 'react'
import { useFormContext, useFieldArray, Controller, Path } from 'react-hook-form'
import { lighten } from 'polished'
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi'
import { MdDiscount } from 'react-icons/md'

/* Types */
import { CreatePlanFormData } from '@plan-management/schemas'

/* Constants */
import { GRAY_COLOR } from '@shared/config'
import { VOLUME_DISCOUNT_FIELD_CONFIG, PLAN_FORM_MODES } from '@plan-management/constants'

/* Hooks */
import { useResourceConfirmation } from '@plan-management/hooks'

/* Components */
import { PrimaryButton, EmptyStateContainer, ConfirmationDialog, TextInputField } from '@shared/components'
import { usePlanFormMode } from '@plan-management/contexts'

interface VolumeDiscountsProps {}

const VolumeDiscounts: React.FC<VolumeDiscountsProps> = () => {
  /* Get mode from context */
  const { mode } = usePlanFormMode()

  const { control, clearErrors } = useFormContext<CreatePlanFormData>();
  const isReadOnly = mode === PLAN_FORM_MODES.VIEW

  const { fields: volumeDiscounts, append, remove } = useFieldArray({
    control,
    name: 'volume_discounts'
  });

  /* Volume discount confirmation logic - use array index for both new and existing */
  const volumeDiscountResources = volumeDiscounts.map((discount, index) => ({
    id: index, // Always use array index for consistent deletion
    name: discount.name || `Volume Discount #${index + 1}`
  }));

  const {
    confirmState,
    handleRemoveWithConfirm: handleDeleteWithConfirm,
    handleConfirm,
    handleCancel,
  } = useResourceConfirmation({
    resources: volumeDiscountResources,
    selectedIds: [],
    onToggleSelection: () => {}, // Not used for deletion
    onRemoveSelection: (index: number) => {
      remove(index);
    },
    getResourceName: (item: { id: number; name: string }) => item.name,
    resourceType: 'Volume Discount'
  });

  /* Add new volume discount */
  const addVolumeDiscount = useCallback(() => {
    append({
      name: '',
      min_branches: '',
      max_branches: '',
      discount_percentage: ''
    });
  }, [append]);

  /* Handle delete click with confirmation */
  const handleDeleteClick = useCallback((index: number) => {
    handleDeleteWithConfirm(index);
  }, [handleDeleteWithConfirm]);

  return (
    <Box mt={8} pt={6} borderTopWidth={1} borderColor={lighten(0.3, GRAY_COLOR)}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="md" fontWeight="semibold" color={GRAY_COLOR} mb={4}>
          {isReadOnly ? `Volume Discounts (${volumeDiscounts.length})` : 'Volume Discounts'}
        </Text>
        {!isReadOnly && (
          <PrimaryButton onClick={addVolumeDiscount} leftIcon={FiPlus}>
            Add Volume Discount
          </PrimaryButton>
        )}
      </Flex>

      {volumeDiscounts.map((discount, index) => (
        <Box 
          key={discount.id} 
          p={4} 
          borderWidth={1} 
          borderColor={lighten(0.3, GRAY_COLOR)} 
          borderRadius="lg" 
          mb={4} 
          bg={lighten(0.74, GRAY_COLOR)}
        >
          <Flex align="center" justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="medium" color={GRAY_COLOR}>
              Volume Discount #{index + 1}
            </Text>
            {!isReadOnly && (
              <Button
                onClick={() => handleDeleteClick(index)}
                size="sm"
                variant="ghost"
                color="red.500"
              >
                <FiTrash2 size={16} />
              </Button>
            )}
          </Flex>
          
          <SimpleGrid columns={4} gap={4}>
            {VOLUME_DISCOUNT_FIELD_CONFIG.map(fieldConfig => (
              <GridItem key={`volume-${fieldConfig.id}-${index}-${fieldConfig.schema_key}`}>
                <Controller
                  name={`volume_discounts.${index}.${fieldConfig.schema_key}` as Path<CreatePlanFormData>}
                  control={control}
                  render={({ field: { onChange, onBlur, value, name }, fieldState: { error } }) => (
                    <TextInputField
                      label={fieldConfig.label}
                      value={value?.toString() || ''}
                      placeholder={fieldConfig.placeholder || ''}
                      onChange={(newValue) => {
                        clearErrors(`volume_discounts.${index}.${fieldConfig.schema_key}` as Path<CreatePlanFormData>)
                        clearErrors(`volume_discounts.${index}` as Path<CreatePlanFormData>)
                        clearErrors('volume_discounts')
                        onChange(newValue)
                      }}
                      onBlur={onBlur}
                      name={name}
                      isInValid={!isReadOnly && !!error}
                      required={fieldConfig.is_required && !isReadOnly}
                      errorMessage={!isReadOnly ? error?.message || "" : ""}
                      readOnly={isReadOnly}
                      disabled={isReadOnly}
                    />
                  )}
                />
              </GridItem>
            ))}
          </SimpleGrid>
        </Box>
      ))}

      {volumeDiscounts.length === 0 && (
        <EmptyStateContainer
          icon={isReadOnly 
            ? <MdDiscount size={48} color={lighten(0.2, GRAY_COLOR)} />
            : <FiInfo size={48} color={lighten(0.2, GRAY_COLOR)} />
          }
          title={isReadOnly ? "No volume discounts included" : "No volume discounts added yet"}
          description={isReadOnly 
            ? "This plan does not include any volume discounts"
            : 'Click "Add Volume Discount" to create tiered pricing based on branch count'
          }
          testId="volume-discounts-empty-state"
        />
      )}

      {/* Confirmation dialog for volume discount removal */}
      {!isReadOnly && (
        <ConfirmationDialog
          isOpen={confirmState.show}
          title="Remove Volume Discount"
          message={`Are you sure you want to remove "${confirmState.resourceName}"? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </Box>
  )
}

export default VolumeDiscounts;