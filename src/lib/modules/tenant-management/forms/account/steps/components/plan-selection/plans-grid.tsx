/* React and UI component imports */
import React from 'react'
import { Text, Box, SimpleGrid, Flex, GridItem, Button, Accordion } from '@chakra-ui/react'
import { FaStar, FaClipboardList, FaCheck } from 'react-icons/fa'
import { lighten } from 'polished'
import { FiPlus } from 'react-icons/fi'

/* Shared module imports */
import { PRIMARY_COLOR, WHITE_COLOR, SUCCESS_GREEN_COLOR2 } from '@shared/config'
import { EmptyStateContainer } from '@shared/components/common'
import { NumberInputField } from '@shared/components/form-elements/ui'

/* Plan module imports */
import { Plan } from '@plan-management/types'

/* Tenant module imports */
import { MAX_BRANCH_COUNT } from '@tenant-management/constants'
import { calculatePlanPrice } from '@/lib/modules/tenant-management/utils/business'
import { PlanBillingCycle } from '@/lib/modules/tenant-management/types'
import { getBillingCycleLabel } from '@/lib/modules/tenant-management/utils/formatting'

/* Component props interface */
interface PlansGridProps {
  plans: Plan[]
  selectedPlan: Plan | null,
  billingCycle: PlanBillingCycle
  onPlanSelect: (plan: Plan) => void
  branchCount?: number
  onBranchCountChange?: (value: number) => void
}

