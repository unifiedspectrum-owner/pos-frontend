"use client"

/* React and UI component imports */
import React, { useEffect, useState } from 'react'
import { Text, VStack, HStack, Box, Flex, Badge } from '@chakra-ui/react'
import { FaCreditCard, FaPhoneAlt, FaEnvelope, FaRedo, FaInfoCircle, FaCode, FaBan, FaWallet, FaCalendarTimes, FaShieldAlt } from 'react-icons/fa'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'

/* Tenant module imports */
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { getCurrentISOString } from "@shared/utils";

/* Payment failed step component props interface */
interface PaymentFailedStepProps {
  onRetryPayment: () => void
  onPrevious: () => void
  errorMessage?: string
  errorCode?: string
}

/* Common payment failure reasons */
const PAYMENT_FAILURE_REASONS = [
  {
    code: 'CARD_DECLINED',
    title: 'Card Declined',
    description: 'Your payment method was declined by your bank.',
    suggestions: [
      'Check that you entered the correct card details',
      'Ensure your card has sufficient funds',
      'Contact your bank to verify the transaction',
      'Try using a different payment method'
    ]
  },
  {
    code: 'INSUFFICIENT_FUNDS',
    title: 'Insufficient Funds',
    description: 'Your account does not have enough funds for this transaction.',
    suggestions: [
      'Add funds to your account',
      'Use a different payment method',
      'Contact your bank for assistance'
    ]
  },
  {
    code: 'EXPIRED_CARD',
    title: 'Expired Card',
    description: 'The payment method you provided has expired.',
    suggestions: [
      'Update your payment method with current expiry date',
      'Use a different valid payment method'
    ]
  },
  {
    code: 'INVALID_CARD',
    title: 'Invalid Card Details',
    description: 'The card information provided appears to be invalid.',
    suggestions: [
      'Double-check your card number',
      'Verify the expiry date and CVV',
      'Ensure billing address matches your card'
    ]
  },
  {
    code: 'PROCESSING_ERROR',
    title: 'Processing Error',
    description: 'A technical error occurred while processing your payment.',
    suggestions: [
      'Try again in a few minutes',
      'Use a different payment method',
      'Contact our support team if the issue persists'
    ]
  }
]

/* Get error type icon based on error code */
const getErrorIcon = (errorCode: string) => {
  switch (errorCode) {
    case 'CARD_DECLINED':
      return { icon: FaBan, color: 'red.500' }
    case 'INSUFFICIENT_FUNDS':
      return { icon: FaWallet, color: 'orange.500' }
    case 'EXPIRED_CARD':
      return { icon: FaCalendarTimes, color: 'yellow.500' }
    case 'INVALID_CARD':
      return { icon: FaCreditCard, color: 'purple.500' }
    case 'PROCESSING_ERROR':
    default:
      return { icon: FaShieldAlt, color: 'gray.500' }
  }
}

