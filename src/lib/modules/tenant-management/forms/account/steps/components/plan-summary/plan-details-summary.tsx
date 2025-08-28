/* React and Chakra UI component imports */
import { Text, Flex } from '@chakra-ui/react'

/* Shared configuration imports */
import { PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Icon imports */
import { FaCreditCard, FaCalendarAlt, FaBuilding } from 'react-icons/fa'

/* Tenant module imports */
import { AssignedPlanApiResponse, PlanBillingCycle } from '@tenant-management/types'
import { getBillingCycleLabel } from '@tenant-management/utils'

interface PlanDetailsSummaryProps {
  planDetails: AssignedPlanApiResponse['data']['plan_details']
  billingCycle: PlanBillingCycle
  totalAmount: number
}

const PlanDetailsSummary: React.FC<PlanDetailsSummaryProps> = ({
  planDetails,
  billingCycle,
  totalAmount
}) => {
  return (
    <Flex flexDir={'column'} gap={2} borderWidth={'2px'} bg={WHITE_COLOR} p={'12px'} borderRadius={'12px'}>
      <Text fontSize="xl" fontWeight="bold">
        Selected Plan Summary
      </Text>
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        {/* Plan Information */}
        <Flex flexDir={'column'} gap={4}>
          <Flex align="center" gap={3}>
            <FaCreditCard color="#4A5568" />
            <Text fontSize="lg" fontWeight="semibold">
              {planDetails.plan_name}
            </Text>
          </Flex>

          <Flex gap={3} alignItems={'center'}>
            <FaCalendarAlt color="#4A5568" />
            <Text textTransform={'capitalize'}>Billing: {billingCycle}</Text>
          </Flex>
        </Flex>

        {/* Pricing Information */}
        <Flex flexDir={'column'} align="end" justify={'center'} gap={2}>
          <Flex gap={3} alignItems={'center'}>
            <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
              ${totalAmount.toFixed(2)}
              <Text as="span" fontSize="sm" color="gray.600" ml={1}>
                /{getBillingCycleLabel(billingCycle)}
              </Text>
            </Text>
          </Flex>
          <Flex gap={3} alignItems={'center'}>
            <FaBuilding color="#4A5568" />
            <Text>Branches: {planDetails.current_branches_count} / {planDetails.max_branches_count}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default PlanDetailsSummary