/* Grid component displaying available subscription plans */
const PlansGrid: React.FC<PlansGridProps> = ({
  plans,
  selectedPlan,
  billingCycle,
  onPlanSelect,
  branchCount = 0,
  onBranchCountChange
}) => {
  /* Show empty state when no plans are available */
  if (plans.length === 0) {
    return (
      <EmptyStateContainer
        icon={<FaClipboardList size={48} />}
        title="No Plans Available"
        description="There are currently no subscription plans to display. Please check back later or contact support."
      />
    )
  }

  return (
    /* Responsive grid layout for plan cards */
    <SimpleGrid columns={[1, 1, 4]} gap={4}>
      {plans.map((plan) => {
        /* Calculate selection and popularity states */
        const isSelected = selectedPlan?.id === plan.id
        const isPopular = plan.is_featured ? plan.is_featured : plan.display_order === 2;
        const planPrice = calculatePlanPrice(plan, billingCycle, isSelected ? branchCount : 1);
        return (
          <GridItem key={plan.id} colSpan={1}>
            {/* Individual plan card container */}
            <Flex
              flexDir={'column'}
              p={5}
              gap={4}
              height="100%"
              minHeight="400px"
              onClick={() => onPlanSelect(plan)}
              cursor={"pointer"}
              transition="all 0.2s"
              borderRadius={'xl'}
              borderWidth={isSelected ? '2px' : '1px'}
              borderColor={isSelected ? PRIMARY_COLOR : 'gray.400'}
              position="relative"
              _hover={{
                borderColor: PRIMARY_COLOR,
                boxShadow: 'lg'
              }}
              bg={isSelected ? lighten(0.5, PRIMARY_COLOR) : WHITE_COLOR}
            >
              {/* Popular badge for featured plans */}
             {isPopular && (
              <Box
                position="absolute" top="-15px" left="50%" transform="translateX(-50%)"
                bg={PRIMARY_COLOR} color="white" px={3} py={1} borderRadius="full"
                fontSize="xs" fontWeight="bold" zIndex={1}
              >
                <Flex gap={1} justifyContent={'center'} alignItems={'center'}>
                  <FaStar size={10} />
                  <Text>Most Popular</Text>
                </Flex>
              </Box>
            )}

              {/* Plan header with name, price, and description */}
              <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'} gap={2}>
                <Text fontWeight={'bold'} fontSize={'lg'}>{plan.name}</Text>
                <Flex flexDir={'column'} alignItems={'center'}>
                  <Text fontWeight={'700'} fontSize={25} color={PRIMARY_COLOR}>
                    ${Math.floor(planPrice)}
                  </Text>
                  <Flex>
                    <Text color={'gray.700'}>
                      {getBillingCycleLabel({
                        billingCycle,
                        isCyclePeriod: true
                      })}
                    </Text>
                    {(!isSelected || branchCount == 1) && (
                      <Text color={'gray.700'}>&nbsp;/ per branch</Text>
                    )}
                  </Flex>
                </Flex>
                <Text color={'gray.700'} fontSize={'sm'} fontWeight={'bold'} textAlign={'center'}>{plan.description}</Text>
              </Flex>

              {/* Plan features list with checkmarks */}
              <Flex flexDir={'column'} gap={1}>
                {
                  plan.features.map((feature) => (
                    <Flex key={feature.id} gap={2} alignItems={'center'}>
                      <Text color={SUCCESS_GREEN_COLOR2}><FaCheck /></Text>
                      <Text fontSize={'sm'}>{feature.name}</Text>
                    </Flex>
                  ))
                }
              </Flex>
              
              {/* Collapsible addons section */}
              {plan.add_ons.length > 0 && (
                <Accordion.Root collapsible 
                  borderTopWidth={1}
                  borderColor={'gray.500'}
                  px={4}
                >
                  <Accordion.Item value="addons" borderWidth={0}>
                    <Accordion.ItemTrigger>
                      <Flex justify="space-between" align="center" w="100%">
                        <Text fontWeight={'600'} fontSize={'sm'}>
                          Addons (Optional) - {plan.add_ons.length}
                        </Text>
                        <Accordion.ItemIndicator />
                      </Flex>
                    </Accordion.ItemTrigger>
                    
                    <Accordion.ItemContent mb={3} spaceY={1}>
                        {plan.add_ons.map((addon) => (
                          <Flex key={addon.id} gap={2} alignItems={'center'}>
                            <Text><FiPlus /></Text>
                            <Text fontSize={'sm'}>{addon.name}</Text>
                          </Flex>
                        ))}
                    </Accordion.ItemContent>
                  </Accordion.Item>
                </Accordion.Root>
              )}

              {/* Branch count configuration section */}
              <Flex justifyContent={'center'}>
                {isSelected && onBranchCountChange && (
                  <Flex flexDir="column" gap={2} justifyContent={'center'} borderRadius="md">
                    <NumberInputField 
                      label="Number of Branches"
                      value={branchCount.toString()}
                      placeholder="Enter branches"
                      isInValid={false}
                      required={true}
                      min={1}
                      max={Math.min(selectedPlan?.included_branches_count || MAX_BRANCH_COUNT, MAX_BRANCH_COUNT)}
                      onChange={(value) => {
                        const numValue = parseInt(value) || 1;
                        const maxAllowed = Math.min(selectedPlan?.included_branches_count || MAX_BRANCH_COUNT, MAX_BRANCH_COUNT);
                        const validValue = Math.min(Math.max(numValue, 1), maxAllowed);
                        onBranchCountChange(validValue);
                      }}
                      width={'50px'}
                      height={'40px'}
                    />
                    <Text fontSize="xs" color="gray.600">
                     <Text as={'span'} fontWeight={'bold'}>Max:</Text>  {Math.min(selectedPlan?.included_branches_count || MAX_BRANCH_COUNT, MAX_BRANCH_COUNT)} branches
                    </Text>
                  </Flex>
                )}
              </Flex>
                
              {/* Plan selection button */}
              <Flex mt="auto">
                <Button
                  onClick={() => onPlanSelect(plan)}
                  bg={isSelected ? SUCCESS_GREEN_COLOR2 : PRIMARY_COLOR}
                  color={WHITE_COLOR}
                  _hover={{
                    bg: isSelected ? SUCCESS_GREEN_COLOR2 : lighten(0.1, PRIMARY_COLOR)
                  }}
                  size="sm"
                  width="full"
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </Button>
              </Flex>
            </Flex>
          </GridItem>
        )
      })}
    </SimpleGrid>
  )
}

export default PlansGrid