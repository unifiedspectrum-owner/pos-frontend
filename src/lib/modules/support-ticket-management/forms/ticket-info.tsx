/* Libraries imports */
import React from 'react'
import { Flex, Heading, GridItem, SimpleGrid } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'

/* Shared module imports */
import { TextInputField, SelectField, TextAreaField, DateField, FileField } from '@shared/components'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Support ticket module imports */
import { CreateTicketFormSchema } from '@support-ticket-management/schemas'
import { TICKET_CREATION_FORM_QUESTIONS } from '@support-ticket-management/constants'
import { TenantBasicDetails } from '@tenant-management/types/account/list'

/* Helper function to convert File to base64 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64String = reader.result as string
      /* Remove data URL prefix to get pure base64 */
      const base64 = base64String.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}

/* Component props interface */
interface TicketFormFieldsProps {
  tenantSelectOptions: Array<{ label: string; value: string }>
  categorySelectOptions: Array<{ label: string; value: string }>
  tenantDetails: TenantBasicDetails[]
}

/* Form fields component - must be inside FormProvider */
const TicketForm: React.FC<TicketFormFieldsProps> = ({
  tenantSelectOptions,
  categorySelectOptions,
  tenantDetails,
}) => {
  const { control, formState: { errors }, setValue } = useFormContext<CreateTicketFormSchema>() /* Form validation context */

  /* Handle tenant selection and auto-fill request details */
  const handleTenantChange = (value: string) => {

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
  }

  return (
    <Flex flexDir="column" gap={6}>
      {TICKET_CREATION_FORM_QUESTIONS.map((section) => (
        <Flex key={section.id} flexDir="column" gap={4}>
          {/* Section heading with icon */}
          <Flex align="center" gap={2}>
            <section.icon size={20} />
            <Heading as="h3" size="md" fontWeight="600">
              {section.heading}
            </Heading>
          </Flex>

          {/* Section fields */}
          <SimpleGrid w={'100%'} columns={[1, 8]} gap={6}>
            {section.questions
              .filter((field) => field.is_active) /* Only render active fields */
              .sort((a, b) => Number(a.display_order) - Number(b.display_order)) /* Sort by display order */
              .map((field) => {
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

                          return (
                            <SelectField
                              {...commonProps}
                              value={controllerField.value?.toString() || ''}
                              onChange={schemaKey === 'tenant_id' ? (value) => {
                                controllerField.onChange(value)
                                handleTenantChange(value)
                              } : controllerField.onChange}
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
                        render={({ field: controllerField }) => {
                          /* Handle file upload and convert to schema format */
                          const handleFileChange = async (files: File[]) => {
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
                              controllerField.onChange(attachments)
                            } catch (error) {
                              console.error('Error processing files:', error)
                            }
                          }

                          return (
                            <FileField
                              {...commonProps}
                              value={controllerField.value || []}
                              onChange={handleFileChange}
                              height={'200px'}
                            />
                          )
                        }}
                      />
                    </GridItem>
                  )
                }

                return null /* Unsupported field type */
              })
            }
          </SimpleGrid>
        </Flex>
      ))}
    </Flex>
  )
}

export default TicketForm
