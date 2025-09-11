/* Library imports */
import React from 'react'
import { SimpleGrid, GridItem } from '@chakra-ui/react'
import { Controller, Control, FieldErrors } from 'react-hook-form'

/* Shared module imports */
import { TextInputField, SelectField, TextAreaField, ComboboxField } from '@shared/components/form-elements/ui'

/* Tenant module imports */
import { TenantInfoFormData } from '@tenant-management/schemas/account'
import { TENANT_BASIC_INFO_QUESTIONS, TENANT_FORM_SECTIONS } from '@tenant-management/constants'
import { ComboboxOption } from '@/lib/shared/components/form-elements/ui/combobox-field'

/* Props interface */
interface AddressInformationProps {
  control: Control<TenantInfoFormData>
  errors: FieldErrors<TenantInfoFormData>
  stateOptions: ComboboxOption[]
  countryValue: string | undefined
}

const AddressInformation: React.FC<AddressInformationProps> = ({
  control,
  errors,
  stateOptions,
  countryValue,
}) => {

  return (
    <>
      {TENANT_BASIC_INFO_QUESTIONS
        .filter((section) => section.section_heading == TENANT_FORM_SECTIONS.ADDRESS_INFO)
        .map((section, index) => (
        <SimpleGrid key={index} columns={[3,3,6]} gap={4}>
          {section.section_values
            .filter(que => que.is_active)
            .sort((a, b) => Number(a.display_order) - Number(b.display_order))
            .map((que) => {
              const schemaKey = que.schema_key as keyof TenantInfoFormData
              const fieldError = errors[schemaKey]
              
              /* Common field props */
              const commonProps = {
                label: que.label,
                placeholder: que.placeholder,
                isInValid: !!fieldError,
                required: que.is_required,
                errorMessage: fieldError?.message,
                disabled: que.disabled
              }

              /* Render field based on type */
              switch (que.type) {
                case 'INPUT':
                  return (
                    <GridItem key={que.id} colSpan={[3, 3, que.grid.col_span]}>
                      <Controller
                        name={schemaKey}
                        control={control}
                        render={({ field }) => (
                          <TextInputField
                            {...commonProps}
                            value={field.value?.toString() || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            readOnly={que.disabled}
                            leftIcon={que.left_icon ? <que.left_icon />: undefined}
                          />
                        )}
                      />
                    </GridItem>
                  )
                
                case 'TEXTAREA':
                  return (
                    <GridItem key={que.id} colSpan={[3, 3, que.grid.col_span]}>
                      <Controller
                        name={schemaKey}
                        control={control}
                        render={({ field }) => (
                          <TextAreaField
                            {...commonProps}
                            value={field.value?.toString() || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            readOnly={que.disabled}
                          />
                        )}
                      />
                    </GridItem>
                  )
                
                case 'SELECT':
                  return (
                    <GridItem key={que.id} colSpan={[3, 3, que.grid.col_span]}>
                      <Controller
                        name={schemaKey}
                        control={control}
                        render={({ field }) => (
                          <SelectField
                            {...commonProps}
                            options={que.values || []}
                            value={field.value?.toString() || ''}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </GridItem>
                  )

                case 'COMBOBOX': 
                  if (schemaKey === 'state_province') {
                    return (
                      <GridItem key={que.id} colSpan={[3, 3, que.grid.col_span]}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field }) => (
                            <ComboboxField
                              {...commonProps}
                              value={field.value?.toString() || ''}
                              onChange={field.onChange}
                              options={stateOptions}
                              name={field.name}
                              disabled={!countryValue || stateOptions.length === 0 || que.disabled}
                              placeholder={!countryValue ? 'Select country first' : que.placeholder}
                              showClearTrigger={true}
                            />
                          )}
                        />
                      </GridItem>
                    )
                  }
                
                default:
                  return null
              }
            })
          }
        </SimpleGrid>
      ))}
    </>
  )
}

export default AddressInformation