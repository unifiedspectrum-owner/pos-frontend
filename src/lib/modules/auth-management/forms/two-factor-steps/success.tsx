/* Libraries imports */
import React from 'react'
import { Box, Text, Heading, VStack, HStack, Flex } from '@chakra-ui/react'
import { MdCheckCircle, MdCheck } from 'react-icons/md'

/* Shared module imports */
import { PrimaryButton } from '@shared/components'
import { IconType } from 'react-icons'

/* Component props interface */
interface SuccessStepProps {
  onComplete: () => void
  buttonText?: string
  buttonIcon?: IconType
}

/* Success step component */
const SuccessStep: React.FC<SuccessStepProps> = ({
  onComplete,
  buttonText = "Complete",
  buttonIcon = MdCheck
}) => {
  return (
    <VStack align="stretch" gap={4}>
      {/* Success Icon */}
      <Flex justify="center" align="center" flexDir="column" gap={2} py={3}>
        <Box color="green.500" fontSize="56px" lineHeight="1">
          <MdCheckCircle />
        </Box>
        <Heading size="md" color="green.600">
          2FA Enabled Successfully!
        </Heading>
      </Flex>

      {/* Success Information */}
      <Box p={3} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
        <Text fontSize="sm" fontWeight="semibold" color="green.700" mb={1}>
          Your Account is Now Protected
        </Text>
        <Text fontSize="sm" color="gray.700" lineHeight="1.5">
          Two-factor authentication has been successfully enabled for your account.
          From now on, you'll need to enter a code from your authenticator app when logging in.
        </Text>
      </Box>

      {/* What Happens Next */}
      <Box>
        <Heading size="sm" mb={3} color="gray.700">
          What Happens Next
        </Heading>
        <VStack align="start" gap={3} ml={2}>
          <Text fontSize="sm" color="gray.600">
            • When you log in, you'll enter your email and password as usual
          </Text>
          <Text fontSize="sm" color="gray.600">
            • You'll then be prompted to enter a 6-digit code from your app
          </Text>
          <Text fontSize="sm" color="gray.600">
            • If you lose access to your app, use a backup code to log in
          </Text>
        </VStack>
      </Box>

      {/* Important Reminders */}
      <Box>
        <Heading size="sm" mb={3} color="gray.700">
          Important Reminders
        </Heading>
        <VStack align="start" gap={3} ml={2}>
          <Text fontSize="sm" color="gray.600">
            • Keep your authenticator app accessible on your device
          </Text>
          <Text fontSize="sm" color="gray.600">
            • Store your backup codes in a secure location
          </Text>
          <Text fontSize="sm" color="gray.600">
            • Each backup code can only be used once
          </Text>
          <Text fontSize="sm" color="gray.600">
            • If you get a new phone, transfer your app or re-scan the QR code
          </Text>
        </VStack>
      </Box>

      {/* Security Tip */}
      <Box p={3} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
        <Text fontSize="sm" color="blue.800">
          <Text as={'b'}>Tip:</Text> Keep backup codes accessible for when you don't have your phone.
        </Text>
      </Box>

      {/* Complete Button */}
      <Box pt={3} mt={2} borderTop="1px solid" borderColor="gray.200">
        <HStack gap={3} w="full" justify="flex-end">
          <PrimaryButton
            onClick={onComplete}
            size="sm"
            buttonText={buttonText}
            leftIcon={buttonIcon}
            buttonProps={{
              bg: "green.500",
              _hover: { bg: "green.600" },
              _active: { bg: "green.700" }
            }}
          />
        </HStack>
      </Box>
    </VStack>
  )
}

export default SuccessStep