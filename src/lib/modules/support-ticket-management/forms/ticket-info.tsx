/* Libraries imports */
import React, { useCallback } from 'react'
import { Flex, Heading, GridItem, SimpleGrid } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'

/* Shared module imports */
import { TextInputField, SelectField, TextAreaField, DateField, FileField } from '@shared/components'
import { FORM_FIELD_TYPES } from '@shared/constants'
import { fileToBase64 } from '@shared/utils/formatting'

/* Support ticket module imports */
import { CreateTicketFormSchema } from '@support-ticket-management/schemas'
import { TICKET_CREATION_FORM_QUESTIONS, TicketFormMode } from '@support-ticket-management/constants'
import { TenantBasicDetails } from '@tenant-management/types'
import { NavigationButtons } from '@support-ticket-management/forms'

/* Fields to hide in edit mode - constant outside component */
const HIDDEN_FIELDS_IN_EDIT_MODE = ['message_content', 'internal_notes', 'attachments'] as const

/* Component props interface */
interface TicketFormFieldsProps {
  mode?: TicketFormMode
  tenantSelectOptions: Array<{ label: string; value: string }>
  categorySelectOptions: Array<{ label: string; value: string }>
  tenantDetails: TenantBasicDetails[]
  onCancel?: () => void
  onSubmit?: () => void
  isSubmitting?: boolean
  submitText?: string
  loadingText?: string
}

/* Form fields component - must be inside FormProvider */
const TicketForm: React.FC<TicketFormFieldsProps> = ({
  mode,
  tenantSelectOptions,
  categorySelectOptions,
  tenantDetails,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitText,
  loadingText,
}) => {
  const { control, formState: { errors }, setValue } = useFormContext<CreateTicketFormSchema>() /* Form validation context */

  /* Handle tenant selection and auto-fill request details - memoized */
  const handleTenantChange = useCallback((value: string) => {
    /* Auto-fill request details if tenant is selected */
    if (value && tenantDetails) {
      const selectedTenant = tenantDetails.find(tenant => tenant.tenant_id === value)

      if (selectedTenant) {
        if (selectedTenant.organization_name) {
          setValue('requester_name', selectedTenant.organization_name)
        }
        if (selectedTenant.primary_email) {
          setValue('requester_email', selectedTenant.primary_email)
        }
        if (selectedTenant.primary_phone) {
          setValue('requester_phone', selectedTenant.primary_phone)
        }
      }
    }
  }, [tenantDetails, setValue])

  /* Memoized file to base64 converter */
  const handleFileChange = useCallback(async (files: File[], onChange: (value: any) => void) => {
    try {
      /* Convert each file to the expected attachment schema */
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

      /* Update form value with converted attachments */
      onChange(attachments)
    } catch (error) {
      console.error('Error processing files:', error)
    }
  }, [])

  return (
    <>
      {TICKET_CREATION_FORM_QUESTIONS.map((section) => {
        /* Filter section questions based on mode */
        const filteredQuestions = section.questions
          .filter((field) => field.is_active) /* Only render active fields */
          .filter((field) => {
            /* In edit mode, hide specific fields */
            if (mode === 'EDIT' && HIDDEN_FIELDS_IN_EDIT_MODE.includes(field.schema_key as any)) {
              return false
            }
            return true
          })
          .sort((a, b) => Number(a.display_order) - Number(b.display_order)) /* Sort by display order */

        /* Skip rendering entire section if no questions remain after filtering */
        if (filteredQuestions.length === 0) {
          return null
        }

        return (
        <Flex key={section.id} flexDir="column" gap={4} mb={6}>
          {/* Section heading with icon */}
          <Flex align="center" gap={2}>
            <section.icon size={20} />
            <Heading as="h3" size="md" fontWeight="600">
              {section.heading}
            </Heading>
          </Flex>

          {/* Section fields */}
          <SimpleGrid w={'100%'} columns={[1, 8]} gap={6}>
            {filteredQuestions.map((field) => {
                const schemaKey = field.schema_key as keyof CreateTicketFormSchema
                const fieldError = errors[schemaKey]

                /* Shared field properties for all input types */
                const commonProps = {
                  name: schemaKey,
                  label: field.label,
                  placeholder: field.placeholder,
                  isInValid: !!fieldError,
                  required: field.is_required,
                  errorMessage: fieldError?.message,
                  readOnly: field.disabled,
                  disabled: field.disabled,
                }

                /* Render appropriate field type based on configuration */
                if (field.type === FORM_FIELD_TYPES.INPUT) {
                  return (
                    <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                      <Controller
                        name={schemaKey}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextInputField
                            {...commonProps}
                            value={controllerField.value?.toString() || ''}
                            onChange={controllerField.onChange}
                            onBlur={controllerField.onBlur}
                          />
                        )}
                      />
                    </GridItem>
                  )
                }

                if (field.type === FORM_FIELD_TYPES.SELECT) {
                  return (
                    <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                      <Controller
                        name={schemaKey}
                        control={control}
                        render={({ field: controllerField }) => {
                          /* Determine which options to use */
                          const options = schemaKey === 'tenant_id' ? tenantSelectOptions : categorySelectOptions

                          /* Handle tenant change with memoized callback */
                          const handleChange = schemaKey === 'tenant_id'
                            ? (value: string) => {
                                controllerField.onChange(value)
                                handleTenantChange(value)
                              }
                            : controllerField.onChange

                          return (
                            <SelectField
                              {...commonProps}
                              value={controllerField.value?.toString() || ''}
                              onChange={handleChange}
                              options={options}
                            />
                          )
                        }}
                      />
                    </GridItem>
                  )
                }

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
                            onBlur={controllerField.onBlur}
                          />
                        )}
                      />
                    </GridItem>
                  )
                }

                if (field.type === FORM_FIELD_TYPES.DATE) {
                  return (
                    <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                      <Controller
                        name={schemaKey}
                        control={control}
                        render={({ field: controllerField }) => (
                          <DateField
                            {...commonProps}
                            value={controllerField.value?.toString() || ''}
                            onChange={controllerField.onChange}
                          />
                        )}
                      />
                    </GridItem>
                  )
                }

                if (field.type === FORM_FIELD_TYPES.FILE) {
                  return (
                    <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
                      <Controller
                        name={schemaKey}
                        control={control}
                        render={({ field: controllerField }) => (
                          <FileField
                            {...commonProps}
                            value={controllerField.value || []}
                            onChange={(files) => handleFileChange(files, controllerField.onChange)}
                            height={'200px'}
                          />
                        )}
                      />
                    </GridItem>
                  )
                }

                return null /* Unsupported field type */
              })
            }
          </SimpleGrid>
        </Flex>
        )
      })}

      {/* Navigation buttons - conditionally rendered */}
      {onSubmit && onCancel && (
        <NavigationButtons
          onCancel={onCancel}
          onSubmit={onSubmit}
          loading={isSubmitting}
          submitText={submitText || 'Submit'}
          loadingText={loadingText || 'Submitting...'}
        />
      )}
    </>
  )
}

export default TicketForm
