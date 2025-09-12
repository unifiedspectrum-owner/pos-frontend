/* React and Chakra UI component imports */
import React, { useState, useEffect } from 'react'
import { Text, Flex, Alert, Box } from '@chakra-ui/react'

/* Stripe payment integration imports */
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

/* Shared module imports */
import { PrimaryButton } from '@shared/components/form-elements/buttons'
import { createToastNotification } from '@shared/utils/ui'

/* Tenant module imports */
import { AssignedPlanDetails, CachedPaymentStatusData, InitiateSubscriptionPaymentApiRequest } from '@/lib/modules/tenant-management/types'
import { paymentService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

/* Props interface for CheckoutForm component */
interface CheckoutFormProps {
  amount: number;
  planData: AssignedPlanDetails | null;
  planTotalAmount: number;
  branchAddonTotalAmount: number;
  orgAddonTotalAmount: number;
  onPaymentSuccess?: () => void;
  onPaymentFailed?: (errorMessage: string, errorCode: string) => void;
  isRetryAttempt?: boolean;
}

/* CheckoutForm component with Stripe PaymentElement */
const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  amount,
  planData,
  planTotalAmount,
  branchAddonTotalAmount,
  orgAddonTotalAmount,
  onPaymentSuccess,
  onPaymentFailed,
  isRetryAttempt = false
}) => {
  /* Stripe hooks for payment processing */
  const stripe = useStripe()
  const elements = useElements()

  /* Payment state management */
  const [loading, setLoading] = useState(false)
  const [hasFailedPayment, setHasFailedPayment] = useState(false)

  /* Check for existing failed payment on component mount */
  useEffect(() => {
    const failedPaymentIntent = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT)
    setHasFailedPayment(!!failedPaymentIntent)
  }, [isRetryAttempt])

  /* Handle payment form submission */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    /* Ensure Stripe.js has loaded */
    if (!stripe || !elements) {
      return
    }

    /* If there's a failed payment, use retry logic instead */
    if (hasFailedPayment) {
      await handleRetryPayment()
      return
    }

    setLoading(true)

    /* Trigger form validation and wallet collection */
    const { error: submitError } = await elements.submit();

    if (submitError) {
      console.error('[CheckoutForm] Form validation error:', submitError)
      setLoading(false)
      createToastNotification({
        title: 'Form Validation Error',
        description: submitError.message || 'Please check your payment information and try again.',
        type: 'error'
      })
      return
    }

    try {
      /* Get tenant ID from localStorage */
      const tenantId = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)
      if (!tenantId) {
        console.error('[CheckoutForm] Tenant ID not found in localStorage')
        setLoading(false)
        createToastNotification({
          title: 'Registration Error',
          description: 'Tenant ID not found. Please restart the registration process.',
          type: 'error'
        })
        return
      }

      /* Validate planData is available */
      if (!planData) {
        console.error('[CheckoutForm] Plan data not available')
        setLoading(false)
        createToastNotification({
          title: 'Plan Data Error',
          description: 'Plan information not available. Please refresh the page and try again.',
          type: 'error'
        })
        return
      }

      /* Use all calculated amounts passed from payment.tsx as props */

      /* Initiate subscription payment via backend API */
      const apiRequest: InitiateSubscriptionPaymentApiRequest = {
        tenant_id: tenantId,
        plan_id: planData.plan.id,
        billing_cycle: planData.billingCycle,
        plan_tot_amt: planTotalAmount,
        branch_addon_tot_amt: branchAddonTotalAmount,
        org_addon_tot_amt: orgAddonTotalAmount,
        tot_amt: amount
      }
      
      console.log('[CheckoutForm] Payment initiation request:', apiRequest)
      const response = await paymentService.initiateTenantSubscriptionPayment(apiRequest)
      
      if (!response.success || !response.data) {
        console.error('[CheckoutForm] Payment initialization failed:', response)
        setLoading(false)
        createToastNotification({
          title: 'Payment Initialization Failed',
          description: response.message || 'Unable to set up payment. Please try again or contact support.',
          type: 'error'
        })
        return
      }

      const { type, clientSecret } = response.data
      if (!clientSecret) {
        console.error('[CheckoutForm] Client secret not received:', response.data)
        setLoading(false)
        createToastNotification({
          title: 'Payment Configuration Error',
          description: 'Payment client secret not received. Please refresh the page and try again.',
          type: 'error'
        })
        return
      }

      const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment

      /* Confirm the payment intent with Stripe */
      const { error } = await confirmIntent({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/tenant/payment-success',
        },
      })

      setLoading(false)

      if (error) {
        console.error('[CheckoutForm] Payment confirmation error:', error)
        
        /* Extract error details from Stripe error structure */
        const errorCode = error?.code || 'unknown_error'
        const declineCode = error?.decline_code || error?.payment_intent?.last_payment_error?.decline_code ||''
        const errorType = error?.type || 'api_error'
        
        /* Determine mapped error code based on Stripe error codes */
        let mappedErrorCode = 'PROCESSING_ERROR'
        
        if (errorCode === 'card_declined' || errorType === 'card_error') {
          if (declineCode === 'insufficient_funds') {
            mappedErrorCode = 'INSUFFICIENT_FUNDS'
          } else if (declineCode === 'expired_card') {
            mappedErrorCode = 'EXPIRED_CARD'
          } else if (['lost_card', 'stolen_card', 'pickup_card'].includes(declineCode)) {
            mappedErrorCode = 'CARD_DECLINED'
          } else {
            mappedErrorCode = 'CARD_DECLINED'
          }
        } else if (['invalid_number', 'invalid_expiry_month', 'invalid_expiry_year', 'invalid_cvc', 'incorrect_number', 'incorrect_cvc'].includes(errorCode)) {
          mappedErrorCode = 'INVALID_CARD'
        } else if (errorCode === 'expired_card') {
          mappedErrorCode = 'EXPIRED_CARD'
        }
        
        /* Use the most user-friendly error message available */
        const errorMessage = error?.message || 
                            error?.payment_intent?.last_payment_error?.message || 
                            'Your payment could not be processed. Please try again.'
        
        createToastNotification({
          title: 'Payment Processing Error',
          description: errorMessage,
          type: 'error'
        })
        
        /* Store failed payment information for retry */
        localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT, clientSecret)
        
        /* Call payment failed callback if provided */
        if (onPaymentFailed) {
          onPaymentFailed(errorMessage, mappedErrorCode)
        }
      } else {
        console.log('[CheckoutForm] Payment confirmed successfully');
        const paymentStatusData: CachedPaymentStatusData = {
          paymentSucceeded: true,
          completedAt: new Date().toISOString()
        }
        
        /* Store payment success in localStorage and clear any failed payment data */
        localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT)
        localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_DATA, JSON.stringify(paymentStatusData))
        
        createToastNotification({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully.',
          type: 'success'
        })
        
        /* Call payment success callback if provided */
        if (onPaymentSuccess) {
          onPaymentSuccess()
        }
      }
    } catch (error: any) {
      console.error('[CheckoutForm] Unexpected error during payment:', error)
      setLoading(false)
      
      const errorMessage = error?.message || 'An unexpected error occurred during payment processing. Please try again or contact support.'
      
      createToastNotification({
        title: 'Unexpected Payment Error',
        description: errorMessage,
        type: 'error'
      })
      
      /* Call payment failed callback for unexpected errors */
      if (onPaymentFailed) {
        onPaymentFailed(errorMessage, 'PROCESSING_ERROR')
      }
    }
  }

  /* Handle retry payment for failed payment intents */
  const handleRetryPayment = async () => {
    if (!stripe || !elements) {
      console.warn('[CheckoutForm] Stripe not loaded for retry')
      return
    }

    setLoading(true)
    
    /* Get stored client secret from failed payment */
    const failedClientSecret = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT)

    if (!failedClientSecret) {
      console.error('[CheckoutForm] No failed payment intent found for retry')
      createToastNotification({
        title: 'Retry Error',
        description: 'No failed payment found to retry. Please try making a new payment.',
        type: 'error',
      })
      setLoading(false)
      return
    }

    try {
      /* Validate form elements before retry */
      const { error: submitError } = await elements.submit()

      if (submitError) {
        console.error('[CheckoutForm] Form validation error on retry:', submitError)
        setLoading(false)
        createToastNotification({
          title: 'Form Validation Error',
          description: submitError.message || 'Please check your payment information and try again.',
          type: 'error'
        })
        return
      }

      /* Determine intent type from client secret structure */
      const isSetupIntent = failedClientSecret.includes('seti_')
      const confirmMethod = isSetupIntent ? stripe.confirmSetup : stripe.confirmPayment

      console.log('[CheckoutForm] Retrying payment with client secret:', failedClientSecret.substring(0, 20) + '...')

      /* Retry the payment/setup intent with new payment method */
      const { error } = await confirmMethod({
        elements,
        clientSecret: failedClientSecret,
        confirmParams: {
          return_url: window.location.origin + '/tenant/payment-success',
        },
      })

      setLoading(false)

      if (error) {
        console.error('[CheckoutForm] Retry payment failed:', error)
        
        /* Extract error details similar to initial payment */
        const errorCode = error?.code || 'unknown_error'
        const declineCode = error?.decline_code || error?.payment_intent?.last_payment_error?.decline_code || ''
        const errorType = error?.type || 'api_error'
        
        /* Map error codes */
        let mappedErrorCode = 'PROCESSING_ERROR'
        if (errorCode === 'card_declined' || errorType === 'card_error') {
          if (declineCode === 'insufficient_funds') {
            mappedErrorCode = 'INSUFFICIENT_FUNDS'
          } else if (declineCode === 'expired_card') {
            mappedErrorCode = 'EXPIRED_CARD'
          } else {
            mappedErrorCode = 'CARD_DECLINED'
          }
        } else if (['invalid_number', 'invalid_expiry_month', 'invalid_expiry_year', 'invalid_cvc'].includes(errorCode)) {
          mappedErrorCode = 'INVALID_CARD'
        }

        const errorMessage = error?.message || 'Unable to process payment retry. Please try a different payment method.'

        createToastNotification({
          title: 'Retry Payment Failed',
          description: errorMessage,
          type: 'error',
        })

        /* Trigger payment failed callback for retry failure */
        if (onPaymentFailed) {
          onPaymentFailed(errorMessage, mappedErrorCode)
        }
      } else {
        console.log('[CheckoutForm] Retry payment successful')
        
        const paymentStatusData: CachedPaymentStatusData = {
          paymentSucceeded: true,
          completedAt: new Date().toISOString(),
          retrySuccessful: true
        }

        /* Payment retry succeeded */
        localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_DATA, JSON.stringify(paymentStatusData))
        
        /* Clean up failed payment data */
        localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.FAILED_PAYMENT_INTENT)

        createToastNotification({
          title: 'Payment Successful',
          description: 'Your payment retry was successful. Thank you!',
          type: 'success',
        })

        /* Call success callback */
        if (onPaymentSuccess) {
          onPaymentSuccess()
        }
      }
    } catch (err: any) {
      console.error('[CheckoutForm] Unexpected error during payment retry:', err)
      setLoading(false)
      
      const errorMessage = err?.message || 'An unexpected error occurred during payment retry. Please try again or contact support.'
      
      createToastNotification({
        title: 'Retry Error',
        description: errorMessage,
        type: 'error',
      })

      /* Call payment failed callback for unexpected retry errors */
      if (onPaymentFailed) {
        onPaymentFailed(errorMessage, 'PROCESSING_ERROR')
      }
    }
  }


  return (
    <Flex justifyContent={'center'}>
      <Flex flexDir="column" gap={6}>
        
        {/* Retry payment notification */}
        {hasFailedPayment && (
          <Alert.Root status="info" borderRadius="md" bg="blue.50" borderColor="blue.200" borderWidth="1px">
            <Box>
              <Alert.Title fontSize="sm" color="blue.700">
                Retry Payment
              </Alert.Title>
              <Alert.Description fontSize="xs" color="blue.600">
                Enter new payment details to retry your transaction.
              </Alert.Description>
            </Box>
          </Alert.Root>
        )}

        {/* Stripe payment form */}
        <form onSubmit={handleSubmit}>
          <Flex flexDir="column" gap={4}>
            {/* Stripe Payment Element with tabs layout */}
            <PaymentElement
              options={{
                layout: "tabs",
              }}
            />

            {/* Payment submission button */}
            <PrimaryButton
              type="submit"
              disabled={!stripe || loading}
              loading={!stripe || loading}
              width="100%"
            >
              {hasFailedPayment ? `Retry Payment $${amount.toFixed(2)}` : `Pay $${amount.toFixed(2)}`}
            </PrimaryButton>
          </Flex>
        </form>

        {/* Security notice */}
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Your payment information is secure and encrypted. We never store your card details.
        </Text>
      </Flex>
    </Flex>
  )
}

export default CheckoutForm