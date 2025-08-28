/* React and UI component imports */
import React from 'react'
import { Text, Box, SimpleGrid, Flex } from '@chakra-ui/react'
import { FaStar, FaClipboardList } from 'react-icons/fa'
import { lighten } from 'polished'

/* Shared module imports */
import { PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'
import EmptyStateContainer from '@shared/components/common/empty-state-container'

/* Plan module imports */
import { Plan } from '@plan-management/types/plans'

/* Component props interface */
interface PlansGridProps {
  plans: Plan[]
  selectedPlan: Plan | null
  isReviewMode: boolean
  onPlanSelect: (plan: Plan) => void
  formatPriceLabel: (plan: Plan) => string
}

/* Grid component displaying available subscription plans */
const PlansGrid: React.FC<PlansGridProps> = ({
  plans,
  selectedPlan,
  isReviewMode,
  onPlanSelect,
  formatPriceLabel
}) => {
  /* Show empty state when no plans are available */
  if (plans.length === 0) {
    return (
      <EmptyStateContainer
        icon={<FaClipboardList size={48} />}
        title="No Plans Available"
        description="There are currently no subscription plans to display. Please check back later or contact support."
        testId="plans-empty-state"
      />
    )
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
      {plans.map((plan) => {
        const isSelected = selectedPlan?.id === plan.id
        const isPopular = plan.is_featured ? plan.is_featured : plan.display_order === 2

        return (
          <Flex
            key={plan.id}
            onClick={() => !isReviewMode && onPlanSelect(plan)}
            cursor={isReviewMode ? "default" : "pointer"}
            transition="all 0.2s"
            borderWidth={isSelected ? '2px' : '1px'}
            borderColor={isSelected ? PRIMARY_COLOR : ''}
            position="relative"
            _hover={!isReviewMode ? {
              borderColor: PRIMARY_COLOR,
              boxShadow: 'lg'
            } : {}}
            bg={isSelected ? lighten(0.5, PRIMARY_COLOR) : WHITE_COLOR}
          >
            {/* Popular badge for featured plans */}
            {isPopular && (
              <Box
                position="absolute" top="-8px" left="50%" transform="translateX(-50%)"
                bg={PRIMARY_COLOR} color="white" px={3} py={1} borderRadius="full"
                fontSize="xs" fontWeight="bold" zIndex={1}
              >
                <Flex gap={1} justifyContent={'center'} alignItems={'center'}>
                  <FaStar size={10} />
                  <Text>Popular</Text>
                </Flex>
              </Box>
            )}

            <Flex p={5} w={'100%'}>
              <Flex gap={4} align="center" w={'100%'} justifyContent="space-between">
                {/* Plan details */}
                <Flex flexDir={'column'} gap={2} align="start" textAlign="left" flex={1}>
                  <Text fontSize="lg" fontWeight="bold">{plan.name}</Text>
                  <Text fontSize={'md'}>{plan.description}</Text>
                </Flex>

                {/* Plan price */}
                <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
                  {formatPriceLabel(plan)}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        )
      })}
    </SimpleGrid>
  )
}

export default PlansGrid