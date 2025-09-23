"use client"

/* React and UI component imports */
import React, { useEffect, useState } from 'react'
import { Text, VStack, HStack, Box, Flex, Progress, Circle } from '@chakra-ui/react'
import { FaCheckCircle, FaServer, FaDatabase, FaCogs, FaUsers } from 'react-icons/fa'

/* Shared module imports */
import { PrimaryButton } from '@shared/components/form-elements/buttons'
import { PRIMARY_COLOR } from '@shared/config'

/* Plan module imports */
import { Plan } from '@plan-management/types/plans'

/* Tenant module imports */
import { getBillingCycleLabel } from '@tenant-management/utils'
import { PlanBillingCycle, SelectedAddon } from '@tenant-management/types'

/* Success step component props interface */
interface SuccessStepProps {
  onComplete: () => void
}

/* Stored plan data interface */
interface StoredPlanData {
  selectedPlan: Plan
  billingCycle: PlanBillingCycle
  branchCount: number
  selectedAddons: SelectedAddon[]
}

/* Resource creation status interface */
interface ResourceCreationStep {
  id: string
  label: string
  description: string
  icon: React.ComponentType
  status: 'pending' | 'in-progress' | 'completed'
}

/* Success step component */
const SuccessStep: React.FC<SuccessStepProps> = ({ onComplete }) => {
  /* Component state */
  const [planSummary, setPlanSummary] = useState<StoredPlanData | null>(null)
  const [creationProgress, setCreationProgress] = useState(0)
  const [resourceSteps, setResourceSteps] = useState<ResourceCreationStep[]>([
    {
      id: 'tenant',
      label: 'Tenant Account',
      description: 'Setting up your organization profile and basic configuration',
      icon: FaUsers,
      status: 'in-progress'
    },
    {
      id: 'database',
      label: 'Database Setup',
      description: 'Creating your dedicated database schema and initial data',
      icon: FaDatabase,
      status: 'pending'
    },
    {
      id: 'services',
      label: 'Core Services',
      description: 'Initializing POS services and business logic components',
      icon: FaCogs,
      status: 'pending'
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure',
      description: 'Provisioning servers and configuring your deployment environment',
      icon: FaServer,
      status: 'pending'
    }
  ])

  /* Load plan summary on component mount */
  useEffect(() => {
    const selectedPlan = localStorage.getItem('selected_plan')
    if (selectedPlan) {
      try {
        const parsed = JSON.parse(selectedPlan) as StoredPlanData
        setPlanSummary(parsed)
      } catch (error) {
        console.error('Failed to parse plan data from localStorage:', error)
      }
    }
  }, [])

  /* Simulate resource creation progress */
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setCreationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 200)

    /* Update resource steps based on progress */
    const stepInterval = setInterval(() => {
      setResourceSteps(prevSteps => {
        const updatedSteps = [...prevSteps]
        const completedCount = Math.floor(creationProgress / 25)
        
        updatedSteps.forEach((step, index) => {
          if (index < completedCount) {
            step.status = 'completed'
          } else if (index === completedCount && creationProgress < 100) {
            step.status = 'in-progress'
          } else {
            step.status = 'pending'
          }
        })
        
        return updatedSteps
      })
    }, 500)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [creationProgress])

  /* Get status color for each step */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green.500'
      case 'in-progress': return PRIMARY_COLOR
      case 'pending': return 'gray.300'
      default: return 'gray.300'
    }
  }

  /* Get status icon for each step */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FaCheckCircle />
      case 'in-progress': return <Circle size={3} bg={PRIMARY_COLOR} />
      case 'pending': return <Circle size={3} bg="gray.300" />
      default: return <Circle size={3} bg="gray.300" />
    }
  }

  /* Calculate and format total amount */
  const getFormattedTotal = (): string => {
    if (!planSummary?.selectedPlan) return 'N/A'
    
    const { selectedPlan, billingCycle, branchCount, selectedAddons } = planSummary
    const { monthly_price, annual_discount_percentage } = selectedPlan
    const isYearly = billingCycle === 'yearly'
    const discount = annual_discount_percentage / 100
    
    /* Calculate base plan cost */
    const planPrice = isYearly 
      ? Math.floor(monthly_price * 12 * (1 - discount))
      : monthly_price
    const baseCost = planPrice * branchCount
    
    /* Calculate addon costs */
    const addonsCost = selectedAddons.reduce((total, addon) => {
      if (addon.is_included) return total
      
      const price = isYearly 
        ? Math.floor(addon.addon_price * 12 * (1 - discount))
        : addon.addon_price
      
      return total + (addon.pricing_scope === 'organization' 
        ? price
        : price * addon.branches.filter(b => b.isSelected).length)
    }, 0)
    
    const totalAmount = baseCost + addonsCost
    const suffix = getBillingCycleLabel({billingCycle})
    return `$${totalAmount.toLocaleString()}/${suffix}`
  }

  return (
    <VStack gap={8} w="100%" maxW="800px" mx="auto" textAlign="center">
      {/* Success Header */}
      <VStack gap={4}>
        <Box color="green.500" fontSize="6xl">
          <FaCheckCircle />
        </Box>
        <Text fontSize="3xl" fontWeight="bold" color="green.600">
          Account Setup Complete!
        </Text>
        <Text fontSize="lg" color="gray.600" maxW="600px">
          Congratulations! Your payment has been processed and your POS system account is being created. 
          We're setting up all the resources you need to get started.
        </Text>
      </VStack>

      {/* Account Summary */}
      {planSummary && (
        <Box w="100%" p={6} borderWidth="1px" borderRadius="lg" bg="blue.50">
          <VStack gap={4}>
            <Text fontSize="xl" fontWeight="bold">Your Account Details</Text>
            <HStack justify="space-between" w="100%">
              <Text fontWeight="medium">Plan:</Text>
              <Text color={PRIMARY_COLOR} fontWeight="bold">
                {planSummary.selectedPlan.name}
              </Text>
            </HStack>
            <HStack justify="space-between" w="100%">
              <Text fontWeight="medium">Billing:</Text>
              <Text textTransform="capitalize">
                {getFormattedTotal()} ({planSummary.billingCycle})
              </Text>
            </HStack>
            <HStack justify="space-between" w="100%">
              <Text fontWeight="medium">Branches:</Text>
              <Text>{planSummary.branchCount}</Text>
            </HStack>
            {planSummary.selectedAddons.length > 0 && (
              <HStack justify="space-between" w="100%">
                <Text fontWeight="medium">Add-ons:</Text>
                <Text>{planSummary.selectedAddons.length} selected</Text>
              </HStack>
            )}
          </VStack>
        </Box>
      )}

      {/* Resource Creation Progress */}
      <Box w="100%" p={6} borderWidth="1px" borderRadius="lg">
        <VStack gap={6}>
          <VStack gap={2}>
            <Text fontSize="xl" fontWeight="bold">Setting Up Your Resources</Text>
            <Text color="gray.600">
              We're creating your dedicated POS system infrastructure. This process takes a few minutes.
            </Text>
          </VStack>

          {/* Overall Progress Bar */}
          <Box w="100%">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium">Overall Progress</Text>
              <Text fontSize="sm" color={PRIMARY_COLOR}>{creationProgress}% complete</Text>
            </HStack>
            <Progress.Root value={creationProgress} width="100%">
              <Progress.Track borderRadius="md">
                <Progress.Range bg={PRIMARY_COLOR} />
              </Progress.Track>
            </Progress.Root>
          </Box>

          {/* Resource Creation Steps */}
          <VStack gap={4} w="100%" align="stretch">
            {resourceSteps.map((step) => {
              const StepIcon = step.icon
              return (
                <Flex key={step.id} align="center" gap={4} p={4} borderRadius="md" bg="gray.50">
                  <Box color={getStatusColor(step.status)} fontSize="2xl">
                    <StepIcon />
                  </Box>
                  <Box flex={1} textAlign="left">
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="bold">{step.label}</Text>
                      <Box color={getStatusColor(step.status)}>
                        {getStatusIcon(step.status)}
                      </Box>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {step.description}
                    </Text>
                  </Box>
                </Flex>
              )
            })}
          </VStack>
        </VStack>
      </Box>

      {/* Next Steps Information */}
      <Box w="100%" p={6} borderWidth="1px" borderRadius="lg" bg="green.50">
        <VStack gap={4}>
          <Text fontSize="xl" fontWeight="bold" color="green.700">What's Next?</Text>
          <VStack gap={2} align="start" w="100%">
            <Text fontSize="sm">
              📧 <strong>Email Confirmation:</strong> You'll receive a welcome email with login credentials once setup is complete
            </Text>
            <Text fontSize="sm">
              🚀 <strong>System Access:</strong> Your POS system will be available within the next 10-15 minutes
            </Text>
            <Text fontSize="sm">
              📱 <strong>Mobile App:</strong> Download our mobile app to manage your business on the go
            </Text>
            <Text fontSize="sm">
              💬 <strong>Support:</strong> Our team is ready to help you get started with onboarding
            </Text>
          </VStack>
        </VStack>
      </Box>

      {/* Action Button */}
      <Box pt={4}>
        <PrimaryButton onClick={onComplete} size="lg">
          Continue to Dashboard
        </PrimaryButton>
      </Box>
    </VStack>
  )
}

export default SuccessStep