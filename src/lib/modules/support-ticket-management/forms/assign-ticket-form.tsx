"use client"

/* Libraries imports */
import React, { useEffect } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Flex, VStack, Icon, GridItem, SimpleGrid, Text, HStack, Badge } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaTicketAlt, FaUserCheck } from 'react-icons/fa'
import { MdConfirmationNumber } from 'react-icons/md'

/* Shared module imports */
import { SelectField, TextAreaField, PrimaryButton, LoaderWrapper } from '@shared/components'
import { FORM_FIELD_TYPES, STATUS_BADGE_CONFIG } from '@shared/constants'
import { PRIMARY_COLOR } from '@shared/config'

/* Support ticket module imports */
import { assignTicketSchema, AssignTicketFormSchema } from '@support-ticket-management/schemas'
import { TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES, TICKET_ASSIGNMENT_FORM_QUESTIONS, TICKET_STATUS_LABELS } from '@support-ticket-management/constants'
import { useAssignmentOperations } from '@support-ticket-management/hooks'
import { TicketStatus } from '@support-ticket-management/types'

/* User management module imports */
import { useUsers } from '@user-management/hooks'

/* Component props interface */
interface AssignTicketFormProps {
  ticketId: string
  ticketNumber?: string
  ticketSubject?: string
  ticketStatus?: TicketStatus
  onSuccess?: () => void
  onCancel?: () => void
}

/* Assign ticket form component following TICKET_ASSIGNMENT_FORM_QUESTIONS pattern */
const AssignTicketForm: React.FC<AssignTicketFormProps> = ({ ticketId, ticketNumber, ticketSubject, ticketStatus, onSuccess, onCancel }) => {
  /* Use assignment operations hook */
  const { currentAssignment, isFetchingAssignment, fetchCurrentAssignment, assignTicketToUser, isAssigning } = useAssignmentOperations()

  /* Fetch users for dropdown */
  const { userSelectOptions, loading: loadingUsers } = useUsers({
    initialLimit: 100,
    autoFetch: true
  })

  /* Form configuration with Zod validation */
  const methods = useForm<AssignTicketFormSchema>({
    resolver: zodResolver(assignTicketSchema),
    defaultValues: TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES,
  })

  const { control, handleSubmit, formState: { errors } } = methods

  /* Fetch current assignment when form loads */
  useEffect(() => {
    if (ticketId) {
      fetchCurrentAssignment(ticketId)
    }
  }, [ticketId, fetchCurrentAssignment])

  /* Handle form submission */
  const onSubmit = async (data: AssignTicketFormSchema) => {
    /* Call API to assign ticket */
    const success = await assignTicketToUser(ticketId, data)

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
                      Assigning Ticket
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
                  {ticketStatus && (
                    <Badge
                      fontWeight="bold"
                      color={STATUS_BADGE_CONFIG[ticketStatus]?.color}
                      borderRadius={20}
                      py={1}
                      px={2}
                      borderWidth={2}
                      borderColor={STATUS_BADGE_CONFIG[ticketStatus]?.borderColor}
                      bg={STATUS_BADGE_CONFIG[ticketStatus]?.bg}
                    >
                      {TICKET_STATUS_LABELS[ticketStatus as keyof typeof TICKET_STATUS_LABELS] || ticketStatus}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="blue.600">
                  Select a user to assign this ticket for resolution
                </Text>
              </VStack>
            )}

            {/* Current assignment section */}
            <LoaderWrapper
              isLoading={isFetchingAssignment}
              loadingText="Loading current assignment..."
              spinnerSize="sm"
              minHeight="80px"
              loadingBg="gray.50"
            >
              {currentAssignment?.assigned_to_user_id && (
                <VStack align="stretch" gap={2} p={4} bg="green.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="green.500">
                  <HStack gap={2}>
                    <Icon as={FaUserCheck} color="green.600" boxSize={4} />
                    <Text fontSize="sm" fontWeight="600" color="green.700">
                      Currently Assigned
                    </Text>
                  </HStack>
                  <VStack align="start" gap={1}>
                    <HStack gap={2}>
                      <Text fontSize="sm" color="gray.600">User:</Text>
                      <Text fontSize="sm" fontWeight="bold" color="gray.900">
                        {currentAssignment.assigned_to_user_name || `ID: ${currentAssignment.assigned_to_user_id}`}
                      </Text>
                    </HStack>
                    {currentAssignment.assigned_to_role_name && (
                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.600">Role:</Text>
                        <Badge colorScheme="green" fontSize="xs">
                          {currentAssignment.assigned_to_role_name}
                        </Badge>
                      </HStack>
                    )}
                    {currentAssignment.assigned_at && (
                      <Text fontSize="xs" color="gray.500">
                        Assigned on: {new Date(currentAssignment.assigned_at).toLocaleString()}
                      </Text>
                    )}
                  </VStack>
                  <Text fontSize="xs" color="green.600" mt={1}>
                    You can reassign this ticket to a different user below
                  </Text>
                </VStack>
              )}
            </LoaderWrapper>

            {/* Render form fields dynamically based on TICKET_ASSIGNMENT_FORM_QUESTIONS */}
            <SimpleGrid w="100%" columns={[1, 4]} gap={4}>
              {TICKET_ASSIGNMENT_FORM_QUESTIONS
                .filter((field) => field.is_active)
                .sort((a, b) => Number(a.display_order) - Number(b.display_order))
                .map((field) => {
                  const schemaKey = field.schema_key as keyof AssignTicketFormSchema
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

                  /* Render SELECT field for user assignment */
                  if (field.type === FORM_FIELD_TYPES.SELECT && schemaKey === 'user_id') {
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
                              options={ loadingUsers ? [] : userSelectOptions}
                            />
                          )}
                        />
                      </GridItem>
                    )
                  }

                  /* Render TEXTAREA field for assignment reason */
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
                disabled={isAssigning}
                isLoading={isAssigning}
                leftIcon={FaTicketAlt}
                buttonText="Assign Ticket"
                loadingText="Assigning..."
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

export default AssignTicketForm
