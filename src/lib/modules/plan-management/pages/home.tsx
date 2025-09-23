"use client"

/* React and Chakra UI component imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer } from '@shared/components'
import { usePermissions } from '@shared/contexts'
import { PERMISSION_ACTIONS } from '@shared/constants/rbac'

/* Plan module imports */
import PlanTable from '@plan-management/tables/plans'
import { PLAN_MODULE_NAME, PLAN_PAGE_ROUTES } from '@plan-management/constants'
import { usePlans } from '@plan-management/hooks'

/* Main plan management list component */
const PlanManagement: React.FC = () => {
  /* Navigation and translation hooks */
  const router = useRouter()
  const t = useTranslations('PlanManagement')
  const { hasSpecificPermission } = usePermissions()

  /* Plans data hook */
  const { plans, loading, error, lastUpdated, refetch } = usePlans()

  /* Handle manual refresh of plan data */
  const handleRefresh = () => {
    refetch()
    console.log(`[PlanManagement] ${t('messages.dataRefreshed')}`)
  }

  /* Navigate to plan creation page */
  const handleAddPlan = () => {
    router.push(PLAN_PAGE_ROUTES.CREATE)
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header section with add and refresh buttons */}
      <HeaderSection
        translation={'PlanManagement'}
        loading={loading}
        handleAdd={hasSpecificPermission(PLAN_MODULE_NAME, PERMISSION_ACTIONS.CREATE) ? handleAddPlan : undefined}
        handleRefresh={handleRefresh}
        showAddButton={hasSpecificPermission(PLAN_MODULE_NAME, PERMISSION_ACTIONS.CREATE)}
      />
      
      {/* Conditional rendering based on error state */}
      {error ? (
        /* Show error message with retry option */
        <ErrorMessageContainer
          error={error}
          title={t('errors.loadingPlans')}
          onRetry={refetch}
          isRetrying={loading}
          testId="plan-management-error"
        />
      ) : (
        /* Show plan table when no errors */
        <PlanTable
          plans={plans}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          loading={loading}
        />
      )}
    </Flex>
  );
}

export default PlanManagement