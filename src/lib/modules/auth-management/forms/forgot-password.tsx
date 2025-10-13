"use client"

/* Libraries imports */
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VStack, Heading, Text, Link, Box, SimpleGrid, GridItem, Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { FaPaperPlane } from 'react-icons/fa'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { TextInputField, PrimaryButton } from '@shared/components/form-elements'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Auth management module imports */
import { ForgotPasswordApiRequest } from '@auth-management/types'
import { useAuthOperations } from '@auth-management/hooks'
import { FORGOT_PASSWORD_FORM_DEFAULT_VALUES, AUTH_PAGE_ROUTES, FORGOT_PASSWORD_FORM_QUESTIONS } from '@auth-management/constants'
import { ForgotPasswordFormData, forgotPasswordSchema } from '@auth-management/schemas'

/* Forgot Password form component */
const ForgotPasswordForm: React.FC = () => {
  const router = useRouter()

  /* Auth operations hook */
  const { forgotPassword, isForgotPasswordLoading } = useAuthOperations()

  /* Form management */
  const { control, handleSubmit, formState: { errors }, clearErrors } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: FORGOT_PASSWORD_FORM_DEFAULT_VALUES
  })

  /* Handle form submission */
  const onSubmit = async (data: ForgotPasswordApiRequest) => {
    const success = await forgotPassword(data)
    if (success) {
      // Could redirect to a success page or show success message
      router.push(AUTH_PAGE_ROUTES.LOGIN)
    }
  }

  /* Handle navigation back to login */
  const handleBackToLogin = () => {
    router.push(AUTH_PAGE_ROUTES.LOGIN)
  }

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
            Forgot Password
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Enter your email address and we'll send you a reset link
          </Text>
        </VStack>

        {/* Forgot Password form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Flex flexDir={'column'} gap={6}>
            <SimpleGrid w="100%" columns={[1, 2]} gap={4}>
              {FORGOT_PASSWORD_FORM_QUESTIONS
                .filter((field) => field.is_active)
                .sort((a, b) => Number(a.display_order) - Number(b.display_order))
                .map((field) => {
                  const schemaKey = field.schema_key as keyof ForgotPasswordFormData
                  const fieldError = errors[schemaKey]

                  /* Shared field properties */
                  const commonProps = {
                    name: schemaKey,
                    label: field.label,
                    placeholder: field.placeholder,
                    isInValid: !!fieldError,
                    required: field.is_required,
                    errorMessage: fieldError?.message,
                    readOnly: false,
                    disabled: false,
                    leftIcon: field.left_icon ? <field.left_icon /> : undefined
                  }

                  /* Render field based on type */
                  switch(field.type) {
                    case FORM_FIELD_TYPES.INPUT:
                      return (
                        <GridItem key={field.id} colSpan={field.grid.col_span}>
                          <Controller
                            name={schemaKey}
                            control={control}
                            render={({ field: controllerField }) => (
                              <TextInputField
                                {...commonProps}
                                value={controllerField.value?.toString() || ''}
                                onChange={(e) => {
                                  clearErrors(schemaKey)
                                  controllerField.onChange(e.target.value)
                                }}
                                onBlur={controllerField.onBlur}
                              />
                            )}
                          />
                        </GridItem>
                      )

                    default:
                      return null
                  }
                })}
            </SimpleGrid>

            {/* Submit button */}
            <PrimaryButton
              type="submit"
              loading={isForgotPasswordLoading}
              leftIcon={FaPaperPlane}
              buttonProps={{
                w: "100%",
              }}
            >
              {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
            </PrimaryButton>

            {/* Back to login link */}
            <Flex justifyContent="center">
              <Link
                color={PRIMARY_COLOR}
                fontSize="sm"
                fontWeight="medium"
                onClick={handleBackToLogin}
                _hover={{ textDecoration: 'underline' }}
              >
                Back to Login
              </Link>
            </Flex>
          </Flex>
        </form>
      </VStack>
    </Box>
  )
}

export default ForgotPasswordForm