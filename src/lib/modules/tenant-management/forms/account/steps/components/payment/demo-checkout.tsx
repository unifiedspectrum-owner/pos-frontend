/* React and Chakra UI component imports */
import React, { useState } from 'react'
import { Text, Flex, Alert, Box, Input } from '@chakra-ui/react'
import { Field } from '@/components/ui/field'

/* Stripe payment integration imports */
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

/* Shared module imports */
import { PrimaryButton } from '@shared/components/form-elements/buttons'
import { createToastNotification } from '@shared/utils/ui'
import { BACKEND_BASE_URL } from '@/lib/shared'

/* Props interface for DemoCheckoutForm component */
interface DemoCheckoutFormProps {
  onPaymentSuccess?: (amount: number, email: string) => void;
  onPaymentFailed?: (errorMessage: string) => void;
  onAmountChange?: (amount: number) => void;
  initialAmount?: number;
}

/* DemoCheckoutForm component with manual price input */
const DemoCheckoutForm: React.FC<DemoCheckoutFormProps> = ({
  onPaymentSuccess,
  onPaymentFailed,
  onAmountChange,
  initialAmount = 20.00
}) => {
  /* Stripe hooks for payment processing */
  const stripe = useStripe()
  const elements = useElements()

  /* Form state management */
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(initialAmount)
  const [customerEmail, setCustomerEmail] = useState('')

  /* Handle amount change and notify parent */
  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount)
    if (onAmountChange) {
      onAmountChange(newAmount)
    }
  }

  /* Handle payment form submission */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    /* Validate required fields */
    if (!customerEmail) {
      createToastNotification({
        title: 'Validation Error',
        description: 'Please enter your email address.',
        type: 'error'
      })
      return
    }

    if (amount < 0.50) {
      createToastNotification({
        title: 'Validation Error',
        description: 'Minimum amount is $0.50.',
        type: 'error'
      })
      return
    }

    /* Ensure Stripe.js has loaded */
    if (!stripe || !elements) {
      createToastNotification({
        title: 'Payment Error',
        description: 'Payment system is not ready. Please refresh the page.',
        type: 'error'
      })
      return
    }

    setLoading(true)

    /* Trigger form validation and wallet collection */
    const { error: submitError } = await elements.submit()

    if (submitError) {
      console.error('[DemoCheckoutForm] Form validation error:', submitError)
      setLoading(false)
      createToastNotification({
        title: 'Form Validation Error',
        description: submitError.message || 'Please check your payment information and try again.',
        type: 'error'
      })
      return
    }

    try {
      /* Create split payment via API */
      console.log('[DemoCheckoutForm] Creating split payment:', {
        amount,
        email: customerEmail
      })

      const response = await fetch(`${BACKEND_BASE_URL}/demo/stripe-connect/payments/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount, // Convert to cents
          email: customerEmail
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const { data } = await response.json() as any

      if (!data?.splitPayment?.clientSecret) {
        throw new Error('Client secret not received from API')
      }

      /* Confirm payment with client secret from API */
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: data.splitPayment.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/demo`
        },
        redirect: 'if_required'
      })
      

      setLoading(false)

      if (error) {
        console.error('[DemoCheckoutForm] Payment confirmation error:', error)

        /* Extract error details from Stripe error structure */
        const errorMessage = error?.message || 'Payment could not be processed. Please try again.'

        createToastNotification({
          title: 'Payment Failed',
          description: errorMessage,
          type: 'error'
        })

        /* Call payment failed callback if provided */
        if (onPaymentFailed) {
          onPaymentFailed(errorMessage)
        }
      } else {
        console.log('[DemoCheckoutForm] Payment confirmed successfully')

        createToastNotification({
          title: 'Payment Successful',
          description: `Split payment of $${amount.toFixed(2)} processed successfully.`,
          type: 'success'
        })

        /* Call payment success callback if provided */
        if (onPaymentSuccess) {
          onPaymentSuccess(amount, customerEmail)
        }
      }
    } catch (error: any) {
      console.error('[DemoCheckoutForm] Error during payment processing:', error)
      setLoading(false)

      const errorMessage = error?.message || 'An unexpected error occurred during payment processing.'

      createToastNotification({
        title: 'Payment Processing Error',
        description: errorMessage,
        type: 'error'
      })

      /* Call payment failed callback for unexpected errors */
      if (onPaymentFailed) {
        onPaymentFailed(errorMessage)
      }
    }
  }

  return (
    <Flex justifyContent={'center'}>
      <Flex flexDir="column" gap={6} width="100%">

        {/* Demo payment notice */}
        <Alert.Root status="info" borderRadius="md" bg="blue.50" borderColor="blue.200" borderWidth="1px">
          <Box>
            <Alert.Title fontSize="sm" color="blue.700">
              Demo Payment Mode
            </Alert.Title>
            <Alert.Description fontSize="xs" color="blue.600">
              This is a demonstration. No real charges will be made.
            </Alert.Description>
          </Box>
        </Alert.Root>

        {/* Payment form */}
        <form onSubmit={handleSubmit}>
          <Flex flexDir="column" gap={4}>

            {/* Customer email input */}
            <Field label="Email Address" required>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                size="md"
              />
            </Field>

            {/* Amount input */}
            <Field label="Amount (USD)" required helperText="Minimum amount: $0.50">
              <Input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0.50"
                placeholder="20.00"
                size="md"
              />
            </Field>
            {/* Stripe Payment Element */}
            <Field label="Payment Details">
              <Box width="100%">
                <PaymentElement
                  options={{
                    layout: "tabs",
                  }}
                />
              </Box>
            </Field>
            {/* Payment submission button */}
            <PrimaryButton
              type="submit"
              disabled={!stripe || loading}
              loading={loading}
              width="100%"
            >
              {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </PrimaryButton>
          </Flex>
        </form>

        {/* Test card information */}
        <Box bg="gray.50" p={4} borderRadius="md">
          <Text fontSize="sm" fontWeight="medium" mb={2}>Test Card Numbers:</Text>
          <Flex flexDir="column" gap={1} fontSize="xs" color="gray.600">
            <Text><strong>Success:</strong> 4242 4242 4242 4242</Text>
            <Text><strong>Declined:</strong> 4000 0000 0000 0002</Text>
            <Text><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</Text>
            <Text><strong>Exp Date:</strong> Any future date (12/25)</Text>
            <Text><strong>CVC:</strong> Any 3 digits (123)</Text>
          </Flex>
        </Box>

        {/* Security notice */}
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Your payment information is secure and encrypted. This is a demo environment.
        </Text>
      </Flex>
    </Flex>
  )
}

export default DemoCheckoutForm