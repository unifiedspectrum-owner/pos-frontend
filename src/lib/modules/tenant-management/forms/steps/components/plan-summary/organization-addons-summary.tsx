/* React and Chakra UI component imports */
import { Text, Box, Flex, Separator } from '@chakra-ui/react'

/* Shared component and configuration imports */
import { EmptyStateContainer } from '@shared/components/common'
import { PRIMARY_COLOR } from '@shared/config'

/* Icon imports */
import { FaPlus, FaRegBuilding } from 'react-icons/fa'

/* Tenant module imports */
import { AssignedAddonDetails, PlanBillingCycle } from '@tenant-management/types'
import { getBillingCycleLabel } from '@tenant-management/utils'

interface OrganizationAddonsSummaryProps {
  organizationAddons: AssignedAddonDetails[]
  billingCycle: PlanBillingCycle
  calculateSingleAddonPrice: (monthlyPrice: number) => number
}

const OrganizationAddonsSummary: React.FC<OrganizationAddonsSummaryProps> = ({
  organizationAddons,
  billingCycle,
  calculateSingleAddonPrice
}) => {
  /* Calculate total cost for all organization addons using hook function */
  const calculateTotalOrgAddonCost = () => {
    return organizationAddons.reduce((sum, addon) => {
      return sum + calculateSingleAddonPrice(addon.addon_price)
    }, 0)
  }

  return (
    <Flex w={'50%'} flexDir={'column'} gap={4} p={3} bg={'gray.50'} borderWidth={1} borderRadius={'lg'}>
      {/* Header section with icon, title and total cost */}
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Flex align="center" gap={3}>
          <Text fontSize={20}>
            <FaRegBuilding color={PRIMARY_COLOR} />
          </Text>
          <Text fontSize="lg" fontWeight="semibold">
            Organization Add-ons ({organizationAddons.length})
          </Text>
        </Flex>

        {organizationAddons.length > 0 && (
          <Flex gap={3} alignItems={'center'}>
            <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
              ${calculateTotalOrgAddonCost().toFixed(2)}
              <Text as="span" fontSize="sm" color="gray.600" ml={1}>
                /{getBillingCycleLabel({billingCycle})}
              </Text>
            </Text>
          </Flex>
        )}
      </Flex>

      <Separator />

      {/* Conditional rendering based on addon availability */}
      {organizationAddons.length === 0 ? (
        <EmptyStateContainer
          title="No Organization Add-ons"
          description="This plan doesn't include any organization-level add-ons. All features are included in the base plan."
          icon={<FaPlus />}
        />
      ) : (
        /* Addon cards layout */
        <Flex flexDir={'column'} gap={3}>
          {organizationAddons.map((addon) => {
            const addonPrice = calculateSingleAddonPrice(addon.addon_price)
            
            return (
              <Box key={addon.assignment_id} p={3}>
                <Flex justify="space-between" align="center">
                  {/* Addon details section */}
                  <Flex flexDir={'column'} gap={1}>
                    <Text fontSize="md" fontWeight="bold">
                      {addon.addon_name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">{addon.addon_description}</Text>
                  </Flex>
                  {/* Addon pricing section */}
                  <Text fontSize="lg" fontWeight="bold" color={PRIMARY_COLOR}>
                    ${addonPrice.toFixed(2)}
                  </Text>
                </Flex>
              </Box>
            )
          })}
        </Flex>
      )}
    </Flex>
  )
}

export default OrganizationAddonsSummary