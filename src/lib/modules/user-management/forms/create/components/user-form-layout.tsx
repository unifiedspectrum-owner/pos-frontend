/* Libraries imports */
import React from 'react'
import { FormProvider, UseFormReturn, FieldValues } from 'react-hook-form'
import { Flex, Heading } from '@chakra-ui/react'
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config'
import { Breadcrumbs, FullPageLoader, ErrorMessageContainer } from '@shared/components/common'

/* User module imports */
import { USER_FORM_SECTIONS } from '@user-management/constants'
import { UserBasicInfo } from '@user-management/forms'

/* Component props interface */
interface UserFormLayoutProps<TFormData extends FieldValues = FieldValues> {
  title: string
  isLoading?: boolean
  error?: string | null
  methods: UseFormReturn<TFormData>
  actions: React.ReactNode
  onRetry?: () => void
  isRetrying?: boolean
}

/* Shared layout component for user forms */
const UserFormLayout = <TFormData extends FieldValues = FieldValues>({
  title,
  isLoading = false,
  error = null,
  onRetry,
  methods,
  actions
}: UserFormLayoutProps<TFormData>) => {
  /* Loading state display */
  if (isLoading) {
    return <FullPageLoader />
  }

  /* Error state display */
  if (error) {
    return (
      <ErrorMessageContainer
        error={error}
        onRetry={onRetry}
      />
    )
  }

  return (
    <FormProvider {...methods}>
      <Flex w="100%" flexDir="column">
        {/* Responsive main container */}
        <Flex flexDir="column" p={6} maxW="1400px" mx="auto" w="full" gap={4}>
          {/* Page header section */}
          <Flex flexDir="column" gap={1}>
            <Heading as="h1" fontWeight="700" mb={0}>
              {title}
            </Heading>
            <Breadcrumbs />
          </Flex>

          {/* Form content container */}
          <Flex flexDir={'column'} p={5} gap={4} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
            <Heading>{USER_FORM_SECTIONS.BASIC_INFO}</Heading>
            <Flex>
              <UserBasicInfo />
            </Flex>
          </Flex>

          {/* Action buttons section */}
          {actions}
        </Flex>
      </Flex>
    </FormProvider>
  )
}

export default UserFormLayout