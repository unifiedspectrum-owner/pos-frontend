/* React and Chakra UI component imports */
import { Text, Flex, Separator } from '@chakra-ui/react'

/* Shared configuration imports */
import { PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Tenant module imports */
import { AssignedPlanApiResponse } from '@tenant-management/types'

interface AccountSummaryProps {
  assignedPlanData: AssignedPlanApiResponse['data']
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
  const hasOrgAddons = Array.isArray(assignedPlanData.addon_details.organization_addons) && 
    assignedPlanData.addon_details.organization_addons.length > 0

  /* Helper to check if branch addons exist */
  const hasBranchAddons = assignedPlanData.addon_details.branch_addons && 
    Object.keys(assignedPlanData.addon_details.branch_addons).length > 0

  /* Get branch addons count */
  const branchAddonsCount = hasBranchAddons 
    ? Object.values(assignedPlanData.addon_details.branch_addons).flat().length 
    : 0

  return (
    <Flex flexDir={'column'} w={'100%'} gap={1} borderWidth={'2px'} bg={WHITE_COLOR} p={'12px'} borderRadius={'12px'}>
      <Text fontSize="xl" fontWeight="bold">
        Account Summary
      </Text>
      <Flex flexDir={'column'} gap={3}>
        {/* Plan Amount */}
        <Flex justifyContent={'space-between'} align="center" px={3} borderRadius="md">
          <Text fontWeight="semibold" fontSize="md">Plan Amount:</Text>
          <Text fontWeight="bold" fontSize="md" color={PRIMARY_COLOR}>
            ${planTotalAmount.toFixed(2)}
          </Text>
        </Flex>

        {/* Organization Add-ons Total */}
        {hasOrgAddons && (
          <Flex justifyContent={'space-between'} align="center" px={3} borderRadius="md">
            <Text fontWeight="semibold" fontSize="md">
              Organization Add-ons ({assignedPlanData.addon_details.organization_addons.length}):
            </Text>
            <Text fontWeight="bold" fontSize="md" color={PRIMARY_COLOR}>
              ${organizationAddonsTotal.toFixed(2)}
            </Text>
          </Flex>
        )}

        {/* Branch Add-ons Total */}
        {hasBranchAddons && (
          <Flex justifyContent={'space-between'} align="center" px={3} borderRadius="md">
            <Text fontWeight="semibold" fontSize="md">
              Branch Add-ons ({branchAddonsCount}):
            </Text>
            <Text fontWeight="bold" fontSize="md" color={PRIMARY_COLOR}>
              ${branchAddonsTotal.toFixed(2)}
            </Text>
          </Flex>
        )}

        {/* Separator */}
        <Separator />

        {/* Overall Total */}
        <Flex justifyContent={'space-between'} align="center" px={3} borderRadius="md">
          <Text fontWeight="bold" fontSize="lg">
            Total Amount:
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