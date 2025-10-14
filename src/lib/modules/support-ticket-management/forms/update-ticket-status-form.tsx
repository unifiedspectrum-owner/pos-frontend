"use client"

/* Libraries imports */
import React from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Flex, VStack, Icon, GridItem, SimpleGrid, Text, HStack, Badge } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaExchangeAlt } from 'react-icons/fa'
import { MdConfirmationNumber } from 'react-icons/md'

/* Shared module imports */
import { SelectField, TextAreaField, PrimaryButton } from '@shared/components'
import { FORM_FIELD_TYPES, STATUS_BADGE_CONFIG } from '@shared/constants'
import { PRIMARY_COLOR } from '@shared/config'

/* Support ticket module imports */
import { updateTicketStatusSchema, UpdateTicketStatusFormSchema } from '@support-ticket-management/schemas'
import { TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES, TICKET_STATUS_UPDATE_FORM_QUESTIONS, TICKET_STATUS_OPTIONS, TICKET_STATUS_LABELS } from '@support-ticket-management/constants'
import { useTicketOperations } from '@support-ticket-management/hooks'
import { TicketStatus } from '@support-ticket-management/types'

/* Component props interface */
interface UpdateTicketStatusFormProps {
  ticketId: string
  ticketNumber?: string
  ticketSubject?: string
  currentStatus?: TicketStatus
  onSuccess?: () => void
  onCancel?: () => void
}

/* Update ticket status form component following TICKET_STATUS_UPDATE_FORM_QUESTIONS pattern */
const UpdateTicketStatusForm: React.FC<UpdateTicketStatusFormProps> = ({ ticketId, ticketNumber, ticketSubject, currentStatus, onSuccess, onCancel }) => {
  /* Use ticket operations hook */
  const { updateTicketStatus, isUpdatingStatus } = useTicketOperations()

  /* Form configuration with Zod validation */
  const methods = useForm<UpdateTicketStatusFormSchema>({
    resolver: zodResolver(updateTicketStatusSchema),
    defaultValues: {
      status: currentStatus || TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status,
      status_reason: TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES.status_reason
    },
  })

  const { control, handleSubmit, formState: { errors } } = methods

  /* Handle form submission */
  const onSubmit = async (data: UpdateTicketStatusFormSchema) => {
    /* Call API to update ticket status */
    const success = await updateTicketStatus(ticketId, data)

    if (success && onSuccess) {
      onSuccess()
    }
  }

  return (
    <FormProvider {...methods}>
      <Box
        borderWidth={1}
        borderRadius="16px"
        borderColor="gray.200"
        bg="white"
        boxShadow="md"
        overflow="hidden"
        transition="all 0.2s"
        _hover={{
          boxShadow: 'lg',
          borderColor: lighten(0.2, PRIMARY_COLOR)
        }}
      >
        {/* Form content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack align="stretch" gap={4} p={5}>
            {/* Ticket information section */}
            {ticketNumber && (
              <VStack align="stretch" gap={2} p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                <HStack justify="space-between" align="start">
                  <VStack align="start" gap={1}>
                    <Text fontSize="sm" fontWeight="600" color="blue.700">
                      Updating Ticket Status
                    </Text>
                    <HStack gap={2}>
                      <Icon as={MdConfirmationNumber} color="blue.600" boxSize={4} />
                      <Text fontSize="md" fontWeight="bold" color="gray.900">
                        {ticketNumber}
                      </Text>
                    </HStack>
                    {ticketSubject && (
                      <Text fontSize="sm" color="gray.700">
                        {ticketSubject}
                      </Text>
                    )}
                  </VStack>
                  {currentStatus && (
                    <Badge
                      fontWeight="bold"
                      color={STATUS_BADGE_CONFIG[currentStatus]?.color}
                      borderRadius={20}
                      py={1}
                      px={2}
                      borderWidth={2}
                      borderColor={STATUS_BADGE_CONFIG[currentStatus]?.borderColor}
                      bg={STATUS_BADGE_CONFIG[currentStatus]?.bg}
                    >
                      {TICKET_STATUS_LABELS[currentStatus as keyof typeof TICKET_STATUS_LABELS] || currentStatus}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="blue.600">
                  Select a new status and provide a reason for the status change
                </Text>
              </VStack>
            )}

            {/* Render form fields dynamically based on TICKET_STATUS_UPDATE_FORM_QUESTIONS */}
            <SimpleGrid w="100%" columns={[1, 4]} gap={4}>
              {TICKET_STATUS_UPDATE_FORM_QUESTIONS
                .filter((field) => field.is_active)
                .sort((a, b) => Number(a.display_order) - Number(b.display_order))
                .map((field) => {
                  const schemaKey = field.schema_key as keyof UpdateTicketStatusFormSchema
                  const fieldError = errors[schemaKey]

                  /* Shared field properties */
                  const commonProps = {
                    name: schemaKey,
                    label: field.label,
                    placeholder: field.placeholder,
                    isInValid: !!fieldError,
                    required: field.is_required,
                    errorMessage: fieldError?.message,
                  }

                  /* Render SELECT field for status */
                  if (field.type === FORM_FIELD_TYPES.SELECT && schemaKey === 'status') {
                    return (
                      <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field: controllerField }) => (
                            <SelectField
                              {...commonProps}
                              value={controllerField.value?.toString() || ''}
                              onChange={controllerField.onChange}
                              options={TICKET_STATUS_OPTIONS}
                            />
                          )}
                        />
                      </GridItem>
                    )
                  }

                  /* Render TEXTAREA field for status change reason */
                  if (field.type === FORM_FIELD_TYPES.TEXTAREA) {
                    return (
                      <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field: controllerField }) => (
                            <TextAreaField
                              {...commonProps}
                              value={controllerField.value?.toString() || ''}
                              onChange={controllerField.onChange}
                              inputProps={{
                                rows: 3
                              }}
                            />
                          )}
                        />
                      </GridItem>
                    )
                  }

                  return null
                })}
            </SimpleGrid>

            {/* Form actions */}
            <Flex
              justify="flex-end"
              align="center"
              gap={3}
              pt={3}
              borderTopWidth={1}
              borderColor="gray.100"
            >
              {/* Cancel button */}
              {onCancel && (
                <PrimaryButton
                  type="button"
                  size="md"
                  onClick={onCancel}
                  buttonText="Cancel"
                  buttonProps={{
                    variant: "outline",
                    fontWeight: "600",
                    px: 6,
                    boxShadow: "sm"
                  }}
                />
              )}

              {/* Submit button */}
              <PrimaryButton
                type="submit"
                size="md"
                disabled={isUpdatingStatus}
                isLoading={isUpdatingStatus}
                leftIcon={FaExchangeAlt}
                buttonText="Update Status"
                loadingText="Updating..."
                buttonProps={{
                  fontWeight: "600",
                  px: 6,
                  boxShadow: "sm"
                }}
              />
            </Flex>
          </VStack>
        </form>
      </Box>
    </FormProvider>
  )
}

export default UpdateTicketStatusForm
