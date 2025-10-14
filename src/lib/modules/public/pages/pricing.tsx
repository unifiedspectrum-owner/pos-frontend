'use client'

/* Libraries imports */
import React, { useState, useCallback } from 'react'
import { Box, Flex, Heading, Text, Stack, Spinner } from '@chakra-ui/react'
import { FiPackage } from 'react-icons/fi'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { EmptyStateContainer, ErrorMessageContainer } from '@shared/components/common'

/* Plan management module imports */
import { usePlans } from '@plan-management/hooks'
import { Plan } from '@plan-management/types'

/* Tenant management module imports */
import { PLAN_BILLING_CYCLE, MAX_BRANCH_COUNT } from '@tenant-management/constants'
import { PlanBillingCycle } from '@tenant-management/types'
import PlansGrid from '@tenant-management/forms/account/steps/components/plan-selection/plans-grid'
import BillingCycleSelector from '@tenant-management/forms/account/steps/components/plan-selection/billing-cycle-selector'

/* Public module imports */
import { PublicLayout } from '@public/components/layout'

/* Public pricing page component */
export const PricingPage: React.FC = () => {
  /* Fetch plans using the use-plans hook */
  const { plans, loading, error } = usePlans({ autoFetch: true })

  /* Local state for billing cycle and selected plan */
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle>(PLAN_BILLING_CYCLE.MONTHLY)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [branchCount, setBranchCount] = useState<number>(1)

  /* Plan selection handler with branch count adjustment */
  const handlePlanSelect = useCallback((plan: Plan) => {
    setSelectedPlan(plan)

    /* Adjust branch count if current selection exceeds new plan's limit */
    const planMaxBranches = plan.included_branches_count || MAX_BRANCH_COUNT
    const effectiveMaxBranches = Math.min(planMaxBranches, MAX_BRANCH_COUNT)

    if (branchCount > effectiveMaxBranches) {
      setBranchCount(effectiveMaxBranches)
    }
  }, [branchCount])

  /* Calculate discount percentage for annual billing */
  const discountPercentage = selectedPlan?.annual_discount_percentage || (plans[0]?.annual_discount_percentage || 0)

  return (
    <PublicLayout>
      <Box w="100%" bg="gray.50">
        <Flex flexDir={'column'} gap={10} px={10}>
          {/* Page header */}
          <Stack gap={4} textAlign="center" >
            <Heading as="h1" size="3xl" color={PRIMARY_COLOR}>
              Choose Your Plan
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
              Select the perfect plan for your business. All plans include our core features with flexible pricing options.
            </Text>
          </Stack>

          <Box >
            {/* Billing cycle selector */}
            {!loading && !error && plans.length > 0 && (
                <BillingCycleSelector
                  value={billingCycle}
                  onChange={setBillingCycle}
                  discountPercentage={discountPercentage}
                />
              )}
          </Box>

          {/* Loading state */}
          {loading && (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color={PRIMARY_COLOR} />
            </Flex>
          )}

          {/* Error state */}
          {error && !loading && (
            <ErrorMessageContainer
              title="Failed to Load Plans"
              error={error}
            />
          )}

          {/* Plans grid */}
          {!loading && !error && plans.length > 0 && (
            <Box>
              <PlansGrid
                plans={plans.filter(plan => Boolean(plan.is_active))}
                selectedPlan={selectedPlan}
                billingCycle={billingCycle}
                onPlanSelect={handlePlanSelect}
                branchCount={branchCount}
                onBranchCountChange={setBranchCount}
              />
            </Box>
          )}

          {/* Empty state */}
          {!loading && !error && plans.length === 0 && (
            <EmptyStateContainer
              icon={<FiPackage size={48} />}
              title="No Plans Available"
              description="There are currently no subscription plans available. Please check back later."
            />
          )}

          {/* Additional information */}
          <Box textAlign="center">
            <Text fontSize="lg" color="gray.600">
              Need a custom solution? Contact our sales team for enterprise pricing.
            </Text>
          </Box>
        </Flex>
      </Box>
    </PublicLayout>
  )
}
