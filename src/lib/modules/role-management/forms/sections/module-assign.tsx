/* Libraries imports */
import React, { useEffect } from 'react'
import { Text, Flex, HStack } from '@chakra-ui/react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { HiOutlineViewGrid } from 'react-icons/hi'
import { lighten } from 'polished'

/* Shared module imports */
import { EmptyStateContainer, ErrorMessageContainer } from '@shared/components/common'
import { GRAY_COLOR, PRIMARY_COLOR } from '@shared/config'

/* Role module imports */
import { CreateRoleFormData } from '@role-management/schemas'
import { useFormMode } from '@role-management/contexts'
import { Module, RolePermission } from '@role-management/types'
import { ModuleAssignmentsSkeleton } from '@role-management/components'
import { MODULE_PERMISSION_OPTIONS } from '@role-management/constants'
import { ModuleAssignmentsTable } from '@role-management/tables'

/* Module assignments section interface */
interface ModuleAssignmentsSectionProps {
  readonly?: boolean
  modules?: Module[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

/* Module assignments section component */
const ModuleAssignmentsSection: React.FC<ModuleAssignmentsSectionProps> = ({
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
    <Flex flexDir={'column'} w={'100%'}>
      <HStack borderWidth={1} borderTopRadius={'md'} bg={lighten(0.45, PRIMARY_COLOR)} borderColor={lighten(0.3, GRAY_COLOR)} color={GRAY_COLOR}>
        <Text w="40%" p={3} borderColor={lighten(0.3, GRAY_COLOR)} borderRightWidth={1}>Module</Text>
        <Text w="12%" p={3}  textAlign="center" title={'Select All'}>All</Text>
        <Text w="12%" p={3}  textAlign="center" title={'Create'}>C</Text>
        <Text w="12%" p={3}  textAlign="center" title={'Read'}>R</Text>
        <Text w="12%" p={3}  textAlign="center" title={'Update'}>U</Text>
        <Text w="12%" p={3}  textAlign="center" title={'Delete'}>D</Text>
      </HStack>
      {/* Modules grid */}
      {modules.map((module, index) => {
        const fieldIndex = fields.findIndex(field => field.module_id.toString() === module.id.toString())

        if (fieldIndex === -1) return null

        /* CRUD permissions options */
        const permissionOptions = MODULE_PERMISSION_OPTIONS

        return (
          <React.Fragment key={module.id}>
            <ModuleAssignmentsTable
              label={module.name}
              options={permissionOptions}
              control={control}
              moduleIndex={fieldIndex}
              disabled={isReadonly}
              readOnly={isReadonly}
              helpText={module.description || `Configure permissions for ${module.name} module`}
              isLastRow={(modules.length - 1) === index}
            />
          </React.Fragment>
        )
      })}
    </Flex>
  )
}

export default ModuleAssignmentsSection