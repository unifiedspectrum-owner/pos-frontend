/* Libraries imports */
import React, { useEffect } from 'react'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { Flex, Heading } from '@chakra-ui/react'
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config'
import { Breadcrumbs, FullPageLoader, ErrorMessageContainer } from '@shared/components/common'

/* User module imports */
import { USER_FORM_SECTIONS } from '@user-management/constants'
import { CreateUserFormData } from '@user-management/schemas'
import { UserInfoSection, ModuleAssignmentsSection } from '@user-management/forms/sections'
import { UserNavigationButtons } from '@user-management/forms'

/* Role module imports */
import { useModules, useRoles } from '@role-management/hooks'
import { RolePermission, ModuleAssignment } from '@role-management/types'

/* Component props interface */
interface UserFormLayoutProps {
  title: string
  isLoading?: boolean
  error?: string | null
  methods: UseFormReturn<CreateUserFormData>
  onSubmit: (data: CreateUserFormData, rolePermissions?: RolePermission[]) => void
  onCancel: () => void
  isSubmitting?: boolean
  onRetry?: () => void
  isRetrying?: boolean
  submitText?: string
  loadingText?: string
  userPermissionsFromAPI?: ModuleAssignment[]
}

/* Main layout component for user forms */
const UserFormLayout: React.FC<UserFormLayoutProps> = ({
  title,
  isLoading = false,
  error = null,
  onRetry,
  methods,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = "Create User",
  loadingText = "Creating User...",
  userPermissionsFromAPI = [],
}) => {
  /* Modules data management hook with caching */
  const { modules, isLoading: modulesLoading, error: modulesError, fetchModules } = useModules()

  /* Role permissions management hook */
  const {
    roleSelectOptions, loading: rolesLoading, error: rolesError,
    rolePermissions, permissionsLoading, permissionsError, fetchRolePermissions
  } = useRoles()

  /* Watch for role selection changes */
  const selectedRoleId = methods.watch('role_id')

  /* Fetch modules on component mount */
  useEffect(() => {
    fetchModules();
  }, [fetchModules])

  /* Fetch role permissions when component mounts */
  useEffect(() => {
    fetchRolePermissions();
  }, [fetchRolePermissions])

  /* Loading state display */
  if (isLoading || rolesLoading) {
    return <FullPageLoader />
  }

  /* Error state display */
  if (error || rolesError) {
    const displayError = error || rolesError
    return (
      <ErrorMessageContainer
        error={displayError}
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

          {/* User Information Section */}
          <Flex p={5} gap={4} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
            <Flex flexDir={'column'} gap={2} w={'40%'}>
              <Heading>{USER_FORM_SECTIONS.BASIC_INFO}</Heading>
              <UserInfoSection
                roleSelectOptions={roleSelectOptions}
                rolesLoading={rolesLoading}
              />
            </Flex>

            {/* Module Assignments Section */}
            <Flex flexDir={'column'} gap={2} w={'60%'}>
              <Heading>{USER_FORM_SECTIONS.MODULE_ASSIGNMENTS}</Heading>
              <ModuleAssignmentsSection
                modules={modules}
                isLoading={modulesLoading}
                error={modulesError}
                onRetry={fetchModules}
                rolePermissions={rolePermissions}
                permissionsLoading={permissionsLoading}
                permissionsError={permissionsError}
                selectedRoleId={selectedRoleId}
                userPermissionsFromAPI={userPermissionsFromAPI}
              />
            </Flex>
          </Flex>

          {/* Navigation buttons section */}
          <UserNavigationButtons
            onCancel={onCancel}
            onSubmit={() => methods.handleSubmit((data) => onSubmit(data, rolePermissions))()}
            loading={isSubmitting}
            submitText={submitText}
            loadingText={loadingText}
          />
        </Flex>
      </Flex>
    </FormProvider>
  )
}

export default UserFormLayout