/* React core */
import React from 'react'

/* UI components */
import { HStack, Text, Flex, GridItem } from '@chakra-ui/react'
import { Controller, Control, FieldErrors, Path } from 'react-hook-form'
import { FaCheck } from 'react-icons/fa'

/* Shared components */
import { PinInputField } from '@shared/components/form-elements/ui'
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'

/* Module-specific imports */
import { formatTimer } from '@shared/utils/time'
import { FormFieldStructure } from '@shared/types'

/* Generic OTP form data type */
type OTPFormData = Record<string, string[]>

/* Component props interface for verification section */
interface VerificationSectionProps<T extends OTPFormData = OTPFormData> {
  question: FormFieldStructure
  isVerified: boolean
  isLoading: boolean
  isResending: boolean
  resendTimer: number
  errors: FieldErrors<T>
  control: Control<T>
  onVerify: () => void
  onResend: () => void
  verifyButtonText: string
  successMessage: string
  isReviewMode?: boolean
}

/* Reusable verification section component for OTP input and status display */
export const VerificationSection = <T extends OTPFormData>({
  question,
  isVerified,
  isLoading,
  isResending,
  resendTimer,
  errors,
  control,
  onVerify,
  onResend,
  verifyButtonText,
  successMessage,
  isReviewMode = false
}: VerificationSectionProps<T>) => {
  /* Extract field key as Path for react-hook-form compatibility */
  const fieldKey = question.schema_key as Path<T>
  
  /* Extract field-specific error from form errors */
  const fieldError = errors[fieldKey]
  return (
    <GridItem key={question.id} colSpan={question.grid.col_span}>
      <Flex flexDir='column' w={'100%'} gap={4}>
        {/* PIN input field - shown only when not verified */}
        {!isVerified && (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field }) => (
              <PinInputField
                label={question.label}
                placeholder={question.placeholder}
                isInValid={!!fieldError}
                required={question.is_required}
                errorMessage={fieldError?.message ? String(fieldError.message) : ''}
                disabled={isVerified}
                length={6}
                value={field.value || []}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
        )}
        
        {/* Success indicator - shown when verification is complete */}
        {isVerified && (
          <Flex flexDir='column' gap={2}>
            <Text fontSize="md" fontWeight="medium">{question.label}</Text>
            <HStack color="green.500" p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <FaCheck />
              <Text fontSize="sm" fontWeight="medium">{successMessage} Verified Successfully</Text>
            </HStack>
          </Flex>
        )}
        
        {/* Action buttons - shown only when not verified and not in review mode */}
        {!isVerified && !isReviewMode && (
          <Flex gap={3} flexWrap="wrap">
            {/* Primary verify button with loading state */}
            <PrimaryButton onClick={onVerify} loading={isLoading} size="sm">
              {isLoading ? 'Verifying...' : verifyButtonText}
            </PrimaryButton>
            {/* Secondary resend button with countdown timer */}
            <SecondaryButton
              onClick={onResend}
              loading={isResending}
              disabled={resendTimer > 0 || isResending}
              size="sm"
            >
              {isResending 
                ? 'Sending...' 
                : resendTimer > 0 
                ? `Resend (${formatTimer(resendTimer)})` 
                : 'Resend OTP'}
            </SecondaryButton>
          </Flex>
        )}
      </Flex>
    </GridItem>
  )
}