"use client"

/* React and UI component imports */
import React, { useEffect, useState } from 'react'
import { Text, VStack, Box, Spinner, Container, Flex } from '@chakra-ui/react'
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa'
import { useSearchParams, useRouter } from 'next/navigation'

/* Shared module imports */
import { PrimaryButton } from '@shared/components/form-elements/buttons'
import { createToastNotification } from '@shared/utils/ui'
import { PRIMARY_COLOR } from '@shared/config'

/* Tenant module imports */
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { paymentService } from '@tenant-management/api'
import { handleApiError } from '@shared/utils'
import { CachedPaymentStatusData } from '@/lib/modules/tenant-management/types/subscription'
import { AxiosError } from 'axios'

/* Payment status type */
type PaymentStatus = 'loading' | 'success' | 'failed' | 'cancelled'

/* Payment success page component */
const PaymentSuccessPage: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<PaymentStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  /* Check payment status by calling API */
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const paymentIntent = searchParams.get('payment_intent')
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')

      console.log('[PaymentSuccess] URL params:', {
        paymentIntent,
        paymentIntentClientSecret,
      })

      /* Validate required parameters */
      if (!paymentIntent) {
        console.error('[PaymentSuccess] Missing payment_intent parameter')
        setStatus('failed')
        setErrorMessage('Invalid payment session. Please try again.')
        // setTimeout(() => {
        //   router.push('/tenant/create')
        // }, 3000)
        return
      }

      try {
        console.log('[PaymentSuccess] Calling payment status API...')
        
        /* Call API to get payment status */
        const response  = await paymentService.getPaymentStatusForTenant({
          payment_intent: paymentIntent
        })

        console.log('[PaymentSuccess] API response:', response)

        if (!response.success || !response.data) {
          console.error('[PaymentSuccess] API returned error:', response.message)
          setStatus('failed')
          setErrorMessage(response.message || 'Failed to verify payment status.')
          
          createToastNotification({
            title: 'Payment Verification Failed',
            description: response.message || 'Unable to verify payment status.',
            type: 'error'
          })

          // setTimeout(() => {
          //   router.push('/tenant/create')
          // }, 3000)
          return
        }

        const paymentStatusData = response.data
        const statusInfo = paymentStatusData.status_info

        console.log('[PaymentSuccess] Payment status info:', statusInfo)

        if (statusInfo.is_successful) {
          console.log('[PaymentSuccess] Payment successful');

          const paymentStatusData: CachedPaymentStatusData = {
            paymentSucceeded: true,
            completedAt: new Date().toISOString(),
            paymentIntent,
            statusMessage: statusInfo.status_message
          }
          
          /* Store payment success in localStorage */
          localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_DATA, JSON.stringify(paymentStatusData))

          setStatus('success')
          
          /* Show success toast */
          createToastNotification({
            title: 'Payment Successful',
            description: statusInfo.status_message || 'Your payment has been processed successfully.',
            type: 'success'
          })

          /* Navigate to main flow after short delay */
          // setTimeout(() => {
          //   router.push('/tenant/create')
          // }, 2000)

        } else if (statusInfo.is_failed) {
          console.log('[PaymentSuccess] Payment failed')
          setStatus('failed')
          setErrorMessage(statusInfo.status_message || 'Your payment could not be processed. Please try again.')
          
          /* Show error toast */
          createToastNotification({
            title: 'Payment Failed',
            description: statusInfo.status_message || 'Your payment could not be processed.',
            type: 'error'
          })

          /* Navigate back to payment step after delay */
          // setTimeout(() => {
          //   router.push('/tenant/create')
          // }, 3000)

        } else if (statusInfo.is_pending || statusInfo.requires_action) {
          console.log('[PaymentSuccess] Payment pending or requires action')
          setStatus('loading')
          setErrorMessage('Your payment is still being processed. Please wait...')
          
          /* Retry status check after delay */
          setTimeout(() => {
            checkPaymentStatus()
          }, 3000)

        } else {
          console.log('[PaymentSuccess] Payment cancelled or unknown status')
          setStatus('cancelled')
          
          /* Navigate back immediately for cancelled payments */
          // setTimeout(() => {
          //   router.push('/tenant/create')
          // }, 2000)
        }

      } catch (error) {
        console.error('[PaymentSuccess] API call failed:', error)
        setStatus('failed')
        setErrorMessage('Failed to verify payment status. Please try again.');
        const err = error as AxiosError;
        
        handleApiError(err, {
          title: 'Payment Status Check Failed'
        })

        /* Navigate back after delay */
        // setTimeout(() => {
        //   router.push('/tenant/create')
        // }, 3000)
      }
    }

    checkPaymentStatus()
  }, [searchParams, router])

  /* Navigate back to tenant creation */
  const handleContinue = () => {
    //router.push('/tenant/create')
  }

  return (
    <Container maxW="md" py={16}>
      <Flex minH="60vh" align="center" justify="center">
        <Box w="100%" p={8} bg="white" borderRadius="xl" boxShadow="lg" borderWidth="1px">
          
          {/* Loading State */}
          {status === 'loading' && (
            <VStack gap={6} textAlign="center">
              <Spinner size="xl" color={PRIMARY_COLOR} borderWidth="4px" />
              <VStack gap={2}>
                <Text fontSize="xl" fontWeight="bold">
                  Verifying Payment
                </Text>
                <Text color="gray.600">
                  {errorMessage || 'Please wait while we confirm your payment status...'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  This may take a few moments
                </Text>
              </VStack>
            </VStack>
          )}

          {/* Success State */}
          {status === 'success' && (
            <VStack gap={6} textAlign="center">
              <Box color="green.500" fontSize="6xl">
                <FaCheckCircle />
              </Box>
              <VStack gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  Payment Successful!
                </Text>
                <Text color="gray.600" maxW="400px">
                  Your payment has been processed successfully. You will be automatically 
                  redirected to complete your account setup.
                </Text>
              </VStack>
              <PrimaryButton onClick={handleContinue}>
                Continue Setup
              </PrimaryButton>
            </VStack>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <VStack gap={6} textAlign="center">
              <Box color="red.500" fontSize="6xl">
                <FaExclamationTriangle />
              </Box>
              <VStack gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                  Payment Failed
                </Text>
                <Text color="gray.600" maxW="400px">
                  {errorMessage || 'Your payment could not be processed. Please try again with a different payment method.'}
                </Text>
              </VStack>
              <PrimaryButton onClick={handleContinue}>
                Try Again
              </PrimaryButton>
            </VStack>
          )}

          {/* Cancelled State */}
          {status === 'cancelled' && (
            <VStack gap={6} textAlign="center">
              <Box color="gray.500" fontSize="6xl">
                <FaTimes />
              </Box>
              <VStack gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.600">
                  Payment Cancelled
                </Text>
                <Text color="gray.600" maxW="400px">
                  You cancelled the payment process. You can continue with your account setup.
                </Text>
              </VStack>
              <PrimaryButton onClick={handleContinue}>
                Back to Setup
              </PrimaryButton>
            </VStack>
          )}

        </Box>
      </Flex>
    </Container>
  )
}

export default PaymentSuccessPage