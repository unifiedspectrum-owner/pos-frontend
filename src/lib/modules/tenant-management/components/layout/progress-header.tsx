/* Libraries imports */
import React from 'react'
import { Text, VStack, HStack, Progress, Steps, Flex } from '@chakra-ui/react'
import { lighten } from 'polished'

/* Shared module imports */
import { PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Tenant module imports */
import { TenantAccountCreationStepType } from '@tenant-management/types/ui'
import { TenantAccountCreationSteps } from '@tenant-management/constants'

interface ProgressHeaderProps {
  currentStep: TenantAccountCreationStepType
  completedSteps: Set<TenantAccountCreationStepType>
  progressSteps: TenantAccountCreationSteps[]
  progressStepIndex: number
  stepProgressPercentage: number
}

/* Reusable progress header component for tenant account creation */
export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentStep,
  completedSteps,
  progressSteps,
  progressStepIndex,
  stepProgressPercentage
}) => {
  /* Only show progress header for visible progress steps */
  if (progressStepIndex < 0) {
    return null
  }

  const currentStepData = progressSteps.find(step => step.id === currentStep)
  
  return (
    <Flex flexDir={'column'} gap={4} bg={PRIMARY_COLOR} color={WHITE_COLOR} p={5} borderTopRadius={'lg'}>
      {/* Page title and description */}
      <Flex flexDir={'column'} gap={1} textAlign="left" flex={1}>
        <Text fontSize="xl" fontWeight="bold">
          {currentStepData?.title}
        </Text>
        <Text fontSize="sm">
          {currentStepData?.description}
        </Text>
      </Flex>

      {/* Progress bar with completion percentage */}
      <Progress.Root value={stepProgressPercentage} width="full" colorPalette="white">
        <HStack justify="space-between" mb={2} color={WHITE_COLOR}>
          <Text fontSize="sm">
            Step {progressStepIndex + 1} of {progressSteps.length}: {currentStepData?.title}
          </Text>
          <Progress.ValueText>{stepProgressPercentage}% complete</Progress.ValueText>
        </HStack>
        <Progress.Track borderRadius={'2xl'} bg={lighten(0.1, PRIMARY_COLOR)}>
          <Progress.Range bg={WHITE_COLOR} />
        </Progress.Track>
      </Progress.Root>

      {/* Visual step indicators */}
      <Steps.Root step={progressStepIndex} count={progressSteps.length} colorPalette="blue" color={WHITE_COLOR}>
        <Steps.List>
          {progressSteps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.has(step.id)
            const isCurrent = step.id === currentStep
            
            return (
              <Steps.Item key={step.id} index={index} color={WHITE_COLOR}>
                <VStack gap={2} align="center">
                  <Steps.Indicator 
                    borderColor={isCompleted ? WHITE_COLOR : isCurrent ? WHITE_COLOR : lighten(0.1, PRIMARY_COLOR)} 
                    color={WHITE_COLOR} 
                    bg="transparent"
                  >
                    <Icon />
                  </Steps.Indicator>
                  <Steps.Title color={WHITE_COLOR}>
                    {step.label}
                  </Steps.Title>
                </VStack>
                {index < progressSteps.length - 1 && (
                  <Steps.Separator bg={isCompleted ? WHITE_COLOR : lighten(0.1, PRIMARY_COLOR)} />
                )}
              </Steps.Item>
            )
          })}
        </Steps.List>
      </Steps.Root>
    </Flex>
  )
}