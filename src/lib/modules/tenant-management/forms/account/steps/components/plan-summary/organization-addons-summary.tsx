/* React and Chakra UI component imports */
import { Text, Box, Flex, SimpleGrid, GridItem } from '@chakra-ui/react'

/* Shared component and configuration imports */
import { EmptyStateContainer } from '@shared/components/common'
import { PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Icon imports */
import { FaPlus } from 'react-icons/fa'

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
    const monthlyTotal = organizationAddons.reduce((sum, addon) => sum + addon.addon_price, 0)
    return calculateSingleAddonPrice(monthlyTotal)
  }

  return (
    <Flex flexDir={'column'} w={'100%'} gap={3} flexWrap={'wrap'} borderWidth={'2px'} bg={WHITE_COLOR} p={'12px'} borderRadius={'12px'}>
      {/* Section header with addon count and total cost */}
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold">
          Organization Add-ons ({organizationAddons.length})
        </Text>
        {organizationAddons.length > 0 && (
          <Text fontSize="lg" fontWeight="semibold" color={PRIMARY_COLOR}>
            Total: ${calculateTotalOrgAddonCost().toFixed(2)}/{getBillingCycleLabel(billingCycle)}
          </Text>
        )}
      </Flex>
      
      {/* Conditional rendering based on addon availability */}
      {organizationAddons.length === 0 ? (
        <EmptyStateContainer
          title="No Organization Add-ons"
          description="This plan doesn't include any organization-level add-ons. All features are included in the base plan."
          icon={<FaPlus />}
        />
      ) : (
        /* Grid layout for organization addon cards */
        <SimpleGrid columns={2} gap={2}>
          {organizationAddons.map((addon) => {
            const addonPrice = calculateSingleAddonPrice(addon.addon_price)
            
            return (
              <GridItem key={addon.assignment_id}>
                <Box p={4} bg="gray.50" borderWidth={'2px'} borderRadius="md">
                  <Flex justify="space-between" align="center">
                    {/* Addon details section */}
                    <Flex flexDir={'column'} gap={1}>
                      <Text fontWeight="semibold">{addon.addon_name}</Text>
                      <Text fontSize="sm" color="gray.600">{addon.addon_description}</Text>
                    </Flex>
                    {/* Addon pricing section */}
                    <Flex gap={1}>
                      <Text fontWeight="semibold" color={PRIMARY_COLOR}>
                        ${addonPrice.toFixed(2)}
                        <Text as="span" fontSize="xs" color="gray.600" ml={1}>
                          /{getBillingCycleLabel(billingCycle)}
                        </Text>
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </GridItem>
            )
          })}
        </SimpleGrid>
      )}
    </Flex>
  )
}

export default OrganizationAddonsSummary