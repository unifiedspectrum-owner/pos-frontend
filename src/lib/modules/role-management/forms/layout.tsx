/* Libraries imports */
import React, { useEffect } from 'react'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { Flex, Heading } from '@chakra-ui/react'
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config'
import { Breadcrumbs, FullPageLoader, ErrorMessageContainer } from '@shared/components/common'

/* Role module imports */
import { CreateRoleFormData } from '@role-management/schemas'
import { ROLE_FORM_TITLES, RoleFormMode, ROLE_FORM_SECTIONS } from '@role-management/constants'
import { RoleInfoSection, ModuleAssignmentsSection } from '@role-management/forms/sections'
import { useModules } from '@role-management/hooks'
import { NavigationButtons } from '@role-management/forms'
import { FormModeProvider } from '@role-management/contexts'

/* Component props interface */
interface RoleFormLayoutProps {
  mode: RoleFormMode
  isLoading?: boolean
  error?: string | null
  methods: UseFormReturn<CreateRoleFormData>
  onSubmit: (data: CreateRoleFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
  onRetry?: () => void
  isRetrying?: boolean
}

/* Main layout component for role forms */
const RoleFormLayout: React.FC<RoleFormLayoutProps> = ({
  mode,
  isLoading = false,
  error = null,
  onRetry,
  methods,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  /* Modules data management hook with caching */
  const { modules, isLoading: modulesLoading, error: modulesError, fetchModules } = useModules()

  /* Fetch modules on component mount */
  useEffect(() => {
    fetchModules();
  }, [fetchModules])

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
      <FormModeProvider mode={mode}>
        <Flex w="100%" flexDir="column">
          {/* Responsive main container */}
          <Flex flexDir="column" p={6} maxW="1400px" mx="auto" w="full" gap={4}>
            {/* Page header section */}
            <Flex flexDir="column" gap={1}>
              <Heading as="h1" fontWeight="700" mb={0}>
                {ROLE_FORM_TITLES[mode]}
              </Heading>
              <Breadcrumbs />
            </Flex>

            {/* Role Information Section */}
            <Flex p={5} gap={4} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
              <Flex flexDir={'column'} gap={2} w={'40%'}>
                <Heading>{ROLE_FORM_SECTIONS.ROLE_INFO}</Heading>
                <RoleInfoSection />
              </Flex>

              {/* Module Assignments Section */}
              <Flex flexDir={'column'} gap={2} w={'60%'}>
                <Heading>{ROLE_FORM_SECTIONS.MODULE_ASSIGNMENTS}</Heading>
                <ModuleAssignmentsSection
                  modules={modules}
                  isLoading={modulesLoading}
                  error={modulesError}
                  onRetry={fetchModules}
                />
              </Flex>
            </Flex>

            {/* Navigation buttons section */}
            <NavigationButtons
              onCancel={onCancel}
              onSubmit={() => methods.handleSubmit(onSubmit)()}
              loading={isSubmitting}
            />
          </Flex>
        </Flex>
      </FormModeProvider>
    </FormProvider>
  )
}

export default RoleFormLayout