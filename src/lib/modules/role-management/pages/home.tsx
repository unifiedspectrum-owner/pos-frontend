"use client"

/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer } from '@shared/components'
import { usePermissions } from '@shared/contexts'
import { PERMISSION_ACTIONS } from '@shared/constants/rbac'

/* Role module imports */
import { RoleTable } from '@role-management/tables'
import { useRoles } from '@role-management/hooks'
import { ROLE_PAGE_ROUTES, ROLE_MODULE_NAME } from '@role-management/constants'

const RoleManagement: React.FC = () => {
  /* Navigation and permissions */
  const router = useRouter()
  const { hasSpecificPermission } = usePermissions()

  /* Data operations */
  const { roles, loading, error, lastUpdated, pagination, fetchRoles, refetch } = useRoles()

  /* Navigation handlers */
  const handleAddRole = () => {
    router.push(ROLE_PAGE_ROUTES.CREATE)
  }

  /* Manual refresh triggered by header refresh button */
  const handleRefresh = () => {
    refetch()
    console.log('[RoleManagement] Role data refreshed successfully')
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header with navigation and actions */}
      <HeaderSection
        showAddButton={hasSpecificPermission(ROLE_MODULE_NAME, PERMISSION_ACTIONS.CREATE)}
        translation={'RoleManagement'}
        loading={loading}
        handleAdd={hasSpecificPermission(ROLE_MODULE_NAME, PERMISSION_ACTIONS.CREATE) ? handleAddRole : undefined}
        handleRefresh={handleRefresh}
      />

      {/* Error state */}
      {error && (
        <ErrorMessageContainer
          error={error}
          title="Error Loading Roles"
          onRetry={fetchRoles}
          isRetrying={loading}
          testId="role-management-error"
        />
      )}

      {/* Data table */}
      <RoleTable
        roles={roles}
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        onPageChange={(page, limit) => fetchRoles(page, limit)}
        loading={loading}
        pagination={pagination}
      />
    </Flex>
  )
}

export default RoleManagement