"use client"

/* Libraries imports */
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VStack, Box, Text, Heading, Flex, List } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { MdSecurity, MdQrCode, MdDashboard } from 'react-icons/md'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { PrimaryButton } from '@shared/components'

/* Auth module imports */
import { TWO_FACTOR_SETUP_STEPS, TwoFactorSetupStep, AUTH_STORAGE_KEYS, AUTH_PAGE_ROUTES, ENABLE_2FA_FORM_DEFAULT_VALUES, TWO_FACTOR_SETUP_INSTRUCTIONS, TWO_FACTOR_INFO } from '@auth-management/constants'
import { useTwoFactorOperations } from '@auth-management/hooks'
import { enable2FASchema, Enable2FAFormData } from '@auth-management/schemas'
import { QRCodeStep, VerifyOTPStep, SuccessStep } from '@auth-management/forms/two-factor-steps'

/* 2FA mandatory setup form component */
const Setup2FAForm: React.FC = () => {
  const router = useRouter()
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<TwoFactorSetupStep | 'instructions'>('instructions')

  /* 2FA operations hook */
  const { generate2FA, isGenerating2FA, enable2FA, isEnabling2FA } = useTwoFactorOperations()

  /* Form management with react-hook-form */
  const methods = useForm<Enable2FAFormData>({
    resolver: zodResolver(enable2FASchema),
    defaultValues: ENABLE_2FA_FORM_DEFAULT_VALUES
  })

  const { reset } = methods

  /* Verify user has pending setup requirement on mount */
  useEffect(() => {
    const verifySetupRequired = () => {
      const setupRequired = localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED)

      if (setupRequired !== 'true') {
        /* Redirect to login if no pending setup */
        router.push(AUTH_PAGE_ROUTES.LOGIN)
        return
      }
    }

    verifySetupRequired()
  }, [router])

  /* Handle generating 2FA QR code */
  const handleGenerateQR = async () => {
    /* Move to QR step and generate */
    setCurrentStep(TWO_FACTOR_SETUP_STEPS.QR_CODE)

    const result = await generate2FA()
    if (result) {
      setQrCodeData(result.qrCodeData)
      setBackupCodes(result.backupCodes)
    } else {
      /* Go back to instructions if generation fails */
      setCurrentStep('instructions')
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
      /* Clear pending setup flag */
      localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED)
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      /* Dispatch auth state change event */
      window.dispatchEvent(new Event('authStateChanged'))

      /* Show success step */
      setCurrentStep(TWO_FACTOR_SETUP_STEPS.SUCCESS)
    }
  }

  /* Handle completing the setup */
  const handleCompleteSetup = () => {
    /* Redirect to admin home */
    router.push(AUTH_PAGE_ROUTES.ADMIN_HOME)
  }

  /* Handle cancel - logout and go back to login */
  const handleCancel = () => {
    /* Clear all auth data */
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
    localStorage.removeItem(AUTH_STORAGE_KEYS.LOGGED_IN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED)

    /* Redirect to login */
    router.push(AUTH_PAGE_ROUTES.LOGIN)
  }

  return (
    <Box
      w="600px"
      h={currentStep === 'instructions' ? 'auto' : '875px'}
      p={8}
      bg="white"
      borderRadius="lg"
      boxShadow="xl"
      border="1px solid"
      borderColor="gray.200"
      display="flex"
      flexDirection="column"
    >
      <VStack gap={6} align="stretch" flex="1">
        {/* Form header */}
        <VStack gap={2} textAlign="center">
          <Flex justify="center" mb={2}>
            <MdSecurity size={40} color={PRIMARY_COLOR} />
          </Flex>
          <Heading size="lg" color={PRIMARY_COLOR}>
            Two-Factor Authentication Setup
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Your account requires 2FA. Please complete the setup to continue.
          </Text>
        </VStack>

        {/* Setup steps */}
        <Box flex="1" display="flex" flexDirection="column">
          {currentStep === 'instructions' ? (
            <VStack align="stretch" gap={4}>
              {/* 2FA Information */}
              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  Understanding Two-Factor Authentication (2FA)
                </Heading>
                <Text mb={4} fontSize="sm" color="gray.600" lineHeight="1.6">
                  {TWO_FACTOR_INFO.description}
                </Text>
              </Box>

              {/* Setup Instructions */}
              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  Step-by-Step Setup Instructions
                </Heading>
                <List.Root gap={3} ml={4}>
                  {TWO_FACTOR_SETUP_INSTRUCTIONS.map((instruction) => (
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
                              onClick={handleGenerateQR}
                              size="sm"
                              buttonText="View QR Code & Backup Codes"
                              isLoading={isGenerating2FA}
                              disabled={isGenerating2FA}
                            />
                          </Box>
                        )}
                      </Box>
                    </List.Item>
                  ))}
                </List.Root>
              </Box>

              {/* Note */}
              <Box mt={4} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800">
                  <Text as={'b'}>Note:</Text> You must complete 2FA setup to access your account.
                </Text>
              </Box>

              {/* Cancel button */}
              <Box mt={4}>
                <PrimaryButton
                  onClick={handleCancel}
                  size="sm"
                  buttonText="Cancel and Logout"
                />
              </Box>
            </VStack>
          ) : currentStep === TWO_FACTOR_SETUP_STEPS.QR_CODE ? (
            <QRCodeStep
              qrCodeData={qrCodeData}
              backupCodes={backupCodes}
              isLoading={isGenerating2FA}
              onNext={handleProceedToVerify}
              onCancel={handleCancel}
            />
          ) : currentStep === TWO_FACTOR_SETUP_STEPS.VERIFY_OTP ? (
            <VerifyOTPStep
              methods={methods}
              isLoading={isEnabling2FA}
              onSubmit={handleVerifyAndEnable}
              onBack={handleBackToQR}
            />
          ) : (
            <SuccessStep
              onComplete={handleCompleteSetup}
              buttonText="Move to Dashboard"
              buttonIcon={MdDashboard}
            />
          )}
        </Box>
      </VStack>
    </Box>
  )
}

export default Setup2FAForm
