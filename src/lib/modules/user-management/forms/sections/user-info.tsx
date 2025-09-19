/* Libraries imports */
import React from 'react'
import { GridItem, SimpleGrid } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'

/* Shared module imports */
import { TextInputField, PhoneNumberField, SelectField, SwitchField } from '@shared/components'
import { useCountries } from '@shared/hooks'

/* User module imports */
import { CreateUserFormData, UpdateUserFormData } from '@user-management/schemas'
import { USER_CREATION_FORM_QUESTIONS } from '@user-management/constants'

import { getPhoneFieldErrorMessage } from '@/lib/shared/utils/formatting'

/* Component props interface */
interface UserInfoSectionProps {
  roleSelectOptions: Array<{ label: string; value: string }>
  rolesLoading: boolean
}

/* Dynamic user information form with role selection */
const UserInfoSection: React.FC<UserInfoSectionProps> = ({ roleSelectOptions, rolesLoading }) => {
  const { control, formState: { errors } } = useFormContext<CreateUserFormData | UpdateUserFormData>() /* Form validation context */
  const { dialCodeOptions } = useCountries() /* Country dial codes for phone field */

  return (
    <SimpleGrid w={'100%'} columns={[1,6]} gap={6}>
      {USER_CREATION_FORM_QUESTIONS
        .filter((field) => field.is_active) /* Only render active fields */
        .sort((a, b) => Number(a.display_order) - Number(b.display_order)) /* Sort by display order */
        .map((field) => {
          const schemaKey = field.schema_key as keyof (CreateUserFormData | UpdateUserFormData)
          if (schemaKey == "module_assignments") return null;
          
          const fieldError = errors[schemaKey];

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
          switch(field.type) {
            case 'INPUT': /* Text input fields (name, email) */
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

            case 'PHONE_NUMBER': /* Phone number with country code */
              return (
                <GridItem key={field.id} colSpan={{ base: 1, md: field.grid.col_span }}>
                  <Controller
                    name={schemaKey}
                    control={control}
                    render={({ field: controllerField }) => (
                      <PhoneNumberField
                        {...commonProps}
                        comboboxPlaceholder='+91'
                        value={controllerField.value as [string, string] || ['+91', '']}
                        onChange={controllerField.onChange}
                        onBlur={controllerField.onBlur}
                        options={dialCodeOptions}
                        showVerifyButton={false}
                        errorMessage={getPhoneFieldErrorMessage(fieldError)}
                      />
                    )}
                  />
                </GridItem>
              )

            case 'SELECT': /* Role selection dropdown */
              return (
                <GridItem key={field.id} colSpan={[1,field.grid.col_span]}>
                  <Controller
                    name={schemaKey}
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...commonProps}
                        value={field.value?.toString() || ''}
                        onChange={(value) => {
                          console.log('[UserInfoSection] Role selection changed to:', value)
                          field.onChange(value)
                        }}
                        options={rolesLoading ? [] : roleSelectOptions} /* Load roles dynamically */
                      />
                    )}
                  />
                </GridItem>
              )

            case 'TOGGLE': /* Switch/toggle fields for boolean values */
              return (
                <GridItem key={field.id} colSpan={[1, field.grid.col_span]}>
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

            default:
              return null /* Unsupported field type */
          }
        })
      }
    </SimpleGrid>
  )
}

export default UserInfoSection