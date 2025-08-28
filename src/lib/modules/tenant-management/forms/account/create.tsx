"use client"

/* React and UI component imports */
import React, { useState, useEffect } from 'react'
import { Text, VStack, HStack, Progress, Container, Steps, Flex } from '@chakra-ui/react'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { FullPageLoader } from '@shared/components/common'
import { handleApiError } from '@shared/utils'

/* Tenant management specific imports */
import { BasicInfoStep, PlanSelectionStep, VerificationStep, PlanSummaryStep } from '@tenant-management/forms/account/steps'
import { TENANT_CREATION_STEPS, STEP_IDS } from '@tenant-management/constants'
import { StepTracker } from '@tenant-management/utils'
import { tenantApiService } from '@tenant-management/api/tenants'
import { TenantAccountCreationStepType, TenantStatusApiRquest } from '@tenant-management/types'

/* Main tenant account creation form component */
const TenantAccountCreationForm: React.FC = () => {
  /* Component state variables */
  const [currentStep, setCurrentStep] = useState<TenantAccountCreationStepType>(STEP_IDS.PLAN_SELECTION)
  const [completedSteps, setCompletedSteps] = useState<Set<TenantAccountCreationStepType>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false);

  /* Restore account creation progress from API */
  const restoreAccountCreationStepFromApi = async () => {
    const tenantId = localStorage.getItem('tenant_id')
    if (!tenantId) {
      /* No tenant ID - start from beginning */
      setCurrentStep(STEP_IDS.TENANT_INFO)
      setCompletedSteps(new Set())
      setIsInitialized(true)
      return
    }

    /* Fetch current status from API */
    try {
      const apiRequest: TenantStatusApiRquest = { tenant_id: tenantId }
      const resp = await tenantApiService.checkTenantAccountStatus(apiRequest)
      const response = resp.data;

      if (response.success && response.data) {
        const { tenant_info, verification_status } = response.data;
        localStorage.setItem("tenant_form_data", JSON.stringify(tenant_info));
        localStorage.setItem("tenant_verification_data", JSON.stringify(verification_status));
        const completed = new Set<TenantAccountCreationStepType>();
        
        /* Mark tenant info as completed */
        StepTracker.markStepCompleted('TENANT_INFO');
        completed.add(STEP_IDS.TENANT_INFO)
        
        /* Update verification tracking from server */
        if (verification_status.email_verified) {
          StepTracker.markStepCompleted('EMAIL_VERIFICATION')
        }
        if (verification_status.phone_verified) {
          StepTracker.markStepCompleted('PHONE_VERIFICATION')
        }
        
        /* Determine current step */
        let targetStep: TenantAccountCreationStepType = STEP_IDS.VERIFICATION
        if (verification_status.both_verified) {
          completed.add(STEP_IDS.VERIFICATION)
          targetStep = STEP_IDS.PLAN_SELECTION /* Show completed state */
        }
        
        /* Check if plan is already selected */
        const selectedPlan = localStorage.getItem('selected_plan')
        if (selectedPlan && verification_status.both_verified) {
          completed.add(STEP_IDS.PLAN_SELECTION)
          targetStep = STEP_IDS.PLAN_SUMMARY
        }
        
        setCompletedSteps(completed)
        setCurrentStep(targetStep)
        
        console.log('Step restored:', targetStep)
      } else {
        console.warn('API error:', response.message)
      }
    } catch (error) {
      console.warn('API failed:', error);
      handleApiError(error, { title: "Failed to load tenant data" })
    } finally {
      setIsInitialized(true)
    }
  }

  /* Initialize component state on mount */
  useEffect(() => {
    restoreAccountCreationStepFromApi();
  }, []);

  /* Calculate current step progress percentage */
  const currentStepIndex = TENANT_CREATION_STEPS.findIndex(step => step.id === currentStep)
  const stepProgressPercentage = ((currentStepIndex + 1) / TENANT_CREATION_STEPS.length) * 100
  
  /* Handle successful tenant data collection */
  const handleCurrentStepCompleted = (completed: boolean) => {
    if (completed) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex < TENANT_CREATION_STEPS.length) {
        setCurrentStep(TENANT_CREATION_STEPS[nextStepIndex].id)
      } else {
        /* All steps completed - handle final completion */
        handleAccountCreationComplete()
      }
    }
  }

  /* Handle final account creation completion */
  const handleAccountCreationComplete = () => {
    console.log('Account creation completed successfully!')
    // Add any final cleanup or redirect logic here
    // For example: navigate to dashboard or show success page
  }

  /* Navigate to verification step from review mode */
  const handleMoveToVerificationStep = () => {
    setIsReviewMode(false)
    setCurrentStep(STEP_IDS.VERIFICATION)
  }

  /* Navigate to previous step */
  const handleMoveToPreviousStep = () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      setCurrentStep(TENANT_CREATION_STEPS[prevStepIndex].id)
      setIsReviewMode(true)
    }
    console.log(currentStep, isReviewMode)
  }

  /* Show loading state while initializing */
  if (!isInitialized) {
    return(
      <FullPageLoader
        title="Loading Account Setup"
        subtitle="Initializing your account creation process..."
      />
    );
  }

  /* Main component render */
  return (
    <Container maxW="4xl" py={2}>
      <Flex flexDir={'column'} gap={4} >
        {/* Page title and description header */}
        <Flex justify="space-between" align="start" mb={4}>
          <VStack gap={2} textAlign="left" flex={1}>
            <Text fontSize="3xl" fontWeight="bold" color={PRIMARY_COLOR}>
              Create Tenant Account
            </Text>
            <Text fontSize="lg" color="gray.600">
              Create your new account in just a few steps
            </Text>
          </VStack>
        </Flex>

        {/* Progress bar showing completion percentage */}
        <Progress.Root value={stepProgressPercentage} width="full">
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm">
              Step {currentStepIndex + 1} of {TENANT_CREATION_STEPS.length}: {TENANT_CREATION_STEPS[currentStepIndex].title}
            </Text>
            <Progress.ValueText color={PRIMARY_COLOR}>{Math.round(stepProgressPercentage)}% complete</Progress.ValueText>
          </HStack>
          <Progress.Track borderRadius={'2xl'}>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>

        {/* Visual step indicators with icons */}
        <Steps.Root step={currentStepIndex} count={TENANT_CREATION_STEPS.length} colorPalette="blue">
          <Steps.List>
            {
              TENANT_CREATION_STEPS.map((step, index) => {
                const Icon = step.icon
                const isCompleted = completedSteps.has(step.id)
                const isCurrent = step.id === currentStep
                
                return (
                  <Steps.Item key={step.id} index={index}>
                    <VStack gap={2} align="center">
                      <Steps.Indicator color={isCompleted ? PRIMARY_COLOR : isCurrent ? PRIMARY_COLOR : ''}>
                        <Icon />
                      </Steps.Indicator>
                      <Steps.Title color={isCompleted ? PRIMARY_COLOR : isCurrent ? PRIMARY_COLOR : ''}>
                        {step.label}
                      </Steps.Title>
                    </VStack>
                    {index < TENANT_CREATION_STEPS.length - 1 && <Steps.Separator />}
                  </Steps.Item>
                )
              })
            }
          </Steps.List>
        </Steps.Root>

        {/* Main form content area */}
        <Flex w={'100%'}>
          <Flex gap={6} w={'100%'} flexDir={'column'}>
            {/* Dynamic step title and description */}
            <Flex flexDir={'column'} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" mb={2}>
                {isReviewMode ? 'Review Information' : TENANT_CREATION_STEPS[currentStepIndex].title}
              </Text>
              <Text>
                {isReviewMode ? 'Review your submitted information before continuing' : TENANT_CREATION_STEPS[currentStepIndex].description}
              </Text>
            </Flex>

            {/* Conditional step form rendering */}
            {currentStep === STEP_IDS.TENANT_INFO && (
              <BasicInfoStep
                isCompleted={handleCurrentStepCompleted}
                isReviewMode={isReviewMode}
                onNext={handleMoveToVerificationStep}
              />
            )}
            {currentStep === STEP_IDS.VERIFICATION && (
              <VerificationStep
                isCompleted={handleCurrentStepCompleted}
                isReviewMode={isReviewMode}
                onPrevious={handleMoveToPreviousStep}
              />
            )}
             {currentStep === STEP_IDS.PLAN_SELECTION && (
              <PlanSelectionStep
                isCompleted={handleCurrentStepCompleted}
                isReviewMode={isReviewMode}
                onPrevious={handleMoveToPreviousStep}
              />
            )}
            {currentStep === STEP_IDS.PLAN_SUMMARY && (
              <PlanSummaryStep
                isCompleted={handleCurrentStepCompleted}
                onPrevious={handleMoveToPreviousStep}
                onCreateAccount={handleAccountCreationComplete}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
}

export default TenantAccountCreationForm