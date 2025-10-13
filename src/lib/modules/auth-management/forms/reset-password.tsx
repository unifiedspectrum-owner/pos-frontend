"use client"

/* Libraries imports */
import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VStack, Heading, Text, Link, Box, SimpleGrid, GridItem, Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { FaKey } from 'react-icons/fa'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { PasswordInputField, PrimaryButton } from '@shared/components/form-elements'
import { LoaderWrapper } from '@shared/components/common'
import { useFieldNavigation } from '@shared/hooks'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Auth management module imports */
import { ResetPasswordApiRequest, TokenValidationState } from '@auth-management/types'
import { useAuthOperations } from '@auth-management/hooks'
import { RESET_PASSWORD_FORM_DEFAULT_VALUES, AUTH_PAGE_ROUTES, RESET_PASSWORD_FORM_QUESTIONS, TOKEN_VALIDATION_STATE } from '@auth-management/constants'
import { ResetPasswordFormData, resetPasswordSchema } from '@auth-management/schemas'

/* Reset Password form component props */
interface ResetPasswordFormProps {
  token: string | null;
  tokenValidationState: TokenValidationState;
  isValidatingToken: boolean;
  tokenValidationErrorCode?: string | null;
  tokenValidationErrorMsg?: string | null;
}

/* Reset Password form component */
const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, tokenValidationState, isValidatingToken, tokenValidationErrorCode, tokenValidationErrorMsg }) => {
  const router = useRouter()

  /* Auth operations hook */
  const { resetPassword, isResetPasswordLoading } = useAuthOperations()

  /* Form management */
  const { control, handleSubmit, formState: { errors }, clearErrors, setValue, trigger } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: RESET_PASSWORD_FORM_DEFAULT_VALUES,
    mode: 'onChange'
  })

  /* Set token from props */
  useEffect(() => {
    if (!isValidatingToken && tokenValidationState === TOKEN_VALIDATION_STATE.VALID && token) {
      setValue('token', token)
    }
  }, [token, tokenValidationState, setValue, isValidatingToken])

  /* Handle form submission */
  const onSubmit = async (data: ResetPasswordApiRequest) => {
    const success = await resetPassword(data)
    if (success) {
      router.push(AUTH_PAGE_ROUTES.LOGIN)
    }
  }

  /* Handle navigation back to login */
  const handleBackToLogin = () => {
    router.push(AUTH_PAGE_ROUTES.LOGIN)
  }

  /* Field navigation hook for Enter key handling */
  const { getFieldProps } = useFieldNavigation<ResetPasswordFormData>({
    trigger,
    onSubmit: handleSubmit(onSubmit),
    fields: ['new_password', 'confirm_password']
  })

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
      <LoaderWrapper
        isLoading={isValidatingToken || tokenValidationState === TOKEN_VALIDATION_STATE.PENDING}
        loadingText="Validating reset link..."
        minHeight="200px"
      >
        <VStack gap={6} align="stretch">
          {/* Dynamic header based on token validity */}
          <VStack gap={2} textAlign="center">
            <Heading size="lg" color={tokenValidationState === TOKEN_VALIDATION_STATE.INVALID ? "red.500" : PRIMARY_COLOR}>
              {tokenValidationState === TOKEN_VALIDATION_STATE.INVALID
                ? (tokenValidationErrorMsg || "Invalid Reset Link")
                : "Reset Password"}
            </Heading>
            <Text color="gray.600" fontSize="sm">
              {tokenValidationState === TOKEN_VALIDATION_STATE.INVALID
                ? (tokenValidationErrorCode || "This reset link is invalid or has expired. Please request a new one.")
                : "Enter your new password below"
              }
            </Text>
          </VStack>

          {/* Conditional content based on token validity */}
          {tokenValidationState === TOKEN_VALIDATION_STATE.VALID ? (
          /* Reset Password form */
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Flex flexDir={'column'} gap={6}>
              <SimpleGrid w="100%" columns={[1, 2]} gap={4}>
                {RESET_PASSWORD_FORM_QUESTIONS
                  .filter((field) => field.is_active)
                  .sort((a, b) => Number(a.display_order) - Number(b.display_order))
                  .map((field) => {
                    const schemaKey = field.schema_key as keyof ResetPasswordFormData
                    const fieldError = errors[schemaKey]

                    /* Skip token field as it's hidden */
                    if (schemaKey === 'token') return null

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
                      case FORM_FIELD_TYPES.PASSWORD:
                        return (
                          <GridItem key={field.id} colSpan={field.grid.col_span}>
                            <Controller
                              name={schemaKey}
                              control={control}
                              render={({ field: controllerField }) => (
                                <PasswordInputField
                                  {...commonProps}
                                  {...getFieldProps(schemaKey)}
                                  value={controllerField.value?.toString() || ''}
                                  onChange={(e) => {
                                    clearErrors(schemaKey)
                                    controllerField.onChange(e.target.value)
                                  }}
                                  onBlur={controllerField.onBlur}
                                  showStrengthMeter={schemaKey === 'new_password'}
                                  showRequirements={schemaKey === 'new_password'}
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
                loading={isResetPasswordLoading}
                leftIcon={FaKey}
                buttonProps={{
                  w: "100%",
                }}
              >
                {isResetPasswordLoading ? 'Resetting...' : 'Reset Password'}
              </PrimaryButton>
            </Flex>
          </form>
        ) : null}

          {/* Back to login link - always visible */}
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
        </VStack>
      </LoaderWrapper>
    </Box>
  )
}

export default ResetPasswordForm