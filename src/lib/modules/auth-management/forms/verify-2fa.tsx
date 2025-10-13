"use client"

/* Libraries imports */
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VStack, Heading, Text, Box, SimpleGrid, GridItem, Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { FaShieldAlt, FaArrowLeft, FaKey } from 'react-icons/fa'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { PinInputField, PrimaryButton, TextInputField, SecondaryButton } from '@shared/components/form-elements'
import { ADMIN_PAGE_ROUTES, FORM_FIELD_TYPES } from '@shared/constants'

/* Auth management module imports */
import { Verify2FAApiRequest, TwoFAType } from '@auth-management/types'
import { useTwoFactorOperations } from '@auth-management/hooks'
import { AUTH_PAGE_ROUTES, VERIFY_2FA_FORM_QUESTIONS, AUTH_STORAGE_KEYS, TWO_FA_TYPES } from '@auth-management/constants'
import { TwoFactorValidationFormData, twoFactorValidationSchema } from '@auth-management/schemas'

/* Component props interface */
interface Verify2FAFormProps {
  userEmail: string
  userId: string
}

/* 2FA verification form component */
const Verify2FAForm: React.FC<Verify2FAFormProps> = ({ userEmail, userId }) => {
  const router = useRouter()

  /* Component state */
  const [twoFAType, setTwoFAType] = useState<TwoFAType>(TWO_FA_TYPES.TOTP)

  /* Auth operations hook */
  const { verify2FA, isVerifying2FA } = useTwoFactorOperations()

  /* Form management */
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<TwoFactorValidationFormData>({
    resolver: zodResolver(twoFactorValidationSchema),
    defaultValues: {
      user_id: userId,
      type: twoFAType,
      totp_code: ['', '', '', '', '', ''],
      b_code: ''
    },
    mode: 'onSubmit'
  })

  /* Handle form submission */
  const onSubmit = async (data: TwoFactorValidationFormData) => {
    const payload: Verify2FAApiRequest = {
      user_id: data.user_id.toString(),
      type: data.type,
      code: data.type === TWO_FA_TYPES.TOTP ? (data.totp_code?.join('') || '') : (data.b_code || '')
    }

    const success = await verify2FA(payload)
    if (success) {
      router.push(ADMIN_PAGE_ROUTES.DASHBOARD.HOME)
    }
  }

  /* Handle navigation to login */
  const handleBackToLogin = () => {
    /* Clear pending 2FA data */
    localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)
    localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)
    router.push(AUTH_PAGE_ROUTES.LOGIN)
  }

  /* Handle PIN input change */
  const handlePinChange = (value: string[]) => {
    setValue('totp_code', value)
    setValue('type', twoFAType)
    if (value.length === 6 && value.every(digit => digit !== '')) {
      /* Auto-submit when 6 digits are entered */
      handleSubmit(onSubmit)()
    }
  }

  /* Handle 2FA type toggle */
  const handleToggle2FAType = () => {
    const newType: TwoFAType = twoFAType === TWO_FA_TYPES.TOTP ? TWO_FA_TYPES.BACKUP : TWO_FA_TYPES.TOTP
    setTwoFAType(newType)
    setValue('type', newType)
    setValue('totp_code', ['', '', '', '', '', ''])
    setValue('b_code', '')
  }
  console.log(errors, control._formValues)

  return (
    <Box
      w="400px"
      h="430px"
      p={8}
      bg="white"
      borderRadius="lg"
      boxShadow="xl"
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack gap={6} align="stretch">
        {/* Form header */}
        <VStack gap={2} textAlign="center">
          <Heading size="lg" color={PRIMARY_COLOR}>
            {twoFAType === TWO_FA_TYPES.TOTP ? 'Two-Factor Authentication' : 'Backup Code Verification'}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {twoFAType === TWO_FA_TYPES.TOTP
              ? 'Enter the 6-digit code from your authenticator app'
              : 'Enter your backup recovery code to access your account'
            }
          </Text>
          {userEmail && (
            <Text fontWeight={'bolder'} color="gray.500" fontSize="xs">
              Account: {userEmail}
            </Text>
          )}
        </VStack>

        {/* 2FA verification form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Flex flexDir={'column'} gap={6}>
            <SimpleGrid w="100%" columns={[1, 2]} gap={4}>
              {VERIFY_2FA_FORM_QUESTIONS
                .filter((field) => field.is_active)
                .sort((a, b) => Number(a.display_order) - Number(b.display_order))
                .map((field) => {
                  const schemaKey = field.schema_key as keyof TwoFactorValidationFormData
                  const fieldError = errors[schemaKey]

                  /* Shared field properties */
                  const commonProps = {
                    name: schemaKey,
                    label: field.label,
                    placeholder: '',
                    isInValid: !!fieldError,
                    required: field.is_required,
                    errorMessage: fieldError?.message,
                    readOnly: false,
                    disabled: isVerifying2FA,
                    leftIcon: field.left_icon ? <field.left_icon /> : undefined
                  }

                  /* Render field based on type */
                  if(field.type == FORM_FIELD_TYPES.PIN && twoFAType === TWO_FA_TYPES.TOTP && schemaKey == "totp_code") {
                    return (
                      <GridItem key={field.id} colSpan={field.grid.col_span}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field: controllerField }) => {
                            return(
                              <PinInputField
                                {...commonProps}
                                errorMessage={errors.totp_code?.message}
                                value={controllerField.value}
                                onChange={handlePinChange}
                                onBlur={controllerField.onBlur}
                                boxGap={'10px'}
                                autoFocus={true}
                              />
                            )
                          }}
                        />
                      </GridItem>
                    )
                  }

                  if(field.type == FORM_FIELD_TYPES.INPUT && twoFAType === TWO_FA_TYPES.BACKUP && schemaKey == "b_code") {
                    return (
                      <GridItem key={field.id} colSpan={field.grid.col_span}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field: controllerField }) => {
                            return(
                              <TextInputField
                                {...commonProps}
                                placeholder={field.placeholder}
                                errorMessage={errors.b_code?.message}
                                value={controllerField.value?.toString() || ''}
                                onChange={controllerField.onChange}
                                onBlur={controllerField.onBlur}
                                autoFocus={true}
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

            <Flex flexDir={'column'} gap={4}>
              {/* Toggle backup code button */}
              <SecondaryButton
                size="sm"
                onClick={handleToggle2FAType}
                leftIcon={FaKey}
                buttonText={twoFAType === TWO_FA_TYPES.BACKUP ? 'Use Authenticator Code' : 'Try Another Way'}
              />

              {/* Submit button */}
              <PrimaryButton
                type="submit"
                leftIcon={FaShieldAlt}
                loading={isVerifying2FA}
                buttonText={isVerifying2FA ? "Verifying..." : twoFAType === TWO_FA_TYPES.BACKUP ? "Verify Backup Code" : "Verify Code"}
              />

              {/* Back to Login Button */}
              <SecondaryButton
                onClick={handleBackToLogin}
                size="sm"
                leftIcon={FaArrowLeft}
                buttonText="Back to Login"
              />
            </Flex>
          </Flex>
        </form>
      </VStack>
    </Box>
  )
}

export default Verify2FAForm