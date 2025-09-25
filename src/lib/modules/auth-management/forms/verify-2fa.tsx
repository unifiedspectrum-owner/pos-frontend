"use client"

/* Libraries imports */
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VStack, Heading, Text, Link, Box, SimpleGrid, GridItem, Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { PinInputField, PrimaryButton } from '@shared/components/form-elements'
import { ADMIN_PAGE_ROUTES } from '@shared/constants'

/* Auth management module imports */
import { Verify2FAApiRequest } from '@auth-management/types'
import { useAuthOperations } from '@auth-management/hooks'
import { AUTH_PAGE_ROUTES, VERIFY_2FA_FORM_QUESTIONS, AUTH_STORAGE_KEYS } from '@auth-management/constants'
import { TwoFactorValidationFormData, twoFactorValidationSchema } from '@auth-management/schemas'

/* Component props interface */
interface Verify2FAFormProps {
  userEmail: string
  userId: string
}

/* 2FA verification form component */
const Verify2FAForm: React.FC<Verify2FAFormProps> = ({ userEmail, userId }) => {
  const router = useRouter()

  /* Auth operations hook */
  const { verify2FA, isVerifying2FA } = useAuthOperations()

  /* Form management */
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<TwoFactorValidationFormData>({
    resolver: zodResolver(twoFactorValidationSchema),
    defaultValues: {
      user_id: userId,
      code: ['', '', '', '', '', '']
    },
    mode: 'onSubmit'
  })

  /* Handle form submission */
  const onSubmit = async (data: TwoFactorValidationFormData) => {
    const payload: Verify2FAApiRequest = {
      user_id: data.user_id.toString(),
      code: data.code.join('')
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
    setValue('code', value)
    if (value.length === 6 && value.every(digit => digit !== '')) {
      /* Auto-submit when 6 digits are entered */
      handleSubmit(onSubmit)()
    }
  }
  console.log(errors)


  return (
    <Box
      maxW="400px"
      w="100%"
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
            Two-Factor Authentication
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Enter the 6-digit code from your authenticator app
          </Text>
          {userEmail && (
            <Text fontWeight={'bolder'}  color="gray.500" fontSize="xs">
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
                  if(field.type == "PIN" && schemaKey == "code") {
                    return (
                      <GridItem key={field.id} colSpan={field.grid.col_span}>
                        <Controller
                          name={schemaKey}
                          control={control}
                          render={({ field: controllerField }) => {
                            return(
                              <PinInputField
                                {...commonProps}
                                length={6}
                                errorMessage={fieldError?.message}
                                value={controllerField.value}
                                onChange={handlePinChange}
                                boxGap={'10px'}
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

            {/* Submit button */}
            <PrimaryButton
              type="submit"
              leftIcon={FaShieldAlt}
              loading={isVerifying2FA}
            >
              {isVerifying2FA? "Verifying..." :"Verify Code"}
            </PrimaryButton>

            {/* Back to Login Link */}
            <Box textAlign="center">
              <Link
                color={`${PRIMARY_COLOR}.500`}
                onClick={handleBackToLogin}
                cursor="pointer"
                fontSize="sm"
                _hover={{ textDecoration: 'underline' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                <FaArrowLeft size="12px" />
                Back to Login
              </Link>
            </Box>

            {/* Help text */}
            <Text textAlign="center" fontSize="xs" color="gray.500">
              Having trouble? Make sure your authenticator app is set up correctly.
            </Text>
          </Flex>
        </form>
      </VStack>
    </Box>
  )
}

export default Verify2FAForm