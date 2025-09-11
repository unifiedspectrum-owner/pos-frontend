/* React and Chakra UI component imports */
import { Text, Flex, Separator } from '@chakra-ui/react'

/* Shared configuration imports */
import { PRIMARY_COLOR, SUCCESS_GREEN_COLOR2 } from '@shared/config'

/* Tenant module imports */
import { AssignedPlanDetails, PlanBillingCycle } from '@tenant-management/types'
import { getBillingCycleLabel } from '@tenant-management/utils'
import { LuBox } from 'react-icons/lu'

interface PlanDetailsSummaryProps {
  planDetails: AssignedPlanDetails
  billingCycle: PlanBillingCycle
  planTotalAMount: number
}

const PlanDetailsSummary: React.FC<PlanDetailsSummaryProps> = ({
  planDetails,
  billingCycle,
  planTotalAMount
}) => {
  return (
    <Flex w={'50%'} flexDir={'column'} gap={4} p={3} bg={'gray.50'} borderWidth={1} borderRadius={'lg'}>
      {/* Plan Information */}
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Flex align="center" gap={3}>
          <Text fontSize={20}>
            <LuBox color={PRIMARY_COLOR} />
          </Text>
          <Text fontSize="lg" fontWeight="semibold">
            Plan Details
          </Text>
        </Flex>

        <Flex gap={3} alignItems={'center'}>
          <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
            ${planTotalAMount.toFixed(2)}
            <Text as="span" fontSize="sm" color="gray.600" ml={1}>
              /{getBillingCycleLabel(billingCycle)}
            </Text>
          </Text>
        </Flex>
      </Flex>

      <Separator />

      <Flex justifyContent={'space-between'}>
        <Flex flexDir={'column'} gap={3}>
          <Flex flexDir={'column'} justifyContent={'center'}>
            <Text>Plan Name</Text>
            <Text fontSize="md" fontWeight="bold" color={PRIMARY_COLOR}>
              {planDetails.plan.name}
            </Text>
          </Flex>

          <Flex flexDir={'column'} justifyContent={'center'}>
            <Text>Branches</Text>
            <Text fontSize="md" fontWeight="bold" color={PRIMARY_COLOR}>
              {planDetails.plan.included_branches_count} of {planDetails.branchCount} used
            </Text>
          </Flex>
        </Flex>

        {/* Pricing Information */}
        <Flex flexDir={'column'} gap={3}>
          <Flex flexDir={'column'} textAlign={'start'} justifyContent={'center'}>
            <Text>Billing Cycle</Text>
            <Text fontSize="md" fontWeight="bold" textTransform={'capitalize'} color={PRIMARY_COLOR}>
              {getBillingCycleLabel(billingCycle).concat('ly')}
            </Text>
          </Flex>

          <Flex flexDir={'column'} textAlign={'start'} justifyContent={'center'}>
            <Text>Status</Text>
            <Text fontSize="md" fontWeight="bold" color={SUCCESS_GREEN_COLOR2}>
              Active
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default PlanDetailsSummary