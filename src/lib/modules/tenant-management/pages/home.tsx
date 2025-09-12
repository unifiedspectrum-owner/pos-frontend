"use client"

/* Libraries imports */
import React, { useEffect, useState, useCallback } from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer } from '@shared/components'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'
import { PaginationInfo } from '@shared/types'
import { handleApiError } from '@shared/utils'

/* Tenant module imports */
import TenantTable from '@tenant-management/tables/tenants'
import { TenantWithPlanDetails } from '@tenant-management/types/account/list'
import { tenantManagementService } from '@tenant-management/api'
import { AxiosError } from 'axios'

const TenantManagement: React.FC = () => {
  /* Navigation and routing */
  const router = useRouter()

  /* Component state */
  const [tenants, setTenants] = useState<TenantWithPlanDetails[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationInfo>()

  /* Navigation handlers */
  const handleAddTenant = () => {
    router.push('/admin/tenant-management/create')
  }

  /* Manual refresh triggered by header refresh button */
  const handleRefresh = () => {
    fetchTenants()
    console.log('[TenantManagement] Tenant data refreshed successfully')
  }

  /* Data fetching */
  const fetchTenants = useCallback(async(page: number = 1, limit: number = 10) => {
    try {
      setLoading(true)
      setError(null)
      
      /* Artificial delay for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }
      
      /* API call with pagination */
      const response = await tenantManagementService.listAllTenants(page, limit)
      
      /* Handle response */
      if (response.success) {
        setTenants(response.tenants)
        setPagination(response.pagination)
        setLastUpdated(new Date().toLocaleString())
        console.log('[TenantManagement] Successfully fetched', response.tenants.length, 'tenants')
      } else {
        const errorMsg = response.message || 'Failed to fetch tenants'
        console.error('[TenantManagement] API error:', errorMsg)
        setError(errorMsg)
      }
      
    } catch (error: unknown) {
      console.error('[TenantManagement] Fetch error:', error);
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Tenants'
      })
      setTenants([])
      setError('Failed to load tenant data')
    } finally {
      setLoading(false)
    }
  }, [])
  
  /* Initial data load */
  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header with navigation and actions */}
      <HeaderSection
        showAddButton={false}
        translation={'TenantManagement'}
        loading={loading}
        handleAdd={handleAddTenant}
        handleRefresh={handleRefresh}
      />
      
      {/* Error state */}
      {error && (
        <ErrorMessageContainer
          error={error}
          title="Error Loading Tenants"
          onRetry={fetchTenants}
          isRetrying={loading}
          testId="tenant-management-error"
        />
      )}

      {/* Data table */}
      <TenantTable 
        tenants={tenants} 
        lastUpdated={lastUpdated} 
        onTenantDeleted={() => fetchTenants()} 
        onPageChange={(page, limit) => fetchTenants(page, limit)}
        loading={loading}
        pagination={pagination}
      />
    </Flex>
  )
}

export default TenantManagement