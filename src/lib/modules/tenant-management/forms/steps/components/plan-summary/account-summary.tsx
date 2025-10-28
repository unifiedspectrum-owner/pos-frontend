/* React and Chakra UI component imports */
import { ADDON_PRICING_SCOPE } from '@/lib/modules/tenant-management/constants'
import { Text, Flex, Separator } from '@chakra-ui/react'

/* Shared configuration imports */
import { PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Tenant module imports */
import { AssignedPlanDetails } from '@tenant-management/types'
import { FaReceipt } from 'react-icons/fa6'

interface AccountSummaryProps {
  assignedPlanData: AssignedPlanDetails
  planTotalAmount: number
  organizationAddonsTotal: number
  branchAddonsTotal: number
  grandTotal: number
}

const AccountSummary: React.FC<AccountSummaryProps> = ({
  assignedPlanData,
  planTotalAmount,
  organizationAddonsTotal,
  branchAddonsTotal,
  grandTotal
}) => {
  /* Helper to check if organization addons exist */
  const hasOrgAddons = Array.isArray(assignedPlanData.add_ons) && 
    assignedPlanData.add_ons.some(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.ORGANIZATION)

  /* Helper to check if branch addons exist */
  const hasBranchAddons = Array.isArray(assignedPlanData.add_ons) && 
    assignedPlanData.add_ons.some(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.BRANCH)

  /* Get organization addons count */
  const orgAddonsCount = hasOrgAddons 
    ? assignedPlanData.add_ons.filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.ORGANIZATION).length 
    : 0

  /* Get branch addons count */
  const branchAddonsCount = hasBranchAddons 
    ? assignedPlanData.add_ons.filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.BRANCH).length 
    : 0

  return (
    <Flex padding={3} px={5} flexDir={'column'} w={'100%'} gap={3} borderWidth={'2px'} bg={WHITE_COLOR} p={'12px'} borderRadius={'12px'}>
      <Flex alignItems={'center'} gap={2}>
        <Text fontSize={20}>
          <FaReceipt />
        </Text>
        <Text fontSize="xl" fontWeight="bold">
          Order Summary
        </Text>
      </Flex>

      <Flex flexDir={'column'} gap={3}>
        {/* Plan Amount */}
        <Flex justifyContent={'space-between'} align="center" borderRadius="md">
          <Text  fontSize="lg">Plan Amount:</Text>
          <Text fontWeight="bold" fontSize="lg" color={PRIMARY_COLOR}>
            ${planTotalAmount.toFixed(2)}
          </Text>
        </Flex>

        {/* Organization Add-ons Total */}
        {hasOrgAddons && (
          <Flex justifyContent={'space-between'} align="center" borderRadius="md">
            <Text fontSize="lg">
              Organization Add-ons ({orgAddonsCount}):
            </Text>
            <Text fontWeight="bold" fontSize="lg" color={PRIMARY_COLOR}>
              ${organizationAddonsTotal.toFixed(2)}
            </Text>
          </Flex>
        )}

        {/* Branch Add-ons Total */}
        {hasBranchAddons && (
          <Flex justifyContent={'space-between'} align="center" borderRadius="md">
            <Text fontSize="lg">
              Branch Add-ons ({branchAddonsCount}):
            </Text>
            <Text fontWeight="bold" fontSize="lg" color={PRIMARY_COLOR}>
              ${branchAddonsTotal.toFixed(2)}
            </Text>
          </Flex>
        )}

        {/* Separator */}
        <Separator borderWidth={2} />

        {/* Overall Total */}
        <Flex justifyContent={'space-between'} align="center" borderRadius="md">
          <Text fontWeight="bold" fontSize="lg">
            Total per month:
          </Text>
          <Text fontWeight="bold" fontSize="xl">
            ${grandTotal.toFixed(2)}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default AccountSummary