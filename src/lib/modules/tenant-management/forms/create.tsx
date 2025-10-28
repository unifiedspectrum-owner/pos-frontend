"use client"

/* Libraries imports */
import React, { useState, useEffect, useCallback } from 'react'
import { Container, Flex } from '@chakra-ui/react'

/* Shared module imports */
import { FullPageLoader } from '@shared/components/common'
import { handleApiError } from '@shared/utils/api'

/* Tenant module imports */
import { BasicInfoStep, PlanSelectionStep, AddonSelectionStep, PlanSummaryStep, PaymentStep, PaymentFailedStep, SuccessStep } from '@/lib/modules/tenant-management/forms/steps'
import { TENANT_CREATION_STEPS, STEP_IDS, TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { StepTracker, cleanupAccountCreationStorage, calculateStepProgression, getTenantId, getPaymentStatus, isPlanSummaryCompleted } from '@tenant-management/utils'
import { useAssignedPlan } from '@tenant-management/hooks/data-management'
import { ProgressHeader } from '@tenant-management/components/layout'
import { onboardingService } from '@tenant-management/api'
import { CachedPlanData, TenantAccountCreationStepType } from '@tenant-management/types'
import { AxiosError } from 'axios'

/* Main tenant account creation form component */
const TenantAccountCreationForm: React.FC = () => {
  /* Component state initialization */
  const [currentStep, setCurrentStep] = useState<TenantAccountCreationStepType>(STEP_IDS.TENANT_INFO)
  const [completedSteps, setCompletedSteps] = useState<Set<TenantAccountCreationStepType>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)
  const [paymentError, setPaymentError] = useState<{ message: string; code: string } | null>(null)

  /* Hook for managing assigned plan data */
  const { fetchAssignedPlan } = useAssignedPlan()

  /* Sync tenant status and progress from API */
  const refreshTenantDataFromStatusApi = useCallback(async () => {
    const tenantId = getTenantId()
    if (!tenantId) {
      /* Reset to initial state without tenant ID */
      setCurrentStep(STEP_IDS.TENANT_INFO)
      setCompletedSteps(new Set())
      setIsInitialized(true)
      return
    }

    /* Fetch current tenant status */
    try {
      const response = await onboardingService.checkTenantAccountStatus(tenantId)

      if (response.success && response.data) {
        const { tenant_info, verification_status, basic_info_status } = response.data;
        /* Update local storage with server data */
        localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA, JSON.stringify(tenant_info));
        localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, JSON.stringify(verification_status));
        
        /* Sync verification status with step tracker */
        if (verification_status.email_verified) {
          StepTracker.markStepCompleted('EMAIL_VERIFICATION')
        }
        if (verification_status.phone_verified) {
          StepTracker.markStepCompleted('PHONE_VERIFICATION')
        }
        
        /* Extract completion status from API response */
        const isBasicInfoComplete = basic_info_status.is_complete
        const isVerificationComplete = verification_status.both_verified
        
        /* Handle validation errors */
        if (!isBasicInfoComplete && basic_info_status.validation_errors.length > 0) {
          console.warn('Basic info validation errors:', basic_info_status.validation_errors)
        }

        /* Get cached plan data and payment status */
        let assignedPlanData: CachedPlanData | null = null
        if (isBasicInfoComplete && isVerificationComplete) {
          assignedPlanData = await fetchAssignedPlan(tenantId)
          if (assignedPlanData) {
            console.log('Assigned plan data refreshed from API on page refresh')
          }
        }

        /* Parse payment status and plan summary completion */
        const paymentSucceeded = getPaymentStatus()
        const planSummaryCompleted = isPlanSummaryCompleted()

        /* Calculate step progression using utility */
        const { targetStep, completedSteps: calculatedCompleted } = calculateStepProgression(
          isBasicInfoComplete,
          isVerificationComplete,
          assignedPlanData,
          paymentSucceeded,
          planSummaryCompleted
        )

        /* Update step tracker for tenant info completion */
        if (isBasicInfoComplete && isVerificationComplete) {
          StepTracker.markStepCompleted('TENANT_INFO')
        }

        setCompletedSteps(calculatedCompleted)
        setCurrentStep(targetStep)
        console.log('Step restored:', targetStep)
      } else {
        console.warn('API error:', response.message)
      }
    } catch (error) {
      console.warn('API failed:', error);
      cleanupAccountCreationStorage()
      const err = error as AxiosError;
      handleApiError(err, { title: "Failed to load tenant data" })
    } finally {
      setIsInitialized(true)
    }
  }, [fetchAssignedPlan])

  /* Initialize form state from API */
  useEffect(() => {
    refreshTenantDataFromStatusApi();
  }, [refreshTenantDataFromStatusApi]);

  /* Get visible steps for progress display */
  const progressSteps = TENANT_CREATION_STEPS.filter(step => 
    step.id !== STEP_IDS.PAYMENT_FAILED && step.id !== STEP_IDS.SUCCESS
  )
  
  /* Calculate step indices for progress tracking */
  const currentStepIndex = TENANT_CREATION_STEPS.findIndex(step => step.id === currentStep)
  const progressStepIndex = progressSteps.findIndex(step => step.id === currentStep)
  
  /* Calculate completion percentage for progress bar */
  const stepProgressPercentage = progressStepIndex >= 0 
    ? Math.round(((progressStepIndex + 1) / progressSteps.length) * 100)
    : 100
  
  /* Advance to next step on current step completion */
  const handleCurrentStepCompleted = (completed: boolean) => {
    if (completed) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex < TENANT_CREATION_STEPS.length) {
        setCurrentStep(TENANT_CREATION_STEPS[nextStepIndex].id)
      } else {
        /* All steps complete - finalize account creation */
        handleAccountCreationComplete()
      }
    }
  }

  /* Clean up and redirect after successful creation */
  const handleAccountCreationComplete = () => {
    console.log('Account creation completed successfully!')
    cleanupAccountCreationStorage()
    /* Also remove tenant_id on final completion */
    localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)
    window.location.href = '/dashboard'
  }

  /* Handle payment processing errors */
  const handlePaymentFailed = (errorMessage: string, errorCode: string) => {
    setPaymentError({ message: errorMessage, code: errorCode })
    setCurrentStep(STEP_IDS.PAYMENT_FAILED)
  }

  /* Reset payment error and return to payment step */
  const handleRetryPayment = () => {
    setPaymentError(null)
    setCurrentStep(STEP_IDS.PAYMENT)
  }

  /* Navigate backward through creation steps */
  const handleMoveToPreviousStep = async () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      const previousStepId = TENANT_CREATION_STEPS[prevStepIndex].id
      
      /* Refresh tenant data when returning to info step */
      if (previousStepId === STEP_IDS.TENANT_INFO) {
        try {
          await refreshTenantDataFromStatusApi()
        } catch (error) {
          console.warn('Failed to refresh tenant data when navigating back:', error)
          cleanupAccountCreationStorage()
        }
      }
      
      /* Refresh plan data when returning to summary step */
      if (previousStepId === STEP_IDS.PLAN_SUMMARY) {
        const tenantId = getTenantId()
        if (tenantId) {
          try {
            const assignedPlanData = await fetchAssignedPlan(tenantId)
            if (assignedPlanData) {
              console.log('Assigned plan data refreshed when navigating back to summary')
            }
          } catch (error) {
            console.warn('Failed to refresh assigned plan data when navigating back:', error)
            cleanupAccountCreationStorage()
          }
        }
      }
      
      setCurrentStep(previousStepId)
    }
  }

  /* Display loading screen during initialization */
  if (!isInitialized) {
    return(
      <FullPageLoader
        title="Loading Account Setup"
        subtitle="Initializing your account creation process..."
      />
    );
  }

  /* Render main creation form interface */
  return (
    <Container maxW="6xl" py={2}>
      <Flex flexDir={'column'} >
        {/* Progress header component */}
        <ProgressHeader
          currentStep={currentStep}
          completedSteps={completedSteps}
          progressSteps={progressSteps}
          progressStepIndex={progressStepIndex}
          stepProgressPercentage={stepProgressPercentage}
        />

        {/* Main form content area */}
        <Flex w={'100%'} bg={progressStepIndex < 0 ? 'gray.50' : 'white'} borderRadius={progressStepIndex < 0 ? 'lg' : 'none'}>
          <Flex gap={6} w={'100%'} flexDir={'column'} p={progressStepIndex < 0 ? 8 : 0}>

            {/* Dynamic step component rendering */}
            {currentStep === STEP_IDS.TENANT_INFO && (
              <BasicInfoStep
                isCompleted={handleCurrentStepCompleted}
              />
            )}
             {currentStep === STEP_IDS.PLAN_SELECTION && (
              <PlanSelectionStep
                isCompleted={handleCurrentStepCompleted}
                onPrevious={handleMoveToPreviousStep}
              />
            )}
            {currentStep === STEP_IDS.ADDON_SELECTION && (
              <AddonSelectionStep
                isCompleted={handleCurrentStepCompleted}
                onPrevious={handleMoveToPreviousStep}
              />
            )}
            {currentStep === STEP_IDS.PLAN_SUMMARY && (
              <PlanSummaryStep
                isCompleted={handleCurrentStepCompleted}
                onPrevious={handleMoveToPreviousStep}
              />
            )}
            {currentStep === STEP_IDS.PAYMENT && ( 
              <PaymentStep
                isCompleted={handleCurrentStepCompleted}
                onPrevious={handleMoveToPreviousStep}
                onPaymentFailed={handlePaymentFailed}
              />
            )}
            {currentStep === STEP_IDS.PAYMENT_FAILED && (
              <PaymentFailedStep
                onRetryPayment={handleRetryPayment}
                onPrevious={handleMoveToPreviousStep}
                errorMessage={paymentError?.message}
                errorCode={paymentError?.code}
              />
            )}
            {currentStep === STEP_IDS.SUCCESS && (
              <SuccessStep
                onComplete={handleAccountCreationComplete}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
}

export default TenantAccountCreationForm