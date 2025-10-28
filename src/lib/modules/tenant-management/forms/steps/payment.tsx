"use client"

/* React and Chakra UI component imports */
import React, { useState, useEffect, useCallback } from 'react'
import { Flex, Box, Spinner, Text } from '@chakra-ui/react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

/* Stripe payment integration imports */
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'
import { handleApiError, PRIMARY_COLOR, WHITE_COLOR } from '@/lib/shared'

/* Tenant module imports */
import { CheckoutForm } from './components'
import { subscriptionService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS, PLAN_BILLING_CYCLE } from '@tenant-management/constants'
import { AssignedPlanDetails } from '@tenant-management/types'
import { calculateSingleAddonPrice } from '@tenant-management/utils'
import { AxiosError } from 'axios'

/* Initialize Stripe with publishable key */
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

/* Props interface for payment step component */
interface PaymentStepProps {
  isCompleted: (completed: boolean) => void
  onPrevious: () => void
  onPaymentFailed?: (errorMessage: string, errorCode: string) => void
  amount?: number
}

/* Payment step component for tenant account creation */
const PaymentStep: React.FC<PaymentStepProps> = ({
  onPrevious,
  onPaymentFailed,
  amount = 100
}) => {
  /* Payment state management */
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [assignedPlanData, setAssignedPlanData] = useState<AssignedPlanDetails | null>(null)
  const [totalAmount, setTotalAmount] = useState<number>(amount)
  const [planTotalAmount, setPlanTotalAmount] = useState<number>(0)
  const [branchAddonTotalAmount, setBranchAddonTotalAmount] = useState<number>(0)
  const [orgAddonTotalAmount, setOrgAddonTotalAmount] = useState<number>(0)

  /* Check if this is a retry attempt */
  const [isRetryAttempt, setIsRetryAttempt] = useState(false)

  /* Load payment data from localStorage and fetch assigned plan */
  const loadPaymentData = useCallback(async () => {
    try {
      /* Fetch assigned plan data from API */
      const tenantId = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)
      if (tenantId) {
        const response = await subscriptionService.getAssignedPlanForTenant(tenantId)
        
        if (response.success && response.data) {
          const planData = response.data;
          setAssignedPlanData(planData)
          
          /* Calculate all pricing components from plan data using correct pricing logic */
          const isAnnual = planData.billingCycle === PLAN_BILLING_CYCLE.YEARLY
          const discountFactor = isAnnual ? (100 - (planData.plan.annual_discount_percentage || 0)) / 100 : 1
          
          /* Calculate plan total with branch count consideration */
          const planPrice = planData.plan.monthly_price * planData.branchCount
          const planTotal = Math.floor(planPrice * (isAnnual ? 12 : 1) * discountFactor)
          
          /* Calculate organization addons total using individual addon pricing */
          const orgAddonTotal = Math.floor(planData.add_ons
            .filter(addon => addon.pricing_scope === 'organization')
            .reduce((total, addon) => {
              return total + calculateSingleAddonPrice(addon.addon_price, planData.billingCycle, planData.plan.annual_discount_percentage || 0)
            }, 0))
          
          /* Calculate branch addons total using individual addon pricing */
          const branchAddonTotal = Math.floor(planData.add_ons
            .filter(addon => addon.pricing_scope === 'branch')
            .reduce((total, addon) => {
              const selectedBranchCount = addon.branches.filter(branch => branch.isSelected && branch.branchIndex < planData.branchCount).length
              const singleAddonPrice = calculateSingleAddonPrice(addon.addon_price, planData.billingCycle, planData.plan.annual_discount_percentage || 0)
              return total + (singleAddonPrice * selectedBranchCount)
            }, 0))
          
          const grandTotal = planTotal + orgAddonTotal + branchAddonTotal
          
          /* Set calculated amounts */
          setPlanTotalAmount(planTotal)
          setBranchAddonTotalAmount(branchAddonTotal)
          setOrgAddonTotalAmount(orgAddonTotal)
          setTotalAmount(grandTotal)
        }
      }
    } catch (error) {
      console.warn('Failed to load payment data:', error)
      const err = error as AxiosError;
      handleApiError(err, {title: "Failed to load payment data"})
    } finally {
      setIsLoading(false)
    }
    return false
  }, [])

  /* Initialize payment data on component mount */
  useEffect(() => {
    /* Check if this is a retry attempt */
    const failedPaymentIntent = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT)
    setIsRetryAttempt(!!failedPaymentIntent)
    
    loadPaymentData()
  }, [loadPaymentData])

  /* Handle payment success - navigate to success step */
  const handlePaymentSuccess = () => {
    console.log('[PaymentStep] Payment successful, navigating to success step')
    
    /* Clear retry state on successful payment */
    setIsRetryAttempt(false)
    localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT)
  }

  /* Handle payment failure - navigate to failure step */
  const handlePaymentFailed = (errorMessage: string, errorCode: string) => {
    console.log('[PaymentStep] Payment failed, navigating to failure step:', { errorMessage, errorCode })
    if (onPaymentFailed) {
      onPaymentFailed(errorMessage, errorCode)
    }
  }

  /* Stripe Elements options for subscription checkout session */
  const options: StripeElementsOptions = {
    mode: 'subscription',
    amount: totalAmount * 100,
    currency: 'sgd',
    setupFutureUsage: 'off_session', /* Save payment method for recurring charges */
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: PRIMARY_COLOR,
      },
    },
    loader: 'auto',
  }

  return (
    <Flex 
      flexDir={'column'} 
      gap={6} 
      borderWidth={1} 
      bg={WHITE_COLOR} 
      borderBottomRadius={'lg'} 
      p={8}
      transition="all 0.3s ease"
      borderColor={PRIMARY_COLOR}
      _hover={{
        boxShadow: "0 8px 24px rgba(136, 92, 247, 0.15)"
      }}
    >
      {/* Retry payment banner */}
      {isRetryAttempt && !isLoading && (
        <Flex p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200" alignItems="center" gap={3}>
          <Box color="blue.500" fontSize="lg">ℹ️</Box>
          <Box>
            <Text fontSize="md" fontWeight="semibold" color="blue.700">
              Retry Payment
            </Text>
            <Text fontSize="sm" color="blue.600">
              Please enter new payment details to complete your subscription.
            </Text>
          </Box>
        </Flex>
      )}

      {/* Loading state */}
      {isLoading && (
        <Flex flexDir="column" justifyContent={'center'} gap={6} alignItems="center">
          <Spinner size="lg" color={PRIMARY_COLOR} />
          <Box textAlign="center" fontSize="lg">Loading payment details...</Box>
        </Flex>
      )}

      <Flex direction={{ base: "column", lg: "row" }} justifyContent={'center'} alignItems={'center'} gap={8} align="flex-start">
        {/* Enhanced payment summary with detailed breakdown */}
        {!isLoading && assignedPlanData && (
          <Box flex="1" p={6} bg="white" border="1px" borderColor="gray.200" borderRadius="lg" boxShadow="sm">
            <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.800">Payment Summary</Text>
            
            {/* Plan details section */}
            <Box mb={4}>
              <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={2}>Subscription Plan</Text>
              <Flex justifyContent="space-between" alignItems="center" mb={2} p={3} bg="purple.50" borderRadius="md">
                <Box>
                  <Text fontWeight="medium" fontSize="md">{assignedPlanData.plan.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    ${assignedPlanData.plan.monthly_price.toFixed(2)}/month × {assignedPlanData.branchCount} branches
                  </Text>
                  {/* <Text fontSize="sm" color="gray.600">
                    {assignedPlanData.billingCycle === 'yearly' ? 'Annual Billing' : 'Monthly Billing'} • 
                    {assignedPlanData.plan.included_branches_count} branches included
                  </Text> */}
                  {assignedPlanData.billingCycle === 'yearly' && assignedPlanData.plan.annual_discount_percentage > 0 && (
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      {assignedPlanData.plan.annual_discount_percentage}% annual discount applied
                    </Text>
                  )}
                </Box>
                <Text fontWeight="semibold" fontSize="md">
                  ${(assignedPlanData.plan.monthly_price * assignedPlanData.branchCount).toFixed(2)}/month
                </Text>
              </Flex>
            </Box>

            {/* Branch count information */}
            {assignedPlanData.branchCount > (assignedPlanData.plan.included_branches_count || 0) && (
              <Box mb={4}>
                <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={2}>Additional Branches</Text>
                <Flex justifyContent="space-between" alignItems="center" p={3} bg="blue.50" borderRadius="md">
                  <Box>
                    <Text fontWeight="medium" fontSize="md">
                      Extra branches ({assignedPlanData.branchCount - (assignedPlanData.plan.included_branches_count || 0)})
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Beyond the {assignedPlanData.plan.included_branches_count || 0} included branches
                    </Text>
                  </Box>
                  <Text fontWeight="semibold" fontSize="md">
                    ${((assignedPlanData.branchCount - (assignedPlanData.plan.included_branches_count || 0)) * 10).toFixed(2)}/month
                  </Text>
                </Flex>
              </Box>
            )}

            {/* Addons section */}
            {assignedPlanData.add_ons.length > 0 && (
              <Box mb={4}>
                <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={2}>Selected Add-ons</Text>
                {assignedPlanData.add_ons.map((addon, index) => {
                  const selectedBranchCount = addon.pricing_scope === 'branch' 
                    ? addon.branches.filter(branch => branch.isSelected && branch.branchIndex < assignedPlanData.branchCount).length
                    : 1
                  const singleAddonPrice = calculateSingleAddonPrice(addon.addon_price, assignedPlanData.billingCycle, assignedPlanData.plan.annual_discount_percentage || 0)
                  const addonTotal = addon.pricing_scope === 'branch' ? singleAddonPrice * selectedBranchCount : singleAddonPrice
                  const billingPeriod = assignedPlanData.billingCycle === PLAN_BILLING_CYCLE.YEARLY ? 'year' : 'month'
                  return (
                    <Flex key={index} justifyContent="space-between" alignItems="center" mb={2} p={3} bg="purple.50" borderRadius="md">
                      <Box>
                        <Text fontWeight="medium" fontSize="md">{addon.addon_name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          ${addon.addon_price.toFixed(2)}/month per {addon.pricing_scope === 'branch' ? 'branch' : 'organization'}
                          {addon.pricing_scope === 'branch' && ` × ${selectedBranchCount} selected branches`}
                        </Text>
                      </Box>
                      <Text fontWeight="semibold" fontSize="md">${addonTotal.toFixed(2)}/{billingPeriod}</Text>
                    </Flex>
                  )
                })}
              </Box>
            )}

            {/* Billing cycle and discount information */}
            {assignedPlanData.billingCycle === 'yearly' && (
              <Box mb={4} p={3} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                <Flex alignItems="center" gap={2} mb={1}>
                  <Text fontSize="sm" fontWeight="medium" color="green.700">Annual Billing Benefits</Text>
                </Flex>
                <Text fontSize="xs" color="green.600">
                  • Pay for 12 months and save {assignedPlanData.plan.annual_discount_percentage}%
                </Text>
                <Text fontSize="xs" color="green.600">
                  • Lock in current pricing for the full year
                </Text>
              </Box>
            )}

            {/* Total calculation breakdown */}
            <Box pt={4} borderTop="2px" borderColor="gray.200">
              <Flex justifyContent="space-between" mb={2}>
                <Text fontSize="md" color="gray.600">Subtotal ({assignedPlanData.billingCycle})</Text>
                <Text fontSize="md" fontWeight="medium">
                  ${(assignedPlanData.plan.monthly_price * assignedPlanData.branchCount + 
                    assignedPlanData.add_ons.reduce((total, addon) => {
                      const selectedBranchCount = addon.pricing_scope === 'branch' 
                        ? addon.branches.filter(branch => branch.isSelected && branch.branchIndex < assignedPlanData.branchCount).length
                        : 1
                      return total + (addon.addon_price * selectedBranchCount)
                    }, 0)
                  ).toFixed(2)}/month
                </Text>
              </Flex>
              
              {assignedPlanData.billingCycle === 'yearly' && assignedPlanData.plan.annual_discount_percentage > 0 && (
                <Flex justifyContent="space-between" mb={2}>
                  <Text fontSize="md" color="green.600">Annual discount ({assignedPlanData.plan.annual_discount_percentage}%)</Text>
                  <Text fontSize="md" color="green.600" fontWeight="medium">
                    -${(totalAmount / (1 - assignedPlanData.plan.annual_discount_percentage / 100) - totalAmount).toFixed(2)}
                  </Text>
                </Flex>
              )}
              
              <Flex justifyContent="space-between" pt={3} borderTop="1px" borderColor="gray.300">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  Total Due {assignedPlanData.billingCycle === 'yearly' ? '(Annual)' : '(Monthly)'}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
                  ${totalAmount.toFixed(2)}
                </Text>
              </Flex>
              
              {assignedPlanData.billingCycle === 'yearly' && (
                <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                  Equivalent to ${(totalAmount / 12).toFixed(2)}/month
                </Text>
              )}
            </Box>
          </Box>
        )}

        {/* Stripe payment form */}
        {!isLoading && (
          <Box flex="1" minW={{ base: "100%", lg: "400px" }}>
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm 
                planData={assignedPlanData} 
                amount={totalAmount} 
                planTotalAmount={planTotalAmount}
                branchAddonTotalAmount={branchAddonTotalAmount}
                orgAddonTotalAmount={orgAddonTotalAmount}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
                isRetryAttempt={isRetryAttempt}
              />
            </Elements>
          </Box>
        )}
      </Flex>
      
      {/* Step navigation controls */}
      <Flex justify="space-between" pt={4}>
        <SecondaryButton 
          onClick={onPrevious}
          leftIcon={FiArrowLeft}
          disabled={isLoading}
        >
          Back to Addon Selection
        </SecondaryButton>
        
        {/* Show complete button after successful payment */}
        <PrimaryButton 
          //onClick={handleContinue}
          rightIcon={FiArrowRight}
        >
          Complete Setup
        </PrimaryButton>
      </Flex>
    </Flex>
  )
}

export default PaymentStep