/* Payment failed step component */
const PaymentFailedStep: React.FC<PaymentFailedStepProps> = ({ 
  onRetryPayment, 
  onPrevious,
  errorMessage = 'Payment processing failed',
  errorCode = 'PROCESSING_ERROR'
}) => {
  /* Component state */
  const [retryAttempts, setRetryAttempts] = useState(0)

  /* Load retry attempts on component mount */
  useEffect(() => {
    const attempts = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_RETRY_ATTEMPTS)
    setRetryAttempts(attempts ? parseInt(attempts) : 0)
  }, [])

  /* Get failure reason details */
  const getFailureReason = () => {
    return PAYMENT_FAILURE_REASONS.find(reason => reason.code === errorCode) || 
           PAYMENT_FAILURE_REASONS.find(reason => reason.code === 'PROCESSING_ERROR') ||
           {
             code: 'UNKNOWN_ERROR',
             title: 'Payment Error',
             description: 'An error occurred while processing your payment.',
             suggestions: [
               'Please try again',
               'Contact support if the issue persists'
             ]
           }
  }

  /* Handle retry payment */
  const handleRetryPayment = () => {
    const newAttempts = retryAttempts + 1
    localStorage.setItem('payment_retry_attempts', newAttempts.toString())
    setRetryAttempts(newAttempts)
    onRetryPayment()
  }

  /* Handle contact support */
  const handleContactSupport = () => {
    /* Store error details for support */
    const supportData = {
      errorCode,
      errorMessage,
      retryAttempts,
      timestamp: getCurrentISOString()
    }
    localStorage.setItem('payment_support_data', JSON.stringify(supportData))
  }

  const failureReason = getFailureReason()
  const errorIconData = getErrorIcon(errorCode)
  const ErrorIcon = errorIconData.icon

  return (
    <VStack gap={8} w="100%" maxW="800px" mx="auto" textAlign="center">
      {/* Error Header */}
      <VStack gap={4}>
        <Box color={errorIconData.color} fontSize="6xl">
          <ErrorIcon />
        </Box>
        <Text fontSize="3xl" fontWeight="bold" color="red.600">
          Payment Failed
        </Text>
        <Text fontSize="lg" color="gray.600" maxW="600px">
          We were unable to process your payment. Don't worry - your account information has been saved 
          and you can try again or use a different payment method.
        </Text>
      </VStack>

      {/* Stripe Error Details Card */}
      <Box w="100%" p={6} borderWidth="2px" borderRadius="lg" bg="red.50" borderColor="red.200">
        <VStack gap={4}>
          <HStack gap={3} align="center">
            <Box color={errorIconData.color} fontSize="2xl">
              <ErrorIcon />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="red.700">
              {failureReason?.title || 'Payment Error'}
            </Text>
          </HStack>
          
          <Text fontSize="md" color="red.600" textAlign="center">
            {failureReason?.description || 'An error occurred while processing your payment.'}
          </Text>

          {/* Stripe Error Details */}
          <VStack gap={3} w="100%" align="stretch">
            {errorMessage && errorMessage !== 'Payment processing failed' && (
              <Box p={4} bg="white" borderRadius="md" borderWidth="1px" borderColor="red.300">
                <HStack gap={3} align="start">
                  <Box color="red.500" fontSize="lg" flexShrink={0} pt={1}>
                    <FaInfoCircle />
                  </Box>
                  <VStack align="start" gap={2} flex={1}>
                    <Text fontSize="sm" fontWeight="semibold" color="red.700">
                      Stripe Payment Error
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      {errorMessage}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Error Code Badge */}
            <HStack justify="center">
              <Badge 
                colorScheme={errorIconData.color.split('.')[0]} 
                variant="subtle" 
                px={3} 
                py={1} 
                borderRadius="full"
                fontSize="xs"
                fontWeight="medium"
              >
                <HStack gap={1}>
                  <FaCode />
                  <Text>Error Code: {errorCode}</Text>
                </HStack>
              </Badge>
            </HStack>
          </VStack>
        </VStack>
      </Box>


      {/* Suggested Solutions */}
      <Box w="100%" p={6} borderWidth="1px" borderRadius="lg" bg="blue.50">
        <VStack gap={4} align="start">
          <Text fontSize="xl" fontWeight="bold" color="blue.700">How to Resolve This</Text>
          <VStack gap={2} align="start" w="100%">
            {failureReason.suggestions.map((suggestion, index) => (
              <Text key={index} fontSize="sm">
                • {suggestion}
              </Text>
            ))}
          </VStack>
        </VStack>
      </Box>

      {/* Retry Information */}
      {retryAttempts > 0 && (
        <Box w="100%" p={4} borderWidth="1px" borderRadius="lg" bg="yellow.50" borderColor="yellow.200">
          <Text fontSize="sm" color="yellow.700">
            <strong>Previous attempts:</strong> {retryAttempts} 
            {retryAttempts >= 3 && ' - Consider contacting support for assistance'}
          </Text>
        </Box>
      )}

      {/* Contact Support Options */}
      <Box w="100%" p={6} borderWidth="1px" borderRadius="lg" bg="green.50">
        <VStack gap={4}>
          <Text fontSize="lg" fontWeight="bold" color="green.700">Need Help?</Text>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Our support team is available 24/7 to help resolve payment issues
          </Text>
          
          <Flex gap={6} wrap="wrap" justify="center">
            <VStack gap={1} align="center">
              <Box color="green.600" fontSize="2xl">
                <FaPhoneAlt />
              </Box>
              <Text fontSize="sm" fontWeight="medium">Call Support</Text>
              <Text fontSize="sm" color="gray.600">1-800-123-4567</Text>
            </VStack>
            
            <VStack gap={1} align="center">
              <Box color="green.600" fontSize="2xl">
                <FaEnvelope />
              </Box>
              <Text fontSize="sm" fontWeight="medium">Email Support</Text>
              <Text fontSize="sm" color="gray.600">support@posystem.com</Text>
            </VStack>
          </Flex>
        </VStack>
      </Box>

      {/* Action Buttons */}
      <VStack gap={4} w="100%">
        <HStack gap={4} justify="center" w="100%">
          <PrimaryButton onClick={handleRetryPayment} leftIcon={FaRedo}>
            Try Payment Again
          </PrimaryButton>
          <SecondaryButton onClick={handleContactSupport} leftIcon={FaPhoneAlt}>
            Contact Support
          </SecondaryButton>
        </HStack>
        
        <HStack gap={4} justify="center" w="100%">
          <SecondaryButton onClick={onPrevious} leftIcon={FaCreditCard}>
            Change Payment Method
          </SecondaryButton>
        </HStack>
      </VStack>

      {/* Additional Information */}
      <Box w="100%" p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
        <VStack gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.700">Important Notes</Text>
          <VStack gap={1} align="start" w="100%">
            <Text fontSize="xs" color="gray.600">
              • Your account information has been saved and will not be lost
            </Text>
            <Text fontSize="xs" color="gray.600">
              • No charges were made to your payment method
            </Text>
            <Text fontSize="xs" color="gray.600">
              • You can continue the setup process once payment is resolved
            </Text>
            <Text fontSize="xs" color="gray.600">
              • All selected plans and add-ons remain in your configuration
            </Text>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  )
}

export default PaymentFailedStep