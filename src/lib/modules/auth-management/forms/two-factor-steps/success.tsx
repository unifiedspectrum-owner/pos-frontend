/* Libraries imports */
import React from 'react'
import { Box, Text, Heading, List, VStack, HStack, Flex, Icon } from '@chakra-ui/react'
import { MdCheckCircle, MdCheck } from 'react-icons/md'

/* Shared module imports */
import { PrimaryButton } from '@shared/components'

/* Component props interface */
interface SuccessStepProps {
  onComplete: () => void
}

/* Success step component */
const SuccessStep: React.FC<SuccessStepProps> = ({ onComplete }) => {
  return (
    <VStack align="stretch" gap={6}>
      {/* Success Icon */}
      <Flex justify="center" align="center" flexDir="column" gap={4} py={6}>
        <Icon as={MdCheckCircle} color="green.500" boxSize={16} />
        <Heading size="md" color="green.600">
          2FA Enabled Successfully!
        </Heading>
      </Flex>

      {/* Success Information */}
      <VStack align="stretch" gap={2} p={4} bg="green.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="green.500">
        <Text fontSize="sm" fontWeight="600" color="green.700">
          Your Account is Now Protected
        </Text>
        <Text fontSize="sm" color="gray.700" lineHeight="1.6">
          Two-factor authentication has been successfully enabled for your account.
          From now on, you'll need to enter a code from your authenticator app when logging in.
        </Text>
      </VStack>

      {/* Important Reminders */}
      <Box>
        <Heading size="sm" mb={3} color="gray.700">
          Important Reminders
        </Heading>
        <List.Root gap={2} ml={4}>
          <List.Item>
            <Text fontSize="sm" color="gray.700">
              Keep your authenticator app accessible on your device
            </Text>
          </List.Item>
          <List.Item>
            <Text fontSize="sm" color="gray.700">
              Store your backup codes in a secure location
            </Text>
          </List.Item>
          <List.Item>
            <Text fontSize="sm" color="gray.700">
              Each backup code can only be used once
            </Text>
          </List.Item>
          <List.Item>
            <Text fontSize="sm" color="gray.700">
              You can disable 2FA anytime from your profile settings
            </Text>
          </List.Item>
        </List.Root>
      </Box>

      {/* Complete Button */}
      <Box pt={3} mt={2} borderTop="1px solid" borderColor="gray.200">
        <HStack gap={3} w="full" justify="flex-end">
          <PrimaryButton
            onClick={onComplete}
            size="sm"
            buttonText="Complete"
            bg="green.500"
            leftIcon={MdCheck}
            buttonProps={{
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