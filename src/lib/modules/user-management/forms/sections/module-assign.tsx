/* Libraries imports */
import React, { useEffect, useRef } from 'react'
import { Text, Flex, HStack } from '@chakra-ui/react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { HiOutlineViewGrid } from 'react-icons/hi'

/* Shared module imports */
import { EmptyStateContainer, ErrorMessageContainer } from '@shared/components/common'

/* User module imports */
import { CreateUserFormData, UpdateUserFormData } from '@user-management/schemas'

/* Role module imports */
import { Module, ModuleAssignment, RolePermission } from '@role-management/types'
import { ModuleAssignmentsSkeleton } from '@role-management/components'
import { MODULE_PERMISSION_OPTIONS } from '@role-management/constants'
import { ModuleAssignmentsTable } from '@role-management/tables'
import { GRAY_COLOR, PRIMARY_COLOR } from '@/lib/shared/config'
import { lighten } from 'polished'

/* Module assignments section interface */
interface ModuleAssignmentsSectionProps {
  readonly?: boolean
  modules?: Module[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  rolePermissions?: RolePermission[]
  permissionsLoading?: boolean
  permissionsError?: string | null
  selectedRoleId?: string
  userPermissionsFromAPI?: ModuleAssignment[]
}

/* User module assignments section component */
const ModuleAssignmentsSection: React.FC<ModuleAssignmentsSectionProps> = ({
  readonly = false,
  modules = [],
  isLoading = false,
  error = null,
  onRetry,
  rolePermissions = [],
  permissionsLoading = false,
  permissionsError = null,
  selectedRoleId,
  userPermissionsFromAPI = []
}) => {
  /* Form context */
  const { control, formState: { errors } } = useFormContext<CreateUserFormData | UpdateUserFormData>()

  /* Field array for module assignments */
  const { fields, replace } = useFieldArray({
    control,
    name: 'module_assignments'
  })

  console.log("Module Assignments Errors", errors)

  /* Determine if component should be readonly */
  const isReadonly = readonly

  /* Track the last processed state to prevent infinite loops */
  const lastProcessedRef = useRef<string>('')

  /* Initialize module assignments when modules change and no role is selected */
  useEffect(() => {
    if (modules.length > 0 && !selectedRoleId) {
      /* Get current form values to check for existing permissions */
      const currentFormValues: ModuleAssignment[] = control._formValues?.module_assignments || []

      /* Create assignments for all modules, preserving existing permissions */
      const initialAssignments = modules.map(moduleItem => {
        const existingAssignment = currentFormValues.find(
          (assignment: ModuleAssignment) => assignment.module_id.toString() === moduleItem.id.toString()
        )

        return existingAssignment || {
          module_id: moduleItem.id.toString(),
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
        }
      })

      replace(initialAssignments)
    }
  }, [modules, control, replace, selectedRoleId])

  /* Initialize ALL modules when no assignments exist yet (for edit page initial load) */
  useEffect(() => {
    if (modules.length > 0 && fields.length === 0) {
      /* Create assignments for ALL modules with user permissions from API */
      const allModuleAssignments = modules.map(moduleItem => {
        const userPermissionFromAPI = userPermissionsFromAPI.find(
          assignment => assignment.module_id.toString() === moduleItem.id.toString()
        )

        return {
          module_id: moduleItem.id.toString(),
          can_create: Boolean(userPermissionFromAPI?.can_create || false),
          can_read: Boolean(userPermissionFromAPI?.can_read || false),
          can_update: Boolean(userPermissionFromAPI?.can_update || false),
          can_delete: Boolean(userPermissionFromAPI?.can_delete || false),
        }
      })

      replace(allModuleAssignments)
    }
  }, [modules, fields.length, userPermissionsFromAPI, replace])

  /* When role is selected: Clear all, then show ONLY current role + user permissions from API prop */
  useEffect(() => {
    if (selectedRoleId && rolePermissions.length > 0 && modules.length > 0) {
      /* Create a unique key for the current state to detect actual changes */
      const currentStateKey = `${selectedRoleId}-${JSON.stringify(rolePermissions)}-${JSON.stringify(userPermissionsFromAPI)}-${modules.length}`

      /* Only proceed if the state has actually changed */
      if (lastProcessedRef.current === currentStateKey) {
        return
      }

      /* Filter role permissions for the selected role */
      const selectedRolePermissions = rolePermissions.filter(
        permission => permission.role_id.toString() === selectedRoleId.toString()
      )

      /* Clear everything, then apply ONLY role permissions + user permissions from API prop */
      const cleanAssignments = modules.map(moduleItem => {
        const rolePermission = selectedRolePermissions.find(
          permission => permission.module_id.toString() === moduleItem.id.toString()
        )

        /* Get user permissions from API prop (passed from edit page) */
        const userPermissionFromAPIProp = userPermissionsFromAPI.find(
          assignment => assignment.module_id.toString() === moduleItem.id.toString()
        )

        /* Show ONLY: Role permissions + User permissions from API prop */
        return {
          module_id: moduleItem.id.toString(),
          can_create: Boolean((rolePermission?.can_create || false) || (Boolean(userPermissionFromAPIProp?.can_create) || false)),
          can_read: Boolean((rolePermission?.can_read || false) || (Boolean(userPermissionFromAPIProp?.can_read) || false)),
          can_update: Boolean((rolePermission?.can_update || false) || (Boolean(userPermissionFromAPIProp?.can_update) || false)),
          can_delete: Boolean((rolePermission?.can_delete || false) || (Boolean(userPermissionFromAPIProp?.can_delete) || false)),
        }
      })

      replace(cleanAssignments)

      /* Update the ref to track the current state */
      lastProcessedRef.current = currentStateKey
    }
  }, [selectedRoleId, rolePermissions, modules, replace, userPermissionsFromAPI])

  /* Loading state */
  if (isLoading || permissionsLoading) {
    return <ModuleAssignmentsSkeleton count={6} />
  }

  /* Error state */
  if (error || permissionsError) {
    const errorMessage = error || permissionsError
    const errorTitle = error ? "Failed to Load Modules" : "Failed to Load Role Permissions"
    return (
      <ErrorMessageContainer
        title={errorTitle}
        error={errorMessage}
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
      {modules.map((mod, index) => {
        const fieldIndex = fields.findIndex(field => field.module_id.toString() === mod.id.toString())

        if (fieldIndex === -1) return null

        const fieldData = fields[fieldIndex]

        /* CRUD permissions options */
        const permissionOptions = MODULE_PERMISSION_OPTIONS

        /* Find role permissions for this specific module */
        const rolePermission = selectedRoleId && rolePermissions.find(
          permission => permission.role_id.toString() === selectedRoleId.toString() &&
                       permission.module_id.toString() === mod.id.toString()
        )

        /* Get protected permissions (those set to true by role) */
        const protectedPermissions = rolePermission ?
          permissionOptions
            .filter(option => {
              const permissionValue = rolePermission[option.value as keyof typeof rolePermission]

              return Boolean(permissionValue) === true
            })
            .map(option => option.value) : []

        return (
          <React.Fragment key={`${mod.id}-${JSON.stringify(fieldData)}`}>
            <ModuleAssignmentsTable
              label={mod.name}
              options={permissionOptions}
              control={control}
              moduleIndex={fieldIndex}
              disabled={isReadonly || !selectedRoleId}
              readOnly={isReadonly || !selectedRoleId}
              helpText={mod.description || `Configure permissions for ${mod.name} module`}
              isLastRow={(modules.length - 1) === index}
              protectedPermissions={protectedPermissions}
            />
          </React.Fragment>
        )
      })}
    </Flex>
  )
}

export default ModuleAssignmentsSection