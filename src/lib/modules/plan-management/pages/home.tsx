"use client"

/* React and Chakra UI component imports */
import React, { useEffect, useState } from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer } from '@shared/components'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Plan module imports */
import PlanTable from '@plan-management/tables/plans'
import { Plan } from '@plan-management/types/plans'
import { planService } from '@plan-management/api'

/* Main plan management list component */
const PlanManagement: React.FC = () => {
  const router = useRouter(); /* Next.js router for navigation */
  const [plans, setPlans] = useState<Plan[]>([]); /* Array of subscription plans */
  const [loading, setLoading] = useState<boolean>(true); /* Loading state for data fetching */
  const [error, setError] = useState<string | null>(null); /* Error message state */
  const [lastUpdated, setLastUpdated] = useState<string>(''); /* Timestamp of last data update */

  /* Fetch plans on component mount */
  useEffect(() => {
    fetchPlans();
  }, []);

  const t = useTranslations('PlanManagement');

  /* Handle manual refresh of plan data */
  const handleRefresh = () => {
    fetchPlans();
    console.log(`[PlanManagement] ${t('messages.dataRefreshed')}`);
  };

  /* Navigate to plan creation page */
  const handleAddPlan = () => {
    router.push('/admin/plan-management/create');
  };

  /* Fetch subscription plans from API */
  const fetchPlans = async() => {
    try {
      setLoading(true); /* Show loading state */
      setError(null); /* Clear previous errors */

      /* Add artificial delay if enabled for testing */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
      }

      /* Call API to get all subscription plans */
      const response = await planService.getAllSubscriptionPlans();
      
      /* Handle successful response */
      if (response.data.success && response.data.data) {
        setPlans(response.data.data); /* Update plans state */
        setLastUpdated(response.data.timestamp); /* Update last fetched timestamp */
      } else {
        /* Handle API error response */
        setError(response.data.message || t('errors.fetchFailed'));
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
        handleAdd={handleAddPlan}
        handleRefresh={handleRefresh}
      />
      
      {/* Conditional rendering based on error state */}
      {error ? (
        /* Show error message with retry option */
        <ErrorMessageContainer
          error={error}
          title={t('errors.loadingPlans')}
          onRetry={fetchPlans}
          isRetrying={loading}
          testId="plan-management-error"
        />
      ) : (
        /* Show plan table when no errors */
        <PlanTable 
          plans={plans} 
          lastUpdated={lastUpdated} 
          onPlanDeleted={fetchPlans} 
          loading={loading}
        />
      )}
    </Flex>
  );
}

export default PlanManagement