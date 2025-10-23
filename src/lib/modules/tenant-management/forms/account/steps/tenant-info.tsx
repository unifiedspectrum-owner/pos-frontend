/* Libraries imports */
import React, { useEffect, useState, useCallback } from 'react'
import { Flex, Fieldset } from '@chakra-ui/react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui'
import { handleApiError } from '@shared/utils/api'
import { useCountries } from '@shared/hooks/use-countries'
import { PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Tenant module imports */
import { createTenantAccountSchema, TenantInfoFormData } from '@tenant-management/schemas/account'
import { onboardingService } from '@tenant-management/api'
import { StepTracker, getCachedVerificationStatus, transformFormDataToTenantCacheData, transformFormDataToApiPayload, hasFormDataChanged, getTenantId } from '@tenant-management/utils'
import { TenantInfo, CreateAccountApiRequest } from '@tenant-management/types'
import { BasicInformation, AddressInformation } from '@tenant-management/forms/account/steps/components/tenant-info'
import { CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES, TENANT_ACCOUNT_CREATION_LS_KEYS, TENANT_BASIC_INFO_QUESTIONS, TENANT_FORM_SECTIONS } from '@tenant-management/constants'
import { NavigationButton } from '@tenant-management/forms/account/steps/components/navigations'
import { AxiosError } from 'axios'

/* Component props interface */
interface TenantInfoStepProps {
  isCompleted: (completed: boolean) => void;
}

/* Tenant basic information collection step */
const BasicInfoStep: React.FC<TenantInfoStepProps> = ({ isCompleted }) => {
  /* Component loading state */
  const [isLoading, setIsLoading] = useState(false)
  
  /* Countries data management with form options and lookup helpers */
  const { 
    /* Raw data arrays */
    countries, states,
    /* Form dropdown options */
    countryOptions, stateOptions, dialCodeOptions,
    /* Current selection state */
    selectedCountry, selectedCountryName, setSelectedCountryName, getCountryByName,
    /* Loading state */
    isLoading: isLoadingCountries 
  } = useCountries({
    autoFetch: true,
    showErrorToast: true,
    cacheResults: true,
  })
  
  /* Form validation and control setup */
  const { control, handleSubmit, formState: { errors }, setValue, trigger } = useForm<TenantInfoFormData>({
    resolver: zodResolver(createTenantAccountSchema),
    defaultValues: CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES,
    mode: 'onSubmit'
  })

  /* Monitor country field for state dropdown updates */
  const countryValue = useWatch({ control, name: 'country', defaultValue: ''})

  /* Reset state and update dial code when country selection changes */
  useEffect(() => {
    console.log("Country changed:", countryValue)
    if (countryValue) {
      setSelectedCountryName(countryValue)
      setValue('state_province', '') // Clear state when country changes
      
      /* Auto-update dial code for phone field */
      const country = getCountryByName(countryValue)
      if (country?.phone_code) {
        const currentPhone = control._formValues.primary_phone as [string, string] || ['', '']
        setValue('primary_phone', [country.phone_code, currentPhone[1] || ''])
        console.log(`Updated dial code to: ${country.phone_code} for country: ${countryValue}`)
      }
    } else {
      setSelectedCountryName('')
      setValue('state_province', '')
      setValue('primary_phone', ['', '']) // Clear phone when no country
    }
  }, [countryValue, setSelectedCountryName, setValue, getCountryByName, control])

  /* Load and restore tenant data from localStorage */
  const loadTenantData = useCallback(() => {
    try {
      const tenantData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)
      if (!tenantData) {
        console.log('loadTenantData: no tenant data found in localStorage')
        return
      }
      
      console.log('loadTenantData: raw data from localStorage:', tenantData)
      const data: TenantInfo = JSON.parse(tenantData)
      
      /* Map stored data to form fields - exclude primary_phone (handled separately) */
      const commonFields: (keyof TenantInfo)[] = [
        'company_name', 'contact_person', 'primary_email',
        'address_line1', 'address_line2', 'city', 'country', 'state_province', 'postal_code'
      ]
      
      commonFields.forEach(field => {
        setValue(field as keyof TenantInfoFormData, data[field] || '')
      })

      const country = getCountryByName(data.country);
      
      /* Set country and prepare state field for restoration */
      if (data.country && country?.name) {
        console.log(`Setting country Name: ${data.country} for country name: ${data.country}`)
        setSelectedCountryName(country.name);
        localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PENDING_STATE_RESTORE, data.state_province)
        
        /* Restore phone field with correct dial code */
        if (data.primary_phone && country.phone_code) {
          /* Clean the phone number by removing the dial code if it's already included */
          let cleanPhoneNumber = data.primary_phone
          if (cleanPhoneNumber && cleanPhoneNumber.startsWith(country.phone_code)) {
            cleanPhoneNumber = cleanPhoneNumber.replace(country.phone_code, '').replace(/^[-\s]+/, '')
          }
          setValue('primary_phone', [country.phone_code, cleanPhoneNumber])
          console.log(`Restored phone: [${country.phone_code}, ${cleanPhoneNumber}]`)
        }
      }
    } catch (error) {
      console.log("Error from loadTenantData", error)
    }
  }, [getCountryByName, setValue, setSelectedCountryName])

  /* Load tenant data after countries are fetched */
  useEffect(() => {
    if (countries.length > 0) {
      loadTenantData()
    }
  }, [loadTenantData, countries.length])

  /* Restore state selection after states data loads */
  useEffect(() => {
    const pendingStateName = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PENDING_STATE_RESTORE)
    if (pendingStateName && states.length > 0 && selectedCountryName) {
      console.log(`Attempting to restore state: "${pendingStateName}" from ${states.length} available states`)
      const state = states.find(s => s.name === pendingStateName)
      if (state) {
        console.log(`Found matching state, setting state ID: ${state.id}`)
        setValue('state_province', state.name.toString())
        localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PENDING_STATE_RESTORE)
      }
    }
  }, [states, selectedCountryName, setValue])


  /* Process form submission and account creation */
  const onSubmit = async (formData: TenantInfoFormData) => {
    console.log("Form data", formData)
    try {
      setIsLoading(true)
      
      /* Skip API call if no changes detected */
      const dataChanged = hasFormDataChanged(formData)
      if (!dataChanged) {
        console.log('No changes detected, skipping API call and proceeding to next step')
        StepTracker.markStepCompleted('TENANT_INFO')
        createToastNotification({
          title: 'Step Completed',
          description: 'No changes detected. Proceeding to next step.',
        })
        isCompleted(true)
        setIsLoading(false)
        return
      }
      
      console.log('Changes detected, calling API to update tenant information')
      
      /* Build API payload using utility function */
      const apiRequest: CreateAccountApiRequest = transformFormDataToApiPayload(
        formData,
        getCachedVerificationStatus(),
        getTenantId()
      )
      
      console.log("API Request data", apiRequest)
      const response = await onboardingService.createTenantAccount(apiRequest)

      if (response.data && response.success) {
        const { tenant_id } = response.data
        if (tenant_id) {
          console.log('Form submitted:', formData)
          localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID, tenant_id)
          console.log('Tenant ID stored:', tenant_id)
          
          /* Cache form data for future steps */
          const tenantFormData = transformFormDataToTenantCacheData(formData)
          localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA, JSON.stringify(tenantFormData))
          console.log('Tenant form data stored:', tenantFormData)
        }
        
        /* Mark step completed and show success notification */
        StepTracker.markStepCompleted('TENANT_INFO')
        createToastNotification({
          title: response.message || 'Account Created Successfully',
          description: `Welcome! Your account for ${formData.company_name} has been created.`
        })
        
        isCompleted(true)
      }
    } catch (error) {
      /* Handle API failures */
      console.log("Account creation failed", error)
      const err = error as AxiosError;
      handleApiError(err, { title: 'Account Creation Failed' });
      isCompleted(false)
    } finally {
      setIsLoading(false)
    }
  }

  /* Render form interface */
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Flex 
        flexDir={'column'} gap={6} borderWidth={1} bg={WHITE_COLOR} 
        borderBottomRadius={'lg'} p={8} transition="all 0.3s ease"
        borderColor={PRIMARY_COLOR}
        _hover={{ boxShadow: "0 8px 24px rgba(136, 92, 247, 0.15)"}}
      >
        {/* Configurable form sections */}
        <Flex flexDir={'column'} gap={6}>
          {TENANT_BASIC_INFO_QUESTIONS.map((section, index) => (
            <Fieldset.Root key={index} borderWidth={1} borderColor={PRIMARY_COLOR} borderRadius={'xl'} px={5} pb={5}>
              <Fieldset.Legend fontWeight={'bold'}>&nbsp;{section.section_heading}&nbsp;</Fieldset.Legend>
              {(section.section_heading == TENANT_FORM_SECTIONS.BASIC_INFO ?
                <BasicInformation
                  control={control}
                  errors={errors}
                  trigger={trigger}
                  setValue={setValue}
                  countryOptions={countryOptions}
                  dialCodeOptions={dialCodeOptions}
                  selectedCountryDialCode={selectedCountry?.phone_code || ''}
                  isLoadingCountries={isLoadingCountries}
                />
              : section.section_heading == TENANT_FORM_SECTIONS.ADDRESS_INFO ? 
                <AddressInformation
                  control={control}
                  errors={errors}
                  stateOptions={stateOptions}
                  countryValue={countryValue}
                />
              : <></>
              )}
            </Fieldset.Root>
          ))}
        </Flex>

        {/* Form navigation controls */}
        <NavigationButton
          secondaryBtnText={'Back to Home'}
          primaryBtnType={'submit'}
          isPrimaryBtnLoading={isLoading}
          primaryBtnText={'Continue to Plan Selection'}
          primaryBtnLoadingText={'Creating Account...'}
        />
      </Flex>
    </form>
  )
}

export default BasicInfoStep