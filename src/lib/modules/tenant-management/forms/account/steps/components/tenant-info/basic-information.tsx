/* React and Chakra UI component imports */
import React, { useEffect } from 'react'
import { SimpleGrid, Flex, GridItem } from '@chakra-ui/react'
import { Controller, Control, FieldErrors } from 'react-hook-form'

/* Shared module imports */
import { formatTimer, getPhoneFieldErrorMessage } from '@shared/utils/formatting'
import { createToastNotification } from '@shared/utils/ui'
import { TextInputField, ComboboxField, PhoneNumberField } from '@shared/components/form-elements/ui'
import { ComboboxOption } from '@shared/components/form-elements/ui/combobox-field'

/* Tenant module imports */
import { TenantInfoFormData } from '@tenant-management/schemas/account'
import { TENANT_BASIC_INFO_QUESTIONS, TENANT_FORM_SECTIONS } from '@tenant-management/constants'
import TextInputFieldWithButton from '@/lib/shared/components/form-elements/ui/text-button-field'
import { useOTPManagement, useFormPersistence, useVerificationStatus } from '@/lib/modules/tenant-management/hooks/account-creation'

/* Props interface */
interface BasicInformationProps {
  control: Control<TenantInfoFormData>
  errors: FieldErrors<TenantInfoFormData>
  trigger: (field: keyof TenantInfoFormData) => Promise<boolean>
  setValue: (field: keyof TenantInfoFormData, value: string | [string, string]) => void
  countryOptions: ComboboxOption[]
  dialCodeOptions: ComboboxOption[]
  selectedCountryDialCode?: string
  isLoadingCountries?: boolean,
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  control, errors, trigger,
  countryOptions = [], dialCodeOptions = [],
  isLoadingCountries = false,
}) => {
  /* Form data persistence hook */
  const { saveCurrentFormData } = useFormPersistence(control)
  
  /* OTP management hook */
  const {
    emailVerification,
    isSendingEmailOTP,
    emailOTPSent,
    handleSendEmailOTP,
    phoneVerification,
    isSendingPhoneOTP,
    phoneOTPSent,
    handleSendPhoneOTP
  } = useOTPManagement({ 
    onSuccess: saveCurrentFormData,
    trigger 
  })

  /* Verification status management hook */
  const {
    loadVerificationStatus
  } = useVerificationStatus({
    control,
    emailVerified: emailVerification.isVerified,
    phoneVerified: phoneVerification.isVerified
  })

  /* Initialize verification status on component mount */
  useEffect(() => {
    const { emailVerified, phoneVerified } = loadVerificationStatus()
    if (emailVerified) {
      emailVerification.setIsVerified(true)
    }
    if (phoneVerified) {
      phoneVerification.setIsVerified(true)
    }
  }, [loadVerificationStatus, emailVerification, phoneVerification]);

  const handlePhoneVerifyClick = (value: [string, string]) => {
    const dialCode = value[0] || ''
    /* Show toast error when button is disabled */
    if (!dialCode) {
      createToastNotification({
        title: 'Country Required',
        description: 'Please select a country code before verifying your phone number.',
        type: 'error'
      });
      return
    } 
    /* Proceed with OTP sending if validation passes */
    handleSendPhoneOTP(value)
  }

  /* Clear timers when verification is successful */
  useEffect(() => {
    if (emailVerification.isVerified) {
      emailVerification.setResendTimer(0)
    }
  }, [emailVerification.isVerified, emailVerification])

  useEffect(() => {
    if (phoneVerification.isVerified) {
      phoneVerification.setResendTimer(0)
    }
  }, [phoneVerification.isVerified, phoneVerification])

  return (
    <SimpleGrid columns={[3,3,6]} gap={4}>
      {TENANT_BASIC_INFO_QUESTIONS
        .filter((section) => section.section_heading === TENANT_FORM_SECTIONS.BASIC_INFO)
        .map((section) => section.section_values
            .filter(que => que.is_active)
            .sort((a, b) => Number(a.display_order) - Number(b.display_order))
            .map((que) => {
              const schemaKey = que.schema_key as keyof TenantInfoFormData
              const fieldError = errors[schemaKey]
                            
              /* Common field props */
              const commonProps = {
                name: schemaKey,
                label: que.label,
                placeholder: que.placeholder,
                isInValid: !!fieldError,
                required: que.is_required,
                errorMessage: fieldError?.message,
                readOnly: que.disabled,
                disabled: que.disabled,

              }
              
              /* Render email field with OTP functionality */
              if (schemaKey === 'primary_email' && que.type == "INPUT_WITH_BUTTON") {
                return (
                  <GridItem key={que.id} colSpan={[3, 3, que.grid.col_span]}>
                    <Controller
                      name={schemaKey}
                      control={control}
                      render={({ field }) => {
                        const value = field.value?.toString() || ''
                        const buttonText = emailVerification.resendTimer > 0 
                          ? `Resend in ${formatTimer(emailVerification.resendTimer)}` 
                          :  emailOTPSent ? 'Resend OTP' : 'Verify';
                        return(
                          <Flex flexDir={'column'} gap={2}>
                            <TextInputFieldWithButton
                              {...commonProps}
                              value={value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              readOnly={emailVerification.isVerified || que.disabled}
                              disabled={emailVerification.isVerified || que.disabled}
                              onButtonClick={() => handleSendEmailOTP(value)}
                              ButtonText={buttonText}
                              buttonLoading={isSendingEmailOTP}
                              leftIcon={que.left_icon ? <que.left_icon/> : undefined}
                              showVerifiedText = {emailVerification.isVerified}
                            />
                            {/* OTP Input Field - Show after OTP sent but hide after verification */}
                            {emailOTPSent && !emailVerification.isVerified && (
                              <Flex mt={3}>
                                <Controller
                                  name="email_otp"
                                  control={control}
                                  render={({ field }) => {
                                    const value = field.value?.toString() || '';
                                    const fieldError = errors.email_otp
                                    
                                    return (
                                      <TextInputFieldWithButton
                                        label="Email OTP"
                                        placeholder="Enter 6-digit OTP"
                                        value={value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        isInValid={!!fieldError}
                                        required={true}
                                        errorMessage={fieldError?.message}
                                        ButtonText="Verify OTP"
                                        buttonLoading={emailVerification.isLoading}
                                        onButtonClick={() => emailVerification.verifyOTP(value)}
                                      />
                                    )
                                  }}
                                />
                              </Flex>
                            )}
                          </Flex>
                      )}}
                    />
                  </GridItem>
                )
              }
              
              /* Render phone field with OTP functionality using PhoneNumberField */
              if (schemaKey === 'primary_phone' && que.type == 'PHONE_NUMBER') {
                return (
                  <GridItem key={que.id} colSpan={[3, 3, que.grid.col_span]}>
                    <Controller
                      name={schemaKey}
                      control={control}
                      render={({ field }) => {
                        const value = (field.value as [string, string]) || ['', '']
                        const buttonText = phoneVerification.resendTimer > 0 
                          ? `Resend in ${formatTimer(phoneVerification.resendTimer)}` 
                          : phoneOTPSent ? 'Resend OTP' : 'Verify';
                        return (
                          <Flex flexDir={'column'} gap={2}>
                            <PhoneNumberField
                              {...commonProps}
                              comboboxPlaceholder=""
                              value={value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              errorMessage={getPhoneFieldErrorMessage(fieldError)}
                              readOnly={phoneVerification.isVerified || que.disabled}
                              disabled={phoneVerification.isVerified || isLoadingCountries || que.disabled}
                              options={dialCodeOptions}
                              buttonText={buttonText}
                              onButtonClick={() => handlePhoneVerifyClick(value)}
                              buttonLoading={isSendingPhoneOTP}
                              leftIcon={que.left_icon ? <que.left_icon /> : undefined}
                              showVerifiedText={phoneVerification.isVerified}
                            />
                            {/* OTP Input Field - Show after OTP sent but hide after verification */}
                            {phoneOTPSent && !phoneVerification.isVerified && (
                              <Flex mt={3}>
                                <Controller
                                  name="phone_otp"
                                  control={control}
                                  render={({ field }) => {
                                    const value = field.value?.toString() || '';
                                    const fieldError = errors.phone_otp
                                    
                                    return (
                                      <TextInputFieldWithButton
                                        label="Phone OTP"
                                        placeholder="Enter 6-digit OTP"
                                        value={value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        isInValid={!!fieldError}
                                        required={true}
                                        errorMessage={fieldError?.message}
                                        ButtonText="Verify OTP"
                                        buttonLoading={phoneVerification.isLoading}
                                        onButtonClick={() => phoneVerification.verifyOTP(value)}
                                      />
                                    )
                                  }}
                                />
                              </Flex>
                            )}
                          </Flex>
                        )
                      }}
                    />
                  </GridItem>
                )
              }
              
              /* Render combobox fields */
              if (que.type === 'COMBOBOX') {
                /* Use country options for country field, with loading state when empty */
                const options = schemaKey === 'country' 
                  ? (countryOptions.length > 0 ? countryOptions : [])
                  : []
                
                return (
                  <GridItem key={que.id} colSpan={[3, 3, que.grid.col_span]}>
                    <Controller
                      name={schemaKey}
                      control={control}
                      render={({ field }) => (
                        <ComboboxField
                          {...commonProps}
                          value={field.value?.toString() || ''}
                          onChange={(value) => field.onChange(value)}
                          options={options}
                          disabled={options.length == 0 || que.disabled}
                        />
                      )}
                    />
                  </GridItem>
                )
              }
              
              /* Render regular text input fields */
              if (que.type === 'INPUT') {
                return (
                  <GridItem key={que.id} colSpan={[3, 3, que.grid.col_span]}>
                    <Controller
                      name={schemaKey}
                      control={control}
                      render={({ field }) => (
                        <TextInputField
                          {...commonProps}
                          value={field.value?.toString() || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          leftIcon={que.left_icon ? <que.left_icon /> : undefined}
                        />
                      )}
                    />
                  </GridItem>
                )
              }
              
              return null
            })
        )
      }
    </SimpleGrid>
  )
}

export default BasicInformation