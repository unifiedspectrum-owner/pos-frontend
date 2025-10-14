"use client"

/* Libraries imports */
import React, { useState } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Flex, VStack, Icon, GridItem, SimpleGrid, Heading, Text } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaPaperPlane, FaReply } from 'react-icons/fa'

/* Shared module imports */
import { SwitchField, FileField, RichTextEditorField, PrimaryButton } from '@shared/components'
import { FORM_FIELD_TYPES } from '@shared/constants'
import { PRIMARY_COLOR } from '@shared/config'
import { fileToBase64 } from '@shared/utils'

/* Support ticket module imports */
import { createTicketCommunicationSchema, CreateTicketCommentFormSchema } from '@support-ticket-management/schemas'
import { TICKET_COMMUNICATION_FORM_DEFAULT_VALUES, TICKET_COMMUNICATION_FORM_QUESTIONS } from '@support-ticket-management/constants'
import { useCommentOperations } from '@support-ticket-management/hooks'

/* Component props interface */
interface AddCommentFormProps {
  ticketId?: string
  onRefresh?: () => void
}

/* Add comment form component following TICKET_COMMUNICATION_FORM_QUESTIONS pattern */
const AddCommentForm: React.FC<AddCommentFormProps> = ({ ticketId, onRefresh }) => {
  /* Use comment operations hook */
  const { addTicketComment, isAddingComment } = useCommentOperations()

  /* File field reset key */
  const [fileFieldKey, setFileFieldKey] = useState<number>(0)

  /* Form configuration with Zod validation */
  const methods = useForm<CreateTicketCommentFormSchema>({
    resolver: zodResolver(createTicketCommunicationSchema),
    defaultValues: TICKET_COMMUNICATION_FORM_DEFAULT_VALUES
  })

  const { control, handleSubmit, formState: { errors }, reset } = methods

  /* Handle form submission */
  const onSubmit = async (data: CreateTicketCommentFormSchema) => {
    if (!data.message_content?.trim() || !ticketId) {
      return
    }

    /* Call API to add comment */
    const success = await addTicketComment(ticketId, data)

    if (success) {
      /* Reset form after successful submission */
      reset(TICKET_COMMUNICATION_FORM_DEFAULT_VALUES)

      /* Force file field to reset by changing key */
      setFileFieldKey(prev => prev + 1)

      /* Trigger parent component refresh */
      if (onRefresh) {
        onRefresh()
      }
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
        {/* Form header */}
        <Flex
          align="center"
          gap={3}
          p={4}
          bg={lighten(0.47, PRIMARY_COLOR)}
          borderBottomWidth={1}
          borderColor="gray.200"
        >
          <Box
            p={2}
            bg="white"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="sm"
          >
            <Icon as={FaReply} color={PRIMARY_COLOR} boxSize={4} />
          </Box>
          <Box>
            <Heading as="h4" size="sm" fontWeight="700" color="gray.800" mb={0}>
              Add Response
            </Heading>
            <Text fontSize="xs" color="gray.600" fontWeight="500">
              Reply to this ticket or add an internal note
            </Text>
          </Box>
        </Flex>

        {/* Form content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack align="stretch" gap={4} p={5}>
            {/* Render form fields dynamically based on TICKET_COMMUNICATION_FORM_QUESTIONS */}
            <SimpleGrid w="100%" columns={[1, 4]} gap={2}>
              {TICKET_COMMUNICATION_FORM_QUESTIONS
                .filter((field) => field.is_active)
                .sort((a, b) => Number(a.display_order) - Number(b.display_order))
                .map((field) => {
                  const schemaKey = field.schema_key as keyof CreateTicketCommentFormSchema
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

                  /* Render WYSIWYG editor field using TiptapField */
                  if (field.type === FORM_FIELD_TYPES.WYSIWYG_EDITOR) {
                    return (
                      <GridItem key={field.id} rowSpan={2} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field: controllerField }) => (
                            <RichTextEditorField
                              {...commonProps}
                              value={controllerField.value?.toString() || ''}
                              onChange={controllerField.onChange}
                            />
                          )}
                        />
                      </GridItem>
                    )
                  }

                  /* Render TOGGLE field */
                  if (field.type === FORM_FIELD_TYPES.TOGGLE) {
                    return (
                      <GridItem key={field.id} alignSelf={'flex-end'} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field: controllerField }) => (
                            <SwitchField
                              {...commonProps}
                              value={Boolean(controllerField.value)}
                              onChange={controllerField.onChange}
                              activeText={field.toggle_text?.true}
                              inactiveText={field.toggle_text?.false}
                            />
                          )}
                        />
                      </GridItem>
                    )
                  }

                  /* Render FILE field */
                  if (field.type === FORM_FIELD_TYPES.FILE) {
                    return (
                      <GridItem key={`${field.id}-${fileFieldKey}`} colSpan={[1, field.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field: controllerField }) => {
                            /* Handle file upload and convert to schema format */
                            const handleFileChange = async (files: File[]) => {
                              try {
                                const attachments = await Promise.all(
                                  files.map(async (file) => {
                                    const base64Content = await fileToBase64(file)
                                    const fileExtension = file.name.split('.').pop() || ''

                                    return {
                                      filename: file.name,
                                      file_size: file.size,
                                      mime_type: file.type,
                                      file_extension: fileExtension,
                                      file_content: base64Content,
                                      is_public: false
                                    }
                                  })
                                )

                                controllerField.onChange(attachments)
                              } catch (error) {
                                console.error('Error processing files:', error)
                              }
                            }

                            return (
                              <FileField
                                key={fileFieldKey}
                                {...commonProps}
                                value={Array.isArray(controllerField.value) ? controllerField.value : []}
                                onChange={handleFileChange}
                                height="150px"
                              />
                            )
                          }}
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
              pt={3}
              borderTopWidth={1}
              borderColor="gray.100"
            >
              {/* Submit button */}
              <PrimaryButton
                type="submit"
                size="md"
                disabled={isAddingComment}
                isLoading={isAddingComment}
                leftIcon={FaPaperPlane}
                buttonText="Send Reply"
                loadingText="Sending..."
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

export default AddCommentForm
