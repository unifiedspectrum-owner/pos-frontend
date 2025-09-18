/* Libraries imports */
import React, { useEffect } from 'react'
import { Text, Box, GridItem, SimpleGrid } from '@chakra-ui/react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { HiOutlineViewGrid } from 'react-icons/hi'

/* Shared module imports */
import { CheckboxGroupField } from '@shared/components/form-elements'
import { EmptyStateContainer, ErrorMessageContainer } from '@shared/components/common'

/* Role module imports */
import { CreateRoleFormData } from '@role-management/schemas'
import { useFormMode } from '@role-management/forms/create/components'
import { Module, RolePermission } from '@role-management/types'
import { ModuleAssignmentsSkeleton } from '@role-management/components'
import { MODULE_PERMISSION_OPTIONS } from '@role-management/constants'

/* Module assignments tab interface */
interface ModuleAssignmentsTabProps {
  readonly?: boolean
  modules?: Module[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

/* Module assignments tab component */
const ModuleAssignmentsTab: React.FC<ModuleAssignmentsTabProps> = ({
  readonly = false,
  modules = [],
  isLoading = false,
  error = null,
  onRetry
}) => {
  /* Form context */
  const { control, formState: { errors } } = useFormContext<CreateRoleFormData>()
  const { isViewMode } = useFormMode()

  /* Debug errors */
  console.log('Module assignments errors:', errors.module_assignments)
  console.log('All form errors:', errors)

  /* Field array for module assignments */
  const { fields, replace } = useFieldArray({
    control,
    name: 'module_assignments'
  })

  /* Determine if component should be readonly */
  const isReadonly = readonly || isViewMode

  /* Initialize module assignments when modules change */
  useEffect(() => {
    if (modules.length > 0) {
      /* Get current form values to check for existing permissions */
      const currentFormValues = control._formValues?.module_assignments || []

      /* Create assignments for all modules, preserving existing permissions */
      const initialAssignments = modules.map(module => {
        const existingAssignment = currentFormValues.find(
          (assignment: RolePermission) => assignment.module_id.toString() === module.id.toString()
        )

        return existingAssignment || {
          module_id: module.id.toString(),
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
        }
      })

      console.log('[ModuleAssignments] Initializing with assignments:', initialAssignments)
      replace(initialAssignments)
    }
  }, [modules, control, replace])

  /* Loading state */
  if (isLoading) {
    return <ModuleAssignmentsSkeleton count={6} />
  }

  /* Error state */
  if (error) {
    return (
      <ErrorMessageContainer
        title="Failed to Load Modules"
        error={error}
        onRetry={onRetry}
      />
    )
  }

  /* Empty state */
  if (!modules || modules.length === 0) {
    return (
      <EmptyStateContainer
        icon={<HiOutlineViewGrid size={48} />}
        title="No modules available"
        description="There are no modules configured in the system"
      />
    )
  }

  return (
    <SimpleGrid w={'100%'} columns={[1, 1, 6]} gap={6}>
      {/* Header section */}
      <GridItem colSpan={[1, 6]}>
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={1}>Module Permissions</Text>
          <Text fontSize="sm" color="gray.600">
            Select the permissions for each module that this role should have access to.
          </Text>
          {/* General module assignments error */}
          {!isReadonly && errors.module_assignments && (
            <Text fontSize="sm" color="red.500" mt={2}>
              {errors.module_assignments.message}
            </Text>
          )}
        </Box>
      </GridItem>

      {/* Modules grid */}
      {modules.map((module) => {
        const fieldIndex = fields.findIndex(field => field.module_id.toString() === module.id.toString())

        if (fieldIndex === -1) return null

        /* CRUD permissions options */
        const permissionOptions = MODULE_PERMISSION_OPTIONS

        /* Get field-specific error */
        const fieldError = errors.module_assignments?.[fieldIndex]
        const hasFieldError = !isReadonly && !!fieldError

        return (
          <GridItem key={module.id} colSpan={[1, 3]} borderWidth={1} p={3} borderRadius={'md'}>
            <CheckboxGroupField
              label={module.display_name}
              options={permissionOptions}
              control={control}
              moduleIndex={fieldIndex}
              columns={4}
              isInValid={hasFieldError}
              required={false}
              errorMessage={hasFieldError ? fieldError?.message : undefined}
              disabled={isReadonly}
              readOnly={isReadonly}
              helpText={module.description || `Configure permissions for ${module.display_name} module`}
            />
          </GridItem>
        )
      })}
    </SimpleGrid>
  )
}

export default ModuleAssignmentsTab