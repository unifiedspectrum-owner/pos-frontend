"use client"

/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer } from '@shared/components'
import { usePermissions } from '@shared/contexts'
import { PERMISSION_ACTIONS } from '@shared/constants/rbac'

/* Tenant module imports */
import TenantTable from '@tenant-management/tables/tenants'
import { TENANT_MODULE_NAME, TENANT_PAGE_ROUTES } from '@tenant-management/constants'
import { useTenants } from '@tenant-management/hooks'

const TenantManagement: React.FC = () => {
  /* Navigation and permissions */
  const router = useRouter()
  const { hasSpecificPermission } = usePermissions()

  /* Tenant data hook */
  const { tenants, loading, error, lastUpdated, pagination, fetchTenants, refetch } = useTenants({
    autoFetch: true
  })

  /* Navigation handlers */
  const handleAddTenant = () => {
    router.push(TENANT_PAGE_ROUTES.CREATE)
  }

  /* Manual refresh triggered by header refresh button */
  const handleRefresh = () => {
    refetch()
    console.log('[TenantManagement] Tenant data refreshed successfully')
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header with navigation and actions */}
      <HeaderSection
        showAddButton={hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.CREATE)}
        translation={'TenantManagement'}
        loading={loading}
        handleAdd={hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.CREATE) ? handleAddTenant : undefined}
        handleRefresh={handleRefresh}
      />
      
      {/* Error state */}
      {error && (
        <ErrorMessageContainer
          error={error}
          title="Error Loading Tenants"
          onRetry={refetch}
          isRetrying={loading}
          testId="tenant-management-error"
        />
      )}

      {/* Data table */}
      <TenantTable 
        tenants={tenants} 
        lastUpdated={lastUpdated} 
        onRefresh={refetch}
        onPageChange={fetchTenants}
        loading={loading}
        pagination={pagination}
      />
    </Flex>
  )
}

export default TenantManagement