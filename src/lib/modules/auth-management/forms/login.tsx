"use client"

/* Libraries imports */
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VStack, Heading, Text, Link, Box, SimpleGrid, GridItem, Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { FaSignInAlt } from 'react-icons/fa'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { TextInputField, CheckboxField, PrimaryButton } from '@shared/components/form-elements'

/* Auth management module imports */
import { LoginApiRequest } from '@auth-management/types'
import { useAuthOperations } from '@auth-management/hooks'
import { LOGIN_FORM_DEFAULT_VALUES, AUTH_PAGE_ROUTES, LOGIN_FORM_QUESTIONS } from '@auth-management/constants'
import { LoginFormData, loginSchema } from '@auth-management/schemas'

/* Login form component */
const LoginForm: React.FC = () => {
  const router = useRouter()

  /* Auth operations hook */
  const { loginUser, isLoggingIn } = useAuthOperations()

  /* Form management */
  const { control, handleSubmit, formState: { errors }, clearErrors } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: LOGIN_FORM_DEFAULT_VALUES
  })

  /* Handle form submission */
  const onSubmit = async (data: LoginApiRequest) => {
    const success = await loginUser(data)
    if (success) {
      router.push(AUTH_PAGE_ROUTES.ADMIN_HOME)
    }
  }

  /* Handle navigation to forgot password */
  const handleForgotPassword = () => {
    router.push(AUTH_PAGE_ROUTES.FORGOT_PASSWORD)
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
            Login to Your Account
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Enter your credentials to access your account
          </Text>
        </VStack>

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Flex flexDir={'column'} gap={6}>
            <SimpleGrid w="100%" columns={[1, 2]} gap={4}>
              {LOGIN_FORM_QUESTIONS
                .filter((field) => field.is_active)
                .sort((a, b) => Number(a.display_order) - Number(b.display_order))
                .map((field) => {
                  const schemaKey = field.schema_key as keyof LoginFormData
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

                    case 'PASSWORD':
                      return (
                        <GridItem key={field.id} colSpan={field.grid.col_span}>
                          <Controller
                            name={schemaKey}
                            control={control}
                            render={({ field: controllerField }) => (
                              <TextInputField
                                {...commonProps}
                                type={'password'}
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

                    case 'CHECKBOX':
                      return (
                        <GridItem key={field.id} colSpan={field.grid.col_span}>
                          <Flex gap={2} w={'100%'}>
                            <Flex w={'50%'}>
                              <Controller
                                name={schemaKey}
                                control={control}
                                render={({ field: controllerField }) => (
                                  <CheckboxField
                                    {...commonProps}
                                    value={Boolean(controllerField.value)}
                                    onChange={(checked) => {
                                      clearErrors(schemaKey)
                                      controllerField.onChange(checked)
                                    }}
                                  />
                                )}
                              />
                            </Flex>
                            <Flex w={'50%'} justifyContent={'flex-end'}>
                              <Link
                                color={PRIMARY_COLOR}
                                fontSize="sm"
                                fontWeight="medium"
                                onClick={handleForgotPassword}
                                _hover={{ textDecoration: 'underline' }}
                              >
                                  Forgot password?
                              </Link>
                            </Flex>
                          </Flex>
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
              loading={isLoggingIn}
              leftIcon={FaSignInAlt}
              buttonProps={{
                w: "100%",
              }}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </PrimaryButton>
          </Flex>
        </form>
      </VStack>
    </Box>
  )
}

export default LoginForm