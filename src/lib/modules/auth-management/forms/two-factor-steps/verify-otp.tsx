/* Libraries imports */
import React from 'react'
import { UseFormReturn, Controller } from 'react-hook-form'
import { Box, Text, Heading, SimpleGrid, VStack, HStack, GridItem } from '@chakra-ui/react'
import { MdArrowBack, MdVerified } from 'react-icons/md'

/* Shared module imports */
import { PrimaryButton, SecondaryButton, PinInputField } from '@shared/components'

/* Auth module imports */
import { ENABLE_2FA_FORM_QUESTIONS } from '@auth-management/constants'
import { Enable2FAFormData } from '@auth-management/schemas'

/* Component props interface */
interface VerifyOTPStepProps {
  methods: UseFormReturn<Enable2FAFormData>
  isLoading: boolean
  onSubmit: (data: Enable2FAFormData) => void
  onBack: () => void
}

/* OTP Verification step component */
const VerifyOTPStep: React.FC<VerifyOTPStepProps> = ({
  methods,
  isLoading,
  onSubmit,
  onBack
}) => {
  const { control, handleSubmit, formState: { errors }, setValue } = methods

  /* Handle PIN input change with auto-submit */
  const handlePinChange = (value: string[]) => {
    setValue('code', value)
    if (value.length === 6 && value.every(digit => digit !== '')) {
      /* Auto-submit when 6 digits are entered */
      handleSubmit(onSubmit)()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack align="stretch" gap={6}>
        <Box textAlign="center">
          <Heading size="sm" mb={3}>Verify Authenticator Code</Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            Enter the 6-digit code from your authenticator app to complete setup
          </Text>
        </Box>

        {/* OTP Input using form fields */}
        <SimpleGrid columns={1} gap={4}>
          {ENABLE_2FA_FORM_QUESTIONS.filter((field) => field.is_active)
            .sort((a, b) => Number(a.display_order) - Number(b.display_order))
            .map((field) => {
              const schemaKey = field.schema_key as keyof Enable2FAFormData
              const fieldError = errors[schemaKey]

              /* Shared field properties */
              const commonProps = {
                name: schemaKey,
                label: field.label,
                placeholder: '',
                isInValid: !!fieldError,
                required: field.is_required,
                errorMessage: fieldError?.message,
                disabled: isLoading,
              }

              /* Render field based on type */
              if (field.type === 'PIN') {
                return (
                  <GridItem key={field.id} colSpan={field.grid.col_span}>
                    <Controller
                      name={schemaKey}
                      control={control}
                      render={({ field: controllerField }) => (
                        <PinInputField
                          {...commonProps}
                          value={controllerField.value as string[]}
                          onChange={handlePinChange}
                          length={6}
                          autoFocus={true}
                        />
                      )}
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Open your authenticator app and enter the 6-digit code shown for this account
                    </Text>
                  </GridItem>
                )
              }
              return null
            })}
        </SimpleGrid>

        {/* Additional Information */}
        <Box>
          <Heading size="sm" mb={2} color="gray.700">
            How to find your code:
          </Heading>
          <VStack align="start" gap={2} ml={2}>
            <Text fontSize="sm" color="gray.600">
              1. Open your authenticator app (Google Authenticator, Authy, etc.)
            </Text>
            <Text fontSize="sm" color="gray.600">
              2. Find the entry you just added by scanning the QR code
            </Text>
            <Text fontSize="sm" color="gray.600">
              3. The app displays a 6-digit code that refreshes every 30 seconds
            </Text>
            <Text fontSize="sm" color="gray.600">
              4. Enter the current code in the field above
            </Text>
          </VStack>
        </Box>

        {/* Troubleshooting section */}
        <Box>
          <Heading size="sm" mb={2} color="gray.700">
            Troubleshooting:
          </Heading>
          <VStack align="start" gap={2} ml={2}>
            <Text fontSize="sm" color="gray.600">
              • If the code doesn't work, ensure your device's time is set to automatic
            </Text>
            <Text fontSize="sm" color="gray.600">
              • Wait for the code to refresh and try the new code
            </Text>
            <Text fontSize="sm" color="gray.600">
              • Make sure you're entering the code for the correct account
            </Text>
            <Text fontSize="sm" color="gray.600">
              • If issues persist, go back and scan the QR code again
            </Text>
          </VStack>
        </Box>

        {/* Info box */}
        <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
          <Text fontSize="sm" color="blue.800">
            <Text as={'b'}>Tip:</Text> The code changes every 30 seconds. If a code doesn't work, wait for the next one and try again.
          </Text>
        </Box>

        {/* Action Buttons */}
        <Box pt={3} mt={2} borderTop="1px solid" borderColor="gray.200">
          <HStack gap={3} w="full" justify="flex-end">
            <SecondaryButton
              onClick={onBack}
              size="sm"
              buttonText="Back"
              disabled={isLoading}
              leftIcon={MdArrowBack}
            />
            <PrimaryButton
              type="submit"
              size="sm"
              buttonText="Verify Code"
              isLoading={isLoading}
              disabled={isLoading}
              leftIcon={MdVerified}
            />
          </HStack>
        </Box>
      </VStack>
    </form>
  )
}

export default VerifyOTPStep