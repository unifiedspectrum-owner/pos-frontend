/* React and Chakra UI component imports */
import React, { useEffect, useState, useCallback } from 'react'
import { SimpleGrid, Flex, GridItem } from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoHomeFill } from 'react-icons/go'
import { FiArrowRight } from 'react-icons/fi'

/* Shared module imports */
import { TextInputField, SelectField, TextAreaField } from '@shared/components/form-elements/ui'
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'
import { createToastMessage } from '@shared/utils/ui/toast'
import { handleApiError } from '@shared/utils/api-error-handler'

/* Tenant module imports */
import { TENANT_BASIC_INFO_QUESTIONS } from '@tenant-management/constants'
import { createTenantAccountSchema, TenantInfoFormData } from '@tenant-management/schemas/validation/tenants'
import { tenantApiService } from '@tenant-management/api/tenants'
import { StepTracker } from '@tenant-management/utils'
import { TenantInfo } from '@tenant-management/types'

/* Props interface for tenant info step */
interface TenantInfoStepProps {
  isCompleted: (completed: boolean) => void;
  isReviewMode?: boolean;
  onNext?: () => void;
}

/* Main component definition */
const BasicInfoStep: React.FC<TenantInfoStepProps> = ({
  isCompleted,
  isReviewMode = false,
  onNext
}) => {
  /* State management */
  const [isLoading, setIsLoading] = useState(false)
  
  /* Form setup with schema validation */
  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(createTenantAccountSchema),
    defaultValues: createTenantAccountSchema.parse({}),
    mode: 'onSubmit'
  })

  /* Load existing tenant data for readonly/edit mode */
  const loadTenantData = useCallback(() => {
    try {
      const tenantData = localStorage.getItem('tenant_form_data')
      if (!tenantData) return
      
      const data: TenantInfo = JSON.parse(tenantData)
      const fieldMappings = {
        company_name: data.organization_name,
        primary_email: data.primary_email,
        primary_phone: data.primary_phone,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        city: data.city,
        state_province: data.state_province,
        postal_code: data.postal_code,
        country: data.country
      }
      
      Object.entries(fieldMappings).forEach(([key, value]) => {
        setValue(key as keyof TenantInfoFormData, value || '')
      })
    } catch (error) {
      console.log("Error from loadTenantData", error)
    }
  }, [setValue])

  /* Effect to load data in readonly mode */
  useEffect(() => {
    if (isReviewMode) {
      loadTenantData()
    }
  }, [isReviewMode, loadTenantData])

  /* Handle form submission and tenant account creation */
  const onSubmit = async (formData: TenantInfoFormData) => {
    console.log("Form data", formData)
    try {
      setIsLoading(true)
      const { data: response } = await tenantApiService.createTenantAccount(formData)

      if (response.data && response.success) {
        /* Store tenant ID and initial verification status for future steps */
        const { tenant_id } = response.data
        if (tenant_id) {
          console.log('Form submitted:', formData)
          localStorage.setItem('tenant_id', tenant_id)
          console.log('Tenant ID stored:', tenant_id)
          
          /* Store initial verification status (both unverified for new tenant) */
          const initialVerificationStatus = {
            email_verified: false,
            phone_verified: false,
            both_verified: false,
            email_verified_at: null,
            phone_verified_at: null
          }
          localStorage.setItem('tenant_verification_data', JSON.stringify(initialVerificationStatus))
          console.log('Initial verification status stored:', initialVerificationStatus)
        }
        
        /* Mark step as completed in tracker */
        StepTracker.markStepCompleted('TENANT_INFO')
        
        /* Display success notification */
        createToastMessage({
          title: response.message || 'Account Created Successfully',
          description: `Welcome! Your account for ${formData.company_name} has been created.`
        })
        
        isCompleted(true)
      }
    } catch (err) {
      /* Handle API errors */
      console.log("Account creation failed", err)
      handleApiError(err, {
        title: 'Account Creation Failed'
      });
      
      isCompleted(false)
    } finally {
      setIsLoading(false)
    }
  }

  /* Component render */
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Flex flexDir={'column'} gap={6}>
        {/* Dynamic form fields grid */}
        <SimpleGrid columns={2} gap={4}>
          {TENANT_BASIC_INFO_QUESTIONS
            .filter(que => que.is_active)
            .sort((a, b) => Number(a.display_order) - Number(b.display_order))
            .map((que) => {
              const schemeKey = que.schema_key as keyof TenantInfoFormData
              const fieldError = errors[schemeKey];
              
              /* Common field props */
              const commonProps = {
                label: que.label,
                placeholder: que.placeholder,
                isInValid: !!fieldError,
                required: que.is_required,
                errorMessage: fieldError?.message,
                disabled: que.disabled || isReviewMode
              }

              /* Render field based on type */
              switch (que.type) {
                case 'INPUT':
                  return (
                    <GridItem key={que.id} colSpan={que.grid.col_span}>
                      <Controller
                        name={schemeKey}
                        control={control}
                        render={({ field }) => (
                          <TextInputField
                            {...commonProps}
                            value={field.value?.toString() || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            readOnly={que.disabled || isReviewMode}
                          />
                        )}
                      />
                    </GridItem>
                  )
                
                case 'TEXTAREA':
                  return (
                    <GridItem key={que.id} colSpan={que.grid.col_span}>
                      <Controller
                        name={schemeKey}
                        control={control}
                        render={({ field }) => (
                          <TextAreaField
                            {...commonProps}
                            value={field.value?.toString() || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            readOnly={que.disabled || isReviewMode}
                          />
                        )}
                      />
                    </GridItem>
                  )
                
                case 'SELECT':
                  return (
                    <GridItem key={que.id} colSpan={que.grid.col_span}>
                      <Controller
                        name={schemeKey}
                        control={control}
                        render={({ field }) => (
                          <SelectField
                            {...commonProps}
                            options={que.values || []}
                            value={field.value?.toString() || ''}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </GridItem>
                  )
                
                default:
                  return null
              }
            })
          }
        </SimpleGrid>

        {/* Action buttons section */}
        <Flex justify="space-between" pt={4}>
          {/* Home navigation button */}
          <SecondaryButton
            leftIcon={GoHomeFill}
          >
            Back to Home
          </SecondaryButton>

          {/* Next/Submit button based on mode */}
          <PrimaryButton 
            type={isReviewMode ? "button" : "submit"} 
            onClick={isReviewMode ? onNext : undefined} 
            loading={!isReviewMode && isLoading}
            rightIcon={FiArrowRight}
          >
            {isReviewMode ? "Next" : isLoading ? 'Creating Account...' : 'Continue to Verification'}
          </PrimaryButton>
        </Flex>
      </Flex>
    </form>
  )
}

export default BasicInfoStep