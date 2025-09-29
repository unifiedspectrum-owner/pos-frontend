/* Libraries imports */
import React, { useState } from 'react'
import { Accordion, Box, Text, Flex, Heading, Badge, List, Button, Code, SimpleGrid, Clipboard, Skeleton, Spinner } from '@chakra-ui/react'
import { lighten } from 'polished'
import { MdSecurity, MdQrCode } from 'react-icons/md'

/* UI component imports */
import { QrCode } from '@/components/ui/qr-code'

/* Shared module imports */
import { GRAY_COLOR, PRIMARY_COLOR } from '@shared/config'
import { DynamicDialog } from '@shared/components/common'
import { PrimaryButton } from '@shared/components'

/* Auth module imports */
import { TWO_FACTOR_SETUP_INSTRUCTIONS, TWO_FACTOR_MANAGE_INSTRUCTIONS, TWO_FACTOR_INFO } from '@auth-management/constants'
import { useTwoFactorOperations } from '@auth-management/hooks'

/* Component props interface */
interface TwoFactorSetupProps {
  isEnabled?: boolean
  onRefresh?: () => Promise<void>
}

/* Two-factor authentication setup component with instructions */
const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  isEnabled = false,
  onRefresh
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  /* 2FA operations hook */
  const { enable2FA, isEnabling2FA, disable2FA, isDisabling2FA } = useTwoFactorOperations()

  /* Handle enabling 2FA and generating QR code */
  const handleEnable2FA = async () => {
    /* Show modal immediately with loading states */
    setIsQrModalOpen(true)

    const result = await enable2FA()
    if (result) {
      setQrCodeData(result.qrCodeData)
      setBackupCodes(result.backupCodes)

      /* Refresh user details after successful enable */
      if (onRefresh) {
        await onRefresh()
      }
    } else {
      /* Close modal if API call failed */
      setIsQrModalOpen(false)
    }
  }

  /* Handle disabling 2FA */
  const handleDisable2FA = async () => {
    const success = await disable2FA()
    if (success) {
      /* Reset local state after successful disable */
      setQrCodeData('')
      setBackupCodes([])
      setIsQrModalOpen(false)

      /* Refresh user details after successful disable */
      if (onRefresh) {
        await onRefresh()
      }
    }
  }
  return (
    <Flex
      p={5}
      gap={4}
      borderWidth={1}
      borderRadius={10}
      borderColor={lighten(0.3, GRAY_COLOR)}
      flexDir="column"
    >
      <Flex alignItems="center" gap={2}>
        <MdSecurity size={20} color={PRIMARY_COLOR} />
        <Heading size="md" mb={0}>Security Settings</Heading>
      </Flex>

      <Accordion.Root collapsible>
        <Accordion.Item value="2fa-setup" borderWidth={1} borderRadius="md" borderColor={lighten(0.3, GRAY_COLOR)}>
          <Accordion.ItemTrigger p={4}>
            <Flex justify="space-between" align="center" w="100%">
              <Flex flexDir="column" align="start" gap={1}>
                <Text fontWeight="semibold">
                  Two-Factor Authentication (2FA)
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {isEnabled ? 'Currently enabled' : 'Add an extra layer of security to your account'}
                </Text>
              </Flex>
              <Flex align="center" gap={3}>
                {isEnabled && (
                  <Badge colorPalette="green" size="sm">
                    Enabled
                  </Badge>
                )}
                <Accordion.ItemIndicator />
              </Flex>
            </Flex>
          </Accordion.ItemTrigger>

          <Accordion.ItemContent>
            <Box p={4} pt={0}>
              <Heading size="sm" mb={3} color="gray.700">
                Understanding Two-Factor Authentication (2FA)
              </Heading>

              <Text mb={4} fontSize="sm" color="gray.600" lineHeight="1.6">
                {TWO_FACTOR_INFO.description}
              </Text>

              <Heading size="sm" mb={3} color="gray.700">
                {isEnabled ? 'Manage Your 2FA Settings' : 'Step-by-Step Setup Instructions'}
              </Heading>

              <List.Root gap={3} ml={4}>
                {(isEnabled ? TWO_FACTOR_MANAGE_INSTRUCTIONS : TWO_FACTOR_SETUP_INSTRUCTIONS).map((instruction) => (
                  <List.Item key={instruction.id}>
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={1}>
                        {instruction.id}. {instruction.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600" lineHeight="1.5">
                        {instruction.description}
                      </Text>
                      {instruction.showButton && (
                        <Box mt={3}>
                          <PrimaryButton
                            leftIcon={MdQrCode}
                            onClick={isEnabled ? handleDisable2FA : handleEnable2FA}
                            size="sm"
                            buttonText={isEnabled ? "Deactivate 2FA" : "View QR Code & Backup Codes"}
                            isLoading={isEnabled ? isDisabling2FA : isEnabling2FA}
                            disabled={isEnabled ? isDisabling2FA : isEnabling2FA}
                          />
                        </Box>
                      )}
                    </Box>
                  </List.Item>
                ))}
              </List.Root>

              <Box mt={4} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800">
                  <Text as={'b'}>Note:</Text> {TWO_FACTOR_INFO.note}
                </Text>
              </Box>
            </Box>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>

      {/* QR Code Modal */}
      <DynamicDialog
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false)
          /* Reset state when closing modal */
          if (!isEnabled) {
            setQrCodeData('')
            setBackupCodes([])
          }
        }}
        title="Two-Factor Authentication Setup"
        titleIcon={<MdSecurity size={20} color={PRIMARY_COLOR} />}
        size="lg"
        maxWidth="600px"
      >
        <Flex flexDir="column" gap={6}>
          {/* QR Code Section */}
          <Box textAlign="center">
            <Heading size="sm" mb={3}>QR Code</Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Scan this QR code with your authenticator app
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
        </Flex>
      </DynamicDialog>
    </Flex>
  )
}

export default TwoFactorSetup