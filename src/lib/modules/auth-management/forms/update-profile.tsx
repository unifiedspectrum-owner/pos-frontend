/* Libraries imports */
import React from 'react'
import { GridItem, SimpleGrid, Flex, Heading } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { lighten } from 'polished'
import { MdSave, MdRefresh } from 'react-icons/md'

/* Shared module imports */
import { TextInputField, PhoneNumberField, PrimaryButton, SecondaryButton } from '@shared/components'
import { useCountries } from '@shared/hooks'
import { GRAY_COLOR } from '@shared/config'
import { getPhoneFieldErrorMessage } from '@shared/utils/formatting'
import { DEFAULT_DIAL_CODE } from '@shared/constants'

/* Auth module imports */
import { UpdateProfileFormData } from '@auth-management/schemas'

/* User module imports */
import { USER_CREATION_FORM_QUESTIONS } from '@user-management/constants'

/* Component props interface */
interface UpdateProfileFormProps {
  onSubmit: () => void
  onCancel: () => void
  isSubmitting?: boolean
}

/* Profile update form with field validation */
const UpdateProfileForm: React.FC<UpdateProfileFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const { control, formState: { errors } } = useFormContext<UpdateProfileFormData>() /* Form validation context */
  const { dialCodeOptions } = useCountries() /* Country dial codes for phone field */

  return (
    <Flex p={5} gap={4} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)} flexDir="column">
      <Heading size="md" mb={2}>Profile Information</Heading>

      <SimpleGrid w="100%" columns={6} gap={6}>
        {USER_CREATION_FORM_QUESTIONS
          .filter((field) =>field.is_active && !['role_id', 'is_active'].includes(field.schema_key))
          .sort((a, b) => Number(a.display_order) - Number(b.display_order))
          .map((field) => {
            const schemaKey = field.schema_key as keyof UpdateProfileFormData
            const fieldError = errors[schemaKey]

            /* Common field properties */
            const commonProps = {
              name: schemaKey,
              label: field.label,
              placeholder: field.placeholder,
              isInValid: !!fieldError,
              required: field.is_required,
              errorMessage: fieldError?.message,
            }

            /* Render field based on type */
            switch (field.type) {
              case 'INPUT':
                return (
                  <GridItem key={field.id} colSpan={field.grid.col_span}>
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

              case 'PHONE_NUMBER':
                return (
                  <GridItem key={field.id} colSpan={field.grid.col_span}>
                    <Controller
                      name={schemaKey}
                      control={control}
                      render={({ field: controllerField }) => (
                        <PhoneNumberField
                          {...commonProps}
                          comboboxPlaceholder={DEFAULT_DIAL_CODE}
                          value={controllerField.value as [string, string] || [DEFAULT_DIAL_CODE, '']}
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

              default:
                return null
            }
          })
        }
      </SimpleGrid>

      {/* Form Action Buttons */}
      <Flex gap={4} justifyContent="flex-end">
        <SecondaryButton
          onClick={onCancel}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          buttonText={'Reset'}
          leftIcon={MdRefresh}
        />
        <PrimaryButton
          onClick={onSubmit}
          loading={isSubmitting}
          loadingText="Updating..."
          buttonText={'Update'}
          isLoading={isSubmitting}
          leftIcon={MdSave}
        />
      </Flex>
    </Flex>
  )
}

export default UpdateProfileForm