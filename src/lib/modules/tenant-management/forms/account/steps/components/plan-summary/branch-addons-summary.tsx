/* React and Chakra UI component imports */
import React from 'react'
import { Text, Flex, Badge, SimpleGrid, GridItem } from '@chakra-ui/react'

/* Shared configuration imports */
import { PRIMARY_COLOR } from '@shared/config'

/* Icon imports */
import { FaBuilding } from 'react-icons/fa'

/* Tenant module imports */
import { AssignedAddonDetails, PlanBillingCycle } from '@tenant-management/types'
import { getBillingCycleLabel } from '@tenant-management/utils'

interface BranchAddonsSummaryProps {
  branchAddons: Record<string, AssignedAddonDetails[]>
  billingCycle: PlanBillingCycle
  calculateSingleAddonPrice: (monthlyPrice: number) => number
}

const BranchAddonsSummary: React.FC<BranchAddonsSummaryProps> = ({
  branchAddons,
  billingCycle,
  calculateSingleAddonPrice
}) => {

  /* Prepare branch data for rendering */
  const branchIds = Object.keys(branchAddons).sort()
  const totalBranchAddons = Object.values(branchAddons).flat().length

  if (branchIds.length === 0) {
    return null
  }

  /* Calculate total cost across all branch addons */
  const totalBranchAddonsCost = branchIds.reduce((total, branchId) => {
    const addons = branchAddons[branchId]
    return total + addons.reduce((sum, addon) => {
      return sum + calculateSingleAddonPrice(addon.addon_price)
    }, 0)
  }, 0)

  return (
    <Flex flexDir={'column'} w={'100%'} gap={3} flexWrap={'wrap'} borderWidth={'2px'} bg="white" p={'12px'} borderRadius={'12px'}>
      {/* Section header with total addon count and cost */}
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold">
          Branch Add-ons ({totalBranchAddons})
        </Text>
        <Text fontSize="lg" fontWeight="semibold" color={PRIMARY_COLOR}>
          Total: ${totalBranchAddonsCost.toFixed(2)}/{getBillingCycleLabel(billingCycle)}
        </Text>
      </Flex>

      {/* Container for all branch addon sections */}
      <Flex flexDir={'column'} w={'100%'} gap={4}>
        {branchIds.map((branchId, index) => {
          const addons = branchAddons[branchId]
          /* Calculate total cost for current branch */
          const branchTotal = addons.reduce((sum, addon) => {
            return sum + calculateSingleAddonPrice(addon.addon_price)
          }, 0)
          
          return (
            <Flex key={branchId} flexDir={'column'} gap={2}>
              {/* Individual branch header with details */}
              <Flex justify="space-between" align="center" p={3} bg="blue.50" borderRadius="md">
                <Flex align="center" gap={3}>
                  <FaBuilding color="#3182CE" />
                  <Text fontSize="lg" fontWeight="bold" color="blue.700">
                    Branch {index + 1}
                  </Text>
                  <Badge px={2} colorPalette="blue" size="sm">
                    {addons.length} add-on{addons.length !== 1 ? 's' : ''}
                  </Badge>
                </Flex>
                <Text fontSize="md" fontWeight="semibold" color="blue.700">
                  Total: ${branchTotal.toFixed(2)}/{getBillingCycleLabel(billingCycle)}
                </Text>
              </Flex>
              
              {/* Grid layout for branch addon cards */}
              <SimpleGrid columns={2} gap={2}>
                {addons.map((addon) => {
                  const addonPrice = calculateSingleAddonPrice(addon.addon_price)
                  return (
                    <GridItem key={addon.assignment_id}>
                      <Flex p={4} bg="gray.50" borderWidth={'2px'} borderRadius="md" borderLeft="3px solid" borderLeftColor="blue.300">
                        <Flex justify="space-between" align="center">
                          {/* Addon information section */}
                          <Flex flexDir={'column'} gap={1}>
                            <Text fontWeight="semibold">{addon.addon_name}</Text>
                            <Text textWrap={'wrap'} fontSize="sm" color="gray.600">{addon.addon_description}</Text>
                          </Flex>
                          {/* Addon pricing display */}
                          <Flex gap={1}>
                            <Text fontWeight="semibold" color={PRIMARY_COLOR}>
                              ${addonPrice.toFixed(2)}
                              <Text as="span" fontSize="xs" color="gray.600" ml={1}>
                                /{getBillingCycleLabel(billingCycle)}
                              </Text>
                            </Text>
                          </Flex>
                        </Flex>
                      </Flex>
                    </GridItem>
                  )
                })}
              </SimpleGrid>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}

export default BranchAddonsSummary