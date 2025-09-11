"use client"

/* React and Chakra UI component imports */
import React, { useEffect, useState } from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer } from '@shared/components'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Tenant module imports */
import TenantTable from '@tenant-management/tables/tenants'
import { TenantWithPlanDetails } from '@tenant-management/types/account/list'
import { tenantApiService } from '@tenant-management/api'

/* Pagination interface for tenant list */
interface PaginationInfo {
  current_page: number
  limit: number
  total_count: number
  total_pages: number
  has_next_page: boolean
  has_prev_page: boolean
}

/* Main tenant management list component */
const TenantManagement: React.FC = () => {
  const router = useRouter(); /* Next.js router for navigation */
  const [tenants, setTenants] = useState<TenantWithPlanDetails[]>([]); /* Array of tenant data */
  const [loading, setLoading] = useState<boolean>(true); /* Loading state for data fetching */
  const [error, setError] = useState<string | null>(null); /* Error message state */
  const [lastUpdated, setLastUpdated] = useState<string>(''); /* Timestamp of last data update */
  const [pagination, setPagination] = useState<PaginationInfo>(); /* Pagination information */

  /* Fetch tenants on component mount */
  useEffect(() => {
    fetchTenants();
  }, []);

  const t = useTranslations('TenantManagement');

  /* Handle manual refresh of tenant data */
  const handleRefresh = () => {
    fetchTenants();
    console.log(`[TenantManagement] ${t('messages.dataRefreshed')}`);
  };

  /* Navigate to tenant creation page */
  const handleAddTenant = () => {
    router.push('/admin/tenant-management/create');
  };

  /* Fetch tenant list from API */
  const fetchTenants = async() => {
    try {
      setLoading(true); /* Show loading state */
      setError(null); /* Clear previous errors */

      /* Add artificial delay if enabled for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
      }

      /* Call API to get all tenants */
      const response = await tenantApiService.listAllTenants();
      
      /* Handle successful response */
      if (response.success) {
        setTenants(response.tenants); /* Update tenants state */
        setPagination(response.pagination); /* Update pagination info */
        setLastUpdated(new Date().toLocaleString()); /* Set current timestamp */
      } else {
        /* Handle API error response */
        setError(response.message || t('errors.fetchFailed'));
      }

    } catch (error: unknown) {
      setError(error as string); /* Pass error to ErrorMessageContainer */
    } finally {
      setLoading(false); /* Hide loading state */
    }
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header section with add and refresh buttons */}
      <HeaderSection
        loading={loading}
        handleAdd={handleAddTenant}
        handleRefresh={handleRefresh}
      />
      
      {/* Conditional rendering based on error state */}
      {error ? (
        /* Show error message with retry option */
        <ErrorMessageContainer
          error={error}
          title={t('errors.loadingTenants')}
          onRetry={fetchTenants}
          isRetrying={loading}
          testId="tenant-management-error"
        />
      ) : (
        /* Show tenant table when no errors */
        <TenantTable 
          tenants={tenants} 
          lastUpdated={lastUpdated} 
          onTenantDeleted={fetchTenants} 
          loading={loading}
          pagination={pagination}
        />
      )}
    </Flex>
  );
}

export default TenantManagement