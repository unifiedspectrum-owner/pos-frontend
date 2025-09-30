/* Libraries imports */
import React from 'react'
import { Box, Text, Flex, Heading, Button, Code, SimpleGrid, Clipboard, Skeleton, Spinner, VStack, HStack } from '@chakra-ui/react'
import { MdArrowForward } from 'react-icons/md'

/* UI component imports */
import { QrCode } from '@/components/ui/qr-code'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { PrimaryButton, SecondaryButton } from '@shared/components'

/* Component props interface */
interface QRCodeStepProps {
  qrCodeData: string
  backupCodes: string[]
  isLoading: boolean
  onNext: () => void
  onCancel: () => void
}

/* QR Code step component */
const QRCodeStep: React.FC<QRCodeStepProps> = ({
  qrCodeData,
  backupCodes,
  isLoading,
  onNext,
  onCancel
}) => {
  return (
    <VStack align="stretch" gap={6}>
      {/* QR Code Section */}
      <Box textAlign="center">
        <Heading size="sm" mb={3}>Scan QR Code</Heading>
        <Text fontSize="sm" color="gray.600" mb={4}>
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </Text>
        <Box
          borderWidth={1}
          borderColor="gray.200"
          borderRadius="md"
          p={4}
          bg="white"
          display="inline-block"
        >
          {qrCodeData ? (
            <QrCode
              value={qrCodeData}
              size={'lg'}
              style={{ display: 'block', margin: '0 auto' }}
            />
          ) : (
            <Flex align="center" justify="center" w="200px" h="200px">
              <Spinner size="xl" color={PRIMARY_COLOR} />
            </Flex>
          )}
        </Box>
      </Box>

      {/* Backup Codes Section */}
      <Box>
        <Flex justify="space-between" align="center" mb={3}>
          <Heading size="sm">Backup Recovery Codes</Heading>
          {backupCodes.length > 0 && (
            <Clipboard.Root value={backupCodes.join(' ')}>
              <Clipboard.Trigger asChild>
                <Button size="sm" variant="outline" colorScheme="blue">
                  <Clipboard.Indicator/>
                  <Clipboard.CopyText />
                </Button>
              </Clipboard.Trigger>
            </Clipboard.Root>
          )}
        </Flex>

        <Text fontSize="sm" color="gray.600" mb={3}>
          Save these codes in a secure location. Each code can only be used once for account recovery.
        </Text>

        <Box p={3} bg="gray.50" borderRadius="md" borderWidth={1} borderColor="gray.200">
          <SimpleGrid columns={5} gap={2}>
            {backupCodes.length > 0 ? (
              backupCodes.map((code, index) => (
                <Code key={index} fontSize="sm" bg="transparent" p={1}>
                  {code}
                </Code>
              ))
            ) : (
              /* Skeleton placeholders for backup codes */
              Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} height="24px" borderRadius="md" />
              ))
            )}
          </SimpleGrid>
        </Box>

        <Box mt={4} p={3} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
          <Text fontSize="sm" color="orange.800">
            <Text as={'b'}>Important:</Text> Store these backup codes securely. If you lose access to your
            authenticator app, these codes are the only way to regain access to your account.
          </Text>
        </Box>
      </Box>

      {/* Next Button */}
      <Box pt={3} mt={2} borderTop="1px solid" borderColor="gray.200">
        <HStack gap={3} w="full" justify="flex-end">
          <SecondaryButton
            onClick={onCancel}
            size="sm"
            buttonText="Cancel"
          />
          <PrimaryButton
            onClick={onNext}
            size="sm"
            rightIcon={MdArrowForward}
            buttonText="Next: Verify Code"
            disabled={!qrCodeData || backupCodes.length === 0 || isLoading}
          />
        </HStack>
      </Box>
    </VStack>
  )
}

export default QRCodeStep