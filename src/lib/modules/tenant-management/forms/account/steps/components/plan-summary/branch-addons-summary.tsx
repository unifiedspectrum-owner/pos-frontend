/* React and Chakra UI component imports */
import React from 'react'
import { Text, Flex, Badge, Separator, Box, Accordion } from '@chakra-ui/react'

/* Shared configuration imports */
import { DARK_COLOR, PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Tenant module imports */
import { AssignedAddonDetails, PlanBillingCycle } from '@tenant-management/types'
import { getBillingCycleLabel } from '@tenant-management/utils'
import { IoIosGitBranch } from 'react-icons/io'

interface BranchAddonsSummaryProps {
  branchAddons: Record<string, AssignedAddonDetails[]> | Array<{ branchIndex: number, branchName: string, addons: AssignedAddonDetails[] }>
  billingCycle: PlanBillingCycle
  calculateSingleAddonPrice: (monthlyPrice: number) => number
}

const BranchAddonsSummary: React.FC<BranchAddonsSummaryProps> = ({
  branchAddons,
  billingCycle,
  calculateSingleAddonPrice
}) => {
  /* Handle both Record and Array formats */
  const branchData: Array<{ branchIndex?: number, branchName: string, addons: AssignedAddonDetails[] }> = 
    Array.isArray(branchAddons) 
      ? branchAddons.map(branch => ({ 
          branchIndex: branch.branchIndex, 
          branchName: branch.branchName, 
          addons: branch.addons 
        }))
      : Object.keys(branchAddons)
          .sort()
          .map(branchName => ({ 
            branchName, 
            addons: branchAddons[branchName] 
          }))

  const totalBranchAddons = branchData.reduce((total, branch) => total + branch.addons.length, 0)

  /* Only return null if no branches at all */
  if (branchData.length === 0) {
    return null
  }

  /* Calculate total cost across all branch addons */
  const totalBranchAddonsCost = branchData.reduce((total, branch) => {
    return total + branch.addons.reduce((sum, addon) => {
      return sum + calculateSingleAddonPrice(addon.addon_price)
    }, 0)
  }, 0)

  return (
    <Flex w={'100%'} flexDir={'column'} gap={4} p={3} bg={'gray.50'} borderWidth={1} borderRadius={'lg'}>
      {/* Header section with icon, title and total cost */}
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Flex align="center" gap={3}>
          <Text fontSize={25}>
            <IoIosGitBranch color={PRIMARY_COLOR} />
          </Text>
          <Text fontSize="lg" fontWeight="semibold">
            Branch Add-ons ({totalBranchAddons})
          </Text>
        </Flex>

        <Flex gap={3} alignItems={'center'}>
          <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
            ${totalBranchAddonsCost.toFixed(2)}
            <Text as="span" fontSize="sm" color="gray.600" ml={1}>
              /{getBillingCycleLabel(billingCycle)}
            </Text>
          </Text>
        </Flex>
      </Flex>

      <Separator />

      {/* Branch addon sections */}
      <Accordion.Root spaceY={4} collapsible defaultValue={branchData.map((_, index) => index.toString())} gap={3}>
        {branchData.map((branch, index) => {
          const addons = branch.addons
          /* Calculate total cost for current branch */
          const branchTotal = addons.reduce((sum, addon) => {
            return sum + calculateSingleAddonPrice(addon.addon_price)
          }, 0)
          
          return (
            <Accordion.Item 
              key={branch.branchIndex !== undefined ? branch.branchIndex : index} 
              value={index.toString()}
              borderWidth={1}
              p={2}
              px={4}
              bg={PRIMARY_COLOR}
              color={WHITE_COLOR}
              borderRadius={'md'}
            >
              {/* Branch header as accordion trigger */}
              <Accordion.ItemTrigger>
                <Flex justify="space-between" align="center" w="100%">
                  <Flex align="center" gap={3}>
                    <Text fontSize="md" fontWeight="bold">
                      {branch.branchName}
                    </Text>
                    <Badge px={2} colorPalette="gray" size="sm">
                      {addons.length} add-on{addons.length !== 1 ? 's' : ''}
                    </Badge>
                  </Flex>
                  <Flex align="center" gap={3}>
                    <Text fontSize="md" fontWeight="bold">
                      ${branchTotal.toFixed(2)}
                      <Text as="span" fontSize="sm" ml={1}>
                        /{getBillingCycleLabel(billingCycle)}
                      </Text>
                    </Text>
                    <Accordion.ItemIndicator />
                  </Flex>
                </Flex>
              </Accordion.ItemTrigger>
              
              {/* Addon cards for this branch as accordion content */}
              <Accordion.ItemContent>
                <Flex flexDir={'column'} gap={2} pt={3}>
                  {addons.length > 0 ? (
                    addons.map((addon) => {
                      const addonPrice = calculateSingleAddonPrice(addon.addon_price)
                      return (
                        <Box key={addon.assignment_id} p={3} bg={WHITE_COLOR} color={DARK_COLOR} borderWidth={1} borderRadius="md" borderColor="gray.200">
                          <Flex justify="space-between" align="center">
                            {/* Addon details section */}
                            <Flex flexDir={'column'} gap={1}>
                              <Text fontSize="md" fontWeight="bold">
                                {addon.addon_name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">{addon.addon_description}</Text>
                            </Flex>
                            {/* Addon pricing section */}
                            <Text fontSize="lg" fontWeight="bold">
                              ${addonPrice.toFixed(2)}
                            </Text>
                          </Flex>
                        </Box>
                      )
                    })
                  ) : (
                    /* Empty state for branches with no addons */
                    <Box p={4} borderRadius="md" bg="gray.100" borderWidth={1} borderStyle="dashed" borderColor="gray.300">
                      <Text fontSize="sm" color="gray.500" textAlign="center" fontStyle="italic">
                        No add-ons selected for this branch
                      </Text>
                    </Box>
                  )}
                </Flex>
              </Accordion.ItemContent>
            </Accordion.Item>
          )
        })}
      </Accordion.Root>
      </Flex>
  )
}

export default BranchAddonsSummary