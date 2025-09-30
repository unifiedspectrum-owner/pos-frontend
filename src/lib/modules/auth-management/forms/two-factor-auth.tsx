/* Libraries imports */
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Accordion, Box, Text, Flex, Heading, Badge, List } from '@chakra-ui/react'
import { lighten } from 'polished'
import { MdSecurity, MdQrCode } from 'react-icons/md'

/* Shared module imports */
import { GRAY_COLOR, PRIMARY_COLOR } from '@shared/config'
import { DynamicDialog, ConfirmationDialog } from '@shared/components/common'
import { PrimaryButton } from '@shared/components'

/* Auth module imports */
import { TWO_FACTOR_SETUP_INSTRUCTIONS, TWO_FACTOR_MANAGE_INSTRUCTIONS, TWO_FACTOR_INFO, ENABLE_2FA_FORM_DEFAULT_VALUES, TWO_FACTOR_SETUP_STEPS, TWO_FACTOR_STEP_CONFIGS, TwoFactorSetupStep } from '@auth-management/constants'
import { useTwoFactorOperations } from '@auth-management/hooks'
import { enable2FASchema, Enable2FAFormData } from '@auth-management/schemas'
import { QRCodeStep, VerifyOTPStep, SuccessStep } from '@auth-management/forms/two-factor-steps'

/* Component props interface */
interface TwoFactorSetupProps {
  isEnabled?: boolean
  onRefresh?: () => Promise<void>
  userId?: string
}

/* Two-factor authentication setup component with instructions */
const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  isEnabled = false,
  onRefresh,
  userId
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<TwoFactorSetupStep>(TWO_FACTOR_SETUP_STEPS.QR_CODE)
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false)

  /* 2FA operations hook */
  const { generate2FA, isGenerating2FA, enable2FA, isEnabling2FA, disable2FA, isDisabling2FA } = useTwoFactorOperations()

  /* Form management with react-hook-form */
  const methods = useForm<Enable2FAFormData>({
    resolver: zodResolver(enable2FASchema),
    defaultValues: ENABLE_2FA_FORM_DEFAULT_VALUES
  })

  const { reset } = methods

  /* Handle generating 2FA QR code */
  const handleGenerateQR = async () => {
    /* Show modal immediately with loading states */
    setIsQrModalOpen(true)
    setCurrentStep(TWO_FACTOR_SETUP_STEPS.QR_CODE)

    const result = await generate2FA()
    if (result) {
      setQrCodeData(result.qrCodeData)
      setBackupCodes(result.backupCodes)
    } else {
      /* Close modal if API call failed */
      setIsQrModalOpen(false)
    }
  }

  /* Handle proceeding to verification step */
  const handleProceedToVerify = () => {
    setCurrentStep(TWO_FACTOR_SETUP_STEPS.VERIFY_OTP)
  }

  /* Handle back to QR code step */
  const handleBackToQR = () => {
    setCurrentStep(TWO_FACTOR_SETUP_STEPS.QR_CODE)
    reset()
  }

  /* Handle OTP verification and enabling 2FA */
  const handleVerifyAndEnable = async (data: Enable2FAFormData) => {
    /* Convert array to string */
    const codeString = data.code?.join('') || ''

    const success = await enable2FA({ code: codeString })
    if (success) {
      /* Refresh user details after successful enable */
      if (onRefresh) {
        await onRefresh()
      }

      /* Show success step */
      setCurrentStep(TWO_FACTOR_SETUP_STEPS.SUCCESS)
    }
  }

  /* Handle completing the setup */
  const handleCompleteSetup = () => {
    /* Reset and close modal */
    setIsQrModalOpen(false)
    setQrCodeData('')
    setBackupCodes([])
    reset()
    setCurrentStep(TWO_FACTOR_SETUP_STEPS.QR_CODE)
  }

  /* Show disable confirmation dialog */
  const handleShowDisableConfirm = () => {
    setIsDisableConfirmOpen(true)
  }

  /* Handle disabling 2FA after confirmation */
  const handleConfirmDisable2FA = async () => {
    const success = await disable2FA()
    if (success) {
      /* Close confirmation dialog */
      setIsDisableConfirmOpen(false)

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

  /* Handle modal close */
  const handleCloseModal = () => {
    setIsQrModalOpen(false)
    /* Reset state when closing modal */
    if (!isEnabled) {
      setQrCodeData('')
      setBackupCodes([])
      reset()
      setCurrentStep(TWO_FACTOR_SETUP_STEPS.QR_CODE)
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
                            onClick={isEnabled ? handleShowDisableConfirm : handleGenerateQR}
                            size="sm"
                            buttonText={isEnabled ? "Deactivate 2FA" : "View QR Code & Backup Codes"}
                            isLoading={isEnabled ? isDisabling2FA : isGenerating2FA}
                            disabled={isEnabled ? isDisabling2FA : isGenerating2FA}
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
        onClose={handleCloseModal}
        title={TWO_FACTOR_STEP_CONFIGS[currentStep].title}
        titleIcon={<MdSecurity size={20} color={PRIMARY_COLOR} />}
        size="lg"
        maxWidth="600px"
      >
        {currentStep === TWO_FACTOR_SETUP_STEPS.QR_CODE ? (
          <QRCodeStep
            qrCodeData={qrCodeData}
            backupCodes={backupCodes}
            isLoading={isGenerating2FA}
            onNext={handleProceedToVerify}
            onCancel={handleCloseModal}
          />
        ) : currentStep === TWO_FACTOR_SETUP_STEPS.VERIFY_OTP ? (
          <VerifyOTPStep
            methods={methods}
            isLoading={isEnabling2FA}
            onSubmit={handleVerifyAndEnable}
            onBack={handleBackToQR}
          />
        ) : (
          <SuccessStep onComplete={handleCompleteSetup} />
        )}
      </DynamicDialog>

      {/* Disable 2FA Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDisableConfirmOpen}
        onCancel={() => setIsDisableConfirmOpen(false)}
        onConfirm={handleConfirmDisable2FA}
        title="Disable Two-Factor Authentication"
        message="Are you sure you want to disable two-factor authentication? This will reduce the security of your account."
        confirmText="Disable 2FA"
        cancelText="Cancel"
        isLoading={isDisabling2FA}
        confirmVariant="danger"
        confirmationText={userId}
      />
    </Flex>
  )
}

export default TwoFactorSetup